'use client';
import { useState } from 'react';

interface AcceptClaimProps {
  token: string;
}

export default function AcceptClaim({ token }: AcceptClaimProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  async function handleAccept() {
    if (loading) return;
    
    // Validate name fields
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your first and last name for your certificate.');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/claim/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token,
          firstName: firstName.trim(),
          lastName: lastName.trim()
        })
      });

      const result = await response.json();

      if (!result.ok) {
        setError(result.error || 'Failed to claim seat. Please try again.');
        setLoading(false);
        return;
      }

      // Success - redirect to training
      window.location.href = '/training';

    } catch (err) {
      console.error('Error claiming seat:', err);
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <div className="font-medium">Error</div>
          <div>{error}</div>
        </div>
      )}
      
      {/* Name Input Fields */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <h3 className="font-semibold text-blue-900 mb-3">Your Information</h3>
        <p className="text-sm text-blue-700 mb-3">
          This name will appear on your forklift operator certificate.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">
              First Name *
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
              required
              disabled={loading}
              className="w-full rounded-lg border border-blue-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Smith"
              required
              disabled={loading}
              className="w-full rounded-lg border border-blue-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
            />
          </div>
        </div>
      </div>
      
      <button 
        onClick={handleAccept}
        disabled={loading || !firstName.trim() || !lastName.trim()}
        className="w-full rounded-2xl bg-[#F76511] text-white px-6 py-3 font-medium hover:bg-[#E55A0C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Claiming Seat...
          </span>
        ) : (
          'Accept Training Seat'
        )}
      </button>
      
      {loading && (
        <div className="text-xs text-slate-500 text-center">
          Setting up your training account...
        </div>
      )}
    </div>
  );
}
