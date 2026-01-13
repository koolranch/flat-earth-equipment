import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Forklift Proximity Sensors | Pedestrian Detection Systems | Safety Equipment",
  description: "Shop forklift proximity sensors, pedestrian detection systems, and safety equipment. Ultrasonic, RFID, laser sensors for Toyota, Crown, Yale, Hyster forklifts. Same-day shipping.",
  keywords: "forklift proximity sensor, pedestrian detection system, forklift safety sensors, ultrasonic forklift sensor, RFID pedestrian alert, warehouse safety equipment",
  alternates: {
    canonical: "https://www.flatearthequipment.com/parts/safety/forklift-proximity-sensors"
  },
  openGraph: {
    title: "Forklift Proximity Sensors & Pedestrian Detection Systems",
    description: "Professional-grade proximity sensors and pedestrian detection systems for all major forklift brands. Reduce accidents and improve warehouse safety.",
    url: "https://www.flatearthequipment.com/parts/safety/forklift-proximity-sensors"
  }
};

export default function ForkliftProximitySensorsPage() {
  const sensorTypes = [
    {
      name: "Ultrasonic Proximity Sensors",
      description: "High-frequency sound wave sensors detect objects and pedestrians within the forklift's path",
      features: [
        "Detection range: 0.5m - 8m",
        "Works in dusty/dirty environments",
        "Weather-resistant housing",
        "Adjustable sensitivity levels"
      ],
      applications: ["Warehouse blind corners", "Loading dock areas", "High-traffic zones"],
      icon: "🔊"
    },
    {
      name: "RFID Pedestrian Detection",
      description: "Radio frequency identification tags worn by personnel trigger alerts when they enter forklift zones",
      features: [
        "360° detection coverage",
        "Wearable tags for workers",
        "Real-time proximity alerts",
        "Multi-zone configuration"
      ],
      applications: ["High-density warehouses", "Mixed pedestrian/forklift areas", "Cross-dock facilities"],
      icon: "📡"
    },
    {
      name: "Laser Object Detection",
      description: "Precision laser sensors create detection zones around forklifts for maximum safety",
      features: [
        "Precise detection accuracy",
        "Configurable detection zones",
        "Speed-based alert adjustment",
        "Visual & audible warnings"
      ],
      applications: ["Narrow aisle operations", "Precision manufacturing", "Cold storage facilities"],
      icon: "⚡"
    },
    {
      name: "Camera-Based Systems",
      description: "Integrated camera systems with AI-powered object detection and blind spot monitoring",
      features: [
        "360° camera coverage",
        "AI pedestrian recognition",
        "Recording capability",
        "Night vision options"
      ],
      applications: ["24/7 operations", "Outdoor yards", "Multi-shift facilities"],
      icon: "📹"
    }
  ];

  const compatibleBrands = [
    "Toyota", "Crown", "Yale", "Hyster", "Raymond", "Caterpillar", 
    "Nissan", "Mitsubishi", "Clark", "Komatsu", "Doosan", "Jungheinrich"
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-600 mb-8">
        <Link href="/" className="hover:text-canyon-rust transition-colors">Home</Link>
        <span>/</span>
        <Link href="/parts" className="hover:text-canyon-rust transition-colors">Parts</Link>
        <span>/</span>
        <Link href="/parts/safety" className="hover:text-canyon-rust transition-colors">Safety Equipment</Link>
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
              Reduce forklift accidents by up to 80% with professional-grade proximity sensors and pedestrian detection systems. 
              Compatible with Toyota, Crown, Yale, Hyster, and all major forklift brands. Same-day shipping available.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <Link 
                href="/quote?product=proximity-sensors" 
                className="bg-canyon-rust text-white px-8 py-4 rounded-lg font-semibold hover:bg-canyon-rust/90 transition-colors shadow-lg text-lg"
              >
                Get Pricing & Quote
              </Link>
              <Link 
                href="/contact" 
                className="border-2 border-canyon-rust text-canyon-rust px-8 py-4 rounded-lg font-semibold hover:bg-canyon-rust hover:text-white transition-colors text-lg"
              >
                Technical Consultation
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Professional installation support</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>All major forklift brands</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Expert technical support</span>
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
            Protect your workers and reduce liability with proven safety technology
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-slate-200">
            <div className="text-5xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">Prevent Accidents</h3>
            <p className="text-slate-700 mb-4">
              Reduce pedestrian-forklift accidents by up to 80%. Sensors detect people and objects before collisions occur.
            </p>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>• Automatic speed reduction</li>
              <li>• Visual & audible warnings</li>
              <li>• Blind spot elimination</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-slate-200">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">Reduce Costs</h3>
            <p className="text-slate-700 mb-4">
              Lower insurance premiums, workers' comp claims, and equipment damage costs with proven safety systems.
            </p>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>• Lower insurance rates</li>
              <li>• Fewer injury claims</li>
              <li>• Reduced equipment damage</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-slate-200">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">OSHA Compliance</h3>
            <p className="text-slate-700 mb-4">
              Demonstrate proactive safety measures during OSHA inspections. Shows commitment to worker protection.
            </p>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>• Reduces OSHA violations</li>
              <li>• Documented safety measures</li>
              <li>• Liability protection</li>
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
                    href="/quote?product=proximity-sensors&type=" 
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
            Compatible with All Major Forklift Brands
          </h2>
          <p className="text-center text-slate-600 mb-6 max-w-2xl mx-auto">
            Our proximity sensor systems are designed to integrate seamlessly with forklifts from all major manufacturers
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {compatibleBrands.map((brand) => (
              <div key={brand} className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium">
                {brand}
              </div>
            ))}
          </div>
          <p className="text-sm text-center text-slate-600">
            Not sure which system fits your forklift? Our technical team provides free consultation.{" "}
            <Link href="/contact" className="text-canyon-rust hover:underline font-medium">
              Contact us →
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
              <h3 className="text-2xl font-bold text-slate-900">Professional Installation</h3>
            </div>
            <p className="text-slate-700 mb-4">
              Our certified technicians provide on-site installation and system integration. We ensure proper sensor placement, 
              calibration, and operator training for optimal safety performance.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start gap-2 text-slate-700">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Complete system installation</span>
              </li>
              <li className="flex items-start gap-2 text-slate-700">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Sensor calibration & testing</span>
              </li>
              <li className="flex items-start gap-2 text-slate-700">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Operator training included</span>
              </li>
              <li className="flex items-start gap-2 text-slate-700">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Documentation & compliance support</span>
              </li>
            </ul>
            <Link 
              href="/quote?service=sensor-installation"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold"
            >
              Schedule Installation
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
              <h3 className="text-2xl font-bold text-slate-900">Technical Support</h3>
            </div>
            <p className="text-slate-700 mb-4">
              Our team of safety equipment specialists provides ongoing technical support, troubleshooting, 
              and maintenance guidance to keep your systems operating at peak performance.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start gap-2 text-slate-700">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Free system consultation</span>
              </li>
              <li className="flex items-start gap-2 text-slate-700">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Troubleshooting assistance</span>
              </li>
              <li className="flex items-start gap-2 text-slate-700">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Maintenance planning</span>
              </li>
              <li className="flex items-start gap-2 text-slate-700">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Fleet-wide implementation</span>
              </li>
            </ul>
            <Link 
              href="/contact"
              className="inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold"
            >
              Contact Technical Team
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* System Comparison */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Choose the Right System for Your Operation</h2>
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-xl shadow-md border border-slate-200">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="py-4 px-6 text-left font-semibold text-slate-900">Sensor Type</th>
                <th className="py-4 px-6 text-left font-semibold text-slate-900">Detection Range</th>
                <th className="py-4 px-6 text-left font-semibold text-slate-900">Environment</th>
                <th className="py-4 px-6 text-left font-semibold text-slate-900">Best Use</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-4 px-6 font-semibold text-slate-900">Ultrasonic</td>
                <td className="py-4 px-6 text-slate-700">0.5m - 8m</td>
                <td className="py-4 px-6 text-slate-700">Indoor/Outdoor, Dusty</td>
                <td className="py-4 px-6 text-slate-700">General warehouse, loading docks</td>
              </tr>
              <tr className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-4 px-6 font-semibold text-slate-900">RFID</td>
                <td className="py-4 px-6 text-slate-700">2m - 10m (360°)</td>
                <td className="py-4 px-6 text-slate-700">Indoor, climate controlled</td>
                <td className="py-4 px-6 text-slate-700">High-density pedestrian areas</td>
              </tr>
              <tr className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-4 px-6 font-semibold text-slate-900">Laser</td>
                <td className="py-4 px-6 text-slate-700">0.1m - 50m</td>
                <td className="py-4 px-6 text-slate-700">Indoor, clean environments</td>
                <td className="py-4 px-6 text-slate-700">Narrow aisles, precision ops</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-4 px-6 font-semibold text-slate-900">Camera + AI</td>
                <td className="py-4 px-6 text-slate-700">5m - 20m (visual)</td>
                <td className="py-4 px-6 text-slate-700">Any environment, 24/7</td>
                <td className="py-4 px-6 text-slate-700">Multi-shift, outdoor yards</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Fleet Solutions */}
      <section className="mb-16">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 md:p-12 border-2 border-indigo-200">
          <div className="max-w-4xl">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Fleet-Wide Safety Upgrades</h2>
            <p className="text-lg text-slate-700 mb-6">
              Upgrading multiple forklifts? We offer volume pricing and fleet implementation services to help you improve 
              safety across your entire operation efficiently and cost-effectively.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-white rounded-lg p-4 border border-indigo-200">
                <h4 className="font-semibold text-slate-900 mb-2">✓ Volume Pricing</h4>
                <p className="text-sm text-slate-600">Discounts for 5+ forklifts</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-indigo-200">
                <h4 className="font-semibold text-slate-900 mb-2">✓ Phased Rollout</h4>
                <p className="text-sm text-slate-600">Implement gradually across fleet</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-indigo-200">
                <h4 className="font-semibold text-slate-900 mb-2">✓ Standardization</h4>
                <p className="text-sm text-slate-600">Consistent systems fleet-wide</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-indigo-200">
                <h4 className="font-semibold text-slate-900 mb-2">✓ Training Programs</h4>
                <p className="text-sm text-slate-600">Operator training for all shifts</p>
              </div>
            </div>

            <Link 
              href="/quote?product=fleet-safety-upgrade"
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
              Proximity sensor systems typically range from $800-$3,500 per forklift depending on the technology type and features. 
              Ultrasonic sensors are the most cost-effective ($800-$1,500), while advanced camera-based AI systems cost $2,500-$3,500. 
              We offer volume discounts for fleet installations and provide custom quotes based on your specific needs.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md border border-slate-200">
            <h3 className="text-lg font-semibold mb-3 text-slate-900">
              Can proximity sensors be retrofitted to existing forklifts?
            </h3>
            <p className="text-slate-700">
              Yes! Most proximity sensor systems can be retrofitted to any forklift, regardless of age or brand. Our systems are designed 
              for universal compatibility with Toyota, Crown, Yale, Hyster, Raymond, and all major forklift manufacturers. Installation 
              typically takes 2-4 hours per unit with minimal downtime.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md border border-slate-200">
            <h3 className="text-lg font-semibold mb-3 text-slate-900">
              What's the difference between ultrasonic and RFID proximity sensors?
            </h3>
            <p className="text-slate-700">
              Ultrasonic sensors use sound waves to detect ANY object or person within range, providing general proximity alerts. 
              RFID systems require workers to wear tags and provide more precise person-specific alerts with 360° coverage. 
              Ultrasonic is better for general object detection, while RFID excels in high-pedestrian environments where workers wear tags.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md border border-slate-200">
            <h3 className="text-lg font-semibold mb-3 text-slate-900">
              Do proximity sensors reduce insurance costs?
            </h3>
            <p className="text-slate-700">
              Many insurance providers offer premium reductions of 5-15% for warehouses that implement proven safety technologies like 
              proximity sensors. The ROI typically comes from reduced accident rates, lower workers' compensation claims, and decreased 
              equipment damage. Most facilities see payback within 12-18 months through combined savings.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md border border-slate-200">
            <h3 className="text-lg font-semibold mb-3 text-slate-900">
              Are proximity sensors required by OSHA?
            </h3>
            <p className="text-slate-700">
              While OSHA doesn't specifically mandate proximity sensors, they require employers to provide a safe workplace and take 
              measures to prevent forklift accidents (29 CFR 1910.178). Installing proximity sensors demonstrates proactive safety 
              compliance and can significantly reduce OSHA violation risks and penalties.
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
            Get a custom quote for proximity sensors tailored to your fleet and facility requirements
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link 
              href="/quote?product=proximity-sensors"
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
            📞 Call for urgent safety upgrades • ⚡ Same-day shipping available • 🛡️ Reduce accidents by 80%
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
              OSHA-compliant online forklift certification. Complete in 60 minutes. Just $59.
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

