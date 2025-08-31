import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'node:fs/promises';
import path from 'node:path';

export const runtime = 'nodejs'; 
export const dynamic = 'force-dynamic';

function pick<T>(arr: T[], n: number) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { 
    const j = Math.floor(Math.random() * (i + 1)); 
    [a[i], a[j]] = [a[j], a[i]]; 
  }
  return a.slice(0, Math.min(n, a.length));
}

export async function GET() {
  const locCookie = cookies().get('locale')?.value || process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en';
  const loc = ['en','es'].includes(locCookie) ? locCookie : 'en';
  const base = path.join(process.cwd(), 'content', 'exam');
  const file = path.join(base, `final.${loc}.json`);
  
  let bank: any; 
  try { 
    bank = JSON.parse(await fs.readFile(file, 'utf8')); 
  } catch { 
    bank = JSON.parse(await fs.readFile(path.join(base, 'final.en.json'), 'utf8')); 
  }
  
  const num = bank.num_items || 20;
  const chosen = pick(bank.bank, num);
  const safeItems = chosen.map((it: any) => ({ 
    id: it.id, 
    type: it.type, 
    prompt: it.prompt, 
    options: it.options, 
    unit: it.unit 
  }));
  const exam_id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  
  return NextResponse.json({ 
    ok: true, 
    locale: loc, 
    exam_id, 
    pass_pct: bank.pass_pct || 80, 
    items: safeItems, 
    selected_ids: chosen.map((x: any) => x.id) 
  });
}
