import 'server-only';
import { requireAdminServer, getAdminStatus } from '@/lib/admin/guard';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminTestPage() {
  // Example 1: Require admin access (redirect if not admin)
  const adminCheck = await requireAdminServer();
  
  if (!adminCheck.ok) {
    if (adminCheck.reason === 'unauthorized') {
      redirect('/login?redirect=/admin/test-access');
    } else {
      redirect('/dashboard?error=admin-required');
    }
  }

  // Example 2: Get admin status for conditional rendering
  const status = await getAdminStatus();

  return (
    <main className="container mx-auto p-4 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">
          Admin Access Test
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Testing server-only admin guard functionality
        </p>
      </header>

      <section className="space-y-4">
        <div className="rounded-lg border p-4 bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700">
          <h2 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
            ✅ Admin Access Confirmed
          </h2>
          <div className="space-y-2 text-sm text-green-800 dark:text-green-200">
            <p><strong>User ID:</strong> {adminCheck.user.id}</p>
            <p><strong>Email:</strong> {adminCheck.user.email}</p>
            <p><strong>Role:</strong> {adminCheck.role || 'admin'}</p>
            <p><strong>Admin Status:</strong> {status.isAdmin ? 'Authorized' : 'Not authorized'}</p>
          </div>
        </div>

        <div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Admin Guard Features
          </h3>
          <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>• Server-only execution (never exposed to client)</li>
            <li>• Dual authentication: ENV allowlist + database table</li>
            <li>• Role-based access control support</li>
            <li>• Graceful error handling and logging</li>
            <li>• TypeScript type safety with result unions</li>
            <li>• Supabase integration with proper error handling</li>
          </ul>
        </div>

        <div className="rounded-lg border p-4 bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700">
          <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
            Security Notes
          </h3>
          <ul className="space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
            <li>• Admin emails are checked server-side only</li>
            <li>• Database queries use authenticated Supabase client</li>
            <li>• No admin credentials exposed to browser</li>
            <li>• Failed attempts are logged for security monitoring</li>
            <li>• Supports both environment-based and database-based admin lists</li>
          </ul>
        </div>

        {/* Conditional admin features */}
        {status.role === 'super_admin' && (
          <div className="rounded-lg border p-4 bg-purple-50 dark:bg-purple-900 border-purple-200 dark:border-purple-700">
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
              🔐 Super Admin Features
            </h3>
            <p className="text-sm text-purple-800 dark:text-purple-200">
              This content is only visible to super admins. Role-based access control working correctly.
            </p>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <a 
            href="/admin/roster" 
            className="inline-flex rounded-lg bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700 transition"
          >
            View Roster
          </a>
          <a 
            href="/admin/service" 
            className="inline-flex rounded-lg bg-green-600 text-white px-4 py-2 text-sm hover:bg-green-700 transition"
          >
            Service Dashboard
          </a>
          <a 
            href="/dashboard" 
            className="inline-flex rounded-lg border border-slate-300 text-slate-700 px-4 py-2 text-sm hover:bg-slate-50 transition"
          >
            Back to Dashboard
          </a>
        </div>
      </section>
    </main>
  );
}
