"use server";
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { safeNext } from '@/lib/auth/nextParam';

export async function signInWithPasswordAction(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const nextRaw = String(formData.get('next') || '/training');
  const next = safeNext(nextRaw) || '/training';

  const supabase = createServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`);
  }
  
  redirect(next);
}
