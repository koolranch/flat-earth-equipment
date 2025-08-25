import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET() {
  try {
    const db = supabase();
    
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
