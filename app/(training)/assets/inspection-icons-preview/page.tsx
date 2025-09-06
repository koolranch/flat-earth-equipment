export default function InspectionIconsPreview() {
  const ids = [
    'inspect-tires',
    'inspect-forks',
    'inspect-chains',
    'inspect-horn',
    'inspect-lights',
    'inspect-hydraulics',
    'inspect-leaks',
    'inspect-data-plate',
  ];
  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold text-slate-900">Daily Inspection Icons — Preview</h1>
      <p className="text-slate-600 mt-2">Rendered with <code>&lt;use href="/training/icons/inspection-icons.svg#ID" /&gt;</code></p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {ids.map((id) => (
          <div key={id} className="border rounded-2xl p-4 shadow-sm bg-white">
            <svg width="160" height="160" viewBox="0 0 128 128" role="img" aria-label={id}>
              <use href={`/training/icons/inspection-icons.svg#${id}`} />
            </svg>
            <div className="mt-2 text-sm text-slate-700">{id}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
