'use client'
import { useState, Suspense, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { ComponentType } from 'react'
import { MDXRemote } from 'next-mdx-remote'
import { Stepper } from '@/components/Stepper'
import GuidePane from '@/components/GuidePane'
import Flash from '@/components/Flash'
import { Quiz } from '@/components/Quiz'
import TrainingVideo from '@/components/TrainingVideo'

interface GameComponentProps {
  locale: 'en' | 'es'
  onComplete: () => void
}

interface HybridModuleProps {
  gameKey?: string
  introUrl?: string
  guideMdx?: any // MDX source for guide content
  enrollmentId?: string
  locale?: 'en' | 'es'
  moduleId?: number
  onComplete: () => void
}

export default function HybridModule({ gameKey, introUrl, guideMdx, enrollmentId, locale = 'en', moduleId, onComplete }: HybridModuleProps) {
  const [phase, setPhase] = useState<'guide' | 'video' | 'game' | 'quiz'>(
    guideMdx ? 'guide' : introUrl ? 'video' : 'game'
  )
  const [guideUnlocked, setGuideUnlocked] = useState(false)
  const [secondsRemaining, setSecondsRemaining] = useState(90)

  // Derive moduleId from gameKey if not provided
  const derivedModuleId = moduleId || (gameKey ? parseInt(gameKey.replace('module', '')) : 1)

  // Update phase when MDX content becomes available
  useEffect(() => {
    if (guideMdx && phase === 'video' && !guideUnlocked) {
      console.log('📚 MDX content loaded, switching to guide phase...')
      setPhase('guide')
    }
  }, [guideMdx, phase, guideUnlocked])

  console.log('🎮 HybridModule render:', { 
    gameKey, 
    introUrl: !!introUrl, 
    phase, 
    guideUnlocked,
    guideMdx: !!guideMdx, 
    enrollmentId: !!enrollmentId,
    locale,
    moduleId: derivedModuleId,
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

      {/* Guide stays visible always when present */}
      {guideMdx && enrollmentId && (
        <GuidePane
          mdx={<MDXRemote {...guideMdx} components={{ Flash }} />}
          enrollmentId={enrollmentId}
          onUnlock={() => {
            console.log('📖 Guide reading completed, unlocking video...')
            setGuideUnlocked(true)
            setPhase('video')
          }}
          onTimerUpdate={(remaining) => setSecondsRemaining(remaining)}
        />
      )}

      {/* Video container - show when guide is present and video exists */}
      {introUrl && guideMdx && (
        <div className="relative mt-8">
          {!guideUnlocked && (
            <div
              aria-live="polite"
              className="absolute inset-0 grid place-items-center rounded-lg bg-black/60 text-white z-10"
            >
              <div className="text-center">
                <div className="text-lg font-medium mb-2">
                  Video unlocks when guide reading is complete
                </div>
                <div className="text-2xl font-bold text-orange-300">
                  {secondsRemaining}s
                </div>
                <div className="text-sm opacity-80 mt-1">
                  OSHA compliance countdown
                </div>
              </div>
            </div>
          )}
          {guideUnlocked ? (
            <div className="space-y-4">
              <div className="w-full max-w-4xl mx-auto">
                <TrainingVideo
                  src={introUrl}
                  moduleId={derivedModuleId}
                  locale={locale}
                  onEnded={() => {
                    console.log('📹 Video ended, switching to game phase')
                    setPhase('game')
                  }}
                  onError={(e) => {
                    console.error('📹 Video error:', e)
                  }}
                />
              </div>
            </div>
          ) : (
            /* Placeholder poster until unlocked */
            <img
              src={`/thumbnails/module${gameKey?.replace('module', '') || '1'}.jpg`}
              alt="Video locked"
              className="w-full rounded-lg opacity-50"
              draggable={false}
            />
          )}
        </div>
      )}

      {/* Handle video-only modules (no guide) */}
      {phase === 'video' && (!guideMdx) && introUrl && (
        <div className="space-y-4 mt-8">
          <div className="w-full max-w-4xl mx-auto">
            <TrainingVideo
              src={introUrl}
              moduleId={derivedModuleId}
              locale={locale}
              onEnded={() => {
                console.log('📹 Video ended, switching to game phase')
                setPhase('game')
              }}
              onError={(e) => {
                console.error('📹 Video error:', e)
              }}
            />
          </div>
        </div>
      )}

      {phase === 'game' && gameKey ? (
        <GameComponent gameKey={gameKey} locale={locale} onComplete={() => setPhase('quiz')} />
      ) : phase === 'game' && !gameKey ? (
        // Handle modules with no game (like Course Completion) - go directly to quiz
        <div className="text-center py-8">
          <p className="text-lg font-medium">Ready for final assessment!</p>
          <p className="text-gray-600 mt-2">Complete the quiz to finish the course.</p>
          <button 
            onClick={() => setPhase('quiz')}
            className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Take Final Quiz
          </button>
        </div>
      ) : null}

      {phase === 'quiz' && derivedModuleId ? (
        <Quiz moduleId={derivedModuleId} locale={locale} onComplete={onComplete} enrollmentId={enrollmentId} />
      ) : phase === 'quiz' ? (
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
function GameComponent({ gameKey, locale, onComplete }: { gameKey: string, locale: 'en' | 'es', onComplete: () => void }) {
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
        return () => import('./games/module3/StabilityTriangleSim')
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
        <div className="text-center py-12 px-4">
          {/* Mobile-optimized loading animation */}
          <div className="relative mx-auto mb-6">
            <div className="animate-spin rounded-full h-16 w-16 md:h-12 md:w-12 border-4 border-orange-200 border-t-orange-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-r-orange-400 animate-pulse"></div>
          </div>
          
          {/* Mobile-friendly messaging */}
          <div className="space-y-3">
            <h3 className="text-lg md:text-base font-semibold text-gray-800">
              🎮 Loading Interactive Training
            </h3>
            <p className="text-gray-600 text-base md:text-sm max-w-sm mx-auto leading-relaxed">
              Preparing your hands-on learning experience...
            </p>
            
            {/* Mobile progress dots */}
            <div className="flex justify-center space-x-2 mt-4">
              <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
            
            {/* Touch-friendly tip for mobile */}
            <div className="mt-6 p-3 bg-orange-50 rounded-lg border border-orange-200 max-w-xs mx-auto md:hidden">
              <p className="text-xs text-orange-700 font-medium">
                💡 Tip: Use touch gestures to interact with the training game
              </p>
            </div>
          </div>
        </div>
      )
    }
  ) as ComponentType<GameComponentProps>

  console.log('🎮 Rendering dynamic game component for:', gameKey)
  
  return (
    <div className="space-y-4">
      <Suspense fallback={
        <div className="text-center py-12 px-4">
          {/* Mobile-optimized loading animation */}
          <div className="relative mx-auto mb-6">
            <div className="animate-spin rounded-full h-16 w-16 md:h-12 md:w-12 border-4 border-orange-200 border-t-orange-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-r-orange-400 animate-pulse"></div>
          </div>
          
          {/* Mobile-friendly messaging */}
          <div className="space-y-3">
            <h3 className="text-lg md:text-base font-semibold text-gray-800">
              🎮 Starting Interactive Training
            </h3>
            <p className="text-gray-600 text-base md:text-sm max-w-sm mx-auto leading-relaxed">
              Get ready for hands-on learning...
            </p>
            
            {/* Mobile progress dots */}
            <div className="flex justify-center space-x-2 mt-4">
              <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
            
            {/* Touch-friendly tip for mobile */}
            <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200 max-w-xs mx-auto md:hidden">
              <p className="text-xs text-blue-700 font-medium">
                🎯 Ready to start? The game is almost loaded!
              </p>
            </div>
          </div>
        </div>
      }>
        <Game locale={locale} onComplete={onComplete} />
      </Suspense>
    </div>
  )
} 