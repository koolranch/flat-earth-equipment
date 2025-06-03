'use client'
import { useState, Suspense } from 'react'
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

  if (!gameKey) {
    return <div>No game specified</div>
  }

  // If we have an intro video and we're in the intro phase, show the video
  if (introUrl && phase === 'intro') {
    return (
      <div className="w-full">
        <video
          src={introUrl}
          controls
          className="w-full rounded-lg"
          playsInline
          onEnded={() => setPhase('game')}
        />
      </div>
    )
  }

  // Otherwise, show the game
  const Game = dynamic(
    () =>
      import(`@/components/games/${gameKey === 'module1' ? 'module1/MiniCheckoff' : gameKey}`),
    { ssr: false }
  ) as ComponentType<GameComponentProps>

  return (
    <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-lg">Loading game...</div>}>
      <Game onComplete={onComplete} />
    </Suspense>
  )
} 