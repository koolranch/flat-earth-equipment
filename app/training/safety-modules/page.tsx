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
          Quick, focused safety training modules coming soon.
        </p>
        
        {/* TODO: Implement safety micro-modules functionality */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">
            🚧 Under Development
          </h2>
          <p className="text-yellow-700">
            <strong>TODO:</strong> Build out safety micro-modules with:
          </p>
          <ul className="text-left text-yellow-700 mt-2 space-y-1">
            <li>• Hazard recognition training</li>
            <li>• Equipment-specific safety protocols</li>
            <li>• Quick refresher courses</li>
            <li>• Workplace safety compliance</li>
          </ul>
        </div>
      </div>
    </main>
  );
} 