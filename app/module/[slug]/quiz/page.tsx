import 'server-only';
import DynamicQuiz from '@/components/quiz/DynamicQuiz';

export default function Page({ params }: { params: { slug: string } }){
  return (
    <main className="container mx-auto p-4 space-y-3">
      <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">Quiz</h1>
      <p className="text-sm text-slate-600 dark:text-slate-300">Answer each question. Instant feedback; retry incorrect only.</p>
      {/* Reuse your existing DynamicQuiz. It should fetch /api/quiz/[slug].json under the hood. */}
      <DynamicQuiz slug={params.slug} />
    </main>
  );
}
