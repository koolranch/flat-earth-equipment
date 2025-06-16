'use client'
import { useState } from 'react'
import Image from 'next/image'

// Updated to use the new videos bucket for uploaded assets
const CDN_VIDEOS = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos'
const CDN_GAME = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/game'

export default function MiniCheckoff({ locale = 'en', onComplete }: { locale?: 'en' | 'es', onComplete: () => void }) {
  const [idx, setIdx] = useState(0)

  const t = {
    en: {
      steps: [
        { key: 'vest',  label: 'Tap vest to equip',      img: `${CDN_GAME}/vest.png` },
        { key: 'fork',  label: 'Tap ↓ to lower forks',   img: `${CDN_GAME}/fork_down.png` },
        { key: 'brake', label: 'Tap brake to stop',      img: `${CDN_VIDEOS}/step_brake.png` }
      ],
      clickToContinue: 'Click to continue'
    },
    es: {
      steps: [
        { key: 'vest',  label: 'Toque el chaleco para equipar',     img: `${CDN_GAME}/vest.png` },
        { key: 'fork',  label: 'Toque ↓ para bajar las horquillas', img: `${CDN_GAME}/fork_down.png` },
        { key: 'brake', label: 'Toque el freno para parar',         img: `${CDN_VIDEOS}/step_brake.png` }
      ],
      clickToContinue: 'Haga clic para continuar'
    }
  }[locale]

  const handleTap = () => {
    if (idx + 1 < t.steps.length) setIdx(i => i + 1)
    else onComplete()
  }

  return (
    <div
      className="relative aspect-video w-full max-w-md select-none overflow-hidden rounded-xl border bg-gray-100 shadow cursor-pointer hover:scale-105 transition-transform"
      style={{ background: `url('${CDN_VIDEOS}/bg.png') center/cover` }}
      onClick={handleTap}
    >
      {/* hint text */}
      <p className="absolute top-4 left-1/2 -translate-x-1/2 rounded-lg bg-black/80 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm">
        {t.steps[idx].label}
      </p>

      {/* icon */}
      <div className="grid h-full place-content-center">
        <Image
          src={t.steps[idx].img}
          alt={t.steps[idx].key}
          width={128}
          height={128}
          priority
          className="animate-bounce drop-shadow-lg"
        />
      </div>

      {/* progress dots */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {t.steps.map((_, i) => (
          <span
            key={i}
            className={`h-3 w-3 rounded-full transition-all duration-300 ${
              i <= idx 
                ? 'bg-orange-500 scale-110' 
                : 'bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Click indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-xs text-orange-600 font-medium animate-pulse">
        {t.clickToContinue}
      </div>
    </div>
  )
} 