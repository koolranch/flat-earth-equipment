import { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Toyota Forklift 01-01 Code: Fuel Feedback Error (Rich) Guide",
  description: "Complete troubleshooting guide for Toyota 01-01 fault code - fuel feedback control error rich. Fix engine instability and prevent stalling on 4Y-ECS models.",
};

export default function Toyota0101Page() {
  return (
    <>
      <Script id="howto-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": "How to Fix Toyota Forklift 01-01 Fuel Feedback Error",
          "description": "Diagnose and repair fuel feedback control error (rich) on Toyota 4Y-ECS forklifts",
          "totalTime": "PT1H30M"
        })}
      </Script>

    <main className="max-w-3xl mx-auto px-4 py-12">
      <div className="not-prose mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/toyota-forklift-serial-lookup" className="flex flex-col items-center gap-2 p-4 bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-xl transition-all">
          <span className="text-2xl">🔍</span>
          <span className="text-xs font-semibold text-center">Serial Lookup</span>
        </Link>
        <Link href="/diagnostic-codes/toyota-forklift-fault-codes" className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-xl transition-all">
          <span className="text-2xl">📋</span>
          <span className="text-xs font-semibold text-center">All Toyota Codes</span>
        </Link>
        <Link href="/parts?brand=toyota" className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-xl transition-all">
          <span className="text-2xl">🔧</span>
          <span className="text-xs font-semibold text-center">Toyota Parts</span>
        </Link>
        <Link href="/quote" className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-xl transition-all">
          <span className="text-2xl">💬</span>
          <span className="text-xs font-semibold text-center">Get Help</span>
        </Link>
      </div>

      <div className="not-prose mb-8 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300 rounded-xl p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">⚡ Code 01-01: Quick Facts</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div><span className="font-semibold text-red-800">System:</span> 4Y-ECS (Gasoline Engine)</div>
          <div><span className="font-semibold text-red-800">Severity:</span> 🔴 High - Engine may stop</div>
          <div><span className="font-semibold text-red-800">Symptom:</span> Unstable engine speed</div>
          <div><span className="font-semibold text-red-800">Fix Time:</span> 1-3 hours</div>
        </div>
      </div>

      <div className="prose prose-slate max-w-none">
        <h1>Toyota Forklift 01-01 Code: Fuel Feedback Error (Rich)</h1>
        <p className="lead">The 01-01 code on Toyota forklifts with 4Y-ECS gasoline engines indicates a <strong>fuel feedback control error (rich mixture)</strong>. This serious fault causes unstable engine speed and can result in the engine stalling.</p>

        <h2>What Does 01-01 Mean?</h2>
        <p>The forklift's engine control system detects the fuel mixture is too rich (too much fuel, not enough air). This imbalance prevents proper combustion and causes performance issues.</p>

        <h3>Common Symptoms:</h3>
        <ul>
          <li>Engine speed fluctuates or surges</li>
          <li>Engine may stall or refuse to idle</li>
          <li>Poor fuel economy</li>
          <li>Black smoke from exhaust</li>
          <li>Rough running or hesitation</li>
        </ul>

        <h2>Common Causes</h2>
        <ol>
          <li><strong>O2 Sensor Failure</strong> - Most common cause; sensor provides incorrect feedback</li>
          <li><strong>Intake System Defects</strong> - Air leaks or blockages affecting air/fuel ratio</li>
          <li><strong>Exhaust Restrictions</strong> - Clogged catalytic converter or muffler</li>
          <li><strong>Fuel System Issues</strong> - Leaking injectors or high fuel pressure</li>
          <li><strong>Wiring Harness Defects</strong> - Damaged or corroded sensor wiring</li>
          <li><strong>Engine Controller Fault</strong> - ECU malfunction (rare)</li>
        </ol>
      </div>

      <div className="not-prose my-8 bg-white border-2 border-blue-200 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">✓ Diagnostic Checklist</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 bg-slate-50 border rounded-lg">
            <span className="text-xl">☐</span>
            <div>
              <div className="font-semibold">Step 1: Check O2 Sensor</div>
              <div className="text-sm text-slate-600">Test sensor voltage and inspect wiring. Most common fix.</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-slate-50 border rounded-lg">
            <span className="text-xl">☐</span>
            <div>
              <div className="font-semibold">Step 2: Inspect Intake System</div>
              <div className="text-sm text-slate-600">Look for vacuum leaks, damaged hoses, or air filter blockage.</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-slate-50 border rounded-lg">
            <span className="text-xl">☐</span>
            <div>
              <div className="font-semibold">Step 3: Check Exhaust System</div>
              <div className="text-sm text-slate-600">Verify catalytic converter isn't clogged, inspect for restrictions.</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-slate-50 border rounded-lg">
            <span className="text-xl">☐</span>
            <div>
              <div className="font-semibold">Step 4: Test Fuel Pressure</div>
              <div className="text-sm text-slate-600">Check for correct fuel pressure and leaking injectors.</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-slate-50 border rounded-lg">
            <span className="text-xl">☐</span>
            <div>
              <div className="font-semibold">Step 5: Use Diagnostic Software</div>
              <div className="text-sm text-slate-600">Tools like Jaltest can provide detailed live data.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="prose prose-slate max-w-none">
        <h2>How to Fix Code 01-01</h2>
        <h3>1. Replace O2 Sensor (Most Common Solution)</h3>
        <p>The oxygen sensor is the most frequent culprit. If sensor is over 3 years old or shows irregular voltage, replace it. Cost: $80-200 for sensor + labor.</p>

        <h3>2. Repair Intake/Exhaust Leaks</h3>
        <p>Inspect all vacuum hoses, intake manifold gaskets, and exhaust connections. Even small leaks can trigger this code.</p>

        <h3>3. Clean or Replace Air Filter</h3>
        <p>Restricted airflow from dirty filter can cause rich condition. Check and replace if needed.</p>

        <h3>4. Check Fuel Injectors</h3>
        <p>Leaking or stuck-open injectors dump excess fuel. Professional cleaning or replacement may be needed.</p>

        <h2>Resetting the Code</h2>
        <ol>
          <li>Turn ignition off</li>
          <li>Disconnect battery negative terminal for 30 seconds</li>
          <li>Reconnect battery</li>
          <li>Turn ignition on (don't start)</li>
          <li>Code should clear if issue is resolved</li>
        </ol>
        <p><strong>Note:</strong> If code returns immediately, the underlying problem hasn't been fixed.</p>
      </div>

      <div className="not-prose my-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Need O2 Sensors or Fuel System Parts?</h2>
        <p className="text-slate-700 mb-6">We stock sensors, injectors, and fuel system components for Toyota 4Y-ECS engines.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/parts?brand=toyota&category=sensors" className="bg-[#F76511] text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all">
            Shop Toyota Sensors →
          </Link>
          <Link href="/quote" className="bg-white text-[#F76511] border-2 border-[#F76511] px-8 py-3 rounded-xl font-bold hover:bg-orange-50 transition-all">
            Request Quote
          </Link>
        </div>
      </div>

      <div className="not-prose bg-slate-900 text-white rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-3">Still Getting Code 01-01?</h2>
        <p className="text-slate-300 mb-6">Our team can help diagnose complex fuel system issues and identify the right parts.</p>
        <Link href="/quote" className="inline-block bg-[#F76511] text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all">
          Request Diagnostic Help →
        </Link>
      </div>
    </main>
    </>
  );
}

