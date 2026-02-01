'use client';
import { useEffect, useRef, useState } from 'react';
import SignaturePad from 'signature_pad';

interface SignatureInputProps {
  label: string;
  onSave: (dataUrl: string) => Promise<void>;
  savedUrl?: string | null;
  defaultName?: string;
}

export default function SignatureInput({ label, onSave, savedUrl, defaultName = '' }: SignatureInputProps) {
  const [mode, setMode] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState(defaultName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(!!savedUrl);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad | null>(null);
  const typeCanvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize signature pad when in draw mode
  useEffect(() => {
    if (mode === 'draw' && canvasRef.current && !padRef.current) {
      padRef.current = new SignaturePad(canvasRef.current, { 
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(30, 30, 30)'
      });
    }
    
    return () => {
      if (padRef.current) {
        padRef.current.off();
        padRef.current = null;
      }
    };
  }, [mode]);

  // Re-initialize pad when switching to draw mode
  useEffect(() => {
    if (mode === 'draw' && canvasRef.current) {
      if (padRef.current) {
        padRef.current.off();
      }
      padRef.current = new SignaturePad(canvasRef.current, { 
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(30, 30, 30)'
      });
    }
  }, [mode]);

  const clearDraw = () => {
    padRef.current?.clear();
    setSaved(false);
  };

  const clearType = () => {
    setTypedName('');
    setSaved(false);
  };

  // Generate signature image from typed name
  const generateTypedSignature = (): string | null => {
    const canvas = typeCanvasRef.current;
    if (!canvas || !typedName.trim()) return null;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw signature text
    ctx.fillStyle = '#1e1e1e';
    ctx.font = 'italic 48px "Brush Script MT", "Segoe Script", "Bradley Hand", cursive';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);
    
    return canvas.toDataURL('image/png');
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      let dataUrl: string | null = null;
      
      if (mode === 'draw') {
        if (!padRef.current || padRef.current.isEmpty()) {
          alert('Please draw your signature first');
          setSaving(false);
          return;
        }
        dataUrl = padRef.current.toDataURL('image/png');
      } else {
        if (!typedName.trim()) {
          alert('Please type your name');
          setSaving(false);
          return;
        }
        dataUrl = generateTypedSignature();
      }
      
      if (dataUrl) {
        await onSave(dataUrl);
        setSaved(true);
      }
    } catch (error) {
      console.error('Failed to save signature:', error);
      alert('Failed to save signature. Please try again.');
    }
    
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">{label}</h4>
        {saved && (
          <span className="text-green-600 text-sm flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Saved
          </span>
        )}
      </div>
      
      {/* Mode Tabs */}
      <div className="flex gap-1 mb-3 p-1 bg-gray-100 rounded-lg">
        <button
          onClick={() => setMode('draw')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            mode === 'draw' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          ✏️ Draw
        </button>
        <button
          onClick={() => setMode('type')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            mode === 'type' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          ⌨️ Type
        </button>
      </div>

      {/* Draw Mode */}
      {mode === 'draw' && (
        <>
          <div className="relative">
            <canvas 
              ref={canvasRef}
              width={400} 
              height={150} 
              className="border-2 border-gray-200 rounded-xl bg-white w-full h-36 cursor-crosshair touch-none"
            />
            <div className="absolute bottom-2 left-2 text-xs text-gray-400">
              Draw your signature above
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button 
              className={`flex-1 rounded-xl px-4 py-2 font-medium transition-colors ${
                saving 
                  ? 'bg-gray-400 text-white cursor-wait' 
                  : 'bg-[#F76511] text-white hover:bg-[#E55A0C]'
              }`}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Signature'}
            </button>
            <button 
              className="rounded-xl border-2 border-gray-200 px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors" 
              onClick={clearDraw}
            >
              Clear
            </button>
          </div>
        </>
      )}

      {/* Type Mode */}
      {mode === 'type' && (
        <>
          <div className="relative">
            {/* Hidden canvas for generating signature image */}
            <canvas 
              ref={typeCanvasRef}
              width={400} 
              height={150} 
              className="hidden"
            />
            
            {/* Preview area */}
            <div className="border-2 border-gray-200 rounded-xl bg-white w-full h-36 flex items-center justify-center">
              {typedName ? (
                <span 
                  className="text-4xl text-gray-800 select-none"
                  style={{ 
                    fontFamily: '"Brush Script MT", "Segoe Script", "Bradley Hand", cursive',
                    fontStyle: 'italic'
                  }}
                >
                  {typedName}
                </span>
              ) : (
                <span className="text-gray-400 text-sm">Your signature will appear here</span>
              )}
            </div>
            
            {/* Name input */}
            <input
              type="text"
              value={typedName}
              onChange={(e) => {
                setTypedName(e.target.value);
                setSaved(false);
              }}
              placeholder="Type your full name"
              className="mt-3 w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F76511] focus:border-[#F76511] text-gray-900"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button 
              className={`flex-1 rounded-xl px-4 py-2 font-medium transition-colors ${
                saving || !typedName.trim()
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-[#F76511] text-white hover:bg-[#E55A0C]'
              }`}
              onClick={handleSave}
              disabled={saving || !typedName.trim()}
            >
              {saving ? 'Saving...' : 'Save Signature'}
            </button>
            <button 
              className="rounded-xl border-2 border-gray-200 px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors" 
              onClick={clearType}
            >
              Clear
            </button>
          </div>
        </>
      )}

      {/* Saved signature preview */}
      {savedUrl && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-green-700 mb-1">Previously saved signature:</p>
          <img 
            src={savedUrl} 
            alt="Saved signature" 
            className="max-h-12 border border-green-200 rounded bg-white"
          />
        </div>
      )}
    </div>
  );
}
