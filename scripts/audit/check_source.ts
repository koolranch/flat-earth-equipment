/* Hit health + a couple of POST cases against your live site. */
const CHECK_SOURCE_BASE = process.env.BASE_URL || 'http://localhost:3000';

async function main() {
  const h = await fetch(`${CHECK_SOURCE_BASE}/api/recommend-chargers/health`).then(r => r.json());
  console.log('Health:', h);
  
  async function post(body: any) {
    const r = await fetch(`${CHECK_SOURCE_BASE}/api/recommend-chargers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const j = await r.json();
    const items = j?.items || [];
    const best = items.filter((i: any) => i.matchType === 'best');
    console.log('Req:', body, '→ total:', items.length, 'best:', best.length, 'first:', items[0]?.slug);
  }
  
  await post({ voltage: 36, amps: 75, phase: '1P', limit: 12 });
  await post({ voltage: 48, amps: 75, phase: '1P', limit: 12 });
  await post({ voltage: 80, amps: 100, phase: '3P', limit: 12 });
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
