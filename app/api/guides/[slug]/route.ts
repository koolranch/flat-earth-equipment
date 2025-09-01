import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'node:fs/promises';
import path from 'node:path';

export const runtime = 'nodejs';
export const revalidate = 3600;

export async function GET(_: Request, { params }: { params: { slug: string } }){
  const cookieLoc = cookies().get('locale')?.value || process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en';
  const loc = ['en','es'].includes(cookieLoc) ? cookieLoc : 'en';
  const base = path.join(process.cwd(), 'content', 'guides');
  
  const tryFile = async (f: string) => fs.readFile(path.join(base, f), 'utf8').then(JSON.parse);
  
  try {
    // Try localized version first, fallback to English
    const data = await tryFile(`${params.slug}.${loc}.json`).catch(() => tryFile(`${params.slug}.en.json`));
    return NextResponse.json({ ok: true, locale: loc, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 404 });
  }
}
