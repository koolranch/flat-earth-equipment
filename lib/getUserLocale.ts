import { cookies } from 'next/headers'

export type Locale = 'en' | 'es'

export function getUserLocale(req?: Request): Locale {
  if (req) {
    // For API routes with request object
    const cookieHeader = req.headers.get('cookie')
    if (cookieHeader) {
      const localeCookie = cookieHeader
        .split(';')
        .find(c => c.trim().startsWith('locale='))
        ?.split('=')[1]
      
      if (localeCookie === 'es') return 'es'
    }
    
    // Check Accept-Language header
    const acceptLanguage = req.headers.get('accept-language')
    if (acceptLanguage?.includes('es')) return 'es'
  } else {
    // For server components with cookies()
    try {
      const cookieStore = cookies()
      const localeCookie = cookieStore.get('locale')?.value
      if (localeCookie === 'es') return 'es'
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
    const localeCookie = cookieHeader
      .split(';')
      .find(c => c.trim().startsWith('locale='))
      ?.split('=')[1]
    
    if (localeCookie === 'es') return 'es'
  }
  
  const acceptLanguage = headers.get('accept-language')
  if (acceptLanguage?.includes('es')) return 'es'
  
  return 'en'
} 