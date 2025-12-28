import { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import GenieCodeBrowser from '@/components/diagnostic/GenieCodeBrowser';
import { generatePageAlternates } from "@/app/seo-defaults";

export const metadata: Metadata = {
  title: "Genie Scissor Lift Error Codes: Complete Guide | 40+ Codes | Flat Earth Equipment",
  description: "Searchable database of 40+ Genie scissor lift and boom lift error codes. E1-E20, OIC codes, model-specific troubleshooting for GS series.",
  alternates: generatePageAlternates("/parts/aerial-equipment/genie-scissor-lift-error-codes"),
  openGraph: {
    title: "Genie Scissor Lift Error Codes: Complete Diagnostic Guide",
    description: "40+ Genie fault codes with troubleshooting. GS-1930, GS-2646, GS-4047 and boom lift codes.",
    type: "article",
  },
};

export default function GenieScissorLiftErrorCodes() {
  return (
    <>
      <Script id="breadcrumb-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://flatearthequipment.com" },
            { "@type": "ListItem", "position": 2, "name": "Aerial Equipment Parts", "item": "https://flatearthequipment.com/parts/aerial-equipment" },
            { "@type": "ListItem", "position": 3, "name": "Genie Error Codes", "item": "https://flatearthequipment.com/parts/aerial-equipment/genie-scissor-lift-error-codes" }
          ]
        })}
      </Script>

    <main className="max-w-4xl mx-auto px-4 py-12">
      {/* Featured Snippet Quick Answer Box */}
      <div className="not-prose mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-xl p-6 shadow-sm">
        <p className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-2">Quick Answer</p>
        <p className="text-lg text-slate-900 mb-3">
          <strong>Genie scissor lift error codes indicate specific system faults.</strong> The most common codes are: <strong>E1</strong> (Emergency Stop), <strong>E4</strong> (Low Battery), <strong>E6</strong> (Tilt Sensor), and <strong>E12/E13</strong> (Control Communication).
        </p>
        <p className="text-slate-700">
          <strong>To reset:</strong> (1) Lower lift completely to ground, (2) Turn off machine, (3) Engage override mode on control panel, (4) Turn machine back on. If codes persist after reset, inspect the affected component or contact a technician.
        </p>
      </div>

      {/* Quick Action Buttons */}
      <div className="not-prose mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/genie-serial-number-lookup" className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-xl transition-all">
          <span className="text-2xl">🔍</span>
          <span className="text-xs font-semibold text-center">Genie Serial Lookup</span>
        </Link>
        <Link href="/parts/genie-gen-6-ground-control-box" className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-xl transition-all">
          <span className="text-2xl">🎛️</span>
          <span className="text-xs font-semibold text-center">Ground Control Box</span>
        </Link>
        <Link href="/parts?brand=genie" className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-xl transition-all">
          <span className="text-2xl">🔧</span>
          <span className="text-xs font-semibold text-center">Genie Parts</span>
        </Link>
        <Link href="/quote" className="flex flex-col items-center gap-2 p-4 bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 rounded-xl transition-all">
          <span className="text-2xl">💬</span>
          <span className="text-xs font-semibold text-center">Get Help</span>
        </Link>
      </div>

      {/* At-a-Glance Box */}
      <div className="not-prose mb-8 bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-xl p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">⚡</span> Genie Code Types
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-semibold text-purple-800 mb-1">E-Codes (E1-E20):</div>
            <div className="text-slate-700">Common error codes for GS series</div>
          </div>
          <div>
            <div className="font-semibold text-purple-800 mb-1">OIC Codes:</div>
            <div className="text-slate-700">Operation indicators (LL, OIL, CH, PHS)</div>
          </div>
          <div>
            <div className="font-semibold text-purple-800 mb-1">DTC Codes:</div>
            <div className="text-slate-700">Diagnostic trouble codes (01-59)</div>
          </div>
          <div>
            <div className="font-semibold text-purple-800 mb-1">H-Codes:</div>
            <div className="text-slate-700">Hydraulic coil faults (H102, H103)</div>
          </div>
        </div>
      </div>

      <h1 className="text-4xl font-bold text-slate-900 mb-4">
        Genie Scissor Lift Error Codes: Complete Guide
      </h1>

      <p className="text-lg text-slate-600 mb-8">
        Searchable database of 40+ Genie error codes for scissor lifts (GS series) and boom lifts. Find your code, understand the problem, and get back to work quickly.
      </p>

      <div className="prose prose-slate max-w-none mb-8">

        <p>
          Genie scissor lifts are widely used in various industries for their ability to reach high places safely and efficiently. Understanding error codes is essential for quick troubleshooting and getting back to work.
        </p>
        </div>

      {/* Searchable Code Database */}
      <GenieCodeBrowser />

      <div className="prose prose-slate max-w-none my-12">
        <h2>Common Error Codes by Model</h2>

        <h3>Genie GS-1930, GS-2032, GS-2632, GS-2646, GS-3246, GS-4047 Scissor Lifts</h3>
        <p>The searchable database above includes all codes for these popular GS series models.</p>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="border p-2">Error Code</th>
                <th className="border p-2">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">E1</td>
                <td className="border p-2">Emergency Stop activated</td>
              </tr>
              <tr>
                <td className="border p-2">E2</td>
                <td className="border p-2">Platform overload</td>
              </tr>
              <tr>
                <td className="border p-2">E3</td>
                <td className="border p-2">Hydraulic oil temperature too high</td>
              </tr>
              <tr>
                <td className="border p-2">E4</td>
                <td className="border p-2">Low battery voltage</td>
              </tr>
              <tr>
                <td className="border p-2">E5</td>
                <td className="border p-2">High battery voltage</td>
              </tr>
              <tr>
                <td className="border p-2">E6</td>
                <td className="border p-2">Tilt sensor activated</td>
              </tr>
              <tr>
                <td className="border p-2">E7</td>
                <td className="border p-2">Drive function not allowed when elevated</td>
              </tr>
              <tr>
                <td className="border p-2">E8</td>
                <td className="border p-2">Potentiometer out of range</td>
              </tr>
              <tr>
                <td className="border p-2">E9</td>
                <td className="border p-2">Joystick not in neutral</td>
              </tr>
              <tr>
                <td className="border p-2">E10</td>
                <td className="border p-2">Hydraulic pump overcurrent</td>
              </tr>
              <tr>
                <td className="border p-2">E11</td>
                <td className="border p-2">Drive motor overcurrent</td>
              </tr>
              <tr>
                <td className="border p-2">E12</td>
                <td className="border p-2">Platform control not communicating with <Link href="/parts/genie-gen-6-ground-control-box" className="text-orange-600 hover:text-orange-700 underline">ground control</Link></td>
              </tr>
              <tr>
                <td className="border p-2">E13</td>
                <td className="border p-2"><Link href="/parts/genie-gen-6-ground-control-box" className="text-orange-600 hover:text-orange-700 underline">Ground control</Link> not communicating with platform control</td>
              </tr>
              <tr>
                <td className="border p-2">E14</td>
                <td className="border p-2">Platform control system error</td>
              </tr>
              <tr>
                <td className="border p-2">E15</td>
                <td className="border p-2"><Link href="/parts/genie-gen-6-ground-control-box" className="text-orange-600 hover:text-orange-700 underline">Ground control</Link> system error</td>
              </tr>
              <tr>
                <td className="border p-2">E16</td>
                <td className="border p-2">Sensor error</td>
              </tr>
              <tr>
                <td className="border p-2">E17</td>
                <td className="border p-2">Drive speed sensor error</td>
              </tr>
              <tr>
                <td className="border p-2">E18</td>
                <td className="border p-2">Elevation limit switch error</td>
              </tr>
              <tr>
                <td className="border p-2">E19</td>
                <td className="border p-2">Hydraulic pressure sensor error</td>
              </tr>
              <tr>
                <td className="border p-2">E20</td>
                <td className="border p-2">Steering angle sensor error</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Troubleshooting Steps</h2>
        <p>
          When encountering an error code, follow these general troubleshooting steps:
        </p>
        <ol>
          <li>Check the error code display and refer to the manual for specific meaning</li>
          <li>Inspect the affected system or component</li>
          <li>Check for loose connections or damaged wiring</li>
          <li>Verify fluid levels and pressures where applicable</li>
          <li>Test sensors and switches for proper operation</li>
          <li>Clear the error code after resolving the issue</li>
        </ol>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 my-6">
          <h3 className="text-lg font-semibold text-orange-800 mb-2">💡 Ground Control Issues (E12, E13, E15)?</h3>
          <p className="text-orange-700">
            If you're experiencing persistent ground control communication errors, the issue may be with your control box hardware. Consider our <Link href="/parts/genie-gen-6-ground-control-box" className="text-orange-600 hover:text-orange-700 underline font-medium">Genie Gen 6 Ground Control Box replacement</Link> - a reliable solution for Gen 6 series vehicles with $250 core credit available.
          </p>
        </div>

        <h2>Reset Procedures</h2>
        <p>
          To reset error codes on a Genie scissor lift:
        </p>
        <ol>
          <li>Turn off the machine and ensure it's safely on the ground</li>
          <li>Engage override mode using the control panel</li>
          <li>Turn the machine back on to reset the system</li>
        </ol>

        <h2>Safety Considerations</h2>
        <p>
          Always prioritize safety when troubleshooting scissor lift issues:
        </p>
        <ul>
          <li>Never attempt repairs while the platform is elevated</li>
          <li>Follow proper lockout/tagout procedures</li>
          <li>Use appropriate personal protective equipment</li>
          <li>Consult with qualified technicians for complex issues</li>
        </ul>

        <h2>Maintenance Tips</h2>
        <p>
          Regular maintenance can help prevent common error codes:
        </p>
        <ul>
          <li>Check battery condition and connections regularly</li>
          <li>Inspect hydraulic fluid levels and system integrity</li>
          <li>Test safety features and sensors periodically</li>
          <li>Keep control systems clean and free of debris</li>
          <li>Follow the manufacturer's maintenance schedule</li>
        </ul>

        <h2>When to Seek Professional Help</h2>
        <p>
          Contact a qualified technician if:
        </p>
        <ul>
          <li>Error codes persist after basic troubleshooting</li>
          <li>Multiple error codes appear simultaneously</li>
          <li>Safety systems are affected</li>
          <li>You're unsure about the cause or solution</li>
          <li>Control box replacement is needed (we stock <Link href="/parts/genie-gen-6-ground-control-box" className="text-orange-600 hover:text-orange-700 underline">genuine Genie ground control boxes</Link> for fast delivery)</li>
        </ul>

        <h2>Conclusion</h2>
        <p>
          Understanding Genie scissor lift error codes is crucial for maintaining safe and efficient operation. Regular maintenance, proper troubleshooting, and timely repairs can help minimize downtime and ensure reliable performance.
        </p>
      </div>

      {/* Ground Control Box CTA */}
      <div className="not-prose my-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Having E12, E13, or E15 Communication Errors?</h2>
          <p className="text-slate-700 mb-6">
            Persistent ground control communication errors often require control box replacement. We stock genuine <strong>Genie Gen 6 Ground Control Boxes</strong> with $250 core credit.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/parts/genie-gen-6-ground-control-box" className="inline-flex items-center gap-2 bg-[#F76511] text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-md">
              View Ground Control Box →
            </Link>
            <Link href="/quote" className="inline-flex items-center gap-2 bg-white text-[#F76511] border-2 border-[#F76511] px-8 py-3 rounded-xl font-bold hover:bg-orange-50 transition-all">
              Request Quote
            </Link>
          </div>
        </div>
      </div>

      {/* Parts CTA */}
      <div className="not-prose my-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Need Genie Scissor Lift Parts?</h2>
        <p className="text-slate-700 mb-6">
          We stock sensors, control boxes, hydraulic components, and electrical parts for all Genie GS and boom lift models.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/parts?brand=genie" className="inline-flex items-center gap-2 bg-[#F76511] text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-md">
            Shop Genie Parts →
          </Link>
          <Link href="/quote" className="inline-flex items-center gap-2 bg-white text-[#F76511] border-2 border-[#F76511] px-8 py-3 rounded-xl font-bold hover:bg-orange-50 transition-all">
            Request Diagnostic Help
          </Link>
        </div>
      </div>

      {/* Related Resources */}
      <div className="not-prose bg-white border-2 border-slate-200 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Related Genie Resources</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/genie-serial-number-lookup" className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg">
            <span className="text-2xl">🔍</span>
            <div>
              <div className="font-semibold">Genie Serial Number Lookup</div>
              <div className="text-sm text-slate-600">Identify your GS model and year</div>
            </div>
          </Link>
          <Link href="/parts/genie-gen-6-ground-control-box" className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg">
            <span className="text-2xl">🎛️</span>
            <div>
              <div className="font-semibold">Gen 6 Ground Control Box</div>
              <div className="text-sm text-slate-600">Fix E12/E13/E15 errors - $250 core credit</div>
            </div>
          </Link>
          <Link href="/brand/genie" className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg">
            <span className="text-2xl">📚</span>
            <div>
              <div className="font-semibold">Genie Brand Hub</div>
              <div className="text-sm text-slate-600">Parts, guides, and resources</div>
            </div>
          </Link>
          <Link href="/contact" className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg">
            <span className="text-2xl">📞</span>
            <div>
              <div className="font-semibold">Expert Support</div>
              <div className="text-sm text-slate-600">Talk to aerial lift specialists</div>
            </div>
          </Link>
        </div>
      </div>
    </main>
    </>
  );
} 