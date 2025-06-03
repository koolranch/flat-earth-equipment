'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import QuizModal from '@/components/QuizModal'
import VideoPlayer from '@/components/VideoPlayer'

const Module1Game = dynamic(() => import('@/components/games/Module1Game'), { ssr: false })

interface ModuleRowProps {
  module: {
    id: string
    order: number
    title: string
    video_url: string
    quiz_json: any
    type?: string
  }
  enrollmentId: string
  isUnlocked: boolean
  isCompleted: boolean
}

export default function ModuleRow({ module, enrollmentId, isUnlocked, isCompleted }: ModuleRowProps) {
  const [showQuiz, setShowQuiz] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const handlePass = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentId, moduleOrder: module.order })
      })
      
      if (response.ok) {
        // Refresh the page to show updated progress
        window.location.reload()
      } else {
        console.error('Failed to update progress')
      }
    } catch (error) {
      console.error('Error updating progress:', error)
    } finally {
      setIsUpdating(false)
      setShowQuiz(false)
    }
  }

  const handleQuizPass = handlePass
  
  const isGame = module.type === 'game'
  
  return (
    <>
      <div className={`rounded-lg border p-4 ${!isUnlocked ? 'opacity-50' : ''} ${isCompleted ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold">
                {module.order}
              </span>
              <h3 className="font-semibold text-lg">{module.title}</h3>
              {isCompleted && (
                <span className="text-green-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </div>
            
            {isGame ? (
              <div className="mb-4 relative">
                {!isUnlocked && (
                  <div className="absolute inset-0 bg-white/60 grid place-content-center text-xl rounded-lg z-10">
                    Complete previous module to unlock
                  </div>
                )}
                {isUnlocked && (
                  <Module1Game onComplete={() => handlePass()} />
                )}
              </div>
            ) : (
              module.video_url && (
                <div className="mb-4 relative">
                  {loading && (
                    <div className="h-52 w-full animate-pulse rounded bg-gray-300" />
                  )}
                  <video
                    controls
                    src={module.video_url}
                    preload="metadata"
                    className={`w-full rounded ${loading ? 'opacity-0' : 'opacity-100 transition'}`}
                    onLoadedData={() => setLoading(false)}
                    aria-label={`Training video for module ${module.order}: ${module.title}`}
                  >
                    <track 
                      kind="subtitles" 
                      src={`/transcripts/module${module.order}.vtt`} 
                      srcLang="en" 
                      label="English" 
                      default 
                    />
                  </video>
                  <a
                    href={`/transcripts/module${module.order}.vtt`}
                    download
                    className="mt-2 block text-sm underline"
                    aria-label={`Download transcript for module ${module.order}`}
                  >
                    Download transcript
                  </a>
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-white/60 grid place-content-center text-xl rounded-lg">
                      Complete previous module to unlock
                    </div>
                  )}
                </div>
              )
            )}
            
            {isUnlocked && !isCompleted && !isGame && (
              <button 
                onClick={() => setShowQuiz(true)} 
                disabled={isUpdating}
                className="rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700 disabled:opacity-50"
                aria-label={`Start quiz for module ${module.order}`}
              >
                {isUpdating ? 'Updating...' : 'Take Quiz'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {showQuiz && module.quiz_json && (
        <QuizModal
          questions={module.quiz_json}
          onPass={handleQuizPass}
        />
      )}
    </>
  )
} 