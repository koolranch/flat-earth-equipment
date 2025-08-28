// app/dashboard-new/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSupabase } from '../providers'

type NextStep = { nextRoute: string; label: string } | null
type CourseProgress = { pct: number; stepsLeft: { route: string; label: string }[]; next: NextStep }

export default function DashboardNew() {
  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<CourseProgress>({ pct: 0, stepsLeft: [], next: null })

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          window.location.href = '/login?next=/dashboard-new'
          return
        }

        const { data: enrollments, error: enrollErr } = await supabase
          .from('enrollments')
          .select('id, course_id, progress_pct, resume_state')
          .eq('user_id', user.id)
          .limit(1)

        if (enrollErr) throw new Error(enrollErr.message)
        const enrollment = enrollments?.[0]
        if (!enrollment?.course_id) {
          setError('No enrollment found for your account.')
          return
        }

        const { data: modules, error: modErr } = await supabase
          .from('modules')
          .select('id, title, order')
          .eq('course_id', enrollment.course_id)
          .order('order')

        if (modErr) throw new Error(modErr.message)

        const stepsLeft = (modules || []).map(m => ({ route: `/module/${m.id}`, label: m.title }))
        const pct = enrollment.progress_pct ?? 0
        const resume = (enrollment.resume_state as any)?.next_route as string | undefined
        const next: NextStep = resume
          ? { nextRoute: resume, label: 'Resume training' }
          : (stepsLeft[0] ? { nextRoute: stepsLeft[0].route, label: stepsLeft[0].label } : null)

        if (!cancelled) setProgress({ pct, stepsLeft, next })
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Unknown error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [supabase])

  if (loading) {
    return (
      <main className="container mx-auto p-4">
        <h1 className="text-xl font-bold text-[#0F172A] mb-2">Training Hub</h1>
        <p className="text-slate-700">Loading…</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="container mx-auto p-4">
        <h1 className="text-xl font-bold text-[#0F172A] mb-2">Training Hub</h1>
        <p className="text-red-700 mb-4">{error}</p>
        <Link href="/dashboard-simple" className="inline-flex items-center justify-center rounded-2xl border px-4 py-2">Open classic dashboard</Link>
      </main>
    )
  }

  return (
    <main className="container mx-auto p-4">
      <header className='sticky top-0 z-10 bg-white/90 backdrop-blur border-b py-3'>
        <div className='flex items-center justify-between'>
          <h1 className='text-xl font-bold text-[#0F172A]'>Training Hub</h1>
          <div className='min-w-[140px]'>
            <div className='text-xs text-slate-600'>Progress: {progress.pct}%</div>
            <div className='h-2 bg-slate-200 rounded-full overflow-hidden'>
              <div className='h-2 bg-[#F76511]' style={{ width: `${progress.pct}%` }} />
            </div>
          </div>
        </div>
      </header>

      <section className='mt-4 space-y-3'>
        {progress.next ? (
          <a className='inline-flex items-center justify-center rounded-2xl bg-[#F76511] text-white px-4 py-3 shadow-lg' href={progress.next.nextRoute}>
            Resume training
          </a>
        ) : <div className='text-sm text-emerald-700'>All set — course complete.</div>}

        <div className='rounded-2xl border p-4'>
          <h2 className='text-lg font-semibold text-[#0F172A]'>What's left</h2>
          <ul className='mt-2 space-y-2'>
            {progress.stepsLeft.map(s => (
              <li key={s.route} className='flex items-center justify-between'>
                <span>{s.label}</span>
                <a className='rounded-xl border px-3 py-1' href={s.route}>Open</a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}



