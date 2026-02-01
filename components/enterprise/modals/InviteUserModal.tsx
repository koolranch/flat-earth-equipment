'use client';

import { useState } from 'react';
import { EnterpriseButton } from '@/components/enterprise/ui/DesignSystem';

interface InviteUserModalProps {
  orgId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InviteUserModal({ orgId, isOpen, onClose, onSuccess }: InviteUserModalProps) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'learner' | 'manager' | 'admin'>('learner');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/enterprise/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          full_name: fullName,
          role,
          org_id: orgId
        })
      });

      const data = await response.json();

      if (data.ok) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.();
          handleClose();
        }, 2000);
      } else {
        setError(data.error || 'Failed to send invitation');
      }
    } catch (err) {
      setError('Failed to send invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setFullName('');
    setRole('learner');
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Invite Team Member</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Success State */}
        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Invitation Sent!</h3>
            <p className="text-gray-600">
              An email has been sent to <strong>{email}</strong> with instructions to join.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Body */}
            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="employee@company.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F76511] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F76511] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F76511]"
                >
                  <option value="learner">Team Member (Learner)</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Administrator</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {role === 'learner' && 'Can complete assigned training'}
                  {role === 'manager' && 'Can view team progress and conduct evaluations'}
                  {role === 'admin' && 'Can manage all users and assign training'}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                Cancel
              </button>
              <EnterpriseButton
                type="submit"
                disabled={loading || !email}
                loading={loading}
              >
                {loading ? 'Sending...' : 'Send Invitation'}
              </EnterpriseButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default InviteUserModal;
