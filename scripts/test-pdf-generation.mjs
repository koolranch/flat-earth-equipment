#!/usr/bin/env node

/**
 * Test script for PDF certificate generation
 * Usage: node scripts/test-pdf-generation.mjs
 */

import { renderCertificatePdf } from '../lib/cert/pdf.ts';
import { writeFile } from 'node:fs/promises';

async function testPdfGeneration() {
  console.log('🧪 Testing PDF Certificate Generation...\n');

  const testData = {
    trainee_name: 'John Smith',
    course_title: 'Forklift Safety Certification',
    trainer_name: 'Jane Instructor',
    issued_at: '2024-01-15T10:00:00Z',
    expires_at: '2027-01-15T10:00:00Z',
    verification_code: 'ABC123XYZ789',
    verify_url: 'https://flatearthequipment.com/verify/ABC123XYZ789'
  };

  try {
    console.log('📄 Generating PDF with test data...');
    console.log(`   Trainee: ${testData.trainee_name}`);
    console.log(`   Course: ${testData.course_title}`);
    console.log(`   Verification: ${testData.verification_code}`);
    
    const pdfBytes = await renderCertificatePdf(testData);
    
    console.log(`✅ PDF generated successfully (${pdfBytes.length} bytes)`);
    
    // Save test PDF
    const filename = `test-certificate-${Date.now()}.pdf`;
    await writeFile(filename, pdfBytes);
    
    console.log(`💾 Test PDF saved as: ${filename}`);
    console.log('🎯 PDF generation test completed successfully!');
    
  } catch (error) {
    console.error('❌ PDF generation failed:', error);
    throw error;
  }
}

testPdfGeneration().catch(console.error);
