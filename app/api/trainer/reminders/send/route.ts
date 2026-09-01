import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { sendTrainingReminderEmail, type ReminderType } from '@/lib/email/resend';
import { managerSourceBrand } from '@/lib/training/sourceBrand';
import { getAuthUser } from '@/lib/supabase/mobile-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RATE_LIMIT_HOURS = 24;

export async function POST(req: Request) {
  const { enrollment_id } = await req.json();
  if (!enrollment_id) {
    return NextResponse.json({ ok: false, error: 'missing_enrollment_id' }, { status: 400 });
  }

  const svc = supabaseService();

  const { user, client } = await getAuthUser(req);
  if (!user || !client) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const { data: prof } = await client.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (!prof || !['trainer', 'admin'].includes(prof.role)) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  try {
    const { data: enrollment } = await svc
      .from('enrollments')
      .select('id, user_id, course_id, progress_pct, passed, expires_at')
      .eq('id', enrollment_id)
      .maybeSingle();
    if (!enrollment) {
      return NextResponse.json({ ok: false, error: 'enrollment_not_found' }, { status: 404 });
    }

    // Ownership: the learner must hold a seat on one of this trainer's orders
    // (mirrors how the roster is scoped).
    const { data: trainerOrders } = await svc.from('orders').select('id').eq('user_id', user.id);
    const orderIds = (trainerOrders || []).map(o => o.id);
    if (!orderIds.length) {
      return NextResponse.json({ ok: false, error: 'not_your_learner' }, { status: 403 });
    }
    const { data: claim } = await svc
      .from('seat_claims')
      .select('id, order_id')
      .eq('user_id', enrollment.user_id)
      .in('order_id', orderIds)
      .is('released_at', null)
      .limit(1)
      .maybeSingle();
    if (!claim) {
      return NextResponse.json({ ok: false, error: 'not_your_learner' }, { status: 403 });
    }

    // Rate limit: one reminder per enrollment per day.
    const since = new Date(Date.now() - RATE_LIMIT_HOURS * 60 * 60 * 1000).toISOString();
    const { data: recent } = await svc
      .from('trainer_reminders')
      .select('id, sent_at')
      .eq('enrollment_id', enrollment_id)
      .gte('sent_at', since)
      .limit(1);
    if (recent && recent.length > 0) {
      return NextResponse.json(
        { ok: false, error: 'rate_limited', message: 'A reminder was already sent in the last 24 hours.' },
        { status: 429 }
      );
    }

    const { data: learner } = await svc
      .from('profiles')
      .select('full_name, email')
      .eq('id', enrollment.user_id)
      .maybeSingle();
    if (!learner?.email) {
      return NextResponse.json({ ok: false, error: 'learner_email_missing' }, { status: 422 });
    }

    const { data: course } = await svc
      .from('courses')
      .select('title')
      .eq('id', enrollment.course_id)
      .maybeSingle();
    const courseTitle = course?.title || 'Forklift Operator Training';

    const reminderType: ReminderType = enrollment.passed
      ? 'renewal'
      : (enrollment.progress_pct ?? 0) >= 5
        ? 'nudge_finish'
        : 'nudge_start';

    const brand = await managerSourceBrand(svc, user.id);
    const firstName = (learner.full_name || '').trim().split(/\s+/)[0] || undefined;

    await sendTrainingReminderEmail({
      to: learner.email,
      name: firstName,
      courseTitle,
      reminderType,
      progressPct: enrollment.progress_pct ?? 0,
      expiresAt: enrollment.expires_at,
      brand,
    });

    await svc.from('trainer_reminders').insert({
      enrollment_id,
      sent_by: user.id,
      reminder_type: reminderType,
    });

    try {
      await svc.from('audit_log').insert({
        actor_id: user.id,
        action: 'training_reminder_sent',
        metadata: { enrollment_id, reminder_type: reminderType, learner_email: learner.email },
      });
    } catch (auditError) {
      console.error('Failed to log training reminder:', auditError);
    }

    return NextResponse.json({ ok: true, reminder_type: reminderType, email: learner.email });
  } catch (error) {
    console.error('Training reminder error:', error);
    return NextResponse.json({ ok: false, error: 'internal_server_error' }, { status: 500 });
  }
}
