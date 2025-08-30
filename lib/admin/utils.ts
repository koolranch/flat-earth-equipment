import 'server-only';
import { NextResponse } from 'next/server';
import { requireAdminServer, requireAdminRole, type AdminCheckResult } from './guard';

/**
 * Higher-order function to wrap API routes with admin protection
 * 
 * @param handler - The API route handler function
 * @param requiredRole - Optional specific role requirement
 * @returns Protected API route handler
 */
export function withAdminAuth<T extends any[]>(
  handler: (request: Request, ...args: T) => Promise<Response>,
  requiredRole?: string
) {
  return async (request: Request, ...args: T): Promise<Response> => {
    try {
      const adminCheck = requiredRole 
        ? await requireAdminRole(requiredRole)
        : await requireAdminServer();

      if (!adminCheck.ok) {
        return NextResponse.json(
          { 
            error: adminCheck.reason === 'unauthorized' 
              ? 'Authentication required' 
              : `Admin access required${requiredRole ? ` (role: ${requiredRole})` : ''}`,
            reason: adminCheck.reason 
          }, 
          { status: adminCheck.reason === 'unauthorized' ? 401 : 403 }
        );
      }

      // Add admin info to request context (if needed)
      (request as any).adminUser = adminCheck.user;
      (request as any).adminRole = adminCheck.role;

      return await handler(request, ...args);
    } catch (error) {
      console.error('Admin auth wrapper error:', error);
      return NextResponse.json(
        { error: 'Internal server error' }, 
        { status: 500 }
      );
    }
  };
}

/**
 * Utility to create admin-protected API responses
 * 
 * @param data - Response data
 * @param adminInfo - Admin user information
 * @returns NextResponse with admin context
 */
export function createAdminResponse(data: any, adminInfo?: { user: any; role?: string }) {
  return NextResponse.json({
    ...data,
    _meta: {
      timestamp: new Date().toISOString(),
      admin_user: adminInfo?.user?.id,
      admin_role: adminInfo?.role
    }
  });
}

/**
 * Log admin actions for audit trail
 * 
 * @param action - Action being performed
 * @param user - Admin user performing action
 * @param details - Additional action details
 */
export async function logAdminAction(
  action: string, 
  user: any, 
  details?: Record<string, any>
) {
  try {
    // This could be enhanced to write to an audit log table
    console.log('Admin Action:', {
      action,
      user_id: user.id,
      user_email: user.email,
      timestamp: new Date().toISOString(),
      details
    });
    
    // Optional: Write to database audit log
    // const sb = supabaseServer();
    // await sb.from('admin_audit_log').insert({
    //   action,
    //   user_id: user.id,
    //   details,
    //   ip_address: request.headers.get('x-forwarded-for'),
    //   user_agent: request.headers.get('user-agent')
    // });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}

/**
 * Check if user has any admin privileges (for conditional rendering)
 * This is a lighter check that doesn't require full authorization
 */
export async function hasAdminPrivileges(): Promise<boolean> {
  try {
    const result = await requireAdminServer();
    return result.ok;
  } catch {
    return false;
  }
}
