import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "JCB Telehandler Battery Location Guide | Flat Earth Equipment",
  description: "Learn where to find and how to access the battery in your JCB telehandler. Complete guide for JCB 510-56, 520-50, and other models.",
  alternates: {
    canonical: "/rental/telehandler/jcb-telehandler-battery-location",
  },
};

export default function JCBTelehandlerBatteryLocation() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
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

        <h2>Battery Access Steps</h2>
        <ol>
          <li>Park the telehandler on level ground</li>
          <li>Engage the parking brake</li>
          <li>Lower the boom completely</li>
          <li>Turn off the engine and remove the key</li>
          <li>Open the access panel</li>
          <li>Disconnect the negative terminal first, then the positive</li>
        </ol>

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
    </main>
  );
} 