// components/quiz/ReviewIncorrect.tsx
"use client";
import React from "react";
import { useT } from "@/lib/i18n";

type IncorrectAnswer = {
  question: string;
  selectedChoice: number;
  correctAnswer: number;
  explanation?: string;
}

export function ReviewIncorrect({ items, onDone }: { items: IncorrectAnswer[]; onDone: () => void }) {
  const t = useT();
  
  return (
    <div className="rounded-2xl border p-4 shadow-lg">
      <h2 className="text-lg font-semibold text-[#0F172A] mb-4">{t('quiz.review_incorrect', 'Review Incorrect Answers')}</h2>
      <p className="text-sm text-slate-600 mb-4">
        {t('quiz.review_description', 'Please review these questions to improve your understanding before retaking the quiz.')}
      </p>
      
      <div className="space-y-4 max-h-60 overflow-y-auto">
        {items.map((item, i) => (
          <div key={i} className="border-l-4 border-red-500 pl-4 py-2 bg-red-50">
            <div className="font-medium text-[#0F172A] mb-2">
              {t('quiz.question_label', 'Question')} {i + 1}: {item.question}
            </div>
            <div className="text-sm text-red-700 mb-1">
              ❌ {t('quiz.your_answer_incorrect', 'Your answer was incorrect')}
            </div>
            {item.explanation && (
              <div className="text-sm text-green-700">
                ✅ {item.explanation}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-slate-500 mb-3">
          Take your time to understand these concepts. You can retake the quiz after reviewing.
        </p>
                <button
          className="w-full rounded-2xl bg-[#F76511] text-white px-4 py-2 hover:bg-orange-600 transition-colors"
          onClick={onDone}
        >
          {t('quiz.reviewed_continue', "I've Reviewed - Continue")}
        </button>
      </div>
    </div>
  );
}
