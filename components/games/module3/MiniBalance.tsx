/**
 * Module-3 «Balloon-Fiesta Balance» – v2.0
 * • Enlarged target (touch-friendly)
 * • Distance-based hit-test (center-to-center) instead of tight bbox
 * • Auto-snap inside radius, gentle ease-out animation
 * • Live outline highlight when box enters radius
 */
'use client'
import { useState, useRef, useEffect } from 'react'
import { clsx } from 'clsx'

const CDN = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/'

type Box = { id: 'light' | 'medium' | 'heavy'; img: string; size: number; x: number; y: number }

const BOXES: Box[] = [
  { id: 'light',  img: CDN + 'box_light.png',  size: 64, x: 8,  y: 62 },
  { id: 'medium', img: CDN + 'box_med.png',   size: 72, x: 26, y: 62 },
  { id: 'heavy',  img: CDN + 'box_heavy.png', size: 80, x: 44, y: 62 }
]

const TARGET = { cx: 64, cy: 56, r: 15 } // % coordinates + radius

export default function MiniBalance({ onComplete }: { onComplete: () => void }) {
  const wrap = useRef<HTMLDivElement>(null)
  const [placed, setPlaced] = useState<Record<string, boolean>>({})
  const [dragId, setDragId] = useState<string | null>(null)
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(
    Object.fromEntries(BOXES.map(b => [b.id, { x: b.x, y: b.y }]))
  )
  const [glow, setGlow] = useState(false)
  const [banner, setBanner] = useState(true)

  /* auto-hide banner after 4 s */
  useEffect(() => {
    const t = setTimeout(() => setBanner(false), 4000)
    return () => clearTimeout(t)
  }, [])

  /* helper: % to px */
  const pct = (p: number, dim: number) => (p / 100) * dim

  /* hit test: centre of box inside circle radius */
  const inside = (xPct: number, yPct: number) => {
    const { width } = wrap.current!.getBoundingClientRect()
    const dist = Math.hypot(xPct - TARGET.cx, yPct - TARGET.cy)
    return dist <= TARGET.r
  }

  /* pointer handlers */
  const onPointerDown = (e: React.PointerEvent, id: Box) => {
    if (placed[id.id]) return
    const wrapRect = wrap.current!.getBoundingClientRect()
    const start = positions[id.id]
    const startX = e.clientX
    const startY = e.clientY
    setDragId(id.id)
    const move = (ev: PointerEvent) => {
      const dxPct = ((ev.clientX - startX) / wrapRect.width) * 100
      const dyPct = ((ev.clientY - startY) / wrapRect.height) * 100
      const newPos = { x: start.x + dxPct, y: start.y + dyPct }
      setPositions(p => ({ ...p, [id.id]: newPos }))
      setGlow(inside(newPos.x + id.size / wrapRect.width * 50, newPos.y + id.size / wrapRect.height * 50))
    }
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      const pos = positions[id.id]
      /* centre of box (in %) */
      const centreX = pos.x + (id.size / wrapRect.width)  * 50
      const centreY = pos.y + (id.size / wrapRect.height) * 50
      if (inside(centreX, centreY)) {
        /* snap exactly to target centre */
        setPositions(p => ({
          ...p,
          [id.id]: {
            x: TARGET.cx - (id.size / wrapRect.width)  * 50,
            y: TARGET.cy - (id.size / wrapRect.height) * 50
          }
        }))
        setPlaced(pl => ({ ...pl, [id.id]: true }))
        setBanner(false)
      } else {
        /* reset */
        setPositions(p => ({ ...p, [id.id]: { x: id.x, y: id.y } }))
      }
      setGlow(false)
      setDragId(null)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  /* completion */
  useEffect(() => {
    if (Object.keys(placed).length === BOXES.length) {
      setTimeout(onComplete, 400)
    }
  }, [placed])

  return (
    <div ref={wrap} className="relative mx-auto max-w-md select-none">
      {/* banner */}
      {banner && (
        <div className="absolute inset-x-0 top-2 mx-auto w-[94%] rounded-md bg-amber-50/90 px-3 py-2 text-center text-xs font-medium text-amber-900 shadow animate-fade-in-out">
          OSHA 29 CFR 1910.178 (g) – Keep load low & centered. Drag each box into the green circle.
        </div>
      )}

      {/* background */}
      <img src={CDN + 'bg3.png'} alt="" className="w-full rounded-lg" draggable={false} />

      {/* target ring */}
      <div
        className={clsx(
          'absolute rounded-full',
          glow ? 'border-2 border-teal-400 animate-pulse' : 'border border-green-600/60'
        )}
        style={{
          width: `${TARGET.r * 2}%`,
          height: `${TARGET.r * 2}%`,
          left: `${TARGET.cx - TARGET.r}%`,
          top: `${TARGET.cy - TARGET.r}%`
        }}
      />

      {/* boxes */}
      {BOXES.map(b => (
        <img
          key={b.id}
          src={b.img}
          alt={b.id}
          draggable={false}
          style={{
            width: b.size,
            height: b.size,
            position: 'absolute',
            left: `${positions[b.id].x}%`,
            top: `${positions[b.id].y}%`,
            transition: dragId === b.id ? 'none' : 'left 0.2s ease-out, top 0.2s ease-out',
            opacity: placed[b.id] ? 0.3 : 1
          }}
          className="cursor-grab active:cursor-grabbing"
          onPointerDown={e => onPointerDown(e, b)}
        />
      ))}
    </div>
  )
} 