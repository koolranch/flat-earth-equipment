import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function generateTestCertificate() {
  const userId = 'fec9a78e-2f94-49c6-92c1-c6fcacc60f75';
  const enrollmentId = 'c817fa52-958d-4f93-9667-b8a56368cb6f';
  
  console.log('📜 Generating test certificate...');
  console.log('User ID:', userId);
  console.log('Enrollment ID:', enrollmentId);
  
  // Call the cert/issue endpoint
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://flatearthequipment.com';
    console.log('Calling:', `${baseUrl}/api/cert/issue`);
    
    const response = await fetch(`${baseUrl}/api/cert/issue`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ enrollment_id: enrollmentId })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Certificate generated successfully!');
      console.log('Response:', data);
      
      // Verify in database
      const { data: cert } = await supabase
        .from('certificates')
        .select('*')
        .eq('enrollment_id', enrollmentId)
        .single();
      
      if (cert) {
        console.log('\n📋 Certificate Details:');
        console.log('ID:', cert.id);
        console.log('PDF URL:', cert.pdf_url || 'Not set');
        console.log('Verification Code:', cert.verification_code || 'Not set');
        console.log('Issued At:', cert.issued_at);
      }
    } else {
      const error = await response.text();
      console.error('❌ Certificate generation failed:', response.status);
      console.error('Error:', error);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

generateTestCertificate();

