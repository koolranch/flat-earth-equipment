#!/usr/bin/env node

/**
 * Simple test script to verify the CSV export endpoint responds correctly
 * Usage: node scripts/test-csv-endpoint.mjs [course_id]
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const COURSE_ID = process.argv[2] || process.env.E2E_COURSE_ID;

async function testCSVEndpoint() {
  console.log('🧪 Testing CSV Export Endpoint...');
  console.log(`📍 Base URL: ${BASE_URL}`);
  
  if (!COURSE_ID) {
    console.log('⚠️  No course ID provided - testing error handling');
    
    try {
      const response = await fetch(`${BASE_URL}/api/trainer/export.csv`);
      console.log(`📊 Status: ${response.status}`);
      console.log(`📋 Headers:`, Object.fromEntries(response.headers.entries()));
      
      if (response.status >= 400) {
        console.log('✅ Correctly returns error status for missing course_id');
      } else {
        console.log('⚠️  Expected error status but got success');
      }
    } catch (error) {
      console.error('❌ Network error:', error.message);
    }
    
    return;
  }
  
  console.log(`🎯 Course ID: ${COURSE_ID}`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/trainer/export.csv?course_id=${COURSE_ID}`);
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📋 Headers:`, Object.fromEntries(response.headers.entries()));
    
    if (response.status === 200) {
      const contentType = response.headers.get('content-type');
      const contentDisposition = response.headers.get('content-disposition');
      
      console.log('✅ CSV endpoint responded successfully');
      
      if (contentType?.includes('csv')) {
        console.log('✅ Correct content-type header');
      } else {
        console.log('⚠️  Expected CSV content-type');
      }
      
      if (contentDisposition?.includes('attachment')) {
        console.log('✅ Correct content-disposition header');
      } else {
        console.log('⚠️  Expected attachment content-disposition');
      }
      
      const csvContent = await response.text();
      console.log(`📄 CSV length: ${csvContent.length} characters`);
      
      // Check for expected headers
      const expectedHeaders = ['name', 'email', 'progress_pct'];
      const hasHeaders = expectedHeaders.every(header => csvContent.includes(header));
      
      if (hasHeaders) {
        console.log('✅ CSV contains expected headers');
      } else {
        console.log('⚠️  CSV missing some expected headers');
      }
      
      // Show first few lines
      const lines = csvContent.split('\n').slice(0, 3);
      console.log('📋 First few lines:');
      lines.forEach((line, i) => {
        console.log(`  ${i + 1}: ${line}`);
      });
      
    } else if (response.status === 401 || response.status === 403) {
      console.log('🔒 Authentication required - this is expected for protected endpoints');
    } else {
      console.log(`⚠️  Unexpected status: ${response.status}`);
      const text = await response.text();
      console.log('Response:', text.substring(0, 200));
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

// Run the test
testCSVEndpoint();
