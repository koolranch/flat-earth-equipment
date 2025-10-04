import { supabaseServer } from '@/lib/supabase/server';
import { WalletCardButton } from '@/components/certificates/CertificateActions';

export default async function RecordsPage() {
  const s = supabaseServer();
  
  // Get current user
  const { data: { user } } = await s.auth.getUser();
  
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Your Records</h1>
        <p>Please log in to view your certificates.</p>
      </div>
    );
  }
  
  // Get user's enrollments and their certificates
  const { data: enrollments } = await s
    .from('enrollments')
    .select('id, course_id, passed, progress_pct, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  const enrollmentIds = (enrollments || []).map(e => e.id);
  
  // Get certificates for user's enrollments (handles multiple per enrollment)
  const { data: certs, error: certsError } = await s
    .from('certificates')
    .select('id, enrollment_id, verification_code, verifier_code, pdf_url, wallet_pdf_url, issued_at, learner_id')
    .eq('learner_id', user.id)
    .order('issued_at', { ascending: false });
  
  // Debug: log what we got
  console.log('[records] Certificates query:', {
    user_id: user.id,
    enrollment_count: enrollments?.length,
    cert_count: certs?.length,
    error: certsError?.message
  });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Your Records</h1>
      
      {(!certs || certs.length === 0) && (
        <div className="rounded-xl border border-slate-200 p-8 text-center">
          <p className="text-slate-600">No certificates found. Complete your training and pass the final exam to earn your certificate!</p>
          <a href="/training" className="mt-4 inline-block btn-primary tappable px-6 py-3">
            Go to Training
          </a>
        </div>
      )}
      
      <div className="space-y-4">
        {(certs || []).map((c) => (
          <div key={c.id} className="rounded-xl border p-4 flex items-center justify-between">
            <div className="text-sm">
              <div className="font-medium">Certificate {c.verification_code || c.verifier_code || 'N/A'}</div>
              <div className="text-xs opacity-70">Issued {c.issued_at ? new Date(c.issued_at).toLocaleDateString() : '—'} · Valid for 3 years</div>
            </div>
            <div className="flex gap-2">
              {c.pdf_url && (
                <a href={c.pdf_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-lg border px-3 py-2 text-sm">Certificate PDF</a>
              )}
              <WalletCardButton certificateId={c.id} url={c.wallet_pdf_url} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}