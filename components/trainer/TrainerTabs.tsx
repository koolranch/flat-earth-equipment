'use client';
import { useEffect, useState } from 'react';

interface ChipProps {
  children: React.ReactNode;
  tone: 'ok' | 'warn' | 'muted' | 'info';
}

function Chip({ children, tone }: ChipProps) {
  const toneClasses = {
    ok: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    warn: 'bg-amber-100 text-amber-800 border-amber-200',
    muted: 'bg-slate-100 text-slate-700 border-slate-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  return (
    <span className={`text-xs rounded-full px-2 py-0.5 border font-medium ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}

interface TrainerTabsProps {
  courseId: string;
}

export default function TrainerTabs({ courseId }: TrainerTabsProps) {
  const [activeTab, setActiveTab] = useState<'roster' | 'invites'>('roster');
  const [roster, setRoster] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [inviteCounts, setInviteCounts] = useState<any>({});
  const [loading, setLoading] = useState(false);

  async function loadRoster() {
    try {
      const response = await fetch(`/api/trainer/roster?course_id=${courseId}`, {
        cache: 'no-store'
      });
      const data = await response.json();
      
      if (data.ok) {
        setRoster(data.rows || []);
      } else {
        console.error('Failed to load roster:', data.error);
        setRoster([]);
      }
    } catch (error) {
      console.error('Error loading roster:', error);
      setRoster([]);
    }
  }

  async function loadInvites() {
    try {
      const response = await fetch(`/api/trainer/invites?course_id=${courseId}`, {
        cache: 'no-store'
      });
      const data = await response.json();
      
      if (data.ok) {
        setInvites(data.invites || []);
        setInviteCounts(data.status_counts || {});
      } else {
        console.error('Failed to load invites:', data.error);
        setInvites([]);
        setInviteCounts({});
      }
    } catch (error) {
      console.error('Error loading invites:', error);
      setInvites([]);
      setInviteCounts({});
    }
  }

  useEffect(() => {
    loadRoster();
    loadInvites();
  }, [courseId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleResend(inviteId: string) {
    setLoading(true);
    try {
      const response = await fetch('/api/trainer/invites/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_id: inviteId })
      });
      
      const result = await response.json();
      if (!result.ok) {
        alert(`Resend failed: ${result.error || 'Unknown error'}`);
      } else {
        alert('Invitation resent successfully!');
        await loadInvites(); // Refresh invites list
      }
    } catch (error) {
      console.error('Resend error:', error);
      alert('Failed to resend invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(inviteId: string) {
    if (!confirm('Are you sure you want to cancel this invitation?')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/trainer/invites/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_id: inviteId })
      });
      
      const result = await response.json();
      if (!result.ok) {
        alert(`Cancel failed: ${result.error || 'Unknown error'}`);
      } else {
        alert('Invitation cancelled successfully.');
        await loadInvites(); // Refresh invites list
      }
    } catch (error) {
      console.error('Cancel error:', error);
      alert('Failed to cancel invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border p-4 bg-white dark:bg-slate-900">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4 border-b pb-2">
        <button
          onClick={() => setActiveTab('roster')}
          className={`rounded-2xl px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'roster'
              ? 'bg-[#F76511] text-white shadow-lg'
              : 'border border-slate-300 text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          📋 Roster ({roster.length})
        </button>
        <button
          onClick={() => setActiveTab('invites')}
          className={`rounded-2xl px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'invites'
              ? 'bg-[#F76511] text-white shadow-lg'
              : 'border border-slate-300 text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          📧 Invites ({invites.length})
        </button>
      </div>

      {/* Roster Tab */}
      {activeTab === 'roster' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Enrolled Learners</h3>
            <button
              onClick={loadRoster}
              className="rounded-xl border px-3 py-1 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              🔄 Refresh
            </button>
          </div>
          
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="text-left p-3 font-medium">Learner</th>
                  <th className="text-left p-3 font-medium">Progress</th>
                  <th className="text-left p-3 font-medium">Exam</th>
                  <th className="text-left p-3 font-medium">Certificate</th>
                  <th className="text-left p-3 font-medium">Practical</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roster.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No enrolled learners found.
                    </td>
                  </tr>
                ) : (
                  roster.map(learner => (
                    <tr key={learner.enrollment_id} className="border-t hover:bg-slate-50 dark:hover:bg-slate-800">
                      <td className="p-3">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {learner.learner?.name || '—'}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          {learner.learner?.email}
                        </div>
                      </td>
                      <td className="p-3">
                        <Chip tone={learner.progress_pct >= 100 ? 'ok' : learner.progress_pct > 0 ? 'info' : 'muted'}>
                          {learner.progress_pct}%
                        </Chip>
                      </td>
                      <td className="p-3">
                        {learner.exam?.latest_score_pct != null ? (
                          <div className="flex items-center gap-2">
                            <Chip tone={learner.exam.latest_score_pct >= 80 ? 'ok' : 'warn'}>
                              {learner.exam.latest_score_pct}%
                            </Chip>
                            <span className="text-xs text-slate-600">
                              ({learner.exam.total_attempts} attempt{learner.exam.total_attempts !== 1 ? 's' : ''})
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        {learner.certificate ? (
                          <div className="space-y-1">
                            <a 
                              className="text-xs underline text-blue-600 hover:text-blue-800" 
                              href={`/verify/${learner.certificate.verification_code}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {learner.certificate.verification_code}
                            </a>
                            <div className="text-xs text-slate-500">
                              {new Date(learner.certificate.issued_at).toLocaleDateString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        {learner.evaluation?.practical_pass === true ? (
                          <Chip tone="ok">✓ Pass</Chip>
                        ) : learner.evaluation?.practical_pass === false ? (
                          <Chip tone="warn">✗ Fail</Chip>
                        ) : (
                          <Chip tone="muted">— Pending</Chip>
                        )}
                      </td>
                      <td className="p-3">
                        <a
                          className="rounded-lg border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          href={`/evaluate/${learner.enrollment_id}`}
                        >
                          Evaluate
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invites Tab */}
      {activeTab === 'invites' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Seat Invitations</h3>
            <button
              onClick={loadInvites}
              className="rounded-xl border px-3 py-1 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              🔄 Refresh
            </button>
          </div>
          
          {/* Status Summary */}
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3">
            <div className="text-sm font-medium mb-2">Status Summary</div>
            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1">
                <Chip tone="warn">Pending</Chip>
                <span>{inviteCounts.pending || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Chip tone="info">Sent</Chip>
                <span>{inviteCounts.sent || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Chip tone="ok">Claimed</Chip>
                <span>{inviteCounts.claimed || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Chip tone="muted">Cancelled</Chip>
                <span>{inviteCounts.cancelled || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Chip tone="warn">Expired</Chip>
                <span>{inviteCounts.expired || 0}</span>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Expires</th>
                  <th className="text-left p-3 font-medium">Note</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invites.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No invitations found. Create invitations using the Assign Seats panel above.
                    </td>
                  </tr>
                ) : (
                  invites.map(invite => (
                    <tr key={invite.id} className="border-t hover:bg-slate-50 dark:hover:bg-slate-800">
                      <td className="p-3">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {invite.email}
                        </div>
                      </td>
                      <td className="p-3">
                        {invite.status === 'claimed' ? (
                          <Chip tone="ok">✓ Claimed</Chip>
                        ) : invite.status === 'cancelled' ? (
                          <Chip tone="muted">✗ Cancelled</Chip>
                        ) : invite.status === 'sent' ? (
                          <Chip tone="info">📧 Sent</Chip>
                        ) : invite.status === 'expired' ? (
                          <Chip tone="warn">⏰ Expired</Chip>
                        ) : (
                          <Chip tone="warn">⏳ Pending</Chip>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          {invite.expires_at 
                            ? new Date(invite.expires_at).toLocaleDateString()
                            : '—'
                          }
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-xs text-slate-600 dark:text-slate-400 max-w-32 truncate">
                          {invite.note || '—'}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          {(invite.status === 'pending' || invite.status === 'sent') && (
                            <button
                              onClick={() => handleResend(invite.id)}
                              disabled={loading}
                              className="rounded-lg border border-blue-300 text-blue-600 px-2 py-1 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50"
                            >
                              🔄 Resend
                            </button>
                          )}
                          {invite.status !== 'claimed' && invite.status !== 'cancelled' && (
                            <button
                              onClick={() => handleCancel(invite.id)}
                              disabled={loading}
                              className="rounded-lg border border-red-300 text-red-600 px-2 py-1 text-xs hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                            >
                              ❌ Cancel
                            </button>
                          )}
                          {invite.invite_token && invite.status !== 'cancelled' && (
                            <a
                              className="rounded-lg border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                              href={`/claim/${invite.invite_token}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              🔗 Link
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
