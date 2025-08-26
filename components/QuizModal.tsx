'use client'
import { useState } from 'react'
import { analytics } from '@/lib/analytics'
import { ReviewIncorrect } from './quiz/ReviewIncorrect'

type Q = { q: string; choices: string[]; answer: number }
type IncorrectAnswer = {
  question: string;
  selectedChoice: number;
  correctAnswer: number;
  explanation?: string;
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
  const [lastAttempt, setLastAttempt] = useState<{score: number; incorrect: IncorrectAnswer[]} | null>(null)
  const [reviewSeen, setReviewSeen] = useState(false)
  
  console.log('QuizModal rendered with', questions.length, 'questions')
  console.log('Current state:', { idx, score, showResult, finalScore })
  
  async function submit(choice: number) {
    console.log(`Question ${idx + 1}: selected choice ${choice}, correct answer is ${questions[idx].answer}`)
    const isCorrect = choice === questions[idx].answer
    if (isCorrect) {
      setScore(s => s + 1)
    } else {
      // Track incorrect answer for review
      const incorrectAnswer: IncorrectAnswer = {
        question: questions[idx].q,
        selectedChoice: choice,
        correctAnswer: questions[idx].answer,
        explanation: `Correct answer: ${questions[idx].choices[questions[idx].answer]}`
      };
      setIncorrectAnswers(prev => [...prev, incorrectAnswer]);
    }
    
    // Track quiz item answer
    analytics.track("quiz_item_answered", {
      questionIndex: idx + 1,
      totalQuestions: questions.length,
      selectedChoice: choice,
      correctAnswer: questions[idx].answer,
      isCorrect,
      question: questions[idx].q
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
    
    console.log(`Current question index: ${idx}, total questions: ${questions.length}`)
    
    if (idx + 1 < questions.length) {
      console.log('Moving to next question')
      setIdx(i => i + 1)
    } else {
      console.log('Last question reached, calculating final score')
      // Last question - calculate final score
      const totalScore = score + (isCorrect ? 1 : 0)
      const finalIncorrectAnswers = isCorrect ? incorrectAnswers : [...incorrectAnswers, {
        question: questions[idx].q,
        selectedChoice: choice,
        correctAnswer: questions[idx].answer,
        explanation: `Correct answer: ${questions[idx].choices[questions[idx].answer]}`
      }];
      
      setFinalScore(totalScore)
      setLastAttempt({ score: totalScore, incorrect: finalIncorrectAnswers })
      
      const finalPct = (totalScore / questions.length) * 100;
      
      if (finalPct < 80) {
        setMode('review');
        setReviewSeen(false);
      } else {
        setMode('result');
      }
      
      console.log(`Quiz completed: ${totalScore}/${questions.length} = ${finalPct}%`)
      
      // Track quiz completion
      analytics.track("quiz_completed", {
        finalScore: totalScore,
        totalQuestions: questions.length,
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
    const finalPct = (lastAttempt.score / questions.length) * 100
    const passed = finalPct >= 80
    const canRetake = passed || reviewSeen;
    
    return (
      <div className="fixed inset-0 bg-black/60 grid place-content-center z-50">
        <div className="w-[320px] space-y-4 rounded-xl bg-white p-6 shadow-lg">
          <h3 className="font-semibold text-lg">Quiz Result</h3>
          <div className="text-center">
            <p className="text-2xl font-bold mb-2">{finalPct.toFixed(0)}%</p>
            <p className="text-gray-600">
              You scored {lastAttempt.score} out of {questions.length}
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
              {!reviewSeen ? (
                <button 
                  onClick={() => setMode('review')}
                  className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Review Incorrect Answers
                </button>
              ) : (
                <button 
                  onClick={handleRetake}
                  className="w-full rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
                >
                  Try Again
                </button>
              )}
            </>
          )}
        </div>
      </div>
    )
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
          <h3 className="font-semibold">Question {idx + 1} of {questions.length}</h3>
          <span className="text-sm text-gray-500">Score: {score}/{idx}</span>
        </div>
        <p className="font-medium text-lg">{questions[idx].q}</p>
        <div className="space-y-2">
          {questions[idx].choices.map((c, i) => (
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