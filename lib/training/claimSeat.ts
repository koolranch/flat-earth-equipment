import 'server-only';
import { sendWelcomeEmail } from '@/lib/email/resend';
import { selectClaimableOrder } from '@/lib/training/orderEntitlements';
import { managerSourceBrand, type SourceBrand } from '@/lib/training/sourceBrand';

/**
 * Shared seat-claim fulfillment used by both /api/claim/accept (existing
 * signed-in users) and /api/claim/register (new operators creating an
 * account from an invite link). Behavior is a direct extraction of the
 * original /api/claim/accept logic — do not change semantics here without
 * checking both callers.
 */

export interface SeatInviteRecord {
  id: string;
  email: string | null;
  course_id: string;
  order_id: string | null;
  created_by: string;
  courses?: unknown;
}

export interface ClaimSeatResult {
  ok: boolean;
  /** HTTP status the caller should return. */
  status: number;
  error?: string;
  enrollmentId?: string;
  courseTitle?: string;
  brand?: SourceBrand;
}

// Loose client type to avoid excessively-deep Supabase generic instantiation
// (same approach as lib/training/sourceBrand.ts).
type ServiceClient = any;

export async function claimSeatForUser(
  svc: ServiceClient,
  opts: {
    inv: SeatInviteRecord;
    userId: string;
    firstName: string;
    lastName: string;
  }
): Promise<ClaimSeatResult> {
  const { inv, userId, firstName, lastName } = opts;

  // Get user profile (auto-created by the on_auth_user_created trigger)
  const { data: profile } = await svc
    .from('profiles')
    .select('id, email, full_name')
    .eq('id', userId)
    .maybeSingle();

  if (!profile) {
    return { ok: false, status: 404, error: 'profile_not_found' };
  }

  // Update profile with full name from claim form
  const fullName = `${firstName.trim()} ${lastName.trim()}`;
  try {
    await svc.from('profiles').update({ full_name: fullName }).eq('id', userId);
    await svc.auth.admin.updateUserById(userId, {
      user_metadata: { full_name: fullName },
    });
  } catch (nameError) {
    console.error('Failed to update user name (non-blocking):', nameError);
  }

  // Verify email match (flexible — log only)
  const profileEmail = profile.email?.toLowerCase();
  const inviteEmail = inv.email?.toLowerCase();
  if (profileEmail !== inviteEmail) {
    console.warn(`Email mismatch: profile=${profileEmail}, invite=${inviteEmail}`);
  }

  // Check if user already has an enrollment for this course
  const { data: existingEnrollment } = await svc
    .from('enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', inv.course_id)
    .maybeSingle();

  let enrollmentId: string | undefined = existingEnrollment?.id;
  let claimOrderId: string | null = null;

  const ordersQuery = svc
    .from('orders')
    .select(
      'id, user_id, course_id, seats, created_at, is_unlimited, subscription_status, current_period_end, ended_at'
    )
    .eq('course_id', inv.course_id)
    .order('created_at', { ascending: false });

  const { data: candidateOrders, error: candidateOrdersError } = inv.order_id
    ? await ordersQuery.eq('id', inv.order_id)
    : await ordersQuery.eq('user_id', inv.created_by);

  if (candidateOrdersError) {
    console.error('Error loading candidate orders for seat claim:', candidateOrdersError);
    return { ok: false, status: 500, error: 'failed_to_validate_order' };
  }

  const orderIds = (candidateOrders || []).map((order: any) => order.id);
  const claimedByOrderId: Record<string, number> = {};
  if (orderIds.length > 0) {
    const { data: claims } = await svc
      .from('seat_claims')
      .select('order_id')
      .in('order_id', orderIds);

    for (const claim of claims || []) {
      const orderId = (claim as any).order_id;
      claimedByOrderId[orderId] = (claimedByOrderId[orderId] || 0) + 1;
    }
  }

  const selectedOrder = selectClaimableOrder((candidateOrders || []) as any[], claimedByOrderId);
  if (!selectedOrder) {
    return { ok: false, status: 409, error: 'no_seats_available' };
  }

  claimOrderId = selectedOrder.order.id;

  // Create enrollment if it doesn't exist
  if (!enrollmentId) {
    const { data: newEnrollment, error: enrollError } = await svc
      .from('enrollments')
      .insert({
        user_id: userId,
        course_id: inv.course_id,
        progress_pct: 0,
        passed: false,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (enrollError || !newEnrollment) {
      console.error('Error creating enrollment:', enrollError);
      return { ok: false, status: 500, error: 'failed_to_create_enrollment' };
    }

    enrollmentId = newEnrollment.id;
  }

  // Mark invitation as claimed
  const { error: claimError } = await svc
    .from('seat_invites')
    .update({
      status: 'claimed',
      claimed_at: new Date().toISOString(),
      claimed_by: userId,
    })
    .eq('id', inv.id);

  if (claimError) {
    console.error('Error marking invitation as claimed:', claimError);
    return { ok: false, status: 500, error: 'failed_to_claim_invitation' };
  }

  // Persist claim in seat_claims (idempotent, best effort)
  try {
    if (claimOrderId) {
      await svc.from('seat_claims').upsert(
        {
          order_id: claimOrderId,
          user_id: userId,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'order_id,user_id', ignoreDuplicates: false }
      );
    }
  } catch (e) {
    console.error('seat_claims upsert failed', e);
  }

  // Course details for the welcome email
  const course = Array.isArray(inv.courses) ? inv.courses[0] : inv.courses;
  const courseTitle = (course as any)?.title || 'Forklift Operator Training';

  // Brand follows the inviting manager's purchase origin (GFC vs FEE)
  let brand: SourceBrand = null;
  try {
    brand = await managerSourceBrand(svc, inv.created_by);
  } catch (e) {
    console.error('managerSourceBrand lookup failed (non-blocking):', e);
  }

  // Send welcome email (best effort)
  if (process.env.RESEND_API_KEY && profile.email) {
    try {
      await sendWelcomeEmail({
        to: profile.email,
        name: fullName,
        courseTitle,
        brand,
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }
  }

  // Log audit trail (best effort)
  try {
    await svc.from('audit_log').insert({
      actor_id: userId,
      action: 'seat_claimed',
      metadata: {
        invite_id: inv.id,
        course_id: inv.course_id,
        enrollment_id: enrollmentId,
        invite_email: inv.email,
        profile_email: profile.email,
        course_title: courseTitle,
      },
    });
  } catch (auditError) {
    console.error('Error logging seat claim audit:', auditError);
  }

  return { ok: true, status: 200, enrollmentId, courseTitle, brand };
}
