import HazardHunt from "@/components/lessons/hazards/HazardHunt";

export const metadata = { title: "Module 4 · Hazard Spotting" };

export default function Page() {
  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Module 4: Hazard Spotting</h1>
      <p className="text-slate-600">Tap all hazards in each scene. Use <code>?debug=1</code> to visualize target zones during QA. Optional timer via <code>?time=120</code>.</p>
      <HazardHunt />
    </main>
  );
}
