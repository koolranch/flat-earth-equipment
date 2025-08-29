import { cookies } from 'next/headers';
import PreOpDecisionTree from '@/components/demos/PreOpDecisionTree';
import GuideSection from '@/components/guides/GuideSection';
import { moduleGuides } from '@/content/guides/modules';

export default function Page(){
  const locale = (cookies().get('locale')?.value === 'es') ? 'es' : 'en';
  const guides = moduleGuides['pre-operation-inspection']?.guides || [];

  return (
    <main className="container mx-auto p-4 space-y-4">
      <PreOpDecisionTree locale={locale}/>
      
      {/* OSHA Guide Cards */}
      {guides.length > 0 && (
        <section className='space-y-2'>
          <h2 className='text-lg font-semibold text-[#0F172A] dark:text-white'>Guides</h2>
          <GuideSection guides={guides} />
        </section>
      )}
    </main>
  );
}
