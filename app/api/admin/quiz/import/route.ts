import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { normalizeRow, contentHash, type ImportRow } from '@/lib/quiz/import-utils';

export const dynamic = 'force-dynamic';

async function isTrainerOrAdmin(userId: string){
  const svc = supabaseService();
  const { data } = await svc.from('profiles').select('role').eq('id', userId).maybeSingle();
  return data && ['trainer','admin'].includes((data as any).role);
}

export async function POST(req: Request){
  const sb = supabaseServer();
  const svc = supabaseService();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ ok:false, error:'unauthorized' }, { status:401 });
  if (!(await isTrainerOrAdmin(user.id))) return NextResponse.json({ ok:false, error:'forbidden' }, { status:403 });

  const body = await req.json().catch(()=>({}));
  const dryRun = !!body.dryRun;
  const rows: any[] = Array.isArray(body.rows) ? body.rows : [];
  if (!rows.length) return NextResponse.json({ ok:false, error:'no_rows' }, { status:400 });

  const inserted: any[] = []; const skipped: any[] = []; const errors: any[] = [];

  for (let idx=0; idx<rows.length; idx++){
    const raw = rows[idx];
    const norm = normalizeRow(raw);
    if (!norm.ok){ errors.push({ index: idx, error: norm.error }); continue; }
    const row: ImportRow = norm.row;
    const hash = contentHash(row);

    // check existing by content_hash
    const { data: exists, error: exErr } = await svc.from('quiz_items').select('id').eq('content_hash', hash).maybeSingle();
    if (exErr){ errors.push({ index:idx, error: exErr.message }); continue; }
    if (exists){ skipped.push({ index: idx, reason: 'duplicate' }); continue; }

    if (!dryRun){
      const ins = await svc.from('quiz_items').insert({
        module_slug: row.module_slug,
        locale: row.locale,
        question: row.question,
        choices: row.choices,
        correct_index: row.correct_index,
        explain: row.explain,
        difficulty: row.difficulty,
        tags: row.tags || [],
        is_exam_candidate: row.is_exam_candidate ?? true,
        active: row.active ?? true,
        content_hash: hash,
        source: 'import',
        created_by: user.id
      }).select('id');
      if (ins.error){ errors.push({ index: idx, error: ins.error.message }); continue; }
    }
    inserted.push({ index: idx });
  }

  return NextResponse.json({ ok:true, dryRun, inserted, skipped, errors });
}
