export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const SAFE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomSuffix(len = 4): string {
  let out = '';
  for (let i = 0; i < len; i++) {
    out += SAFE_CHARS[Math.floor(Math.random() * SAFE_CHARS.length)];
  }
  return out;
}

export async function GET() {
  try {
    const sb = supabaseServer();
    const { data: { user }, error: authErr } = await sb.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const svc = supabaseService();

    // Check for existing referral code
    const { data: existing } = await svc
      .from('referral_codes')
      .select('code')
      .eq('user_id', user.id)
      .single();

    if (existing?.code) {
      const { count } = await svc
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('referrer_id', user.id);

      return NextResponse.json({
        code: existing.code,
        shareUrl: `https://www.flatearthequipment.com/training?ref=${existing.code}`,
        referralCount: count ?? 0,
      });
    }

    // Resolve first name: profiles.full_name → user_metadata.full_name → email prefix → FRIEND
    let firstName = 'FRIEND';
    const { data: profile } = await svc
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    const rawName =
      profile?.full_name ||
      user.user_metadata?.full_name ||
      user.email?.split('@')[0] ||
      '';

    if (rawName) {
      firstName = rawName.split(/\s+/)[0].toUpperCase().replace(/[^A-Z]/g, '') || 'FRIEND';
    }

    // Generate unique code with retry
    let code = '';
    let stripePromoId = '';

    for (let attempt = 0; attempt < 5; attempt++) {
      code = `${firstName}-FC-${randomSuffix()}`;

      const { data: collision } = await svc
        .from('referral_codes')
        .select('id')
        .eq('code', code)
        .maybeSingle();

      if (collision) continue;

      // Create Stripe Promotion Code tied to the referral_10_off coupon
      const promo = await stripe.promotionCodes.create({
        coupon: 'referral_10_off',
        code,
        active: true,
        max_redemptions: 1000,
        restrictions: { first_time_transaction: false },
      });
      stripePromoId = promo.id;
      break;
    }

    if (!stripePromoId) {
      return NextResponse.json({ error: 'Failed to generate unique code' }, { status: 500 });
    }

    const { error: insertErr } = await svc.from('referral_codes').insert({
      user_id: user.id,
      code,
      stripe_promotion_code_id: stripePromoId,
    });

    if (insertErr) {
      console.error('[referral] Insert error:', insertErr);
      return NextResponse.json({ error: 'Failed to save referral code' }, { status: 500 });
    }

    return NextResponse.json({
      code,
      shareUrl: `https://www.flatearthequipment.com/training?ref=${code}`,
      referralCount: 0,
    });
  } catch (err) {
    console.error('[referral] Unexpected error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
