import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const sb = supabaseServer();
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
    const {
      id,
      enrollment_id,
      evaluator_name,
      evaluator_title,
      site_location,
      evaluation_date,
      practical_pass,
      notes,
      evaluator_signature_url,
      trainee_signature_url,
      competencies
    } = body;

    const evalData = {
      enrollment_id,
      evaluator_name,
      evaluator_title,
      site_location,
      evaluation_date: evaluation_date || null,
      practical_pass: practical_pass === null ? null : Boolean(practical_pass),
      notes,
      evaluator_signature_url,
      trainee_signature_url,
      competencies: competencies || {},
      updated_at: new Date().toISOString()
    };

    let result;

    if (id) {
      // Update existing evaluation
      const { data, error } = await sb
        .from('employer_evaluations')
        .update(evalData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating evaluation:', error);
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      }

      result = data;
    } else {
      // Create new evaluation
      const { data, error } = await sb
        .from('employer_evaluations')
        .insert({ ...evalData, created_at: new Date().toISOString() })
        .select()
        .single();

      if (error) {
        console.error('Error creating evaluation:', error);
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      }

      result = data;
    }

    return NextResponse.json({ ok: true, row: result });

  } catch (error) {
    console.error('Error in eval/save:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
