"use server";
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';

export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get('email') || '').trim();

  if (!email) {
    redirect('/forgot-password?error=Please+enter+your+email+address');
  }

  const supabase = createServerClient();
  
  // Send password reset email
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  });
  
  if (error) {
    redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`);
  }
  
  redirect('/forgot-password?success=true');
}
