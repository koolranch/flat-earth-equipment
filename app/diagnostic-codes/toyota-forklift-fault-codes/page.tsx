import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Toyota Forklift Fault Codes & Error Codes | Complete Reference Guide",
  description: "Complete reference guide for Toyota forklift fault codes and error messages. Find diagnostic codes for Toyota electric and internal combustion forklifts.",
  alternates: {
    canonical: "/diagnostic-codes/toyota-forklift-fault-codes",
  },
};

export default function ToyotaFaultCodesPage() {
  const commonCodes = [
    { code: "E A5-1", description: "Vehicle speed control system fault", severity: "Medium", hasGuide: true, link: "/diagnostic-codes/e-a5-1-code-on-toyota-forklift-2" },
    { code: "E-01-5", description: "Power circuit malfunction", severity: "High", hasGuide: false },
    { code: "E A1", description: "Main contactor issue", severity: "High", hasGuide: false },
    { code: "E A2", description: "Drive motor controller fault", severity: "High", hasGuide: false },
    { code: "E A3", description: "Pump motor controller fault", severity: "Medium", hasGuide: false },
    { code: "E A4", description: "Battery voltage irregular", severity: "Medium", hasGuide: false },
    { code: "E A6", description: "Traction motor overheat", severity: "High", hasGuide: false },
    { code: "E B1", description: "Lift/lower circuit fault", severity: "Medium", hasGuide: false },
    { code: "E C1", description: "Hydraulic pressure sensor", severity: "Low", hasGuide: false },
    { code: "E D1", description: "Steering sensor malfunction", severity: "Medium", hasGuide: false },
  ];

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      {/* Quick Links */}
      <div className="not-prose mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/toyota-forklift-serial-lookup" className="flex flex-col items-center gap-2 p-4 bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-xl transition-all hover:shadow-md">
          <span className="text-2xl">🔍</span>
          <span className="text-xs sm:text-sm font-semibold text-center text-slate-800">Check Serial Number</span>
        </Link>
        <Link href="/parts?brand=toyota" className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-xl transition-all hover:shadow-md">
          <span className="text-2xl">🔧</span>
          <span className="text-xs sm:text-sm font-semibold text-center text-slate-800">Toyota Parts</span>
        </Link>
        <Link href="/brand/toyota" className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-xl transition-all hover:shadow-md">
          <span className="text-2xl">📚</span>
          <span className="text-xs sm:text-sm font-semibold text-center text-slate-800">Toyota Resources</span>
        </Link>
        <Link href="/quote" className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-xl transition-all hover:shadow-md">
          <span className="text-2xl">💬</span>
          <span className="text-xs sm:text-sm font-semibold text-center text-slate-800">Get Help</span>
        </Link>
      </div>

      <h1 className="text-4xl font-bold text-slate-900 mb-4">
        Toyota Forklift Fault Codes & Error Codes
      </h1>
      
      <p className="text-lg text-slate-600 mb-8">
        Complete reference guide for Toyota forklift diagnostic codes. Use this database to identify and troubleshoot error messages on your Toyota electric or IC forklift.
      </p>

      {/* Important Notice */}
      <div className="mb-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">ℹ️</span>
          <div>
            <h2 className="font-bold text-blue-900 mb-2">Before You Start</h2>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Record the exact code</strong> displayed on your forklift</li>
              <li>• <strong>Note any symptoms:</strong> Strange sounds, performance issues, etc.</li>
              <li>• <strong>Check your model number:</strong> <Link href="/toyota-forklift-serial-lookup" className="underline font-semibold">Use our serial lookup tool</Link></li>
              <li>• <strong>Have your manual handy</strong> for model-specific details</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Fault Codes Table */}
      <div className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden mb-8">
        <div className="bg-slate-100 px-6 py-4 border-b-2 border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Common Toyota Forklift Fault Codes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200">
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Code</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Description</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Severity</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Guide</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {commonCodes.map((item) => (
                <tr key={item.code} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-semibold text-slate-900">{item.code}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{item.description}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.severity === 'High' ? 'bg-red-100 text-red-800' :
                      item.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {item.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {item.hasGuide ? (
                      <Link href={item.link!} className="text-[#F76511] hover:text-orange-600 font-semibold text-sm">
                        View Guide →
                      </Link>
                    ) : (
                      <Link href="/quote" className="text-slate-500 hover:text-slate-700 text-sm">
                        Get Help
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* General Troubleshooting Tips */}
      <div className="prose prose-slate max-w-none mb-8">
        <h2>General Toyota Fault Code Troubleshooting</h2>
        <p>
          When your Toyota forklift displays an error code, follow these general steps:
        </p>
        <ol>
          <li><strong>Record the code</strong> - Write down the exact code and when it appeared</li>
          <li><strong>Check basic systems</strong> - Battery voltage, connections, fluid levels</li>
          <li><strong>Consult your manual</strong> - Model-specific codes may vary</li>
          <li><strong>Use diagnostic tools</strong> - OBD scanners can read detailed fault data</li>
          <li><strong>Clear and retest</strong> - Some codes can be cleared after fixing the issue</li>
        </ol>

        <h3>When to Call for Professional Help</h3>
        <ul>
          <li>Code persists after basic troubleshooting</li>
          <li>Multiple codes appear simultaneously</li>
          <li>High severity codes (electrical, safety systems)</li>
          <li>You're unsure about the diagnosis</li>
          <li>Equipment is needed urgently</li>
        </ul>
      </div>

      {/* Parts CTA */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-6 sm:p-8 mb-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Need Toyota Forklift Parts?</h2>
          <p className="text-slate-700 mb-6 max-w-2xl mx-auto">
            We stock sensors, controllers, motors, and electrical components for Toyota forklifts. Get genuine parts to fix your fault codes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/parts?brand=toyota" className="inline-flex items-center gap-2 bg-[#F76511] text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-md hover:shadow-lg">
              Shop Toyota Parts →
            </Link>
            <Link href="/quote" className="inline-flex items-center gap-2 bg-white text-[#F76511] border-2 border-[#F76511] px-8 py-3 rounded-xl font-bold hover:bg-orange-50 transition-all">
              Request Diagnostic Help
            </Link>
          </div>
        </div>
      </div>

      {/* Related Resources */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Related Toyota Forklift Resources</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/toyota-forklift-serial-lookup" className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all">
            <span className="text-2xl">🔍</span>
            <div>
              <div className="font-semibold text-slate-900">Toyota Serial Number Lookup</div>
              <div className="text-sm text-slate-600">Identify your forklift's year and model</div>
            </div>
          </Link>
          <Link href="/brand/toyota" className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all">
            <span className="text-2xl">📚</span>
            <div>
              <div className="font-semibold text-slate-900">Toyota Brand Hub</div>
              <div className="text-sm text-slate-600">Parts, guides, and resources</div>
            </div>
          </Link>
          <Link href="/diagnostic-codes/e-a5-1-code-on-toyota-forklift-2" className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all">
            <span className="text-2xl">⚡</span>
            <div>
              <div className="font-semibold text-slate-900">E A5-1 Code Guide</div>
              <div className="text-sm text-slate-600">Speed control system troubleshooting</div>
            </div>
          </Link>
          <Link href="/contact" className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all">
            <span className="text-2xl">📞</span>
            <div>
              <div className="font-semibold text-slate-900">Expert Support</div>
              <div className="text-sm text-slate-600">Talk to Toyota specialists</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h3 className="font-bold text-amber-900 mb-2">Important Notice</h3>
        <p className="text-sm text-amber-800">
          Fault codes can vary by Toyota forklift model, year, and system type (electric vs IC). Always consult your specific model's service manual for accurate diagnostics. If you need help identifying codes specific to your Toyota forklift, <Link href="/quote" className="underline font-semibold">contact our technical team</Link> with your model and serial number.
        </p>
      </div>
    </main>
  );
}

