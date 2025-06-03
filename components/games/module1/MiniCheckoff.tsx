'use client'
import { useState } from 'react'
import Image from 'next/image'

const steps = [
  { key: 'vest',     label: 'Tap vest to equip',      img: '/game/module1/vest.png' },
  { key: 'fork',     label: 'Tap ↓ to lower forks',   img: '/game/module1/fork_down.png' },
  { key: 'brake',    label: 'Tap brake to stop',      img: '/game/module1/brake.png' }
]

export default function MiniCheckoff({ onComplete }: { onComplete: () => void }) {
  const [idx, setIdx] = useState(0)

  const handleTap = () => {
    if (idx + 1 < steps.length) setIdx(i => i + 1)
    else onComplete()
  }

  return (
    <div
      className="relative aspect-video w-full max-w-md select-none overflow-hidden rounded-xl border bg-gray-100 shadow"
      style={{ background: `url('/game/module1/bg.png') center/cover` }}
      onClick={handleTap}
    >
      {/* hint text */}
      <p className="absolute top-4 left-1/2 -translate-x-1/2 rounded bg-black/60 px-4 py-1 text-sm font-medium text-white">
        {steps[idx].label}
      </p>

      {/* icon */}
      <div className="grid h-full place-content-center">
        <Image
          src={steps[idx].img}
          alt={steps[idx].key}
          width={128}
          height={128}
          priority
          className="animate-bounce"
        />
      </div>

      {/* progress dots */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {steps.map((_, i) => (
          <span
            key={i}
            className={`h-2 w-2 rounded-full ${i <= idx ? 'bg-orange-500' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  )
} 