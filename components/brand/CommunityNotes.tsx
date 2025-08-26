import { createClient } from '@supabase/supabase-js';

export default async function CommunityNotes({ brandSlug, category }: { brandSlug: string; category?: string }){
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth:{ persistSession:false } });
  
  let q = supabase
    .from('svc_public_notes')
    .select('*')
    .eq('brand', brandSlug)
    .order('created_at',{ascending:false})
    .limit(20);
    
  if (category) q = q.eq('category', category);
  
  const { data, error } = await q;
  if (error || !data || !data.length) return null;
  
  return (
    <section className='mt-8'>
      <h3 className='text-lg font-semibold mb-2'>Community Notes</h3>
      <p className='text-sm text-muted-foreground mb-3'>
        Verified tips and insights from our community, reviewed by our technical team.
      </p>
      <div className='space-y-3'>
        {data.map(n => (
          <div key={n.id} className='border rounded-xl p-3 bg-card'>
            <div className='flex items-center justify-between mb-2'>
              <div className='text-xs text-muted-foreground'>
                {new Date(n.created_at).toLocaleDateString()}
              </div>
              <div className='text-xs px-2 py-1 rounded bg-blue-50 text-blue-700'>
                {n.category}
              </div>
            </div>
            <div className='text-sm mb-1'>
              {n.model && <span className='font-medium'>{n.model}</span>}
              {n.model && n.code && <span className='mx-1'>·</span>}
              {n.code && <span className='font-mono text-xs bg-gray-100 px-1 rounded'>{n.code}</span>}
            </div>
            <div className='mt-1 whitespace-pre-wrap text-sm leading-relaxed'>
              {n.content}
            </div>
            {n.source && (
              <div className='mt-2 text-xs text-muted-foreground'>
                Contributed by community member
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
