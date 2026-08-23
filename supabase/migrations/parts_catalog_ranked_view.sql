-- Catalog browse view: adds a per-category rank so the default "Recommended"
-- sort can interleave categories instead of returning one alphabetical run
-- (page 1 was 24 near-identical Bobcat rubber tracks).
--
-- Read-only and additive: `parts` is unchanged, and nothing here touches
-- pricing, checkout, or the Merchant feed. security_invoker keeps the caller's
-- privileges rather than the view owner's.

create or replace view public.parts_catalog_ranked
with (security_invoker = true) as
select
  p.*,
  row_number() over (
    partition by coalesce(p.category, '~')
    order by
      p.is_fast_moving desc nulls last,
      p.is_in_stock desc nulls last,
      p.name asc
  ) as category_rank
from public.parts p;

grant select on public.parts_catalog_ranked to anon, authenticated, service_role;
