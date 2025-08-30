import { NextResponse } from 'next/server';
import { requireAdminServer, getAdminStatus } from '@/lib/admin/guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Test endpoint to demonstrate admin guard usage
 * This endpoint shows how to protect API routes with admin authentication
 */
export async function GET() {
  try {
    // Method 1: Require admin access (throws/returns error if not admin)
    const adminCheck = await requireAdminServer();
    
    if (!adminCheck.ok) {
      return NextResponse.json(
        { 
          error: adminCheck.reason === 'unauthorized' ? 'Authentication required' : 'Admin access required',
          reason: adminCheck.reason 
        }, 
        { status: adminCheck.reason === 'unauthorized' ? 401 : 403 }
      );
    }

    // Method 2: Get admin status for conditional features
    const status = await getAdminStatus();

    return NextResponse.json({
      success: true,
      message: 'Admin access confirmed',
      user: {
        id: adminCheck.user.id,
        email: adminCheck.user.email,
        role: adminCheck.role
      },
      status: status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin guard test error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

/**
 * Example POST endpoint with role-based access
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const requiredRole = body.role || 'admin';

    // Use role-specific guard
    const { requireAdminRole } = await import('@/lib/admin/guard');
    const roleCheck = await requireAdminRole(requiredRole);

    if (!roleCheck.ok) {
      return NextResponse.json(
        { 
          error: `${requiredRole} role required`,
          reason: roleCheck.reason 
        }, 
        { status: roleCheck.reason === 'unauthorized' ? 401 : 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Access granted for role: ${requiredRole}`,
      user: {
        id: roleCheck.user.id,
        email: roleCheck.user.email,
        role: roleCheck.role
      }
    });

  } catch (error) {
    console.error('Role check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
