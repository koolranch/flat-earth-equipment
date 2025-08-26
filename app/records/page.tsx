// app/records/page.tsx
import React from "react";
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import RecordsContent from './RecordsContent';

async function getUserData() {
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

  // Query certificates
  const { data: certificates, error: certError } = await supabase
    .from('certificates')
    .select(`
      id,
      course_id,
      issue_date,
      score,
      verifier_code,
      courses!inner(
        title
      )
    `)
    .eq('learner_id', user.id)
    .order('issue_date', { ascending: false });

  if (error) {
    console.error('Error fetching enrollments:', error);
  }

  if (certError) {
    console.error('Error fetching certificates:', certError);
  }

  // Transform enrollments data
  const transformedEnrollments = enrollments?.map((enrollment: any) => ({
    courseTitle: enrollment.courses?.title || 'Unknown Course',
    progressPct: Math.round(enrollment.progress_pct || 0),
    examScore: enrollment.passed ? 100 : null, // Since we only have pass/fail
    eval: enrollment.employer_evaluations?.[0] ? {
      practical_pass: enrollment.employer_evaluations[0].practical_pass,
      evaluation_date: enrollment.employer_evaluations[0].evaluation_date,
      evaluator_name: enrollment.employer_evaluations[0].evaluator_name
    } : null
  })) || [];

  // Transform certificates data
  const transformedCertificates = certificates?.map((cert: any) => ({
    id: cert.id,
    courseTitle: cert.courses?.title || 'Unknown Course',
    issueDate: cert.issue_date,
    score: cert.score,
    verifierCode: cert.verifier_code
  })) || [];

  return {
    enrollments: transformedEnrollments,
    certificates: transformedCertificates
  };
}

export default async function RecordsPage() {
  const { enrollments, certificates } = await getUserData();

  return <RecordsContent enrollments={enrollments} certificates={certificates} />;
}
