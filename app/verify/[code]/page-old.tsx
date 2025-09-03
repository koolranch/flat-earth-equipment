import { supabaseServer } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import QR from '@/components/verify/QR';
import ShareButtons from '@/components/verify/ShareButtons';
import { VerifyPageTitle, VerifyNotFoundTitle } from '@/components/verify/VerifyLabels';
import { getDict, tFrom, type Locales } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

interface CertificateView {
  code: string;
  learner: {
    name: string;
    email: string;
  };
  course_title: string;
  pdf_url: string | null;
  issued_at: string | null;
  expires_at: string | null;
  practical_pass: boolean | null;
  is_expired: boolean;
}

/**
 * Fetch certificate data server-side for verification page
 * @param code - Verification code
 * @returns Certificate data or null if not found
 */
async function fetchCertificate(code: string): Promise<CertificateView | null> {
  try {
    const svc = supabaseServer();
    
    // Fetch certificate by verification code
    const { data: cert, error: certError } = await svc
      .from('certificates')
      .select('id, user_id, enrollment_id, pdf_url, issued_at, verification_code')
      .eq('verification_code', code)
      .maybeSingle();

    if (certError || !cert) {
      return null;
    }

    // Fetch related data in parallel
    const [profileResult, enrollmentResult] = await Promise.all([
      svc.from('profiles').select('full_name, email').eq('id', cert.user_id).maybeSingle(),
      svc.from('enrollments').select('course_id').eq('id', cert.enrollment_id).maybeSingle()
    ]);

    const { data: prof } = profileResult;
    const { data: enr } = enrollmentResult;

    // Fetch course title if enrollment exists
    let courseTitle = 'Training';
    if (enr?.course_id) {
      const { data: course } = await svc
        .from('courses')
        .select('title')
        .eq('id', enr.course_id)
        .maybeSingle();
      courseTitle = course?.title || courseTitle;
    }

    // Fetch practical evaluation status
    const { data: evalRow } = await svc
      .from('employer_evaluations')
      .select('practical_pass')
      .eq('enrollment_id', cert.enrollment_id)
      .maybeSingle();

    // Calculate dates
    const issued = cert.issued_at ? new Date(cert.issued_at) : null;
    const expires = issued ? new Date(issued) : null;
    if (expires) {
      expires.setFullYear(expires.getFullYear() + 3);
    }
    
    const isExpired = expires ? expires < new Date() : false;

    return {
      code: cert.verification_code,
      learner: {
        name: prof?.full_name || '',
        email: prof?.email || ''
      },
      course_title: courseTitle,
      pdf_url: cert.pdf_url,
      issued_at: issued?.toISOString() || null,
      expires_at: expires?.toISOString() || null,
      practical_pass: evalRow?.practical_pass ?? null,
      is_expired: isExpired
    };
  } catch (error) {
    console.error('Error fetching certificate:', error);
    return null;
  }
}

/**
 * Generate metadata for certificate verification page
 */
export async function generateMetadata({ params }: { params: { code: string } }): Promise<Metadata> {
  const certificate = await fetchCertificate(params.code);
  
  if (!certificate) {
    return {
      title: 'Certificate Not Found - Flat Earth Safety',
      description: 'The requested certificate could not be verified.',
      robots: 'noindex, nofollow'
    };
  }

  const title = `${certificate.learner.name} - ${certificate.course_title} Certificate`;
  const description = `Verify the authenticity of ${certificate.learner.name}'s ${certificate.course_title} certificate. ${certificate.is_expired ? 'Certificate has expired.' : 'Certificate is valid.'}`;
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://flatearthequipment.com';
  const verifyUrl = `${baseUrl}/verify/${params.code}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: verifyUrl,
      type: 'website',
      siteName: 'Flat Earth Safety',
      images: [
        {
          url: `${baseUrl}/verify/${params.code}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `Certificate verification for ${certificate.learner.name}`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/verify/${params.code}/opengraph-image`]
    },
    alternates: {
      canonical: verifyUrl
    }
  };
}

export default async function VerificationPage({ params }: { params: { code: string } }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://flatearthequipment.com';
  const locale = (cookies().get('locale')?.value === 'es') ? 'es' : 'en';
  const dict = getDict(locale as Locales);
  const t = (path: string, params?: Record<string, any>) => tFrom(dict, path, params);
  const certificate = await fetchCertificate(params.code);

  if (!certificate) {
    return (
      <main className="container mx-auto p-4">
        <div className="text-center py-12">
          <VerifyNotFoundTitle />
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            The verification code you entered could not be found or may be invalid.
          </p>
          <div className="space-x-3">
            <a 
              href="/records" 
              className="rounded-2xl border border-[#F76511] text-[#F76511] px-4 py-2 hover:bg-[#F76511] hover:text-white transition-colors"
            >
              My Records
            </a>
            <a 
              href="/" 
              className="rounded-2xl border border-slate-300 px-4 py-2 hover:bg-slate-50 transition-colors"
            >
              Home
            </a>
          </div>
        </div>
      </main>
    );
  }

  const verifyUrl = `${baseUrl}/verify/${params.code}`;
  const isExpired = certificate.is_expired;
  const issuedDate = certificate.issued_at ? new Date(certificate.issued_at).toLocaleDateString() : '—';
  const expiryDate = certificate.expires_at ? new Date(certificate.expires_at).toLocaleDateString() : '—';

  return (
    <main className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <VerifyPageTitle />
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Official certificate authenticity verification
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a 
            className="rounded-2xl border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50 transition-colors" 
            href="/records"
          >
            My Records
          </a>
          <a 
            className="rounded-2xl border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50 transition-colors" 
            href="/"
          >
            Home
          </a>
        </div>
      </header>

      {/* Certificate Card */}
      <section className="rounded-2xl border bg-white dark:bg-slate-900 shadow-sm">
        {/* Status Banner */}
        {isExpired && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-2 rounded-t-2xl">
            <div className="text-sm text-red-800 font-medium">
              ⚠️ This certificate has expired
            </div>
          </div>
        )}
        
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Certificate Information */}
            <div className="flex-1 space-y-4">
              {/* Course and Learner */}
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  {certificate.course_title}
                </h2>
                <div className="text-lg text-slate-700 dark:text-slate-300">
                  {certificate.learner.name}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {certificate.learner.email}
                </div>
              </div>

              {/* Certificate Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-slate-700 dark:text-slate-300">{t('verify.issued')}</div>
                  <div className="text-slate-600 dark:text-slate-400">{issuedDate}</div>
                </div>
                <div>
                  <div className="font-medium text-slate-700 dark:text-slate-300">{t('verify.expires')}</div>
                  <div className={`${isExpired ? 'text-red-600' : 'text-slate-600 dark:text-slate-400'}`}>
                    {expiryDate}
                    {isExpired && ' (Expired)'}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-slate-700 dark:text-slate-300">{t('verify.practical')}</div>
                  <div className="flex items-center gap-1">
                    {certificate.practical_pass === true ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                        {t('common.pass')}
                      </span>
                    ) : certificate.practical_pass === false ? (
                      <span className="inline-flex items-center gap-1 text-red-600">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        {t('common.fail')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                        Not Evaluated
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-slate-700 dark:text-slate-300">{t('verify.verification_code')}</div>
                  <div className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    {certificate.code}
                  </div>
                </div>
              </div>

              {/* Verification Status */}
              <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <div className="w-3 h-3 bg-emerald-500 rounded-full flex-shrink-0"></div>
                <div>
                  <div className="font-medium text-emerald-800 dark:text-emerald-200 text-sm">
                    ✓ Certificate Verified
                  </div>
                  <div className="text-emerald-700 dark:text-emerald-300 text-xs">
                    This certificate is authentic and was issued by Flat Earth Safety
                  </div>
                </div>
              </div>
            </div>

            {/* Actions and QR Code */}
            <div className="flex flex-col items-center gap-4 lg:w-64">
              {/* Action Buttons */}
              <div className="flex flex-col w-full gap-2">
                <ShareButtons url={verifyUrl} />
                {certificate.pdf_url && (
                  <a 
                    className="rounded-2xl border border-[#F76511] text-[#F76511] px-4 py-2 text-sm text-center hover:bg-[#F76511] hover:text-white transition-colors" 
                    href={certificate.pdf_url} 
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📄 View PDF Certificate
                  </a>
                )}
              </div>

              {/* QR Code */}
              <div className="text-center">
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Share QR Code
                </div>
                <QR value={verifyUrl} />
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Scan to verify this certificate
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Information */}
      <div className="text-center text-sm text-slate-500 dark:text-slate-400">
        <p>
          This verification page confirms the authenticity of certificates issued by Flat Earth Safety.
          For questions about this certificate, please contact us at{' '}
          <a href="mailto:support@flatearthequipment.com" className="text-[#F76511] hover:underline">
            support@flatearthequipment.com
          </a>
        </p>
      </div>
    </main>
  );
}