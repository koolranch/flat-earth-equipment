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
  
  // Detect if enterprise login
  const isEnterprise = next?.includes('enterprise');

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          {isEnterprise && (
            <div className="inline-flex items-center gap-2 bg-orange-500/10 backdrop-blur-md border border-orange-500/20 px-4 py-1.5 rounded-full mb-4">
              <span className="text-xs font-semibold text-orange-400">ENTERPRISE TRAINING</span>
            </div>
          )}
          <h1 className="text-3xl font-bold text-white mb-2">
            {isEnterprise ? 'Enterprise Dashboard Access' : 'Welcome Back'}
          </h1>
          <p className="text-slate-300">
            {isEnterprise ? 'Sign in to manage your team\'s certifications' : 'Sign in to continue your training'}
          </p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-xl text-red-200 text-sm">
            {error}
          </div>
        )}
        
        <form action={signInWithPasswordAction} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl space-y-6">
          <input type="hidden" name="next" value={next} />
          
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
          
          <div>
            <label htmlFor="password" className="text-sm font-medium text-white mb-2 block">
              Password
            </label>
            <input 
              id="password"
              name="password" 
              type="password" 
              required 
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#F76511] focus:border-transparent transition-all"
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-gradient-to-b from-orange-500 to-orange-600 px-8 py-4 rounded-xl font-semibold text-white shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
          >
            {isEnterprise ? 'Access Dashboard' : 'Sign In'}
          </button>
          
          <div className="flex flex-col gap-3 text-center text-sm">
            <a 
              href="/forgot-password" 
              className="text-white/70 hover:text-white font-medium transition-colors"
            >
              Forgot your password?
            </a>
            <div className="border-t border-white/10 pt-3">
              <span className="text-white/60">Need an account? </span>
              <a 
                href="/safety" 
                className="text-[#F76511] hover:text-orange-400 font-medium transition-colors"
              >
                Get training access
              </a>
            </div>
          </div>
        </form>
        
        <div className="mt-6 text-center text-xs text-white/50">
          <p>OSHA-compliant forklift certification training</p>
        </div>
      </div>
    </main>
  );
}