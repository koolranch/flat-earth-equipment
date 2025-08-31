import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const sb = supabaseServer();
  
  try {
    const { data: courses, error } = await sb
      .from('courses')
      .select('id, slug, title, description, price_cents')
      .order('title');
      
    if (error) {
      console.error('Courses API error:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      ok: true, 
      data: courses || [] 
    });
  } catch (error: any) {
    console.error('Courses API error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
