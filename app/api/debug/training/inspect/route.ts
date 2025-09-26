import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function slurp(p: string) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return ''; }
}

function countOccurrences(src: string, needle: string) {
  if (!src) return 0; const m = src.match(new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')); return m ? m.length : 0;
}

function fileExists(rel: string) {
  return fs.existsSync(path.join(process.cwd(), rel));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const courseSlug = url.searchParams.get('courseSlug') || 'forklift';

  // 1) Read key files for param usage and render logic
  const dashboardFile = ['app/training/page.tsx', 'app/training/page.jsx', 'app/training/page.ts'].find(fileExists) || '';
  const moduleFile   = ['app/training/module/[order]/page.tsx', 'app/training/modules/[slug]/page.tsx', 'app/training/module/[order]/page.jsx'].find(fileExists) || '';
  const routeIndex   = ['lib/training/routeIndex.ts', 'lib/training/routeIndex.tsx'].find(fileExists) || '';

  const dashboardSrc = dashboardFile ? slurp(dashboardFile) : '';
  const moduleSrc    = moduleFile ? slurp(moduleFile) : '';
  const routeSrc     = routeIndex ? slurp(routeIndex) : '';

  const usage = {
    files: { dashboardFile, moduleFile, routeIndex: routeIndex || null },
    dashboard: {
      reads_courseId: countOccurrences(dashboardSrc, "searchParams.get('courseId')") + countOccurrences(dashboardSrc, 'searchParams.get("courseId")'),
      reads_course:   countOccurrences(dashboardSrc, "searchParams.get('course')")   + countOccurrences(dashboardSrc, 'searchParams.get("course")'),
      writes_courseId: countOccurrences(dashboardSrc, '?courseId='),
      writes_course:   countOccurrences(dashboardSrc, '?course=')
    },
    modulePage: {
      reads_courseId: countOccurrences(moduleSrc, "searchParams.get('courseId')") + countOccurrences(moduleSrc, 'searchParams.get("courseId")'),
      reads_course:   countOccurrences(moduleSrc, "searchParams.get('course')")   + countOccurrences(moduleSrc, 'searchParams.get("course")'),
      importsTabbed:  countOccurrences(moduleSrc, 'TabbedModuleLayout'),
      shortCircuitsGame: countOccurrences(moduleSrc, 'mod.type') + countOccurrences(moduleSrc, "type === 'game'")
    },
    routeIndex: {
      contains_courseId: countOccurrences(routeSrc, 'courseId'),
      contains_course:   countOccurrences(routeSrc, 'course=')
    }
  } as const;

  // 2) Load modules from DB
  const supabase = createServerClient();
  const { data: courseRow } = await supabase
    .from('courses')
    .select('id, slug, title')
    .eq('slug', courseSlug)
    .maybeSingle();

  if (!courseRow) {
    return NextResponse.json({ ok: false, reason: 'course-not-found', courseSlug, usage }, { status: 404 });
  }

  const { data: mods, error: mErr } = await supabase
    .from('modules')
    .select('id, order, title, content_slug, type, quiz_json')
    .eq('course_id', courseRow.id)
    .order('order', { ascending: true });

  if (mErr) return NextResponse.json({ ok: false, reason: 'modules-query-failed', details: mErr.message, usage }, { status: 500 });

  // 3) Build hrefs both ways, and predict render mode
  const rows = (mods || []).map(m => {
    const hrefCourseId = `/training/module/${m.order}?courseId=${courseSlug}`;
    const hrefCourse   = `/training/module/${m.order}?course=${courseSlug}`;
    const expectedLayout = m.content_slug ? 'tabs' : (m.order === 1 ? 'intro' : 'complete');
    // If code has a game short-circuit AND content_slug exists, warn that tabs may be bypassed.
    const renderWarning = (expectedLayout === 'tabs' && usage.modulePage.shortCircuitsGame > 0 && usage.modulePage.importsTabbed > 0)
      ? 'module page appears to short-circuit on game type; tabs may be bypassed'
      : null;
    return {
      order: m.order,
      title: m.title,
      content_slug: m.content_slug,
      type: m.type || null,
      quiz_count: Array.isArray(m.quiz_json) ? m.quiz_json.length : null,
      href_courseId: hrefCourseId,
      href_course: hrefCourse,
      expected_layout: expectedLayout,
      render_warning: renderWarning
    };
  });

  // 4) Detect obvious param mismatch
  const likelyParam = (usage.dashboard.writes_courseId + usage.dashboard.reads_courseId + usage.modulePage.reads_courseId) >=
                      (usage.dashboard.writes_course + usage.dashboard.reads_course + usage.modulePage.reads_course)
                      ? 'courseId' : 'course';

  const mismatch = (likelyParam === 'courseId' && (usage.modulePage.reads_course > 0 || usage.dashboard.writes_course > 0))
                || (likelyParam === 'course' && (usage.modulePage.reads_courseId > 0 || usage.dashboard.writes_courseId > 0));

  // 5) Return comprehensive report
  return NextResponse.json({
    ok: true,
    course: { id: courseRow.id, slug: courseRow.slug, title: courseRow.title },
    usage,
    likelyParam,
    paramMismatchDetected: !!mismatch,
    modules: rows
  });
}
