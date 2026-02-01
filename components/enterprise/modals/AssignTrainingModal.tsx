'use client';

import { useState, useEffect } from 'react';
import { EnterpriseButton } from '@/components/enterprise/ui/DesignSystem';

interface User {
  id: string;
  email: string;
  full_name: string;
  status: 'active' | 'completed';
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
}

interface AssignTrainingModalProps {
  orgId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AssignTrainingModal({ orgId, isOpen, onClose, onSuccess }: AssignTrainingModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, orgId]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      // Load users and courses in parallel
      const [usersRes, coursesRes] = await Promise.all([
        fetch(`/api/enterprise/adapted/organizations/${orgId}/users?pageSize=100`),
        fetch('/api/enterprise/assign-training')
      ]);

      const usersData = await usersRes.json();
      const coursesData = await coursesRes.json();

      if (usersData.ok) {
        setUsers(usersData.users || []);
      }
      if (coursesData.ok) {
        setCourses(coursesData.courses || []);
        // Auto-select first course if available
        if (coursesData.courses?.length > 0 && !selectedCourse) {
          setSelectedCourse(coursesData.courses[0].id);
        }
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoadingData(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedUsers.size === 0) {
      setError('Please select at least one user');
      return;
    }
    if (!selectedCourse) {
      setError('Please select a course');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/enterprise/assign-training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_ids: Array.from(selectedUsers),
          course_id: selectedCourse,
          org_id: orgId
        })
      });

      const data = await response.json();

      if (data.ok) {
        setSuccess(`Training assigned to ${data.results.created} user(s)${data.results.skipped > 0 ? ` (${data.results.skipped} already enrolled)` : ''}`);
        setTimeout(() => {
          onSuccess?.();
          handleClose();
        }, 2000);
      } else {
        setError(data.error || 'Failed to assign training');
      }
    } catch (err) {
      setError('Failed to assign training. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedUsers(new Set());
    setSelectedCourse(courses[0]?.id || '');
    setError(null);
    setSuccess(null);
    setSearchTerm('');
    onClose();
  };

  const toggleUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const selectAll = () => {
    const filtered = filteredUsers.map(u => u.id);
    setSelectedUsers(new Set(filtered));
  };

  const selectNone = () => {
    setSelectedUsers(new Set());
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Assign Training</h2>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Training Assigned!</h3>
            <p className="text-gray-600">{success}</p>
          </div>
        ) : loadingData ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#F76511] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            {/* Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Course Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Course <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F76511]"
                >
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* User Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Users <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2 text-xs">
                    <button type="button" onClick={selectAll} className="text-[#F76511] hover:underline">
                      Select All ({filteredUsers.length})
                    </button>
                    <span className="text-gray-300">|</span>
                    <button type="button" onClick={selectNone} className="text-gray-500 hover:underline">
                      Clear
                    </button>
                  </div>
                </div>

                {/* Search */}
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 mb-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F76511]"
                />

                {/* User List */}
                <div className="border border-gray-200 rounded-xl max-h-60 overflow-y-auto">
                  {filteredUsers.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No users found
                    </div>
                  ) : (
                    filteredUsers.map(user => (
                      <label
                        key={user.id}
                        className={`flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 ${
                          selectedUsers.has(user.id) ? 'bg-orange-50' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.id)}
                          onChange={() => toggleUser(user.id)}
                          className="w-4 h-4 text-[#F76511] rounded border-gray-300 focus:ring-[#F76511]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{user.full_name}</div>
                          <div className="text-sm text-gray-500 truncate">{user.email}</div>
                        </div>
                        {user.status === 'completed' && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            Completed
                          </span>
                        )}
                      </label>
                    ))
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
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
                disabled={loading || selectedUsers.size === 0 || !selectedCourse}
                loading={loading}
              >
                {loading ? 'Assigning...' : `Assign to ${selectedUsers.size} User${selectedUsers.size !== 1 ? 's' : ''}`}
              </EnterpriseButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AssignTrainingModal;
