# CPA Cab Glass Intake

Source: vendor QRG `2110094T` (Windshields and Glass Product Catalog).
Built by: `npx tsx scripts/glass/build-cpa-glass-intake.ts`

## Files

- `cpa-glass-intake.csv` / `.json` — one row per vendor PN
- `cpa-glass-phases.json` — vendor PNs per publish phase (excludes `skip_retail` packs)

## Prefix / slug rules

| Prefix | Brand | OEM display |
|--------|-------|-------------|
| BC | Bobcat | strip BC |
| CT | Caterpillar | strip CT |
| CS | Case | strip CS |
| JD | John Deere | strip JD |
| KB* | Kubota | strip leading KB |
| TK | Takeuchi | strip TK |
| SY* | Cab Glass Accessory | strip SY (vendor_pn keeps SY) |

## Publish status

- `pending` — eligible for site publish
- `skip_retail` — 25-packs (`*PK`); B2B only, not published to PDPs

## Phases

1. Accessories (seals, cord, adhesive, cleaner, hardware)
2. Bobcat
3. Caterpillar
4. Case
5. John Deere
6. Kubota
7. Takeuchi
