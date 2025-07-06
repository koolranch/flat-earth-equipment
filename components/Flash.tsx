'use client'
import { useState } from 'react'

interface FlashProps {
  q: string
  a: string
}

export default function Flash({ q, a }: FlashProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleFlip()
    }
  }

  return (
    <div className="my-6">
      <div 
        className="relative w-full min-h-[100px] cursor-pointer group perspective-1000"
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        aria-label={`Question card: ${q}`}
        onKeyDown={handleKeyDown}
      >
        {/* Card Container */}
        <div 
          className={`relative w-full h-full transition-transform duration-700 ease-in-out preserve-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front side - Question */}
          <div 
            className={`absolute inset-0 w-full backface-hidden ${isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-md hover:bg-blue-100 transition-colors shadow-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">?</span>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    {q}
                  </h4>
                  <div className="text-xs text-blue-600 italic flex items-center gap-1">
                    <span>Click to reveal answer</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back side - Answer */}
          <div 
            className={`absolute inset-0 w-full backface-hidden rotate-y-180 ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-r-md hover:bg-green-100 transition-colors shadow-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <h4 className="text-sm font-medium text-green-900 mb-2">
                    Answer:
                  </h4>
                  <div className="text-sm text-green-800 mb-2">
                    {a}
                  </div>
                  <div className="text-xs text-green-600 italic flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                    </svg>
                    <span>Click to see question again</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 