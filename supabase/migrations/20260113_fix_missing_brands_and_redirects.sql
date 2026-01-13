-- Migration: Fix Missing Brands and Broken Redirects
-- Date: 2026-01-13
-- Issue: /brand/{slug} redirects to /brand/{slug}/serial-lookup which 404s
-- Affected brands from Ahrefs audit: tcm, skytrak, liugong, mec, moffett, heli, 
--                                    powerboss, lcmg, tailift, john-deere, snorkel, enersys, nissan, jcb (fault codes)

-- ============================================================================
-- STEP 1: Add ALL missing brands to the brands table (including JCB)
-- These brands exist on /brands page but are not in the database
-- ============================================================================

INSERT INTO public.brands (slug, name, blurb) VALUES
  ('jcb', 'JCB', 'Telehandlers, backhoes & construction equipment'),
  ('tcm', 'TCM', 'Forklifts (ICE & electric)'),
  ('skytrak', 'SkyTrak', 'Telehandlers & reach forklifts'),
  ('liugong', 'LiuGong', 'Construction equipment & forklifts'),
  ('mec', 'MEC', 'Scissor lifts & aerial platforms'),
  ('moffett', 'Moffett', 'Truck-mounted forklifts'),
  ('heli', 'Heli', 'Forklifts (ICE & electric)'),
  ('powerboss', 'PowerBoss', 'Industrial sweepers & scrubbers'),
  ('lcmg', 'LCMG', 'Forklifts & warehouse equipment'),
  ('tailift', 'Tailift', 'Forklifts (ICE & electric)'),
  ('john-deere', 'John Deere', 'Construction & agriculture equipment'),
  ('snorkel', 'Snorkel', 'Aerial work platforms'),
  ('enersys', 'EnerSys', 'Industrial batteries & chargers'),
  ('nissan', 'Nissan', 'Forklifts (ICE & electric)')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  blurb = EXCLUDED.blurb;

-- ============================================================================
-- STEP 2: Add brand_overrides for brands WITHOUT serial tools
-- These will have canonical URLs pointing to fault-codes instead of serial-lookup
-- Since they don't have serial tools, redirect should go to fault-codes page
-- ============================================================================

-- STEP 2: Ensure JCB has proper fault codes URL (was redirecting to 404 fault-codes page)
INSERT INTO public.brand_overrides (brand_slug, serial_tool_url, fault_codes_url, canonical_serial_url, canonical_fault_url)
VALUES ('jcb', '/brand/jcb/serial-lookup', '/brand/jcb/fault-codes', '/brand/jcb/serial-lookup', '/brand/jcb/fault-codes')
ON CONFLICT (brand_slug) DO UPDATE SET
  fault_codes_url = '/brand/jcb/fault-codes',
  canonical_fault_url = '/brand/jcb/fault-codes';

-- STEP 3: Add overrides for brands that don't have serial lookup tools
-- These point to fault-codes as the default landing
INSERT INTO public.brand_overrides (brand_slug, serial_tool_url, fault_codes_url, canonical_serial_url, canonical_fault_url)
VALUES 
  ('tcm', '/brand/tcm/fault-codes', '/brand/tcm/fault-codes', '/brand/tcm/fault-codes', '/brand/tcm/fault-codes'),
  ('skytrak', '/brand/skytrak/fault-codes', '/brand/skytrak/fault-codes', '/brand/skytrak/fault-codes', '/brand/skytrak/fault-codes'),
  ('liugong', '/brand/liugong/fault-codes', '/brand/liugong/fault-codes', '/brand/liugong/fault-codes', '/brand/liugong/fault-codes'),
  ('mec', '/brand/mec/fault-codes', '/brand/mec/fault-codes', '/brand/mec/fault-codes', '/brand/mec/fault-codes'),
  ('moffett', '/brand/moffett/fault-codes', '/brand/moffett/fault-codes', '/brand/moffett/fault-codes', '/brand/moffett/fault-codes'),
  ('heli', '/brand/heli/fault-codes', '/brand/heli/fault-codes', '/brand/heli/fault-codes', '/brand/heli/fault-codes'),
  ('powerboss', '/brand/powerboss/fault-codes', '/brand/powerboss/fault-codes', '/brand/powerboss/fault-codes', '/brand/powerboss/fault-codes'),
  ('lcmg', '/brand/lcmg/fault-codes', '/brand/lcmg/fault-codes', '/brand/lcmg/fault-codes', '/brand/lcmg/fault-codes'),
  ('tailift', '/brand/tailift/fault-codes', '/brand/tailift/fault-codes', '/brand/tailift/fault-codes', '/brand/tailift/fault-codes'),
  ('john-deere', '/brand/john-deere/fault-codes', '/brand/john-deere/fault-codes', '/brand/john-deere/fault-codes', '/brand/john-deere/fault-codes'),
  ('snorkel', '/brand/snorkel/fault-codes', '/brand/snorkel/fault-codes', '/brand/snorkel/fault-codes', '/brand/snorkel/fault-codes'),
  ('enersys', '/brand/enersys/fault-codes', '/brand/enersys/fault-codes', '/brand/enersys/fault-codes', '/brand/enersys/fault-codes'),
  ('nissan', '/brand/nissan/fault-codes', '/brand/nissan/fault-codes', '/brand/nissan/fault-codes', '/brand/nissan/fault-codes')
ON CONFLICT (brand_slug) DO UPDATE SET
  serial_tool_url = EXCLUDED.serial_tool_url,
  fault_codes_url = EXCLUDED.fault_codes_url,
  canonical_serial_url = EXCLUDED.canonical_serial_url,
  canonical_fault_url = EXCLUDED.canonical_fault_url;

-- ============================================================================
-- VERIFICATION QUERIES (run separately to verify)
-- ============================================================================
-- SELECT slug, name FROM brands WHERE slug IN ('tcm', 'skytrak', 'liugong', 'mec', 'moffett', 'heli', 'powerboss', 'lcmg', 'tailift', 'john-deere', 'snorkel', 'enersys', 'nissan');
-- SELECT brand_slug, serial_tool_url, canonical_serial_url FROM brand_overrides ORDER BY brand_slug;
