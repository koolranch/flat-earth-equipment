// app/quiz-demo/page.tsx
"use client";
import React, { useState } from "react";
import { ItemRenderer } from "@/components/quiz/ItemRenderer";
import type { AnyItem } from "@/types/quiz";
import { useT } from "@/lib/i18n";

const sampleItems: AnyItem[] = [
  {
    id: "hotspot-1",
    type: "hotspot",
    question: "Select all required PPE items for forklift operation:",
    targets: [
      { id: "helmet", label: "Hard Hat" },
      { id: "vest", label: "Safety Vest" },
      { id: "gloves", label: "Work Gloves" },
      { id: "boots", label: "Steel Toe Boots" },
      { id: "glasses", label: "Safety Glasses" },
      { id: "jacket", label: "Regular Jacket" }
    ],
    correct: ["helmet", "vest", "boots", "glasses"]
  },
  {
    id: "order-1", 
    type: "order",
    question: "Arrange these pre-operation steps in the correct order:",
    options: ["Check brakes", "Start engine", "Adjust seat", "Visual inspection", "Check fluid levels"],
    correctOrder: ["Visual inspection", "Adjust seat", "Check fluid levels", "Start engine", "Check brakes"]
  },
  {
    id: "drag-1",
    type: "drag",
    question: "Match each safety term to its definition:",
    pairs: [
      { left: "OSHA", right: "Occupational Safety and Health Administration" },
      { left: "PPE", right: "Personal Protective Equipment" },
      { left: "SDS", right: "Safety Data Sheet" },
      { left: "LOTO", right: "Lockout/Tagout" }
    ]
  }
];

export default function QuizDemoPage() {
  const t = useT();
  const [currentItem, setCurrentItem] = useState(0);
  const [results, setResults] = useState<Array<{ correct: boolean; choice: any }>>([]);

  const handleAnswer = (result: { correct: boolean; choice: any }) => {
    const newResults = [...results];
    newResults[currentItem] = result;
    setResults(newResults);
    
    console.log(`Question ${currentItem + 1} answered:`, result);
  };

  const nextItem = () => {
    if (currentItem < sampleItems.length - 1) {
      setCurrentItem(currentItem + 1);
    }
  };

  const prevItem = () => {
    if (currentItem > 0) {
      setCurrentItem(currentItem - 1);
    }
  };

  const resetDemo = () => {
    setCurrentItem(0);
    setResults([]);
  };

  return (
    <main className="container mx-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-[#0F172A] mb-6">Quiz Item Types Demo</h1>
        
        {/* Progress */}
        <div className="mb-6 bg-slate-100 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Question {currentItem + 1} of {sampleItems.length}</span>
            <span className="text-sm text-slate-600">
              Type: <span className="font-mono bg-slate-200 px-2 py-1 rounded">{sampleItems[currentItem].type}</span>
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-[#F76511] h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentItem + 1) / sampleItems.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Quiz Item */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg mb-6">
          <ItemRenderer 
            item={sampleItems[currentItem]} 
            onAnswer={handleAnswer}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevItem}
            disabled={currentItem === 0}
            className="
              px-4 py-2 rounded-lg border border-slate-300 text-slate-700
              hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#F76511]
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200
            "
          >
            ← Previous
          </button>

          <div className="flex gap-2">
            {results[currentItem] && currentItem < sampleItems.length - 1 && (
              <button
                onClick={nextItem}
                className="
                  px-4 py-2 rounded-lg bg-[#F76511] text-white
                  hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-[#F76511]
                  transition-colors duration-200
                "
              >
                Next →
              </button>
            )}

            <button
              onClick={resetDemo}
              className="
                px-4 py-2 rounded-lg border border-slate-300 text-slate-700
                hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#F76511]
                transition-colors duration-200
              "
            >
              Reset Demo
            </button>
          </div>
        </div>

        {/* Results Summary */}
        {results.length > 0 && (
          <div className="mt-8 bg-slate-50 rounded-lg p-4">
            <h3 className="font-semibold text-[#0F172A] mb-3">Results Summary:</h3>
            <div className="space-y-2">
              {results.map((result, i) => (
                result && (
                  <div key={i} className="flex items-center gap-3">
                    <span className="font-mono text-sm bg-slate-200 px-2 py-1 rounded">Q{i + 1}</span>
                    <span className={`text-sm font-medium ${result.correct ? 'text-green-600' : 'text-red-600'}`}>
                      {result.correct ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                    <span className="text-xs text-slate-500 truncate max-w-xs">
                      {typeof result.choice === 'object' ? JSON.stringify(result.choice) : result.choice}
                    </span>
                  </div>
                )
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200">
              <span className="text-sm font-medium">
                Score: {results.filter(r => r?.correct).length} / {results.filter(r => r).length} correct
              </span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
