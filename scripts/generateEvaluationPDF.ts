import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import fs from 'fs'
import path from 'path'

async function generateEvaluationPDF() {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([612, 792]) // Letter size
  
  // Load fonts
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  
  // Colors
  const black = rgb(0, 0, 0)
  const gray = rgb(0.4, 0.4, 0.4)
  const orange = rgb(1, 0.4, 0)
  
  let y = 750
  
  // Header
  page.drawText('Forklift Operator Practical Evaluation', {
    x: 50,
    y: y,
    size: 24,
    font: helveticaBold,
    color: black
  })
  
  y -= 30
  page.drawText('— DRAFT —', {
    x: 260,
    y: y,
    size: 14,
    font: helveticaBold,
    color: orange
  })
  
  // Line under header
  y -= 20
  page.drawLine({
    start: { x: 50, y: y },
    end: { x: 562, y: y },
    thickness: 2,
    color: black
  })
  
  // Info fields
  y -= 40
  const infoFields = [
    'Operator Name: _____________________________________________',
    'Date: _______________________________________________________',
    'Evaluator: __________________________________________________',
    'Equipment Type: _____________________________________________'
  ]
  
  for (const field of infoFields) {
    page.drawText(field, {
      x: 50,
      y: y,
      size: 12,
      font: helvetica,
      color: black
    })
    y -= 25
  }
  
  // Assessment title
  y -= 20
  page.drawText('Practical Skills Assessment', {
    x: 50,
    y: y,
    size: 16,
    font: helveticaBold,
    color: black
  })
  
  y -= 20
  page.drawText('Check YES or NO for each item. All items must be YES for operator to pass.', {
    x: 50,
    y: y,
    size: 11,
    font: helvetica,
    color: gray
  })
  
  // Checklist items
  y -= 30
  const checklistItems = [
    'Pre-Operation Inspection: Conducted thorough inspection including\n  fluid levels, tires, forks, mast, and safety devices',
    'Mounting/Dismounting: Used three-point contact and faced\n  equipment when getting on/off',
    'Seatbelt Usage: Properly fastened seatbelt before operating',
    'Load Handling: Approached load squarely, tilted mast back,\n  and kept load low during travel',
    'Travel Speed: Maintained safe speed (5 mph or less in work areas)\n  and slowed at corners',
    'Horn Usage: Sounded horn at intersections, blind spots,\n  and when pedestrians present',
    'Pedestrian Awareness: Maintained safe distance and yielded\n  right-of-way to pedestrians',
    'Ramp/Incline Operation: Traveled with load uphill and\n  demonstrated proper grade technique',
    'Parking Procedure: Lowered forks, applied parking brake,\n  turned off equipment, removed key',
    'Overall Control: Demonstrated smooth operation without\n  abrupt movements or unsafe acts'
  ]
  
  for (const item of checklistItems) {
    // Draw YES/NO checkboxes
    page.drawText('YES [ ]   NO [ ]', {
      x: 50,
      y: y,
      size: 11,
      font: helvetica,
      color: black
    })
    
    // Draw item text
    const lines = item.split('\n')
    let itemY = y
    for (const line of lines) {
      page.drawText(line, {
        x: 150,
        y: itemY,
        size: 11,
        font: helvetica,
        color: black
      })
      itemY -= 15
    }
    
    y -= (lines.length * 15 + 10)
    
    // Check if we need a new page
    if (y < 150) {
      const newPage = pdfDoc.addPage([612, 792])
      y = 750
    }
  }
  
  // Certification section
  y -= 30
  page.drawText('Certification', {
    x: 50,
    y: y,
    size: 16,
    font: helveticaBold,
    color: black
  })
  
  y -= 20
  page.drawText('I certify that the above evaluation was conducted according to', {
    x: 50,
    y: y,
    size: 11,
    font: helvetica,
    color: black
  })
  
  y -= 15
  page.drawText('OSHA 29 CFR 1910.178 requirements.', {
    x: 50,
    y: y,
    size: 11,
    font: helvetica,
    color: black
  })
  
  // Signature lines
  y -= 50
  page.drawText('Evaluator Signature: _____________________________  Date: ______________', {
    x: 50,
    y: y,
    size: 11,
    font: helvetica,
    color: black
  })
  
  // Footer
  y = 50
  page.drawText('Flat Earth Equipment • Operator Safety Training • www.flatearthequipment.com', {
    x: 100,
    y: y,
    size: 10,
    font: helvetica,
    color: gray
  })
  
  y -= 15
  page.drawText('This evaluation must be retained for 3 years per OSHA requirements', {
    x: 130,
    y: y,
    size: 10,
    font: helvetica,
    color: gray
  })
  
  // Save the PDF
  const pdfBytes = await pdfDoc.save()
  
  // Write to file
  const outputPath = path.join(process.cwd(), 'public', 'evaluation.pdf')
  fs.writeFileSync(outputPath, pdfBytes)
  
  console.log('✅ Generated evaluation.pdf successfully!')
}

generateEvaluationPDF().catch(console.error) 