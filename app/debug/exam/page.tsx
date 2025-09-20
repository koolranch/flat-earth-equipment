import { examPreflight } from '@/lib/training/final-exam-preflight';
import { requireAuthServer } from '@/lib/auth/requireAuthServer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ExamDebugPage() {
  if (process.env.NEXT_PUBLIC_TRAINING_DEBUG !== 'true') {
    return <div className="mx-auto max-w-3xl py-10">Debug is disabled.</div>;
  }
  await requireAuthServer();
  const data = await examPreflight();
  return (
    <div className="mx-auto max-w-4xl py-10 space-y-6">
      <h1 className="text-2xl font-semibold">Final Exam Preflight (read-only)</h1>
      <section className="rounded-xl border p-4">
        <h2 className="font-medium">Settings</h2>
        <pre className="mt-2 text-sm whitespace-pre-wrap">{JSON.stringify(data.settings, null, 2)}</pre>
      </section>
      <section className="rounded-xl border p-4">
        <h2 className="font-medium">Module slugs (from modules.content_slug)</h2>
        <pre className="mt-2 text-sm whitespace-pre-wrap">{JSON.stringify(data.moduleSlugs, null, 2)}</pre>
      </section>
      <section className="rounded-xl border p-4">
        <h2 className="font-medium">Quiz slugs → counts</h2>
        <pre className="mt-2 text-sm whitespace-pre-wrap">{JSON.stringify(data.quizBySlug, null, 2)}</pre>
      </section>
      <section className="rounded-xl border p-4">
        <h2 className="font-medium">Orphan slugs</h2>
        <pre className="mt-2 text-sm whitespace-pre-wrap">{JSON.stringify(data.orphanSlugs, null, 2)}</pre>
      </section>
      <section className="rounded-xl border p-4">
        <h2 className="font-medium">Counts</h2>
        <pre className="mt-2 text-sm whitespace-pre-wrap">{JSON.stringify(data.counts, null, 2)}</pre>
      </section>
      <section className="rounded-xl border p-4">
        <h2 className="font-medium">Sample picked IDs (dry-run)</h2>
        <pre className="mt-2 text-sm whitespace-pre-wrap">{JSON.stringify(data.sampleIds, null, 2)}</pre>
      </section>
    </div>
  );
}
