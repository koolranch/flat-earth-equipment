import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type PracticalEvaluationBody = {
  enrollment_id?: string;
  enrollmentId?: string;
  trainee_user_id?: string;
  traineeUserId?: string;
  evaluator_name?: string;
  evaluatorName?: string;
  evaluator_title?: string;
  evaluatorTitle?: string;
  site_location?: string;
  siteLocation?: string;
  evaluation_date?: string;
  evaluationDate?: string;
  truck_type?: string;
  truckType?: string;
  notes?: string;
  practical_pass?: boolean;
  practicalPass?: boolean;
  signature_url?: string;
  signatureUrl?: string;
  checklist?: unknown;
};

function readString(...values: Array<unknown>): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function readBoolean(...values: Array<unknown>): boolean | null {
  for (const value of values) {
    if (typeof value === 'boolean') {
      return value;
    }
  }

  return null;
}

export async function POST(req: Request) {
  const sb = supabaseServer();
  const svc = supabaseService();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const body = (await req.json()) as PracticalEvaluationBody;
  const enrollmentId = readString(body.enrollment_id, body.enrollmentId);
  const evaluatorName = readString(body.evaluator_name, body.evaluatorName);

  if (!enrollmentId || !evaluatorName) {
    return NextResponse.json(
      { ok: false, error: 'missing_required_fields' },
      { status: 400 }
    );
  }

  const { data: enrollment, error: enrollmentError } = await svc
    .from('enrollments')
    .select('id, user_id')
    .eq('id', enrollmentId)
    .maybeSingle();

  if (enrollmentError || !enrollment || enrollment.user_id !== user.id) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  const signatureUrl = readString(body.signature_url, body.signatureUrl);
  const payload: Record<string, unknown> = {
    enrollment_id: enrollmentId,
    trainee_user_id: enrollment.user_id,
    evaluator_name: evaluatorName,
    evaluator_title: readString(body.evaluator_title, body.evaluatorTitle),
    site_location: readString(body.site_location, body.siteLocation),
    evaluation_date:
      readString(body.evaluation_date, body.evaluationDate) ||
      new Date().toISOString().slice(0, 10),
    truck_type: readString(body.truck_type, body.truckType),
    notes: readString(body.notes),
    practical_pass: readBoolean(body.practical_pass, body.practicalPass) ?? false,
    checklist: body.checklist ?? null,
    created_by: user.id,
  };

  if (signatureUrl) {
    payload.signature_url = signatureUrl;
    payload.evaluator_signature_url = signatureUrl;
  }

  const { data: row, error } = await svc
    .from('employer_evaluations')
    .upsert(payload, { onConflict: 'enrollment_id' })
    .select('*')
    .maybeSingle();

  if (error || !row) {
    return NextResponse.json(
      { ok: false, error: error?.message || 'upsert_failed' },
      { status: 500 }
    );
  }

  if (payload.practical_pass === true) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/cert/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollment_id: enrollmentId }),
      });
    } catch (certError) {
      console.error('Certificate regeneration error:', certError);
    }
  }

  return NextResponse.json({ ok: true, row });
}
