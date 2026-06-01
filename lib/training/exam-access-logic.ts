export type ExamPurchaseOrder = {
  id: string;
  course_slug: string | null;
  stripe_session_id?: string | null;
};

export type OrgEnrollmentAccess = {
  org_id: string;
  course_id: string;
};

export type OrgSeatPool = {
  org_id: string;
  course_id: string;
  total_seats: number;
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

/** Enterprise bulk purchases assign enrollments with org_id but no seat_claims row. */
export function userHasOrgAssignedExamAccessFromRows(
  orgEnrollments: OrgEnrollmentAccess[],
  orgSeatPools: OrgSeatPool[],
  forkliftCourseId: string,
): boolean {
  const forkliftEnrollments = orgEnrollments.filter(
    (enrollment) => enrollment.course_id === forkliftCourseId,
  );

  return forkliftEnrollments.some((enrollment) =>
    orgSeatPools.some(
      (pool) =>
        pool.org_id === enrollment.org_id &&
        pool.course_id === enrollment.course_id &&
        pool.total_seats > 0,
    ),
  );
}
