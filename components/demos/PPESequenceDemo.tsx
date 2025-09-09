'use client';
import * as React from 'react';

// If this already exists, Cursor will diff-merge. This is a minimal placeholder that calls onComplete; your real one will override.
export default function PPESequenceDemo({ onComplete }: { onComplete?: () => void }){
  const [step, setStep] = React.useState(0);
  const steps = ['Put on safety vest', 'Put on hard hat', 'Fasten seatbelt'];
  
  const handleStepComplete = (stepIndex: number) => {
    if (stepIndex === step) {
      const nextStep = step + 1;
      setStep(nextStep);
      if (nextStep >= steps.length) {
        onComplete?.();
      }
    }
  };

  return (
    <div className='flex flex-col items-center gap-4 p-6 text-slate-700'>
      <div className='text-center mb-4'>
        <h3 className='font-medium text-lg mb-2'>PPE Sequence</h3>
        <p className='text-sm text-slate-600'>Complete each step in order:</p>
      </div>
      
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl'>
        {steps.map((stepText, index) => (
          <button
            key={index}
            onClick={() => handleStepComplete(index)}
            disabled={index !== step && index < step}
            className={`
              p-4 rounded-lg border-2 transition-all text-left
              ${index < step 
                ? 'border-green-500 bg-green-50 text-green-700' 
                : index === step 
                ? 'border-orange-500 bg-orange-50 hover:bg-orange-100 cursor-pointer' 
                : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
              }
            `}
          >
            <div className='flex items-center gap-2'>
              <span className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                ${index < step 
                  ? 'bg-green-500 text-white' 
                  : index === step 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-slate-300 text-slate-500'
                }
              `}>
                {index < step ? '✓' : index + 1}
              </span>
              <span className='font-medium'>{stepText}</span>
            </div>
          </button>
        ))}
      </div>
      
      {step >= steps.length && (
        <div className='mt-4 p-4 rounded-lg bg-green-50 border border-green-200 text-center'>
          <p className='text-green-800 font-medium'>✅ PPE sequence complete!</p>
          <p className='text-green-600 text-sm mt-1'>You can now take the quiz.</p>
        </div>
      )}
    </div>
  );
}
