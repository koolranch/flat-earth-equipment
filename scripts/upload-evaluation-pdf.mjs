import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

const BUCKET_NAME = 'site-assets';

async function uploadEvaluationPDF() {
  try {
    console.log('🚀 Starting PDF upload...');
    
    // Read the generated PDF file
    const pdfPath = path.join(process.cwd(), 'public', 'pdfs', 'forklift-eval-v2.3.pdf');
    
    if (!fs.existsSync(pdfPath)) {
      console.error('❌ PDF file not found at:', pdfPath);
      process.exit(1);
    }
    
    const fileBuffer = fs.readFileSync(pdfPath);
    const fileName = 'forklift-eval-v2.3.pdf';
    
    console.log(`📁 Uploading ${fileName} (${(fileBuffer.length / 1024).toFixed(1)} KB)...`);
    
    // Upload the PDF to the site-assets bucket
    const { error: uploadError } = await supabase
      .storage
      .from(BUCKET_NAME)
      .upload(fileName, fileBuffer, {
        contentType: 'application/pdf',
        upsert: true // Replace existing file
      });

    if (uploadError) {
      console.error('❌ Error uploading PDF:', uploadError);
      process.exit(1);
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    console.log('✅ PDF uploaded successfully!');
    console.log('🌐 Public URL:', publicUrl);
    console.log('');
    console.log('📋 The PDF now includes fillable form fields:');
    console.log('   • Operator Name/ID - Interactive text field');
    console.log('   • Date - Interactive text field');
    console.log('   • Evaluator Name/Title - Interactive text field');
    console.log('   • Equipment Type/ID - Interactive text field');
    console.log('   • Safety checklist - Interactive checkboxes');
    console.log('   • Evaluator Signature - Interactive text field');
    console.log('   • Signature Date - Interactive text field');
    console.log('');
    console.log('💡 Users can now fill out the form digitally on any device!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

uploadEvaluationPDF(); 