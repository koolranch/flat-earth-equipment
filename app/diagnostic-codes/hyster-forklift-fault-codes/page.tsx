import { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import HysterCodeBrowser from '@/components/diagnostic/HysterCodeBrowser';

export const metadata: Metadata = {
  title: "Hyster Forklift Fault Codes & Error Codes | Complete Reference Guide",
  description: "Searchable database of 40+ Hyster forklift fault codes. AL-series, Err-series, P-codes, and SPN codes for all Hyster models with troubleshooting.",
  alternates: {
    canonical: "/diagnostic-codes/hyster-forklift-fault-codes",
  },
  openGraph: {
    title: "Hyster Forklift Fault Codes: Complete Diagnostic Reference",
    description: "Comprehensive guide to Hyster fault codes including AL-series, Err-series, and engine codes. Expert troubleshooting for all Hyster models.",
    type: "article",
  },
};

export default function HysterFaultCodesPage() {
  return (
    <>
      {/* Breadcrumb Schema */}
      <Script id="breadcrumb-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.flatearthequipment.com" },
            { "@type": "ListItem", "position": 2, "name": "Diagnostic Codes", "item": "https://www.flatearthequipment.com/diagnostic-codes" },
            { "@type": "ListItem", "position": 3, "name": "Hyster Fault Codes", "item": "https://www.flatearthequipment.com/diagnostic-codes/hyster-forklift-fault-codes" }
          ]
        })}
      </Script>

    <main className="max-w-4xl mx-auto px-4 py-12">
      {/* Quick Action Buttons */}
      <div className="not-prose mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/hyster-serial-number-lookup" className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-xl transition-all hover:shadow-md">
          <span className="text-2xl">🔍</span>
          <span className="text-xs sm:text-sm font-semibold text-center text-slate-800">Hyster Serial Lookup</span>
        </Link>
        <Link href="/parts?brand=hyster" className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-xl transition-all hover:shadow-md">
          <span className="text-2xl">🔧</span>
          <span className="text-xs sm:text-sm font-semibold text-center text-slate-800">Hyster Parts</span>
        </Link>
        <Link href="/brand/hyster" className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-xl transition-all hover:shadow-md">
          <span className="text-2xl">📚</span>
          <span className="text-xs sm:text-sm font-semibold text-center text-slate-800">Hyster Resources</span>
        </Link>
        <Link href="/quote" className="flex flex-col items-center gap-2 p-4 bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 rounded-xl transition-all hover:shadow-md">
          <span className="text-2xl">💬</span>
          <span className="text-xs sm:text-sm font-semibold text-center text-slate-800">Get Help</span>
        </Link>
      </div>

      <h1 className="text-4xl font-bold text-slate-900 mb-4">
        Hyster Forklift Fault Codes & Error Codes
      </h1>
      
      <p className="text-lg text-slate-600 mb-8">
        Comprehensive searchable database of 40+ Hyster forklift diagnostic codes. Covers AL-series, Err-series, P-codes, and SPN codes for electric and IC models across A, E, H, J, RS, and S series.
      </p>

      {/* At-a-Glance Box */}
      <div className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">⚡</span> Hyster Code Series Guide
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-semibold text-blue-800 mb-1">AL Series:</div>
            <div className="text-slate-700">Component faults (battery, motor, hydraulic)</div>
          </div>
          <div>
            <div className="font-semibold text-blue-800 mb-1">Err Series:</div>
            <div className="text-slate-700">Display, EEPROM, sensor, communication errors</div>
          </div>
          <div>
            <div className="font-semibold text-blue-800 mb-1">P-Series:</div>
            <div className="text-slate-700">Engine system codes (diesel/LPG models)</div>
          </div>
          <div>
            <div className="font-semibold text-blue-800 mb-1">SPN Codes:</div>
            <div className="text-slate-700">Specific component faults</div>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="mb-8 bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">⚠️</span>
          <div>
            <h2 className="font-bold text-amber-900 mb-2">Before Diagnosing</h2>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• <strong>Record exact code:</strong> Note code and any error messages displayed</li>
              <li>• <strong>Identify your model:</strong> <Link href="/hyster-serial-number-lookup" className="underline font-semibold">Use serial lookup tool</Link> for accurate diagnostics</li>
              <li>• <strong>Check manual:</strong> Codes can vary by series (A, E, H, J, RS, S)</li>
              <li>• <strong>Use diagnostic tools:</strong> Jaltest or Hyster handset recommended for detailed scans</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Searchable Code Browser */}
      <HysterCodeBrowser />

      {/* General Troubleshooting */}
      <div className="prose prose-slate max-w-none my-12">
        <h2>General Hyster Fault Code Troubleshooting</h2>
        <p>When your Hyster forklift displays a fault code:</p>
        <ol>
          <li><strong>Stop operations immediately</strong> - Safety first</li>
          <li><strong>Record the code and symptoms</strong> - Document everything</li>
          <li><strong>Check basic systems</strong> - Battery voltage, connections, fluid levels</li>
          <li><strong>Use diagnostic tools</strong> - Jaltest or Hyster handset for detailed diagnosis</li>
          <li><strong>Consult model-specific manual</strong> - Codes vary by series</li>
          <li><strong>Clear code after repair</strong> - Test to ensure issue is resolved</li>
        </ol>

        <h3>Diagnostic Tool Recommendations</h3>
        <ul>
          <li><strong>Jaltest Diagnostic System</strong> - Professional multi-brand scanner</li>
          <li><strong>Hyster Handset</strong> - OEM diagnostic tool for Hyster/Yale</li>
          <li><strong>Hypass Online</strong> - Access to service manuals and procedures</li>
        </ul>

        <h3>When to Call for Professional Help</h3>
        <ul>
          <li>High severity codes (AL10, ErrE615/616, P3001)</li>
          <li>Multiple codes appearing simultaneously</li>
          <li>Code persists after basic troubleshooting</li>
          <li>Electrical or controller faults (requires specialized tools)</li>
          <li>Safety system codes (brake, seat sensor, alarm)</li>
        </ul>
      </div>

      {/* Parts CTA */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6 sm:p-8 mb-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Need Hyster Forklift Parts?</h2>
          <p className="text-slate-700 mb-6 max-w-2xl mx-auto">
            We stock sensors, controllers, contactors, and electrical components for Hyster forklifts. Get the right parts to fix your fault codes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/parts?brand=hyster" className="inline-flex items-center gap-2 bg-[#F76511] text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-md hover:shadow-lg">
              Shop Hyster Parts →
            </Link>
            <Link href="/quote" className="inline-flex items-center gap-2 bg-white text-[#F76511] border-2 border-[#F76511] px-8 py-3 rounded-xl font-bold hover:bg-orange-50 transition-all">
              Request Diagnostic Help
            </Link>
          </div>
        </div>
      </div>

      {/* Related Resources */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Related Hyster Forklift Resources</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/hyster-serial-number-lookup" className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all">
            <span className="text-2xl">🔍</span>
            <div>
              <div className="font-semibold text-slate-900">Hyster Serial Number Lookup</div>
              <div className="text-sm text-slate-600">Identify your forklift's year and model series</div>
            </div>
          </Link>
          <Link href="/brand/hyster" className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all">
            <span className="text-2xl">📚</span>
            <div>
              <div className="font-semibold text-slate-900">Hyster Brand Hub</div>
              <div className="text-sm text-slate-600">Parts, guides, and resources</div>
            </div>
          </Link>
          <Link href="/parts?brand=hyster" className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all">
            <span className="text-2xl">🔧</span>
            <div>
              <div className="font-semibold text-slate-900">Hyster Parts Catalog</div>
              <div className="text-sm text-slate-600">Sensors, controllers, contactors</div>
            </div>
          </Link>
          <Link href="/contact" className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all">
            <span className="text-2xl">📞</span>
            <div>
              <div className="font-semibold text-slate-900">Expert Support</div>
              <div className="text-sm text-slate-600">Talk to Hyster specialists</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Model-Specific Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-blue-900 mb-2">Model-Specific Codes</h3>
        <p className="text-sm text-blue-800 mb-3">
          Hyster fault codes can vary significantly by model series (A380, H40-60XT, S55FTS, etc.) and power type (electric, diesel, LPG). Many codes are shared with Yale forklifts due to common parent company and control systems.
        </p>
        <p className="text-sm text-blue-800">
          For the most accurate diagnosis, always consult your specific model's service manual via Hypass Online or contact <Link href="/quote" className="underline font-semibold">our technical team</Link> with your model and serial number.
        </p>
      </div>
    </main>
    </>
  );
}

