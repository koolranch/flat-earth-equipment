import { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import JCBCodeBrowser from '@/components/diagnostic/JCBCodeBrowser';

export const metadata: Metadata = {
  title: "JCB Telehandler Fault Codes List | 50+ Diagnostic Codes | Flat Earth Equipment",
  description: "Searchable database of 50+ JCB telehandler and excavator fault codes. P-codes, numeric codes for Loadall, JS series with detailed troubleshooting.",
  alternates: {
    canonical: "/rental/telehandler/jcb-telehandler-fault-codes-list",
  },
  openGraph: {
    title: "JCB Telehandler Fault Codes: Complete Diagnostic Database",
    description: "50+ JCB fault codes for telehandlers and excavators. Searchable P-codes, hydraulic, electrical faults with expert troubleshooting.",
    type: "article",
  },
};

export default function JCBTelehandlerFaultCodesPage() {
  return (
    <>
      <Script id="breadcrumb-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://flatearthequipment.com" },
            { "@type": "ListItem", "position": 2, "name": "Telehandler Resources", "item": "https://flatearthequipment.com/rental/telehandler" },
            { "@type": "ListItem", "position": 3, "name": "JCB Fault Codes", "item": "https://flatearthequipment.com/rental/telehandler/jcb-telehandler-fault-codes-list" }
          ]
        })}
      </Script>

    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="not-prose mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/jcb-serial-number-lookup" className="flex flex-col items-center gap-2 p-4 bg-yellow-50 hover:bg-yellow-100 border-2 border-yellow-300 rounded-xl transition-all">
          <span className="text-2xl">🔍</span>
          <span className="text-xs font-semibold text-center">JCB Serial Lookup</span>
        </Link>
        <Link href="/rental/telehandler/jcb-telehandler-battery-location" className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-xl transition-all">
          <span className="text-2xl">🔋</span>
          <span className="text-xs font-semibold text-center">Battery Location</span>
        </Link>
        <Link href="/parts?brand=jcb" className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-xl transition-all">
          <span className="text-2xl">🔧</span>
          <span className="text-xs font-semibold text-center">JCB Parts</span>
        </Link>
        <Link href="/quote" className="flex flex-col items-center gap-2 p-4 bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 rounded-xl transition-all">
          <span className="text-2xl">💬</span>
          <span className="text-xs font-semibold text-center">Get Help</span>
        </Link>
      </div>
      <h1 className="text-4xl font-bold text-slate-900 mb-4">
        JCB Telehandler & Excavator Fault Codes
      </h1>
      
      <p className="text-lg text-slate-600 mb-8">
        Searchable database of 50+ JCB fault codes for Loadall telehandlers and JS series excavators. P-codes, hydraulic codes, and machine system codes with detailed troubleshooting.
      </p>

      <div className="mb-8 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">⚡</span> JCB Code Series Guide
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-semibold text-yellow-800 mb-1">P-Codes:</div>
            <div className="text-slate-700">Engine system (fuel, sensors, turbo)</div>
          </div>
          <div>
            <div className="font-semibold text-yellow-800 mb-1">100-Series:</div>
            <div className="text-slate-700">Open circuit faults (sensors, solenoids)</div>
          </div>
          <div>
            <div className="font-semibold text-yellow-800 mb-1">200-Series:</div>
            <div className="text-slate-700">Short circuit faults</div>
          </div>
          <div>
            <div className="font-semibold text-yellow-800 mb-1">300-Series:</div>
            <div className="text-slate-700">CAN communication & calibration</div>
          </div>
        </div>
      </div>

      <div className="mb-8 bg-red-50 border-2 border-red-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h2 className="font-bold text-red-900 mb-2">Important Safety Notice</h2>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• <strong>Stop operations</strong> when fault code appears</li>
              <li>• <strong>Record code and symptoms</strong> for diagnosis</li>
              <li>• <strong>Check your model:</strong> <Link href="/jcb-serial-number-lookup" className="underline font-semibold">Use serial lookup</Link> (Loadall vs JS series)</li>
              <li>• <strong>Use diagnostic tools:</strong> Jaltest recommended for detailed scans</li>
            </ul>
          </div>
        </div>
      </div>

      <JCBCodeBrowser />

      <div className="prose prose-slate max-w-none my-12">
        <h2>General JCB Fault Code Troubleshooting</h2>
        <ol>
          <li><strong>Record the code</strong> - Note exact code from display or diagnostic tool</li>
          <li><strong>Check basic systems</strong> - Battery, hydraulic fluid, connections</li>
          <li><strong>Consult manual</strong> - Codes vary by model (Loadall 535-95 vs JS200)</li>
          <li><strong>Use Jaltest</strong> - Professional scanner for JCB equipment</li>
          <li><strong>Clear and retest</strong> - Verify repair resolved the issue</li>
        </ol>

        <h3>When to Call for Professional Help</h3>
        <ul>
          <li>High severity codes (P0087, P0335, AL10-equivalent)</li>
          <li>Multiple simultaneous codes</li>
          <li>CAN communication errors (300-301)</li>
          <li>ECU/calibration faults (305-310)</li>
          <li>Safety system codes (brake, stabilizer)</li>
        </ul>
      </div>

      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6 sm:p-8 mb-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Need JCB Telehandler Parts?</h2>
          <p className="text-slate-700 mb-6 max-w-2xl mx-auto">
            We stock sensors, injectors, hydraulic solenoids, and electrical components for JCB Loadall and excavator models.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/parts?brand=jcb" className="inline-flex items-center gap-2 bg-[#F76511] text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-md">
              Shop JCB Parts →
            </Link>
            <Link href="/quote" className="inline-flex items-center gap-2 bg-white text-[#F76511] border-2 border-[#F76511] px-8 py-3 rounded-xl font-bold hover:bg-orange-50 transition-all">
              Request Diagnostic Help
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Related JCB Resources</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/jcb-serial-number-lookup" className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg">
            <span className="text-2xl">🔍</span>
            <div>
              <div className="font-semibold">JCB Serial Number Lookup</div>
              <div className="text-sm text-slate-600">Identify model and year</div>
            </div>
          </Link>
          <Link href="/rental/telehandler/jcb-telehandler-battery-location" className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg">
            <span className="text-2xl">🔋</span>
            <div>
              <div className="font-semibold">Battery Location Guide</div>
              <div className="text-sm text-slate-600">Find and access battery</div>
            </div>
          </Link>
        </div>
      </div>
    </main>
    </>
  );
} 