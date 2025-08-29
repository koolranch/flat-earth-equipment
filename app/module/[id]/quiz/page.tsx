import 'server-only';
import DynamicQuiz from '@/components/quiz/DynamicQuiz';

export default function Page({ params }: { params: { id: string } }){
  return (
    <main className="container mx-auto p-4 space-y-3">
      <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">Quiz</h1>
      <p className="text-sm text-slate-600 dark:text-slate-300">Answer each question. Instant feedback; retry incorrect only.</p>
      {/* DynamicQuiz will handle both numeric IDs and string slugs */}
      <DynamicQuiz slug={params.id} />
    </main>
  );
}
