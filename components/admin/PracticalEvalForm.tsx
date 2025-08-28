// components/admin/PracticalEvalForm.tsx
'use client';
import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function PracticalEvalForm({ enrollmentId }: { enrollmentId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pass, setPass] = useState<boolean>(true);
  const [notes, setNotes] = useState('');
  const [pending, start] = useTransition();
  const router = useRouter();

  const clear = () => { const c = canvasRef.current!; const ctx = c.getContext('2d')!; ctx.clearRect(0,0,c.width,c.height); };
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.buttons !== 1) return; const c = canvasRef.current!; const ctx = c.getContext('2d')!; const r = c.getBoundingClientRect();
    ctx.fillRect(e.clientX - r.left, e.clientY - r.top, 2, 2);
  };

  async function submit() {
    const sig = canvasRef.current!.toDataURL('image/png');
    const body = {
      enrollmentId, evaluatorName: 'Trainer', evaluatorTitle: 'Trainer', siteLocation: '',
      evaluationDate: new Date().toISOString(), practicalPass: pass, evaluatorSignature: sig, notes
    };
    const res = await fetch('/api/employer-evaluations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    console.debug('[analytics]', 'eval.save', { enrollmentId, pass });
    if (!res.ok) alert('Save failed');
    start(() => router.push('/admin/roster'));
  }

  return (<div className='space-y-3'>
    <div>Result: 
      <label className='ml-2'><input type='radio' name='res' checked={pass} onChange={()=>setPass(true)} /> Pass</label>
      <label className='ml-4'><input type='radio' name='res' checked={!pass} onChange={()=>setPass(false)} /> Fail</label>
    </div>
    <div><textarea className='border rounded-2xl p-2 w-full' placeholder='Notes' value={notes} onChange={e=>setNotes(e.target.value)} /></div>
    <div>Signature</div>
    <canvas ref={canvasRef} width={400} height={120} onMouseMove={draw} className='border rounded-2xl bg-white' />
    <div className='flex gap-2'><button className='rounded-2xl border px-3 py-2' onClick={clear}>Clear</button><button className='rounded-2xl bg-[#F76511] text-white px-3 py-2' disabled={pending} onClick={submit}>Save evaluation</button></div>
  </div>);
}
