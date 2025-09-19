import { unstable_noStore as noStore } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';
import { createTrainingCheckoutSessionFromForm } from '@/app/training/checkout/actions';
import { PLANS } from '@/lib/training/plans';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TrainingPricing() {
  noStore();
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-5xl py-10">
      <h1 className="text-3xl font-semibold text-center">Forklift Certification Pricing</h1>
      <p className="mt-2 text-center text-muted-foreground">Choose a plan and checkout securely.</p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map(p => (
          <div key={p.key} className="border rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-medium">{p.title}</h2>
              <div className="text-3xl font-semibold mt-2">{p.priceText}</div>
              <p className="text-sm text-muted-foreground mt-1">{p.blurb}</p>
            </div>
            <form action={createTrainingCheckoutSessionFromForm} className="mt-6">
              <input type="hidden" name="priceId" value={p.priceId} />
              <button type="submit" className="btn-primary w-full" data-testid={`buy-${p.key}`}>
                {user ? 'Buy Now' : 'Sign in to Buy'}
              </button>
            </form>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Prices shown for convenience. Final price is determined at Stripe checkout.
      </p>
      
      <p className="mt-6 text-sm text-center">
        Already invited? <a className="underline hover:text-gray-900" href="/redeem">Redeem your code</a>
      </p>
    </div>
  );
}
