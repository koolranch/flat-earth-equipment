import { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "Corporate OSHA Operator Training | Onsite Fleet Certification",
  description: "Online forklift certification for a fleet. Study is free. $49 is paid at the final exam. Team 5-pack is $225. Team 25-pack is $999. We do not send a trainer to your site.",
  keywords: "corporate forklift training, fleet operator certification, onsite OSHA training, group forklift certification, aerial lift training, MEWP training companies",
  alternates: {
    canonical: "/osha-operator-training",
  },
  openGraph: {
    title: "Corporate OSHA Operator Training | Onsite Fleet Certification",
    description: "Online forklift certification. $49 at the final exam. Team 5-pack $225. Team 25-pack $999. The workplace supervisor does the hands-on evaluation.",
    type: "website",
  },
};

export default function OSHAOperatorTrainingPage() {
  // Service schema for B2B training
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Corporate OSHA Operator Training",
    "provider": {
      "@type": "Organization",
      "name": "Flat Earth Equipment"
    },
    "areaServed": {
      "@type": "Country",
      "name": "United States"
    },
    "audience": {
      "@type": "BusinessAudience",
      "name": "Companies with industrial equipment fleets"
    },
    "offers": {
      "@type": "Offer",
      "description": "Online forklift certification. $49 at the final exam. Team 5-pack $225. Team 25-pack $999."
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="inline-block bg-blue-600 text-white text-sm font-semibold px-3 py-1 rounded-full mb-4">
            B2B Training Solutions
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Corporate OSHA Operator Training for Your Fleet
          </h1>
          <p className="text-xl text-gray-700 mb-6">
            Online forklift certification for a fleet. Study is free. $49 is paid at the final exam. Team 5-pack is $225. Team 25-pack is $999. We do not send a trainer to your site, and we do not offer aerial-lift or MEWP certification. The hands-on evaluation is done by the workplace supervisor.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Link
              href="/quote?topic=training"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Request Corporate Training Quote
            </Link>
            <a
              href="tel:+1-888-392-9175"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              Call (888) 392-9175
            </a>
          </div>

          {/* Individual Operator Callout */}
          <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-lg">
            <p className="text-lg font-semibold text-orange-900 mb-2">
              🚜 Individual operator looking for online certification?
            </p>
            <p className="text-orange-800 mb-3">
              Get OSHA-compliant forklift certification online in under 30 minutes for just $49.
            </p>
            <Link
              href="/safety"
              className="inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold"
            >
              Get certified online for $49 →
            </Link>
          </div>
        </div>

        {/* Value Proposition Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-16">
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
            <div className="text-sm text-gray-600">Companies Trained</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">$49</div>
            <div className="text-sm text-gray-600">Paid at the final exam</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">Online</div>
            <div className="text-sm text-gray-600">Forklift course</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">3 Years</div>
            <div className="text-sm text-gray-600">Certification Valid</div>
          </div>
        </div>

        {/* What We Cover */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Comprehensive Equipment Coverage</h2>
          <p className="text-lg text-gray-700 mb-6">
            The online course is forklift operator certification. We do not offer aerial-lift or MEWP certification.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-3">🚜 Forklift Training (OSHA 1910.178)</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Online forklift operator course</li>
                <li>$49 at the final exam</li>
                <li>Team 5-pack $225</li>
                <li>Team 25-pack $999</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-3">Aerial lifts</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>We do not offer MEWP certification</li>
                <li>Scissor-lift and boom-lift training is not on this site</li>
                <li>Forklift certification does not cover aerial lifts</li>
                <li>Parts for Genie and JLG are in the catalog</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Training Options */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Flexible Training Solutions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border-2 border-blue-200 shadow-lg rounded-xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl">📍</div>
                <h3 className="text-2xl font-semibold">Online course</h3>
              </div>
              <p className="text-gray-700 mb-4">
                We do not send a trainer to your site. Operators take the forklift course online. Study is free. $49 is paid at the final exam.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span className="text-gray-700">Team 5-pack is $225</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span className="text-gray-700">Team 25-pack is $999</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span className="text-gray-700">The workplace supervisor does the hands-on evaluation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span className="text-gray-700">Checkout is on the forklift certification page</span>
                </li>
              </ul>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-900 mb-1">Best For:</p>
                <p className="text-sm text-blue-800">
                  Warehouses, distribution centers, manufacturing facilities, construction companies
                </p>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-200 shadow-lg rounded-xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl">💻</div>
                <h3 className="text-2xl font-semibold">Hybrid Training</h3>
              </div>
              <p className="text-gray-700 mb-4">
                Operators complete the forklift course online. The workplace supervisor does the hands-on evaluation. We do not send a trainer.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">Self-paced online modules (35-45 min)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">Final exam + certificate generation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">Evaluation checklist provided</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">QR-verifiable wallet cards</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">Valid for 3 years</span>
                </li>
              </ul>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-900 mb-1">Best For:</p>
                <p className="text-sm text-gray-700">
                  Remote teams, mixed schedules, cost-conscious fleets with competent supervisors
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why It Matters - Enhanced for B2B */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Compliance Matters: Risk & ROI</h2>
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-6">
            <p className="text-lg text-red-900 font-semibold mb-2">
              OSHA requires all powered industrial truck operators be trained and evaluated (29 CFR 1910.178)
            </p>
            <p className="text-red-800">
              Non-compliance isn't just a regulatory issue—it's a business risk that can cost your company 
              significantly more than the training investment.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="font-semibold text-lg mb-2">Financial Risk</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• OSHA publishes the current penalty amounts. This page does not.</li>
                <li>• This page does not publish an accident-liability dollar amount.</li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-3xl mb-3">⚖️</div>
              <h3 className="font-semibold text-lg mb-2">Legal Exposure</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Increased liability after accidents</li>
                <li>• Disqualified government bids</li>
                <li>• Contract compliance violations</li>
                <li>• Insurance claim denials</li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold text-lg mb-2">Operational Impact</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Equipment damage costs</li>
                <li>• Lost productivity from downtime</li>
                <li>• Employee injury & turnover</li>
                <li>• Reputation damage with clients</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8">
          <h2 className="text-3xl font-bold mb-6">Why Companies Choose Our Training</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="text-2xl">📋</div>
              <div>
                <h3 className="font-semibold mb-2">Complete Documentation</h3>
                <p className="text-gray-700">
                  Training records, operator certifications, and evaluation forms—everything you 
                  need for OSHA audits and insurance compliance in one organized packet.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-2xl">⏱️</div>
              <div>
                <h3 className="font-semibold mb-2">Minimal Downtime</h3>
                <p className="text-gray-700">
                  Quick 2-3 hour sessions scheduled around your operations. Train multiple shifts 
                  without disrupting productivity or deadlines.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-2xl">🎯</div>
              <div>
                <h3 className="font-semibold mb-2">Custom Scenarios</h3>
                <p className="text-gray-700">
                  Training tailored to your facility layout, equipment types, and specific hazards. 
                  Real-world application beats generic instruction.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-2xl">🔄</div>
              <div>
                <h3 className="font-semibold mb-2">Ongoing Support</h3>
                <p className="text-gray-700">
                  The certificate is issued after the final exam is passed. We do not run refresher classes or incident-response training.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section - Enhanced for B2B */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <details className="bg-white border border-gray-200 rounded-lg p-6 group">
              <summary className="font-semibold text-lg cursor-pointer list-none flex items-center justify-between">
                How long does corporate training take?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-700">
                The forklift course is online. Study is free and $49 is paid at the final exam. The workplace supervisor does the hands-on evaluation. We do not run a 2–3 hour session at your site.
              </p>
            </details>

            <details className="bg-white border border-gray-200 rounded-lg p-6 group">
              <summary className="font-semibold text-lg cursor-pointer list-none flex items-center justify-between">
                What's the minimum number of operators for onsite training?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-700">
                There is no on-site minimum. A single operator is $49 at the final exam. Team 5-pack is $225. Team 25-pack is $999.
              </p>
            </details>

            <details className="bg-white border border-gray-200 rounded-lg p-6 group">
              <summary className="font-semibold text-lg cursor-pointer list-none flex items-center justify-between">
                Do you offer volume pricing?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-700">
                Single operator is $49 at the final exam. Team 5-pack is $225. Team 25-pack is $999. Those are the listed prices.
              </p>
            </details>

            <details className="bg-white border border-gray-200 rounded-lg p-6 group">
              <summary className="font-semibold text-lg cursor-pointer list-none flex items-center justify-between">
                How long is the certification valid?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-700">
                Three years per OSHA 1910.178(l)(4)(iii) guidelines. However, refresher training is required 
                if: (1) operator is observed operating unsafely, (2) involved in an accident or near-miss, 
                (3) assigned to different equipment type, or (4) workplace conditions change. We provide 
                reminder services before certification expires.
              </p>
            </details>

            <details className="bg-white border border-gray-200 rounded-lg p-6 group">
              <summary className="font-semibold text-lg cursor-pointer list-none flex items-center justify-between">
                Can our internal supervisor conduct evaluations?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-700">
                The workplace supervisor does the hands-on evaluation. We do not send a trainer, and we do not train the evaluator.
              </p>
            </details>

            <details className="bg-white border border-gray-200 rounded-lg p-6 group">
              <summary className="font-semibold text-lg cursor-pointer list-none flex items-center justify-between">
                What documentation do we receive?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-700">
                You'll receive: (1) Individual operator certificates with QR verification, (2) Wallet cards 
                for each operator, (3) Training records with dates and evaluator signatures, (4) Evaluation 
                forms per OSHA requirements, (5) Training roster for your records. All documentation is 
                compliant with OSHA 1910.178(l)(6) certification requirements.
              </p>
            </details>

            <details className="bg-white border border-gray-200 rounded-lg p-6 group">
              <summary className="font-semibold text-lg cursor-pointer list-none flex items-center justify-between">
                Is MEWP (aerial lift) training required separately from forklift training?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-700">
                Forklift certification on this site does not cover aerial lifts. We do not offer MEWP training.
              </p>
            </details>

            <details className="bg-white border border-gray-200 rounded-lg p-6 group">
              <summary className="font-semibold text-lg cursor-pointer list-none flex items-center justify-between">
                What's your service area?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-700">
                The course is online. We do not travel to a site. The workplace supervisor does the hands-on evaluation.
              </p>
            </details>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 text-white rounded-xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Your Fleet Certified?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Single operator is $49 at the final exam. Team 5-pack is $225. Team 25-pack is $999. The listed checkout is the forklift certification page.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/quote?topic=training"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Request Corporate Quote
            </Link>
            <a
              href="tel:+1-888-392-9175"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Call (888) 392-9175
            </a>
          </div>
          <p className="mt-6 text-sm text-blue-200">
            Online course. The workplace supervisor does the hands-on evaluation.
          </p>
        </section>
      </main>
    </>
  );
}
