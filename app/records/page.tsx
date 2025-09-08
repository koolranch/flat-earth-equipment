import { supabaseServer } from '@/lib/supabase/server';
import { WalletCardButton } from '@/components/certificates/CertificateActions';

export default async function RecordsPage() {
  const s = supabaseServer();
  const { data: certs } = await s
    .from('certificates')
    .select('id, verify_code, pdf_url, wallet_pdf_url, issued_at, expires_at')
    .order('issued_at', { ascending: false });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Your Records</h1>
      <div className="space-y-4">
        {(certs || []).map((c) => (
          <div key={c.id} className="rounded-xl border p-4 flex items-center justify-between">
            <div className="text-sm">
              <div className="font-medium">Certificate {c.verify_code}</div>
              <div className="text-xs opacity-70">Issued {c.issued_at ? new Date(c.issued_at).toLocaleDateString() : '—'} · Expires {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : '—'}</div>
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