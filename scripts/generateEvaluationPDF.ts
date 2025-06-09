import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import dayjs from 'dayjs'
import fs from 'fs'
import path from 'path'

/* brand & palette */
const CDN  = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand/'
const LOGO = CDN + 'logo_128.png' // reused for header & footer icon
const ORANGE = rgb(1, 0.478, 0.133)
const TEAL   = rgb(0, 0.545, 0.553)
const GRAY   = rgb(0.55, 0.55, 0.55)

export async function generateEvaluationPDF(data: {
  operatorName?: string
  operatorId?: string
  date?: string          // ISO
  evaluatorName?: string
  evaluatorTitle?: string
  equipmentType?: string
  equipmentId?: string
  version: string        // e.g. "2.1"
}) {
  const pdf = await PDFDocument.create()
  pdf.setTitle('Flat Earth Equipment – Practical Evaluation')
  pdf.setLanguage('en-US')
  const page = pdf.addPage([612, 792]) // portrait Letter
  const { width, height } = page.getSize()
  const form = pdf.getForm()

  /* fonts */
  const font  = await pdf.embedFont(StandardFonts.Helvetica)
  const bold  = await pdf.embedFont(StandardFonts.HelveticaBold)
  const ital  = await pdf.embedFont(StandardFonts.HelveticaOblique)

  /* header: logo + title */
  try {
    const logoBytes = await fetch(LOGO).then(r => r.arrayBuffer())
    const logo = await pdf.embedPng(logoBytes)
    page.drawImage(logo, { x: 40, y: height - 100, width: 80, height: 80 })
    
    // tiny logo icon for footer
    page.drawImage(logo,{ x:40, y:6, width:28, height:28 })
  } catch (e) {
    console.warn('Logo not loaded:', e)
  }

  // accent bar (orange)
  page.drawRectangle({ x: 0, y: height - 120, width, height: 10, color: ORANGE })

  // Title text (centered)
  const titleText = 'Flat Earth Equipment – Forklift Operator Practical Evaluation'
  const titleWidth = bold.widthOfTextAtSize(titleText, 16)
  page.drawText(titleText, {
    x: (width - titleWidth) / 2,
    y: height - 135,
    size: 16,
    font: bold,
    color: rgb(0.12, 0.15, 0.25)
  })

  /* OSHA badge */
  const badgeW = 110, badgeH = 20
  page.drawRectangle({ x: width - badgeW - 40, y: height - 135, width: badgeW, height: badgeH, color: TEAL })
  page.drawText('29 CFR 1910.178', {
    x: width - badgeW - 40 + 6,
    y: height - 131,
    size: 9,
    font: bold,
    color: rgb(1,1,1)
  })

  /* contact line */
  const contact = 'www.flatearthequipment.com   |   contact@flatearthequipment.com   |   (307) 302-0043'
  page.drawText(contact, { x: 40, y: height - 150, size: 9, font, color: GRAY })

  /* header labels */
  page.drawText('Operator Name / ID', { x: 40, y: height - 180, size: 10, font: bold })
  page.drawText('Date',               { x: width/2 + 20, y: height - 180, size: 10, font: bold })
  page.drawText('Evaluator Name / Title', { x: 40, y: height - 215, size: 10, font: bold })
  page.drawText('Equipment Type / ID',    { x: 40, y: height - 250, size: 10, font: bold })

  /* text fields */
  const tf = (name:string,x:number,y:number,w:number)=>{
    const f = form.createTextField(name)
    f.addToPage(page,{ x,y,width:w,height:16,borderColor:rgb(0,0,0),borderWidth:0.5 })
    f.setFontSize(10)
    return f
  }
  tf('operator_name',40,height-198,190).setText(data.operatorName||'')
  tf('operator_id',235,height-198,75).setText(data.operatorId||'')
  tf('eval_date',width/2+20,height-198,110).setText(dayjs(data.date).format('YYYY-MM-DD'))
  tf('evaluator_name',40,height-233,200).setText(data.evaluatorName||'')
  tf('evaluator_title',255,height-233,150).setText(data.evaluatorTitle||'')
  tf('equip_type',40,height-268,200).setText(data.equipmentType||'')
  tf('equip_id',255,height-268,150).setText(data.equipmentId||'')

  /* instructional blurb */
  page.drawText('Mark "Yes" only when the operator demonstrates each action safely and unaided.', { x:40, y: height - 292, size:10, font: ital })

  /* practical skills table (checkboxes) */
  const colW = (width - 80)/2
  const rows:[string,string,string,string][]=[
    ['pre_fluid','Fluid levels, tires, forks, mast, devices','op_mount','Mount / Dismount (3-point)'],
    ['pre_belt','Seatbelt usage','op_load','Load handling & tilt back'],
    ['op_speed','Travel speed <= 5 mph','op_horn','Horn at intersections'],
    ['op_ped','Pedestrian awareness','op_ramp','Ramp parking technique'],
    ['park_proc','Parking procedure','op_control','Overall smooth control']
  ]
  let y = height - 310
  rows.forEach(r=>{
    const [id1,txt1,id2,txt2]=r
    ;[[id1,txt1,0],[id2,txt2,1]].forEach(([id,txt,col]:any)=>{
      const x = 40 + col*colW
      const cb = form.createCheckBox(id)
      cb.addToPage(page,{x,y:y-12,width:18,height:18,borderColor:TEAL,borderWidth:1})
      page.drawText(txt,{x:x+24,y:y-4,size:11,font})
    })
    y -= 32
  })

  /* certification blurb */
  page.drawText('I certify that the above practical skills were evaluated in accordance with 29 CFR 1910.178(m). Any "No" requires remediation and retest.', { x:40, y:y-18, size:9, font })

  /* digital form hint */
  page.drawText('This PDF is fill-able; tap boxes or fields on any phone or desktop.', { x:40, y:y-35, size:8, font: ital, color: GRAY })

  /* signature & date fields */
  const sigY = y - 70
  const sig = form.createTextField('sig_evaluator')
  sig.addToPage(page,{ x:40, y:sigY, width: width/2 - 60, height:40, borderColor: rgb(0,0,0), borderWidth:1 })
  sig.setFontSize(10)
  tf('sig_date', width/2 + 20, sigY + 12, 120)
  page.drawText('Evaluator signature', { x:40, y:sigY-15, size:8, font })
  page.drawText('Date', { x: width/2 + 20, y:sigY-15, size:8, font })

  /* comments */
  page.drawText('Additional Comments / Corrective Actions', { x:40, y:sigY-50, size:10, font: bold })
  const comments = form.createTextField('comments')
  comments.enableMultiline()
  comments.addToPage(page,{ x:40, y:sigY-140, width:width-80, height:80, borderColor:rgb(0,0,0), borderWidth:0.5 })

  /* footer bar */
  page.drawRectangle({ x:0, y:0, width, height:30, color: rgb(0.95,0.95,0.95) })
  page.drawText('Flat Earth Safety™ · Built Western Tough', { x:80, y:10, size:8, font, color: rgb(0.25,0.25,0.25) })
  page.drawText(`Form v${data.version} | Retain 3 years`, { x: width/2 - 45, y:10, size:8, font, color: GRAY })
  page.drawText('Page 1 of 1', { x: width - 90, y:10, size:8, font, color: GRAY })

  /* QR to training page */
  try {
    const qrBuf = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent('https://flatearthequipment.com/training/forklift')}`).then(r=>r.arrayBuffer())
    const qr = await pdf.embedPng(qrBuf)
    page.drawImage(qr,{ x: width - 150, y: 6, width:24, height:24 })
  } catch (e) {
    console.warn('QR code not loaded:', e)
  }

  return pdf.save()
}

// Generate static evaluation PDF for public download
async function generateStaticEvaluationPDF() {
  const pdfBytes = await generateEvaluationPDF({ version: '2.1' })
  const outputPath = path.join(process.cwd(), 'public', 'evaluation.pdf')
  fs.writeFileSync(outputPath, pdfBytes)
  console.log('✅ Generated evaluation.pdf successfully!')
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateStaticEvaluationPDF()
} 