import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { checkEligibility } from '@/lib/cert/criteria';
import crypto from 'crypto';

export async function POST(req: Request){
  try{
    const sb = supabaseServer();
    const { data: { user } } = await sb.auth.getUser();
    if(!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    const { course_slug = 'forklift_operator' } = await req.json();

    const elig = await checkEligibility({ userId: user.id, courseSlug: course_slug });
    if(!elig.eligible){
      return NextResponse.json({ error: 'not_eligible', reasons: elig.reasons }, { status: 422 });
    }

    const svc = supabaseService();
    const { data: latestPract } = await (await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/practical/latest?user=${user.id}&course=${course_slug}`)).json();

    // Find signature URLs if present
    let trainer_signature_url: string | null = null;
    let trainee_signature_url: string | null = null;
    if (latestPract?.attempt?.id) {
      const { data: full } = await svc
        .from('practical_attempts')
        .select('trainer_signature_url, trainee_signature_url')
        .eq('id', latestPract.attempt.id)
        .maybeSingle();
      trainer_signature_url = full?.trainer_signature_url ?? null;
      trainee_signature_url = full?.trainee_signature_url ?? null;
    }

    const code = crypto.randomBytes(8).toString('hex');
    const { data, error } = await svc
      .from('certificates')
      .insert({
        user_id: user.id,
        course_slug,
        verify_code: code,
        practical_id: latestPract?.attempt?.id || null,
        trainer_signature_url,
        trainee_signature_url
      })
      .select('id, verify_code')
      .single();
    if(error) throw error;

    // Fire your existing PDF job/generator; it should now embed QR and sigs (next patch)
    return NextResponse.json({ id: data.id, verify_code: data.verify_code });
  }catch(e){
    console.error('cert/issue', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
