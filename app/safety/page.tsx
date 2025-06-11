import { createClient } from '@supabase/supabase-js'
import CheckoutButton from './CheckoutButton'
import Link from 'next/link'
import Image from 'next/image'
import SafetyJsonLd from './SafetyJsonLd'
import TrustBadges from '@/components/TrustBadges'
import PriceCard from '@/components/PriceCard'
import FAQ from '@/components/FAQ'

export const metadata = {
  title: "Online Forklift Operator Certification | OSHA-Compliant",
  description: "Earn your OSHA forklift certification online in under 90 minutes. Western-tough training from Flat Earth Equipment.",
}

export default async function SafetyHome() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { data: course } = await supabase.from('courses').select('*').eq('slug', 'forklift').single()
  
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
              {course?.title || 'OSHA Forklift Operator Certification'}
            </h1>
            <p className="text-gray-700">
              100% online, self-paced course. Pass the 30-question exam and print
              your wallet card today.
            </p>
            <CheckoutButton 
              courseSlug="forklift" 
              price={course?.price_cents ? (course.price_cents / 100).toFixed(0) : '59'} 
            />
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
          <h2 className="text-2xl font-semibold">Course Breakdown</h2>
          <ul className="space-y-4 text-gray-700 list-disc pl-4">
            <li>8 interactive video lessons</li>
            <li>Real-world hazard recognition demos</li>
            <li>Instant printable certificate & wallet card</li>
            <li>Free retakes until you pass</li>
            <li>Employer evaluation checklist included</li>
          </ul>
        </section>

        {/* PRICING TIERS */}
        <section id="pricing" className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <PriceCard
            tier="Single Operator"
            price="$59"
            description="One seat, instant start"
            sku="price_1RSHWVHJI548rO8Jf9CJer6y"
          />
          <PriceCard
            tier="5-Pack"
            price="$275"
            description="Team training bundle"
            sku="price_5PACK"
          />
          <PriceCard
            tier="25-Pack"
            price="$1,375"
            description="Department-wide training"
            sku="price_25PACK"
          />
          <PriceCard
            tier="Unlimited"
            price="$1,999"
            description="Facility-wide license"
            sku="price_UNLTD"
          />
        </section>

        {/* FAQ */}
        <FAQ
          items={[
            ["Is this OSHA-approved?", "Yes – CFR 1910.178(l) compliant."],
            ["How long does it take?", "Average completion time is 90 minutes."],
            ["Is Spanish available?", "Sí, la versión en español se incluye."],
            ["Do I need my employer to complete certification?", "Yes, OSHA requires employers to conduct a practical evaluation of your forklift operation skills. We provide the evaluation checklist and instructions for your employer."],
            ["What is included in the certification?", "The certification includes comprehensive online theory training modules, quizzes to test your knowledge, a printable certificate upon completion, and an employer evaluation checklist for practical assessment."],
          ]}
        />

        {/* LEGACY CONTENT */}
        <section className="bg-gray-50 rounded-lg p-6">
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">Includes online theory training + employer evaluation checklist</p>
            <Link href="https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/forklift-eval-v2.3.pdf" target="_blank" className="text-orange-600 hover:underline text-sm">
              Download Employer Evaluation Sheet (PDF, v2.3)
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