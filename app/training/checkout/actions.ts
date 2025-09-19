"use server";
import { stripe } from '@/lib/payments/stripeServer';
import { TRAINING_PRICE_IDS, TRAINING_COURSE_SLUG } from '@/lib/payments/trainingStripeConfig';
import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function createTrainingCheckoutSession() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent('/training/checkout')}`);

  const priceId = TRAINING_PRICE_IDS[0];
  if (!priceId) throw new Error('TRAINING_PRICE_IDS not configured');

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) throw new Error('NEXT_PUBLIC_SITE_URL not configured');

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${baseUrl}/training?purchase=success`,
    cancel_url: `${baseUrl}/training/checkout?cancelled=1`,
    customer_email: user.email,
    metadata: { 
      user_id: user.id, 
      price_id: priceId, 
      course: TRAINING_COURSE_SLUG 
    }
  });

  if (!session.url) throw new Error('Failed to create checkout session');
  return { url: session.url };
}

export async function createTrainingCheckoutSessionFromForm(formData: FormData) {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent('/training/pricing')}`);

  const priceId = String(formData.get('priceId') || '').trim();
  if (!priceId) throw new Error('Missing priceId');

  // Find an org where the user is owner/trainer (prefer owner)
  let orgId: string | null = null;
  const { data: owner } = await supabase.from('org_members').select('org_id, role').eq('user_id', user.id).in('role', ['owner']).limit(1).maybeSingle();
  if (owner?.org_id) orgId = owner.org_id;
  if (!orgId) {
    const { data: trainer } = await supabase.from('org_members').select('org_id, role').eq('user_id', user.id).in('role', ['trainer']).limit(1).maybeSingle();
    if (trainer?.org_id) orgId = trainer.org_id;
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || '';
  if (!baseUrl) throw new Error('NEXT_PUBLIC_SITE_URL not configured');

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${baseUrl}/training?purchase=success`,
    cancel_url: `${baseUrl}/training/pricing?cancelled=1`,
    customer_email: user.email,
    metadata: { 
      user_id: user.id, 
      price_id: priceId, 
      course: TRAINING_COURSE_SLUG,
      ...(orgId ? { org_id: orgId } : {})
    }
  });

  redirect(session.url!);
}
