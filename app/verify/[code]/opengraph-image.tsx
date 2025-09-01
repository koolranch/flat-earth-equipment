import { ImageResponse } from 'next/og';
import { supabaseServer } from '@/lib/supabase/server';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Fetch certificate data for Open Graph image
 */
async function fetchCertificateData(code: string) {
  try {
    const svc = supabaseServer();
    
    const { data: cert } = await svc
      .from('certificates')
      .select('user_id, enrollment_id, issued_at')
      .eq('verification_code', code)
      .maybeSingle();

    if (!cert) return null;

    const [{ data: prof }, { data: enr }] = await Promise.all([
      svc.from('profiles').select('full_name').eq('id', cert.user_id).maybeSingle(),
      svc.from('enrollments').select('course_id').eq('id', cert.enrollment_id).maybeSingle()
    ]);

    let courseTitle = 'Training Certificate';
    if (enr?.course_id) {
      const { data: course } = await svc
        .from('courses')
        .select('title')
        .eq('id', enr.course_id)
        .maybeSingle();
      courseTitle = course?.title || courseTitle;
    }

    const issued = cert.issued_at ? new Date(cert.issued_at) : null;
    const expires = issued ? new Date(issued) : null;
    if (expires) expires.setFullYear(expires.getFullYear() + 3);
    
    const isExpired = expires ? expires < new Date() : false;

    return {
      learnerName: prof?.full_name || 'Certificate Holder',
      courseTitle,
      issuedDate: issued ? issued.toLocaleDateString() : '',
      isExpired
    };
  } catch (error) {
    console.error('Error fetching certificate for OG image:', error);
    return null;
  }
}

export default async function OpenGraphImage({ params }: { params: { code: string } }) {
  const certificate = await fetchCertificateData(params.code);
  
  if (!certificate) {
    // Default image for invalid certificates
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            color: 'white',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '40px'
          }}
        >
          <div style={{ fontSize: 64, marginBottom: 20 }}>🔍</div>
          <div style={{ fontSize: 48, fontWeight: 'bold', marginBottom: 10 }}>
            Certificate Verification
          </div>
          <div style={{ fontSize: 24, opacity: 0.8 }}>
            Flat Earth Safety
          </div>
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px',
          color: 'white',
          fontFamily: 'system-ui, sans-serif'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 32, marginRight: 15 }}>🏗️</div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 'bold' }}>Flat Earth Safety</div>
            <div style={{ fontSize: 18, opacity: 0.8 }}>Certificate Verification</div>
          </div>
        </div>

        {/* Status Badge */}
        <div style={{ display: 'flex', marginBottom: 30 }}>
          <div
            style={{
              background: certificate.isExpired ? '#DC2626' : '#059669',
              padding: '8px 20px',
              borderRadius: '20px',
              fontSize: 16,
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {certificate.isExpired ? '⚠️ Expired' : '✓ Verified'}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 42, fontWeight: 'bold', marginBottom: 20, lineHeight: 1.2 }}>
            {certificate.courseTitle}
          </div>
          
          <div style={{ fontSize: 32, marginBottom: 30, opacity: 0.9 }}>
            {certificate.learnerName}
          </div>

          <div style={{ display: 'flex', gap: 40, fontSize: 18, opacity: 0.8 }}>
            <div>
              <div style={{ marginBottom: 5, fontWeight: 'bold' }}>Issued</div>
              <div>{certificate.issuedDate}</div>
            </div>
            <div>
              <div style={{ marginBottom: 5, fontWeight: 'bold' }}>Status</div>
              <div>{certificate.isExpired ? 'Expired' : 'Valid'}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ fontSize: 16, opacity: 0.6, textAlign: 'center' }}>
          Scan QR code or visit link to verify certificate authenticity
        </div>
      </div>
    ),
    { ...size }
  );
}
