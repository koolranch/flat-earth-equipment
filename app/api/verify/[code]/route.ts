export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service.server";

export async function GET(_: Request, { params }: { params: { code: string } }) {
  const supabase = supabaseService();

  const code = params.code;

  const { data: cert, error } = await supabase
    .from("certificates")
    .select("learner_id, course_id, issue_date, score")
    .eq("verifier_code", code)
    .maybeSingle();

  if (error || !cert) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Optional: fetch learner profile to mask initials, else just return learner_id suffix
  // Replace with your own profile table if available
  const initials = "**"; // customize if you can map learner_id -> name

  return NextResponse.json({
    courseId: cert.course_id,
    learnerInitials: initials,
    issueDate: cert.issue_date,
    score: cert.score
  });
}