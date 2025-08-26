// components/quiz/items/HotspotItem.tsx
"use client";
import React, { useState } from "react";
import type { HotspotItem as HotspotItemType } from "@/types/quiz";
import { useT } from "@/lib/i18n";

interface HotspotItemProps {
  item: HotspotItemType;
  onAnswer: (result: { correct: boolean; choice: any }) => void;
}

export function HotspotItem({ item, onAnswer }: HotspotItemProps) {
  const t = useT();
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const handleTargetClick = (targetId: string) => {
    if (submitted) return;
    
    setSelectedTargets(prev => 
      prev.includes(targetId) 
        ? prev.filter(id => id !== targetId)
        : [...prev, targetId]
    );
  };

  const handleSubmit = () => {
    if (submitted) return;
    
    setSubmitted(true);
    const correct = selectedTargets.length === item.correct.length &&
                   selectedTargets.every(id => item.correct.includes(id));
    
    onAnswer({
      correct,
      choice: selectedTargets
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, targetId: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleTargetClick(targetId);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-[#0F172A]">{item.question}</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {item.targets.map((target) => (
          <button
            key={target.id}
            onClick={() => handleTargetClick(target.id)}
            onKeyDown={(e) => handleKeyDown(e, target.id)}
            disabled={submitted}
            className={`
              p-4 rounded-lg border-2 transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-[#F76511] focus:ring-opacity-50
              ${selectedTargets.includes(target.id)
                ? 'bg-orange-100 border-orange-500 text-orange-800'
                : 'bg-white border-gray-300 hover:border-orange-300'
              }
              ${submitted ? 'cursor-not-allowed opacity-75' : 'cursor-pointer hover:shadow-md'}
            `}
            aria-pressed={selectedTargets.includes(target.id)}
            tabIndex={0}
          >
            <div className="font-medium">{target.label}</div>
            {selectedTargets.includes(target.id) && (
              <div className="text-sm mt-1">✓ {t('hotspot.selected', 'Selected')}</div>
            )}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-slate-600">
          {t('hotspot.selected_count', 'Selected:')} {selectedTargets.length} / {item.correct.length}
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={submitted || selectedTargets.length === 0}
          className="
            px-6 py-2 rounded-lg bg-[#F76511] text-white font-medium
            hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-[#F76511]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
          "
        >
          {submitted ? t('quiz.submitted', 'Submitted') : t('quiz.submit_answer', 'Submit Answer')}
        </button>
      </div>

      {submitted && (
        <div className="mt-4 p-3 rounded-lg bg-slate-100">
          <div className="text-sm text-slate-700">
            {t('hotspot.your_selections', 'Your selections:')} {selectedTargets.join(', ') || t('hotspot.none', 'None')}
          </div>
        </div>
      )}
    </div>
  );
}
