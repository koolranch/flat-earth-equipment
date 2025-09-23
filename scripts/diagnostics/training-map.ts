/*
 * Usage: npx ts-node scripts/diagnostics/training-map.ts forklift
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import fs from 'node:fs';
import path from 'node:path';
import { createAdminClient } from '../../lib/supabase/admin.js';

async function main() {
  const slug = (process.argv[2] || 'forklift').trim();
  const supabase = createAdminClient();

  const { data: course } = await supabase
    .from('courses')
    .select('id, slug, title')
    .eq('slug', slug)
    .maybeSingle();
  if (!course) throw new Error(`Course not found for slug: ${slug}`);

  const { data: modules } = await supabase
    .from('modules')
    .select('id, order, title, content_slug')
    .eq('course_id', course.id)
    .order('order', { ascending: true });

  const rows = (modules || []).map(m => ({
    order: m.order,
    title: m.title,
    content_slug: m.content_slug,
    id: m.id,
    expected_url: `/training/module/${m.order}?courseId=${course.slug}`
  }));

  const warnings: string[] = [];
  if (!rows.length) warnings.push('No modules found.');
  if (rows.length && rows[0].order !== 1) warnings.push(`First module order is ${rows[0].order} (expected 1).`);
  const outOfSequence = rows.some((r, i) => r.order !== i + 1);
  if (outOfSequence) warnings.push('Module orders are not contiguous (1..N).');

  const md = [
    `# Training URL Map (slug: ${course.slug})`,
    '',
    `Course: **${course.title}**  (id: \`${course.id}\`)`,
    '',
    '| # | Title | Content Slug | Module ID | Expected URL |',
    '|---:|---|---|---|---|',
    ...rows.map(r => `| ${r.order} | ${r.title} | ${r.content_slug ?? ''} | ${r.id} | ${r.expected_url} |`),
    '',
    warnings.length ? `**Warnings:**\n- ${warnings.join('\n- ')}` : '**Warnings:** none',
    ''
  ].join('\n');

  const outDir = path.join(process.cwd(), 'reports');
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, `training-url-map-${new Date().toISOString().replace(/[:.]/g,'-')}.md`);
  fs.writeFileSync(file, md, 'utf8');

  // Console print too
  console.log(md);
  console.log(`\nSaved: ${file}`);
}

main().catch(err => { console.error(err); process.exit(1); });
