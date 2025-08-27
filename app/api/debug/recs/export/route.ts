import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { parseSpecsFromSlugAudit, bucketKey } from '@/lib/specsAudit';
import { filterGreen } from '@/lib/greenFilter';

export const runtime='nodejs';

export async function GET(_req: NextRequest){
  try {
    const sb = supabaseService();
    
    const { data, error } = await sb
      .from('parts')
      .select('id,slug,name,price_cents')
      .eq('category_slug','battery-chargers')
      .limit(5000);
      
    if(error) {
      return NextResponse.json({ 
        ok:false, 
        error:error.message 
      },{status:500});
    }
    
    // Apply GREEN-only filter to restrict export to FSIP GREEN Series only
    const allData = data || [];
    const greenOnlyData = filterGreen(allData);
    
    const header=['id','slug','name','voltage','current','phase','family','price_cents','bucket'];
    const rows=greenOnlyData.map(p=>{ 
      const s=parseSpecsFromSlugAudit(p.slug); 
      return [
        p.id,
        p.slug,
        p.name,
        s.voltage??'',
        s.current??'',
        s.phase??'',
        s.family??'',
        p.price_cents??'', 
        bucketKey(s)
      ]; 
    });
    
    const csv=[header.join(','),...rows.map(r=>r.join(','))].join('\n');
    
    return new NextResponse(csv,{ 
      headers:{ 
        'Content-Type':'text/csv', 
        'Content-Disposition':'attachment; filename="recs_export.csv"' 
      }
    });
    
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json({ 
      ok: false, 
      error: error.message 
    }, { status: 500 });
  }
}
