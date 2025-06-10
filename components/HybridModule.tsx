'use client'
import { useState, Suspense, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { ComponentType } from 'react'
import { MDXRemote } from 'next-mdx-remote'
import { Stepper } from '@/components/Stepper'
import GuidePane from '@/components/GuidePane'
import Flash from '@/components/Flash'

interface GameComponentProps {
  onComplete: () => void
}

interface HybridModuleProps {
  gameKey?: string
  introUrl?: string
  guideMdx?: any // MDX source for guide content
  enrollmentId?: string
  onComplete: () => void
}

export default function HybridModule({ gameKey, introUrl, guideMdx, enrollmentId, onComplete }: HybridModuleProps) {
  const [phase, setPhase] = useState<'guide' | 'video' | 'game' | 'quiz'>(
    guideMdx ? 'guide' : introUrl ? 'video' : 'game'
  )
  const [guideRead, setGuideRead] = useState(false)

  // Update phase when MDX content becomes available
  useEffect(() => {
    if (guideMdx && phase === 'video' && !guideRead) {
      console.log('📚 MDX content loaded, switching to guide phase...')
      setPhase('guide')
    }
  }, [guideMdx, phase, guideRead])

  console.log('🎮 HybridModule render:', { 
    gameKey, 
    introUrl: !!introUrl, 
    phase, 
    guideRead,
    guideMdx: !!guideMdx, 
    enrollmentId: !!enrollmentId,
    timestamp: new Date().toISOString() 
  })

  if (!gameKey && !guideMdx) {
    console.error('❌ No gameKey or guideMdx provided')
    return <div className="text-red-500">No content specified</div>
  }

  const stepperCurrent = phase === 'guide' ? 'guide' : phase === 'video' ? 'video' : phase === 'game' ? 'game' : 'quiz'

  return (
    <>
      <Stepper current={stepperCurrent} />

      {phase === 'guide' && guideMdx && enrollmentId ? (
        <div>
          <p className="text-sm text-gray-600 mb-4">📚 Loading guide content...</p>
          <GuidePane
            mdx={<MDXRemote {...guideMdx} components={{ Flash }} />}
            enrollmentId={enrollmentId}
            onReady={() => {
              console.log('📖 Guide reading completed, transitioning to video phase...')
              setGuideRead(true)
              setPhase('video')
            }}
          />
        </div>
      ) : phase === 'guide' && !guideMdx ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading guide content...</p>
        </div>
      ) : null}

      {phase === 'video' && (
        <>
          {!guideRead && guideMdx ? (
            <div className="relative">
              <div className="absolute inset-0 grid place-items-center bg-black/60 text-white text-sm z-10 rounded-lg">
                Read the guide to unlock the video
              </div>
              {introUrl && (
                <video 
                  className="w-full h-auto max-h-[600px] rounded-lg opacity-50" 
                  controls={false}
                >
                  <source src={introUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          ) : introUrl ? (
            <div className="space-y-4">
              <div className="w-full max-w-4xl mx-auto">
                <video 
                  className="w-full h-auto max-h-[600px] rounded-lg" 
                  controls 
                  onEnded={() => {
                    console.log('📹 Video ended, switching to game phase')
                    setPhase('game')
                  }}
                  onError={(e) => {
                    console.error('📹 Video error:', e)
                  }}
                >
                  <source src={introUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No video available for this module.</p>
              <button 
                onClick={() => setPhase('game')}
                className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Continue to Practice
              </button>
            </div>
          )}
        </>
      )}

      {phase === 'game' && gameKey ? (
        <GameComponent gameKey={gameKey} onComplete={() => setPhase('quiz')} />
      ) : null}

      {phase === 'quiz' ? (
        <div className="text-center py-8">
          <p className="text-lg font-medium">Quiz time!</p>
          <p className="text-gray-600 mt-2">Complete the quiz to finish this module.</p>
          <button 
            onClick={onComplete}
            className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Take Quiz
          </button>
        </div>
      ) : null}
    </>
  )
}

// Game component with dynamic loading
function GameComponent({ gameKey, onComplete }: { gameKey: string, onComplete: () => void }) {
  console.log('🎮 Game phase - loading component for:', gameKey)

  // Create a function to get the import path
  const getImportPath = (key: string) => {
    console.log('🔍 Getting import path for key:', key)
    switch (key) {
      case 'module1':
        return () => import('./games/module1/MiniCheckoff')
      case 'module2':
        return () => import('./games/module2/MiniInspection')
      case 'module3':
        return () => import('./games/module3/MiniBalance')
      case 'module4':
        console.log('🎯 Loading module4 - MiniHazard')
        return () => import('./games/module4/MiniHazard')
      case 'module5':
        console.log('🎯 Loading module5 - MiniShutdown')
        return () => import('./games/module5/MiniShutdown')
      default:
        console.error('❌ Unknown game key:', key)
        throw new Error(`Unknown game key: ${key}`)
    }
  }

  const Game = dynamic(
    () => {
      try {
        const importFn = getImportPath(gameKey)
        return importFn().then((mod) => {
          console.log('✅ Successfully imported module:', gameKey, mod)
          return { default: mod.default }
        }).catch((error) => {
          console.error('❌ Failed to import module:', gameKey, error)
          throw error
        })
      } catch (error) {
        console.error('❌ Error in dynamic import setup:', error)
        throw error
      }
    },
    { 
      ssr: false,
      loading: () => (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading game...</p>
          <p className="mt-1 text-xs text-gray-500">Game Key: {gameKey}</p>
        </div>
      )
    }
  ) as ComponentType<GameComponentProps>

  console.log('🎮 Rendering dynamic game component for:', gameKey)
  
  return (
    <div className="space-y-4">
      <Suspense fallback={
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading game...</p>
          <p className="mt-1 text-xs text-gray-500">Game Key: {gameKey}</p>
        </div>
      }>
        <Game onComplete={onComplete} />
      </Suspense>
    </div>
  )
} 