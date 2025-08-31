'use client';
import { useState, useMemo } from 'react';
import { useDemoEvents } from '@/lib/analytics/demo-events';

const HAZARDS = [
  { 
    id: 'pedestrians', 
    label: 'Pedestrians in area', 
    icon: '🚶', 
    response: 'Yield right-of-way, maintain safe distance',
    severity: 'high'
  },
  { 
    id: 'spill', 
    label: 'Liquid spill on floor', 
    icon: '💧', 
    response: 'Stop, tag area, report and contain spill',
    severity: 'high'
  },
  { 
    id: 'overhead', 
    label: 'Low overhead clearance', 
    icon: '⬇️', 
    response: 'Lower load, check mast height clearance',
    severity: 'medium'
  },
  { 
    id: 'unstable', 
    label: 'Unstable load', 
    icon: '📦', 
    response: 'Re-stack or secure load before moving',
    severity: 'high'
  },
  { 
    id: 'blind-corner', 
    label: 'Blind corner ahead', 
    icon: '🔄', 
    response: 'Sound horn, slow down, look carefully',
    severity: 'medium'
  },
  { 
    id: 'narrow-aisle', 
    label: 'Narrow aisle', 
    icon: '↔️', 
    response: 'Reduce speed, ensure adequate clearance',
    severity: 'medium'
  },
  { 
    id: 'damaged-rack', 
    label: 'Damaged racking', 
    icon: '🏗️', 
    response: 'Do not use, tag out and report damage',
    severity: 'high'
  },
  { 
    id: 'poor-lighting', 
    label: 'Poor lighting area', 
    icon: '💡', 
    response: 'Use headlights, reduce speed, extra caution',
    severity: 'medium'
  }
];

export default function HazardHunt() {
  const [identifiedHazards, setIdentifiedHazards] = useState<string[]>([]);
  const [showResponse, setShowResponse] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  const { emitDemoInteraction, emitDemoComplete } = useDemoEvents();

  // Randomly select 6 hazards for this session
  const sessionHazards = useMemo(() => {
    const shuffled = [...HAZARDS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 6);
  }, []);

  const identifyHazard = (hazardId: string) => {
    if (identifiedHazards.includes(hazardId)) return;
    
    const hazard = sessionHazards.find(h => h.id === hazardId);
    if (!hazard) return;
    
    const newIdentified = [...identifiedHazards, hazardId];
    setIdentifiedHazards(newIdentified);
    setShowResponse(hazardId);
    
    emitDemoInteraction('hazard_identified', hazardId, {
      hazard_label: hazard.label,
      hazard_severity: hazard.severity,
      total_identified: newIdentified.length,
      total_hazards: sessionHazards.length,
      response_shown: hazard.response
    });

    // Auto-complete when all hazards found
    if (newIdentified.length === sessionHazards.length) {
      emitDemoComplete({
        hazards_identified: newIdentified.length,
        total_hazards: sessionHazards.length,
        time_elapsed: timeElapsed,
        completion_rate: 100
      });
    }

    // Hide response after 3 seconds
    setTimeout(() => setShowResponse(null), 3000);
  };

  const startGame = () => {
    setGameStarted(true);
    setIdentifiedHazards([]);
    setShowResponse(null);
    setTimeElapsed(0);
    
    emitDemoInteraction('game_start', 'hazard_hunt', {
      total_hazards: sessionHazards.length
    });

    // Start timer
    const startTime = Date.now();
    const timer = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    // Clean up timer when component unmounts or game completes
    return () => clearInterval(timer);
  };

  const resetGame = () => {
    setGameStarted(false);
    setIdentifiedHazards([]);
    setShowResponse(null);
    setTimeElapsed(0);
    
    emitDemoInteraction('game_reset', 'hazard_hunt');
  };

  const isHazardIdentified = (hazardId: string) => identifiedHazards.includes(hazardId);
  const allHazardsFound = identifiedHazards.length === sessionHazards.length;
  const progressPct = (identifiedHazards.length / sessionHazards.length) * 100;

  if (!gameStarted) {
    return (
      <div className="text-center space-y-4">
        <div className="rounded-lg border p-6 bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700">
          <h3 className="text-lg font-medium text-yellow-900 dark:text-yellow-100 mb-2">
            🔍 Hazard Hunt Challenge
          </h3>
          <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-4">
            Identify {sessionHazards.length} workplace hazards and learn the proper response for each.
          </p>
          <button
            onClick={startGame}
            className="rounded-2xl bg-[var(--brand-orange)] text-white px-6 py-3 font-medium hover:bg-orange-600 transition"
          >
            Start Hazard Hunt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Game Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Find the Hazards</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Click each hazard when you spot it
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">
            {identifiedHazards.length}/{sessionHazards.length} found
          </div>
          <div className="text-xs text-slate-500">
            Time: {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
        <div 
          className="bg-blue-600 h-3 rounded-full transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Hazard Grid */}
      <div 
        className="grid grid-cols-2 md:grid-cols-3 gap-3" 
        role="group" 
        aria-label="Workplace hazards to identify"
      >
        {sessionHazards.map(hazard => {
          const isIdentified = isHazardIdentified(hazard.id);
          const isShowingResponse = showResponse === hazard.id;
          
          return (
            <div key={hazard.id} className="relative">
              <button
                onClick={() => identifyHazard(hazard.id)}
                disabled={isIdentified}
                aria-pressed={isIdentified}
                className={`
                  w-full p-4 rounded-xl border text-left transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${isIdentified 
                    ? 'bg-green-50 dark:bg-green-900 border-green-400 dark:border-green-600 text-green-800 dark:text-green-200 cursor-default' 
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl" aria-hidden="true">
                    {isIdentified ? '✅' : hazard.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{hazard.label}</div>
                    <div className={`text-xs mt-1 ${
                      hazard.severity === 'high' 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {hazard.severity.toUpperCase()} RISK
                    </div>
                  </div>
                </div>
              </button>

              {/* Response popup */}
              {isShowingResponse && (
                <div className="absolute z-10 top-full left-0 right-0 mt-2 p-3 bg-slate-900 dark:bg-slate-700 text-white text-sm rounded-lg shadow-lg">
                  <div className="font-medium mb-1">Proper Response:</div>
                  <div>{hazard.response}</div>
                  <div className="absolute -top-2 left-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-slate-900 dark:border-b-slate-700"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Message */}
      {allHazardsFound && (
        <div 
          className="p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-green-600 dark:text-green-400 text-xl">🎯</div>
              <div className="text-sm font-medium text-green-800 dark:text-green-200">
                All hazards identified! Time: {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
              </div>
            </div>
            <button
              onClick={resetGame}
              className="text-xs text-green-600 dark:text-green-400 underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <p>
          <strong>Instructions:</strong> Click each hazard when you recognize it. 
          Learn the proper response for workplace safety.
        </p>
        <p>
          Different hazards appear each time you play. Practice until responses become automatic.
        </p>
      </div>
    </div>
  );
}
