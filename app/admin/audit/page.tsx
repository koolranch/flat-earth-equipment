import 'server-only';
import { requireAdminServer } from '@/lib/admin/guard';
import { supabaseService } from '@/lib/supabase/service.server';

export const dynamic = 'force-dynamic';

export default async function AdminAuditPage() {
  const adm = await requireAdminServer();
  if (!adm.ok) {
    return (
      <main className="container mx-auto p-4">
        <h2 className="text-lg font-semibold">403</h2>
        <p className="text-sm">Admins only.</p>
      </main>
    );
  }

  const sb = supabaseService();
  let rows: any[] = [];
  
  try {
    const { data } = await sb
      .from('audit_log')
      .select('id, actor_id, action, notes, created_at')
      .order('created_at', { ascending: false })
      .limit(200);
    rows = data || [];
  } catch (error) {
    console.warn('Audit log table not available:', error);
  }

  // Group actions by type for statistics
  const actionTypes = rows.reduce((acc: Record<string, number>, row) => {
    const actionType = row.action?.split('_')[0] || 'unknown';
    acc[actionType] = (acc[actionType] || 0) + 1;
    return acc;
  }, {});

  const recentActions = rows.slice(0, 50);

  return (
    <main className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#0F172A] dark:text-white">
          System Audit Log
        </h2>
        <div className="text-xs text-slate-500">
          {rows.length} total entries
        </div>
      </div>

      {rows.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {Object.entries(actionTypes).slice(0, 4).map(([type, count]) => (
            <div key={type} className="rounded-lg border p-3 bg-slate-50 dark:bg-slate-800">
              <div className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                {type}
              </div>
              <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {count}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-x-auto border rounded-2xl">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="p-2 text-left font-medium">When</th>
              <th className="p-2 text-left font-medium">Action</th>
              <th className="p-2 text-left font-medium">Actor</th>
              <th className="p-2 text-left font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {recentActions.length > 0 ? recentActions.map(r => (
              <tr key={r.id} className="border-t hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                <td className="p-2 text-xs text-slate-600 dark:text-slate-400">
                  {new Date(r.created_at).toLocaleString()}
                </td>
                <td className="p-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    r.action?.includes('error') || r.action?.includes('fail') || r.action?.includes('delete')
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : r.action?.includes('create') || r.action?.includes('complete') || r.action?.includes('pass')
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : r.action?.includes('update') || r.action?.includes('edit')
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {r.action || 'unknown'}
                  </span>
                </td>
                <td className="p-2 font-mono text-xs">
                  {r.actor_id ? r.actor_id.slice(0, 8) + '...' : '—'}
                </td>
                <td className="p-2 text-xs text-slate-700 dark:text-slate-300 max-w-xs">
                  {r.notes ? (
                    <div className="truncate" title={typeof r.notes === 'string' ? r.notes : JSON.stringify(r.notes)}>
                      {typeof r.notes === 'string' ? r.notes : JSON.stringify(r.notes)}
                    </div>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">
                  <div className="space-y-2">
                    <div className="text-2xl">📋</div>
                    <p>No audit entries found</p>
                    <p className="text-xs">
                      {rows.length === 0 
                        ? 'The audit_log table may not be configured yet'
                        : 'No recent activities to display'
                      }
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {rows.length > 50 && (
        <div className="text-center py-4">
          <p className="text-xs text-slate-500">
            Showing 50 most recent entries of {rows.length} total
          </p>
        </div>
      )}

      <div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700">
        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          Audit Log Information
        </h3>
        <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
          <p>• <strong>Action Types:</strong> System events, user activities, admin operations</p>
          <p>• <strong>Actor ID:</strong> User identifier who performed the action</p>
          <p>• <strong>Notes:</strong> Additional context and metadata for each action</p>
          <p>• <strong>Retention:</strong> Recent 200 entries displayed for performance</p>
          <p>• <strong>Security:</strong> All admin access to this page is logged</p>
        </div>
      </div>
    </main>
  );
}
