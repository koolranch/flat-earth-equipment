import ExampleDemo from '@/components/demos/ExampleDemo';

export default function TestDemoPanelPage() {
  return (
    <main className="container mx-auto p-4 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">
          Demo Panel Test
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Testing the standardized demo panel pattern with analytics
        </p>
      </header>

      <section>
        <ExampleDemo />
      </section>

      <section className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700">
        <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          Demo Panel Features:
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Standardized title, objective, and time estimate display</li>
          <li>• Analytics tracking for demo start, completion, and interactions</li>
          <li>• Parameter change tracking for simulation adjustments</li>
          <li>• Progress visualization and step completion tracking</li>
          <li>• Automatic localStorage completion flags for quiz gating</li>
          <li>• CustomEvent communication between parent and child components</li>
          <li>• Consistent UI patterns across all training modules</li>
          <li>• Accessibility support with proper labeling and focus management</li>
        </ul>
      </section>

      <section className="rounded-lg border p-4 bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700">
        <h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
          Analytics Events Tracked:
        </h3>
        <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
          <li>• <code>demo_start</code> - When user begins the demo</li>
          <li>• <code>demo_complete</code> - When demo is finished with duration</li>
          <li>• <code>sim_param_change</code> - Parameter adjustments (weight, height, etc.)</li>
          <li>• <code>demo_interaction</code> - User interactions within the demo</li>
          <li>• <code>demo_status</code> - Completion events for quiz gating</li>
        </ul>
      </section>

      <section className="text-xs text-slate-500 space-y-1">
        <p>Open browser console to see analytics events in development mode.</p>
        <p>Events are emitted via CustomEvent for flexible handling by analytics systems.</p>
      </section>
    </main>
  );
}
