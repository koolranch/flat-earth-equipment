'use client';
import dynamic from 'next/dynamic';
const QuestEngine = dynamic(() => import('@/components/quests/QuestEngine'), { ssr: false });

export default function QuestPage({ params }: { params: { slug: string } }) {
  return (
    <main id="main" className="container mx-auto p-4" role="main" aria-label="Practice drill">
      <QuestEngine slug={params.slug} />
    </main>
  );
}
