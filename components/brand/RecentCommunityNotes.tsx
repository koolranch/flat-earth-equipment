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
    <section aria-labelledby='recent-notes-title' className='bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full'>
      <h3 id='recent-notes-title' className='text-lg font-semibold text-slate-900 mb-4'>Recent Community Tips</h3>
      <ul className='space-y-4'>
        {data.map(n => (
          <li key={n.id} className='text-sm pb-4 border-b border-slate-100 last:border-0 last:pb-0'>
            <div className='flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-2'>
              <span className='inline-flex items-center rounded-full px-2 py-0.5 bg-orange-50 text-orange-700 border border-orange-200 font-medium'>
                {n.category}
              </span>
              {n.model ? <span>• {n.model}</span> : null}
              {n.code ? <span>• {n.code}</span> : null}
              <span className='ml-auto'>{new Date(n.created_at).toLocaleDateString()}</span>
            </div>
            <div className='mt-1 text-slate-700 line-clamp-3'>{n.content}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
