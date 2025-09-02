'use client';
import { useState } from 'react';

interface ShutdownTrainerProps {
  onComplete?: () => void;
  locale?: 'en' | 'es';
  moduleSlug?: string;
}

const SHUTDOWN_STEPS = [
  'neutral', 'steer', 'brake', 'forks', 'keyoff', 'plug', 'chock'
];

export default function ShutdownTrainer({ onComplete, locale = 'en', moduleSlug }: ShutdownTrainerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<boolean[]>(Array(SHUTDOWN_STEPS.length).fill(false));

  const t = {
    en: {
      title: 'Shutdown Sequence Trainer',
      instructions: 'Complete the shutdown sequence in the correct order.',
      steps: {
        neutral: 'Shift lever to NEUTRAL',
        steer: 'Center steering wheel',
        brake: 'Set parking brake',
        forks: 'Lower forks to ground',
        keyoff: 'Turn key OFF',
        plug: 'Connect charger',
        chock: 'Place wheel chock'
      },
      complete: 'Complete Training',
      next: 'Next Step',
      finish: 'Finish Sequence',
      success: 'Shutdown sequence completed successfully!'
    },
    es: {
      title: 'Entrenador de Secuencia de Apagado',
      instructions: 'Complete la secuencia de apagado en el orden correcto.',
      steps: {
        neutral: 'Palanca a NEUTRAL',
        steer: 'Centrar volante',
        brake: 'Activar freno de estacionamiento',
        forks: 'Bajar horquillas al suelo',
        keyoff: 'Apagar llave',
        plug: 'Conectar cargador',
        chock: 'Colocar calzo de rueda'
      },
      complete: 'Completar Entrenamiento',
      next: 'Siguiente Paso',
      finish: 'Finalizar Secuencia',
      success: '¡Secuencia de apagado completada exitosamente!'
    }
  }[locale];

  function handleStepComplete() {
    const newCompleted = [...completed];
    newCompleted[currentStep] = true;
    setCompleted(newCompleted);

    // Track step completion
    (window as any).analytics?.track?.('shutdown_step_completed', {
      step: SHUTDOWN_STEPS[currentStep],
      stepNumber: currentStep + 1,
      moduleSlug,
      locale
    });

    if (currentStep < SHUTDOWN_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // All steps completed
      (window as any).analytics?.track?.('shutdown_sequence_completed', {
        moduleSlug,
        locale
      });
      if (onComplete) onComplete();
    }
  }

  const allCompleted = completed.every(Boolean);
  const stepKey = SHUTDOWN_STEPS[currentStep] as keyof typeof t.steps;

  return (
    <div className="rounded-2xl border p-4 bg-white dark:bg-slate-900 space-y-4">
      <h3 className="text-lg font-semibold">{t.title}</h3>
      <p className="text-sm text-slate-600">{t.instructions}</p>
      
      {/* Progress indicator */}
      <div className="flex gap-2">
        {SHUTDOWN_STEPS.map((step, index) => (
          <div
            key={step}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
              completed[index] 
                ? 'bg-green-500 text-white' 
                : index === currentStep 
                  ? 'bg-[#F76511] text-white' 
                  : 'bg-slate-200 text-slate-600'
            }`}
          >
            {index + 1}
          </div>
        ))}
      </div>

      {!allCompleted ? (
        <div className="space-y-3">
          <div className="rounded-lg border p-3 bg-slate-50 dark:bg-slate-800">
            <div className="font-medium">Step {currentStep + 1}: {t.steps[stepKey]}</div>
          </div>
          
          <button
            onClick={handleStepComplete}
            className="w-full rounded-xl bg-[#F76511] text-white py-2 font-medium"
          >
            {currentStep === SHUTDOWN_STEPS.length - 1 ? t.finish : t.next}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-lg p-3 bg-green-50 border border-green-200 text-center">
            <div className="font-medium text-green-800">{t.success}</div>
          </div>
          
          {onComplete && (
            <button
              onClick={onComplete}
              className="w-full rounded-xl border border-[#F76511] text-[#F76511] py-2 font-medium"
            >
              {t.complete}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
