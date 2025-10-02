import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

export async function GET(req: Request) {
  try {
    // Get current user
    const sb = supabaseServer();
    const { data: { user }, error: userError } = await sb.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user's most recent certificate
    const svc = supabaseService();
    const { data: enrollment } = await svc
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!enrollment) {
      return NextResponse.json({ error: 'No enrollment found' }, { status: 404 });
    }

    const { data: cert, error } = await svc
      .from('certificates')
      .select('id, enrollment_id, pdf_url, issued_at, verification_code')
      .eq('enrollment_id', enrollment.id)
      .maybeSingle();

    if (error || !cert) {
      console.error('[certificates/wallet] Certificate not found for user:', user.id);
      return NextResponse.json({ error: 'Certificate not found. Please contact support.' }, { status: 404 });
    }

    // For wallet card, if we have a separate wallet_url field, use it
    // Otherwise redirect to the same PDF (wallet-sized version can be generated later)
    if (cert.pdf_url) {
      return NextResponse.redirect(cert.pdf_url);
    }

    return NextResponse.json({ 
      error: 'Wallet card not yet generated. Please wait a moment and try again.' 
    }, { status: 404 });
  } catch (e) {
    console.error('certificates/wallet error:', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
