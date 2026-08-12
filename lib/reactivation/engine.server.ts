/**
 * Reactivation / nurture campaign engine — shared by the Vercel cron route
 * (app/api/cron/reactivation*) and the manual CLI (scripts/reactivation-batch.ts).
 *
 * Tracks:
 *   A touch 1 — 100% trained, unpaid, no passing exam, completed 36h–7d ago.
 *   A touch 2 — touch 1 sent >=5 days ago, still unpaid. Max 2 touches ever.
 *   B         — stalled 48h+ at 20–99%, unpaid, signup <=30d. Finish-training
 *               nudge only, NO checkout link. Weekday AM cron (slot all);
 *               CLI may still filter AM/PM via --slot.
 *   C touch 1 — free signup welcome (no order, not web training_purchase), 1h–48h.
 *   C touch 2 — still 0% / never-started, signup 48h–30d. One touch. No checkout pitch.
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
  trackC?: boolean         // welcome / 0% early funnel (default false for CLI back-compat)
  slot: 'am' | 'pm' | 'all' // Track B hash split (cron uses 'all'; CLI optional)
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
  eligible: { a1: number; a2: number; b: number; c1: number; c2: number }
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
  createdVia: string | null
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

// Gap cohort: aged-out exam-ready unpaid who never received Track A1.
// Eligible for touch 1 regardless of the 7-day age cap (reactivation_sends dedupes).
// Keep CLI-only gap batches local when possible so the Vercel cron does not
// surprise-send large aged cohorts; this set is still honored by the engine.
const GAP_INCLUDE = new Set([
  'joe1382@hotmail.com',
  'sunsmiles968@yahoo.com',
  'williebutler125@gmail.com',
  'mcelestine80@gmail.com',
  // 2026-07-31 AM gap batch
  'cd748990@gmail.com',
  'ingeh_victor@yahoo.com',
  'lexishodge22@gmail.com',
  'lisettavila@msn.com',
  'kevinmthorpe@yahoo.com',
  'remeur46@gmail.com',
  'rachella112@yahoo.com',
  'marilyn08calix@icloud.com',
  'jamieelliston4@gmail.com',
  'troutnathan2025@gmail.com',
  'rosadod0915@gmail.com',
  'toharris0623@gmail.com',
  'dwainyountz50@gmail.com',
  'andrew.olson2025@gmail.com',
  'hexaony@gmail.com',
  'jbiinc276@gmail.com',
  'itsswel@gmail.com',
  'dionholman8@gmail.com',
  'adelsbosse@gmail.com',
  'ericbanks1972@gmail.com',
  'yordain.rey88@gmail.com',
  'anthonydemattei73@gmail.com',
  'shytown0610@gmail.com',
  'rtolbert93@icloud.com',
])

const FROM = 'Forklift Certified <training@getforkliftcertified.com>'
const LIST_UNSUB = { 'List-Unsubscribe': '<mailto:training@getforkliftcertified.com?subject=unsubscribe>' }
const FOOTER = `---
Flat Earth Equipment LLC (Forklift Certified)
30 N Gould St Ste R, Sheridan, WY 82801
Reply "unsubscribe" to opt out of training reminders.`
const EMPLOYER_PS = `P.S. If this is for work, a lot of employers will cover the $49. Forward this to your manager, or reply if you want training set up for a whole crew.`

// v2 UTMs so post-copy-fix buy rates can be split from legacy sends
const LOGIN_A1 = 'https://www.flatearthequipment.com/login?utm_source=resend&utm_medium=email&utm_campaign=reactivation_a1_v2'
const LOGIN_A2 = 'https://www.flatearthequipment.com/login?utm_source=resend&utm_medium=email&utm_campaign=reactivation_a2_v2'
const LOGIN_B = 'https://www.flatearthequipment.com/login?utm_source=resend&utm_medium=email&utm_campaign=reactivation_b_v2'
const LOGIN_C1 = 'https://www.flatearthequipment.com/login?next=/training/module-1&utm_source=resend&utm_medium=email&utm_campaign=reactivation_c1'
const LOGIN_C2 = 'https://www.flatearthequipment.com/login?next=/training/module-1&utm_source=resend&utm_medium=email&utm_campaign=reactivation_c2'

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
  return `You signed up for Forklift Certified back on ${etDateLabel(c.signupAt)}. Your progress is still saved.\n\n`
}

function minutesLeft(progressPct: number): { done: number; mins: number; nextModule: number } {
  const done = Math.min(4, Math.floor(progressPct / 20))
  const mins = Math.max(5, Math.round(((5 - done) * 8) / 5) * 5)
  const nextModule = Math.min(5, done + 1)
  return { done, mins, nextModule }
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
    subject: 'Open the app and take your forklift exam',
    text: `${hi}

${coldLine(c)}Your training is done. Next step: open the Forklift Certified app and tap Go to Exam.

About 15 minutes, 80% to pass. Certificate same day, in your name. OSHA-aligned, good in all 50 states.

Prefer to pay by card on the web ($49)? Sign in with the same email you use in the app:
${LOGIN_A1}

If you forgot your password, use Forgot password on that login page. We will not reset it for you in this email.

Stuck? Reply and a real person will help.

${EMPLOYER_PS}

${FOOTER}`,
  }
}

export function trackA2Template(c: Candidate): { subject: string; text: string } {
  const hi = c.firstName ? `Hi ${c.firstName},` : 'Hi,'
  return {
    subject: 'Last check-in: your forklift exam is still open',
    text: `${hi}

One last note. Your modules are finished. The exam is still waiting.

Primary path: open the Forklift Certified app and tap Go to Exam.

Web backup ($49 by card, same email as the app):
${LOGIN_A2}

Forgot password? Use Forgot password on the login page. Reply if something else is blocking you.

${EMPLOYER_PS}

${FOOTER}`,
  }
}

export function trackBTemplate(c: Candidate): { subject: string; text: string } {
  const hi = c.firstName ? `Hi ${c.firstName},` : 'Hi,'
  const { done, mins, nextModule } = minutesLeft(c.progressPct)
  const almost = c.progressPct >= 60
  const subject = almost
    ? `Finish Module ${nextModule} — about ${mins} minutes left`
    : `Resume Module ${nextModule} — about ${mins} minutes left`
  const opener = almost
    ? `${done} of 5 modules done. About ${mins} minutes left. Pick up at Module ${nextModule}.`
    : `You have ${done} of 5 modules done. About ${mins} minutes left. Next up is Module ${nextModule}.`
  return {
    subject,
    text: `${hi}

${coldLine(c)}${opener}

Your progress is saved. Open the Forklift Certified app, or sign in on the web to continue:
${LOGIN_B}

No payment needed to finish training. Hit a snag? Reply and a real person will help.

${EMPLOYER_PS}

${FOOTER}`,
  }
}

export function trackC1Template(c: Candidate): { subject: string; text: string } {
  const hi = c.firstName ? `Hi ${c.firstName},` : 'Hi,'
  return {
    subject: 'Start your forklift training — Module 1 is ready',
    text: `${hi}

Welcome to Forklift Certified.

Study the five modules free. Pay $49 only when you take the final exam. OSHA-aligned certificate, same day, good in all 50 states. Your employer still does the hands-on evaluation at work.

Best next step: open the app, or sign in and start Module 1 here:
${LOGIN_C1}

Questions? Reply anytime.

${EMPLOYER_PS}

${FOOTER}`,
  }
}

export function trackC2Template(c: Candidate): { subject: string; text: string } {
  const hi = c.firstName ? `Hi ${c.firstName},` : 'Hi,'
  return {
    subject: 'Still need your forklift cert? Start Module 1',
    text: `${hi}

You signed up for Forklift Certified on ${etDateLabel(c.signupAt)}, but it looks like training has not started yet.

Module 1 takes a few minutes. Progress saves so you can stop and come back.

Open the app, or jump in on the web:
${LOGIN_C2}

Training is free until the exam. Reply if you want a hand getting started.

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

function isExcludedEmail(email: string): boolean {
  return EXCLUDE_DOMAINS.some((d) => email.endsWith(`@${d}`) || email.includes(d))
}

// --- main --------------------------------------------------------------------

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function runReactivation(opts: RunOptions): Promise<RunSummary> {
  const trackC = opts.trackC === true
  const summary: RunSummary = {
    mode: opts.send ? 'send' : 'dry-run',
    suppressedCount: 0,
    eligible: { a1: 0, a2: 0, b: 0, c1: 0, c2: 0 },
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
  const enrollByUser = new Map<string, { progress_pct: number; passed: boolean; updated_at: string }>()
  for (const e of enrollRes.data ?? []) {
    const prev = enrollByUser.get(e.user_id)
    if (!prev || new Date(e.updated_at).getTime() > new Date(prev.updated_at).getTime()) {
      enrollByUser.set(e.user_id, {
        progress_pct: e.progress_pct ?? 0,
        passed: !!e.passed,
        updated_at: e.updated_at,
      })
    }
  }
  const log = logRes.data ?? []
  const logged = (email: string, track: 'a' | 'b' | 'c', touch?: 1 | 2) =>
    log.find((l) => l.email === email && l.track === track && (touch === undefined || l.touch === touch))

  const toCandidateFromUser = (u: any, progressPct: number, trainingUpdatedAt: string): Candidate | null => {
    if (!u?.email) return null
    const email = String(u.email).toLowerCase()
    if (isExcludedEmail(email)) return null
    if (suppressed.has(email)) return null
    const fullName = nameById.get(u.id) || u.user_metadata?.full_name || null
    const createdVia = u.user_metadata?.created_via ? String(u.user_metadata.created_via) : null
    return {
      userId: u.id,
      email,
      firstName: fullName ? String(fullName).trim().split(/\s+/)[0] : null,
      signupAt: u.created_at,
      lastSignInAt: u.last_sign_in_at ?? null,
      progressPct,
      trainingUpdatedAt,
      createdVia,
    }
  }

  const a1: Candidate[] = []
  const a2: Candidate[] = []
  const b: Candidate[] = []

  for (const e of enrollRes.data ?? []) {
    if (e.passed || hasOrder.has(e.user_id) || hasPassed.has(e.user_id)) continue
    const u = userById.get(e.user_id)
    const c = toCandidateFromUser(u, e.progress_pct ?? 0, e.updated_at)
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

  // Track C: free signups with no order, not web checkout-first purchase accounts
  const c1: Candidate[] = []
  const c2: Candidate[] = []
  if (trackC) {
    for (const u of users) {
      if (!u?.email || hasOrder.has(u.id) || hasPassed.has(u.id)) continue
      const enroll = enrollByUser.get(u.id)
      if (enroll?.passed) continue
      const progressPct = enroll?.progress_pct ?? 0
      if (progressPct > 0) continue // started training — not early-funnel C
      const c = toCandidateFromUser(u, progressPct, enroll?.updated_at || u.created_at)
      if (!c) continue
      if (c.createdVia === 'training_purchase') continue // already got web welcome/credentials

      const signupH = hoursAgo(c.signupAt)
      const hasC1 = !!logged(c.email, 'c', 1)
      const hasC2 = !!logged(c.email, 'c', 2)

      if (!hasC1 && signupH >= 1 && signupH < 48) {
        c1.push(c)
      } else if (!hasC2 && signupH >= 48 && signupH <= 30 * 24) {
        // still 0% at 48h–30d (whether or not C1 was sent). 30d cap avoids
        // flooding the 80/run safety limit with years of cold never-starters.
        c2.push(c)
      }
    }
  }

  // Priority on send day: A > B > C (A/B already exclude paid/passed)
  const aEmails = new Set([...a1, ...a2].map((c) => c.email))
  let bFinal = b.filter((c) => !aEmails.has(c.email))
  if (opts.slot !== 'all') bFinal = bFinal.filter((c) => slotOf(c.email) === opts.slot)
  const abEmails = new Set([...aEmails, ...bFinal.map((c) => c.email)])
  const c1Final = c1.filter((c) => !abEmails.has(c.email))
  const c2Final = c2.filter((c) => !abEmails.has(c.email) && !c1Final.some((x) => x.email === c.email))

  summary.eligible = {
    a1: a1.length,
    a2: a2.length,
    b: bFinal.length,
    c1: c1Final.length,
    c2: c2Final.length,
  }

  const queue: Array<{
    c: Candidate
    campaign: string
    track: 'a' | 'b' | 'c'
    touch: 1 | 2
    tpl: { subject: string; text: string }
  }> = []
  if (opts.trackA) {
    for (const c of a1) queue.push({ c, campaign: 'reactivation_a1', track: 'a', touch: 1, tpl: trackA1Template(c) })
    for (const c of a2) queue.push({ c, campaign: 'reactivation_a2', track: 'a', touch: 2, tpl: trackA2Template(c) })
  }
  if (opts.trackB) {
    for (const c of bFinal) queue.push({ c, campaign: 'reactivation_b', track: 'b', touch: 1, tpl: trackBTemplate(c) })
  }
  if (trackC) {
    for (const c of c1Final) queue.push({ c, campaign: 'reactivation_c1', track: 'c', touch: 1, tpl: trackC1Template(c) })
    for (const c of c2Final) queue.push({ c, campaign: 'reactivation_c2', track: 'c', touch: 2, tpl: trackC2Template(c) })
  }

  // Priority order already A → B → C. Drain up to cap; remainder waits for next run.
  const capped = queue.slice(0, maxPerRun)
  if (queue.length > maxPerRun) {
    summary.errors.push(
      `Queue ${queue.length} exceeds cap ${maxPerRun}; sending first ${maxPerRun} (A/B/C priority). Remainder deferred.`
    )
  }

  for (const item of capped) {
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
    `Eligible: A1=${s.eligible.a1} A2=${s.eligible.a2} B=${s.eligible.b} C1=${s.eligible.c1} C2=${s.eligible.c2} | suppressed=${s.suppressedCount}`,
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
