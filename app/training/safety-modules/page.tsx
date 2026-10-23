import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Safety Micro-Modules | Flat Earth Equipment",
  description: "Quick safety training modules for industrial equipment operators.",
};

export default function SafetyModules() {
  return (
    <main className="container mx-auto px-4 lg:px-8 py-12">
      <div className="text-center space-y-6">
        <h1 className="text-4xl lg:text-5xl font-bold">
          Safety Micro-Modules
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          This page does not list separate micro-modules. Formal instruction is on the certification page, and it is under 30 minutes.
        </p>
        <p className="text-lg">
          <a href="/safety" className="text-[#F76511] font-semibold">Forklift certification</a>
        </p>
      </div>
    </main>
  );
} 