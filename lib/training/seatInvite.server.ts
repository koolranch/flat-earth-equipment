import 'server-only';
import { supabaseService } from '@/lib/supabase/service.server';

/**
 * Look up a seat invite by its token using the service client. RLS only
 * grants seat_invites SELECT to authenticated users, but invited operators
 * are anonymous — possession of the unguessable token is the authorization.
 */
export async function getSeatInviteByToken(token: string) {
  const svc = supabaseService();
  return svc
    .from('seat_invites')
    .select('id, email, course_id, status, expires_at, claimed_at, note, courses(title)')
    .eq('invite_token', token)
    .maybeSingle();
}
