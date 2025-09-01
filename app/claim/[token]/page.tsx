import { supabaseService } from '@/lib/supabase/service.server';
import { supabaseServer } from '@/lib/supabase/server';
import AcceptClaim from '@/components/claim/AcceptClaim';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Claim Your Training Seat | Flat Earth Safety',
  description: 'Accept your invitation to join OSHA-compliant forklift operator training.',
};

export default async function ClaimPage({ params }: { params: { token: string } }) {
  const svc = supabaseService();
  const sb = supabaseServer();
  const token = params.token;

  // Fetch invitation details using the token
  const { data: inv, error: invError } = await svc
    .from('seat_invites')
    .select('id, email, course_id, status, expires_at, claimed_at, note, courses(title)')
    .eq('invite_token', token)
    .maybeSingle();

  // Get current user
  const { data: { user } } = await sb.auth.getUser();

  // Handle various error states
  if (invError || !inv) {
    return (
      <main className="container mx-auto p-4 max-w-2xl">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <h1 className="text-xl font-bold text-red-800 mb-2">Invalid Invitation</h1>
          <p className="text-red-700 mb-4">
            This invitation link is invalid or has been removed.
          </p>
          <div className="flex gap-2 justify-center">
            <Link 
              href="/safety" 
              className="rounded-xl border px-4 py-2 text-sm hover:bg-slate-50"
            >
              Learn More
            </Link>
            <Link 
              href="/training" 
              className="rounded-2xl bg-[#F76511] text-white px-4 py-2 text-sm"
            >
              Go to Training
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Check if invitation has expired
  if (inv.expires_at && new Date(inv.expires_at) < new Date()) {
    return (
      <main className="container mx-auto p-4 max-w-2xl">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <h1 className="text-xl font-bold text-amber-800 mb-2">Invitation Expired</h1>
          <p className="text-amber-700 mb-2">
            This invitation expired on {new Date(inv.expires_at).toLocaleDateString()}.
          </p>
          <p className="text-amber-600 text-sm mb-4">
            Contact your trainer to request a new invitation.
          </p>
          <div className="flex gap-2 justify-center">
            <Link 
              href="/safety" 
              className="rounded-xl border px-4 py-2 text-sm hover:bg-slate-50"
            >
              Learn More
            </Link>
            <Link 
              href="/contact" 
              className="rounded-2xl bg-[#F76511] text-white px-4 py-2 text-sm"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Check if invitation has already been claimed
  if (inv.claimed_at) {
    return (
      <main className="container mx-auto p-4 max-w-2xl">
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 text-center">
          <h1 className="text-xl font-bold text-blue-800 mb-2">Already Claimed</h1>
          <p className="text-blue-700 mb-2">
            This invitation was claimed on {new Date(inv.claimed_at).toLocaleDateString()}.
          </p>
          <p className="text-blue-600 text-sm mb-4">
            If this was you, continue to your training dashboard.
          </p>
          <div className="flex gap-2 justify-center">
            <Link 
              href="/login" 
              className="rounded-xl border px-4 py-2 text-sm hover:bg-slate-50"
            >
              Sign In
            </Link>
            <Link 
              href="/training" 
              className="rounded-2xl bg-[#F76511] text-white px-4 py-2 text-sm"
            >
              Go to Training
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Get course details
  const course = Array.isArray(inv.courses) ? inv.courses[0] : inv.courses;
  const courseTitle = course?.title || 'Forklift Operator Training';

  return (
    <main className="container mx-auto p-4 max-w-2xl">
      <div className="rounded-2xl border p-6 bg-white dark:bg-slate-900">
        <header className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white mb-2">
            You're Invited to Training
          </h1>
          <div className="text-slate-600 dark:text-slate-400">
            <p className="text-lg font-medium">{courseTitle}</p>
            <p className="text-sm mt-1">
              Invitation for: <span className="font-mono text-[#F76511]">{inv.email}</span>
            </p>
          </div>
        </header>

        {/* Course Information */}
        <section className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
          <h2 className="text-lg font-semibold mb-3">What's Included</h2>
          <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <li className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span>
              Interactive demos and simulations
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span>
              OSHA 29 CFR 1910.178(l) compliant training
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span>
              Quick knowledge assessments
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span>
              Final certification exam
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span>
              QR-verifiable certificate upon completion
            </li>
          </ul>
        </section>

        {/* Additional Information */}
        {inv.note && (
          <section className="mb-6 p-3 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-900/20">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
              From your trainer:
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">{inv.note}</p>
          </section>
        )}

        {/* Expiry Information */}
        {inv.expires_at && (
          <div className="mb-6 text-center text-sm text-slate-500 dark:text-slate-400">
            This invitation expires on {new Date(inv.expires_at).toLocaleDateString()}
          </div>
        )}

        {/* Action Section */}
        <section className="text-center">
          {!user ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Please sign in to claim your training seat
              </p>
              <Link 
                href={`/login?next=/claim/${token}`}
                className="inline-block rounded-2xl bg-[#F76511] text-white px-6 py-3 font-medium hover:bg-[#E55A0C] transition-colors"
              >
                Sign In to Continue
              </Link>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Don't have an account? You'll be able to create one after signing in.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Ready to start your forklift operator training?
              </p>
              <AcceptClaim token={token} />
              <div className="text-xs text-slate-500 dark:text-slate-400">
                By accepting, you'll be enrolled in the course and can start training immediately.
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>Powered by Flat Earth Safety</p>
        <p>Modern Forklift Operator Training</p>
      </footer>
    </main>
  );
}
