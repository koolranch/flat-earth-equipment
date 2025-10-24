import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import dayjs from 'dayjs'
import 'dayjs/locale/es.js'
import fs from 'fs'
import path from 'path'

/* Brand assets & palette */
const CDN  = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand/'
const LOGO = CDN + 'logo_128.png'
const ORANGE = rgb(0.937, 0.384, 0.098) // #EF6219 - Primary brand orange
const TEAL   = rgb(0.106, 0.624, 0.624) // #1B9F9F - Brand teal 
const DARK_GRAY = rgb(0.25, 0.25, 0.25) // #404040 - Dark text
const LIGHT_GRAY = rgb(0.6, 0.6, 0.6) // #999999 - Light text
const BACKGROUND_GRAY = rgb(0.98, 0.98, 0.98) // #FAFAFA - Background
const BORDER_GRAY = rgb(0.8, 0.8, 0.8) // #CCCCCC - Form borders
const WHITE = rgb(1, 1, 1)
const BLACK = rgb(0, 0, 0)

type Locale = 'en' | 'es'

export async function generateEvaluationPDF(data: {
  operatorName?: string
  operatorId?: string
  date?: string         // ISO
  evaluatorName?: string
  evaluatorTitle?: string
  equipmentType?: string
  equipmentId?: string
  version: string       // e.g. "2.3"
  locale?: Locale
}) {
  const locale = data.locale || 'en'
  
  /* ───── translation strings ───── */
  const t = {
    en: {
      title: 'Forklift Operator Practical Evaluation',
      company: 'Flat Earth Equipment',
      cfr: '29 CFR 1910.178',
      contact: 'www.flatearthequipment.com   |   contact@flatearthequipment.com',
      operatorNameId: 'Operator Name / ID',
      date: 'Date',
      evaluatorNameTitle: 'Evaluator Name / Title',
      equipmentTypeId: 'Equipment Type / ID',
      instructions: 'Mark "Yes" only when the operator demonstrates each action safely and unaided.',
      certification: 'I certify that the above practical skills were evaluated in accordance with 29 CFR 1910.178(l). Any "No" requires remediation and retest.',
      fillablePdf: 'This PDF is fillable; tap boxes or fields on any phone or desktop.',
      evaluatorSig: 'Evaluator Signature',
      comments: 'Additional Comments / Corrective Actions',
      footer: 'Flat Earth Safety™ - Built Western Tough',
      formVersion: 'Form v',
      retain: 'Retain 3 years',
      page: 'Page 1 of 1',
      evaluationChecklist: 'EVALUATION CHECKLIST',
      certificationTitle: 'CERTIFICATION STATEMENT'
    },
    es: {
      title: 'Evaluación Práctica del Operador de Montacargas',
      company: 'Flat Earth Equipment',
      cfr: '29 CFR 1910.178',
      contact: 'www.flatearthequipment.com   |   contact@flatearthequipment.com',
      operatorNameId: 'Nombre del Operador / ID',
      date: 'Fecha',
      evaluatorNameTitle: 'Nombre del Evaluador / Título',
      equipmentTypeId: 'Tipo de Equipo / ID',
      instructions: 'Marque "Sí" solo cuando el operador demuestre cada acción de manera segura y sin ayuda.',
      certification: 'Certifico que las habilidades prácticas anteriores fueron evaluadas de acuerdo con 29 CFR 1910.178(l). Cualquier "No" requiere corrección y repetición de la prueba.',
      fillablePdf: 'Este PDF es rellenable; toque las casillas o campos en cualquier teléfono o computadora.',
      evaluatorSig: 'Firma del Evaluador',
      comments: 'Comentarios Adicionales / Acciones Correctivas',
      footer: 'Flat Earth Safety™ - Construido Resistente del Oeste',
      formVersion: 'Formulario v',
      retain: 'Conservar 3 años',
      page: 'Página 1 de 1',
      evaluationChecklist: 'LISTA DE VERIFICACIÓN DE EVALUACIÓN',
      certificationTitle: 'DECLARACIÓN DE CERTIFICACIÓN'
    }
  }[locale]
  
  /* -- create document & metadata -- */
  const pdf = await PDFDocument.create()
  pdf.setTitle(`${t.company} – ${t.title}`)
  pdf.setLanguage(locale === 'es' ? 'es-ES' : 'en-US')
  pdf.setAuthor('Flat Earth Equipment')
  pdf.setSubject(`OSHA ${t.cfr} Practical Evaluation Form`)

  const page = pdf.addPage([612, 792]) // portrait Letter
  const { width, height } = page.getSize()
  const form = pdf.getForm()

  /* -- fonts -- */
  const font  = await pdf.embedFont(StandardFonts.Helvetica)
  const bold  = await pdf.embedFont(StandardFonts.HelveticaBold)
  const ital  = await pdf.embedFont(StandardFonts.HelveticaOblique)

  /* ─────────────────────────────────────────────────────────────────────── */
  /* HEADER SECTION - Enhanced with better branding */
  /* ─────────────────────────────────────────────────────────────────────── */
  
  // Enhanced header with gradient effect
  const headerHeight = 60
  page.drawRectangle({ 
    x: 0, 
    y: height - headerHeight, 
    width: width, 
    height: headerHeight, 
    color: ORANGE 
  })

  // Add subtle shadow effect
  page.drawRectangle({ 
    x: 0, 
    y: height - headerHeight - 2, 
    width: width, 
    height: 2, 
    color: rgb(0.8, 0.3, 0.05) // Darker orange for shadow
  })

  // Company name - enhanced styling
  page.drawText(t.company, {
    x: 30,
    y: height - 28,
    size: 20,
    font: bold,
    color: WHITE,
  })

  // Main title - better positioning
  const titleSize = 18
  const titleWidth = bold.widthOfTextAtSize(t.title, titleSize)
  page.drawText(t.title, {
    x: (width - titleWidth) / 2,
    y: height - 45,
    size: titleSize,
    font: bold,
    color: WHITE,
  })

  // Enhanced CFR badge
  const badgeW = 110, badgeH = 24
  const badgeX = width - badgeW - 30
  const badgeY = height - 38
  
  // Badge shadow
  page.drawRectangle({ 
    x: badgeX + 2, 
    y: badgeY - 2, 
    width: badgeW, 
    height: badgeH, 
    color: rgb(0.05, 0.4, 0.4) // Dark teal shadow
  })
  
  // Main badge
  page.drawRectangle({ 
    x: badgeX, 
    y: badgeY, 
    width: badgeW, 
    height: badgeH, 
    color: TEAL 
  })
  
  const cfrText = t.cfr
  const cfrWidth = bold.widthOfTextAtSize(cfrText, 10)
  page.drawText(cfrText, {
    x: badgeX + (badgeW - cfrWidth) / 2,
    y: badgeY + 8,
    size: 10,
    font: bold,
    color: WHITE
  })

  // Contact information with better styling
  page.drawText(t.contact, { 
    x: 30, 
    y: height - headerHeight - 18, 
    size: 9, 
    font, 
    color: LIGHT_GRAY 
  })

  /* ─────────────────────────────────────────────────────────────────────── */
  /* FORM FIELDS SECTION - Enhanced with better styling */
  /* ─────────────────────────────────────────────────────────────────────── */

  const formStartY = height - headerHeight - 45
  const leftMargin = 30
  const fieldSpacing = 35
  const labelSpacing = 12

  // Helper function for enhanced form fields
  const createFormField = (name: string, x: number, y: number, w: number, value?: string) => {
    // Field background
    page.drawRectangle({ 
      x: x - 2, 
      y: y - 20, 
      width: w + 4, 
      height: 22, 
      color: BACKGROUND_GRAY,
      borderWidth: 0
    })
    
    const field = form.createTextField(name)
    field.addToPage(page, { 
      x, 
      y: y - 18, 
      width: w, 
      height: 18, 
      borderWidth: 1.5,
      borderColor: BORDER_GRAY,
      backgroundColor: WHITE
    })
    field.setFontSize(10)
    field.enableMultiline()
    if (value) field.setText(value)
    return field
  }

  // Section header for form fields
  page.drawRectangle({ 
    x: leftMargin - 10, 
    y: formStartY + 15, 
    width: width - 60, 
    height: 25, 
    color: BACKGROUND_GRAY,
    borderWidth: 1,
    borderColor: BORDER_GRAY
  })
  
  page.drawText('OPERATOR & EQUIPMENT INFORMATION', { 
    x: leftMargin, 
    y: formStartY + 25, 
    size: 11, 
    font: bold, 
    color: DARK_GRAY 
  })

  // Row 1: Operator Name/ID and Date
  let currentY = formStartY - 10
  
  page.drawText(t.operatorNameId, { 
    x: leftMargin, 
    y: currentY, 
    size: 10, 
    font: bold, 
    color: DARK_GRAY 
  })
  createFormField('operator_name', leftMargin, currentY - labelSpacing, 200, data.operatorName)
  
  page.drawText(t.date, { 
    x: leftMargin + 240, 
    y: currentY, 
    size: 10, 
    font: bold, 
    color: DARK_GRAY 
  })
  createFormField('eval_date', leftMargin + 240, currentY - labelSpacing, 120, 
    data.date ? dayjs(data.date).locale(locale).format('YYYY-MM-DD') : '')

  // Row 2: Evaluator Name/Title
  currentY -= fieldSpacing
  
  page.drawText(t.evaluatorNameTitle, { 
    x: leftMargin, 
    y: currentY, 
    size: 10, 
    font: bold, 
    color: DARK_GRAY 
  })
  createFormField('evaluator_name', leftMargin, currentY - labelSpacing, 180, data.evaluatorName)
  createFormField('evaluator_title', leftMargin + 200, currentY - labelSpacing, 180, data.evaluatorTitle)

  // Row 3: Equipment Type/ID
  currentY -= fieldSpacing
  
  page.drawText(t.equipmentTypeId, { 
    x: leftMargin, 
    y: currentY, 
    size: 10, 
    font: bold, 
    color: DARK_GRAY 
  })
  createFormField('equip_type', leftMargin, currentY - labelSpacing, 180, data.equipmentType)
  createFormField('equip_id', leftMargin + 200, currentY - labelSpacing, 180, data.equipmentId)

  /* ─────────────────────────────────────────────────────────────────────── */
  /* EVALUATION CHECKLIST - Enhanced with larger checkboxes and better styling */
  /* ─────────────────────────────────────────────────────────────────────── */

  currentY -= 50

  // Section header for checklist
  page.drawRectangle({ 
    x: leftMargin - 10, 
    y: currentY - 5, 
    width: width - 60, 
    height: 25, 
    color: TEAL,
    borderWidth: 0
  })
  
  page.drawText(t.evaluationChecklist, { 
    x: leftMargin, 
    y: currentY + 5, 
    size: 12, 
    font: bold, 
    color: WHITE 
  })

  currentY -= 30

  // Instructions with better styling
  page.drawText(t.instructions, { 
    x: leftMargin, 
    y: currentY, 
    size: 10, 
    font: ital, 
    color: DARK_GRAY,
    maxWidth: width - 60
  })

  currentY -= 25

     // Enhanced checklist items with better descriptions
   const checklistItems = locale === 'es' ? [
     'Inspección previa: Niveles de fluidos, llantas, horquillas, mástil, dispositivos de seguridad',
     'Cinturón de seguridad y montaje/desmontaje adecuado (contacto de 3 puntos)',
     'Velocidad de viaje <= 5 mph, apropiada para las condiciones del área',
     'Conciencia peatonal: Uso de bocina en intersecciones, conocimiento del entorno',
     'Manejo de carga: Inclinación hacia atrás adecuada, control suave, cumplimiento de capacidad'
   ] : [
     'Pre-operation inspection: Fluid levels, tires, forks, mast, safety devices',
     'Seatbelt usage and proper mounting/dismounting (3-point contact)',
     'Travel speed <= 5 mph, appropriate for area conditions',
     'Pedestrian awareness: Horn use at intersections, situational awareness',
     'Load handling: Proper tilt back, smooth control, load capacity compliance'
   ]

  const checkboxSize = 20 // Larger checkboxes for better digital interaction
  const itemSpacing = 32

  checklistItems.forEach((item, index) => {
    const itemY = currentY - (index * itemSpacing)
    
    // Item background for better readability
    page.drawRectangle({ 
      x: leftMargin - 5, 
      y: itemY - checkboxSize/2 - 5, 
      width: width - 50, 
      height: checkboxSize + 10, 
      color: index % 2 === 0 ? BACKGROUND_GRAY : WHITE,
      borderWidth: 0.5,
      borderColor: BORDER_GRAY
    })
    
    // Enhanced checkbox with better styling
    const checkbox = form.createCheckBox(`checklist_${index}`)
    checkbox.addToPage(page, { 
      x: leftMargin, 
      y: itemY - checkboxSize/2, 
      width: checkboxSize, 
      height: checkboxSize, 
      borderWidth: 2, 
      borderColor: TEAL,
      backgroundColor: WHITE
    })
         // Checkbox is fillable by default
    
    // Item text with better typography
    page.drawText(item, { 
      x: leftMargin + checkboxSize + 15, 
      y: itemY - 6, 
      size: 10, 
      font, 
      color: DARK_GRAY,
      maxWidth: width - leftMargin - checkboxSize - 50
    })
  })

  /* ─────────────────────────────────────────────────────────────────────── */
  /* CERTIFICATION SECTION - Enhanced with better visual prominence */
  /* ─────────────────────────────────────────────────────────────────────── */

  currentY -= (checklistItems.length * itemSpacing) + 30

  // Enhanced certification header
  page.drawRectangle({ 
    x: leftMargin - 10, 
    y: currentY - 5, 
    width: width - 60, 
    height: 25, 
    color: ORANGE,
    borderWidth: 0
  })
  
  page.drawText(t.certificationTitle, { 
    x: leftMargin, 
    y: currentY + 5, 
    size: 12, 
    font: bold, 
    color: WHITE 
  })

  currentY -= 35

  // Certification statement with enhanced background
  page.drawRectangle({ 
    x: leftMargin - 5, 
    y: currentY - 25, 
    width: width - 50, 
    height: 35, 
    color: BACKGROUND_GRAY,
    borderWidth: 1.5,
    borderColor: ORANGE
  })

  page.drawText(t.certification, { 
    x: leftMargin, 
    y: currentY - 10, 
    size: 9, 
    font, 
    color: DARK_GRAY,
    maxWidth: width - 60,
    lineHeight: 12
  })

  currentY -= 45

     // Digital fill note
   page.drawText(t.fillablePdf, { 
     x: leftMargin, 
     y: currentY, 
     size: 8, 
     font: ital, 
     color: LIGHT_GRAY 
   })

  /* ─────────────────────────────────────────────────────────────────────── */
  /* SIGNATURE SECTION - Enhanced for digital use */
  /* ─────────────────────────────────────────────────────────────────────── */

  currentY -= 40

  // Signature section header
  page.drawText('SIGNATURES & AUTHORIZATION', { 
    x: leftMargin, 
    y: currentY, 
    size: 11, 
    font: bold, 
    color: DARK_GRAY 
  })

  currentY -= 20

  // Enhanced signature fields
  const sigWidth = 260
  const sigHeight = 45
  
  // Signature field with better styling
  page.drawRectangle({ 
    x: leftMargin - 2, 
    y: currentY - sigHeight - 2, 
    width: sigWidth + 4, 
    height: sigHeight + 4, 
    color: BACKGROUND_GRAY,
    borderWidth: 0
  })
  
  const sig = form.createTextField('sig_evaluator')
  sig.addToPage(page, { 
    x: leftMargin, 
    y: currentY - sigHeight, 
    width: sigWidth, 
    height: sigHeight, 
    borderWidth: 2, 
    borderColor: DARK_GRAY,
    backgroundColor: WHITE
  })
  sig.setFontSize(12)
     sig.enableMultiline()

  // Date field with better styling
  const dateFieldWidth = 130
  page.drawRectangle({ 
    x: leftMargin + sigWidth + 28, 
    y: currentY - 22, 
    width: dateFieldWidth + 4, 
    height: 24, 
    color: BACKGROUND_GRAY,
    borderWidth: 0
  })
  
  const dateField = form.createTextField('sig_date')
  dateField.addToPage(page, { 
    x: leftMargin + sigWidth + 30, 
    y: currentY - 20, 
    width: dateFieldWidth, 
    height: 20, 
    borderWidth: 1.5, 
    borderColor: BORDER_GRAY,
    backgroundColor: WHITE
  })
  dateField.setFontSize(10)

  // Enhanced labels
  page.drawText(t.evaluatorSig, { 
    x: leftMargin, 
    y: currentY - sigHeight - 18, 
    size: 9, 
    font: bold, 
    color: DARK_GRAY 
  })
  
  page.drawText(t.date, { 
    x: leftMargin + sigWidth + 30, 
    y: currentY - sigHeight - 18, 
    size: 9, 
    font: bold, 
    color: DARK_GRAY 
  })

  /* ─────────────────────────────────────────────────────────────────────── */
  /* COMMENTS SECTION - Enhanced styling */
  /* ─────────────────────────────────────────────────────────────────────── */

  currentY -= 100

  page.drawText(t.comments, { 
    x: leftMargin, 
    y: currentY, 
    size: 11, 
    font: bold, 
    color: DARK_GRAY 
  })
  
  currentY -= 15
  
  // Enhanced comments field
  page.drawRectangle({ 
    x: leftMargin - 2, 
    y: currentY - 82, 
    width: width - 56, 
    height: 84, 
    color: BACKGROUND_GRAY,
    borderWidth: 0
  })
  
  const comments = form.createTextField('comments')
  comments.enableMultiline()
  comments.addToPage(page, { 
    x: leftMargin, 
    y: currentY - 80, 
    width: width - 60, 
    height: 80, 
    borderWidth: 1.5, 
    borderColor: BORDER_GRAY,
    backgroundColor: WHITE
  })

  /* ─────────────────────────────────────────────────────────────────────── */
  /* FOOTER - Enhanced with better branding */
  /* ─────────────────────────────────────────────────────────────────────── */

  const footerHeight = 30
  page.drawRectangle({ 
    x: 0, 
    y: 0, 
    width: width, 
    height: footerHeight, 
    color: BACKGROUND_GRAY,
    borderWidth: 1,
    borderColor: BORDER_GRAY
  })

  // Footer text with better styling
  page.drawText(t.footer, { 
    x: 30, 
    y: 12, 
    size: 9, 
    font: bold, 
    color: DARK_GRAY 
  })

  // Form version and retention - center
  const versionText = `${t.formVersion}${data.version} | ${t.retain}`
  const versionWidth = font.widthOfTextAtSize(versionText, 8)
  page.drawText(versionText, { 
    x: (width - versionWidth) / 2, 
    y: 12, 
    size: 8, 
    font, 
    color: LIGHT_GRAY 
  })

  // Page number - right aligned
  page.drawText(t.page, { 
    x: width - 80, 
    y: 12, 
    size: 8, 
    font, 
    color: LIGHT_GRAY 
  })

  /* Enhanced QR code for verification */
  try {
    const qrSize = 25
    const qrBuf = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent('https://flatearthequipment.com/verify')}`).then(r=>r.arrayBuffer())
    const qr = await pdf.embedPng(qrBuf)
    page.drawImage(qr, { 
      x: width - 60, 
      y: footerHeight + 10, 
      width: qrSize, 
      height: qrSize 
    })
  } catch (e) {
    console.warn('QR code not loaded:', e)
  }

  return pdf.save()
}

// Generate static evaluation PDF for public download
async function generateStaticEvaluationPDF() {
  const pdfBytes = await generateEvaluationPDF({ version: '2.4' })
  const outputPath = path.join(process.cwd(), 'public', 'evaluation.pdf')
  fs.writeFileSync(outputPath, pdfBytes)
  console.log('✅ Generated enhanced evaluation.pdf successfully!')
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateStaticEvaluationPDF()
} 