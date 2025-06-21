'use client'
import { useState, useRef, useEffect } from 'react'
import SignatureCanvas from 'react-signature-canvas'

interface EvalSignatureProps {
  onSignatureChange: (signatureData: { type: 'typed' | 'drawn', data: string }) => void
  value?: { type: 'typed' | 'drawn', data: string } | null
}

export default function EvalSignature({ onSignatureChange, value }: EvalSignatureProps) {
  const [activeTab, setActiveTab] = useState<'type' | 'draw'>('type')
  const [typedName, setTypedName] = useState(value?.type === 'typed' ? value.data : '')
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 150 })
  const sigCanvasRef = useRef<SignatureCanvas>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Update canvas size based on container width
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth
        const width = Math.min(containerWidth - 32, 400) // 32px for padding
        const height = Math.max(width * 0.375, 120) // Maintain aspect ratio, min 120px height
        setCanvasSize({ width, height })
      }
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)
    return () => window.removeEventListener('resize', updateCanvasSize)
  }, [])

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
    <div className="space-y-4" ref={containerRef}>
      {/* Tab Navigation - Mobile Optimized */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('type')}
          className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors touch-manipulation ${
            activeTab === 'type'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          ✍️ Type Signature
        </button>
        <button
          onClick={() => setActiveTab('draw')}
          className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors touch-manipulation ${
            activeTab === 'draw'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          ✏️ Draw Signature
        </button>
      </div>

      {activeTab === 'type' && (
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-2 block">
              Type your full name
            </span>
            <input
              type="text"
              value={typedName}
              onChange={(e) => handleTypedSignature(e.target.value)}
              placeholder="John Smith"
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 touch-manipulation"
            />
          </label>
          
          {typedName.trim() && (
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600 mb-3">Preview:</p>
              <div 
                className="h-16 flex items-center justify-center border-b border-gray-200"
                style={{ fontFamily: 'cursive', fontSize: '20px', color: '#1f2937', fontStyle: 'italic' }}
              >
                {typedName}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'draw' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              📱 <strong>Mobile Tip:</strong> Use your finger to draw your signature below
            </p>
          </div>
          
          <div className="border-2 border-gray-300 rounded-md bg-white overflow-hidden">
            <SignatureCanvas
              ref={sigCanvasRef}
              canvasProps={{
                width: canvasSize.width,
                height: canvasSize.height,
                className: 'signature-canvas w-full touch-manipulation'
              }}
              backgroundColor="white"
              penColor="#1f2937"
              onEnd={handleDrawnSignature}
            />
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={clearSignature}
              className="px-6 py-3 text-sm text-orange-600 hover:text-orange-700 font-medium border border-orange-200 rounded-md hover:bg-orange-50 touch-manipulation"
            >
              🗑️ Clear Signature
            </button>
          </div>
        </div>
      )}

      {/* Signature Status */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Signature Status:</span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            value?.data 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {value?.data ? '✅ Complete' : '⏳ Required'}
          </span>
        </div>
      </div>
    </div>
  )
} 