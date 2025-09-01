import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const sb = supabaseServer();
  const svc = supabaseService();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  
  const { data: prof } = await sb.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (!prof || !['trainer', 'admin'].includes(prof.role)) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { 
    enrollment_id, 
    evaluator_name, 
    evaluator_title, 
    site_location, 
    evaluation_date, 
    truck_type, 
    notes, 
    practical_pass, 
    signature_data_url 
  } = body || {};
  
  if (!enrollment_id) return NextResponse.json({ ok: false, error: 'missing_enrollment_id' }, { status: 400 });

  // Optional signature upload
  let evaluator_signature_url: string | null = null;
  if (signature_data_url && typeof signature_data_url === 'string' && signature_data_url.startsWith('data:image/')) {
    try {
      const base64 = signature_data_url.split(',')[1];
      const bytes = Buffer.from(base64, 'base64');
      const path = `${enrollment_id}-${Date.now()}.png`;
      const up = await svc.storage.from('eval-signatures').upload(path, bytes, { 
        contentType: 'image/png', 
        upsert: true 
      });
      if (!up.error) {
        const { data: pub } = svc.storage.from('eval-signatures').getPublicUrl(path);
        evaluator_signature_url = pub?.publicUrl || null;
      }
    } catch (error) {
      console.error('Signature upload error:', error);
    }
  }

  // Upsert evaluation row
  const payload: any = {
    enrollment_id,
    evaluator_name: evaluator_name || null,
    evaluator_title: evaluator_title || null,
    site_location: site_location || null,
    evaluation_date: evaluation_date || new Date().toISOString().slice(0, 10),
    truck_type: truck_type || null,
    notes: notes || null,
    practical_pass: !!practical_pass,
    created_by: user.id
  };
  
  if (evaluator_signature_url) payload.evaluator_signature_url = evaluator_signature_url;

  const { error: e } = await svc.from('employer_evaluations').upsert(payload, { onConflict: 'enrollment_id' });
  if (e) return NextResponse.json({ ok: false, error: e.message }, { status: 500 });

  // If pass, refresh certificate (best effort)
  if (practical_pass) {
    try { 
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/cert/issue`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ enrollment_id }) 
      }); 
    } catch (error) {
      console.error('Certificate regeneration error:', error);
    }
  }

  return NextResponse.json({ ok: true, evaluator_signature_url });
}
