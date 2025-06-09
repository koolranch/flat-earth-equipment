import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import dayjs from 'dayjs'
import fs from 'fs'
import path from 'path'

/* Brand assets & palette */
const CDN  = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand/'
const LOGO = CDN + 'logo_128.png'
const ORANGE = rgb(1, 0.478, 0.133)
const TEAL   = rgb(0, 0.545, 0.553)
const GRAY   = rgb(0.55, 0.55, 0.55)

export async function generateEvaluationPDF(data: {
  operatorName?: string
  operatorId?: string
  date?: string         // ISO
  evaluatorName?: string
  evaluatorTitle?: string
  equipmentType?: string
  equipmentId?: string
  version: string       // e.g. "2.2"
}) {
  /* -- create document & metadata -- */
  const pdf = await PDFDocument.create()
  pdf.setTitle('Flat Earth Equipment – Forklift Practical Evaluation')
  pdf.setLanguage('en-US')
  pdf.setAuthor('Flat Earth Equipment')
  pdf.setSubject('OSHA 29 CFR 1910.178(m) Practical Evaluation Form')

  const page = pdf.addPage([612, 792]) // portrait Letter
  const { width, height } = page.getSize()
  const form = pdf.getForm()

  /* -- fonts -- */
  const font  = await pdf.embedFont(StandardFonts.Helvetica)
  const bold  = await pdf.embedFont(StandardFonts.HelveticaBold)
  const ital  = await pdf.embedFont(StandardFonts.HelveticaOblique)

  /* -- header -- */
  try {
    const logoBytes = await fetch(LOGO).then(r => r.arrayBuffer())
    const logo = await pdf.embedPng(logoBytes)
    page.drawImage(logo, { x: 40, y: height - 100, width: 80, height: 80 })
    
    /* footer logo */
    page.drawImage(logo,{ x:40, y:4, width:26, height:26 })
  } catch (e) {
    console.warn('Logo not loaded:', e)
  }

  // orange accent bar
  page.drawRectangle({ x: 0, y: height - 120, width, height: 10, color: ORANGE })

  // main title (single instance)
  const titleText = 'Flat Earth Equipment – Forklift Operator Practical Evaluation'
  const titleWidth = bold.widthOfTextAtSize(titleText, 16)
  page.drawText(titleText, {
    x: (width - titleWidth) / 2,
    y: height - 138,
    size: 16,
    font: bold,
    color: rgb(0.12, 0.15, 0.25)
  })

  // OSHA badge with spacing
  const badgeW = 120, badgeH = 22
  const badgeY = height - 160
  page.drawRectangle({ x: width - badgeW - 40, y: badgeY, width: badgeW, height: badgeH, color: TEAL })
  page.drawText('29 CFR 1910.178', {
    x: width - badgeW - 40 + 8,
    y: badgeY + 6,
    size: 9,
    font: bold,
    color: rgb(1,1,1)
  })

  /* contact line */
  const contact = 'www.flatearthequipment.com   |   contact@flatearthequipment.com   |   (307) 302-0043'
  page.drawText(contact, { x: 40, y: height - 155, size: 9, font, color: GRAY })

  /* helper to add underline */
  const underline = (x:number,y:number,w:number)=>page.drawLine({ start:{x,y}, end:{x:x+w,y}, thickness:0.5, color: GRAY })

  /* header field labels */
  page.drawText('Operator Name / ID', { x: 40, y: height - 185, size: 10, font: bold })
  page.drawText('Date',               { x: width/2 + 20, y: height - 185, size: 10, font: bold })
  page.drawText('Evaluator Name / Title', { x: 40, y: height - 220, size: 10, font: bold })
  page.drawText('Equipment Type / ID',    { x: 40, y: height - 255, size: 10, font: bold })

  /* text fields + visible underlines */
  const tf = (name:string,x:number,y:number,w:number,value?:string)=>{
    const f = form.createTextField(name)
    f.addToPage(page,{ x, y, width:w, height:16, borderWidth:0 }) // invisible border
    f.setFontSize(10)
    if (value) f.setText(value)
    underline(x, y-3, w)
    return f
  }
  tf('operator_name',40,height-203,190,data.operatorName)
  tf('operator_id',240,height-203,90,data.operatorId)
  tf('eval_date', width/2+20, height-203, 110, dayjs(data.date).format('YYYY-MM-DD'))
  tf('evaluator_name',40,height-238,200,data.evaluatorName)
  tf('evaluator_title',255,height-238,150,data.evaluatorTitle)
  tf('equip_type',40,height-273,200,data.equipmentType)
  tf('equip_id',255,height-273,150,data.equipmentId)

  /* instructional blurb */
  page.drawText('Mark "Yes" only when the operator demonstrates each action safely and unaided.', { x:40, y: height - 298, size:10, font: ital })

  /* practical skills table (checkboxes) */
  const colW = (width - 80)/2
  const rows:[string,string,string,string][]=[
    ['pre_fluid','Fluid levels, tires, forks, mast, devices','op_mount','Mount / Dismount (3-point)'],
    ['pre_belt','Seatbelt usage','op_load','Load handling & tilt back'],
    ['op_speed','Travel speed <= 5 mph','op_horn','Horn at intersections'],
    ['op_ped','Pedestrian awareness','op_ramp','Ramp parking technique'],
    ['park_proc','Parking procedure','op_control','Overall smooth control']
  ]
  let tableY = height - 316
  rows.forEach(r=>{
    const [id1,txt1,id2,txt2]=r
    ;[[id1,txt1,0],[id2,txt2,1]].forEach(([id,txt,col]:any)=>{
      const x = 40 + col*colW
      const cb = form.createCheckBox(id)
      cb.addToPage(page,{ x, y: tableY-12, width:18, height:18, borderWidth:1, borderColor: TEAL })
      page.drawText(txt,{ x:x+24, y:tableY-4, size:11, font })
    })
    tableY -= 32
  })

  /* certification blurb */
  page.drawText('I certify that the above practical skills were evaluated in accordance with 29 CFR 1910.178(m). Any "No" requires remediation and retest.', { x:40, y:tableY-18, size:9, font })
  page.drawText('This PDF is fill-able; tap boxes or fields on any phone or desktop.', { x:40, y:tableY-35, size:8, font: ital, color: GRAY })

  /* signature block */
  const sigY = tableY - 78
  const sig = form.createTextField('sig_evaluator')
  sig.addToPage(page,{ x:40, y:sigY, width: width/2 - 60, height:60, borderWidth:1, borderColor: rgb(0,0,0) })
  sig.setFontSize(10)
  tf('sig_date', width/2 + 20, sigY + 22, 120)
  page.drawText('Evaluator signature', { x:40, y:sigY-18, size:8, font })
  page.drawText('Date', { x: width/2 + 20, y:sigY-18, size:8, font })

  /* comments */
  page.drawText('Additional Comments / Corrective Actions', { x:40, y:sigY-55, size:10, font: bold })
  const comments = form.createTextField('comments')
  comments.enableMultiline()
  comments.addToPage(page,{ x:40, y:sigY-150, width:width-80, height:90, borderWidth:0 })
  page.drawRectangle({ x:40, y:sigY-150, width:width-80, height:90, borderWidth:0.5, borderColor: GRAY })

  /* footer */
  page.drawRectangle({ x:0, y:0, width, height:34, color: rgb(0.95,0.95,0.95) })
  page.drawText('Flat Earth Safety™ · Built Western Tough', { x:74, y:10, size:8, font, color: rgb(0.25,0.25,0.25) })
  page.drawText(`Form v${data.version} | Retain 3 years`, { x: width/2 - 48, y:10, size:8, font, color: GRAY })
  page.drawText('Page 1 of 1', { x: width - 90, y:10, size:8, font, color: GRAY })

  /* QR link */
  try {
    const qrBuf = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent('https://flatearthequipment.com/eval-help')}`).then(r=>r.arrayBuffer())
    const qr = await pdf.embedPng(qrBuf)
    page.drawImage(qr,{ x: width - 150, y: 4, width:26, height:26 })
  } catch (e) {
    console.warn('QR code not loaded:', e)
  }

  return pdf.save()
}

// Generate static evaluation PDF for public download
async function generateStaticEvaluationPDF() {
  const pdfBytes = await generateEvaluationPDF({ version: '2.2' })
  const outputPath = path.join(process.cwd(), 'public', 'evaluation.pdf')
  fs.writeFileSync(outputPath, pdfBytes)
  console.log('✅ Generated evaluation.pdf successfully!')
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateStaticEvaluationPDF()
} 