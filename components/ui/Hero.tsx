import Link from "next/link";

interface HeroContent {
  badge: { label: string; highlight: string };
  headline: string;
  subtext: string;
  cta: { text: string; href: string };
  trustSignals: string[];
  secondaryLink: { text: string; href: string; label: string };
}

export function Hero({ locale = 'en' }: { locale?: 'en' | 'es' }) {
  const content: HeroContent = locale === 'en' ? {
    badge: { label: 'PARTS', highlight: 'Ships nationwide' },
    headline: 'Parts that keep your fleet running',
    subtext:
      'Forks, seats, lithium batteries, chargers, and more — shipped across the U.S.',
    cta: { text: 'Browse Parts →', href: '/parts' },
    trustSignals: ['OEM-fit replacements', 'Fast-moving stock', 'Nationwide shipping'],
    secondaryLink: {
      label: 'Need forklift certification?',
      text: 'Start training →',
      href: '/safety',
    },
  } : {
    badge: { label: 'PARTES', highlight: 'Envío a todo el país' },
    headline: 'Partes que mantienen su flota en marcha',
    subtext:
      'Horquillas, asientos, baterías de litio, cargadores y más — envío a todo EE.UU.',
    cta: { text: 'Ver Partes →', href: '/parts' },
    trustSignals: ['Reemplazos de ajuste OEM', 'Inventario de alta rotación', 'Envío a todo el país'],
    secondaryLink: {
      label: '¿Necesita certificación de montacargas?',
      text: 'Comenzar capacitación →',
      href: '/safety',
    },
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
              {content.badge.label}
            </span>
            <span className="text-xs text-white/80">•</span>
            <span className="text-xs text-emerald-300 font-semibold">{content.badge.highlight}</span>
          </div>
          
          {/* Headline */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            {content.headline}
          </h1>
          
          {/* Subtext */}
          <p className="text-white/90 text-lg mb-6">
            {content.subtext}
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
