import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const svc = supabaseService();
  
  // Find enrollment
  const { data: enrollment } = await svc
    .from('enrollments')
    .select('id, user_id, course_id, passed')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!enrollment) {
    return NextResponse.json({ error: 'No enrollment found' }, { status: 404 });
  }

  // Trigger certificate generation
  const certApiUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://flatearthequipment.com'}/api/cert/issue`;
  
  const certResponse = await fetch(certApiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enrollment_id: enrollment.id })
  });

  const certData = await certResponse.json();

  return NextResponse.json({
    enrollment,
    cert_api_status: certResponse.status,
    cert_response: certData
  });
}

