// components/quiz/ReviewIncorrect.tsx
"use client";
import React from "react";
import { useT } from "@/lib/i18n";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type IncorrectAnswer = {
  question: string;
  selectedChoice: number;
  correctAnswer: number;
  explanation?: string;
}

export function ReviewIncorrect({ items, onDone }: { items: IncorrectAnswer[]; onDone: () => void }) {
  const t = useT();
  
    return (
    <Card className="rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg text-[#0F172A]">
          {t('quiz.review_incorrect', 'Review Incorrect Answers')}
        </CardTitle>
        <p className="text-sm text-slate-600">
          {t('quiz.review_description', 'Please review these questions to improve your understanding before retaking the quiz.')}
        </p>
      </CardHeader>

      <CardContent>
        <div className="space-y-4 max-h-60 overflow-y-auto">
          {items.map((item, i) => (
            <div key={i} className="border-l-4 border-red-500 pl-4 py-3 bg-red-50 rounded-r-lg">
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
      </CardContent>

      <CardFooter className="flex-col items-stretch">
        <Separator className="mb-4" />
        <p className="text-xs text-slate-500 mb-3 text-center">
          Take your time to understand these concepts. You can retake the quiz after reviewing.
        </p>
        <Button
          onClick={onDone}
          className="w-full rounded-2xl bg-[#F76511] hover:bg-orange-600 focus:ring-2 focus:ring-[#F76511]"
        >
          {t('quiz.reviewed_continue', "I've Reviewed - Continue")}
        </Button>
      </CardFooter>
    </Card>
  );
}
