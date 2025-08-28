// app/admin/evaluation/[enrollmentId]/page.tsx
import 'server-only';
import PracticalEvalForm from '@/components/admin/PracticalEvalForm';

export default function Page({ params }: { params: { enrollmentId: string } }) {
  return (<main className='container mx-auto p-4'>
    <h1 className='text-2xl font-bold text-[#0F172A]'>Practical Evaluation</h1>
    <PracticalEvalForm enrollmentId={params.enrollmentId} />
  </main>);
}
