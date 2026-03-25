import type { Metadata } from 'next';
import Link from 'next/link';
import OpenInAppButton from './OpenInAppButton';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Practical Evaluation Invite | Forklift Certified',
  description:
    'Open a practical evaluation invite in the Forklift Certified app or review next steps in your browser.',
  robots: {
    index: false,
    follow: false,
  },
};

type JsonRecord = Record<string, unknown>;

type InviteViewModel = {
  traineeName: string | null;
  companyName: string | null;
  equipmentType: string | null;
  evaluatorName: string | null;
  status: string | null;
  requestStatus: string | null;
  expiresAt: string | null;
  updatedAt: string | null;
};

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function readString(record: JsonRecord | null, keys: string[]): string | null {
  if (!record) return null;

  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function pickFirstRecord(...values: unknown[]): JsonRecord | null {
  for (const value of values) {
    const record = asRecord(value);
    if (record) return record;
  }

  return null;
}

function formatStatus(value: string | null): string | null {
  if (!value) return null;

  return value
    .split(/[_-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatDate(value: string | null): string | null {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

async function getInvite(token: string): Promise<
  | { ok: true; invite: InviteViewModel }
  | { ok: false; error: string }
> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return {
      ok: false,
      error: 'This invite page is temporarily unavailable. Please try again shortly.',
    };
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/practical-eval-invite`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
        body: JSON.stringify({ action: 'get', token }),
        cache: 'no-store',
      }
    );

    const payload = await response
      .json()
      .catch(() => ({ error: 'Unable to read invite details.' }));

    const payloadRecord = asRecord(payload);
    const payloadData = pickFirstRecord(payloadRecord?.data);
    const inviteRecord = pickFirstRecord(
      payloadRecord?.invite,
      payloadData?.invite,
      payloadData,
      payloadRecord
    );

    const payloadError =
      readString(payloadRecord, ['error', 'message']) ??
      readString(payloadData, ['error', 'message']);

    if (!response.ok || payloadError) {
      return {
        ok: false,
        error: payloadError || 'This invite link is invalid or no longer available.',
      };
    }

    const traineeRecord = pickFirstRecord(inviteRecord?.trainee, payloadData?.trainee);
    const evaluatorRecord = pickFirstRecord(
      inviteRecord?.evaluator,
      payloadData?.evaluator
    );

    return {
      ok: true,
      invite: {
        traineeName:
          readString(inviteRecord, ['trainee_name', 'traineeName', 'learner_name', 'name']) ??
          readString(traineeRecord, ['full_name', 'name', 'trainee_name']),
        companyName: readString(inviteRecord, ['company', 'company_name', 'site_name']),
        equipmentType: readString(inviteRecord, [
          'equipment_type',
          'equipmentType',
          'truck_type',
        ]),
        evaluatorName:
          readString(inviteRecord, ['evaluator_name', 'evaluatorName']) ??
          readString(evaluatorRecord, ['name', 'full_name']),
        status: readString(inviteRecord, ['status', 'invite_status']),
        requestStatus: readString(inviteRecord, [
          'request_status',
          'evaluation_status',
          'practical_status',
        ]),
        expiresAt: readString(inviteRecord, ['expires_at', 'expiresAt']),
        updatedAt: readString(inviteRecord, ['updated_at', 'updatedAt', 'completed_at']),
      },
    };
  } catch {
    return {
      ok: false,
      error: 'We could not load this invite right now. Please try again shortly.',
    };
  }
}

function StatusPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
      {label}: {value}
    </div>
  );
}

export default async function PracticalEvalInvitePage({
  params,
}: {
  params: { token: string };
}) {
  const token = params.token;
  const deepLink = `forklift-certified://invite/practical-eval/${token}`;
  const result = await getInvite(token);

  if (!result.ok) {
    const isExpired = /expired/i.test(result.error);

    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-xl rounded-2xl border bg-white p-6 shadow-sm">
          <div
            className={`mb-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              isExpired
                ? 'bg-amber-100 text-amber-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            Invite Unavailable
          </div>

          <h1 className="text-2xl font-bold text-slate-900">
            Practical Evaluation Invite
          </h1>

          <p className="mt-3 text-slate-600">{result.error}</p>

          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            If you received this link in error, ask the trainee or training administrator
            to send a fresh invite.
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="rounded-2xl bg-[#F76511] px-5 py-3 font-semibold text-white hover:bg-[#E55A0C]"
            >
              Contact Support
            </Link>
            <a
              href={deepLink}
              className="rounded-2xl border border-slate-300 px-5 py-3 font-medium text-slate-900 hover:bg-slate-50"
            >
              Try App Link Anyway
            </a>
          </div>
        </div>
      </main>
    );
  }

  const { invite } = result;
  const status = formatStatus(invite.status);
  const requestStatus = formatStatus(invite.requestStatus);
  const expiresAt = formatDate(invite.expiresAt);
  const updatedAt = formatDate(invite.updatedAt);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
          <header className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F76511]/10">
              <svg
                className="h-8 w-8 text-[#F76511]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z"
                />
              </svg>
            </div>
            <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#F76511]">
              Forklift Certified
            </div>
            <h1 className="text-3xl font-bold text-slate-900">
              Practical Evaluation Invite
            </h1>
            <p className="mt-3 text-slate-600">
              Review the invite details here, then open it in the app to complete the
              practical evaluation flow.
            </p>
          </header>

          <section className="mb-6 rounded-2xl bg-slate-50 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Trainee
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {invite.traineeName || 'Forklift Certified trainee'}
                </p>
              </div>
              {invite.companyName && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Company / Site
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {invite.companyName}
                  </p>
                </div>
              )}
              {invite.equipmentType && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Equipment
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{invite.equipmentType}</p>
                </div>
              )}
              {invite.evaluatorName && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Requested Evaluator
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{invite.evaluatorName}</p>
                </div>
              )}
            </div>
          </section>

          {(status || requestStatus || expiresAt || updatedAt) && (
            <section className="mb-6 flex flex-wrap gap-2">
              {status && <StatusPill label="Invite" value={status} />}
              {requestStatus && <StatusPill label="Evaluation" value={requestStatus} />}
              {expiresAt && <StatusPill label="Expires" value={expiresAt} />}
              {updatedAt && <StatusPill label="Updated" value={updatedAt} />}
            </section>
          )}

          <section className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <h2 className="text-base font-semibold text-blue-900">How to use this invite</h2>
            <p className="mt-2 text-sm text-blue-800">
              The fastest path is to open this invite in the Forklift Certified app. If
              you are on a desktop or the app is not installed on this device, keep this
              page open and use the same link on a phone or tablet with the app
              installed.
            </p>
          </section>

          <section className="space-y-3">
            <OpenInAppButton deepLink={deepLink} />

            <a
              href={deepLink}
              className="block w-full rounded-2xl border border-slate-300 px-5 py-3 text-center font-medium text-slate-900 hover:bg-slate-50"
            >
              Manual Deep Link
            </a>

            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-medium text-slate-800">Desktop or browser fallback</p>
              <p className="mt-2">
                This page is intentionally browser-openable so the invite no longer 404s.
                If the app does not open here, reopen this same website link on a mobile
                device with Forklift Certified installed.
              </p>
              <p className="mt-3 break-all rounded-lg border border-slate-200 bg-white p-3 font-mono text-xs text-slate-700">
                {deepLink}
              </p>
            </div>
          </section>
        </div>

        <footer className="mt-6 text-center text-xs text-slate-500">
          <p>Powered by Flat Earth Safety</p>
          <p>Need help? Contact support at support@flatearthequipment.com</p>
        </footer>
      </div>
    </main>
  );
}
