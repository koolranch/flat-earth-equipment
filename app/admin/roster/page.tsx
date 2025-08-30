import 'server-only';
import { cookies } from 'next/headers';
import { fetchRoster } from '@/lib/admin/roster.server';
import AdminRosterTable from '@/components/admin/AdminRosterTable';

export default async function AdminRosterPage({ searchParams }: { searchParams?: Record<string,string> }) {
  const orgId = searchParams?.orgId || '';
  const locale = (cookies().get('locale')?.value === 'es') ? 'es' : 'en';
  
  if (!orgId) {
    return (
      <main className="space-y-4">
        <div className="rounded-lg border p-6 text-center">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Organization ID Required
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
            Please provide an organization ID to view the roster.
          </p>
          <p className="text-xs text-slate-500">
            Example: <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">/admin/roster?orgId=your-org-id</code>
          </p>
        </div>
      </main>
    );
  }

  try {
    const data = await fetchRoster(orgId);
    
    return (
      <main className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#0F172A] dark:text-white">
            Training Roster
          </h2>
          <div className="text-xs text-slate-500">
            Organization: {orgId}
          </div>
        </div>
        
        <AdminRosterTable rows={data} orgId={orgId} locale={locale} />
      </main>
    );
  } catch (error) {
    return (
      <main className="space-y-4">
        <div className="rounded-lg border p-6 text-center bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700">
          <h2 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
            Error Loading Roster
          </h2>
          <p className="text-sm text-red-800 dark:text-red-200">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </p>
        </div>
      </main>
    );
  }
}
