import Link from "next/link";
import { Metadata } from 'next';
import { getUserLocale } from '@/lib/getUserLocale';

export const metadata: Metadata = {
  title: 'About Flat Earth Equipment | Flat Earth Equipment',
  description: 'Flat Earth Equipment delivers precision-fit industrial parts and OSHA training nationwide. Built Western tough for contractors, fleets, and facilities.',
  alternates: { canonical: '/about' }
};

export default function AboutPage() {
  const locale = getUserLocale()
  
  // Translation strings
  const t = {
    en: {
      title: 'Built Western Tough. Driven by Precision.',
      intro: 'Flat Earth Equipment was built to serve the real operators — the mechanics, the parts managers, the fleet supervisors keeping America\'s equipment moving. We don\'t waste time, and we don\'t cut corners.',
      whatWeDo: {
        title: 'What We Do',
        para1: 'We supply precision-fit replacement parts for forklifts, scissor lifts, aerial equipment, and construction machines. Whether you\'re managing a municipal fleet or a rental yard in Wyoming, we get you the part — fast.',
        para2: 'Our team specializes in parts compatibility, sourcing, and speed. We ship anywhere in the U.S., but our brand runs on Western grit — from oil rigs in New Mexico to warehouses in Montana.'
      },
      howWeOperate: {
        title: 'How We Operate',
        items: [
          'Parts in stock and ready to ship',
          'Same-day quotes with no middleman delays', 
          'Transparent pricing and responsive support'
        ]
      },
      whoWeServe: {
        title: 'Who We Serve',
        para1: 'We support construction fleets, independent technicians, public works departments, rental companies, and shop managers who don\'t have time to guess.',
        para2: 'Our buyers are professionals who need fast quotes, precision parts, and honest info. That\'s what we deliver.'
      },
      whereWeComeFrom: {
        title: 'Where We Come From',
        para: 'Our roots are in the rugged West — where downtime isn\'t an option and performance matters. That mindset drives everything we do, from part sourcing to packaging.'
      },
      exploreMore: {
        title: 'Explore More',
        browseAllParts: 'Browse All Parts',
        shopByBrand: 'Shop by Brand'
      },
      lastUpdated: 'Last updated: May 2024'
    },
    es: {
      title: 'Construido Resistente del Oeste. Impulsado por la Precisión.',
      intro: 'Flat Earth Equipment fue construido para servir a los operadores reales: los mecánicos, los gerentes de partes, los supervisores de flotas que mantienen en movimiento el equipo de América. No perdemos tiempo, y no tomamos atajos.',
      whatWeDo: {
        title: 'Qué Hacemos',
        para1: 'Suministramos partes de repuesto de ajuste preciso para montacargas, elevadores de tijera, equipo aéreo y máquinas de construcción. Ya sea que esté manejando una flota municipal o un patio de alquiler en Wyoming, le conseguimos la parte — rápido.',
        para2: 'Nuestro equipo se especializa en compatibilidad de partes, abastecimiento y velocidad. Enviamos a cualquier lugar de los EE.UU., pero nuestra marca funciona con determinación del Oeste — desde plataformas petroleras en Nuevo México hasta almacenes en Montana.'
      },
      howWeOperate: {
        title: 'Cómo Operamos',
        items: [
          'Partes en stock y listas para enviar',
          'Cotizaciones el mismo día sin retrasos de intermediarios',
          'Precios transparentes y soporte receptivo'
        ]
      },
      whoWeServe: {
        title: 'A Quién Servimos',
        para1: 'Apoyamos flotas de construcción, técnicos independientes, departamentos de obras públicas, empresas de alquiler y gerentes de talleres que no tienen tiempo para adivinar.',
        para2: 'Nuestros compradores son profesionales que necesitan cotizaciones rápidas, partes de precisión e información honesta. Eso es lo que entregamos.'
      },
      whereWeComeFrom: {
        title: 'De Dónde Venimos',
        para: 'Nuestras raíces están en el resistente Oeste — donde el tiempo muerto no es una opción y el rendimiento importa. Esa mentalidad impulsa todo lo que hacemos, desde el abastecimiento de partes hasta el empaque.'
      },
      exploreMore: {
        title: 'Explorar Más',
        browseAllParts: 'Explorar Todas las Partes',
        shopByBrand: 'Comprar por Marca'
      },
      lastUpdated: 'Última actualización: Mayo 2024'
    }
  }[locale]

  return (
    <main className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold font-teko text-slate-900 mb-6">
        {t.title}
      </h1>

      <p className="text-lg text-slate-700 mb-10 max-w-2xl">
        {t.intro}
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-800 mb-4">{t.whatWeDo.title}</h2>
        <p className="text-slate-700 mb-4">
          {t.whatWeDo.para1}
        </p>
        <p className="text-slate-700">
          {t.whatWeDo.para2}
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-800 mb-4">{t.howWeOperate.title}</h2>
        <ul className="list-disc list-inside space-y-2 text-slate-700">
          {t.howWeOperate.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-800 mb-4">{t.whoWeServe.title}</h2>
        <p className="text-slate-700 mb-4">
          {t.whoWeServe.para1}
        </p>
        <p className="text-slate-700">
          {t.whoWeServe.para2}
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-800 mb-4">{t.whereWeComeFrom.title}</h2>
        <p className="text-slate-700">
          {t.whereWeComeFrom.para}
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-slate-800 mb-4">{t.exploreMore.title}</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/parts"
            className="inline-block bg-[#A0522D] text-white px-6 py-3 rounded-md text-center hover:bg-[#8B4513] transition"
          >
            {t.exploreMore.browseAllParts}
          </Link>
          <Link
            href="/brands"
            className="inline-block border border-[#A0522D] text-[#A0522D] px-6 py-3 rounded-md text-center hover:bg-[#A0522D] hover:text-white transition"
          >
            {t.exploreMore.shopByBrand}
          </Link>
        </div>
      </section>

      <footer className="text-sm text-slate-500 border-t pt-6">
        {t.lastUpdated}
      </footer>
    </main>
  );
} 