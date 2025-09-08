import 'server-only';
import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { supabaseService } from '@/lib/supabase/service.server';

// Helper to build a simple random id
function rid(len = 6) {
  return randomBytes(Math.ceil(len/2)).toString('hex').slice(0, len);
}

export async function POST(req: Request) {
  try {
    const tokenHeader = req.headers.get('x-qa-token') || '';
    const url = new URL(req.url);

    // Also allow token via query (?token=...)
    const tokenQuery = url.searchParams.get('token') || '';
    const provided = tokenHeader || tokenQuery;

    const secret = process.env.QA_USER_TOKEN || '';
    if (!secret || provided !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const course_slug = (body.course_slug || 'forklift') as string;
    const locale = (body.locale || process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en') as string;
    const emailDomain = (body.email_domain || 'example.test') as string; // you can override when calling

    const supabase = supabaseService();

    // Build a unique QA email
    const tag = body.prefix || 'qa';
    const email = `${tag}+${Date.now()}-${rid(4)}@${emailDomain}`;
    const password = body.password || `${rid(8)}-${rid(8)}`;

    // Create user as confirmed so you can login immediately
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'learner',
        qa: true,
        course_slug,
        locale
      }
    });
    if (createErr || !created?.user) {
      return NextResponse.json({ error: createErr?.message || 'Create user failed' }, { status: 500 });
    }

    const userId = created.user.id;

    // Look up the course by slug to get course_id
    let courseId: string | null = null;
    try {
      const { data: course, error: courseErr } = await supabase
        .from('courses')
        .select('id')
        .eq('slug', course_slug)
        .single();
      
      if (course && !courseErr) {
        courseId = course.id;
      }
    } catch (e) {
      console.warn('Course lookup failed:', (e as Error).message);
    }

    // Create enrollment if we found the course
    if (courseId) {
      try {
        const { error: enrollErr } = await supabase
          .from('enrollments')
          .insert({ 
            user_id: userId, 
            course_id: courseId,
            progress_pct: 0,
            passed: false
          })
          .select()
          .single();
        if (enrollErr) {
          console.warn('Enrollment insert warning:', enrollErr.message);
        }
      } catch (e) {
        console.warn('Enrollment insert exception:', (e as Error).message);
      }
    }

    return NextResponse.json({
      ok: true,
      email,
      password,
      course_slug,
      locale
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  // Allow GET for quick manual tests (returns 405 to encourage POST usage unless token is correct)
  const url = new URL(req.url);
  const secret = process.env.QA_USER_TOKEN || '';
  const provided = url.searchParams.get('token') || '';
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: 'Use POST with x-qa-token or ?token=, or supply valid token' }, { status: 405 });
  }
  // Proxy to POST with defaults
  return POST(new Request(req.url, { method: 'POST', headers: req.headers, body: JSON.stringify({}) }));
}
