const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function generatePDF() {
  console.log('🚀 Starting PDF generation...');
  
  try {
    // Read the HTML file
    const htmlPath = path.join(__dirname, 'generate-evaluation-pdf.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Launch Puppeteer
    console.log('📖 Reading HTML template...');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set the content
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    });
    
    // Wait for fonts to load
    await page.evaluateHandle('document.fonts.ready');
    
    console.log('📄 Generating PDF...');
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      displayHeaderFooter: false,
      preferCSSPageSize: true
    });
    
    await browser.close();
    
    // Save the PDF
    const outputPath = path.join(__dirname, '..', 'public', 'pdfs', 'forklift-evaluation-form-v2.4.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    
    console.log('✅ PDF generated successfully!');
    console.log(`📁 Saved to: ${outputPath}`);
    console.log('🔗 Available at: /pdfs/forklift-evaluation-form-v2.4.pdf');
    
    // Get file size
    const stats = fs.statSync(outputPath);
    const fileSizeInBytes = stats.size;
    const fileSizeInKB = (fileSizeInBytes / 1024).toFixed(2);
    console.log(`📊 File size: ${fileSizeInKB} KB`);
    
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    process.exit(1);
  }
}

// Run the function
if (require.main === module) {
  generatePDF();
}

module.exports = generatePDF; 