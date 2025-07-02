import { createClient } from '@supabase/supabase-js'
import CheckoutButton from './CheckoutButton'
import Link from 'next/link'
import Image from 'next/image'
import SafetyJsonLd from './SafetyJsonLd'
import TrustBadges from '@/components/TrustBadges'
import PriceCard from '@/components/PriceCard'
import FAQ from '@/components/FAQ'
import { getUserLocale } from '@/lib/getUserLocale'
import Script from 'next/script'

export const metadata = {
  title: "Online Forklift Operator Certification | OSHA-Compliant",
  description: "Earn your OSHA forklift certification online in under 60 minutes. Western-tough training from Flat Earth Equipment.",
}

export default async function SafetyHome() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { data: course } = await supabase.from('courses').select('*').eq('slug', 'forklift').single()
  const locale = getUserLocale()
  
  // Translation strings
  const t = {
    en: {
      title: 'OSHA Forklift Operator Certification',
      description: '100% online, self-paced course. Pass the 30-question exam and download your certificate today.',
      accessDashboard: 'Access Training Dashboard',
      courseBreakdown: 'Course Breakdown',
      features: [
        '8 interactive video lessons',
        'Real-world hazard recognition demos',
        'Instant printable certificate',
        'Free retakes until you pass',
        'Mobile-friendly evaluation form (no printing required)'
      ],
      pricing: {
        single: { tier: 'Single Operator', description: 'One seat, instant start' },
        pack5: { tier: '5-Pack', description: 'Team training bundle' },
        pack25: { tier: '25-Pack', description: 'Department-wide training' },
        unlimited: { tier: 'Unlimited', description: 'Facility-wide license' }
      },
      faq: [
        ['Is this OSHA-approved?', 'Yes – CFR 1910.178(l) compliant.'],
        ['How long does it take?', 'Most users complete it in under 60 minutes.'],
        ['Is Spanish available?', 'Sí, la versión en español se incluye.'],
        ['Can I get forklift certification near me online?', 'Yes! Our online forklift certification is available anywhere in the United States. You can complete the OSHA-compliant training from your location - whether you\'re in a major city, rural area, or remote worksite. The online certification is valid nationwide and accepted by employers across all industries.'],
        ['Do I need my employer to complete certification?', 'Yes, OSHA requires employers to conduct a practical evaluation of your forklift operation skills. We provide the evaluation checklist and instructions for your employer.'],
        ['What is included in the certification?', 'The certification includes comprehensive online theory training modules, quizzes to test your knowledge, a printable certificate upon completion, and an employer evaluation checklist for practical assessment.']
      ],
      includes: 'Includes online theory training + employer evaluation checklist',
      downloadEval: 'Download Employer Evaluation Sheet (PDF, v2.4)'
    },
    es: {
      title: 'Certificación de Operador de Montacargas OSHA',
      description: 'Curso 100% en línea, a tu propio ritmo. Aprueba el examen de 30 preguntas y descarga tu certificado hoy.',
      accessDashboard: 'Acceder al Panel de Entrenamiento',
      courseBreakdown: 'Desglose del Curso',
      features: [
        '8 lecciones interactivas en video',
        'Demostraciones de reconocimiento de peligros del mundo real',
        'Certificado instantáneo imprimible',
        'Reintentos gratuitos hasta que apruebes',
        'Formulario de evaluación móvil (no requiere impresión)'
      ],
      pricing: {
        single: { tier: 'Operador Individual', description: 'Un asiento, inicio instantáneo' },
        pack5: { tier: 'Paquete de 5', description: 'Paquete de entrenamiento en equipo' },
        pack25: { tier: 'Paquete de 25', description: 'Entrenamiento para todo el departamento' },
        unlimited: { tier: 'Ilimitado', description: 'Licencia para toda la instalación' }
      },
      faq: [
        ['¿Está aprobado por OSHA?', 'Sí – Cumple con CFR 1910.178(l).'],
        ['¿Cuánto tiempo toma?', 'La mayoría de los usuarios lo completan en menos de 60 minutos.'],
        ['¿Está disponible en español?', 'Sí, la versión en español está incluida.'],
        ['¿Puedo obtener certificación de montacargas cerca de mí en línea?', '¡Sí! Nuestra certificación de montacargas en línea está disponible en cualquier lugar de Estados Unidos. Puede completar el entrenamiento conforme a OSHA desde su ubicación - ya sea en una ciudad importante, área rural, o sitio de trabajo remoto. La certificación en línea es válida a nivel nacional y aceptada por empleadores en todas las industrias.'],
        ['¿Necesito que mi empleador complete la certificación?', 'Sí, OSHA requiere que los empleadores realicen una evaluación práctica de sus habilidades de operación de montacargas. Proporcionamos la lista de verificación de evaluación e instrucciones para su empleador.'],
        ['¿Qué está incluido en la certificación?', 'La certificación incluye módulos completos de entrenamiento teórico en línea, cuestionarios para probar su conocimiento, un certificado imprimible al completar, y una lista de verificación de evaluación del empleador para la evaluación práctica.']
      ],
      includes: 'Incluye entrenamiento teórico en línea + lista de verificación de evaluación del empleador',
      downloadEval: 'Descargar Hoja de Evaluación del Empleador (PDF, v2.4)'
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

      {/* Local Business Schema for Forklift Training */}
      <Script id="local-business-ld-json" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Flat Earth Equipment",
          "image": "https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/flat-earth-logo-badge.webp",
          "url": "https://www.flatearthequipment.com/safety",
          "telephone": "+1-307-302-0043",
          "email": "contact@flatearthequipment.com",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "30 N Gould St., Ste R",
            "addressLocality": "Sheridan",
            "addressRegion": "WY",
            "postalCode": "82801",
            "addressCountry": "US"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 44.7969,
            "longitude": -106.9561
          },
          "openingHours": "Mo-Fr 07:00-17:00",
          "areaServed": [
            {
              "@type": "State",
              "name": "Wyoming"
            },
            {
              "@type": "State", 
              "name": "Montana"
            },
            {
              "@type": "State",
              "name": "Colorado"
            },
            {
              "@type": "State",
              "name": "New Mexico"
            }
          ],
          "serviceType": [
            "Forklift Certification Training",
            "OSHA Forklift Training", 
            "Online Forklift Certification",
            "Forklift Operator Training",
            "Industrial Safety Training"
          ],
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Forklift Training Services",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Course",
                  "name": "OSHA Forklift Operator Certification"
                },
                "price": "59",
                "priceCurrency": "USD"
              }
            ]
          },
          "priceRange": "$59-$1999",
          "paymentAccepted": "Credit Card, Debit Card",
          "currenciesAccepted": "USD"
        })}
      </Script>

      {/* Service Schema for Training */}
      <Script id="service-ld-json" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "serviceType": "Forklift Certification Training",
          "provider": {
            "@type": "LocalBusiness",
            "name": "Flat Earth Equipment",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "30 N Gould St., Ste R",
              "addressLocality": "Sheridan", 
              "addressRegion": "WY",
              "postalCode": "82801",
              "addressCountry": "US"
            },
            "telephone": "+1-307-302-0043"
          },
          "areaServed": {
            "@type": "Country",
            "name": "United States"
          },
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Forklift Training Programs",
            "itemListElement": [
              {
                "@type": "Offer",
                "name": "Single Operator Certification",
                "price": "59",
                "priceCurrency": "USD"
              },
              {
                "@type": "Offer", 
                "name": "5-Pack Team Training",
                "price": "275",
                "priceCurrency": "USD"
              },
              {
                "@type": "Offer",
                "name": "25-Pack Department Training", 
                "price": "1375",
                "priceCurrency": "USD"
              },
              {
                "@type": "Offer",
                "name": "Unlimited Facility License",
                "price": "1999", 
                "priceCurrency": "USD"
              }
            ]
          }
        })}
      </Script>
      
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

        {/* LOCAL AVAILABILITY SECTION */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Forklift Certification Near Me</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Get your OSHA forklift certification online from anywhere in the United States. 
              Our comprehensive training program is available 24/7, making it easy to find 
              forklift certification near me, whether you're in a major city or rural area.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-3">Major Metropolitan Areas</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• New York City & Tri-State Area</li>
                <li>• Los Angeles & Southern California</li>
                <li>• Chicago & Great Lakes Region</li>
                <li>• Houston & Gulf Coast</li>
                <li>• Phoenix & Southwest</li>
              </ul>
            </div>
            
            <div className="bg-white border rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-3">Industrial Centers</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Detroit & Manufacturing Belt</li>
                <li>• Atlanta & Southeast Logistics</li>
                <li>• Dallas-Fort Worth Metroplex</li>
                <li>• Denver & Mountain West</li>
                <li>• Seattle & Pacific Northwest</li>
              </ul>
            </div>
            
            <div className="bg-white border rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-3">Rural & Remote Areas</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Agricultural Communities</li>
                <li>• Mining & Energy Regions</li>
                <li>• Small Manufacturing Towns</li>
                <li>• Distribution Centers</li>
                <li>• Port Communities</li>
              </ul>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              No matter where you're located, our online forklift certification program 
              provides the same high-quality OSHA-compliant training trusted by thousands of operators nationwide.
            </p>
            <CheckoutButton 
              courseSlug="forklift" 
              price={course?.price_cents ? (course.price_cents / 100).toFixed(0) : '59'} 
            />
          </div>
        </section>

        {/* FAQ */}
        <FAQ
          items={t.faq as [string, string][]}
        />

        {/* LEGACY CONTENT */}
        <section className="bg-gray-50 rounded-lg p-6">
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">{t.includes}</p>
            <Link href="/pdfs/forklift-evaluation-form-v2.4.pdf" target="_blank" className="text-orange-600 hover:underline text-sm">
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