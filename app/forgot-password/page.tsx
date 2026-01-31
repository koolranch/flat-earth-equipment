import { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import { requestPasswordResetAction } from './actions';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Request a password reset link for your Flat Earth Equipment account.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ForgotPasswordPage({ searchParams }: { searchParams: { success?: string; error?: string } }) {
  noStore();
  const success = searchParams?.success;
  const error = searchParams?.error;

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Reset Your Password</h1>
          <p className="text-slate-300">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 backdrop-blur-sm border border-green-500/30 rounded-xl text-green-200 text-sm">
            Check your email! We've sent you a password reset link.
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-xl text-red-200 text-sm">
            {error}
          </div>
        )}
        
        <form action={requestPasswordResetAction} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl space-y-6">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-white mb-2 block">
              Email Address
            </label>
            <input 
              id="email"
              name="email" 
              type="email" 
              required 
              autoComplete="email"
              placeholder="your@email.com"
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#F76511] focus:border-transparent transition-all"
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-gradient-to-b from-orange-500 to-orange-600 px-8 py-4 rounded-xl font-semibold text-white shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
          >
            Send Reset Link
          </button>
          
          <div className="text-center text-sm">
            <a 
              href="/login" 
              className="text-white/70 hover:text-white font-medium transition-colors"
            >
              ← Back to sign in
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}
