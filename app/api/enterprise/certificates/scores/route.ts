// Enterprise Certificate Scores API
// Returns scores from certificates for given user IDs
// Safe read-only operation - does not modify any data

import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { getAuthUser } from '@/lib/supabase/mobile-auth';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { user } = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { user_ids, org_id } = body;

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return NextResponse.json({
        ok: true,
        scores: []
      });
    }

    const svc = supabaseService();
    let allowedOrgIds: string[] = [];

    if (org_id) {
      const { data: membership } = await svc
        .from('org_members')
        .select('org_id')
        .eq('org_id', org_id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!membership) {
        return NextResponse.json({ ok: false, error: 'Access denied' }, { status: 403 });
      }
      allowedOrgIds = [org_id];
    } else {
      const { data: memberships } = await svc
        .from('org_members')
        .select('org_id')
        .eq('user_id', user.id);
      allowedOrgIds = (memberships || []).map((membership) => membership.org_id).filter(Boolean);
    }

    if (allowedOrgIds.length === 0) {
      return NextResponse.json({ ok: true, scores: [] });
    }

    const { data: enrollments } = await svc
      .from('enrollments')
      .select('id, user_id')
      .in('user_id', user_ids)
      .in('org_id', allowedOrgIds);
    const allowedUserIds = Array.from(new Set((enrollments || []).map((enrollment) => enrollment.user_id)));

    if (allowedUserIds.length === 0) {
      return NextResponse.json({ ok: true, scores: [] });
    }
    
    // Fetch certificates for these users
    // certificates.learner_id = the user's id
    const { data: certificates, error } = await svc
      .from('certificates')
      .select('id, learner_id, user_id, score, issue_date, issued_at, course_id, pdf_url, verification_code, verify_code, verifier_code, revoked_at')
      .or(`learner_id.in.(${allowedUserIds.join(',')}),user_id.in.(${allowedUserIds.join(',')})`);

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
    const scoreByUser = new Map<string, {
      user_id: string;
      certificate_id: string;
      score: number;
      issue_date: string | null;
      issued_at: string | null;
      pdf_url: string | null;
      verification_code: string | null;
      verify_code: string | null;
      verifier_code: string | null;
      revoked_at: string | null;
    }>();
    
    (certificates || []).forEach(cert => {
      const certUserId = cert.learner_id || cert.user_id;
      if (!certUserId) return;
      const existing = scoreByUser.get(certUserId);
      
      // Keep the certificate with highest score (or most recent if same score)
      if (!existing || cert.score > existing.score) {
        scoreByUser.set(certUserId, {
          user_id: certUserId,
          certificate_id: cert.id,
          score: cert.score,
          issue_date: cert.issue_date,
          issued_at: cert.issued_at,
          pdf_url: cert.pdf_url,
          verification_code: cert.verification_code,
          verify_code: cert.verify_code,
          verifier_code: cert.verifier_code,
          revoked_at: cert.revoked_at
        });
      }
    });

    // Return scores array matching input user_ids
    const result = allowedUserIds.map(uid => {
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
