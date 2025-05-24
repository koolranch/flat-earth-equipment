'use client'
import { useState } from 'react'

type Q = { q: string; choices: string[]; answer: number }

export default function QuizModal({ questions, onPass }: { questions: Q[]; onPass: () => void }) {
  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  
  function submit(choice: number) {
    if (choice === questions[idx].answer) setScore(s => s + 1)
    
    if (idx + 1 < questions.length) {
      setIdx(i => i + 1)
    } else {
      const pct = ((score + (choice === questions[idx].answer ? 1 : 0)) / questions.length) * 100
      if (pct >= 80) {
        onPass()
      } else {
        setShowResult(true)
      }
    }
  }
  
  if (showResult) {
    const finalPct = (score / questions.length) * 100
    return (
      <div className="fixed inset-0 bg-black/60 grid place-content-center z-50">
        <div className="w-[320px] space-y-4 rounded-xl bg-white p-6 shadow-lg">
          <h3 className="font-semibold text-lg">Quiz Result</h3>
          <p>You scored {finalPct.toFixed(0)}%. You need 80% to pass.</p>
          <button 
            onClick={() => {
              setIdx(0)
              setScore(0)
              setShowResult(false)
            }}
            className="w-full rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="fixed inset-0 bg-black/60 grid place-content-center z-50">
      <div className="w-[400px] space-y-4 rounded-xl bg-white p-6 shadow-lg">
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