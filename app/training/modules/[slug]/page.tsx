import ContentPage from '@/components/mdx/ContentPage';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function Page({ params }:{ params:{ slug:string } }){
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  const slug = params.slug;
  // (Optional) you can fetch module meta by slug from DB
  // const { data: mod } = await sb.from('modules').select('id,title').eq('slug', slug).maybeSingle();

  return (
    <main className="container mx-auto p-4 space-y-3">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b p-2 flex items-center justify-between">
        <h1 className="text-xl font-bold capitalize">{slug.replace(/-/g, ' ')}</h1>
        <a className="rounded-2xl bg-[#F76511] text-white px-3 py-1 text-sm" href="/training">Resume</a>
      </header>
      <ContentPage slug={slug} />
      <script dangerouslySetInnerHTML={{ __html: `window.analytics?.track?.('lesson_start', { slug: ${JSON.stringify(slug)} });` }} />
    </main>
  );
}
