// app/records/page.tsx
import React from "react";
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

async function getUserEnrollmentsWithEvals() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, 
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      }
    }
  );

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/login');
  }

  // Query enrollments with courses and employer evaluations
  const { data: enrollments, error } = await supabase
    .from('enrollments')
    .select(`
      id,
      progress_pct,
      passed,
      created_at,
      courses!inner(
        title
      ),
      employer_evaluations(
        practical_pass,
        evaluation_date,
        evaluator_name
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching enrollments:', error);
    return [];
  }

  // Transform data to match expected interface
  return enrollments?.map(enrollment => ({
    courseTitle: enrollment.courses?.title || 'Unknown Course',
    progressPct: Math.round(enrollment.progress_pct || 0),
    examScore: enrollment.passed ? 100 : null, // Since we only have pass/fail
    eval: enrollment.employer_evaluations?.[0] ? {
      practical_pass: enrollment.employer_evaluations[0].practical_pass,
      evaluation_date: enrollment.employer_evaluations[0].evaluation_date,
      evaluator_name: enrollment.employer_evaluations[0].evaluator_name
    } : null
  })) || [];
}

export default async function RecordsPage() {
  const enrollments = await getUserEnrollmentsWithEvals();

  return (
    <main className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold text-[#0F172A]">Your Training Records</h1>
      
      {enrollments.length === 0 ? (
        <div className="mt-8 text-center">
          <p className="text-slate-600">No training records found.</p>
          <p className="text-sm text-slate-500 mt-2">
            Complete a course to see your training records here.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-4">
          {enrollments.map((e: any, i: number) => (
            <section key={i} className="rounded-2xl border border-slate-200 p-4 shadow-lg">
              <h2 className="text-lg font-semibold text-[#0F172A]">{e.courseTitle}</h2>
              <p className="text-sm text-slate-600">Progress: {e.progressPct ?? 0}%</p>
              {e.examScore != null && (
                <p className="text-sm text-slate-600">Exam score: {e.examScore}%</p>
              )}
              <div className="mt-2">
                <span className="text-sm font-medium">Employer Evaluation:</span>{" "}
                {e.eval ? (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    e.eval.practical_pass 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {e.eval.practical_pass ? "Passed" : "Failed"}
                    {e.eval.evaluation_date && ` on ${new Date(e.eval.evaluation_date).toLocaleDateString()}`}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                )}
              </div>
              {e.eval?.evaluator_name && (
                <p className="text-xs text-slate-500 mt-1">
                  Evaluated by: {e.eval.evaluator_name}
                </p>
              )}
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
