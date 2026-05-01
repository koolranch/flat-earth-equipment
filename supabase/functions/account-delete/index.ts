import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type StepResult = {
  error?: {
    message?: string;
    code?: string;
    details?: string;
  } | null;
};

class CleanupError extends Error {
  step: string;
  code?: string;

  constructor(step: string, message: string, code?: string) {
    super(message);
    this.name = "CleanupError";
    this.step = step;
    this.code = code;
  }
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

const failIfError = (step: string, result: StepResult) => {
  if (result.error) {
    throw new CleanupError(
      step,
      result.error.message ?? "Database cleanup failed",
      result.error.code,
    );
  }
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ ok: false, error: "method_not_allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error("[account-delete] missing required Supabase environment");
    return json({ ok: false, step: "config", message: "Server configuration error" }, 500);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!jwt) {
    return json({ ok: false, step: "authenticate", message: "Missing bearer token" }, 401);
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const service = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    console.log("[account-delete] step=authenticate");
    const { data: userData, error: userError } = await authClient.auth.getUser(jwt);
    if (userError || !userData.user) {
      return json({ ok: false, step: "authenticate", message: "Invalid or expired session" }, 401);
    }

    const userId = userData.user.id;
    const anonymizedEmail = `deleted-user-${userId.slice(0, 8)}@deleted.invalid`;

    const step = async (name: string, fn: () => Promise<void>) => {
      console.log(`[account-delete] step=${name} user=${userId}`);
      try {
        await fn();
      } catch (error) {
        if (error instanceof CleanupError) throw error;
        const message = error instanceof Error ? error.message : "Unknown cleanup error";
        throw new CleanupError(name, message);
      }
    };

    await step("push_tokens", async () => {
      failIfError("push_tokens", await service.from("push_tokens").delete().eq("user_id", userId));
    });

    await step("ephemeral_training_state", async () => {
      failIfError("exam_sessions", await service.from("exam_sessions").delete().eq("user_id", userId));
      failIfError("exam_papers", await service.from("exam_papers").delete().eq("user_id", userId));
      failIfError("exam_attempts", await service.from("exam_attempts").delete().eq("user_id", userId));
      failIfError("quiz_attempts", await service.from("quiz_attempts").delete().eq("user_id", userId));
      failIfError("module_progress", await service.from("module_progress").delete().eq("user_id", userId));
    });

    await step("purchase_requests", async () => {
      const retained = {
        employee_user_id: null,
        employee_email: anonymizedEmail,
        message: null,
      };

      failIfError(
        "purchase_requests_delete_unpaid",
        await service
          .from("purchase_requests")
          .delete()
          .eq("employee_user_id", userId)
          .in("status", ["pending", "declined", "expired"])
          .is("related_order_id", null)
          .is("related_seat_invite_id", null),
      );

      failIfError(
        "purchase_requests_paid",
        await service.from("purchase_requests").update(retained).eq("employee_user_id", userId).eq("status", "paid"),
      );
      failIfError(
        "purchase_requests_order_linked",
        await service.from("purchase_requests").update(retained).eq("employee_user_id", userId).not("related_order_id", "is", null),
      );
      failIfError(
        "purchase_requests_invite_linked",
        await service.from("purchase_requests").update(retained).eq("employee_user_id", userId).not("related_seat_invite_id", "is", null),
      );
      failIfError(
        "purchase_requests_remaining",
        await service.from("purchase_requests").update(retained).eq("employee_user_id", userId),
      );
    });

    await step("orders_and_enrollments", async () => {
      failIfError("orders", await service.from("orders").update({ user_id: null }).eq("user_id", userId));
      failIfError(
        "enrollments",
        await service
          .from("enrollments")
          .update({ user_id: null, learner_email: null, resume_state: null })
          .eq("user_id", userId),
      );
      failIfError("certificates", await service.from("certificates").update({ user_id: null }).eq("user_id", userId));
    });

    await step("practical_eval", async () => {
      failIfError(
        "practical_eval_requests_open",
        await service.from("practical_eval_requests").delete().eq("trainee_user_id", userId).is("completed_at", null),
      );
      failIfError(
        "practical_eval_requests_completed",
        await service
          .from("practical_eval_requests")
          .update({ trainee_user_id: null, note: null })
          .eq("trainee_user_id", userId),
      );

      failIfError(
        "practical_attempts_unfinished_trainee",
        await service.from("practical_attempts").delete().eq("trainee_user_id", userId).is("finished_at", null),
      );
      failIfError(
        "practical_attempts_unfinished_trainer",
        await service.from("practical_attempts").delete().eq("trainer_user_id", userId).is("finished_at", null),
      );
      failIfError(
        "practical_attempts_finished_trainee",
        await service
          .from("practical_attempts")
          .update({ trainee_user_id: null, trainee_signature_url: null, notes: null })
          .eq("trainee_user_id", userId),
      );
      failIfError(
        "practical_attempts_finished_trainer",
        await service
          .from("practical_attempts")
          .update({ trainer_user_id: null, trainer_signature_url: null, notes: null })
          .eq("trainer_user_id", userId),
      );
      failIfError("supervisor_leads", await service.from("supervisor_leads").update({ trainee_user_id: null }).eq("trainee_user_id", userId));
      failIfError("employer_evaluations_created_by", await service.from("employer_evaluations").update({ created_by: null }).eq("created_by", userId));
      failIfError("employer_evaluations_trainee", await service.from("employer_evaluations").update({ trainee_user_id: null }).eq("trainee_user_id", userId));
    });

    await step("org_and_seats", async () => {
      failIfError("seat_claims", await service.from("seat_claims").update({ user_id: null }).eq("user_id", userId));
      failIfError(
        "seat_invites_claimed_by",
        await service.from("seat_invites").update({ claimed_by: null, email: anonymizedEmail }).eq("claimed_by", userId),
      );
      failIfError("seat_invites_created_by", await service.from("seat_invites").update({ created_by: null }).eq("created_by", userId));
      failIfError("orgs_created_by", await service.from("orgs").update({ created_by: null }).eq("created_by", userId));
      failIfError("invitations_invited_by", await service.from("invitations").update({ invited_by: null }).eq("invited_by", userId));
      failIfError("org_members_manager", await service.from("org_members").update({ manager_id: null }).eq("manager_id", userId));
      failIfError("org_members", await service.from("org_members").delete().eq("user_id", userId));
    });

    await step("ancillary_user_records", async () => {
      failIfError("training_shares", await service.from("training_shares").delete().eq("user_id", userId));
      failIfError("unclaimed_purchases", await service.from("unclaimed_purchases").update({ claimed_by_user_id: null }).eq("claimed_by_user_id", userId));
      failIfError("referrals_referred", await service.from("referrals").update({ referred_id: null }).eq("referred_id", userId));
      failIfError("referrals_referrer", await service.from("referrals").delete().eq("referrer_id", userId));
      failIfError("referral_codes", await service.from("referral_codes").delete().eq("user_id", userId));
    });

    await step("delete_auth_user", async () => {
      const { error } = await service.auth.admin.deleteUser(userId);
      if (error) {
        throw new CleanupError("delete_auth_user", error.message, error.status?.toString());
      }
    });

    console.log(`[account-delete] success user=${userId}`);
    return json({ ok: true });
  } catch (error) {
    const step = error instanceof CleanupError ? error.step : "unknown";
    const message = error instanceof Error ? error.message : "Unknown error";
    const code = error instanceof CleanupError ? error.code : undefined;

    console.error("[account-delete] failure", { step, message, code });
    return json({ ok: false, step, message }, 500);
  }
});
