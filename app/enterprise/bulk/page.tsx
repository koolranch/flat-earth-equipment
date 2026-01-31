'use client';

import { useState } from 'react';
import {
  EnterprisePageHeader,
  EnterpriseCard,
  EnterpriseH2,
  EnterpriseBody,
  EnterpriseButton
} from '@/components/enterprise/ui/DesignSystem';
import { BulkImport, BulkExport } from '@/components/enterprise/bulk/BulkOperations';
import { RoleGuard, useRBAC } from '@/components/enterprise/auth/RoleGuard';

type TabType = 'import-users' | 'import-training' | 'export';

export default function BulkOperationsPage() {
  const { orgId } = useRBAC();
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  // SECURITY: Check authentication first
  useEffect(() => {
    async function checkAuth() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        router.replace('/login?next=' + window.location.pathname);
        return;
      }
      
      setAuthChecked(true);
    }
    
    checkAuth();
  }, []);

  // Return loading if not authenticated
  if (!authChecked) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-lg text-gray-600">Verifying access...</div>
        </div>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<TabType>('import-users');
  const [lastResult, setLastResult] = useState<any>(null);

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'import-users', label: 'Import Users', icon: '👥' },
    { id: 'import-training', label: 'Assign Training', icon: '📚' },
    { id: 'export', label: 'Export Data', icon: '📤' }
  ];

  return (
    <RoleGuard require="users:bulk_operations" showAccessDenied>
      <div className="container mx-auto p-6 space-y-6">
        <EnterprisePageHeader
          title="Bulk Operations"
          subtitle="Import users, assign training, and export data in bulk"
          actions={
            <EnterpriseButton
              variant="secondary"
              onClick={() => window.location.href = '/enterprise/dashboard'}
            >
              ← Back to Dashboard
            </EnterpriseButton>
          }
        />

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-neutral-200 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-neutral-600 hover:bg-neutral-100'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'import-users' && orgId && (
              <BulkImport
                type="users"
                orgId={orgId}
                onComplete={setLastResult}
              />
            )}

            {activeTab === 'import-training' && orgId && (
              <BulkImport
                type="assignments"
                orgId={orgId}
                onComplete={setLastResult}
              />
            )}

            {activeTab === 'export' && orgId && (
              <BulkExport orgId={orgId} />
            )}

            {!orgId && (
              <EnterpriseCard className="text-center py-12">
                <div className="text-4xl mb-4">🏢</div>
                <EnterpriseH2 className="mb-2">No Organization Selected</EnterpriseH2>
                <EnterpriseBody className="text-neutral-600">
                  Please select an organization to perform bulk operations.
                </EnterpriseBody>
              </EnterpriseCard>
            )}
          </div>

          {/* Sidebar - Help & Recent Activity */}
          <div className="space-y-6">
            {/* Help Card */}
            <EnterpriseCard>
              <EnterpriseH2 className="mb-4 text-lg">Quick Guide</EnterpriseH2>
              
              {activeTab === 'import-users' && (
                <div className="space-y-3 text-sm">
                  <HelpItem
                    title="Required Fields"
                    content="email, full_name"
                  />
                  <HelpItem
                    title="Optional Fields"
                    content="role, department, employee_id, start_date"
                  />
                  <HelpItem
                    title="Valid Roles"
                    content="viewer, member, manager, admin"
                  />
                  <HelpItem
                    title="Notes"
                    content="New users will need to be invited separately. This updates existing users only."
                  />
                </div>
              )}

              {activeTab === 'import-training' && (
                <div className="space-y-3 text-sm">
                  <HelpItem
                    title="Required Fields"
                    content="email, course_slug"
                  />
                  <HelpItem
                    title="Optional Fields"
                    content="due_date, priority, notes"
                  />
                  <HelpItem
                    title="Date Format"
                    content="YYYY-MM-DD (e.g., 2024-03-15)"
                  />
                  <HelpItem
                    title="Priority Values"
                    content="low, medium, high, urgent"
                  />
                </div>
              )}

              {activeTab === 'export' && (
                <div className="space-y-3 text-sm">
                  <HelpItem
                    title="Users Export"
                    content="Includes email, name, role, enrollment count, completion rate"
                  />
                  <HelpItem
                    title="Enrollments Export"
                    content="Includes user info, course, progress, score, dates"
                  />
                  <HelpItem
                    title="Format"
                    content="CSV file, compatible with Excel and Google Sheets"
                  />
                </div>
              )}
            </EnterpriseCard>

            {/* Recent Result */}
            {lastResult && (
              <EnterpriseCard>
                <EnterpriseH2 className="mb-4 text-lg">Last Operation</EnterpriseH2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Status</span>
                    <span className={lastResult.success ? 'text-success-600' : 'text-warning-600'}>
                      {lastResult.success ? '✅ Success' : '⚠️ With Issues'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Total Records</span>
                    <span className="font-medium">{lastResult.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Processed</span>
                    <span className="font-medium">{lastResult.processed}</span>
                  </div>
                  {lastResult.created > 0 && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Created</span>
                      <span className="font-medium text-success-600">{lastResult.created}</span>
                    </div>
                  )}
                  {lastResult.errors?.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Errors</span>
                      <span className="font-medium text-danger-600">{lastResult.errors.length}</span>
                    </div>
                  )}
                </div>
              </EnterpriseCard>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}

function HelpItem({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <div className="font-medium text-neutral-700">{title}</div>
      <div className="text-neutral-500">{content}</div>
    </div>
  );
}
