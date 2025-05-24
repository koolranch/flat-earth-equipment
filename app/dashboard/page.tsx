import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import Link from 'next/link'
import ModuleRow from './ModuleRow'

export default async function Dashboard() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        }
      }
    }
  )
  
  // Check if this is just a payment success redirect
  const isPaymentSuccess = cookieStore.get('payment_success')
  if (isPaymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-green-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-gray-600">Your order has been processed. Check your email for next steps.</p>
          </div>
        </div>
      </div>
    )
  }
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your courses</h1>
          <Link href="/login" className="text-orange-600 hover:underline">
            Go to login
          </Link>
        </div>
      </div>
    )
  }
  
  // Get enrollment data with course and modules
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      *,
      course:courses(*),
      modules:courses!inner(modules(*))
    `)
    .eq('user_id', user.id)
  
  if (!enrollments || enrollments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">No active enrollments</h1>
          <Link href="/safety" className="text-orange-600 hover:underline">
            Browse courses
          </Link>
        </div>
      </div>
    )
  }

  // Take the first enrollment (or most recent)
  const enrollment = enrollments[0]
  const modules = enrollment.modules.modules || []
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">My Learning Dashboard</h1>
        </div>
      </header>
      
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="mb-4 text-xl font-bold">{enrollment.course.title}</h2>
          
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(enrollment.progress_pct || 0)}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-gray-200">
              <div
                style={{ width: `${enrollment.progress_pct || 0}%` }}
                className="h-3 rounded-full bg-orange-600 transition-all duration-300"
              />
            </div>
          </div>

          {/* Modules */}
          <div className="space-y-4">
            {modules.map((module: any, index: number) => (
              <ModuleRow 
                key={module.id} 
                module={module} 
                enrollmentId={enrollment.id} 
                isUnlocked={index === 0 || (enrollment.progress_pct || 0) >= (index * (100 / modules.length))}
                isCompleted={(enrollment.progress_pct || 0) > ((index + 1) * (100 / modules.length))}
              />
            ))}
          </div>

          {/* Certificate download */}
          {enrollment.passed && enrollment.cert_url && (
            <div className="mt-8 p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">🎉 Congratulations!</h3>
              <p className="text-green-700 mb-3">You've successfully completed the course.</p>
              <Link 
                href={enrollment.cert_url} 
                target="_blank"
                className="inline-block rounded bg-green-700 px-6 py-3 font-medium text-white hover:bg-green-800"
              >
                Download Certificate
              </Link>
            </div>
          )}
          
          {/* Employer evaluation */}
          <div className="mt-6 pt-6 border-t">
            <Link 
              href="/evaluation.pdf" 
              target="_blank" 
              className="text-sm text-gray-600 hover:text-orange-600 underline"
            >
              Download Employer Evaluation Sheet
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
} 