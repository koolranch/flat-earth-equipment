'use client';

import { useState } from 'react';

interface AcceptEnterpriseInviteProps {
  token: string;
  orgName: string;
  courseTitle: string | null;
  userEmail: string;
  inviteEmail: string;
}

export default function AcceptEnterpriseInvite({ 
  token, 
  orgName, 
  courseTitle,
  userEmail,
  inviteEmail 
}: AcceptEnterpriseInviteProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if signed-in email matches invitation email
  const emailMismatch = userEmail.toLowerCase() !== inviteEmail.toLowerCase();

  async function handleAccept() {
    if (loading) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/enterprise/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const result = await response.json();

      if (!result.ok) {
        setError(result.error || 'Failed to accept invitation. Please try again.');
        setLoading(false);
        return;
      }

      // Success - redirect to training or enterprise dashboard
      if (courseTitle) {
        window.location.href = '/training';
      } else {
        window.location.href = '/enterprise/dashboard';
      }

    } catch (err) {
      console.error('Error accepting invitation:', err);
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Email Mismatch Warning */}
      {emailMismatch && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="font-medium text-amber-800 text-sm">Email Mismatch</h3>
              <p className="text-amber-700 text-sm mt-1">
                You're signed in as <span className="font-mono">{userEmail}</span>, but this invitation was sent to <span className="font-mono">{inviteEmail}</span>.
              </p>
              <p className="text-amber-600 text-xs mt-2">
                You can still accept, but your account email ({userEmail}) will be used.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <div className="font-medium">Error</div>
          <div>{error}</div>
        </div>
      )}

      {/* Confirmation */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm">
            <p className="text-emerald-800">
              <span className="font-medium">Ready to join {orgName}</span>
            </p>
            {courseTitle && (
              <p className="text-emerald-700 mt-1">
                You'll be enrolled in <span className="font-medium">{courseTitle}</span> and can start training immediately.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Accept Button */}
      <button 
        onClick={handleAccept}
        disabled={loading}
        className="w-full rounded-2xl bg-[#F76511] text-white px-6 py-3 font-medium hover:bg-[#E55A0C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Accepting Invitation...
          </span>
        ) : (
          'Accept Invitation'
        )}
      </button>

      {/* Loading State Info */}
      {loading && (
        <p className="text-xs text-slate-500 text-center">
          Setting up your account and enrolling you in training...
        </p>
      )}

      {/* Decline Option */}
      {!loading && (
        <p className="text-xs text-slate-500 text-center">
          If you weren't expecting this invitation, you can safely close this page.
        </p>
      )}
    </div>
  );
}
