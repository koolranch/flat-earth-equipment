import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function requireAuthServer(nextPath: string = '/training', loginPath: string = '/login') {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`${loginPath}?next=${encodeURIComponent(nextPath)}`);
  return user; // has id, email
}
