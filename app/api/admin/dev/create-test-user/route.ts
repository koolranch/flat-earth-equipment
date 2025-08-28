export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  createOrGetUserByEmail, 
  ensureOrgMembership, 
  ensureEnrollment, 
  createMagicLink,
  validateOrg,
  validateCourse
} from '@/lib/admin/test-accounts.server';

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(6).optional(),
  orgId: z.string().uuid().optional(),
  courseId: z.string().uuid().optional(),
  role: z.enum(['owner', 'trainer', 'learner']).optional(),
  redirectTo: z.string().url().optional()
});

function isValidAdminToken(req: Request) {
  const hdr = (req.headers.get('x-admin-token') || '').trim();
  const env = process.env.ADMIN_EXPORT_TOKEN || '';
  
  if (!hdr || !env) {
    console.log('[CREATE-TEST-USER] Missing admin token or env var');
    return false;
  }
  
  // Simple compare; can replace with timingSafeEqual later
  const isValid = hdr === env;
  
  if (!isValid) {
    console.log('[CREATE-TEST-USER] Invalid admin token provided');
  }
  
  return isValid;
}

export async function POST(req: Request) {
  const startTime = Date.now();
  
  try {
    // Validate admin token
    if (!isValidAdminToken(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await req.json();
    const b = Body.parse(body);
    
    console.log(`[CREATE-TEST-USER] Creating test user: ${b.email}`);
    
    // Validate org and course if provided
    let orgInfo = null;
    let courseInfo = null;
    
    if (b.orgId) {
      orgInfo = await validateOrg(b.orgId);
      console.log(`[CREATE-TEST-USER] Validated org: ${orgInfo.name}`);
    }
    
    if (b.courseId) {
      courseInfo = await validateCourse(b.courseId);
      console.log(`[CREATE-TEST-USER] Validated course: ${courseInfo.title}`);
    }

    // Create or get user
    const user = await createOrGetUserByEmail(b.email, b.password);

    let enrollmentId: string | null = null;
    
    // Handle org membership and enrollment
    if (b.orgId) {
      await ensureOrgMembership(b.orgId, user.id, b.role || 'learner');
      
      if (b.courseId) {
        enrollmentId = await ensureEnrollment(b.orgId, user.id, b.courseId, b.email);
      }
    }

    // Generate magic login link
    const magicLink = await createMagicLink(b.email, b.redirectTo);

    const duration = Date.now() - startTime;
    console.log(`[CREATE-TEST-USER] Successfully created test user ${b.email} in ${duration}ms`);

    return NextResponse.json({
      ok: true,
      userId: user.id,
      email: user.email,
      enrollmentId,
      magicLink,
      orgInfo: orgInfo ? { id: orgInfo.id, name: orgInfo.name } : null,
      courseInfo: courseInfo ? { id: courseInfo.id, title: courseInfo.title } : null,
      role: b.orgId ? (b.role || 'learner') : null,
      duration: `${duration}ms`
    }, { status: 201 });
    
  } catch (e: any) {
    const duration = Date.now() - startTime;
    console.error(`[CREATE-TEST-USER] Failed after ${duration}ms:`, e.message);
    
    return NextResponse.json({ 
      error: e.message || 'create-test-user failed',
      duration: `${duration}ms`
    }, { status: 400 });
  }
}

// Optional: Add GET method for health check
export async function GET(req: Request) {
  if (!isValidAdminToken(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  return NextResponse.json({
    ok: true,
    service: 'create-test-user',
    timestamp: new Date().toISOString(),
    env: {
      hasAdminToken: !!process.env.ADMIN_EXPORT_TOKEN,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
  });
}
