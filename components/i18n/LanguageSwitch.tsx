'use client';
import { useEffect, useState } from 'react';

export default function LanguageSwitch(){
  const [loc, setLoc] = useState<string>(
    typeof window !== 'undefined' 
      ? (localStorage.getItem('locale') || (process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en')) 
      : 'en'
  );
  
  useEffect(() => {
    try {
      localStorage.setItem('locale', loc);
      document.cookie = `locale=${loc}; path=/; max-age=31536000`;
      window.dispatchEvent(new CustomEvent('locale_change', { detail: { locale: loc } }));
    } catch {}
  }, [loc]);
  
  return (
    <select 
      aria-label="Language" 
      value={loc} 
      onChange={e => setLoc(e.target.value)} 
      className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:border-slate-600"
    >
      <option value="en">English</option>
      <option value="es">Español</option>
    </select>
  );
}
