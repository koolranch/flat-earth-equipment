import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const sb = supabaseServer();
    const svc = supabaseService();
    const { data: { user } } = await sb.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user has trainer/admin role
    const { data: profile } = await sb
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile || !['trainer', 'admin'].includes(profile.role)) {
      return NextResponse.json({ ok: false, error: 'Trainer access required' }, { status: 403 });
    }

    const body = await req.json();
    const { enrollment_id, role, dataUrl } = body;

    if (!enrollment_id || !role || !dataUrl) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
    }

    if (!['evaluator', 'trainee'].includes(role)) {
      return NextResponse.json({ ok: false, error: 'Invalid role' }, { status: 400 });
    }

    if (!dataUrl.startsWith('data:image/')) {
      return NextResponse.json({ ok: false, error: 'Invalid image data' }, { status: 400 });
    }

    const bucket = 'eval-signatures';
    
    // Ensure bucket exists & is public
    try { 
      await svc.storage.createBucket(bucket, { public: true }); 
    } catch {
      // Bucket might already exist, continue
    }
    
    // Convert base64 to buffer
    const base64 = dataUrl.split(',')[1];
    const bytes = Buffer.from(base64, 'base64');
    const key = `${enrollment_id}-${role}-${crypto.randomUUID()}.png`;
    
    // Upload to Supabase Storage
    const { error: uploadError } = await svc.storage
      .from(bucket)
      .upload(key, bytes, { 
        contentType: 'image/png', 
        upsert: false 
      });
    
    if (uploadError) {
      console.error('Signature upload error:', uploadError);
      return NextResponse.json({ ok: false, error: uploadError.message }, { status: 500 });
    }
    
    // Get public URL
    const { data: pub } = svc.storage.from(bucket).getPublicUrl(key);
    
    if (!pub?.publicUrl) {
      return NextResponse.json({ ok: false, error: 'Failed to get public URL' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, url: pub.publicUrl, key });

  } catch (error) {
    console.error('Error in eval/signature:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
