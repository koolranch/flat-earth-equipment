'use client';
import QuestEngine from '@/components/quests/QuestEngine';

export default function QuestPage({ params }: { params: { slug: string } }) {
  return (
    <main className="container mx-auto p-4">
      <QuestEngine slug={params.slug} />
    </main>
  );
}
