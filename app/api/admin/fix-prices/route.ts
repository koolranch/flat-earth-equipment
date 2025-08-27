import { supabaseService } from '@/lib/supabase/service';
import { NextResponse } from 'next/server';

const supabase = supabaseService();

export async function POST() {
  try {
    const { error } = await supabase.rpc('fix_part_prices');
    
    if (error) {
      console.error('Error fixing prices:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in fix-prices endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 