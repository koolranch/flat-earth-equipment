// Enterprise Organizations API - Phase 1

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { 
  getEnterpriseUser, 
  getOrganizationHierarchy, 
  createOrganization,
  logAuditEvent
} from '@/lib/enterprise/database';
import { getUserPermissions } from '@/lib/enterprise/utils';

// GET /api/enterprise/organizations
export async function GET(request: NextRequest) {
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

    const organizations = await getOrganizationHierarchy(user.id);
    
    return NextResponse.json({
      ok: true,
      data: organizations
    });

  } catch (error) {
    console.error('Organizations API error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/enterprise/organizations
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { name, type, parent_id, settings, contact_info } = body;

    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        { ok: false, error: 'Name and type are required' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['facility', 'department', 'team'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid organization type' },
        { status: 400 }
      );
    }

    // If creating a sub-organization, check parent permissions
    if (parent_id) {
      const { data: parentOrg } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', parent_id)
        .single();

      if (!parentOrg) {
        return NextResponse.json(
          { ok: false, error: 'Parent organization not found' },
          { status: 404 }
        );
      }

      // Check if user has permission to create sub-orgs under parent
      const parentPermissions = getUserPermissions(enterpriseUser, parentOrg);
      if (!parentPermissions['org:create']) {
        return NextResponse.json(
          { ok: false, error: 'Insufficient permissions to create sub-organization' },
          { status: 403 }
        );
      }
    }

    // Create the organization
    const result = await createOrganization({
      name,
      type,
      parent_id,
      settings: settings || {},
      contact_info: contact_info || {}
    }, user.id);

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: result.data
    });

  } catch (error) {
    console.error('Create organization API error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}