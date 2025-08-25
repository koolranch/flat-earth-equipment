import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// Validation schema for parts lead submission
const partsLeadSchema = z.object({
  brand_slug: z.string().min(1, 'Brand is required'),
  equipment_type: z.string().optional(),
  model: z.string().optional(),
  serial_number: z.string().optional(),
  part_description: z.string().min(1, 'Part description is required'),
  contact_name: z.string().min(1, 'Name is required'),
  contact_email: z.string().email('Valid email is required'),
  contact_phone: z.string().optional(),
  company_name: z.string().optional(),
  notes: z.string().optional(),
  urgency: z.enum(['low', 'medium', 'high', 'emergency']).default('medium'),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = partsLeadSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationResult.error.errors 
      }, { status: 400 });
    }

    const leadData = validationResult.data;
    const db = supabase();

    // Get request metadata
    const userAgent = request.headers.get('user-agent') || '';
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip');

    // Insert lead into database
    const { data: lead, error } = await db
      .from('parts_leads')
      .insert({
        ...leadData,
        user_agent: userAgent,
        ip_address: ip,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Parts lead insertion error:', error);
      return NextResponse.json({ error: 'Failed to submit lead' }, { status: 500 });
    }

    // TODO: Add email notification logic here
    // await sendLeadNotification(lead);

    return NextResponse.json({ 
      success: true, 
      message: 'Parts request submitted successfully! We\'ll contact you within 24 hours.',
      lead_id: lead.id 
    });

  } catch (error: any) {
    console.error('Parts lead API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    // This endpoint is for admin/internal use only
    const { searchParams } = new URL(request.url);
    const brand_slug = searchParams.get('brand_slug');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const db = supabase();
    let query = db
      .from('parts_leads')
      .select('*')
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (brand_slug) {
      query = query.eq('brand_slug', brand_slug);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: leads, error } = await query;

    if (error) {
      console.error('Parts leads GET error:', error);
      return NextResponse.json({ error: 'Failed to load leads' }, { status: 500 });
    }

    // Get summary statistics
    const { data: stats } = await db
      .from('parts_leads')
      .select('status, urgency')
      .eq('brand_slug', brand_slug || '');

    const statusCounts = stats?.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const urgencyCounts = stats?.reduce((acc, lead) => {
      acc[lead.urgency] = (acc[lead.urgency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return NextResponse.json({
      leads: leads || [],
      stats: {
        by_status: statusCounts,
        by_urgency: urgencyCounts,
        total: stats?.length || 0
      },
      pagination: {
        limit,
        offset,
        has_more: (leads?.length || 0) === limit
      }
    });

  } catch (error: any) {
    console.error('Parts leads API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
