import React from 'react';
export function Module3Practice({ onComplete }: { onComplete: () => void }){
  const [level, setLevel] = React.useState(false);
  const [tilt, setTilt] = React.useState(false);
  React.useEffect(() => { if (level && tilt) onComplete(); }, [level, tilt]);
  return (
    <div className='space-y-3'>
      <h4 className='font-medium'>Balance & Load Handling practice</h4>
      <label className='flex items-center gap-2 text-sm'><input type='checkbox' checked={level} onChange={e=>setLevel(e.target.checked)} /> Level forks at entry/exit</label>
      <label className='flex items-center gap-2 text-sm'><input type='checkbox' checked={tilt} onChange={e=>setTilt(e.target.checked)} /> Keep load low & tilted back when traveling</label>
      <p className='text-xs text-slate-500'>Mark both to complete.</p>
    </div>
  );
}

