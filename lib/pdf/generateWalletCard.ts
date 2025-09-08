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
  const brand = hexToRgb(input.brandHex || '#F76511');
  const slate = rgb(0.059, 0.090, 0.165); // slate-900
  const gray = rgb(0.83, 0.87, 0.92);     // ~slate-300

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const verifyUrl = `${input.baseUrl.replace(/\/$/, '')}/verify/${encodeURIComponent(input.verifyCode)}`;
  const qrPng = await QRCode.toBuffer(verifyUrl, { width: 180, margin: 0 });
  const qrImg = await pdf.embedPng(qrPng);

  // FRONT
  {
    const page = pdf.addPage([CARD_W, CARD_H]);
    // background frame
    page.drawRectangle({ x: 6, y: 6, width: CARD_W - 12, height: CARD_H - 12, borderColor: slate, borderWidth: 1, color: rgb(1,1,1) });

    // header bar
    page.drawRectangle({ x: 6, y: CARD_H - 28, width: CARD_W - 12, height: 22, color: brand });
    page.drawText(`${input.orgName} — Operator Card`, { x: 14, y: CARD_H - 22, size: 10, font: fontBold, color: rgb(1,1,1) });

    // Name (big)
    page.drawText(input.traineeName, { x: 14, y: CARD_H - 52, size: 14, font: fontBold, color: slate });

    // Employer / Equipment lines
    const lineY1 = CARD_H - 72;
    const lineY2 = CARD_H - 88;
    page.drawText(`Employer: ${input.employer || '—'}`, { x: 14, y: lineY1, size: 9, font, color: slate });
    page.drawText(`Equipment: ${input.equipment || 'Powered Industrial Truck'}`, { x: 14, y: lineY2, size: 9, font, color: slate });

    // Dates
    const lineY3 = CARD_H - 106;
    page.drawText(`Issued: ${input.issuedAt ? new Date(input.issuedAt).toLocaleDateString() : '—'}`, { x: 14, y: lineY3, size: 9, font, color: slate });
    const expText = `Expires: ${input.expiresAt ? new Date(input.expiresAt).toLocaleDateString() : '—'}`;
    const expWidth = font.widthOfTextAtSize(expText, 9);
    page.drawText(expText, { x: CARD_W - 14 - expWidth, y: lineY3, size: 9, font, color: slate });

    // Verify code (human)
    const codeY = 18;
    const codeLabel = `Verify: ${input.verifyCode}`;
    page.drawText(codeLabel, { x: 14, y: codeY, size: 9, font: fontBold, color: slate });

    // QR (right)
    const qrSize = 84; // pt
    page.drawImage(qrImg, { x: CARD_W - qrSize - 14, y: 18, width: qrSize, height: qrSize });
  }

  // BACK (simple instructions + verification URL)
  {
    const page = pdf.addPage([CARD_W, CARD_H]);
    page.drawRectangle({ x: 6, y: 6, width: CARD_W - 12, height: CARD_H - 12, borderColor: slate, borderWidth: 1, color: rgb(1,1,1) });

    page.drawText('Employer Evaluation:', { x: 14, y: CARD_H - 28, size: 11, font: fontBold, color: slate });
    const bullets = [
      'This card is valid only with onsite evaluation.',
      'Operator must follow site-specific rules.',
      'Scan QR to verify status or revoke.'
    ];
    let y = CARD_H - 48;
    bullets.forEach((b) => {
      page.drawCircle({ x: 16, y: y + 3.2, size: 1.8, color: slate });
      page.drawText(b, { x: 22, y, size: 9, font, color: slate });
      y -= 14;
    });

    // Light brand stripe bottom
    page.drawRectangle({ x: 6, y: 10, width: CARD_W - 12, height: 8, color: brand });

    // Verify URL (short)
    const url = verifyUrl.replace(/^https?:\/\//, '');
    const urlW = font.widthOfTextAtSize(url, 9);
    page.drawText(url, { x: (CARD_W - urlW) / 2, y: 22, size: 9, font: fontBold, color: slate });
  }

  const bytes = await pdf.save();
  return bytes;
}
