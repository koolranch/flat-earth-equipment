import { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { generatePageAlternates } from "@/app/seo-defaults";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: "Toro Dingo Error Codes | e-Dingo 500 Fault Codes & Troubleshooting Guide",
  description: "Complete guide to Toro Dingo error codes including e-Dingo 500 battery/charging faults, diesel engine codes, and troubleshooting for TX series compact utility loaders.",
  keywords: ["Toro Dingo error codes", "e-Dingo 500 fault codes", "Toro Dingo troubleshooting", "Toro TX-1000 codes", "Dingo battery error"],
  alternates: generatePageAlternates("/diagnostic-codes/toro-dingo-error-codes"),
  openGraph: {
    title: "Toro Dingo Error Codes: Complete Troubleshooting Guide",
    description: "Fix e-Dingo 500 battery errors, charging faults, and diesel engine codes. Expert guide for all Toro Dingo compact utility loaders.",
    type: "article",
  },
};

export default function ToroDingoErrorCodesPage() {
  const eDingoCodes = [
    { code: "E-0-0-1 / E-0-4-7", desc: "Battery high voltage", severity: "High", fix: "Check voltage, use OEM charger" },
    { code: "E-0-0-4", desc: "BMS or battery fault", severity: "High", fix: "Inspect battery, dealer diagnostic" },
    { code: "E-0-0-7", desc: "Battery amp hour limit exceeded", severity: "Medium", fix: "Check parasitic drains, replace if <80% capacity" },
    { code: "E-0-1-2", desc: "Reverse polarity error", severity: "High", fix: "Correct battery connections (red +, black -)" },
    { code: "E-0-2-3", desc: "High AC voltage (>270VAC)", severity: "Medium", fix: "Use stable 120V outlet, surge protector" },
    { code: "E-0-2-4", desc: "Charger failed to initialize", severity: "High", fix: "Power cycle 30 seconds, test outlet" },
    { code: "E-0-2-5", desc: "Low AC voltage oscillation", severity: "Medium", fix: "Direct outlet, avoid long extension cords" },
    { code: "E-0-2-9 to E-0-6-0", desc: "Battery communication error", severity: "Medium", fix: "Secure signal wires, clean connectors" },
    { code: "F-0-0-1 to F-0-0-7", desc: "Internal charger fault", severity: "High", fix: "Power cycle, dealer service if persists" },
  ];

  const dieselCodes = [
    { code: "P0225", desc: "Traction pedal sensor open", fix: "Test sensor/wiring" },
    { code: "P0227", desc: "Traction pedal short to ground", fix: "Check for shorts" },
    { code: "P057C/D", desc: "Brake pedal sensor fault", fix: "Replace sensor" },
    { code: "P0615-P0617", desc: "Start relay faults", fix: "Test relay circuit" },
    { code: "P100C/D", desc: "Engine overheating (>105°C/>115°C)", fix: "Check cooling system" },
    { code: "P1104", desc: "Traction coil overcurrent", fix: "Test coil, swap TEC" },
    { code: "U0100", desc: "Lost ECM communication", fix: "Check harness, dealer scan" },
  ];

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.flatearthequipment.com' },
          { name: 'Diagnostic Codes', url: 'https://www.flatearthequipment.com/diagnostic-codes' },
          { name: 'Toro Dingo Error Codes', url: 'https://www.flatearthequipment.com/diagnostic-codes/toro-dingo-error-codes' },
        ]}
      />
      <Script id="faq-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What does error code E-0-0-1 mean on Toro e-Dingo 500?",
              "acceptedAnswer": { "@type": "Answer", "text": "E-0-0-1 indicates battery high voltage on the e-Dingo 500. Charging stops to prevent overcharge. Check battery voltage specs (should be 48V), ensure secure connections, and use the correct Toro OEM charger." }
            },
            {
              "@type": "Question",
              "name": "How do I reset Toro Dingo error codes?",
              "acceptedAnswer": { "@type": "Answer", "text": "For most errors, cycle the key/power. For charging faults (E-codes), disconnect both AC power and battery for 30 seconds, then reconnect. If code persists, the underlying issue needs repair." }
            },
            {
              "@type": "Question",
              "name": "Where can I see Dingo fault codes?",
              "acceptedAnswer": { "@type": "Answer", "text": "On e-Dingo 500, navigate to the FAULTS menu on the InfoCenter display. Codes appear as E-XXX or F-XXX with timestamps. During charging, codes flash on the indicator light one digit at a time." }
            }
          ]
        })}
      </Script>

    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="not-prose mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/toro-dingo-serial-lookup" className="flex flex-col items-center gap-2 p-4 bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-xl transition-all">
          <span className="text-2xl">🔍</span>
          <span className="text-xs font-semibold text-center">Dingo Serial Lookup</span>
        </Link>
        <Link href="/parts?brand=toro" className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-xl transition-all">
          <span className="text-2xl">🔋</span>
          <span className="text-xs font-semibold text-center">Dingo Parts</span>
        </Link>
        <Link href="/brand/toro" className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-xl transition-all">
          <span className="text-2xl">📚</span>
          <span className="text-xs font-semibold text-center">Toro Resources</span>
        </Link>
        <Link href="/quote" className="flex flex-col items-center gap-2 p-4 bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 rounded-xl transition-all">
          <span className="text-2xl">💬</span>
          <span className="text-xs font-semibold text-center">Get Help</span>
        </Link>
      </div>

      <h1 className="text-4xl font-bold text-slate-900 mb-4">
        Toro Dingo Error Codes & Troubleshooting Guide
      </h1>
      
      <p className="text-lg text-slate-600 mb-8">
        Complete reference for Toro Dingo compact utility loader fault codes. Covers e-Dingo 500 electric model battery/charging errors and diesel TX series engine codes.
      </p>

      <div className="not-prose mb-8 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">⚡ e-Dingo 500: At a Glance</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div><span className="font-semibold text-red-800">Battery:</span> 48V lithium-ion with BMS</div>
          <div><span className="font-semibold text-red-800">Charge Time:</span> ~8 hours (full)</div>
          <div><span className="font-semibold text-red-800">Runtime:</span> 4-6 hours moderate use</div>
          <div><span className="font-semibold text-red-800">Temp Range:</span> -5°C to 60°C (charging)</div>
        </div>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden mb-8">
        <div className="bg-slate-100 px-6 py-4 border-b-2">
          <h2 className="text-2xl font-bold">e-Dingo 500 Battery & Charging Error Codes</h2>
          <p className="text-sm text-slate-600 mt-2">Electric model diagnostic codes</p>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {eDingoCodes.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 border-2 border-slate-200 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="font-mono font-bold text-lg text-[#F76511]">{item.code}</div>
                  <div className={`text-xs font-semibold mt-1 ${item.severity === 'High' ? 'text-red-600' : 'text-yellow-600'}`}>{item.severity}</div>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900 mb-1">{item.desc}</div>
                  <div className="text-sm text-slate-600">{item.fix}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden mb-8">
        <div className="bg-slate-100 px-6 py-4 border-b-2">
          <h2 className="text-2xl font-bold">Diesel Dingo Engine Codes (TX Series)</h2>
          <p className="text-sm text-slate-600 mt-2">P-codes for diesel models</p>
        </div>
        <div className="p-6">
          <div className="grid sm:grid-cols-2 gap-3">
            {dieselCodes.map((item, i) => (
              <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="font-mono font-bold text-[#F76511] mb-1">{item.code}</div>
                <div className="text-sm text-slate-900 mb-2">{item.desc}</div>
                <div className="text-xs text-slate-600">Fix: {item.fix}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="prose prose-slate max-w-none mb-8">
        <h2>How to Access Dingo Fault Codes</h2>
        <h3>e-Dingo 500 (Electric Models)</h3>
        <ol>
          <li>Press any button to wake InfoCenter display</li>
          <li>Navigate to <strong>FAULTS menu</strong> using arrow keys</li>
          <li>View current/last/first occurrence with timestamps</li>
          <li>Codes appear as E-XXX or F-XXX</li>
        </ol>
        <p><strong>During charging:</strong> Error codes flash on indicator light one digit at a time (E, pause, 0, pause, 0, pause, 1).</p>

        <h3>Diesel Models (TX Series)</h3>
        <ul>
          <li>Use diagnostic tools (Jaltest, Toro handset, ServiceMaster)</li>
          <li>Connect to diagnostic port for engine codes</li>
          <li>Consult model-specific service manual</li>
        </ul>

        <h2>Troubleshooting Tips</h2>
        <h3>Charging Issues (e-Dingo 500)</h3>
        <ul>
          <li><strong>Location:</strong> Charge in ventilated, dry area</li>
          <li><strong>Temperature:</strong> Optimal 10-30°C (50-86°F)</li>
          <li><strong>Connections:</strong> Clean battery terminals monthly</li>
          <li><strong>Monitor:</strong> InfoCenter shows rising amperage (0A = fault)</li>
          <li><strong>Reset:</strong> Disconnect AC + battery for 30 seconds</li>
        </ul>

        <h3>When to Contact Toro Dealer</h3>
        <ul>
          <li>BMS errors (E-0-0-4) - Requires programming</li>
          <li>Internal charger faults (F-series) - Component replacement</li>
          <li>Multiple codes simultaneously - Complex diagnosis</li>
          <li>Code persists after reset - Underlying issue needs repair</li>
        </ul>
      </div>

      <div className="not-prose my-8 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-xl p-6 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Need Toro Dingo Parts or Batteries?</h2>
        <p className="text-slate-700 mb-6">We stock batteries, chargers, sensors, and components for Toro Dingo e-Dingo 500 and TX series loaders.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/parts?brand=toro&product=dingo" className="bg-[#F76511] text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all">
            Shop Dingo Parts →
          </Link>
          <Link href="/quote" className="bg-white text-[#F76511] border-2 border-[#F76511] px-8 py-3 rounded-xl font-bold hover:bg-orange-50 transition-all">
            Request Help
          </Link>
        </div>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Related Toro Dingo Resources</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/toro-dingo-serial-lookup" className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg">
            <span className="text-2xl">🔍</span>
            <div>
              <div className="font-semibold">Dingo Serial Number Lookup</div>
              <div className="text-sm text-slate-600">Identify your TX or e-Dingo model</div>
            </div>
          </Link>
          <Link href="/parts?brand=toro" className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg">
            <span className="text-2xl">🔧</span>
            <div>
              <div className="font-semibold">Toro Parts Catalog</div>
              <div className="text-sm text-slate-600">Batteries, sensors, hydraulic components</div>
            </div>
          </Link>
        </div>
      </div>
    </main>
    </>
  );
}

