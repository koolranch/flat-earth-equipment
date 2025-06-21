'use client'
import { useState, useRef } from 'react'
import SignatureCanvas from 'react-signature-canvas'

interface EvalSignatureProps {
  onSignatureChange: (signatureData: { type: 'typed' | 'drawn', data: string }) => void
  value?: { type: 'typed' | 'drawn', data: string } | null
}

export default function EvalSignature({ onSignatureChange, value }: EvalSignatureProps) {
  const [activeTab, setActiveTab] = useState<'type' | 'draw'>('type')
  const [typedName, setTypedName] = useState(value?.type === 'typed' ? value.data : '')
  const sigCanvasRef = useRef<SignatureCanvas>(null)

  const handleTypedSignature = (name: string) => {
    setTypedName(name)
    if (name.trim()) {
      // Convert typed name to SVG
      const svg = `
        <svg width="300" height="60" xmlns="http://www.w3.org/2000/svg">
          <text x="10" y="40" font-family="cursive" font-size="24" fill="#1f2937" font-style="italic">
            ${name.trim()}
          </text>
        </svg>
      `
      onSignatureChange({ type: 'typed', data: svg })
    } else {
      onSignatureChange({ type: 'typed', data: '' })
    }
  }

  const handleDrawnSignature = () => {
    if (sigCanvasRef.current) {
      const canvas = sigCanvasRef.current.getCanvas()
      if (!sigCanvasRef.current.isEmpty()) {
        const dataURL = canvas.toDataURL('image/png')
        onSignatureChange({ type: 'drawn', data: dataURL })
      } else {
        onSignatureChange({ type: 'drawn', data: '' })
      }
    }
  }

  const clearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear()
      onSignatureChange({ type: 'drawn', data: '' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('type')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'type'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Type Signature
        </button>
        <button
          onClick={() => setActiveTab('draw')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'draw'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Draw Signature
        </button>
      </div>

      {activeTab === 'type' && (
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Type your full name
            </span>
            <input
              type="text"
              value={typedName}
              onChange={(e) => handleTypedSignature(e.target.value)}
              placeholder="John Smith"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
            />
          </label>
          
          {typedName.trim() && (
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600 mb-2">Preview:</p>
              <div 
                className="h-16 flex items-center"
                style={{ fontFamily: 'cursive', fontSize: '24px', color: '#1f2937', fontStyle: 'italic' }}
              >
                {typedName}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'draw' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Draw your signature below using your mouse or finger
          </p>
          
          <div className="border border-gray-300 rounded-md bg-white">
            <SignatureCanvas
              ref={sigCanvasRef}
              canvasProps={{
                width: 400,
                height: 150,
                className: 'signature-canvas'
              }}
              backgroundColor="white"
              penColor="#1f2937"
              onEnd={handleDrawnSignature}
            />
          </div>
          
          <button
            onClick={clearSignature}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            Clear Signature
          </button>
        </div>
      )}
    </div>
  )
} 