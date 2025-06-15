import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";

export function Hero({ locale = 'en' }: { locale?: 'en' | 'es' }) {
  
  const t = {
    en: {
      title: "Industrial Parts & Rentals",
      subtitle: "Western Tough.",
      description: "Precision-fit components and dispatch-ready equipment — fast quotes, same-day shipping, and no runaround.",
      viewAllParts: "View All Parts",
      altText: "Western mountain range background representing rugged industrial service region"
    },
    es: {
      title: "Partes y Alquileres Industriales",
      subtitle: "Resistente del Oeste.",
      description: "Componentes de ajuste preciso y equipos listos para despacho — cotizaciones rápidas, envío el mismo día, y sin rodeos.",
      viewAllParts: "Ver Todas las Partes",
      altText: "Fondo de cordillera occidental que representa la región de servicio industrial resistente"
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
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30"></div>

      {/* Text Content */}
      <div className="relative z-10 flex items-center justify-center h-full px-6 text-center">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-bold leading-tight text-white mb-4">
            {t.title}<br/>
            <span className="text-3xl">{t.subtitle}</span>
          </h1>
          <p className="text-white text-base md:text-lg mb-6">
            {t.description}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <div className="w-full sm:w-auto">
              <SearchBar />
            </div>
            <Link
              href="/parts"
              className="inline-block px-4 py-2 border border-white rounded hover:bg-white/10 transition text-white"
            >
              {t.viewAllParts}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
} 