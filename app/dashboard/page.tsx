// app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSupabase } from '../providers'

export default function DashboardRedirector() {
  const { supabase } = useSupabase()
  const [status, setStatus] = useState<'loading'|'ready'|'no-enrollment'|'error'>('loading')
  const [message, setMessage] = useState<string>('Loading...')

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        setStatus('loading')
        setMessage('Loading...')

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setStatus('error')
          setMessage('Please sign in to view your training dashboard.')
          return
        }

        const { data: enrollments, error } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('user_id', user.id)
          .limit(1)

        if (error) {
          setStatus('error')
          setMessage(`Enrollment error: ${error.message}`)
          return
        }

        const courseId = enrollments?.[0]?.course_id
        if (courseId) {
          if (!cancelled) window.location.href = `/training?courseId=${courseId}`
          return
        }

        setStatus('no-enrollment')
        setMessage('No enrollment found for your account.')
      } catch (e: any) {
        setStatus('error')
        setMessage(e?.message || 'Unknown error')
      }
    }
    run()
    return () => { cancelled = true }
  }, [supabase])

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-xl font-bold text-[#0F172A] mb-2">Training Dashboard</h1>
      <p className="text-slate-700 mb-4">{message}</p>

      {status === 'no-enrollment' && (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">If you recently purchased, try refreshing in a moment.</p>
          <Link href="/dashboard-simple" className="inline-flex items-center justify-center rounded-2xl border px-4 py-2">
            Open classic dashboard
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-3">
          <Link href="/login" className="inline-flex items-center justify-center rounded-2xl bg-[#0F172A] text-white px-4 py-2">Sign in</Link>
          <div>
            <Link href="/dashboard-simple" className="inline-flex items-center justify-center rounded-2xl border px-4 py-2">
              Try classic dashboard
            </Link>
          </div>
        </div>
      )}
    </main>
  )
}