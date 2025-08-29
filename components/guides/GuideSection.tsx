'use client';
import GuideCard from './GuideCard';

export type Guide = { title: string; items: string[]; cite?: string };

export default function GuideSection({ guides }: { guides: Guide[] }) {
  if (!guides?.length) return null;
  return (
    <section className='grid gap-3'>
      {guides.map((g, i) => (<GuideCard key={i} {...g} />))}
    </section>
  );
}
