// app/api/certificates/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const Body = z.object({
  learnerId: z.string().uuid(),
  courseId: z.string().uuid(),
  score: z.number().int().min(0),
  moduleIds: z.any().optional(),
});

function makeCode(len = 12) {
  // URL-safe base64 without padding
  return crypto.randomBytes(Math.ceil(len * 0.75)).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, len);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = Body.parse(body);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const verifier_code = makeCode(12);

    const { data: row, error } = await supabase
      .from("certificates")
      .insert({
        learner_id: data.learnerId,
        course_id: data.courseId,
        score: data.score,
        verifier_code,
        module_ids: data.moduleIds ?? null,
      })
      .select("id, verifier_code")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(row, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Invalid request" }, { status: 400 });
  }
}
