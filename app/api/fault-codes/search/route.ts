import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(request: Request) {
  try {
    const { brand_slug, code, equipment_type, category } = await request.json();

    if (!brand_slug) {
      return NextResponse.json({ error: 'Brand slug is required' }, { status: 400 });
    }

    const db = supabase();
    let query = db
      .from('fault_codes')
      .select('*')
      .eq('brand_slug', brand_slug);

    // Add filters based on provided parameters
    if (code) {
      // Search by exact code or partial match
      query = query.or(`code.ilike.%${code}%,description.ilike.%${code}%`);
    }

    if (equipment_type) {
      query = query.eq('equipment_type', equipment_type);
    }

    if (category) {
      query = query.eq('category', category);
    }

    // Order by severity (critical first) and then by code
    query = query.order('severity', { ascending: false }).order('code', { ascending: true });

    const { data: faultCodes, error } = await query.limit(50);

    if (error) {
      console.error('Fault codes search error:', error);
      return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }

    // Get available categories and equipment types for filters
    const { data: categories } = await db
      .from('fault_codes')
      .select('category')
      .eq('brand_slug', brand_slug)
      .not('category', 'is', null);

    const { data: equipmentTypes } = await db
      .from('fault_codes')
      .select('equipment_type')
      .eq('brand_slug', brand_slug)
      .not('equipment_type', 'is', null);

    const uniqueCategories = [...new Set(categories?.map(c => c.category))].filter(Boolean);
    const uniqueEquipmentTypes = [...new Set(equipmentTypes?.map(e => e.equipment_type))].filter(Boolean);

    return NextResponse.json({
      results: faultCodes || [],
      filters: {
        categories: uniqueCategories,
        equipment_types: uniqueEquipmentTypes
      },
      total: faultCodes?.length || 0
    });

  } catch (error: any) {
    console.error('Fault codes API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const brand_slug = searchParams.get('brand_slug');

    if (!brand_slug) {
      return NextResponse.json({ error: 'Brand slug is required' }, { status: 400 });
    }

    const db = supabase();

    // Get all fault codes for the brand (for initial load)
    const { data: faultCodes, error } = await db
      .from('fault_codes')
      .select('*')
      .eq('brand_slug', brand_slug)
      .order('severity', { ascending: false })
      .order('code', { ascending: true })
      .limit(20); // Initial load limit

    if (error) {
      console.error('Fault codes GET error:', error);
      return NextResponse.json({ error: 'Failed to load fault codes' }, { status: 500 });
    }

    // Get filter options
    const { data: categories } = await db
      .from('fault_codes')
      .select('category')
      .eq('brand_slug', brand_slug)
      .not('category', 'is', null);

    const { data: equipmentTypes } = await db
      .from('fault_codes')
      .select('equipment_type')
      .eq('brand_slug', brand_slug)
      .not('equipment_type', 'is', null);

    const uniqueCategories = [...new Set(categories?.map(c => c.category))].filter(Boolean);
    const uniqueEquipmentTypes = [...new Set(equipmentTypes?.map(e => e.equipment_type))].filter(Boolean);

    return NextResponse.json({
      results: faultCodes || [],
      filters: {
        categories: uniqueCategories,
        equipment_types: uniqueEquipmentTypes
      },
      total: faultCodes?.length || 0
    });

  } catch (error: any) {
    console.error('Fault codes API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
