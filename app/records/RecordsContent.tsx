// app/records/RecordsContent.tsx
"use client";
import React from "react";
import { useT } from "@/lib/i18n";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
              <Card key={i} className="rounded-2xl border-green-200 bg-green-50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-green-800">{cert.courseTitle}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm text-green-700">{t('records.score', 'Score')}: {cert.score}%</p>
                    <p className="text-sm text-green-700">{t('records.issued', 'Issued')}: {new Date(cert.issueDate).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      disabled
                      variant="secondary"
                      size="sm"
                      className="rounded-lg"
                    >
                      {t('records.download_pdf', 'Download PDF (Coming Soon)')}
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      className="rounded-lg bg-green-600 hover:bg-green-700"
                    >
                      <a 
                        href={`/verify/${cert.verifierCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t('records.verify_certificate', 'Verify Certificate')}
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
              <Card key={i} className="rounded-2xl border-slate-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-[#0F172A]">{e.courseTitle}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm text-slate-600">{t('records.progress', 'Progress')}: {e.progressPct ?? 0}%</p>
                    {e.examScore != null && (
                      <p className="text-sm text-slate-600">{t('records.exam_score', 'Exam score')}: {e.examScore}%</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{t('records.employer_evaluation', 'Employer Evaluation')}:</span>
                    {e.eval ? (
                      <Badge
                        variant={e.eval.practical_pass ? "default" : "destructive"}
                        className={`${
                          e.eval.practical_pass 
                            ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                            : 'bg-red-100 text-red-800 hover:bg-red-100'
                        }`}
                      >
                        {e.eval.practical_pass ? t('records.passed', 'Passed') : t('records.failed', 'Failed')}
                        {e.eval.evaluation_date && ` on ${new Date(e.eval.evaluation_date).toLocaleDateString()}`}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        {t('records.pending', 'Pending')}
                      </Badge>
                    )}
                  </div>
                  
                  {e.eval?.evaluator_name && (
                    <p className="text-xs text-slate-500">
                      Evaluated by: {e.eval.evaluator_name}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
