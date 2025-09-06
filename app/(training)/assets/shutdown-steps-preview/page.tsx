export default function ShutdownStepsPreview() {
  const ids = [
    'shutdown-step-1-neutral',
    'shutdown-step-2-steer-straight',
    'shutdown-step-3-brake-set',
    'shutdown-step-4-forks-down',
    'shutdown-step-5-key-off',
    'shutdown-step-6-connect-charger',
    'shutdown-step-7-wheel-chock',
  ];
  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold text-slate-900">Shutdown Steps Sprite Preview</h1>
      <p className="text-slate-600 mt-2">Using <code>&lt;use href="/training/icons/shutdown-steps.svg#ID" /&gt;</code></p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {ids.map((id) => (
          <div key={id} className="border rounded-2xl p-4 shadow-sm bg-white">
            <svg width="220" height="165" viewBox="0 0 160 120" aria-label={id} role="img">
              <use href={`/training/icons/shutdown-steps.svg#${id}`} />
            </svg>
            <div className="mt-2 text-sm text-slate-700">{id}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
