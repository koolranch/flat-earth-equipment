'use client'
import { useEffect, useState } from 'react'
import { useSupabase } from '../providers'

export default function DebugDashboard() {
  const [user, setUser] = useState<any>(null)
  const [enrollment, setEnrollment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { supabase } = useSupabase()

  useEffect(() => {
    async function loadData() {
      try {
        console.log('🔍 Starting debug dashboard load...')
        
        // Get user
        const { data: { user } } = await supabase.auth.getUser()
        console.log('👤 User:', user?.email || 'No user')
        
        if (!user) {
          setError('Not authenticated')
          setLoading(false)
          return
        }
        
        setUser(user)
        
        // Get enrollment - simplified query
        console.log('📚 Fetching enrollments...')
        const { data: enrollments, error: enrollError } = await supabase
          .from('enrollments')
          .select('id, user_id, course_id, progress_pct, passed')
          .eq('user_id', user.id)
          .limit(1)
        
        console.log('📚 Enrollments result:', { enrollments, error: enrollError })
        
        if (enrollError) {
          setError(`Enrollment error: ${enrollError.message}`)
          setLoading(false)
          return
        }
        
        if (enrollments && enrollments.length > 0) {
          setEnrollment(enrollments[0])
          console.log('✅ Enrollment loaded successfully')
        } else {
          setError('No enrollment found')
        }
        
      } catch (err: any) {
        console.error('❌ Debug dashboard error:', err)
        setError(err.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, []) // No dependencies to prevent loops

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Debug Dashboard</h1>
        <p>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Debug Dashboard</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Debug Dashboard</h1>
      
      <div className="space-y-4">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <strong>Success!</strong> Dashboard loaded without stack overflow.
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">User Info:</h2>
          <p>Email: {user?.email}</p>
          <p>ID: {user?.id}</p>
        </div>
        
        {enrollment && (
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="font-semibold mb-2">Enrollment Info:</h2>
            <p>ID: {enrollment.id}</p>
            <p>Course ID: {enrollment.course_id}</p>
            <p>Progress: {enrollment.progress_pct}%</p>
            <p>Passed: {enrollment.passed ? 'Yes' : 'No'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
