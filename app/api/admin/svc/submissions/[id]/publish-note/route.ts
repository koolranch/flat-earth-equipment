import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';

function checkAuth(req: Request){
  const hdr = req.headers.get('x-admin-key');
  return !!hdr && hdr === process.env.INTERNAL_ADMIN_KEY;
}

export async function POST(req: Request, { params }: { params: { id: string }}){
  if (!checkAuth(req)) return NextResponse.json({error:'Unauthorized'},{status:401});
  
  const supabase = supabaseService();
  
  // Get the original submission
  const { data, error } = await supabase
    .from('svc_user_suggestions')
    .select('*')
    .eq('id', Number(params.id))
    .single();
    
  if (error || !data) return NextResponse.json({error: error?.message || 'Not found'},{status:404});
  
  // Map suggestion_type -> category
  const map: Record<string,string> = { 
    serial_note:'serial', 
    fault_code:'fault', 
    retrieval:'retrieval', 
    plate_location:'plate', 
    guide_feedback:'guide' 
  };
  const category = map[data.suggestion_type] || 'serial';
  const content = data.details || data.title || 'Submitted note';
  
  // Create the public community note
  const { error: e2 } = await supabase.from('svc_public_notes').insert([{
    brand: data.brand,
    category,
    model: data.model || null,
    code: data.code || null,
    content,
    source: data.contact_email || null,
    approved_by: 'admin'
  }]);
  
  if (e2) return NextResponse.json({error:e2.message},{status:500});
  
  return NextResponse.json({ok:true});
}
