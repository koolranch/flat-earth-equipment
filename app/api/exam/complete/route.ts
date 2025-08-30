import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request){
  try {
    const body = await req.json().catch(()=>({}));
    const score = Number(body?.score || 0);
    const sb = supabaseServer();

    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ ok:false, error:'unauthorized' }, { status:401 });

    // Optional: look up active enrollment
    const { data: enr } = await sb
      .from('enrollments')
      .select('id, course_id, passed')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Log attempt (if table exists)
    try {
      await sb.from('exam_attempts').insert({ 
        user_id: user.id, 
        course_id: enr?.course_id || null, 
        score_pct: score, 
        passed: score >= 80, 
        payload: body 
      });
    } catch (err) {
      console.log('exam_attempts table not available or insert failed:', err);
    }

    // Mark passed (idempotent)
    if (score >= 80 && enr?.id){
      const { error: updateError } = await sb
        .from('enrollments')
        .update({ passed: true })
        .eq('id', enr.id);
      
      if (updateError) {
        console.error('Failed to update enrollment passed status:', updateError);
      }
    }

    // Audit log (if table exists)
    try { 
      await sb.from('audit_log').insert({ 
        actor_id: user.id, 
        action: 'exam_complete', 
        notes: { score, passed: score >= 80, enrollment_id: enr?.id } 
      }); 
    } catch (err) {
      console.log('audit_log table not available or insert failed:', err);
    }

    // Best-effort cert issuance (adjust to your existing implementation)
    if (score >= 80) {
      try {
        const certIssuerUrl = process.env.CERT_ISSUER_URL;
        if (certIssuerUrl) {
          await fetch(certIssuerUrl, { 
            method:'POST', 
            headers:{'Content-Type':'application/json'}, 
            body: JSON.stringify({ 
              user_id: user.id, 
              enrollment_id: enr?.id, 
              score,
              exam_type: 'final'
            })
          });
        }
      } catch (err) {
        console.log('Certificate issuance failed (non-blocking):', err);
      }
    }

    return NextResponse.json({ 
      ok: true, 
      passed: score >= 80,
      score,
      enrollment_id: enr?.id 
    });
  } catch (e){
    console.error('Exam completion API error:', e);
    return NextResponse.json({ ok:false, error:String(e) }, { status:500 });
  }
}
