'use client';

export default function RosterPanel() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Roster</h2>
        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
          Coming Soon
        </span>
      </div>
      
      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
        <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-slate-900 mb-1">Learner Roster</h3>
        <p className="text-xs text-slate-500 mb-4">
          View and manage all enrolled learners, track progress, and monitor completion status.
        </p>
        <button 
          className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-lg cursor-not-allowed"
          disabled
        >
          Component Loading...
        </button>
      </div>
      
      <div className="text-xs text-slate-500 space-y-1">
        <p>• View all enrolled learners and their progress</p>
        <p>• Track module completion and quiz scores</p>
        <p>• Export roster data and completion reports</p>
      </div>
    </div>
  );
}
