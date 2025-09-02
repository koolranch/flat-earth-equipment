'use client';
import { useState } from 'react';

interface LoadCapacityCalcProps {
  onComplete?: () => void;
  locale?: 'en' | 'es';
  moduleSlug?: string;
}

export default function LoadCapacityCalc({ onComplete, locale = 'en', moduleSlug }: LoadCapacityCalcProps) {
  const [loadWeight, setLoadWeight] = useState<number>(0);
  const [loadCenter, setLoadCenter] = useState<number>(24); // inches
  const [forkLength, setForkLength] = useState<number>(42); // inches
  const [result, setResult] = useState<string>('');

  const t = {
    en: {
      title: 'Load Capacity Calculator',
      loadWeight: 'Load Weight (lbs)',
      loadCenter: 'Load Center (inches)',
      forkLength: 'Fork Length (inches)', 
      calculate: 'Calculate',
      result: 'Result',
      safe: 'SAFE - Within capacity',
      unsafe: 'UNSAFE - Exceeds capacity',
      instructions: 'Enter load details to check if it\'s within forklift capacity limits.',
      complete: 'Complete Exercise'
    },
    es: {
      title: 'Calculadora de Capacidad de Carga',
      loadWeight: 'Peso de Carga (lbs)',
      loadCenter: 'Centro de Carga (pulgadas)',
      forkLength: 'Longitud de Horquilla (pulgadas)',
      calculate: 'Calcular',
      result: 'Resultado',
      safe: 'SEGURO - Dentro de la capacidad',
      unsafe: 'INSEGURO - Excede la capacidad',
      instructions: 'Ingrese los detalles de la carga para verificar si está dentro de los límites de capacidad.',
      complete: 'Completar Ejercicio'
    }
  }[locale];

  function calculate() {
    // Simplified capacity calculation (normally would use forklift specs)
    const baseCapacity = 5000; // lbs at 24" load center
    const adjustedCapacity = baseCapacity * (24 / Math.max(loadCenter, 24));
    const isSafe = loadWeight <= adjustedCapacity;
    
    setResult(isSafe ? t.safe : t.unsafe);
    
    // Track interaction
    (window as any).analytics?.track?.('load_capacity_calculated', {
      loadWeight,
      loadCenter,
      forkLength,
      isSafe,
      moduleSlug,
      locale
    });
  }

  return (
    <div className="rounded-2xl border p-4 bg-white dark:bg-slate-900 space-y-4">
      <h3 className="text-lg font-semibold">{t.title}</h3>
      <p className="text-sm text-slate-600">{t.instructions}</p>
      
      <div className="grid gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">{t.loadWeight}</label>
          <input
            type="number"
            value={loadWeight}
            onChange={(e) => setLoadWeight(Number(e.target.value))}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="0"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">{t.loadCenter}</label>
          <input
            type="number"
            value={loadCenter}
            onChange={(e) => setLoadCenter(Number(e.target.value))}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="24"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">{t.forkLength}</label>
          <input
            type="number"
            value={forkLength}
            onChange={(e) => setForkLength(Number(e.target.value))}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="42"
          />
        </div>
      </div>
      
      <button
        onClick={calculate}
        className="w-full rounded-xl bg-[#F76511] text-white py-2 font-medium"
      >
        {t.calculate}
      </button>
      
      {result && (
        <div className={`rounded-lg p-3 text-center font-medium ${
          result.includes('SAFE') || result.includes('SEGURO') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {t.result}: {result}
        </div>
      )}
      
      {result && onComplete && (
        <button
          onClick={onComplete}
          className="w-full rounded-xl border border-[#F76511] text-[#F76511] py-2 font-medium"
        >
          {t.complete}
        </button>
      )}
    </div>
  );
}
