import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function Page(){
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url, key, { auth: { persistSession:false } });
  
  const { data, error } = await supabase
    .from('svc_user_suggestions')
    .select('*')
    .order('created_at',{ascending:false})
    .limit(200);
    
  if (error) return <pre className='p-6 text-red-600'>Admin view error: {error.message}</pre>;
  
  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-4'>Service Submissions</h1>
      <div className='grid gap-3'>
        {data?.map((r:any)=> (
          <div key={r.id} className='border rounded p-3'>
            <div className='text-xs text-muted-foreground'>{r.created_at}</div>
            <div className='font-semibold'>{r.brand} · {r.suggestion_type} · status: {r.status}</div>
            <div className='text-sm'>Model: {r.model||'-'} · Serial: {r.serial||'-'} · Code: {r.code||'-'}</div>
            {r.title && <div className='text-sm font-medium mt-1'>{r.title}</div>}
            <div className='mt-2 whitespace-pre-wrap text-sm'>{r.details}</div>
            {r.photos && r.photos.length > 0 && (
              <div className='mt-2 text-xs text-blue-600'>
                Photos: {r.photos.join(', ')}
              </div>
            )}
            {r.contact_email && (
              <div className='mt-1 text-xs text-muted-foreground'>
                Contact: {r.contact_email}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
