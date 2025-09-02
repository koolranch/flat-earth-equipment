'use client';
import { useI18n } from '@/lib/i18n/I18nProvider';
export default function LocaleSwitcher(){
  const { locale, setLocale } = useI18n();
  return (
    <div className="flex gap-1 text-xs">
      {(['en','es'] as const).map(l => (
        <button key={l} onClick={()=> setLocale(l)} className={`rounded-xl border px-2 py-1 ${locale===l?'bg-slate-900 text-white':''}`}>{l.toUpperCase()}</button>
      ))}
    </div>
  );
}
