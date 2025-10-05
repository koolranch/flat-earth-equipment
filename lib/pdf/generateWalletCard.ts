import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import QRCode from 'qrcode';

export type WalletCardInput = {
  traineeName: string;
  employer?: string | null;
  certificateId: string; // uuid
  verifyCode: string;    // e.g. 10-char code
  issuedAt?: string | null; // ISO
  expiresAt?: string | null; // ISO
  equipment?: string | null; // e.g. "Class I Electric"
  baseUrl: string; // e.g. https://yourdomain.com
  orgName: string; // e.g. Flat Earth Equipment
  brandHex?: string; // default #F76511
};

const INCH = 72; // PDF points per inch
// Wallet card: 3.375" x 2.125"
const CARD_W = 3.375 * INCH; // 243 pt
const CARD_H = 2.125 * INCH; // 153 pt

function hexToRgb(hex: string) {
  const n = hex.replace('#','');
  const r = parseInt(n.substring(0,2), 16) / 255;
  const g = parseInt(n.substring(2,4), 16) / 255;
  const b = parseInt(n.substring(4,6), 16) / 255;
  return rgb(r,g,b);
}

export async function generateWalletCardPDF(input: WalletCardInput): Promise<Uint8Array> {
  const brandOrange = hexToRgb(input.brandHex || '#F76511');
  const darkBlue = rgb(0.06, 0.09, 0.16);
  const mediumGray = rgb(0.38, 0.38, 0.42);
  const lightGray = rgb(0.95, 0.95, 0.95);

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const verifyUrl = `${input.baseUrl.replace(/\/$/, '')}/verify/${encodeURIComponent(input.verifyCode)}`;
  const qrPng = await QRCode.toBuffer(verifyUrl, { width: 200, margin: 0 });
  const qrImg = await pdf.embedPng(qrPng);

  // FRONT - Professional Design
  {
    const page = pdf.addPage([CARD_W, CARD_H]);
    
    // Double border for professional look
    page.drawRectangle({ x: 4, y: 4, width: CARD_W - 8, height: CARD_H - 8, borderColor: darkBlue, borderWidth: 2 });
    page.drawRectangle({ x: 7, y: 7, width: CARD_W - 14, height: CARD_H - 14, borderColor: brandOrange, borderWidth: 0.5 });

    // Header bar with gradient effect (simulated)
    page.drawRectangle({ x: 7, y: CARD_H - 32, width: CARD_W - 14, height: 25, color: brandOrange });
    
    // OSHA badge in corner
    page.drawText('OSHA', { x: 12, y: CARD_H - 20, size: 7, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText('Certified', { x: 12, y: CARD_H - 28, size: 5, font, color: rgb(1, 1, 1) });
    
    // Title
    page.drawText('FORKLIFT OPERATOR', { x: 52, y: CARD_H - 18, size: 9, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText('CERTIFICATION CARD', { x: 52, y: CARD_H - 28, size: 7, font, color: rgb(1, 1, 1) });

    // Name section with underline (truncate long user IDs)
    const nameY = CARD_H - 48;
    const displayName = input.traineeName.length > 30 
      ? 'Certified Operator' 
      : input.traineeName;
    page.drawText(displayName, { x: 12, y: nameY, size: 13, font: fontBold, color: darkBlue });
    page.drawLine({ start: { x: 12, y: nameY - 2 }, end: { x: 140, y: nameY - 2 }, thickness: 1, color: brandOrange });

    // Details section (better spacing)
    let detailY = CARD_H - 68;
    const detailSize = 8;
    
    page.drawText('Equipment:', { x: 12, y: detailY, size: 7, font: fontBold, color: mediumGray });
    page.drawText(input.equipment || 'Powered Industrial Truck', { x: 12, y: detailY - 10, size: detailSize, font: fontBold, color: darkBlue });
    
    detailY -= 12;
    if (input.employer) {
      page.drawText('Employer:', { x: 12, y: detailY, size: detailSize - 0.5, font: fontBold, color: mediumGray });
      page.drawText(input.employer, { x: 48, y: detailY, size: detailSize, font, color: darkBlue });
      detailY -= 12;
    }
    
    // Dates in bordered box (cleaner styling)
    page.drawRectangle({ x: 10, y: 24, width: 135, height: 28, borderWidth: 1, borderColor: brandOrange, color: lightGray });
    page.drawText('Issued:', { x: 14, y: 44, size: 7, font: fontBold, color: mediumGray });
    page.drawText(input.issuedAt ? new Date(input.issuedAt).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' }) : '-', { x: 14, y: 32, size: 8, font: fontBold, color: darkBlue });
    page.drawText('Expires:', { x: 80, y: 44, size: 7, font: fontBold, color: mediumGray });
    page.drawText(input.expiresAt ? new Date(input.expiresAt).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' }) : '-', { x: 80, y: 32, size: 8, font: fontBold, color: darkBlue });

    // Verification code
    page.drawText(`Code: ${input.verifyCode}`, { x: 12, y: 14, size: 6.5, font: fontBold, color: mediumGray });

    // QR code (right side, bordered)
    const qrSize = 90;
    page.drawRectangle({ x: CARD_W - qrSize - 18, y: 20, width: qrSize + 6, height: qrSize + 14, borderWidth: 1.5, borderColor: brandOrange });
    page.drawText('VERIFY', { x: CARD_W - qrSize + 5, y: qrSize + 30, size: 7, font: fontBold, color: brandOrange });
    page.drawImage(qrImg, { x: CARD_W - qrSize - 15, y: 23, width: qrSize, height: qrSize });
  }

  // BACK - OSHA Compliance Information
  {
    const page = pdf.addPage([CARD_W, CARD_H]);
    
    // Matching borders
    page.drawRectangle({ x: 4, y: 4, width: CARD_W - 8, height: CARD_H - 8, borderColor: darkBlue, borderWidth: 2 });
    page.drawRectangle({ x: 7, y: 7, width: CARD_W - 14, height: CARD_H - 14, borderColor: brandOrange, borderWidth: 0.5 });

    // Header section
    page.drawRectangle({ x: 7, y: CARD_H - 32, width: CARD_W - 14, height: 25, color: lightGray });
    page.drawRectangle({ x: 7, y: CARD_H - 32, width: CARD_W - 14, height: 2, color: brandOrange });
    page.drawText('OSHA COMPLIANCE REQUIREMENTS', { x: 24, y: CARD_H - 22, size: 9, font: fontBold, color: darkBlue });

    // OSHA Requirements
    page.drawText('29 CFR 1910.178(l)', { x: 12, y: CARD_H - 42, size: 7, font: fontBold, color: brandOrange });
    
    const requirements = [
      '* Formal training completed',
      '* Workplace evaluation required',
      '* Equipment-specific training',
      '* Valid for 3 years from issue date'
    ];
    let y = CARD_H - 56;
    requirements.forEach((req) => {
      page.drawText(req, { x: 12, y, size: 7, font, color: darkBlue });
      y -= 12;
    });

    // Important notice box (more prominent)
    page.drawRectangle({ x: 10, y: 28, width: CARD_W - 20, height: 36, borderWidth: 1.5, borderColor: brandOrange, color: rgb(1, 0.98, 0.95) });
    page.drawText('IMPORTANT:', { x: 14, y: 56, size: 8, font: fontBold, color: brandOrange });
    page.drawText('Employer must verify and document', { x: 14, y: 46, size: 6.5, font: fontBold, color: darkBlue });
    page.drawText('practical skills before independent', { x: 14, y: 38, size: 6.5, font, color: darkBlue });
    page.drawText('operation.', { x: 14, y: 30, size: 6.5, font, color: darkBlue });

    // Footer with brand
    page.drawRectangle({ x: 7, y: 7, width: CARD_W - 14, height: 18, color: brandOrange });
    page.drawText('Flat Earth Equipment', { x: 55, y: 15, size: 9, font: fontBold, color: rgb(1, 1, 1) });
    
    // Verify URL (larger, more visible)
    const url = verifyUrl.replace(/^https?:\/\//, '');
    page.drawText(`Verify: ${url}`, { x: 12, y: 15, size: 6, font: fontBold, color: rgb(1, 1, 1) });
  }

  const bytes = await pdf.save();
  return bytes;
}
