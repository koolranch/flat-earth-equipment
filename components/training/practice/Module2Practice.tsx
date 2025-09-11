import React from 'react';
export function Module2Practice({ onComplete }: { onComplete: () => void }){
  const items = [
    'Forks inspected',
    'Chains & hoses OK',
    'Tires/Wheels OK',
    'Horn & lights work',
    'Seatbelt present',
    'Data plate legible',
    'No visible leaks',
    'Battery/LP secure'
  ];
  const [checks, setChecks] = React.useState<boolean[]>(Array(items.length).fill(false));
  React.useEffect(() => { if (checks.every(Boolean)) onComplete(); }, [checks]);
  return (
    <div>
      <h4 className='font-medium mb-2'>Run the 8-point inspection</h4>
      <ul className='space-y-2'>
        {items.map((label, i) => (
          <li key={i} className='flex items-center gap-2'>
            <input type='checkbox' checked={checks[i]} onChange={() => setChecks(c => c.map((v,ix)=>ix===i?!v:v))} />
            <span className='text-sm'>{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

