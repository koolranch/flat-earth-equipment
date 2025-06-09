import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import dayjs from 'dayjs'
import fs from 'fs'
import path from 'path'

export async function generateEvaluationPDF(data?: {
  operatorName?: string;
  operatorId?: string;
  date?: string;        // ISO
  evaluatorName?: string;
  evaluatorTitle?: string;
  equipmentType?: string;
  equipmentId?: string;
  scores?: Record<string, boolean>;
  version?: string;
}) {
  // Default data for static generation
  const defaults = {
    operatorName: '________________________________',
    operatorId: '__________',
    date: new Date().toISOString(),
    evaluatorName: '________________________________',
    evaluatorTitle: '________________________________',
    equipmentType: '________________________________',
    equipmentId: '__________',
    scores: {},
    version: '2.0'
  }
  
  const formData = { ...defaults, ...data }

  const pdf = await PDFDocument.create()
  pdf.setTitle('Practical Evaluation Sheet')
  pdf.setLanguage('en-US')
  const page = pdf.addPage([612, 792]) // portrait Letter
  const { width, height } = page.getSize()

  // fonts
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const font = await pdf.embedFont(StandardFonts.Helvetica)

  // brand logo & accent bar
  try {
    const logoImg = await fetch('https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/logo_128.png').then(r=>r.arrayBuffer())
    const logo = await pdf.embedPng(logoImg)
    page.drawImage(logo, { x: 40, y: height - 100, width: 80, height: 80 })
  } catch (e) {
    console.warn('Logo not loaded:', e)
  }
  
  // Orange accent bar
  page.drawRectangle({ x: 0, y: height - 110, width, height: 10, color: rgb(1,0.478,0.133) })

  // Title
  page.drawText('FORKLIFT OPERATOR PRACTICAL EVALUATION', {
    x: 140, y: height - 60, size: 16, font: fontBold, color: rgb(0.12, 0.15, 0.25)
  })

  // Header fields
  let y = height - 140
  page.drawText(`Operator: ${formData.operatorName}`, { x: 40, y, size: 12, font })
  page.drawText(`ID: ${formData.operatorId}`, { x: width/2 + 20, y, size: 12, font })
  
  y -= 20
  page.drawText(`Date: ${dayjs(formData.date).format('MMM D, YYYY')}`, { x: 40, y, size: 12, font })
  page.drawText(`Equipment: ${formData.equipmentType}`, { x: width/2 + 20, y, size: 12, font })
  
  y -= 20
  page.drawText(`Evaluator: ${formData.evaluatorName}`, { x: 40, y, size: 12, font })
  page.drawText(`Asset Tag: ${formData.equipmentId}`, { x: width/2 + 20, y, size: 12, font })
  
  y -= 20
  page.drawText(`Title: ${formData.evaluatorTitle}`, { x: 40, y, size: 12, font })

  // Instructions
  y -= 40
  page.drawText('PRACTICAL SKILLS ASSESSMENT', { x: 40, y, size: 14, font: fontBold })
  y -= 20
  page.drawText('Check each skill demonstrated. All items must be checked for operator to pass.', { 
    x: 40, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) 
  })

  // table: two-column practical skills per OSHA
  y -= 40
  const colWidth = (width - 80) / 2
  const tableTop = y
  const form = pdf.getForm()

  const rows = [
    ['pre_fluid',  'Fluid levels, tires, forks, mast, devices',
     'op_mount',   'Mount/Dismount: 3-point contact'],
    ['pre_belt',   'Seatbelt usage',
     'op_load',    'Load handling & tilt back'],
    ['op_speed',   'Travel speed ≤ 5 mph in work areas',
     'op_horn',    'Horn usage at intersections'],
    ['op_ped',     'Pedestrian awareness',
     'op_ramp',    'Ramp parking technique'],
    ['park_proc',  'Parking procedure (forks down, brake set, key out)',
     'op_control', 'Overall smooth control']
  ] as const

  y = tableTop
  rows.forEach(row => {
    row.forEach((cell, idx) => {
      if (idx % 2 === 0) {
        // field name
        const fieldName = cell as string
        const label     = row[idx + 1] as string
        const col = idx === 0 ? 0 : 1
        const xPos = 40 + col * colWidth

        // interactive checkbox 18×18 pt
        const cb = form.createCheckBox(fieldName)
        cb.addToPage(page, {
          x: xPos,
          y: y - 12,
          width: 18,
          height: 18,
          borderWidth: 1,
          borderColor: rgb(0, 0.545, 0.553)
        })

        // label text
        page.drawText(label, {
          x: xPos + 24,
          y: y - 4,
          size: 11,
          font
        })
      }
    })
    y -= 32                                  // more vertical breathing room
  })

  // certification statement
  const certY = y - 18
  page.drawText(
    'I certify that the above practical skills were evaluated in accordance with 29 CFR 1910.178(m). Any "No" requires remediation and retest.',
    { x: 40, y: certY, size: 9, font }
  )

  const sigY = certY - 42                   // 24 pt gap before lines
  page.drawLine({ start: { x: 40, y: sigY }, end: { x: width / 2 - 20, y: sigY } })
  page.drawText('Evaluator signature', { x: 40, y: sigY - 15, size: 8, font })
  page.drawLine({ start: { x: width / 2 + 20, y: sigY }, end: { x: width - 40, y: sigY } })
  page.drawText('Date', { x: width / 2 + 20, y: sigY - 15, size: 8, font })

  // footer
  page.drawText(`Form v${formData.version} | Retain 3 years per OSHA 1910.178(m)(6)`, { 
    x: 40, y: 40, size: 8, font, color: rgb(0.5, 0.5, 0.5) 
  })
  page.drawText('Flat Earth Equipment | www.flatearthequipment.com', { 
    x: width - 280, y: 40, size: 8, font, color: rgb(0.5, 0.5, 0.5) 
  })

  return pdf.save()
}

// Generate static evaluation PDF for public download
async function generateStaticEvaluationPDF() {
  const pdfBytes = await generateEvaluationPDF()
  const outputPath = path.join(process.cwd(), 'public', 'evaluation.pdf')
  fs.writeFileSync(outputPath, pdfBytes)
  console.log('✅ Generated evaluation.pdf successfully!')
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateStaticEvaluationPDF()
} 