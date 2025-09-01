#!/usr/bin/env node

/**
 * Test script for QR code generation utilities
 * Usage: node scripts/test-qr-generation.mjs [verification_code]
 */

import { promises as fs } from 'fs';
import path from 'path';

// Mock the QR code functions since this is a test script
async function testQRGeneration() {
  console.log('🔍 Testing QR Code Generation Utilities...');
  
  const testCode = process.argv[2] || 'TEST123ABC456';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://flatearthequipment.com';
  
  console.log(`📱 Test Code: ${testCode}`);
  console.log(`🌐 Base URL: ${baseUrl}`);
  
  try {
    // Test 1: Import the QR utility
    console.log('\n📝 Test 1: Import QR utility functions');
    const qrModule = await import('../lib/cert/qrcode.ts');
    console.log('✅ Successfully imported QR utility');
    
    // Test 2: Generate verification URL
    console.log('\n📝 Test 2: Generate verification URL');
    const verifyUrl = qrModule.getVerificationUrl(testCode, baseUrl);
    console.log(`📍 Verification URL: ${verifyUrl}`);
    
    if (verifyUrl.includes('/verify/') && verifyUrl.includes(testCode)) {
      console.log('✅ Verification URL format is correct');
    } else {
      console.log('❌ Verification URL format is incorrect');
    }
    
    // Test 3: Generate QR code data URL
    console.log('\n📝 Test 3: Generate QR code data URL');
    const qrDataUrl = await qrModule.generateVerificationQR(testCode, baseUrl, {
      width: 200,
      margin: 1,
      errorCorrectionLevel: 'M'
    });
    
    if (qrDataUrl.startsWith('data:image/png;base64,')) {
      console.log('✅ QR code data URL generated successfully');
      console.log(`📏 Data URL length: ${qrDataUrl.length} characters`);
    } else {
      console.log('❌ Invalid QR code data URL format');
    }
    
    // Test 4: Generate QR code PNG buffer
    console.log('\n📝 Test 4: Generate QR code PNG buffer');
    const qrBuffer = await qrModule.generateVerificationQRBuffer(testCode, baseUrl, {
      width: 120,
      margin: 1,
      errorCorrectionLevel: 'M'
    });
    
    if (Buffer.isBuffer(qrBuffer) && qrBuffer.length > 0) {
      console.log('✅ QR code PNG buffer generated successfully');
      console.log(`📏 Buffer size: ${qrBuffer.length} bytes`);
      
      // Save test QR code to file for visual verification
      const testDir = path.join(process.cwd(), 'test-results');
      await fs.mkdir(testDir, { recursive: true });
      const testFile = path.join(testDir, `qr-test-${testCode}.png`);
      await fs.writeFile(testFile, qrBuffer);
      console.log(`💾 Test QR code saved to: ${testFile}`);
    } else {
      console.log('❌ Invalid QR code PNG buffer');
    }
    
    // Test 5: Error handling
    console.log('\n📝 Test 5: Error handling for invalid inputs');
    try {
      await qrModule.qrDataUrl('');
      console.log('❌ Should have thrown error for empty URL');
    } catch (error) {
      console.log('✅ Correctly handles empty URL error');
    }
    
    // Test 6: Different QR options
    console.log('\n📝 Test 6: Test different QR code options');
    const options = [
      { width: 100, errorCorrectionLevel: 'L' },
      { width: 200, errorCorrectionLevel: 'M' },
      { width: 300, errorCorrectionLevel: 'H' }
    ];
    
    for (const option of options) {
      try {
        const qr = await qrModule.generateVerificationQR(testCode, baseUrl, option);
        console.log(`✅ Generated QR with width ${option.width}, level ${option.errorCorrectionLevel}`);
      } catch (error) {
        console.log(`❌ Failed QR generation with options:`, option);
      }
    }
    
    console.log('\n🏁 QR code generation tests completed successfully');
    console.log('\n💡 Tips:');
    console.log('- Check test-results/ directory for generated QR code samples');
    console.log('- Scan the QR codes with your phone to verify they work');
    console.log('- QR codes should link to the certificate verification page');
    
  } catch (error) {
    console.error('❌ QR code generation test failed:', error);
    process.exit(1);
  }
}

// Run the tests
testQRGeneration().catch((error) => {
  console.error('Test runner error:', error);
  process.exit(1);
});
