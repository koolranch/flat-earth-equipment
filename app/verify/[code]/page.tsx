import { supabaseServer } from '@/lib/supabase/server';
import Script from 'next/script';

export const dynamic = 'force-dynamic';

async function getCert(code:string){
  const svc = supabaseServer();
  const { data } = await svc.from('certificates')
    .select('id, trainee_name, course_title, pdf_url, verification_code, issued_at, expires_at, status, employer_evaluations(practical_pass)')
    .eq('verification_code', code)
    .maybeSingle();
  return data;
}

export default async function Page({ params, searchParams }:{ params:{ code:string }, searchParams: { src?: string } }){
  const { cookies } = await import('next/headers');
  const { getDict, tFrom } = await import('@/lib/i18n');
  
  const locale = (cookies().get('locale')?.value === 'es') ? 'es' : 'en';
  const dict = getDict(locale as 'en'|'es');
  const t = (path: string) => tFrom(dict, path);
  
  const cert = await getCert(params.code);
  const src = searchParams?.src || 'direct';
  const pillCls = (cert?.status==='valid') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  
  return (
    <main className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-3'>{t('verify.title')}</h1>
      {!cert ? (
        <div className='rounded-2xl border p-4'>{t('verify.not_found')}</div>
      ):(
        <article className='rounded-2xl border p-4 grid gap-2 bg-white'>
          <div className='flex items-center gap-2'>
            <span className={`text-xs px-2 py-0.5 rounded-full ${pillCls}`}>{cert.status==='valid'? t('certificate.status_valid') : t('certificate.status_expired')}</span>
            <span className='text-xs text-slate-500'>{t('verify.code_label')}: <span className='font-mono'>{cert.verification_code}</span></span>
          </div>
          <div className='text-sm'><b>{t('verify.trainee')}:</b> {cert.trainee_name}</div>
          <div className='text-sm'><b>{t('verify.course')}:</b> {cert.course_title}</div>
          <div className='text-xs text-slate-700'><b>{t('verify.issued')}:</b> {new Date(cert.issued_at).toLocaleDateString()} • <b>{t('verify.expires')}:</b> {cert.expires_at ? new Date(cert.expires_at).toLocaleDateString() : '—'}</div>
          {cert.pdf_url && (<a className='rounded-2xl bg-[#F76511] text-white px-3 py-1 text-sm w-fit' href={cert.pdf_url} target='_blank'>{t('verify.view_pdf')}</a>)}
          <div className='text-[11px] text-slate-500 mt-2'>{t('verify.employer_notice')}</div>
          {cert.employer_evaluations?.[0]?.practical_pass !== undefined && (
            <div className='text-xs text-green-700 mt-2'>• {t('evaluation.on_file')}</div>
          )}
        </article>
      )}
      <Script id='vfy-analytics' dangerouslySetInnerHTML={{ __html: `window.analytics?.track?.('certificate_verify_view', { code: ${JSON.stringify(params.code)}, src: ${JSON.stringify(src)} });` }} />
    </main>
  );
}
