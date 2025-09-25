import Link from 'next/link';

export default function CompletionPage() {
  return (
    <div className="mx-auto max-w-3xl py-10">
      <h1 className="text-2xl font-semibold">Course Completion</h1>
      <p className="mt-2 text-muted-foreground">Nice work — you've finished all learning modules. Take the final exam to generate your certificate.</p>
      <div className="mt-6 flex gap-3">
        <Link href="/training/exam" className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Go to Final Exam</Link>
        <Link href="/training" className="inline-flex items-center rounded-md border px-4 py-2 hover:bg-accent">Back to dashboard</Link>
      </div>
    </div>
  );
}
