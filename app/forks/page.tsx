import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Forklift Forks for Sale | Flat Earth Equipment",
  description:
    "Shop heavy-duty forklift forks online. Class II–IV forks, pallet forks, block forks & more. Fast shipping, built for lift trucks & telehandlers.",
  alternates: {
    canonical: "/forks",
  },
};

export default function ForksPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">Forklift Forks</h1>
      <p className="mb-6 max-w-3xl text-lg">
        Whether you run a single warehouse or a multi-site fleet, Flat Earth Equipment supplies
        heavy-duty forklift forks built for the toughest material handling demands. We offer Class II,
        Class III, and Class IV forks in standard and custom lengths, including tapered pallet forks,
        block forks, and telehandler-compatible styles.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white rounded-2xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-2">Most Popular Fork Types</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Pallet forks (ITA hook mount)</li>
            <li>Telehandler forks</li>
            <li>Block handling forks</li>
            <li>Drum forks & lumber forks</li>
          </ul>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-2">Common Specs</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Lengths: 36" – 96"</li>
            <li>Widths: 4" to 6"</li>
            <li>Capacities: up to 10,000 lbs</li>
            <li>Mount types: ITA Class II / III / IV, shaft mount, pin mount</li>
          </ul>
        </div>
      </div>

      <Image
        src="/images/insights/what-are-forklift-forks-made-of-2.jpg"
        alt="Forklift forks for sale"
        width={1216}
        height={832}
        className="rounded-xl mb-10 shadow"
      />

      <div className="space-y-6 text-gray-800 max-w-3xl">
        <p>
          Our forks meet or exceed ANSI/ITSDF B56.1 standards. All products are inspected for
          thickness, heel wear, and weld quality. Need help matching forks to your machine? Our team
          can assist with fork charts and ITA class selection.
        </p>

        <p>
          Browse our collection or <Link href="/quote" className="text-blue-600 underline">request a quote</Link> for bulk orders and custom-length forks.
        </p>

        <div className="border-t pt-6 mt-10">
          <h2 className="text-xl font-semibold mb-4">FAQ: Forklift Forks</h2>
          <div>
            <p className="font-semibold">What class are forklift forks?</p>
            <p className="text-gray-700">Forks are rated Class II (16" tall carriage), Class III (20"), or Class IV (25"). Your forklift manual or carriage plate will indicate the class.</p>
          </div>
          <div className="mt-4">
            <p className="font-semibold">How do I measure forklift forks?</p>
            <p className="text-gray-700">Length (tip to heel), width (side to side), and thickness (top to bottom). Also check hook spacing and carriage class.</p>
          </div>
          <div className="mt-4">
            <p className="font-semibold">Are your forks OEM?</p>
            <p className="text-gray-700">No — we sell high-quality aftermarket forks made to OEM specs, suitable for most major brands like Toyota, Hyster, and Cat.</p>
          </div>
        </div>
      </div>
    </main>
  );
} 