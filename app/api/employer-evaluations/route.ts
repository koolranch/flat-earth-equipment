export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseService } from "@/lib/supabase/service.server";

const Body = z.object({
  enrollmentId: z.string().uuid(),
  evaluatorName: z.string().min(2),
  evaluatorTitle: z.string().optional(),
  siteLocation: z.string().optional(),
  evaluationDate: z.string(), // ISO date
  practicalPass: z.boolean(),
  evaluatorSignature: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = Body.parse(body);

    const supabase = supabaseService();

    const { data: row, error } = await supabase
      .from("employer_evaluations")
      .insert({
        enrollment_id: data.enrollmentId,
        evaluator_name: data.evaluatorName,
        evaluator_title: data.evaluatorTitle,
        site_location: data.siteLocation,
        evaluation_date: data.evaluationDate,
        practical_pass: data.practicalPass,
        evaluator_signature: data.evaluatorSignature,
        notes: data.notes,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ id: row.id }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Invalid request" }, { status: 400 });
  }
}