'use client';
import { useEffect, useState } from 'react';

export default function LiveRegion({ message }: { message: string }) {
  const [msg, setMsg] = useState('');
  
  useEffect(() => { 
    setMsg(message); 
  }, [message]);
  
  return (
    <div 
      aria-live="polite" 
      className="sr-only" 
      role="status"
    >
      {msg}
    </div>
  );
}
