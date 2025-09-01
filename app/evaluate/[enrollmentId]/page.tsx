import EvaluationForm from '@/components/trainer/EvaluationForm';

export const dynamic = 'force-dynamic';

export default function Page({ params }: { params: { enrollmentId: string } }) {
  return (
    <main className="container mx-auto p-4">
      <EvaluationForm enrollmentId={params.enrollmentId} />
    </main>
  );
}
