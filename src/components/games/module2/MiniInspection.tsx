'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'

/* New CDN root — videos bucket, no trailing slash */
const CDN = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos'

// Cache-busting timestamp
const CACHE_BUST = '?v=' + Date.now()

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

  /* Countdown */
  useEffect(() => {
    if (found.length === items.length || timeLeft === 0) return
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, found.length])

  /* Success */
  useEffect(() => {
    if (found.length === items.length) onComplete()
  }, [found, onComplete])

  /* Wrong-tap penalty */
  const handleWrongTap = () => {
    setTimeLeft(t => Math.max(t - 5, 0))
    window.navigator.vibrate?.(120)
    const audio = new Audio(`${CDN}/siren.wav`)
    audio.play().catch(() => {})
  }

  return (
    <div className="relative aspect-video w-full max-w-md select-none overflow-hidden rounded-xl border bg-gray-900 shadow">
      {/* Background with forklift silhouette */}
      <Image
        src={`${CDN}/bg2.png${CACHE_BUST}`}
        alt="Steel-mill bay"
        fill
        priority
        className="object-cover opacity-80"
        draggable={false}
      />

      {/* Wrong-tap overlay - sits *below* hotspots */}
      <div className="absolute inset-0 z-10" onClick={handleWrongTap} />

      {/* Hotspots */}
      {items.map(it => (
        <Image
          key={it.id}
          src={`${CDN}/${it.img}${CACHE_BUST}`}
          alt={it.label}
          width={64}
          height={64}
          draggable={false}
          role="button"
          aria-label={it.label}
          className={`absolute z-20 cursor-pointer transition-opacity duration-300 ${
            found.includes(it.id)
              ? 'opacity-30 drop-shadow-[0_0_6px_#4ade80]'
              : 'animate-pulse opacity-90'
          }`}
          style={{ left: `${it.x}%`, top: `${it.y}%` }}
          onClick={e => {
            e.stopPropagation()
            if (found.includes(it.id)) return
            setFound(f => [...f, it.id])
          }}
        />
      ))}

      {/* HUD */}
      <div className="absolute top-2 left-1/2 z-30 -translate-x-1/2 flex gap-3 rounded bg-black/70 px-3 py-1 text-xs text-white">
        <span>Found {found.length}/8</span>
        <span>|</span>
        <span className={timeLeft < 10 ? 'text-red-400' : ''}>{timeLeft}s</span>
      </div>
    </div>
  )
} 