import React from 'react';
export function Module5Practice({ onComplete }: { onComplete: () => void }){
  const [done, setDone] = React.useState(false);
  React.useEffect(() => { if (done) onComplete(); }, [done]);
  return (
    <div className='space-y-3'>
      <h4 className='font-medium'>Advanced operations</h4>
      <p className='text-sm'>Review shutdown, attachments, and charging safety. When finished, mark complete.</p>
      <button className='px-3 py-1.5 rounded-md border' onClick={()=>setDone(true)}>Mark complete</button>
    </div>
  );
}

