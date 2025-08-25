import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const qSchema = z.object({
  brand: z.string().min(1),
  code: z.string().trim().optional(),
  model: z.string().trim().optional(),
  limit: z.coerce.number().min(1).max(200).default(50)
});

function likeToRegex(like: string) {
  // Convert SQL LIKE (with % and _) to a case-insensitive RegExp
  const escaped = like.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = '^' + escaped.replace(/%/g, '.*').replace(/_/g, '.') + '$';
  return new RegExp(re, 'i');
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parse = qSchema.safeParse({
    brand: url.searchParams.get('brand'),
    code: url.searchParams.get('code') || undefined,
    model: url.searchParams.get('model') || undefined,
    limit: url.searchParams.get('limit') || undefined
  });
  if (!parse.success) return NextResponse.json({ error: 'Invalid query', issues: parse.error.flatten() }, { status: 400 });
  const { brand, code, model, limit } = parse.data;

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // server-only
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return NextResponse.json({ error: 'Supabase env vars missing' }, { status: 500 });
  }
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  // 1) Fetch faults for brand (filter code server-side; model filter applied in-memory for proper LIKE semantics)
  let q = supabase.from('svc.svc_fault_codes').select('*').eq('brand', brand).limit(limit);
  if (code) q = q.ilike('code', `%${code}%`);
  const { data: faults, error } = await q;
  if (error) {
    // If table doesn't exist, return empty results with guidance
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      return NextResponse.json({
        brand,
        query: { code: code || null, model: model || null, limit },
        retrieval: null,
        count: 0,
        items: [],
        disclaimer: 'Fault codes database not yet available. Check machine display for codes and consult operator manual.'
      });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 2) Model filter (include brand-generic rows where model_pattern is null)
  let filtered = faults ?? [];
  if (model) {
    filtered = (faults ?? []).filter((r) => !r.model_pattern || likeToRegex(r.model_pattern).test(model));
  }

  // 3) Fetch retrieval steps and pick the most specific match
  const { data: steps } = await supabase
    .from('svc.svc_code_retrieval')
    .select('*')
    .eq('brand', brand);
  let retrieval = null as null | { brand: string; steps: string; model_pattern: string | null };
  if (steps && steps.length) {
    if (!model) {
      // prefer generic (null) if no model given; else any one
      const generic = steps.find((s) => !s.model_pattern);
      retrieval = generic || steps[0] || null;
    } else {
      // Longest matching model_pattern wins
      const matches = steps.filter((s) => !s.model_pattern || likeToRegex(s.model_pattern).test(model));
      matches.sort((a, b) => (b.model_pattern?.length || 0) - (a.model_pattern?.length || 0));
      retrieval = matches[0] || null;
    }
  }

  // 4) Order by severity then code (info < warn < fault < stop)
  const order = { info: 0, warn: 1, fault: 2, stop: 3 } as Record<string, number>;
  filtered.sort((a: any, b: any) => {
    const sa = order[a.severity] ?? 2; const sb = order[b.severity] ?? 2;
    if (sa !== sb) return sa - sb;
    return String(a.code).localeCompare(String(b.code), undefined, { numeric: true });
  });

  return NextResponse.json({
    brand,
    query: { code: code || null, model: model || null, limit },
    retrieval,
    count: filtered.length,
    items: filtered.map((r: any) => ({
      id: r.id,
      code: r.code,
      title: r.title,
      meaning: r.meaning,
      severity: r.severity,
      likely_causes: r.likely_causes,
      checks: r.checks,
      fixes: r.fixes,
      model_pattern: r.model_pattern,
      provenance: r.provenance
    })),
    disclaimer: 'Informational starter set. Always confirm with official procedures before servicing.'
  });
}