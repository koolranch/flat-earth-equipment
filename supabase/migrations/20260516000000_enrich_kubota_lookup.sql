-- Enrich Kubota lookup data
--
-- Purpose:
--   The /kubota-serial-number-lookup tool prompts visitors to type model codes
--   (e.g. SVL75-3, KX057-5, U55-5, R540, L47, M62) and shows two cards:
--     - "Where to find it / What to record" (kubota_plate_locations)
--     - "Published serial-number breaks" (kubota_model_serial_ranges)
--
--   Before this migration, plate guidance only had one generic row per family
--   and serial ranges only had four rows total, so the second card always
--   rendered "—" for the most-searched models.
--
-- This migration is purely additive:
--   1. Adds a unique index on kubota_model_serial_ranges so we can ON CONFLICT
--      DO NOTHING and safely re-run.
--   2. Inserts model-specific plate-location rows for SVL/SSV/KX/U/R/TLB.
--   3. Inserts production-year ranges and known parts-catalog serial breaks
--      for the model codes the placeholder asks visitors to type.
--
-- Sources used to compile data (cited in `notes` column where applicable):
--   - Kubota engine.kubota.com serial-number identification page
--     (year/month codes for the new 7-digit engine serial format)
--   - messicks.com "Decoding Kubota Serial Numbers" (17-digit chassis serial
--     structure; tractor serial location)
--   - partsonline.com Kubota serial-number guide (per-family plate locations)
--   - conequip.com Kubota mini-excavator serial-location reference
--   - kubotausa.com brochures and spec sheets (model production years)
--   - aglist.ca and compactequip.com SVL/U-/R-series spec guides
--   - Kubota workshop manuals and parts catalogs (existing rows preserved)
--
-- Wording rules:
--   - All notes describe public-source data, not vendor copy.
--   - Production years are always written as "Production: YYYY-YYYY" or
--     "Production: YYYY-present" so the lookup result reads cleanly.
--   - Genuine parts-catalog "S/N break" rows keep the original phrasing
--     ("From 25001", "S/N 20000-29999") so dealers can match them.

------------------------------------------------------------------------------
-- 1. Index for safe upserts
------------------------------------------------------------------------------

create unique index if not exists kubota_model_serial_ranges_unique
  on public.kubota_model_serial_ranges (model_code, serial_range);

------------------------------------------------------------------------------
-- 2. Model-specific plate locations
--
-- The existing six family-level rows are preserved. We add finer-grained
-- entries that surface to anyone typing a specific model. The API returns
-- every row for the family, so the page now shows family guidance plus
-- per-model detail.
------------------------------------------------------------------------------

insert into public.kubota_plate_locations (equipment_type, series, location_notes)
values
  -- Compact Track Loaders (SVL family) ----------------------------------------
  ('Compact Track Loader', 'SVL75-3',
   'SVL75-3 (2023-present): identification plate at the left front, just below the cab door sill on the outside of the cab; plate also stamped into the chassis frame as a backup.'),
  ('Compact Track Loader', 'SVL97-3',
   'SVL97-3 (2025-present): identification plate at the left front, just below the cab door sill on the outside of the cab; same location as SVL75-3 with an added QR code on -3 generation cabs.'),
  ('Compact Track Loader', 'SVL75-2',
   'SVL75-2 (legacy): identification plate at the left front of the chassis below the door sill; if the sticker is worn the serial is also stamped into the welded frame in the same area.'),
  ('Compact Track Loader', 'SVL95-2s',
   'SVL95-2s (legacy): identification plate at the left front of the chassis below the door sill; record both the chassis PIN and the engine serial from the engine plate.'),
  ('Compact Track Loader', 'SVL65-2',
   'SVL65-2: identification plate at the left front of the chassis below the door sill; on side-entry SVL65-2S variants the plate sits in the same area but slightly forward.'),

  -- Skid Steer Loaders (SSV family) -------------------------------------------
  ('Skid Steer Loader', 'SSV75',
   'SSV75: identification plate on the front right corner of the machine frame near the operator station, mounted at eye level; serial also stamped into the frame as a backup.'),
  ('Skid Steer Loader', 'SSV65',
   'SSV65: identification plate on the front right corner of the machine frame near the operator station; engine serial is on a sticker on the valve cover.'),

  -- Compact Excavators (KX family) --------------------------------------------
  ('Compact Excavator', 'KX033-4',
   'KX033-4: identification plate on the right (curb) side, front edge of the cab/canopy under the window glass; near the base of the boom mount.'),
  ('Compact Excavator', 'KX040-4',
   'KX040-4: identification plate on the right (curb) side, front edge of the cab under the window; record the full PIN, engine serial, and the boom-foot stamping for parts accuracy.'),
  ('Compact Excavator', 'KX057-4',
   'KX057-4 (legacy): identification plate on the right (curb) side, front edge of the cab under the window; KX057-4 was succeeded by the KX057-5 in 2021.'),
  ('Compact Excavator', 'KX057-5',
   'KX057-5 (2021-present): identification plate on the right (curb) side at the front edge of the cab; QR-code label is also present on -5 generation cabs.'),
  ('Compact Excavator', 'KX080-4',
   'KX080-4: identification plate on the right (curb) side at the front edge of the cab under the window; plate sits slightly higher than on smaller KX models.'),

  -- Compact Excavators (U family) ---------------------------------------------
  ('Compact Excavator', 'U17',
   'U17: identification plate on the right side of the canopy/cab front edge; the small frame means the plate is positioned lower than on larger U-series machines.'),
  ('Compact Excavator', 'U27-4',
   'U27-4: identification plate on the right (curb) side, front edge of the cab/canopy under the window glass; serial is also stamped into the chassis at the boom-mount.'),
  ('Compact Excavator', 'U35-4',
   'U35-4: identification plate on the right (curb) side, front edge of the cab; some component sub-assemblies (e.g. meter assembly) have their own S/N break gates documented in the parts catalog.'),
  ('Compact Excavator', 'U48-5',
   'U48-5 (2021-present): identification plate on the right (curb) side, front edge of the cab; tight-tail-swing model, plate sits in the same location as U55-5.'),
  ('Compact Excavator', 'U55-5',
   'U55-5 (2021-present): identification plate on the right (curb) side, front edge of the cab; tight-tail-swing model, replaces the U55-4.'),

  -- Wheel Loaders (R family) --------------------------------------------------
  ('Wheel Loader', 'R430',
   'R430: identification plate on the right side of the front frame; the model and engine plate (Kubota V3307 family) is on the engine itself.'),
  ('Wheel Loader', 'R540',
   'R540 (2021-present): identification plate on the right side of the front frame, near the cab step; second-generation R-series with redesigned cab.'),
  ('Wheel Loader', 'R640',
   'R640 (2021-present): identification plate on the right side of the front frame, near the cab step; same location as R540, larger frame.'),

  -- Tractor Loader Backhoes (TLB family) --------------------------------------
  ('Tractor Loader Backhoe', 'L47',
   'L47 (2016-present): identification plate on the left side of the main frame; tractor PIN is also printed on a sticker at the front right of the hood and stamped into the frame near the operator station.'),
  ('Tractor Loader Backhoe', 'M62',
   'M62 (2016-present): identification plate on the left side of the main frame near the operator station; based on a heavier component tree than the L47 (replaced the older M59).')
on conflict (equipment_type, coalesce(series,''), location_notes) do nothing;

------------------------------------------------------------------------------
-- 3. Production years and serial-number breaks
--
-- Each row captures one of:
--   a) "Production: YYYY-YYYY" or "Production: YYYY-present" - useful for
--      visitors trying to roughly date a used machine before they read the
--      data tag.
--   b) Genuine parts-catalog S/N break ("From 25001", "S/N 20000-29999") -
--      preserved verbatim so dealers can cross-reference.
------------------------------------------------------------------------------

insert into public.kubota_model_serial_ranges (model_code, serial_range, notes)
values
  -- Compact Track Loaders -----------------------------------------------------
  ('SVL65-2',  'Production: 2017-present',
   'Current production. Specs sourced from Kubota USA brochures.'),
  ('SVL65-2S', 'Production: 2021-present',
   'Side-entry variant of SVL65-2 platform.'),
  ('SVL75-2',  'Production: 2014-2022',
   'Replaced by SVL75-3 starting in 2023.'),
  ('SVL75-3',  'Production: 2023-present',
   'Dash-3 generation: sealed one-piece cab, fuel tank moved to rear door, radiator on top of engine.'),
  ('SVL90-2',  'Production: 2014-2018 (approx.)',
   'Replaced by SVL95-2s in the dash-2s generation.'),
  ('SVL95-2',  'Production: 2014-2017 (approx.)',
   'Early SVL95-2; replaced by SVL95-2s.'),
  ('SVL95-2s', 'Production: 2018-2024',
   'Last SVL95-class machine; replaced by SVL97-3 announced at World of Concrete 2025.'),
  ('SVL97-3',  'Production: 2025-present',
   'Successor to SVL95-2s. ~8% higher rated operating capacity, 40 gpm high-flow option.'),
  ('SVL110-3', 'Production: 2026-present',
   'Newest and largest SVL; introduced at ConExpo 2026 with 45 gpm high-flow and APS anti-stall.'),

  -- Skid Steer Loaders --------------------------------------------------------
  ('SSV65',    'Production: 2015-present',
   'First Kubota wheeled skid steer family; SSV65 and SSV75 launched together.'),
  ('SSV75',    'Production: 2015-present',
   'Larger of the SSV pair; current production.'),

  -- Compact Excavators (KX) ---------------------------------------------------
  ('KX033-4',  'Production: 2014-present',
   'Conventional tail swing; -4 generation.'),
  ('KX040-4',  'Production: 2017-present',
   'Tight tail swing; -4 generation; widely used in landscaping and utility.'),
  ('KX057-4',  'Production: 2014-2021',
   'Conventional tail swing; succeeded by KX057-5 in 2021.'),
  ('KX057-4',  'From 25001',
   'Workshop-manual serial header used by Kubota service literature.'),
  ('KX057-5',  'Production: 2021-present',
   'Conventional tail swing; -5 generation introduced alongside U48-5/U55-5.'),
  ('KX080-4',  'Production: 2014-present',
   'Largest KX-class compact excavator; -4 generation.'),
  ('KX080-4',  'From 30666 (component group)',
   'Parts catalog shows S.No FROM 30666 for several sub-assemblies; verify against Kubota WSM.'),

  -- Compact Excavators (U) ----------------------------------------------------
  ('U17',      'Production: 2014-present',
   'Sub-2-ton zero-tail-swing compact excavator.'),
  ('U27-4',    'Production: 2014-present',
   'Tight tail swing; -4 generation.'),
  ('U35',      'S/N 20000-29999',
   'Dealer parts catalog shows this serial range for U35.'),
  ('U35',      'Production: 2007-2014 (approx.)',
   'Original U35 platform; succeeded by U35-4.'),
  ('U35-4',    'Production: 2014-present',
   'Tight tail swing; -4 generation; widely sold in North America.'),
  ('U35-4',    'Component S/N break: PIN <=11010 (meter assembly)',
   'Official parts page shows S/N gating for the meter assembly subassembly.'),
  ('U48-5',    'Production: 2021-present',
   'Tight tail swing; -5 generation; introduced at ConExpo 2020.'),
  ('U55-5',    'Production: 2021-present',
   'Tight tail swing; -5 generation; replaces U55-4.'),

  -- Wheel Loaders -------------------------------------------------------------
  ('R430',     'Production: 2017-present',
   'Smallest current R-series wheel loader.'),
  ('R530',     'Production: 2014-2021',
   'First-generation R-series; succeeded by R540 in 2021.'),
  ('R540',     'Production: 2021-present',
   'Second-generation R-series; redesigned glass cabin and updated controls.'),
  ('R630',     'Production: 2014-2021',
   'First-generation R-series; succeeded by R640 in 2021.'),
  ('R640',     'Production: 2021-present',
   'Second-generation R-series; same chassis family as R540.'),

  -- Tractor Loader Backhoes ---------------------------------------------------
  ('L47',      'Production: 2016-present',
   'Replaced the L39 and L45 TLB models in early 2016.'),
  ('M62',      'Production: 2016-present',
   'Replaced the M59 TLB; uses a heavier component tree than the L47.')
on conflict (model_code, serial_range) do nothing;
