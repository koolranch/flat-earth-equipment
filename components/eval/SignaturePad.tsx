'use client';
import { useEffect, useRef, useState } from 'react';

export default function SignaturePad({ onChange }: { onChange?: (dataUrl: string|null)=>void }){
  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  const [drawing, setDrawing] = useState(false);

  useEffect(()=>{
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.strokeStyle = '#1e293b'; // Darker blue-gray for better contrast
    
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
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-canyon-rust text-white flex items-center justify-center text-sm font-bold">3</div>
        <h3 className="text-xl font-bold text-slate-900">Supervisor Signature</h3>
      </div>
      <p className="text-slate-600 mb-4">
        Sign below to certify this evaluation per OSHA 29 CFR 1910.178(m). Your signature confirms the operator demonstrated competency.
      </p>
      <div className="bg-white border-2 border-slate-300 rounded-xl p-4">
        <div className="text-sm font-semibold text-slate-700 mb-3">Digital Signature</div>
        <canvas 
          ref={canvasRef} 
          width={600} 
          height={180} 
          className="w-full h-40 rounded-lg border-2 border-dashed border-slate-300 bg-white cursor-crosshair hover:border-canyon-rust transition-colors" 
          style={{ touchAction: 'none' }}
        />
        <div className="mt-3 flex justify-between items-center">
          <p className="text-xs text-slate-500">Sign above using your mouse, finger, or stylus</p>
          <button 
            type="button" 
            onClick={()=>{ 
              const c=canvasRef.current; if(!c) return; 
              const ctx=c.getContext('2d'); if(!ctx) return; 
              ctx.clearRect(0,0,c.width,c.height); 
              onChange?.(null); 
            }} 
            className="rounded-lg border-2 border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Clear Signature
          </button>
        </div>
      </div>
    </div>
  );
}
