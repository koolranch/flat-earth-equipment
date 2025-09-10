// Utility component used to render a small status indicator (dot or lock)
export function StatusDot({ state }: { state: 'locked' | 'todo' | 'done' }) {
  if (state === 'locked') return <span className='ml-2 inline-flex items-center text-slate-400' aria-label='locked'>🔒</span>;
  if (state === 'done') return <span className='ml-2 inline-block w-2.5 h-2.5 rounded-full bg-emerald-500' aria-label='complete' />;
  return <span className='ml-2 inline-block w-2.5 h-2.5 rounded-full bg-slate-300' aria-label='incomplete' />;
}
