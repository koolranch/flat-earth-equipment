/**
 * Module-3 «Balloon-Fiesta Balance» – v2.0
 * • Enlarged target (touch-friendly)
 * • Distance-based hit-test (center-to-center) instead of tight bbox
 * • Auto-snap inside radius, gentle ease-out animation
 * • Live outline highlight when box enters radius
 */
import { useState, useRef, useEffect } from 'react'
import { clsx } from 'clsx'

interface Box {
  id: 'light' | 'medium' | 'heavy'
  img: string
  size: number // px
  x: number    // %
  y: number
}

const CDN = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/'
const BOXES: Box[] = [
  { id: 'light',  img: CDN + 'box_light.png',  size: 64, x: 8,  y: 62 },
  { id: 'medium', img: CDN + 'box_med.png',   size: 72, x: 26, y: 62 },
  { id: 'heavy',  img: CDN + 'box_heavy.png', size: 80, x: 44, y: 62 },
]
// target centre (as % of container) + radius %
const TARGET = { cx: 64, cy: 56, r: 15 } // r enlarged from 8 ➜ 15

export default function MiniBalance({ onComplete }: { onComplete: () => void }) {
  const wrap = useRef<HTMLDivElement>(null)
  const [placed, setPlaced] = useState<Record<string, boolean>>({})
  const [dragId, setDragId] = useState<string | null>(null)
  const [temp, setTemp] = useState<{ id: string; dx: number; dy: number } | null>(null)

  /** helper – converts % → px */
  const pctToPx = (pct: number, dim: number) => (pct / 100) * dim
  /** hit-test for current box centre */
  const withinTarget = (xPx: number, yPx: number) => {
    const box = wrap.current!.getBoundingClientRect()
    const cxPx = pctToPx(TARGET.cx, box.width)
    const cyPx = pctToPx(TARGET.cy, box.height)
    const dist = Math.hypot(xPx - cxPx, yPx - cyPx)
    return dist <= pctToPx(TARGET.r, box.width)
  }

  /* pointer handlers */
  function startDrag(e: React.PointerEvent<HTMLImageElement>, id: string) {
    if (placed[id]) return
    const img = e.currentTarget
    img.setPointerCapture(e.pointerId)
    const rect = img.getBoundingClientRect()
    setDragId(id)
    setTemp({ id, dx: e.clientX - rect.left, dy: e.clientY - rect.top })
  }
  function moveDrag(e: React.PointerEvent<HTMLImageElement>) {
    if (!dragId || !temp) return
    const box = wrap.current!.getBoundingClientRect()
    const xPx = e.clientX - temp.dx - box.left + temp!.dx
    const yPx = e.clientY - temp.dy - box.top + temp!.dy
    const img = e.currentTarget
    img.style.left = `${xPx}px`
    img.style.top  = `${yPx}px`
    // highlight ring when inside radius
    setRingGlow(withinTarget(xPx + temp.dx, yPx + temp.dy))
  }
  const [ringGlow, setRingGlow] = useState(false)

  function endDrag(e: React.PointerEvent<HTMLImageElement>, boxData: Box) {
    if (!dragId || !temp) return
    const wrapRect = wrap.current!.getBoundingClientRect()
    const xPx = e.clientX - temp.dx - wrapRect.left + temp.dx
    const yPx = e.clientY - temp.dy - wrapRect.top + temp.dy

    if (withinTarget(xPx + boxData.size / 2, yPx + boxData.size / 2)) {
      // snap to center
      const img = e.currentTarget
      img.style.transition = 'left 0.25s ease-out, top 0.25s ease-out'
      img.style.left = `${pctToPx(TARGET.cx, wrapRect.width) - boxData.size / 2}px`
      img.style.top  = `${pctToPx(TARGET.cy, wrapRect.height) - boxData.size / 2}px`
      setPlaced(p => ({ ...p, [boxData.id]: true }))
    } else {
      // reset to origin
      e.currentTarget.style.transition = 'left 0.25s, top 0.25s'
      e.currentTarget.style.left = ''
      e.currentTarget.style.top  = ''
    }
    setRingGlow(false)
    setDragId(null)
    setTemp(null)
  }

  /* complete check */
  useEffect(() => {
    if (Object.keys(placed).length === BOXES.length) {
      setTimeout(onComplete, 400)
    }
  }, [placed])

  return (
    <div ref={wrap} className="relative max-w-md mx-auto select-none">
      {/* bg */}
      <img src={`${CDN}bg3.png`} alt="warehouse bg" className="w-full rounded-lg" draggable={false} />

      {/* target ring */}
      <div
        className={clsx('absolute rounded-full border-2', ringGlow ? 'border-teal-400 animate-pulse' : 'border-green-600/60')}
        style={{
          width: `${TARGET.r * 2}%`,
          height: `${TARGET.r * 2}%`,
          left: `${TARGET.cx - TARGET.r}%`,
          top: `${TARGET.cy - TARGET.r}%`,
        }}
      />

      {/* boxes */}
      {BOXES.map(b => (
        <img
          key={b.id}
          src={b.img}
          alt={b.id}
          className={clsx(
            'absolute cursor-grab active:cursor-grabbing',
            placed[b.id] && 'opacity-80'
          )}
          style={{
            width: b.size,
            height: b.size,
            left: `${b.x}%`,
            top: `${b.y}%`,
          }}
          onPointerDown={e => startDrag(e, b.id)}
          onPointerMove={moveDrag}
          onPointerUp={e => endDrag(e, b)}
          onPointerCancel={e => endDrag(e, b)}
        />
      ))}
    </div>
  )
} 