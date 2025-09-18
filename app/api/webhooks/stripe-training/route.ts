import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripeServer';
import { isTrainingPrice, TRAINING_COURSE_SLUG } from '@/lib/payments/trainingStripeConfig';
import { supabaseService } from '@/lib/supabase/service.server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET_TRAINING;
  if (!secret || !sig) return NextResponse.json({ error: 'missing signature/secret' }, { status: 400 });

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const supabaseAdmin = supabaseService();

    // Prefer metadata from our checkout creation; fallback to expanded line items if present.
    const priceId = (session.metadata?.price_id as string | undefined) ?? null;
    const userId = (session.metadata?.user_id as string | undefined) ?? null;
    const email = (session.customer_details?.email as string | undefined) ?? (session.customer_email as string | undefined) ?? null;

    if (!isTrainingPrice(priceId)) {
      return NextResponse.json({ ok: true, ignored: true, reason: 'non-training price' });
    }

    // Resolve user ID: prefer metadata.user_id; else try lookup by email
    let uid = userId ?? null;
    if (!uid && email) {
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      uid = users?.users?.find(u => u.email === email)?.id ?? null;
    }

    if (!uid) {
      // Optional: store unclaimed purchase for later linking
      try { 
        await supabaseAdmin.from('unclaimed_purchases').insert({ 
          customer_email: email || 'unknown',
          stripe_session_id: session.id,
          course_id: null, // Will resolve later
          amount_cents: session.amount_total || 0,
          purchase_date: new Date().toISOString()
        }); 
      } catch (e) {
        console.warn('Failed to store unclaimed purchase:', e);
      }
      return NextResponse.json({ ok: true, deferred: true, reason: 'no matching auth user' });
    }

    // Load course ID by slug
    const { data: course, error: courseErr } = await supabaseAdmin
      .from('courses')
      .select('id, slug')
      .eq('slug', TRAINING_COURSE_SLUG)
      .maybeSingle();
    if (courseErr || !course) return NextResponse.json({ ok: false, error: 'course_not_found' }, { status: 500 });

    // Idempotent upsert of enrollment
    const { error: upsertErr } = await supabaseAdmin
      .from('enrollments')
      .upsert({ 
        user_id: uid, 
        course_id: course.id, 
        progress_pct: 0,
        passed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'user_id,course_id',
        ignoreDuplicates: true 
      });

    if (upsertErr) {
      console.error('Enrollment upsert error:', upsertErr);
      return NextResponse.json({ ok: false, error: upsertErr.message }, { status: 500 });
    }
    
    return NextResponse.json({ ok: true, enrolled: true, course: course.slug });
  }

  // Ignore all other events for this isolated endpoint
  return NextResponse.json({ ok: true, ignored: true, type: event.type });
}
