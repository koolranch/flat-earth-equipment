// Enterprise Design System Components - Phase 1
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// Enterprise Color System
export const enterpriseColors = {
  primary: {
    50: '#fef7ec',
    100: '#fdedd3',
    500: '#F76511', // Brand orange
    600: '#E55A0C',
    700: '#CC4C00',
  },
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    300: '#d1d5db',
    500: '#6b7280',
    700: '#374151',
    900: '#1a1a1a',
  },
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    500: '#10b981',
    600: '#059669',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
  },
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
  }
};

// Typography Components
interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

export function EnterpriseH1({ children, className }: TypographyProps) {
  return (
    <h1 className={cn(
      'text-3xl font-bold text-gray-900 tracking-tight',
      className
    )}>
      {children}
    </h1>
  );
}

export function EnterpriseH2({ children, className }: TypographyProps) {
  return (
    <h2 className={cn(
      'text-2xl font-semibold text-gray-900 tracking-tight',
      className
    )}>
      {children}
    </h2>
  );
}

export function EnterpriseH3({ children, className }: TypographyProps) {
  return (
    <h3 className={cn(
      'text-xl font-semibold text-gray-700',
      className
    )}>
      {children}
    </h3>
  );
}

export function EnterpriseBody({ children, className }: TypographyProps) {
  return (
    <p className={cn(
      'text-base text-gray-700 leading-relaxed',
      className
    )}>
      {children}
    </p>
  );
}

export function EnterpriseBodySmall({ children, className }: TypographyProps) {
  return (
    <p className={cn(
      'text-sm text-gray-600',
      className
    )}>
      {children}
    </p>
  );
}

// Card Components
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function EnterpriseCard({ children, className, padding = 'md' }: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  return (
    <div className={cn(
      'bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow',
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}

// KPI Card Component
interface KPICardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  status?: 'good' | 'warning' | 'danger' | 'neutral';
  icon?: React.ReactNode;
  subtitle?: string;
}

export function KPICard({ 
  title, 
  value, 
  trend, 
  trendDirection = 'neutral', 
  status = 'neutral', 
  icon, 
  subtitle 
}: KPICardProps) {
  const statusColors = {
    good: 'border-green-200 bg-gradient-to-br from-green-50 to-green-100',
    warning: 'border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100',
    danger: 'border-red-200 bg-gradient-to-br from-red-50 to-red-100',
    neutral: 'border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100'
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-500'
  };

  const trendIcons = {
    up: '↗',
    down: '↘',
    neutral: '→'
  };

  return (
    <EnterpriseCard className={cn('p-4', statusColors[status])}>
      <div className="flex items-center justify-between mb-2">
        <EnterpriseBodySmall className="font-medium text-gray-700">
          {title}
        </EnterpriseBodySmall>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      
      <div className="space-y-1">
        <div className="text-3xl font-bold text-gray-900">
          {value}
        </div>
        
        {(trend || subtitle) && (
          <div className="flex items-center justify-between">
            {subtitle && (
              <EnterpriseBodySmall className="text-gray-600">
                {subtitle}
              </EnterpriseBodySmall>
            )}
            {trend && (
              <div className={cn(
                'text-sm font-medium flex items-center gap-1',
                trendColors[trendDirection]
              )}>
                <span>{trendIcons[trendDirection]}</span>
                <span>{trend}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </EnterpriseCard>
  );
}

// Status Badge Component
interface StatusBadgeProps {
  status: 'passed' | 'in_progress' | 'not_started' | 'failed' | 'expired';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function EnterpriseStatusBadge({ status, size = 'md', showIcon = true }: StatusBadgeProps) {
  const configs = {
    passed: {
      styles: 'bg-green-50 border-green-300 text-green-800',
      icon: '✓',
      label: 'Passed'
    },
    in_progress: {
      styles: 'bg-blue-50 border-blue-300 text-blue-800',
      icon: '⟳',
      label: 'In Progress'
    },
    not_started: {
      styles: 'bg-gray-50 border-gray-300 text-gray-700',
      icon: '○',
      label: 'Not Started'
    },
    failed: {
      styles: 'bg-red-50 border-red-300 text-red-800',
      icon: '✗',
      label: 'Failed'
    },
    expired: {
      styles: 'bg-amber-50 border-amber-300 text-amber-800',
      icon: '⚠',
      label: 'Expired'
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const config = configs[status];

  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-lg border font-medium',
      config.styles,
      sizeClasses[size]
    )}>
      {showIcon && <span>{config.icon}</span>}
      <span>{config.label}</span>
    </span>
  );
}

// Progress Bar Component
interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  status?: 'normal' | 'success' | 'warning' | 'danger';
}

export function EnterpriseProgressBar({ 
  value, 
  max = 100, 
  size = 'md', 
  showLabel = true,
  status = 'normal' 
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const statusColors = {
    normal: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500'
  };

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex justify-between items-center">
          <EnterpriseBodySmall>Progress</EnterpriseBodySmall>
          <EnterpriseBodySmall className="font-medium">
            {Math.round(percentage)}%
          </EnterpriseBodySmall>
        </div>
      )}
      <div className={cn(
        'w-full bg-gray-200 rounded-full overflow-hidden',
        sizeClasses[size]
      )}>
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out rounded-full',
            statusColors[status]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Button Component
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function EnterpriseButton({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  loading = false,
  icon,
  className,
  onClick 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-[#F76511] text-white hover:bg-[#E55A0C] focus:ring-[#F76511] shadow-sm hover:shadow-md',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 border border-gray-300',
    outline: 'border-2 border-[#F76511] text-[#F76511] hover:bg-orange-50 focus:ring-[#F76511]',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-sm hover:shadow-md'
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4" 
            fill="none" 
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
          />
        </svg>
      ) : icon}
      {children}
    </button>
  );
}

// Loading Skeleton Components
export function SkeletonCard() {
  return (
    <EnterpriseCard className="animate-pulse">
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      </div>
    </EnterpriseCard>
  );
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <EnterpriseCard padding="none">
      <div className="divide-y divide-gray-200">
        {/* Header */}
        <div className="p-4 bg-gray-50 flex space-x-4">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="flex-1">
              <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
        
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4 flex space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="flex-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </EnterpriseCard>
  );
}

// Empty State Component
interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EnterpriseEmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <EnterpriseCard className="text-center py-12">
      {icon && <div className="text-6xl mb-4">{icon}</div>}
      <EnterpriseH3 className="mb-2">{title}</EnterpriseH3>
      {description && (
        <EnterpriseBody className="mb-6 max-w-md mx-auto">
          {description}
        </EnterpriseBody>
      )}
      {action && (
        <EnterpriseButton onClick={action.onClick}>
          {action.label}
        </EnterpriseButton>
      )}
    </EnterpriseCard>
  );
}

// Layout Components
export function EnterprisePageHeader({ 
  title, 
  subtitle, 
  actions 
}: { 
  title: string; 
  subtitle?: string; 
  actions?: React.ReactNode 
}) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <EnterpriseH1 className="mb-1">{title}</EnterpriseH1>
        {subtitle && <EnterpriseBody className="text-gray-600">{subtitle}</EnterpriseBody>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

export function EnterpriseGrid({ 
  children, 
  columns = 4, 
  gap = 'md' 
}: { 
  children: React.ReactNode; 
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
}) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
    5: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  };

  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6'
  };

  return (
    <div className={cn('grid', columnClasses[columns], gapClasses[gap])}>
      {children}
    </div>
  );
}