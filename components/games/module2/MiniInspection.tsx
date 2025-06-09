'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

/* ─── ASSET BASES ─────────────────────────────────────────────── */
const CDN_VIDEO =
  'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/'
const CDN_GAME =
  'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/game/'

/* ─── HOTSPOT DATA ────────────────────────────────────────────── */
const HOTSPOTS: Hotspot[] = [
  {
    id: 'tires',
    file: 'tires.png',
    x: 10,
    y: 60,
    fact: 'Tires: Cuts or 25 % wear can cause blow-outs.'
  },
  {
    id: 'forks',
    file: 'forks.png',
    x: 55,
    y: 70,
    fact: 'Forks: 10 % heel wear = remove from service.'
  },
  {
    id: 'chain',
    file: 'chain.png',
    x: 78,
    y: 25,
    fact: 'Mast chains: 2 broken links require replacement.'
  },
  {
    id: 'horn',
    file: 'horn.png',
    x: 32,
    y: 20,
    fact: 'Horn must be audible 50 ft away.'
  },
  {
    id: 'lights',
    file: 'lights.png',
    x: 45,
    y: 10,
    fact: 'Lights: Replace cracked lenses immediately.'
  },
  {
    id: 'hydraulic',
    file: 'hydraulic.png',
    x: 65,
    y: 80,
    fact: 'Hydraulic rods should be clean—no oil film.'
  },
  {
    id: 'leak',
    file: 'leak.png',
    x: 22,
    y: 85,
    fact: 'Fluid under truck? Tag-out until fixed.'
  },
  {
    id: 'plate',
    file: 'plate.png',
    x: 88,
    y: 55,
    fact: 'Data plate must be present & legible.'
  }
]

type Hotspot = {
  id: string
  file: string
  x: number
  y: number
  fact: string
}

/* ─── HELPER ──────────────────────────────────────────────────── */
const shuffle = <T,>(arr: T[]) =>
  arr
    .map(v => [Math.random(), v] as const)
    .sort((a, b) => a[0] - b[0])
    .map(v => v[1])

/* ─── COMPONENT ──────────────────────────────────────────────── */
export default function MiniInspection({
  onComplete
}: {
  onComplete: () => void
}) {
  /* game state */
  const [mode, setMode] = useState<'seq' | 'free'>('seq')
  const [order, setOrder] = useState<string[]>(HOTSPOTS.map(h => h.id))
  const [found, setFound] = useState<string[]>([])
  const [wrong, setWrong] = useState(0)
  const [time, setTime] = useState(45)
  const [tooltip, setTooltip] = useState<string | null>(null)
  const sirenRef = useRef<HTMLAudioElement | null>(null)

  /* effect: shuffle order for free-mode */
  useEffect(() => {
    if (mode === 'free') setOrder(shuffle(HOTSPOTS.map(h => h.id)))
    else setOrder(HOTSPOTS.map(h => h.id))
    setFound([])
    setWrong(0)
    setTime(45)
    setTooltip(null)
  }, [mode])

  /* countdown */
  useEffect(() => {
    if (found.length === HOTSPOTS.length || time === 0) return
    const id = setTimeout(() => setTime(t => t - 1), 1_000)
    return () => clearTimeout(id)
  }, [time, found.length])

  /* win / lose */
  useEffect(() => {
    if (found.length === HOTSPOTS.length) onComplete()
  }, [found.length, onComplete])

  /* tap handler */
  const tap = (h: Hotspot) => {
    const nextId = order[found.length]
    const correct = mode === 'free' || h.id === nextId

    if (correct && !found.includes(h.id)) {
      setFound(f => [...f, h.id])
      setTooltip(h.fact)
      setTimeout(() => setTooltip(null), 1_400)
    } else {
      setWrong(w => w + 1)
      setTime(t => Math.max(t - 5, 0))
      /* play siren if available */
      if (!sirenRef.current) {
        const audio = new Audio(`${CDN_GAME}siren.wav`)
        sirenRef.current = audio
      }
      sirenRef.current!.currentTime = 0
      sirenRef.current!.play().catch(() => {}) // ignore any autoplay block
    }
  }

  /* classes */
  const pulse =
    'before:absolute before:inset-0 before:rounded-full before:border-2 before:border-teal-400/80 before:opacity-70 before:animate-ping'

  return (
    <div className="relative mx-auto max-w-md">
      {/* Mode toggle */}
      <div className="mb-2 flex items-center justify-end gap-2 text-xs">
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            className="accent-orange-600"
            checked={mode === 'free'}
            onChange={e => setMode(e.target.checked ? 'free' : 'seq')}
          />
          Hard&nbsp;(free-order)
        </label>
      </div>

      {/* game canvas */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-gray-900">
        {/* background */}
        <Image
          src={`${CDN_VIDEO}bg2.png`}
          alt="Warehouse"
          fill
          priority
          className="object-cover"
          draggable={false}
        />

        {/* hotspots */}
        {HOTSPOTS.map(h => {
          const done = found.includes(h.id)
          const next = order[found.length] === h.id
          return (
            <button
              key={h.id}
              aria-label={h.id}
              disabled={done}
              className={`absolute z-20 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition
                ${done ? 'opacity-20' : 'hover:scale-110 active:scale-95'}
                ${!done && next && mode === 'seq' ? pulse : ''}
              `}
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
              onClick={() => tap(h)}
            >
              <Image
                src={`${CDN_GAME}${h.file}`}
                alt={h.id}
                width={64}
                height={64}
                draggable={false}
              />
            </button>
          )
        })}

        {/* HUD */}
        <div className="absolute top-2 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded bg-black/70 px-3 py-1 text-xs text-white">
          <span>✔ {found.length}/8</span>
          <span>|</span>
          <span className={time < 10 ? 'text-red-400' : ''}>⏱ {time}s</span>
          <span>|</span>
          <span className="text-orange-300">✖ {wrong}</span>
        </div>

        {/* tooltip */}
        {tooltip && (
          <div className="pointer-events-none absolute bottom-4 left-1/2 z-30 w-11/12 -translate-x-1/2 rounded bg-black/80 px-3 py-2 text-center text-[13px] text-white shadow">
            {tooltip}
          </div>
        )}
      </div>
    </div>
  )
} 