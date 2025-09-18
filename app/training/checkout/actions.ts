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
