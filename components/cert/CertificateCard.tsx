'use client';
import { useState } from 'react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { useI18n } from '@/lib/i18n/I18nProvider';

export default function CertificateCard({ cert }:{ cert: { id:string; trainee_name:string; course_title:string; pdf_url?:string|null; verification_code:string; issued_at:string; expires_at:string|null; status:'valid'|'expired'; locale?:'en'|'es' } }){
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/verify/${cert.verification_code}`;
  const shortDate = (s?:string|null)=> s ? new Date(s).toLocaleDateString() : '—';
  const pillCls = cert.status==='valid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  function copy(){ navigator.clipboard.writeText(verifyUrl).then(()=>{ setCopied(true); setTimeout(()=> setCopied(false), 1200); (window as any)?.analytics?.track?.('certificate_share_link_copied', { id: cert.id }); }); }
  function onView(){ (window as any)?.analytics?.track?.('certificate_view_pdf', { id: cert.id }); }
  function onDownload(){ (window as any)?.analytics?.track?.('certificate_download', { id: cert.id }); }

  const walletEnabled = !!(process.env.NEXT_PUBLIC_WALLET_UI === '1');

  return (
    <article className='rounded-2xl border p-4 grid gap-3 md:grid-cols-[1fr_auto] items-center bg-white'>
      <div className='space-y-1'>
        <div className='flex items-center gap-2'>
          <h3 className='text-lg font-semibold'>{t('certificate.title')}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full ${pillCls}`}>{cert.status==='valid'? t('certificate.status_valid') : t('certificate.status_expired')}</span>
        </div>
        <div className='text-sm text-slate-700'>
          <div><b>{t('certificate.trainee')}:</b> {cert.trainee_name}</div>
          <div><b>{t('certificate.course')}:</b> {cert.course_title}</div>
          <div className='text-xs'><b>{t('certificate.issued')}:</b> {shortDate(cert.issued_at)} • <b>{t('certificate.expires')}:</b> {shortDate(cert.expires_at)}</div>
          <div className='text-xs'><b>{t('certificate.verify_id')}:</b> <span className='font-mono'>{cert.verification_code}</span></div>
        </div>
        <div className='flex flex-wrap gap-2 pt-1'>
          {cert.pdf_url && (<a className='rounded-2xl bg-[#F76511] text-white px-3 py-1 text-sm' href={cert.pdf_url} target='_blank' onClick={onView}>{t('certificate.view_pdf')}</a>)}
          {cert.pdf_url && (<a className='rounded-2xl border px-3 py-1 text-sm' href={cert.pdf_url} download onClick={onDownload}>{t('certificate.download_pdf')}</a>)}
          <button className='rounded-2xl border px-3 py-1 text-sm' onClick={copy}>{copied? t('certificate.copied') : t('certificate.copy_link')}</button>
          {walletEnabled ? (
            <>
              <button className='rounded-2xl border px-3 py-1 text-sm'>{t('certificate.add_wallet_apple')}</button>
              <button className='rounded-2xl border px-3 py-1 text-sm'>{t('certificate.add_wallet_google')}</button>
            </>
          ) : (
            <>
              <button className='rounded-2xl border px-3 py-1 text-sm opacity-60 cursor-not-allowed' title={t('certificate.coming_soon')}>{t('certificate.add_wallet_apple')}</button>
              <button className='rounded-2xl border px-3 py-1 text-sm opacity-60 cursor-not-allowed' title={t('certificate.coming_soon')}>{t('certificate.add_wallet_google')}</button>
            </>
          )}
        </div>
        <div className='text-[11px] text-slate-500'>{t('certificate.footer_note')}</div>
      </div>
      <div className='justify-self-end text-center'>
        <QRCode value={`${verifyUrl}?src=qr`} size={112} includeMargin aria-label={t('certificate.qr_hint')} />
        <div className='text-[10px] text-slate-500 mt-1'>{t('certificate.qr_hint')}</div>
      </div>
    </article>
  );
}
