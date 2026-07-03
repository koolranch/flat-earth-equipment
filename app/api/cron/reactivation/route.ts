import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { runReactivation, formatSummary, isMondayEt, todayEt } from '@/lib/reactivation/engine.server'

// Node runtime: engine uses supabase admin listUsers + long send loops
export const runtime = 'nodejs'
export const maxDuration = 300
export const dynamic = 'force-dynamic'

/**
 * Scheduled reactivation sender (see vercel.json crons):
 *   ?run=am — weekdays ~10:30–11:30 AM ET: Track A touch 1+2 daily; Track B AM half on Mondays
 *   ?run=pm — Mondays ~6:30 PM ET: Track B PM half only (send-time test slot)
 * Optional &dry=1 for a no-send preview.
 * Each real run emails a report to training@flatearthequipment.com.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const run = url.searchParams.get('run') === 'pm' ? 'pm' : 'am'
  const dry = url.searchParams.get('dry') === '1'
  const monday = isMondayEt()

  try {
    const summary = await runReactivation(
      run === 'am'
        ? { send: !dry, trackA: true, trackB: monday, slot: 'am' }
        : { send: !dry, trackA: false, trackB: monday, slot: 'pm' }
    )

    const sent = summary.sends.filter((s) => !s.dryRun && !s.error).length
    const report = formatSummary(summary)
    console.log(report)

    // PM slot outside Monday, or holiday hold: nothing to do — skip the report email
    const noop = summary.skipped || (run === 'pm' && !monday) || (!dry && sent === 0 && summary.errors.length === 0)
    if (!dry && !noop) {
      const resend = new Resend(process.env.RESEND_API_KEY!)
      await resend.emails.send({
        from: 'Flat Earth Equipment Training <training@flatearthequipment.com>',
        to: 'training@flatearthequipment.com',
        subject: `[reactivation cron] ${todayEt()} ${run.toUpperCase()} — ${sent} sent${summary.errors.length ? `, ${summary.errors.length} errors` : ''}`,
        text: report,
      })
    }

    return NextResponse.json({
      run,
      dry,
      monday,
      skipped: summary.skipped ?? null,
      eligible: summary.eligible,
      sent,
      errors: summary.errors,
    })
  } catch (e: any) {
    console.error('reactivation cron failed:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
