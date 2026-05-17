/**
 * Renders the "Download our mobile app" promo block used in transactional
 * welcome emails (single-learner and trainer/multi-seat).
 *
 * Kept in lib/email so it can be reused across email templates and previewed
 * by scripts/preview-training-welcome-email.ts without booting the Next.js
 * route handler. Route handler files in Next.js App Router can only export
 * HTTP methods plus a few config keys, so arbitrary helpers must live here.
 */

export const IOS_APP_URL =
  'https://apps.apple.com/us/app/forklift-certified-pro/id6759796469'
export const ANDROID_APP_URL =
  'https://play.google.com/store/apps/details?id=com.flateartheequipment.forkliftcertified'

export type MobileAppBlockVariant = 'learner' | 'trainer'

function withUtm(url: string, content: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}utm_source=welcome_email&utm_medium=email&utm_campaign=app_install&utm_content=${content}`
}

export function generateMobileAppBlock(variant: MobileAppBlockVariant): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.flatearthequipment.com'
  const iosHref = withUtm(IOS_APP_URL, variant)
  const androidHref = withUtm(ANDROID_APP_URL, variant)
  const appStoreImg = `${siteUrl}/app-badges/app-store.png`
  const googlePlayImg = `${siteUrl}/app-badges/google-play.png`

  const heading = variant === 'trainer'
    ? '📱 Tell your team about the mobile app'
    : '📱 Prefer your phone? Get the app'
  const body = variant === 'trainer'
    ? `Each operator can complete their training on iOS or Android using the same login from their seat invitation email — great for crews who don't sit at a desk.`
    : `Your same login works in our free mobile app — designed for taking training on the go.`
  const bullets = variant === 'trainer'
    ? ''
    : `
        <ul style="margin: 0 0 15px 0; padding-left: 20px; color: #374151; font-size: 14px;">
          <li style="margin-bottom: 5px;">Pick up exactly where you left off</li>
          <li style="margin-bottom: 5px;">Get gentle reminders so you don't lose momentum</li>
          <li style="margin-bottom: 5px;">View and share your certificate from your phone</li>
        </ul>`
  const footnote = variant === 'trainer'
    ? `<p style="margin: 12px 0 0 0; font-size: 12px; color: #6b7280;">You can also use the app yourself if you assigned a seat to your own account.</p>`
    : `<p style="margin: 12px 0 0 0; font-size: 12px; color: #6b7280;">Already started on the web? No problem — your progress syncs automatically.</p>`

  return `
      <!-- Mobile App Promo -->
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #1f2937; margin-top: 0; margin-bottom: 10px;">${heading}</h3>
        <p style="margin: 0 0 15px 0; font-size: 14px; color: #374151;">${body}</p>${bullets}
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0;">
          <tr>
            <td style="padding-right: 10px;">
              <a href="${iosHref}" style="text-decoration: none;">
                <img src="${appStoreImg}" alt="Download on the App Store" height="48" style="height: 48px; width: auto; display: block; border: 0;" />
              </a>
            </td>
            <td>
              <a href="${androidHref}" style="text-decoration: none;">
                <img src="${googlePlayImg}" alt="Get it on Google Play" height="48" style="height: 48px; width: auto; display: block; border: 0;" />
              </a>
            </td>
          </tr>
        </table>
        ${footnote}
      </div>
      `
}
