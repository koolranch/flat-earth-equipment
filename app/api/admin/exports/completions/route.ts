export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';

function csv(rows: any[]): string {
  if (!rows.length) return 'learner_id,course_id,issue_date,score,verifier_code,eval_date,practical_pass\n';
  const head = 'learner_id,course_id,issue_date,score,verifier_code,eval_date,practical_pass\n';
  const body = rows.map(r => [
    r.learner_id, 
    r.course_id, 
    r.issue_date, 
    r.score, 
    r.verifier_code, 
    r.evaluation_date ?? '', 
    r.practical_pass ?? ''
  ].join(','))
    .join('\n');
  return head + body + '\n';
}

export async function GET(req: Request) {
  // Check admin token
  const token = (req.headers.get('x-admin-token') || '').trim();
  if (!token || token !== process.env.ADMIN_API_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');

  const supabase = supabaseService();

  try {
    // Get certificates with date filtering
    let certificatesQuery = supabase
      .from('certificates')
      .select('learner_id, course_id, issue_date, score, verifier_code');

    if (from) {
      certificatesQuery = certificatesQuery.gte('issue_date', from);
    }
    if (to) {
      certificatesQuery = certificatesQuery.lte('issue_date', to);
    }

    const { data: certificates, error: certError } = await certificatesQuery;

    if (certError) {
      return NextResponse.json({ error: certError.message }, { status: 400 });
    }

    if (!certificates || certificates.length === 0) {
      const body = csv([]);
      return new Response(body, { 
        status: 200, 
        headers: { 
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="completions-export.csv"'
        } 
      });
    }

    // Get learner IDs to fetch related evaluations
    const learnerIds = [...new Set(certificates.map(c => c.learner_id))];

    // Fetch employer evaluations for these learners
    // Note: This assumes evaluations are linked via enrollments table
    const { data: evaluations, error: evalError } = await supabase
      .from('employer_evaluations')
      .select(`
        evaluation_date,
        practical_pass,
        enrollments!inner(
          user_id,
          course_id
        )
      `)
      .in('enrollments.user_id', learnerIds);

    if (evalError) {
      console.warn('Could not fetch evaluations:', evalError.message);
    }

    // Create a lookup map for evaluations by learner_id + course_id
    const evalMap = new Map<string, any>();
    if (evaluations) {
      evaluations.forEach((evaluation: any) => {
        const enrollment = evaluation.enrollments;
        const key = `${enrollment.user_id}-${enrollment.course_id}`;
        evalMap.set(key, {
          evaluation_date: evaluation.evaluation_date,
          practical_pass: evaluation.practical_pass
        });
      });
    }

    // Merge certificates with evaluations
    const mergedData = certificates.map(cert => {
      const evalKey = `${cert.learner_id}-${cert.course_id}`;
      const evaluation = evalMap.get(evalKey);
      
      return {
        ...cert,
        evaluation_date: evaluation?.evaluation_date || null,
        practical_pass: evaluation?.practical_pass || null
      };
    });

    const body = csv(mergedData);
    return new Response(body, { 
      status: 200, 
      headers: { 
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="completions-export.csv"'
      } 
    });

  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json({ 
      error: 'Export failed: ' + (error.message || 'Unknown error') 
    }, { status: 500 });
  }
}