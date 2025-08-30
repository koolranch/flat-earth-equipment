'use client';
import { useState } from 'react';
import StandardDemoPanel from './StandardDemoPanel';
import { useDemoEvents } from '@/lib/analytics/demo-events';

/**
 * Example demo component showing how to use DemoPanel pattern
 * This demonstrates the standard structure for interactive demos
 */
export default function ExampleDemo() {
  const [weight, setWeight] = useState(2000);
  const [height, setHeight] = useState(5);
  const [stepsCompleted, setStepsCompleted] = useState<string[]>([]);
  
  const { emitSimParamChange, emitDemoInteraction, emitDemoComplete } = useDemoEvents();

  const requiredSteps = ['adjust-weight', 'adjust-height', 'check-safety'];

  const handleWeightChange = (newWeight: number) => {
    setWeight(newWeight);
    emitSimParamChange('load_weight', newWeight, {
      safety_status: newWeight <= 3000 ? 'safe' : 'unsafe',
      capacity_utilization: Math.round((newWeight / 5000) * 100)
    });
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    emitSimParamChange('fork_height', newHeight, {
      stability_risk: newHeight > 8 ? 'high' : 'normal'
    });
  };

  const completeStep = (stepId: string, stepName: string) => {
    if (!stepsCompleted.includes(stepId)) {
      const newSteps = [...stepsCompleted, stepId];
      setStepsCompleted(newSteps);
      
      emitDemoInteraction('step_complete', stepId, {
        step_name: stepName,
        total_steps: requiredSteps.length,
        completed_steps: newSteps.length
      });

      // Auto-complete demo when all steps are done
      if (newSteps.length === requiredSteps.length) {
        emitDemoComplete({
          steps_completed: newSteps.length,
          final_weight: weight,
          final_height: height
        });
      }
    }
  };

  const isStepCompleted = (stepId: string) => stepsCompleted.includes(stepId);
  const allStepsCompleted = requiredSteps.every(step => isStepCompleted(step));

  return (
    <StandardDemoPanel
      moduleSlug="example-demo"
      title="Load Capacity Demo"
      objective="Learn how weight and height affect forklift stability and safety"
      estMin={3}
    >
      <div className="space-y-6">
        
        {/* Simulation Controls */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="weight-slider" className="block text-sm font-medium">
              Load Weight: {weight} lbs
            </label>
            <input
              id="weight-slider"
              type="range"
              min="500"
              max="5000"
              step="100"
              value={weight}
              onChange={(e) => handleWeightChange(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-slate-500">
              Safety limit: 3000 lbs
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="height-slider" className="block text-sm font-medium">
              Fork Height: {height} ft
            </label>
            <input
              id="height-slider"
              type="range"
              min="0"
              max="12"
              step="0.5"
              value={height}
              onChange={(e) => handleHeightChange(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-slate-500">
              Recommended max: 8 ft
            </div>
          </div>
        </div>

        {/* Safety Indicator */}
        <div className={`p-3 rounded-lg border ${
          weight <= 3000 && height <= 8
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="font-medium">
            {weight <= 3000 && height <= 8 ? '✓ Safe Configuration' : '⚠ Unsafe Configuration'}
          </div>
          <div className="text-sm mt-1">
            {weight > 3000 && 'Weight exceeds safe limit. '}
            {height > 8 && 'Height creates stability risk. '}
            {weight <= 3000 && height <= 8 && 'Load is within safe operating parameters.'}
          </div>
        </div>

        {/* Interactive Steps */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Demo Steps:</h3>
          
          <div className="space-y-2">
            <button
              onClick={() => completeStep('adjust-weight', 'Adjust Load Weight')}
              disabled={isStepCompleted('adjust-weight')}
              className={`w-full text-left p-3 rounded-lg border transition ${
                isStepCompleted('adjust-weight')
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>1. Adjust the load weight using the slider</span>
                {isStepCompleted('adjust-weight') && <span className="text-green-600">✓</span>}
              </div>
            </button>

            <button
              onClick={() => completeStep('adjust-height', 'Adjust Fork Height')}
              disabled={isStepCompleted('adjust-height')}
              className={`w-full text-left p-3 rounded-lg border transition ${
                isStepCompleted('adjust-height')
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>2. Adjust the fork height to see stability impact</span>
                {isStepCompleted('adjust-height') && <span className="text-green-600">✓</span>}
              </div>
            </button>

            <button
              onClick={() => completeStep('check-safety', 'Check Safety Status')}
              disabled={isStepCompleted('check-safety')}
              className={`w-full text-left p-3 rounded-lg border transition ${
                isStepCompleted('check-safety')
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>3. Observe the safety indicator changes</span>
                {isStepCompleted('check-safety') && <span className="text-green-600">✓</span>}
              </div>
            </button>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Progress</span>
            <span>{stepsCompleted.length}/{requiredSteps.length} steps</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(stepsCompleted.length / requiredSteps.length) * 100}%` }}
            />
          </div>
        </div>

      </div>
    </StandardDemoPanel>
  );
}
