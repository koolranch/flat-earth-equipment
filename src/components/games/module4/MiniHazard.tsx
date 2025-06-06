'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

const CDN =
  'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/'

/* sprite pool */
const SPRITES = ['haz_pedestrian.png', 'haz_spill.png', 'haz_blind.png']
const NEED    = 10   /* total to catch  */
const MISSMAX = 3
const TIME    = 60   /* seconds */

type Haz = { id:number; file:string; x:number; y:number }

export default function MiniHazard({ onComplete }:{onComplete:()=>void}) {
  const stage           = useRef<HTMLDivElement>(null)
  const [haz,setHaz]    = useState<Haz[]>([])
  const [hit,setHit]    = useState(0)
  const [miss,setMiss]  = useState(0)
  const [sec,setSec]    = useState(TIME)

  /* spawn */
  useEffect(()=>{
    if(haz.length>=NEED) return
    const add=()=>{
      if(!stage.current) return
      const r=stage.current.getBoundingClientRect()
      setHaz(h=>[...h,{
        id:Date.now(),
        file:SPRITES[h.length%SPRITES.length],
        x:Math.random()*(r.width-64),
        y:Math.random()*(r.height-64)
      }])
    }
    add()
    const iv=setInterval(add,3000)
    return()=>clearInterval(iv)
  },[haz.length])

  /* timer */
  useEffect(()=>{
    if(sec===0||hit===NEED||miss>=MISSMAX) return
    const iv=setTimeout(()=>setSec(s=>s-1),1000)
    return()=>clearTimeout(iv)
  },[sec,hit,miss])

  /* win/lose */
  useEffect(()=>{
    if(hit===NEED){onComplete()}
    if(miss>=MISSMAX||sec===0){
      setHaz([]);setHit(0);setMiss(0);setSec(TIME)
    }
  },[hit,miss,sec,onComplete])

  const flag=(id?:number)=>{
    if(id){
      setHaz(h=>h.filter(z=>z.id!==id))
      setHit(h=>h+1)
    }else{setMiss(m=>m+1)}
  }

  return(
    <div ref={stage}
      className="relative aspect-video w-full max-w-md select-none overflow-hidden rounded-xl border bg-gray-900 shadow"
      onClick={()=>flag()}
    >
      <Image src={`${CDN}bg4.png`} alt="Las Cruces warehouse" fill priority className="object-cover" />
      {haz.map(h=>(
        <Image key={h.id} src={`${CDN}${h.file}`} alt="hazard" width={64} height={64}
          className="absolute z-20 cursor-pointer animate-pulse"
          style={{left:h.x,top:h.y}}
          onClick={e=>{e.stopPropagation();flag(h.id)}}/>
      ))}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex gap-3 rounded bg-black/70 px-3 py-1 text-xs text-white">
        <span>Caught {hit}/{NEED}</span><span>|</span>
        <span className={sec<10?'text-red-400':''}>{sec}s</span><span>|</span>
        <span className={miss?'text-orange-400':''}>Miss {miss}/{MISSMAX}</span>
      </div>
    </div>
  )
} 