'use client';
import React from 'react';

export default function SignaturePad({ onChange }: { onChange?: (dataUrl: string) => void }) {
  const ref = React.useRef<HTMLCanvasElement | null>(null);
  const drawing = React.useRef(false);

  React.useEffect(() => {
    const c = ref.current!; const ctx = c.getContext('2d')!; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#0F172A';
    function pos(e: PointerEvent){ const r = c.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    function down(e: PointerEvent){ drawing.current = true; const p = pos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); (e.target as Element).setPointerCapture(e.pointerId); }
    function move(e: PointerEvent){ if(!drawing.current) return; const p = pos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); }
    function up(e: PointerEvent){ drawing.current = false; ctx.closePath(); onChange?.(c.toDataURL('image/png')); }
    c.addEventListener('pointerdown', down); c.addEventListener('pointermove', move); c.addEventListener('pointerup', up); c.addEventListener('pointerleave', up);
    return () => { c.removeEventListener('pointerdown', down); c.removeEventListener('pointermove', move); c.removeEventListener('pointerup', up); c.removeEventListener('pointerleave', up); };
  }, [onChange]);

  return (
    <div className="grid gap-2">
      <canvas ref={ref} width={520} height={180} className="rounded border border-slate-300 bg-white"/>
      <button type="button" onClick={() => { const c = ref.current!; const ctx = c.getContext('2d')!; ctx.clearRect(0,0,c.width,c.height); onChange?.(c.toDataURL('image/png')); }} className="self-start rounded border px-3 py-1">Clear</button>
    </div>
  );
}
