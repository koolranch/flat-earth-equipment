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
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold text-slate-900">Your Records</h1>
        <p className="text-lg text-slate-600">Access your certificates and training documentation</p>
      </header>
      
      {(!certs || certs.length === 0) && (
        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-md p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center text-3xl">
            📜
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Certificates Yet</h2>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Complete your training and pass the final exam to earn your certificate!
          </p>
          <a href="/training" className="inline-flex items-center gap-2 bg-[#F76511] text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl">
            Start Training →
          </a>
        </div>
      )}
      
      <div className="space-y-4">
        {(certs || []).map((c) => (
          <div 
            key={c.id} 
            className="group bg-white rounded-2xl border-2 border-slate-200 shadow-md hover:shadow-xl transition-all p-6 relative overflow-hidden"
          >
            {/* Orange accent bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#F76511] to-orange-600"></div>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-4">
                {/* Certificate icon */}
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-[#F76511] to-orange-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                  ✓
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-slate-900">
                      Certificate {c.verification_code || c.verifier_code || 'N/A'}
                    </h3>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                      Valid
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Issued {c.issued_at ? new Date(c.issued_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Valid for 3 years
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {c.pdf_url && (
                  <a 
                    href={c.pdf_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 bg-[#F76511] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-orange-600 transition-all shadow-md hover:shadow-lg"
                  >
                    <span>📄</span> Certificate PDF
                  </a>
                )}
                <WalletCardButton certificateId={c.id} url={c.wallet_pdf_url} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}