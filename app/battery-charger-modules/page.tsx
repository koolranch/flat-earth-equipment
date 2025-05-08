import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Forklift Battery Charger Modules | EnerSys & Hawker | Flat Earth Equipment",
  description:
    "Remanufactured charger modules for EnerSys and Hawker systems. Reduce downtime, save costs, and restore your forklift fleet's battery charging performance.",
  alternates: {
    canonical: "/battery-charger-modules",
  },
};

export default function ChargerModulesPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Power Your Forklifts with Reliable Remanufactured Charger Modules</h1>
        <p className="max-w-2xl mx-auto text-lg text-gray-700">
          Featuring the 6LA20671 model for EnerSys and Hawker systems — reduce downtime, save costs, and ensure top performance with ISO-certified modules.
        </p>
        <Link
          href="/parts/battery-charger-modules"
          className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
        >
          Browse Charger Modules
        </Link>
      </section>

      <section className="max-w-3xl mx-auto text-gray-800 mb-12">
        <h2 className="text-2xl font-semibold mb-4">What Are Charger Modules and Why Are They Important?</h2>
        <p className="mb-4">
          Charger modules are a critical component in maintaining the performance of your forklift battery chargers. They ensure reliable power delivery and reduce the risk of unscheduled shutdowns, keeping your operations running smoothly.
        </p>
        <p>
          At <strong>Flat Earth Equipment</strong>, we specialize in providing remanufactured charger modules that match or exceed original specifications. Each module is thoroughly analyzed by certified electronics technicians, cleaned, compressed, or dressed, then upgraded to the latest standards.
        </p>
      </section>

      <Image
        src="/images/modules/charger-bank.jpg"
        alt="Forklift battery charger modules in service"
        width={1216}
        height={832}
        className="rounded-xl mx-auto mb-12 shadow"
      />

      <section className="max-w-4xl mx-auto mb-16">
        <h2 className="text-2xl font-semibold mb-6">Features & Benefits</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>💰 <strong>Cost Savings:</strong> A fraction of the cost of new modules without sacrificing quality</li>
          <li>🔌 <strong>Simple Integration:</strong> Seamless compatibility with your existing charger system</li>
          <li>⚡ <strong>Reduced Downtime:</strong> Get chargers back in operation faster with reliable, tested modules</li>
          <li>🔧 <strong>Lower Maintenance Costs:</strong> Extend charger life and reduce repair expenses</li>
          <li>📦 <strong>Ready-to-Ship Inventory:</strong> Wide selection of modules in stock for immediate delivery</li>
        </ul>
      </section>

      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
        {[
          {
            name: "EnerSys 6LA20671 Charger Module",
            href: "/product/enersys-6la20671-charger-module",
            image: "/images/modules/enersys-6la20671.jpg",
            features: ["Voltage: 245VAC/DC", "Core Fee: $0", "Plug-and-play compatibility"],
          },
          {
            name: "Hawker 6LA20671 Charger Module",
            href: "/product/hawker-6la20671-charger-module",
            image: "/images/modules/hawker-6la20671.jpg",
            features: ["Voltage: 245VAC/DC", "Core Fee: $0", "Compatible with LifeSpeed models"],
          },
          {
            name: "Hawker 6LA20671 Repair Module",
            href: "/product/hawker-6la20671-repair",
            image: "/images/modules/hawker-repair.jpg",
            features: ["Expert repair", "No core fee", "OEM-quality remanufacturing"],
          },
        ].map((item) => (
          <div key={item.name} className="bg-white rounded-xl shadow p-4">
            <Image
              src={item.image}
              alt={item.name}
              width={400}
              height={300}
              className="rounded mb-4 mx-auto"
            />
            <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
            <ul className="text-sm text-gray-700 list-disc list-inside space-y-1 mb-4">
              {item.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <Link
              href={item.href}
              className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
            >
              View Details
            </Link>
          </div>
        ))}
      </section>

      <section className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4 text-gray-800">
          <div>
            <p className="font-semibold">What is a remanufactured charger module?</p>
            <p>It's a used module that has been reconditioned to meet or exceed OEM specs with fully tested and upgraded components.</p>
          </div>
          <div>
            <p className="font-semibold">How do I know which module is compatible?</p>
            <p>Check your charger model number or reach out to us — we'll match the right unit to your charger system.</p>
          </div>
          <div>
            <p className="font-semibold">What kind of warranty do your modules come with?</p>
            <p>All modules come with a 6-month replacement warranty (some models offer extended coverage).</p>
          </div>
          <div>
            <p className="font-semibold">What is the core fee?</p>
            <p>There's no core fee on most modules, but repairs may require returning the original unit after fulfillment.</p>
          </div>
        </div>
      </section>
    </main>
  );
} 