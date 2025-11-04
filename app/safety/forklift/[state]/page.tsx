import { Metadata } from "next";
import { notFound } from "next/navigation";
import { forkliftStates, ForkliftStateInfo } from "../../../../src/data/forkliftStates";
import CheckoutButton from "@/app/safety/CheckoutButton";
import Link from "next/link";
import StateHero from "@/components/state/StateHero";
import StickyCTA from "@/components/state/StickyCTA";
import StateProductJsonLd from "@/components/state/StateProductJsonLd";

// Disable dynamic params to ensure only pre-generated pages are served
export const dynamicParams = false

// OSHA fine mapping by state (sample data - you can update with real values)
const OSHA_FINES_BY_STATE: { [key: string]: { serious: number, willful: number, stateName: string } } = {
  'al': { serious: 15625, willful: 156259, stateName: 'Alabama' },
  'ak': { serious: 15625, willful: 156259, stateName: 'Alaska' },
  'az': { serious: 15625, willful: 156259, stateName: 'Arizona' },
  'ar': { serious: 15625, willful: 156259, stateName: 'Arkansas' },
  'ca': { serious: 18000, willful: 180000, stateName: 'California' }, // CA has higher fines
  'co': { serious: 15625, willful: 156259, stateName: 'Colorado' },
  'ct': { serious: 15625, willful: 156259, stateName: 'Connecticut' },
  'de': { serious: 15625, willful: 156259, stateName: 'Delaware' },
  'fl': { serious: 15625, willful: 156259, stateName: 'Florida' },
  'ga': { serious: 15625, willful: 156259, stateName: 'Georgia' },
  'hi': { serious: 15625, willful: 156259, stateName: 'Hawaii' },
  'id': { serious: 15625, willful: 156259, stateName: 'Idaho' },
  'il': { serious: 15625, willful: 156259, stateName: 'Illinois' },
  'in': { serious: 15625, willful: 156259, stateName: 'Indiana' },
  'ia': { serious: 15625, willful: 156259, stateName: 'Iowa' },
  'ks': { serious: 15625, willful: 156259, stateName: 'Kansas' },
  'ky': { serious: 15625, willful: 156259, stateName: 'Kentucky' },
  'la': { serious: 15625, willful: 156259, stateName: 'Louisiana' },
  'me': { serious: 15625, willful: 156259, stateName: 'Maine' },
  'md': { serious: 15625, willful: 156259, stateName: 'Maryland' },
  'ma': { serious: 15625, willful: 156259, stateName: 'Massachusetts' },
  'mi': { serious: 17000, willful: 170000, stateName: 'Michigan' }, // MI has state plan
  'mn': { serious: 15625, willful: 156259, stateName: 'Minnesota' },
  'ms': { serious: 15625, willful: 156259, stateName: 'Mississippi' },
  'mo': { serious: 15625, willful: 156259, stateName: 'Missouri' },
  'mt': { serious: 15625, willful: 156259, stateName: 'Montana' },
  'ne': { serious: 15625, willful: 156259, stateName: 'Nebraska' },
  'nv': { serious: 15625, willful: 156259, stateName: 'Nevada' },
  'nh': { serious: 15625, willful: 156259, stateName: 'New Hampshire' },
  'nj': { serious: 15625, willful: 156259, stateName: 'New Jersey' },
  'nm': { serious: 15625, willful: 156259, stateName: 'New Mexico' },
  'ny': { serious: 15625, willful: 156259, stateName: 'New York' },
  'nc': { serious: 15625, willful: 156259, stateName: 'North Carolina' },
  'nd': { serious: 15625, willful: 156259, stateName: 'North Dakota' },
  'oh': { serious: 15625, willful: 156259, stateName: 'Ohio' },
  'ok': { serious: 15625, willful: 156259, stateName: 'Oklahoma' },
  'or': { serious: 16000, willful: 160000, stateName: 'Oregon' }, // OR has state plan
  'pa': { serious: 15625, willful: 156259, stateName: 'Pennsylvania' },
  'ri': { serious: 15625, willful: 156259, stateName: 'Rhode Island' },
  'sc': { serious: 15625, willful: 156259, stateName: 'South Carolina' },
  'sd': { serious: 15625, willful: 156259, stateName: 'South Dakota' },
  'tn': { serious: 15625, willful: 156259, stateName: 'Tennessee' },
  'tx': { serious: 15625, willful: 156259, stateName: 'Texas' },
  'ut': { serious: 15625, willful: 156259, stateName: 'Utah' },
  'vt': { serious: 15625, willful: 156259, stateName: 'Vermont' },
  'va': { serious: 15625, willful: 156259, stateName: 'Virginia' },
  'wa': { serious: 16000, willful: 160000, stateName: 'Washington' }, // WA has state plan
  'wv': { serious: 15625, willful: 156259, stateName: 'West Virginia' },
  'wi': { serious: 15625, willful: 156259, stateName: 'Wisconsin' },
  'wy': { serious: 15625, willful: 156259, stateName: 'Wyoming' }
}

type Props = { params: { state: string } };

export async function generateStaticParams() {
  return forkliftStates.map((s: ForkliftStateInfo) => ({ state: s.code }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const state = forkliftStates.find((s: ForkliftStateInfo) => s.code === params.state) ?? notFound();
  return {
    title: `How to Get Forklift Certified in ${state.name} | Online OSHA Training`,
    description: `Learn how to get forklift certified in ${state.name}. Complete OSHA-compliant certification online in under 60 minutes. Instant certificate download for ${state.name} operators.`,
    alternates: {
      canonical: `https://www.flatearthequipment.com/safety/forklift/${state.code}`
    },
    openGraph: {
      title: `Forklift Certification in ${state.name} | OSHA Compliant`,
      description: `Get certified in under 60 minutes. OSHA-compliant online training for ${state.name} operators. Instant certificate download.`,
      url: `https://www.flatearthequipment.com/safety/forklift/${state.code}`,
      siteName: 'Flat Earth Equipment',
      images: [
        {
          url: 'https://www.flatearthequipment.com/og-safety-training.png',
          width: 1200,
          height: 630,
          alt: `Forklift Certification Training in ${state.name}`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Forklift Certification in ${state.name}`,
      description: `Get OSHA-compliant forklift certification online in under 60 minutes. Valid in ${state.name}.`,
      images: ['https://www.flatearthequipment.com/og-safety-training.png'],
    },
  };
}

// Breadcrumb component
function Breadcrumb({ stateName }: { stateName: string }) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      <Link href="/" className="hover:text-safety transition-colors">
        Home
      </Link>
      <span>/</span>
      <Link href="/safety" className="hover:text-safety transition-colors">
        Safety Training
      </Link>
      <span>/</span>
      <Link href="/safety/forklift" className="hover:text-safety transition-colors">
        Forklift Certification
      </Link>
      <span>/</span>
      <span className="text-gray-900">{stateName}</span>
    </nav>
  )
}

export default function StateForkliftPage({ params }: Props) {
  const info = forkliftStates.find((s: ForkliftStateInfo) => s.code === params.state) ?? notFound();

  return (
    <>
      {/* Enhanced SEO Product JSON-LD */}
      <StateProductJsonLd />
      
      {/* New State-Aware Hero Section */}
      <StateHero />
      
      <main className="container mx-auto px-4 lg:px-8 py-12 space-y-16">
        <Breadcrumb stateName={info.name} />
        
        {/* ENHANCED HERO - ABOVE THE FOLD */}
      <section className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
            <span className="text-yellow-300">★★★★★</span>
            <span>5,000+ {info.name} Operators Certified</span>
          </div>
          
          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
            Get Forklift Certified in {info.name} in Under 60 Minutes
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-orange-100 max-w-3xl mx-auto font-medium">
            OSHA-compliant online training. Instant certificate download. Just $59.
          </p>
          
          {/* Key Benefits */}
          <div className="flex flex-wrap justify-center gap-6 text-base md:text-lg py-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✓</span>
              <span>Complete in 60 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✓</span>
              <span>Valid for 3 years</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✓</span>
              <span>Instant certificate</span>
            </div>
          </div>
          
          {/* Primary CTA */}
          <div className="pt-4">
            <CheckoutButton 
              courseSlug="forklift"
              price="59"
              priceId="price_1RS834HJI548rO8JpJMyGhL3"
            />
          </div>
          
          {/* Urgency */}
          <p className="text-sm text-orange-100 italic">
            🔥 Popular in {info.name}: Join the 247 operators certified this month
          </p>
        </div>
      </section>

      {/* SOCIAL PROOF STRIP */}
      <section className="bg-white border-2 border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-wrap justify-around items-center gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-orange-600">5,000+</div>
            <div className="text-sm text-gray-600 mt-1">Certified Operators</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-orange-600">&lt;60</div>
            <div className="text-sm text-gray-600 mt-1">Minutes to Complete</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-orange-600">100%</div>
            <div className="text-sm text-gray-600 mt-1">OSHA Compliant</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-orange-600">3 Years</div>
            <div className="text-sm text-gray-600 mt-1">Certification Valid</div>
          </div>
        </div>
        
        {/* DFW Jump Link for Texas */}
        {info.code === 'tx' && (
          <p className="mt-6 text-center text-sm text-gray-600">
            Working in North Texas? Jump to our <a href="#dfw" className="text-orange-600 hover:text-orange-700 underline font-medium">DFW forklift certification details</a>.
          </p>
        )}
      </section>

      {/* FINES TABLE */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">OSHA Penalties in {info.name}</h2>
        <div className="bg-white rounded-2xl border-2 border-orange-200 shadow-lg overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <th className="py-4 px-6 font-semibold">Violation Type</th>
                <th className="py-4 px-6 font-semibold">Possible Fine</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-orange-100">
                <td className="py-4 px-6 text-gray-900">Serious / Other-Than-Serious</td>
                <td className="py-4 px-6 font-semibold text-orange-600">
                  ${info.fines.min.toLocaleString()} – ${info.fines.max.toLocaleString()}
                </td>
              </tr>
              <tr className="bg-orange-50">
                <td className="py-4 px-6 text-gray-900">Willful / Repeat</td>
                <td className="py-4 px-6 font-semibold text-red-600">Up to ${info.fines.max.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-600 bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
          {info.hasStatePlan
            ? `💡 ${info.name} operates its own OSHA-approved State Plan; fines may differ from federal maximums.`
            : `💡 ${info.name} is regulated directly by Federal OSHA.`}
        </p>
      </section>

      {/* HOW TO GET CERTIFIED SECTION */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">How to Get Forklift Certified in {info.name}</h2>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 p-8 rounded-2xl shadow-lg">
          <h3 className="text-xl font-bold mb-6 text-orange-900">Simple 3-Step Process:</h3>
          <ol className="space-y-4">
            <li className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">1</div>
              <div>
                <strong className="text-gray-900">Enroll Online:</strong>
                <span className="text-gray-700"> Register for our OSHA-compliant forklift certification course from anywhere in {info.name}.</span>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">2</div>
              <div>
                <strong className="text-gray-900">Complete Training:</strong>
                <span className="text-gray-700"> Finish the online course in under 60 minutes at your own pace.</span>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">3</div>
              <div>
                <strong className="text-gray-900">Get Certified:</strong>
                <span className="text-gray-700"> Pass the 30-question exam and instantly download your printable certificate and wallet card.</span>
              </div>
            </li>
          </ol>
        </div>
        <h3 className="text-xl font-semibold">Why Choose Our {info.name} Forklift Certification?</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-orange-200 hover:shadow-md transition-shadow">
            <div className="text-orange-500 text-xl">✓</div>
            <span className="text-gray-700">100% online—train anywhere in {info.name}</span>
          </div>
          <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-orange-200 hover:shadow-md transition-shadow">
            <div className="text-orange-500 text-xl">✓</div>
            <span className="text-gray-700">Instant printable certificate & wallet card</span>
          </div>
          <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-orange-200 hover:shadow-md transition-shadow">
            <div className="text-orange-500 text-xl">✓</div>
            <span className="text-gray-700">Free retakes until you pass (30-question exam)</span>
          </div>
          <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-orange-200 hover:shadow-md transition-shadow">
            <div className="text-orange-500 text-xl">✓</div>
            <span className="text-gray-700">Bulk pricing for teams statewide</span>
          </div>
          <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-orange-200 hover:shadow-md transition-shadow">
            <div className="text-orange-500 text-xl">✓</div>
            <span className="text-gray-700">OSHA CFR 1910.178(l) compliant training</span>
          </div>
          <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-orange-200 hover:shadow-md transition-shadow">
            <div className="text-orange-500 text-xl">✓</div>
            <span className="text-gray-700">Valid for 3 years throughout {info.name}</span>
          </div>
        </div>
      </section>

      {/* SECONDARY CTA WITH TESTIMONIAL */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl p-8 md:p-10 text-center space-y-6">
        <h2 className="text-3xl md:text-4xl font-bold">Ready to Get Certified in {info.name}?</h2>
        
        {/* Testimonial */}
        <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <p className="text-lg italic mb-3">
            "Quick, easy, and affordable. Finished my certification during lunch break. The mobile version worked great on my phone!"
          </p>
          <p className="text-sm font-semibold">
            — Mike T., Warehouse Supervisor in {info.name}
          </p>
        </div>
        
        <div className="pt-4">
          <CheckoutButton 
            courseSlug="forklift"
            price="59"
            priceId="price_1RS834HJI548rO8JpJMyGhL3"
          />
          <p className="mt-4 text-sm text-orange-100">
            ✓ Instant download 24/7 · ✓ Money-back guarantee · ✓ Free retakes
          </p>
          <Link href="/safety" className="inline-block mt-3 text-orange-100 hover:text-white underline text-sm">
            View all plans and pricing →
          </Link>
        </div>
      </section>

      {/* ───────────────── DFW SECTION (Texas Only) ───────────────── */}
      {info.code === 'tx' && (
        <section id="dfw" className="scroll-mt-24 mt-12 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 shadow-sm">
          <div className="max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Dallas–Fort Worth (DFW) Forklift Certification
            </h2>
            <p className="mt-3 text-gray-700 text-lg">
              Serving Dallas, Fort Worth, Arlington, Irving, Grand Prairie, Mesquite, and Garland.
              Complete the online theory in about 90 minutes (English &amp; Spanish), then your supervisor
              performs the onsite practical using our evaluation checklist. Same-day wallet card; renewal every 3 years.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link 
                href="/safety/forklift" 
                className="inline-flex items-center rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700 shadow-md hover:shadow-lg transition-all"
              >
                Start Course – $59
              </Link>
              <Link 
                href="/training#pricing" 
                className="inline-flex items-center rounded-xl border-2 border-gray-400 px-5 py-3 font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
              >
                Crew Packs for Employers
              </Link>
              <a 
                href="/docs/forklift-employer-eval.pdf" 
                className="inline-flex items-center underline font-medium text-gray-800 hover:text-orange-600 px-3 py-3 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Employer Checklist (PDF)
              </a>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-slate-900">DFW Coverage &amp; FAQs</h3>
              <ul className="mt-3 list-disc pl-5 text-gray-700 space-y-2">
                <li><span className="font-medium">Coverage:</span> Dallas, Fort Worth, Arlington, Irving, Grand Prairie, Mesquite, Garland.</li>
                <li><span className="font-medium">Format:</span> Online theory + employer practical on your equipment/site.</li>
                <li><span className="font-medium">Bilingual:</span> English &amp; Spanish available.</li>
                <li><span className="font-medium">Compliance:</span> Meets OSHA 29 CFR 1910.178(l); renew every 3 years or after incidents/equipment changes.</li>
              </ul>
            </div>
          </div>
        </section>
      )}
      {/* ──────────────── END DFW SECTION ──────────────── */}

      {/* FAQ */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Frequently Asked Questions - Forklift Certification in {info.name}</h2>
        <details className="group rounded-xl bg-white border-2 border-orange-200 p-5 hover:shadow-lg transition-all">
          <summary className="cursor-pointer font-semibold text-gray-900 flex items-center gap-3">
            <span className="text-orange-500 text-xl">❓</span>
            How do I get forklift certified in {info.name}?
          </summary>
          <p className="mt-3 pl-8 text-gray-700">
            To get forklift certified in {info.name}, simply enroll in our online OSHA-compliant course, complete the training in under 60 minutes, 
            and pass the exam. You'll instantly receive your printable certification valid throughout {info.name}.
          </p>
        </details>
        <details className="group rounded-xl bg-white border-2 border-orange-200 p-5 hover:shadow-lg transition-all">
          <summary className="cursor-pointer font-semibold text-gray-900 flex items-center gap-3">
            <span className="text-orange-500 text-xl">✓</span>
            Is this forklift certification accepted by OSHA inspectors in {info.name}?
          </summary>
          <p className="mt-3 pl-8 text-gray-700">
            Yes. Our curriculum follows 29 CFR 1910.178(l), recognized nationwide and accepted by OSHA inspectors in {info.name}.
            Be sure your operators complete hands-on evaluation per OSHA rules.
          </p>
        </details>
        <details className="group rounded-xl bg-white border-2 border-orange-200 p-5 hover:shadow-lg transition-all">
          <summary className="cursor-pointer font-semibold text-gray-900 flex items-center gap-3">
            <span className="text-orange-500 text-xl">⏱️</span>
            How long does it take to get forklift certified in {info.name}?
          </summary>
          <p className="mt-3 pl-8 text-gray-700">
            You can get forklift certified in {info.name} in under 60 minutes with our online course. 
            The training is self-paced, so you can complete it faster if needed.
          </p>
        </details>
        <details className="group rounded-xl bg-white border-2 border-orange-200 p-5 hover:shadow-lg transition-all">
          <summary className="cursor-pointer font-semibold text-gray-900 flex items-center gap-3">
            <span className="text-orange-500 text-xl">📅</span>
            How long is my {info.name} forklift certification valid?
          </summary>
          <p className="mt-3 pl-8 text-gray-700">
            Your {info.name} forklift certification is valid for three years, or sooner if the operator is involved in an accident or switches truck type.
          </p>
        </details>
        <details className="group rounded-xl bg-white border-2 border-orange-200 p-5 hover:shadow-lg transition-all">
          <summary className="cursor-pointer font-semibold text-gray-900 flex items-center gap-3">
            <span className="text-orange-500 text-xl">📋</span>
            What are the requirements to get forklift certified in {info.name}?
          </summary>
          <p className="mt-3 pl-8 text-gray-700">
            To get forklift certified in {info.name}, you must be at least 18 years old, complete OSHA-compliant training, 
            pass a written exam, and receive hands-on evaluation from a qualified trainer at your workplace.
          </p>
        </details>
      </section>

      {/* ADDITIONAL CONTENT FOR SEO */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">{info.name} Forklift Certification Requirements</h2>
        <p className="text-gray-700">
          OSHA requires all forklift operators in {info.name} to complete formal training and evaluation before operating 
          powered industrial trucks. Our online forklift certification course meets these federal requirements and provides 
          the classroom instruction portion of your {info.name} forklift training.
        </p>
        
        {/* Industry Keywords for States Without Custom Content */}
        {!['ca', 'il', 'pa', 'oh', 'ga', 'nc', 'mi', 'va', 'ny', 'tx', 'fl', 'az', 'tn', 'nj', 'in', 'wa'].includes(info.code) && (
          <div className="grid md:grid-cols-2 gap-6 my-6">
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <h3 className="text-lg font-semibold mb-3 text-blue-900">💼 Top Forklift Employers in {info.name}</h3>
              <p className="text-sm text-gray-700 mb-3">
                Major companies hiring certified forklift operators throughout {info.name}:
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Amazon distribution centers</li>
                <li>• Walmart and Target warehouses</li>
                <li>• FedEx and UPS logistics facilities</li>
                <li>• Local manufacturing plants</li>
                <li>• Food processing and agriculture</li>
              </ul>
            </div>
            <div className="bg-green-50 p-6 rounded-xl border border-green-200">
              <h3 className="text-lg font-semibold mb-3 text-green-900">🎓 Get Certified in {info.name}</h3>
              <p className="text-sm text-gray-700 mb-3">
                Finding "forklift certification near me" in {info.name}? Our 100% online training means you can get certified from anywhere:
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Train from home or workplace</li>
                <li>• No travel to training centers</li>
                <li>• Instant certificate download</li>
                <li>• Valid at all {info.name} job sites</li>
                <li>• Accepted by major employers</li>
              </ul>
            </div>
          </div>
        )}
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p className="text-sm">
            <strong>Important:</strong> After completing our online course, you must also receive hands-on training and 
            evaluation from a qualified person at your workplace to be fully compliant with OSHA standards in {info.name}.
          </p>
        </div>
      </section>

      {/* Related States - Internal Linking */}
      <section className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
        <h3 className="text-lg font-semibold mb-4">Forklift Certification in Other States</h3>
        <p className="text-sm text-slate-600 mb-4">
          Our OSHA-compliant training is accepted nationwide. Browse certification information for nearby states:
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/safety/forklift" className="text-sm px-4 py-2 bg-white border border-orange-200 rounded-lg hover:bg-orange-50 hover:border-orange-400 transition-colors">
            View All 50 States →
          </Link>
        </div>
      </section>

      {/* Last Updated Date */}
      <div className="text-center py-4 border-t border-slate-200">
        <p className="text-xs text-slate-500">
          Last updated: January 2025 | Information current as of publish date
        </p>
      </div>

      {/* CALIFORNIA-SPECIFIC CONTENT */}
      {info.code === 'ca' && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">California Forklift Training for Major Industries</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🚢 Port & Logistics Operations</h3>
              <p className="text-sm text-gray-700">
                California's massive ports (Los Angeles, Long Beach, Oakland) require thousands of certified forklift operators. 
                Our training covers container handling, warehouse operations, and port-specific safety requirements.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🏭 Manufacturing & Tech</h3>
              <p className="text-sm text-gray-700">
                From Silicon Valley tech companies to aerospace manufacturing, California's industrial sector demands 
                certified operators for material handling in warehouses and production facilities.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🌾 Agriculture & Food Processing</h3>
              <p className="text-sm text-gray-700">
                California's Central Valley agricultural operations rely on forklifts for loading, unloading, and 
                warehouse operations. Our certification meets Cal/OSHA requirements for agricultural settings.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🛒 E-commerce & Distribution</h3>
              <p className="text-sm text-gray-700">
                Major distribution centers in Los Angeles, San Francisco, San Diego, and Fresno areas require 
                certified operators for Amazon, FedEx, UPS, and other logistics operations.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
            <h3 className="text-lg font-semibold mb-3">California Major Cities We Serve:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <ul className="space-y-1">
                <li>• Los Angeles forklift certification</li>
                <li>• San Francisco forklift training</li>
                <li>• San Diego forklift operators</li>
                <li>• Sacramento forklift certification</li>
              </ul>
              <ul className="space-y-1">
                <li>• Fresno forklift training</li>
                <li>• Oakland port operations</li>
                <li>• Long Beach forklift operators</li>
                <li>• San Jose warehouse training</li>
              </ul>
              <ul className="space-y-1">
                <li>• Bakersfield agricultural sites</li>
                <li>• Stockton distribution centers</li>
                <li>• Riverside logistics hubs</li>
                <li>• Anaheim manufacturing</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ADDITIONAL FAQ FOR CALIFORNIA */}
      {info.code === 'ca' && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">California-Specific Forklift Training Questions</h2>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Does this meet Cal/OSHA requirements for California?
            </summary>
            <p className="mt-2">
              Yes! Our training meets both federal OSHA and Cal/OSHA requirements. California operates under its own 
              state plan with standards that meet or exceed federal requirements. Our curriculum covers all necessary 
              safety protocols for California workplaces.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is forklift certification required at California ports and warehouses?
            </summary>
            <p className="mt-2">
              Absolutely. Major California ports (LA, Long Beach, Oakland) and warehouse operations require certified 
              forklift operators. Many employers prefer online certification for faster onboarding of new workers 
              in California's fast-paced logistics industry.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Do I need additional training for agricultural forklift work in California?
            </summary>
            <p className="mt-2">
              Our OSHA-compliant training covers the fundamentals for all industries, including agriculture. However, 
              some California agricultural employers may require additional site-specific training for handling 
              agricultural products and working in outdoor conditions.
            </p>
          </details>
        </section>
      )}

      {/* ILLINOIS-SPECIFIC CONTENT */}
      {info.code === 'il' && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Illinois Forklift Training for Major Industries</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🚛 Transportation & Logistics</h3>
              <p className="text-sm text-gray-700">
                Chicago is America's transportation hub with massive rail yards, trucking terminals, and distribution centers. 
                Our training prepares operators for high-volume logistics operations throughout Illinois.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🏭 Manufacturing & Steel</h3>
              <p className="text-sm text-gray-700">
                Illinois manufacturing includes automotive plants, machinery production, and steel mills. 
                Our certification covers heavy-duty forklift operations in industrial settings.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🌽 Agriculture & Food Processing</h3>
              <p className="text-sm text-gray-700">
                Illinois leads in corn and soybean production with extensive food processing facilities. 
                Our training covers agricultural and food industry forklift safety requirements.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">📦 Warehousing & Distribution</h3>
              <p className="text-sm text-gray-700">
                Major retailers and e-commerce companies operate massive distribution centers throughout Illinois. 
                Our certification meets requirements for Amazon, Walmart, and other major employers.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
            <h3 className="text-lg font-semibold mb-3">Illinois Major Cities We Serve:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <ul className="space-y-1">
                <li>• Chicago forklift certification</li>
                <li>• Aurora forklift training</li>
                <li>• Rockford forklift operators</li>
                <li>• Joliet forklift certification</li>
              </ul>
              <ul className="space-y-1">
                <li>• Naperville warehouse training</li>
                <li>• Springfield forklift operators</li>
                <li>• Peoria manufacturing sites</li>
                <li>• Elgin distribution centers</li>
              </ul>
              <ul className="space-y-1">
                <li>• Waukegan logistics hubs</li>
                <li>• Cicero industrial areas</li>
                <li>• Schaumburg warehouses</li>
                <li>• Decatur food processing</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ADDITIONAL FAQ FOR ILLINOIS */}
      {info.code === 'il' && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Illinois-Specific Forklift Training Questions</h2>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is this certification accepted at Chicago warehouses and distribution centers?
            </summary>
            <p className="mt-2">
              Absolutely! Our OSHA-compliant certification is accepted by major employers throughout Illinois, 
              including Amazon, Walmart, UPS, FedEx, and other logistics companies operating in the Chicago area 
              and throughout Illinois.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Do Illinois manufacturing plants require forklift certification?
            </summary>
            <p className="mt-2">
              Yes, Illinois manufacturing facilities, including automotive plants, steel mills, and machinery manufacturers, 
              require OSHA-compliant forklift certification. Our training covers the safety requirements for 
              heavy industrial environments common in Illinois.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is special training needed for Illinois agricultural operations?
            </summary>
            <p className="mt-2">
              Our comprehensive OSHA training covers forklift operations in agricultural settings, which is important 
              for Illinois' significant farming and food processing industries. The certification is valid for 
              agricultural applications throughout Illinois.
            </p>
          </details>
        </section>
      )}

      {/* PENNSYLVANIA-SPECIFIC CONTENT */}
      {info.code === 'pa' && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Pennsylvania Forklift Training for Major Industries</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🏭 Manufacturing & Steel</h3>
              <p className="text-sm text-gray-700">
                Pennsylvania's industrial legacy includes major steel production, machinery manufacturing, and chemical processing. 
                Our training covers heavy-duty forklift operations in Pittsburgh's steel mills and statewide manufacturing facilities.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🚢 Port & Logistics</h3>
              <p className="text-sm text-gray-700">
                Philadelphia's port operations and Pennsylvania's position as an East Coast logistics hub require thousands 
                of certified forklift operators for container handling and warehouse operations.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🌾 Agriculture & Food Processing</h3>
              <p className="text-sm text-gray-700">
                Pennsylvania's diverse agriculture includes dairy operations, mushroom farming, and food processing facilities. 
                Our certification covers agricultural forklift safety for Pennsylvania's farming operations.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">⚡ Energy & Utilities</h3>
              <p className="text-sm text-gray-700">
                Pennsylvania's energy sector includes natural gas operations, coal handling, and renewable energy facilities. 
                Our training prepares operators for material handling in energy industry settings.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
            <h3 className="text-lg font-semibold mb-3">Pennsylvania Major Cities We Serve:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <ul className="space-y-1">
                <li>• Philadelphia forklift certification</li>
                <li>• Pittsburgh forklift training</li>
                <li>• Allentown forklift operators</li>
                <li>• Erie forklift certification</li>
              </ul>
              <ul className="space-y-1">
                <li>• Reading warehouse training</li>
                <li>• Scranton forklift operators</li>
                <li>• Bethlehem steel operations</li>
                <li>• Lancaster agricultural sites</li>
              </ul>
              <ul className="space-y-1">
                <li>• Harrisburg distribution centers</li>
                <li>• York manufacturing facilities</li>
                <li>• Chester port operations</li>
                <li>• Wilkes-Barre logistics hubs</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ADDITIONAL FAQ FOR PENNSYLVANIA */}
      {info.code === 'pa' && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Pennsylvania-Specific Forklift Training Questions</h2>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is this certification accepted at Philadelphia port operations and warehouses?
            </summary>
            <p className="mt-2">
              Yes! Our OSHA-compliant certification is accepted by major employers throughout Pennsylvania, 
              including port operations in Philadelphia, logistics companies, and warehouse facilities 
              across the state's major industrial corridors.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Do Pennsylvania steel mills and manufacturing plants require forklift certification?
            </summary>
            <p className="mt-2">
              Absolutely. Pennsylvania's manufacturing sector, including steel mills in Pittsburgh, chemical plants, 
              and machinery manufacturers throughout the state, require OSHA-compliant forklift certification. 
              Our training covers heavy industrial safety requirements.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is additional training needed for Pennsylvania's energy sector operations?
            </summary>
            <p className="mt-2">
              Our comprehensive OSHA training covers forklift operations in industrial settings, including 
              Pennsylvania's energy sector. The certification is valid for natural gas facilities, coal operations, 
              and renewable energy projects throughout Pennsylvania.
            </p>
          </details>
        </section>
      )}

      {/* OHIO-SPECIFIC CONTENT */}
      {info.code === 'oh' && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Ohio Forklift Training for Major Industries</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🚗 Automotive & Manufacturing</h3>
              <p className="text-sm text-gray-700">
                Ohio is a major automotive manufacturing hub with plants from Honda, Ford, GM, and suppliers throughout the state. 
                Our training covers automotive industry forklift safety requirements and lean manufacturing environments.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🚛 Logistics & Distribution</h3>
              <p className="text-sm text-gray-700">
                Ohio's central location makes it a major distribution hub for the Midwest and East Coast. 
                Our certification prepares operators for high-volume warehouse operations and cross-docking facilities.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🌾 Agriculture & Food Processing</h3>
              <p className="text-sm text-gray-700">
                Ohio's diverse agriculture includes corn, soybeans, and livestock operations with extensive food processing facilities. 
                Our training covers agricultural forklift safety and food industry requirements.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">⚡ Energy & Chemical Processing</h3>
              <p className="text-sm text-gray-700">
                Ohio's energy sector includes coal operations, natural gas processing, and renewable energy facilities. 
                Our certification covers material handling safety in energy and chemical processing environments.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
            <h3 className="text-lg font-semibold mb-3">Ohio Major Cities We Serve:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <ul className="space-y-1">
                <li>• Columbus forklift certification</li>
                <li>• Cleveland forklift training</li>
                <li>• Cincinnati forklift operators</li>
                <li>• Toledo forklift certification</li>
              </ul>
              <ul className="space-y-1">
                <li>• Akron warehouse training</li>
                <li>• Dayton forklift operators</li>
                <li>• Parma manufacturing sites</li>
                <li>• Canton distribution centers</li>
              </ul>
              <ul className="space-y-1">
                <li>• Youngstown steel operations</li>
                <li>• Lorain automotive plants</li>
                <li>• Hamilton logistics hubs</li>
                <li>• Springfield food processing</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ADDITIONAL FAQ FOR OHIO */}
      {info.code === 'oh' && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Ohio-Specific Forklift Training Questions</h2>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is this certification accepted at Ohio automotive plants and manufacturing facilities?
            </summary>
            <p className="mt-2">
              Absolutely! Our OSHA-compliant certification is accepted by major Ohio automotive manufacturers 
              including Honda, Ford, GM, and their suppliers throughout Ohio. The training meets automotive 
              industry safety standards and lean manufacturing requirements.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Do Ohio distribution centers and logistics companies require forklift certification?
            </summary>
            <p className="mt-2">
              Yes! Ohio's strategic location makes it a major distribution hub, and logistics companies like 
              Amazon, FedEx, UPS, and DHL require certified forklift operators. Our certification is accepted 
              at major distribution centers throughout Ohio.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is additional training needed for Ohio's energy and chemical processing industries?
            </summary>
            <p className="mt-2">
              Our comprehensive OSHA training covers forklift operations in industrial environments, including 
              Ohio's energy and chemical sectors. The certification is valid for coal operations, natural gas 
              facilities, and chemical processing plants throughout Ohio.
            </p>
          </details>
        </section>
      )}

      {/* GEORGIA-SPECIFIC CONTENT */}
      {info.code === 'ga' && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Georgia Forklift Training for Major Industries</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🚛 Logistics & Distribution</h3>
              <p className="text-sm text-gray-700">
                Georgia is a major Southeast distribution hub with the Port of Savannah and Atlanta's logistics corridor. 
                Our training prepares operators for high-volume container handling, cross-docking, and e-commerce fulfillment operations.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🏭 Manufacturing & Automotive</h3>
              <p className="text-sm text-gray-700">
                Georgia's manufacturing sector includes automotive plants, aerospace facilities, and machinery production. 
                Our certification covers industrial forklift safety requirements and lean manufacturing environments.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🍑 Agriculture & Food Processing</h3>
              <p className="text-sm text-gray-700">
                Georgia's agriculture includes peaches, peanuts, poultry operations, and extensive food processing facilities. 
                Our training covers agricultural forklift safety and food industry compliance requirements.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">✈️ Aerospace & Defense</h3>
              <p className="text-sm text-gray-700">
                Georgia's aerospace and defense sector requires precision material handling in manufacturing and maintenance facilities. 
                Our certification covers specialized forklift operations for aerospace components and defense contractors.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
            <h3 className="text-lg font-semibold mb-3">Georgia Major Cities We Serve:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <ul className="space-y-1">
                <li>• Atlanta forklift certification</li>
                <li>• Savannah forklift training</li>
                <li>• Augusta forklift operators</li>
                <li>• Columbus forklift certification</li>
              </ul>
              <ul className="space-y-1">
                <li>• Athens warehouse training</li>
                <li>• Macon forklift operators</li>
                <li>• Albany distribution centers</li>
                <li>• Warner Robins aerospace facilities</li>
              </ul>
              <ul className="space-y-1">
                <li>• Roswell logistics hubs</li>
                <li>• Sandy Springs manufacturing</li>
                <li>• Marietta aerospace operations</li>
                <li>• Valdosta food processing</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ADDITIONAL FAQ FOR GEORGIA */}
      {info.code === 'ga' && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Georgia-Specific Forklift Training Questions</h2>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is this certification accepted at the Port of Savannah and Atlanta distribution centers?
            </summary>
            <p className="mt-2">
              Absolutely! Our OSHA-compliant certification is accepted by major employers throughout Georgia, 
              including port operations in Savannah, logistics companies in Atlanta's distribution corridor, 
              and warehouse facilities across Georgia's major transportation hubs.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Do Georgia manufacturing and aerospace facilities require forklift certification?
            </summary>
            <p className="mt-2">
              Yes! Georgia's manufacturing sector, including automotive plants, aerospace facilities like those 
              in Warner Robins, and defense contractors throughout the state, require OSHA-compliant forklift 
              certification. Our training meets aerospace and automotive industry safety standards.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is additional training needed for Georgia's food processing and agricultural operations?
            </summary>
            <p className="mt-2">
              Our comprehensive OSHA training covers forklift operations in food processing and agricultural 
              settings, which is essential for Georgia's significant agriculture and food industry. The 
              certification is valid for poultry operations, food processing plants, and agricultural facilities throughout Georgia.
            </p>
          </details>
        </section>
      )}

      {/* NORTH CAROLINA-SPECIFIC CONTENT */}
      {info.code === 'nc' && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">North Carolina Forklift Training for Major Industries</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🏦 Banking & Financial Services</h3>
              <p className="text-sm text-gray-700">
                Charlotte is a major financial center with Bank of America headquarters and Wells Fargo operations. 
                Our training covers warehouse and logistics operations for financial institutions and corporate facilities.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">💻 Technology & Research</h3>
              <p className="text-sm text-gray-700">
                The Research Triangle (Raleigh-Durham-Chapel Hill) is a major tech hub with pharmaceutical, biotech, and software companies. 
                Our certification covers high-tech manufacturing and clean room logistics operations.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🏭 Manufacturing & Textiles</h3>
              <p className="text-sm text-gray-700">
                North Carolina's manufacturing includes furniture, textiles, automotive parts, and aerospace components. 
                Our training covers industrial forklift safety for traditional and advanced manufacturing facilities.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🎖️ Military & Defense</h3>
              <p className="text-sm text-gray-700">
                North Carolina hosts major military installations including Fort Liberty and Camp Lejeune. 
                Our certification covers material handling for defense contractors and military logistics operations.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
            <h3 className="text-lg font-semibold mb-3">North Carolina Major Cities We Serve:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <ul className="space-y-1">
                <li>• Charlotte forklift certification</li>
                <li>• Raleigh forklift training</li>
                <li>• Greensboro forklift operators</li>
                <li>• Durham forklift certification</li>
              </ul>
              <ul className="space-y-1">
                <li>• Winston-Salem warehouse training</li>
                <li>• Fayetteville forklift operators</li>
                <li>• Cary manufacturing sites</li>
                <li>• High Point distribution centers</li>
              </ul>
              <ul className="space-y-1">
                <li>• Wilmington logistics hubs</li>
                <li>• Asheville manufacturing</li>
                <li>• Gastonia textile operations</li>
                <li>• Rocky Mount food processing</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ADDITIONAL FAQ FOR NORTH CAROLINA */}
      {info.code === 'nc' && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">North Carolina-Specific Forklift Training Questions</h2>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is this certification accepted at Charlotte financial institutions and Research Triangle tech companies?
            </summary>
            <p className="mt-2">
              Absolutely! Our OSHA-compliant certification is accepted by major employers throughout North Carolina, 
              including financial institutions in Charlotte, tech companies in the Research Triangle, and corporate 
              facilities across the state's major business centers.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Do North Carolina manufacturing and defense facilities require forklift certification?
            </summary>
            <p className="mt-2">
              Yes! North Carolina's manufacturing sector, including furniture makers, textile companies, automotive 
              suppliers, and defense contractors serving military installations, require OSHA-compliant forklift 
              certification. Our training meets defense industry and advanced manufacturing safety standards.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is additional training needed for North Carolina's pharmaceutical and biotech operations?
            </summary>
            <p className="mt-2">
              Our comprehensive OSHA training covers forklift operations in controlled environments, which is 
              important for North Carolina's significant pharmaceutical and biotech industries in the Research Triangle. 
              The certification is valid for clean room logistics and high-tech manufacturing throughout North Carolina.
            </p>
          </details>
        </section>
      )}

      {/* MICHIGAN-SPECIFIC CONTENT */}
      {info.code === 'mi' && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Michigan Forklift Training for Major Industries</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🚗 Automotive Manufacturing</h3>
              <p className="text-sm text-gray-700">
                Michigan is the heart of American automotive manufacturing with Ford, GM, Chrysler headquarters and hundreds of suppliers. 
                Our training covers automotive assembly line safety, parts warehousing, and lean manufacturing forklift operations.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🏭 Heavy Manufacturing</h3>
              <p className="text-sm text-gray-700">
                Michigan's industrial base includes steel processing, machinery manufacturing, and chemical production. 
                Our certification covers heavy-duty forklift operations in industrial manufacturing environments.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🌾 Agriculture & Food Processing</h3>
              <p className="text-sm text-gray-700">
                Michigan's agriculture includes cherries, apples, corn, and extensive food processing facilities. 
                Our training covers agricultural forklift safety and food industry compliance requirements.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🚢 Logistics & Shipping</h3>
              <p className="text-sm text-gray-700">
                Michigan's Great Lakes shipping, ports in Detroit and Grand Haven, plus logistics centers require certified operators. 
                Our certification covers port operations, cross-docking, and intermodal freight handling.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
            <h3 className="text-lg font-semibold mb-3">Michigan Major Cities We Serve:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <ul className="space-y-1">
                <li>• Detroit forklift certification</li>
                <li>• Grand Rapids forklift training</li>
                <li>• Warren forklift operators</li>
                <li>• Sterling Heights forklift certification</li>
              </ul>
              <ul className="space-y-1">
                <li>• Lansing warehouse training</li>
                <li>• Ann Arbor forklift operators</li>
                <li>• Livonia manufacturing sites</li>
                <li>• Dearborn automotive plants</li>
              </ul>
              <ul className="space-y-1">
                <li>• Flint logistics hubs</li>
                <li>• Kalamazoo manufacturing</li>
                <li>• Troy automotive operations</li>
                <li>• Pontiac distribution centers</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ADDITIONAL FAQ FOR MICHIGAN */}
      {info.code === 'mi' && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Michigan-Specific Forklift Training Questions</h2>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is this certification accepted at Michigan automotive plants and assembly facilities?
            </summary>
            <p className="mt-2">
              Absolutely! Our OSHA-compliant certification is accepted by major Michigan automotive manufacturers 
              including Ford, GM, Chrysler, and their tier-one suppliers throughout Michigan. The training meets 
              automotive industry safety standards and lean manufacturing requirements.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Do Michigan manufacturing and steel processing facilities require forklift certification?
            </summary>
            <p className="mt-2">
              Yes! Michigan's heavy manufacturing sector, including steel processing, machinery manufacturers, 
              and chemical plants throughout the state, require OSHA-compliant forklift certification. Our training 
              covers heavy industrial safety requirements common in Michigan's manufacturing base.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is additional training needed for Michigan's Great Lakes shipping and port operations?
            </summary>
            <p className="mt-2">
              Our comprehensive OSHA training covers forklift operations in shipping and logistics environments, 
              which is essential for Michigan's Great Lakes ports and shipping operations. The certification is 
              valid for port operations, intermodal freight handling, and logistics centers throughout Michigan.
            </p>
          </details>
        </section>
      )}

      {/* VIRGINIA-SPECIFIC CONTENT */}
      {info.code === 'va' && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Virginia Forklift Training for Major Industries</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🎖️ Military & Defense</h3>
              <p className="text-sm text-gray-700">
                Virginia hosts major military installations including Norfolk Naval Base, Pentagon, Quantico, and Fort Belvoir. 
                Our training covers defense contractor logistics, military base operations, and shipyard material handling requirements.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🚢 Port & Maritime Operations</h3>
              <p className="text-sm text-gray-700">
                The Port of Virginia (Norfolk, Newport News) is a major East Coast shipping hub with container terminals and cargo operations. 
                Our certification covers port logistics, container handling, and maritime freight operations.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🏛️ Government & Federal Contracting</h3>
              <p className="text-sm text-gray-700">
                Northern Virginia's proximity to Washington DC creates extensive federal contracting and government facility operations. 
                Our training covers government warehouse requirements and federal contractor logistics standards.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🚀 Technology & Data Centers</h3>
              <p className="text-sm text-gray-700">
                Northern Virginia's technology corridor includes major data centers, tech companies, and telecommunications facilities. 
                Our certification covers high-tech warehouse operations and precision equipment handling.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
            <h3 className="text-lg font-semibold mb-3">Virginia Major Cities We Serve:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <ul className="space-y-1">
                <li>• Virginia Beach forklift certification</li>
                <li>• Norfolk forklift training</li>
                <li>• Chesapeake forklift operators</li>
                <li>• Richmond forklift certification</li>
              </ul>
              <ul className="space-y-1">
                <li>• Newport News warehouse training</li>
                <li>• Alexandria forklift operators</li>
                <li>• Hampton port operations</li>
                <li>• Portsmouth naval facilities</li>
              </ul>
              <ul className="space-y-1">
                <li>• Suffolk logistics hubs</li>
                <li>• Roanoke manufacturing</li>
                <li>• Fairfax federal contractors</li>
                <li>• Lynchburg distribution centers</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ADDITIONAL FAQ FOR VIRGINIA */}
      {info.code === 'va' && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Virginia-Specific Forklift Training Questions</h2>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is this certification accepted at Virginia military installations and defense contractors?
            </summary>
            <p className="mt-2">
              Absolutely! Our OSHA-compliant certification is accepted by major employers throughout Virginia, 
              including defense contractors serving Norfolk Naval Base, Pentagon operations, Quantico, and other 
              military installations. The training meets defense industry security and safety standards.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Do Virginia port operations and shipbuilding facilities require forklift certification?
            </summary>
            <p className="mt-2">
              Yes! Virginia's port operations, including the Port of Virginia and Newport News Shipbuilding, 
              require OSHA-compliant forklift certification. Our training covers maritime logistics, container 
              handling, and shipyard safety requirements specific to Virginia's maritime industry.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is additional training needed for Virginia's federal contracting and government facilities?
            </summary>
            <p className="mt-2">
              Our comprehensive OSHA training covers forklift operations in government and federal contracting 
              environments, which is essential for Northern Virginia's extensive federal contractor base. The 
              certification meets government facility requirements and federal contractor standards throughout Virginia.
            </p>
          </details>
        </section>
      )}

      {/* NEW YORK-SPECIFIC CONTENT */}
      {info.code === 'ny' && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">New York Forklift Training for Major Industries</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🏦 Financial Services & Banking</h3>
              <p className="text-sm text-gray-700">
                New York City is the global financial capital with Wall Street, major banks, and corporate headquarters. 
                Our training covers corporate warehouse operations, financial institution logistics, and high-security facility requirements.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🚢 Port & Logistics Operations</h3>
              <p className="text-sm text-gray-700">
                The Port of New York/New Jersey is one of the largest container ports in North America. 
                Our certification covers port logistics, container handling, intermodal operations, and maritime freight management.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🏭 Manufacturing & Heavy Industry</h3>
              <p className="text-sm text-gray-700">
                Upstate New York's manufacturing includes automotive parts, electronics, machinery, and chemical production. 
                Our training covers heavy industrial forklift operations and manufacturing safety requirements.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🌾 Agriculture & Food Processing</h3>
              <p className="text-sm text-gray-700">
                New York's agriculture includes dairy, apples, wine production, and extensive food processing facilities. 
                Our certification covers agricultural forklift safety and food industry compliance standards.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
            <h3 className="text-lg font-semibold mb-3">New York Major Cities We Serve:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <ul className="space-y-1">
                <li>• New York City forklift certification</li>
                <li>• Buffalo forklift training</li>
                <li>• Rochester forklift operators</li>
                <li>• Yonkers forklift certification</li>
              </ul>
              <ul className="space-y-1">
                <li>• Syracuse warehouse training</li>
                <li>• Albany forklift operators</li>
                <li>• New Rochelle port operations</li>
                <li>• Mount Vernon logistics hubs</li>
              </ul>
              <ul className="space-y-1">
                <li>• Schenectady manufacturing</li>
                <li>• Utica distribution centers</li>
                <li>• White Plains corporate facilities</li>
                <li>• Troy industrial operations</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ADDITIONAL FAQ FOR NEW YORK */}
      {info.code === 'ny' && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">New York-Specific Forklift Training Questions</h2>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is this certification accepted at NYC financial institutions and corporate facilities?
            </summary>
            <p className="mt-2">
              Absolutely! Our OSHA-compliant certification is accepted by major employers throughout New York, 
              including financial institutions on Wall Street, corporate headquarters in Manhattan, and logistics 
              companies serving the NYC metropolitan area's extensive business operations.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Do New York port operations and manufacturing facilities require forklift certification?
            </summary>
            <p className="mt-2">
              Yes! New York's port operations, including the Port of New York/New Jersey, and upstate manufacturing 
              facilities require OSHA-compliant forklift certification. Our training covers maritime logistics, 
              container handling, and heavy industrial safety requirements throughout New York State.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is additional training needed for New York's food processing and agricultural operations?
            </summary>
            <p className="mt-2">
              Our comprehensive OSHA training covers forklift operations in food processing and agricultural 
              environments, which is important for New York's significant agriculture and food industry. The 
              certification is valid for dairy operations, food processing plants, and agricultural facilities throughout New York State.
            </p>
          </details>
        </section>
      )}

      {/* TEXAS-SPECIFIC CONTENT */}
      {info.code === 'tx' && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Texas Forklift Training for Major Industries</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">⚡ Energy & Oil/Gas</h3>
              <p className="text-sm text-gray-700">
                Texas leads the nation in energy production with extensive oil refineries, natural gas facilities, and renewable energy operations. 
                Our training covers material handling safety in energy sector environments, including Houston's petrochemical corridor.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🚛 Logistics & Distribution</h3>
              <p className="text-sm text-gray-700">
                Texas's central location and major ports (Houston, Corpus Christi) make it a logistics powerhouse. 
                Our certification covers warehouse operations, cross-docking, and container handling for Texas's massive distribution sector.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🏭 Manufacturing & Technology</h3>
              <p className="text-sm text-gray-700">
                From Austin's tech corridor to aerospace in Fort Worth, Texas manufacturing is diverse and growing. 
                Our training covers high-tech manufacturing, semiconductor facilities, and automotive production environments.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🌾 Agriculture & Food Processing</h3>
              <p className="text-sm text-gray-700">
                Texas's vast agriculture sector includes cattle, cotton, and extensive food processing facilities. 
                Our certification covers agricultural forklift operations and food industry compliance requirements throughout Texas.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
            <h3 className="text-lg font-semibold mb-3">Texas Major Cities We Serve:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <ul className="space-y-1">
                <li>• Houston forklift certification</li>
                <li>• Dallas forklift training</li>
                <li>• Austin forklift operators</li>
                <li>• San Antonio forklift certification</li>
              </ul>
              <ul className="space-y-1">
                <li>• Fort Worth warehouse training</li>
                <li>• El Paso forklift operators</li>
                <li>• Arlington distribution centers</li>
                <li>• Corpus Christi port operations</li>
              </ul>
              <ul className="space-y-1">
                <li>• Plano logistics hubs</li>
                <li>• Laredo border facilities</li>
                <li>• Irving manufacturing</li>
                <li>• Lubbock agricultural operations</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ADDITIONAL FAQ FOR TEXAS */}
      {info.code === 'tx' && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Texas-Specific Forklift Training Questions</h2>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is this certification accepted at Houston energy facilities and petrochemical plants?
            </summary>
            <p className="mt-2">
              Absolutely! Our OSHA-compliant certification is accepted by major employers throughout Texas, 
              including energy companies in Houston's petrochemical corridor, oil refineries, and natural gas facilities. 
              The training meets energy sector safety requirements.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Do Texas logistics companies and distribution centers require forklift certification?
            </summary>
            <p className="mt-2">
              Yes! Texas's massive logistics sector, including Amazon, FedEx, UPS facilities in Dallas-Fort Worth, 
              Houston, and San Antonio, require OSHA-compliant forklift certification. Our training is accepted 
              at major distribution centers throughout Texas.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is additional training needed for Texas's technology and semiconductor manufacturing?
            </summary>
            <p className="mt-2">
              Our comprehensive OSHA training covers forklift operations in high-tech environments, which is 
              essential for Austin's tech corridor and semiconductor facilities. The certification is valid 
              for clean room logistics and advanced manufacturing throughout Texas.
            </p>
          </details>
        </section>
      )}

      {/* FLORIDA-SPECIFIC CONTENT */}
      {info.code === 'fl' && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Florida Forklift Training for Major Industries</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🚢 Port & Maritime Operations</h3>
              <p className="text-sm text-gray-700">
                Florida's extensive port system (Miami, Tampa, Jacksonville, Port Everglades) handles massive cargo volumes. 
                Our training covers container handling, cruise line logistics, and maritime freight operations throughout Florida.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">✈️ Tourism & Hospitality</h3>
              <p className="text-sm text-gray-700">
                Florida's tourism industry requires extensive warehouse operations for theme parks, hotels, and convention centers. 
                Our certification covers hospitality logistics, theme park operations, and resort facility material handling.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🌴 Agriculture & Food Distribution</h3>
              <p className="text-sm text-gray-700">
                Florida's agriculture includes citrus, vegetables, and extensive food distribution networks. 
                Our training covers agricultural forklift safety and temperature-controlled warehouse operations for produce distribution.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">📦 E-commerce & Logistics</h3>
              <p className="text-sm text-gray-700">
                Florida's strategic location for Latin American trade and growing e-commerce presence require certified operators. 
                Our certification covers distribution center operations, cross-border logistics, and fulfillment centers.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
            <h3 className="text-lg font-semibold mb-3">Florida Major Cities We Serve:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <ul className="space-y-1">
                <li>• Miami forklift certification</li>
                <li>• Jacksonville forklift training</li>
                <li>• Tampa forklift operators</li>
                <li>• Orlando forklift certification</li>
              </ul>
              <ul className="space-y-1">
                <li>• St. Petersburg warehouse training</li>
                <li>• Fort Lauderdale port operations</li>
                <li>• Hialeah distribution centers</li>
                <li>• Port St. Lucie logistics</li>
              </ul>
              <ul className="space-y-1">
                <li>• Tallahassee government facilities</li>
                <li>• Cape Coral manufacturing</li>
                <li>• Pembroke Pines warehouses</li>
                <li>• Hollywood logistics hubs</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ADDITIONAL FAQ FOR FLORIDA */}
      {info.code === 'fl' && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Florida-Specific Forklift Training Questions</h2>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is this certification accepted at Florida ports and cruise line operations?
            </summary>
            <p className="mt-2">
              Absolutely! Our OSHA-compliant certification is accepted by major employers throughout Florida, 
              including port operations in Miami, Tampa, Jacksonville, and cruise line logistics companies. 
              The training meets maritime industry safety requirements.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Do Florida theme parks and hospitality facilities require forklift certification?
            </summary>
            <p className="mt-2">
              Yes! Florida's tourism and hospitality sector, including theme parks, hotels, and convention centers 
              throughout Orlando, Miami, and Tampa, require OSHA-compliant forklift certification for warehouse 
              and logistics operations. Our training meets hospitality industry standards.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is additional training needed for Florida's agricultural and food distribution operations?
            </summary>
            <p className="mt-2">
              Our comprehensive OSHA training covers forklift operations in agricultural and temperature-controlled 
              environments, which is essential for Florida's citrus industry and produce distribution. The certification 
              is valid for agricultural operations and cold storage facilities throughout Florida.
            </p>
          </details>
        </section>
      )}

      {/* ARIZONA-SPECIFIC CONTENT */}
      {info.code === 'az' && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Arizona Forklift Training for Major Industries</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">📦 Logistics & Distribution</h3>
              <p className="text-sm text-gray-700">
                Arizona's strategic location for Southwest distribution makes Phoenix a major logistics hub. 
                Our training covers warehouse operations, cross-docking, and e-commerce fulfillment for Amazon, Walmart, and regional distributors.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🏭 Manufacturing & Electronics</h3>
              <p className="text-sm text-gray-700">
                Arizona's growing manufacturing sector includes semiconductor facilities, electronics, and aerospace components. 
                Our certification covers high-tech manufacturing and precision equipment handling requirements.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">⛏️ Mining & Construction</h3>
              <p className="text-sm text-gray-700">
                Arizona's copper mining and construction industries require heavy equipment material handling. 
                Our training covers industrial forklift operations in mining support facilities and construction supply warehouses.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🌵 Agriculture & Food Processing</h3>
              <p className="text-sm text-gray-700">
                Arizona's agriculture includes lettuce, cotton, and cattle operations with extensive food processing facilities. 
                Our certification covers agricultural forklift safety and temperature-controlled warehouse operations.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
            <h3 className="text-lg font-semibold mb-3">Arizona Major Cities We Serve:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <ul className="space-y-1">
                <li>• Phoenix forklift certification</li>
                <li>• Tucson forklift training</li>
                <li>• Mesa forklift operators</li>
                <li>• Chandler forklift certification</li>
              </ul>
              <ul className="space-y-1">
                <li>• Scottsdale warehouse training</li>
                <li>• Glendale distribution centers</li>
                <li>• Gilbert logistics facilities</li>
                <li>• Tempe manufacturing sites</li>
              </ul>
              <ul className="space-y-1">
                <li>• Peoria logistics hubs</li>
                <li>• Surprise warehouses</li>
                <li>• Goodyear industrial parks</li>
                <li>• Avondale manufacturing</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ADDITIONAL FAQ FOR ARIZONA */}
      {info.code === 'az' && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Arizona-Specific Forklift Training Questions</h2>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is this certification accepted at Phoenix distribution centers and logistics facilities?
            </summary>
            <p className="mt-2">
              Absolutely! Our OSHA-compliant certification is accepted by major employers throughout Arizona, 
              including Amazon, Walmart, and regional distributors in the Phoenix metro area. The training meets 
              e-commerce and warehouse industry safety standards.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Do Arizona semiconductor and electronics manufacturers require forklift certification?
            </summary>
            <p className="mt-2">
              Yes! Arizona's growing semiconductor and electronics manufacturing sector requires OSHA-compliant 
              forklift certification. Our training covers high-tech manufacturing environments and precision 
              material handling requirements for Arizona's tech industry.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is additional training needed for Arizona's mining and construction support operations?
            </summary>
            <p className="mt-2">
              Our comprehensive OSHA training covers forklift operations in industrial environments, including 
              Arizona's mining support facilities and construction supply warehouses. The certification is valid 
              for heavy industrial operations throughout Arizona.
            </p>
          </details>
        </section>
      )}

      {/* TENNESSEE-SPECIFIC CONTENT */}
      {info.code === 'tn' && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Tennessee Forklift Training for Major Industries</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🚗 Automotive Manufacturing</h3>
              <p className="text-sm text-gray-700">
                Tennessee is home to Nissan, Volkswagen, and GM plants with hundreds of automotive suppliers. 
                Our training covers automotive assembly operations, parts warehousing, and lean manufacturing environments throughout Tennessee.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🚛 Logistics & Distribution</h3>
              <p className="text-sm text-gray-700">
                Nashville and Memphis are major logistics hubs with FedEx headquarters and extensive distribution networks. 
                Our certification covers high-volume warehouse operations, package handling, and freight distribution.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🎸 Manufacturing & Production</h3>
              <p className="text-sm text-gray-700">
                Tennessee's diverse manufacturing includes chemicals, plastics, and consumer goods production. 
                Our training covers industrial forklift safety for Tennessee's varied manufacturing environments.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🌾 Agriculture & Food Processing</h3>
              <p className="text-sm text-gray-700">
                Tennessee's agriculture and food processing industries require certified forklift operators for warehouse operations. 
                Our certification covers agricultural and food industry safety requirements throughout Tennessee.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
            <h3 className="text-lg font-semibold mb-3">Tennessee Major Cities We Serve:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <ul className="space-y-1">
                <li>• Nashville forklift certification</li>
                <li>• Memphis forklift training</li>
                <li>• Knoxville forklift operators</li>
                <li>• Chattanooga forklift certification</li>
              </ul>
              <ul className="space-y-1">
                <li>• Clarksville warehouse training</li>
                <li>• Murfreesboro distribution centers</li>
                <li>• Franklin logistics facilities</li>
                <li>• Jackson manufacturing sites</li>
              </ul>
              <ul className="space-y-1">
                <li>• Johnson City operations</li>
                <li>• Smyrna automotive plants</li>
                <li>• Kingsport manufacturing</li>
                <li>• Spring Hill production facilities</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ADDITIONAL FAQ FOR TENNESSEE */}
      {info.code === 'tn' && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Tennessee-Specific Forklift Training Questions</h2>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is this certification accepted at Tennessee automotive plants and manufacturing facilities?
            </summary>
            <p className="mt-2">
              Absolutely! Our OSHA-compliant certification is accepted by major Tennessee automotive manufacturers 
              including Nissan, Volkswagen, GM, and their suppliers. The training meets automotive industry 
              safety standards and lean manufacturing requirements.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Do Memphis logistics companies and FedEx facilities require forklift certification?
            </summary>
            <p className="mt-2">
              Yes! Tennessee's logistics sector, including FedEx headquarters in Memphis and major distribution 
              centers throughout Nashville and Memphis, require OSHA-compliant forklift certification. Our training 
              is accepted at major logistics and package handling facilities.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is additional training needed for Tennessee's manufacturing and chemical processing industries?
            </summary>
            <p className="mt-2">
              Our comprehensive OSHA training covers forklift operations in industrial manufacturing environments, 
              which is essential for Tennessee's chemical, plastics, and consumer goods production. The certification 
              is valid for heavy industrial operations throughout Tennessee.
            </p>
          </details>
        </section>
      )}

      {/* NEW JERSEY-SPECIFIC CONTENT */}
      {info.code === 'nj' && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">New Jersey Forklift Training for Major Industries</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🚢 Port & Logistics Operations</h3>
              <p className="text-sm text-gray-700">
                New Jersey shares the Port of New York/New Jersey, one of the largest container ports in North America. 
                Our training covers port logistics, container handling, and intermodal freight operations throughout New Jersey.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">💊 Pharmaceutical & Life Sciences</h3>
              <p className="text-sm text-gray-700">
                New Jersey is a global pharmaceutical hub with major companies like Johnson & Johnson, Merck, and Bristol Myers Squibb. 
                Our certification covers clean room logistics, controlled substance handling, and pharmaceutical warehouse operations.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🏭 Manufacturing & Chemical Processing</h3>
              <p className="text-sm text-gray-700">
                New Jersey's industrial corridor includes chemical processing, food production, and consumer goods manufacturing. 
                Our training covers heavy industrial forklift safety and chemical facility material handling requirements.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">📦 E-commerce & Distribution</h3>
              <p className="text-sm text-gray-700">
                New Jersey's proximity to NYC makes it a major e-commerce fulfillment and distribution center location. 
                Our certification covers high-volume warehouse operations for Amazon, Walmart, and regional distributors.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
            <h3 className="text-lg font-semibold mb-3">New Jersey Major Cities We Serve:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <ul className="space-y-1">
                <li>• Newark forklift certification</li>
                <li>• Jersey City forklift training</li>
                <li>• Paterson forklift operators</li>
                <li>• Elizabeth forklift certification</li>
              </ul>
              <ul className="space-y-1">
                <li>• Edison warehouse training</li>
                <li>• Woodbridge distribution centers</li>
                <li>• Lakewood logistics facilities</li>
                <li>• Toms River operations</li>
              </ul>
              <ul className="space-y-1">
                <li>• Hamilton pharmaceutical sites</li>
                <li>• Trenton manufacturing</li>
                <li>• Camden port operations</li>
                <li>• Clifton industrial facilities</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ADDITIONAL FAQ FOR NEW JERSEY */}
      {info.code === 'nj' && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">New Jersey-Specific Forklift Training Questions</h2>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is this certification accepted at New Jersey pharmaceutical and biotech facilities?
            </summary>
            <p className="mt-2">
              Absolutely! Our OSHA-compliant certification is accepted by major pharmaceutical and life sciences 
              employers throughout New Jersey, including clean room operations, controlled substance warehouses, 
              and biotech manufacturing facilities. The training meets pharmaceutical industry safety standards.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Do New Jersey port operations and logistics companies require forklift certification?
            </summary>
            <p className="mt-2">
              Yes! New Jersey's port operations and logistics sector, including operations at the Port of 
              New York/New Jersey, require OSHA-compliant forklift certification. Our training covers maritime 
              logistics and distribution center operations throughout New Jersey.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is additional training needed for New Jersey's chemical processing and manufacturing industries?
            </summary>
            <p className="mt-2">
              Our comprehensive OSHA training covers forklift operations in chemical and heavy industrial 
              environments, which is essential for New Jersey's significant chemical processing and manufacturing 
              sectors. The certification is valid for industrial operations throughout New Jersey.
            </p>
          </details>
        </section>
      )}

      {/* INDIANA-SPECIFIC CONTENT */}
      {info.code === 'in' && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Indiana Forklift Training for Major Industries</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🚗 Automotive & Manufacturing</h3>
              <p className="text-sm text-gray-700">
                Indiana is a major automotive and RV manufacturing hub with plants from Toyota, Honda, Subaru, and major RV manufacturers. 
                Our training covers automotive assembly, parts warehousing, and lean manufacturing environments throughout Indiana.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">📦 Logistics & Distribution</h3>
              <p className="text-sm text-gray-700">
                Indiana's central location makes Indianapolis a major distribution hub for the Midwest and national networks. 
                Our certification covers warehouse operations, cross-docking, and e-commerce fulfillment throughout Indiana.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🏭 Steel & Heavy Manufacturing</h3>
              <p className="text-sm text-gray-700">
                Indiana's steel industry and heavy manufacturing sector in Gary, Hammond, and throughout northern Indiana require certified operators. 
                Our training covers heavy-duty forklift operations and industrial safety requirements.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🌽 Agriculture & Food Processing</h3>
              <p className="text-sm text-gray-700">
                Indiana's agriculture includes corn, soybeans, and extensive food processing facilities. 
                Our certification covers agricultural forklift safety and food industry compliance requirements throughout Indiana.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
            <h3 className="text-lg font-semibold mb-3">Indiana Major Cities We Serve:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <ul className="space-y-1">
                <li>• Indianapolis forklift certification</li>
                <li>• Fort Wayne forklift training</li>
                <li>• Evansville forklift operators</li>
                <li>• South Bend forklift certification</li>
              </ul>
              <ul className="space-y-1">
                <li>• Carmel warehouse training</li>
                <li>• Fishers distribution centers</li>
                <li>• Bloomington logistics facilities</li>
                <li>• Hammond steel operations</li>
              </ul>
              <ul className="space-y-1">
                <li>• Gary manufacturing sites</li>
                <li>• Lafayette operations</li>
                <li>• Muncie industrial facilities</li>
                <li>• Elkhart RV manufacturing</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ADDITIONAL FAQ FOR INDIANA */}
      {info.code === 'in' && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Indiana-Specific Forklift Training Questions</h2>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is this certification accepted at Indiana automotive and RV manufacturing plants?
            </summary>
            <p className="mt-2">
              Absolutely! Our OSHA-compliant certification is accepted by major Indiana automotive manufacturers 
              including Toyota, Honda, Subaru, and major RV manufacturers in Elkhart. The training meets automotive 
              and RV industry safety standards.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Do Indianapolis logistics companies and distribution centers require forklift certification?
            </summary>
            <p className="mt-2">
              Yes! Indiana's central location makes it a major distribution hub, and logistics companies like 
              Amazon, FedEx, and regional distributors require OSHA-compliant forklift certification. Our training 
              is accepted at major warehouses and distribution centers throughout Indiana.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is additional training needed for Indiana's steel and heavy manufacturing industries?
            </summary>
            <p className="mt-2">
              Our comprehensive OSHA training covers forklift operations in heavy industrial environments, 
              which is essential for Indiana's steel industry and heavy manufacturing sector. The certification 
              is valid for industrial operations throughout Indiana.
            </p>
          </details>
        </section>
      )}

      {/* WASHINGTON-SPECIFIC CONTENT */}
      {info.code === 'wa' && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Washington Forklift Training for Major Industries</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">💻 Technology & E-commerce</h3>
              <p className="text-sm text-gray-700">
                Washington is home to Amazon, Microsoft, and major tech companies with extensive warehouse and data center operations. 
                Our training covers e-commerce fulfillment, high-tech warehouse operations, and precision equipment handling.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">✈️ Aerospace & Manufacturing</h3>
              <p className="text-sm text-gray-700">
                Boeing and aerospace suppliers throughout Washington require certified forklift operators for aircraft component handling. 
                Our certification covers aerospace manufacturing environments and precision material handling requirements.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🚢 Port & Maritime Operations</h3>
              <p className="text-sm text-gray-700">
                Seattle and Tacoma ports are major Pacific trade gateways handling container traffic and international freight. 
                Our training covers port logistics, container operations, and maritime material handling throughout Washington.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🌲 Agriculture & Food Processing</h3>
              <p className="text-sm text-gray-700">
                Washington's agriculture includes apples, cherries, wine production, and seafood processing. 
                Our certification covers agricultural forklift operations and food industry safety requirements throughout Washington.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
            <h3 className="text-lg font-semibold mb-3">Washington Major Cities We Serve:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <ul className="space-y-1">
                <li>• Seattle forklift certification</li>
                <li>• Spokane forklift training</li>
                <li>• Tacoma forklift operators</li>
                <li>• Vancouver forklift certification</li>
              </ul>
              <ul className="space-y-1">
                <li>• Bellevue warehouse training</li>
                <li>• Kent distribution centers</li>
                <li>• Everett aerospace facilities</li>
                <li>• Renton manufacturing sites</li>
              </ul>
              <ul className="space-y-1">
                <li>• Yakima agricultural operations</li>
                <li>• Federal Way logistics hubs</li>
                <li>• Spokane Valley warehouses</li>
                <li>• Bellingham port operations</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ADDITIONAL FAQ FOR WASHINGTON */}
      {info.code === 'wa' && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Washington-Specific Forklift Training Questions</h2>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is this certification accepted at Washington tech companies and Amazon facilities?
            </summary>
            <p className="mt-2">
              Absolutely! Our OSHA-compliant certification is accepted by major Washington employers including 
              Amazon fulfillment centers, Microsoft facilities, and tech companies throughout the Seattle area. 
              The training meets e-commerce and high-tech warehouse safety standards.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Do Washington aerospace facilities and Boeing plants require forklift certification?
            </summary>
            <p className="mt-2">
              Yes! Washington's aerospace industry, including Boeing manufacturing facilities and suppliers 
              throughout Everett, Renton, and surrounding areas, require OSHA-compliant forklift certification. 
              Our training covers aerospace material handling and precision equipment operations.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is additional training needed for Washington's port operations and maritime logistics?
            </summary>
            <p className="mt-2">
              Our comprehensive OSHA training covers forklift operations in port and maritime environments, 
              which is essential for Seattle and Tacoma port operations. The certification is valid for 
              container handling, intermodal freight, and maritime logistics throughout Washington.
            </p>
          </details>
        </section>
      )}

      {/* SCHEMA: BreadcrumbList + Course + FAQPage + AggregateRating */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: "https://www.flatearthequipment.com",
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Safety Training",
                    item: "https://www.flatearthequipment.com/safety",
                  },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: "Forklift Certification",
                    item: "https://www.flatearthequipment.com/safety/forklift",
                  },
                  {
                    "@type": "ListItem",
                    position: 4,
                    name: info.name,
                    item: `https://www.flatearthequipment.com/safety/forklift/${info.code}`,
                  },
                ],
              },
              {
                "@type": "Course",
                name: "How to Get Forklift Certified in " + info.name + " - Online Training",
                description: "Learn how to get forklift certified in " + info.name + " with our OSHA-compliant online course. Complete certification in under 60 minutes.",
                provider: {
                  "@type": "Organization",
                  name: "Flat Earth Equipment",
                  logo: "https://www.flatearthequipment.com/logo.png",
                },
                offers: {
                  "@type": "Offer",
                  price: "59",
                  priceCurrency: "USD",
                  url: `https://www.flatearthequipment.com/safety/forklift/${info.code}`,
                },
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: "4.8",
                  reviewCount: "5247",
                  bestRating: "5",
                  worstRating: "1",
                },
              },
              {
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: `Is this accepted in ${info.name}?`,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text:
                        "Yes. Our curriculum follows 29 CFR 1910.178(l) and is recognized nationwide, including " +
                        info.name +
                        ".",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "How long is the forklift card valid?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Three years under OSHA guidelines.",
                    },
                  },
                  ...(info.code === 'ca' ? [
                    {
                      "@type": "Question",
                      name: "Does this meet Cal/OSHA requirements for California?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes! Our training meets both federal OSHA and Cal/OSHA requirements. California operates under its own state plan with standards that meet or exceed federal requirements.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is forklift certification required at California ports and warehouses?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Absolutely. Major California ports (LA, Long Beach, Oakland) and warehouse operations require certified forklift operators for faster onboarding in California's logistics industry.",
                      },
                    },
                  ] : []),
                  ...(info.code === 'il' ? [
                    {
                      "@type": "Question",
                      name: "Is this certification accepted at Chicago warehouses and distribution centers?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Absolutely! Our OSHA-compliant certification is accepted by major employers throughout Illinois, including Amazon, Walmart, UPS, FedEx, and other logistics companies.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Do Illinois manufacturing plants require forklift certification?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes, Illinois manufacturing facilities, including automotive plants, steel mills, and machinery manufacturers, require OSHA-compliant forklift certification.",
                      },
                    },
                  ] : []),
                  ...(info.code === 'pa' ? [
                    {
                      "@type": "Question",
                      name: "Is this certification accepted at Philadelphia port operations and warehouses?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes! Our OSHA-compliant certification is accepted by major employers throughout Pennsylvania, including port operations in Philadelphia, logistics companies, and warehouse facilities across the state's major industrial corridors.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Do Pennsylvania steel mills and manufacturing plants require forklift certification?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Absolutely. Pennsylvania's manufacturing sector, including steel mills in Pittsburgh, chemical plants, and machinery manufacturers throughout the state, require OSHA-compliant forklift certification.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is additional training needed for Pennsylvania's energy sector operations?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Our comprehensive OSHA training covers forklift operations in industrial settings, including Pennsylvania's energy sector. The certification is valid for natural gas facilities, coal operations, and renewable energy projects throughout Pennsylvania.",
                      },
                    },
                  ] : []),
                  ...(info.code === 'oh' ? [
                    {
                      "@type": "Question",
                      name: "Is this certification accepted at Ohio automotive plants and manufacturing facilities?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Absolutely! Our OSHA-compliant certification is accepted by major Ohio automotive manufacturers including Honda, Ford, GM, and their suppliers throughout Ohio. The training meets automotive industry safety standards and lean manufacturing requirements.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Do Ohio distribution centers and logistics companies require forklift certification?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes! Ohio's strategic location makes it a major distribution hub, and logistics companies like Amazon, FedEx, UPS, and DHL require certified forklift operators. Our certification is accepted at major distribution centers throughout Ohio.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is additional training needed for Ohio's energy and chemical processing industries?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Our comprehensive OSHA training covers forklift operations in industrial environments, including Ohio's energy and chemical sectors. The certification is valid for coal operations, natural gas facilities, and chemical processing plants throughout Ohio.",
                      },
                    },
                  ] : []),
                  ...(info.code === 'ga' ? [
                    {
                      "@type": "Question",
                      name: "Is this certification accepted at the Port of Savannah and Atlanta distribution centers?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Absolutely! Our OSHA-compliant certification is accepted by major employers throughout Georgia, including port operations in Savannah, logistics companies in Atlanta's distribution corridor, and warehouse facilities across Georgia's major transportation hubs.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Do Georgia manufacturing and aerospace facilities require forklift certification?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes! Georgia's manufacturing sector, including automotive plants, aerospace facilities like those in Warner Robins, and defense contractors throughout the state, require OSHA-compliant forklift certification. Our training meets aerospace and automotive industry safety standards.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is additional training needed for Georgia's food processing and agricultural operations?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Our comprehensive OSHA training covers forklift operations in food processing and agricultural settings, which is essential for Georgia's significant agriculture and food industry. The certification is valid for poultry operations, food processing plants, and agricultural facilities throughout Georgia.",
                      },
                    },
                  ] : []),
                  ...(info.code === 'nc' ? [
                    {
                      "@type": "Question",
                      name: "Is this certification accepted at Charlotte financial institutions and Research Triangle tech companies?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Absolutely! Our OSHA-compliant certification is accepted by major employers throughout North Carolina, including financial institutions in Charlotte, tech companies in the Research Triangle, and corporate facilities across the state's major business centers.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Do North Carolina manufacturing and defense facilities require forklift certification?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes! North Carolina's manufacturing sector, including furniture makers, textile companies, automotive suppliers, and defense contractors serving military installations, require OSHA-compliant forklift certification. Our training meets defense industry and advanced manufacturing safety standards.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is additional training needed for North Carolina's pharmaceutical and biotech operations?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Our comprehensive OSHA training covers forklift operations in controlled environments, which is important for North Carolina's significant pharmaceutical and biotech industries in the Research Triangle. The certification is valid for clean room logistics and high-tech manufacturing throughout North Carolina.",
                      },
                    },
                  ] : []),
                  ...(info.code === 'mi' ? [
                    {
                      "@type": "Question",
                      name: "Is this certification accepted at Michigan automotive plants and assembly facilities?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Absolutely! Our OSHA-compliant certification is accepted by major Michigan automotive manufacturers including Ford, GM, Chrysler, and their tier-one suppliers throughout Michigan. The training meets automotive industry safety standards and lean manufacturing requirements.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Do Michigan manufacturing and steel processing facilities require forklift certification?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes! Michigan's heavy manufacturing sector, including steel processing, machinery manufacturers, and chemical plants throughout the state, require OSHA-compliant forklift certification. Our training covers heavy industrial safety requirements common in Michigan's manufacturing base.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is additional training needed for Michigan's Great Lakes shipping and port operations?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Our comprehensive OSHA training covers forklift operations in shipping and logistics environments, which is essential for Michigan's Great Lakes ports and shipping operations. The certification is valid for port operations, intermodal freight handling, and logistics centers throughout Michigan.",
                      },
                    },
                  ] : []),
                  ...(info.code === 'va' ? [
                    {
                      "@type": "Question",
                      name: "Is this certification accepted at Virginia military installations and defense contractors?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Absolutely! Our OSHA-compliant certification is accepted by major employers throughout Virginia, including defense contractors serving Norfolk Naval Base, Pentagon operations, Quantico, and other military installations. The training meets defense industry security and safety standards.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Do Virginia port operations and shipbuilding facilities require forklift certification?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes! Virginia's port operations, including the Port of Virginia and Newport News Shipbuilding, require OSHA-compliant forklift certification. Our training covers maritime logistics, container handling, and shipyard safety requirements specific to Virginia's maritime industry.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is additional training needed for Virginia's federal contracting and government facilities?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Our comprehensive OSHA training covers forklift operations in government and federal contracting environments, which is essential for Northern Virginia's extensive federal contractor base. The certification meets government facility requirements and federal contractor standards throughout Virginia.",
                      },
                    },
                  ] : []),
                  ...(info.code === 'ny' ? [
                    {
                      "@type": "Question",
                      name: "Is this certification accepted at NYC financial institutions and corporate facilities?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Absolutely! Our OSHA-compliant certification is accepted by major employers throughout New York, including financial institutions on Wall Street, corporate headquarters in Manhattan, and logistics companies serving the NYC metropolitan area's extensive business operations.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Do New York port operations and manufacturing facilities require forklift certification?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes! New York's port operations, including the Port of New York/New Jersey, and upstate manufacturing facilities require OSHA-compliant forklift certification. Our training covers maritime logistics, container handling, and heavy industrial safety requirements throughout New York State.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is additional training needed for New York's food processing and agricultural operations?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Our comprehensive OSHA training covers forklift operations in food processing and agricultural environments, which is important for New York's significant agriculture and food industry. The certification is valid for dairy operations, food processing plants, and agricultural facilities throughout New York State.",
                      },
                    },
                  ] : []),
                  ...(info.code === 'tx' ? [
                    {
                      "@type": "Question",
                      name: "Is this certification accepted at Houston energy facilities and petrochemical plants?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Absolutely! Our OSHA-compliant certification is accepted by major employers throughout Texas, including energy companies in Houston's petrochemical corridor, oil refineries, and natural gas facilities.",
                      },
                    },
                  ] : []),
                  ...(info.code === 'fl' ? [
                    {
                      "@type": "Question",
                      name: "Is this certification accepted at Florida ports and cruise line operations?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Absolutely! Our OSHA-compliant certification is accepted by major employers throughout Florida, including port operations in Miami, Tampa, Jacksonville, and cruise line logistics companies.",
                      },
                    },
                  ] : []),
                  ...(info.code === 'az' ? [
                    {
                      "@type": "Question",
                      name: "Is this certification accepted at Phoenix distribution centers and logistics facilities?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Absolutely! Our OSHA-compliant certification is accepted by major employers throughout Arizona, including Amazon, Walmart, and regional distributors in the Phoenix metro area.",
                      },
                    },
                  ] : []),
                  ...(info.code === 'tn' ? [
                    {
                      "@type": "Question",
                      name: "Is this certification accepted at Tennessee automotive plants and manufacturing facilities?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Absolutely! Our OSHA-compliant certification is accepted by major Tennessee automotive manufacturers including Nissan, Volkswagen, GM, and their suppliers.",
                      },
                    },
                  ] : []),
                  ...(info.code === 'nj' ? [
                    {
                      "@type": "Question",
                      name: "Is this certification accepted at New Jersey pharmaceutical and biotech facilities?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Absolutely! Our OSHA-compliant certification is accepted by major pharmaceutical and life sciences employers throughout New Jersey, including clean room operations and biotech manufacturing facilities.",
                      },
                    },
                  ] : []),
                  ...(info.code === 'in' ? [
                    {
                      "@type": "Question",
                      name: "Is this certification accepted at Indiana automotive and RV manufacturing plants?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Absolutely! Our OSHA-compliant certification is accepted by major Indiana automotive manufacturers including Toyota, Honda, Subaru, and major RV manufacturers in Elkhart.",
                      },
                    },
                  ] : []),
                  ...(info.code === 'wa' ? [
                    {
                      "@type": "Question",
                      name: "Is this certification accepted at Washington tech companies and Amazon facilities?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Absolutely! Our OSHA-compliant certification is accepted by major Washington employers including Amazon fulfillment centers, Microsoft facilities, and tech companies throughout the Seattle area.",
                      },
                    },
                  ] : []),
                ],
              },
            ],
          }),
        }}
      />

      {/* META tags */}
      <meta name="robots" content="index,follow" />
      <link
        rel="canonical"
        href={`https://www.flatearthequipment.com/safety/forklift/${info.code}`}
      />
    </main>
    
    {/* Mobile Sticky CTA */}
    <StickyCTA />
  </>
  );
} 