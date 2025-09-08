#!/usr/bin/env node
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('[make-test-user] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env.');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Simple arg parser: --key=value
const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const m = a.match(/^--([^=]+)=(.*)$/);
  return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true];
}));

const course = args.course || 'forklift';
const locale = args.locale || 'en';
const prefix = args.prefix || 'qa';
const domain = args.domain || 'example.test';

const rand = crypto.randomBytes(4).toString('hex');
const email = `${prefix}+${Date.now().toString(36)}-${rand}@${domain}`;
// Strong-ish printable password. Ensure it has upper/lower/number/symbol.
const base = crypto.randomBytes(12).toString('base64').replace(/[+/=]/g, '').slice(0, 12);
const password = base + 'Aa1!';

// 1) Create auth user (email_confirm true so no inbox needed)
const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { role: 'trainee', test: true }
});
if (error) {
  console.error('[make-test-user] createUser error:', error.message);
  process.exit(2);
}
const user = data.user;

// 2) Best-effort: create a profile if your schema uses one
try {
  await supabase.from('profiles').insert({
    id: user.id,
    email,
    full_name: 'QA Trainee',
    role: 'trainee',
    locale
  });
} catch (e) {
  // table may not exist or RLS may block; safe to ignore for QA
}

// 3) Best-effort: enroll user in the default course if table exists
try {
  // Look up course_id by slug
  const { data: courseData } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', course)
    .single();
  
  if (courseData?.id) {
    await supabase.from('enrollments').insert({
      user_id: user.id,
      course_id: courseData.id,
      progress_pct: 0,
      passed: false
    });
  }
} catch (e) {
  // ignore if table not present or course not found
}

const creds = {
  ok: true,
  email,
  password,
  user_id: user.id,
  course,
  locale,
  login_hint: '/login'
};

console.log(JSON.stringify(creds, null, 2));
