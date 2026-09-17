import 'server-only';
import fs from 'node:fs';
import path from 'node:path';

/**
 * OEM numbers the operator has decided not to sell at the current vendor sticker (cost at or
 * over comp, race-to-bottom seats, etc). Kept in `data/seats/skip-comps.json`; the reprice gate
 * refuses these so a dashboard click cannot undo a deliberate skip.
 */
const SKIP_COMPS_PATH = path.join(process.cwd(), 'data', 'seats', 'skip-comps.json');

let cached: Set<string> | null = null;

export function loadSkipOems(): Set<string> {
  if (cached) return cached;
  try {
    const raw = JSON.parse(fs.readFileSync(SKIP_COMPS_PATH, 'utf8')) as Array<{ oem?: string }>;
    cached = new Set(raw.map((r) => String(r.oem ?? '').trim()).filter(Boolean));
  } catch {
    cached = new Set();
  }
  return cached;
}
