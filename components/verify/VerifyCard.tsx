'use client';
import { useI18n } from '@/lib/i18n/I18nProvider';
export default function VerifyCard({ view, verifyUrl }:{ view:any; verifyUrl:string }){
  const { t } = useI18n();
  return (
    <section className="rounded-2xl border p-4 bg-white dark:bg-slate-900">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">{view.course_title}</div>
          <div className="text-sm text-slate-700">{view.learner.name} <span className="text-slate-500">({view.learner.email})</span></div>
          <div className="text-xs text-slate-600 mt-1">{t('verify.issued')}: {view.issued_at ? new Date(view.issued_at).toLocaleDateString() : '—'} • {t('verify.expires')}: {view.expires_at ? new Date(view.expires_at).toLocaleDateString() : '—'}</div>
          <div className="text-xs mt-1">{t('verify.practical')}: {view.practical_pass===true?'Pass':view.practical_pass===false?'Fail':'—'}</div>
          <div className="text-xs mt-1">{t('verify.verification_code')}: <span className="font-mono">{view.code}</span></div>
        </div>
      </div>
    </section>
  );
}
