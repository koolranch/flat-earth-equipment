import dotenv from 'dotenv';
// Load from .env.local as per project convention
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

// Import the PDF generator - we need to handle the TypeScript import
async function loadPdfRenderer() {
  try {
    // Try to import the TypeScript module
    const module = await import('../lib/cert/pdf.ts');
    return module.renderCertificatePdf;
  } catch (error) {
    console.error('Failed to load PDF renderer:', error);
    throw new Error('PDF renderer not available - ensure lib/cert/pdf.ts exists');
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Missing env');
const svc = createClient(url, key);

const N = Number(process.argv[2] || 50);
const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.flatearthequipment.com';

console.log(`🔄 Regenerating PDFs for last ${N} certificates...\n`);

const { data: certs, error: fetchError } = await svc.from('certificates')
  .select('id, trainee_name, course_title, trainer_name, issued_at, expires_at, verification_code, pdf_url')
  .order('issued_at', { ascending: false })
  .limit(N);

if (fetchError) {
  console.error('❌ Failed to fetch certificates:', fetchError.message);
  process.exit(1);
}

if (!certs || certs.length === 0) {
  console.log('ℹ️ No certificates found to regenerate');
  process.exit(0);
}

console.log(`📋 Found ${certs.length} certificates to process\n`);

const renderCertificatePdf = await loadPdfRenderer();
let success = 0, errors = 0;

for (const c of certs) {
  console.log(`📄 Processing: ${c.trainee_name} - ${c.verification_code}`);
  
  try {
    const verify_url = `${site}/verify/${c.verification_code}`;
    const pdf = await renderCertificatePdf({
      trainee_name: c.trainee_name, 
      course_title: c.course_title, 
      trainer_name: c.trainer_name, 
      issued_at: c.issued_at, 
      expires_at: c.expires_at, 
      verification_code: c.verification_code, 
      verify_url
    });
    
    const path = `cert-${c.verification_code}.pdf`;
    const up = await svc.storage.from('certificates').upload(path, pdf, { 
      contentType: 'application/pdf', 
      upsert: true 
    });
    
    if (up.error) { 
      console.log(`   ❌ Upload error: ${up.error.message}`); 
      errors++;
      continue; 
    }
    
    const { data: pub } = svc.storage.from('certificates').getPublicUrl(path);
    const updateResult = await svc.from('certificates').update({ 
      pdf_url: pub.publicUrl 
    }).eq('id', c.id);
    
    if (updateResult.error) {
      console.log(`   ❌ Update error: ${updateResult.error.message}`);
      errors++;
      continue;
    }
    
    console.log(`   ✅ Updated: ${c.id}`);
    success++;
    
  } catch (error) {
    console.log(`   ❌ Processing error: ${error.message}`);
    errors++;
  }
}

console.log('\n🎯 Regeneration Summary:');
console.log(`   ✅ Success: ${success} certificates`);
console.log(`   ❌ Errors: ${errors} certificates`);
console.log(`   📊 Total: ${certs.length} processed`);

if (errors > 0) {
  console.log('\n⚠️ Some certificates failed to regenerate - check error messages above');
  process.exit(1);
} else {
  console.log('\n🎉 All certificates regenerated successfully!');
}
