#!/usr/bin/env node

/**
 * Meta Description Audit for FEE
 * Scans all page.tsx files to identify missing metadata
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_DIR = path.join(__dirname, 'app');

/**
 * Recursively find all page.tsx files
 */
function findPageFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip certain directories
      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        continue;
      }
      findPageFiles(fullPath, files);
    } else if (entry.name === 'page.tsx') {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Analyze a page file for metadata
 */
function analyzePageFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(APP_DIR, filePath);
  const routePath = '/' + relativePath.replace('/page.tsx', '').replace(/\\/g, '/');
  
  // Clean up route path
  const cleanRoutePath = routePath === '/' ? '/' : routePath.replace(/\/$/, '');
  
  const analysis = {
    file: relativePath,
    route: cleanRoutePath,
    hasGenerateMetadata: false,
    hasExportedMetadata: false,
    isClientComponent: false,
    isRedirectOnly: false,
    hasDescription: false,
    priority: 'unknown',
    notes: []
  };
  
  // Check for "use client"
  if (content.includes('"use client"') || content.includes("'use client'")) {
    analysis.isClientComponent = true;
    analysis.notes.push('Client component');
  }
  
  // Check for redirect only
  if (content.includes('redirect(') && !content.includes('generateMetadata') && content.split('\n').length < 30) {
    analysis.isRedirectOnly = true;
    analysis.notes.push('Redirect only');
  }
  
  // Check for generateMetadata function
  if (content.includes('generateMetadata')) {
    analysis.hasGenerateMetadata = true;
    
    // Check if description is included
    if (content.includes('description:') || content.includes('description =')) {
      analysis.hasDescription = true;
    }
  }
  
  // Check for exported metadata object
  if (content.includes('export const metadata') || content.includes('export async function generateStaticParams')) {
    analysis.hasExportedMetadata = true;
  }
  
  // Determine priority based on route
  if (cleanRoutePath === '/' || 
      cleanRoutePath === '/about' || 
      cleanRoutePath === '/contact' || 
      cleanRoutePath === '/parts' ||
      cleanRoutePath === '/training' ||
      cleanRoutePath === '/osha-operator-training') {
    analysis.priority = 'critical';
  } else if (cleanRoutePath.startsWith('/brand/') ||
             cleanRoutePath.startsWith('/parts/') ||
             cleanRoutePath.startsWith('/locations/') ||
             cleanRoutePath.startsWith('/category/') ||
             cleanRoutePath.startsWith('/training/')) {
    analysis.priority = 'high';
  } else if (cleanRoutePath.startsWith('/admin/') ||
             cleanRoutePath.startsWith('/api/') ||
             cleanRoutePath.includes('/debug') ||
             cleanRoutePath.includes('/test-')) {
    analysis.priority = 'skip';
  } else {
    analysis.priority = 'medium';
  }
  
  return analysis;
}

/**
 * Generate audit report
 */
function generateAuditReport(results) {
  console.log('🔍 FEE META DESCRIPTION AUDIT REPORT');
  console.log('='.repeat(50));
  
  // Filter out skip priority and admin/api routes
  const publicPages = results.filter(r => r.priority !== 'skip' && !r.route.startsWith('/admin') && !r.route.startsWith('/api'));
  
  const stats = {
    total: publicPages.length,
    withMetadata: publicPages.filter(r => r.hasGenerateMetadata || r.hasExportedMetadata).length,
    withDescription: publicPages.filter(r => r.hasDescription).length,
    missingMetadata: publicPages.filter(r => !r.hasGenerateMetadata && !r.hasExportedMetadata && !r.isRedirectOnly && !r.isClientComponent).length,
    clientComponents: publicPages.filter(r => r.isClientComponent).length,
    redirectOnly: publicPages.filter(r => r.isRedirectOnly).length,
    needsAttention: []
  };
  
  // Find pages that need attention
  stats.needsAttention = publicPages.filter(r => {
    return (
      !r.isRedirectOnly && 
      !r.isClientComponent && 
      r.priority !== 'skip' &&
      (!r.hasGenerateMetadata || !r.hasDescription)
    );
  });
  
  console.log(`\n📊 SUMMARY`);
  console.log(`Total public pages: ${stats.total}`);
  console.log(`With metadata functions: ${stats.withMetadata}`);
  console.log(`With descriptions: ${stats.withDescription}`);
  console.log(`Missing metadata: ${stats.missingMetadata}`);
  console.log(`Client components: ${stats.clientComponents}`);
  console.log(`Redirect only: ${stats.redirectOnly}`);
  console.log(`Need attention: ${stats.needsAttention.length}`);
  
  // Group by priority
  const byPriority = {
    critical: [],
    high: [],
    medium: []
  };
  
  stats.needsAttention.forEach(page => {
    if (byPriority[page.priority]) {
      byPriority[page.priority].push(page);
    }
  });
  
  console.log(`\n🚨 CRITICAL PRIORITY (${byPriority.critical.length})`);
  byPriority.critical.forEach(page => {
    const status = page.hasGenerateMetadata ? (page.hasDescription ? '✅' : '⚠️ No description') : '❌ No metadata';
    console.log(`   ${status} ${page.route}`);
  });
  
  console.log(`\n🔶 HIGH PRIORITY (${byPriority.high.length})`);
  byPriority.high.slice(0, 10).forEach(page => {
    const status = page.hasGenerateMetadata ? (page.hasDescription ? '✅' : '⚠️ No description') : '❌ No metadata';
    console.log(`   ${status} ${page.route}`);
  });
  if (byPriority.high.length > 10) {
    console.log(`   ... and ${byPriority.high.length - 10} more high priority pages`);
  }
  
  console.log(`\n🔸 MEDIUM PRIORITY (${byPriority.medium.length})`);
  byPriority.medium.slice(0, 5).forEach(page => {
    const status = page.hasGenerateMetadata ? (page.hasDescription ? '✅' : '⚠️ No description') : '❌ No metadata';
    console.log(`   ${status} ${page.route}`);
  });
  if (byPriority.medium.length > 5) {
    console.log(`   ... and ${byPriority.medium.length - 5} more medium priority pages`);
  }
  
  console.log(`\n💡 RECOMMENDATIONS`);
  if (byPriority.critical.length > 0) {
    console.log(`🔴 IMMEDIATE: Fix ${byPriority.critical.length} critical pages missing meta descriptions`);
  }
  if (byPriority.high.length > 0) {
    console.log(`🟡 HIGH: Add metadata to ${byPriority.high.length} high-traffic pages`);
  }
  if (byPriority.medium.length > 0) {
    console.log(`🟢 MEDIUM: Consider adding metadata to ${byPriority.medium.length} remaining pages`);
  }
  
  // Save detailed results
  const reportPath = './meta-audit-results.json';
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    stats,
    needsAttention: stats.needsAttention,
    byPriority
  }, null, 2));
  
  console.log(`\n💾 Detailed results saved to: ${reportPath}`);
  
  return stats;
}

/**
 * Main audit function
 */
function runMetaAudit() {
  console.log('🚀 Starting FEE Meta Description Audit...\n');
  
  try {
    const pageFiles = findPageFiles(APP_DIR);
    console.log(`Found ${pageFiles.length} page.tsx files`);
    
    const results = pageFiles.map(analyzePageFile);
    const stats = generateAuditReport(results);
    
    console.log('\n✅ Meta audit completed!');
    
    return { results, stats };
    
  } catch (error) {
    console.error('❌ Audit failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMetaAudit();
}

export { runMetaAudit, analyzePageFile };