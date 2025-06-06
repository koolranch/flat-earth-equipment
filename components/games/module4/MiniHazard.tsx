'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

const CDN =
  'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/'

/* hazard sprite pool */
const SPRITES = ['haz_pedestrian.png', 'haz_spill.png', 'haz_blind.png']
const TOTAL    = 10          // hazards user must flag
const MISS_MAX = 3
const TIMER    = 60          // seconds

type Haz = { id: number; file: string; x: number; y: number }

export default function MiniHazard({ onComplete }: { onComplete: () => void }) {
  const stage            = useRef<HTMLDivElement>(null)
  const [haz,    setHaz] = useState<Haz[]>([])
  const [caught, setC]   = useState(0)
  const [miss,   setM]   = useState(0)
  const [t,      setT]   = useState(TIMER)

  /* spawn until TOTAL reached */
  useEffect(() => {
    if (haz.length >= TOTAL) return
    const spawn = () => {
      if (!stage.current) return
      const rect = stage.current.getBoundingClientRect()
      setHaz(h => [
        ...h,
        {
          id: Date.now(),
          file: SPRITES[h.length % SPRITES.length],
          x: Math.random() * (rect.width - 64),
          y: Math.random() * (rect.height - 64)
        }
      ])
    }
    spawn()
    const iv = setInterval(spawn, 3000)
    return () => clearInterval(iv)
  }, [haz.length])

  /* timer */
  useEffect(() => {
    if (t === 0 || caught === TOTAL || miss >= MISS_MAX) return
    const iv = setTimeout(() => setT(s => s - 1), 1000)
    return () => clearTimeout(iv)
  }, [t, caught, miss])

  /* win / reset logic */
  useEffect(() => {
    if (caught === TOTAL) {
      onComplete()
    }
    if (miss >= MISS_MAX || t === 0) {
      setHaz([])
      setC(0)
      setM(0)
      setT(TIMER)
    }
  }, [caught, miss, t, onComplete])

  const hit = (id?: number) => {
    if (id) {
      setHaz(h => h.filter(z => z.id !== id))
      setC(c => c + 1)
    } else {
      setM(m => m + 1)
    }
  }

  return (
    <div
      ref={stage}
      className="relative aspect-video w-full max-w-md select-none overflow-hidden rounded-xl border bg-gray-900 shadow"
      onClick={() => hit()}   /* miss tap */
    >
      {/* background */}
      <Image
        src={`${CDN}bg4.png`}
        alt="Las Cruces warehouse"
        fill
        priority
        className="object-cover"
        draggable={false}
      />

      {/* hazards */}
      {haz.map(h => (
        <Image
          key={h.id}
          src={`${CDN}${h.file}`}
          alt="hazard"
          width={64}
          height={64}
          draggable={false}
          className="absolute z-20 cursor-pointer animate-pulse"
          style={{ left: h.x, top: h.y }}
          onClick={e => {
            e.stopPropagation()
            hit(h.id)
          }}
        />
      ))}

      {/* HUD */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex gap-3 rounded bg-black/70 px-3 py-1 text-xs text-white">
        <span>Caught {caught}/{TOTAL}</span>
        <span>|</span>
        <span className={t < 10 ? 'text-red-400' : ''}>{t}s</span>
        <span>|</span>
        <span className={miss ? 'text-orange-400' : ''}>Miss {miss}/{MISS_MAX}</span>
      </div>
    </div>
  )
} 