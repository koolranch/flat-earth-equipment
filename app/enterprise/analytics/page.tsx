'use client';

import { useState, useEffect } from 'react';
import { 
  EnterprisePageHeader,
  EnterpriseGrid,
  KPICard,
  EnterpriseCard,
  EnterpriseH2,
  EnterpriseH3,
  EnterpriseBody,
  EnterpriseBodySmall,
  EnterpriseButton,
  EnterpriseEmptyState,
  SkeletonCard
} from '@/components/enterprise/ui/DesignSystem';
import { 
  EnrollmentTrendsChart, 
  ScoreTrendsChart, 
  DepartmentComparisonChart 
} from '@/components/enterprise/analytics/TrendCharts';

interface AnalyticsKPIs {
  totalUsers: number;
  activeEnrollments: number;
  completedTrainings: number;
  completionRate: number;
  averageScore: number;
  certificationRate: number;
  pendingCertifications: number;
  expiringSoon: number;
}

interface TrendDataPoint {
  date: string;
  enrollments: number;
  completions: number;
  averageScore: number;
}

interface DepartmentStats {
  name: string;
  userCount: number;
  completionRate: number;
  averageScore: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface ActivityItem {
  id: string;
  type: 'enrollment' | 'completion' | 'certificate' | 'expiring';
  user: string;
  description: string;
  timestamp: string;
}

interface AnalyticsData {
  kpis: AnalyticsKPIs;
  trends: TrendDataPoint[];
  departments: DepartmentStats[];
  recentActivity: ActivityItem[];
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/enterprise/analytics');
      const data = await response.json();
      
      if (data.ok && data.data) {
        setAnalytics(data.data);
        setOrgId(data.org_id);
      } else if (data.message) {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    if (!orgId) return;
    
    try {
      setExporting(true);
      
      const response = await fetch('/api/enterprise/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org_id: orgId, format })
      });

      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <EnterprisePageHeader 
          title="Analytics Dashboard" 
          subtitle="Loading your analytics data..."
        />
        
        <EnterpriseGrid columns={4}>
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </EnterpriseGrid>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="container mx-auto p-6">
        <EnterprisePageHeader 
          title="Analytics Dashboard" 
          subtitle="Advanced reporting and insights"
        />
        
        <EnterpriseEmptyState
          title="No Analytics Data Available"
          description={error || "Analytics data will appear here once you have organizational training activity."}
          icon="📊"
          action={{
            label: "Go to Dashboard",
            onClick: () => window.location.href = '/enterprise/dashboard'
          }}
        />
      </div>
    );
  }

  const { kpis, trends, departments, recentActivity } = analytics;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <EnterprisePageHeader 
        title="Analytics Dashboard" 
        subtitle="Advanced reporting and performance insights"
        actions={
          <div className="flex gap-2">
            <EnterpriseButton 
              variant="outline" 
              size="sm"
              onClick={loadAnalytics}
            >
              🔄 Refresh
            </EnterpriseButton>
            <EnterpriseButton 
              variant="outline" 
              size="sm"
              onClick={() => handleExport('csv')}
              disabled={exporting}
              loading={exporting}
            >
              📥 Export CSV
            </EnterpriseButton>
            <EnterpriseButton 
              variant="secondary"
              size="sm"
              onClick={() => window.location.href = '/enterprise/dashboard'}
            >
              ← Back to Dashboard
            </EnterpriseButton>
          </div>
        }
      />

      {/* KPI Summary Cards */}
      <div>
        <EnterpriseH2 className="mb-4">Key Performance Indicators</EnterpriseH2>
        <EnterpriseGrid columns={4}>
          <KPICard
            title="Total Users"
            value={kpis.totalUsers}
            icon="👥"
            status="neutral"
            subtitle="enrolled in training"
          />
          
          <KPICard
            title="Completion Rate"
            value={`${kpis.completionRate}%`}
            icon="✅"
            status={kpis.completionRate >= 80 ? "good" : kpis.completionRate >= 60 ? "warning" : "danger"}
            trend={kpis.completionRate >= 80 ? "On track" : "Needs attention"}
            trendDirection={kpis.completionRate >= 80 ? "up" : "down"}
          />
          
          <KPICard
            title="Average Score"
            value={`${kpis.averageScore}%`}
            icon="🎯"
            status={kpis.averageScore >= 85 ? "good" : kpis.averageScore >= 70 ? "warning" : "danger"}
            subtitle="across all assessments"
          />
          
          <KPICard
            title="Certification Rate"
            value={`${kpis.certificationRate}%`}
            icon="📜"
            status={kpis.certificationRate >= 90 ? "good" : kpis.certificationRate >= 70 ? "warning" : "danger"}
            subtitle="of completed trainings"
          />
        </EnterpriseGrid>
      </div>

      {/* Secondary KPIs */}
      <EnterpriseGrid columns={4}>
        <KPICard
          title="Active Enrollments"
          value={kpis.activeEnrollments}
          icon="📚"
          status="neutral"
          subtitle="in progress"
        />
        
        <KPICard
          title="Completed"
          value={kpis.completedTrainings}
          icon="🏆"
          status="good"
          subtitle="trainings finished"
        />
        
        <KPICard
          title="Pending Certs"
          value={kpis.pendingCertifications}
          icon="⏳"
          status={kpis.pendingCertifications > 5 ? "warning" : "neutral"}
          subtitle="awaiting issuance"
        />
        
        <KPICard
          title="Expiring Soon"
          value={kpis.expiringSoon}
          icon="⚠️"
          status={kpis.expiringSoon > 0 ? "warning" : "good"}
          subtitle="within 30 days"
        />
      </EnterpriseGrid>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnrollmentTrendsChart data={trends} />
        <ScoreTrendsChart data={trends} />
      </div>

      {/* Department Comparison */}
      <DepartmentComparisonChart data={departments} />

      {/* Recent Activity */}
      <EnterpriseCard>
        <div className="flex items-center justify-between mb-4">
          <EnterpriseH2>Recent Activity</EnterpriseH2>
          <EnterpriseBodySmall className="text-neutral-500">
            Last 15 events
          </EnterpriseBodySmall>
        </div>
        
        {recentActivity.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            <div className="text-4xl mb-2">📋</div>
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {recentActivity.map((activity) => (
              <ActivityRow key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </EnterpriseCard>
    </div>
  );
}

function ActivityRow({ activity }: { activity: ActivityItem }) {
  const typeConfig = {
    enrollment: { icon: '📝', color: 'text-info-600', bg: 'bg-info-50' },
    completion: { icon: '✅', color: 'text-success-600', bg: 'bg-success-50' },
    certificate: { icon: '📜', color: 'text-primary-600', bg: 'bg-primary-50' },
    expiring: { icon: '⚠️', color: 'text-warning-600', bg: 'bg-warning-50' }
  };

  const config = typeConfig[activity.type] || typeConfig.enrollment;

  const formatTimestamp = (ts: string) => {
    try {
      const date = new Date(ts);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return ts;
    }
  };

  return (
    <div className="flex items-center gap-4 py-3">
      <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center`}>
        <span className="text-lg">{config.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-neutral-900 truncate">
          {activity.description}
        </p>
        <p className="text-sm text-neutral-500">
          {activity.user}
        </p>
      </div>
      <div className="text-sm text-neutral-400">
        {formatTimestamp(activity.timestamp)}
      </div>
    </div>
  );
}
