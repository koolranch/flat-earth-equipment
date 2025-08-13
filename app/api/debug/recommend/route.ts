import { NextRequest, NextResponse } from 'next/server';
import { ampsFrom } from '@/lib/recsUtil';

export async function GET(req: NextRequest){
  try{
    const url = new URL(req.url);
    const voltage = url.searchParams.get('voltage');
    const speed = (url.searchParams.get('speed') as 'overnight'|'fast'|null) || 'overnight';
    const phase = (url.searchParams.get('phase') as '1P'|'3P'|null) || null;
    const vNum = voltage ? Number(voltage) : null;
    const amps = ampsFrom(vNum, speed||'overnight');

    const body = { voltage: vNum, amps, phase, limit: 12 };
    const res = await fetch(url.origin + '/api/recommend-chargers', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
    const json = await res.json();

    const items = json?.items || [];
    const best = items.filter((i: any) => i.matchType === 'best');
    const alt  = items.filter((i: any) => i.matchType !== 'best');

    const summary = {
      request: { voltage: vNum, speed, phase, amps },
      counts: { total: items.length, best: best.length, alternate: alt.length },
      bestSlugs: best.map((i: any) => i.slug).slice(0,6),
      altSlugs: alt.map((i: any) => i.slug).slice(0,6)
    };

    return NextResponse.json({ ok:true, summary, raw: json });
  }catch(e:any){
    return NextResponse.json({ ok:false, error: e?.message || 'debug error' }, { status: 500 });
  }
}
