// lib/admin/audit.server.ts
import 'server-only';
import { supabaseServer } from '@/lib/supabase/server';

export async function audit(orgId: string, action: string, target: string | null, meta: any = {}) {
  const sb = supabaseServer();
  await sb.from('audit_events').insert({ org_id: orgId, action, target, meta });
}
