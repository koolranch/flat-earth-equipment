import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { sendMail } from '@/lib/email/mailer';
import { T } from '@/lib/email/templates';

export const dynamic = 'force-dynamic';

export async function POST(req: Request){
  const sb = supabaseServer();
  const svc = supabaseService();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ ok:false, error:'unauthorized' }, { status:401 });

  const { session_id, answers, course_id } = await req.json();
  if (!session_id || !Array.isArray(answers)) return NextResponse.json({ ok:false, error:'bad_request' }, { status:400 });

  // load session + paper
  const { data: sess } = await svc.from('exam_sessions').select('id, paper_id, status').eq('id', session_id).eq('user_id', user.id).maybeSingle();
  if (!sess || sess.status !== 'in_progress') return NextResponse.json({ ok:false, error:'invalid_session' }, { status:400 });
  const { data: paper } = await svc.from('exam_papers').select('id, correct_indices, item_ids').eq('id', sess.paper_id).maybeSingle();
  if (!paper) return NextResponse.json({ ok:false, error:'paper_missing' }, { status:400 });

  // settings
  const { data: cfg } = await svc.from('exam_settings').select('pass_score').maybeSingle();
  const passScore = cfg?.pass_score ?? 80;

  const correct = paper.correct_indices as number[];
  const total = correct.length;
  let got = 0; const incorrect: number[] = [];
  
  console.log('[exam/submit] ===== DETAILED GRADING =====');
  console.log('[exam/submit] Total questions:', total);
  console.log('[exam/submit] Answers array:', answers);
  console.log('[exam/submit] Correct indices:', correct);
  console.log('[exam/submit] Paper ID:', paper.id);
  
  for (let i=0;i<total;i++){ 
    const a = typeof answers[i]==='number'? answers[i] : -1; 
    const isMatch = a===correct[i];
    console.log(`[exam/submit] Q${i}: user_answered=${a} (type=${typeof answers[i]}), correct=${correct[i]} (type=${typeof correct[i]}), MATCH=${isMatch}`);
    if (isMatch) got++; 
    else incorrect.push(i); 
  }
  
  const scorePct = Math.round((got/total)*100);
  const passed = scorePct >= passScore;
  
  console.log(`[exam/submit] FINAL SCORE: ${got}/${total} (${scorePct}%) - ${passed ? 'PASSED' : 'FAILED'}`);
  console.log('[exam/submit] ===== END GRADING =====');

  // finish session
  await svc.from('exam_sessions').update({ status:'completed' }).eq('id', session_id);
  
  // Insert exam attempt with correct column names including selected_ids
  const { data: attemptRow, error: attemptError } = await svc
    .from('exam_attempts')
    .insert({ 
      user_id: user.id, 
      exam_slug: 'final-exam',
      paper_id: sess.paper_id,
      selected_ids: paper.item_ids || [], // REQUIRED: the question IDs in this exam
      answers: answers, 
      score_pct: scorePct, 
      passed: passed,
      items_total: total,
      items_correct: got
    })
    .select('id')
    .maybeSingle();
  
  if (attemptError) {
    console.error('[exam/submit] Failed to insert exam attempt:', attemptError);
  }
  
  const attempt_id = attemptRow?.id;

  // Update enrollment to passed if exam was passed AND trigger certificate generation
  let enrollmentId: string | null = null;
  console.log('[exam/submit] Checking if exam passed:', { passed, scorePct, passScore });
  
  if (passed) {
    console.log('[exam/submit] ===== CERTIFICATE GENERATION START =====');
    console.log('[exam/submit] Exam passed, finding enrollment for user:', user.id);
    
    // Find user's enrollment (use course_id if provided, otherwise find most recent)
    const enrollmentQuery = svc
      .from('enrollments')
      .select('id, course_id, user_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (course_id) {
      console.log('[exam/submit] Filtering by course_id:', course_id);
      enrollmentQuery.eq('course_id', course_id);
    }
    
    const { data: enrollment, error: enrollmentError } = await enrollmentQuery.maybeSingle();
    
    console.log('[exam/submit] Enrollment lookup result:', { 
      found: !!enrollment, 
      enrollment_id: enrollment?.id,
      error: enrollmentError?.message 
    });
    
    if (enrollment) {
      enrollmentId = enrollment.id;
      console.log('[exam/submit] Updating enrollment to passed:', enrollment.id);
      
      const { error: updateError } = await svc
        .from('enrollments')
        .update({ passed: true, progress_pct: 100, updated_at: new Date().toISOString() })
        .eq('id', enrollment.id);
      
      if (updateError) {
        console.error('[exam/submit] Failed to update enrollment:', updateError);
      } else {
        console.log('[exam/submit] Enrollment updated successfully');
      }
      
      // Trigger certificate generation immediately with FULL PDF generation
      try {
        const certApiUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://flatearthequipment.com'}/api/cert/issue`;
        console.log('[exam/submit] Triggering certificate generation...');
        console.log('[exam/submit] Certificate API URL:', certApiUrl);
        console.log('[exam/submit] Enrollment ID:', enrollment.id);
        
        const certResponse = await fetch(certApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enrollment_id: enrollment.id })
        });
        
        console.log('[exam/submit] Certificate API responded:', certResponse.status, certResponse.statusText);
        
        if (certResponse.ok) {
          const certData = await certResponse.json();
          console.log('[exam/submit] ✅ Certificate generation succeeded!');
          console.log('[exam/submit] Certificate data:', certData);
        } else {
          const certError = await certResponse.text();
          console.error('[exam/submit] ❌ Certificate generation failed!');
          console.error('[exam/submit] Status:', certResponse.status);
          console.error('[exam/submit] Error:', certError);
        }
      } catch (certError: any) {
        console.error('[exam/submit] ❌ Exception during certificate generation:', certError.message);
        console.error('[exam/submit] Stack:', certError.stack);
      }
      
      console.log('[exam/submit] ===== CERTIFICATE GENERATION END =====');
    } else {
      console.error('[exam/submit] ❌ No enrollment found for user:', user.id);
    }
  } else {
    console.log('[exam/submit] Exam not passed, skipping certificate generation');
  }

  // 1) Fetch question rows for metadata (tags,difficulty,locale)
  const qids = (answers||[]).map((a:any)=> a.question_id).filter(Boolean);
  const { data: qrows } = await svc.from('quiz_items').select('id,tags,difficulty,locale,correct_index').in('id', qids);
  const byId = Object.fromEntries((qrows||[]).map((r:any)=> [r.id, r]));

  // 2) Build per-item records
  const items = (answers||[]).map((a:any)=>{
    const q = byId[a.question_id] || {};
    const correct = typeof q.correct_index==='number' ? (a.selected_index===q.correct_index) : false;
    return { attempt_id, question_id: a.question_id, correct, selected_index: a.selected_index ?? null, tags: q.tags||[], difficulty: q.difficulty||3, locale: q.locale||'en' };
  }).filter(it => it.question_id);
  if (items.length && attempt_id){ await svc.from('exam_attempt_items').insert(items); }

  // 3) Update aggregate stats
  for (const it of items){
    await svc.rpc('upsert_exam_item_stats', { p_question_id: it.question_id, p_was_correct: it.correct });
  }

  // 4) Weak tag calc: tags with <70% correctness within this attempt
  const tagTallies: Record<string,{ seen:number; correct:number }> = {};
  for (const it of items){
    for (const tag of (it.tags||[])){
      tagTallies[tag] = tagTallies[tag] || { seen:0, correct:0 };
      tagTallies[tag].seen += 1; if (it.correct) tagTallies[tag].correct += 1;
    }
  }
  const weak_tags = Object.entries(tagTallies).filter(([_,v])=> v.seen>0 && (v.correct/v.seen) < 0.7).map(([k])=> k);

  // load item tags for this paper
  const { data: paperFull } = await svc
    .from('exam_papers')
    .select('item_ids')
    .eq('id', sess.paper_id)
    .maybeSingle();
  let weak: {tag:string; missed:number}[] = [];
  if (paperFull?.item_ids?.length){
    const { data: itemsMeta } = await svc
      .from('quiz_items')
      .select('id,tags,module_slug')
      .in('id', paperFull.item_ids as string[]);
    const missedIdx = new Set(incorrect);
    const tagMap = new Map<string, number>();
    const tagToModule = new Map<string, string>();
    if (itemsMeta && itemsMeta.length > 0) {
      for (let idx=0; idx<itemsMeta.length; idx++){
      if (!missedIdx.has(idx)) continue;
      const it = itemsMeta[idx];
      const tags = (it.tags?.length ? it.tags : ['general']);
      for (const tg of tags){ tagMap.set(tg, (tagMap.get(tg)||0)+1); if (!tagToModule.has(tg) && it.module_slug) tagToModule.set(tg, it.module_slug); }
      }
      weak = Array.from(tagMap.entries()).map(([tag, missed])=>({tag, missed})).sort((a,b)=> b.missed-a.missed).slice(0,3);
      const recs = weak.map(w=> ({ tag: w.tag, slug: tagToModule.get(w.tag) || null, href: tagToModule.get(w.tag) ? `/training/modules/${tagToModule.get(w.tag)}` : null }));
      
      // Email hooks (best-effort)
      try {
        const { data: prof } = await svc.from('profiles').select('email,full_name').eq('id', user.id).maybeSingle();
        const email = prof?.email;
        const name = prof?.full_name || 'Operator';
        if (email) {
          const template = passed ? T.exam_pass(name) : T.exam_fail(name);
          await sendMail({ to: email, ...template });
        }
      } catch (err) {
        console.warn('[email] Failed to send exam result email:', err);
      }
      
      return NextResponse.json({ 
        ok: true, 
        passed, 
        scorePct, 
        correct: got, 
        total, 
        incorrectIndices: incorrect, 
        weak_tags, 
        recommendations: recs,
        attempt_id: attemptRow?.id || null 
      });
    }
  }
  
  // Email hooks (best-effort) - for case without item metadata
  try {
    const { data: prof } = await svc.from('profiles').select('email,full_name,locale').eq('id', user.id).maybeSingle();
    const email = prof?.email;
    const name = prof?.full_name || 'Operator';
    if (email) {
      const L = prof?.locale || cookies().get('locale')?.value || 'en';
      const template = passed ? T.exam_pass(name, L) : T.exam_fail(name, L);
      await sendMail({ to: email, ...template });
    }
  } catch (err) {
    console.warn('[email] Failed to send exam result email:', err);
  }
  
  // Certificate generation now happens earlier (above) to avoid being skipped by early returns
  
  return NextResponse.json({ 
    ok: true, 
    passed, 
    scorePct, 
    correct: got, 
    total, 
    incorrectIndices: incorrect, 
    weak_tags, 
    recommendations: [],
    attempt_id: attemptRow?.id || null 
  });
}