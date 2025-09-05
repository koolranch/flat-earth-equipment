import 'server-only';
import { supabaseService } from '@/lib/supabase/service.server';
import { supabaseServer } from '@/lib/supabase/server';

export async function requireStaff(){
  const sb = supabaseServer();
  const svc = supabaseService();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { ok:false as const, code:401 as const };
  const { data } = await svc.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (!data || !['admin','trainer'].includes((data as any).role)) return { ok:false as const, code:403 as const };
  return { ok:true as const, user };
}
