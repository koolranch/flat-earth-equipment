'use client'
import { useEffect, useState } from 'react'
import createConfig from './phaserConfig1'
import Phaser from 'phaser'

export default function Module1Game({ onComplete }: { onComplete: () => void }) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = 'phaser-module1'
    let game: Phaser.Game | null = null
    
    const listener = () => { 
      onComplete() 
      if (game) {
        game.destroy(true)
      }
    }

    if (typeof window !== 'undefined') {
      game = new Phaser.Game(createConfig(id))
      window.addEventListener('GameComplete', listener)
      setLoading(false)
    }
    
    return () => {
      if (game) {
        game.destroy(true)
      }
      window.removeEventListener('GameComplete', listener)
    }
  }, [onComplete])

  return (
    <>
      {loading && (
        <div className="aspect-video w-full animate-pulse rounded-xl bg-gray-300" />
      )}
      <div 
        id="phaser-module1" 
        className="aspect-video w-full overflow-hidden rounded-xl touch-none select-none"
        style={{ 
          display: loading ? 'none' : 'block',
          touchAction: 'manipulation' // Improves touch responsiveness on mobile
        }}
      />
      <div className="mt-2 text-xs text-gray-500 text-center md:hidden">
        Tap and hold the control buttons to drive the forklift
      </div>
    </>
  )
} 