'use client'
import { useRouter, usePathname } from 'next/navigation'

export default function LanguageToggle({ locale }: { locale: 'en' | 'es' }) {
  const router = useRouter()
  const pathname = usePathname()
  const next = locale === 'en' ? 'es' : 'en'
  const target = `/${next}${pathname.replace(/^\/(en|es)/, '')}`

  return (
    <button
      aria-label={next === 'es' ? 'Cambiar a Español' : 'Switch to English'}
      className="rounded-md px-2 py-1 text-sm font-medium transition hover:bg-slate-100"
      onClick={() => {
        document.cookie = `lang=${next}; path=/; max-age=${60 * 60 * 24 * 365}`
        router.push(target)
      }}
    >
      🌐 {next.toUpperCase()}
    </button>
  )
} 