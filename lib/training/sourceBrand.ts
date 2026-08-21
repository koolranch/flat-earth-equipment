/**
 * Resolves which brand a manager's operator-facing emails should use.
 *
 * A manager who bought through getforkliftcertified.com has source_brand='gfc'
 * stamped on their order by the Stripe webhook; their seat invites should carry
 * Forklift Certified branding and claim links on app.getforkliftcertified.com.
 * Everyone else (null / no orders) keeps the Flat Earth Safety defaults.
 */

export type SourceBrand = 'gfc' | null;

// Kept intentionally shallow: a structural mirror of the Supabase query chain
// makes TS instantiate the client's full generic graph (TS2589).
type OrdersClient = { from: (table: string) => any };

export async function managerSourceBrand(
  svc: OrdersClient,
  userId: string,
): Promise<SourceBrand> {
  try {
    const { data } = await svc
      .from('orders')
      .select('id')
      .eq('user_id', userId)
      .eq('source_brand', 'gfc')
      .limit(1);
    return data && data.length > 0 ? 'gfc' : null;
  } catch {
    // Brand lookup must never break invite sending — fall back to default.
    return null;
  }
}
