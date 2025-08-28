// app/dashboard-new/page.tsx
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function DashboardNew() {
  const sb = supabaseServer()
  const { data: userRes } = await sb.auth.getUser()
  if (!userRes?.user) {
    redirect('/login?next=/dashboard-new')
  }

  const { data: enrollment, error } = await sb
    .from('enrollments')
    .select('course_id')
    .eq('user_id', userRes.user.id)
    .limit(1)
    .maybeSingle()

  if (!error && enrollment?.course_id) {
    redirect(`/training?courseId=${enrollment.course_id}`)
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-xl font-bold text-[#0F172A] mb-2">Training Dashboard</h1>
      <p className="text-slate-700 mb-4">No enrollment found for your account.</p>
      <a href="/dashboard-simple" className="inline-flex items-center justify-center rounded-2xl border px-4 py-2">Open classic dashboard</a>
    </main>
  )
}


