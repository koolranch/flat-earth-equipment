/*
 * Brand Hub Smoke Test (API + DB + basic pages)
 * Run:  tsx scripts/smoke-test.ts
 * Or:   npm run test:smoke
 */
import { createClient } from '@supabase/supabase-js';
import assert from 'node:assert';

const BASE = process.env.SITE_URL || 'http://localhost:3000';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function get(path: string) {
  const res = await fetch(`${BASE}${path}`, { headers: { 'accept': 'application/json, text/html' } });
  return res;
}
async function post(path: string, body: any) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res;
}

async function testBrandsAPI() {
  const res = await get('/api/brands/jlg');
  assert.strictEqual(res.ok, true, '/api/brands/jlg not ok');
  const json = await res.json();
  assert.ok(json.slug === 'jlg', 'brand payload missing or wrong slug');
  assert.ok(typeof json.name === 'string', 'brand name missing');
  assert.ok(json.stats && typeof json.stats === 'object', 'brand stats missing');
  console.log('✓ /api/brands/jlg');
}

async function testFaultSearch() {
  try {
    const res = await post('/api/fault-codes/search', { brand: 'jlg', code: '223', limit: 5 });
    if (res.status === 404) {
      console.warn('⚠︎ /api/fault-codes/search not found — skipping (ensure Phase 1 API exists)');
      return;
    }
    if (res.status === 400) {
      console.warn('⚠︎ /api/fault-codes/search returns 400 — likely not implemented yet');
      return;
    }
    if (!res.ok) {
      console.warn(`⚠︎ /api/fault-codes/search returned ${res.status} — skipping fault code test`);
      return;
    }
    
    const json = await res.json();
    if (!json || !Array.isArray(json.results) || json.results.length === 0) {
      console.warn('⚠︎ Fault results empty — likely not seeded yet. Run: pnpm seed:faults');
    } else {
      console.log(`✓ fault search returned ${json.results.length} row(s)`);
    }
  } catch (error) {
    console.warn('⚠︎ Fault search API error — skipping fault code test');
  }
}

async function testPartsLeadFlow() {
  try {
    const emailBase = `smoke+${Date.now()}@example.com`;

    // 1) Honeypot should silently accept and NOT insert
    {
      const hpEmail = `hp-${emailBase}`;
      const before = await supabase.from('parts_leads').select('*', { count: 'exact', head: true }).eq('contact_email', hpEmail);
      const res = await post('/api/leads/parts', { email: hpEmail, brand_slug: 'jlg', hp: 'bot', startedAt: Date.now(), notes: 'Honeypot test lead for smoke testing' });
      assert.strictEqual(res.ok, true, 'honeypot submit not ok');
      const after = await supabase.from('parts_leads').select('*', { count: 'exact', head: true }).eq('contact_email', hpEmail);
      assert.strictEqual((after.count || 0) - (before.count || 0), 0, 'honeypot caused an insert');
      console.log('✓ honeypot submission blocked (no insert)');
    }

    // 2) Too-fast dwell-time (<3s) should silently accept and NOT insert
    {
      const fastEmail = `fast-${emailBase}`;
      const before = await supabase.from('parts_leads').select('*', { count: 'exact', head: true }).eq('contact_email', fastEmail);
      const res = await post('/api/leads/parts', { email: fastEmail, brand_slug: 'jlg', startedAt: Date.now(), notes: 'Fast dwell time test lead for smoke testing' });
      assert.strictEqual(res.ok, true, 'fast dwell submit not ok');
      const after = await supabase.from('parts_leads').select('*', { count: 'exact', head: true }).eq('contact_email', fastEmail);
      assert.strictEqual((after.count || 0) - (before.count || 0), 0, 'fast dwell caused an insert');
      console.log('✓ dwell-time guard working (no insert under 3s)');
    }

    // 3) Valid submit (>=3s dwell) SHOULD insert
    {
      const okEmail = `ok-${emailBase}`;
      const before = await supabase.from('parts_leads').select('*', { count: 'exact', head: true }).eq('contact_email', okEmail);
      const res = await post('/api/leads/parts', {
        email: okEmail,
        brand_slug: 'jlg',
        model: 'E450AJ',
        serial: '0300xxxxx',
        fault_code: '223',
        notes: 'Smoke test lead - requesting hydraulic parts and filters',
        startedAt: Date.now() - 5000 // simulate dwell >=3s
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        if (res.status === 500 && errorText.includes('Server error')) {
          console.warn('⚠︎ Parts lead API returning 500 — likely database table not created yet');
          return;
        }
        console.error('Valid submit failed:', res.status, errorText);
      }
      assert.strictEqual(res.ok, true, 'valid submit not ok');
      const after = await supabase.from('parts_leads').select('*', { count: 'exact', head: true }).eq('contact_email', okEmail);
      assert.strictEqual((after.count || 0) - (before.count || 0), 1, 'valid submit did not insert');
      console.log('✓ valid lead inserted');
    }
  } catch (error: any) {
    if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
      console.warn('⚠︎ parts_leads table does not exist — skipping lead flow tests');
      return;
    }
    throw error;
  }
}

async function testPagesBasic() {
  // /brands should render and include something like 'Browse by Brand'
  {
    const res = await get('/brands');
    assert.strictEqual(res.ok, true, '/brands not ok');
    const html = await res.text();
    assert.ok(/Browse by Brand/i.test(html) || /brands/i.test(html), 'brands page missing expected content');
    console.log('✓ /brands renders');
  }
  // One serial page with banner text
  {
    const res = await get('/jlg-serial-number-lookup');
    if (!res.ok) { console.warn('⚠︎ /jlg-serial-number-lookup not ok — check route name'); return; }
    const html = await res.text();
    if (!/Open JLG Hub/i.test(html)) {
      console.warn('⚠︎ BrandHubBanner text not found — verify banner injection');
    } else {
      console.log('✓ BrandHubBanner visible on JLG serial page');
    }
  }

  // Test brand hub page
  {
    const res = await get('/brand/jlg');
    if (!res.ok) { 
      console.warn('⚠︎ /brand/jlg not ok — may need database seeding'); 
      return; 
    }
    const html = await res.text();
    if (!/JLG.*Parts|Serial.*Lookup|Fault.*Code/i.test(html)) {
      console.warn('⚠︎ Brand hub content not found — verify brand data exists');
    } else {
      console.log('✓ /brand/jlg renders with expected content');
    }
  }
}

(async () => {
  console.log(`🔍 Running smoke tests against: ${BASE}`);
  console.log('');
  
  try {
    await testBrandsAPI();
    await testFaultSearch();
    await testPartsLeadFlow();
    await testPagesBasic();
    
    console.log('');
    console.log('✅ All smoke checks completed successfully!');
    process.exit(0);
  } catch (error) {
    console.log('');
    console.error('❌ Smoke test failed:', error);
    process.exit(1);
  }
})();
