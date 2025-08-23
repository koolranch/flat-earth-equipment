import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "New Holland Skid Steer Serial Number Lookup Guide | Flat Earth Equipment",
  description: "Learn how to find and decode your New Holland skid steer serial number. Complete guide for L170, L180, L185, and other models.",
  alternates: {
    canonical: "/parts/construction-equipment-parts/new-holland-skid-steer-serial-number-lookup",
  },
};

export default function NewHollandSkidSteerSerialNumberLookup() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-slate-900 mb-6">
        New Holland Skid Steer Serial Number Lookup Guide
      </h1>

      {/* Interactive Tool Callout */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="bg-blue-600 p-2 rounded-lg flex-shrink-0">
            🛠️
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">🚀 Try Our Interactive New Holland Decoder</h3>
            <p className="text-slate-700 mb-4">
              Get instant plate location tips and (when available) year estimates with our new interactive tool. 
              Just enter your serial number for immediate results covering all equipment types!
            </p>
            <Link 
              href="/new-holland-serial-number-lookup"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              🔍 Try Interactive New Holland Lookup Tool
            </Link>
          </div>
        </div>
      </div>

      <div className="prose prose-slate max-w-none">
        <p className="lead">
          Your skid steer's product identification plate (PIN) lists the serial and often the model year.
          Use your serial for precise parts selection; year-only lookups can miss mid-series changes.
        </p>

        <h2>Where to Find Your Serial Number</h2>
        <p>
          New Holland skid steer serial numbers can be found in several locations:
        </p>
        <ul>
          <li>On the left side of the machine frame, near the operator's platform</li>
          <li>Under the operator's seat</li>
          <li>On the engine block</li>
          <li>In the operator's manual</li>
          <li>On the machine's data plate</li>
        </ul>

        <h2>Serial Number Format</h2>
        <p>
          New Holland skid steer serial numbers typically follow this format:
        </p>
        <ul>
          <li>L Series (L170, L180, L185): Starts with "L" followed by numbers</li>
          <li>LS Series: Starts with "LS" followed by numbers</li>
          <li>LM Series: Starts with "LM" followed by numbers</li>
        </ul>

        <h2>Model-Specific Information</h2>

        <h3>L Series Skid Steers</h3>
        <ul>
          <li>L170: Serial numbers begin with "L170"</li>
          <li>L180: Serial numbers begin with "L180"</li>
          <li>L185: Serial numbers begin with "L185"</li>
        </ul>

        <h3>LS Series Skid Steers</h3>
        <ul>
          <li>LS160: Serial numbers begin with "LS160"</li>
          <li>LS170: Serial numbers begin with "LS170"</li>
          <li>LS180: Serial numbers begin with "LS180"</li>
        </ul>

        <h2>Using Your Serial Number</h2>
        <p>
          Your serial number is essential for:
        </p>
        <ul>
          <li>Ordering the correct parts</li>
          <li>Determining the year of manufacture</li>
          <li>Identifying specific model features</li>
          <li>Warranty claims</li>
          <li>Equipment registration</li>
        </ul>

        {/* Quick Tool Reference */}
        <div className="not-prose bg-white border border-slate-200 rounded-lg p-6 my-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              🔧
            </div>
            <h3 className="text-lg font-bold text-slate-900">Need a Quick Check?</h3>
          </div>
          <div className="text-sm text-slate-600 mb-3">Open the tool and enter your serial.</div>
          <Link 
            className="inline-block rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition" 
            href="/new-holland-serial-number-lookup"
          >
            Open the New Holland Serial Number Lookup
          </Link>
        </div>

        <h2>Year Identification</h2>
        <p>
          The serial number can help identify your machine's year:
        </p>
        <ul>
          <li>2000-2004: Early L Series models</li>
          <li>2005-2009: Later L Series and early LS Series</li>
          <li>2010-Present: LS Series and newer models</li>
        </ul>

        <h2>Parts Ordering Tips</h2>
        <p>
          When ordering parts, always provide:
        </p>
        <ul>
          <li>Complete serial number</li>
          <li>Model number</li>
          <li>Year of manufacture</li>
          <li>Specific part description</li>
        </ul>

        <h2>Common Issues</h2>
        <ul>
          <li>Worn or damaged serial number plate</li>
          <li>Illegible numbers due to rust or damage</li>
          <li>Multiple serial numbers on different components</li>
          <li>Mismatched serial numbers</li>
        </ul>

        <h2>Verification Process</h2>
        <p>
          To verify your serial number:
        </p>
        <ol>
          <li>Locate all serial number locations on your machine</li>
          <li>Compare numbers to ensure they match</li>
          <li>Check against your operator's manual</li>
          <li>Contact your dealer for verification if needed</li>
        </ol>

        <h2>Professional Assistance</h2>
        <p>
          If you need help with serial number identification:
        </p>
        <ul>
          <li>Contact your local New Holland dealer</li>
          <li>Use the New Holland parts lookup system</li>
          <li>Consult with equipment specialists</li>
          <li>Check online parts catalogs</li>
        </ul>

        <h2>Why Serial Beats "Model Year" for Parts</h2>
        <p>
          New Holland parts catalogs are serial-driven. Year-only lookups can be misleading due to mid-series changes. Use the serial for precise fit.
        </p>

        <h2>Conclusion</h2>
        <p>
          Understanding your New Holland skid steer's serial number is essential for proper maintenance and parts ordering. Keep your serial number in a safe place and always reference it when ordering parts or seeking service. If you're unsure about your serial number or need assistance, don't hesitate to contact your dealer or equipment specialist.
        </p>

        <p className="text-xs text-slate-500">
          Note: Year estimates are available only for models with published ranges or prefix patterns.
          When in doubt, the plate is authoritative.
        </p>
      </div>
    </main>
  );
} 