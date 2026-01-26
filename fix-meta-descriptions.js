#!/usr/bin/env node

/**
 * Batch Fix Meta Descriptions for High-Priority FEE Pages
 * Adds metadata to pages identified in the audit as missing descriptions
 */

import fs from 'fs';
import path from 'path';

const FIXES = [
  // Location pages that need better meta descriptions
  {
    file: 'app/arizona/phoenix/page.tsx',
    metadata: {
      title: 'Phoenix, AZ Equipment Parts & Rentals | Flat Earth Equipment',
      description: 'Flat Earth Equipment serves Phoenix and the Valley of the Sun with fast-shipped industrial parts, equipment rentals, and OSHA training. Same-day quotes available.',
      canonical: '/arizona/phoenix'
    }
  },
  {
    file: 'app/colorado/denver/page.tsx',
    metadata: {
      title: 'Denver, CO Equipment Parts & Rentals | Flat Earth Equipment',
      description: 'Flat Earth Equipment serves Denver and the Front Range with precision-fit parts, equipment rentals, and expert service. Fast delivery throughout Colorado.',
      canonical: '/colorado/denver'
    }
  },
  {
    file: 'app/new-mexico/albuquerque/page.tsx',
    metadata: {
      title: 'Albuquerque, NM Equipment Parts & Rentals | Flat Earth Equipment', 
      description: 'Flat Earth Equipment serves Albuquerque and central New Mexico with fast-shipped industrial parts and rugged rental gear from our regional hubs.',
      canonical: '/new-mexico/albuquerque'
    }
  },
  {
    file: 'app/texas/dallas-fort-worth/page.tsx',
    metadata: {
      title: 'Dallas-Fort Worth Equipment Parts & Rentals | Flat Earth Equipment',
      description: 'Flat Earth Equipment serves the Dallas-Fort Worth Metroplex with precision-fit parts and rugged rental gear delivered fast from our regional network.',
      canonical: '/texas/dallas-fort-worth'
    }
  },
  {
    file: 'app/texas/houston/page.tsx',
    metadata: {
      title: 'Houston, TX Equipment Parts & Rentals | Flat Earth Equipment',
      description: 'Flat Earth Equipment serves Houston and the Gulf Coast with precision-fit parts and rugged rental gear. From the Energy Corridor to the Port of Houston.',
      canonical: '/texas/houston'
    }
  },
  {
    file: 'app/texas/el-paso/page.tsx',
    metadata: {
      title: 'El Paso, TX Equipment Parts & Rentals | Flat Earth Equipment',
      description: 'Flat Earth Equipment serves El Paso and West Texas with precision-fit parts delivered fast. Strategic position for Texas and Southern New Mexico.',
      canonical: '/texas/el-paso'
    }
  },
  // Specific parts pages
  {
    file: 'app/parts/attachments/page.tsx',
    metadata: {
      title: 'Forklift Attachments & Accessories | Flat Earth Equipment',
      description: 'Shop forklift attachments including forks, clamps, rotators, and specialty accessories. OEM-compatible attachments for all major forklift brands.',
      canonical: '/parts/attachments'
    }
  },
  {
    file: 'app/parts/battery-charger-modules/page.tsx',
    metadata: {
      title: 'Battery Charger Modules & Components | Flat Earth Equipment',
      description: 'Shop battery charger modules, control boards, and replacement components for industrial battery chargers. Fast shipping on all charger parts.',
      canonical: '/parts/battery-charger-modules'
    }
  },
  // Legal pages
  {
    file: 'app/(legal)/privacy/page.tsx',
    metadata: {
      title: 'Privacy Policy | Flat Earth Equipment',
      description: 'Flat Earth Equipment privacy policy covering data collection, use, and protection for our website visitors and customers.',
      canonical: '/privacy-policy'
    }
  },
  {
    file: 'app/(legal)/terms/page.tsx',
    metadata: {
      title: 'Terms of Service | Flat Earth Equipment',
      description: 'Terms of service for Flat Earth Equipment covering website use, purchases, training courses, and customer agreements.',
      canonical: '/terms-of-service'
    }
  },
  {
    file: 'app/(legal)/refund/page.tsx',
    metadata: {
      title: 'Refund Policy | Flat Earth Equipment',
      description: 'Flat Earth Equipment refund and return policy for parts, training courses, and services. Learn about our satisfaction guarantee.',
      canonical: '/refund-policy'
    }
  }
];

function addMetadataToFile(filePath, metadata) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  
  // Check if metadata already exists
  if (content.includes('export const metadata') || content.includes('export async function generateMetadata')) {
    console.log(`✅ Metadata already exists: ${filePath}`);
    return false;
  }
  
  // Add imports if needed
  let newContent = content;
  if (!content.includes('import { Metadata }')) {
    if (content.includes('import')) {
      // Find the first import line and add Metadata import
      newContent = newContent.replace(
        /(import [^;]+;)/,
        `$1\nimport { Metadata } from 'next';`
      );
    } else {
      // No imports, add at the top
      newContent = `import { Metadata } from 'next';\n\n${newContent}`;
    }
  }
  
  // Create the metadata export
  const metadataExport = `
export const metadata: Metadata = {
  title: '${metadata.title}',
  description: '${metadata.description}',
  alternates: {
    canonical: '${metadata.canonical}',
  },
  robots: {
    index: true,
    follow: true,
  }
};

`;
  
  // Find a good place to insert the metadata (after imports, before components)
  if (newContent.includes('export default')) {
    // Insert before the default export
    newContent = newContent.replace(/export default/, `${metadataExport}export default`);
  } else {
    // Append at the end
    newContent = newContent + metadataExport;
  }
  
  // Write the updated content
  fs.writeFileSync(fullPath, newContent);
  console.log(`✅ Added metadata to: ${filePath}`);
  return true;
}

function runBatchFix() {
  console.log('🚀 Starting batch meta description fixes...\n');
  
  let fixed = 0;
  let skipped = 0;
  
  for (const fix of FIXES) {
    const result = addMetadataToFile(fix.file, fix.metadata);
    if (result) {
      fixed++;
    } else {
      skipped++;
    }
  }
  
  console.log(`\n📊 BATCH FIX COMPLETE`);
  console.log(`✅ Fixed: ${fixed} pages`);
  console.log(`⏭️  Skipped: ${skipped} pages (already had metadata)`);
  
  if (fixed > 0) {
    console.log('\n💡 NEXT STEPS:');
    console.log('1. Test the pages to ensure metadata displays correctly');
    console.log('2. Run the meta audit again to check progress');
    console.log('3. Deploy to production to see SEO improvements');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runBatchFix();
}

export { runBatchFix, addMetadataToFile };