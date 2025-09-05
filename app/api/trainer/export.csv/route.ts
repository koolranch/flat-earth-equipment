import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { auditLog } from '@/lib/audit/log.server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { data: { user } } = await supabaseServer().auth.getUser();
  const url = new URL(req.url);
  // call internal roster endpoint with pageSize=5000
  url.pathname = '/api/trainer/roster';
  url.searchParams.set('page', '1');
  url.searchParams.set('pageSize', '5000');
  
  const r = await fetch(url, { headers: { 'cookie': req.headers.get('cookie') || '' } });
  if (!r.ok) return new Response(await r.text(), { status: r.status });
  
  const j = await r.json();
  const rows = (j.items || []) as any[];
  
  const header = ['Learner Name', 'Email', 'Course', 'Progress %', 'Status', 'Passed', 'Cert Issued At', 'Cert URL'];
  const lines = [header.join(',')].concat(rows.map(x => [
    csv(x.learner_name), 
    csv(x.learner_email), 
    csv(x.course_slug), 
    String(x.progress_pct || 0), 
    x.status, 
    x.passed ? 'yes' : 'no', 
    x.cert_issued_at || '', 
    x.cert_pdf_url || ''
  ].join(',')));
  
  const body = lines.join('\n');
  
  if (user?.id) await auditLog({ actor_id: user.id, action:'export_roster', entity:'trainer_roster', meta:{ count: rows.length } });
  
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="trainer-roster.csv"`
    }
  });
}

function csv(v: any) {
  if (v == null) return '';
  const s = String(v);
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}