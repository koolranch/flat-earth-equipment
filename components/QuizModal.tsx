'use client'
import { useState } from 'react'

type Q = { q: string; choices: string[]; answer: number }

export default function QuizModal({ questions, onPass }: { questions: Q[]; onPass: () => void }) {
  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [finalScore, setFinalScore] = useState(0)
  
  console.log('QuizModal rendered with', questions.length, 'questions')
  console.log('Current state:', { idx, score, showResult, finalScore })
  
  function submit(choice: number) {
    console.log(`Question ${idx + 1}: selected choice ${choice}, correct answer is ${questions[idx].answer}`)
    const isCorrect = choice === questions[idx].answer
    if (isCorrect) setScore(s => s + 1)
    
    console.log(`Current question index: ${idx}, total questions: ${questions.length}`)
    
    if (idx + 1 < questions.length) {
      console.log('Moving to next question')
      setIdx(i => i + 1)
    } else {
      console.log('Last question reached, calculating final score')
      // Last question - calculate final score
      const totalScore = score + (isCorrect ? 1 : 0)
      setFinalScore(totalScore)
      setShowResult(true)
      console.log(`Quiz completed: ${totalScore}/${questions.length} = ${(totalScore / questions.length) * 100}%`)
      console.log('showResult set to true')
    }
  }
  
  if (showResult) {
    const finalPct = (finalScore / questions.length) * 100
    const passed = finalPct >= 80
    
    return (
      <div className="fixed inset-0 bg-black/60 grid place-content-center z-50">
        <div className="w-[320px] space-y-4 rounded-xl bg-white p-6 shadow-lg">
          <h3 className="font-semibold text-lg">Quiz Result</h3>
          <div className="text-center">
            <p className="text-2xl font-bold mb-2">{finalPct.toFixed(0)}%</p>
            <p className="text-gray-600">
              You scored {finalScore} out of {questions.length}
            </p>
          </div>
          
          {passed ? (
            <>
              <p className="text-green-600 font-medium text-center">
                🎉 Congratulations! You passed!
              </p>
              <button 
                onClick={() => {
                  console.log('Continue button clicked, calling onPass()')
                  onPass()
                }}
                className="w-full rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                Continue to Next Module
              </button>
            </>
          ) : (
            <>
              <p className="text-red-600 text-center">
                You need 80% to pass. Please try again.
              </p>
              <button 
                onClick={() => {
                  setIdx(0)
                  setScore(0)
                  setShowResult(false)
                  setFinalScore(0)
                }}
                className="w-full rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
              >
                Try Again
              </button>
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