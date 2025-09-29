import HazardHunt from "@/components/lessons/hazards/HazardHunt";
import { ModuleContent } from '@/components/training/content/ModuleContent';
import { module4Sections } from '@/content/training';

export const metadata = { title: "Module 4 · Hazard Spotting" };

export default function Page() {
  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Module 4: Hazard Spotting</h1>
      
      {/* Learning Content */}
      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-medium text-slate-900">Learning Content</h2>
        <ModuleContent sections={module4Sections} />
      </section>
      
      <p className="text-slate-600">Tap all hazards in each scene. Use <code>?debug=1</code> to visualize target zones during QA. Optional timer via <code>?time=120</code>.</p>
      
      {/* Interactive Demo */}
      <HazardHunt />
    </main>
  );
}
