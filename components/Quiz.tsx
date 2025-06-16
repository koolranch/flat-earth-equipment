'use client'
import { useState, useEffect } from 'react'
import QuizModal from './QuizModal'

type QuizQuestion = { q: string; choices: string[]; answer: number }

export function Quiz({
  moduleId,
  locale = 'en'
}: {
  moduleId: number
  locale?: 'en' | 'es'
}) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showQuiz, setShowQuiz] = useState(false)

  useEffect(() => {
    async function loadQuiz() {
      try {
        setIsLoading(true)
        const base = `../../data/quizzes/`
        
        // Map module order to correct quiz files
        const getQuizFileName = (moduleId: number): string => {
          switch (moduleId) {
            case 1: return 'intro'     // Introduction
            case 2: return 'module1'   // Module 1: Pre-Operation Inspection
            case 3: return 'module2'   // Module 2: 8-Point Inspection
            case 4: return 'module3'   // Module 3: Operating Procedures
            case 5: return 'module4'   // Module 4: Load Handling & Safety
            case 6: return 'module5'   // Module 5: Advanced Operations
            case 7: return 'outro'     // Course Completion
            default: return `module${moduleId}`
          }
        }
        
        const quizFileName = getQuizFileName(moduleId)
        const path = locale === 'es'
          ? `${base}${quizFileName}_es.json`
          : `${base}${quizFileName}.json`
        
        console.log(`🧩 Loading quiz for module ${moduleId}: ${path}`)
        
        let quiz
        try {
          // Try to load localized version first
          quiz = await import(
            /* webpackMode: "eager" */ /* @vite-ignore */ path
          )
        } catch (localizedError) {
          // Fallback to English version if localized version doesn't exist
          console.log(`Localized quiz not found for ${locale}, falling back to English`)
          const fallbackPath = `${base}${quizFileName}.json`
          quiz = await import(fallbackPath)
        }
        
        setQuestions(quiz.default || quiz)
        setError(null)
      } catch (err) {
        console.error('Failed to load quiz:', err)
        setError('Failed to load quiz')
      } finally {
        setIsLoading(false)
      }
    }

    loadQuiz()
  }, [moduleId, locale])

  const handleQuizPass = () => {
    setShowQuiz(false)
    // You can add completion logic here
    console.log('Quiz passed!')
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
        />
      )}
    </>
  )
} 