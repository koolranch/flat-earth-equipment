#!/usr/bin/env tsx
/**
 * Manual runner for the reactivation campaign engine
 * (lib/reactivation/engine.server.ts — same code the Vercel cron uses, and the
 * same Supabase `reactivation_sends` log, so manual and scheduled runs never
 * double-send).
 *
 * Usage:
 *   npx tsx scripts/reactivation-batch.ts                      # dry run, all tracks
 *   npx tsx scripts/reactivation-batch.ts --track a            # dry run, Track A only
 *   npx tsx scripts/reactivation-batch.ts --track b --slot am  # dry run, Track B AM half
 *   npx tsx scripts/reactivation-batch.ts --send --track a     # REAL SEND
 *   npx tsx scripts/reactivation-batch.ts --test you@x.com     # send template samples
 */

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { Resend } from 'resend'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

// Load production env BEFORE importing the engine (it reads process.env)
const envFile = Object.fromEntries(
  readFileSync(join(ROOT, '.env.production.local'), 'utf8')
    .split('\n')
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, '')]
    })
)
for (const [k, v] of Object.entries(envFile)) {
  if (!process.env[k]) process.env[k] = v as string
}

const { runReactivation, formatSummary, trackA1Template, trackA2Template, trackBTemplate } = await import(
  '../lib/reactivation/engine.server'
)

const args = process.argv.slice(2)
const SEND = args.includes('--send')
const trackArg = args.includes('--track') ? args[args.indexOf('--track') + 1] : 'all'
const slotArg = (args.includes('--slot') ? args[args.indexOf('--slot') + 1] : 'all') as 'am' | 'pm' | 'all'
const testTo = args.includes('--test') ? args[args.indexOf('--test') + 1] : null

async function main() {
  if (testTo) {
    const resend = new Resend(process.env.RESEND_API_KEY!)
    const sample = {
      userId: 'test', email: testTo, firstName: 'Sample',
      signupAt: new Date(Date.now() - 20 * 864e5).toISOString(),
      lastSignInAt: new Date(Date.now() - 20 * 864e5).toISOString(),
      progressPct: 40, trainingUpdatedAt: new Date().toISOString(),
    }
    for (const [label, tpl] of [
      ['A touch 1', trackA1Template(sample)],
      ['A touch 2', trackA2Template(sample)],
      ['B 20-59%', trackBTemplate(sample)],
      ['B 60-99%', trackBTemplate({ ...sample, progressPct: 80 })],
    ] as const) {
      const r = await resend.emails.send({
        from: 'Flat Earth Equipment Training <training@flatearthequipment.com>',
        to: testTo,
        subject: `[TEST ${label}] ${tpl.subject}`,
        text: tpl.text,
      })
      console.log(`test ${label}: ${r.error ? 'FAIL ' + r.error.message : 'ok ' + r.data!.id}`)
      await new Promise((res) => setTimeout(res, 1100))
    }
    return
  }

  console.log(`Mode: ${SEND ? 'REAL SEND' : 'dry run'} | track=${trackArg} | slot=${slotArg}\n`)
  const summary = await runReactivation({
    send: SEND,
    trackA: trackArg === 'a' || trackArg === 'all',
    trackB: trackArg === 'b' || trackArg === 'all',
    slot: slotArg,
  })
  console.log(formatSummary(summary))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
