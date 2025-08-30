import StandardDemoPanel from '@/components/demos/StandardDemoPanel';
import HotspotsEight from '@/components/demos/HotspotsEight';

export default function TestHotspotsEightPage() {
  return (
    <main className="container mx-auto p-4 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">
          8-Point Inspection Demo Test
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Testing the comprehensive 8-point daily inspection checklist demo
        </p>
      </header>

      <section>
        <StandardDemoPanel
          moduleSlug="eight-point-inspection"
          title="Daily Pre-Operation Inspection"
          objective="Complete all 8 critical safety inspection points before operating"
          estMin={2}
        >
          <HotspotsEight />
        </StandardDemoPanel>
      </section>

      <section className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700">
        <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          8-Point Inspection Features:
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• <strong>Order Agnostic:</strong> Complete inspection points in any order</li>
          <li>• <strong>Toggle Interface:</strong> Click/tap to check/uncheck each point</li>
          <li>• <strong>Progress Tracking:</strong> Visual progress bar and counter (X/8)</li>
          <li>• <strong>Interactive Tooltips:</strong> Hover/focus for detailed inspection guidance</li>
          <li>• <strong>Mobile Optimized:</strong> 2-column mobile, 4-column desktop grid</li>
          <li>• <strong>Reset Functionality:</strong> Clear all selections to start over</li>
          <li>• <strong>Completion Detection:</strong> Auto-complete when all 8 points checked</li>
          <li>• <strong>Visual States:</strong> Clear checked/unchecked visual indicators</li>
        </ul>
      </section>

      <section className="rounded-lg border p-4 bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700">
        <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">
          Inspection Points Covered:
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-green-800 dark:text-green-200">
          <div>
            <div className="font-medium">🛞 Tires</div>
            <div className="text-xs">Cuts, inflation, wear</div>
          </div>
          <div>
            <div className="font-medium">🍴 Forks</div>
            <div className="text-xs">Cracks, wear, alignment</div>
          </div>
          <div>
            <div className="font-medium">⛓️ Chains</div>
            <div className="text-xs">Kinks, tension, lubrication</div>
          </div>
          <div>
            <div className="font-medium">📯 Horn</div>
            <div className="text-xs">Function, audibility</div>
          </div>
          <div>
            <div className="font-medium">💡 Lights</div>
            <div className="text-xs">Warning lights, headlights</div>
          </div>
          <div>
            <div className="font-medium">🔧 Hydraulics</div>
            <div className="text-xs">Fluid levels, leaks</div>
          </div>
          <div>
            <div className="font-medium">💧 Leaks</div>
            <div className="text-xs">Oil, hydraulic, fuel</div>
          </div>
          <div>
            <div className="font-medium">📋 Data Plate</div>
            <div className="text-xs">Legible, secure</div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border p-4 bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700">
        <h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
          Accessibility Features:
        </h3>
        <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
          <li>• <strong>ARIA Pressed:</strong> Uses <code>aria-pressed</code> for toggle state</li>
          <li>• <strong>Role Group:</strong> Checklist container has <code>role="group"</code></li>
          <li>• <strong>Tooltips:</strong> Proper <code>role="tooltip"</code> with <code>aria-describedby</code></li>
          <li>• <strong>Live Regions:</strong> Completion announced with <code>aria-live="polite"</code></li>
          <li>• <strong>Keyboard Support:</strong> Tab navigation, Enter/Space activation</li>
          <li>• <strong>Focus Management:</strong> Clear focus indicators and logical tab order</li>
          <li>• <strong>Screen Reader:</strong> Descriptive labels and state announcements</li>
        </ul>
      </section>

      <section className="rounded-lg border p-4 bg-purple-50 dark:bg-purple-900 border-purple-200 dark:border-purple-700">
        <h3 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
          Analytics Events:
        </h3>
        <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
          <li>• <strong>Toggle Events:</strong> <code>sim_param_change</code> for each inspection point toggle</li>
          <li>• <strong>Progress Tracking:</strong> Includes completion count and percentage</li>
          <li>• <strong>Demo Complete:</strong> <code>demo_complete</code> when all 8 points checked</li>
          <li>• <strong>Interactions:</strong> <code>demo_interaction</code> for tooltips and reset</li>
          <li>• <strong>Rich Metadata:</strong> Item names, progress, and completion method</li>
        </ul>
      </section>

      <section className="text-xs text-slate-500 space-y-1">
        <p><strong>Testing Instructions:</strong></p>
        <p>1. Click inspection points in any order to toggle completion</p>
        <p>2. Hover over items to see detailed inspection tips</p>
        <p>3. Use keyboard navigation (Tab + Enter/Space) for accessibility testing</p>
        <p>4. Check browser console for analytics events (development mode)</p>
        <p>5. Test reset functionality after completing some items</p>
        <p>6. Verify completion message appears when all 8 points are checked</p>
      </section>
    </main>
  );
}
