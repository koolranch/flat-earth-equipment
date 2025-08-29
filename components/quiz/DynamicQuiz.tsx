'use client'
import { useState, useEffect } from 'react'
import QuizModal from '../QuizModal'

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

  useEffect(() => {
    async function loadQuiz() {
      try {
        setIsLoading(true)
        
        // Use slug directly as the filename base
        const fileName = locale === 'es' ? `${slug}_es.json` : `${slug}.json`
        
        console.log(`🧩 Loading quiz for slug ${slug}: ${fileName}`)
        
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
          const fallbackFileName = `${slug}.json`
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

  const handleQuizPass = () => {
    setShowQuiz(false)
    console.log('Quiz passed!')
    if (onComplete) {
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
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <p className="text-sm text-gray-500 mt-2">Looking for quiz file: {slug}.json</p>
      </div>
    )
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
