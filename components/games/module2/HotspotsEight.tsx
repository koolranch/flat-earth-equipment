"use client";
import React, { useState, useEffect } from "react";
import { analytics } from "@/lib/analytics";

const SPOTS = [
  { id: "mast", label: "Mast", x: "20%", y: "25%", tip: "Check for cracks, bends, and welds." },
  { id: "forks", label: "Forks", x: "35%", y: "60%", tip: "No cracks; heel not worn beyond limit." },
  { id: "hydraulics", label: "Hydraulic lines", x: "28%", y: "40%", tip: "No leaks; hoses undamaged." },
  { id: "tires", label: "Tires", x: "15%", y: "80%", tip: "Adequate tread; no chunking." },
  { id: "overhead", label: "Overhead guard", x: "60%", y: "15%", tip: "No damage; secure." },
  { id: "controls", label: "Controls", x: "75%", y: "45%", tip: "All levers/pedals function smoothly." },
  { id: "battery", label: "Battery/LP tank", x: "80%", y: "30%", tip: "Secure; no leaks/corrosion." },
  { id: "brakes", label: "Brakes", x: "55%", y: "70%", tip: "Parking brake holds; service brake firm." },
];

export function HotspotsEight({ onComplete }: { onComplete: () => void }) {
  const [visited, setVisited] = useState<Record<string, boolean>>({});
  const [tip, setTip] = useState<string>("");
  const [completionNotified, setCompletionNotified] = useState(false);
  
  const allDone = Object.keys(visited).length === SPOTS.length;

  // Track completion
  useEffect(() => {
    if (allDone && !completionNotified) {
      setCompletionNotified(true);
      analytics.track("inspection_complete", {
        component: "HotspotsEight",
        spotsInspected: Object.keys(visited).length,
        totalSpots: SPOTS.length
      });
      // Delay completion callback to let user see completion message
      setTimeout(() => onComplete(), 1500);
    }
  }, [allDone, completionNotified, onComplete, visited]);

  const visit = (id: string, tipText: string, label: string) => {
    if (visited[id]) return; // Already visited
    
    setVisited(v => ({ ...v, [id]: true }));
    setTip(tipText);
    
    // Track hotspot interaction
    analytics.track("inspection_hotspot_clicked", {
      component: "HotspotsEight",
      hotspotId: id,
      hotspotLabel: label,
      visitedCount: Object.keys(visited).length + 1,
      totalSpots: SPOTS.length
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, spot: typeof SPOTS[0]) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      visit(spot.id, spot.tip, spot.label);
    }
  };

  return (
    <div className="relative w-full aspect-[16/9] bg-slate-100 rounded-2xl overflow-hidden border-2 border-slate-200">
      {/* Background - TODO: replace with actual forklift image */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
        <div className="text-slate-500 text-lg font-medium">
          🚛 Forklift Inspection Points
        </div>
      </div>
      
      {/* Inspection hotspots */}
      {SPOTS.map(spot => (
        <button
          key={spot.id}
          aria-label={`Inspect ${spot.label}${visited[spot.id] ? ' (completed)' : ''}`}
          onClick={() => visit(spot.id, spot.tip, spot.label)}
          onKeyDown={(e) => handleKeyDown(e, spot)}
          className={`
            absolute h-8 w-8 rounded-full border-2 transition-all duration-200
            focus:outline-none focus:ring-4 focus:ring-[#F76511] focus:ring-opacity-50
            ${visited[spot.id] 
              ? 'bg-green-500 border-green-600 shadow-lg' 
              : 'bg-orange-500 border-orange-600 hover:bg-orange-400 hover:scale-110 shadow-md'
            }
          `}
          style={{ 
            left: spot.x, 
            top: spot.y,
            transform: 'translate(-50%, -50%)'
          }}
          disabled={visited[spot.id]}
          tabIndex={0}
        >
          <span className="sr-only">
            {visited[spot.id] ? '✓' : spot.label}
          </span>
          {visited[spot.id] && (
            <span className="text-white text-sm font-bold" aria-hidden="true">
              ✓
            </span>
          )}
        </button>
      ))}
      
      {/* Progress indicator */}
      <div className="absolute top-2 right-2 bg-white/90 rounded-lg px-3 py-1 shadow text-sm font-medium">
        {Object.keys(visited).length}/{SPOTS.length} Complete
      </div>
      
      {/* Tip/completion message */}
      <div 
        aria-live="polite" 
        aria-atomic="true"
        className="absolute bottom-2 left-2 right-2 rounded-xl bg-white/95 p-3 text-sm shadow-lg border border-slate-200"
      >
        <div className="font-medium text-slate-800">
          {allDone 
            ? "🎉 All inspection points completed—excellent work!" 
            : tip || "Click or press Enter/Space on each orange hotspot to inspect that area."
          }
        </div>
        {tip && !allDone && (
          <div className="text-xs text-slate-600 mt-1">
            Progress: {Object.keys(visited).length}/{SPOTS.length} areas inspected
          </div>
        )}
      </div>
    </div>
  );
}
