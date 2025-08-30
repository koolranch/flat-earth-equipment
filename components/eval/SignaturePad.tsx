'use client';
import { useEffect, useRef, useState } from 'react';

export default function SignaturePad({ onChange }: { onChange?: (dataUrl: string|null)=>void }){
  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  const [drawing, setDrawing] = useState(false);

  useEffect(()=>{
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#0F172A';
    
    function pos(e: PointerEvent){ if (!c) return { x: 0, y: 0 }; const r = c.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    function down(e: PointerEvent){ if (!ctx) return; (e.target as Element).setPointerCapture(e.pointerId); setDrawing(true); const p=pos(e); ctx.beginPath(); ctx.moveTo(p.x,p.y); }
    function move(e: PointerEvent){ if(!drawing || !ctx) return; const p=pos(e); ctx.lineTo(p.x,p.y); ctx.stroke(); }
    function up(){ setDrawing(false); try { if (c) onChange?.(c.toDataURL('image/png')); } catch { onChange?.(null); } }
    
    c.addEventListener('pointerdown', down); 
    c.addEventListener('pointermove', move); 
    window.addEventListener('pointerup', up);
    
    return ()=>{ 
      c.removeEventListener('pointerdown', down); 
      c.removeEventListener('pointermove', move); 
      window.removeEventListener('pointerup', up); 
    };
  }, [drawing, onChange]);

  return (
    <div>
      <div className="text-xs text-slate-600 dark:text-slate-300 mb-1">Supervisor signature</div>
      <canvas 
        ref={canvasRef} 
        width={600} 
        height={180} 
        className="w-full h-40 rounded-xl border bg-white dark:bg-slate-800" 
      />
      <div className="mt-2 flex gap-2">
        <button 
          type="button" 
          onClick={()=>{ 
            const c=canvasRef.current; if(!c) return; 
            const ctx=c.getContext('2d'); if(!ctx) return; 
            ctx.clearRect(0,0,c.width,c.height); 
            onChange?.(null); 
          }} 
          className="rounded-2xl border px-3 py-2 text-sm"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
