'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'

/* Supabase videos bucket — trailing slash important */
const CDN =
  'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/'

/* ordered shutdown steps */
const STEPS = [
  { id: 'neutral', file: 'step_neutral.png', label: 'Shift to Neutral', x: 12, y: 68 },
  { id: 'brake',   file: 'step_brake.png',   label: 'Parking Brake',    x: 30, y: 68 },
  { id: 'forks',   file: 'step_forks.png',   label: 'Forks Down',       x: 48, y: 68 },
  { id: 'keyoff',  file: 'step_keyoff.png',  label: 'Key Off',          x: 66, y: 68 },
  { id: 'plug',    file: 'step_plug.png',    label: 'Plug Charger',     x: 48, y: 16 },
  { id: 'chock',   file: 'step_chock.png',   label: 'Wheel Chock',      x: 30, y: 16 }
]

export default function MiniShutdown({ onComplete }: { onComplete: () => void }) {
  const [idx,  setIdx]  = useState(0)        // next expected step
  const [done, setDone] = useState<string[]>([])
  const [t,    setT]    = useState(45)       // timer seconds

  /* countdown */
  useEffect(() => {
    if (idx === STEPS.length || t === 0) return
    const id = setTimeout(() => setT(s => s - 1), 1000)
    return () => clearTimeout(id)
  }, [t, idx])

  /* completion */
  useEffect(() => {
    if (idx === STEPS.length) onComplete()
  }, [idx, onComplete])

  const tap = (id: string) => {
    if (id === STEPS[idx].id) {
      setDone(d => [...d, id])
      setIdx(i => i + 1)
    } else {            // wrong order → reset
      setDone([]); setIdx(0)
    }
  }

  return (
    <div className="relative aspect-video w-full max-w-md select-none overflow-hidden rounded-xl border bg-gray-900 shadow">
      {/* snowy Bozeman background */}
      <Image
        src={`${CDN}bg5.png`}
        alt="Bozeman shutdown bay"
        fill priority
        className="object-cover opacity-80"
        draggable={false}
      />

      {/* clickable step icons */}
      {STEPS.map(s => (
        <Image
          key={s.id}
          src={`${CDN}${s.file}`}
          alt={s.label}
          width={64} height={64}
          draggable={false}
          role="button" aria-label={s.label}
          className={`absolute z-20 cursor-pointer transition duration-200 ${
            done.includes(s.id)
              ? 'opacity-20 drop-shadow-[0_0_6px_#4ade80]'
              : idx === STEPS.findIndex(x => x.id === s.id)
              ? 'animate-bounce'
              : 'opacity-90'
          }`}
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
          onClick={() => tap(s.id)}
        />
      ))}

      {/* HUD */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex gap-3 rounded bg-black/70 px-3 py-1 text-xs text-white">
        <span>Step {idx}/{STEPS.length}</span>
        <span>|</span>
        <span className={t < 10 ? 'text-red-400' : ''}>{t}s</span>
      </div>
    </div>
  )
} 