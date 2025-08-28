'use client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function LocaleSwitcher() {
  const router = useRouter();
  const [pending, start] = useTransition();
  
  async function setLocale(locale: 'en'|'es') {
    await fetch('/api/locale', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ locale }) 
    });
    start(() => router.refresh());
  }

  return (
    <div className="inline-flex gap-2" aria-label="Language">
      <button 
        className="rounded-2xl border px-3 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F76511]" 
        onClick={() => setLocale('en')} 
        disabled={pending}
      >
        EN
      </button>
      <button 
        className="rounded-2xl border px-3 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F76511]" 
        onClick={() => setLocale('es')} 
        disabled={pending}
      >
        ES
      </button>
    </div>
  );
}
