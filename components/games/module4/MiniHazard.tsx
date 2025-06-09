'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

/* CDN bases */
const CDN_IMG = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/'
const CDN_BG  = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/bg4.png'

/* hazard catalogue */
const HAZARDS: Hazard[] = [
  { id: 'pedestrian', img: 'haz_pedestrian.png',  fact: 'Yield to pedestrians – keep 3 ft clearance.' },
  { id: 'blind',      img: 'haz_blind.png',       fact: 'Blind corner: sound horn, proceed slowly.' },
  { id: 'spill',      img: 'haz_spill.png',       fact: 'Oil spill: tag-out forklift until cleaned.' },
  { id: 'overhead',   img: 'haz_overhead.png',    fact: 'Low beam: lower mast to travel position.' },
  { id: 'unstable',   img: 'haz_unstable.png',    fact: 'Unstable load: tilt mast back before travel.' },
  { id: 'speed',      img: 'haz_speed.png',       fact: 'Slow to 3 mph in pedestrian zones.' },
  { id: 'ramp',       img: 'haz_ramp.png',        fact: 'On ramps, travel with load upgrade.' },
  { id: 'battery',    img: 'haz_battery.png',     fact: 'Battery charge area – no open flames.' }
]
type Hazard = { id:string; img:string; fact:string }

/* config */
const TOTAL = 10         // must clear 10 hazards
const TIME  = 60         // seconds
const MISS_MAX = 3       // 3 misses = fail

export default function MiniHazard({ onComplete }: { onComplete: () => void }) {
  /* state */
  const [spawned,setSpawned]   = useState<Spawn[]>([])
  const [caught,setCaught]     = useState(0)
  const [miss,setMiss]         = useState(0)
  const [time,setTime]         = useState(TIME)
  const [tooltip,setTooltip]   = useState<string|null>(null)
  const [done,setDone]         = useState(false)

  const clickSnd = useRef<HTMLAudioElement>()
  const errSnd   = useRef<HTMLAudioElement>()
  const winSnd   = useRef<HTMLAudioElement>()

  /* load audio once */
  useEffect(()=>{
    clickSnd.current = new Audio(CDN_IMG + 'success.wav')
    errSnd.current   = new Audio(CDN_IMG + 'thud.wav')
    winSnd.current   = new Audio(CDN_IMG + 'success.wav')
  },[])

  /* countdown */
  useEffect(()=>{
    if(done) return
    if(time===0){ fail(); return }
    const id=setTimeout(()=>setTime(t=>t-1),1_000)
    return ()=>clearTimeout(id)
  },[time,done])

  /* spawner */
  useEffect(()=>{
    if(done) return
    const interval = caught < 5 ? 2500 : 2000
    const id = setInterval(()=>spawn(), interval)
    return ()=>clearInterval(id)
  },[caught,done])

  /* functions */
  const spawn = ()=>{
    if(spawned.length >= 4) return              // max 4 on screen
    const hz = HAZARDS[Math.floor(Math.random()*HAZARDS.length)]
    const x  = 10 + Math.random()*80
    const y  = 20 + Math.random()*55
    setSpawned(arr=>[...arr,{...hz,key:Date.now()+Math.random(),x,y}])
  }

  const catchHaz = (key:number, fact:string)=>{
    setSpawned(arr=>arr.filter(h=>h.key!==key))
    setCaught(c=>c+1)
    clickSnd.current?.play().catch(()=>{})
    setTooltip(fact)
    setTimeout(()=>setTooltip(null),1500)
    if(caught+1 === TOTAL){ win() }
  }

  const missClick = ()=>{
    errSnd.current?.play().catch(()=>{})
    setMiss(m=>m+1)
    if(miss+1 >= MISS_MAX) fail()
  }

  const fail = ()=>{
    setDone(true)
    setTooltip('⚠️ Restart the module and review the guide before retrying.')
  }
  const win = ()=>{
    setDone(true)
    winSnd.current?.play().catch(()=>{})
    setTimeout(onComplete, 900)
  }

  /* render */
  return (
    <div className="relative mx-auto max-w-md">
      {/* HUD */}
      <div className="mb-1 flex justify-between text-xs">
        <span>✔ {caught}/{TOTAL}</span>
        <span className={time<10 ?'text-red-600 font-semibold':''}>⏱ {time}s</span>
        <span className="text-orange-500">✖ {miss}/{MISS_MAX}</span>
      </div>

      {/* canvas */}
      <div
        className="relative aspect-video w-full overflow-hidden rounded-xl border"
        onClick={()=>!done && missClick()}
      >
        <Image src={CDN_BG} alt="" fill priority className="object-cover" draggable={false}/>

        {spawned.map(h=>(
          <button
            key={h.key}
            aria-label={h.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 active:scale-95"
            style={{left:`${h.x}%`,top:`${h.y}%`}}
            onClick={(e)=>{ e.stopPropagation(); catchHaz(h.key,h.fact) }}
          >
            <Image src={CDN_IMG + h.img} alt="" width={64} height={64} draggable={false}/>
          </button>
        ))}

        {/* tooltip */}
        {tooltip && (
          <div className="pointer-events-none absolute bottom-3 left-1/2 w-11/12 -translate-x-1/2 rounded bg-black/80 px-3 py-2 text-center text-[13px] text-white">
            {tooltip}
          </div>
        )}
      </div>
    </div>
  )
}

/* internal type */
type Spawn = Hazard & { key:number; x:number; y:number } 