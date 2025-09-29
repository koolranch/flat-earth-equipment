import ShutdownSteps from '@/components/lessons/shutdown/ShutdownSteps';
import { ModuleContent } from '@/components/training/content/ModuleContent';
import { module5Sections } from '@/content/training';

export const metadata = { title: 'Module 5 · Shutdown' };
export default function Page() {
  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Module 5: Shutdown</h1>
      
      {/* Learning Content */}
      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-medium text-slate-900">Learning Content</h2>
        <ModuleContent sections={module5Sections} />
      </section>
      
      {/* Interactive Demo */}
      <ShutdownSteps />
    </main>
  );
}
