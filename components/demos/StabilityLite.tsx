'use client';
import { useState, useMemo } from 'react';
import { useDemoEvents } from '@/lib/analytics/demo-events';

const LOAD_WEIGHTS = [1000, 2000, 3000, 4000, 5000];
const FORK_HEIGHTS = [0, 2, 4, 6, 8, 10, 12];
const LOAD_CENTERS = [24, 30, 36, 42, 48]; // inches from fork face

export default function StabilityLite() {
  const [weight, setWeight] = useState(2000);
  const [height, setHeight] = useState(4);
  const [loadCenter, setLoadCenter] = useState(24);
  const [stepsCompleted, setStepsCompleted] = useState<string[]>([]);
  
  const { emitSimParamChange, emitDemoInteraction, emitDemoComplete } = useDemoEvents();

  // Calculate stability factors
  const stabilityData = useMemo(() => {
    const maxCapacity = 5000; // Base capacity at ground level
    const heightFactor = Math.max(0.1, 1 - (height * 0.1)); // Capacity decreases with height
    const centerFactor = Math.max(0.1, 1 - ((loadCenter - 24) * 0.02)); // Capacity decreases with forward center
    
    const adjustedCapacity = maxCapacity * heightFactor * centerFactor;
    const utilization = (weight / adjustedCapacity) * 100;
    const isSafe = utilization <= 100 && weight <= maxCapacity;
    const riskLevel = utilization > 100 ? 'high' : utilization > 80 ? 'medium' : 'low';
    
    return {
      adjustedCapacity: Math.round(adjustedCapacity),
      utilization: Math.round(utilization),
      isSafe,
      riskLevel,
      heightFactor: Math.round(heightFactor * 100),
      centerFactor: Math.round(centerFactor * 100)
    };
  }, [weight, height, loadCenter]);

  const requiredSteps = ['adjust-weight', 'adjust-height', 'adjust-center', 'check-stability'];

  const handleWeightChange = (newWeight: number) => {
    setWeight(newWeight);
    emitSimParamChange('load_weight', newWeight, {
      stability_data: stabilityData,
      safety_status: stabilityData.isSafe ? 'safe' : 'unsafe'
    });
    completeStep('adjust-weight', 'Adjust Load Weight');
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    emitSimParamChange('fork_height', newHeight, {
      stability_data: stabilityData,
      height_risk: newHeight > 8 ? 'high' : 'normal'
    });
    completeStep('adjust-height', 'Adjust Fork Height');
  };

  const handleCenterChange = (newCenter: number) => {
    setLoadCenter(newCenter);
    emitSimParamChange('load_center', newCenter, {
      stability_data: stabilityData,
      center_risk: newCenter > 36 ? 'high' : 'normal'
    });
    completeStep('adjust-center', 'Adjust Load Center');
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
          final_height: height,
          final_load_center: loadCenter,
          final_stability: stabilityData
        });
      }
    }
  };

  const checkStability = () => {
    completeStep('check-stability', 'Check Stability Status');
    emitDemoInteraction('stability_check', 'stability_indicator', {
      stability_data: stabilityData,
      user_assessment: stabilityData.isSafe ? 'safe' : 'unsafe'
    });
  };

  const isStepCompleted = (stepId: string) => stepsCompleted.includes(stepId);
  const allStepsCompleted = requiredSteps.every(step => isStepCompleted(step));

  return (
    <div className="space-y-6">
      
      {/* Stability Triangle Visualization */}
      <div className="rounded-lg border p-4 bg-slate-50 dark:bg-slate-800">
        <h3 className="text-sm font-medium mb-3">Stability Triangle Concept</h3>
        <div className="flex items-center justify-center mb-3">
          <div className="relative w-32 h-32">
            {/* Simple triangle visualization */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon 
                points="50,10 10,90 90,90" 
                fill="none" 
                stroke="#3B82F6" 
                strokeWidth="2"
              />
              <circle 
                cx="50" 
                cy={70 + (height * 2)} 
                r="3" 
                fill={stabilityData.isSafe ? "#10B981" : "#EF4444"}
              />
              <text x="50" y="95" textAnchor="middle" fontSize="8" fill="currentColor">
                Load Center
              </text>
            </svg>
          </div>
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-400 text-center">
          Keep the load center within the stability triangle
        </div>
      </div>

      {/* Simulation Controls */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="weight-slider" className="block text-sm font-medium">
            Load Weight: {weight.toLocaleString()} lbs
          </label>
          <input
            id="weight-slider"
            type="range"
            min="1000"
            max="5000"
            step="100"
            value={weight}
            onChange={(e) => handleWeightChange(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-slate-500">
            Max capacity: {stabilityData.adjustedCapacity.toLocaleString()} lbs
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
            step="1"
            value={height}
            onChange={(e) => handleHeightChange(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-slate-500">
            Height factor: {stabilityData.heightFactor}%
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="center-slider" className="block text-sm font-medium">
            Load Center: {loadCenter}&quot;
          </label>
          <input
            id="center-slider"
            type="range"
            min="24"
            max="48"
            step="6"
            value={loadCenter}
            onChange={(e) => handleCenterChange(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-slate-500">
            Center factor: {stabilityData.centerFactor}%
          </div>
        </div>
      </div>

      {/* Stability Indicator */}
      <div className={`p-4 rounded-lg border ${
        stabilityData.riskLevel === 'low'
          ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200'
          : stabilityData.riskLevel === 'medium'
          ? 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200'
          : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">
              {stabilityData.isSafe ? '✓ Safe Configuration' : '⚠ Unsafe Configuration'}
            </div>
            <div className="text-sm mt-1">
              Capacity utilization: {stabilityData.utilization}%
            </div>
          </div>
          <button
            onClick={checkStability}
            disabled={isStepCompleted('check-stability')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
              isStepCompleted('check-stability')
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isStepCompleted('check-stability') ? 'Checked ✓' : 'Check Stability'}
          </button>
        </div>
      </div>

      {/* Interactive Steps */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Demo Steps:</h3>
        
        <div className="space-y-2">
          <div className={`p-3 rounded-lg border transition ${
            isStepCompleted('adjust-weight')
              ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200'
              : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-600'
          }`}>
            <div className="flex items-center justify-between">
              <span>1. Adjust the load weight to see capacity impact</span>
              {isStepCompleted('adjust-weight') && <span className="text-green-600">✓</span>}
            </div>
          </div>

          <div className={`p-3 rounded-lg border transition ${
            isStepCompleted('adjust-height')
              ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200'
              : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-600'
          }`}>
            <div className="flex items-center justify-between">
              <span>2. Adjust fork height to see stability changes</span>
              {isStepCompleted('adjust-height') && <span className="text-green-600">✓</span>}
            </div>
          </div>

          <div className={`p-3 rounded-lg border transition ${
            isStepCompleted('adjust-center')
              ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200'
              : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-600'
          }`}>
            <div className="flex items-center justify-between">
              <span>3. Adjust load center to understand forward/back impact</span>
              {isStepCompleted('adjust-center') && <span className="text-green-600">✓</span>}
            </div>
          </div>

          <div className={`p-3 rounded-lg border transition ${
            isStepCompleted('check-stability')
              ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200'
              : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-600'
          }`}>
            <div className="flex items-center justify-between">
              <span>4. Check the stability status and understand the indicators</span>
              {isStepCompleted('check-stability') && <span className="text-green-600">✓</span>}
            </div>
          </div>
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

      {/* Key Learning Points */}
      <div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700">
        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          Key Stability Principles:
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Higher loads reduce capacity and increase tip risk</li>
          <li>• Forward load center reduces stability</li>
          <li>• Always check capacity chart before lifting</li>
          <li>• Keep loads low when traveling</li>
        </ul>
      </div>

    </div>
  );
}
