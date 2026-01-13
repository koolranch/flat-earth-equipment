import Link from "next/link";
import Script from "next/script";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forklift Recertification Online – Renew OSHA Card in 45 Minutes",
  description:
    "Renew your forklift license fast. Complete the OSHA-compliant refresher course and print your 3-year certificate today for just $59.",
  alternates: {
    canonical: "/forklift-recertification-online",
    languages: {
      "es": "/es/forklift-certificacion-online",
    },
  },
  openGraph: {
    title: "Online Forklift License Renewal",
    description:
      "Finish the refresher in <45 min, instant printable card, unlimited exam retakes.",
    url: "/forklift-recertification-online",
    type: "website",
  },
};

export default function ForkliftRecertification() {
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
                "name": "Forklift License Renewal Online",
                "description": "OSHA-compliant refresher course for forklift operators requiring recertification",
                "provider": {
                  "@type": "Organization",
                  "name": "Flat Earth Equipment",
                  "url": "https://www.flatearthequipment.com"
                },
                "offers": {
                  "@type": "Offer",
                  "price": "59",
                  "priceCurrency": "USD",
                  "url": "/forklift-recertification-online"
                },
                "educationalLevel": "Professional",
                "timeRequired": "PT45M",
                "courseMode": "online",
                "inLanguage": ["en", "es"]
              },
              {
                "@type": "FAQPage",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "How long is the renewal valid?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Your new certificate is valid for another 3 years per OSHA requirements."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "What if I fail the quiz?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Retake it immediately – unlimited attempts, free of charge."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Is a hands-on evaluation still required?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Yes. OSHA mandates your employer sign off on practical skills. We include a comprehensive checklist."
                    }
                  }
                ]
              }
            ]
          })
        }}
      />
      
      <main className="mx-auto max-w-3xl px-4 py-12 prose prose-slate">
        <h1>Forklift License Renewal – 100% Online Refresher</h1>

        <p className="lead text-xl text-gray-700 mb-8">
          Already certified? OSHA requires <strong>recertification every 3 years</strong> 
          or sooner after an accident. Knock out the theory refresher in
          <strong> under 45 minutes</strong> and download your updated card instantly.
        </p>

        <div className="not-prose mb-8">
          <Link
            href="/safety"
            className="inline-block rounded-xl bg-emerald-600 px-6 py-3 text-xl font-semibold text-white no-underline transition hover:bg-emerald-700"
          >
            Renew Now – $59
          </Link>
        </div>

        <h2>Do I Need Recertification?</h2>
        <ul>
          <li>3+ years since last training</li>
          <li>Changed employers or forklift types</li>
          <li>Involved in a near miss or accident</li>
          <li>Observed unsafe operation by supervisor</li>
          <li>Required by employer or insurance</li>
        </ul>

        <h2>What's in the Refresher Course?</h2>
        <ol>
          <li>Updated OSHA 29 CFR 1910.178(l) highlights</li>
          <li>New stability triangle & load capacity demonstrations</li>
          <li>Video case studies of recent forklift incidents</li>
          <li>Interactive hazard recognition exercises</li>
          <li>30-question exam with unlimited retakes</li>
        </ol>

        <h2>Finish in 3 Simple Steps</h2>
        <div className="bg-gray-50 p-6 rounded-lg not-prose">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
              <div>
                <strong>Click "Renew Now"</strong> & complete secure payment
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
              <div>
                <strong>Watch bite-size videos</strong> & pass the quiz (&lt; 45 min)
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
              <div>
                <strong>Download your certificate</strong> & have employer sign practical evaluation
              </div>
            </div>
          </div>
        </div>

        <h2>Why Choose Our Online Renewal?</h2>
        <div className="grid md:grid-cols-2 gap-6 not-prose">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">⚡ Fast & Convenient</h3>
            <p className="text-sm text-blue-800">Complete anytime, anywhere. No scheduling required.</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">✓ OSHA Compliant</h3>
            <p className="text-sm text-green-800">Meets all federal safety training requirements.</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-900 mb-2">🎯 Unlimited Retakes</h3>
            <p className="text-sm text-orange-800">No penalty for retaking the exam until you pass.</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">📱 Mobile Friendly</h3>
            <p className="text-sm text-purple-800">Works on any device with internet access.</p>
          </div>
        </div>

        <h2>Frequently Asked Questions</h2>
        <details className="border rounded-lg p-4 mb-4">
          <summary className="cursor-pointer font-medium">How long is the renewal valid?</summary>
          <p className="mt-2 text-gray-700">Your new certificate is valid for another 3 years per OSHA requirements.</p>
        </details>
        
        <details className="border rounded-lg p-4 mb-4">
          <summary className="cursor-pointer font-medium">What if I fail the quiz?</summary>
          <p className="mt-2 text-gray-700">Retake it immediately – unlimited attempts, free of charge.</p>
        </details>
        
        <details className="border rounded-lg p-4 mb-4">
          <summary className="cursor-pointer font-medium">Is a hands-on evaluation still required?</summary>
          <p className="mt-2 text-gray-700">Yes. OSHA mandates your employer sign off on practical skills. We include a comprehensive checklist.</p>
        </details>

        <details className="border rounded-lg p-4 mb-4">
          <summary className="cursor-pointer font-medium">Can I use this for any type of forklift?</summary>
          <p className="mt-2 text-gray-700">Yes, our training covers all classes of powered industrial trucks as defined by OSHA.</p>
        </details>

        <details className="border rounded-lg p-4 mb-4">
          <summary className="cursor-pointer font-medium">What's the difference between renewal and initial certification?</summary>
          <p className="mt-2 text-gray-700">The content is the same – OSHA requires the full training program for both initial and renewal certification.</p>
        </details>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 not-prose">
          <h3 className="font-semibold text-amber-900 mb-2">⚠️ Important OSHA Requirement</h3>
          <p className="text-amber-800 text-sm">
            This online course covers the theory portion required by OSHA. Your employer must also 
            conduct a practical evaluation of your forklift operation skills before you can work independently. 
            We provide the evaluation checklist and instructions.
          </p>
        </div>

        {/* Internal link cluster */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Related Training Options</h3>
          <div className="grid gap-4 not-prose">
            <Link href="/es/forklift-certificacion-online" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-medium text-blue-600">🇪🇸 Certificación en Español</div>
              <div className="text-sm text-gray-600">¿Necesitas la versión en español? Curso completo disponible.</div>
            </Link>
            
            <Link href="/safety/forklift/texas" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-medium text-blue-600">🤠 Texas Forklift Certification</div>
              <div className="text-sm text-gray-600">State-specific requirements and OSHA compliance for Texas operators.</div>
            </Link>
            
            <Link href="/safety" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-medium text-blue-600">🆕 First-Time Certification</div>
              <div className="text-sm text-gray-600">Never been certified? Start with our complete forklift operator course.</div>
            </Link>
          </div>
        </div>

        <hr className="my-8" />

        <div className="text-center not-prose">
          <p className="text-sm text-gray-600">
            Questions about renewal requirements? 
            <Link href="/contact" className="text-blue-600 hover:underline ml-1">
              Contact us
            </Link> 
            {" "}or chat with our training specialists.
          </p>
        </div>
      </main>
    </>
  );
} 