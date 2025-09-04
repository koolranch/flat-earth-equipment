'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useSupabase } from '../providers'
import Cookies from 'js-cookie'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [locale, setLocale] = useState<'en' | 'es'>('en')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { supabase } = useSupabase()

  // Get locale from cookie on client side
  useEffect(() => {
    const savedLocale = Cookies.get('lang') as 'en' | 'es' || 'en'
    setLocale(savedLocale)
  }, [])

  // Translation strings
  const t = {
    en: {
      title: 'Sign in to your account',
      subtitle: 'Access your Operator Safety Training dashboard',
      emailLabel: 'Email address',
      passwordLabel: 'Password',
      signInButton: 'Sign in',
      signingInButton: 'Signing in...',
      orText: 'Or',
      learnMoreLink: 'Learn about our safety training courses',
      unexpectedError: 'An unexpected error occurred'
    },
    es: {
      title: 'Iniciar sesión en su cuenta',
      subtitle: 'Acceda a su panel de Entrenamiento de Seguridad del Operador',
      emailLabel: 'Dirección de correo electrónico',
      passwordLabel: 'Contraseña',
      signInButton: 'Iniciar sesión',
      signingInButton: 'Iniciando sesión...',
      orText: 'O',
      learnMoreLink: 'Conozca nuestros cursos de entrenamiento de seguridad',
      unexpectedError: 'Ocurrió un error inesperado'
    }
  }[locale]

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        const nextUrl = searchParams?.get('next') || '/dashboard'
        router.push(nextUrl)
        router.refresh()
      }
    } catch (err) {
      setError(t.unexpectedError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {t.title}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t.subtitle}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="rounded-md bg-red-50 p-4" role="alert" aria-live="polite">
                <div className="text-sm text-red-800">{error}</div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t.emailLabel}
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!error && error.toLowerCase().includes('email')}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm tappable"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t.passwordLabel}
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!error && error.toLowerCase().includes('password')}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm tappable"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                aria-label={loading ? t.signingInButton : `${t.signInButton} to access training dashboard`}
                className="btn w-full flex justify-center text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t.signingInButton : t.signInButton}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t.orText}</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link href="/safety" className="font-medium text-orange-600 hover:text-orange-500">
                {t.learnMoreLink}
              </Link>
            </div>
          </div>


        </div>
      </div>
    </div>
  )
} 