'use client'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { ComponentType } from 'react'

interface GameComponentProps {
  onComplete: () => void
}

interface HybridModuleProps {
  gameKey?: string
  onComplete: () => void
}

export default function HybridModule({ gameKey, onComplete }: HybridModuleProps) {
  if (!gameKey) {
    return <div>No game specified</div>
  }

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