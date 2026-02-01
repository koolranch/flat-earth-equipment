// Enterprise Certificate Scores API
// Returns scores from certificates for given user IDs
// Safe read-only operation - does not modify any data

import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { user_ids } = body;

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return NextResponse.json({
        ok: true,
        scores: []
      });
    }

    // Use service client to bypass RLS (read-only operation)
    const svc = supabaseService();
    
    // Fetch certificates for these users
    // certificates.learner_id = the user's id
    const { data: certificates, error } = await svc
      .from('certificates')
      .select('learner_id, score, issue_date, course_id')
      .in('learner_id', user_ids);

    if (error) {
      console.error('Certificates query error:', error);
      // Return empty on error - roster will still work, just no scores
      return NextResponse.json({
        ok: true,
        scores: []
      });
    }

    // Map scores by user_id
    // If user has multiple certificates, take the most recent (highest score as tiebreaker)
    const scoreByUser = new Map<string, { user_id: string; score: number; issue_date: string }>();
    
    (certificates || []).forEach(cert => {
      const existing = scoreByUser.get(cert.learner_id);
      
      // Keep the certificate with highest score (or most recent if same score)
      if (!existing || cert.score > existing.score) {
        scoreByUser.set(cert.learner_id, {
          user_id: cert.learner_id,
          score: cert.score,
          issue_date: cert.issue_date
        });
      }
    });

    // Return scores array matching input user_ids
    const result = user_ids.map(uid => {
      const certScore = scoreByUser.get(uid);
      return certScore || { user_id: uid, score: null };
    });

    return NextResponse.json({
      ok: true,
      scores: result
    });

  } catch (error) {
    console.error('Certificate scores API error:', error);
    // Return empty on error - roster will still work
    return NextResponse.json({
      ok: true,
      scores: []
    });
  }
}
