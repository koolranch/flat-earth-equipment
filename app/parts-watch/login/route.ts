import { NextResponse, type NextRequest } from 'next/server';
import { PARTS_WATCH_PATH, unlockPartsWatch } from '@/lib/internal/passwordGate';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const submitted = String(form.get('password') ?? '');
  const ok = submitted.length > 0 && unlockPartsWatch(submitted);

  const target = new URL(PARTS_WATCH_PATH, request.nextUrl.origin);
  if (!ok) target.searchParams.set('e', '1');
  return NextResponse.redirect(target, { status: 303 });
}
