/**
 * MiniPPE – Module-1 interactive demo (Vest → Hardhat → Forks ↓ → Brake)
 * Enhancements:
 *  • Progress banner "Step x/4"
 *  • Toast micro-prompts with OSHA-aligned text
 *  • Wrong-order shake + tooltip hint
 *  • ARIA labels for a11y
 *  • Success screen linking back to 10-point guide
 */
import { useState, useRef, useEffect } from 'react'
import { clsx } from 'clsx'
import Image from 'next/image'
import { useLazyGameAssets } from '@/hooks/useLazyGameAssets'

interface Props {
  onComplete: () => void
  openGuide: () => void // callback to open reference guide slide-out
}

// CDN URLs for PPE images
const CDN_BASE = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/'

const STEPS = [
  {
    id: 'vest',
    label: 'Put on vest',
    toast: 'Vest on – ANSI/ISEA 107 Class 2',
    aria: 'Equip high-visibility vest (ANSI/ISEA 107)',
    image: `${CDN_BASE}vest.png`,
  },
  {
    id: 'hardhat',
    label: 'Put on hardhat',
    toast: 'Hardhat on – head protection required',
    aria: 'Equip safety hardhat for head protection',
    image: `${CDN_BASE}hardhat.png`,
  },
  {
    id: 'forks',
    label: 'Lower forks',
    toast: 'Forks lowered – prevents tip-over',
    aria: 'Lower forks flat to the ground',
    image: '/game/module1/fork_down.png',
  },
  {
    id: 'brake',
    label: 'Set brake',
    toast: 'Brake set – verify seat-belt next shift',
    aria: 'Set parking brake firmly',
    image: '/game/module1/brake.png',
  },
] as const

type StepId = (typeof STEPS)[number]['id']

export default function MiniPPE({ onComplete, openGuide }: Props) {
  const [progress, setProgress] = useState(0) // 0-4
  const [toast, setToast] = useState<string | null>(null)
  const [hint, setHint] = useState<string | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  
  // Lazy load game assets
  const { assetsLoaded, isVisible, ref } = useLazyGameAssets({
    images: STEPS.map(s => s.image),
    backgrounds: ['/game/cheyenne_bg.png']
  })

  /** show toast for 3.5 s */
  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(id)
  }, [toast])

  function handleTap(id: StepId, el: HTMLButtonElement) {
    if (STEPS[progress].id !== id) {
      // wrong order – shake & hint
      el.classList.add('animate-shake')
      setHint(`Start with ${STEPS[progress].label}`)
      setTimeout(() => el.classList.remove('animate-shake'), 600)
      return
    }
    // correct
    setProgress(p => p + 1)
    setToast(STEPS[progress].toast)
    setHint(null)
  }

  // completed -> success screen then callback
  useEffect(() => {
    if (progress === STEPS.length) {
      setToast('Pre-op quick check complete!')
      setTimeout(() => onComplete(), 1200)
    }
  }, [progress])

  return (
    <div ref={ref} className="relative max-w-md mx-auto select-none">
      {/* Loading state */}
      {!assetsLoaded && (
        <div className="aspect-video w-full overflow-hidden rounded-xl border bg-gray-100 flex items-center justify-center">
          <div className="text-gray-500 text-sm">Loading PPE checklist...</div>
        </div>
      )}

      {assetsLoaded && (
        <>
          {/* progress banner */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-sm px-3 py-1 rounded-full shadow z-10">
            {progress < 4 ? `Step ${progress + 1}/4` : '✔ Completed'}
          </div>

          {/* hint tooltip */}
          {hint && (
            <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs px-2 py-1 rounded shadow animate-pulse z-10">
              {hint}
            </div>
          )}

          {/* hotspot buttons overlayed on background */}
          <div className="relative pt-[75%] bg-[url('/game/cheyenne_bg.png')] bg-cover rounded-lg overflow-hidden">
        {STEPS.map((step, idx) => (
          <button
            key={step.id}
            aria-label={step.aria}
            disabled={progress > idx}
            className={clsx(
              'absolute flex items-center justify-center rounded-full border-2 border-white shadow-lg transition-all duration-200',
              progress === idx ? 'bg-teal-600 text-white animate-pulse scale-110' : 'bg-gray-200 text-gray-700',
              progress > idx && 'bg-green-500 text-white',
              // PPE items are smaller circular buttons with images
              (step.id === 'vest' || step.id === 'hardhat') ? 'w-12 h-12' : 'w-14 h-14'
            )}
            style={{
              left: idx === 0 ? '35%' : idx === 1 ? '53%' : idx === 2 ? '32%' : '60%',
              bottom: idx === 0 ? '55%' : idx === 1 ? '55%' : '22%',
            }}
            onClick={e => handleTap(step.id, e.currentTarget)}
          >
            {/* Show image for PPE items, text for others */}
            {(step.id === 'vest' || step.id === 'hardhat') ? (
              <Image
                src={step.image}
                alt={step.label}
                width={24}
                height={24}
                className="object-contain"
              />
            ) : (
              <span className="text-[10px] font-bold">
                {step.label.split(' ')[0]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* toast */}
      {toast && (
        <div className="mt-2 text-center text-sm bg-gray-800 text-white py-1 rounded shadow animate-fade-in">
          {toast}
        </div>
      )}

          {/* guide link after finish */}
          {progress === 4 && (
            <button
              onClick={openGuide}
              className="mt-3 w-full text-sm text-teal-700 underline underline-offset-2"
            >
              Review full 10-point inspection list →
            </button>
          )}
        </>
      )}
    </div>
  )
}

/* tiny tailwind keyframes */
// In globals.css or scoped <style jsx>
// .animate-shake { @apply animate-[shake_0.6s] }
// @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
// .animate-fade-in { @apply animate-[fade_0.4s] }
// @keyframes fade { from {opacity:0} to {opacity:1} } 