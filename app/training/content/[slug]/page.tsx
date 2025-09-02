import { cookies } from 'next/headers';
import ContentPage from '@/components/mdx/ContentPage';

export default async function TrainingContentPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  // Get locale from cookies (following the existing pattern)
  const locale = (cookies().get('locale')?.value === 'es') ? 'es' : 'en';
  
  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <ContentPage slug={params.slug} locale={locale} />
    </main>
  );
}
