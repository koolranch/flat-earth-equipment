'use client';
import { useI18n } from '@/lib/i18n/I18nProvider';

export function VerifyPageTitle() {
  const { t } = useI18n();
  return <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('verify.page_title')}</h1>;
}

export function VerifyNotFoundTitle() {
  const { t } = useI18n();
  return <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t('verify.certificate_not_found')}</h1>;
}

export function VerifyLabels() {
  const { t } = useI18n();
  return {
    issued: t('verify.issued'),
    expires: t('verify.expires'),
    practical: t('verify.practical'),
    verificationCode: t('verify.verification_code'),
    learner: t('verify.learner'),
    pass: t('common.pass'),
    fail: t('common.fail')
  };
}
