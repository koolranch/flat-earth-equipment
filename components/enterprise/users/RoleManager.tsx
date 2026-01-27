'use client';

import React, { useState } from 'react';
import { 
  RoleType, 
  ROLE_DEFINITIONS, 
  getAssignableRoles,
  PERMISSION_CATEGORIES,
  PERMISSION_LABELS,
  getRolePermissions
} from '@/lib/enterprise/rbac';
import { EnterprisePermissions } from '@/lib/enterprise/types';
import { 
  EnterpriseCard, 
  EnterpriseH3, 
  EnterpriseBody, 
  EnterpriseBodySmall,
  EnterpriseButton 
} from '../ui/DesignSystem';
import { useRBAC, RoleGuard } from '../auth/RoleGuard';

interface RoleManagerProps {
  userId: string;
  userName: string;
  userEmail: string;
  currentRole: RoleType;
  orgId: string;
  onRoleChange?: (newRole: RoleType) => void;
}

/**
 * Role Management Component - allows changing a user's role
 */
export function RoleManager({ 
  userId, 
  userName, 
  userEmail,
  currentRole, 
  orgId,
  onRoleChange 
}: RoleManagerProps) {
  const { role: myRole } = useRBAC();
  const [selectedRole, setSelectedRole] = useState<RoleType>(currentRole);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPermissions, setShowPermissions] = useState(false);

  const assignableRoles = getAssignableRoles(myRole);
  const canAssign = assignableRoles.length > 0;

  const handleRoleChange = async () => {
    if (selectedRole === currentRole) return;
    
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/enterprise/user/role', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_user_id: userId,
          new_role: selectedRole,
          org_id: orgId
        })
      });

      const data = await response.json();

      if (!data.ok) {
        setError(data.error || 'Failed to update role');
        setSelectedRole(currentRole); // Reset
      } else {
        onRoleChange?.(selectedRole);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setSelectedRole(currentRole);
    } finally {
      setSaving(false);
    }
  };

  return (
    <EnterpriseCard>
      <div className="flex items-start justify-between">
        <div>
          <EnterpriseH3>{userName}</EnterpriseH3>
          <EnterpriseBodySmall className="text-neutral-500">{userEmail}</EnterpriseBodySmall>
        </div>
        
        <RoleBadge role={currentRole} />
      </div>

      {canAssign && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Change Role
            </label>
            <div className="flex gap-2">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as RoleType)}
                className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={saving}
              >
                {assignableRoles.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_DEFINITIONS[role].displayName}
                  </option>
                ))}
              </select>
              
              <EnterpriseButton
                variant="primary"
                size="sm"
                onClick={handleRoleChange}
                disabled={saving || selectedRole === currentRole}
                loading={saving}
              >
                Update
              </EnterpriseButton>
            </div>
            
            {selectedRole !== currentRole && (
              <EnterpriseBodySmall className="mt-2 text-neutral-600">
                {ROLE_DEFINITIONS[selectedRole]?.description}
              </EnterpriseBodySmall>
            )}
          </div>

          {error && (
            <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm">
              {error}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-neutral-200">
        <button
          onClick={() => setShowPermissions(!showPermissions)}
          className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          {showPermissions ? '▼' : '▶'} View Permissions
        </button>
        
        {showPermissions && (
          <div className="mt-3">
            <PermissionsList role={currentRole} />
          </div>
        )}
      </div>
    </EnterpriseCard>
  );
}

/**
 * Role Badge Component
 */
export function RoleBadge({ role, size = 'md' }: { role: RoleType; size?: 'sm' | 'md' }) {
  const config = ROLE_DEFINITIONS[role];
  
  const colors: Record<number, string> = {
    1: 'bg-neutral-100 text-neutral-700 border-neutral-300',
    2: 'bg-info-50 text-info-700 border-info-300',
    3: 'bg-success-50 text-success-700 border-success-300',
    4: 'bg-warning-50 text-warning-700 border-warning-300',
    5: 'bg-primary-50 text-primary-700 border-primary-300',
    10: 'bg-danger-50 text-danger-700 border-danger-300',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm'
  };

  return (
    <span className={`
      inline-flex items-center rounded-full border font-medium
      ${colors[config?.level || 1]}
      ${sizeClasses[size]}
    `}>
      {config?.displayName || role}
    </span>
  );
}

/**
 * Permissions List Component
 */
export function PermissionsList({ role }: { role: RoleType }) {
  const permissions = getRolePermissions(role);

  return (
    <div className="space-y-4">
      {Object.entries(PERMISSION_CATEGORIES).map(([key, category]) => (
        <div key={key}>
          <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
            {category.label}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {category.permissions.map((permission) => {
              const hasIt = permissions[permission];
              return (
                <div 
                  key={permission}
                  className={`
                    text-sm flex items-center gap-2
                    ${hasIt ? 'text-neutral-700' : 'text-neutral-400'}
                  `}
                >
                  <span className={hasIt ? 'text-success-500' : 'text-neutral-300'}>
                    {hasIt ? '✓' : '○'}
                  </span>
                  {PERMISSION_LABELS[permission]}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Role Selector for forms
 */
export function RoleSelector({ 
  value, 
  onChange, 
  disabled = false,
  showDescriptions = true
}: {
  value: RoleType;
  onChange: (role: RoleType) => void;
  disabled?: boolean;
  showDescriptions?: boolean;
}) {
  const { role: myRole } = useRBAC();
  const assignableRoles = getAssignableRoles(myRole);

  return (
    <div className="space-y-2">
      {assignableRoles.map((role) => {
        const config = ROLE_DEFINITIONS[role];
        const isSelected = value === role;
        
        return (
          <label
            key={role}
            className={`
              flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all
              ${isSelected 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-neutral-200 hover:border-neutral-300'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input
              type="radio"
              name="role"
              value={role}
              checked={isSelected}
              onChange={() => onChange(role)}
              disabled={disabled}
              className="mt-1"
            />
            <div>
              <div className="font-medium text-neutral-900">{config.displayName}</div>
              {showDescriptions && (
                <div className="text-sm text-neutral-600">{config.description}</div>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
}

/**
 * Compact Role Display
 */
export function RoleDisplay({ role }: { role: RoleType }) {
  const config = ROLE_DEFINITIONS[role];
  
  return (
    <div className="flex items-center gap-2">
      <RoleBadge role={role} size="sm" />
      <span className="text-sm text-neutral-600">{config?.description}</span>
    </div>
  );
}
