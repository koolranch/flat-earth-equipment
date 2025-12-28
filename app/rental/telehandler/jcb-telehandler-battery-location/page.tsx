import { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { generatePageAlternates } from "@/app/seo-defaults";

export const metadata: Metadata = {
  title: "JCB Telehandler Battery Location & Replacement Guide | Flat Earth Equipment",
  description: "Find where the battery is located on your JCB telehandler. Step-by-step access guide for JCB 510-56, 520-50, 527-55, and other models with safety checklist.",
  keywords: ["JCB telehandler battery location", "JCB 510-56 battery", "JCB 520-50 battery", "telehandler battery replacement", "JCB battery access"],
  alternates: generatePageAlternates("/rental/telehandler/jcb-telehandler-battery-location"),
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
  },
  openGraph: {
    title: "JCB Telehandler Battery Location: Complete Access Guide",
    description: "Step-by-step battery location and replacement guide for JCB 510-56, 520-50, and other telehandler models.",
    type: "article",
    url: "https://flatearthequipment.com/rental/telehandler/jcb-telehandler-battery-location",
  },
};

export default function JCBTelehandlerBatteryLocation() {
  return (
    <>
      {/* HowTo Schema */}
      <Script id="howto-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": "How to Access JCB Telehandler Battery",
          "description": "Step-by-step guide to locating and accessing the battery in JCB telehandler models",
          "totalTime": "PT30M",
          "tool": ["Wrench set", "Battery terminal cleaner", "Safety gloves"],
          "step": [
            { "@type": "HowToStep", "name": "Park on level ground", "text": "Park the telehandler on level ground and engage parking brake", "position": 1 },
            { "@type": "HowToStep", "name": "Lower boom completely", "text": "Lower the boom completely for safety", "position": 2 },
            { "@type": "HowToStep", "name": "Turn off engine", "text": "Turn off the engine and remove the key", "position": 3 },
            { "@type": "HowToStep", "name": "Open access panel", "text": "Open the battery access panel (location varies by model)", "position": 4 },
            { "@type": "HowToStep", "name": "Disconnect terminals", "text": "Disconnect negative terminal first, then positive", "position": 5 }
          ]
        })}
      </Script>

      {/* Breadcrumb Schema */}
      <Script id="breadcrumb-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://flatearthequipment.com" },
            { "@type": "ListItem", "position": 2, "name": "Telehandler Guides", "item": "https://flatearthequipment.com/rental/telehandler" },
            { "@type": "ListItem", "position": 3, "name": "JCB Battery Location", "item": "https://flatearthequipment.com/rental/telehandler/jcb-telehandler-battery-location" }
          ]
        })}
      </Script>

    <main className="max-w-4xl mx-auto px-4 py-12">
      {/* Quick Action Buttons */}
      <div className="not-prose mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/jcb-serial-number-lookup" className="flex flex-col items-center gap-2 p-4 bg-yellow-50 hover:bg-yellow-100 border-2 border-yellow-300 rounded-xl transition-all hover:shadow-md">
          <span className="text-2xl">🔍</span>
          <span className="text-xs sm:text-sm font-semibold text-center text-slate-800">JCB Serial Lookup</span>
        </Link>
        <Link href="/diagnostic-codes/jcb-telehandler-fault-codes-list" className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-xl transition-all hover:shadow-md">
          <span className="text-2xl">📋</span>
          <span className="text-xs sm:text-sm font-semibold text-center text-slate-800">JCB Fault Codes</span>
        </Link>
        <Link href="/parts?brand=jcb" className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-xl transition-all hover:shadow-md">
          <span className="text-2xl">🔋</span>
          <span className="text-xs sm:text-sm font-semibold text-center text-slate-800">JCB Batteries</span>
        </Link>
        <Link href="/quote" className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-xl transition-all hover:shadow-md">
          <span className="text-2xl">💬</span>
          <span className="text-xs sm:text-sm font-semibold text-center text-slate-800">Get Help</span>
        </Link>
      </div>

      {/* At a Glance Box */}
      <div className="not-prose mb-8 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">⚡</span> Battery Quick Reference
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-semibold text-yellow-800 mb-1">🔋 Type:</div>
            <div className="text-slate-700">12V commercial, 800-1000 CCA</div>
          </div>
          <div>
            <div className="font-semibold text-yellow-800 mb-1">📦 Size:</div>
            <div className="text-slate-700">Group 31 or 4D</div>
          </div>
          <div>
            <div className="font-semibold text-yellow-800 mb-1">⏱️ Replacement time:</div>
            <div className="text-slate-700">30-45 minutes</div>
          </div>
          <div>
            <div className="font-semibold text-yellow-800 mb-1">💰 Cost:</div>
            <div className="text-slate-700">$150-400 (battery + labor)</div>
          </div>
        </div>
      </div>
      <h1 className="text-4xl font-bold text-slate-900 mb-6">
        JCB Telehandler Battery Location Guide
      </h1>

      <div className="prose prose-slate max-w-none">
        <p className="lead">
          Finding and accessing the battery in your JCB telehandler is essential for maintenance and troubleshooting. This guide covers battery locations for popular JCB telehandler models.
        </p>

        <h2>JCB 510-56 Telehandler Battery Location</h2>
        <p>
          The battery in the JCB 510-56 telehandler is located:
        </p>
        <ul>
          <li>Under the operator's seat platform</li>
          <li>Accessible through a side panel on the right side of the machine</li>
          <li>Protected by a battery box with a secure latch</li>
        </ul>

        <h2>JCB 520-50 Telehandler Battery Location</h2>
        <p>
          For the JCB 520-50 model:
        </p>
        <ul>
          <li>Battery is positioned in the engine compartment</li>
          <li>Access through the side service panel</li>
          <li>Located near the hydraulic reservoir</li>
        </ul>

        </div>

      {/* Interactive Battery Access Checklist */}
      <div className="not-prose my-8 bg-white border-2 border-blue-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">✓</span> Safe Battery Access Checklist
        </h3>
        <p className="text-sm text-slate-600 mb-6">Follow these steps in order for safe battery access:</p>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-xl flex-shrink-0">☐</span>
            <div>
              <div className="font-semibold text-slate-900">Step 1: Park on Level Ground</div>
              <div className="text-sm text-slate-600 mt-1">Ensure stability before accessing battery compartment</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-xl flex-shrink-0">☐</span>
            <div>
              <div className="font-semibold text-slate-900">Step 2: Engage Parking Brake</div>
              <div className="text-sm text-slate-600 mt-1">Prevent any movement during maintenance</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-xl flex-shrink-0">☐</span>
            <div>
              <div className="font-semibold text-slate-900">Step 3: Lower Boom Completely</div>
              <div className="text-sm text-slate-600 mt-1">Critical safety step - boom must be fully down</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-xl flex-shrink-0">☐</span>
            <div>
              <div className="font-semibold text-slate-900">Step 4: Turn Off Engine & Remove Key</div>
              <div className="text-sm text-slate-600 mt-1">Complete power-down before battery work</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-xl flex-shrink-0">☐</span>
            <div>
              <div className="font-semibold text-slate-900">Step 5: Open Access Panel</div>
              <div className="text-sm text-slate-600 mt-1">Location varies by model (see guide above)</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-xl flex-shrink-0">☐</span>
            <div>
              <div className="font-semibold text-slate-900">Step 6: Disconnect Negative First, Then Positive</div>
              <div className="text-sm text-slate-600 mt-1">Always negative (-) black cable first!</div>
            </div>
          </div>
        </div>
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 font-semibold mb-2">
            ⚠️ Safety Warning: Battery work can be dangerous
          </p>
          <p className="text-sm text-red-700 mb-3">
            Wear protective gloves and eye protection. Never touch both terminals simultaneously.
          </p>
          <Link href="/quote" className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-all text-sm">
            Need Professional Battery Service? →
          </Link>
        </div>
      </div>

      <div className="prose prose-slate max-w-none">

        <h2>Safety Precautions</h2>
        <ul>
          <li>Always wear protective gloves and eye protection</li>
          <li>Ensure the machine is completely powered off</li>
          <li>Keep tools and metal objects away from battery terminals</li>
          <li>Follow proper battery handling procedures</li>
        </ul>

        <h2>Battery Specifications</h2>
        <p>
          JCB telehandlers typically use:
        </p>
        <ul>
          <li>12V heavy-duty commercial batteries</li>
          <li>Cold cranking amps (CCA) rating of 800-1000</li>
          <li>Group size 31 or 4D</li>
          <li>Maintenance-free design</li>
        </ul>

        <h2>Battery Maintenance Tips</h2>
        <ul>
          <li>Check battery terminals for corrosion monthly</li>
          <li>Clean terminals with a wire brush if needed</li>
          <li>Ensure battery is securely mounted</li>
          <li>Keep battery top clean and dry</li>
          <li>Check battery voltage regularly</li>
        </ul>

        <h2>Common Battery Issues</h2>
        <ul>
          <li>Corroded terminals</li>
          <li>Loose connections</li>
          <li>Low electrolyte levels (if applicable)</li>
          <li>Battery not holding charge</li>
          <li>Slow cranking</li>
        </ul>

        <h2>When to Replace the Battery</h2>
        <p>
          Consider replacing your JCB telehandler battery if:
        </p>
        <ul>
          <li>Battery is more than 3-4 years old</li>
          <li>Machine struggles to start</li>
          <li>Battery shows signs of physical damage</li>
          <li>Battery fails to hold a charge</li>
          <li>Terminals are severely corroded</li>
        </ul>

        <h2>Professional Assistance</h2>
        <p>
          If you're unsure about battery maintenance or replacement:
        </p>
        <ul>
          <li>Contact your local JCB dealer</li>
          <li>Consult with a qualified technician</li>
          <li>Schedule regular maintenance checks</li>
          <li>Keep records of battery service history</li>
        </ul>

        <h2>Conclusion</h2>
        <p>
          Proper battery maintenance is crucial for reliable JCB telehandler operation. Regular checks and proper care can extend battery life and prevent unexpected downtime. Always follow safety procedures when working with batteries and consult with professionals when needed.
        </p>
      </div>

      {/* Battery Parts CTA */}
      <div className="not-prose my-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 sm:p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Need a Replacement Battery for Your JCB?</h2>
          <p className="text-slate-700 mb-6 max-w-2xl mx-auto">
            We stock heavy-duty commercial batteries for JCB telehandlers. Group 31, 4D, 800-1000 CCA ratings available.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/parts?brand=jcb&category=batteries" className="inline-flex items-center gap-2 bg-[#F76511] text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-md hover:shadow-lg">
              Shop JCB Batteries →
            </Link>
            <Link href="/quote" className="inline-flex items-center gap-2 bg-white text-[#F76511] border-2 border-[#F76511] px-8 py-3 rounded-xl font-bold hover:bg-orange-50 transition-all">
              Get Battery Quote
            </Link>
          </div>
        </div>
      </div>

      {/* Related JCB Tools */}
      <div className="not-prose my-8 bg-white border-2 border-slate-200 rounded-xl p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Related JCB Telehandler Resources</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/jcb-serial-number-lookup" className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all">
            <span className="text-2xl">🔍</span>
            <div>
              <div className="font-semibold text-slate-900">JCB Serial Number Lookup</div>
              <div className="text-sm text-slate-600">Identify your telehandler's year and model</div>
            </div>
          </Link>
          <Link href="/diagnostic-codes/jcb-telehandler-fault-codes-list" className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all">
            <span className="text-2xl">⚠️</span>
            <div>
              <div className="font-semibold text-slate-900">JCB Fault Codes Database</div>
              <div className="text-sm text-slate-600">Complete diagnostic code reference</div>
            </div>
          </Link>
          <Link href="/parts?brand=jcb" className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all">
            <span className="text-2xl">🔧</span>
            <div>
              <div className="font-semibold text-slate-900">JCB Telehandler Parts</div>
              <div className="text-sm text-slate-600">Batteries, filters, hydraulic components</div>
            </div>
          </Link>
          <Link href="/contact" className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all">
            <span className="text-2xl">📞</span>
            <div>
              <div className="font-semibold text-slate-900">Expert Support</div>
              <div className="text-sm text-slate-600">Questions about your JCB?</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Final CTA */}
      <div className="not-prose mt-12 bg-slate-900 text-white rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-3">Need Help with Your JCB Telehandler Battery?</h2>
        <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
          Whether you need a replacement battery, diagnostic help, or technical support, we're here to keep your JCB running strong.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/parts?brand=jcb&category=batteries" className="inline-flex items-center gap-2 bg-[#F76511] text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg">
            Shop JCB Batteries →
          </Link>
          <Link href="/quote" className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-slate-100 transition-all">
            Request Technical Help
          </Link>
        </div>
      </div>
    </main>
    </>
  );
} 