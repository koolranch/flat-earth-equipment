import { unstable_noStore as noStore } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import { safeNext } from '@/lib/auth/nextParam';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LoginPage({ searchParams }: { searchParams: { next?: string; error?: string } }) {
  noStore();
  const next = searchParams?.next || '/training';
  const error = searchParams?.error;

  async function handleSignIn(formData: FormData) {
    'use server';
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');
    const nextRaw = String(formData.get('next') || '/training');
    const nextPath = safeNext(nextRaw) || '/training';

    const supabase = supabaseServer();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      redirect(`/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(nextPath)}`);
    }
    
    redirect(nextPath);
  }

  return (
    <div className="mx-auto max-w-sm py-12">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="text-sm text-muted-foreground mt-1">Access your training dashboard</p>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}
      
      <form action={handleSignIn} className="mt-6 grid gap-3">
        <input type="hidden" name="next" value={next} />
        <label className="grid gap-1">
          <span className="text-sm">Email</span>
          <input name="email" type="email" required className="border rounded px-3 py-2" />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Password</span>
          <input name="password" type="password" required className="border rounded px-3 py-2" />
        </label>
        <button type="submit" className="btn-primary">Sign in</button>
      </form>
      
      <p className="text-xs text-muted-foreground mt-4">
        If you loop back here, visit <a className="underline" href="/debug/auth">/debug/auth</a> to verify your session.
      </p>
      
      <p className="text-xs text-muted-foreground mt-2">
        Need an account? <a className="underline" href="/training/pricing">Get training access</a>
      </p>
    </div>
  );
}