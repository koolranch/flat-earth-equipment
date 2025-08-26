import { createClient } from '@supabase/supabase-js';

// Show ALL notes by default (no category filter).
// Props:
// - brandSlug: string (required)
// - tabCategory?: 'serial'|'fault'|'retrieval'|'plate'|'guide' (optional, only used to visually highlight matching notes)
// - limit?: number (default 10; bump via search param when needed)
export default async function CommunityNotes({ brandSlug, tabCategory, limit = 10 }: { brandSlug: string; tabCategory?: string; limit?: number }){
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  const { data, error } = await supabase
    .from('svc_public_notes')
    .select('*')
    .eq('brand', brandSlug)
    .order('created_at', { ascending: false })
    .limit(Math.max(1, Math.min(limit, 100)));

  if (error || !data || !data.length) return null;
  
  return (
    <section className='mt-8'>
      <div className='flex items-baseline justify-between gap-3 mb-2'>
        <h3 className='text-lg font-semibold'>Community Notes</h3>
        <span className='text-xs text-muted-foreground'>{data.length} shown</span>
      </div>
      <div className='space-y-3'>
        {data.map((n:any) => {
          const relevant = tabCategory && n.category === tabCategory;
          return (
            <article key={n.id} className={`border rounded-xl p-3 bg-card ${relevant ? 'border-brand-accent' : 'border-border'}`}>
              <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
                <span className='inline-flex items-center rounded-full px-2 py-0.5 border'>{n.category}</span>
                {n.model ? <span>• {n.model}</span> : null}
                {n.code ? <span>• {n.code}</span> : null}
                <span className='ml-auto'>{new Date(n.created_at).toLocaleDateString()}</span>
              </div>
              <div className='mt-1 whitespace-pre-wrap text-sm'>{n.content}</div>
              {relevant ? <div className='mt-1 text-[11px] text-brand-ink'>Relevant to this tab</div> : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
