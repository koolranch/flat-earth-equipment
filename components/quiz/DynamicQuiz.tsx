'use client'
import { useState, useEffect } from 'react'
import QuizModal from '../QuizModal'
import ResultsToast from './ResultsToast'

type QuizQuestion = { q: string; choices: string[]; answer: number }

export default function DynamicQuiz({
  slug,
  locale = 'en',
  onComplete,
  enrollmentId
}: {
  slug: string
  locale?: 'en' | 'es'
  onComplete?: () => void
  enrollmentId?: string
}) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showQuiz, setShowQuiz] = useState(false)
  const [finished, setFinished] = useState(false)
  const [scorePct, setScorePct] = useState(0)
  const passMark = 80

  useEffect(() => {
    async function loadQuiz() {
      try {
        setIsLoading(true)
        
        // Map numeric IDs to slugs for quiz files
        const getQuizSlug = (id: string): string => {
          // If it's already a string slug, use it directly
          if (isNaN(Number(id))) {
            return id
          }
          
          // Map numeric IDs to quiz slugs
          switch (Number(id)) {
            case 1: return 'pre-operation-inspection'  // Module 1: Pre-Op
            case 2: return 'eight-point-inspection'    // Module 2: 8-Point
            case 3: return 'module3'                   // Module 3: Operating Procedures
            case 4: return 'module4'                   // Module 4: Load Handling
            case 5: return 'module5'                   // Module 5: Advanced Operations
            default: return `module${id}`              // Fallback pattern
          }
        }
        
        const quizSlug = getQuizSlug(slug)
        const fileName = locale === 'es' ? `${quizSlug}_es.json` : `${quizSlug}.json`
        
        console.log(`🧩 Loading quiz for ID/slug ${slug} → ${quizSlug}: ${fileName}`)
        
        let response
        try {
          // Try to load localized version first
          response = await fetch(`/api/quiz/${fileName}`)
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
        } catch (localizedError) {
          console.log(`Localized quiz not found for ${locale}, error:`, localizedError)
          // Fallback to English version if localized version doesn't exist
          console.log(`Falling back to English version`)
          const fallbackFileName = `${quizSlug}.json`
          console.log(`Fallback file: ${fallbackFileName}`)
          response = await fetch(`/api/quiz/${fallbackFileName}`)
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
        }
        
        const quiz = await response.json()
        console.log('Quiz loaded successfully:', quiz)
        setQuestions(quiz)
        setError(null)
      } catch (err) {
        console.error('Failed to load quiz - full error:', err)
        setError(`Failed to load quiz: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadQuiz()
  }, [slug, locale])

  const handleQuizPass = (score: number, total: number, passed: boolean) => {
    setShowQuiz(false)
    const pct = total ? (score / total) * 100 : 0
    setScorePct(pct)
    setFinished(true)
    console.log(`Quiz completed: ${score}/${total} = ${pct}% (${passed ? 'PASSED' : 'FAILED'})`)
    if (passed && onComplete) {
      onComplete()
    }
  }

  const t = {
    en: {
      loading: 'Loading quiz...',
      quizTime: 'Quiz time!',
      instructions: 'Complete the quiz to finish this module.',
      takeQuiz: 'Take Quiz'
    },
    es: {
      loading: 'Cargando cuestionario...',
      quizTime: '¡Hora del cuestionario!',
      instructions: 'Complete el cuestionario para terminar este módulo.',
      takeQuiz: 'Tomar Cuestionario'
    }
  }[locale]

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">{t.loading}</p>
      </div>
    )
  }

  if (error) {
    // Map the slug for error display
    const getQuizSlug = (id: string): string => {
      if (isNaN(Number(id))) return id
      switch (Number(id)) {
        case 1: return 'pre-operation-inspection'
        case 2: return 'eight-point-inspection'
        case 3: return 'module3'
        case 4: return 'module4'
        case 5: return 'module5'
        default: return `module${id}`
      }
    }
    
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <p className="text-sm text-gray-500 mt-2">Looking for quiz file: {getQuizSlug(slug)}.json</p>
      </div>
    )
  }

  if (finished) {
    return <ResultsToast pass={scorePct >= passMark} scorePct={scorePct} nextHref={getNextHref(slug)} />
  }

  return (
    <>
      <div className="text-center py-8">
        <p className="text-lg font-medium">{t.quizTime}</p>
        <p className="text-gray-600 mt-2">{t.instructions}</p>
        <button 
          onClick={() => setShowQuiz(true)}
          className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
        >
          {t.takeQuiz}
        </button>
      </div>

      {showQuiz && (
        <QuizModal
          questions={questions}
          onPass={handleQuizPass}
          enrollmentId={enrollmentId}
          moduleId={undefined} // We don't have a moduleId when using slug-based quizzes
        />
      )}
    </>
  )
}

function getNextHref(slug: string): string | undefined {
  // Map numeric IDs to slugs first
  const getQuizSlug = (id: string): string => {
    if (isNaN(Number(id))) return id
    switch (Number(id)) {
      case 1: return 'pre-operation-inspection'
      case 2: return 'eight-point-inspection'
      case 3: return 'module3'
      case 4: return 'module4'
      case 5: return 'module5'
      default: return `module${id}`
    }
  }

  const currentSlug = getQuizSlug(slug)
  const order = ['pre-operation-inspection', 'eight-point-inspection', 'module3', 'module4', 'module5']
  
  const idx = order.indexOf(currentSlug)
  if (idx === -1 || idx === order.length - 1) {
    return '/training' // Go back to training hub if last module or not found
  }
  
  // Return the next module ID (convert back from slug to ID for the route)
  const nextSlug = order[idx + 1]
  const nextId = order.indexOf(nextSlug) + 1
  return `/module/${nextId}`
}
