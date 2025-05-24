'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSupabase } from '../providers'

export default function SimpleDashboard() {
  const [user, setUser] = useState<any>(null)
  const [enrollment, setEnrollment] = useState<any>(null)
  const [modules, setModules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { supabase } = useSupabase()

  useEffect(() => {
    async function loadData() {
      try {
        // Get user
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setError('Not authenticated')
          setLoading(false)
          return
        }
        
        setUser(user)
        
        // Get enrollment
        const { data: enrollments, error: enrollError } = await supabase
          .from('enrollments')
          .select('*, course:courses(*)')
          .eq('user_id', user.id)
        
        if (enrollError) {
          setError(`Enrollment error: ${enrollError.message}`)
          setLoading(false)
          return
        }
        
        if (enrollments && enrollments.length > 0) {
          setEnrollment(enrollments[0])
          
          // Get modules
          const { data: moduleData, error: moduleError } = await supabase
            .from('modules')
            .select('*')
            .eq('course_id', enrollments[0].course_id)
            .order('order')
          
          if (moduleError) {
            setError(`Module error: ${moduleError.message}`)
          } else {
            setModules(moduleData || [])
          }
        }
        
      } catch (err: any) {
        setError(err.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <h2 className="text-red-700 font-semibold">Error</h2>
            <p className="text-red-600">{error}</p>
            <Link href="/login" className="text-blue-600 hover:underline mt-2 inline-block">
              Go to login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!enrollment) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No enrollments found</h1>
          <Link href="/safety" className="text-orange-600 hover:underline">
            Browse courses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow p-6">
        <h1 className="text-2xl font-bold">Simple Dashboard</h1>
      </header>
      
      <main className="p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">{enrollment.course?.title || 'Course'}</h2>
          
          <div className="mb-6">
            <p className="text-sm text-gray-600">Progress: {enrollment.progress_pct || 0}%</p>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
              <div 
                className="bg-orange-600 h-3 rounded-full"
                style={{ width: `${enrollment.progress_pct || 0}%` }}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold">Modules ({modules.length})</h3>
            {modules.map((module) => (
              <div key={module.id} className="border rounded p-4">
                <h4 className="font-medium">
                  {module.order}. {module.title}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {module.video_url ? 'Video available' : 'No video'}
                  {module.quiz_json ? ' • Quiz available' : ''}
                </p>
              </div>
            ))}
          </div>
          
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