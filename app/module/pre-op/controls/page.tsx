'use client';
import ControlHotspots from '@/components/demos/ControlHotspots';
import GuideSection from '@/components/guides/GuideSection';
import { moduleGuides } from '@/content/guides/modules';
import { useT } from '@/lib/i18n';

export default function Page(){
  const t = useT();
  const locale = typeof document !== 'undefined' && document.documentElement.lang === 'es' ? 'es' : 'en';
  const guides = moduleGuides['hazard-hunt']?.guides || [];

  return (
    <main className="container mx-auto p-4 space-y-4">
      <ControlHotspots locale={locale}/>
      
      {/* OSHA Guide Cards */}
      {guides.length > 0 && (
        <section className='space-y-2'>
          <h2 className='text-lg font-semibold text-[#0F172A] dark:text-white'>{t('guides.heading')}</h2>
          <GuideSection guides={guides} />
        </section>
      )}
    </main>
  );
}
