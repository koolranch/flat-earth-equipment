/**
 * Reactivation campaign engine — shared by the Vercel cron route
 * (app/api/cron/reactivation*) and the manual CLI (scripts/reactivation-batch.ts).
 *
 * Two-track model (spec: forklift-certified docs/plans/next-build-backlog.md):
 *   Track A touch 1 — 100% trained, unpaid, no passing exam, completed 36h–7d ago.
 *   Track A touch 2 — touch 1 sent >=5 days ago, still unpaid. Max 2 touches ever.
 *   Track B         — stalled 48h+ at 20–99%, unpaid, signup <=30d. Finish-training
 *                     nudge only, NO checkout link. Weekly (Mondays), AM/PM split.
 *
 * Sent log lives in Supabase table `reactivation_sends` (service-role only) so
 * cron and manual runs share dedupe state and the 2-touch cap.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export interface RunOptions {
  send: boolean            // false = dry run
  trackA: boolean
  trackB: boolean
  slot: 'am' | 'pm' | 'all' // Track B split
  maxPerRun?: number        // safety cap, default 80
}

export interface SendRecord {
  email: string
  campaign: string
  progressPct: number
  resendId?: string
  error?: string
  dryRun: boolean
}

export interface RunSummary {
  mode: 'send' | 'dry-run'
  skipped?: string
  suppressedCount: number
  eligible: { a1: number; a2: number; b: number }
  sends: SendRecord[]
  errors: string[]
}

interface Candidate {
  userId: string
  email: string
  firstName: string | null
  signupAt: string
  lastSignInAt: string | null
  progressPct: number
  trainingUpdatedAt: string
}

// Holiday hold dates (ET calendar) — no sends on these days.
const SKIP_DATES_ET = ['2026-07-03']

// QA/synthetic + common disposable-email domains (per reactivation hygiene rules)
const EXCLUDE_DOMAINS = [
  'flatearthequipment.com', 'example.test', 'example.com',
  'mailinator.com', 'guerrillamail.com', 'minitts.net', 'tempmail.com',
  'temp-mail.org', '10minutemail.com', 'yopmail.com', 'sharklasers.com',
  'trashmail.com', 'getnada.com', 'dispostable.com', 'maildrop.cc',
]

// Gap cohort: completed training AFTER the Jun 25 bulk broadcast but BEFORE the
// manual one-off queue started — never received any touch. Eligible for touch 1
// regardless of the 7-day age cap (the sends log dedupes once sent).
const GAP_INCLUDE = new Set([
  'joe1382@hotmail.com',
  'sunsmiles968@yahoo.com',
  'williebutler125@gmail.com',
  'mcelestine80@gmail.com',
])

const FROM = 'Flat Earth Equipment Training <training@flatearthequipment.com>'
const LIST_UNSUB = { 'List-Unsubscribe': '<mailto:training@flatearthequipment.com?subject=unsubscribe>' }
const FOOTER = `---
Flat Earth Equipment LLC
30 N Gould St Ste R, Sheridan, WY 82801
Reply "unsubscribe" to opt out of training reminders.`
const EMPLOYER_PS = `P.S. If this is for work, a lot of employers will cover the $49. Forward this to your manager, or reply if you want training set up for a whole crew.`

const LOGIN_A1 = 'https://www.flatearthequipment.com/login?utm_source=resend&utm_medium=email&utm_campaign=reactivation_a1'
const LOGIN_A2 = 'https://www.flatearthequipment.com/login?utm_source=resend&utm_medium=email&utm_campaign=reactivation_a2'

const hoursAgo = (iso: string) => (Date.now() - new Date(iso).getTime()) / 36e5
const daysAgo = (iso: string) => hoursAgo(iso) / 24
const etDateLabel = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric' })

export function todayEt(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
}

export function isMondayEt(): boolean {
  return new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York', weekday: 'short' }) === 'Mon'
}

function coldLine(c: Candidate): string {
  if (!c.lastSignInAt || daysAgo(c.lastSignInAt) <= 14) return ''
  return `Quick note from Forklift Certified. You signed up back on ${etDateLabel(c.signupAt)}.\n\n`
}

function minutesLeft(progressPct: number): { done: number; mins: number } {
  const done = Math.min(4, Math.floor(progressPct / 20))
  const mins = Math.max(5, Math.round(((5 - done) * 8) / 5) * 5)
  return { done, mins }
}

export function slotOf(email: string): 'am' | 'pm' {
  let n = 0
  for (const ch of email) n += ch.charCodeAt(0)
  return n % 2 === 0 ? 'am' : 'pm'
}

// --- templates ---------------------------------------------------------------

export function trackA1Template(c: Candidate): { subject: string; text: string } {
  const hi = c.firstName ? `Hi ${c.firstName},` : 'Hi,'
  return {
    subject: 'Your exam is ready when you are',
    text: `${hi}

${coldLine(c)}You finished all 5 training modules. Nice work.

All that's left is the final exam. About 15 minutes, 80% to pass.

Your certificate is issued the same day, in your name. OSHA-aligned, good in all 50 states.

Easiest way: open the Forklift Certified app and tap Go to Exam.

Rather pay by card on the web? Sign in with the same email you use in the app, $49:
${LOGIN_A1}

Stuck on anything? Just reply. A real person reads these.

${EMPLOYER_PS}

${FOOTER}`,
  }
}

export function trackA2Template(c: Candidate): { subject: string; text: string } {
  const hi = c.firstName ? `Hi ${c.firstName},` : 'Hi,'
  return {
    subject: 'Still want your forklift cert?',
    text: `${hi}

Checking in one last time. Your training is done and the exam is still waiting.

15 minutes, 80% to pass, certificate the same day.

In the app: tap Go to Exam.

Or on the web ($49 by card, sign in with the same email you use in the app):
${LOGIN_A2}

If something held you up, reply and tell me. Happy to help.

${EMPLOYER_PS}

${FOOTER}`,
  }
}

export function trackBTemplate(c: Candidate): { subject: string; text: string } {
  const hi = c.firstName ? `Hi ${c.firstName},` : 'Hi,'
  const { done, mins } = minutesLeft(c.progressPct)
  const almost = c.progressPct >= 60
  const subject = almost
    ? `You're about ${mins} minutes from finishing`
    : `About ${mins} minutes left on your forklift training`
  const opener = almost
    ? `You're almost there. ${done} of 5 modules done, about ${mins} minutes to go.`
    : `You knocked out ${done} of the 5 training modules. About ${mins} minutes to go.`
  return {
    subject,
    text: `${hi}

${coldLine(c)}${opener}

Finish that and the exam unlocks. Your progress is saved, so the app picks up right where you stopped.

Hit a snag? Just reply. A real person reads these.

${EMPLOYER_PS}

${FOOTER}`,
  }
}

// --- data --------------------------------------------------------------------

function serviceClient(): SupabaseClient {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

async function listAllUsers(supabase: SupabaseClient) {
  const users: any[] = []
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw error
    users.push(...data.users)
    if (data.users.length < 1000) break
  }
  return users
}

async function fetchSuppressed(supabase: SupabaseClient, resend: Resend): Promise<Set<string>> {
  const suppressed = new Set<string>()
  const { data: failed } = await supabase.from('failed_emails').select('email')
  for (const f of failed ?? []) if (f.email) suppressed.add(String(f.email).toLowerCase())
  try {
    const audiences = await resend.audiences.list()
    for (const aud of audiences.data?.data ?? []) {
      const contacts = await resend.contacts.list({ audienceId: aud.id })
      for (const ct of contacts.data?.data ?? []) {
        if (ct.unsubscribed && ct.email) suppressed.add(ct.email.toLowerCase())
      }
    }
  } catch {
    // audience API unavailable — domain filters + Resend global suppression still apply
  }
  return suppressed
}

// --- main --------------------------------------------------------------------

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function runReactivation(opts: RunOptions): Promise<RunSummary> {
  const summary: RunSummary = {
    mode: opts.send ? 'send' : 'dry-run',
    suppressedCount: 0,
    eligible: { a1: 0, a2: 0, b: 0 },
    sends: [],
    errors: [],
  }

  if (opts.send && SKIP_DATES_ET.includes(todayEt())) {
    summary.skipped = `holiday hold (${todayEt()})`
    return summary
  }

  const supabase = serviceClient()
  const resend = new Resend(process.env.RESEND_API_KEY!)
  const maxPerRun = opts.maxPerRun ?? 80

  const [users, enrollRes, ordersRes, examRes, profilesRes, logRes, suppressed] = await Promise.all([
    listAllUsers(supabase),
    supabase.from('enrollments').select('user_id, progress_pct, passed, updated_at'),
    supabase.from('orders').select('user_id'),
    supabase.from('exam_attempts').select('user_id').eq('passed', true),
    supabase.from('profiles').select('id, full_name'),
    supabase.from('reactivation_sends').select('email, track, touch, sent_at'),
    fetchSuppressed(supabase, resend),
  ])
  if (enrollRes.error) throw enrollRes.error
  if (logRes.error) throw logRes.error

  summary.suppressedCount = suppressed.size
  const hasOrder = new Set((ordersRes.data ?? []).map((o) => o.user_id))
  const hasPassed = new Set((examRes.data ?? []).map((e) => e.user_id))
  const nameById = new Map((profilesRes.data ?? []).map((p) => [p.id, p.full_name]))
  const userById = new Map(users.map((u) => [u.id, u]))
  const log = logRes.data ?? []
  const logged = (email: string, track: 'a' | 'b', touch?: 1 | 2) =>
    log.find((l) => l.email === email && l.track === track && (touch === undefined || l.touch === touch))

  const toCandidate = (e: any): Candidate | null => {
    const u = userById.get(e.user_id)
    if (!u?.email) return null
    const email = u.email.toLowerCase()
    if (EXCLUDE_DOMAINS.some((d) => email.endsWith(`@${d}`) || email.includes(d))) return null
    if (suppressed.has(email)) return null
    const fullName = nameById.get(e.user_id) || u.user_metadata?.full_name || null
    return {
      userId: e.user_id,
      email,
      firstName: fullName ? String(fullName).trim().split(/\s+/)[0] : null,
      signupAt: u.created_at,
      lastSignInAt: u.last_sign_in_at ?? null,
      progressPct: e.progress_pct ?? 0,
      trainingUpdatedAt: e.updated_at,
    }
  }

  const a1: Candidate[] = []
  const a2: Candidate[] = []
  const b: Candidate[] = []

  for (const e of enrollRes.data ?? []) {
    if (e.passed || hasOrder.has(e.user_id) || hasPassed.has(e.user_id)) continue
    const c = toCandidate(e)
    if (!c) continue

    if (c.progressPct === 100) {
      const h = hoursAgo(c.trainingUpdatedAt)
      const t1 = logged(c.email, 'a', 1)
      const t2 = logged(c.email, 'a', 2)
      if (t2) continue // hard cap: 2 touches ever
      if (t1) {
        if (daysAgo(t1.sent_at) >= 5) a2.push(c)
      } else if ((h >= 36 && h <= 7 * 24) || GAP_INCLUDE.has(c.email)) {
        a1.push(c)
      }
    } else if (c.progressPct >= 20 && c.progressPct <= 99) {
      if (daysAgo(c.signupAt) > 30) continue
      if (hoursAgo(c.trainingUpdatedAt) < 48) continue
      if (logged(c.email, 'b')) continue
      b.push(c)
    }
  }

  // Track A wins collisions on send day
  const aEmails = new Set([...a1, ...a2].map((c) => c.email))
  let bFinal = b.filter((c) => !aEmails.has(c.email))
  if (opts.slot !== 'all') bFinal = bFinal.filter((c) => slotOf(c.email) === opts.slot)

  summary.eligible = { a1: a1.length, a2: a2.length, b: bFinal.length }

  const queue: Array<{ c: Candidate; campaign: string; track: 'a' | 'b'; touch: 1 | 2; tpl: { subject: string; text: string } }> = []
  if (opts.trackA) {
    for (const c of a1) queue.push({ c, campaign: 'reactivation_a1', track: 'a', touch: 1, tpl: trackA1Template(c) })
    for (const c of a2) queue.push({ c, campaign: 'reactivation_a2', track: 'a', touch: 2, tpl: trackA2Template(c) })
  }
  if (opts.trackB) {
    for (const c of bFinal) queue.push({ c, campaign: 'reactivation_b', track: 'b', touch: 1, tpl: trackBTemplate(c) })
  }

  if (opts.send && queue.length > maxPerRun) {
    summary.errors.push(`Aborted: queue size ${queue.length} exceeds safety cap ${maxPerRun} — review cohorts manually.`)
    return summary
  }

  for (const item of queue) {
    if (!opts.send) {
      summary.sends.push({ email: item.c.email, campaign: item.campaign, progressPct: item.c.progressPct, dryRun: true })
      continue
    }
    try {
      const result = await resend.emails.send({
        from: FROM,
        to: item.c.email,
        subject: item.tpl.subject,
        text: item.tpl.text,
        headers: LIST_UNSUB,
      })
      if (result.error) {
        summary.sends.push({ email: item.c.email, campaign: item.campaign, progressPct: item.c.progressPct, error: result.error.message, dryRun: false })
        summary.errors.push(`${item.c.email}: ${result.error.message}`)
      } else {
        summary.sends.push({ email: item.c.email, campaign: item.campaign, progressPct: item.c.progressPct, resendId: result.data!.id, dryRun: false })
        const { error: insertError } = await supabase.from('reactivation_sends').insert({
          email: item.c.email,
          track: item.track,
          touch: item.touch,
          sent_at: new Date().toISOString(),
          resend_id: result.data!.id,
          campaign: item.campaign,
        })
        if (insertError) summary.errors.push(`LOG WRITE FAILED for ${item.c.email}: ${insertError.message} — record manually to avoid duplicate sends`)
      }
    } catch (e: any) {
      summary.errors.push(`${item.c.email}: ${e.message}`)
    }
    await sleep(700)
  }

  return summary
}

/** Plain-text run report (used for the cron summary email + CLI output). */
export function formatSummary(s: RunSummary): string {
  const lines = [
    `Reactivation run — ${s.mode}${s.skipped ? ` — SKIPPED: ${s.skipped}` : ''}`,
    `Eligible: A1=${s.eligible.a1} A2=${s.eligible.a2} B=${s.eligible.b} | suppressed=${s.suppressedCount}`,
    ...s.sends.map((r) =>
      r.dryRun
        ? `  [dry] ${r.campaign} -> ${r.email} (${r.progressPct}%)`
        : r.error
          ? `  FAIL ${r.campaign} -> ${r.email}: ${r.error}`
          : `  sent ${r.campaign} -> ${r.email} (${r.resendId})`
    ),
    ...(s.errors.length ? ['Errors:', ...s.errors.map((e) => `  ${e}`)] : []),
  ]
  return lines.join('\n')
}
