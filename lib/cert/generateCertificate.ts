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
      presentedTo: 'This certifies that',
      hasCompleted: 'has successfully completed the',
      trainingProgram: 'OSHA-Compliant Training Program',
      dateCompleted: 'Date Completed:',
      validThrough: 'Valid Through:',
      certNumber: 'Certificate Number:',
      subjectsCovered: 'Training Topics: 29 CFR 1910.178(l)(3)(i-ii) - Powered Industrial Trucks',
      evaluatorSig: 'Workplace Evaluator Signature',
      evaluationDate: 'Evaluation Date',
      companyName: 'Flat Earth Safety Training',
      disclaimer: 'This certificate represents completion of formal instruction only. OSHA requires additional hands-on workplace evaluation by qualified personnel before independent operation.',
      verify: 'Verify at: flatearthequipment.com/verify'
    },
    es: {
      certificate: 'CERTIFICADO DE FINALIZACIÓN',
      presentedTo: 'Se certifica que',
      hasCompleted: 'ha completado satisfactoriamente el',
      trainingProgram: 'Programa de Capacitación Cumpliendo con OSHA',
      dateCompleted: 'Fecha de Finalización:',
      validThrough: 'Válido Hasta:',
      certNumber: 'Número de Certificado:',
      subjectsCovered: 'Temas de Capacitación: 29 CFR 1910.178(l)(3)(i-ii) - Equipos Industriales Motorizados',
      evaluatorSig: 'Firma del Evaluador del Lugar de Trabajo',
      evaluationDate: 'Fecha de Evaluación',
      companyName: 'Capacitación de Seguridad Flat Earth',
      disclaimer: 'Este certificado representa la finalización de la instrucción formal únicamente. OSHA requiere evaluación práctica adicional en el lugar de trabajo por personal calificado antes de la operación independiente.',
      verify: 'Verificar en: flatearthequipment.com/verify'
    }
  }[locale]
  
  const pdf = await PDFDocument.create()
  pdf.setTitle(t.certificate)
  pdf.setLanguage(locale === 'es' ? 'es-ES' : 'en-US')

  const page = pdf.addPage([792, 612]) // landscape Letter (11" x 8.5")
  const { width, height } = page.getSize()

  /* fonts */
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique)

  // Color palette
  const primaryColor = rgb(0.95, 0.45, 0.1) // Orange #F97316
  const darkBlue = rgb(0.1, 0.15, 0.25) // Dark navy
  const mediumGray = rgb(0.4, 0.4, 0.4)
  const lightGray = rgb(0.7, 0.7, 0.7)

  /* decorative border */
  const borderThickness = 3
  page.drawRectangle({
    x: 30,
    y: 30,
    width: width - 60,
    height: height - 60,
    borderColor: primaryColor,
    borderWidth: borderThickness
  })

  /* inner decorative border */
  page.drawRectangle({
    x: 40,
    y: 40,
    width: width - 80,
    height: height - 80,
    borderColor: lightGray,
    borderWidth: 1
  })

  /* brand logo */
  try {
    const logoBytes = await fetch(LOGO_PNG).then(r => r.arrayBuffer())
    const logo = await pdf.embedPng(logoBytes)
    page.drawImage(logo, { x: 60, y: height - 120, width: 60, height: 60 })
  } catch (e) {
    console.warn('Logo not loaded:', e)
  }

  /* decorative seal (watermark) */
  try {
    const sealBytes = await fetch(SEAL_PNG).then(r => r.arrayBuffer())
    const seal = await pdf.embedPng(sealBytes)
    page.drawImage(seal, {
      x: width / 2 - 120,
      y: height / 2 - 120,
      width: 240,
      height: 240,
      opacity: 0.08
    })
  } catch (e) {
    console.warn('Seal not loaded:', e)
  }

  /* company header */
  page.drawText(t.companyName, {
    x: 140,
    y: height - 90,
    size: 16,
    font: bold,
    color: darkBlue
  })

  /* certificate title */
  const titleY = height - 160
  const titleWidth = bold.widthOfTextAtSize(t.certificate, 32)
  page.drawText(t.certificate, {
    x: (width - titleWidth) / 2,
    y: titleY,
    size: 32,
    font: bold,
    color: primaryColor
  })

  /* decorative line under title */
  const lineY = titleY - 15
  page.drawLine({
    start: { x: (width - titleWidth) / 2, y: lineY },
    end: { x: (width + titleWidth) / 2, y: lineY },
    thickness: 2,
    color: primaryColor
  })

  /* certificate body text */
  const bodyStartY = height - 220
  
  // "This certifies that"
  const presentedToWidth = font.widthOfTextAtSize(t.presentedTo, 14)
  page.drawText(t.presentedTo, {
    x: (width - presentedToWidth) / 2,
    y: bodyStartY,
    size: 14,
    font,
    color: darkBlue
  })

  // Student name (prominent)
  const nameY = bodyStartY - 35
  const nameWidth = bold.widthOfTextAtSize(student, 24)
  page.drawText(student, {
    x: (width - nameWidth) / 2,
    y: nameY,
    size: 24,
    font: bold,
    color: darkBlue
  })

  // Decorative line under name
  const nameLineY = nameY - 8
  const nameLineWidth = Math.min(nameWidth + 40, width - 200)
  page.drawLine({
    start: { x: (width - nameLineWidth) / 2, y: nameLineY },
    end: { x: (width + nameLineWidth) / 2, y: nameLineY },
    thickness: 1,
    color: lightGray
  })

  // "has successfully completed"
  const completedY = nameY - 35
  const completedWidth = font.widthOfTextAtSize(t.hasCompleted, 14)
  page.drawText(t.hasCompleted, {
    x: (width - completedWidth) / 2,
    y: completedY,
    size: 14,
    font,
    color: darkBlue
  })

  // Course title
  const courseY = completedY - 30
  const maxCourseWidth = width - 200
  let courseFontSize = 18
  let courseWidth = bold.widthOfTextAtSize(course, courseFontSize)
  
  // Adjust font size if course title is too long
  while (courseWidth > maxCourseWidth && courseFontSize > 12) {
    courseFontSize -= 1
    courseWidth = bold.widthOfTextAtSize(course, courseFontSize)
  }
  
  page.drawText(course, {
    x: (width - courseWidth) / 2,
    y: courseY,
    size: courseFontSize,
    font: bold,
    color: primaryColor
  })

  // Training program subtitle
  const programY = courseY - 25
  const programWidth = italic.widthOfTextAtSize(t.trainingProgram, 12)
  page.drawText(t.trainingProgram, {
    x: (width - programWidth) / 2,
    y: programY,
    size: 12,
    font: italic,
    color: mediumGray
  })

  /* certificate details section */
  const detailsY = height - 400
  const leftCol = 80
  const rightCol = width / 2 + 40

  // Dates and certificate number
  const completed = dayjs(completedAt).locale(locale)
  const expires = completed.add(3, 'year')
  const dateFormat = locale === 'es' ? 'D [de] MMMM [de] YYYY' : 'MMMM D, YYYY'

  // Left column
  page.drawText(t.dateCompleted, {
    x: leftCol,
    y: detailsY,
    size: 10,
    font: bold,
    color: darkBlue
  })
  page.drawText(completed.format(dateFormat), {
    x: leftCol,
    y: detailsY - 15,
    size: 10,
    font,
    color: rgb(0, 0, 0)
  })

  page.drawText(t.certNumber, {
    x: leftCol,
    y: detailsY - 40,
    size: 10,
    font: bold,
    color: darkBlue
  })
  page.drawText(certId, {
    x: leftCol,
    y: detailsY - 55,
    size: 10,
    font,
    color: rgb(0, 0, 0)
  })

  // Right column
  page.drawText(t.validThrough, {
    x: rightCol,
    y: detailsY,
    size: 10,
    font: bold,
    color: darkBlue
  })
  page.drawText(expires.format(dateFormat), {
    x: rightCol,
    y: detailsY - 15,
    size: 10,
    font,
    color: rgb(0, 0, 0)
  })

  /* OSHA compliance section */
  const oshaY = detailsY - 90
  page.drawText(t.subjectsCovered, {
    x: leftCol,
    y: oshaY,
    size: 9,
    font: italic,
    color: mediumGray
  })

  /* signature section */
  const sigY = height - 510
  const sigLineWidth = 180

  // Left signature line
  page.drawLine({
    start: { x: leftCol, y: sigY },
    end: { x: leftCol + sigLineWidth, y: sigY },
    thickness: 0.5,
    color: rgb(0, 0, 0)
  })
  page.drawText(t.evaluatorSig, {
    x: leftCol,
    y: sigY - 15,
    size: 8,
    font,
    color: mediumGray
  })

  // Right signature line
  page.drawLine({
    start: { x: rightCol, y: sigY },
    end: { x: rightCol + sigLineWidth, y: sigY },
    thickness: 0.5,
    color: rgb(0, 0, 0)
  })
  page.drawText(t.evaluationDate, {
    x: rightCol,
    y: sigY - 15,
    size: 8,
    font,
    color: mediumGray
  })

  /* QR code for verification */
  try {
    const certUrl = `https://flatearthequipment.com/verify/${certId}`
    const qrBuf = await fetch(
      `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
        `${certUrl}|sha256:${sha256(certUrl + completedAt)}`
      )}`
    ).then(r => r.arrayBuffer())
    const qr = await pdf.embedPng(qrBuf)
    
    page.drawImage(qr, { 
      x: width - 160, 
      y: height - 160, 
      width: 80, 
      height: 80 
    })
    
    // QR verification text
    page.drawText(t.verify, {
      x: width - 160,
      y: height - 175,
      size: 7,
      font,
      color: mediumGray
    })
  } catch (e) {
    console.warn('QR code not generated:', e)
  }

  /* diagonal watermark ID */
  page.drawText(certId, {
    x: width - 250,
    y: height / 2 + 20,
    size: 32,
    font,
    color: rgb(0.95, 0.95, 0.95),
    opacity: 0.3
  })

  /* footer disclaimer */
  const disclaimerY = 70
  const disclaimerMaxWidth = width - 120
  const disclaimerLines = wrapText(t.disclaimer, font, 8, disclaimerMaxWidth)
  
  disclaimerLines.forEach((line, index) => {
    const lineWidth = font.widthOfTextAtSize(line, 8)
    page.drawText(line, {
      x: (width - lineWidth) / 2,
      y: disclaimerY - (index * 10),
      size: 8,
      font,
      color: mediumGray
    })
  })

  return pdf.save()
}

/* utility: SHA-256 hex */
function sha256(str: string) {
  return createHash('sha256').update(str).digest('hex')
}

/* utility: text wrapping */
function wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const testWidth = font.widthOfTextAtSize(testLine, fontSize)
    
    if (testWidth <= maxWidth) {
      currentLine = testLine
    } else {
      if (currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        // Word is too long, add it anyway
        lines.push(word)
      }
    }
  }
  
  if (currentLine) {
    lines.push(currentLine)
  }
  
  return lines
} 