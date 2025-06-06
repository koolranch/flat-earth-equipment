'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

const CDN =
  'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/'

type Box = { id: string; file: string; x: number; y: number; w: number; h: number }

const BOXES: Box[] = [
  { id: 'light',  file: 'box_light.png',  x:  8, y: 62, w: 64, h: 64 },
  { id: 'medium', file: 'box_med.png',    x: 26, y: 62, w: 72, h: 72 },
  { id: 'heavy',  file: 'box_heavy.png',  x: 46, y: 62, w: 80, h: 80 }
]

const TARGET = { x: 64, y: 56, r: 8 } // center & radius in %

export default function MiniBalance({ onComplete }: { onComplete: () => void }) {
  const [pos, setPos]   = useState<Record<string,{x:number;y:number}>>(
    Object.fromEntries(BOXES.map(b => [b.id, { x: b.x, y: b.y }]))
  )
  const [dragId, setDragId] = useState<string|null>(null)
  const [placed, setPlaced] = useState<string[]>([])
  const [time,   setTime]   = useState(60)
  const frameRef            = useRef<HTMLDivElement>(null)

  /* Timer */
  useEffect(() => {
    if (placed.length === BOXES.length || time === 0) return
    const t = setTimeout(() => setTime(tl => tl - 1), 1000)
    return () => clearTimeout(t)
  }, [time, placed.length])

  /* Success */
  useEffect(() => {
    if (placed.length === BOXES.length) {
      // Try to play success audio, but don't block if it fails
      try {
        const audio = new Audio(`${CDN}success.wav`)
        audio.volume = 0.3
        audio.play().catch(() => {
          console.log('Success audio not available')
        })
      } catch (e) {
        console.log('Success audio failed to load')
      }
      onComplete()
    }
  }, [placed, onComplete])

  /* Drag helpers */
  const startDrag = (e: React.PointerEvent, id: string) => {
    if (placed.includes(id)) return
    setDragId(id)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  const moveDrag = (e: React.PointerEvent) => {
    if (!dragId) return
    const rect = frameRef.current!.getBoundingClientRect()
    setPos(p => ({
      ...p,
      [dragId]: {
        x: ((e.clientX - rect.left) / rect.width)  * 100,
        y: ((e.clientY - rect.top)  / rect.height) * 100
      }
    }))
  }
  const endDrag = () => {
    if (!dragId) return
    const { x, y } = pos[dragId]
    const d = Math.hypot(x - TARGET.x, y - TARGET.y)
    if (d <= TARGET.r) {
      setPlaced(p => [...p, dragId])
    } else {
      const meta = BOXES.find(b => b.id === dragId)!
      setPos(p => ({ ...p, [dragId]: { x: meta.x, y: meta.y } }))
      // Try to play thud audio, but don't block if it fails
      try {
        const audio = new Audio(`${CDN}thud.wav`)
        audio.volume = 0.3
        audio.play().catch(() => {
          console.log('Thud audio not available')
        })
      } catch (e) {
        console.log('Thud audio failed to load')
      }
    }
    setDragId(null)
  }

  return (
    <div
      ref={frameRef}
      className="relative aspect-video w-full max-w-md select-none overflow-hidden rounded-xl border bg-gray-900 shadow"
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
    >
      {/* Background */}
      <Image
        src={`${CDN}bg3.png`}
        alt="Warehouse with forklift"
        fill
        priority
        className="object-cover opacity-80"
        draggable={false}
      />

      {/* Target */}
      <div
        className="absolute z-10 rounded-full bg-green-400/40"
        style={{
          left: `${TARGET.x - TARGET.r}%`,
          top:  `${TARGET.y - TARGET.r}%`,
          width:`${TARGET.r*2}%`,
          height:`${TARGET.r*2}%`
        }}
      />

      {/* Boxes */}
      {BOXES.map(b => (
        <Image
          key={b.id}
          src={`${CDN}${b.file}`}
          alt={b.id}
          width={b.w}
          height={b.h}
          draggable={false}
          className={`absolute z-20 cursor-grab ${
            placed.includes(b.id) ? 'opacity-20' : ''
          }`}
          style={{
            left:`calc(${pos[b.id].x}% - ${b.w/2}px)`,
            top: `calc(${pos[b.id].y}% - ${b.h/2}px)`
          }}
          onPointerDown={e => startDrag(e, b.id)}
        />
      ))}

      {/* HUD */}
      <div className="absolute top-2 left-1/2 z-30 -translate-x-1/2 flex gap-3 rounded bg-black/70 px-3 py-1 text-xs text-white">
        <span>Placed {placed.length}/{BOXES.length}</span>
        <span>|</span>
        <span className={time<10?'text-red-400':''}>{time}s</span>
      </div>
    </div>
  )
} 