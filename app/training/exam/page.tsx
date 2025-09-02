'use client';
import { useMemo, useState, useEffect } from 'react';
import { FINAL_EXAM } from '@/lib/training/exam.items';
import { track } from '@/lib/analytics/track';
import { useI18n } from '@/lib/i18n/I18nProvider';

interface ExamResult {
  ok: boolean;
  passed: boolean;
  score_pct: number;
  items_correct: number;
  items_total: number;
  pass_threshold: number;
  duration_seconds: number;
  attempt_id: string;
  incorrect: Array<{
    id: string;
    prompt: string;
    correctId: string;
    selectedId: string;
    explanation: string;
  }>;
  certificate_issued: boolean;
  next_steps: string;
}

export default function ExamPage() {
  const { t, locale } = useI18n();
  const items = useMemo(() => FINAL_EXAM.items.en, []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ExamResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examStartTime] = useState(() => Date.now());

  // Track exam start
  useEffect(() => {
    track('exam_start', { 
      exam_type: 'final', 
      total_questions: items.length,
      pass_threshold: FINAL_EXAM.passPct,
      locale
    });
  }, [items.length]);

  const currentItem = items[currentIndex];
  const progress = ((currentIndex + 1) / items.length) * 100;
  const isLastQuestion = currentIndex === items.length - 1;
  const canProceed = answers[currentItem?.id];

  function handleChoiceSelect(questionId: string, choiceId: string) {
    setAnswers(prev => ({ ...prev, [questionId]: choiceId }));
  }

  function handleNext() {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }

  function handleBack() {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }

  async function handleSubmit() {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    const examDuration = Math.round((Date.now() - examStartTime) / 1000);
    
    // Track submission attempt
    track('exam_submit', { 
      exam_type: 'final',
      total_questions: items.length,
      answered_questions: Object.keys(answers).length,
      duration_seconds: examDuration,
      locale
    });

    try {
      const response = await fetch('/api/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          answers,
          locale,
          exam_id: crypto.randomUUID() // Generate unique exam session ID
        })
      });

      const examResult = await response.json();
      setResult(examResult);

      // Track exam outcome
      if (examResult.passed) {
        track('exam_passed', { 
          score_pct: examResult.score_pct,
          duration_seconds: examResult.duration_seconds,
          attempt_id: examResult.attempt_id,
          locale
        });
      } else {
        track('exam_failed', { 
          score_pct: examResult.score_pct,
          incorrect_count: examResult.incorrect?.length || 0,
          duration_seconds: examResult.duration_seconds,
          attempt_id: examResult.attempt_id,
          locale
        });
      }
    } catch (error) {
      console.error('Exam submission error:', error);
      setResult({
        ok: false,
        passed: false,
        score_pct: 0,
        items_correct: 0,
        items_total: items.length,
        pass_threshold: FINAL_EXAM.passPct,
        duration_seconds: examDuration,
        attempt_id: '',
        incorrect: [],
        certificate_issued: false,
        next_steps: 'An error occurred during submission. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRetake() {
    setCurrentIndex(0);
    setAnswers({});
    setResult(null);
    
    // Track retake attempt
    track('exam_retake_started', { 
      exam_type: 'final',
      previous_score: result?.score_pct || 0,
      locale
    });
  }

  // Results view
  if (result?.ok !== undefined) {
    return (
      <main className="container mx-auto p-4 max-w-2xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">{t('exam.results_title')}</h1>
          <p className="text-sm text-slate-600 mt-1">
            Completed in {result.duration_seconds} seconds
          </p>
        </header>

        <section className="rounded-2xl border p-6 bg-white dark:bg-slate-900 space-y-4">
          {/* Score Summary */}
          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${result.passed ? 'text-emerald-600' : 'text-red-600'}`}>
              {result.passed ? `✅ ${t('exam.passed_title')}` : `❌ ${t('exam.failed_title')}`}
            </div>
            <div className="text-lg">
              {t('exam.score_label')}: <span className="font-semibold">{result.score_pct}%</span>
            </div>
            <div className="text-sm text-slate-600">
              {result.items_correct} of {result.items_total} questions correct
              <span className="text-slate-500"> (need {result.pass_threshold}% to pass)</span>
            </div>
          </div>

          {/* Next Steps */}
          <div className={`rounded-xl p-4 ${result.passed ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={`text-sm ${result.passed ? 'text-emerald-800' : 'text-red-800'}`}>
              {result.next_steps}
            </p>
          </div>

          {/* Certificate Information */}
          {result.passed && result.certificate_issued && (
            <div className="rounded-xl p-4 bg-blue-50 border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-1">Certificate Issued</h3>
              <p className="text-sm text-blue-700">
                Your certificate has been generated and will be available on your{' '}
                <a href="/records" className="underline hover:no-underline">Records page</a>{' '}
                shortly. You can download the PDF and share the verification code with employers.
              </p>
            </div>
          )}

          {/* Review Incorrect Answers */}
          {!result.passed && result.incorrect && result.incorrect.length > 0 && (
            <details className="rounded-xl border p-4 bg-slate-50 dark:bg-slate-800">
              <summary className="cursor-pointer font-medium text-slate-900 dark:text-slate-100 hover:text-[#F76511]">
                {t('exam.review_incorrect')} ({result.incorrect.length})
              </summary>
              <div className="mt-3 space-y-3">
                {result.incorrect.map((item, index) => (
                  <div key={item.id} className="rounded-lg border p-3 bg-white dark:bg-slate-900">
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
                      Question {index + 1}: {item.prompt}
                    </div>
                    <div className="text-xs text-red-600 mb-1">
                      Your answer: {item.selectedId || 'No answer selected'}
                    </div>
                    <div className="text-xs text-emerald-600 mb-2">
                      Correct answer: {item.correctId}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      <strong>Explanation:</strong> {item.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {!result.passed && (
              <button 
                onClick={handleRetake}
                className="rounded-2xl bg-[#F76511] text-white px-6 py-3 shadow-lg hover:bg-[#E55A0F] transition-colors"
              >
                {t('exam.retake_exam')}
              </button>
            )}
            <a 
              href="/training"
              className="rounded-2xl border border-slate-300 px-6 py-3 text-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {t('common.back')} to {t('training.hub_title')}
            </a>
            <a 
              href="/records"
              className="rounded-2xl border border-slate-300 px-6 py-3 text-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {t('exam.view_records')}
            </a>
          </div>
        </section>
      </main>
    );
  }

  // Exam interface
  return (
    <main className="container mx-auto p-4 max-w-2xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{t('exam.title')}</h1>
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm text-slate-600">
            Question {currentIndex + 1} of {items.length}
          </p>
          <p className="text-sm text-slate-600">
            Pass: {FINAL_EXAM.passPct}% required
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2 mt-3">
          <div 
            className="bg-[#F76511] h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {currentItem && (
        <section 
          className="rounded-2xl border p-6 bg-white dark:bg-slate-900 space-y-4"
          aria-label={`Question ${currentIndex + 1} of ${items.length}`}
        >
          {/* Question */}
          <div>
            <h2 className="text-lg font-medium mb-4" id={`question-${currentItem.id}`}>
              {currentItem.prompt}
            </h2>
            
            {/* Answer Choices */}
            <div 
              role="radiogroup" 
              aria-labelledby={`question-${currentItem.id}`}
              className="space-y-2"
            >
              {currentItem.choices.map((choice) => (
                <label 
                  key={choice.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover:border-[#F76511] hover:bg-slate-50 dark:hover:bg-slate-800 ${
                    answers[currentItem.id] === choice.id 
                      ? 'border-[#F76511] bg-orange-50 dark:bg-orange-900/20' 
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentItem.id}`}
                    value={choice.id}
                    checked={answers[currentItem.id] === choice.id}
                    onChange={() => handleChoiceSelect(currentItem.id, choice.id)}
                    className="w-4 h-4 text-[#F76511] focus:ring-[#F76511] focus:ring-2"
                  />
                  <span className="text-sm">{choice.text}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4">
            <button
              onClick={handleBack}
              disabled={currentIndex === 0}
              className="rounded-2xl border border-slate-300 px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
                              {t('common.back')}
            </button>

            <div className="text-xs text-slate-500">
              {Object.keys(answers).length} of {items.length} answered
            </div>

            {isLastQuestion ? (
              <button
                onClick={handleSubmit}
                disabled={!canProceed || isSubmitting}
                className="rounded-2xl bg-[#F76511] text-white px-6 py-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E55A0F] transition-colors"
              >
                {isSubmitting ? t('common.loading') : t('common.submit')}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed}
                className="rounded-2xl bg-[#F76511] text-white px-4 py-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E55A0F] transition-colors"
              >
                {t('common.next')}
              </button>
            )}
          </div>
        </section>
      )}

      {/* Exam Information */}
      <div className="mt-6 rounded-xl border p-4 bg-slate-50 dark:bg-slate-800">
        <h3 className="font-semibold text-sm mb-2">Exam Information</h3>
        <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <li>• {items.length} questions covering all training modules</li>
          <li>• {FINAL_EXAM.passPct}% score required to pass</li>
          <li>• You can review and change answers before submitting</li>
          <li>• Certificate issued automatically upon passing</li>
          <li>• Retake available immediately if needed</li>
        </ul>
      </div>
    </main>
  );
}
