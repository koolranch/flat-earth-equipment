'use client';
import { useState } from 'react';
import Link from 'next/link';
import { signInWithPasswordAction } from '@/app/login/actions';

interface ClaimSignupProps {
  token: string;
  email: string;
}

/**
 * Self-serve account creation for invited operators. One submit creates the
 * account (via /api/claim/register), claims the seat, then signs them in and
 * lands them on /claim/success.
 */
export default function ClaimSignup({ token, email }: ClaimSignupProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountExists, setAccountExists] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your first and last name for your certificate.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/claim/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          password,
        }),
      });
      const result = await response.json();

      if (!result.ok) {
        if (result.error === 'account_exists') {
          setAccountExists(true);
          setLoading(false);
          return;
        }
        const messages: Record<string, string> = {
          invitation_expired: 'This invitation has expired. Ask your trainer to send a new one.',
          already_claimed: 'This invitation was already claimed. Try signing in instead.',
          no_seats_available: 'No seats are available on this plan. Ask your trainer to add seats.',
          weak_password: 'Password must be at least 8 characters.',
        };
        setError(messages[result.error] || 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      // Account created and seat claimed — sign in and continue
      const fd = new FormData();
      fd.set('email', email);
      fd.set('password', password);
      fd.set('next', '/claim/success');
      await signInWithPasswordAction(fd);
    } catch {
      // If auto sign-in fails, the account and seat still exist
      window.location.href = `/login?next=${encodeURIComponent('/claim/success')}`;
    }
  }

  if (accountExists) {
    return (
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        <p className="font-medium mb-1">You already have an account</p>
        <p className="mb-3">
          An account exists for <span className="font-mono">{email}</span>. Sign in to claim your
          seat.
        </p>
        <Link
          href={`/login?next=${encodeURIComponent(`/claim/${token}`)}`}
          className="inline-block rounded-xl bg-[#F76511] text-white px-4 py-2 font-medium hover:bg-[#E55A0C] transition-colors"
        >
          Sign In to Continue
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="font-semibold text-slate-900 mb-1">Create your account</h3>
        <p className="text-sm text-slate-600 mb-4">
          Your name will appear on your operator certificate.
        </p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
              required
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-[#F76511] focus:ring-2 focus:ring-orange-100 focus:outline-none disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Smith"
              required
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-[#F76511] focus:ring-2 focus:ring-orange-100 focus:outline-none disabled:opacity-50"
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            readOnly
            disabled
            className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-slate-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Choose a Password *
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
            minLength={8}
            autoComplete="new-password"
            disabled={loading}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-[#F76511] focus:ring-2 focus:ring-orange-100 focus:outline-none disabled:opacity-50"
          />
          <p className="mt-1 text-xs text-slate-500">
            You'll use this email and password to sign in to the app.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !firstName.trim() || !lastName.trim() || password.length < 8}
        className="w-full rounded-2xl bg-[#F76511] text-white px-6 py-3 font-medium hover:bg-[#E55A0C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Setting Up Your Seat...
          </span>
        ) : (
          'Create Account & Claim Seat'
        )}
      </button>

      <p className="text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link
          href={`/login?next=${encodeURIComponent(`/claim/${token}`)}`}
          className="text-[#F76511] font-medium hover:underline"
        >
          Sign in instead
        </Link>
      </p>
    </form>
  );
}
