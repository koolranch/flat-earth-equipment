// app/module/pre-op/demo/minippe/page.tsx
"use client";
import MiniPPE from "@/components/games/module1/MiniPPE";
import GuideSection from '@/components/guides/GuideSection';
import { moduleGuides } from '@/content/guides/modules';
import { useT } from '@/lib/i18n';

export default function MiniPPEPage() {
  const t = useT();
  const guides = moduleGuides['pre-operation-inspection']?.guides || [];

  return (
    <main className="container mx-auto p-4 md:p-6 space-y-4">
      <MiniPPE 
        locale="en" 
        moduleSlug="pre-operation-inspection"
      />

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
