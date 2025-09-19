import { supabaseServer } from '@/lib/supabase/server';
import { headers, cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AuthDebug() {
  const supabase = supabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser();
  const hdrs = headers();
  const cookieStore = cookies();
  const cookieHeader = hdrs.get('cookie') || '';
  const hasAccess = cookieHeader.includes('sb-access-token');
  const hasRefresh = cookieHeader.includes('sb-refresh-token');
  
  // Get all cookies for debugging
  const allCookies = cookieStore.getAll();
  const authCookies = allCookies.filter(c => c.name.includes('supabase') || c.name.includes('sb-'));

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-3">
      <h1 className="text-xl font-semibold">Auth Debug</h1>
      
      <div className="grid gap-2 text-sm">
        <div>Server sees user: <code>{user ? user.id : 'null'}</code></div>
        <div>Auth error: <code>{error ? error.message : 'none'}</code></div>
        <div>Cookie sb-access-token present: <code>{String(hasAccess)}</code></div>
        <div>Cookie sb-refresh-token present: <code>{String(hasRefresh)}</code></div>
        <div>Total cookies: <code>{allCookies.length}</code></div>
        <div>Auth-related cookies: <code>{authCookies.length}</code></div>
      </div>

      {authCookies.length > 0 && (
        <div>
          <h2 className="text-sm font-medium">Auth Cookies:</h2>
          <ul className="text-xs space-y-1">
            {authCookies.map(c => (
              <li key={c.name}>
                <code>{c.name}</code>: {c.value ? 'present' : 'empty'}
              </li>
            ))}
          </ul>
        </div>
      )}

      {user && (
        <div>
          <h2 className="text-sm font-medium">User Data:</h2>
          <pre className="text-xs mt-2 p-3 bg-gray-50 rounded overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      )}

      <div className="pt-4 border-t">
        <a href="/login" className="text-sm underline">Back to login</a>
        {user && <a href="/training" className="text-sm underline ml-4">Go to training</a>}
      </div>
    </div>
  );
}
