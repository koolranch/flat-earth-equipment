import ShutdownTrainer from "@/components/lessons/shutdown/ShutdownTrainer";

export const metadata = { title: "Module 5 · Shutdown Trainer" };

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Module 5: Shutdown</h1>
      <p className="text-slate-600">Practice the proper shutdown sequence with short, looped animations. Designed for mobile first.</p>
      <ShutdownTrainer />
    </main>
  );
}
