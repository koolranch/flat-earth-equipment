'use client';

import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { EnterpriseCard, EnterpriseH3, EnterpriseBodySmall } from '../ui/DesignSystem';

// Chart color palette matching enterprise design system
const chartColors = {
  primary: '#F76511',
  secondary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  neutral: '#6b7280'
};

interface TrendDataPoint {
  date: string;
  enrollments: number;
  completions: number;
  averageScore: number;
}

interface TrendChartsProps {
  data: TrendDataPoint[];
  loading?: boolean;
}

/**
 * Enrollment & Completion Trends Chart
 */
export function EnrollmentTrendsChart({ data, loading }: TrendChartsProps) {
  if (loading) {
    return <ChartSkeleton title="Enrollment Trends" />;
  }

  // Format dates for display
  const formattedData = data.map(d => ({
    ...d,
    displayDate: formatChartDate(d.date)
  }));

  return (
    <EnterpriseCard>
      <div className="mb-4">
        <EnterpriseH3>Enrollment & Completion Trends</EnterpriseH3>
        <EnterpriseBodySmall className="text-neutral-500">
          Last 30 days activity
        </EnterpriseBodySmall>
      </div>
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="enrollmentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors.secondary} stopOpacity={0.3} />
                <stop offset="95%" stopColor={chartColors.secondary} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors.success} stopOpacity={0.3} />
                <stop offset="95%" stopColor={chartColors.success} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="displayDate" 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => <span className="text-sm text-neutral-700">{value}</span>}
            />
            <Area
              type="monotone"
              dataKey="enrollments"
              name="Enrollments"
              stroke={chartColors.secondary}
              strokeWidth={2}
              fill="url(#enrollmentGradient)"
            />
            <Area
              type="monotone"
              dataKey="completions"
              name="Completions"
              stroke={chartColors.success}
              strokeWidth={2}
              fill="url(#completionGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </EnterpriseCard>
  );
}

/**
 * Average Score Trends Chart
 */
export function ScoreTrendsChart({ data, loading }: TrendChartsProps) {
  if (loading) {
    return <ChartSkeleton title="Score Trends" />;
  }

  // Filter to only days with scores
  const filteredData = data
    .filter(d => d.averageScore > 0)
    .map(d => ({
      ...d,
      displayDate: formatChartDate(d.date)
    }));

  if (filteredData.length === 0) {
    return (
      <EnterpriseCard>
        <div className="mb-4">
          <EnterpriseH3>Average Score Trends</EnterpriseH3>
          <EnterpriseBodySmall className="text-neutral-500">
            Score progression over time
          </EnterpriseBodySmall>
        </div>
        <div className="h-72 flex items-center justify-center text-neutral-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p>No score data available yet</p>
          </div>
        </div>
      </EnterpriseCard>
    );
  }

  return (
    <EnterpriseCard>
      <div className="mb-4">
        <EnterpriseH3>Average Score Trends</EnterpriseH3>
        <EnterpriseBodySmall className="text-neutral-500">
          Score progression over time
        </EnterpriseBodySmall>
      </div>
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="displayDate" 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<ScoreTooltip />} />
            <Line
              type="monotone"
              dataKey="averageScore"
              name="Average Score"
              stroke={chartColors.primary}
              strokeWidth={3}
              dot={{ fill: chartColors.primary, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            {/* Target line at 80% */}
            <Line
              type="monotone"
              dataKey={() => 80}
              name="Target (80%)"
              stroke={chartColors.success}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </EnterpriseCard>
  );
}

/**
 * Department Comparison Bar Chart
 */
interface DepartmentStats {
  name: string;
  userCount: number;
  completionRate: number;
  averageScore: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface DepartmentChartProps {
  data: DepartmentStats[];
  loading?: boolean;
}

export function DepartmentComparisonChart({ data, loading }: DepartmentChartProps) {
  if (loading) {
    return <ChartSkeleton title="Department Comparison" />;
  }

  if (data.length === 0) {
    return (
      <EnterpriseCard>
        <div className="mb-4">
          <EnterpriseH3>Department Comparison</EnterpriseH3>
          <EnterpriseBodySmall className="text-neutral-500">
            Completion rates by department
          </EnterpriseBodySmall>
        </div>
        <div className="h-72 flex items-center justify-center text-neutral-500">
          <div className="text-center">
            <div className="text-4xl mb-2">🏢</div>
            <p>No department data available</p>
          </div>
        </div>
      </EnterpriseCard>
    );
  }

  // Add color based on risk level
  const chartData = data.map(d => ({
    ...d,
    fill: d.riskLevel === 'high' 
      ? chartColors.danger 
      : d.riskLevel === 'medium' 
        ? chartColors.warning 
        : chartColors.success
  }));

  return (
    <EnterpriseCard>
      <div className="mb-4">
        <EnterpriseH3>Department Comparison</EnterpriseH3>
        <EnterpriseBodySmall className="text-neutral-500">
          Completion rates by department
        </EnterpriseBodySmall>
      </div>
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 10, left: 80, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
            <XAxis 
              type="number" 
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis 
              type="category" 
              dataKey="name"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              width={75}
            />
            <Tooltip content={<DepartmentTooltip />} />
            <Bar 
              dataKey="completionRate" 
              name="Completion Rate"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend for risk levels */}
      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success-500"></div>
          <span className="text-neutral-600">Low Risk (≥80%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warning-500"></div>
          <span className="text-neutral-600">Medium Risk (50-79%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-danger-500"></div>
          <span className="text-neutral-600">High Risk (&lt;50%)</span>
        </div>
      </div>
    </EnterpriseCard>
  );
}

// Helper Components

function formatChartDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMM d');
  } catch {
    return dateStr;
  }
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white border border-neutral-200 rounded-lg shadow-lg p-3">
      <p className="font-medium text-neutral-900 mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-neutral-600">{entry.name}:</span>
          <span className="font-medium text-neutral-900">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

function ScoreTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  const score = payload[0]?.value;
  const isAboveTarget = score >= 80;

  return (
    <div className="bg-white border border-neutral-200 rounded-lg shadow-lg p-3">
      <p className="font-medium text-neutral-900 mb-2">{label}</p>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-neutral-600">Average Score:</span>
        <span className={`font-bold ${isAboveTarget ? 'text-success-600' : 'text-warning-600'}`}>
          {score}%
        </span>
      </div>
      <p className="text-xs text-neutral-500 mt-1">
        {isAboveTarget ? '✓ Above target' : '⚠ Below target (80%)'}
      </p>
    </div>
  );
}

function DepartmentTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="bg-white border border-neutral-200 rounded-lg shadow-lg p-3">
      <p className="font-medium text-neutral-900 mb-2">{data.name}</p>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-neutral-600">Users:</span>
          <span className="font-medium">{data.userCount}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-neutral-600">Completion:</span>
          <span className="font-medium">{data.completionRate}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-neutral-600">Avg Score:</span>
          <span className="font-medium">{data.averageScore}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-neutral-600">Risk Level:</span>
          <span className={`font-medium capitalize ${
            data.riskLevel === 'high' ? 'text-danger-600' :
            data.riskLevel === 'medium' ? 'text-warning-600' :
            'text-success-600'
          }`}>
            {data.riskLevel}
          </span>
        </div>
      </div>
    </div>
  );
}

function ChartSkeleton({ title }: { title: string }) {
  return (
    <EnterpriseCard>
      <div className="mb-4">
        <EnterpriseH3>{title}</EnterpriseH3>
        <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse mt-1"></div>
      </div>
      <div className="h-72 bg-neutral-100 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-neutral-400">Loading chart...</div>
      </div>
    </EnterpriseCard>
  );
}
