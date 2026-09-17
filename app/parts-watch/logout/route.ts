import { NextResponse, type NextRequest } from 'next/server';
import { lockPartsWatch, PARTS_WATCH_PATH } from '@/lib/internal/passwordGate';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  lockPartsWatch();
  return NextResponse.redirect(new URL(PARTS_WATCH_PATH, request.nextUrl.origin), {
    status: 303,
  });
}
