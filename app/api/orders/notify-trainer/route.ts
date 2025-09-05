import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const dynamic = 'force-dynamic';

function site() { return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'; }

export async function POST(req: Request) {
  const svc = supabaseService();
  const body = await req.json().catch(() => ({}));
  const order_id = body?.order_id as string;
  if (!order_id) return NextResponse.json({ ok: false, error: 'missing_order_id' }, { status: 400 });

  const { data: o } = await svc.from('orders').select('id, user_id, seats, course_slug, created_at').eq('id', order_id).maybeSingle();
  if (!o) return NextResponse.json({ ok: false, error: 'order_not_found' }, { status: 404 });
  const { data: u } = await svc.from('profiles').select('email, full_name').eq('id', (o as any).user_id).maybeSingle();
  const email = (u as any)?.email || '';
  if (!email) return NextResponse.json({ ok: false, error: 'purchaser_email_missing' }, { status: 400 });

  const manageUrl = `${site()}/trainer/seats`;
  const inviteUrl = `${site()}/trainer/invites?order=${order_id}`;
  const subject = `Your ${o?.seats || 0} training seats are ready`;
  const html = `<h2>Seats ready for ${o?.course_slug || 'course'}</h2><p>You purchased <b>${o?.seats || 0}</b> seat(s). Manage them here:</p><ul><li><a href="${manageUrl}">Manage seats</a></li><li><a href="${inviteUrl}">Invite learners</a></li></ul>`;

  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY as string);
      await resend.emails.send({ from: 'Flat Earth Safety <no-reply@flatearthequipment.com>', to: email, subject, html });
      return NextResponse.json({ ok: true, sent: true });
    } catch (e: any) {
      console.error('Resend error', e);
      return NextResponse.json({ ok: false, error: 'email_failed' }, { status: 500 });
    }
  } else {
    console.log('[DRYRUN email]', { to: email, subject, html });
    return NextResponse.json({ ok: true, sent: false, dryrun: true });
  }
}
