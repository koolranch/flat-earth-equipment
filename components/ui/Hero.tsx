import Link from "next/link";

interface HeroContent {
  badge: { emoji: string; label: string; highlight: string };
  headline: string;
  subtext: string;
  pricing: { original: string; current: string };
  cta: { text: string; href: string };
  trustSignals: string[];
  secondaryLink: { text: string; href: string; label: string };
}

export function Hero({ locale = 'en' }: { locale?: 'en' | 'es' }) {
  const content: HeroContent = locale === 'en' ? {
    badge: { emoji: '🎓', label: 'TRAINING', highlight: 'Save $10' },
    headline: 'Get Forklift Certified in Under 30 Minutes',
    subtext: 'OSHA-compliant • 100% online',
    pricing: { original: '$59', current: '$49' },
    cta: { text: 'Start Certification — $49 →', href: '/safety' },
    trustSignals: ['OSHA 1910.178', 'All 50 States', 'Instant Certificate'],
    secondaryLink: { label: 'Need parts or rentals?', text: 'Browse equipment →', href: '/parts' }
  } : {
    badge: { emoji: '🎓', label: 'CAPACITACIÓN', highlight: 'Ahorre $10' },
    headline: 'Obtenga Certificación de Montacargas en Menos de 30 Minutos',
    subtext: 'Cumple con OSHA • 100% en línea',
    pricing: { original: '$59', current: '$49' },
    cta: { text: 'Comenzar Certificación — $49 →', href: '/safety' },
    trustSignals: ['OSHA 1910.178', 'Los 50 Estados', 'Certificado Instantáneo'],
    secondaryLink: { label: '¿Necesita partes o alquileres?', text: 'Ver equipos →', href: '/parts' }
  };

  return (
    <section className="relative h-[500px] md:h-[600px] w-full overflow-hidden">
      {/* Background image */}
      <img
        src="https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/hero-bg-mountains.webp"
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center"
        loading="eager"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40"></div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full px-6 text-center">
        <div className="max-w-xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 backdrop-blur-sm border px-4 py-2 rounded-full mb-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-400/30">
            <span className="text-xs font-bold text-orange-300">
              {content.badge.emoji} {content.badge.label}
            </span>
            <span className="text-xs text-white/80">•</span>
            <span className="text-xs text-emerald-300 font-semibold">{content.badge.highlight}</span>
          </div>
          
          {/* Headline */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            {content.headline}
          </h1>
          
          {/* Subtext with pricing */}
          <p className="text-white/90 text-lg mb-6">
            {content.subtext}
            {' • '}
            <span className="inline-flex items-baseline gap-1.5">
              <span className="text-white/60 line-through text-base">{content.pricing.original}</span>
              <span className="font-bold text-white text-xl">{content.pricing.current}</span>
            </span>
          </p>
          
          {/* CTA Button */}
          <Link
            href={content.cta.href}
            className="inline-block w-full sm:w-auto text-white px-10 py-5 rounded-xl font-bold text-xl transition-all shadow-2xl mb-6 bg-orange-500 hover:bg-orange-600 hover:shadow-orange-500/50"
          >
            {content.cta.text}
          </Link>
          
          {/* Trust Signals */}
          <div className="flex flex-wrap justify-center gap-4 text-sm text-white/90 mb-4">
            {content.trustSignals.map((signal, i) => (
              <span key={i} className="flex items-center gap-1">
                <svg className="w-4 h-4 text-emerald-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                {signal}
              </span>
            ))}
          </div>
          
          {/* Secondary Link */}
          <p className="text-sm text-white/60">
            {content.secondaryLink.label}{' '}
            <Link href={content.secondaryLink.href} className="underline hover:text-white">
              {content.secondaryLink.text}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
