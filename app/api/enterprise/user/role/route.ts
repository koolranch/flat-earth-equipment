// Enterprise User Role API - Phase 2 RBAC
// Handles role retrieval and assignment

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { 
  RoleType, 
  normalizeRole, 
  getRolePermissions,
  canChangeRole,
  ROLE_DEFINITIONS 
} from '@/lib/enterprise/rbac';

/**
 * GET - Get current user's role and permissions
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', user.id)
      .maybeSingle();

    // Check for org-specific role in org_members table
    let orgRole: string | null = null;
    let orgId: string | null = null;

    // Get org membership and role from org_members table
    const { data: orgMember } = await supabase
      .from('org_members')
      .select('role, org_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (orgMember) {
      orgRole = orgMember.role;
      orgId = orgMember.org_id;
    }

    // If still no org_id, check enrollments (adapted approach for legacy users)
    if (!orgId) {
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('org_id')
        .eq('user_id', user.id)
        .not('org_id', 'is', null)
        .limit(1)
        .maybeSingle();
      
      if (enrollment?.org_id) {
        orgId = enrollment.org_id;
      }
    }

    // Determine effective role (org role takes precedence, default to member)
    const effectiveRole = orgRole || 'member';
    const normalizedRole = normalizeRole(effectiveRole);
    const permissions = getRolePermissions(normalizedRole);

    return NextResponse.json({
      ok: true,
      user_id: user.id,
      email: profile?.email || user.email,
      full_name: profile?.full_name,
      role: normalizedRole,
      role_display: ROLE_DEFINITIONS[normalizedRole]?.displayName || 'Member',
      org_id: orgId,
      permissions
    });

  } catch (error) {
    console.error('Role API error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to get user role' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update a user's role (requires appropriate permissions)
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { target_user_id, new_role, org_id, reason } = body;

    if (!target_user_id || !new_role) {
      return NextResponse.json(
        { ok: false, error: 'target_user_id and new_role are required' },
        { status: 400 }
      );
    }

    // Get requester's role from org_members
    const { data: requesterOrgMember } = await supabase
      .from('org_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('org_id', org_id)
      .maybeSingle();

    if (!requesterOrgMember) {
      return NextResponse.json(
        { ok: false, error: 'You are not a member of this organization' },
        { status: 403 }
      );
    }

    const requesterRole = normalizeRole(requesterOrgMember.role);

    // Get target user's current role from org_members
    const { data: targetOrgMember } = await supabase
      .from('org_members')
      .select('role')
      .eq('user_id', target_user_id)
      .eq('org_id', org_id)
      .maybeSingle();

    if (!targetOrgMember) {
      return NextResponse.json(
        { ok: false, error: 'Target user is not a member of this organization' },
        { status: 404 }
      );
    }

    const targetCurrentRole = normalizeRole(targetOrgMember.role);
    const targetNewRole = normalizeRole(new_role);

    // Validate the role change
    const validation = canChangeRole(requesterRole, targetCurrentRole, targetNewRole);
    
    if (!validation.allowed) {
      return NextResponse.json(
        { ok: false, error: validation.reason },
        { status: 403 }
      );
    }

    // Update role in org_members table
    const { error: updateError } = await supabase
      .from('org_members')
      .update({ 
        role: targetNewRole
      })
      .eq('user_id', target_user_id)
      .eq('org_id', org_id);

    if (updateError) {
      console.error('Role update error:', updateError);
      return NextResponse.json(
        { ok: false, error: 'Failed to update role' },
        { status: 500 }
      );
    }

    // Log the role change in audit_events table
    try {
      await supabase.from('audit_events').insert({
        org_id: org_id,
        actor_user_id: user.id,
        action: 'role.change',
        target: target_user_id,
        meta: {
          previous_role: targetCurrentRole,
          new_role: targetNewRole,
          reason: reason || null
        }
      });
    } catch (auditError) {
      // Don't fail the request if audit logging fails
      console.warn('Failed to create audit log:', auditError);
    }

    return NextResponse.json({
      ok: true,
      message: 'Role updated successfully',
      target_user_id,
      previous_role: targetCurrentRole,
      new_role: targetNewRole
    });

  } catch (error) {
    console.error('Role update error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to update role' },
      { status: 500 }
    );
  }
}
