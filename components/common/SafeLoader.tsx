import React from 'react';
export default function SafeLoader({ children, label='Loading…' }: React.PropsWithChildren<{ label?: string }>) {
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => { const t = requestAnimationFrame(() => setReady(true)); return () => cancelAnimationFrame(t); }, []);
  return (
    <div>
      {!ready && (
        <div className="animate-pulse rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">{label}</div>
      )}
      <div className={ready ? '' : 'sr-only'}>{children}</div>
    </div>
  );
}
