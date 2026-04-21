/**
 * Ask-employer fulfillment: the 7-step side-effect pipeline that runs inside the
 * Stripe webhook when (session.metadata.request_id is present) AND
 * (process.env.ENABLE_ASK_EMPLOYER_FULFILLMENT === '1').
 *
 * Pure logic here. All I/O is injected via FulfillmentDeps so the pipeline is
 * covered by unit tests without spinning up Stripe/Supabase/Resend/Expo.
 *
 * The wrapping try/catch lives in the webhook caller. Functions in this module
 * may throw; the caller catches and logs `[ask-employer-fulfillment-error]`.
 * The ONE exception is unique-constraint collisions on seat_invites, which are
 * swallowed here and reported via the returned outcome (so the outer try does
 * not misclassify a collision as a transient failure and emit the error
 * analytics event).
 */

export interface PurchaseRequestRow {
  id: string;
  status: string;
  employee_user_id: string;
  employee_email: string;
  employer_name: string;
  seats_requested: number;
  related_seat_invite_id: string | null;
}

export interface SeatInviteRow {
  id: string;
  invite_token: string;
  email: string;
  status: string;
}

export interface InsertSeatInviteResult {
  data: SeatInviteRow | null;
  error: { code?: string; message?: string } | null;
}

export interface UpdatePurchaseRequestResult {
  rowsAffected: number;
  error: { code?: string; message?: string } | null;
}

export interface EmailTemplateProps {
  inviteToken: string;
  employerName: string;
  employeeName?: string;
  claimUrl: string;
  appDeepLink: string;
}

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * Matches SendMailResult from lib/email/mailer.ts. Kept structurally typed (not
 * imported) so this module stays free of a direct mailer dependency and can
 * accept any adapter that returns a compatible shape.
 */
export type SendEmailResult =
  | { ok: true; id?: string }
  | { ok: false; skipped?: true; error?: string; error_name?: string };

export interface FulfillmentDeps {
  loadPurchaseRequest: (id: string) => Promise<PurchaseRequestRow | null>;
  findInviteById: (id: string) => Promise<SeatInviteRow | null>;
  findInviteByOrderId: (orderId: string) => Promise<SeatInviteRow | null>;
  insertSeatInvite: (row: {
    invite_token: string;
    email: string;
    status: string;
    course_id: string;
    created_by: string;
    order_id: string;
    expires_at: string;
    sent_at: string;
    created_at: string;
  }) => Promise<InsertSeatInviteResult>;
  updatePurchaseRequest: (
    id: string,
    patch: {
      status: string;
      resolved_at: string;
      related_order_id: string;
      related_seat_invite_id: string;
    },
  ) => Promise<UpdatePurchaseRequestResult>;
  sendEmail: (msg: { to: string; subject: string; html: string }) => Promise<SendEmailResult>;
  sendPushToUser: (userId: string, payload: PushPayload) => Promise<{ sent: number; failed: number }>;
  generateToken: () => string;
  renderEmailForEmployee: (props: EmailTemplateProps) => Promise<string>;
  now: () => Date;
  analytics: (name: string, data: Record<string, unknown>) => void;
}

export interface FulfillmentArgs {
  requestId: string;
  orderId: string;
  orderUserId: string;
  courseId: string;
  employerEmail: string | null;
  siteUrl: string;
}

export type FulfillmentOutcome =
  | { status: 'skipped_missing_request' }
  | { status: 'skipped_already_paid' }
  | { status: 'collision' }
  | {
      status: 'succeeded';
      inviteId: string;
      reusedInvite: boolean;
      updatedPurchaseRequest: boolean;
      /**
       * True iff deps.sendEmail returned { ok: true }. When false, the
       * seat_invite + purchase_requests.paid writes have already landed,
       * so the invite still exists; the employee just wasn't notified.
       * Callers (and dashboards) can requeue a manual notification.
       *
       * Retry deliveries that legitimately skip email (F2 — reusedInvite
       * on a row where PR is already paid) report emailDelivered=true
       * because the original delivery is the source of truth; we're not
       * claiming any new send occurred.
       */
      emailDelivered: boolean;
    };

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Run the ask-employer fulfillment pipeline. Returns an outcome describing what
 * happened; throws on genuinely transient failures (e.g. DB connection errors)
 * so the webhook's outer try/catch can log and return 200 to Stripe.
 *
 * Idempotency:
 *  - Looks up an existing invite first via purchase_request.related_seat_invite_id
 *    (the belt), then by order_id (the suspenders).
 *  - Update to purchase_requests uses a `status != 'paid'` predicate so retry
 *    deliveries report rowsAffected=0 and we skip the side effects.
 */
export async function runAskEmployerFulfillment(
  args: FulfillmentArgs,
  deps: FulfillmentDeps,
): Promise<FulfillmentOutcome> {
  const { requestId, orderId, orderUserId, courseId, employerEmail, siteUrl } = args;

  // Step 1 — Load purchase_requests row.
  const purchaseRequest = await deps.loadPurchaseRequest(requestId);
  if (!purchaseRequest) {
    console.log('[ask-employer-fulfillment] purchase_request not found', { request_id: requestId });
    return { status: 'skipped_missing_request' };
  }
  if (purchaseRequest.status === 'paid') {
    console.log('[ask-employer-fulfillment] purchase_request already paid, skipping', {
      request_id: requestId,
    });
    return { status: 'skipped_already_paid' };
  }

  // Step 2 — Idempotency: belt (PR link) then suspenders (order_id).
  let invite: SeatInviteRow | null = null;
  if (purchaseRequest.related_seat_invite_id) {
    invite = await deps.findInviteById(purchaseRequest.related_seat_invite_id);
  }
  if (!invite) {
    invite = await deps.findInviteByOrderId(orderId);
  }
  let reusedInvite = invite !== null;

  // Step 3 — Create the seat_invite if neither lookup found one.
  if (!invite) {
    const nowIso = deps.now().toISOString();
    const expiresIso = new Date(deps.now().getTime() + THIRTY_DAYS_MS).toISOString();
    const token = deps.generateToken();
    const { data, error } = await deps.insertSeatInvite({
      invite_token: token,
      email: purchaseRequest.employee_email,
      status: 'sent',
      course_id: courseId,
      created_by: orderUserId,
      order_id: orderId,
      expires_at: expiresIso,
      sent_at: nowIso,
      created_at: nowIso,
    });
    if (error) {
      // Unique-constraint collision on (created_by, course_id, email).
      // Employer has a pre-existing invite for this employee+course from a
      // different code path (e.g. earlier trainer-dashboard bulk invite).
      // We MUST NOT claim that pre-existing invite — that would corrupt lineage
      // and cause duplicate emails/push. Abort the branch, leave the PR row as
      // 'pending' so ops can resolve manually.
      if (error.code === '23505') {
        console.error('[ask-employer-fulfillment-collision]', {
          request_id: requestId,
          reason: 'unique_violation_on_created_by_course_email',
          order_id: orderId,
        });
        deps.analytics('exam_ask_employer_fulfillment_collision', {
          request_id: requestId,
          order_id: orderId,
        });
        return { status: 'collision' };
      }
      // Genuine DB error — let the outer webhook catch it and log + return 200.
      throw new Error(
        `seat_invites insert failed: ${error.code ?? 'unknown'} ${error.message ?? ''}`.trim(),
      );
    }
    if (!data) {
      throw new Error('seat_invites insert returned no data');
    }
    invite = data;
    reusedInvite = false;
  }

  // Step 4 — Update purchase_requests. The `status != 'paid'` predicate inside
  // the dep implementation makes retry deliveries a no-op (rowsAffected=0).
  const updateResult = await deps.updatePurchaseRequest(requestId, {
    status: 'paid',
    resolved_at: deps.now().toISOString(),
    related_order_id: orderId,
    related_seat_invite_id: invite.id,
  });
  if (updateResult.error) {
    throw new Error(
      `purchase_requests update failed: ${updateResult.error.code ?? 'unknown'} ${updateResult.error.message ?? ''}`.trim(),
    );
  }
  const updatedPurchaseRequest = updateResult.rowsAffected > 0;

  // If this was a retry (rowsAffected=0 and we reused an existing invite), skip
  // the employee-facing side effects — they already fired on the first
  // delivery. This is the retry idempotency F2 asks us to guarantee.
  if (!updatedPurchaseRequest && reusedInvite) {
    console.log('[ask-employer-fulfillment] retry detected, skipping employee side effects', {
      request_id: requestId,
      seat_invite_id: invite.id,
    });
    return {
      status: 'succeeded',
      inviteId: invite.id,
      reusedInvite: true,
      updatedPurchaseRequest: false,
      // Original delivery is the source of truth for email delivery; we're
      // not claiming a new send here and not reporting a spurious failure.
      emailDelivered: true,
    };
  }

  // Step 5 — Render + send ExamUnlockedEmail to the employee.
  const claimUrl = `${siteUrl.replace(/\/$/, '')}/r/${invite.invite_token}`;
  const appDeepLink = claimUrl;
  const html = await deps.renderEmailForEmployee({
    inviteToken: invite.invite_token,
    employerName: purchaseRequest.employer_name,
    claimUrl,
    appDeepLink,
  });
  const emailResult = await deps.sendEmail({
    to: purchaseRequest.employee_email,
    subject: 'Your OSHA forklift exam is unlocked',
    html,
  });
  const emailDelivered = emailResult?.ok === true;
  if (!emailDelivered) {
    // seat_invite + paid status already persisted upstream, so the invite
    // still exists and ops can requeue a manual notification. We emit an
    // analytics event so log-drain alerts can fire, then keep going to
    // push + happy-path analytics (both are cheap and benign on an already
    // persisted invite).
    const failure = emailResult as Extract<SendEmailResult, { ok: false }> | undefined;
    deps.analytics('exam_ask_employer_email_failed', {
      request_id: requestId,
      order_id: orderId,
      seat_invite_id: invite.id,
      email: purchaseRequest.employee_email,
      error: failure?.error ?? null,
      error_name: failure?.error_name ?? null,
    });
  }

  // Step 6 — Push notification (never throws per its contract).
  await deps.sendPushToUser(purchaseRequest.employee_user_id, {
    title: 'Your exam is unlocked',
    body: 'Tap to take your OSHA forklift certification exam.',
    data: { type: 'exam_ready' },
  });

  // Step 7 — Analytics.
  deps.analytics('exam_ask_employer_paid', {
    request_id: requestId,
    order_id: orderId,
    seat_invite_id: invite.id,
    employer_email: employerEmail,
    seats_requested: purchaseRequest.seats_requested,
    email_delivered: emailDelivered,
  });

  return {
    status: 'succeeded',
    inviteId: invite.id,
    reusedInvite,
    updatedPurchaseRequest,
    emailDelivered,
  };
}

/**
 * Guard condition used inline in the webhook around each existing
 * employer-facing side effect:
 *
 *   if (!shouldSuppressEmployerSideEffects(session.metadata, process.env.ENABLE_ASK_EMPLOYER_FULFILLMENT)) {
 *     // existing code, verbatim
 *   }
 *
 * Exported for unit tests proving R1–R5 (suppression keys on request_id,
 * NOT on the flag alone).
 */
export function shouldSuppressEmployerSideEffects(
  metadata: Record<string, string | null | undefined> | null | undefined,
  envFlag: string | undefined,
): boolean {
  const requestId = metadata?.request_id;
  const hasRequestId = typeof requestId === 'string' && requestId.length > 0;
  const flagOn = envFlag === '1';
  return hasRequestId && flagOn;
}
