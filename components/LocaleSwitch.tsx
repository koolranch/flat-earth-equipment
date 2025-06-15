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
  
  // Determine current language from URL path
  const getCurrentLang = () => {
    if (pathname.startsWith('/es')) return 'es'
    return 'en'
  }
  
  const [lang, setLang] = useState<string>(getCurrentLang())

  // Update lang when pathname changes
  useEffect(() => {
    setLang(getCurrentLang())
  }, [pathname])

  const toggle = () => {
    const next = lang === 'en' ? 'es' : 'en'
    // persist choice for 1 year - use 'lang' cookie name to match middleware
    Cookies.set('lang', next, { expires: 365, sameSite: 'Lax' })
    // GA4
    if (window?.gtag) {
      window.gtag('event', 'language_change', { from: lang, to: next })
    }
    // soft-redirect: drop/enforce /es prefix
    const newPath =
      next === 'es'
        ? pathname.startsWith('/es') ? pathname : `/es${pathname}`
        : pathname.replace(/^\/es/, '') || '/'
    setLang(next)
    router.push(newPath)
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