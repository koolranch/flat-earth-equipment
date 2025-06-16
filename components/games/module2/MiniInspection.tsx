'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

/* ─── ASSET BASES ─────────────────────────────────────────────── */
const CDN_VIDEO =
  'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/'
const CDN_GAME =
  'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/'

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
  locale = 'en',
  onComplete
}: {
  locale?: 'en' | 'es'
  onComplete: () => void
}) {
  /* Translations */
  const t = {
    en: {
      hardMode: 'Hard (free-order)',
      hotspots: [
        {
          id: 'tires',
          file: 'tires.png',
          x: 10,
          y: 60,
          fact: 'Tires: Cuts or 25% wear can cause blow-outs.'
        },
        {
          id: 'forks',
          file: 'forks.png',
          x: 55,
          y: 70,
          fact: 'Forks: 10% heel wear = remove from service.'
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
    },
    es: {
      hardMode: 'Difícil (orden libre)',
      hotspots: [
        {
          id: 'tires',
          file: 'tires.png',
          x: 10,
          y: 60,
          fact: 'Neumáticos: Cortes o 25% de desgaste pueden causar reventones.'
        },
        {
          id: 'forks',
          file: 'forks.png',
          x: 55,
          y: 70,
          fact: 'Horquillas: 10% de desgaste del talón = retirar del servicio.'
        },
        {
          id: 'chain',
          file: 'chain.png',
          x: 78,
          y: 25,
          fact: 'Cadenas del mástil: 2 eslabones rotos requieren reemplazo.'
        },
        {
          id: 'horn',
          file: 'horn.png',
          x: 32,
          y: 20,
          fact: 'Bocina debe ser audible a 50 pies de distancia.'
        },
        {
          id: 'lights',
          file: 'lights.png',
          x: 45,
          y: 10,
          fact: 'Luces: Reemplazar lentes agrietados inmediatamente.'
        },
        {
          id: 'hydraulic',
          file: 'hydraulic.png',
          x: 65,
          y: 80,
          fact: 'Varillas hidráulicas deben estar limpias—sin película de aceite.'
        },
        {
          id: 'leak',
          file: 'leak.png',
          x: 22,
          y: 85,
          fact: '¿Fluido bajo el camión? Etiquetar fuera de servicio hasta reparar.'
        },
        {
          id: 'plate',
          file: 'plate.png',
          x: 88,
          y: 55,
          fact: 'Placa de datos debe estar presente y legible.'
        }
      ]
    }
  }[locale]

  /* game state */
  const [mode, setMode] = useState<'seq' | 'free'>('seq')
  const [order, setOrder] = useState<string[]>(t.hotspots.map(h => h.id))
  const [found, setFound] = useState<string[]>([])
  const [wrong, setWrong] = useState(0)
  const [time, setTime] = useState(45)
  const [tooltip, setTooltip] = useState<string | null>(null)
  const sirenRef = useRef<HTMLAudioElement | null>(null)

  /* effect: shuffle order for free-mode */
  useEffect(() => {
    if (mode === 'free') setOrder(shuffle(t.hotspots.map(h => h.id)))
    else setOrder(t.hotspots.map(h => h.id))
    setFound([])
    setWrong(0)
    setTime(45)
    setTooltip(null)
  }, [mode, t.hotspots])

  /* countdown */
  useEffect(() => {
    if (found.length === t.hotspots.length || time === 0) return
    const id = setTimeout(() => setTime(t => t - 1), 1_000)
    return () => clearTimeout(id)
  }, [time, found.length, t.hotspots.length])

  /* win / lose */
  useEffect(() => {
    if (found.length === t.hotspots.length) onComplete()
  }, [found.length, onComplete, t.hotspots.length])

  /* tap handler */
  const tap = (h: Hotspot) => {
    const nextId = order[found.length]
    const correct = mode === 'free' || h.id === nextId

    console.log(`🎯 Tap handler: clicked=${h.id}, expected=${nextId}, correct=${correct}, mode=${mode}`)

    if (correct && !found.includes(h.id)) {
      setFound(f => [...f, h.id])
      setTooltip(h.fact)
      setTimeout(() => setTooltip(null), 3_500)
    } else {
      setWrong(w => w + 1)
      setTime(t => Math.max(t - 5, 0))
      
      // Show helpful error message
      if (mode === 'seq') {
        const expectedName = nextId?.charAt(0).toUpperCase() + nextId?.slice(1)
        setTooltip(`❌ Wrong sequence! Click ${expectedName} next (step ${found.length + 1}/8)`)
        setTimeout(() => setTooltip(null), 2_000)
      } else {
        setTooltip('❌ Already found or incorrect item')
        setTimeout(() => setTooltip(null), 1_500)
      }
      
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
      {/* Instructions banner */}
      <div className="mb-2 rounded-md bg-blue-50 px-3 py-2 text-center text-xs text-blue-800">
        {mode === 'seq' 
          ? `Sequential Mode: Click hotspots in order (${found.length + 1}/8). Next: ${order[found.length]?.toUpperCase() || 'COMPLETE'}`
          : 'Free Mode: Click any inspection point'
        }
      </div>

      {/* Mode toggle */}
      <div className="mb-2 flex items-center justify-end gap-2 text-xs">
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            className="accent-orange-600"
            checked={mode === 'free'}
            onChange={e => setMode(e.target.checked ? 'free' : 'seq')}
          />
          {t.hardMode}
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
        {t.hotspots.map(h => {
          const done = found.includes(h.id)
          const next = order[found.length] === h.id
          return (
            <button
              key={h.id}
              aria-label={h.id}
              disabled={done}
              className={`absolute z-20 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition
                ${done ? 'opacity-20' : 'hover:scale-110 active:scale-95'}
                ${!done && next && mode === 'seq' ? pulse + ' ring-4 ring-yellow-400/50' : ''}
              `}
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
              onClick={() => {
                console.log(`🎯 Clicked: ${h.id}, Expected: ${order[found.length]}, Mode: ${mode}`)
                tap(h)
              }}
            >
              <Image
                src={`${CDN_GAME}${h.file}`}
                alt={h.id}
                width={64}
                height={64}
                draggable={false}
              />
              {/* Next indicator */}
              {!done && next && mode === 'seq' && (
                <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-black">
                  {found.length + 1}
                </div>
              )}
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