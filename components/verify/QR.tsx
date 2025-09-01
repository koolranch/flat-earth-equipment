'use client';

import QRCode from 'qrcode';
import { useEffect, useRef, useState } from 'react';

interface QRProps {
  value: string;
  size?: number;
}

export default function QR({ value, size = 160 }: QRProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;

    setIsLoading(true);
    setError(null);

    QRCode.toCanvas(
      canvasRef.current,
      value,
      {
        width: size,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      },
      (err) => {
        setIsLoading(false);
        if (err) {
          console.error('QR Code generation error:', err);
          setError('Failed to generate QR code');
        }
      }
    );
  }, [value, size]);

  if (error) {
    return (
      <div 
        className="flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded border-2 border-dashed border-slate-300 dark:border-slate-600"
        style={{ width: size, height: size }}
      >
        <div className="text-center p-4">
          <div className="text-slate-500 dark:text-slate-400 text-sm">
            QR code unavailable
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded animate-pulse"
          style={{ width: size, height: size }}
        >
          <div className="text-slate-500 dark:text-slate-400 text-sm">
            Generating QR...
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={`rounded bg-white border border-slate-200 shadow-sm ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        aria-label={`QR code for certificate verification: ${value}`}
        role="img"
        style={{ width: size, height: size }}
      />
    </div>
  );
}
