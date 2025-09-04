'use client';

export default function LocaleSwitcher() {
  async function setLocale(locale: 'en' | 'es') {
    try {
      await fetch('/api/i18n/set-locale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale })
      });
      window.location.reload();
    } catch (err) {
      console.error('Failed to set locale:', err);
    }
  }

  return (
    <div className="inline-flex rounded-2xl border overflow-hidden" aria-label="Language selector">
      <button 
        className="px-3 py-2 text-sm hover:bg-gray-50 transition-colors" 
        onClick={() => setLocale('en')} 
        aria-label="Switch to English"
      >
        EN
      </button>
      <button 
        className="px-3 py-2 text-sm hover:bg-gray-50 border-l transition-colors" 
        onClick={() => setLocale('es')} 
        aria-label="Cambiar a español"
      >
        ES
      </button>
    </div>
  );
}
