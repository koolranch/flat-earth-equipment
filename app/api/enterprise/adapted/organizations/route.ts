// Adapted Enterprise API - Working with Existing Schema
import { NextRequest, NextResponse } from 'next/server';
import { getAdaptedOrganizations } from '@/lib/enterprise/adapted-database';

// GET /api/enterprise/adapted/organizations
export async function GET(request: NextRequest) {
  try {
    const organizations = await getAdaptedOrganizations();
    
    return NextResponse.json({
      ok: true,
      organizations,
      message: organizations.length === 0 
        ? 'No organizations found. Organizations are created automatically when you assign training with organizational context.'
        : `Found ${organizations.length} organization${organizations.length !== 1 ? 's' : ''}`
    });

  } catch (error) {
    console.error('Adapted organizations API error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to load organizations' },
      { status: 500 }
    );
  }
}