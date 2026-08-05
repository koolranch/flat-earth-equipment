import { Metadata } from "next";
import Link from "next/link";
import GenieCodeBrowser from '@/components/diagnostic/GenieCodeBrowser';
import { generatePageAlternates } from "@/app/seo-defaults";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { genieFaultCodes } from "@/lib/data/genieFaultCodes";

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

const PAGE_URL = "https://www.flatearthequipment.com/parts/aerial-equipment/genie-scissor-lift-error-codes";

const FAQS = [
  {
    question: "How do I reset Genie scissor lift error codes?",
    answer:
      "Lower the platform completely to the ground, turn the machine off, engage override mode on the control panel, then turn the machine back on. If the code returns immediately, fix the underlying fault before clearing again—a reset alone will not repair wiring, sensors, or a failed control box.",
  },
  {
    question: "What does Genie error code E4 mean?",
    answer:
      "E4 means low battery voltage. Charge the batteries fully, clean and tighten terminals, and verify the charger is completing a cycle. Persistent E4 under load often points to weak batteries or a failing charger.",
  },
  {
    question: "What do Genie E12 and E13 communication errors mean?",
    answer:
      "E12/E13 indicate lost communication between platform and ground controls—often a harness, CANbus, or control-box fault. Inspect connectors and coiled cable first; if wiring is sound, Gen 6 machines commonly need a ground control box or platform control box replacement.",
  },
  {
    question: "When should I replace the ground control box vs the joystick?",
    answer:
      "Replace the ground control box when E12, E13, or E15 persist after harness checks and ground-side functions fail. Replace the platform joystick/control box (e.g. 1256727GT) when platform controls fail but ground controls still work, or for E9, E14, A5, and joystick calibration faults.",
  },
  {
    question: "What do LL, OL, nd, and br mean on a Genie display?",
    answer:
      "These are operation indicator codes: LL = off level, OL = overload cutout, nd = no drive (interlock), br = brake release active. Level the machine, reduce load, lower the platform, or disengage brake release before treating them as component failures.",
  },
];

const CODE_PART_MAP = [
  {
    codes: "E12 / E13 / E15",
    issue: "Ground ↔ platform communication",
    href: "/parts/genie-gen-6-ground-control-box",
    label: "Gen 6 Ground Control Box",
    note: "$250 core credit",
  },
  {
    codes: "E9 / E14 / A5",
    issue: "Platform joystick / control box",
    href: "/parts/genie-137634-joystick",
    label: "Genie 137634 Joystick",
    note: "Gen 6 platform control",
  },
  {
    codes: "E4 / E5",
    issue: "Battery voltage / charging",
    href: "/battery-chargers#chargers",
    label: "Aerial Lift Chargers",
    note: "24V & 48V Genie options",
  },
  {
    codes: "E6 / LL",
    issue: "Tilt / level sensor",
    href: "/parts/genie-40836-level-sensor",
    label: "Genie 40836 Level Sensor",
    note: "Common GS-series sensor",
  },
  {
    codes: "E1 / 18",
    issue: "Emergency stop circuit",
    href: "/parts/genie-66812-e-stop-button",
    label: "Genie 66812 E-stop",
    note: "Platform & ground E-stops",
  },
  {
    codes: "E10 / 59",
    issue: "Hydraulic pump / lift motor",
    href: "/parts/genie-40844gt-pump-motor",
    label: "Genie 40844GT Pump Motor",
    note: "12–24V pump motor",
  },
];

const quoteDiagnosticHref =
  "/quote?equipment=Genie&notes=" +
  encodeURIComponent("Genie scissor lift error code — need parts / diagnosis help");

export default function GenieScissorLiftErrorCodes() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to reset Genie scissor lift error codes",
    description:
      "Safe reset procedure for Genie GS-series scissor lifts when an error code appears on the display.",
    totalTime: "PT10M",
    step: [
      {
        "@type": "HowToStep",
        name: "Lower the platform",
        text: "Lower the lift completely to the ground and clear the work area before troubleshooting.",
      },
      {
        "@type": "HowToStep",
        name: "Power down",
        text: "Turn the machine off and confirm both platform and ground emergency stops are reset.",
      },
      {
        "@type": "HowToStep",
        name: "Engage override",
        text: "Engage override mode on the control panel per your model’s service procedure.",
      },
      {
        "@type": "HowToStep",
        name: "Restart and retest",
        text: "Turn the machine back on. If the code returns, inspect the indicated system or replace the related component.",
      },
    ],
  };

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.flatearthequipment.com" },
          { name: "Aerial Equipment Parts", url: "https://www.flatearthequipment.com/parts/aerial-equipment" },
          { name: "Genie Error Codes", url: PAGE_URL },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Featured Snippet Quick Answer Box */}
        <div className="not-prose mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-xl p-6 shadow-sm">
          <p className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-2">Quick Answer</p>
          <p className="text-lg text-slate-900 mb-3">
            <strong>Genie scissor lift error codes indicate specific system faults.</strong> The most common codes are:{" "}
            <strong>E1</strong> (Emergency Stop), <strong>E4</strong> (Low Battery), <strong>E6</strong> (Tilt Sensor),
            and <strong>E12/E13</strong> (Control Communication).
          </p>
          <p className="text-slate-700">
            <strong>To reset:</strong> (1) Lower lift completely to ground, (2) Turn off machine, (3) Engage override
            mode on control panel, (4) Turn machine back on. If codes persist after reset, inspect the affected
            component or contact a technician.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="not-prose mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/genie-serial-number-lookup"
            className="flex flex-col items-center gap-2 p-4 bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 rounded-xl transition-all"
          >
            <span className="text-2xl" aria-hidden>
              🔍
            </span>
            <span className="text-xs font-semibold text-center">Genie Serial Lookup</span>
          </Link>
          <Link
            href="/parts/genie-gen-6-ground-control-box"
            className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-xl transition-all"
          >
            <span className="text-2xl" aria-hidden>
              🎛️
            </span>
            <span className="text-xs font-semibold text-center">Ground Control Box</span>
          </Link>
          <Link
            href="/parts?brand=genie"
            className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-xl transition-all"
          >
            <span className="text-2xl" aria-hidden>
              🔧
            </span>
            <span className="text-xs font-semibold text-center">Genie Parts</span>
          </Link>
          <Link
            href={quoteDiagnosticHref}
            className="flex flex-col items-center gap-2 p-4 bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 rounded-xl transition-all"
          >
            <span className="text-2xl" aria-hidden>
              💬
            </span>
            <span className="text-xs font-semibold text-center">Get Help</span>
          </Link>
        </div>

        {/* At-a-Glance Box */}
        <div className="not-prose mb-8 bg-slate-50 border-2 border-slate-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Genie Code Types</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-semibold text-slate-900 mb-1">E-Codes (E1–E20):</div>
              <div className="text-slate-700">Common error codes for GS series</div>
            </div>
            <div>
              <div className="font-semibold text-slate-900 mb-1">OIC Codes:</div>
              <div className="text-slate-700">Indicators (LL, OL, OIL, nd, br, CH, PHS)</div>
            </div>
            <div>
              <div className="font-semibold text-slate-900 mb-1">DTC Codes:</div>
              <div className="text-slate-700">Diagnostic trouble codes (01–59)</div>
            </div>
            <div>
              <div className="font-semibold text-slate-900 mb-1">H-Codes:</div>
              <div className="text-slate-700">Hydraulic coil faults (H102, H103)</div>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Showing {genieFaultCodes.length} frequently searched codes for GS-series scissors and common boom faults.
            Model service manuals list additional DTCs by serial.
          </p>
        </div>

        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Genie Scissor Lift Error Codes: Complete Guide
        </h1>

        <p className="text-lg text-slate-600 mb-8">
          Searchable database of common Genie error codes for scissor lifts (GS series) and boom lifts. Find your
          code, understand the problem, and get back to work quickly.
        </p>

        <div className="prose prose-slate max-w-none mb-8">
          <p>
            Genie scissor lifts are widely used for reaching work at height safely. When a code appears, match it
            below, clear obvious interlocks (level, overload, E-stop), then chase the related sensor, harness, or
            control part if the fault returns.
          </p>
        </div>

        {/* Searchable Code Database */}
        <GenieCodeBrowser />

        {/* Code → Parts soft-sell */}
        <div className="not-prose my-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Common Codes → Parts We Stock</h2>
          <p className="text-slate-600 mb-6">
            Diagnose first, then grab the usual replacement when the fault points at hardware—not just a reset.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {CODE_PART_MAP.map((row) => (
              <Link
                key={row.href + row.codes}
                href={row.href}
                className="block p-4 bg-white border-2 border-slate-200 hover:border-[#F76511] rounded-xl transition-all"
              >
                <div className="font-mono text-sm font-bold text-[#F76511] mb-1">{row.codes}</div>
                <div className="font-semibold text-slate-900">{row.label}</div>
                <div className="text-sm text-slate-600 mt-1">{row.issue}</div>
                <div className="text-xs text-slate-500 mt-2">{row.note}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="prose prose-slate max-w-none my-12">
          <h2>Troubleshooting Steps</h2>
          <p>When encountering an error code, follow these general troubleshooting steps:</p>
          <ol>
            <li>Record the exact code and any OIC indicators (LL, OL, nd, br)</li>
            <li>Confirm the machine is level, unloaded, and both E-stops are reset</li>
            <li>Inspect the affected system, harness, and connectors</li>
            <li>Verify battery voltage and charger operation for E4/E5</li>
            <li>Clear the code after resolving the issue, then retest functions</li>
          </ol>

          <div className="not-prose bg-orange-50 border border-orange-200 rounded-lg p-4 my-6">
            <h3 className="text-lg font-semibold text-orange-800 mb-2">Ground Control Issues (E12, E13, E15)?</h3>
            <p className="text-orange-700">
              If communication errors persist after harness checks, the issue is often control-box hardware. We stock
              the{" "}
              <Link
                href="/parts/genie-gen-6-ground-control-box"
                className="text-orange-600 hover:text-orange-700 underline font-medium"
              >
                Genie Gen 6 Ground Control Box
              </Link>{" "}
              with a $250 core credit.
            </p>
          </div>

          <h2>Reset Procedures</h2>
          <ol>
            <li>Turn off the machine and ensure it&apos;s safely on the ground</li>
            <li>Engage override mode using the control panel</li>
            <li>Turn the machine back on to reset the system</li>
          </ol>

          <h2>Safety Considerations</h2>
          <ul>
            <li>Never attempt repairs while the platform is elevated</li>
            <li>Follow proper lockout/tagout procedures</li>
            <li>Use appropriate personal protective equipment</li>
            <li>Consult with qualified technicians for complex issues</li>
          </ul>

          <h2>Frequently Asked Questions</h2>
          {FAQS.map((faq) => (
            <div key={faq.question} className="mb-6">
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          ))}
        </div>

        {/* Ground Control Box CTA */}
        <div className="not-prose my-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Having E12, E13, or E15 Communication Errors?</h2>
            <p className="text-slate-700 mb-6">
              Persistent ground control communication errors often require control box replacement. We stock{" "}
              <strong>Genie Gen 6 Ground Control Boxes</strong> with $250 core credit.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/parts/genie-gen-6-ground-control-box"
                className="inline-flex items-center gap-2 bg-[#F76511] text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-md"
              >
                View Ground Control Box →
              </Link>
              <Link
                href={
                  "/quote?sku=genie-gen-6-ground-control-box&equipment=Genie&notes=" +
                  encodeURIComponent("E12/E13/E15 communication error — Gen 6 ground control box")
                }
                className="inline-flex items-center gap-2 bg-white text-[#F76511] border-2 border-[#F76511] px-8 py-3 rounded-xl font-bold hover:bg-orange-50 transition-all"
              >
                Request Quote
              </Link>
            </div>
          </div>
        </div>

        {/* Parts CTA */}
        <div className="not-prose my-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Need Genie Scissor Lift Parts?</h2>
          <p className="text-slate-700 mb-6">
            We stock sensors, joysticks, control boxes, chargers, hydraulic components, and electrical parts for Genie
            GS and boom lift models.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/parts?brand=genie"
              className="inline-flex items-center gap-2 bg-[#F76511] text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-md"
            >
              Shop Genie Parts →
            </Link>
            <Link
              href={quoteDiagnosticHref}
              className="inline-flex items-center gap-2 bg-white text-[#F76511] border-2 border-[#F76511] px-8 py-3 rounded-xl font-bold hover:bg-orange-50 transition-all"
            >
              Request Diagnostic Help
            </Link>
          </div>
        </div>

        {/* Related Resources */}
        <div className="not-prose bg-white border-2 border-slate-200 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Related Genie Resources</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/genie-serial-number-lookup"
              className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg"
            >
              <span className="text-2xl" aria-hidden>
                🔍
              </span>
              <div>
                <div className="font-semibold">Genie Serial Number Lookup</div>
                <div className="text-sm text-slate-600">Identify your GS model and year</div>
              </div>
            </Link>
            <Link
              href="/parts/genie-gen-6-ground-control-box"
              className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg"
            >
              <span className="text-2xl" aria-hidden>
                🎛️
              </span>
              <div>
                <div className="font-semibold">Gen 6 Ground Control Box</div>
                <div className="text-sm text-slate-600">Fix E12/E13/E15 errors — $250 core credit</div>
              </div>
            </Link>
            <Link
              href="/insights/genie-1256727gt-joystick"
              className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg"
            >
              <span className="text-2xl" aria-hidden>
                🕹️
              </span>
              <div>
                <div className="font-semibold">1256727GT Platform Joystick Guide</div>
                <div className="text-sm text-slate-600">Gen 6 upper control box fitment</div>
              </div>
            </Link>
            <Link
              href="/insights/genie-lift-battery-replacement"
              className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg"
            >
              <span className="text-2xl" aria-hidden>
                🔋
              </span>
              <div>
                <div className="font-semibold">Genie Battery Replacement</div>
                <div className="text-sm text-slate-600">Helpful for recurring E4 low-voltage faults</div>
              </div>
            </Link>
            <Link href="/brand/genie" className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg">
              <span className="text-2xl" aria-hidden>
                📚
              </span>
              <div>
                <div className="font-semibold">Genie Brand Hub</div>
                <div className="text-sm text-slate-600">Parts, guides, and resources</div>
              </div>
            </Link>
            <Link
              href="/insights/genie-fault-code-2000-12"
              className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg"
            >
              <span className="text-2xl" aria-hidden>
                📡
              </span>
              <div>
                <div className="font-semibold">Fault Code 2000-12 (CAN Bus)</div>
                <div className="text-sm text-slate-600">Deeper CAN communication diagnosis</div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
