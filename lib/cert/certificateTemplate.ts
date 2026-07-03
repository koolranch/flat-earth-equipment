import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib';
import QRCode from 'qrcode';

/**
 * Shared certificate PDF renderer used by /api/cert/issue for both web and
 * mobile-app learners. Drawing only — callers own the data payload, storage,
 * DB row, and email flow.
 */
export type CertificateTemplateData = {
  name: string;
  courseTitle: string;
  verificationCode: string;
  verifyUrl: string;
  issuedAt: string; // ISO
  expiresAt: string; // ISO
  locale?: 'en' | 'es';
  practicalVerified?: boolean;
  evaluationDate?: string | null;
};

const PAGE_W = 792;
const PAGE_H = 612;

const CREAM = rgb(253 / 255, 249 / 255, 239 / 255);
const NAVY = rgb(0.06, 0.09, 0.16);
const ORANGE = rgb(0.9686, 0.396, 0.0667); // #F76511
const GRAY = rgb(0.42, 0.44, 0.48);
const GREEN = rgb(0.12, 0.55, 0.31);
const LIGHT_RULE = rgb(0.78, 0.76, 0.7);

const CDN = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/';
const LOGO_PNG = CDN + 'logo_128.png';
const SEAL_PNG = CDN + 'seal_orange.png';

const STRINGS = {
  en: {
    docTitle: 'Certificate of Completion',
    brand: 'FORKLIFT CERTIFIED',
    title: 'Certificate of Completion',
    certifies: 'This certifies that',
    completed: 'has successfully completed the training program',
    compliance: 'OSHA-compliant formal instruction per 29 CFR 1910.178(l) — Powered Industrial Trucks',
    issueDate: 'ISSUE DATE',
    certNo: 'CERTIFICATE NO.',
    validThrough: 'VALID THROUGH',
    practicalVerified: 'PRACTICAL EVALUATION VERIFIED',
    evaluated: 'Evaluated',
    signature: 'Supervisor / Qualified Evaluator',
    signatureSub: 'Employer practical evaluation — 29 CFR 1910.178(l)(2)',
    scan: 'Scan or visit flatearthequipment.com/verify',
    footer1: 'This certificate documents completion of formal instruction under 29 CFR 1910.178(l)(1). OSHA requires a hands-on workplace',
    footer2: 'evaluation by a qualified evaluator, plus equipment- and site-specific training, before independent operation. Valid three years.',
    footerBrand: 'Issued by Flat Earth Equipment  •  Sheridan, WY  •  flatearthequipment.com',
    dateLocale: 'en-US',
  },
  es: {
    docTitle: 'Certificado de Finalización',
    brand: 'FORKLIFT CERTIFIED',
    title: 'Certificado de Finalización',
    certifies: 'Se certifica que',
    completed: 'ha completado satisfactoriamente el programa de capacitación',
    compliance: 'Instrucción formal conforme a OSHA según 29 CFR 1910.178(l) — Equipos Industriales Motorizados',
    issueDate: 'FECHA DE EMISIÓN',
    certNo: 'N.º DE CERTIFICADO',
    validThrough: 'VÁLIDO HASTA',
    practicalVerified: 'EVALUACIÓN PRÁCTICA VERIFICADA',
    evaluated: 'Evaluado',
    signature: 'Supervisor / Evaluador Calificado',
    signatureSub: 'Evaluación práctica del empleador — 29 CFR 1910.178(l)(2)',
    scan: 'Escanee o visite flatearthequipment.com/verify',
    footer1: 'Este certificado documenta la finalización de la instrucción formal según 29 CFR 1910.178(l)(1). OSHA requiere una evaluación',
    footer2: 'práctica por un evaluador calificado, más capacitación específica del equipo y del sitio, antes de la operación independiente. Válido tres años.',
    footerBrand: 'Emitido por Flat Earth Equipment  •  Sheridan, WY  •  flatearthequipment.com',
    dateLocale: 'es-ES',
  },
} as const;

function centerText(page: PDFPage, text: string, y: number, size: number, font: PDFFont, color = NAVY) {
  const w = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: (PAGE_W - w) / 2, y, size, font, color });
}

function drawTracked(page: PDFPage, text: string, xCenter: number, y: number, size: number, font: PDFFont, color = NAVY, tracking = 2.2) {
  const total = font.widthOfTextAtSize(text, size) + tracking * (text.length - 1);
  let x = xCenter - total / 2;
  for (const ch of text) {
    page.drawText(ch, { x, y, size, font, color });
    x += font.widthOfTextAtSize(ch, size) + tracking;
  }
}

/** Shrink font size until text fits maxWidth (floor keeps it legible). */
function fitSize(font: PDFFont, text: string, startSize: number, maxWidth: number, minSize: number) {
  let size = startSize;
  while (size > minSize && font.widthOfTextAtSize(text, size) > maxWidth) size -= 1;
  return size;
}

async function fetchPng(pdf: PDFDocument, url: string) {
  try {
    const bytes = await fetch(url).then((r) => {
      if (!r.ok) throw new Error(`${r.status}`);
      return r.arrayBuffer();
    });
    return await pdf.embedPng(bytes);
  } catch (e) {
    console.warn(`[cert] Optional image not loaded (${url}):`, e);
    return null;
  }
}

export async function renderCertificateTemplate(data: CertificateTemplateData): Promise<Uint8Array> {
  const locale = data.locale === 'es' ? 'es' : 'en';
  const t = STRINGS[locale];
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(t.dateLocale, { year: 'numeric', month: 'long', day: 'numeric' });

  const pdf = await PDFDocument.create();
  pdf.setTitle(`${t.docTitle} — ${data.name}`);
  pdf.setLanguage(locale === 'es' ? 'es-ES' : 'en-US');
  const page = pdf.addPage([PAGE_W, PAGE_H]);

  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvB = await pdf.embedFont(StandardFonts.HelveticaBold);
  const times = await pdf.embedFont(StandardFonts.TimesRoman);
  const timesB = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const timesI = await pdf.embedFont(StandardFonts.TimesRomanItalic);

  // Certificate paper background
  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: CREAM });

  // Frame: navy rule + orange hairline + corner accents
  page.drawRectangle({ x: 24, y: 24, width: 744, height: 564, borderWidth: 2.5, borderColor: NAVY });
  page.drawRectangle({ x: 31, y: 31, width: 730, height: 550, borderWidth: 1, borderColor: ORANGE });
  const corner = 16;
  for (const [cx, cy, dx, dy] of [[31, 31, 1, 1], [761, 31, -1, 1], [31, 581, 1, -1], [761, 581, -1, -1]] as const) {
    page.drawLine({ start: { x: cx, y: cy + dy * corner }, end: { x: cx, y: cy }, thickness: 3, color: ORANGE });
    page.drawLine({ start: { x: cx, y: cy }, end: { x: cx + dx * corner, y: cy }, thickness: 3, color: ORANGE });
  }

  const seal = await fetchPng(pdf, SEAL_PNG);
  const logo = await fetchPng(pdf, LOGO_PNG);

  // Faint watermark seal behind the body
  if (seal) {
    page.drawImage(seal, { x: PAGE_W / 2 - 130, y: PAGE_H / 2 - 130, width: 260, height: 260, opacity: 0.05 });
  }

  // ── Header ──
  if (logo) page.drawImage(logo, { x: (PAGE_W - 44) / 2, y: 512, width: 44, height: 44 });
  drawTracked(page, t.brand, PAGE_W / 2, 492, 10, helvB, GRAY, 2.6);
  const titleSize = fitSize(timesB, t.title, 36, 600, 26);
  centerText(page, t.title, 450, titleSize, timesB, NAVY);
  page.drawLine({ start: { x: PAGE_W / 2 - 70, y: 432 }, end: { x: PAGE_W / 2 + 70, y: 432 }, thickness: 1.5, color: ORANGE });

  // ── Body ──
  centerText(page, t.certifies, 408, 14, timesI, GRAY);

  const nameSize = fitSize(timesB, data.name, 32, 560, 18);
  centerText(page, data.name, 368, nameSize, timesB, NAVY);
  const nameW = timesB.widthOfTextAtSize(data.name, nameSize);
  page.drawLine({
    start: { x: (PAGE_W - nameW) / 2 - 30, y: 358 },
    end: { x: (PAGE_W + nameW) / 2 + 30, y: 358 },
    thickness: 0.75,
    color: LIGHT_RULE,
  });

  centerText(page, t.completed, 332, 12, times, GRAY);

  const courseSize = fitSize(helvB, data.courseTitle, 18, 600, 12);
  centerText(page, data.courseTitle, 302, courseSize, helvB, ORANGE);

  centerText(page, t.compliance, 280, 9.5, helv, GRAY);

  // ── Details row: issue date | certificate no. | valid through ──
  const detY = 232;
  const cols = [
    { label: t.issueDate, value: fmt(data.issuedAt), x: 216 },
    { label: t.certNo, value: data.verificationCode, x: 396 },
    { label: t.validThrough, value: fmt(data.expiresAt), x: 576 },
  ];
  for (const c of cols) {
    drawTracked(page, c.label, c.x, detY, 8, helvB, GRAY, 1.6);
    const vw = helv.widthOfTextAtSize(c.value, 12.5);
    page.drawText(c.value, { x: c.x - vw / 2, y: detY - 18, size: 12.5, font: helv, color: NAVY });
  }
  page.drawLine({ start: { x: 306, y: detY - 20 }, end: { x: 306, y: detY + 10 }, thickness: 0.5, color: LIGHT_RULE });
  page.drawLine({ start: { x: 486, y: detY - 20 }, end: { x: 486, y: detY + 10 }, thickness: 0.5, color: LIGHT_RULE });

  // Practical verification note (only when the employer evaluation passed)
  if (data.practicalVerified) {
    const note = data.evaluationDate
      ? `${t.practicalVerified} — ${t.evaluated}: ${fmt(data.evaluationDate)}`
      : t.practicalVerified;
    drawTracked(page, note, PAGE_W / 2, 188, 8.5, helvB, GREEN, 1.2);
  }

  // ── Bottom band: signature left, seal center, QR right ──
  const bandY = 128;

  const sigY = bandY + 8;
  page.drawLine({ start: { x: 110, y: sigY }, end: { x: 290, y: sigY }, thickness: 0.75, color: NAVY });
  page.drawText(t.signature, { x: 200 - helvB.widthOfTextAtSize(t.signature, 9) / 2, y: sigY - 14, size: 9, font: helvB, color: NAVY });
  page.drawText(t.signatureSub, { x: 200 - helv.widthOfTextAtSize(t.signatureSub, 7.5) / 2, y: sigY - 26, size: 7.5, font: helv, color: GRAY });

  if (seal) page.drawImage(seal, { x: PAGE_W / 2 - 44, y: bandY - 34, width: 88, height: 88 });

  try {
    const qrDataUrl = await QRCode.toDataURL(data.verifyUrl, {
      width: 300,
      margin: 0,
      errorCorrectionLevel: 'M',
      color: { dark: '#0F172A', light: '#FDF9EF' },
    });
    const qr = await pdf.embedPng(Buffer.from(qrDataUrl.split(',')[1], 'base64'));
    page.drawImage(qr, { x: 592 - 38, y: bandY - 18, width: 76, height: 76 });
  } catch (e) {
    console.warn('[cert] QR code not generated:', e);
  }
  page.drawText(t.scan, { x: 592 - helv.widthOfTextAtSize(t.scan, 7.5) / 2, y: bandY - 30, size: 7.5, font: helv, color: GRAY });

  // ── Footer ──
  centerText(page, t.footer1, 68, 7.5, helv, GRAY);
  centerText(page, t.footer2, 58, 7.5, helv, GRAY);
  centerText(page, t.footerBrand, 42, 8, helvB, NAVY);

  return pdf.save();
}
