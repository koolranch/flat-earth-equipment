import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "OSHA Forklift Operator Training | Flat Earth Equipment",
  description:
    "Compliant forklift and aerial lift operator certification. Online and onsite OSHA training designed for warehouse and jobsite equipment operators.",
  alternates: {
    canonical: "/osha-operator-training",
  },
};

export default function OperatorTrainingPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <section className="mb-12">
        <h1 className="text-4xl font-bold mb-4">OSHA Operator Training</h1>
        <p className="text-lg text-gray-700 mb-4">
          Flat Earth Equipment provides OSHA-compliant training for forklift, scissor lift, boom lift, and MEWP operators. Whether you're onboarding new team members or renewing expired certifications, we offer flexible online and onsite options tailored for busy fleets.
        </p>
        <Link
          href="/quote?topic=training"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
        >
          Request Training Quote
        </Link>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-4">What We Cover</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Class I–VII forklift certification (counterbalance, reach, pallet jacks, telehandlers)</li>
          <li>Scissor lift & boom lift training (MEWP Category 3A & 3B)</li>
          <li>Operator evaluations per OSHA 1910.178 & ANSI A92.24</li>
          <li>Written test + hands-on equipment assessment</li>
          <li>Training documentation and wallet cards for each operator</li>
        </ul>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        <div className="bg-white shadow rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-2">💻 Online Certification</h3>
          <p className="text-gray-700 mb-2">
            Operators complete their theory portion online, then schedule an in-person evaluation with your site supervisor or ours.
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600">
            <li>Self-paced modules with final exam</li>
            <li>Includes certificate + printable wallet card</li>
            <li>Valid for 3 years</li>
          </ul>
        </div>
        <div className="bg-white shadow rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-2">📍 Onsite Training</h3>
          <p className="text-gray-700 mb-2">
            We come to you. Ideal for companies with 3+ operators. Includes theory, hands-on evaluation, and training records.
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600">
            <li>2–3 hour training sessions</li>
            <li>Custom documentation packets</li>
            <li>Volume pricing available</li>
          </ul>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-6">Why It Matters</h2>
        <p className="text-gray-700 mb-4">
          OSHA requires that all powered industrial truck operators be trained and evaluated. Non-compliance can lead to:
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Hefty fines (up to $15,000+ per violation)</li>
          <li>Increased liability exposure after accidents</li>
          <li>Disqualified bids on government and private contracts</li>
        </ul>
      </section>

      <section className="max-w-3xl">
        <h2 className="text-2xl font-semibold mb-6">FAQs</h2>
        <div className="space-y-4 text-gray-800">
          <div>
            <p className="font-semibold">How long is the certification valid?</p>
            <p>Three years per OSHA guidelines, or sooner if the operator has an accident or changes equipment types.</p>
          </div>
          <div>
            <p className="font-semibold">Can I take forklift training online?</p>
            <p>Yes, but you'll need a certified trainer to conduct the final hands-on evaluation.</p>
          </div>
          <div>
            <p className="font-semibold">Do you offer group discounts?</p>
            <p>Yes. We offer reduced rates for teams of 3 or more operators — available nationwide.</p>
          </div>
          <div>
            <p className="font-semibold">Is MEWP training required separately?</p>
            <p>Yes — scissor and boom lifts fall under ANSI A92.24 and are not covered by forklift certification alone.</p>
          </div>
        </div>
      </section>
    </main>
  );
} 