#!/usr/bin/env node

// Generate Forklift Daily Inspection Checklist PDF
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function generateChecklist() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]); // Letter size
  const { height, width } = page.getSize();
  
  // Fonts
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  
  // Colors
  const orange = rgb(0.97, 0.4, 0.07); // #F76511
  const slate = rgb(0.06, 0.09, 0.16); // Dark blue
  const gray = rgb(0.4, 0.4, 0.4);
  const lightGray = rgb(0.9, 0.9, 0.9);
  
  // Header bar
  page.drawRectangle({ x: 0, y: height - 80, width, height: 80, color: slate });
  page.drawText('FLAT EARTH SAFETY', { 
    x: 40, y: height - 40, size: 24, font: fontBold, color: rgb(1, 1, 1) 
  });
  page.drawText('Forklift Operator Daily Inspection Checklist', { 
    x: 40, y: height - 62, size: 12, font, color: rgb(1, 1, 1) 
  });
  
  // Orange accent line
  page.drawRectangle({ x: 0, y: height - 84, width, height: 4, color: orange });
  
  let y = height - 110;
  const leftMargin = 40;
  const rightMargin = width - 40;
  
  // Instructions section
  page.drawText('INSTRUCTIONS:', { x: leftMargin, y, size: 11, font: fontBold, color: slate });
  y -= 16;
  page.drawText('Complete this checklist before each shift. Check box for OK or mark X for defect found.', { 
    x: leftMargin, y, size: 9, font, color: gray 
  });
  y -= 12;
  page.drawText('Report any defects immediately. DO NOT operate if defects affect safe operation.', { 
    x: leftMargin, y, size: 9, font, color: gray 
  });
  y -= 24;
  
  // Operator Info Box
  page.drawRectangle({ 
    x: leftMargin, y: y - 60, width: rightMargin - leftMargin, height: 60, 
    borderColor: gray, borderWidth: 1, color: lightGray 
  });
  
  page.drawText('Date: ________________', { x: leftMargin + 10, y: y - 20, size: 10, font, color: slate });
  page.drawText('Shift: [ ] AM  [ ] PM  [ ] Night', { x: leftMargin + 200, y: y - 20, size: 10, font, color: slate });
  
  page.drawText('Operator Name: _________________________________', { 
    x: leftMargin + 10, y: y - 40, size: 10, font, color: slate 
  });
  page.drawText('Unit #: ____________', { x: leftMargin + 380, y: y - 40, size: 10, font, color: slate });
  
  y -= 80;
  
  // Checklist sections
  const sections = [
    {
      title: 'VISUAL INSPECTION (Engine/Key Off)',
      items: [
        'Tires/Wheels - Check for damage, proper inflation, wear',
        'Forks - Check for cracks, bends, proper positioning',
        'Overhead Guard - Check for damage, loose bolts',
        'Load Backrest - Inspect for damage, secure mounting',
        'Fluid Levels - Check hydraulic, engine oil, coolant, fuel',
        'Battery - Check connections, fluid level (if applicable)',
        'Leaks - Look for hydraulic, oil, or fuel leaks',
        'Lights/Horn - Verify all lights and horn operational',
        'Safety Decals - Check all warning labels are visible',
        'Fire Extinguisher - Verify present and charged'
      ]
    },
    {
      title: 'OPERATIONAL TEST (Engine/Key On)',
      items: [
        'Steering - Test for smooth operation and response',
        'Brakes - Test service and parking brake function',
        'Lift Controls - Check for smooth up/down operation',
        'Tilt Controls - Test forward/backward tilt function',
        'Horn - Test audible warning device',
        'Backup Alarm - Verify operational (if equipped)',
        'Lights - Test headlights, taillights, turn signals',
        'Gauges/Instruments - Verify all display properly',
        'Seat Belt - Check for damage and proper function',
        'Emergency Shut-off - Test accessibility and operation'
      ]
    }
  ];
  
  for (const section of sections) {
    // Section header
    page.drawRectangle({ 
      x: leftMargin, y: y - 18, width: rightMargin - leftMargin, height: 18, 
      color: orange 
    });
    page.drawText(section.title, { 
      x: leftMargin + 8, y: y - 14, size: 10, font: fontBold, color: rgb(1, 1, 1) 
    });
    y -= 24;
    
    // Draw table header
    page.drawText('ITEM', { x: leftMargin + 10, y, size: 9, font: fontBold, color: slate });
    page.drawText('OK', { x: rightMargin - 80, y, size: 9, font: fontBold, color: slate });
    page.drawText('DEFECT', { x: rightMargin - 40, y, size: 9, font: fontBold, color: slate });
    y -= 2;
    page.drawLine({ 
      start: { x: leftMargin, y }, end: { x: rightMargin, y }, 
      thickness: 1, color: gray 
    });
    y -= 12;
    
    // Items
    for (const item of section.items) {
      // Zebra striping
      const itemIndex = section.items.indexOf(item);
      if (itemIndex % 2 === 0) {
        page.drawRectangle({ 
          x: leftMargin, y: y - 10, width: rightMargin - leftMargin, height: 14, 
          color: rgb(0.98, 0.98, 0.98) 
        });
      }
      
      page.drawText(item, { x: leftMargin + 10, y, size: 8, font, color: slate });
      
      // Checkbox for OK
      page.drawRectangle({ 
        x: rightMargin - 75, y: y - 2, width: 10, height: 10, 
        borderColor: gray, borderWidth: 1 
      });
      
      // Checkbox for DEFECT
      page.drawRectangle({ 
        x: rightMargin - 35, y: y - 2, width: 10, height: 10, 
        borderColor: gray, borderWidth: 1 
      });
      
      y -= 14;
    }
    
    y -= 10;
  }
  
  // Defects section
  page.drawRectangle({ 
    x: leftMargin, y: y - 18, width: rightMargin - leftMargin, height: 18, 
    color: rgb(0.8, 0.2, 0.2) 
  });
  page.drawText('DEFECTS FOUND (Describe below)', { 
    x: leftMargin + 8, y: y - 14, size: 10, font: fontBold, color: rgb(1, 1, 1) 
  });
  y -= 24;
  
  // Defects box
  page.drawRectangle({ 
    x: leftMargin, y: y - 40, width: rightMargin - leftMargin, height: 40, 
    borderColor: gray, borderWidth: 1 
  });
  page.drawText('_______________________________________________________________________________', { 
    x: leftMargin + 5, y: y - 15, size: 9, font, color: gray 
  });
  page.drawText('_______________________________________________________________________________', { 
    x: leftMargin + 5, y: y - 30, size: 9, font, color: gray 
  });
  y -= 50;
  
  // Certification section
  page.drawText('OPERATOR CERTIFICATION:', { x: leftMargin, y, size: 9, font: fontBold, color: slate });
  y -= 14;
  page.drawText('I certify that I have performed the above inspection and this forklift is:', { 
    x: leftMargin, y, size: 9, font, color: slate 
  });
  y -= 16;
  page.drawText('[ ]  SAFE TO OPERATE - All items OK or defects do not affect safe operation', { 
    x: leftMargin + 10, y, size: 9, font, color: slate 
  });
  y -= 14;
  page.drawText('[ ]  UNSAFE - Equipment tagged out of service, supervisor notified', { 
    x: leftMargin + 10, y, size: 9, font, color: rgb(0.8, 0.2, 0.2) 
  });
  y -= 18;
  page.drawText('Operator Signature: _________________________________    Time: _________', { 
    x: leftMargin, y, size: 9, font, color: slate 
  });
  
  // Footer
  y = 50;
  page.drawLine({ 
    start: { x: leftMargin, y }, end: { x: rightMargin, y }, 
    thickness: 1, color: lightGray 
  });
  y -= 14;
  page.drawText('Per OSHA 29 CFR 1910.178(q)(7): Daily pre-shift inspection required', { 
    x: leftMargin, y, size: 7, font, color: gray 
  });
  y -= 10;
  page.drawText('Flat Earth Safety Training | flatearthequipment.com | Free Download', { 
    x: leftMargin, y, size: 7, font: fontBold, color: orange 
  });
  
  // Save PDF
  const pdfBytes = await doc.save();
  const outputPath = join(__dirname, '..', 'public', 'pdfs', 'forklift-daily-inspection-checklist.pdf');
  writeFileSync(outputPath, pdfBytes);
  
  console.log('✅ PDF generated successfully!');
  console.log('📄 Location:', outputPath);
  console.log('🌐 URL: https://flatearthequipment.com/pdfs/forklift-daily-inspection-checklist.pdf');
}

generateChecklist().catch(console.error);

