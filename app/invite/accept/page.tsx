import { supabaseServer } from '@/lib/supabase/server';
import AcceptEnterpriseInvite from '@/components/enterprise/AcceptEnterpriseInvite';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Accept Invitation | Flat Earth Safety',
  description: 'Accept your invitation to join your organization for OSHA-compliant forklift operator training.',
};

export default async function AcceptInvitePage({ 
  searchParams 
}: { 
  searchParams: { token?: string } 
}) {
  const token = searchParams.token;
  
  if (!token) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <h1 className="text-xl font-bold text-red-800 mb-2">Invalid Link</h1>
          <p className="text-red-700 mb-4">
            This invitation link is missing required information.
          </p>
          <Link 
            href="/" 
            className="inline-block rounded-xl border px-4 py-2 text-sm hover:bg-white transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </main>
    );
  }

  const sb = supabaseServer();
  
  // Get current user
  const { data: { user } } = await sb.auth.getUser();

  // Fetch invitation details using service client (invitations may have RLS restrictions)
  const { data: inv, error: invError } = await sb
    .from('invitations')
    .select(`
      id, 
      email, 
      role,
      expires_at, 
      accepted_at,
      course_id,
      org_id,
      orgs(name),
      courses(title, slug)
    `)
    .eq('token', token)
    .maybeSingle();

  // Handle invalid token
  if (invError || !inv) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <h1 className="text-xl font-bold text-red-800 mb-2">Invalid Invitation</h1>
          <p className="text-red-700 mb-4">
            This invitation link is invalid or has been removed.
          </p>
          <div className="flex gap-2 justify-center">
            <Link 
              href="/safety" 
              className="rounded-xl border px-4 py-2 text-sm hover:bg-white transition-colors"
            >
              Learn More
            </Link>
            <Link 
              href="/training" 
              className="rounded-2xl bg-[#F76511] text-white px-4 py-2 text-sm hover:bg-[#E55A0C] transition-colors"
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
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <h1 className="text-xl font-bold text-amber-800 mb-2">Invitation Expired</h1>
          <p className="text-amber-700 mb-2">
            This invitation expired on {new Date(inv.expires_at).toLocaleDateString()}.
          </p>
          <p className="text-amber-600 text-sm mb-4">
            Contact your organization administrator to request a new invitation.
          </p>
          <Link 
            href="/contact" 
            className="inline-block rounded-2xl bg-[#F76511] text-white px-4 py-2 text-sm hover:bg-[#E55A0C] transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </main>
    );
  }

  // Check if invitation has already been accepted
  if (inv.accepted_at) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-blue-200 bg-blue-50 p-6 text-center">
          <h1 className="text-xl font-bold text-blue-800 mb-2">Already Accepted</h1>
          <p className="text-blue-700 mb-2">
            This invitation was accepted on {new Date(inv.accepted_at).toLocaleDateString()}.
          </p>
          <p className="text-blue-600 text-sm mb-4">
            If this was you, sign in to access your training.
          </p>
          <div className="flex gap-2 justify-center">
            <Link 
              href="/login" 
              className="rounded-xl border px-4 py-2 text-sm hover:bg-white transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/training" 
              className="rounded-2xl bg-[#F76511] text-white px-4 py-2 text-sm hover:bg-[#E55A0C] transition-colors"
            >
              Go to Training
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Get org and course details
  const org = Array.isArray(inv.orgs) ? inv.orgs[0] : inv.orgs;
  const course = Array.isArray(inv.courses) ? inv.courses[0] : inv.courses;
  const orgName = org?.name || 'Your Organization';
  const courseTitle = course?.title || null;

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          {/* Header */}
          <header className="text-center mb-6">
            <div className="w-16 h-16 bg-[#F76511]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#F76511]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              You're Invited!
            </h1>
            <p className="text-slate-600">
              <span className="font-semibold text-[#F76511]">{orgName}</span> has invited you to join their team
            </p>
          </header>

          {/* What's Included */}
          <section className="mb-6 p-4 rounded-xl bg-slate-50">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">What's Included</h2>
            <ul className="space-y-2 text-sm text-slate-600">
              {courseTitle && (
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Training: <span className="font-medium">{courseTitle}</span></span>
                </li>
              )}
              <li className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                OSHA 29 CFR 1910.178(l) compliant training
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                Interactive modules and knowledge assessments
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                QR-verifiable certificate upon completion
              </li>
            </ul>
          </section>

          {/* Invitation Details */}
          <section className="mb-6 p-4 rounded-xl border border-slate-200">
            <h2 className="text-sm font-semibold text-slate-700 mb-2">Invitation Details</h2>
            <div className="space-y-1 text-sm">
              <p className="text-slate-600">
                Email: <span className="font-mono text-slate-800">{inv.email}</span>
              </p>
              {inv.expires_at && (
                <p className="text-slate-500">
                  Expires: {new Date(inv.expires_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </section>

          {/* Action Section */}
          <section>
            {!user ? (
              <div className="text-center space-y-4">
                <p className="text-sm text-slate-600">
                  Please sign in or create an account to accept your invitation
                </p>
                <Link 
                  href={`/login?next=/invite/accept?token=${token}`}
                  className="block w-full rounded-2xl bg-[#F76511] text-white px-6 py-3 font-medium hover:bg-[#E55A0C] transition-colors text-center"
                >
                  Sign In to Continue
                </Link>
                <p className="text-xs text-slate-500">
                  Don't have an account? You can create one after clicking Sign In.
                </p>
              </div>
            ) : (
              <AcceptEnterpriseInvite 
                token={token} 
                orgName={orgName}
                courseTitle={courseTitle}
                userEmail={user.email || ''}
                inviteEmail={inv.email}
              />
            )}
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-6 text-center text-xs text-slate-500">
          <p>Powered by Flat Earth Safety</p>
          <p>Modern Forklift Operator Training</p>
        </footer>
      </div>
    </main>
  );
}
