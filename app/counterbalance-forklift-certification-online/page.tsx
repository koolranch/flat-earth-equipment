import Link from "next/link";
import Script from "next/script";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Counterbalance Forklift Certification – Online OSHA Class IV/V",
  description:
    "Finish OSHA-compliant counterbalance forklift training in under 60 minutes. Covers load capacity plates, stability triangle & more. PDF certificate for just $59.",
  alternates: {
    canonical: "/counterbalance-forklift-certification-online",
    languages: {
      "es": "/es/forklift-certificacion-online",
    },
  },
  openGraph: {
    title: "Online Counterbalance Forklift Certification (Class IV & V)",
    description:
      "Get certified fast – instant PDF card, unlimited exam retakes – only $59.",
    url: "/counterbalance-forklift-certification-online",
    type: "website",
  },
};

export default function CounterbalanceForkliftPage() {
  return (
    <>
      <Script
        id="ld-json"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Course",
                "name": "Counterbalance Forklift Certification Online",
                "description": "OSHA-compliant Class IV and Class V counterbalance forklift operator training course",
                "provider": {
                  "@type": "Organization",
                  "name": "Flat Earth Equipment",
                  "url": "https://www.flatearthequipment.com"
                },
                "offers": {
                  "@type": "Offer",
                  "price": "59",
                  "priceCurrency": "USD",
                  "url": "/counterbalance-forklift-certification-online"
                },
                "educationalLevel": "Professional",
                "timeRequired": "PT60M",
                "courseMode": "online",
                "inLanguage": ["en", "es"],
                "teaches": [
                  "Class IV solid-tire counterbalance operation",
                  "Class V pneumatic-tire counterbalance operation",
                  "Load capacity calculations",
                  "Stability triangle principles",
                  "OSHA 29 CFR 1910.178 compliance"
                ]
              },
              {
                "@type": "FAQPage",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "Is this different from the regular forklift course?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Yes—it dives deeper into counterbalance-specific load handling, capacity plates, and stability scenarios."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "What if I operate a reach truck, too?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "This course satisfies counterbalance (class IV/V). Reach trucks (class II) require additional training—chat with us for bundle pricing."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Do I still need hands-on evaluation?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Yes. OSHA requires your employer to assess practical skills. We include the checklist."
                    }
                  }
                ]
              }
            ]
          })
        }}
      />
      
      <main className="mx-auto max-w-3xl px-4 py-12 prose prose-slate">
        <h1>Online Counterbalance Forklift Certification (Class IV & V)</h1>

        <p className="lead text-xl text-gray-700 mb-8">
          Master the most common warehouse truck type in <strong>&lt; 60 minutes</strong>.
          This OSHA-compliant course covers class IV (solid-tire) and class V (pneumatic-tire) counterbalance forklifts—
          including load-capacity plates, stability triangle, and safe travel techniques.
        </p>

        <div className="not-prose mb-8">
          <Link
            href="/safety"
            className="inline-block rounded-xl bg-indigo-600 px-6 py-3 text-xl font-semibold text-white no-underline transition hover:bg-indigo-700"
          >
            Enroll – $59
          </Link>
        </div>

        <h2>Why a Counterbalance-Specific Course?</h2>
        <ul>
          <li>80% of warehouse incidents involve counterbalance trucks</li>
          <li>Load-capacity math & stability triangle explained via mini-games</li>
          <li>Covers tight-aisle turns, ramps, and high-rack stacking</li>
          <li>OSHA 29 CFR 1910.178(l) compliant—certificate valid 3 years</li>
        </ul>

        <h2>Class IV vs Class V Counterbalance Forklifts</h2>
        <div className="grid md:grid-cols-2 gap-6 not-prose">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-3">📦 Class IV - Solid Tire</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Indoor warehouse operations</li>
              <li>• Smooth, hard surfaces</li>
              <li>• Electric or LP gas powered</li>
              <li>• Typical capacities: 3,000-8,000 lbs</li>
              <li>• Tight turning radius</li>
            </ul>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-3">🏗️ Class V - Pneumatic Tire</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Outdoor & rough terrain</li>
              <li>• Uneven surfaces, gravel, dirt</li>
              <li>• Diesel or LP gas powered</li>
              <li>• Higher capacities: 5,000-15,000+ lbs</li>
              <li>• Better traction and stability</li>
            </ul>
          </div>
        </div>

        <h2>Course Snapshot</h2>
        <ol>
          <li>Pre-operation 3-step quick check</li>
          <li>8-point daily inspection (class IV/V focus)</li>
          <li>Load-capacity plate calculations & center-of-gravity demo</li>
          <li>Travel, tilt & stack best practices</li>
          <li>Blind-corner horn use & pedestrian safety</li>
          <li>Final 30-question exam – unlimited retakes</li>
        </ol>

        <h2>Get Certified in 3 Easy Steps</h2>
        <div className="bg-gray-50 p-6 rounded-lg not-prose">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
              <div>
                <strong>Click Enroll</strong> & pay the one-time fee
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
              <div>
                <strong>Complete bite-size videos</strong> & interactive modules (&lt; 60 min)
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
              <div>
                <strong>Download your printable PDF certificate</strong> & wallet card
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
              <div>
                <strong>Have your employer sign</strong> the practical checklist (included) to finish OSHA requirements
              </div>
            </div>
          </div>
        </div>

        <h2>What Makes Counterbalance Forklifts Unique?</h2>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 not-prose">
          <h3 className="font-semibold text-amber-900 mb-3">🏋️ Load Capacity & Stability</h3>
          <p className="text-amber-800 text-sm mb-4">
            Counterbalance forklifts use their own weight as a counterbalance to the load. 
            Understanding the stability triangle and load center calculations is critical for safe operation.
          </p>
          <ul className="text-amber-800 text-sm space-y-1">
            <li>• Load capacity decreases as load center increases</li>
            <li>• Stability triangle formed by front axle and rear wheels</li>
            <li>• Tilting the mast affects load capacity ratings</li>
            <li>• Proper fork positioning prevents load shifting</li>
          </ul>
        </div>

        <h2>Frequently Asked Questions</h2>
        <details className="border rounded-lg p-4 mb-4">
          <summary className="cursor-pointer font-medium">Is this different from the regular forklift course?</summary>
          <p className="mt-2 text-gray-700">Yes—it dives deeper into counterbalance-specific load handling, capacity plates, and stability scenarios.</p>
        </details>
        
        <details className="border rounded-lg p-4 mb-4">
          <summary className="cursor-pointer font-medium">What if I operate a reach truck, too?</summary>
          <p className="mt-2 text-gray-700">This course satisfies counterbalance (class IV/V). Reach trucks (class II) require additional training—chat with us for bundle pricing.</p>
        </details>
        
        <details className="border rounded-lg p-4 mb-4">
          <summary className="cursor-pointer font-medium">Do I still need hands-on evaluation?</summary>
          <p className="mt-2 text-gray-700">Yes. OSHA requires your employer to assess practical skills. We include the checklist.</p>
        </details>

        <details className="border rounded-lg p-4 mb-4">
          <summary className="cursor-pointer font-medium">Can I get certified on both Class IV and Class V?</summary>
          <p className="mt-2 text-gray-700">Yes! This course covers both solid-tire (Class IV) and pneumatic-tire (Class V) counterbalance forklifts in one certification.</p>
        </details>

        <details className="border rounded-lg p-4 mb-4">
          <summary className="cursor-pointer font-medium">How long is the certification valid?</summary>
          <p className="mt-2 text-gray-700">Your certificate is valid for 3 years per OSHA requirements, or sooner if you have an accident or change equipment types.</p>
        </details>

        {/* Internal links cluster */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Related Training Options</h3>
          <div className="grid gap-4 not-prose">
            <Link href="/forklift-recertification-online" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-medium text-blue-600">🔄 Need to Renew Instead?</div>
              <div className="text-sm text-gray-600">Already certified? Visit our recertification page for 3-year renewal.</div>
            </Link>
            
            <Link href="/es/forklift-certificacion-online" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-medium text-blue-600">🇪🇸 ¿Prefieres Español?</div>
              <div className="text-sm text-gray-600">Curso de certificación de montacargas disponible en español.</div>
            </Link>
            
            <Link href="/safety" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-medium text-blue-600">📚 Full First-Time Certification</div>
              <div className="text-sm text-gray-600">Looking for comprehensive forklift training? Start with our complete course.</div>
            </Link>
          </div>
        </div>

        <hr className="my-8" />

        <div className="text-center not-prose">
          <p className="text-sm text-gray-600">
            Questions about counterbalance forklift certification? 
            <Link href="/contact" className="text-blue-600 hover:underline ml-1">
              Contact us
            </Link> 
            {" "}or chat live anytime.
          </p>
        </div>
      </main>
    </>
  );
} 