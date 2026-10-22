import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Forklift Proximity Sensors | Pedestrian Detection Systems | Safety Equipment",
  description: "Shop forklift proximity sensors, pedestrian detection systems, and safety equipment. Ultrasonic, RFID, and laser sensors. Freight is calculated at checkout.",
  keywords: "forklift proximity sensor, pedestrian detection system, forklift safety sensors, ultrasonic forklift sensor, RFID pedestrian alert, warehouse safety equipment",
  alternates: {
    canonical: "https://www.flatearthequipment.com/parts/safety/forklift-proximity-sensors"
  },
  openGraph: {
    title: "Forklift Proximity Sensors & Pedestrian Detection Systems",
    description: "Proximity sensors and pedestrian detection. Request a quote with the truck brand and model. Freight is calculated at checkout.",
    url: "https://www.flatearthequipment.com/parts/safety/forklift-proximity-sensors"
  }
};

function proximityQuoteHref(notes: string) {
  const params = new URLSearchParams({
    sku: "forklift-proximity-sensors",
    notes,
  });
  return `/quote?${params.toString()}`;
}

export default function ForkliftProximitySensorsPage() {
  const sensorTypes = [
    {
      name: "Ultrasonic Proximity Sensors",
      description: "Send the part number with the quote. This page does not publish a detection range.",
      features: ["This page does not publish a detection range"],
      applications: ["Send the part number with the quote"],
      icon: "🔊"
    },
    {
      name: "RFID Pedestrian Detection",
      description: "Send the part number with the quote. This page does not publish a detection range.",
      features: ["This page does not publish a detection range"],
      applications: ["Send the part number with the quote"],
      icon: "📡"
    },
    {
      name: "Laser Object Detection",
      description: "Send the part number with the quote. This page does not publish a detection range.",
      features: ["This page does not publish a detection range"],
      applications: ["Send the part number with the quote"],
      icon: "⚡"
    },
    {
      name: "Camera-Based Systems",
      description: "Send the part number with the quote. This page does not publish a detection range.",
      features: ["This page does not publish a detection range"],
      applications: ["Send the part number with the quote"],
      icon: "📹"
    }
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-600 mb-8">
        <Link href="/" className="hover:text-canyon-rust transition-colors">Home</Link>
        <span>/</span>
        <Link href="/parts" className="hover:text-canyon-rust transition-colors">Parts</Link>
        <span>/</span>
        <span>Safety Equipment</span>
        <span>/</span>
        <span className="text-slate-900">Forklift Proximity Sensors</span>
      </nav>

      {/* Hero Section */}
      <section className="mb-16">
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 md:p-12 border-2 border-red-200">
          <div className="max-w-4xl">
            <div className="inline-block bg-red-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              Warehouse Safety Equipment
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Forklift Proximity Sensors & Pedestrian Detection Systems
            </h1>
            <p className="text-xl text-slate-700 mb-8 leading-relaxed">
              Request a quote for proximity sensors and pedestrian detection. Freight is calculated at checkout. A listing is not a fit for every machine.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <Link 
                href={proximityQuoteHref("Forklift proximity sensors — request pricing")}
                className="bg-canyon-rust text-white px-8 py-4 rounded-lg font-semibold hover:bg-canyon-rust/90 transition-colors shadow-lg text-lg"
              >
                Get Pricing & Quote
              </Link>
              <Link 
                href="/contact" 
                className="border-2 border-canyon-rust text-canyon-rust px-8 py-4 rounded-lg font-semibold hover:bg-canyon-rust hover:text-white transition-colors text-lg"
              >
                Technical questions
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Quote, not on-site installation</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Send the truck brand and model</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Freight at checkout</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Educational Link - Drive to insights article */}
      <section className="mb-12">
        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
          <div className="flex items-start gap-4">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">New to Forklift Proximity Sensors?</h3>
              <p className="text-gray-700 mb-3">
                Learn how proximity sensors work, their benefits, and integration best practices in our comprehensive guide.
              </p>
              <Link 
                href="/insights/enhancing-forklift-safety-tech" 
                className="text-blue-600 hover:text-blue-700 font-medium underline inline-flex items-center gap-1"
              >
                Read: Enhancing Forklift Safety with Proximity Sensors
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Proximity Sensors - Quick Benefits */}
      <section className="mb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Add Proximity Sensors to Your Forklifts?</h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Protect workers by asking for a quote with the truck brand and model. A listing is not a fit for every machine.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-slate-200">
            <div className="text-5xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">Prevent Accidents</h3>
            <p className="text-slate-700 mb-4">
              Sensors detect people and objects around the truck. Request a quote with the truck brand and model.
            </p>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>• Send the truck brand and model</li>
              <li>• A listing is not a fit for every machine</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-slate-200">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">Reduce Costs</h3>
            <p className="text-slate-700 mb-4">
              This page does not publish insurance savings or claim counts. Freight is calculated at checkout.
            </p>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>• Request a quote</li>
              <li>• Price comes back on the quote</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-slate-200">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">OSHA Compliance</h3>
            <p className="text-slate-700 mb-4">
              A sensor quote is not an OSHA compliance program. Forklift certification is a separate online course.
            </p>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>• Online forklift certification is $49 at the exam</li>
              <li>• This page does not claim a sensor reduces violations</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Proximity Sensor Types */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">Forklift Proximity Sensor Types</h2>
        <div className="space-y-6">
          {sensorTypes.map((sensor) => (
            <div key={sensor.name} className="bg-white rounded-xl p-8 shadow-md border border-slate-200 hover:border-canyon-rust transition-colors">
              <div className="flex items-start gap-6">
                <div className="text-5xl flex-shrink-0">{sensor.icon}</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{sensor.name}</h3>
                  <p className="text-lg text-slate-700 mb-4">{sensor.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">Features:</h4>
                      <ul className="space-y-1">
                        {sensor.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-slate-700">
                            <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">Best For:</h4>
                      <ul className="space-y-1">
                        {sensor.applications.map((app) => (
                          <li key={app} className="flex items-start gap-2 text-slate-700">
                            <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                            <span>{app}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <Link 
                    href={proximityQuoteHref(`Request quote for ${sensor.name}`)}
                    className="inline-flex items-center px-6 py-3 bg-canyon-rust text-white font-semibold rounded-lg hover:bg-canyon-rust/90 transition-colors"
                  >
                    Request Quote for {sensor.name}
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Brand Compatibility */}
      <section className="mb-16">
        <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 text-center">
            Send the truck brand and model
          </h2>
          <p className="text-center text-slate-600 mb-6 max-w-2xl mx-auto">
            A listing is not a fit for every machine. Send the brand, model, and serial with the quote.
          </p>
          <p className="text-sm text-center text-slate-600">
            <Link href="/quote" className="text-canyon-rust hover:underline font-medium">
              Request a quote
            </Link>
          </p>
        </div>
      </section>

      {/* Installation & Support */}
      <section className="mb-16">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-8 shadow-md border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Quote</h3>
            </div>
            <p className="text-slate-700 mb-4">
              We do not install sensors on site. Send the truck brand, model, and the sensor you need. A listing is not a fit for every machine. Freight is calculated at checkout.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start gap-2 text-slate-700">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Send the part number or a photo of the sensor</span>
              </li>
              <li className="flex items-start gap-2 text-slate-700">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>We reply with a price and freight</span>
              </li>
            </ul>
            <Link 
              href={proximityQuoteHref("Proximity sensor quote")}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold"
            >
              Request a quote
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-md border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Catalog</h3>
            </div>
            <p className="text-slate-700 mb-4">
              Send the truck brand and model with the quote. We do not provide on-site troubleshooting or operator training with the part.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start gap-2 text-slate-700">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Quote for the sensor you need</span>
              </li>
              <li className="flex items-start gap-2 text-slate-700">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>A listing is not a fit for every machine</span>
              </li>
            </ul>
            <Link 
              href="/contact"
              className="inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold"
            >
              Contact
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* System Comparison */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Sensor types</h2>
        <p className="text-slate-700 max-w-3xl mx-auto text-center">
          This page does not publish detection ranges. Send the part number on the sensor with the quote. A listing is not a fit for every machine.
        </p>
      </section>

      {/* Fleet Solutions */}
      <section className="mb-16">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 md:p-12 border-2 border-indigo-200">
          <div className="max-w-4xl">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Fleet-Wide Safety Upgrades</h2>
            <p className="text-lg text-slate-700 mb-6">
              Send the truck count and the sensor part number. We quote the parts. We do not install them or run an on-site training program. Freight is calculated at checkout.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-white rounded-lg p-4 border border-indigo-200">
                <h4 className="font-semibold text-slate-900 mb-2">Fleet quote</h4>
                <p className="text-sm text-slate-600">Send the truck count and sensor type</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-indigo-200">
                <h4 className="font-semibold text-slate-900 mb-2">Same catalog</h4>
                <p className="text-sm text-slate-600">Each truck still needs its own fitment check</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-indigo-200">
                <h4 className="font-semibold text-slate-900 mb-2">Part number</h4>
                <p className="text-sm text-slate-600">Send the number on the sensor</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-indigo-200">
                <h4 className="font-semibold text-slate-900 mb-2">No on-site training</h4>
                <p className="text-sm text-slate-600">Forklift certification is a separate online course</p>
              </div>
            </div>

            <Link 
              href={proximityQuoteHref("Proximity sensors for more than one truck")}
              className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg text-lg"
            >
              Request Fleet Quote
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">Forklift Proximity Sensor FAQs</h2>
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-md border border-slate-200">
            <h3 className="text-lg font-semibold mb-3 text-slate-900">
              How much do forklift proximity sensors cost?
            </h3>
            <p className="text-slate-700">
              Request a quote with the truck brand, model, and the sensor type you need. Freight is calculated at checkout.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md border border-slate-200">
            <h3 className="text-lg font-semibold mb-3 text-slate-900">
              Can proximity sensors be retrofitted to existing forklifts?
            </h3>
            <p className="text-slate-700">
              Send the truck brand, model, and serial with the quote. A listing is not a fit for every machine.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md border border-slate-200">
            <h3 className="text-lg font-semibold mb-3 text-slate-900">
              What's the difference between ultrasonic and RFID proximity sensors?
            </h3>
            <p className="text-slate-700">
              This page does not publish a detection range for either type. Send the part number on the sensor with the quote.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md border border-slate-200">
            <h3 className="text-lg font-semibold mb-3 text-slate-900">
              Do proximity sensors reduce insurance costs?
            </h3>
            <p className="text-slate-700">
              This page does not publish an insurance discount, a payback period, or a claim reduction.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md border border-slate-200">
            <h3 className="text-lg font-semibold mb-3 text-slate-900">
              Are proximity sensors required by OSHA?
            </h3>
            <p className="text-slate-700">
              This page does not say sensors are required, and it does not publish a penalty reduction. Forklift certification is a separate online course.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mb-12">
        <div className="bg-gradient-to-r from-canyon-rust to-orange-600 rounded-2xl p-10 text-center text-white shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Improve Your Forklift Safety?
          </h2>
          <p className="text-xl mb-8 text-orange-100 max-w-2xl mx-auto">
            Request a quote with the truck brand, model, and sensor part number. Freight is calculated at checkout.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link 
              href={proximityQuoteHref("Forklift proximity sensors — custom quote")}
              className="bg-white text-canyon-rust px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-lg text-lg"
            >
              Get Custom Quote
            </Link>
            <Link 
              href="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white/10 transition-colors text-lg"
            >
              Speak to Expert
            </Link>
          </div>
          <p className="text-sm text-orange-100 mt-6">
            Freight is calculated at checkout.
          </p>
        </div>
      </section>

      {/* Related Resources */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Safety Resources</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Link 
            href="/insights/enhancing-forklift-safety-tech"
            className="bg-white rounded-xl p-6 shadow-md border border-slate-200 hover:border-canyon-rust transition-colors group"
          >
            <div className="text-3xl mb-3">📚</div>
            <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-canyon-rust">
              Proximity Sensor Technology Guide
            </h3>
            <p className="text-sm text-slate-600 mb-3">
              Comprehensive guide to how proximity sensors work and their benefits for warehouse safety
            </p>
            <span className="text-sm text-canyon-rust font-medium group-hover:underline">
              Read article →
            </span>
          </Link>

          <Link 
            href="/safety"
            className="bg-white rounded-xl p-6 shadow-md border border-slate-200 hover:border-canyon-rust transition-colors group"
          >
            <div className="text-3xl mb-3">🎓</div>
            <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-canyon-rust">
              Forklift Operator Certification
            </h3>
            <p className="text-sm text-slate-600 mb-3">
              OSHA-compliant online forklift certification. Complete in 60 minutes. $49 at the final exam.
            </p>
            <span className="text-sm text-canyon-rust font-medium group-hover:underline">
              Get certified →
            </span>
          </Link>

          <Link 
            href="/parts/attachments"
            className="bg-white rounded-xl p-6 shadow-md border border-slate-200 hover:border-canyon-rust transition-colors group"
          >
            <div className="text-3xl mb-3">🔧</div>
            <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-canyon-rust">
              Forklift Attachments & Accessories
            </h3>
            <p className="text-sm text-slate-600 mb-3">
              Browse forks, clamps, rotators and other forklift attachments for enhanced safety and efficiency
            </p>
            <span className="text-sm text-canyon-rust font-medium group-hover:underline">
              Shop attachments →
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}

