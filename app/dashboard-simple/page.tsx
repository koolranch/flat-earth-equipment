'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSupabase } from '../providers'
import QuizModal from '@/components/QuizModal'
import VideoPlayer from '@/components/VideoPlayer'
import HybridModule from '@/components/HybridModule'
import HandbookSection from '@/components/HandbookSection'
import CompletionActions from '@/components/CompletionActions'

export default function SimpleDashboard() {
  const [user, setUser] = useState<any>(null)
  const [enrollment, setEnrollment] = useState<any>(null)
  const [modules, setModules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showQuiz, setShowQuiz] = useState<number | null>(null)
  const [expandedModule, setExpandedModule] = useState<number | null>(null)
  const [moduleGuides, setModuleGuides] = useState<{[key: string]: any}>({})
  const [locale, setLocale] = useState<'en' | 'es'>('en')
  const [unclaimedPurchases, setUnclaimedPurchases] = useState<any[]>([])
  const [showClaimPrompt, setShowClaimPrompt] = useState(false)
  
  const { supabase } = useSupabase()

  // Get locale from cookie on client side
  useEffect(() => {
    const cookieLocale = document.cookie
      .split('; ')
      .find(row => row.startsWith('lang='))
      ?.split('=')[1] as 'en' | 'es'
    setLocale(cookieLocale || 'en')
  }, [])

  // Reload MDX content when locale changes
  useEffect(() => {
    if (expandedModule !== null && modules.length > 0) {
      const moduleData = modules[expandedModule]
      if (moduleData) {
        console.log(`🌐 Locale changed to ${locale}, reloading MDX for module ${moduleData.order}`)
        loadModuleGuide(moduleData.order)
      }
    }
  }, [locale, expandedModule, modules, loadModuleGuide])

  // Translation strings
  const t = {
    en: {
      loading: 'Loading...',
      accessRequired: 'Access Required',
      notAuthenticated: 'Please sign in to access your training dashboard.',
      signIn: 'Sign In',
      noAccount: 'Don\'t have an account?',
      purchaseTraining: 'Purchase training access',
      noEnrollments: 'No enrollments found',
      browseCourses: 'Browse courses',
      progress: 'Progress',
      completed: 'Completed',
      unlocked: 'Unlocked',
      locked: 'Locked',
      startModule: 'Start Module',
      continueModule: 'Continue Module',
      reviewModule: 'Review Module',
      takeQuiz: 'Take Quiz',
      retakeQuiz: 'Retake Quiz',
      moduleComplete: 'Module Complete',
      courseComplete: 'Course Complete!',
      downloadCertificate: 'Download Certificate',
      congratulations: 'Congratulations!',
      completedCourse: 'You have successfully completed',
      printCertificate: 'Your certificate is ready to print.',
      employerEvaluation: 'Remember: OSHA requires your employer to conduct a practical evaluation before you can operate independently.',
      downloadEvalForm: 'Download Employer Evaluation Form',
      myLearningDashboard: 'My Learning Dashboard',
      modules: 'Modules',
      interactiveDemo: 'Interactive Demo',
      completePrevious: 'Complete previous modules to unlock',
      videoLesson: 'Video Lesson',
      trainingObjectives: 'Training Objectives:',
      // Game-specific titles
      cheyenneCheckoff: 'Cheyenne 3-Tap Check-off',
      pointInspection: '8-Point Inspection',
      balloonBalance: 'Balloon-Fiesta Balance',
      hazardHunt: 'Hazard Hunt Game',
      bozemanShutdown: 'Bozeman Shutdown Sequence',
      // Training objectives
      tapVest: 'Tap vest to equip PPE',
      tapLower: 'Tap ↓ to lower forks',
      tapBrake: 'Tap brake pedal to stop',
      findInspection: 'Find and tap all 8 inspection points',
      completeInspection: 'Complete inspection within 45 seconds',
      avoidWrong: 'Avoid wrong taps (5-second penalty)',
      dragBoxes: 'Drag and place all 3 boxes to center target',
      completeBalance: 'Complete balance exercise within 60 seconds',
      maintainLoad: 'Maintain proper load positioning',
      identifyHazards: 'Identify and click on 10 workplace hazards',
      completeHazards: 'Complete hazard hunt within 60 seconds',
      avoidMisses: 'Avoid clicking empty areas (3 misses = restart)',
      followSequence: 'Follow the 7-step shutdown sequence',
      clickOrder: 'Click each step in the correct order',
      completeShutdown: 'Complete proper shutdown procedure',
      followPrompts: 'Follow the interactive prompts',
      completeTasks: 'Complete all required tasks',
      // Completion messages
      complete3Steps: 'Complete all 3 steps to pass this module',
      findAll8Points: 'Find all 8 inspection points to pass this module',
      placeAll3Boxes: 'Place all 3 boxes in the center target to pass this module',
      catchAll10Hazards: 'Catch all 10 hazards to pass this module',
      completeAll7Steps: 'Complete all 7 shutdown steps to pass this module',
      completeAllTasks: 'Complete all tasks to pass this module'
    },
    es: {
      loading: 'Cargando...',
      accessRequired: 'Acceso Requerido',
      notAuthenticated: 'Por favor inicie sesión para acceder a su panel de entrenamiento.',
      signIn: 'Iniciar Sesión',
      noAccount: '¿No tiene una cuenta?',
      purchaseTraining: 'Comprar acceso de entrenamiento',
      noEnrollments: 'No se encontraron inscripciones',
      browseCourses: 'Explorar cursos',
      progress: 'Progreso',
      completed: 'Completado',
      unlocked: 'Desbloqueado',
      locked: 'Bloqueado',
      startModule: 'Iniciar Módulo',
      continueModule: 'Continuar Módulo',
      reviewModule: 'Revisar Módulo',
      takeQuiz: 'Tomar Cuestionario',
      retakeQuiz: 'Repetir Cuestionario',
      moduleComplete: 'Módulo Completo',
      courseComplete: '¡Curso Completo!',
      downloadCertificate: 'Descargar Certificado',
      congratulations: '¡Felicitaciones!',
      completedCourse: 'Ha completado exitosamente',
      printCertificate: 'Su certificado está listo para imprimir.',
      employerEvaluation: 'Recuerde: OSHA requiere que su empleador realice una evaluación práctica antes de que pueda operar independientemente.',
      downloadEvalForm: 'Descargar Formulario de Evaluación del Empleador',
      myLearningDashboard: 'Mi Panel de Aprendizaje',
      modules: 'Módulos',
      interactiveDemo: 'Demostración Interactiva',
      completePrevious: 'Complete los módulos anteriores para desbloquear',
      videoLesson: 'Lección en Video',
      trainingObjectives: 'Objetivos de Entrenamiento:',
      // Game-specific titles
      cheyenneCheckoff: 'Verificación de 3 Toques Cheyenne',
      pointInspection: 'Inspección de 8 Puntos',
      balloonBalance: 'Equilibrio de Globos-Fiesta',
      hazardHunt: 'Juego de Caza de Peligros',
      bozemanShutdown: 'Secuencia de Apagado Bozeman',
      // Training objectives
      tapVest: 'Toque el chaleco para equipar EPP',
      tapLower: 'Toque ↓ para bajar las horquillas',
      tapBrake: 'Toque el pedal de freno para parar',
      findInspection: 'Encuentre y toque todos los 8 puntos de inspección',
      completeInspection: 'Complete la inspección en 45 segundos',
      avoidWrong: 'Evite toques incorrectos (penalización de 5 segundos)',
      dragBoxes: 'Arrastre y coloque las 3 cajas en el objetivo central',
      completeBalance: 'Complete el ejercicio de equilibrio en 60 segundos',
      maintainLoad: 'Mantenga el posicionamiento adecuado de la carga',
      identifyHazards: 'Identifique y haga clic en 10 peligros del lugar de trabajo',
      completeHazards: 'Complete la caza de peligros en 60 segundos',
      avoidMisses: 'Evite hacer clic en áreas vacías (3 fallos = reiniciar)',
      followSequence: 'Siga la secuencia de apagado de 7 pasos',
      clickOrder: 'Haga clic en cada paso en el orden correcto',
      completeShutdown: 'Complete el procedimiento de apagado adecuado',
      followPrompts: 'Siga las indicaciones interactivas',
      completeTasks: 'Complete todas las tareas requeridas',
      // Completion messages
      complete3Steps: 'Complete los 3 pasos para aprobar este módulo',
      findAll8Points: 'Encuentre todos los 8 puntos de inspección para aprobar este módulo',
      placeAll3Boxes: 'Coloque las 3 cajas en el objetivo central para aprobar este módulo',
      catchAll10Hazards: 'Atrape todos los 10 peligros para aprobar este módulo',
      completeAll7Steps: 'Complete todos los 7 pasos de apagado para aprobar este módulo',
      completeAllTasks: 'Complete todas las tareas para aprobar este módulo'
    }
  }[locale]

  // Load MDX guide content for a module
  const loadModuleGuide = useCallback(async (moduleOrder: number) => {
    // Always reload when locale changes - don't use cache
    const cacheKey = `${moduleOrder}-${locale}`
    if (moduleGuides[cacheKey]) return // Already loaded for this locale
    
    try {
      console.log(`🔄 Loading MDX guide for module ${moduleOrder} in locale ${locale}`)
      const response = await fetch(`/api/module-guide?moduleOrder=${moduleOrder}&locale=${locale}`)
      if (response.ok) {
        const { mdxContent } = await response.json()
        console.log(`✅ Loaded MDX guide for module ${moduleOrder} in ${locale}:`, mdxContent.frontmatter?.title)
        setModuleGuides(prev => ({ ...prev, [cacheKey]: mdxContent }))
      } else {
        console.warn(`No guide content found for module ${moduleOrder} in ${locale}`)
      }
    } catch (error) {
      console.error(`Error loading guide for module ${moduleOrder} in ${locale}:`, error)
    }
  }, [locale, moduleGuides])

  useEffect(() => {
    async function loadData() {
      try {
        // Check if this is a test session from checkout
        const urlParams = new URLSearchParams(window.location.search)
        const sessionId = urlParams.get('session_id')
        
        // Get user
        const { data: { user } } = await supabase.auth.getUser()
        
        let userId = user?.id
        
        // Handle auto-login after purchase - if no authenticated user but there's a session_id
        if (!user && sessionId) {
          console.log('🔐 No authenticated user but session_id found, attempting auto-login')
          console.log('📋 Session ID:', sessionId)
          
          try {
            const autoLoginResponse = await fetch('/api/auto-login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId })
            })
            
            console.log('📡 Auto-login API response status:', autoLoginResponse.status)
            
            if (autoLoginResponse.ok) {
              const { tokens, user: userData, course, loginUrl } = await autoLoginResponse.json()
              console.log('✅ Auto-login tokens received for:', userData.email)
              console.log('📚 Course:', course)
              console.log('🔑 Has tokens:', !!tokens?.access_token && !!tokens?.refresh_token)
              
              // Try to sign in directly with tokens if available
              if (tokens?.access_token && tokens?.refresh_token) {
                console.log('🔑 Signing in with tokens...')
                
                const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                  access_token: tokens.access_token,
                  refresh_token: tokens.refresh_token
                })
                
                if (sessionError) {
                  console.error('❌ Failed to set session with tokens:', sessionError)
                  // Fall back to magic link redirect
                  if (loginUrl) {
                    console.log('🔄 Falling back to magic link redirect')
                    window.location.href = loginUrl
                    return
                  }
                } else {
                  console.log('✅ Successfully signed in with tokens!')
                  console.log('👤 User ID:', sessionData.user?.id)
                  console.log('📧 User email:', sessionData.user?.email)
                  // Set the user and continue with data loading
                  if (sessionData.user) {
                    setUser(sessionData.user)
                    userId = sessionData.user.id
                    
                    // Remove the session_id from URL to clean up
                    const newUrl = new URL(window.location.href)
                    newUrl.searchParams.delete('session_id')
                    window.history.replaceState({}, '', newUrl.toString())
                    console.log('🧹 Cleaned up URL')
                    
                    // Continue with enrollment loading below
                  } else {
                    console.error('❌ No user data in session')
                    // Fall back to magic link redirect
                    if (loginUrl) {
                      console.log('🔄 Falling back to magic link redirect')
                      window.location.href = loginUrl
                      return
                    }
                  }
                }
              } else {
                console.log('🔄 No tokens available, using magic link redirect')
                // Fall back to magic link redirect
                if (loginUrl) {
                  window.location.href = loginUrl
                  return
                }
              }
            } else {
              const errorData = await autoLoginResponse.json()
              console.log('⚠️ Auto-login failed:', errorData)
              // Fall through to show login prompt
            }
          } catch (error) {
            console.error('❌ Auto-login error:', error)
            // Fall through to show login prompt
          }
        }
        
        if (!userId) {
          setError('Not authenticated')
          setLoading(false)
          return
        }
        
        if (user) {
          setUser(user)
          
          // Check for unclaimed purchases for authenticated users
          try {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.access_token) {
              const response = await fetch('/api/claim-training', {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${session.access_token}`,
                  'Content-Type': 'application/json'
                }
              })
              
              if (response.ok) {
                const data = await response.json()
                if (data.count > 0) {
                  console.log(`Found ${data.count} unclaimed purchases`)
                  setUnclaimedPurchases(data.purchases)
                  setShowClaimPrompt(true)
                }
              }
            }
          } catch (error) {
            console.error('Error checking unclaimed purchases:', error)
          }
        }
        
        // Get enrollment
        const { data: enrollments, error: enrollError } = await supabase
          .from('enrollments')
          .select('id, user_id, course_id, progress_pct, passed, cert_url, expires_at, created_at')
          .eq('user_id', userId)
        
        if (enrollError) {
          setError(`Enrollment error: ${enrollError.message}`)
          setLoading(false)
          return
        }
        
        if (enrollments && enrollments.length > 0) {
          const enrollment = enrollments[0]
          
          // Get course information separately
          const { data: courseData, error: courseError } = await supabase
            .from('courses')
            .select('id, title, slug, description, price_cents')
            .eq('id', enrollment.course_id)
            .single()
          
          if (courseError) {
            setError(`Course error: ${courseError.message}`)
            setLoading(false)
            return
          }
          
          // Combine enrollment with course data
          const enrollmentWithCourse = {
            ...enrollment,
            course: courseData
          }
          setEnrollment(enrollmentWithCourse)
          
          // Get modules
          const { data: moduleData, error: moduleError } = await supabase
            .from('modules')
            .select('*')
            .eq('course_id', enrollment.course_id)
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

  // Handle game completion - opens quiz modal for the same module
  const handleGameComplete = (moduleOrder: number) => {
    console.log('🎮 Game completed for module order:', moduleOrder)
    // Find the module index (modules array is 0-indexed, but order starts at 1)
    const moduleIndex = modules.findIndex(m => m.order === moduleOrder)
    console.log('📍 Found module at index:', moduleIndex, 'Module:', modules[moduleIndex]?.title)
    
    if (moduleIndex !== -1 && modules[moduleIndex]?.quiz_json) {
      console.log('📝 Opening quiz for module:', modules[moduleIndex].title)
      setShowQuiz(moduleIndex)  // Open quiz modal for this module
    } else {
      console.error('❌ No quiz found for module order:', moduleOrder)
      console.log('Available modules with quiz:', modules.map(m => ({ order: m.order, title: m.title, hasQuiz: !!m.quiz_json })))
      
      // If no quiz, proceed directly to mark as complete
      handleQuizPass(moduleOrder)
    }
  }

  const isModuleUnlocked = (index: number) => {
    const requiredProgress = index * (100 / modules.length)
    const currentProgress = enrollment?.progress_pct || 0
    // Add a small tolerance for floating-point precision issues
    const tolerance = 0.01
    const unlocked = index === 0 || currentProgress >= (requiredProgress - tolerance)
    console.log(`Module ${index + 1} unlocked check: ${currentProgress}% >= ${requiredProgress}% (with tolerance) = ${unlocked}`)
    return unlocked
  }

  const isModuleCompleted = (index: number) => {
    const completionProgress = ((index + 1) * (100 / modules.length))
    const currentProgress = enrollment?.progress_pct || 0
    // Add a small tolerance for floating-point precision issues
    const tolerance = 0.01
    const completed = currentProgress >= (completionProgress - tolerance)
    console.log(`Module ${index + 1} completed check: ${currentProgress}% >= ${completionProgress}% (with tolerance) = ${completed}`)
    return completed
  }

  const handleClaimPurchases = async () => {
    if (!user) return
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return
      
      const response = await fetch('/api/claim-training', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Claimed purchases:', data)
        setShowClaimPrompt(false)
        setUnclaimedPurchases([])
        // Refresh the page to show new enrollments
        window.location.reload()
      } else {
        const errorData = await response.json()
        console.error('Failed to claim purchases:', errorData)
        alert('Failed to claim purchases. Please try again or contact support.')
      }
    } catch (error) {
      console.error('Error claiming purchases:', error)
      alert('Error claiming purchases. Please try again or contact support.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="text-center">{t.loading}</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.accessRequired}</h2>
            <p className="text-gray-600 mb-6">
              {error === 'Not authenticated' 
                ? t.notAuthenticated
                : error}
            </p>
            <div className="space-y-4">
              <Link 
                href="/login" 
                className="inline-block w-full sm:w-auto px-6 py-3 bg-orange-600 text-white font-medium rounded-md hover:bg-orange-700 transition-colors"
              >
                {t.signIn}
              </Link>
              <div className="text-sm text-gray-500">
                {t.noAccount} {' '}
                <Link href="/safety" className="text-orange-600 hover:text-orange-700">
                  {t.purchaseTraining}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!enrollment) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t.noEnrollments}</h1>
          <Link href="/safety" className="text-orange-600 hover:underline">
            {t.browseCourses}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow p-6">
        <h1 className="text-2xl font-bold">{t.myLearningDashboard}</h1>
      </header>
      
      {/* Unclaimed Purchases Prompt */}
      {showClaimPrompt && unclaimedPurchases.length > 0 && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 m-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Training Purchase Found!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  We found {unclaimedPurchases.length} training purchase{unclaimedPurchases.length > 1 ? 's' : ''} for your email. 
                  Click below to activate your training access.
                </p>
                <div className="mt-3 flex gap-3">
                  <button
                    onClick={handleClaimPurchases}
                    className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                  >
                    Activate Training Access
                  </button>
                  <button
                    onClick={() => setShowClaimPrompt(false)}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm hover:bg-gray-300"
                  >
                    Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <main className="p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">{enrollment.course?.title || 'Course'}</h2>
          
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{t.progress}</span>
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
            <h3 className="font-semibold">{t.modules} ({modules.length})</h3>
            {modules.map((module, index) => {
              const unlocked = isModuleUnlocked(index)
              const completed = isModuleCompleted(index)
              const expanded = expandedModule === index
              const isGame = module.type === 'game'
              
              // Debug logging for Module 3
              if (module.title && (module.title.toLowerCase().includes('module 3') || module.title.toLowerCase().includes('balance') || module.order === 3)) {
                console.log('🔍 Module 3 Debug:', {
                  title: module.title,
                  type: module.type,
                  game_asset_key: module.game_asset_key,
                  intro_url: module.intro_url,
                  video_url: module.video_url,
                  order: module.order,
                  isGame: isGame
                })
              }
              
              return (
                <div 
                  key={module.id} 
                  className={`border rounded-lg p-4 ${!unlocked ? 'opacity-50' : ''} ${completed ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                >
                  <div 
                    className={`flex items-center justify-between ${unlocked ? 'cursor-pointer' : ''}`}
                    onClick={() => {
                      if (!unlocked) return
                      const newIndex = expanded ? null : index
                      setExpandedModule(newIndex)
                      // Load MDX guide content when expanding
                      if (newIndex !== null) {
                        loadModuleGuide(module.order)
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold">
                        {module.order}
                      </span>
                      <h4 className="font-medium">{module.title}</h4>
                      {isGame && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {t.interactiveDemo}
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
                      <HandbookSection 
                        moduleOrder={module.order} 
                        moduleTitle={module.title}
                        locale={locale}
                      />
                      
                      {isGame ? (
                        <div>
                          <h5 className="font-medium mb-2">
                            {module.game_asset_key === 'module1' ? t.cheyenneCheckoff : 
                             module.game_asset_key === 'module2' ? t.pointInspection : 
                             module.game_asset_key === 'module3' ? t.balloonBalance :
                             module.game_asset_key === 'module4' ? t.hazardHunt :
                             module.game_asset_key === 'module5' ? t.bozemanShutdown :
                             t.interactiveDemo}
                          </h5>
                          <HybridModule 
                            gameKey={module.game_asset_key}
                            introUrl={module.intro_url}
                            guideMdx={moduleGuides[`${module.order}-${locale}`]}
                            enrollmentId={enrollment?.id}
                            locale={locale}
                            moduleId={module.order}
                            onComplete={() => handleQuizPass(module.order)} 
                          />
                          <div className="text-sm text-gray-600 mt-2 space-y-1">
                            <p><strong>{t.trainingObjectives}</strong></p>
                            {module.game_asset_key === 'module1' ? (
                              <ul className="list-disc list-inside ml-2 space-y-1">
                                <li>{t.tapVest}</li>
                                <li>{t.tapLower}</li>
                                <li>{t.tapBrake}</li>
                              </ul>
                            ) : module.game_asset_key === 'module2' ? (
                              <ul className="list-disc list-inside ml-2 space-y-1">
                                <li>{t.findInspection}</li>
                                <li>{t.completeInspection}</li>
                                <li>{t.avoidWrong}</li>
                              </ul>
                            ) : module.game_asset_key === 'module3' ? (
                              <ul className="list-disc list-inside ml-2 space-y-1">
                                <li>{t.dragBoxes}</li>
                                <li>{t.completeBalance}</li>
                                <li>{t.maintainLoad}</li>
                              </ul>
                            ) : module.game_asset_key === 'module4' ? (
                              <ul className="list-disc list-inside ml-2 space-y-1">
                                <li>{t.identifyHazards}</li>
                                <li>{t.completeHazards}</li>
                                <li>{t.avoidMisses}</li>
                              </ul>
                            ) : module.game_asset_key === 'module5' ? (
                              <ul className="list-disc list-inside ml-2 space-y-1">
                                <li>{t.followSequence}</li>
                                <li>{t.clickOrder}</li>
                                <li>{t.completeShutdown}</li>
                              </ul>
                            ) : (
                              <ul className="list-disc list-inside ml-2 space-y-1">
                                <li>{t.followPrompts}</li>
                                <li>{t.completeTasks}</li>
                              </ul>
                            )}
                            <p className="font-medium">
                              {module.game_asset_key === 'module1' ? t.complete3Steps :
                               module.game_asset_key === 'module2' ? t.findAll8Points :
                               module.game_asset_key === 'module3' ? t.placeAll3Boxes :
                               module.game_asset_key === 'module4' ? t.catchAll10Hazards :
                               module.game_asset_key === 'module5' ? t.completeAll7Steps :
                               t.completeAllTasks}
                            </p>
                          </div>
                        </div>
                      ) : (
                        module.video_url && (
                          <div>
                            <h5 className="font-medium mb-2">{t.videoLesson}</h5>
                            <VideoPlayer 
                              src={module.video_url} 
                              className="rounded-lg" 
                            />
                          </div>
                        )
                      )}
                      
                      {!completed && !isGame && (
                        <button 
                          onClick={() => setShowQuiz(index)}
                          className="rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
                        >
                          {t.takeQuiz}
                        </button>
                      )}
                    </div>
                  )}
                  
                  {!unlocked && (
                    <p className="text-sm text-gray-500 mt-2">{t.locked} previous modules to unlock</p>
                  )}
                </div>
              )
            })}
          </div>
          
          {enrollment.passed && enrollment.cert_url && (
            <div className="mt-8 p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">{t.congratulations}</h3>
              <p className="text-green-700 mb-3">{t.completedCourse} the course.</p>
              <CompletionActions 
                certificateUrl={enrollment.cert_url}
                courseId={enrollment.course_id}
                user={user}
                enrollmentId={enrollment.id}
              />
            </div>
          )}
          
          <div className="mt-6 pt-6 border-t">
            <Link 
              href="/api/evaluation-pdf" 
              target="_blank"
              className="text-sm text-gray-600 hover:text-orange-600 underline"
            >
              {t.downloadEvalForm}
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