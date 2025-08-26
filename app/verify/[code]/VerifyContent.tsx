// app/verify/[code]/VerifyContent.tsx
"use client";
import React from "react";
import { useT } from "@/lib/i18n";

interface VerificationData {
  courseId: string;
  learnerInitials: string;
  issueDate: string;
  score: number;
}

interface VerifyContentProps {
  data: VerificationData | null;
}

export default function VerifyContent({ data }: VerifyContentProps) {
  const t = useT();

  if (!data) {
    return (
      <main className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-[#0F172A]">{t('verify.title', 'Certificate Verification')}</h1>
        <p className="mt-2 text-slate-700">{t('verify.invalid_code', 'Invalid or expired code.')}</p>
      </main>
    );
  }
  
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-[#0F172A]">{t('verify.title', 'Certificate Verification')}</h1>
      <div className="mt-4 rounded-2xl border p-4 shadow-lg">
        <p className="text-sm text-slate-600">{t('verify.course', 'Course')}: {data.courseId}</p>
        <p className="text-sm text-slate-600">{t('verify.learner', 'Learner')}: {data.learnerInitials}</p>
        <p className="text-sm text-slate-600">{t('verify.issued', 'Issued')}: {data.issueDate}</p>
        <p className="text-sm text-slate-600">{t('verify.score', 'Score')}: {data.score}%</p>
      </div>
    </main>
  );
}
