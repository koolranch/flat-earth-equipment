'use client';

export default function AssignSeatsPanel() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Assign Seats</h2>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          Coming Soon
        </span>
      </div>
      
      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
        <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-slate-900 mb-1">Assign Training Seats</h3>
        <p className="text-xs text-slate-500 mb-4">
          Assign available training seats to learners and manage enrollment capacity.
        </p>
        <button 
          className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-lg cursor-not-allowed"
          disabled
        >
          Component Loading...
        </button>
      </div>
      
      <div className="text-xs text-slate-500 space-y-1">
        <p>• Assign seats to specific learners</p>
        <p>• Manage training capacity and availability</p>
        <p>• Track seat utilization and enrollment status</p>
      </div>
    </div>
  );
}
