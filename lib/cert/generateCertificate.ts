import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import { createHash } from 'crypto'
import type { Locale } from '@/lib/getUserLocale'

/* CDN for static images */
const CDN = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/'
const LOGO_PNG = CDN + 'logo_128.png'
const SEAL_PNG = CDN + 'seal_orange.png'

export async function generateCertificate(params: {
  certId: string
  student: string
  course: string
  completedAt: string // ISO
  locale?: Locale
}) {
  const { certId, student, course, completedAt, locale = 'en' } = params
  
  /* ───── translation strings ───── */
  const t = {
    en: {
      certificate: 'CERTIFICATE OF COMPLETION',
      hasCompleted: 'has successfully completed',
      dateCompleted: 'Date completed:',
      validThrough: 'Valid through:',
      subjectsCovered: 'Subjects covered: 29 CFR 1910.178 (l)(3)(i–ii)',
      evaluatorSig: 'On-truck evaluator signature',
      evaluationDate: 'Evaluation date',
      disclaimer: 'Formal instruction only. OSHA requires hands-on evaluation by employer before independent operation.'
    },
    es: {
      certificate: 'CERTIFICADO DE FINALIZACIÓN',
      hasCompleted: 'ha completado satisfactoriamente',
      dateCompleted: 'Fecha de finalización:',
      validThrough: 'Válido hasta:',
      subjectsCovered: 'Temas cubiertos: 29 CFR 1910.178 (l)(3)(i–ii)',
      evaluatorSig: 'Firma del evaluador en el equipo',
      evaluationDate: 'Fecha de evaluación',
      disclaimer: 'Solo instrucción formal. OSHA requiere evaluación práctica por el empleador antes de operación independiente.'
    }
  }[locale]
  
  const pdf = await PDFDocument.create()
  pdf.setTitle(t.certificate)
  pdf.setLanguage(locale === 'es' ? 'es-ES' : 'en-US')

  const page = pdf.addPage([792, 612]) // landscape Letter
  const { width, height } = page.getSize()

  /* fonts */
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)

  /* brand logo */
  const logoBytes = await fetch(LOGO_PNG).then(r => r.arrayBuffer())
  const logo = await pdf.embedPng(logoBytes)
  page.drawImage(logo, { x: 40, y: height - 100, width: 80, height: 80 })

  /* decorative seal (watermark) */
  const sealBytes = await fetch(SEAL_PNG).then(r => r.arrayBuffer())
  const seal = await pdf.embedPng(sealBytes)
  page.drawImage(seal, {
    x: width / 2 - 100,
    y: height / 2 - 100,
    width: 200,
    height: 200,
    opacity: 0.1
  })

  /* diagonal ID watermark - simplified without rotation */
  page.drawText(certId, {
    x: width - 200,
    y: height / 2,
    size: 40,
    font,
    color: rgb(0.9, 0.9, 0.9),
    opacity: 0.15
  })

  /* header */
  const headerWidth = bold.widthOfTextAtSize(t.certificate, 28)
  page.drawText(t.certificate, {
    x: (width - headerWidth) / 2,
    y: height - 140,
    size: 28,
    font: bold,
    color: rgb(0.12, 0.15, 0.25)
  })

  /* student name */
  const nameWidth = bold.widthOfTextAtSize(student, 22)
  page.drawText(student, {
    x: (width - nameWidth) / 2,
    y: height - 200,
    size: 22,
    font: bold,
    color: rgb(0, 0, 0)
  })

  /* course title */
  const courseWidth = font.widthOfTextAtSize(course, 16)
  page.drawText(course, {
    x: (width - courseWidth) / 2,
    y: height - 230,
    size: 16,
    font,
    color: rgb(0.2, 0.2, 0.2)
  })

  /* OSHA subjects line */
  const oshaWidth = font.widthOfTextAtSize(t.subjectsCovered, 12)
  page.drawText(t.subjectsCovered, {
    x: (width - oshaWidth) / 2,
    y: height - 255,
    size: 12,
    font
  })

  /* dates */
  const completed = dayjs(completedAt).locale(locale)
  const expires = completed.add(3, 'year')
  const dateY = height - 300
  
  const dateFormat = locale === 'es' ? 'D [de] MMMM [de] YYYY' : 'MMM D, YYYY'
  const completedText = `${t.dateCompleted} ${completed.format(dateFormat)}`
  const expiresText = `${t.validThrough}  ${expires.format(dateFormat)}`
  
  page.drawText(completedText, {
    x: 60,
    y: dateY,
    size: 12,
    font
  })
  page.drawText(expiresText, {
    x: width / 2 + 20,
    y: dateY,
    size: 12,
    font
  })

  /* evaluator signature block */
  page.drawLine({
    start: { x: 60, y: dateY - 40 },
    end: { x: width / 2 - 20, y: dateY - 40 },
    thickness: 0.5,
    color: rgb(0, 0, 0)
  })
  page.drawText(t.evaluatorSig, {
    x: 60,
    y: dateY - 55,
    size: 8,
    font
  })
  page.drawLine({
    start: { x: width / 2 + 20, y: dateY - 40 },
    end: { x: width - 60, y: dateY - 40 },
    thickness: 0.5,
    color: rgb(0, 0, 0)
  })
  page.drawText(t.evaluationDate, {
    x: width / 2 + 20,
    y: dateY - 55,
    size: 8,
    font
  })

  /* QR code */
  const certUrl = `https://flatearthequipment.com/cert/${certId}`
  const qrBuf = await fetch(
    `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
      `${certUrl}|sha256:${sha256(certUrl + completedAt)}`
    )}`
  ).then(r => r.arrayBuffer())
  const qr = await pdf.embedPng(qrBuf)
  page.drawImage(qr, { x: width - 140, y: height - 180, width: 100, height: 100 })

  /* footer disclaimer */
  const disclaimerWidth = font.widthOfTextAtSize(t.disclaimer, 6)
  page.drawText(t.disclaimer, {
    x: (width - disclaimerWidth) / 2,
    y: 40,
    size: 6,
    font
  })

  return pdf.save()
}

/* utility: SHA-256 hex */
function sha256(str: string) {
  return createHash('sha256').update(str).digest('hex')
} 