'use client';
export default function ModuleDebugOverlay(props: Record<string, any>) {
  if (!props.__debug) return null;
  return (
    <div style={{position:'fixed', bottom:8, right:8, zIndex:9999}} className="rounded-lg border bg-white/90 p-3 text-xs shadow">
      <div className="font-medium mb-1">Module Debug</div>
      <pre className="max-w-[360px] whitespace-pre-wrap">{JSON.stringify(props, null, 2)}</pre>
    </div>
  );
}
