import { PLANS } from '@/lib/training/plans';
import { createTrainingCheckoutSessionFromForm } from '@/app/training/checkout/actions';

export default function PricingStrip() {
  return (
    <section id="pricing" className="mt-8 mx-auto max-w-6xl">
      <h2 className="text-2xl font-semibold text-center">Pricing</h2>
      <p className="text-center text-sm text-muted-foreground mt-1">Choose a plan and checkout securely.</p>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map(p => (
          <div key={p.key} className="border rounded-2xl p-5 flex flex-col justify-between bg-white shadow-sm">
            <div>
              <h3 className="text-lg font-medium">{p.title}</h3>
              <div className="text-3xl font-semibold mt-2">{p.priceText}</div>
              <p className="text-sm text-muted-foreground mt-1">{p.blurb}</p>
            </div>
            <form action={createTrainingCheckoutSessionFromForm} className="mt-6">
              <input type="hidden" name="priceId" value={p.priceId} />
              <button type="submit" className="btn-primary w-full" data-testid={`safety-top-buy-${p.key}`}>
                Buy now
              </button>
            </form>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-center text-muted-foreground">Already have a code? <a href="/redeem" className="underline">Redeem</a></p>
      <p className="mt-1 text-xs text-center text-muted-foreground">Want details? <a href="#how-it-works" className="underline">See how it works</a></p>
    </section>
  );
}
