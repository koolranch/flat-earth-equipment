'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRBAC } from '@/components/enterprise/auth/RoleGuard';
import { 
  EnterpriseCard, 
  EnterpriseH2, 
  EnterpriseButton,
  EnterpriseBodySmall
} from '@/components/enterprise/ui/DesignSystem';

interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  course: string;
  course_slug: string;
  progress_pct: number;
  score: number | null;
  status: 'active' | 'completed';
  enrollment_date: string;
  last_activity: string;
  // Evaluation fields
  evaluation_status?: 'not_needed' | 'pending' | 'completed' | 'failed';
  evaluation_date?: string;
}

interface ManagerTeamRosterProps {
  orgId: string | null;
}

export function ManagerTeamRoster({ orgId }: ManagerTeamRosterProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'pending_eval'>('all');
  const { role } = useRBAC();

  const loadMembers = useCallback(async () => {
    if (!orgId) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
      });
      if (search) params.set('search', search);
      if (statusFilter !== 'all' && statusFilter !== 'pending_eval') {
        params.set('status', statusFilter);
      }

      const response = await fetch(`/api/enterprise/adapted/organizations/${orgId}/users?${params}`);
      const data = await response.json();
      
      if (data.ok) {
        // Fetch evaluation status for completed users
        const usersWithEvals = await enrichWithEvaluationStatus(data.users);
        
        // Apply pending_eval filter if needed
        let filteredUsers = usersWithEvals;
        if (statusFilter === 'pending_eval') {
          filteredUsers = usersWithEvals.filter(u => u.evaluation_status === 'pending');
        }
        
        setMembers(filteredUsers);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Failed to load team members:', error);
    } finally {
      setLoading(false);
    }
  }, [orgId, page, search, statusFilter]);

  // Enrich users with evaluation status
  async function enrichWithEvaluationStatus(users: TeamMember[]): Promise<TeamMember[]> {
    try {
      const response = await fetch('/api/enterprise/evaluations/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_ids: users.map(u => u.id) 
        })
      });
      
      if (response.ok) {
        const evalData = await response.json();
        const evalMap = new Map(evalData.evaluations?.map((e: any) => [e.user_id, e]) || []);
        
        return users.map(user => {
          const eval_info = evalMap.get(user.id) as any;
          
          // Determine evaluation status
          let evaluation_status: TeamMember['evaluation_status'] = 'not_needed';
          if (user.status === 'completed') {
            if (eval_info?.practical_pass === true) {
              evaluation_status = 'completed';
            } else if (eval_info?.practical_pass === false) {
              evaluation_status = 'failed';
            } else {
              evaluation_status = 'pending';
            }
          }
          
          return {
            ...user,
            evaluation_status,
            evaluation_date: eval_info?.evaluation_date
          };
        });
      }
    } catch (error) {
      console.error('Failed to fetch evaluation status:', error);
    }
    
    // Return users with default evaluation status
    return users.map(user => ({
      ...user,
      evaluation_status: user.status === 'completed' ? 'pending' : 'not_needed'
    }));
  }

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleSearch = () => {
    setPage(1);
    loadMembers();
  };

  const clearAllFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPage(1);
  };

  const hasActiveFilters = search !== '' || statusFilter !== 'all';

  const pendingEvalCount = members.filter(m => m.evaluation_status === 'pending').length;

  if (!orgId) {
    return (
      <EnterpriseCard>
        <div className="text-center py-8 text-gray-500">
          No organization found. Please contact your administrator.
        </div>
      </EnterpriseCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pending Evaluations Alert */}
      {pendingEvalCount > 0 && statusFilter !== 'pending_eval' && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📋</span>
              <div>
                <p className="font-semibold text-amber-800">
                  {pendingEvalCount} Practical Evaluation{pendingEvalCount !== 1 ? 's' : ''} Pending
                </p>
                <p className="text-sm text-amber-700">
                  These team members completed online training and need hands-on evaluation
                </p>
              </div>
            </div>
            <EnterpriseButton
              size="sm"
              onClick={() => setStatusFilter('pending_eval')}
              className="bg-amber-600 text-white hover:bg-amber-700"
            >
              View Pending
            </EnterpriseButton>
          </div>
        </div>
      )}

      {/* Currently Viewing Pending - Show option to view all */}
      {statusFilter === 'pending_eval' && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔍</span>
              <div>
                <p className="font-semibold text-blue-800">
                  Showing {members.length} team member{members.length !== 1 ? 's' : ''} needing practical evaluation
                </p>
                <p className="text-sm text-blue-700">
                  These employees completed online training and are ready for hands-on assessment
                </p>
              </div>
            </div>
            <button
              onClick={() => setStatusFilter('all')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-xl font-medium hover:bg-blue-100 transition-colors"
            >
              ← View All Team
            </button>
          </div>
        </div>
      )}

      <EnterpriseCard>
        <div className="flex items-center justify-between mb-4">
          <EnterpriseH2>Team Progress</EnterpriseH2>
          <div className="flex gap-2">
            <EnterpriseButton
              variant="outline"
              size="sm"
              onClick={loadMembers}
              disabled={loading}
            >
              {loading ? 'Loading...' : '🔄 Refresh'}
            </EnterpriseButton>
            <a 
              href={`/api/enterprise/export/roster?org_id=${orgId}`}
              className="inline-flex items-center justify-center gap-2 font-medium rounded-xl px-3 py-2 text-sm bg-[#F76511] text-white hover:bg-[#E55A0C]"
            >
              📥 Export CSV
            </a>
          </div>
        </div>

        {/* Active Filters Bar */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <span className="text-sm font-medium text-blue-800">Active filters:</span>
            <div className="flex flex-wrap gap-2">
              {search && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-blue-300 rounded-full text-sm">
                  Search: "{search}"
                  <button 
                    onClick={() => { setSearch(''); setPage(1); }}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-blue-300 rounded-full text-sm">
                  Status: {statusFilter === 'pending_eval' ? '⏳ Pending Evaluation' : statusFilter === 'active' ? 'In Progress' : 'Completed'}
                  <button 
                    onClick={() => { setStatusFilter('all'); setPage(1); }}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>
            <button 
              onClick={clearAllFilters}
              className="ml-auto text-sm text-blue-700 hover:text-blue-900 font-medium hover:underline"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <input
            type="text"
            placeholder="Search by email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F76511] focus:border-transparent"
          />
          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value as any);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F76511]"
          >
            <option value="all">All Status</option>
            <option value="active">In Progress</option>
            <option value="completed">Completed Online</option>
            <option value="pending_eval">⏳ Pending Evaluation</option>
          </select>
          <div></div>
          <EnterpriseButton variant="secondary" size="sm" onClick={handleSearch}>
            Apply Filters
          </EnterpriseButton>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left p-3 font-semibold">Team Member</th>
                <th className="text-left p-3 font-semibold">Course</th>
                <th className="text-center p-3 font-semibold">Online Progress</th>
                <th className="text-center p-3 font-semibold">Score</th>
                <th className="text-center p-3 font-semibold">Status</th>
                <th className="text-center p-3 font-semibold">Practical Eval</th>
                <th className="text-center p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && members.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    <div className="animate-pulse">Loading team members...</div>
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <div className="text-4xl mb-2">👥</div>
                    <p className="text-gray-500">No team members found</p>
                    {statusFilter !== 'all' && (
                      <button 
                        onClick={() => setStatusFilter('all')}
                        className="text-[#F76511] hover:underline mt-2"
                      >
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                members.map(member => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium text-gray-900">{member.full_name}</div>
                        <div className="text-gray-500 text-xs">{member.email}</div>
                      </div>
                    </td>
                    <td className="p-3 text-gray-700">{member.course}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              member.progress_pct === 100 ? 'bg-green-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${member.progress_pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium w-10">{member.progress_pct}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <ScoreBadge score={member.score} status={member.status} />
                    </td>
                    <td className="p-3 text-center">
                      <StatusBadge status={member.status} />
                    </td>
                    <td className="p-3 text-center">
                      <EvalBadge status={member.evaluation_status} />
                    </td>
                    <td className="p-3 text-center">
                      {member.evaluation_status === 'pending' && (
                        <a
                          href={`/trainer/evaluations/${member.id}?back=/enterprise/dashboard`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#F76511] text-white hover:bg-[#E55A0C] transition-colors"
                        >
                          ✍️ Evaluate
                        </a>
                      )}
                      {member.evaluation_status === 'completed' && (
                        <span className="text-green-600 text-xs">✓ Certified</span>
                      )}
                      {member.evaluation_status === 'failed' && (
                        <a
                          href={`/trainer/evaluations/${member.id}?back=/enterprise/dashboard`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                        >
                          🔄 Re-evaluate
                        </a>
                      )}
                      {member.status === 'active' && (
                        <span className="text-gray-400 text-xs">Training...</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <EnterpriseBodySmall className="text-gray-600">
              Showing {members.length} of {total} team members
            </EnterpriseBodySmall>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
              >
                ← Prev
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </EnterpriseCard>
    </div>
  );
}

function StatusBadge({ status }: { status: 'active' | 'completed' }) {
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-800 border border-green-200">
        ✓ Online Complete
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
      ⟳ In Progress
    </span>
  );
}

function EvalBadge({ status }: { status?: TeamMember['evaluation_status'] }) {
  switch (status) {
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          ✓ Passed
        </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
          ⏳ Needed
        </span>
      );
    case 'failed':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          ✗ Failed
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
          — N/A
        </span>
      );
  }
}

function ScoreBadge({ score, status }: { score: number | null; status: 'active' | 'completed' }) {
  // Show dash if still in progress
  if (status === 'active') {
    return (
      <span className="text-gray-400 text-sm">—</span>
    );
  }
  
  // Show score if completed
  if (score !== null) {
    const scoreColor = score >= 80 ? 'text-green-600' : score >= 70 ? 'text-amber-600' : 'text-red-600';
    const bgColor = score >= 80 ? 'bg-green-50' : score >= 70 ? 'bg-amber-50' : 'bg-red-50';
    const borderColor = score >= 80 ? 'border-green-200' : score >= 70 ? 'border-amber-200' : 'border-red-200';
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold ${scoreColor} ${bgColor} border ${borderColor}`}>
        {score}%
      </span>
    );
  }
  
  // No score recorded
  return (
    <span className="text-gray-400 text-sm">—</span>
  );
}

export default ManagerTeamRoster;
