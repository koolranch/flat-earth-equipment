'use client'
import { useState, useEffect } from 'react'
import { analytics } from '@/lib/analytics'
import { ReviewIncorrect } from './quiz/ReviewIncorrect'

type Q = { q: string; choices: string[]; answer: number; id?: string }
type IncorrectAnswer = {
  question: string;
  selectedChoice: number;
  correctAnswer: number;
  explanation?: string;
  questionId?: string;
}

export default function QuizModal({ 
  questions, 
  onPass, 
  enrollmentId, 
  moduleId 
}: { 
  questions: Q[]; 
  onPass: () => void;
  enrollmentId?: string;
  moduleId?: number;
}) {
  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [finalScore, setFinalScore] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mode, setMode] = useState<'quiz' | 'review' | 'result'>('quiz')
  const [incorrectAnswers, setIncorrectAnswers] = useState<IncorrectAnswer[]>([])
  const [lastAttempt, setLastAttempt] = useState<{score: number; incorrect: IncorrectAnswer[]; incorrectIds?: string[]} | null>(null)
  const [reviewSeen, setReviewSeen] = useState(false)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [orderedQuestions, setOrderedQuestions] = useState<Q[]>([])
  const [isInitializing, setIsInitializing] = useState(true)
  
  console.log('QuizModal rendered with', questions.length, 'questions')
  console.log('Current state:', { idx, score, showResult, finalScore })
  
  // Initialize quiz attempt with pooling
  useEffect(() => {
    async function initializeQuiz() {
      try {
        setIsInitializing(true);
        
        // Generate IDs for questions if they don't have them
        const questionsWithIds = questions.map((q, i) => ({
          ...q,
          id: q.id || `q${i + 1}`
        }));
        
        // Start quiz attempt
        const poolIds = questionsWithIds.map(q => q.id!);
        const take = Math.min(questionsWithIds.length, 10); // Limit to 10 questions max
        
        const response = await fetch('/api/quiz/attempts/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            moduleId: moduleId?.toString(), 
            poolIds, 
            take, 
            mode: 'full' 
          })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to start quiz attempt: ${response.statusText}`);
        }
        
        const { attemptId: newAttemptId, order } = await response.json();
        
        // Create lookup map for questions by ID
        const byId = Object.fromEntries(questionsWithIds.map(q => [q.id!, q]));
        
        // Order questions according to the sampled order
        const ordered = order.map((id: string) => byId[id]).filter(Boolean);
        
        setAttemptId(newAttemptId);
        setOrderedQuestions(ordered);
        setIsInitializing(false);
        
        console.log('Quiz attempt initialized:', { attemptId: newAttemptId, order, totalQuestions: ordered.length });
        
      } catch (error) {
        console.error('Failed to initialize quiz attempt:', error);
        // Fallback to original behavior
        const questionsWithIds = questions.map((q, i) => ({
          ...q,
          id: q.id || `q${i + 1}`
        }));
        setOrderedQuestions(questionsWithIds);
        setIsInitializing(false);
      }
    }
    
    initializeQuiz();
  }, [questions, moduleId]);
  
  async function submit(choice: number) {
    const currentQuestion = orderedQuestions[idx];
    if (!currentQuestion) return;
    
    console.log(`Question ${idx + 1}: selected choice ${choice}, correct answer is ${currentQuestion.answer}`)
    const isCorrect = choice === currentQuestion.answer
    if (isCorrect) {
      setScore(s => s + 1)
    } else {
      // Track incorrect answer for review
      const incorrectAnswer: IncorrectAnswer = {
        question: currentQuestion.q,
        selectedChoice: choice,
        correctAnswer: currentQuestion.answer,
        explanation: `Correct answer: ${currentQuestion.choices[currentQuestion.answer]}`,
        questionId: currentQuestion.id
      };
      setIncorrectAnswers(prev => [...prev, incorrectAnswer]);
    }
    
    // Track quiz item answer
    analytics.track("quiz_item_answered", {
      questionIndex: idx + 1,
      totalQuestions: orderedQuestions.length,
      selectedChoice: choice,
      correctAnswer: currentQuestion.answer,
      isCorrect,
      question: currentQuestion.q
    });
    
    // Autosave per-item answer (non-blocking)
    if (enrollmentId) {
      const itemId = `m${moduleId || 0}_q${idx + 1}`;
      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentId,
          itemId,
          correct: isCorrect,
          choice,
          ts: Date.now()
        }),
      }).catch((error) => {
        console.debug("[autosave] Failed to save quiz answer:", error);
      });
    }
    
    console.log(`Current question index: ${idx}, total questions: ${orderedQuestions.length}`)
    
    if (idx + 1 < orderedQuestions.length) {
      console.log('Moving to next question')
      setIdx(i => i + 1)
    } else {
      console.log('Last question reached, finishing quiz attempt')
      // Last question - finish quiz attempt
      const totalScore = score + (isCorrect ? 1 : 0)
      const finalIncorrectAnswers = isCorrect ? incorrectAnswers : [...incorrectAnswers, {
        question: currentQuestion.q,
        selectedChoice: choice,
        correctAnswer: currentQuestion.answer,
        explanation: `Correct answer: ${currentQuestion.choices[currentQuestion.answer]}`,
        questionId: currentQuestion.id
      }];
      
      // Finish quiz attempt via API
      if (attemptId) {
        try {
          const correctIds = orderedQuestions
            .map((q, i) => {
              if (i < idx) {
                // Previous questions - check if they were correct
                return finalIncorrectAnswers.some(ia => ia.questionId === q.id) ? null : q.id;
              } else if (i === idx) {
                // Current question
                return isCorrect ? q.id : null;
              }
              return null;
            })
            .filter(Boolean) as string[];
          
          const finishResponse = await fetch('/api/quiz/attempts/finish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ attemptId, correctIds })
          });
          
          if (finishResponse.ok) {
            const finishResult = await finishResponse.json();
            console.log('Quiz attempt finished:', finishResult);
            
            setLastAttempt({ 
              score: totalScore, 
              incorrect: finalIncorrectAnswers,
              incorrectIds: finishResult.incorrect || []
            });
          } else {
            console.error('Failed to finish quiz attempt');
            setLastAttempt({ score: totalScore, incorrect: finalIncorrectAnswers });
          }
        } catch (error) {
          console.error('Error finishing quiz attempt:', error);
          setLastAttempt({ score: totalScore, incorrect: finalIncorrectAnswers });
        }
      } else {
        setLastAttempt({ score: totalScore, incorrect: finalIncorrectAnswers });
      }
      
      setFinalScore(totalScore)
      const finalPct = (totalScore / orderedQuestions.length) * 100;
      
      if (finalPct < 80) {
        setMode('review');
        setReviewSeen(false);
      } else {
        setMode('result');
      }
      
      console.log(`Quiz completed: ${totalScore}/${orderedQuestions.length} = ${finalPct}%`)
      
      // Track quiz completion
      analytics.track("quiz_completed", {
        finalScore: totalScore,
        totalQuestions: orderedQuestions.length,
        percentage: finalPct,
        passed: finalPct >= 80
      });
    }
  }

  function handleRetake() {
    setIdx(0);
    setScore(0);
    setShowResult(false);
    setFinalScore(0);
    setMode('quiz');
    setIncorrectAnswers([]);
    setAttemptId(null);
    setIsInitializing(true);
    
    // Re-initialize with full quiz
    const questionsWithIds = questions.map((q, i) => ({
      ...q,
      id: q.id || `q${i + 1}`
    }));
    setOrderedQuestions(questionsWithIds);
    setIsInitializing(false);
  }
  
  async function handleRetryIncorrect() {
    if (!lastAttempt?.incorrectIds?.length) return;
    
    try {
      setIsInitializing(true);
      
      // Generate IDs for questions if they don't have them
      const questionsWithIds = questions.map((q, i) => ({
        ...q,
        id: q.id || `q${i + 1}`
      }));
      
      // Start retry attempt with only incorrect questions
      const response = await fetch('/api/quiz/attempts/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          moduleId: moduleId?.toString(), 
          poolIds: questionsWithIds.map(q => q.id!),
          take: lastAttempt.incorrectIds.length,
          mode: 'retry',
          retryIds: lastAttempt.incorrectIds
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to start retry attempt: ${response.statusText}`);
      }
      
      const { attemptId: newAttemptId, order } = await response.json();
      
      // Create lookup map for questions by ID
      const byId = Object.fromEntries(questionsWithIds.map(q => [q.id!, q]));
      
      // Order questions according to the retry order
      const ordered = order.map((id: string) => byId[id]).filter(Boolean);
      
      setAttemptId(newAttemptId);
      setOrderedQuestions(ordered);
      setIdx(0);
      setScore(0);
      setIncorrectAnswers([]);
      setMode('quiz');
      setIsInitializing(false);
      
      console.log('Retry attempt initialized:', { attemptId: newAttemptId, order, totalQuestions: ordered.length });
      
    } catch (error) {
      console.error('Failed to initialize retry attempt:', error);
      setIsInitializing(false);
    }
  }
  
  // Review incorrect answers mode
  if (mode === 'review' && lastAttempt) {
    return (
      <div className="fixed inset-0 bg-black/60 grid place-content-center z-50">
        <div className="w-[500px] space-y-4 rounded-xl bg-white p-6 shadow-lg max-h-[80vh] overflow-y-auto">
          <ReviewIncorrect 
            items={lastAttempt.incorrect}
            onDone={() => {
              setReviewSeen(true);
              setMode('result');
            }}
          />
        </div>
      </div>
    );
  }

  // Result mode (pass/fail screen)
  if (mode === 'result' && lastAttempt) {
    const finalPct = (lastAttempt.score / orderedQuestions.length) * 100
    const passed = finalPct >= 80
    const hasIncorrectIds = lastAttempt.incorrectIds && lastAttempt.incorrectIds.length > 0;
    
    return (
      <div className="fixed inset-0 bg-black/60 grid place-content-center z-50">
        <div className="w-[320px] space-y-4 rounded-xl bg-white p-6 shadow-lg">
          <h3 className="font-semibold text-lg">Quiz Result</h3>
          <div className="text-center">
            <p className="text-2xl font-bold mb-2">{finalPct.toFixed(0)}%</p>
            <p className="text-gray-600">
              You scored {lastAttempt.score} out of {orderedQuestions.length}
            </p>
          </div>
          
          {passed ? (
            <>
              <p className="text-green-600 font-medium text-center">
                🎉 Congratulations! You passed!
              </p>
              <button 
                onClick={() => {
                  if (!isSubmitting) {
                    console.log('Continue button clicked, calling onPass()')
                    setIsSubmitting(true)
                    onPass()
                  }
                }}
                disabled={isSubmitting}
                className="w-full rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Updating...' : 'Continue to Next Module'}
              </button>
            </>
          ) : (
            <>
              <p className="text-red-600 text-center">
                You need 80% to pass. {!reviewSeen ? 'Review the incorrect answers first.' : 'Please try again.'}
              </p>
              <div className="space-y-2">
                {!reviewSeen ? (
                  <button 
                    onClick={() => setMode('review')}
                    className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Review Incorrect Answers
                  </button>
                ) : (
                  <>
                    {hasIncorrectIds && (
                      <button 
                        onClick={handleRetryIncorrect}
                        className="w-full rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
                      >
                        Review Incorrect ({lastAttempt.incorrectIds!.length} questions)
                      </button>
                    )}
                    <button 
                      onClick={handleRetake}
                      className="w-full rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                    >
                      Try Full Quiz Again
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    )
  }
  
  // Show loading state while initializing
  if (isInitializing || orderedQuestions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/60 grid place-content-center z-50">
        <div className="w-[320px] space-y-4 rounded-xl bg-white p-6 shadow-lg text-center">
          <h3 className="font-semibold text-lg">Preparing Quiz...</h3>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="text-gray-600 text-sm">Setting up your questions</p>
        </div>
      </div>
    );
  }

  const currentQuestion = orderedQuestions[idx];
  if (!currentQuestion) {
    return (
      <div className="fixed inset-0 bg-black/60 grid place-content-center z-50">
        <div className="w-[320px] space-y-4 rounded-xl bg-white p-6 shadow-lg text-center">
          <h3 className="font-semibold text-lg text-red-600">Error</h3>
          <p className="text-gray-600">Unable to load quiz questions. Please try again.</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 grid place-content-center z-50">
      <div className="w-[400px] space-y-4 rounded-xl bg-white p-6 shadow-lg relative">
        <button 
          onClick={() => window.location.reload()} 
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          title="Close quiz"
        >
          ✕
        </button>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Question {idx + 1} of {orderedQuestions.length}</h3>
          <span className="text-sm text-gray-500">Score: {score}/{idx}</span>
        </div>
        <p className="font-medium text-lg">{currentQuestion.q}</p>
        <div className="space-y-2">
          {currentQuestion.choices.map((c, i) => (
            <button 
              key={i} 
              onClick={() => submit(i)} 
              className="block w-full rounded border p-3 text-left hover:bg-gray-50 hover:border-orange-600 transition"
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
} 