import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(url, key, { auth: { persistSession: false } });

const brands = [
  { slug: 'bobcat', name: 'Bobcat' },
  { slug: 'case', name: 'Case' },
  { slug: 'new-holland', name: 'New Holland' },
  { slug: 'kubota', name: 'Kubota' },
  { slug: 'takeuchi', name: 'Takeuchi' }
];

const overrides: Record<string, { serial: string; fault: string; guide: string }> = {
  'bobcat': { 
    serial: '/parts/construction-equipment-parts/your-bobcat-serial-number-how-to-find-and-use-it', 
    fault: '/brand/bobcat/fault-codes', 
    guide: '/brand/bobcat/guide' 
  },
  'case': { 
    serial: '/case-serial-number-lookup', 
    fault: '/brand/case/fault-codes', 
    guide: '/brand/case/guide' 
  },
  'new-holland': { 
    serial: '/parts/construction-equipment-parts/new-holland-skid-steer-serial-number-lookup', 
    fault: '/brand/new-holland/fault-codes', 
    guide: '/brand/new-holland/guide' 
  },
  'kubota': { 
    serial: '/kubota-serial-number-lookup', 
    fault: '/brand/kubota/fault-codes', 
    guide: '/brand/kubota/guide' 
  },
  'takeuchi': { 
    serial: '/takeuchi-serial-number-lookup', 
    fault: '/brand/takeuchi/fault-codes', 
    guide: '/brand/takeuchi/guide' 
  }
};

async function main() {
  for (const b of brands) {
    await supabase.from('brands').upsert({ slug: b.slug, name: b.name }, { onConflict: 'slug' });
    
    const ov = overrides[b.slug];
    await supabase.from('brand_overrides').upsert({
      brand_slug: b.slug,
      serial_tool_url: ov.serial, 
      fault_codes_url: ov.fault, 
      guide_url: ov.guide,
      canonical_serial_url: ov.serial, 
      canonical_fault_url: ov.fault, 
      canonical_guide_url: ov.guide
    }, { onConflict: 'brand_slug' });
  }
  console.log('Brand records & overrides ensured for 5 construction brands');
}

main().catch(err => { 
  console.error(err); 
  process.exit(1); 
});
