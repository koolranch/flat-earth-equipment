'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface NameEntryProps {
  suggestedName?: string;
  onComplete?: () => void;
}

export default function NameEntry({ suggestedName = '', onComplete }: NameEntryProps) {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parse suggested name if provided
  const parsedNames = suggestedName ? suggestedName.split(' ') : [];
  const suggestedFirst = parsedNames[0] || '';
  const suggestedLast = parsedNames.slice(1).join(' ') || '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter both first and last name.');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/profile/update-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          firstName: firstName.trim(),
          lastName: lastName.trim()
        })
      });

      const result = await response.json();

      if (!result.ok) {
        setError(result.error || 'Failed to update name. Please try again.');
        setLoading(false);
        return;
      }

      // Success - continue to training
      if (onComplete) {
        onComplete();
      } else {
        router.refresh(); // Refresh to bypass the name check
      }

    } catch (err) {
      console.error('Error updating name:', err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-200">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-4">
              <span className="text-3xl">📝</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Enter Your Name
            </h1>
            <p className="text-slate-600">
              This name will appear on your forklift operator certificate.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <div className="font-medium">Error</div>
              <div>{error}</div>
            </div>
          )}

          {/* Show suggested name if available */}
          {suggestedName && (
            <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
              <div className="font-medium mb-1">💡 Name from payment:</div>
              <div className="text-blue-900 font-semibold">{suggestedName}</div>
              <div className="text-xs text-blue-600 mt-1">Confirm this is correct or enter your actual name below.</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={suggestedFirst || "John"}
                  required
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 disabled:opacity-50"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={suggestedLast || "Smith"}
                  required
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Quick Fill Button */}
            {suggestedName && (
              <button
                type="button"
                onClick={() => {
                  setFirstName(suggestedFirst);
                  setLastName(suggestedLast);
                }}
                className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                ✓ Use "{suggestedName}"
              </button>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-wait"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                '✓ Confirm & Start Training'
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-4 text-xs text-slate-500 text-center">
            <p>🔒 Your information is secure and only used for your certificate.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

