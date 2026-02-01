'use client';

import { useRBAC } from '@/components/enterprise/auth/RoleGuard';
import { 
  EnterprisePageHeader,
  EnterpriseGrid,
  KPICard,
  EnterpriseCard,
  EnterpriseH2,
  EnterpriseH3,
  EnterpriseBody,
  EnterpriseButton,
  SkeletonCard
} from '@/components/enterprise/ui/DesignSystem';

/**
 * OWNER DASHBOARD - Full management control
 */
export function OwnerDashboard({ stats, organizations }: any) {
  return (
    <div className="space-y-6">
      <EnterprisePageHeader 
        title="Enterprise Dashboard" 
        subtitle="Full organizational control and management"
        actions={
          <div className="flex gap-2 flex-wrap">
            <EnterpriseButton 
              onClick={() => window.location.href = '/enterprise/analytics'}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              📊 Analytics
            </EnterpriseButton>
            <EnterpriseButton 
              onClick={() => window.location.href = '/enterprise/team'}
            >
              👥 Team Management
            </EnterpriseButton>
            <EnterpriseButton 
              onClick={() => window.location.href = '/enterprise/bulk'}
            >
              📤 Bulk Operations
            </EnterpriseButton>
            <EnterpriseButton 
              variant="secondary"
              onClick={() => window.location.href = '/enterprise/settings'}
            >
              ⚙️ Settings
            </EnterpriseButton>
          </div>
        }
      />

      {/* Quick Stats */}
      <EnterpriseGrid columns={4}>
        <KPICard
          title="Total Organizations"
          value={organizations?.length || 0}
          icon="🏢"
          status="neutral"
        />
        <KPICard
          title="Total Users"
          value={stats?.total_users || 0}
          icon="👥"
          status="neutral"
        />
        <KPICard
          title="Completion Rate"
          value={`${stats?.completion_rate || 0}%`}
          icon="✅"
          status={stats?.completion_rate >= 80 ? "good" : stats?.completion_rate >= 60 ? "warning" : "danger"}
        />
        <KPICard
          title="Active Enrollments"
          value={stats?.active_enrollments || 0}
          icon="📚"
          status="neutral"
        />
      </EnterpriseGrid>

      {/* Management Actions */}
      <EnterpriseCard>
        <EnterpriseH2 className="mb-4">Quick Actions</EnterpriseH2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionCard
            icon="➕"
            title="Invite Users"
            description="Add new team members"
            onClick={() => window.location.href = '/enterprise/team?action=invite'}
          />
          <ActionCard
            icon="📋"
            title="Assign Training"
            description="Assign courses to users"
            onClick={() => window.location.href = '/enterprise/bulk?tab=assign'}
          />
          <ActionCard
            icon="📊"
            title="View Reports"
            description="Access compliance reports"
            onClick={() => window.location.href = '/enterprise/analytics'}
          />
        </div>
      </EnterpriseCard>
    </div>
  );
}

/**
 * ADMIN DASHBOARD - User management + analytics
 */
export function AdminDashboard({ stats, organizations }: any) {
  return (
    <div className="space-y-6">
      <EnterprisePageHeader 
        title="Admin Dashboard" 
        subtitle="User management and analytics access"
        actions={
          <div className="flex gap-2 flex-wrap">
            <EnterpriseButton 
              onClick={() => window.location.href = '/enterprise/analytics'}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              📊 Analytics
            </EnterpriseButton>
            <EnterpriseButton 
              onClick={() => window.location.href = '/enterprise/team'}
            >
              👥 Manage Team
            </EnterpriseButton>
            <EnterpriseButton 
              onClick={() => window.location.href = '/enterprise/bulk'}
            >
              📤 Bulk Ops
            </EnterpriseButton>
          </div>
        }
      />

      <EnterpriseGrid columns={3}>
        <KPICard
          title="Team Members"
          value={stats?.total_users || 0}
          icon="👥"
          status="neutral"
        />
        <KPICard
          title="Completion Rate"
          value={`${stats?.completion_rate || 0}%`}
          icon="✅"
          status={stats?.completion_rate >= 80 ? "good" : "warning"}
        />
        <KPICard
          title="Active Training"
          value={stats?.active_enrollments || 0}
          icon="📚"
          status="neutral"
        />
      </EnterpriseGrid>

      <EnterpriseCard>
        <EnterpriseH2 className="mb-4">Admin Actions</EnterpriseH2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ActionCard
            icon="👥"
            title="Manage Users"
            description="Invite, assign, and manage roles"
            onClick={() => window.location.href = '/enterprise/team'}
          />
          <ActionCard
            icon="📊"
            title="View Analytics"
            description="Access detailed reports"
            onClick={() => window.location.href = '/enterprise/analytics'}
          />
        </div>
      </EnterpriseCard>
    </div>
  );
}

/**
 * MANAGER DASHBOARD - Team view + training assignment
 */
export function ManagerDashboard({ stats }: any) {
  return (
    <div className="space-y-6">
      <EnterprisePageHeader 
        title="Manager Dashboard" 
        subtitle="Team oversight and training assignment"
        actions={
          <div className="flex gap-2">
            <EnterpriseButton 
              onClick={() => window.location.href = '/enterprise/team'}
            >
              👥 View Team
            </EnterpriseButton>
            <EnterpriseButton 
              variant="secondary"
              onClick={() => window.location.href = '/trainer/dashboard'}
            >
              Switch to Trainer View
            </EnterpriseButton>
          </div>
        }
      />

      <EnterpriseGrid columns={3}>
        <KPICard
          title="Team Members"
          value={stats?.total_users || 0}
          icon="👥"
          status="neutral"
        />
        <KPICard
          title="Team Progress"
          value={`${stats?.completion_rate || 0}%`}
          icon="📈"
          status={stats?.completion_rate >= 70 ? "good" : "warning"}
        />
        <KPICard
          title="Active Training"
          value={stats?.active_enrollments || 0}
          icon="📚"
          status="neutral"
        />
      </EnterpriseGrid>

      <EnterpriseCard>
        <EnterpriseH2 className="mb-4">Manager Actions</EnterpriseH2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ActionCard
            icon="👥"
            title="View Team"
            description="See team member progress"
            onClick={() => window.location.href = '/enterprise/team'}
          />
          <ActionCard
            icon="📋"
            title="Assign Training"
            description="Assign courses to your team"
            onClick={() => window.location.href = '/trainer/dashboard'}
          />
        </div>
      </EnterpriseCard>
    </div>
  );
}

/**
 * MEMBER DASHBOARD - Personal progress only
 */
export function MemberDashboard({ stats }: any) {
  return (
    <div className="space-y-6">
      <EnterprisePageHeader 
        title="My Dashboard" 
        subtitle="Your training progress and certifications"
        actions={
          <EnterpriseButton 
            onClick={() => window.location.href = '/training'}
            className="bg-[#F76511] text-white hover:bg-orange-600"
          >
            Continue Training →
          </EnterpriseButton>
        }
      />

      <EnterpriseGrid columns={2}>
        <KPICard
          title="My Progress"
          value={`${stats?.personal_progress || 0}%`}
          icon="📈"
          status={stats?.personal_progress >= 80 ? "good" : "warning"}
        />
        <KPICard
          title="Certificates"
          value={stats?.certificates || 0}
          icon="🏆"
          status="good"
        />
      </EnterpriseGrid>

      <EnterpriseCard>
        <EnterpriseH2 className="mb-4">Quick Links</EnterpriseH2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ActionCard
            icon="📚"
            title="My Training"
            description="Continue your courses"
            onClick={() => window.location.href = '/training'}
          />
          <ActionCard
            icon="🏆"
            title="My Certificates"
            description="View your certifications"
            onClick={() => window.location.href = '/dashboard'}
          />
        </div>
      </EnterpriseCard>
    </div>
  );
}

/**
 * VIEWER DASHBOARD - Read-only access
 */
export function ViewerDashboard({ stats }: any) {
  return (
    <div className="space-y-6">
      <EnterprisePageHeader 
        title="Dashboard Overview" 
        subtitle="Read-only access to training data"
      />

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <div className="flex items-center">
          <div className="text-blue-500 mr-3 text-2xl">ℹ️</div>
          <div>
            <p className="text-sm font-medium text-blue-900">Read-Only Access</p>
            <p className="text-xs text-blue-700 mt-1">
              You have viewer permissions. Contact your administrator for additional access.
            </p>
          </div>
        </div>
      </div>

      <EnterpriseGrid columns={3}>
        <KPICard
          title="Total Users"
          value={stats?.total_users || 0}
          icon="👥"
          status="neutral"
        />
        <KPICard
          title="Completion Rate"
          value={`${stats?.completion_rate || 0}%`}
          icon="📊"
          status="neutral"
        />
        <KPICard
          title="Active Training"
          value={stats?.active_enrollments || 0}
          icon="📚"
          status="neutral"
        />
      </EnterpriseGrid>

      <EnterpriseCard>
        <EnterpriseH2 className="mb-4">Available Reports</EnterpriseH2>
        <EnterpriseBody className="text-gray-600 mb-4">
          You can view training progress and basic reports. For additional features, contact your administrator.
        </EnterpriseBody>
        <EnterpriseButton 
          onClick={() => window.location.href = '/enterprise/analytics'}
          variant="outline"
        >
          View Reports
        </EnterpriseButton>
      </EnterpriseCard>
    </div>
  );
}

/**
 * Action Card Component
 */
function ActionCard({ 
  icon, 
  title, 
  description, 
  onClick 
}: { 
  icon: string; 
  title: string; 
  description: string; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left p-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-orange-50 hover:to-orange-100 border-2 border-gray-200 hover:border-[#F76511] rounded-xl transition-all hover:shadow-md group"
    >
      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </button>
  );
}
