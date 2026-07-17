# Rough Terrain Scissor Lifts Intake

Source: vendor QRG `SYPNRTQRG` / `2003034` (Rough Terrain Scissor Lifts Quick Reference Guide).
Built by: `npx tsx scripts/aerial/build-rt-scissor-intake.ts`

## Coverage

| Brand | Models |
|-------|--------|
| Genie | GS68 RT, GS84 RT, GS90 RT |
| JLG | 260 MRT, 400/500 RTS, 3394/4394 RT |
| Skyjack | SJRT 6826/6832, 7127/7135, 8831, 8841, 9241/9250 |

## Prefix / display

| Prefix | Brand | OEM display |
|--------|-------|-------------|
| GN | Genie | strip GN |
| JL | JLG | strip JL |
| SJ | Skyjack | strip SJ |

## Phases

1. **Phase 1 (pending)** — accessories (alarms/horns/meters/lights), controllers, relays, fuses, level sensors, switches
2. **Phase 2** — valves / solenoids
3. **hold** — decals/labels/safety kits, wheels/tires/foam-filled assemblies

Reference pages (SY switch hardware, Floyd Bell alarms, tool bin) are **not** in the model-page intake yet.

## Files

- `rt-scissor-qrg-raw.txt` — PDF text extract
- `rt-scissor-intake.csv` / `.json` — aggregated rows
- `rt-scissor-phases.json` — vendor PNs by phase
- `rt-scissor-phase1-candidates.json` — Phase 1 publishable candidates
- `rt-scissor-phase1-net-new.json` — after `--dedupe` vs live catalog
- `rt-scissor-phase1-dupes.json` — OEM collisions skipped

## Publish

```bash
npx tsx scripts/aerial/build-rt-scissor-intake.ts --dedupe
npx tsx scripts/aerial/add-rt-scissor-phase1.ts --dry-run
npx tsx scripts/aerial/add-rt-scissor-phase1.ts
```

Phase 1 live as `quote_only` stubs (no Stripe / Buy Now until comps). Customer-facing OEM strips `GN`/`JL`/`SJ`. No vendor branding in copy.

## Status (live)

- Phase 1: quote stubs + provisional Buy Now where trusted comps verified (see \`data/pricing/rt-scissor-phase1-comps.json\`)
- Phase 2 valves: quote_only stubs live
- Hold: decals + wheels/tires not published

\`\`\`bash
npx tsx scripts/aerial/batch-comp-rt-scissor-phase1.ts --buckets controllers,accessories
npx tsx scripts/sync-priced-batch.ts --file data/pricing/rt-scissor-phase1-comps-clean.json
npx tsx scripts/aerial/add-rt-scissor-phase2.ts
\`\`\`
