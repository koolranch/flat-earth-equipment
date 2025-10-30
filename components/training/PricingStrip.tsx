import { PLANS } from '@/lib/training/plans';
import { createTrainingCheckoutSessionFromForm } from '@/app/training/checkout/actions';
import Link from 'next/link';

export default function PricingStrip({ disableBuy = false }: { disableBuy?: boolean }) {
  return (
    <section id="pricing" className="mt-8 mx-auto max-w-6xl px-4">
      <h2 className="text-3xl font-bold text-center text-slate-900">Pricing</h2>
      <p className="text-center text-base text-slate-600 mt-2">Choose a plan and checkout securely.</p>
      <p className="text-center text-sm text-slate-600 mt-1">Bulk seat packs include manager dashboard and verification tools.</p>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((p) => (
          <div 
            key={p.key} 
            className={`relative border-2 rounded-2xl p-6 flex flex-col justify-between bg-white shadow-md hover:shadow-xl transition-all ${
              p.popular ? 'border-[#F76511] ring-2 ring-orange-100' : 'border-slate-200'
            }`}
          >
            {p.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-[#F76511] text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                  POPULAR
                </span>
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold text-slate-900">{p.title}</h3>
              <div className="text-4xl font-bold mt-3 text-[#F76511]">{p.priceText}</div>
              <p className="text-sm text-slate-600 mt-2">{p.blurb}</p>
              {p.savings && (
                <p className="text-xs text-emerald-600 font-semibold mt-1">Save: {p.savings}</p>
              )}
            </div>
            {disableBuy ? (
              <Link 
                href="/safety#pricing" 
                className="mt-6 w-full text-center px-4 py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors" 
                data-testid={`safety-see-${p.key}`}
              >
                See on pricing page
              </Link>
            ) : (
              <form action={createTrainingCheckoutSessionFromForm} className="mt-6">
                <input type="hidden" name="priceId" value={p.priceId} />
                <button 
                  type="submit" 
                  className={`w-full px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg ${
                    p.popular 
                      ? 'bg-[#F76511] text-white hover:bg-orange-600' 
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                  data-testid={`safety-top-buy-${p.key}`}
                >
                  Buy Now →
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-center text-slate-600">
        Already have a code? <a href="/redeem" className="text-[#F76511] underline hover:text-orange-600">Redeem</a>
      </p>
      <p className="mt-2 text-sm text-center text-slate-600">
        Want details? <a href="/safety#pricing" className="text-[#F76511] underline hover:text-orange-600">See full pricing</a>
      </p>
    </section>
  );
}
