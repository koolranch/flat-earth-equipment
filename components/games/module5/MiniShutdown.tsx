'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'

/* Supabase videos bucket — keep the trailing slash */
const CDN =
  'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/'

/* ordered shutdown steps */
const STEPS = [
  { id: 'neutral',  file: 'step_neutral.png',  label: 'Shift to Neutral',  x: 12, y: 68 },
  { id: 'brake',    file: 'step_brake.png',    label: 'Parking Brake',     x: 30, y: 68 },
  { id: 'forks',    file: 'step_forks.png',    label: 'Forks Down',        x: 48, y: 68 },
  { id: 'keyoff',   file: 'step_keyoff.png',   label: 'Key Off',           x: 66, y: 68 },
  { id: 'plug',     file: 'step_plug.png',     label: 'Plug Charger',      x: 48, y: 16 },
  { id: 'chock',    file: 'step_chock.png',    label: 'Wheel Chock',       x: 30, y: 16 }
]

export default function MiniShutdown({ onComplete }: { onComplete: () => void }) {
  const [index, setIndex] = useState(0)       // next expected step
  const [time,  setTime]  = useState(45)
  const [done,  setDone]  = useState<string[]>([])

  /* timer */
  useEffect(() => {
    if (index === STEPS.length || time === 0) return
    const id = setTimeout(() => setTime(t => t - 1), 1000)
    return () => clearTimeout(id)
  }, [time, index])

  /* success */
  useEffect(() => {
    if (index === STEPS.length) onComplete()
  }, [index, onComplete])

  const tap = (id: string) => {
    if (id === STEPS[index].id) {
      setDone(d => [...d, id])
      setIndex(i => i + 1)
    } else {
      setDone([]); setIndex(0)   // reset on wrong order
    }
  }

  return (
    <div className="relative aspect-video w-full max-w-md select-none overflow-hidden rounded-xl border bg-gray-900 shadow">
      {/* background */}
      <Image
        src={`${CDN}bg.png`}
        alt="Bozeman shutdown bay"
        fill
        priority
        className="object-cover opacity-80"
        draggable={false}
      />

      {/* step icons */}
      {STEPS.map(s => (
        <Image
          key={s.id}
          src={`${CDN}${s.file}`}
          alt={s.label}
          width={64}
          height={64}
          draggable={false}
          role="button"
          aria-label={s.label}
          className={`absolute z-20 cursor-pointer transition duration-200 ${
            done.includes(s.id)
              ? 'opacity-20 drop-shadow-[0_0_6px_#4ade80]'
              : index === STEPS.findIndex(x => x.id === s.id)
              ? 'animate-bounce'
              : 'opacity-90'
          }`}
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
          onClick={() => tap(s.id)}
        />
      ))}

      {/* HUD */}
      <div className="absolute top-2 left-1/2 z-30 -translate-x-1/2 flex gap-3 rounded bg-black/70 px-3 py-1 text-xs text-white">
        <span>Step {index}/{STEPS.length}</span>
        <span>|</span>
        <span className={time < 10 ? 'text-red-400' : ''}>{time}s</span>
      </div>
    </div>
  )
} 