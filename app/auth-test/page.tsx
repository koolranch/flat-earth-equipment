'use client'
import { useEffect, useState } from 'react'
import { useSupabase } from '../providers'

export default function AuthTest() {
  const [user, setUser] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { supabase } = useSupabase()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const { data: { user } } = await supabase.auth.getUser()
      
      setSession(session)
      setUser(user)
      setLoading(false)
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event)
      setSession(session)
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Auth Debug Page</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Session Status:</h2>
          <pre className="text-sm">{session ? 'Authenticated' : 'Not authenticated'}</pre>
        </div>

        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">User Info:</h2>
          <pre className="text-sm whitespace-pre-wrap">
            {user ? JSON.stringify({
              id: user.id,
              email: user.email,
              created_at: user.created_at
            }, null, 2) : 'No user'}
          </pre>
        </div>

        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Session Details:</h2>
          <pre className="text-sm whitespace-pre-wrap">
            {session ? JSON.stringify({
              access_token: session.access_token ? 'Present' : 'Missing',
              refresh_token: session.refresh_token ? 'Present' : 'Missing',
              expires_at: session.expires_at,
              user_email: session.user?.email
            }, null, 2) : 'No session'}
          </pre>
        </div>

        <div className="mt-6 space-x-4">
          <a 
            href="/login" 
            className="inline-block px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Go to Login
          </a>
          <a 
            href="/dashboard" 
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
} 