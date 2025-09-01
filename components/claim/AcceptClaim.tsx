'use client';
import { useState } from 'react';

interface AcceptClaimProps {
  token: string;
}

export default function AcceptClaim({ token }: AcceptClaimProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    if (loading) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/claim/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
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
    <div className="space-y-3">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <div className="font-medium">Error</div>
          <div>{error}</div>
        </div>
      )}
      
      <button 
        onClick={handleAccept}
        disabled={loading}
        className="rounded-2xl bg-[#F76511] text-white px-6 py-3 font-medium hover:bg-[#E55A0C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center gap-2">
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
