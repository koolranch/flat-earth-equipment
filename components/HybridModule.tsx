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
  const [error, setError] = useState<string | null>(null)
  const [gameComponent, setGameComponent] = useState<ComponentType<GameComponentProps> | null>(null)

  console.log('🎮 HybridModule render:', { gameKey, introUrl, phase, error })

  if (!gameKey) {
    console.error('❌ No gameKey provided')
    return <div className="text-red-500">No game specified</div>
  }

  // If we have an intro video and we're in the intro phase, show the video
  if (introUrl && phase === 'intro') {
    console.log('📹 Showing intro video:', introUrl)
    return (
      <div className="space-y-4">
        <video 
          className="w-full rounded-lg" 
          controls 
          onEnded={() => {
            console.log('📹 Video ended, switching to game phase')
            setPhase('game')
          }}
        >
          <source src={introUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    )
  }

  // Game phase - dynamically import the game component
  console.log('🎮 Game phase - attempting to load component for:', gameKey)

  // Try to dynamically import the game component
  const loadGameComponent = async () => {
    try {
      console.log('📦 Starting dynamic import for:', gameKey)
      let GameComponent: ComponentType<GameComponentProps>
      
      if (gameKey === 'module1') {
        console.log('📦 Loading MiniCheckoff component...')
        const module = await import('./games/module1/MiniCheckoff')
        GameComponent = module.default
        console.log('✅ MiniCheckoff loaded successfully')
      } else if (gameKey === 'module2') {
        console.log('📦 Loading MiniInspection component...')
        const module = await import('./games/module2/MiniInspection')
        GameComponent = module.default
        console.log('✅ MiniInspection loaded successfully')
      } else {
        throw new Error(`Unknown game key: ${gameKey}`)
      }
      
      setGameComponent(() => GameComponent)
      console.log('🎮 Game component set successfully')
    } catch (err) {
      console.error('❌ Dynamic import failed:', err)
      setError(`Failed to load game: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  // Load component on first render or when gameKey changes
  if (!gameComponent && !error && phase === 'game') {
    console.log('🔄 Loading game component...')
    loadGameComponent()
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading game...</p>
      </div>
    )
  }

  if (error) {
    console.error('💥 Rendering error state:', error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-semibold">Game Loading Error</h3>
        <p className="text-red-700 mt-1">{error}</p>
        <button 
          onClick={() => {
            setError(null)
            setGameComponent(null)
          }}
          className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!gameComponent) {
    console.log('⏳ Game component not loaded yet')
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Preparing game...</p>
      </div>
    )
  }

  console.log('🎮 Rendering game component')
  const GameComponent = gameComponent
  
  return (
    <div className="space-y-4">
      <Suspense fallback={
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading game...</p>
        </div>
      }>
        <GameComponent onComplete={onComplete} />
      </Suspense>
    </div>
  )
} 