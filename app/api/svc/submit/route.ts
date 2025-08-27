import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { notifySubmission } from '@/lib/notify';

export async function POST(req: Request){
  try{
    const body = await req.json();
    const required = ['brand','suggestion_type','details'];
    for (const k of required){ if(!body[k] || String(body[k]).trim()==='') return NextResponse.json({error:`Missing ${k}`},{status:400}); }
    
    // Normalize arrays
    if (body.photos && typeof body.photos === 'string') body.photos = body.photos.split(/[|;]\s*/).filter(Boolean);
    
    // 1) Derive IP for rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
               req.headers.get('x-real-ip') || 
               '0.0.0.0';
    
    const supabase = supabaseService();
    
    // 2) Check rate limit: count submissions for same IP within last hour; block if > 5
    const oneHourAgo = new Date(Date.now() - 60*60*1000).toISOString();
    const { data: recent, error: errR } = await supabase
      .from('svc_user_suggestions')
      .select('id, created_at')
      .gte('created_at', oneHourAgo)
      .eq('ip', ip);
      
    if (!errR && recent && recent.length > 5){
      // Track rate limiting event
      try {
        // We can't access window here, but we can log for monitoring
        console.log(`Rate limited IP: ${ip}`);
      } catch {}
      return NextResponse.json({ error: 'Too many submissions. Please try later.' }, { status: 429 });
    }
    
    // 3) Insert suggestion with IP
    const payload = {
      brand: body.brand, 
      suggestion_type: body.suggestion_type, 
      model: body.model||null, 
      serial: body.serial||null, 
      code: body.code||null, 
      title: body.title||null, 
      details: body.details, 
      photos: body.photos||null, 
      contact_email: body.contact_email||null,
      ip: ip
    };
    
    const { error } = await supabase.from('svc_user_suggestions').insert([payload]);
    if (error) return NextResponse.json({error: error.message},{status:500});
    
    // 4) Notify admin (best-effort)
    try {
      await notifySubmission({ ...payload });
    } catch (e) {
      // Don't fail the submission if notification fails
      console.log('Notification failed:', e);
    }
    
    return NextResponse.json({ok:true});
  }catch(e:any){ return NextResponse.json({error:e.message||'Bad Request'},{status:400}); }
}
