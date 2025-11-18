import Link from "next/link";

export function Hero({ locale = 'en' }: { locale?: 'en' | 'es' }) {
  
  const t = {
    en: {
      headline: "Get Forklift Certified in Under 30 Minutes",
      pricing: "OSHA-compliant • 100% online",
      cta: "Start Certification — $49",
      trustSignals: ["OSHA 1910.178", "All 50 States", "Instant Certificate"],
      partsLink: "Need parts or rentals?",
      partsLinkText: "Browse equipment",
      altText: "Forklift certification training"
    },
    es: {
      headline: "Obtenga Certificación de Montacargas en Menos de 30 Minutos",
      pricing: "Cumple con OSHA • 100% en línea",
      cta: "Comenzar Certificación — $49",
      trustSignals: ["OSHA 1910.178", "Los 50 Estados", "Certificado Instantáneo"],
      partsLink: "¿Necesita partes o alquileres?",
      partsLinkText: "Ver equipos",
      altText: "Capacitación de certificación de montacargas"
    }
  }[locale]

  return (
    <section className="relative h-[500px] md:h-[600px] w-full overflow-hidden">
      <img
        src="https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/hero-bg-mountains.webp"
        alt={t.altText}
        className="absolute inset-0 w-full h-full object-cover object-center"
        loading="eager"
      />

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40"></div>

      {/* Text Content - Certification Focused */}
      <div className="relative z-10 flex items-center justify-center h-full px-6 text-center">
        <div className="max-w-xl mx-auto">
          {/* Black Friday Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-400/30 px-4 py-2 rounded-full mb-4 animate-in fade-in duration-700">
            <span className="text-xs font-bold text-orange-300">🎉 BLACK FRIDAY</span>
            <span className="text-xs text-white/80">•</span>
            <span className="text-xs text-emerald-300 font-semibold">Save $10</span>
          </div>
          
          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            {t.headline}
          </h1>
          
          {/* Value Props with Pricing */}
          <p className="text-white/90 text-lg mb-6">
            {t.pricing} • 
            <span className="inline-flex items-baseline gap-1.5 mx-1">
              <span className="text-white/60 line-through text-base">$59</span>
              <span className="font-bold text-white text-xl">$49</span>
            </span>
          </p>
          
          {/* Single Primary CTA */}
          <Link
            href="/safety"
            className="inline-block w-full sm:w-auto bg-orange-500 text-white px-10 py-5 rounded-xl font-bold text-xl hover:bg-orange-600 transition-all shadow-2xl hover:shadow-orange-500/50 mb-6"
          >
            {t.cta} →
          </Link>
          
          {/* Trust Signals */}
          <div className="flex flex-wrap justify-center gap-4 text-sm text-white/90 mb-4">
            {t.trustSignals.map((signal, i) => (
              <span key={i} className="flex items-center gap-1">
                <svg className="w-4 h-4 text-emerald-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                {signal}
              </span>
            ))}
          </div>
          
          {/* Subtle Parts Link */}
          <p className="text-sm text-white/60">
            {t.partsLink} <Link href="/parts" className="underline hover:text-white">{t.partsLinkText} →</Link>
          </p>
        </div>
      </div>
    </section>
  );
} 