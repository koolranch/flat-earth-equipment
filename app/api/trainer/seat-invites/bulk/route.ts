import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

export async function POST(req: Request) {
  const sb = supabaseServer();
  const svc = supabaseService();
  
  // Authentication check
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  
  // Role authorization check
  const { data: prof } = await sb.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (!prof || !['trainer', 'admin'].includes(prof.role)) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  // Parse and validate request body
  const body = await req.json();
  const course_id: string = body?.course_id;
  const emails: string[] = (body?.emails || [])
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean);
  const note: string | undefined = body?.note;
  
  if (!course_id || !emails.length) {
    return NextResponse.json({ 
      ok: false, 
      error: 'missing_course_or_emails' 
    }, { status: 400 });
  }

  // Validate course exists
  const { data: course } = await svc.from('courses').select('id, title').eq('id', course_id).maybeSingle();
  if (!course) {
    return NextResponse.json({ 
      ok: false, 
      error: 'course_not_found' 
    }, { status: 404 });
  }

  // Filter valid emails and prepare invite rows
  const validEmails = emails.filter(isEmail);
  const invalidEmails = emails.filter(email => !isEmail(email));
  
  if (validEmails.length === 0) {
    return NextResponse.json({ 
      ok: false, 
      error: 'no_valid_emails',
      invalid_emails: invalidEmails
    }, { status: 400 });
  }

  // Prepare rows for insertion
  const rows = validEmails.map(email => ({
    created_by: user.id,
    course_id,
    email,
    status: 'pending' as const,
    note: note || null,
    created_at: new Date().toISOString()
  }));

  try {
    // Use upsert to handle duplicates gracefully
    const { data, error } = await svc
      .from('seat_invites')
      .upsert(rows, { 
        onConflict: 'created_by,course_id,email',
        ignoreDuplicates: false 
      })
      .select('*');

    if (error) {
      console.error('Error creating seat invites:', error);
      return NextResponse.json({ 
        ok: false, 
        error: error.message 
      }, { status: 500 });
    }

    // Log audit trail
    try {
      await svc.from('audit_log').insert({
        actor_id: user.id,
        action: 'seat_invites_bulk_created',
        metadata: {
          course_id,
          course_title: course.title,
          email_count: validEmails.length,
          invalid_count: invalidEmails.length,
          note: note || null
        }
      });
    } catch (auditError) {
      console.error('Error logging bulk invite audit:', auditError);
      // Don't fail the request if audit logging fails
    }

    return NextResponse.json({
      ok: true,
      count: data?.length || 0,
      invites: data,
      course_title: course.title,
      valid_emails: validEmails,
      invalid_emails: invalidEmails,
      summary: {
        total_submitted: emails.length,
        valid_count: validEmails.length,
        invalid_count: invalidEmails.length,
        created_count: data?.length || 0
      }
    });

  } catch (error) {
    console.error('Unexpected error in bulk seat invites:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'internal_server_error' 
    }, { status: 500 });
  }
}
