'use client';
import QuestEngine from '@/components/quests/QuestEngine';

export default function QuestPage({ params }: { params: { slug: string } }) {
  return (
    <main id="main" className="container mx-auto p-4" role="main" aria-label="Practice drill">
      <QuestEngine slug={params.slug} />
    </main>
  );
}
