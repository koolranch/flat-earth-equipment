import 'server-only';
import { supabaseService } from '@/lib/supabase/service.server';

export async function auditLog(params: { actor_id?: string|null; action: string; entity?: string|null; entity_id?: string|null; meta?: Record<string,any>; ip?: string|null; ua?: string|null }){
  try {
    const svc = supabaseService();
    await svc.from('audit_logs').insert({
      actor_user_id: params.actor_id||null,
      action: params.action,
      entity: params.entity||null,
      entity_id: params.entity_id||null,
      meta: params.meta||{},
      ip: params.ip||null,
      ua: params.ua||null
    });
  } catch (e){ console.error('[auditLog] failed', e); }
}
