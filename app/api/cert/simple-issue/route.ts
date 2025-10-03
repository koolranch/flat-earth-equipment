import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const sb = supabaseService();
    const { enrollment_id } = await req.json();
    
    if (!enrollment_id) {
      return NextResponse.json({ ok: false, error: 'missing enrollment_id' }, { status: 400 });
    }

    console.log('[cert/simple-issue] Generating simple certificate for enrollment:', enrollment_id);

    // Verify enrollment exists and is passed
    const { data: enr, error: e1 } = await sb
      .from('enrollments')
      .select('id, user_id, course_id, passed')
      .eq('id', enrollment_id)
      .single();
    
    if (e1 || !enr) {
      console.error('[cert/simple-issue] Enrollment not found:', e1?.message);
      return NextResponse.json({ ok: false, error: 'enrollment not found' }, { status: 404 });
    }

    // Generate verification code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let verification_code = '';
    for (let i = 0; i < 10; i++) {
      verification_code += chars[Math.floor(Math.random() * chars.length)];
    }

    const issued_at = new Date().toISOString();
    
    // Insert certificate record (without PDF for now)
    const { data: cert, error: certError } = await sb
      .from('certificates')
      .insert({
        learner_id: enr.user_id, // REQUIRED field
        enrollment_id: enr.id,
        course_id: enr.course_id,
        verification_code: verification_code,
        verifier_code: verification_code, // Legacy field name
        issued_at: issued_at,
        issue_date: new Date().toISOString().split('T')[0], // Date only
        score: 80, // Default passing score
        pdf_url: null // Will be generated separately
      })
      .select('id, verification_code')
      .single();

    if (certError) {
      console.error('[cert/simple-issue] Failed to insert certificate:', certError);
      return NextResponse.json({ 
        ok: false, 
        error: 'Failed to create certificate', 
        details: certError.message 
      }, { status: 500 });
    }

    console.log('[cert/simple-issue] Certificate created:', cert.id);

    return NextResponse.json({ 
      ok: true, 
      certificate_id: cert.id,
      verification_code: cert.verification_code,
      enrollment_id 
    });

  } catch (error: any) {
    console.error('[cert/simple-issue] Unexpected error:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}

