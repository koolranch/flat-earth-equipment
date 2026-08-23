-- Sidebar facet counts were tallied in application code from a plain
-- `select brand, category_slug from parts`, which Supabase caps at 1000 rows.
-- Once the catalog passed 1k parts every count silently understated: JCB read
-- 373 of 738, and brands past the cap (Tennant, Skyjack, JLG) were missing.
-- Aggregating in Postgres makes the counts exact and avoids shipping 2k rows.
--
-- Read-only and additive: `parts` is unchanged, and nothing here touches
-- pricing, checkout, or the Merchant feed.

create or replace view public.parts_brand_facets
with (security_invoker = true) as
select
  brand as name,
  count(*) as count,
  (array_remove(array_agg(brand_logo_url order by brand_logo_url), null))[1] as logo_url
from public.parts
where brand is not null and brand <> ''
group by brand;

-- One slug can carry several display names (slug `electrical` held
-- "Electrical", "Contactors & Relays" and "Switches & Electrical"), so pick the
-- most common label per slug rather than whichever row sorted first.
create or replace view public.parts_category_facets
with (security_invoker = true) as
select
  category_slug as slug,
  mode() within group (order by category) as name,
  count(*) as count
from public.parts
where category_slug is not null and category is not null
group by category_slug;

grant select on public.parts_brand_facets to anon, authenticated, service_role;
grant select on public.parts_category_facets to anon, authenticated, service_role;
