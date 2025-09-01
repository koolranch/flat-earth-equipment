'use client';
import { useState, useEffect } from 'react';

export default function LanguageToggle() {
  const [locale, setLocale] = useState<'en' | 'es'>('en');
  
  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )locale=([^;]+)/);
    if (m?.[1]) setLocale(m[1] === 'es' ? 'es' : 'en');
  }, []);
  
  function set(l: 'en' | 'es') {
    document.cookie = `locale=${l}; path=/; max-age=${60 * 60 * 24 * 365}`;
    window.location.reload();
  }
  
  return (
    <div className="inline-flex rounded-xl border overflow-hidden" role="group" aria-label="Language">
      <button 
        className={`px-3 py-1 text-sm ${locale === 'en' ? 'bg-slate-900 text-white' : ''}`} 
        onClick={() => set('en')}
      >
        EN
      </button>
      <button 
        className={`px-3 py-1 text-sm ${locale === 'es' ? 'bg-slate-900 text-white' : ''}`} 
        onClick={() => set('es')}
      >
        ES
      </button>
    </div>
  );
}
