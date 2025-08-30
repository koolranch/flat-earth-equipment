import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request){
  try {
    const body = await req.json();
    const { dataUrl } = body as { dataUrl: string };
    
    if (!dataUrl || !dataUrl.startsWith('data:image/')) {
      return NextResponse.json({ ok:false, error:'invalid' }, { status:400 });
    }
    
    const sb = supabaseService();
    const bucket = process.env.EVAL_BUCKET || 'eval-signatures';
    
    // Ensure bucket exists & is public
    try { 
      await sb.storage.createBucket(bucket, { public: true }); 
    } catch {
      // Bucket might already exist, continue
    }
    
    // Convert base64 to buffer
    const png = Buffer.from(dataUrl.split(',')[1], 'base64');
    const key = `sig_${crypto.randomUUID()}.png`;
    
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
