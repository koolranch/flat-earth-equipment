import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { locale } = await req.json().catch(() => ({}));
  
  if (!['en', 'es'].includes(locale)) {
    return NextResponse.json({ ok: false, error: 'Invalid locale' }, { status: 400 });
  }
  
  const res = NextResponse.json({ ok: true, locale });
  
  // Set cookie with 1 year expiration
  res.cookies.set('locale', locale, {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    secure: process.env.NODE_ENV === 'production'
  });
  
  return res;
}
