'use client';
import { useState } from 'react';

export default function PracticalInviteForm({ enrollmentId, userId }: { enrollmentId: string; userId: string }) {
  const [supervisorEmail, setSupervisorEmail] = useState('');
  const [supervisorName, setSupervisorName] = useState('');
  const [company, setCompany] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSending(true);

    try {
      const res = await fetch('/api/practical/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollment_id: enrollmentId,
          trainee_user_id: userId,
          supervisor_email: supervisorEmail,
          supervisor_name: supervisorName,
          company: company
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send invite');
      }

      setSent(true);
      
      // Track event
      try {
        (window as any)?.analytics?.track?.('practical_invite_sent', {
          enrollment_id: enrollmentId
        });
      } catch {}
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-lg flex-shrink-0">
            ✓
          </div>
          <div>
            <h4 className="font-semibold text-green-900 mb-1">Invite Sent!</h4>
            <p className="text-sm text-green-800 mb-2">
              {supervisorName || supervisorEmail} will receive an email with instructions to complete your practical evaluation.
            </p>
            <button 
              onClick={() => setSent(false)}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Send another invite
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="supervisor-name" className="block text-sm font-medium text-blue-900 mb-1">
          Safety Manager / Supervisor Name *
        </label>
        <input
          id="supervisor-name"
          type="text"
          required
          value={supervisorName}
          onChange={(e) => setSupervisorName(e.target.value)}
          placeholder="e.g., John Smith"
          className="w-full rounded-lg border border-blue-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="supervisor-email" className="block text-sm font-medium text-blue-900 mb-1">
          Their Email Address *
        </label>
        <input
          id="supervisor-email"
          type="email"
          required
          value={supervisorEmail}
          onChange={(e) => setSupervisorEmail(e.target.value)}
          placeholder="supervisor@company.com"
          className="w-full rounded-lg border border-blue-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="company" className="block text-sm font-medium text-blue-900 mb-1">
          Company / Site Name (Optional)
        </label>
        <input
          id="company"
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="e.g., ABC Warehousing"
          className="w-full rounded-lg border border-blue-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={sending}
        className="w-full rounded-xl bg-blue-600 text-white px-6 py-3 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {sending ? 'Sending Invite...' : 'Send Evaluation Invite →'}
      </button>

      <p className="text-xs text-blue-700">
        Your supervisor will receive an email with a secure link to complete your hands-on evaluation.
      </p>
    </form>
  );
}

