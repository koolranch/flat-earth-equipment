import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { sendInviteEmail } from '@/lib/email/resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const sb = supabaseServer();
  const svc = supabaseService();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  // role check
  const { data: prof } = await sb.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (!prof || !['trainer', 'admin'].includes(prof.role)) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { course_id, emails, send_emails = false } = body || {};
  if (!course_id || !Array.isArray(emails) || emails.length === 0) {
    return NextResponse.json({ ok: false, error: 'missing_params' }, { status: 400 });
  }

  // Get course details for email sending
  const { data: course } = await svc.from('courses').select('id, title').eq('id', course_id).maybeSingle();
  if (!course) {
    return NextResponse.json({ ok: false, error: 'course_not_found' }, { status: 404 });
  }

  const results: any[] = [];

  for (const raw of emails) {
    const email = String(raw || '').trim().toLowerCase();
    if (!email) { 
      results.push({ email: raw, status: 'skipped', reason: 'empty' }); 
      continue; 
    }

    // See if user exists
    const { data: prof2 } = await sb.from('profiles').select('id').eq('email', email).maybeSingle();
    if (prof2?.id) {
      // Ensure enrollment
      const { data: existing } = await sb
        .from('enrollments')
        .select('id')
        .eq('user_id', prof2.id)
        .eq('course_id', course_id)
        .maybeSingle();
      if (existing) {
        results.push({ email, status: 'exists', enrollment_id: existing.id });
      } else {
        const { data: created, error: eIns } = await sb
          .from('enrollments')
          .insert({ user_id: prof2.id, course_id, progress_pct: 0, passed: false })
          .select('id').maybeSingle();
        if (eIns || !created) {
          results.push({ email, status: 'error', reason: eIns?.message || 'insert_failed' });
        } else {
          results.push({ email, status: 'enrolled', enrollment_id: created.id });
        }
      }
      continue;
    }

                // No user → create seat_invite
            const { data: inviteData, error: eInv } = await svc
              .from('seat_invites')
              .upsert({ 
                created_by: user.id, 
                course_id, 
                email, 
                status: 'pending',
                created_at: new Date().toISOString()
              }, { 
                onConflict: 'created_by,course_id,email' 
              })
              .select('*')
              .single();
              
            if (eInv) {
              results.push({ email, status: 'error', reason: eInv.message });
            } else {
              results.push({ email, status: 'invited_pending', invite_id: inviteData?.id });
              
              // Send email invitation if requested
              if (send_emails && process.env.RESEND_API_KEY) {
                try {
                  const claimUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/claim-seat?token=${inviteData?.id}`;
                  await sendInviteEmail({
                    to: email,
                    claimUrl,
                    courseTitle: course.title
                  });
                  results[results.length - 1].email_sent = true;
                } catch (emailError) {
                  console.error('Failed to send invite email:', emailError);
                  results[results.length - 1].email_sent = false;
                  results[results.length - 1].email_error = 'failed_to_send';
                }
              }
            }
  }

  return NextResponse.json({ ok: true, count: results.length, results });
}
