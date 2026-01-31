'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import {
  EnterprisePageHeader,
  EnterpriseGrid,
  EnterpriseCard,
  EnterpriseH2,
  EnterpriseH3,
  EnterpriseBody,
  EnterpriseBodySmall,
  EnterpriseButton,
  EnterpriseEmptyState,
  SkeletonCard
} from '@/components/enterprise/ui/DesignSystem';
import { RoleManager, RoleBadge } from '@/components/enterprise/users/RoleManager';
import { RoleGuard, useRBAC, Can } from '@/components/enterprise/auth/RoleGuard';
import { RoleType, normalizeRole, ROLE_DEFINITIONS } from '@/lib/enterprise/rbac';

interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  role: RoleType;
  status: 'active' | 'pending' | 'inactive';
  last_active?: string;
  enrollment_count?: number;
  completion_rate?: number;
}

export default function TeamManagementPage() {
  // ALL hooks must be at the top, before any conditional returns
  const { orgId, role: myRole, can, isLoading: rbacLoading } = useRBAC();
  const [authChecked, setAuthChecked] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [filter, setFilter] = useState<'all' | RoleType>('all');
  const [searchQuery, setSearchQuery] = useState('');
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
  }, [router]);

  useEffect(() => {
    if (authChecked && orgId) {
      loadTeamMembers();
    } else if (authChecked && !rbacLoading) {
      // RBAC finished loading but no orgId - stop loading state
      setLoading(false);
    }
  }, [authChecked, orgId, rbacLoading]);

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

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/enterprise/adapted/organizations/${orgId}/users`);
      const data = await response.json();

      if (data.ok && data.users) {
        // Transform users to team members
        const teamMembers: TeamMember[] = data.users.map((user: any) => ({
          id: user.id,
          email: user.email,
          full_name: user.full_name || user.email.split('@')[0],
          role: normalizeRole(user.role || 'member'),
          status: 'active',
          last_active: user.last_active,
          enrollment_count: user.enrollment_count || 0,
          completion_rate: user.completion_rate || 0
        }));
        setMembers(teamMembers);
      }
    } catch (error) {
      console.error('Failed to load team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (userId: string, newRole: RoleType) => {
    setMembers(prev => prev.map(m => 
      m.id === userId ? { ...m, role: newRole } : m
    ));
    setSelectedMember(null);
  };

  // Filter and search members
  const filteredMembers = members.filter(m => {
    const matchesFilter = filter === 'all' || m.role === filter;
    const matchesSearch = searchQuery === '' || 
      m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Group members by role for summary
  const roleCounts = members.reduce((acc, m) => {
    acc[m.role] = (acc[m.role] || 0) + 1;
    return acc;
  }, {} as Record<RoleType, number>);

  if (loading || rbacLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <EnterprisePageHeader 
          title="Team Management" 
          subtitle="Loading team members..."
        />
        <EnterpriseGrid columns={3}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </EnterpriseGrid>
      </div>
    );
  }

  if (!orgId) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <EnterprisePageHeader 
          title="Team Management" 
          subtitle="Manage team members and their roles"
        />
        <EnterpriseEmptyState
          title="No Organization Found"
          description="You need to be part of an organization to manage team members. Please contact your administrator."
          icon="🏢"
          action={{
            label: "Back to Dashboard",
            onClick: () => window.location.href = '/enterprise/dashboard'
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <EnterprisePageHeader 
        title="Team Management" 
        subtitle="Manage team members and their roles"
        actions={
          <div className="flex gap-2">
            <Can permission="users:invite">
              <EnterpriseButton variant="primary">
                + Invite Member
              </EnterpriseButton>
            </Can>
            <EnterpriseButton 
              variant="secondary"
              onClick={() => window.location.href = '/enterprise/dashboard'}
            >
              ← Back to Dashboard
            </EnterpriseButton>
          </div>
        }
      />

      {/* Role Summary Cards */}
      <EnterpriseGrid columns={5}>
        <SummaryCard
          label="Total Members"
          count={members.length}
          icon="👥"
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        />
        <SummaryCard
          label="Admins"
          count={roleCounts.admin || 0}
          icon="🛡️"
          active={filter === 'admin'}
          onClick={() => setFilter('admin')}
        />
        <SummaryCard
          label="Managers"
          count={roleCounts.manager || 0}
          icon="📋"
          active={filter === 'manager'}
          onClick={() => setFilter('manager')}
        />
        <SummaryCard
          label="Members"
          count={roleCounts.member || 0}
          icon="👤"
          active={filter === 'member'}
          onClick={() => setFilter('member')}
        />
        <SummaryCard
          label="Viewers"
          count={roleCounts.viewer || 0}
          icon="👁️"
          active={filter === 'viewer'}
          onClick={() => setFilter('viewer')}
        />
      </EnterpriseGrid>

      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Members List */}
      {filteredMembers.length === 0 ? (
        <EnterpriseEmptyState
          title="No Team Members Found"
          description={searchQuery ? "Try adjusting your search." : "Invite team members to get started."}
          icon="👥"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              canManage={can('users:assign')}
              onManage={() => setSelectedMember(member)}
            />
          ))}
        </div>
      )}

      {/* Role Management Modal */}
      {selectedMember && (
        <RoleModal
          member={selectedMember}
          orgId={orgId || ''}
          onClose={() => setSelectedMember(null)}
          onRoleChange={(newRole) => handleRoleChange(selectedMember.id, newRole)}
        />
      )}
    </div>
  );
}

function SummaryCard({ 
  label, 
  count, 
  icon, 
  active, 
  onClick 
}: { 
  label: string; 
  count: number; 
  icon: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        p-4 rounded-xl border transition-all text-left w-full
        ${active 
          ? 'border-primary-500 bg-primary-50 shadow-sm' 
          : 'border-neutral-200 bg-white hover:border-neutral-300'
        }
      `}
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className="text-2xl font-bold text-neutral-900">{count}</span>
      </div>
      <div className="mt-2 text-sm font-medium text-neutral-600">{label}</div>
    </button>
  );
}

function MemberCard({ 
  member, 
  canManage,
  onManage 
}: { 
  member: TeamMember;
  canManage: boolean;
  onManage: () => void;
}) {
  return (
    <EnterpriseCard>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
            {member.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-neutral-900">{member.full_name}</div>
            <div className="text-sm text-neutral-500">{member.email}</div>
          </div>
        </div>
        <RoleBadge role={member.role} size="sm" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-neutral-500">Enrollments</div>
          <div className="font-medium">{member.enrollment_count || 0}</div>
        </div>
        <div>
          <div className="text-neutral-500">Completion</div>
          <div className="font-medium">{member.completion_rate || 0}%</div>
        </div>
      </div>

      {canManage && (
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <EnterpriseButton 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={onManage}
          >
            Manage Role
          </EnterpriseButton>
        </div>
      )}
    </EnterpriseCard>
  );
}

function RoleModal({ 
  member, 
  orgId,
  onClose, 
  onRoleChange 
}: { 
  member: TeamMember;
  orgId: string;
  onClose: () => void;
  onRoleChange: (role: RoleType) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
          <EnterpriseH3>Manage Role</EnterpriseH3>
          <button 
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 text-xl"
          >
            ×
          </button>
        </div>
        <div className="p-4">
          <RoleManager
            userId={member.id}
            userName={member.full_name}
            userEmail={member.email}
            currentRole={member.role}
            orgId={orgId}
            onRoleChange={onRoleChange}
          />
        </div>
      </div>
    </div>
  );
}
