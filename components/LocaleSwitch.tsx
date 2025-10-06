import { usePathname, useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { useState, useEffect } from 'react'

export default function LocaleSwitch({
  className = '',
  variant = 'default'
}: {
  className?: string
  variant?: 'default' | 'mobile'
}) {
  const router = useRouter()
  const pathname = usePathname()
  
  // Get current language from cookie
  const getCurrentLang = () => {
    return Cookies.get('lang') || 'en'
  }
  
  const [lang, setLang] = useState<string>(getCurrentLang())

  // Update lang when component mounts (client-side)
  useEffect(() => {
    setLang(getCurrentLang())
  }, [])

  const toggle = () => {
    const next = lang === 'en' ? 'es' : 'en'
    // persist choice for 1 year - use 'lang' cookie name to match middleware
    Cookies.set('lang', next, { expires: 365, sameSite: 'Lax' })
    // GA4
    if (window?.gtag) {
      window.gtag('event', 'language_change', { from: lang, to: next })
    }
    // Same URL approach - just reload page to pick up new language
    setLang(next)
    router.refresh() // This will reload the page with the new language setting
  }

  // Mobile-optimized version
  if (variant === 'mobile') {
    return (
      <button
        onClick={toggle}
        aria-label={`Change language to ${lang === 'en' ? 'Español' : 'English'}`}
        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-colors min-h-[44px] w-full ${className}`}
      >
        <span className="text-2xl" role="img" aria-hidden="true">
          {lang === 'en' ? '🇺🇸' : '🇲🇽'}
        </span>
        <span className="text-base font-medium text-gray-700">
          {lang === 'en' ? 'English' : 'Español'}
        </span>
        <span className="text-xs text-gray-500 ml-auto">
          {lang === 'en' ? 'Tap for ES' : 'Toca para EN'}
        </span>
      </button>
    )
  }

  // Desktop version (compact)
  return (
    <button
      onClick={toggle}
      aria-label={`Change language to ${lang === 'en' ? 'Español' : 'English'}`}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors border border-gray-200 ${className}`}
    >
      <span className="text-lg" role="img" aria-hidden="true">
        {lang === 'en' ? '🇺🇸' : '🇲🇽'}
      </span>
      <span className="text-gray-700">
        {lang === 'en' ? 'EN' : 'ES'}
      </span>
      <span className="text-xs text-gray-400">
        {lang === 'en' ? '/ ES' : '/ EN'}
      </span>
    </button>
  )
} 