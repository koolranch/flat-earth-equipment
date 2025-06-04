'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'

const CDN = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/game'

type Item = { id: string; label: string; x: number; y: number; img: string }

const items: Item[] = [
  { id: 'tires',     label: 'Tires',        x: 10,  y: 60,  img: 'tires.png' },
  { id: 'forks',     label: 'Forks',        x: 55,  y: 70,  img: 'forks.png' },
  { id: 'chain',     label: 'Mast Chain',   x: 78,  y: 25,  img: 'chain.png' },
  { id: 'horn',      label: 'Horn',         x: 32,  y: 20,  img: 'horn.png' },
  { id: 'lights',    label: 'Lights',       x: 45,  y: 10,  img: 'lights.png' },
  { id: 'hydraulic', label: 'Hydraulic',    x: 65,  y: 80,  img: 'hydraulic.png' },
  { id: 'leak',      label: 'Fluid Leak',   x: 22,  y: 85,  img: 'leak.png' },
  { id: 'plate',     label: 'Data Plate',   x: 88,  y: 55,  img: 'plate.png' }
]

export default function MiniInspection({ onComplete }: { onComplete: () => void }) {
  const [found, setFound] = useState<string[]>([])
  const [timeLeft, setTimeLeft] = useState(45)
  const [isShaking, setIsShaking] = useState(false)

  // countdown timer
  useEffect(() => {
    if (found.length === items.length) return
    if (timeLeft === 0) return
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, found.length])

  // success
  useEffect(() => {
    if (found.length === items.length) {
      onComplete()
    }
  }, [found, onComplete])

  // wrong tap penalty
  const handleWrongTap = () => {
    setTimeLeft(t => Math.max(t - 5, 0))
    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 500)
    
    if (typeof window !== 'undefined') {
      window.navigator.vibrate?.(100)
      try {
        const audio = new Audio(`${CDN}/siren.wav`)
        audio.volume = 0.3
        audio.play().catch(() => {})
      } catch (e) {
        // Silent fail if audio doesn't load
      }
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={`relative aspect-video w-full select-none overflow-hidden rounded-xl border bg-gray-900 shadow transition-transform duration-100 ${
          isShaking ? 'animate-pulse scale-105' : ''
        }`}
      >
        {/* background warehouse image */}
        <Image
          src={`${CDN}/bg2.png`}
          alt="Warehouse"
          fill
          priority
          className="object-cover opacity-80"
          draggable={false}
        />

        {/* hotspots */}
        {items.map(it => (
          <Image
            key={it.id}
            src={`${CDN}/${it.img}`}
            alt={it.label}
            width={48}
            height={48}
            draggable={false}
            className={`absolute cursor-pointer transition-all duration-300 hover:scale-110 ${
              found.includes(it.id) 
                ? 'opacity-20 scale-75' 
                : 'animate-pulse opacity-90 drop-shadow-lg'
            }`}
            style={{ 
              left: `${it.x}%`, 
              top: `${it.y}%`,
              transform: 'translate(-50%, -50%)',
              filter: found.includes(it.id) ? 'grayscale(100%)' : 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.6))'
            }}
            onClick={e => {
              e.stopPropagation()
              if (found.includes(it.id)) return
              setFound(f => [...f, it.id])
            }}
          />
        ))}

        {/* catch wrong taps */}
        <div
          className="absolute inset-0"
          onClick={handleWrongTap}
        />

        {/* HUD */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-lg bg-black/80 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
          <span className="text-green-400">Found {found.length}/8</span>
          <span className="text-gray-400">|</span>
          <span className={`${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-blue-400'}`}>
            {timeLeft}s
          </span>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="w-full bg-gray-700/50 rounded-full h-2 backdrop-blur-sm">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(found.length / items.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Time up overlay */}
        {timeLeft === 0 && found.length < items.length && (
          <div className="absolute inset-0 bg-red-900/80 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center text-white">
              <h3 className="text-xl font-bold mb-2">Time's Up!</h3>
              <p className="text-sm opacity-90">Found {found.length}/8 items</p>
              <button 
                onClick={() => {
                  setFound([])
                  setTimeLeft(45)
                }}
                className="mt-3 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Instructions */}
      <div className="mt-3 text-center text-sm text-gray-600 space-y-1">
        <p><strong>Find all 8 inspection points before time runs out!</strong></p>
        <p className="text-xs">Wrong taps cost 5 seconds</p>
      </div>
    </div>
  )
} 