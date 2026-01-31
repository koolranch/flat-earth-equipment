// Enterprise Role-Based Access Control (RBAC) - Phase 2
// Comprehensive permission system for enterprise features

import { EnterprisePermissions } from './types';

/**
 * Role definitions with hierarchical permissions
 * Roles inherit permissions from lower levels
 */
export type RoleType = 'viewer' | 'member' | 'manager' | 'admin' | 'owner' | 'super_admin';

export interface RoleDefinition {
  name: string;
  displayName: string;
  description: string;
  level: number; // Higher = more permissions
  permissions: Partial<EnterprisePermissions>;
  inheritsFrom?: RoleType;
}

/**
 * Role hierarchy and permission definitions
 */
export const ROLE_DEFINITIONS: Record<RoleType, RoleDefinition> = {
  viewer: {
    name: 'viewer',
    displayName: 'Viewer',
    description: 'Can view training progress and basic reports',
    level: 1,
    permissions: {
      'org:read': true,
      'training:track': true,
      'reports:view': true,
    }
  },
  
  member: {
    name: 'member',
    displayName: 'Member',
    description: 'Standard team member with training access',
    level: 2,
    inheritsFrom: 'viewer',
    permissions: {
      'training:certificates': true,
      'reports:export': true,
    }
  },
  
  manager: {
    name: 'manager',
    displayName: 'Manager',
    description: 'Can manage team members and assign training',
    level: 3,
    inheritsFrom: 'member',
    permissions: {
      'users:assign': true,
      'training:assign': true,
      'reports:create': true,
      'reports:schedule': true,
    }
  },
  
  admin: {
    name: 'admin',
    displayName: 'Administrator',
    description: 'Full organizational management capabilities',
    level: 4,
    inheritsFrom: 'manager',
    permissions: {
      'org:update': true,
      'users:invite': true,
      'users:remove': true,
      'users:bulk_operations': true,
      'training:bulk_assign': true,
      'admin:audit_logs': true,
    }
  },
  
  owner: {
    name: 'owner',
    displayName: 'Owner',
    description: 'Organization owner with full control',
    level: 5,
    inheritsFrom: 'admin',
    permissions: {
      'org:create': true,
      'org:delete': true,
      'admin:system_settings': true,
      'admin:billing': true,
    }
  },
  
  super_admin: {
    name: 'super_admin',
    displayName: 'Super Admin',
    description: 'Platform-wide administrative access',
    level: 10,
    permissions: {
      // All permissions
      'org:create': true,
      'org:read': true,
      'org:update': true,
      'org:delete': true,
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
      'admin:system_settings': true,
      'admin:billing': true,
    }
  }
};

/**
 * Get all permissions for a role (including inherited)
 */
export function getRolePermissions(role: RoleType): EnterprisePermissions {
  const definition = ROLE_DEFINITIONS[role];
  if (!definition) {
    return getEmptyPermissions();
  }

  // Start with inherited permissions
  let permissions: Partial<EnterprisePermissions> = {};
  
  if (definition.inheritsFrom) {
    permissions = { ...getRolePermissions(definition.inheritsFrom) };
  }
  
  // Add role-specific permissions
  permissions = { ...permissions, ...definition.permissions };
  
  return permissions as EnterprisePermissions;
}

/**
 * Get empty permissions object (all false)
 */
export function getEmptyPermissions(): EnterprisePermissions {
  return {
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
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(
  userPermissions: Partial<EnterprisePermissions> | undefined,
  permission: keyof EnterprisePermissions
): boolean {
  if (!userPermissions) return false;
  return userPermissions[permission] === true;
}

/**
 * Check if a user has ALL specified permissions
 */
export function hasAllPermissions(
  userPermissions: Partial<EnterprisePermissions> | undefined,
  permissions: Array<keyof EnterprisePermissions>
): boolean {
  return permissions.every(p => hasPermission(userPermissions, p));
}

/**
 * Check if a user has ANY of the specified permissions
 */
export function hasAnyPermission(
  userPermissions: Partial<EnterprisePermissions> | undefined,
  permissions: Array<keyof EnterprisePermissions>
): boolean {
  return permissions.some(p => hasPermission(userPermissions, p));
}

/**
 * Get role level for comparison
 */
export function getRoleLevel(role: RoleType): number {
  return ROLE_DEFINITIONS[role]?.level || 0;
}

/**
 * Check if roleA has higher or equal level than roleB
 */
export function isRoleHigherOrEqual(roleA: RoleType, roleB: RoleType): boolean {
  return getRoleLevel(roleA) >= getRoleLevel(roleB);
}

/**
 * Get all roles a user can assign (can only assign roles at or below their level)
 */
export function getAssignableRoles(userRole: RoleType): RoleType[] {
  const userLevel = getRoleLevel(userRole);
  return (Object.keys(ROLE_DEFINITIONS) as RoleType[])
    .filter(role => ROLE_DEFINITIONS[role].level < userLevel)
    .sort((a, b) => ROLE_DEFINITIONS[a].level - ROLE_DEFINITIONS[b].level);
}

/**
 * Convert legacy role strings to RoleType
 * Supports both new RBAC roles and legacy database roles
 */
export function normalizeRole(role: string): RoleType {
  const roleMap: Record<string, RoleType> = {
    // New RBAC roles
    'view': 'viewer',
    'viewer': 'viewer',
    'read': 'viewer',
    'member': 'member',
    'user': 'member',
    'manager': 'manager',
    'supervisor': 'manager',
    'admin': 'admin',
    'administrator': 'admin',
    'owner': 'owner',
    'super_admin': 'super_admin',
    'superadmin': 'super_admin',
    
    // Legacy database roles (from org_members table)
    'learner': 'member',      // Legacy: learner → member
    'trainer': 'manager',     // Legacy: trainer → manager
    // 'owner' already mapped above
  };
  
  return roleMap[role.toLowerCase()] || 'member';
}

/**
 * Permission categories for UI grouping
 */
export const PERMISSION_CATEGORIES = {
  organization: {
    label: 'Organization',
    permissions: ['org:create', 'org:read', 'org:update', 'org:delete'] as const,
  },
  users: {
    label: 'User Management',
    permissions: ['users:invite', 'users:assign', 'users:remove', 'users:bulk_operations'] as const,
  },
  training: {
    label: 'Training',
    permissions: ['training:assign', 'training:track', 'training:certificates', 'training:bulk_assign'] as const,
  },
  reports: {
    label: 'Reports',
    permissions: ['reports:view', 'reports:create', 'reports:schedule', 'reports:export'] as const,
  },
  admin: {
    label: 'Administration',
    permissions: ['admin:audit_logs', 'admin:system_settings', 'admin:billing'] as const,
  },
};

/**
 * Human-readable permission labels
 */
export const PERMISSION_LABELS: Record<keyof EnterprisePermissions, string> = {
  'org:create': 'Create Organizations',
  'org:read': 'View Organization',
  'org:update': 'Edit Organization',
  'org:delete': 'Delete Organization',
  'users:invite': 'Invite Users',
  'users:assign': 'Assign Users',
  'users:remove': 'Remove Users',
  'users:bulk_operations': 'Bulk User Operations',
  'training:assign': 'Assign Training',
  'training:track': 'Track Progress',
  'training:certificates': 'Manage Certificates',
  'training:bulk_assign': 'Bulk Training Assignment',
  'reports:view': 'View Reports',
  'reports:create': 'Create Reports',
  'reports:schedule': 'Schedule Reports',
  'reports:export': 'Export Reports',
  'admin:audit_logs': 'View Audit Logs',
  'admin:system_settings': 'System Settings',
  'admin:billing': 'Billing Management',
};

/**
 * Create audit log entry for permission changes
 */
export interface RoleChangeAudit {
  user_id: string;
  target_user_id: string;
  org_id: string;
  previous_role: RoleType;
  new_role: RoleType;
  changed_by: string;
  reason?: string;
  timestamp: string;
}

/**
 * Validate role change is allowed
 */
export function canChangeRole(
  changerRole: RoleType,
  targetCurrentRole: RoleType,
  targetNewRole: RoleType
): { allowed: boolean; reason?: string } {
  const changerLevel = getRoleLevel(changerRole);
  const currentLevel = getRoleLevel(targetCurrentRole);
  const newLevel = getRoleLevel(targetNewRole);
  
  // Can't modify users at or above your level
  if (currentLevel >= changerLevel) {
    return { 
      allowed: false, 
      reason: 'Cannot modify users at or above your permission level' 
    };
  }
  
  // Can't promote to or above your level
  if (newLevel >= changerLevel) {
    return { 
      allowed: false, 
      reason: 'Cannot assign a role at or above your permission level' 
    };
  }
  
  // Super admin check
  if (targetNewRole === 'super_admin' && changerRole !== 'super_admin') {
    return { 
      allowed: false, 
      reason: 'Only super admins can create super admins' 
    };
  }
  
  return { allowed: true };
}
