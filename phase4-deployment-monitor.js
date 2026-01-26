#!/usr/bin/env node

/**
 * PHASE 4 DEPLOYMENT MONITOR
 * 
 * Monitors the deployment status of Phase 4 SEO improvements
 * Tracks when new product pages go live with optimized meta descriptions
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Check deployment status by testing product pages
 */
async function checkDeploymentStatus() {
  console.log('🔍 PHASE 4 DEPLOYMENT STATUS CHECK\n');
  
  // Get sample of new products
  const { data: newProducts, error } = await supabase
    .from('parts_catalog')
    .select('slug, name, meta_description')
    .eq('category_type', 'charger')
    .like('name', '%GREEN%')
    .not('name', 'like', '%Single-Phase%')
    .not('name', 'like', '%Three-Phase%')
    .limit(5);
  
  if (error) {
    console.error('❌ Database error:', error);
    return;
  }
  
  console.log(`Testing ${newProducts.length} product pages for deployment:\n`);
  
  let liveCount = 0;
  let pendingCount = 0;
  
  for (const product of newProducts) {
    const url = `https://www.flatearthequipment.com/chargers/${product.slug}`;
    console.log(`🔗 ${product.name}`);
    console.log(`   URL: ${url}`);
    console.log(`   Expected meta: "${product.meta_description}"`);
    
    try {
      const response = await fetch(url);
      if (response.ok) {
        const html = await response.text();
        
        // Check if the actual product content is showing (not just fallback)
        const hasProductContent = html.includes(product.name) && 
                                 html.includes('FSIP') &&
                                 !html.includes('Skip to content');
        
        // Check for meta description in HTML
        const metaDescMatch = html.match(/<meta name="description" content="([^"]+)"/);
        const actualMeta = metaDescMatch ? metaDescMatch[1] : null;
        
        if (hasProductContent && actualMeta && actualMeta.includes('FSIP')) {
          console.log(`   ✅ LIVE - Product page deployed with optimized meta`);
          console.log(`   📝 Live meta: "${actualMeta.substring(0, 80)}..."`);
          liveCount++;
        } else {
          console.log(`   ⏳ PENDING - Page exists but showing fallback content`);
          pendingCount++;
        }
      } else {
        console.log(`   ❌ ERROR - HTTP ${response.status}`);
        pendingCount++;
      }
    } catch (err) {
      console.log(`   ❌ ERROR - ${err.message}`);
      pendingCount++;
    }
    console.log('');
  }
  
  console.log('📊 DEPLOYMENT STATUS SUMMARY:');
  console.log(`✅ Live pages: ${liveCount}`);
  console.log(`⏳ Pending deployment: ${pendingCount}`);
  console.log(`📦 Total new pages: ${newProducts.length}`);
  
  const deploymentComplete = liveCount === newProducts.length;
  
  if (deploymentComplete) {
    console.log('\n🎉 PHASE 4 DEPLOYMENT COMPLETE!');
    console.log('All product pages are live with optimized meta descriptions');
    console.log('\n📈 MONITORING RECOMMENDATIONS:');
    console.log('1. Submit updated sitemap to Google Search Console');
    console.log('2. Monitor search rankings for new keywords');
    console.log('3. Track CTR improvements in 2-4 weeks');
    console.log('4. Set up alerts for indexing status');
  } else {
    console.log('\n⏳ DEPLOYMENT IN PROGRESS');
    console.log('Some pages are still showing fallback content');
    console.log('This is normal for Next.js deployments');
    console.log('\n⚠️  NEXT STEPS:');
    console.log('1. Wait for Vercel deployment to complete');
    console.log('2. Check again in 5-10 minutes');
    console.log('3. Clear any CDN caches if needed');
    console.log('4. Run this monitor again to verify');
  }
  
  return deploymentComplete;
}

/**
 * Monitor Vercel deployment status
 */
async function checkVercelDeployment() {
  console.log('\n🚀 CHECKING VERCEL DEPLOYMENT STATUS...\n');
  
  const vercelApiToken = process.env.VERCEL_API_TOKEN || '7KdveSaSDoiUQJ7hiwoi6Osr';
  
  if (!vercelApiToken) {
    console.log('⚠️  VERCEL_API_TOKEN not found - cannot check deployment status');
    return;
  }
  
  try {
    const response = await fetch('https://api.vercel.com/v6/deployments?limit=3', {
      headers: {
        'Authorization': `Bearer ${vercelApiToken}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const latestDeployment = data.deployments[0];
      
      console.log('📦 LATEST DEPLOYMENT:');
      console.log(`   Status: ${latestDeployment.state}`);
      console.log(`   Created: ${new Date(latestDeployment.createdAt).toLocaleString()}`);
      console.log(`   URL: ${latestDeployment.url}`);
      
      if (latestDeployment.state === 'READY') {
        console.log('   ✅ Deployment is complete and ready');
      } else {
        console.log(`   ⏳ Deployment is still ${latestDeployment.state.toLowerCase()}`);
      }
    } else {
      console.log('❌ Unable to fetch Vercel deployment status');
    }
  } catch (error) {
    console.log('❌ Error checking Vercel deployment:', error.message);
  }
}

/**
 * Main monitoring function
 */
async function runDeploymentMonitor() {
  await checkVercelDeployment();
  await checkDeploymentStatus();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDeploymentMonitor()
    .then(() => {
      console.log('\n✅ Monitoring complete');
    })
    .catch(error => {
      console.error('❌ Monitoring failed:', error);
    });
}

export { runDeploymentMonitor, checkDeploymentStatus };