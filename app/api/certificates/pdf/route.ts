import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

export async function GET(req: Request){
  try{
    // Get current user
    const sb = supabaseServer();
    const { data: { user }, error: userError } = await sb.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user's most recent enrollment first
    const svc = supabaseService();
    const { data: enrollment, error: enrollmentError } = await svc
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (enrollmentError || !enrollment) {
      return NextResponse.json({ error: 'No enrollment found' }, { status: 404 });
    }

    // Find certificate for this enrollment
    console.log('[certificates/pdf] Looking for certificate for enrollment:', enrollment.id);
    
    const { data: cert, error } = await svc
      .from('certificates')
      .select('id, enrollment_id, pdf_url, issued_at, verification_code, verifier_code, learner_id')
      .eq('enrollment_id', enrollment.id)
      .maybeSingle();

    console.log('[certificates/pdf] Certificate lookup result:', { 
      found: !!cert, 
      has_pdf: !!cert?.pdf_url,
      error: error?.message 
    });

    if (error || !cert) {
      console.error('[certificates/pdf] Certificate not found for user:', user.id, 'enrollment:', enrollment.id);
      console.error('[certificates/pdf] Error:', error);
      return NextResponse.json({ error: 'Certificate not found. Please contact support.', debug: { enrollment_id: enrollment.id, user_id: user.id } }, { status: 404 });
    }

    // If PDF URL already exists in database, redirect to it
    if (cert.pdf_url) {
      return NextResponse.redirect(cert.pdf_url);
    }

    // Otherwise, need to generate it - redirect to cert/issue endpoint
    return NextResponse.json({ 
      error: 'Certificate not yet generated. Please wait a moment and try again.' 
    }, { status: 404 });
  }catch(e){
    console.error('cert/pdf', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
