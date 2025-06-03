'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSupabase } from '../providers'
import QuizModal from '@/components/QuizModal'
import VideoPlayer from '@/components/VideoPlayer'
import HybridModule from '@/components/HybridModule'

export default function SimpleDashboard() {
  const [user, setUser] = useState<any>(null)
  const [enrollment, setEnrollment] = useState<any>(null)
  const [modules, setModules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showQuiz, setShowQuiz] = useState<number | null>(null)
  const [expandedModule, setExpandedModule] = useState<number | null>(null)
  
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

  const handleQuizPass = async (moduleOrder: number) => {
    console.log('handleQuizPass called for module:', moduleOrder)
    console.log('Enrollment ID:', enrollment?.id)
    console.log('Sending request to /api/progress with:', { enrollmentId: enrollment?.id, moduleOrder })
    
    if (!enrollment?.id) {
      console.error('No enrollment ID found!')
      alert('Error: No enrollment ID found. Please refresh the page.')
      return
    }
    
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          enrollmentId: enrollment.id, 
          moduleOrder 
        })
      })
      
      console.log('Progress API response:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Progress updated to:', data.progress)
        // Refresh the page to show updated progress
        window.location.reload()
      } else {
        const errorText = await response.text()
        console.error('Failed to update progress:', response.status, errorText)
        alert(`Failed to update progress: ${response.status} - ${errorText}`)
      }
    } catch (error) {
      console.error('Error updating progress:', error)
      alert(`Error updating progress: ${error}`)
    }
  }

  // Handle game completion - same as quiz completion
  const handleGameComplete = (moduleOrder: number) => {
    handleQuizPass(moduleOrder)
  }

  const isModuleUnlocked = (index: number) => {
    const requiredProgress = index * (100 / modules.length)
    const currentProgress = enrollment?.progress_pct || 0
    const unlocked = index === 0 || currentProgress >= requiredProgress
    console.log(`Module ${index + 1} unlocked check: ${currentProgress}% >= ${requiredProgress}% = ${unlocked}`)
    return unlocked
  }

  const isModuleCompleted = (index: number) => {
    const completionProgress = ((index + 1) * (100 / modules.length))
    const currentProgress = enrollment?.progress_pct || 0
    const completed = currentProgress >= completionProgress
    console.log(`Module ${index + 1} completed check: ${currentProgress}% >= ${completionProgress}% = ${completed}`)
    return completed
  }

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
        <h1 className="text-2xl font-bold">My Learning Dashboard</h1>
      </header>
      
      <main className="p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">{enrollment.course?.title || 'Course'}</h2>
          
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(enrollment.progress_pct || 0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-orange-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${enrollment.progress_pct || 0}%` }}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold">Modules ({modules.length})</h3>
            {modules.map((module, index) => {
              const unlocked = isModuleUnlocked(index)
              const completed = isModuleCompleted(index)
              const expanded = expandedModule === index
              const isGame = module.type === 'game'
              
              return (
                <div 
                  key={module.id} 
                  className={`border rounded-lg p-4 ${!unlocked ? 'opacity-50' : ''} ${completed ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                >
                  <div 
                    className={`flex items-center justify-between ${unlocked ? 'cursor-pointer' : ''}`}
                    onClick={() => unlocked && setExpandedModule(expanded ? null : index)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold">
                        {module.order}
                      </span>
                      <h4 className="font-medium">{module.title}</h4>
                      {isGame && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Interactive Demo
                        </span>
                      )}
                      {completed && (
                        <span className="text-green-600">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </div>
                    {unlocked && (
                      <svg 
                        className={`w-5 h-5 transform transition-transform ${expanded ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                  
                  {expanded && unlocked && (
                    <div className="mt-4 space-y-4">
                      {isGame ? (
                        <div>
                          <h5 className="font-medium mb-2">Cheyenne 3-Tap Check-off</h5>
                          <HybridModule 
                            gameKey={module.game_asset_key} 
                            onComplete={() => handleGameComplete(module.order)} 
                          />
                          <div className="text-sm text-gray-600 mt-2 space-y-1">
                            <p><strong>Training Objectives:</strong></p>
                            <ul className="list-disc list-inside ml-2 space-y-1">
                              <li>Tap vest to equip PPE</li>
                              <li>Tap ↓ to lower forks</li>
                              <li>Tap brake pedal to stop</li>
                            </ul>
                            <p className="font-medium">Complete all 3 steps to pass this module</p>
                          </div>
                        </div>
                      ) : (
                        module.video_url && (
                          <div>
                            <h5 className="font-medium mb-2">Video Lesson</h5>
                            <VideoPlayer 
                              src={module.video_url} 
                              className="w-full rounded-lg" 
                            />
                          </div>
                        )
                      )}
                      
                      {!completed && !isGame && (
                        <button 
                          onClick={() => setShowQuiz(index)}
                          className="rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
                        >
                          Take Quiz
                        </button>
                      )}
                    </div>
                  )}
                  
                  {!unlocked && (
                    <p className="text-sm text-gray-500 mt-2">Complete previous modules to unlock</p>
                  )}
                </div>
              )
            })}
          </div>
          
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
      
      {showQuiz !== null && modules[showQuiz]?.quiz_json && (
        <QuizModal
          questions={modules[showQuiz].quiz_json}
          onPass={() => handleQuizPass(modules[showQuiz].order)}
        />
      )}
    </div>
  )
} 