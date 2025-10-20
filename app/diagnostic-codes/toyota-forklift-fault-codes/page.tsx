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
  // Internal Combustion (Gas/LPG) Codes
  const icCodes = [
    { code: "01-01", description: "Fuel feedback control error (rich) - Engine speed unstable, may stop", severity: "High", system: "4Y-ECS", hasGuide: true, link: "/diagnostic-codes/toyota-01-01-fuel-feedback-error" },
    { code: "01-02", description: "Fuel feedback control error (lean) - Engine unstable", severity: "High", system: "4Y-ECS" },
    { code: "01-05", description: "O2 sensor open - Engine issues at low temp", severity: "Medium", system: "4Y-ECS" },
    { code: "01-06", description: "O2 sensor heater open - Limited engine power/speed", severity: "Medium", system: "4Y-ECS" },
    { code: "02-01", description: "Intake temperature sensor open", severity: "Medium", system: "4Y-ECS" },
    { code: "02-02", description: "Intake temperature sensor short", severity: "Medium", system: "4Y-ECS" },
    { code: "03-01", description: "Intake pipe pressure sensor open - Limited power", severity: "Medium", system: "4Y-ECS" },
    { code: "04-01", description: "Coolant temp sensor open - Engine unstable, may stop", severity: "High", system: "4Y-ECS" },
    { code: "04-02", description: "Coolant temp sensor short - Engine unstable", severity: "High", system: "4Y-ECS" },
    { code: "05-01", description: "Throttle position sensor 1 open - Engine unstable", severity: "High", system: "4Y-ECS" },
    { code: "05-02", description: "Throttle position sensor 1 short - Limited speed", severity: "Medium", system: "4Y-ECS" },
    { code: "E 12-4", description: "Variable nozzle turbo actuator malfunction", severity: "Medium", system: "Engine" },
  ];

  // Electric Forklift Codes
  const electricCodes = [
    { code: "F8", description: "Charging completion failure - Check cables/transformer", severity: "Medium", system: "Charging" },
    { code: "C02", description: "Multi-display error - Abnormalities detected", severity: "Low", system: "Display" },
    { code: "C05", description: "Display function error", severity: "Low", system: "Display" },
    { code: "AD1", description: "CAN communication error - Partial drive limitation", severity: "High", system: "CAN Comm" },
    { code: "ADE2", description: "Lost CAN communication - Drive/mast restricted", severity: "High", system: "CAN Comm" },
    { code: "201-262", description: "Traction logic errors - May disable traveling", severity: "High", system: "Drive Logic" },
    { code: "501-562", description: "Lift logic errors - Abnormalities in lift circuits", severity: "High", system: "Lift Logic" },
    { code: "F5-1", description: "Material handling error - Lift may stop", severity: "Medium", system: "Lift" },
  ];

  // SAS/OPS (Stability & Operator Presence) Codes
  const sasCodes = [
    { code: "41-1", description: "Matching connector abnormal - Connector display faulty", severity: "Medium", system: "SAS/OPS" },
    { code: "51-1", description: "Speed sensor open - Shows 0 km/h, swing control limited", severity: "Medium", system: "SAS/OPS" },
    { code: "52-1", description: "Yaw rate sensor open - Swing control limited", severity: "Medium", system: "SAS/OPS" },
    { code: "61-1", description: "Load sensor open - Swing/mast/drive limited, no load display", severity: "High", system: "SAS/OPS" },
    { code: "62-1", description: "Tilt angle sensor open - Mast control limited", severity: "Medium", system: "SAS/OPS" },
    { code: "63-1", description: "Tilt switches ON simultaneously - Mast limited", severity: "Medium", system: "SAS/OPS" },
    { code: "64-1", description: "Lift lower lock solenoid open - Fork won't lower", severity: "High", system: "SAS/OPS" },
  ];

  // Special/Common Codes
  const specialCodes = [
    { code: "E A5-1", description: "Vehicle speed control system fault", severity: "Medium", system: "Speed Control", hasGuide: true, link: "/diagnostic-codes/e-a5-1-code-on-toyota-forklift-2" },
    { code: "E AS-1", description: "Alarm code - Check seat switch", severity: "Low", system: "Safety" },
    { code: "E A1", description: "Main contactor issue", severity: "High", system: "Electrical" },
    { code: "E A2", description: "Drive motor controller fault", severity: "High", system: "Drive" },
    { code: "E A4", description: "Battery voltage irregular", severity: "Medium", system: "Battery" },
    { code: "E A6", description: "Traction motor overheat", severity: "High", system: "Drive" },
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

      {/* Code Type Selector Tabs */}
      <div className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden mb-8">
        <div className="bg-slate-100 px-6 py-4 border-b-2 border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Toyota Forklift Fault Code Database</h2>
          <p className="text-sm text-slate-600 mt-2">Over 30 diagnostic codes organized by system type</p>
        </div>

        {/* Special/Common Codes Section */}
        <div className="p-6 border-b-2 border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-orange-100 text-[#F76511] rounded-full flex items-center justify-center font-bold">⚡</span>
            Most Common Codes (All Models)
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {specialCodes.map((item) => (
              <div key={item.code} className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg hover:border-[#F76511] transition-all">
                <div className="flex-shrink-0">
                  <div className="font-mono font-bold text-lg text-[#F76511]">{item.code}</div>
                  <div className={`text-xs font-semibold mt-1 ${
                    item.severity === 'High' ? 'text-red-600' :
                    item.severity === 'Medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {item.severity}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 mb-1">{item.description}</div>
                  <div className="text-xs text-slate-600">{item.system}</div>
                  {item.hasGuide && (
                    <Link href={item.link!} className="text-xs text-[#F76511] hover:text-orange-600 font-semibold mt-2 inline-block">
                      View Full Guide →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* IC Codes Section */}
        <details className="group border-b-2 border-slate-200">
          <summary className="cursor-pointer p-6 font-bold text-slate-900 hover:bg-slate-50 transition-all flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="text-xl">⛽</span> Internal Combustion Codes (Gas/LPG/Diesel) - {icCodes.length} codes
            </span>
            <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="p-6 pt-0 bg-slate-50">
            <p className="text-sm text-slate-600 mb-4">Codes for Toyota models with 4Y-ECS engines and similar IC systems</p>
            <div className="space-y-2">
              {icCodes.map((item: any) => (
                <div key={item.code} className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-lg text-sm">
                  <span className="font-mono font-bold text-[#F76511] flex-shrink-0">{item.code}</span>
                  <div className="flex-1">
                    <span className="text-slate-900">{item.description}</span>
                    <span className="text-xs text-slate-500 ml-2">({item.system})</span>
                    {item.hasGuide && (
                      <div className="mt-1">
                        <Link href={item.link} className="text-xs text-[#F76511] hover:text-orange-600 font-semibold">
                          View Full Guide →
                        </Link>
                      </div>
                    )}
                  </div>
                  <span className={`text-xs font-semibold flex-shrink-0 ${
                    item.severity === 'High' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {item.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </details>

        {/* Electric Codes Section */}
        <details className="group border-b-2 border-slate-200">
          <summary className="cursor-pointer p-6 font-bold text-slate-900 hover:bg-slate-50 transition-all flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="text-xl">🔋</span> Electric Forklift Codes - {electricCodes.length} codes
            </span>
            <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="p-6 pt-0 bg-slate-50">
            <p className="text-sm text-slate-600 mb-4">Codes for Toyota 7-series and 8-series electric models</p>
            <div className="space-y-2">
              {electricCodes.map((item) => (
                <div key={item.code} className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-lg text-sm">
                  <span className="font-mono font-bold text-[#F76511] flex-shrink-0">{item.code}</span>
                  <div className="flex-1">
                    <span className="text-slate-900">{item.description}</span>
                    <span className="text-xs text-slate-500 ml-2">({item.system})</span>
                  </div>
                  <span className={`text-xs font-semibold flex-shrink-0 ${
                    item.severity === 'High' ? 'text-red-600' :
                    item.severity === 'Medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {item.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </details>

        {/* SAS/OPS Codes Section */}
        <details className="group">
          <summary className="cursor-pointer p-6 font-bold text-slate-900 hover:bg-slate-50 transition-all flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="text-xl">🛡️</span> SAS/OPS Stability Codes - {sasCodes.length} codes
            </span>
            <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="p-6 pt-0 bg-slate-50">
            <p className="text-sm text-slate-600 mb-4">Stability Augmentation System & Operator Presence codes</p>
            <div className="space-y-2">
              {sasCodes.map((item) => (
                <div key={item.code} className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-lg text-sm">
                  <span className="font-mono font-bold text-[#F76511] flex-shrink-0">{item.code}</span>
                  <div className="flex-1">
                    <span className="text-slate-900">{item.description}</span>
                    <span className="text-xs text-slate-500 ml-2">({item.system})</span>
                  </div>
                  <span className={`text-xs font-semibold flex-shrink-0 ${
                    item.severity === 'High' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {item.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </details>
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

