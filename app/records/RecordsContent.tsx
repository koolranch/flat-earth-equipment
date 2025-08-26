// app/records/RecordsContent.tsx
"use client";
import React from "react";
import { useT } from "@/lib/i18n";

interface Certificate {
  id: string;
  courseTitle: string;
  issueDate: string;
  score: number;
  verifierCode: string;
}

interface Enrollment {
  courseTitle: string;
  progressPct: number;
  examScore: number | null;
  eval: {
    practical_pass: boolean;
    evaluation_date: string;
    evaluator_name: string;
  } | null;
}

interface RecordsContentProps {
  enrollments: Enrollment[];
  certificates: Certificate[];
}

export default function RecordsContent({ enrollments, certificates }: RecordsContentProps) {
  const t = useT();

  return (
    <main className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold text-[#0F172A]">{t('records.title', 'Your Training Records')}</h1>
      
      {/* Certificates Section */}
      {certificates.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xl font-semibold text-[#0F172A] mb-4">{t('records.certificates', 'Certificates')}</h2>
          <div className="grid gap-4">
            {certificates.map((cert, i) => (
              <div key={i} className="rounded-2xl border border-green-200 bg-green-50 p-4 shadow-lg">
                <h3 className="text-lg font-semibold text-green-800">{cert.courseTitle}</h3>
                <p className="text-sm text-green-700">{t('records.score', 'Score')}: {cert.score}%</p>
                <p className="text-sm text-green-700">{t('records.issued', 'Issued')}: {new Date(cert.issueDate).toLocaleDateString()}</p>
                <div className="mt-3 flex gap-2">
                  <button 
                    disabled
                    className="rounded-lg bg-gray-300 text-gray-500 px-3 py-1 text-sm cursor-not-allowed"
                  >
                    {t('records.download_pdf', 'Download PDF (Coming Soon)')}
                  </button>
                  <a 
                    href={`/verify/${cert.verifierCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-green-600 text-white px-3 py-1 text-sm hover:bg-green-700 transition-colors"
                  >
                    {t('records.verify_certificate', 'Verify Certificate')}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Training Progress Section */}
      <section className="mt-6">
        <h2 className="text-xl font-semibold text-[#0F172A] mb-4">{t('records.training_progress', 'Training Progress')}</h2>
        {enrollments.length === 0 ? (
          <div className="mt-8 text-center">
            <p className="text-slate-600">No training records found.</p>
            <p className="text-sm text-slate-500 mt-2">
              Complete a course to see your training records here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {enrollments.map((e, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 p-4 shadow-lg">
                <h3 className="text-lg font-semibold text-[#0F172A]">{e.courseTitle}</h3>
                <p className="text-sm text-slate-600">{t('records.progress', 'Progress')}: {e.progressPct ?? 0}%</p>
                {e.examScore != null && (
                  <p className="text-sm text-slate-600">{t('records.exam_score', 'Exam score')}: {e.examScore}%</p>
                )}
                <div className="mt-2">
                  <span className="text-sm font-medium">{t('records.employer_evaluation', 'Employer Evaluation')}:</span>{" "}
                  {e.eval ? (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      e.eval.practical_pass 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {e.eval.practical_pass ? t('records.passed', 'Passed') : t('records.failed', 'Failed')}
                      {e.eval.evaluation_date && ` on ${new Date(e.eval.evaluation_date).toLocaleDateString()}`}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {t('records.pending', 'Pending')}
                    </span>
                  )}
                </div>
                {e.eval?.evaluator_name && (
                  <p className="text-xs text-slate-500 mt-1">
                    Evaluated by: {e.eval.evaluator_name}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
