import { createClient } from '@supabase/supabase-js'
import CheckoutButton from './CheckoutButton'
import Link from 'next/link'
import Image from 'next/image'
import SafetyJsonLd from './SafetyJsonLd'
import TrustBadges from '@/components/TrustBadges'
import PriceCard from '@/components/PriceCard'
import FAQ from '@/components/FAQ'
import { getUserLocale } from '@/lib/getUserLocale'

export const metadata = {
  title: "Online Forklift Operator Certification | OSHA-Compliant",
  description: "Earn your OSHA forklift certification online in under 90 minutes. Western-tough training from Flat Earth Equipment.",
}

export default async function SafetyHome() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { data: course } = await supabase.from('courses').select('*').eq('slug', 'forklift').single()
  const locale = getUserLocale()
  
  // Translation strings
  const t = {
    en: {
      title: 'OSHA Forklift Operator Certification',
      description: '100% online, self-paced course. Pass the 30-question exam and print your wallet card today.',
      accessDashboard: 'Access Training Dashboard',
      courseBreakdown: 'Course Breakdown',
      features: [
        '8 interactive video lessons',
        'Real-world hazard recognition demos',
        'Instant printable certificate & wallet card',
        'Free retakes until you pass',
        'Employer evaluation checklist included'
      ],
      pricing: {
        single: { tier: 'Single Operator', description: 'One seat, instant start' },
        pack5: { tier: '5-Pack', description: 'Team training bundle' },
        pack25: { tier: '25-Pack', description: 'Department-wide training' },
        unlimited: { tier: 'Unlimited', description: 'Facility-wide license' }
      },
      faq: [
        ['Is this OSHA-approved?', 'Yes – CFR 1910.178(l) compliant.'],
        ['How long does it take?', 'Average completion time is 90 minutes.'],
        ['Is Spanish available?', 'Sí, la versión en español se incluye.'],
        ['Do I need my employer to complete certification?', 'Yes, OSHA requires employers to conduct a practical evaluation of your forklift operation skills. We provide the evaluation checklist and instructions for your employer.'],
        ['What is included in the certification?', 'The certification includes comprehensive online theory training modules, quizzes to test your knowledge, a printable certificate upon completion, and an employer evaluation checklist for practical assessment.']
      ],
      includes: 'Includes online theory training + employer evaluation checklist',
      downloadEval: 'Download Employer Evaluation Sheet (PDF, v2.3)'
    },
    es: {
      title: 'Certificación de Operador de Montacargas OSHA',
      description: 'Curso 100% en línea, a tu propio ritmo. Aprueba el examen de 30 preguntas e imprime tu tarjeta de billetera hoy.',
      accessDashboard: 'Acceder al Panel de Entrenamiento',
      courseBreakdown: 'Desglose del Curso',
      features: [
        '8 lecciones interactivas en video',
        'Demostraciones de reconocimiento de peligros del mundo real',
        'Certificado instantáneo imprimible y tarjeta de billetera',
        'Reintentos gratuitos hasta que apruebes',
        'Lista de verificación de evaluación del empleador incluida'
      ],
      pricing: {
        single: { tier: 'Operador Individual', description: 'Un asiento, inicio instantáneo' },
        pack5: { tier: 'Paquete de 5', description: 'Paquete de entrenamiento en equipo' },
        pack25: { tier: 'Paquete de 25', description: 'Entrenamiento para todo el departamento' },
        unlimited: { tier: 'Ilimitado', description: 'Licencia para toda la instalación' }
      },
      faq: [
        ['¿Está aprobado por OSHA?', 'Sí – Cumple con CFR 1910.178(l).'],
        ['¿Cuánto tiempo toma?', 'El tiempo promedio de finalización es de 90 minutos.'],
        ['¿Está disponible en español?', 'Sí, la versión en español está incluida.'],
        ['¿Necesito que mi empleador complete la certificación?', 'Sí, OSHA requiere que los empleadores realicen una evaluación práctica de sus habilidades de operación de montacargas. Proporcionamos la lista de verificación de evaluación e instrucciones para su empleador.'],
        ['¿Qué está incluido en la certificación?', 'La certificación incluye módulos completos de entrenamiento teórico en línea, cuestionarios para probar su conocimiento, un certificado imprimible al completar, y una lista de verificación de evaluación del empleador para la evaluación práctica.']
      ],
      includes: 'Incluye entrenamiento teórico en línea + lista de verificación de evaluación del empleador',
      downloadEval: 'Descargar Hoja de Evaluación del Empleador (PDF, v2.3)'
    }
  }[locale]
  
  return (
    <>
      <SafetyJsonLd />
      
      {/* Canonical link */}
      <link
        rel="canonical"
        href="https://www.flatearthequipment.com/safety"
      />
      
      <main className="container mx-auto px-4 lg:px-8 py-12 space-y-24">
        {/* HERO */}
        <section className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-5xl font-extrabold">
              {course?.title || t.title}
            </h1>
            <p className="text-gray-700">
              {t.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <CheckoutButton 
                courseSlug="forklift" 
                price={course?.price_cents ? (course.price_cents / 100).toFixed(0) : '59'} 
              />
              <Link 
                href="/dashboard-simple" 
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                {t.accessDashboard}
              </Link>
            </div>
          </div>
          <div className="relative">
            <Image
              src="https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/safety-hero.png"
              alt="Forklift operator taking online certification on tablet"
              width={500}
              height={400}
              className="rounded-2xl shadow-lg w-full h-auto"
            />
          </div>
        </section>

        {/* TRUST BADGES */}
        <TrustBadges />

        {/* MODULE BREAKDOWN */}
        <section id="modules" className="space-y-8">
          <h2 className="text-2xl font-semibold">{t.courseBreakdown}</h2>
          <ul className="space-y-4 text-gray-700 list-disc pl-4">
            {t.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </section>

        {/* PRICING TIERS */}
        <section id="pricing" className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <PriceCard
            tier={t.pricing.single.tier}
            price="$59"
            description={t.pricing.single.description}
            sku="price_1RS834HJI548rO8JpJMyGhL3"
          />
          <PriceCard
            tier={t.pricing.pack5.tier}
            price="$275"
            description={t.pricing.pack5.description}
            sku="price_1RS835HJI548rO8JkMXj7FMQ"
          />
          <PriceCard
            tier={t.pricing.pack25.tier}
            price="$1,375"
            description={t.pricing.pack25.description}
            sku="price_1RS835HJI548rO8JbvRrMwUv"
          />
          <PriceCard
            tier={t.pricing.unlimited.tier}
            price="$1,999"
            description={t.pricing.unlimited.description}
            sku="price_1RS836HJI548rO8JwlCAzg7m"
          />
        </section>

        {/* FAQ */}
        <FAQ
          items={t.faq as [string, string][]}
        />

        {/* LEGACY CONTENT */}
        <section className="bg-gray-50 rounded-lg p-6">
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">{t.includes}</p>
            <Link href="https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/forklift-eval-v2.3.pdf" target="_blank" className="text-orange-600 hover:underline text-sm">
              {t.downloadEval}
            </Link>
          </div>
        </section>

        {/* SCHEMA MARKUP */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Course",
              "name": "OSHA Forklift Operator Certification",
              "provider": {
                "@type": "Organization",
                "name": "Flat Earth Equipment",
                "logo": "https://www.flatearthequipment.com/logo.png",
              },
              "offers": {
                "@type": "Offer",
                "price": "59",
                "priceCurrency": "USD",
                "url": "https://www.flatearthequipment.com/safety",
              },
            }),
          }}
        />
      </main>


    </>
  )
} 