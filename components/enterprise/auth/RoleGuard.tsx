'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { EnterprisePermissions } from '@/lib/enterprise/types';
import { 
  RoleType, 
  getRolePermissions, 
  getRoleLevel,
  hasPermission, 
  hasAllPermissions, 
  hasAnyPermission,
  normalizeRole,
  getEmptyPermissions
} from '@/lib/enterprise/rbac';
import { EnterpriseCard, EnterpriseH2, EnterpriseBody, EnterpriseButton } from '../ui/DesignSystem';

// RBAC Context for permission checking throughout the app
interface RBACContextType {
  role: RoleType;
  permissions: EnterprisePermissions;
  isLoading: boolean;
  orgId: string | null;
  can: (permission: keyof EnterprisePermissions) => boolean;
  canAll: (permissions: Array<keyof EnterprisePermissions>) => boolean;
  canAny: (permissions: Array<keyof EnterprisePermissions>) => boolean;
}

const RBACContext = createContext<RBACContextType>({
  role: 'member',
  permissions: getEmptyPermissions(),
  isLoading: true,
  orgId: null,
  can: () => false,
  canAll: () => false,
  canAny: () => false,
});

export const useRBAC = () => useContext(RBACContext);

/**
 * RBAC Provider - wraps the app to provide permission context
 */
export function RBACProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<RoleType>('member');
  const [permissions, setPermissions] = useState<EnterprisePermissions>(getEmptyPermissions());
  const [isLoading, setIsLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    try {
      const response = await fetch('/api/enterprise/user/role');
      const data = await response.json();
      
      if (data.ok && data.role) {
        const normalizedRole = normalizeRole(data.role);
        setRole(normalizedRole);
        setPermissions(getRolePermissions(normalizedRole));
        setOrgId(data.org_id || null);
      }
    } catch (error) {
      console.error('Failed to load user role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const can = (permission: keyof EnterprisePermissions) => 
    hasPermission(permissions, permission);
    
  const canAll = (perms: Array<keyof EnterprisePermissions>) => 
    hasAllPermissions(permissions, perms);
    
  const canAny = (perms: Array<keyof EnterprisePermissions>) => 
    hasAnyPermission(permissions, perms);

  return (
    <RBACContext.Provider value={{ role, permissions, isLoading, orgId, can, canAll, canAny }}>
      {children}
    </RBACContext.Provider>
  );
}

/**
 * RoleGuard - Protects UI elements based on required permissions
 */
interface RoleGuardProps {
  children: React.ReactNode;
  require?: keyof EnterprisePermissions;
  requireAll?: Array<keyof EnterprisePermissions>;
  requireAny?: Array<keyof EnterprisePermissions>;
  minRole?: RoleType;
  fallback?: React.ReactNode;
  showAccessDenied?: boolean;
}

export function RoleGuard({ 
  children, 
  require,
  requireAll,
  requireAny,
  minRole,
  fallback,
  showAccessDenied = false
}: RoleGuardProps) {
  const { permissions, role, isLoading } = useRBAC();
  
  if (isLoading) {
    return <div className="animate-pulse h-8 bg-neutral-200 rounded"></div>;
  }

  let hasAccess = true;

  // Check single permission
  if (require) {
    hasAccess = hasPermission(permissions, require);
  }
  
  // Check all permissions
  if (requireAll && hasAccess) {
    hasAccess = hasAllPermissions(permissions, requireAll);
  }
  
  // Check any permissions
  if (requireAny && hasAccess) {
    hasAccess = hasAnyPermission(permissions, requireAny);
  }

  // Check minimum role level
  if (minRole && hasAccess) {
    hasAccess = getRoleLevel(role) >= getRoleLevel(minRole);
  }

  if (!hasAccess) {
    if (fallback) return <>{fallback}</>;
    if (showAccessDenied) return <AccessDenied />;
    return null;
  }

  return <>{children}</>;
}

/**
 * Access Denied component
 */
function AccessDenied() {
  return (
    <EnterpriseCard className="text-center py-12 max-w-md mx-auto">
      <div className="text-6xl mb-4">🔒</div>
      <EnterpriseH2 className="mb-2">Access Denied</EnterpriseH2>
      <EnterpriseBody className="text-neutral-600 mb-6">
        You don't have permission to access this feature. 
        Contact your organization administrator if you need access.
      </EnterpriseBody>
      <EnterpriseButton 
        variant="secondary"
        onClick={() => window.history.back()}
      >
        Go Back
      </EnterpriseButton>
    </EnterpriseCard>
  );
}

/**
 * Hook for conditional rendering based on permissions
 */
export function usePermission(permission: keyof EnterprisePermissions): boolean {
  const { can } = useRBAC();
  return can(permission);
}

/**
 * Hook for getting current role info
 */
export function useRole() {
  const { role, isLoading } = useRBAC();
  return { role, isLoading };
}

/**
 * Higher-order component for page-level protection
 */
export function withRoleGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: Omit<RoleGuardProps, 'children'>
) {
  return function WithRoleGuardComponent(props: P) {
    return (
      <RoleGuard {...options} showAccessDenied>
        <WrappedComponent {...props} />
      </RoleGuard>
    );
  };
}

/**
 * Inline permission check component
 */
export function Can({ 
  permission, 
  children,
  else: elseBranch
}: { 
  permission: keyof EnterprisePermissions; 
  children: React.ReactNode;
  else?: React.ReactNode;
}) {
  const { can } = useRBAC();
  return can(permission) ? <>{children}</> : <>{elseBranch}</> || null;
}

/**
 * CanAny - Render if user has any of the permissions
 */
export function CanAny({ 
  permissions, 
  children,
  else: elseBranch
}: { 
  permissions: Array<keyof EnterprisePermissions>; 
  children: React.ReactNode;
  else?: React.ReactNode;
}) {
  const { canAny } = useRBAC();
  return canAny(permissions) ? <>{children}</> : <>{elseBranch}</> || null;
}
