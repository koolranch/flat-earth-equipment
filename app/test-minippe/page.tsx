import StandardDemoPanel from '@/components/demos/StandardDemoPanel';
import MiniPPE from '@/components/demos/MiniPPE';

export default function TestMiniPPEPage() {
  return (
    <main className="container mx-auto p-4 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">
          MiniPPE Demo Test
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Testing the compact, mobile-first PPE sequence demo with accessibility
        </p>
      </header>

      <section>
        <StandardDemoPanel
          moduleSlug="pre-operation-ppe"
          title="PPE & Safe State Sequence"
          objective="Complete the pre-operation PPE and safety checklist in the correct order"
          estMin={1}
        >
          <MiniPPE />
        </StandardDemoPanel>
      </section>

      <section className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700">
        <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          MiniPPE Features:
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• <strong>Sequential Flow:</strong> Must complete steps in order (Vest → Hard Hat → Lower Forks → Set Brake)</li>
          <li>• <strong>Mobile-First:</strong> Responsive grid layout (2 cols mobile, 4 cols desktop)</li>
          <li>• <strong>Visual Feedback:</strong> Clear current/done/pending states with icons</li>
          <li>• <strong>Error Handling:</strong> Shows helpful messages for incorrect selections</li>
          <li>• <strong>Progress Tracking:</strong> Progress bar and step counter</li>
          <li>• <strong>Keyboard Accessible:</strong> Full Tab navigation, Enter/Space selection</li>
          <li>• <strong>Screen Reader Support:</strong> ARIA labels, live regions, semantic markup</li>
          <li>• <strong>Analytics Integration:</strong> Emits step completion and error events</li>
        </ul>
      </section>

      <section className="rounded-lg border p-4 bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700">
        <h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
          Accessibility Features:
        </h3>
        <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
          <li>• <strong>ARIA Current:</strong> Uses <code>aria-current="step"</code> for current step</li>
          <li>• <strong>Role Group:</strong> Step container has <code>role="group"</code> with label</li>
          <li>• <strong>Descriptive Labels:</strong> Each button includes step number and status</li>
          <li>• <strong>Live Regions:</strong> Error messages announced to screen readers</li>
          <li>• <strong>Focus Management:</strong> Clear focus indicators and keyboard support</li>
          <li>• <strong>Disabled States:</strong> Pending steps properly disabled until available</li>
        </ul>
      </section>

      <section className="rounded-lg border p-4 bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700">
        <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">
          Analytics Events:
        </h3>
        <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
          <li>• <strong>Step Completion:</strong> <code>sim_param_change</code> with step details and success status</li>
          <li>• <strong>Demo Complete:</strong> <code>demo_complete</code> when all steps finished</li>
          <li>• <strong>Error Tracking:</strong> <code>sim_param_change</code> with incorrect step attempts</li>
          <li>• <strong>Reset Action:</strong> <code>demo_interaction</code> when user resets sequence</li>
        </ul>
      </section>

      <section className="text-xs text-slate-500 space-y-1">
        <p><strong>Testing Instructions:</strong></p>
        <p>1. Try clicking steps out of order to see error handling</p>
        <p>2. Use Tab + Enter/Space for keyboard navigation</p>
        <p>3. Check browser console for analytics events (development mode)</p>
        <p>4. Test on mobile device for responsive layout</p>
      </section>
    </main>
  );
}
