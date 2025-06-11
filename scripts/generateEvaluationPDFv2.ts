import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

async function generateEvaluationPDF() {
  console.log('🚀 Starting PDF generation...');
  
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // 8.5" x 11" in points (72 DPI)
  
  // Load fonts
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Colors
  const canyonRust = rgb(0.655, 0.306, 0.133); // #A74E22
  const slateGray = rgb(0.282, 0.333, 0.408); // #485569 (slate-600)
  const lightGray = rgb(0.961, 0.961, 0.961); // #F5F5F5
  const white = rgb(1, 1, 1);
  const black = rgb(0, 0, 0);

  // Page dimensions
  const { width, height } = page.getSize();
  
  // HEADER BANNER (0.6" = 43.2 points)
  const headerHeight = 43.2;
  page.drawRectangle({
    x: 0,
    y: height - headerHeight,
    width: width,
    height: headerHeight,
    color: canyonRust,
  });
  
  // Header text - "Forklift Operator Practical Evaluation"
  page.drawText('Forklift Operator Practical Evaluation', {
    x: width - 350,
    y: height - 28,
    size: 18,
    font: helveticaBold,
    color: white,
  });
  
  // Logo placeholder (left side)
  page.drawText('Flat Earth Safety™', {
    x: 20,
    y: height - 28,
    size: 16,
    font: helveticaBold,
    color: white,
  });

  // CFR Reference below banner
  const cfrY = height - headerHeight - 25;
  page.drawText('29 CFR 1910.178(l) - Powered Industrial Truck Operator Training Requirements', {
    x: 40,
    y: cfrY,
    size: 10,
    font: helvetica,
    color: slateGray,
  });

  // FORM FIELDS GRID (Two columns)
  const formStartY = cfrY - 40;
  const leftCol = 40;
  const rightCol = 320;
  const fieldHeight = 20;
  const fieldSpacing = 35;

  // Left column
  page.drawText('Operator Name/ID:', {
    x: leftCol,
    y: formStartY,
    size: 11,
    font: helveticaBold,
    color: black,
  });
  
  page.drawRectangle({
    x: leftCol + 100,
    y: formStartY - 5,
    width: 160,
    height: fieldHeight,
    borderColor: black,
    borderWidth: 1,
  });

  page.drawText('Date:', {
    x: leftCol,
    y: formStartY - fieldSpacing,
    size: 11,
    font: helveticaBold,
    color: black,
  });
  
  page.drawRectangle({
    x: leftCol + 100,
    y: formStartY - fieldSpacing - 5,
    width: 160,
    height: fieldHeight,
    borderColor: black,
    borderWidth: 1,
  });

  // Right column
  page.drawText('Evaluator Name/Title:', {
    x: rightCol,
    y: formStartY,
    size: 11,
    font: helveticaBold,
    color: black,
  });
  
  page.drawRectangle({
    x: rightCol + 120,
    y: formStartY - 5,
    width: 160,
    height: fieldHeight,
    borderColor: black,
    borderWidth: 1,
  });

  page.drawText('Equipment Type/ID:', {
    x: rightCol,
    y: formStartY - fieldSpacing,
    size: 11,
    font: helveticaBold,
    color: black,
  });
  
  page.drawRectangle({
    x: rightCol + 120,
    y: formStartY - fieldSpacing - 5,
    width: 160,
    height: fieldHeight,
    borderColor: black,
    borderWidth: 1,
  });

  // CHECKLIST TABLE
  const checklistStartY = formStartY - 100;
  const checkboxSize = 14;
  const rowHeight = 28;
  
  const checklistItems = [
    'Pre-Operation Inspection: Fluid levels, tires, forks, mast, safety devices',
    'Personal Safety: Seatbelt usage and proper mounting/dismounting (3-point)',
    'Operating Speed: Travel speed 5 mph or less, appropriate for conditions',
    'Pedestrian Safety: Horn use at intersections, awareness of surroundings',
    'Load Handling: Proper tilt back, smooth control, load capacity adherence'
  ];

  page.drawText('Mark "YES" only when operator demonstrates each action safely and unaided:', {
    x: leftCol,
    y: checklistStartY + 20,
    size: 11,
    font: helveticaBold,
    color: black,
  });

  // Draw checklist items
  checklistItems.forEach((item, index) => {
    const y = checklistStartY - (index * rowHeight);
    
    // Checkbox with light gray fill
    page.drawRectangle({
      x: leftCol,
      y: y - checkboxSize/2,
      width: checkboxSize,
      height: checkboxSize,
      color: lightGray,
      borderColor: black,
      borderWidth: 1,
    });
    
    // Item text
    page.drawText(item, {
      x: leftCol + 25,
      y: y - 4,
      size: 11,
      font: helvetica,
      color: black,
      maxWidth: 480,
    });
  });

  // CERTIFICATION STATEMENT
  const certY = checklistStartY - (checklistItems.length * rowHeight) - 40;
  
  page.drawText('CERTIFICATION STATEMENT', {
    x: leftCol,
    y: certY,
    size: 11,
    font: helveticaBold,
    color: black,
  });

  const certText = 'I certify that the above practical skills were evaluated in accordance with 29 CFR 1910.178(l)(6). ' +
                  'The operator has demonstrated competency in all required areas.';
  
  page.drawText(certText, {
    x: leftCol,
    y: certY - 20,
    size: 11,
    font: helveticaBold,
    color: black,
    maxWidth: 500,
    lineHeight: 16,
  });

  page.drawText('Note: Any "No" or failed demonstration requires remediation and complete retest.', {
    x: leftCol,
    y: certY - 55,
    size: 10,
    font: helvetica,
    color: slateGray,
    maxWidth: 500,
  });

  // SIGNATURE LINES
  const sigY = certY - 90;
  const lineWidth = 252; // 3.5 inches in points
  
  // Evaluator signature
  page.drawLine({
    start: { x: leftCol, y: sigY },
    end: { x: leftCol + lineWidth, y: sigY },
    thickness: 1,
    color: black,
  });
  
  page.drawText('Evaluator Signature', {
    x: leftCol,
    y: sigY - 15,
    size: 9,
    font: helvetica,
    color: black,
  });

  // Date line
  page.drawLine({
    start: { x: rightCol + 50, y: sigY },
    end: { x: rightCol + 180, y: sigY },
    thickness: 1,
    color: black,
  });
  
  page.drawText('Date', {
    x: rightCol + 50,
    y: sigY - 15,
    size: 9,
    font: helvetica,
    color: black,
  });

  // FOOTER
  const footerHeight = 28.8; // 0.4 inches
  const footerY = 50;
  
  // Footer rule
  page.drawLine({
    start: { x: 40, y: footerY + footerHeight },
    end: { x: width - 40, y: footerY + footerHeight },
    thickness: 2,
    color: canyonRust,
  });

  // Footer text
  const footerText = 'Flat Earth Safety™ · Built Western Tough · Form v2.3 | Retain for 3 years\nflatearthequipment.com | contact@flatearthequipment.com | (307) 302-0043';
  
  page.drawText(footerText, {
    x: 40,
    y: footerY + 5,
    size: 8,
    font: helvetica,
    color: black,
    lineHeight: 10,
    maxWidth: width - 140, // Leave space for QR code
  });

  // GENERATE QR CODE
  console.log('📱 Generating QR code...');
  const qrUrl = 'https://flatearthequipment.com/safety/records';
  const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, {
    width: 54, // 0.75 inches at 72 DPI
    margin: 0,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });
  
  // Convert data URL to bytes
  const qrCodeImageBytes = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
  const qrCodeImage = await pdfDoc.embedPng(qrCodeImageBytes);
  
  // Draw QR code
  const qrSize = 54;
  page.drawImage(qrCodeImage, {
    x: width - 60 - qrSize,
    y: footerY,
    width: qrSize,
    height: qrSize,
  });

  // Save the PDF
  console.log('💾 Saving PDF...');
  const pdfBytes = await pdfDoc.save();
  
  // Ensure local directory exists
  const outputDir = path.join(process.cwd(), 'public', 'pdfs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const localPath = path.join(outputDir, 'forklift-eval-v2.3.pdf');
  fs.writeFileSync(localPath, pdfBytes);
  
  console.log('✅ PDF generated locally at:', localPath);
  console.log('📁 File size:', (pdfBytes.length / 1024).toFixed(1), 'KB');
  
  return localPath;
}

// Run the script
generateEvaluationPDF().catch(console.error); 