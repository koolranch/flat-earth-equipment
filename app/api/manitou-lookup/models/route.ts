import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';

// Prevent static prerendering at build time: this route needs the service
// role key, which is absent in CI builds.
export const dynamic = 'force-dynamic';

const supabase = () => supabaseService();

export async function GET() {
  const db = supabase();
  const { data, error } = await db
    .from('manitou_model_aliases')
    .select('normalized,family')
    .order('normalized');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const seen = new Set<string>();
  const models = [] as any[];
  for (const r of data || []) {
    const key = `${r.normalized}::${r.family}`;
    if (!seen.has(key)) { seen.add(key); models.push(r); }
  }
  return NextResponse.json({ models });
}
