import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { AlertTriangle, CheckCircle, Phone, Mail, Search, Wrench, Settings, Zap, BookOpen, Clock, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: "K21 Engine Guide: Nissan Forklift Engine Parts & Specs | Flat Earth Equipment",
  description: "Complete K21 engine guide for Nissan forklifts. K21 engine specifications, maintenance, troubleshooting, and replacement parts. Expert support available.",
  keywords: "k21 engine, nissan k21 engine, k21 forklift engine, k21 engine parts, k21 specifications, k21 maintenance, forklift engine",
  alternates: {
    canonical: "/parts/forklift-parts/nissan-k21-forklift-engine",
  },
  openGraph: {
    title: "K21 Engine Guide: Nissan Forklift Engine Parts & Specs",
    description: "Complete K21 engine guide for Nissan forklifts. K21 engine specifications, maintenance, troubleshooting, and replacement parts.",
    url: "https://flatearthequipment.com/parts/forklift-parts/nissan-k21-forklift-engine",
    type: "website",
    images: [
      {
        url: "/images/k21-engine-guide.jpg",
        width: 1200,
        height: 630,
        alt: "Nissan K21 Engine for Forklifts"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "K21 Engine Guide: Nissan Forklift Engine Parts & Specs",
    description: "Complete K21 engine guide for Nissan forklifts. Specifications, maintenance, and parts.",
  }
};

export default function NissanK21EnginePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Nissan K21 Engine",
    "description": "Reliable 2.1L 4-cylinder engine for Nissan forklifts. The K21 engine offers 45-50 HP power output and runs on LPG/Propane fuel.",
    "brand": {
      "@type": "Brand",
      "name": "Nissan"
    },
    "category": "Forklift Engine",
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Displacement",
        "value": "2.1L (2,068 cc)"
      },
      {
        "@type": "PropertyValue", 
        "name": "Power Output",
        "value": "45-50 HP"
      },
      {
        "@type": "PropertyValue",
        "name": "Fuel Type", 
        "value": "LPG/Propane"
      },
      {
        "@type": "PropertyValue",
        "name": "Engine Type",
        "value": "4-cylinder, water-cooled"
      }
    ],
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock",
      "priceCurrency": "USD"
    }
  };

  return (
    <>
      <Script id="k21-engine-structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-slate-600 mb-6">
          <Link href="/" className="hover:text-slate-900">Home</Link>
          <span>/</span>
          <Link href="/parts" className="hover:text-slate-900">Parts</Link>
          <span>/</span>
          <Link href="/parts/forklift-parts" className="hover:text-slate-900">Forklift Parts</Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">K21 Engine</span>
        </nav>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                K21 Engine Guide
              </h1>
              <p className="text-xl text-slate-600">
                Complete guide for the Nissan K21 forklift engine
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
              <Zap className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-slate-900">45-50 HP</h3>
                <p className="text-sm text-slate-600">Power Output</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
              <Settings className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-slate-900">2.1L Displacement</h3>
                <p className="text-sm text-slate-600">Engine Size</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
              <CheckCircle className="h-6 w-6 text-orange-600" />
              <div>
                <h3 className="font-semibold text-slate-900">LPG/Propane</h3>
                <p className="text-sm text-slate-600">Fuel Type</p>
              </div>
            </div>
          </div>
        </div>

        <div className="prose prose-slate max-w-none">
          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8">
            <p className="text-lg text-slate-700 mb-0">
              The <strong>K21 engine</strong> is a reliable and efficient 4-cylinder powerplant commonly found in Nissan forklifts. 
              This comprehensive <strong>K21 engine guide</strong> covers specifications, maintenance schedules, troubleshooting, 
              and replacement parts for optimal performance.
            </p>
          </div>

        {/* K21 Engine Specifications */}
        <div className="bg-white border border-slate-200 rounded-lg p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">K21 Engine Specifications</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                <span className="font-medium text-slate-700">Engine Type:</span>
                <span className="text-slate-900">4-cylinder, water-cooled</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                <span className="font-medium text-slate-700">Displacement:</span>
                <span className="text-slate-900">2.1L (2,068 cc)</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                <span className="font-medium text-slate-700">Power Output:</span>
                <span className="text-slate-900">45-50 HP</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                <span className="font-medium text-slate-700">Fuel Type:</span>
                <span className="text-slate-900">LPG/Propane</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                <span className="font-medium text-slate-700">Cooling System:</span>
                <span className="text-slate-900">Liquid-cooled</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                <span className="font-medium text-slate-700">Bore x Stroke:</span>
                <span className="text-slate-900">85mm x 91mm</span>
              </div>
            </div>
          </div>
        </div>

        {/* K21 Engine Applications */}
        <div className="bg-white border border-slate-200 rounded-lg p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 p-2 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">K21 Engine Applications</h2>
          </div>
          
          <p className="text-slate-600 mb-6">
            The <strong>K21 engine</strong> is widely used across multiple Nissan forklift models, 
            providing reliable power for material handling operations.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span className="font-medium text-slate-900">Nissan FD30 Forklift</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span className="font-medium text-slate-900">Nissan FD40 Forklift</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span className="font-medium text-slate-900">Nissan FD50 Forklift</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span className="font-medium text-slate-900">Nissan FD60 Forklift</span>
            </div>
          </div>
        </div>

        <div className="space-y-8">

          {/* K21 Engine Maintenance */}
          <section className="bg-white border border-slate-200 rounded-lg p-8 mb-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">K21 Engine Maintenance Schedule</h2>
            </div>
            
            <p className="text-slate-600 mb-8">
              Proper maintenance is crucial for optimal <strong>K21 engine</strong> performance and longevity. 
              Follow this comprehensive maintenance schedule to keep your engine running smoothly.
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    D
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Daily Checks</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Check engine oil level</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Inspect coolant level</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Check for leaks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Listen for unusual noises</span>
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    250
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Every 250 Hours</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Change engine oil and filter</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Check and adjust valve clearance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Inspect spark plugs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Check ignition timing</span>
                  </li>
                </ul>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    500
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Every 500 Hours</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-orange-600 mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Replace air filter</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-orange-600 mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Change fuel filter</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-orange-600 mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Check and adjust carburetor</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-orange-600 mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Inspect cooling system</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* K21 Engine Troubleshooting */}
          <section className="bg-white border border-slate-200 rounded-lg p-8 mb-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">K21 Engine Troubleshooting</h2>
            </div>
            
            <p className="text-slate-600 mb-8">
              Experiencing issues with your <strong>K21 engine</strong>? Use this troubleshooting guide to diagnose 
              and resolve common problems quickly and efficiently.
            </p>
            
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                  <h3 className="text-xl font-bold text-slate-900">Hard Starting</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <Wrench className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Check spark plugs and ignition system</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Wrench className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Verify fuel pressure and delivery</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Wrench className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Inspect carburetor for proper adjustment</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Wrench className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Check battery condition and connections</span>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="h-6 w-6 text-orange-600" />
                  <h3 className="text-xl font-bold text-slate-900">Overheating</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <Wrench className="h-4 w-4 text-orange-600 mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Check coolant level and condition</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Wrench className="h-4 w-4 text-orange-600 mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Inspect radiator and cooling system</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Wrench className="h-4 w-4 text-orange-600 mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Verify thermostat operation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Wrench className="h-4 w-4 text-orange-600 mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Check water pump function</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Settings className="h-6 w-6 text-yellow-600" />
                  <h3 className="text-xl font-bold text-slate-900">Loss of Power</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <Wrench className="h-4 w-4 text-yellow-600 mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Check air filter condition</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Wrench className="h-4 w-4 text-yellow-600 mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Inspect fuel system components</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Wrench className="h-4 w-4 text-yellow-600 mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Verify valve adjustment</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Wrench className="h-4 w-4 text-yellow-600 mt-1 flex-shrink-0" />
                    <span className="text-slate-700">Check compression levels</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* K21 Engine FAQ */}
          <section className="bg-white border border-slate-200 rounded-lg p-8 mb-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Search className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">K21 Engine FAQ</h2>
            </div>
            
            <div className="space-y-4">
              <details className="group bg-slate-50 rounded-lg">
                <summary className="flex items-center justify-between cursor-pointer p-4 font-semibold text-slate-900 group-open:border-b border-slate-200">
                  What is the horsepower of a K21 engine?
                  <span className="transition-transform group-open:rotate-180">▼</span>
                </summary>
                <div className="p-4 text-slate-700">
                  The <strong>K21 engine</strong> produces 45-50 horsepower, making it ideal for mid-size forklift applications 
                  including the Nissan FD30, FD40, FD50, and FD60 models.
                </div>
              </details>
              
              <details className="group bg-slate-50 rounded-lg">
                <summary className="flex items-center justify-between cursor-pointer p-4 font-semibold text-slate-900 group-open:border-b border-slate-200">
                  What fuel does the K21 engine use?
                  <span className="transition-transform group-open:rotate-180">▼</span>
                </summary>
                <div className="p-4 text-slate-700">
                  The <strong>K21 engine</strong> is designed to run on LPG (Liquid Propane Gas) or propane, 
                  providing clean combustion and reduced emissions compared to gasoline engines.
                </div>
              </details>
              
              <details className="group bg-slate-50 rounded-lg">
                <summary className="flex items-center justify-between cursor-pointer p-4 font-semibold text-slate-900 group-open:border-b border-slate-200">
                  How often should I service my K21 engine?
                  <span className="transition-transform group-open:rotate-180">▼</span>
                </summary>
                <div className="p-4 text-slate-700">
                  Follow the maintenance schedule: daily checks for oil and coolant, oil changes every 250 hours, 
                  and major service (filters, carburetor) every 500 hours for optimal <strong>K21 engine</strong> performance.
                </div>
              </details>
              
              <details className="group bg-slate-50 rounded-lg">
                <summary className="flex items-center justify-between cursor-pointer p-4 font-semibold text-slate-900 group-open:border-b border-slate-200">
                  Where can I get K21 engine parts?
                  <span className="transition-transform group-open:rotate-180">▼</span>
                </summary>
                <div className="p-4 text-slate-700">
                  Flat Earth Equipment stocks genuine and aftermarket <strong>K21 engine parts</strong> with same-day dispatch. 
                  Use our quote form below to get pricing on specific parts for your forklift.
                </div>
              </details>
            </div>
          </section>
        </div>
        </div>

        {/* Quote Form */}
        <div className="bg-gradient-to-r from-canyon-rust to-orange-600 text-white rounded-lg p-8 mt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold">Get K21 Engine Parts Quote</h3>
          </div>
          
          <p className="text-orange-100 mb-6">
            Need <strong>K21 engine parts</strong>? Get a fast, accurate quote from our experts. 
            We stock genuine and aftermarket parts for all Nissan forklift models.
          </p>
          <form
            method="POST"
            action="https://usebasin.com/f/185fb14aac45"
            className="space-y-4"
          >
                          <input type="hidden" name="subject" value="Nissan K21 Engine Quote Request" />
              <input type="hidden" name="form_name" value="nissan_k21_quote" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="name"
                placeholder="Your Name"
                required
                autoComplete="name"
                className="w-full bg-white bg-opacity-90 border border-orange-200 px-4 py-3 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                required
                autoComplete="email"
                className="w-full bg-white bg-opacity-90 border border-orange-200 px-4 py-3 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="model"
                placeholder="Forklift Model (e.g. FD30)"
                className="w-full bg-white bg-opacity-90 border border-orange-200 px-4 py-3 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
              />
              <input
                name="serial"
                placeholder="Serial Number (optional)"
                className="w-full bg-white bg-opacity-90 border border-orange-200 px-4 py-3 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
              />
            </div>

            <textarea
              name="message"
              placeholder="What K21 engine parts do you need? Include specific part numbers or describe the issue you're experiencing."
              rows={4}
              required
              className="w-full bg-white bg-opacity-90 border border-orange-200 px-4 py-3 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
            />

            <button
              type="submit"
              className="w-full bg-white text-canyon-rust px-6 py-4 rounded-lg font-bold text-lg hover:bg-slate-50 transition-all transform hover:scale-105 shadow-lg"
            >
              Get K21 Engine Parts Quote
            </button>

            <div className="flex items-center justify-center gap-6 text-orange-100 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Same-day dispatch</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Nationwide shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Expert support</span>
              </div>
            </div>
          </form>
        </div>

        {/* Related Resources */}
        <div className="bg-white border border-slate-200 rounded-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Related K21 Engine Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/insights/nissan-k21-forklift-engine" className="group">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 hover:shadow-md transition-all group-hover:border-blue-300">
                <div className="flex items-center gap-3 mb-3">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-slate-900 group-hover:text-blue-600">K21 Engine Insights</h3>
                </div>
                <p className="text-sm text-slate-600">
                  In-depth analysis of K21 engine performance, specifications, and comparisons with other models.
                </p>
              </div>
            </Link>
            
            <Link href="/parts/forklift-parts" className="group">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 hover:shadow-md transition-all group-hover:border-green-300">
                <div className="flex items-center gap-3 mb-3">
                  <Settings className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-slate-900 group-hover:text-green-600">Forklift Parts Catalog</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Browse our complete inventory of forklift parts for all major brands and models.
                </p>
              </div>
            </Link>
            
            <Link href="/rental/forklifts" className="group">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 hover:shadow-md transition-all group-hover:border-orange-300">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="h-5 w-5 text-orange-600" />
                  <h3 className="font-semibold text-slate-900 group-hover:text-orange-600">Forklift Rentals</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Rent quality forklifts with K21 engines for short-term or long-term projects.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
} 