import 'server-only';
import Link from 'next/link';
import { requireAdminServer } from '@/lib/admin/guard';
import { supabaseServer } from '@/lib/supabase/server';

export default async function AdminAuditPage() {
  const adminCheck = await requireAdminServer();
  
  // This check is redundant due to layout protection, but good practice
  if (!adminCheck.ok) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Access denied</p>
      </div>
    );
  }

  // Fetch recent audit data (if available)
  let auditData = [];
  try {
    const sb = supabaseServer();
    const { data } = await sb
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    auditData = data || [];
  } catch (error) {
    console.warn('Audit log not available:', error);
  }

  return (
    <main className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-xl font-semibold text-[#0F172A] dark:text-white">
          System Audit Log
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Recent system activities and admin actions
        </p>
      </header>

      {auditData.length > 0 ? (
        <section className="space-y-4">
          <div className="rounded-lg border overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2 border-b">
              <h3 className="text-sm font-medium">Recent Activities</h3>
            </div>
            <div className="divide-y">
              {auditData.slice(0, 20).map((entry: any, index) => (
                <div key={entry.id || index} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {entry.action || 'Unknown action'}
                      </p>
                      <p className="text-xs text-slate-500">
                        User: {entry.actor_id || 'Unknown'} • 
                        {entry.created_at ? new Date(entry.created_at).toLocaleString() : 'Unknown time'}
                      </p>
                      {entry.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {typeof entry.notes === 'string' ? entry.notes : JSON.stringify(entry.notes)}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      entry.action?.includes('error') || entry.action?.includes('fail') 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {entry.action?.split('_')[0] || 'action'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="text-center py-12">
          <div className="space-y-4">
            <div className="text-4xl">📋</div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                No Audit Data Available
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                The audit log table may not be configured yet, or no activities have been logged. 
                Admin actions will appear here once the audit system is active.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-4">
              <Link 
                href="/admin/roster" 
                className="inline-flex rounded-lg bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700 transition"
              >
                View Roster
              </Link>
              <Link 
                href="/admin/service" 
                className="inline-flex rounded-lg border border-slate-300 text-slate-700 px-4 py-2 text-sm hover:bg-slate-50 transition"
              >
                Service Dashboard
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700">
        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          Admin Audit Features
        </h3>
        <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
          <li>• System activity monitoring and logging</li>
          <li>• Admin action audit trail with timestamps</li>
          <li>• User activity tracking across platform</li>
          <li>• Security event monitoring and alerting</li>
          <li>• Compliance reporting and data export</li>
        </ul>
      </section>
    </main>
  );
}
