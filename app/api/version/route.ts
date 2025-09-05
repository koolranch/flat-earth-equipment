import { NextResponse } from 'next/server';
export const runtime = 'edge';
export function GET(){
  const sha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_SHA || 'dev';
  const branch = process.env.VERCEL_GIT_COMMIT_REF || process.env.GIT_BRANCH || '';
  const built_at = process.env.VERCEL_BUILD_OUTPUT_TIMESTAMP || new Date().toISOString();
  return NextResponse.json({ ok:true, sha, branch, built_at }, { headers: { 'Cache-Control':'public, max-age=60' } });
}
