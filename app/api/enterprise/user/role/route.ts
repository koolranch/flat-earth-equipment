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

    // Get user profile with org membership
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, org_id')
      .eq('id', user.id)
      .single();

    // Check for org-specific role in user_organizations table (if exists)
    let orgRole: string | null = null;
    let orgId = profile?.org_id || null;

    // Try to get org-specific role from user_organizations
    const { data: userOrg } = await supabase
      .from('user_organizations')
      .select('role, org_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (userOrg) {
      orgRole = userOrg.role;
      orgId = userOrg.org_id;
    }

    // If still no org_id, check enrollments (adapted approach)
    if (!orgId) {
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('org_id')
        .eq('user_id', user.id)
        .not('org_id', 'is', null)
        .limit(1)
        .single();
      
      if (enrollment?.org_id) {
        orgId = enrollment.org_id;
      }
    }

    // Determine effective role (org role takes precedence)
    const effectiveRole = orgRole || profile?.role || 'member';
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

    // Get requester's role
    const { data: requesterOrg } = await supabase
      .from('user_organizations')
      .select('role')
      .eq('user_id', user.id)
      .eq('org_id', org_id)
      .single();

    const { data: requesterProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const requesterRole = normalizeRole(requesterOrg?.role || requesterProfile?.role || 'member');

    // Get target user's current role
    const { data: targetOrg } = await supabase
      .from('user_organizations')
      .select('role')
      .eq('user_id', target_user_id)
      .eq('org_id', org_id)
      .single();

    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', target_user_id)
      .single();

    const targetCurrentRole = normalizeRole(targetOrg?.role || targetProfile?.role || 'member');
    const targetNewRole = normalizeRole(new_role);

    // Validate the role change
    const validation = canChangeRole(requesterRole, targetCurrentRole, targetNewRole);
    
    if (!validation.allowed) {
      return NextResponse.json(
        { ok: false, error: validation.reason },
        { status: 403 }
      );
    }

    // Update or create user_organizations entry
    const { error: updateError } = await supabase
      .from('user_organizations')
      .upsert({
        user_id: target_user_id,
        org_id: org_id,
        role: targetNewRole,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,org_id'
      });

    if (updateError) {
      // If user_organizations doesn't exist, try updating profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: targetNewRole })
        .eq('id', target_user_id);

      if (profileError) {
        console.error('Role update error:', profileError);
        return NextResponse.json(
          { ok: false, error: 'Failed to update role' },
          { status: 500 }
        );
      }
    }

    // Log the role change
    try {
      await supabase.from('audit_logs').insert({
        org_id: org_id,
        user_id: user.id,
        action: 'role_change',
        resource_type: 'user',
        resource_id: target_user_id,
        details: {
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
