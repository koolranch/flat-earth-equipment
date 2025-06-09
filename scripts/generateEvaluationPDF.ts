import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import dayjs from 'dayjs'
import fs from 'fs'
import path from 'path'

/* brand assets */
const BRAND = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand/'
const LOGO_PNG = BRAND + 'logo_128.png'
const ORANGE = rgb(1, 0.478, 0.133)
const TEAL   = rgb(0, 0.545, 0.553)

export async function generateEvaluationPDF(data: {
  operatorName?: string
  operatorId?: string
  date?: string          // ISO
  evaluatorName?: string
  evaluatorTitle?: string
  equipmentType?: string
  equipmentId?: string
  version: string
}) {
  const pdf = await PDFDocument.create()
  pdf.setTitle('Practical Evaluation Sheet')
  pdf.setLanguage('en-US')
  const page = pdf.addPage([612, 792]) // portrait Letter
  const { width, height } = page.getSize()
  const form = pdf.getForm()

  /* fonts */
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)

  /* logo */
  try {
    const logoBytes = await fetch('https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/logo_128.png').then(r => r.arrayBuffer())
    const logo = await pdf.embedPng(logoBytes)
    page.drawImage(logo, { x: 40, y: height - 100, width: 80, height: 80 })
  } catch (e) {
    console.warn('Logo not loaded:', e)
  }
  page.drawRectangle({ x: 0, y: height - 110, width, height: 10, color: ORANGE })

  /* header labels */
  page.drawText('Operator Name / ID', { x: 40, y: height - 140, size: 10, font })
  page.drawText('Date',              { x: width / 2 + 20, y: height - 140, size: 10, font })
  page.drawText('Evaluator Name / Title', { x: 40, y: height - 175, size: 10, font })
  page.drawText('Equipment Type / ID',    { x: 40, y: height - 210, size: 10, font })

  /* text fields */
  const tf = (name:string,x:number,y:number,w:number=250)=>{
    const f = form.createTextField(name)
    f.addToPage(page,{ x, y, width:w, height:16, borderColor: rgb(0,0,0), borderWidth: 0.5 })
    f.setFontSize(10)
    return f
  }
  tf('operator_name', 40, height-158).setText(data.operatorName||'')
  tf('operator_id',   300, height-158, 100).setText(data.operatorId||'')
  tf('eval_date',     width/2+20, height-158, 110).setText(dayjs(data.date).format('YYYY-MM-DD'))
  tf('evaluator_name',40, height-193, 200).setText(data.evaluatorName||'')
  tf('evaluator_title',260, height-193, 150).setText(data.evaluatorTitle||'')
  tf('equip_type',    40, height-228, 200).setText(data.equipmentType||'')
  tf('equip_id',      260, height-228, 150).setText(data.equipmentId||'')

  /* practical skills table – interactive checkboxes */
  const colW = (width - 80) / 2
  const rows: [string,string,string,string][] = [
    ['pre_fluid','Fluid levels, tires, forks, mast, devices','op_mount','Mount / Dismount (3-point)'],
    ['pre_belt','Seatbelt usage','op_load','Load handling & tilt back'],
    ['op_speed','Travel speed <= 5 mph','op_horn','Horn use at intersections'],
    ['op_ped','Pedestrian awareness','op_ramp','Ramp parking technique'],
    ['park_proc','Parking procedure','op_control','Overall smooth control']
  ]
  let y = height - 275
  rows.forEach(r=>{
    const [id1,txt1,id2,txt2] = r
    ;[[id1,txt1,0],[id2,txt2,1]].forEach(([id,txt,col]:any)=>{
      const x = 40 + col*colW
      const cb = form.createCheckBox(id)
      cb.addToPage(page,{ x, y: y-12, width:18, height:18, borderWidth:1, borderColor:TEAL })
      page.drawText(txt, { x: x+24, y:y-4, size:11, font })
    })
    y -= 32
  })

  /* certification */
  page.drawText('I certify that the above practical skills were evaluated in accordance with 29 CFR 1910.178(m). Any "No" requires remediation and retest.',
    { x:40, y:y-20, size:9, font })

  /* signature widget */
  const sigY = y - 65
  const sig = form.createTextField('sig_evaluator')
  sig.addToPage(page,{ x:40, y:sigY, width: width/2 - 60, height:40, borderWidth:1, borderColor: rgb(0,0,0) })
  sig.setFontSize(10)
  // date field next to signature
  tf('sig_date', width/2+20, sigY+12, 120)
  page.drawText('Evaluator signature', { x:40, y:sigY-15, size:8, font })
  page.drawText('Date', { x: width/2+20, y:sigY-15, size:8, font })

  /* Comments multiline */
  page.drawText('Additional Comments / Corrective Actions', { x:40, y:sigY-55, size:10, font })
  const comments = form.createTextField('comments')
  comments.enableMultiline()
  comments.addToPage(page, { x:40, y:sigY-145, width: width-80, height:80, borderColor: rgb(0,0,0), borderWidth:0.5 })

  /* footer */
  page.drawText(`Form v${data.version} | Retain 3 years`, { x:40, y:30, size:8, font })
  page.drawText('Page 1 of 1', { x: width-100, y:30, size:8, font })

  return pdf.save()
}

// Generate static evaluation PDF for public download
async function generateStaticEvaluationPDF() {
  const pdfBytes = await generateEvaluationPDF({ version: '2.0' })
  const outputPath = path.join(process.cwd(), 'public', 'evaluation.pdf')
  fs.writeFileSync(outputPath, pdfBytes)
  console.log('✅ Generated evaluation.pdf successfully!')
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateStaticEvaluationPDF()
} 