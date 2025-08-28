// lib/admin/orgs.server.ts
import 'server-only';
import { supabaseServer } from '@/lib/supabase/server';
import { randomBytes } from 'node:crypto';

export async function createOrg(name: string) {
  const sb = supabaseServer();
  const { data: user } = await sb.auth.getUser();
  if (!user?.user) throw new Error('Not authenticated');
  const { data: org, error } = await sb.from('orgs').insert({ name, created_by: user.user.id }).select('id').single();
  if (error) throw error;
  await sb.from('org_members').insert({ org_id: org.id, user_id: user.user.id, role: 'owner' });
  return org.id as string;
}

export async function createInvitation(orgId: string, email: string, role: 'owner'|'trainer'|'learner' = 'learner') {
  const sb = supabaseServer();
  const token = randomBytes(16).toString('hex');
  const { data: user } = await sb.auth.getUser();
  if (!user?.user) throw new Error('Not authenticated');
  const { error } = await sb.from('invitations').insert({ org_id: orgId, email, role, token, invited_by: user.user.id });
  if (error) throw error;
  return { token };
}

export async function acceptInvitation(token: string) {
  const sb = supabaseServer();
  const { data: user } = await sb.auth.getUser();
  if (!user?.user) throw new Error('Not authenticated');
  const { data, error } = await sb.rpc('accept_invitation', { p_token: token });
  if (error) throw error;
  return !!data;
}

export async function listMembers(orgId: string) {
  const sb = supabaseServer();
  const { data, error } = await sb.from('org_members').select('user_id, role, created_at').eq('org_id', orgId).order('created_at',{ascending:false});
  if (error) throw error;
  return data;
}
