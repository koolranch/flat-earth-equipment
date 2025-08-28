import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { locale } = await req.json().catch(() => ({ locale: 'en' }));
  const val = ['en', 'es'].includes(locale) ? locale : 'en';
  cookies().set('locale', val, { path: '/', maxAge: 60 * 60 * 24 * 180 });
  return NextResponse.json({ ok: true, locale: val });
}
