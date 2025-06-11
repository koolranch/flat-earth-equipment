import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Safety Training & Certification | Flat Earth Equipment",
  description: "OSHA-compliant forklift operator courses and safety micro-modules. Train the Western-tough way.",
};

export default function TrainingHome() {
  return (
    <main className="container mx-auto px-4 lg:px-8 py-12 space-y-20">
      {/* HERO */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl lg:text-5xl font-bold">
          Training & Certification
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Online OSHA-compliant courses that keep your crew safe and your
          fleet moving.
        </p>
        <p className="text-sm text-orange-600 font-medium">
          All courses are OSHA-compliant. Click to learn more.
        </p>
      </section>

      {/* COURSE GRID */}
      <section className="grid gap-10 md:grid-cols-2">
        {/* Forklift Certification Card */}
        <Link href="/safety" className="group">
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 group-hover:-translate-y-1">
            <div className="relative">
              <div className="bg-gray-200 w-full h-48 flex items-center justify-center">
                <span className="text-gray-500">Forklift Certification</span>
              </div>
              <div className="absolute top-4 right-4">
                <span className="bg-orange-100 text-orange-800 text-sm font-semibold px-3 py-1 rounded-full">
                  OSHA
                </span>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-canyon-rust transition-colors">
                Forklift Operator Certification
              </h3>
              
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-canyon-rust">
                  $59
                </span>
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  Learn more →
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* Safety Modules Card */}
        <Link href="/training/safety-modules" className="group">
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 group-hover:-translate-y-1">
            <div className="relative">
              <div className="bg-gray-200 w-full h-48 flex items-center justify-center">
                <span className="text-gray-500">Safety Modules</span>
              </div>
              <div className="absolute top-4 right-4">
                <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                  NEW
                </span>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-canyon-rust transition-colors">
                Safety Micro-Modules
              </h3>
              
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-canyon-rust">
                  From $19
                </span>
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  Learn more →
                </span>
              </div>
            </div>
          </div>
        </Link>
      </section>
    </main>
  );
} 