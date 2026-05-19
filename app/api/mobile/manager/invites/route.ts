import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { requireMobileManagerContext } from '@/lib/enterprise/mobile-manager.server';
import { supabaseService } from '@/lib/supabase/service.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const INVITE_ROLES = new Set(['learner', 'manager', 'admin']);

function normalizeEmails(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value
        .map((email) => String(email || '').trim().toLowerCase())
        .filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    )
  );
}

function deriveInviteStatus(invite: { accepted_at: string | null; expires_at: string }) {
  if (invite.accepted_at) return 'claimed';
  if (new Date(invite.expires_at).getTime() < Date.now()) return 'expired';
  return 'sent';
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const context = await requireMobileManagerContext(request, url.searchParams.get('org_id'));
  if ('error' in context) return context.error;

  let query = supabaseService()
    .from('invitations')
    .select('id, email, role, course_id, expires_at, accepted_at, created_at, courses(title, slug)')
    .eq('org_id', context.orgId)
    .order('created_at', { ascending: false });

  const courseId = url.searchParams.get('course_id');
  if (courseId) {
    query = query.eq('course_id', courseId);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const invites = (data || []).map((invite) => ({
    id: invite.id,
    email: invite.email,
    role: invite.role,
    course_id: invite.course_id,
    course: Array.isArray(invite.courses) ? invite.courses[0] : invite.courses,
    status: deriveInviteStatus(invite),
    expires_at: invite.expires_at,
    accepted_at: invite.accepted_at,
    created_at: invite.created_at,
  }));
  const statusCounts = invites.reduce<Record<string, number>>((acc, invite) => {
    acc[invite.status] = (acc[invite.status] || 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({
    ok: true,
    org_id: context.orgId,
    role: context.role,
    total_count: invites.length,
    active_invites: invites.filter((invite) => invite.status === 'sent').length,
    claim_rate: invites.length > 0
      ? Math.round(((statusCounts.claimed || 0) / invites.length) * 100)
      : 0,
    status_counts: statusCounts,
    invites,
  });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const context = await requireMobileManagerContext(request, url.searchParams.get('org_id'));
  if ('error' in context) return context.error;

  const body = await request.json();
  const emails = normalizeEmails(body.emails);
  const role = INVITE_ROLES.has(String(body.role || 'learner')) ? String(body.role || 'learner') : 'learner';
  const courseId = typeof body.course_id === 'string' ? body.course_id : null;

  if (emails.length === 0) {
    return NextResponse.json({ ok: false, error: 'At least one valid email is required' }, { status: 400 });
  }

  const svc = supabaseService();
  let courseTitle: string | null = null;
  if (courseId) {
    const [{ data: course }, { data: seatData }] = await Promise.all([
      svc.from('courses').select('id, title').eq('id', courseId).maybeSingle(),
      svc.from('org_seats').select('total_seats, allocated_seats').eq('org_id', context.orgId).eq('course_id', courseId).maybeSingle(),
    ]);

    if (!course) {
      return NextResponse.json({ ok: false, error: 'Selected course not found' }, { status: 400 });
    }
    courseTitle = course.title;

    if (seatData && seatData.allocated_seats + emails.length > seatData.total_seats) {
      return NextResponse.json({
        ok: false,
        error: 'Not enough available seats for this invite batch',
        seats: {
          total: seatData.total_seats,
          used: seatData.allocated_seats,
          available: Math.max(0, seatData.total_seats - seatData.allocated_seats),
          requested: emails.length,
        },
      }, { status: 400 });
    }
  }

  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
  const rows = emails.map((email) => ({
    org_id: context.orgId,
    email,
    role,
    token: randomBytes(24).toString('base64url'),
    invited_by: context.userId,
    expires_at: expiresAt,
    course_id: courseId,
  }));
  const { data: created, error } = await svc
    .from('invitations')
    .insert(rows)
    .select('id, email, token, expires_at');

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.flatearthequipment.com';
  const resendKey = process.env.RESEND_API_KEY;
  let sent = 0;
  let failed = 0;

  if (resendKey) {
    const resend = new Resend(resendKey);
    for (const invite of created || []) {
      try {
        const acceptUrl = `${baseUrl}/invite/accept?token=${invite.token}`;
        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'Flat Earth Safety <no-reply@flatearthequipment.com>',
          to: invite.email,
          subject: courseTitle
            ? `You've been enrolled in ${courseTitle}`
            : 'You have been invited to Forklift Certified',
          text: `You have been invited to Forklift Certified${courseTitle ? ` for ${courseTitle}` : ''}.\n\nAccept your invitation:\n${acceptUrl}\n\nThis invitation expires in 14 days.`,
        });
        sent++;
      } catch {
        failed++;
      }
    }
  }

  return NextResponse.json({
    ok: true,
    org_id: context.orgId,
    created_count: created?.length || 0,
    sent_count: sent,
    failed_count: failed,
    expires_at: expiresAt,
    invites: (created || []).map((invite) => ({
      id: invite.id,
      email: invite.email,
      status: 'sent',
      expires_at: invite.expires_at,
    })),
  });
}
