import { supabaseServer } from '@/lib/supabase/server';

export default async function RecentCommunityNotes({ brandSlug, limit = 3 }: { brandSlug: string; limit?: number }) {
  const supabase = supabaseServer();
  const { data } = await supabase
    .from('svc_public_notes')
    .select('id,category,model,code,content,created_at')
    .eq('brand', brandSlug)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (!data || !data.length) return null;
  
  return (
    <section aria-labelledby='recent-notes-title' className='border rounded-xl p-4 bg-card'>
      <h3 id='recent-notes-title' className='text-base font-semibold mb-2'>Recent Community Tips</h3>
      <ul className='space-y-3'>
        {data.map(n => (
          <li key={n.id} className='text-sm'>
            <div className='flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground'>
              <span className='inline-flex items-center rounded-full px-2 py-0.5 border'>{n.category}</span>
              {n.model ? <span>• {n.model}</span> : null}
              {n.code ? <span>• {n.code}</span> : null}
              <span className='ml-auto'>{new Date(n.created_at).toLocaleDateString()}</span>
            </div>
            <div className='mt-1 line-clamp-3'>{n.content}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
