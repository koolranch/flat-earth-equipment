'use client';
import { useEffect } from 'react';

export default function QAEventListener() {
  useEffect(() => {
    function onEvt(e: any) { 
      try { 
        (window as any).__qaEvents = (window as any).__qaEvents || []; 
        (window as any).__qaEvents.push(e.detail); 
      } catch {} 
    }
    window.addEventListener('analytics', onEvt as any);
    return () => window.removeEventListener('analytics', onEvt as any);
  }, []);
  return null;
}
