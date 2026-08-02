import { NextResponse } from 'next/server';

/**
 * Outrank webhook permanently disabled after unauthorized publish/path-traversal probes
 * (2026-08-01). Do not re-enable without signature enforcement, slug allowlisting, and
 * content sanitization. Rotate OUTRANK_WEBHOOK_TOKEN and GITHUB_TOKEN if still present.
 */
export async function POST() {
  return NextResponse.json(
    { error: 'Gone', message: 'Outrank webhook disabled' },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json(
    { error: 'Gone', message: 'Outrank webhook disabled' },
    { status: 410 }
  );
}