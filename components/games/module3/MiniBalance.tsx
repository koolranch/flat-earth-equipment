'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

/* ─── CDN BASES ─────────────────────────────────────────────── */
const CDN = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/'

/* ─── DATA ──────────────────────────────────────────────────── */
const BOXES = [
  { id: 'light', img: 'box_light.png', weight: 10, fact: 'Start with lighter loads – better stability.' },
  { id: 'med',   img: 'box_med.png',   weight: 30, fact: 'Gradual weight increase builds confidence.' },
  { id: 'heavy', img: 'box_heavy.png', weight: 50, fact: 'Heavy loads require extra care and precision.' }
] as const

type BoxId = (typeof BOXES)[number]['id']

const startPos: Record<BoxId, { x: number; y: number }> = {
  light: { x: 8,  y: 62 },
  med:   { x: 26, y: 62 },
  heavy: { x: 46, y: 62 }
}

const TARGET = { x: 64, y: 56, r: 8 } // % + radius

/* ─── COMPONENT ─────────────────────────────────────────────── */
export default function MiniBalance({ onComplete }: { onComplete: () => void }) {
  const [mode, setMode] = useState<'easy'|'free'>('easy')
  const [placed, setPlaced] = useState<BoxId[]>([])
  const [dragging, setDragging] = useState<BoxId | null>(null)
  const [time, setTime] = useState(60)
  const [wrong, setWrong] = useState(0)
  const [toast, setToast]   = useState<string|null>(null)

  /* audio refs */
  const successRef = useRef<HTMLAudioElement>()
  const thudRef    = useRef<HTMLAudioElement>()

  /* timer */
  useEffect(() => {
    if (time === 0 || placed.length === 3) return
    const id = setTimeout(() => setTime(t => t - 1), 1_000)
    return () => clearTimeout(id)
  }, [time, placed.length])

  /* load audio once on mount */
  useEffect(() => {
    successRef.current = new Audio(CDN + 'success.wav')
    thudRef.current    = new Audio(CDN + 'thud.wav')
  }, [])

  /* complete */
  useEffect(() => {
    if (placed.length === 3) {
      successRef.current?.play().catch(()=>{})
      setTimeout(onComplete, 800)
    }
  }, [placed.length, onComplete])

  /* reset when mode toggles */
  useEffect(() => {
    setPlaced([])
    setTime(60)
    setWrong(0)
  }, [mode])

  /* order for sequential mode */
  const nextId = BOXES[placed.length]?.id

  /* helper: distance from pct coords to target center */
  const inTarget = (xPct: number, yPct: number) =>
    Math.hypot(xPct - TARGET.x, yPct - TARGET.y) <= TARGET.r

  /* ─── RENDER ─────────────────────────────────────────────── */
  return (
    <div className="relative mx-auto max-w-md">
      {/* ── HUD ── */}
      <div className="mb-1 flex items-center justify-between text-xs">
        <label className="flex items-center gap-1 select-none">
          <input
            type="checkbox"
            className="accent-orange-600"
            checked={mode === 'free'}
            onChange={e => setMode(e.target.checked ? 'free' : 'easy')}
          />
          Hard&nbsp;(Free)
        </label>
        <div className="flex gap-3">
          <span>✔ {placed.length}/3</span>
          <span className={time < 10 ? 'text-red-600 font-semibold' : ''}>⏱ {time}s</span>
          <span className="text-orange-500">✖ {wrong}</span>
        </div>
      </div>

      {/* ── GAME CANVAS ── */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-gray-900">
        {/* background */}
        <Image src={CDN + 'bg3.png'} alt="" fill className="object-cover" draggable={false} priority />

        {/* target */}
        <div
          className="absolute rounded-full border-2 border-green-400/70 bg-green-400/10"
          style={{
            left: `calc(${TARGET.x}% - ${TARGET.r}%)`,
            top:  `calc(${TARGET.y}% - ${TARGET.r}%)`,
            width: `${TARGET.r * 2}%`,
            height:`${TARGET.r * 2}%`,
          }}
          aria-hidden
        />

        {/* draggable boxes */}
        {BOXES.map(box => (
          <DragBox
            key={box.id}
            box={box}
            start={startPos[box.id]}
            hidden={placed.includes(box.id)}
            pulse={mode==='easy' && box.id===nextId}
            setDragging={setDragging}
            onDrop={(x,y)=> {
              if (inTarget(x,y) && (!placed.includes(box.id)) &&
                  (mode==='free' || box.id===nextId)) {
                setPlaced(p=>[...p, box.id])
                setToast(box.fact)
                setTimeout(()=>setToast(null),1400)
                successRef.current?.play().catch(()=>{})
              } else {
                /* wrong */
                if (!inTarget(x,y)) thudRef.current?.play().catch(()=>{})
                setWrong(w=>w+1)
              }
            }}
          />
        ))}

        {/* tooltip */}
        {toast && (
          <div className="pointer-events-none absolute bottom-3 left-1/2 w-11/12 -translate-x-1/2 rounded bg-black/80 px-3 py-2 text-center text-[13px] text-white">
            {toast}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Single draggable sprite ──────────────────────────────── */
function DragBox({
  box,
  start,
  hidden,
  pulse,
  setDragging,
  onDrop
}: {
  box: (typeof BOXES)[number]
  start: { x:number; y:number }
  hidden: boolean
  pulse: boolean
  setDragging: (id: BoxId|null)=>void
  onDrop: (xPct:number, yPct:number)=>void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos,setPos] = useState(start)

  /* pointer handlers */
  const down = (e: React.PointerEvent) => {
    if (hidden) return
    setDragging(box.id)
    const startX=e.clientX; const startY=e.clientY
    const move = (ev:PointerEvent)=>{
      const dx = (ev.clientX-startX)/ref.current!.parentElement!.clientWidth*100
      const dy = (ev.clientY-startY)/ref.current!.parentElement!.clientHeight*100
      setPos(p=>({x:p.x+dx,y:p.y+dy}))
    }
    const up = (ev:PointerEvent)=>{
      window.removeEventListener('pointermove',move)
      window.removeEventListener('pointerup',up)
      onDrop(pos.x,pos.y)
      setDragging(null)
    }
    window.addEventListener('pointermove',move)
    window.addEventListener('pointerup',up)
  }

  if (hidden) return null
  return (
    <div
      ref={ref}
      role="button"
      aria-label={`Box ${box.id}`}
      tabIndex={0}
      style={{
        position:'absolute',
        left:`calc(${pos.x}% - 32px)`,
        top:`calc(${pos.y}% - 32px)`,
        touchAction:'none'
      }}
      onPointerDown={down}
      onKeyDown={e=>{
        if(e.key==='Enter'||e.key===' ') down(e as any)
      }}
      className={`h-16 w-16 select-none active:scale-95
        ${pulse?'before:absolute before:inset-0 before:rounded-full before:border-2 before:border-teal-400/80 before:animate-ping':''}`}
    >
      <Image
        src={CDN + box.img}
        alt=""
        width={64}
        height={64}
        draggable={false}
        className="drop-shadow-lg"
      />
    </div>
  )
} 