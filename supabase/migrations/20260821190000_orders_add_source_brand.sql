-- Brand site the checkout originated from, used to pick email branding for
-- manager-driven sends (welcome, seat invites). Null = flatearthequipment.com.
alter table public.orders add column if not exists source_brand text;

comment on column public.orders.source_brand is
  'Origin brand of the checkout (gfc = getforkliftcertified.com). Null = Flat Earth Equipment default.';
