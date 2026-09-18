/**
 * Vendor-hero review tray. Identity-ok Magnasource og:images land in a private
 * bucket so they can be cleaned; Approve is the only path that writes
 * `parts.image_url`. Raw vendor photos never go live.
 *
 * Seats / cushions / covers use the same tray. Raw vendor photos still never go live.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { currentHeroKind } from './magHero';
import { classifyRow, isSkip, type WatchRow } from './magWatchUniverse';
import { calculateSellPrice, categoryFromPartCategory } from './calculateSellPrice';

export const HERO_PENDING_BUCKET = 'part-hero-pending';
export const HERO_PUBLIC_BUCKET = 'part-heroes';

export const ALLOWED_HERO_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
export const MAX_HERO_BYTES = 10 * 1024 * 1024;

export type HeroReviewStatus = 'pending_raw' | 'cleaned' | 'approved' | 'rejected';

export type HeroReviewRow = {
  sku: string;
  part_id: string;
  slug: string;
  status: HeroReviewStatus;
  raw_path: string | null;
  cleaned_path: string | null;
  public_url: string | null;
  filename: string | null;
  identity_ok: boolean;
  mag_price: number | null;
  proposed_sell: number | null;
  qty_on_hand: number | null;
  note: string | null;
};

export type TrayGate = { ok: true } | { ok: false; why: string };

function magHeroFacts(row: WatchRow): {
  filename: string | null;
  identityOk: boolean;
  placeholder: boolean;
} {
  const raw = row.metadata?.mag_watch;
  const hero =
    raw && typeof raw === 'object'
      ? ((raw as Record<string, unknown>).hero as Record<string, unknown> | undefined)
      : undefined;
  const filename = typeof hero?.filename === 'string' ? hero.filename : null;
  return {
    filename,
    identityOk: hero?.identity_ok === true,
    placeholder: hero?.placeholder_suspect === true,
  };
}

function magSticker(row: WatchRow): { price: number | null; qty: number | null } {
  const comps = row.metadata?.competitor_prices;
  const entry = Array.isArray(comps)
    ? (comps.find(
        (c) => c && typeof c === 'object' && (c as Record<string, unknown>).source === 'magnasource'
      ) as Record<string, unknown> | undefined)
    : undefined;
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
  return { price: num(entry?.price), qty: num(entry?.qty_on_hand) };
}

function proposedSell(row: WatchRow, magPrice: number | null): number | null {
  if (magPrice == null) return null;
  const cost = row.metadata?.cost_wholesale;
  try {
    return calculateSellPrice({
      cost: typeof cost === 'number' && Number.isFinite(cost) ? cost : null,
      compPrice: magPrice,
      category: categoryFromPartCategory(row.category),
    }).sellPrice;
  } catch {
    return null;
  }
}

function looksLikeChargerShelf(row: WatchRow, filename: string | null): boolean {
  const hay = `${row.name} ${row.category ?? ''} ${filename ?? ''}`;
  return /battery charger|charger module|\bquiq\b|\bdelta-?q\b/i.test(hay);
}

/** A row the intake script may fetch a vendor hero for. */
export function trayIntakeEligibility(row: WatchRow): TrayGate {
  const hero = magHeroFacts(row);
  if (looksLikeChargerShelf(row, hero.filename)) {
    return { ok: false, why: 'charger shelves are a different supply chain' };
  }
  if (currentHeroKind(row.image_url) === 'real') {
    return { ok: false, why: 'row already has a real product photo' };
  }
  const classified = classifyRow(row);
  if (isSkip(classified)) return { ok: false, why: `out of watch scope: ${classified.reason}` };
  if (!hero.filename) return { ok: false, why: 'no vendor hero filename on the last read' };
  if (hero.placeholder) return { ok: false, why: 'vendor hero looks like a placeholder' };
  if (!hero.identityOk) return { ok: false, why: 'vendor hero filename does not match the part id' };
  return { ok: true };
}

export function heroUploadEligibility(row: WatchRow, review: HeroReviewRow | null): TrayGate {
  if (!review) return { ok: false, why: 'no tray row — run intake first' };
  if (review.status === 'approved') return { ok: false, why: 'already approved' };
  return { ok: true };
}

/** AI clean rewrites the cleaned candidate from the stored raw. It never sets image_url. */
export function heroAiCleanEligibility(row: WatchRow, review: HeroReviewRow | null): TrayGate {
  const upload = heroUploadEligibility(row, review);
  if (!upload.ok) return upload;
  if (!review?.raw_path) return { ok: false, why: 'no raw vendor photo to clean' };
  return { ok: true };
}

export function heroApproveEligibility(row: WatchRow, review: HeroReviewRow | null): TrayGate {
  if (!review) return { ok: false, why: 'no tray row' };
  if (review.status === 'approved') return { ok: false, why: 'already approved' };
  if (review.status !== 'cleaned' || !review.cleaned_path) {
    return { ok: false, why: 'upload a cleaned photo first — raw vendor images never go live' };
  }
  if (currentHeroKind(row.image_url) === 'real') {
    return { ok: false, why: 'row already has a real product photo' };
  }
  return { ok: true };
}

export function heroRejectEligibility(review: HeroReviewRow | null): TrayGate {
  if (!review) return { ok: false, why: 'no tray row' };
  if (review.status === 'approved') return { ok: false, why: 'already approved — do not unpublish from here' };
  if (review.status === 'rejected') return { ok: false, why: 'already rejected' };
  return { ok: true };
}

export function extForMime(mime: string): string {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  return 'jpg';
}

export function sniffHeroMime(bytes: Uint8Array, fallback?: string | null): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return 'image/png';
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'image/webp';
  }
  if (fallback && ALLOWED_HERO_MIME.has(fallback)) return fallback;
  return null;
}

export async function fetchHeroReview(
  supabase: SupabaseClient,
  sku: string
): Promise<HeroReviewRow | null> {
  const { data, error } = await supabase
    .from('part_image_reviews')
    .select(
      'sku, part_id, slug, status, raw_path, cleaned_path, public_url, filename, identity_ok, mag_price, proposed_sell, qty_on_hand, note'
    )
    .eq('sku', sku)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as HeroReviewRow | null) ?? null;
}

export async function recordIntake(
  supabase: SupabaseClient,
  row: WatchRow,
  bytes: Uint8Array,
  mime: string,
  filename: string
): Promise<{ path: string }> {
  const gate = trayIntakeEligibility(row);
  if (!gate.ok) throw new Error(gate.why);
  if (!ALLOWED_HERO_MIME.has(mime)) throw new Error(`unsupported mime ${mime}`);
  if (bytes.length > MAX_HERO_BYTES) throw new Error('image larger than 10 MB');

  const ext = extForMime(mime);
  const rawPath = `${row.sku}/raw.${ext}`;
  const { error: upErr } = await supabase.storage.from(HERO_PENDING_BUCKET).upload(rawPath, bytes, {
    contentType: mime,
    upsert: true,
  });
  if (upErr) throw new Error(upErr.message);

  const sticker = magSticker(row);
  const patch = {
    sku: row.sku,
    part_id: row.id,
    slug: row.slug,
    status: 'pending_raw' as const,
    raw_path: rawPath,
    filename,
    identity_ok: true,
    mag_price: sticker.price,
    proposed_sell: proposedSell(row, sticker.price),
    qty_on_hand: sticker.qty,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('part_image_reviews').upsert(patch, { onConflict: 'sku' });
  if (error) throw new Error(error.message);
  return { path: rawPath };
}

export async function recordCleaned(
  supabase: SupabaseClient,
  row: WatchRow,
  review: HeroReviewRow,
  bytes: Uint8Array,
  mime: string,
  opts?: { note?: string }
): Promise<{ path: string }> {
  const gate = heroUploadEligibility(row, review);
  if (!gate.ok) throw new Error(gate.why);
  if (!ALLOWED_HERO_MIME.has(mime)) throw new Error(`unsupported mime ${mime}`);
  if (bytes.length > MAX_HERO_BYTES) throw new Error('image larger than 10 MB');

  const ext = extForMime(mime);
  const cleanedPath = `${row.sku}/cleaned.${ext}`;
  const { error: upErr } = await supabase.storage.from(HERO_PENDING_BUCKET).upload(cleanedPath, bytes, {
    contentType: mime,
    upsert: true,
  });
  if (upErr) throw new Error(upErr.message);

  const { error } = await supabase
    .from('part_image_reviews')
    .update({
      status: 'cleaned',
      cleaned_path: cleanedPath,
      note: opts?.note ?? review.note,
      updated_at: new Date().toISOString(),
    })
    .eq('sku', row.sku);
  if (error) throw new Error(error.message);
  return { path: cleanedPath };
}

export type HeroOpResult = { ok: boolean; note: string; publicUrl?: string; auditError?: string | null };

export async function applyHeroApprove(
  supabase: SupabaseClient,
  row: WatchRow,
  review: HeroReviewRow,
  opts: { source: 'cli' | 'dashboard'; note?: string }
): Promise<HeroOpResult> {
  const gate = heroApproveEligibility(row, review);
  if (!gate.ok) return { ok: false, note: gate.why };
  const cleanedPath = review.cleaned_path!;

  const { data: file, error: dlErr } = await supabase.storage.from(HERO_PENDING_BUCKET).download(cleanedPath);
  if (dlErr || !file) return { ok: false, note: `cleaned download failed: ${dlErr?.message ?? 'empty'}` };

  const buf = new Uint8Array(await file.arrayBuffer());
  const mime = sniffHeroMime(buf, file.type) ?? 'image/jpeg';
  const publicPath = `${row.slug}.${extForMime(mime)}`;

  const { error: upErr } = await supabase.storage.from(HERO_PUBLIC_BUCKET).upload(publicPath, buf, {
    contentType: mime,
    upsert: true,
  });
  if (upErr) return { ok: false, note: `public upload failed: ${upErr.message}` };

  const { data: pub } = supabase.storage.from(HERO_PUBLIC_BUCKET).getPublicUrl(publicPath);
  const publicUrl = pub.publicUrl;

  const { error: partErr } = await supabase
    .from('parts')
    .update({ image_url: publicUrl, updated_at: new Date().toISOString() })
    .eq('id', row.id);
  if (partErr) return { ok: false, note: `parts update failed: ${partErr.message}` };

  const { error: revErr } = await supabase
    .from('part_image_reviews')
    .update({
      status: 'approved',
      public_url: publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('sku', row.sku);
  if (revErr) return { ok: false, note: `review update failed after image set: ${revErr.message}` };

  const { error: auditErr } = await supabase.from('parts_ops_audit').insert({
    source: opts.source,
    action: 'hero_approve',
    sku: row.sku,
    part_id: row.id,
    before: { image_url: row.image_url },
    after: { image_url: publicUrl },
    stripe: null,
    note: opts.note ?? `approved cleaned hero → ${publicPath}`,
  });

  return {
    ok: true,
    note: `set image_url from cleaned hero`,
    publicUrl,
    auditError: auditErr ? auditErr.message : null,
  };
}

export async function applyHeroReject(
  supabase: SupabaseClient,
  row: WatchRow,
  review: HeroReviewRow,
  opts: { source: 'cli' | 'dashboard'; note?: string }
): Promise<HeroOpResult> {
  const gate = heroRejectEligibility(review);
  if (!gate.ok) return { ok: false, note: gate.why };

  const { error } = await supabase
    .from('part_image_reviews')
    .update({
      status: 'rejected',
      note: opts.note ?? review.note,
      updated_at: new Date().toISOString(),
    })
    .eq('sku', row.sku);
  if (error) return { ok: false, note: error.message };

  const { error: auditErr } = await supabase.from('parts_ops_audit').insert({
    source: opts.source,
    action: 'hero_reject',
    sku: row.sku,
    part_id: row.id,
    before: { status: review.status },
    after: { status: 'rejected' },
    stripe: null,
    note: opts.note ?? 'rejected via dashboard',
  });

  return { ok: true, note: 'rejected', auditError: auditErr ? auditErr.message : null };
}
