import { cookies } from 'next/headers'

export type Locale = 'en' | 'es'

export function getUserLocale(req?: Request): Locale {
  if (req) {
    // For API routes with request object
    const cookieHeader = req.headers.get('cookie')
    if (cookieHeader) {
      const langCookie = cookieHeader
        .split(';')
        .find(c => c.trim().startsWith('lang='))
        ?.split('=')[1]
      
      if (langCookie === 'es') return 'es'
    }
    
    // Check Accept-Language header as fallback
    const acceptLanguage = req.headers.get('accept-language')
    if (acceptLanguage?.includes('es')) return 'es'
  } else {
    // For server components with cookies()
    try {
      const cookieStore = cookies()
      const langCookie = cookieStore.get('lang')?.value
      if (langCookie === 'es') return 'es'
    } catch (error) {
      // cookies() might not be available in all contexts
      console.warn('Could not access cookies in getUserLocale')
    }
  }
  
  return 'en' // default
}

export function getLocaleFromHeaders(headers: Headers): Locale {
  const cookieHeader = headers.get('cookie')
  if (cookieHeader) {
    const langCookie = cookieHeader
      .split(';')
      .find(c => c.trim().startsWith('lang='))
      ?.split('=')[1]
    
    if (langCookie === 'es') return 'es'
  }
  
  const acceptLanguage = headers.get('accept-language')
  if (acceptLanguage?.includes('es')) return 'es'
  
  return 'en'
}

// Client-side utility for getting locale
export function getClientLocale(): Locale {
  if (typeof window === 'undefined') return 'en'
  
  // Check cookie first
  const langCookie = document.cookie
    .split(';')
    .find(c => c.trim().startsWith('lang='))
    ?.split('=')[1]
  
  if (langCookie === 'es') return 'es'
  return 'en'
} 