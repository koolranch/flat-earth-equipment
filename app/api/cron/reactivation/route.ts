import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { runReactivation, formatSummary, todayEt } from '@/lib/reactivation/engine.server'

// Node runtime: engine uses supabase admin listUsers + long send loops
export const runtime = 'nodejs'
export const maxDuration = 300
export const dynamic = 'force-dynamic'

/**
 * Scheduled reactivation / nurture sender (see vercel.json crons):
 *   ?run=am — weekdays ~11:30 AM ET: Track A + Track B (all eligible) + Track C
 *   ?run=pm — legacy Monday slot; Track B moved to weekday AM (no-op)
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

  try {
    // Track B: weekday AM for all eligible (48h stall, 20–99%, one touch) — was
    // Monday-only AM/PM split; daily cadence recovers mid-training stalls faster.
    const summary = await runReactivation(
      run === 'am'
        ? { send: !dry, trackA: true, trackB: true, trackC: true, slot: 'all' }
        : { send: !dry, trackA: false, trackB: false, trackC: false, slot: 'pm' }
    )

    const sent = summary.sends.filter((s) => !s.dryRun && !s.error).length
    const report = formatSummary(summary)
    console.log(report)

    // PM cron is a legacy no-op (B moved to weekday AM); holiday hold / zero-send: skip report
    const noop = summary.skipped || run === 'pm' || (!dry && sent === 0 && summary.errors.length === 0)
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
