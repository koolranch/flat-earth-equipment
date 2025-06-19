'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

/* ─── CDN paths ───────────────────────────────────────────── */
const CDN = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/'
const GAME = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/'

/* ─── Shutdown sequence (7 clicks) ────────────────────────── */
const STEPS: Step[] = [
  { id: 'neutral',  img: 'step_neutral.png',  x: 10, y: 68, fact: 'Shift lever to NEUTRAL first.' },
  { id: 'steer',    img: 'step_steer.png',    x: 25, y: 68, fact: 'Center steering wheel for straight exit.' },
  { id: 'brake',    img: 'step_brake.png',    x: 40, y: 68, fact: 'Set parking brake firmly.' },
  { id: 'forks',    img: 'step_forks.png',    x: 55, y: 68, fact: 'Lower forks flat on ground. Tilt mast fwd to relieve pressure.' },
  { id: 'keyoff',   img: 'step_keyoff.png',   x: 70, y: 68, fact: 'Turn key OFF & pocket it.' },
  { id: 'plug',     img: 'step_plug.png',     x: 55, y: 16, fact: 'Connect charger while wearing gloves & face shield.' },
  { id: 'chock',    img: 'step_chock.png',    x: 35, y: 16, fact: 'Place wheel chock on downhill tire.' }
]

export type Step = { id:string; img:string; x:number; y:number; fact:string }

/* ⏱ Config */
const LIMIT = 45 // seconds

export default function MiniShutdown({ onComplete }:{ onComplete:()=>void }) {
  /* state */
  const [idx,setIdx] = useState(0)             // current step index
  const [time,setTime] = useState(LIMIT)
  const [fails,setFails] = useState(0)         // run fails – for pulse help
  const [tooltip,setTooltip] = useState<string|null>(null)
  const [done,setDone]   = useState(false)
  const [focus,setFocus] = useState(0)         // keyboard focus index

  /* audio refs */
  const stepAudio = useRef<HTMLAudioElement>()
  const errorAudio= useRef<HTMLAudioElement>()
  const winAudio  = useRef<HTMLAudioElement>()
  useEffect(()=>{
    stepAudio.current  = new Audio(GAME+'step.wav')
    errorAudio.current = new Audio(GAME+'error.wav')
    winAudio.current   = new Audio(GAME+'win.wav')
  },[])

  /* countdown */
  useEffect(()=>{
    if(done) return
    if(time===0){ resetFail() ; return }
    const t = setTimeout(()=>setTime(t=>t-1),1000)
    return ()=>clearTimeout(t)
  },[time,done])

  // Debug state changes
  useEffect(() => {
    console.log(`🎯 Module 5 State: idx=${idx}, done=${done}, currentStep=${STEPS[idx]?.id || 'COMPLETE'}`)
  }, [idx, done])

  /* handle click */
  const handle = (step:Step)=>{
    console.log(`🖱️ Module 5 Click: clicked=${step.id}, expected=${STEPS[idx]?.id}, idx=${idx}`)
    
    if(done) {
      console.log(`❌ Game already done, ignoring click`)
      return
    }
    
    if(STEPS[idx].id === step.id){
      /* correct */
      console.log(`✅ Correct step! Advancing from ${idx} to ${idx + 1}`)
      stepAudio.current?.play().catch(()=>{})
      setTooltip(step.fact)
      setTimeout(()=>setTooltip(null),3800)
      // PPE overlay for charger step
      if(step.id==='plug') setShowPPE(true)
      setIdx(i=>i+1)
      if(idx+1===STEPS.length){
        console.log(`🎉 Game complete!`)
        winAudio.current?.play().catch(()=>{})
        setDone(true)
        setTimeout(onComplete,800)
      }
    } else {
      /* wrong order */
      console.log(`❌ Wrong step! Expected ${STEPS[idx].id} but clicked ${step.id}`)
      errorAudio.current?.play().catch(()=>{})
      setTooltip(`❌ Follow the sequence! Click ${STEPS[idx].id.toUpperCase()} next (step ${idx + 1}/7)`)
      setTimeout(()=>setTooltip(null), 2000)
      resetFail()
    }
  }

  const resetFail=()=>{
    setIdx(0)
    setFails(f=>f+1)
    setTime(LIMIT)
  }

  /* PPE overlay state */
  const [showPPE,setShowPPE] = useState(false)
  useEffect(()=>{ if(showPPE) setTimeout(()=>setShowPPE(false),1200) },[showPPE])

  /* keyboard navigation */
  const keyNav=(e:React.KeyboardEvent)=>{
    if(e.key==='ArrowRight') setFocus(f=>(f+1)%STEPS.length)
    if(e.key==='ArrowLeft')  setFocus(f=>(f-1+STEPS.length)%STEPS.length)
    if(e.key===' '||e.key==='Enter') handle(STEPS[focus])
  }

  /* helpers */
  const pulseHelp = fails>=2 // pulse next icon after 2 failed runs

  return (
    <div className="relative mx-auto max-w-md select-none" onKeyDown={keyNav} tabIndex={0}>
      {/* Instructions banner */}
      <div className="mb-2 rounded-md bg-blue-50 px-3 py-2 text-center text-xs text-blue-800">
        Sequential Shutdown: Follow OSHA procedure ({idx + 1}/7). Next: {STEPS[idx]?.id.toUpperCase() || 'COMPLETE'}
      </div>

      {/* HUD */}
      <div className="mb-1 flex justify-between text-xs">
        <span>✔ {idx}/{STEPS.length}</span>
        <span className={time<10?'text-red-600 font-semibold':''}>⏱ {time}s</span>
        <button className="underline" onClick={(e)=>{e.stopPropagation(); window.scrollTo({behavior:'smooth', top:0})}}>Replay&nbsp;0:29&nbsp;video</button>
      </div>

      {/* canvas */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-gray-800/20">
        <Image src={CDN+'bg5.png'} alt="Shutdown bay" fill className="object-cover" priority draggable={false}/>

        {STEPS.map((s,i)=>(
          <button
            key={s.id}
            aria-label={s.id}
            onClick={(e)=>{
              console.log(`🖱️ Button clicked: ${s.id}`)
              e.stopPropagation(); 
              handle(s)
            }}
            style={{left:`${s.x}%`,top:`${s.y}%`}}
            className={`absolute -translate-x-1/2 -translate-y-1/2 h-[100px] w-[100px] flex items-center justify-center transition
              ${i<idx?'opacity-20':'hover:scale-105 active:scale-95'}
              ${(pulseHelp && i===idx)?'before:absolute before:inset-0 before:rounded-full before:border-2 before:border-teal-400/80 before:animate-ping':''}
              ${i===idx?'ring-4 ring-yellow-400/50 before:absolute before:inset-0 before:rounded-full before:border-2 before:border-yellow-400/80 before:animate-ping':''}`}
          >
            <Image src={GAME+s.img} alt="" width={64} height={64} draggable={false}/>
            {/* Next step indicator */}
            {i === idx && (
              <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-black">
                {i + 1}
              </div>
            )}
          </button>
        ))}

        {/* PPE overlay */}
        {showPPE && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/50">
            <Image src={GAME+'ppe_gloves_face.png'} alt="PPE" width={96} height={96}/>
          </div>
        )}

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