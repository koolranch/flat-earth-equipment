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

    // Name section with underline
    const nameY = CARD_H - 48;
    page.drawText(input.traineeName, { x: 12, y: nameY, size: 12, font: fontBold, color: darkBlue });
    page.drawLine({ start: { x: 12, y: nameY - 2 }, end: { x: 140, y: nameY - 2 }, thickness: 0.5, color: brandOrange });

    // Details section
    let detailY = CARD_H - 66;
    const detailSize = 7.5;
    
    page.drawText('Equipment:', { x: 12, y: detailY, size: detailSize - 0.5, font: fontBold, color: mediumGray });
    page.drawText(input.equipment || 'Powered Industrial Truck', { x: 48, y: detailY, size: detailSize, font, color: darkBlue });
    
    detailY -= 12;
    if (input.employer) {
      page.drawText('Employer:', { x: 12, y: detailY, size: detailSize - 0.5, font: fontBold, color: mediumGray });
      page.drawText(input.employer, { x: 48, y: detailY, size: detailSize, font, color: darkBlue });
      detailY -= 12;
    }
    
    // Dates in bordered box
    page.drawRectangle({ x: 10, y: 28, width: 130, height: 24, borderWidth: 0.5, borderColor: mediumGray, color: lightGray });
    page.drawText('Issued:', { x: 13, y: 42, size: 7, font: fontBold, color: darkBlue });
    page.drawText(input.issuedAt ? new Date(input.issuedAt).toLocaleDateString() : '-', { x: 13, y: 33, size: 7, font, color: darkBlue });
    page.drawText('Expires:', { x: 75, y: 42, size: 7, font: fontBold, color: darkBlue });
    page.drawText(input.expiresAt ? new Date(input.expiresAt).toLocaleDateString() : '-', { x: 75, y: 33, size: 7, font, color: darkBlue });

    // Verification code
    page.drawText(`Code: ${input.verifyCode}`, { x: 12, y: 14, size: 6.5, font: fontBold, color: mediumGray });

    // QR code (right side, bordered)
    const qrSize = 90;
    page.drawRectangle({ x: CARD_W - qrSize - 18, y: 20, width: qrSize + 6, height: qrSize + 14, borderWidth: 1, borderColor: mediumGray });
    page.drawText('VERIFY', { x: CARD_W - qrSize - 1, y: qrSize + 28, size: 6, font: fontBold, color: darkBlue });
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

    // Important notice box
    page.drawRectangle({ x: 10, y: 32, width: CARD_W - 20, height: 28, borderWidth: 0.5, borderColor: brandOrange, color: rgb(1, 0.98, 0.95) });
    page.drawText('IMPORTANT:', { x: 13, y: 52, size: 7, font: fontBold, color: darkBlue });
    page.drawText('Employer must verify and document', { x: 13, y: 44, size: 6.5, font, color: darkBlue });
    page.drawText('practical skills before operation.', { x: 13, y: 37, size: 6.5, font, color: darkBlue });

    // Footer with brand
    page.drawRectangle({ x: 7, y: 7, width: CARD_W - 14, height: 16, color: brandOrange });
    page.drawText('Flat Earth Equipment', { x: 52, y: 13, size: 8, font: fontBold, color: rgb(1, 1, 1) });
    
    // Verify URL
    const url = verifyUrl.replace(/^https?:\/\//, '');
    page.drawText(`Verify: ${url}`, { x: 12, y: 13, size: 5.5, font, color: rgb(1, 1, 1) });
  }

  const bytes = await pdf.save();
  return bytes;
}
