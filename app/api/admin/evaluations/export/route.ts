import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request){
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  
  // Verify admin export token
  if (!token || token !== process.env.ADMIN_EXPORT_TOKEN) {
    return NextResponse.json({ ok:false, error:'forbidden' }, { status:403 });
  }
  
  const sb = supabaseService();
  
  // Fetch all evaluations with relevant fields
  const { data, error } = await sb
    .from('employer_evaluations')
    .select('id,enrollment_id,trainee_user_id,evaluator_name,evaluator_title,site_location,evaluation_date,practical_pass,signature_url,notes,created_at');
  
  if (error) return NextResponse.json({ ok:false, error: error.message }, { status:400 });
  
  // Create CSV content
  const header = [
    'id',
    'enrollment_id',
    'trainee_user_id',
    'evaluator_name',
    'evaluator_title',
    'site_location',
    'evaluation_date',
    'practical_pass',
    'signature_url',
    'notes',
    'created_at'
  ];
  
  const rows = [
    header.join(','),
    ...(data||[]).map(r=> 
      header.map(h=> 
        JSON.stringify((r as any)[h] ?? '')
      ).join(',')
    )
  ].join('\\n');
  
  return new NextResponse(rows, { 
    headers: { 
      'Content-Type': 'text/csv', 
      'Content-Disposition': 'attachment; filename="evaluations.csv"' 
    } 
  });
}
