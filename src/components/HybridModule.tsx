'use client'
import { useState, Suspense, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { ComponentType } from 'react'

interface GameComponentProps {
  onComplete: () => void
}

interface HybridModuleProps {
  gameKey?: string
  introUrl?: string
  onComplete: () => void
}

export default function HybridModule({ gameKey, introUrl, onComplete }: HybridModuleProps) {
  const [phase, setPhase] = useState<'intro' | 'game'>(introUrl ? 'intro' : 'game')

  console.log('🎮 HybridModule render:', { gameKey, introUrl, phase, timestamp: new Date().toISOString() })

  if (!gameKey) {
    console.error('❌ No gameKey provided')
    return <div className="text-red-500">No game specified</div>
  }

  // If we have an intro video and we're in the intro phase, show the video
  if (introUrl && phase === 'intro') {
    console.log('📹 Showing intro video:', introUrl)
    return (
      <div className="space-y-4">
        <div className="w-full max-w-4xl mx-auto">
          <video 
            className="w-full h-auto max-h-[600px] rounded-lg" 
            controls 
            onEnded={() => {
              console.log('📹 Video ended, switching to game phase')
              setPhase('game')
              console.log('📹 Phase switched to game, component should reload')
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
    )
  }

  // Game phase - use Next.js dynamic import with all four modules
  console.log('🎮 Game phase - loading component for:', gameKey)

  const Game = dynamic(
    () =>
      import(
        gameKey === 'module1'
          ? '@/components/games/module1/MiniCheckoff'
          : gameKey === 'module2'
          ? '@/components/games/module2/MiniInspection'
          : gameKey === 'module3'
          ? '@/components/games/module3/MiniBalance'
          : gameKey === 'module4'
          ? '@/components/games/module4/MiniHazard'
          : `@/components/games/${gameKey}`
      ).then((mod) => ({ default: mod.default })),
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