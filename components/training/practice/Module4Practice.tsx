import React from 'react';
export function Module4Practice({ onComplete }: { onComplete: () => void }){
  const [found, setFound] = React.useState(0);
  const total = 3;
  React.useEffect(() => { if (found >= total) onComplete(); }, [found]);
  return (
    <div className='space-y-3'>
      <h4 className='font-medium'>Hazard hunt</h4>
      <p className='text-sm'>Find 3 hazards: spill, blind corner, overhead obstruction.</p>
      <button className='px-3 py-1.5 rounded-md border' onClick={()=>setFound(f=>Math.min(total, f+1))}>Mark hazard found ({found}/{total})</button>
    </div>
  );
}

