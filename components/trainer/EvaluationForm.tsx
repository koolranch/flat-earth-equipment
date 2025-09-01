'use client';
import { useEffect, useRef, useState } from 'react';
import SignaturePad from 'signature_pad';

export default function EvaluationForm({ enrollmentId }: { enrollmentId: string }) {
  const [form, setForm] = useState({ 
    evaluator_name: '', 
    evaluator_title: '', 
    site_location: '', 
    evaluation_date: '', 
    truck_type: '', 
    notes: '', 
    practical_pass: true 
  });
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sigRef = useRef<SignaturePad | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const pad = new SignaturePad(canvasRef.current, { 
        penColor: '#0F172A', 
        minWidth: 1, 
        maxWidth: 2 
      });
      sigRef.current = pad;
      
      const resize = () => {
        const c = canvasRef.current!; 
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        c.width = c.offsetWidth * ratio; 
        c.height = 160 * ratio; 
        c.getContext('2d')!.scale(ratio, ratio);
        pad.clear();
      };
      
      resize();
      window.addEventListener('resize', resize);
      return () => window.removeEventListener('resize', resize);
    }
  }, []);

  async function submit() {
    if (!form.evaluator_name || !form.evaluator_title || !form.site_location) { 
      alert('Please fill evaluator name/title and site.'); 
      return; 
    }
    
    setLoading(true);
    const signature_data_url = sigRef.current && !sigRef.current.isEmpty() ? 
      sigRef.current.toDataURL('image/png') : null;
    
    const res = await fetch('/api/evaluations/upsert', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ 
        enrollment_id: enrollmentId, 
        ...form, 
        signature_data_url 
      }) 
    });
    
    const j = await res.json();
    setLoading(false);
    
    if (!j.ok) { 
      alert('Save failed: ' + (j.error || 'unknown')); 
      return; 
    }
    
    alert('Evaluation saved' + (form.practical_pass ? ' and certificate refreshed.' : '.'));
  }

  return (
    <section className="rounded-2xl border p-4 bg-white dark:bg-slate-900 space-y-3">
      <h1 className="text-xl font-bold">Practical Evaluation</h1>
      
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-sm">
          Evaluator name
          <input 
            className="block w-full rounded-xl border px-3 py-2 mt-1" 
            value={form.evaluator_name} 
            onChange={e => setForm({ ...form, evaluator_name: e.target.value })} 
          />
        </label>
        
        <label className="text-sm">
          Evaluator title
          <input 
            className="block w-full rounded-xl border px-3 py-2 mt-1" 
            value={form.evaluator_title} 
            onChange={e => setForm({ ...form, evaluator_title: e.target.value })} 
          />
        </label>
        
        <label className="text-sm">
          Site/location
          <input 
            className="block w-full rounded-xl border px-3 py-2 mt-1" 
            value={form.site_location} 
            onChange={e => setForm({ ...form, site_location: e.target.value })} 
          />
        </label>
        
        <label className="text-sm">
          Date
          <input 
            type="date" 
            className="block w-full rounded-xl border px-3 py-2 mt-1" 
            value={form.evaluation_date} 
            onChange={e => setForm({ ...form, evaluation_date: e.target.value })} 
          />
        </label>
        
        <label className="text-sm sm:col-span-2">
          Truck/type (optional)
          <input 
            className="block w-full rounded-xl border px-3 py-2 mt-1" 
            value={form.truck_type} 
            onChange={e => setForm({ ...form, truck_type: e.target.value })} 
          />
        </label>
      </div>

      <label className="text-sm block">
        Signature
        <div className="rounded-xl border p-2">
          <canvas 
            ref={canvasRef} 
            style={{ width: '100%', height: 160 }} 
            className="border rounded"
          />
          <div className="flex gap-2 mt-2">
            <button 
              type="button" 
              onClick={() => sigRef.current?.clear()} 
              className="rounded-xl border px-3 py-1 text-sm hover:bg-slate-50"
            >
              Clear
            </button>
          </div>
        </div>
      </label>

      <label className="inline-flex items-center gap-2 text-sm">
        <input 
          type="checkbox" 
          checked={form.practical_pass} 
          onChange={e => setForm({ ...form, practical_pass: e.target.checked })} 
        /> 
        Practical evaluation passed
      </label>

      <label className="text-sm block">
        Notes
        <textarea 
          className="block w-full rounded-xl border px-3 py-2 mt-1" 
          rows={3} 
          value={form.notes} 
          onChange={e => setForm({ ...form, notes: e.target.value })} 
        />
      </label>

      <div className="flex gap-2">
        <button 
          onClick={submit} 
          disabled={loading} 
          className="rounded-2xl bg-[#F76511] text-white px-4 py-2 shadow-lg hover:bg-[#E55A0C] disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Save evaluation'}
        </button>
        <a 
          className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50" 
          href="/trainer"
        >
          Back to Trainer
        </a>
      </div>
    </section>
  );
}
