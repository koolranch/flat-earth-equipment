'use client';
import { useState, useEffect } from 'react';

export default function Page(){
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    loadSubmissions();
  }, []);
  
  async function loadSubmissions() {
    try {
      setLoading(true);
      // In a real implementation, you'd need to authenticate this request
      // For now, this is just a placeholder - the actual data fetching would need
      // to be done server-side or with proper authentication
      setSubmissions([]);
      setError('Admin functionality requires INTERNAL_ADMIN_KEY configuration');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  
  async function moderate(id: number, action: string) {
    try {
      const adminKey = prompt('Enter admin key:');
      if (!adminKey) return;
      
      const res = await fetch(`/api/admin/svc/submissions/${id}/moderate`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-admin-key': adminKey
        },
        body: JSON.stringify({ action, actor: 'admin' })
      });
      
      if (!res.ok) throw new Error(`Failed to ${action}`);
      await loadSubmissions();
    } catch (e: any) {
      alert(e.message);
    }
  }
  
  async function publishNote(id: number) {
    try {
      const adminKey = prompt('Enter admin key:');
      if (!adminKey) return;
      
      const res = await fetch(`/api/admin/svc/submissions/${id}/publish-note`, {
        method: 'POST',
        headers: {
          'x-admin-key': adminKey
        }
      });
      
      if (!res.ok) throw new Error('Failed to publish note');
      alert('Published to Community Notes!');
      await loadSubmissions();
    } catch (e: any) {
      alert(e.message);
    }
  }
  
  if (loading) return <div className='p-6'>Loading...</div>;
  if (error) return <pre className='p-6 text-red-600'>Admin view error: {error}</pre>;
  
  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-4'>Service Submissions</h1>
      <p className='text-sm text-muted-foreground mb-4'>
        Note: This admin interface requires proper authentication setup. 
        In production, implement server-side authentication or use an admin dashboard.
      </p>
      <div className='grid gap-3'>
        {submissions.map((r:any)=> (
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
            {r.ip && (
              <div className='mt-1 text-xs text-muted-foreground'>
                IP: {r.ip}
              </div>
            )}
            
            {/* Admin Actions */}
            <div className='mt-3 flex gap-2 flex-wrap'>
              <button 
                onClick={() => moderate(r.id, 'approve')}
                className='px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200'
              >
                Approve
              </button>
              <button 
                onClick={() => moderate(r.id, 'reject')}
                className='px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200'
              >
                Reject
              </button>
              <button 
                onClick={() => moderate(r.id, 'flag')}
                className='px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200'
              >
                Flag
              </button>
              <button 
                onClick={() => publishNote(r.id)}
                className='px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200'
              >
                PUBLISH to Community Notes
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
