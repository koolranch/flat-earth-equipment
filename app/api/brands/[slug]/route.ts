import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const db = supabase();

    // Get brand information
    const { data: brand, error: brandError } = await db
      .from('brands')
      .select('*')
      .eq('slug', slug)
      .single();

    if (brandError || !brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    // Get fault codes count for this brand
    const { count: faultCodesCount } = await db
      .from('fault_codes')
      .select('*', { count: 'exact', head: true })
      .eq('brand_slug', slug);

    // Get recent parts leads count (for internal analytics)
    const { count: recentLeadsCount } = await db
      .from('parts_leads')
      .select('*', { count: 'exact', head: true })
      .eq('brand_slug', slug)
      .gte('submitted_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

    const response = {
      ...brand,
      stats: {
        fault_codes_count: faultCodesCount || 0,
        recent_leads_count: recentLeadsCount || 0
      }
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Brand API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { action, tab } = await request.json();

    if (action === 'track_view') {
      const db = supabase();
      
      // Track page view for analytics
      const userAgent = request.headers.get('user-agent') || '';
      const forwarded = request.headers.get('x-forwarded-for');
      const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip');
      const referrer = request.headers.get('referer') || '';

      await db.from('brand_page_views').insert({
        brand_slug: slug,
        tab_name: tab,
        user_agent: userAgent,
        ip_address: ip,
        referrer: referrer
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Brand tracking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
