import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import fs from 'node:fs/promises';
import path from 'node:path';

export const runtime = 'nodejs'; 
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const body = await req.json();
  const { locale = 'en', selected_ids = [], answers = {} } = body || {};

  // Load bank
  const base = path.join(process.cwd(), 'content', 'exam');
  let bank: any; 
  try { 
    bank = JSON.parse(await fs.readFile(path.join(base, `final.${locale}.json`), 'utf8')); 
  } catch { 
    bank = JSON.parse(await fs.readFile(path.join(base, 'final.en.json'), 'utf8')); 
  }
  const passPct = bank.pass_pct || 80;
  const dict = new Map(bank.bank.map((it: any) => [it.id, it]));

  // Score
  let correct = 0; 
  const total = selected_ids.length;
  const incorrect: any[] = [];
  
  for (const id of selected_ids) {
    const item = dict.get(id); 
    if (!item) continue;
    const chosen = answers[id];
    if (chosen === (item as any).answer) {
      correct++;
    } else {
      incorrect.push({ 
        id, 
        correct: (item as any).answer, 
        explain: (item as any).explain || '' 
      });
    }
  }
  
  const score_pct = total ? Math.round((correct / total) * 100) : 0;
  const passed = score_pct >= passPct;

  // Store attempt
  try {
    await sb.from('exam_attempts').insert({ 
      user_id: user.id, 
      exam_slug: 'final', 
      selected_ids, 
      answers, 
      score_pct, 
      passed 
    });
  } catch (error) {
    console.error('Failed to store exam attempt:', error);
  }

  // Update enrollment (most recent for this user)
  try {
    const { data: enrs } = await sb
      .from('enrollments')
      .select('id, course_id, created_at, passed')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);
      
    const enr = enrs?.[0];
    if (enr && passed) {
      await sb
        .from('enrollments')
        .update({ passed: true, progress_pct: 100 })
        .eq('id', enr.id);
        
      // Optional: try to trigger certificate issuance endpoint if present
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/cert/issue`, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ enrollment_id: enr.id }) 
        });
      } catch (certError) {
        console.log('Certificate issuance endpoint not available or failed:', certError);
      }
    }
  } catch (enrollmentError) {
    console.error('Failed to update enrollment:', enrollmentError);
  }

  // Audit (optional)
  try { 
    await sb.from('audit_log').insert({ 
      actor_id: user.id, 
      action: passed ? 'exam_passed' : 'exam_failed', 
      notes: { score_pct, correct, total, locale } 
    }); 
  } catch (auditError) {
    console.log('Audit logging not available or failed:', auditError);
  }

  return NextResponse.json({ 
    ok: true, 
    passed, 
    score_pct, 
    correct,
    total,
    incorrect 
  });
}
