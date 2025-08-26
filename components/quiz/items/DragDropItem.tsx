// components/quiz/items/DragDropItem.tsx
"use client";
import React, { useState } from "react";
import type { DragItem as DragItemType } from "@/types/quiz";
import { useT } from "@/lib/i18n";

interface DragDropItemProps {
  item: DragItemType;
  onAnswer: (result: { correct: boolean; choice: any }) => void;
}

export function DragDropItem({ item, onAnswer }: DragDropItemProps) {
  const t = useT();
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const leftOptions = item.pairs.map(p => p.left);
  const rightOptions = item.pairs.map(p => p.right);

  const handleMatch = (left: string, right: string) => {
    if (submitted) return;
    
    setMatches(prev => ({
      ...prev,
      [left]: prev[left] === right ? '' : right
    }));
  };

  const handleSubmit = () => {
    if (submitted) return;
    
    setSubmitted(true);
    
    // Check if all matches are correct
    const correct = item.pairs.every(pair => 
      matches[pair.left] === pair.right
    );
    
    onAnswer({
      correct,
      choice: matches
    });
  };

  const getMatchedCount = () => {
    return Object.values(matches).filter(v => v !== '').length;
  };

  const handleKeyDown = (e: React.KeyboardEvent, left: string, right: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleMatch(left, right);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-[#0F172A]">{item.question}</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div>
          <h4 className="font-medium text-slate-700 mb-3">{t('drag.match_items', 'Match these items:')}</h4>
          <div className="space-y-2">
            {leftOptions.map((left) => (
              <div
                key={left}
                className={`
                  p-3 rounded-lg border-2 transition-colors
                  ${matches[left] 
                    ? 'bg-green-50 border-green-300' 
                    : 'bg-white border-gray-300'
                  }
                `}
              >
                <div className="font-medium">{left}</div>
                {matches[left] && (
                  <div className="text-sm text-green-600 mt-1">
                    {t('drag.matched_with', 'Matched with:')} {matches[left]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div>
          <h4 className="font-medium text-slate-700 mb-3">{t('drag.to_options', 'To these options:')}</h4>
          <div className="space-y-2">
            {rightOptions.map((right) => (
              <div key={right} className="space-y-1">
                <div className="font-medium text-slate-600">{right}</div>
                <div className="flex flex-wrap gap-1">
                  {leftOptions.map((left) => (
                    <button
                      key={`${left}-${right}`}
                      onClick={() => handleMatch(left, right)}
                      onKeyDown={(e) => handleKeyDown(e, left, right)}
                      disabled={submitted}
                      className={`
                        px-2 py-1 text-xs rounded border transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-[#F76511] focus:ring-opacity-50
                        ${matches[left] === right
                          ? 'bg-green-500 text-white border-green-500'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                        }
                        ${submitted ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}
                      `}
                      aria-pressed={matches[left] === right}
                      tabIndex={0}
                    >
                      {left}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-slate-600">
          {t('drag.matched', 'Matched:')} {getMatchedCount()} / {item.pairs.length}
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={submitted || getMatchedCount() < item.pairs.length}
          className="
            px-6 py-2 rounded-lg bg-[#F76511] text-white font-medium
            hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-[#F76511]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
          "
        >
          {submitted ? t('quiz.submitted', 'Submitted') : t('quiz.submit_matches', 'Submit Matches')}
        </button>
      </div>

      {submitted && (
        <div className="mt-4 p-3 rounded-lg bg-slate-100">
          <div className="text-sm text-slate-700">
            <div className="font-medium mb-2">{t('drag.your_matches', 'Your matches:')}</div>
            {Object.entries(matches).map(([left, right]) => (
              right && (
                <div key={left} className="flex justify-between">
                  <span>{left}</span>
                  <span>→</span>
                  <span>{right}</span>
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
