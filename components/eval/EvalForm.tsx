'use client';
import { useEffect, useState, useRef } from 'react';
import SignaturePad from 'signature_pad';
import { useI18n } from '@/lib/i18n/I18nProvider';

const defaultCompetencies = {
  preop: false, controls: false, travel: false, loadHandling: false, pedestrians: false,
  ramps: false, stacking: false, refuel: false, shutdown: false, stability: false
};

// Human-readable labels for competencies
const competencyLabels: Record<string, string> = {
  preop: 'Pre-Operation Inspection',
  controls: 'Control Operations',
  travel: 'Travel & Maneuvering',
  loadHandling: 'Load Handling',
  pedestrians: 'Pedestrian Awareness',
  ramps: 'Ramps & Inclines',
  stability: 'Load Stability',
  refuel: 'Refueling/Recharging',
  shutdown: 'Proper Shutdown',
  stacking: 'Stacking & Unstacking'
};

type EvalRow = {
  id?: string; enrollment_id: string; evaluator_name?: string; evaluator_title?: string; site_location?: string;
  evaluation_date?: string | null; practical_pass?: boolean | null; notes?: string | null;
  evaluator_signature_url?: string | null; trainee_signature_url?: string | null;
  competencies?: Record<string, boolean> | null;
};

export default function EvalForm({ enrollmentId, initial }: { enrollmentId: string; initial: EvalRow | null }) {
  const { t } = useI18n();
  const [data, setData] = useState<EvalRow>({ enrollment_id: enrollmentId, ...initial });
  const [competencies, setCompetencies] = useState<Record<string, boolean>>({ ...defaultCompetencies, ...(initial?.competencies || {}) });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const evalPadRef = useRef<SignaturePad | null>(null);
  const traineePadRef = useRef<SignaturePad | null>(null);

  useEffect(() => { 
    (window as any)?.analytics?.track?.('eval_open', { enrollmentId }); 
    
    // Initialize signature pads
    const evalCanvas = document.getElementById('sig-evaluator') as HTMLCanvasElement;
    const traineeCanvas = document.getElementById('sig-trainee') as HTMLCanvasElement;
    
    if (evalCanvas) {
      evalPadRef.current = new SignaturePad(evalCanvas, { backgroundColor: 'rgb(255, 255, 255)' });
    }
    if (traineeCanvas) {
      traineePadRef.current = new SignaturePad(traineeCanvas, { backgroundColor: 'rgb(255, 255, 255)' });
    }
    
    return () => {
      evalPadRef.current?.off();
      traineePadRef.current?.off();
    };
  }, [enrollmentId]);

  function setField<K extends keyof EvalRow>(k: K, v: EvalRow[K]) { setData(d => ({ ...d, [k]: v })); }

  async function save() {
    setSaving(true);
    setSaveSuccess(false);
    const res = await fetch('/api/eval/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, competencies }) });
    const j = await res.json();
    setSaving(false);
    if (!j.ok) return alert(j.error || 'Save failed');
    setData(d => ({ ...d, id: j.row.id }));
    setSaveSuccess(true);
    (window as any)?.analytics?.track?.('eval_saved', { enrollmentId });
  }

  async function sign(role: 'evaluator' | 'trainee') {
    const pad = role === 'evaluator' ? evalPadRef.current : traineePadRef.current;
    if (!pad) return;
    if (pad.isEmpty()) { alert('Please draw your signature first, then click Save Signature'); return; }
    const dataUrl = pad.toDataURL('image/png');
    const res = await fetch('/api/eval/signature', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enrollment_id: enrollmentId, role, dataUrl }) });
    const j = await res.json();
    if (!j.ok) return alert(j.error || 'Signature upload failed');
    setData(d => ({ ...d, [`${role}_signature_url` as const]: j.url }));
    (window as any)?.analytics?.track?.('eval_signed', { enrollmentId, role });
  }

  function clearSig(role: 'evaluator' | 'trainee') {
    const pad = role === 'evaluator' ? evalPadRef.current : traineePadRef.current;
    pad?.clear();
  }

  function Check({ k }: { k: keyof typeof defaultCompetencies }) {
    const labels = t('eval.competencies_labels') as any;
    const label = labels?.[k] || competencyLabels[k] || k;
    return (
      <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-200">
        <input 
          type="checkbox" 
          checked={!!competencies[k]} 
          onChange={e => setCompetencies(c => ({ ...c, [k]: e.target.checked }))} 
          className="w-5 h-5 rounded border-2 border-gray-300 text-[#F76511] focus:ring-[#F76511] focus:ring-2"
        />
        <span className="text-gray-800 font-medium">{label}</span>
      </label>
    );
  }

  const completedCount = Object.values(competencies).filter(Boolean).length;
  const totalCount = Object.keys(competencies).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F76511] rounded-full mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">OSHA Practical Evaluation</h2>
        <p className="text-gray-600">Complete this form to certify operator competency per 29 CFR 1910.178</p>
      </div>

      {/* Section 1: Evaluator Information */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-full bg-[#F76511] text-white flex items-center justify-center text-sm font-bold">1</span>
          <h3 className="text-lg font-bold text-gray-900">Evaluator Information</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Evaluator Name *</label>
            <input 
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F76511] focus:border-[#F76511] text-gray-900" 
              placeholder="Enter evaluator name" 
              value={data.evaluator_name || ''} 
              onChange={e => setField('evaluator_name', e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Evaluator Title</label>
            <input 
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F76511] focus:border-[#F76511] text-gray-900" 
              placeholder="e.g., Safety Manager" 
              value={data.evaluator_title || ''} 
              onChange={e => setField('evaluator_title', e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site / Location</label>
            <input 
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F76511] focus:border-[#F76511] text-gray-900" 
              placeholder="e.g., Warehouse A" 
              value={data.site_location || ''} 
              onChange={e => setField('site_location', e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Evaluation Date</label>
            <input 
              type="date" 
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F76511] focus:border-[#F76511] text-gray-900" 
              value={(data.evaluation_date || '').slice(0, 10)} 
              onChange={e => setField('evaluation_date', e.target.value)} 
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea 
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F76511] focus:border-[#F76511] text-gray-900" 
            rows={3} 
            placeholder="Any additional notes or observations..." 
            value={data.notes || ''} 
            onChange={e => setField('notes', e.target.value)} 
          />
        </div>
      </div>

      {/* Section 2: Competency Checklist */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#F76511] text-white flex items-center justify-center text-sm font-bold">2</span>
            <h3 className="text-lg font-bold text-gray-900">Competency Checklist</h3>
          </div>
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${
            completedCount === totalCount 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {completedCount}/{totalCount} Checked
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-4">Check each competency the operator demonstrates satisfactorily:</p>
        <div className="grid md:grid-cols-2 gap-2 bg-gray-50 rounded-xl p-4">
          <Check k="preop" />
          <Check k="controls" />
          <Check k="travel" />
          <Check k="loadHandling" />
          <Check k="pedestrians" />
          <Check k="ramps" />
          <Check k="stability" />
          <Check k="refuel" />
          <Check k="shutdown" />
          <Check k="stacking" />
        </div>
      </div>

      {/* Section 3: Pass/Fail Decision */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-full bg-[#F76511] text-white flex items-center justify-center text-sm font-bold">3</span>
          <h3 className="text-lg font-bold text-gray-900">Evaluation Result</h3>
        </div>
        <div className="flex flex-wrap gap-4">
          <label className={`flex items-center gap-3 px-6 py-4 rounded-xl cursor-pointer border-2 transition-all ${
            data.practical_pass === true 
              ? 'border-green-500 bg-green-50 ring-2 ring-green-200' 
              : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input 
              type="radio" 
              name="pass" 
              checked={data.practical_pass === true} 
              onChange={() => setField('practical_pass', true)} 
              className="w-5 h-5 text-green-600 focus:ring-green-500"
            />
            <div>
              <span className="font-semibold text-gray-900 block">✓ Pass</span>
              <span className="text-sm text-gray-500">Operator is certified</span>
            </div>
          </label>
          <label className={`flex items-center gap-3 px-6 py-4 rounded-xl cursor-pointer border-2 transition-all ${
            data.practical_pass === false 
              ? 'border-red-500 bg-red-50 ring-2 ring-red-200' 
              : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input 
              type="radio" 
              name="pass" 
              checked={data.practical_pass === false} 
              onChange={() => setField('practical_pass', false)} 
              className="w-5 h-5 text-red-600 focus:ring-red-500"
            />
            <div>
              <span className="font-semibold text-gray-900 block">✗ Needs Refresher</span>
              <span className="text-sm text-gray-500">Additional training required</span>
            </div>
          </label>
          <label className={`flex items-center gap-3 px-6 py-4 rounded-xl cursor-pointer border-2 transition-all ${
            data.practical_pass == null 
              ? 'border-gray-500 bg-gray-50 ring-2 ring-gray-200' 
              : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input 
              type="radio" 
              name="pass" 
              checked={data.practical_pass == null} 
              onChange={() => setField('practical_pass', null)} 
              className="w-5 h-5 text-gray-600 focus:ring-gray-500"
            />
            <div>
              <span className="font-semibold text-gray-900 block">⏸ Undecided</span>
              <span className="text-sm text-gray-500">Not yet evaluated</span>
            </div>
          </label>
        </div>
      </div>

      {/* Section 4: Signatures */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">Evaluator Signature</h4>
            {data.evaluator_signature_url && (
              <span className="text-green-600 text-sm">✓ Saved</span>
            )}
          </div>
          <canvas 
            id="sig-evaluator" 
            width={400} 
            height={150} 
            className="border-2 border-gray-200 rounded-xl bg-white w-full h-36 cursor-crosshair"
          />
          <div className="flex gap-2 mt-3">
            <button 
              className="flex-1 rounded-xl bg-[#F76511] text-white px-4 py-2 font-medium hover:bg-[#E55A0C] transition-colors" 
              onClick={() => sign('evaluator')}
            >
              Save Signature
            </button>
            <button 
              className="rounded-xl border-2 border-gray-200 px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors" 
              onClick={() => clearSig('evaluator')}
            >
              Clear
            </button>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">Trainee Signature</h4>
            {data.trainee_signature_url && (
              <span className="text-green-600 text-sm">✓ Saved</span>
            )}
          </div>
          <canvas 
            id="sig-trainee" 
            width={400} 
            height={150} 
            className="border-2 border-gray-200 rounded-xl bg-white w-full h-36 cursor-crosshair"
          />
          <div className="flex gap-2 mt-3">
            <button 
              className="flex-1 rounded-xl bg-[#F76511] text-white px-4 py-2 font-medium hover:bg-[#E55A0C] transition-colors" 
              onClick={() => sign('trainee')}
            >
              Save Signature
            </button>
            <button 
              className="rounded-xl border-2 border-gray-200 px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors" 
              onClick={() => clearSig('trainee')}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-green-600 text-xl">✓</span>
          <span className="text-green-800 font-medium">Evaluation saved successfully!</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button 
          disabled={saving || !data.evaluator_name} 
          className={`rounded-xl px-6 py-3 font-semibold text-white transition-colors ${
            saving || !data.evaluator_name 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-[#F76511] hover:bg-[#E55A0C] shadow-lg'
          }`}
          onClick={save}
        >
          {saving ? 'Saving...' : 'Save Evaluation'}
        </button>
        <button 
          className="rounded-xl border-2 border-gray-200 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          onClick={() => window.print()}
        >
          Print
        </button>
      </div>
    </div>
  );
}
