export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';

export async function GET() {
  try {
    const db = supabaseService();
    
    const { data, error } = await db
      .from('karcher_models')
      .select('model_code')
      .order('model_code', { ascending: true });

    if (error) {
      console.error('Error fetching Kärcher models:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const models = data?.map(row => row.model_code) || [];
    
    return NextResponse.json({ models });

  } catch (e: any) {
    console.error('API error:', e);
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
