import { usePathname, useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { useState, useEffect } from 'react'

export default function LocaleSwitch({
  className = ''
}: {
  className?: string
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

  return (
    <button
      onClick={toggle}
      aria-label="Change language – English or Español"
      className={`inline-flex items-center gap-1 text-sm font-medium hover:opacity-80 transition ${className}`}
    >
      {lang === 'en' ? (
        <>
          <span role="img" aria-hidden="true">
            🇺🇸
          </span>{' '}
          EN /{' '}
          <span role="img" aria-hidden="true">
            🇲🇽
          </span>{' '}
          ES
        </>
      ) : (
        <>
          <span role="img" aria-hidden="true">
            🇲🇽
          </span>{' '}
          ES /{' '}
          <span role="img" aria-hidden="true">
            🇺🇸
          </span>{' '}
          EN
        </>
      )}
    </button>
  )
} 