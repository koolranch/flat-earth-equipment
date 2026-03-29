import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request){
  try {
    const body = await req.json();
    const { dataUrl, enrollment_id } = body as {
      dataUrl: string;
      enrollment_id: string;
    };

    const sbAuth = supabaseServer();
    const { data: { user } } = await sbAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ ok:false, error:'unauthorized' }, { status:401 });
    }
    
    if (!enrollment_id || !dataUrl || !dataUrl.startsWith('data:image/')) {
      return NextResponse.json({ ok:false, error:'invalid' }, { status:400 });
    }
    
    const sb = supabaseService();
    const { data: enrollment, error: enrollmentError } = await sb
      .from('enrollments')
      .select('id, user_id')
      .eq('id', enrollment_id)
      .maybeSingle();

    if (enrollmentError || !enrollment || enrollment.user_id !== user.id) {
      return NextResponse.json({ ok:false, error:'forbidden' }, { status:403 });
    }

    const bucket = process.env.EVAL_BUCKET || 'eval-signatures';
    
    // Ensure bucket exists & is public
    try { 
      await sb.storage.createBucket(bucket, { public: true }); 
    } catch {
      // Bucket might already exist, continue
    }
    
    // Convert base64 to buffer
    const png = Buffer.from(dataUrl.split(',')[1], 'base64');
    const key = `${enrollment_id}/trainee-${crypto.randomUUID()}.png`;
    
    // Upload to Supabase Storage
    const { error } = await sb.storage
      .from(bucket)
      .upload(key, png, { 
        contentType: 'image/png', 
        upsert: false 
      });
    
    if (error) return NextResponse.json({ ok:false, error: error.message }, { status:400 });
    
    // Get public URL
    const { data: pub } = sb.storage.from(bucket).getPublicUrl(key);
    
    return NextResponse.json({ ok:true, url: pub.publicUrl, key });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:String(e) }, { status:500 });
  }
}
