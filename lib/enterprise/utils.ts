// Enterprise utility functions for Phase 1

import { EnterpriseUser, Organization, DashboardView, EnterprisePermissions } from './types';

/**
 * Determine if a user has enterprise features enabled
 */
export function isEnterpriseUser(user: EnterpriseUser): boolean {
  return !!(
    user.org_id || 
    user.organizations?.length > 0 ||
    user.enterprise_settings?.preferred_dashboard === 'enterprise'
  );
}

/**
 * Get the appropriate dashboard view for a user
 */
export function getDashboardView(user: EnterpriseUser, org?: Organization): DashboardView {
  // If user explicitly prefers trainer dashboard, respect that
  if (user.enterprise_settings?.preferred_dashboard === 'trainer') {
    return 'trainer';
  }

  // If no organization context, use trainer view
  if (!isEnterpriseUser(user)) {
    return 'trainer';
  }

  // Determine view based on organization type and user role
  if (!org && user.primary_organization) {
    org = user.primary_organization;
  }

  if (!org) return 'trainer';

  // Get user's role in this organization
  const userOrgRole = user.organizations?.find(uo => uo.org_id === org.id)?.role;

  switch (org.type) {
    case 'facility':
      return userOrgRole === 'owner' || userOrgRole === 'admin' ? 'executive' : 'facility';
    case 'department':
      return 'department';
    case 'team':
      return 'team';
    default:
      return 'trainer';
  }
}

/**
 * Build organizational hierarchy navigation path
 */
export function buildNavigationPath(org: Organization, allOrgs: Organization[]): Array<{ id: string; name: string; type: string }> {
  const path: Array<{ id: string; name: string; type: string }> = [];
  
  let current = org;
  while (current) {
    path.unshift({
      id: current.id,
      name: current.name,
      type: current.type
    });
    
    if (current.parent_id) {
      current = allOrgs.find(o => o.id === current.parent_id)!;
    } else {
      break;
    }
  }
  
  return path;
}

/**
 * Get user permissions based on role and organization context
 */
export function getUserPermissions(user: EnterpriseUser, org?: Organization): EnterprisePermissions {
  const defaultPermissions: EnterprisePermissions = {
    'org:create': false,
    'org:read': false,
    'org:update': false,
    'org:delete': false,
    'users:invite': false,
    'users:assign': false,
    'users:remove': false,
    'users:bulk_operations': false,
    'training:assign': false,
    'training:track': false,
    'training:certificates': false,
    'training:bulk_assign': false,
    'reports:view': false,
    'reports:create': false,
    'reports:schedule': false,
    'reports:export': false,
    'admin:audit_logs': false,
    'admin:system_settings': false,
    'admin:billing': false,
  };

  // If not an enterprise user, return basic trainer permissions
  if (!isEnterpriseUser(user)) {
    return {
      ...defaultPermissions,
      'training:assign': true,
      'training:track': true,
      'training:certificates': true,
      'reports:view': true,
      'reports:export': true,
    };
  }

  // Get user's role in the current organization
  const userOrgRole = user.organizations?.find(uo => uo.org_id === org?.id)?.role || 'member';

  // Role-based permissions
  switch (userOrgRole) {
    case 'owner':
      return Object.fromEntries(
        Object.keys(defaultPermissions).map(key => [key, true])
      ) as EnterprisePermissions;

    case 'admin':
      return {
        ...defaultPermissions,
        'org:read': true,
        'org:update': true,
        'users:invite': true,
        'users:assign': true,
        'users:remove': true,
        'users:bulk_operations': true,
        'training:assign': true,
        'training:track': true,
        'training:certificates': true,
        'training:bulk_assign': true,
        'reports:view': true,
        'reports:create': true,
        'reports:schedule': true,
        'reports:export': true,
        'admin:audit_logs': true,
      };

    case 'manager':
      return {
        ...defaultPermissions,
        'org:read': true,
        'users:invite': true,
        'users:assign': true,
        'users:bulk_operations': true,
        'training:assign': true,
        'training:track': true,
        'training:certificates': true,
        'training:bulk_assign': true,
        'reports:view': true,
        'reports:create': true,
        'reports:export': true,
      };

    case 'member':
    default:
      return {
        ...defaultPermissions,
        'org:read': true,
        'training:track': true,
        'training:certificates': true,
        'reports:view': true,
      };
  }
}

/**
 * Format organization hierarchy for display
 */
export function formatOrganizationHierarchy(orgs: Organization[]): Organization[] {
  const orgMap = new Map<string, Organization>();
  const rootOrgs: Organization[] = [];

  // First pass: create map and identify roots
  orgs.forEach(org => {
    orgMap.set(org.id, { ...org, children: [] });
    if (!org.parent_id) {
      rootOrgs.push(orgMap.get(org.id)!);
    }
  });

  // Second pass: build hierarchy
  orgs.forEach(org => {
    if (org.parent_id && orgMap.has(org.parent_id)) {
      const parent = orgMap.get(org.parent_id)!;
      const child = orgMap.get(org.id)!;
      parent.children = parent.children || [];
      parent.children.push(child);
    }
  });

  return rootOrgs;
}

/**
 * Check if user has permission for a specific action
 */
export function hasPermission(
  permissions: EnterprisePermissions, 
  action: keyof EnterprisePermissions
): boolean {
  return permissions[action] === true;
}

/**
 * Generate breadcrumb navigation for current context
 */
export function generateBreadcrumbs(
  view: DashboardView, 
  org?: Organization, 
  navigationPath?: Array<{ id: string; name: string; type: string }>
): Array<{ label: string; href?: string; current: boolean }> {
  const breadcrumbs: Array<{ label: string; href?: string; current: boolean }> = [];

  // Always start with dashboard
  breadcrumbs.push({
    label: 'Dashboard',
    href: view === 'trainer' ? '/trainer/dashboard' : '/enterprise/dashboard',
    current: false
  });

  // Add organizational context if available
  if (navigationPath && navigationPath.length > 0) {
    navigationPath.forEach((item, index) => {
      const isLast = index === navigationPath.length - 1;
      breadcrumbs.push({
        label: item.name,
        href: isLast ? undefined : `/enterprise/organization/${item.id}`,
        current: isLast
      });
    });
  } else if (org) {
    breadcrumbs.push({
      label: org.name,
      current: true
    });
  } else {
    breadcrumbs[0].current = true;
  }

  return breadcrumbs;
}

/**
 * Determine appropriate redirect after login based on user context
 */
export function getPostLoginRedirect(user: EnterpriseUser): string {
  if (isEnterpriseUser(user)) {
    const preferredView = user.enterprise_settings?.preferred_dashboard;
    if (preferredView === 'trainer') {
      return '/trainer/dashboard';
    }
    return '/enterprise/dashboard';
  }
  return '/trainer/dashboard';
}

/**
 * Format user display name with organization context
 */
export function formatUserDisplayName(
  user: { full_name: string; email: string }, 
  includeOrg?: Organization
): string {
  let display = user.full_name || user.email;
  
  if (includeOrg) {
    display += ` (${includeOrg.name})`;
  }
  
  return display;
}

/**
 * Validate organization hierarchy (no circular references)
 */
export function validateOrganizationHierarchy(orgs: Organization[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for circular references
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  
  function hasCircularReference(orgId: string, orgMap: Map<string, Organization>): boolean {
    if (recursionStack.has(orgId)) {
      errors.push(`Circular reference detected in organization hierarchy involving ${orgId}`);
      return true;
    }
    
    if (visited.has(orgId)) {
      return false;
    }
    
    visited.add(orgId);
    recursionStack.add(orgId);
    
    const org = orgMap.get(orgId);
    if (org?.parent_id && orgMap.has(org.parent_id)) {
      if (hasCircularReference(org.parent_id, orgMap)) {
        return true;
      }
    }
    
    recursionStack.delete(orgId);
    return false;
  }
  
  const orgMap = new Map(orgs.map(org => [org.id, org]));
  
  for (const org of orgs) {
    if (!visited.has(org.id)) {
      hasCircularReference(org.id, orgMap);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T = any>(jsonString: string | null | undefined, fallback: T): T {
  if (!jsonString) return fallback;
  
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.warn('Failed to parse JSON:', error);
    return fallback;
  }
}