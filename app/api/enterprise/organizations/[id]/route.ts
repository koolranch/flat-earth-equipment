// Enterprise Organization Details API - Phase 1

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { 
  getEnterpriseUser, 
  getOrganization, 
  getOrganizationStats,
  logAuditEvent
} from '@/lib/enterprise/database';
import { getUserPermissions } from '@/lib/enterprise/utils';

// GET /api/enterprise/organizations/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const enterpriseUser = await getEnterpriseUser(user.id);
    if (!enterpriseUser) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    const organization = await getOrganization(params.id);
    if (!organization) {
      return NextResponse.json({ ok: false, error: 'Organization not found' }, { status: 404 });
    }

    // Check if user has access to this organization
    const hasAccess = enterpriseUser.organizations?.some(uo => 
      uo.org_id === params.id || uo.organization?.parent_id === params.id
    );

    if (!hasAccess) {
      return NextResponse.json({ ok: false, error: 'Access denied' }, { status: 403 });
    }

    // Get organization stats
    const stats = await getOrganizationStats(params.id);

    // Get user permissions for this organization
    const permissions = getUserPermissions(enterpriseUser, organization);

    return NextResponse.json({
      ok: true,
      data: {
        organization,
        stats,
        permissions
      }
    });

  } catch (error) {
    console.error('Organization details API error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/enterprise/organizations/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const enterpriseUser = await getEnterpriseUser(user.id);
    if (!enterpriseUser) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    const organization = await getOrganization(params.id);
    if (!organization) {
      return NextResponse.json({ ok: false, error: 'Organization not found' }, { status: 404 });
    }

    // Check permissions
    const permissions = getUserPermissions(enterpriseUser, organization);
    if (!permissions['org:update']) {
      return NextResponse.json({ ok: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { name, settings, contact_info } = body;

    // Update organization
    const { data: updatedOrg, error } = await supabase
      .from('organizations')
      .update({
        name: name || organization.name,
        settings: JSON.stringify(settings || organization.settings),
        contact_info: JSON.stringify(contact_info || organization.contact_info),
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      );
    }

    // Log audit event
    await logAuditEvent({
      org_id: params.id,
      user_id: user.id,
      action: 'organization_updated',
      resource_type: 'organization',
      resource_id: params.id,
      details: {
        changes: {
          name: name !== organization.name ? { from: organization.name, to: name } : undefined,
          settings: settings ? 'updated' : undefined,
          contact_info: contact_info ? 'updated' : undefined
        }
      }
    });

    return NextResponse.json({
      ok: true,
      data: {
        ...updatedOrg,
        settings: JSON.parse(updatedOrg.settings || '{}'),
        contact_info: JSON.parse(updatedOrg.contact_info || '{}')
      }
    });

  } catch (error) {
    console.error('Update organization API error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/enterprise/organizations/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const enterpriseUser = await getEnterpriseUser(user.id);
    if (!enterpriseUser) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    const organization = await getOrganization(params.id);
    if (!organization) {
      return NextResponse.json({ ok: false, error: 'Organization not found' }, { status: 404 });
    }

    // Check permissions
    const permissions = getUserPermissions(enterpriseUser, organization);
    if (!permissions['org:delete']) {
      return NextResponse.json({ ok: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    // Check for child organizations
    const { data: children } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('parent_id', params.id);

    if (children && children.length > 0) {
      return NextResponse.json(
        { 
          ok: false, 
          error: `Cannot delete organization with ${children.length} child organization(s). Please delete or move child organizations first.`,
          children: children.map(c => c.name)
        },
        { status: 400 }
      );
    }

    // Check for active users
    const { count: userCount } = await supabase
      .from('user_organizations')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', params.id);

    if (userCount && userCount > 0) {
      return NextResponse.json(
        { 
          ok: false, 
          error: `Cannot delete organization with ${userCount} active user(s). Please remove all users first.`
        },
        { status: 400 }
      );
    }

    // Delete the organization
    const { error: deleteError } = await supabase
      .from('organizations')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      return NextResponse.json(
        { ok: false, error: deleteError.message },
        { status: 400 }
      );
    }

    // Log audit event
    await logAuditEvent({
      org_id: params.id,
      user_id: user.id,
      action: 'organization_deleted',
      resource_type: 'organization',
      resource_id: params.id,
      details: {
        name: organization.name,
        type: organization.type
      }
    });

    return NextResponse.json({
      ok: true,
      message: 'Organization deleted successfully'
    });

  } catch (error) {
    console.error('Delete organization API error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}