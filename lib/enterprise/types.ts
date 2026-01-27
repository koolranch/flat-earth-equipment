// Enterprise type definitions for Phase 1

export interface Organization {
  id: string;
  name: string;
  type: 'facility' | 'department' | 'team';
  parent_id?: string;
  settings: Record<string, any>;
  contact_info: {
    email?: string;
    phone?: string;
    address?: string;
  };
  created_at: string;
  updated_at: string;
  created_by?: string;
  
  // Virtual fields (computed)
  children?: Organization[];
  user_count?: number;
  enrollment_count?: number;
  completion_rate?: number;
}

export interface UserOrganization {
  id: string;
  user_id: string;
  org_id: string;
  role: 'member' | 'manager' | 'admin' | 'owner';
  permissions: Record<string, boolean>;
  created_at: string;
  updated_at: string;
  created_by?: string;
  
  // Joined data
  organization?: Organization;
  user?: {
    id: string;
    email: string;
    full_name: string;
  };
}

export interface EnterpriseReport {
  id: string;
  org_id: string;
  name: string;
  type: 'compliance' | 'progress' | 'certification' | 'custom';
  config: Record<string, any>;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    day_of_week?: number;
    day_of_month?: number;
    time?: string;
    recipients: string[];
  };
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface AuditLog {
  id: string;
  org_id?: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Enhanced user profile with enterprise context
export interface EnterpriseUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  org_id?: string;
  enterprise_settings: {
    preferred_dashboard?: 'trainer' | 'enterprise';
    notification_preferences?: Record<string, boolean>;
    ui_preferences?: Record<string, any>;
  };
  last_org_context?: string;
  created_at: string;
  
  // Enterprise relationships
  organizations?: UserOrganization[] | null;
  primary_organization?: Organization | null;
}

// Enhanced enrollment with org context
export interface EnterpriseEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  progress_pct: number;
  passed: boolean;
  org_context: {
    org_id?: string;
    department_id?: string;
    team_id?: string;
    compliance_tags?: string[];
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  };
  assigned_by?: string;
  assignment_note?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

// Dashboard view types
export type DashboardView = 'trainer' | 'facility' | 'department' | 'team' | 'executive';

export interface DashboardContext {
  user: EnterpriseUser;
  current_org?: Organization;
  view_type: DashboardView;
  permissions: Record<string, boolean>;
  navigation_path: Array<{ id: string; name: string; type: string }>;
}

// Permissions system
export interface EnterprisePermissions {
  // Organization management
  'org:create': boolean;
  'org:read': boolean;
  'org:update': boolean;
  'org:delete': boolean;
  
  // User management
  'users:invite': boolean;
  'users:assign': boolean;
  'users:remove': boolean;
  'users:bulk_operations': boolean;
  
  // Training management
  'training:assign': boolean;
  'training:track': boolean;
  'training:certificates': boolean;
  'training:bulk_assign': boolean;
  
  // Reporting
  'reports:view': boolean;
  'reports:create': boolean;
  'reports:schedule': boolean;
  'reports:export': boolean;
  
  // Admin functions
  'admin:audit_logs': boolean;
  'admin:system_settings': boolean;
  'admin:billing': boolean;
}

// API response types
export interface EnterpriseApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
  metadata?: {
    total?: number;
    page?: number;
    page_size?: number;
    has_more?: boolean;
  };
}

// Utility types for organizational hierarchy
export interface OrganizationHierarchy {
  facility: Organization;
  departments: Array<Organization & { teams?: Organization[] }>;
  total_users: number;
  total_enrollments: number;
  compliance_rate: number;
}

export interface OrganizationStats {
  total_users: number;
  active_enrollments: number;
  completed_trainings: number;
  pending_certifications: number;
  compliance_rate: number;
  completion_rate: number;
  average_score: number;
  trends: {
    enrollments_trend: number; // percentage change
    completion_trend: number;
    compliance_trend: number;
  };
}