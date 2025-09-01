'use client'
import { useState, useEffect, useRef } from 'react'
import { track } from '@/lib/analytics/track'
import QuizModal from '../QuizModal'
import ResultsToast from './ResultsToast'

type QuizQuestion = { q: string; choices: string[]; answer: number }
type NewQuizItem = {
  id: string
  type: 'mcq'
  prompt: string
  options: Array<{ id: string; label: string }>
  answer: string
  explain?: string
}
type NewQuizFormat = {
  title: string
  pass_pct: number
  items: NewQuizItem[]
}
type IncorrectItem = {
  id: string
  prompt: string
  selectedAnswer: string
  correctAnswer: string
  explanation?: string
}

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
  const [newQuizData, setNewQuizData] = useState<NewQuizFormat | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showQuiz, setShowQuiz] = useState(false)
  const [finished, setFinished] = useState(false)
  const [scorePct, setScorePct] = useState(0)
  const [incorrectItems, setIncorrectItems] = useState<IncorrectItem[]>([])
  const [showReview, setShowReview] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [passMark, setPassMark] = useState(80)

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
            case 3: return 'balance-load-handling'     // Module 3: Balance & Load Handling
            case 4: return 'hazard-hunt'               // Module 4: Hazard Recognition
            case 5: return 'shutdown-sequence'         // Module 5: Shutdown Sequence
            default: return `module${id}`              // Fallback pattern
          }
        }
        
        const quizSlug = getQuizSlug(slug)
        const fileName = `${quizSlug}.json`
        
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
        
        // Check if it's the new format with 'items' array
        if (quiz.items && Array.isArray(quiz.items)) {
          setNewQuizData(quiz)
          setPassMark(quiz.pass_pct || 80)
          setQuestions([]) // Clear old format
        } else {
          // Legacy format - array of questions
          setQuestions(quiz)
          setNewQuizData(null)
          setPassMark(80)
        }
        
        setError(null)
        
        // Track quiz load analytics
        track('quiz_loaded', {
          slug: slug,
          locale: locale,
          total_questions: quiz.items?.length || quiz.length || 0,
          fallback_used: quiz._meta?.fallback_used || false,
          enrollment_id: enrollmentId
        });
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
    
    // Track quiz completion with enhanced analytics
    track(passed ? 'quiz_passed' : 'quiz_failed', {
      slug: slug,
      score_pct: Math.round(pct),
      score: score,
      total_questions: total,
      incorrect_count: total - score,
      locale: locale,
      enrollment_id: enrollmentId
    });
    
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
        case 3: return 'balance-load-handling'
        case 4: return 'hazard-hunt'
        case 5: return 'shutdown-sequence'
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
    const passed = scorePct >= passMark
    return (
      <div className="mt-4 rounded-2xl border p-3">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Results</div>
          {!passed && incorrectItems.length > 0 && (
            <button 
              className="text-sm underline" 
              onClick={() => setShowReview(v => !v)}
            >
              {showReview ? 'Hide review' : 'Review incorrect'}
            </button>
          )}
        </div>
        <div className="text-sm text-slate-700 mt-1">Score: {Math.round(scorePct)}%</div>
        <div className={`text-sm font-medium mt-1 ${passed ? 'text-green-600' : 'text-red-600'}`}>
          {passed ? '🎉 Congratulations! You passed!' : 'You need 80% to pass. Review and try again.'}
        </div>
        {showReview && incorrectItems.length > 0 && (
          <ul className="mt-2 space-y-2">
            {incorrectItems.map(item => (
              <li key={item.id} className="rounded-xl border p-2">
                <div className="text-sm font-medium">{item.prompt}</div>
                <div className="text-xs text-slate-600 mt-1">Correct: {item.correctAnswer}</div>
                {item.explanation && <div className="text-xs text-slate-500 mt-1">{item.explanation}</div>}
              </li>
            ))}
          </ul>
        )}
        {passed && (
          <div className="mt-3">
            <a 
              href={getNextHref(slug)} 
              className="inline-flex rounded-2xl bg-[#F76511] text-white px-4 py-2 shadow-lg"
            >
              Continue to Next Module
            </a>
          </div>
        )}
      </div>
    )
  }

  // Handle new quiz format with built-in interface
  if (newQuizData) {
    return (
      <>
        {!showQuiz ? (
          <div className="text-center py-8">
            <p className="text-lg font-medium">{newQuizData.title || t.quizTime}</p>
            <p className="text-gray-600 mt-2">{t.instructions}</p>
            <button 
              onClick={() => setShowQuiz(true)}
              className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              {t.takeQuiz}
            </button>
          </div>
        ) : (
          <NewQuizInterface 
            quizData={newQuizData}
            onComplete={(score, total, incorrectItems) => {
              const pct = total ? (score / total) * 100 : 0
              const passed = pct >= passMark
              setScorePct(pct)
              setIncorrectItems(incorrectItems)
              setFinished(true)
              setShowQuiz(false)
              setShowReview(!passed) // Auto-open review for fails
              
              // Track completion
              track(passed ? 'quiz_passed' : 'quiz_failed', {
                slug: slug,
                score_pct: Math.round(pct),
                score: score,
                total_questions: total,
                incorrect_count: total - score,
                locale: locale,
                enrollment_id: enrollmentId
              })
              
              if (passed && onComplete) {
                onComplete()
              }
            }}
            locale={locale}
            enrollmentId={enrollmentId}
          />
        )}
      </>
    )
  }

  // Legacy quiz format
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
      case 3: return 'balance-load-handling'
      case 4: return 'hazard-hunt'
      case 5: return 'shutdown-sequence'
      default: return `module${id}`
    }
  }

  const currentSlug = getQuizSlug(slug)
  const order = ['pre-operation-inspection', 'eight-point-inspection', 'balance-load-handling', 'hazard-hunt', 'shutdown-sequence']
  
  const idx = order.indexOf(currentSlug)
  if (idx === -1 || idx === order.length - 1) {
    return '/training' // Go back to training hub if last module or not found
  }
  
  // Return the next module ID (convert back from slug to ID for the route)
  const nextSlug = order[idx + 1]
  const nextId = order.indexOf(nextSlug) + 1
  return `/module/${nextId}`
}

// New quiz interface component for the updated JSON format
function NewQuizInterface({ 
  quizData, 
  onComplete, 
  locale, 
  enrollmentId 
}: {
  quizData: NewQuizFormat
  onComplete: (score: number, total: number, incorrectItems: IncorrectItem[]) => void
  locale: 'en' | 'es'
  enrollmentId?: string
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [feedback, setFeedback] = useState<string>('')
  const [showingFeedback, setShowingFeedback] = useState(false)
  const liveRef = useRef<HTMLDivElement | null>(null)
  const nextButtonRef = useRef<HTMLButtonElement | null>(null)

  const currentItem = quizData.items[currentIndex]
  const isLastQuestion = currentIndex === quizData.items.length - 1

  const handleAnswerSelection = (answerId: string) => {
    setSelectedAnswer(answerId)
  }

  const checkAnswer = () => {
    if (!selectedAnswer) return

    const isCorrect = selectedAnswer === currentItem.answer
    const feedbackText = isCorrect ? 'Correct' : 'Incorrect'
    
    setFeedback(feedbackText)
    setShowingFeedback(true)
    
    // Announce feedback via aria-live
    if (liveRef.current) {
      liveRef.current.textContent = feedbackText
    }

    // Focus next button after short delay
    setTimeout(() => {
      nextButtonRef.current?.focus()
    }, 100)
  }

  const handleNext = () => {
    const newAnswers = { ...userAnswers, [currentItem.id]: selectedAnswer }
    setUserAnswers(newAnswers)

    if (isLastQuestion) {
      // Calculate final results
      let score = 0
      const incorrectItems: IncorrectItem[] = []

      quizData.items.forEach(item => {
        const userAnswer = newAnswers[item.id]
        const isCorrect = userAnswer === item.answer

        if (isCorrect) {
          score++
        } else {
          const selectedOption = item.options.find(opt => opt.id === userAnswer)
          const correctOption = item.options.find(opt => opt.id === item.answer)
          
          incorrectItems.push({
            id: item.id,
            prompt: item.prompt,
            selectedAnswer: selectedOption?.label || 'No answer',
            correctAnswer: correctOption?.label || 'Unknown',
            explanation: item.explain
          })
        }
      })

      onComplete(score, quizData.items.length, incorrectItems)
    } else {
      // Move to next question
      setCurrentIndex(prev => prev + 1)
      setSelectedAnswer('')
      setFeedback('')
      setShowingFeedback(false)
    }
  }

  const t = {
    en: {
      question: 'Question',
      of: 'of'
    },
    es: {
      question: 'Pregunta',
      of: 'de'
    }
  }[locale]

  return (
    <section aria-label="Quiz" className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg space-y-4">
      <header className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">
          {t.question} {currentIndex + 1} {t.of} {quizData.items.length}
        </h3>
        <div className="text-sm text-gray-500">
          Progress: {currentIndex + 1}/{quizData.items.length}
        </div>
      </header>
      
      <div className="space-y-4">
        <h4 id={`question-${currentItem.id}`} className="text-lg font-medium">
          {currentItem.prompt}
        </h4>
        
        <div role="radiogroup" aria-labelledby={`question-${currentItem.id}`} className="space-y-2">
          {currentItem.options.map((option) => (
            <label 
              key={option.id} 
              className="flex items-center gap-3 p-3 rounded-lg border hover:border-orange-600 hover:bg-gray-50 transition-colors cursor-pointer focus-ring"
            >
              <input
                type="radio"
                name={`question-${currentItem.id}`}
                value={option.id}
                checked={selectedAnswer === option.id}
                onChange={() => handleAnswerSelection(option.id)}
                className="w-4 h-4 text-orange-600 focus:ring-orange-500 focus:ring-2"
              />
              <span className="text-left flex-1">{option.label}</span>
            </label>
          ))}
        </div>

        {/* Live region for feedback announcements */}
        <div 
          ref={liveRef} 
          aria-live="polite" 
          aria-atomic="true" 
          className="sr-only"
        >
          {feedback}
        </div>

        {/* Visible feedback */}
        {showingFeedback && (
          <div className={`p-3 rounded-lg text-center font-medium ${
            feedback === 'Correct' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {feedback}
            {feedback === 'Incorrect' && currentItem.explain && (
              <div className="text-sm mt-1 opacity-90">{currentItem.explain}</div>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {!showingFeedback ? (
            <button 
              onClick={checkAnswer}
              disabled={!selectedAnswer}
              className="rounded-2xl bg-[#F76511] text-white px-4 py-2 shadow-lg hover:bg-[#E55A0C] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Check Answer
            </button>
          ) : (
            <button 
              ref={nextButtonRef}
              onClick={handleNext}
              className="rounded-2xl bg-[#F76511] text-white px-4 py-2 shadow-lg hover:bg-[#E55A0C]"
            >
              {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
            </button>
          )}
          
          <button 
            onClick={() => {
              setCurrentIndex(Math.max(0, currentIndex - 1))
              setSelectedAnswer('')
              setFeedback('')
              setShowingFeedback(false)
            }}
            disabled={currentIndex === 0}
            className="rounded-xl border px-4 py-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
        </div>
      </div>
    </section>
  )
}
