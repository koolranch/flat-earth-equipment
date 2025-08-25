import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request){
  try{
    const body = await req.json();
    const required = ['brand','suggestion_type','details'];
    for (const k of required){ if(!body[k] || String(body[k]).trim()==='') return NextResponse.json({error:`Missing ${k}`},{status:400}); }
    // Normalize arrays
    if (body.photos && typeof body.photos === 'string') body.photos = body.photos.split(/[|;]\s*/).filter(Boolean);
    const supabase = createClient(url, key, { auth: { persistSession:false } });
    const { error } = await supabase.from('svc_user_suggestions').insert([{
      brand: body.brand, suggestion_type: body.suggestion_type, model: body.model||null, serial: body.serial||null, code: body.code||null, title: body.title||null, details: body.details, photos: body.photos||null, contact_email: body.contact_email||null
    }]);
    if (error) return NextResponse.json({error: error.message},{status:500});
    return NextResponse.json({ok:true});
  }catch(e:any){ return NextResponse.json({error:e.message||'Bad Request'},{status:400}); }
}
