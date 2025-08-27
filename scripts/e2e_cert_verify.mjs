// scripts/e2e_cert_verify.mjs
import { createClient } from '@supabase/supabase-js';

const BASE_URL = process.env.BASE_URL; // e.g., https://safety.yourdomain.com
const LEARNER_ID = process.env.LEARNER_ID;
const COURSE_ID = process.env.COURSE_ID;

if (!BASE_URL || !LEARNER_ID || !COURSE_ID) {
  console.error('Missing BASE_URL, LEARNER_ID, or COURSE_ID env');
  process.exit(1);
}

function log(step, ok, extra='') {
  const tag = ok ? 'PASS' : 'FAIL';
  console.log(`[${tag}] ${step}${extra ? ' — ' + extra : ''}`);
}

try {
  // 1) Issue certificate
  const res = await fetch(`${BASE_URL}/api/certificates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ learnerId: LEARNER_ID, courseId: COURSE_ID, score: 90, moduleIds: ['preop'] })
  });
  const issued = await res.json();
  if (!res.ok || !issued?.id || !issued?.verifier_code) {
    log('Issue certificate', false, JSON.stringify(issued));
    process.exit(1);
  }
  log('Issue certificate', true, `id=${issued.id}`);

  // 2) Generate PDF
  const pdfRes = await fetch(`${BASE_URL}/api/certificates/pdf/${issued.id}`);
  const pdfJson = await pdfRes.json().catch(()=>({}));
  if (!pdfRes.ok || !pdfJson?.pdf_url) {
    log('Generate cert PDF', false, JSON.stringify(pdfJson));
    process.exit(1);
  }
  log('Generate cert PDF', true, pdfJson.pdf_url);

  // 3) HEAD check PDF URL
  const head = await fetch(pdfJson.pdf_url, { method: 'HEAD' });
  log('PDF URL reachable', head.ok);

  // 4) Verify code
  const ver = await fetch(`${BASE_URL}/api/verify/${issued.verifier_code}`);
  const verJson = await ver.json().catch(()=>({}));
  log('Verify endpoint resolves', ver.ok, JSON.stringify(verJson));

  // 5) Optional DB cross-check
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await supabase
      .from('certificates')
      .select('id,pdf_url')
      .eq('id', issued.id)
      .maybeSingle();
    log('DB pdf_url set', !!data?.pdf_url && !error, data?.pdf_url || error?.message || '');
  }

  process.exit(0);
} catch (e) {
  log('Unhandled error', false, e?.message || String(e));
  process.exit(1);
}
