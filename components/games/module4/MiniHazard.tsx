'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useLazyGameAssets } from '@/hooks/useLazyGameAssets'
import LiveRegion from '@/components/a11y/LiveRegion'
import { gameAssetUrl } from '@/lib/training/assets'

/* hazard catalogue */
const HAZARDS: Hazard[] = [
  { id: 'pedestrian', img: 'haz_pedestrian.png',  fact: 'Yield to pedestrians – keep 10 ft clearance.' },
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

export default function MiniHazard({ onComplete, assetKey = 'module4' }: { onComplete: () => void; assetKey?: string }) {
  /* state */
  const [spawned,setSpawned]   = useState<Spawn[]>([])
  const [caught,setCaught]     = useState(0)
  const [miss,setMiss]         = useState(0)
  const [time,setTime]         = useState(TIME)
  const [tooltip,setTooltip]   = useState<string|null>(null)
  const [done,setDone]         = useState(false)
  const [announce, setAnnounce] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(0)

  // Lazy load game assets using resolver
  const { assetsLoaded, isVisible, ref, playAudio } = useLazyGameAssets({
    images: HAZARDS.map(h => gameAssetUrl(assetKey, h.img)),
    backgrounds: [gameAssetUrl(assetKey, 'bg4.png')],
    audio: [
      gameAssetUrl(assetKey, 'success.wav'),
      gameAssetUrl(assetKey, 'thud.wav')
    ]
  })

  // Announce game start when assets are loaded
  useEffect(() => {
    if (assetsLoaded && !done) {
      setAnnounce(`Hazard hunt started! Find ${TOTAL} workplace hazards in ${TIME} seconds. Use Tab to navigate between hazards, then press Enter or Space to identify them. You have ${MISS_MAX} misses allowed.`)
    }
  }, [assetsLoaded, done])

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

  const catchHaz = (key:number, fact:string, hazardId:string)=>{
    setSpawned(arr=>arr.filter(h=>h.key!==key))
    setCaught(c=>c+1)
    playAudio('success')
    setTooltip(fact)
    setTimeout(()=>setTooltip(null),3200)
    
    // Announce progress and hazard information
    const newCaught = caught + 1
    setAnnounce(`Hazard identified: ${hazardId}. ${newCaught} of ${TOTAL} hazards found. ${fact}`)
    
    // Reset focus to first hazard when one is caught
    setFocusedIndex(0)
    
    if(newCaught === TOTAL){ win() }
  }

  const missClick = ()=>{
    playAudio('thud')
    const newMiss = miss + 1
    setMiss(newMiss)
    setAnnounce(`Missed! ${newMiss} of ${MISS_MAX} misses. Be careful - find the hazards!`)
    if(newMiss >= MISS_MAX) fail()
  }

  const fail = ()=>{
    setDone(true)
    setTooltip('⚠️ Restart the module and review the guide before retrying.')
    setAnnounce('Game over! Too many misses. Review the safety guide and try again.')
  }
  const win = ()=>{
    setDone(true)
    playAudio('success')
    setAnnounce(`Excellent! All ${TOTAL} hazards identified. Hazard hunt complete!`)
    setTimeout(onComplete, 900)
  }

  // Keyboard navigation for hazards
  const handleKeyDown = (e: React.KeyboardEvent, hazard: Spawn, index: number) => {
    if (done) return
    
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault()
        catchHaz(hazard.key, hazard.fact, hazard.id)
        break
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex((prev) => (prev + 1) % spawned.length)
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex((prev) => (prev - 1 + spawned.length) % spawned.length)
        break
      case 'Tab':
        // Allow default tab behavior
        break
      default:
        break
    }
  }

  /* render */
  return (
    <section ref={ref} className="relative mx-auto max-w-md" aria-label="Hazard Hunt Game">
      {/* Live announcements for screen readers */}
      <LiveRegion text={announce} />
      
      {/* HUD */}
      <div className="mb-1 flex justify-between text-xs" role="status" aria-label="Game statistics">
        <span aria-label={`${caught} of ${TOTAL} hazards found`}>✔ {caught}/{TOTAL}</span>
        <span 
          className={time<10 ?'text-red-600 font-semibold':''}
          aria-label={`${time} seconds remaining`}
        >
          ⏱ {time}s
        </span>
        <span 
          className="text-orange-500"
          aria-label={`${miss} of ${MISS_MAX} misses`}
        >
          ✖ {miss}/{MISS_MAX}
        </span>
      </div>

      {/* Loading state */}
      {!assetsLoaded && (
        <div className="aspect-video w-full overflow-hidden rounded-xl border bg-gray-100 flex items-center justify-center">
          <div className="text-gray-500 text-sm">Loading hazard hunt...</div>
        </div>
      )}

      {/* canvas */}
      {assetsLoaded && (
        <button
          className="relative aspect-video w-full overflow-hidden rounded-xl border bg-transparent p-0 cursor-default focus:outline-none focus:ring-4 focus:ring-[#F76511] focus:ring-opacity-50"
          onClick={()=>!done && missClick()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              if (!done) missClick()
            }
          }}
          aria-label="Hazard hunting game area. Click or press Enter to miss if you click on empty space."
          tabIndex={done ? -1 : 0}
          disabled={done}
        >
          <Image src={gameAssetUrl(assetKey, 'bg4.png')} alt="Warehouse background scene" fill className="object-cover" draggable={false}/>

        {spawned.map((h, index)=>(
          <button
            key={h.key}
            aria-label={`${h.id} hazard. Press Enter or Space to identify this hazard.`}
            aria-describedby={tooltip ? 'hazard-tooltip' : undefined}
            className={`
              absolute -translate-x-1/2 -translate-y-1/2 active:scale-95 
              focus:outline-none focus:ring-4 focus:ring-[#F76511] focus:ring-opacity-75
              hover:scale-110 transition-transform duration-200
              ${index === focusedIndex ? 'ring-4 ring-blue-500 ring-opacity-50' : ''}
            `}
            style={{left:`${h.x}%`,top:`${h.y}%`}}
            onClick={(e)=>{ e.stopPropagation(); catchHaz(h.key, h.fact, h.id) }}
            onKeyDown={(e) => handleKeyDown(e, h, index)}
            onFocus={() => setFocusedIndex(index)}
            tabIndex={done ? -1 : 0}
            disabled={done}
          >
            <Image 
              src={gameAssetUrl(assetKey, h.img)} 
              alt={`${h.id} hazard icon`} 
              width={64} 
              height={64} 
              draggable={false}
            />
          </button>
        ))}

        {/* tooltip */}
        {tooltip && (
          <div 
            id="hazard-tooltip"
            className="pointer-events-none absolute bottom-3 left-1/2 w-11/12 -translate-x-1/2 rounded bg-black/80 px-3 py-2 text-center text-[13px] text-white"
            role="tooltip"
            aria-live="polite"
          >
            {tooltip}
          </div>
        )}
        </button>
      )}
    </section>
  )
}

/* internal type */
type Spawn = Hazard & { key:number; x:number; y:number } 