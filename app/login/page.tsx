import { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import { signInWithPasswordAction } from './actions';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to access your Flat Earth Equipment training dashboard and certification records.',
  robots: { index: false, follow: false }, // Auth page
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LoginPage({ searchParams }: { searchParams: { next?: string; error?: string } }) {
  noStore();
  const next = searchParams?.next || '/training';
  const error = searchParams?.error;

  return (
    <div className="mx-auto max-w-sm py-12">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="text-sm text-muted-foreground mt-1">Access your training dashboard</p>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}
      
      <form action={signInWithPasswordAction} className="mt-6 grid gap-3">
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
        Need an account? <a className="underline" href="/safety">Get training access</a>
      </p>
    </div>
  );
}