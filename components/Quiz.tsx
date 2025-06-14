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
        const path = locale === 'es'
          ? `${base}module${moduleId}_es.json`
          : `${base}module${moduleId}.json`
        
        let quiz
        try {
          // Try to load localized version first
          quiz = await import(
            /* webpackMode: "eager" */ /* @vite-ignore */ path
          )
        } catch (localizedError) {
          // Fallback to English version if localized version doesn't exist
          console.log(`Localized quiz not found for ${locale}, falling back to English`)
          quiz = await import(`${base}module${moduleId}.json`)
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

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading quiz...</p>
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
        <p className="text-lg font-medium">Quiz time!</p>
        <p className="text-gray-600 mt-2">Complete the quiz to finish this module.</p>
        <button 
          onClick={() => setShowQuiz(true)}
          className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
        >
          Take Quiz
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