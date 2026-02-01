'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { 
  EnterprisePageHeader,
  EnterpriseGrid,
  KPICard,
  EnterpriseCard,
  EnterpriseH2,
  EnterpriseBody,
  EnterpriseButton,
  EnterpriseEmptyState,
  SkeletonCard
} from '@/components/enterprise/ui/DesignSystem';
import { EnterpriseDataTable, Column } from '@/components/enterprise/ui/DataTable';
import { useRBAC } from '@/components/enterprise/auth/RoleGuard';
import {
  OwnerDashboard,
  AdminDashboard,
  ManagerDashboard,
  MemberDashboard,
  ViewerDashboard
} from '@/components/enterprise/dashboards/RoleBasedDashboards';

interface OrganizationData {
  id: string;
  name: string;
  type: string;
  user_count: number;
  enrollment_count: number;
  completion_rate: number;
}

interface OrganizationStats {
  total_users: number;
  active_enrollments: number;
  completed_trainings: number;
  pending_certifications: number;
  compliance_rate: number;
  completion_rate: number;
  average_score: number;
  trends: {
    enrollments_trend: number;
    completion_trend: number;
    compliance_trend: number;
  };
}

export default function EnterpriseDashboard() {
  const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
  const [stats, setStats] = useState<OrganizationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();
  const { role, isLoading: roleLoading } = useRBAC();

  // SECURITY: Check authentication first
  useEffect(() => {
    async function checkAuth() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        router.replace('/login?next=/enterprise/dashboard');
        return;
      }
      
      setAuthChecked(true);
      loadDashboardData();
    }
    
    checkAuth();
  }, []);

  // Don't load data until auth is checked
  // useEffect(() => {
  //   loadDashboardData();
  // }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load organizations from existing enrollment data
      const response = await fetch('/api/enterprise/adapted/organizations');
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations || []);
        
        // Load stats AND users for the first organization if available
        if (data.organizations && data.organizations.length > 0) {
          const firstOrgId = data.organizations[0].id;
          setSelectedOrg(firstOrgId);
          await Promise.all([
            loadOrganizationStats(firstOrgId),
            loadOrganizationUsers(firstOrgId)
          ]);
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizationStats = async (orgId: string) => {
    try {
      const response = await fetch(`/api/enterprise/adapted/organizations/${orgId}/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load organization stats:', error);
    }
  };

  const loadOrganizationUsers = async (orgId: string) => {
    try {
      setUsersLoading(true);
      const response = await fetch(`/api/enterprise/adapted/organizations/${orgId}/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to load organization users:', error);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleOrganizationSelect = async (orgId: string) => {
    setSelectedOrg(orgId);
    await Promise.all([
      loadOrganizationStats(orgId),
      loadOrganizationUsers(orgId)
    ]);
  };

  const userColumns: Column[] = [
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      filterable: true
    },
    {
      key: 'course',
      label: 'Course',
      sortable: true
    },
    {
      key: 'progress_pct',
      label: 'Progress',
      render: (value, row) => {
        const isCompleted = row?.status === 'completed' || value === 100;
        const barColor = isCompleted ? 'bg-green-500' : 'bg-amber-500';
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div 
                className={`${barColor} h-2 rounded-full transition-all`}
                style={{ width: `${value || 0}%` }}
              />
            </div>
            <span className="text-sm font-medium">{value || 0}%</span>
          </div>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          value === 'completed' 
            ? 'bg-green-100 text-green-800'
            : 'bg-blue-100 text-blue-800'
        }`}>
          {value === 'completed' ? '✓ Completed' : '⟳ In Progress'}
        </span>
      )
    },
    {
      key: 'enrollment_date',
      label: 'Enrolled',
      render: (value) => value ? new Date(value).toLocaleDateString() : '—'
    }
  ];

  // Show loading while checking auth or loading data
  if (!authChecked || loading || roleLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <EnterprisePageHeader 
          title="Enterprise Dashboard" 
          subtitle={!authChecked ? "Verifying access..." : "Loading your organizational overview..."}
        />
        
        <EnterpriseGrid columns={4}>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </EnterpriseGrid>
      </div>
    );
  }

  // ROLE-BASED DASHBOARD RENDERING
  // Render different dashboard based on user's role
  if (role === 'owner') {
    return (
      <div className="container mx-auto p-6">
        <OwnerDashboard stats={stats} organizations={organizations} />
      </div>
    );
  }

  if (role === 'admin') {
    return (
      <div className="container mx-auto p-6">
        <AdminDashboard stats={stats} organizations={organizations} />
      </div>
    );
  }

  if (role === 'manager') {
    return (
      <div className="container mx-auto p-6">
        <ManagerDashboard stats={stats} orgId={selectedOrg} />
      </div>
    );
  }

  if (role === 'member') {
    return (
      <div className="container mx-auto p-6">
        <MemberDashboard stats={stats} />
      </div>
    );
  }

  if (role === 'viewer') {
    return (
      <div className="container mx-auto p-6">
        <ViewerDashboard stats={stats} />
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <EnterprisePageHeader 
          title="Enterprise Dashboard" 
          subtitle="Manage your organizational training programs"
        />
        
        <EnterpriseEmptyState
          title="No Organizations Found"
          description="It looks like you don't have any organizational training programs set up yet. Organizations are automatically created when you assign training with organizational context."
          icon="🏢"
          action={{
            label: "Go to Trainer Dashboard",
            onClick: () => window.location.href = '/trainer/dashboard'
          }}
        />
      </div>
    );
  }

  const currentOrg = organizations.find(org => org.id === selectedOrg);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <EnterprisePageHeader 
        title="Enterprise Dashboard" 
        subtitle="Organizational training overview and management"
        actions={
          <div className="flex gap-2">
            <EnterpriseButton 
              variant="secondary"
              onClick={() => window.location.href = '/enterprise/analytics'}
              className="bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
            >
              📊 Analytics
            </EnterpriseButton>
            <EnterpriseButton 
              variant="outline"
              onClick={() => window.location.href = '/enterprise/team'}
            >
              👥 Team
            </EnterpriseButton>
            <EnterpriseButton 
              variant="outline"
              onClick={() => window.location.href = '/enterprise/bulk'}
            >
              📤 Bulk Ops
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

      {/* Organization Selector */}
      <EnterpriseCard>
        <div className="flex items-center justify-between mb-4">
          <EnterpriseH2>Organizations</EnterpriseH2>
          <EnterpriseBody className="text-gray-600">
            {organizations.length} organization{organizations.length !== 1 ? 's' : ''} found
          </EnterpriseBody>
        </div>
        
        <div className="grid gap-3">
          {organizations.map(org => (
            <div
              key={org.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-orange-300 ${
                selectedOrg === org.id 
                  ? 'border-[#F76511] bg-orange-50' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => handleOrganizationSelect(org.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{org.name}</h3>
                  <p className="text-sm text-gray-600">
                    {org.user_count} users • {org.enrollment_count} enrollments
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-[#F76511]">
                    {org.completion_rate}%
                  </div>
                  <div className="text-xs text-gray-500">completion</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </EnterpriseCard>

      {/* KPI Cards */}
      {stats && currentOrg && (
        <>
          <div className="flex items-center justify-between">
            <EnterpriseH2>{currentOrg.name} Overview</EnterpriseH2>
            <div className="flex gap-2">
              <EnterpriseButton 
                size="sm" 
                variant="outline"
                onClick={() => loadOrganizationStats(currentOrg.id)}
              >
                🔄 Refresh
              </EnterpriseButton>
              <EnterpriseButton size="sm" variant="outline">
                📊 Export Report
              </EnterpriseButton>
            </div>
          </div>

          <EnterpriseGrid columns={4}>
            <KPICard
              title="Total Users"
              value={stats.total_users}
              icon="👥"
              status="neutral"
            />
            
            <KPICard
              title="Active Enrollments"
              value={stats.active_enrollments}
              icon="📚"
              status="neutral"
              trend={`+${stats.trends.enrollments_trend}%`}
              trendDirection="up"
            />
            
            <KPICard
              title="Completion Rate"
              value={`${stats.completion_rate}%`}
              icon="✅"
              status={stats.completion_rate >= 80 ? "good" : stats.completion_rate >= 60 ? "warning" : "danger"}
              trend={`+${stats.trends.completion_trend}%`}
              trendDirection="up"
            />
            
            <KPICard
              title="Average Score"
              value={`${stats.average_score}%`}
              icon="🎯"
              status={stats.average_score >= 85 ? "good" : stats.average_score >= 70 ? "warning" : "danger"}
            />
          </EnterpriseGrid>

          {/* Users Table */}
          <EnterpriseCard>
            <div className="flex items-center justify-between mb-4">
              <EnterpriseH2>Enrolled Users</EnterpriseH2>
              <EnterpriseButton 
                size="sm"
                onClick={() => loadOrganizationUsers(currentOrg.id)}
                disabled={usersLoading}
                loading={usersLoading}
              >
                {usersLoading ? 'Loading...' : 'Refresh Users'}
              </EnterpriseButton>
            </div>
            
            <EnterpriseDataTable
              data={users}
              columns={userColumns}
              loading={usersLoading}
              emptyState={{
                title: "No Users Found",
                description: "No enrolled users found for this organization.",
                icon: "👤"
              }}
            />
          </EnterpriseCard>
        </>
      )}
    </div>
  );
}