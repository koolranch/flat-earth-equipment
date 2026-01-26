#!/usr/bin/env node

/**
 * Phase 4 SEO Audit: Charger Product Meta Descriptions
 * Identifies all charger products missing meta descriptions
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function auditChargerMetaDescriptions() {
  console.log('🔍 PHASE 4 AUDIT: CHARGER PRODUCT META DESCRIPTIONS\n');
  
  try {
    const { data: chargers, error } = await supabase
      .from('parts_catalog')
      .select('id, slug, name, meta_description, seo_title_template, specs, fsip_price, in_stock')
      .eq('category_type', 'charger')
      .order('name');
    
    if (error) {
      console.error('❌ Database error:', error);
      return;
    }
    
    // Analysis
    const total = chargers.length;
    const withMeta = chargers.filter(c => c.meta_description && c.meta_description.trim().length > 0);
    const withoutMeta = chargers.filter(c => !c.meta_description || c.meta_description.trim().length === 0);
    
    // Categorize missing ones
    const green2Series = withoutMeta.filter(c => c.name.includes('Green2'));
    const green4Series = withoutMeta.filter(c => c.name.includes('Green4'));
    const green6Series = withoutMeta.filter(c => c.name.includes('Green6'));
    const green8Series = withoutMeta.filter(c => c.name.includes('Green8'));
    const greenXSeries = withoutMeta.filter(c => c.name.includes('GreenX'));
    const otherSeries = withoutMeta.filter(c => 
      !c.name.includes('Green2') && 
      !c.name.includes('Green4') && 
      !c.name.includes('Green6') && 
      !c.name.includes('Green8') && 
      !c.name.includes('GreenX')
    );
    
    console.log('📊 PHASE 4 AUDIT RESULTS:');
    console.log(`Total charger products: ${total}`);
    console.log(`✅ With meta descriptions: ${withMeta.length}`);
    console.log(`❌ Missing meta descriptions: ${withoutMeta.length}`);
    console.log('');
    
    console.log('📋 BREAKDOWN BY SERIES:');
    console.log(`  Green2 Series: ${green2Series.length} missing`);
    console.log(`  Green4 Series: ${green4Series.length} missing`);
    console.log(`  Green6 Series: ${green6Series.length} missing`);
    console.log(`  Green8 Series: ${green8Series.length} missing`);
    console.log(`  GreenX Series: ${greenXSeries.length} missing`);
    console.log(`  Other Series: ${otherSeries.length} missing`);
    console.log('');
    
    // High-priority products (with pricing or stock)
    const highPriority = withoutMeta.filter(c => 
      (c.fsip_price && c.fsip_price > 0) || c.in_stock === true
    );
    
    console.log(`🚨 HIGH-PRIORITY (With Pricing/Stock): ${highPriority.length}`);
    highPriority.forEach(p => {
      console.log(`  - ${p.name} (Price: $${p.fsip_price || 'N/A'}, Stock: ${p.in_stock ? 'Yes' : 'No'})`);
    });
    console.log('');
    
    // Export detailed list for Phase 4 processing
    const auditData = {
      timestamp: new Date().toISOString(),
      total: total,
      withMeta: withMeta.length,
      withoutMeta: withoutMeta.length,
      breakdown: {
        green2: green2Series.length,
        green4: green4Series.length,
        green6: green6Series.length,
        green8: green8Series.length,
        greenX: greenXSeries.length,
        other: otherSeries.length
      },
      highPriority: highPriority.length,
      productsNeedingMeta: withoutMeta.map(p => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        series: getSeriesType(p.name),
        hasPrice: !!(p.fsip_price && p.fsip_price > 0),
        inStock: p.in_stock === true,
        priority: getPriority(p)
      }))
    };
    
    // Write audit data to file
    fs.writeFileSync(
      'phase4-charger-audit.json', 
      JSON.stringify(auditData, null, 2)
    );
    
    console.log('📄 Audit data saved to: phase4-charger-audit.json');
    console.log('');
    console.log('🚀 READY FOR PHASE 4 IMPLEMENTATION');
    console.log('Next steps: Run the batch optimization script');
    
  } catch (error) {
    console.error('❌ Audit failed:', error);
  }
}

function getSeriesType(name) {
  if (name.includes('Green2')) return 'Green2';
  if (name.includes('Green4')) return 'Green4';
  if (name.includes('Green6')) return 'Green6';
  if (name.includes('Green8')) return 'Green8';
  if (name.includes('GreenX')) return 'GreenX';
  return 'Other';
}

function getPriority(product) {
  const hasPrice = product.fsip_price && product.fsip_price > 0;
  const inStock = product.in_stock === true;
  
  if (hasPrice && inStock) return 'critical';
  if (hasPrice || inStock) return 'high';
  return 'medium';
}

// Run the audit
auditChargerMetaDescriptions();