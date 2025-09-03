import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import QRCode from 'qrcode';

export type CertData = {
  trainee_name: string;
  course_title: string;
  trainer_name?: string|null;
  issued_at: string;
  expires_at?: string|null;
  verification_code: string;
  verify_url: string;
};

export async function renderCertificatePdf(data: CertData){
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]); // Letter portrait
  const { height, width } = page.getSize();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const orange = rgb(0.9686, 0.396, 0.0667); // #F76511
  const slate = rgb(0.0588, 0.0902, 0.1647); // #0F172A

  // Header bar
  page.drawRectangle({ x:0, y:height-72, width, height:72, color: slate });
  page.drawText('Flat Earth Safety', { x:32, y:height-48, size:20, font: fontBold, color: rgb(1,1,1) });
  page.drawText('Forklift Operator Certification / Certificación de operador', { x:32, y:height-68, size:10, font, color: rgb(1,1,1) });

  // Title
  page.drawText('Certification', { x:32, y:height-120, size:22, font: fontBold, color: slate });
  page.drawText('Certificación', { x:32, y:height-138, size:10, font, color: slate });

  // Left column
  const leftX = 32; let y = height-170; const line = 18;
  const label = (en:string, es:string)=>{ page.drawText(en, { x:leftX, y, size:11, font: fontBold, color: slate }); page.drawText(es, { x:leftX+ (en.length*6)+12, y:y-2, size:8, font, color: slate }); y -= line; };
  const value = (txt:string)=>{ page.drawText(txt, { x:leftX, y, size:12, font, color: rgb(0.1,0.1,0.1) }); y -= line+4; };

  label('Trainee','Operador'); value(data.trainee_name);
  label('Course','Curso'); value(data.course_title);
  label('Issued','Emitido'); value(new Date(data.issued_at).toLocaleDateString());
  if (data.expires_at){ label('Expires','Vence'); value(new Date(data.expires_at).toLocaleDateString()); }
  if (data.trainer_name){ label('Trainer','Instructor'); value(String(data.trainer_name)); }
  label('Verification ID','ID de verificación'); value(data.verification_code);

  // QR on right
  const qrPng = await QRCode.toDataURL(`${data.verify_url}?src=pdf`);
  const qrImage = await doc.embedPng(qrPng);
  const qrSize = 144;
  page.drawImage(qrImage, { x: width-qrSize-48, y: height-qrSize-160, width: qrSize, height: qrSize });
  page.drawText('Scan to verify / Escanear para verificar', { x: width-qrSize-48, y: height-qrSize-175, size:9, font, color: slate });

  // Footer strip
  page.drawRectangle({ x:0, y:0, width, height:60, color: rgb(0.97,0.97,0.97) });
  page.drawText('Keep with employer practical evaluation records — OSHA §1910.178(l).', { x:32, y:22, size:10, font, color: slate });
  page.drawText('Conserve con la evaluación práctica del empleador — §1910.178(l).', { x:32, y:10, size:9, font, color: slate });

  const bytes = await doc.save();
  return bytes;
}
