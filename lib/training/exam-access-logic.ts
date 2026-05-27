export type ExamPurchaseOrder = {
  id: string;
  course_slug: string | null;
  stripe_session_id?: string | null;
};

/** Mirrors mobile entitlement rules: direct forklift order or claimed employer seat. */
export function userHasExamPurchaseFromRows(
  orders: ExamPurchaseOrder[],
  seatClaimCount: number,
  courseSlug = 'forklift',
): boolean {
  if (seatClaimCount > 0) return true;
  return orders.some((order) => (order.course_slug ?? courseSlug) === courseSlug);
}
