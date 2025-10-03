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
    if (!item) {
      console.warn(`[exam/final/submit] Question ${id} not found in bank`);
      continue;
    }
    const chosen = answers[id];
    const correctAnswer = (item as any).answer;
    
    if (chosen === correctAnswer) {
      correct++;
    } else {
      incorrect.push({ 
        id, 
        correct: correctAnswer, 
        chosen: chosen,
        explain: (item as any).explain || '' 
      });
    }
  }
  
  console.log(`[exam/final/submit] Graded exam: ${correct}/${total} (${Math.round((correct/total)*100)}%) - ${correct >= total * 0.8 ? 'PASSED' : 'FAILED'}`);
  
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
  let certificateIssued = false;
  let certificateError = null;
  
  try {
    const { data: enrs } = await sb
      .from('enrollments')
      .select('id, course_id, created_at, passed')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);
      
    const enr = enrs?.[0];
    if (enr && passed) {
      console.log('[exam/final/submit] Updating enrollment to passed:', enr.id);
      await sb
        .from('enrollments')
        .update({ passed: true, progress_pct: 100 })
        .eq('id', enr.id);
        
      // Trigger certificate issuance
      try {
        console.log('[exam/final/submit] Triggering certificate generation for enrollment:', enr.id);
        
        // Construct the certificate API URL
        // In development, use localhost; in production, construct from headers
        let certApiUrl = '/api/cert/issue';
        if (typeof window === 'undefined') {
          // Server-side: try to get the origin from environment or request
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                         process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                         'http://localhost:3000';
          certApiUrl = `${baseUrl}/api/cert/issue`;
        }
        
        console.log('[exam/final/submit] Certificate API URL:', certApiUrl);
        const certResponse = await fetch(certApiUrl, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ enrollment_id: enr.id }) 
        });
        
        if (certResponse.ok) {
          const certData = await certResponse.json();
          console.log('[exam/final/submit] Certificate generation succeeded:', certData);
          certificateIssued = true;
        } else {
          const errorText = await certResponse.text();
          console.error('[exam/final/submit] Certificate generation failed:', certResponse.status, errorText);
          certificateError = `Certificate generation failed with status ${certResponse.status}`;
        }
      } catch (certError: any) {
        console.error('[exam/final/submit] Certificate issuance error:', certError);
        certificateError = certError.message || 'Certificate generation failed';
      }
    } else if (!enr) {
      console.error('[exam/final/submit] No enrollment found for user:', user.id);
    }
  } catch (enrollmentError) {
    console.error('[exam/final/submit] Failed to update enrollment:', enrollmentError);
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
    incorrect,
    certificate_issued: certificateIssued,
    certificate_error: certificateError
  });
}
