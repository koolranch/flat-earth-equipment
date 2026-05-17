/**
 * Renders the mobile-app promo block (and a tiny wrapper page) to
 * /tmp/preview-*.html so you can eyeball it before shipping. Dry run only;
 * no email is ever sent.
 *
 *   npx tsx scripts/preview-training-welcome-email.ts
 */
import { writeFileSync } from 'node:fs'
import { generateMobileAppBlock } from '../lib/email/mobile-app-block'

process.env.NEXT_PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.flatearthequipment.com'

function wrap(title: string, body: string): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${title}</title></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 24px auto; padding: 16px;">
<h1 style="font-size:16px;color:#6b7280;margin:0 0 16px 0">${title}</h1>
${body}
</body></html>`
}

const targets: Array<['learner' | 'trainer', string]> = [
  ['learner', '/tmp/preview-mobile-app-block-learner.html'],
  ['trainer', '/tmp/preview-mobile-app-block-trainer.html'],
]

for (const [variant, path] of targets) {
  const html = wrap(`Mobile app block — ${variant}`, generateMobileAppBlock(variant))
  writeFileSync(path, html, 'utf8')
  console.log(`wrote ${path}`)
}
