import 'server-only';
import { supabaseServer } from '@/lib/supabase/server';

export type AdminCheckResult = 
  | { ok: true; user: any; role?: string }
  | { ok: false; reason: 'unauthorized' | 'forbidden'; user: any | null };

/**
 * Server-only admin guard that checks user authorization through:
 * 1. ADMIN_EMAILS environment variable (comma-separated email allowlist)
 * 2. staff_admins table lookup (user_id, role)
 * 
 * This function should ONLY be used in server components and API routes.
 * Never expose admin credentials or logic to the client side.
 * 
 * @returns Promise<AdminCheckResult> - Authorization result with user data
 */
export async function requireAdminServer(): Promise<AdminCheckResult> {
  try {
    const sb = supabaseServer();
    const { data: { user }, error: authError } = await sb.auth.getUser();
    
    // Check for authentication errors
    if (authError || !user) {
      return { ok: false, reason: 'unauthorized', user: null } as const;
    }

    // 1) Environment variable allowlist check (primary method)
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map(email => email.trim().toLowerCase())
      .filter(Boolean);
    
    if (adminEmails.length > 0 && user.email) {
      const userEmail = user.email.toLowerCase();
      if (adminEmails.includes(userEmail)) {
        return { ok: true, user, role: 'env_admin' } as const;
      }
    }

    // 2) Database table check (secondary method)
    try {
      const { data: adminRecord, error: dbError } = await sb
        .from('staff_admins')
        .select('user_id, role, created_at')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!dbError && adminRecord) {
        return { ok: true, user, role: adminRecord.role || 'db_admin' } as const;
      }
    } catch (dbError) {
      // Database table might not exist or be accessible
      console.warn('Admin table check failed:', dbError);
    }

    // User is authenticated but not authorized as admin
    return { ok: false, reason: 'forbidden', user } as const;
    
  } catch (error) {
    console.error('Admin guard error:', error);
    return { ok: false, reason: 'unauthorized', user: null } as const;
  }
}

/**
 * Helper function to check if a user has a specific admin role
 * 
 * @param requiredRole - The role required for access
 * @returns Promise<AdminCheckResult> - Authorization result
 */
export async function requireAdminRole(requiredRole: string): Promise<AdminCheckResult> {
  const result = await requireAdminServer();
  
  if (!result.ok) {
    return result;
  }
  
  // Check if user has the required role
  if (result.role === requiredRole || result.role === 'super_admin' || result.role === 'env_admin') {
    return result;
  }
  
  return { ok: false, reason: 'forbidden', user: result.user } as const;
}

/**
 * Utility function to get admin user info without throwing
 * Useful for conditional admin features
 * 
 * @returns Promise<{ isAdmin: boolean; user: any | null; role?: string }>
 */
export async function getAdminStatus() {
  const result = await requireAdminServer();
  return {
    isAdmin: result.ok,
    user: result.user,
    role: result.ok ? result.role : undefined
  };
}

/**
 * Type guard for admin check results
 */
export function isAdminAuthorized(result: AdminCheckResult): result is { ok: true; user: any; role?: string } {
  return result.ok;
}
