import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export type EvalChecklist = Record<string, boolean>; // key -> pass(true)/fail(false)
export type EvalData = {
  trainee_name: string;
  trainee_email?: string | null;
  course_title: string;
  evaluator_name: string;
  evaluator_title?: string | null;
  site_location: string;
  evaluation_date: string; // ISO
  truck_type?: string | null;
  checklist: EvalChecklist;
  overall_pass: boolean;
  notes?: string | null;
  signature_png_bytes?: Uint8Array | null; // optional PNG bytes
  verification_code?: string | null; // display if available
  locale?: 'en'|'es';
};

export async function renderEvaluationPdf(data: EvalData) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const { height, width } = page.getSize();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const orange = rgb(0.9686, 0.396, 0.0667); // #F76511
  const slate = rgb(0.0588, 0.0902, 0.1647); // #0F172A

  // Header
  page.drawRectangle({ x:0, y:height-72, width, height:72, color: slate });
  page.drawText('Flat Earth Safety', { x: 32, y: height-48, size: 20, font: fontBold, color: rgb(1,1,1) });
  page.drawText('Practical Evaluation / Evaluación práctica', { x: 32, y: height-68, size: 10, font, color: rgb(1,1,1) });

  // Title
  page.drawText('Forklift Operator — Practical Evaluation', { x: 32, y: height-110, size: 16, font: fontBold, color: slate });
  page.drawText('Employer record per OSHA §1910.178(l)(6)', { x: 32, y: height-126, size: 10, font, color: slate });

  const leftX = 32; let y = height-150; const line = 16;
  function label(en: string, es: string){
    page.drawText(en, { x:leftX, y, size: 10, font: fontBold, color: slate });
    page.drawText(es, { x:leftX + (en.length*5.3) + 10, y: y-1, size: 8, font, color: slate });
    y -= line;
  }
  function value(v: string){ page.drawText(v, { x:leftX, y, size: 11, font, color: rgb(0.1,0.1,0.1) }); y -= line + 2; }

  label('Trainee','Operador'); value(data.trainee_name + (data.trainee_email? `  <${data.trainee_email}>` : ''));
  label('Course','Curso'); value(data.course_title);
  label('Evaluator','Evaluador'); value(`${data.evaluator_name}${data.evaluator_title? ' — ' + data.evaluator_title : ''}`);
  label('Site','Sitio'); value(data.site_location);
  label('Date','Fecha'); value(new Date(data.evaluation_date).toLocaleDateString());
  if (data.truck_type){ label('Truck type','Tipo de montacargas'); value(data.truck_type); }
  if (data.verification_code){ label('Verification ID','ID de verificación'); value(String(data.verification_code)); }

  // Checklist grid
  y -= 4; page.drawText('Checklist / Lista de verificación', { x:leftX, y, size: 12, font: fontBold, color: slate });
  y -= 14;
  const items = [
    ['preop','Pre-operation inspection / Inspección previa'],
    ['seatbelt','Seat belt use / Cinturón'],
    ['start','Safe start/controls / Arranque/controles'],
    ['travel','Traveling with load low/back-tilt / Desplazamiento con carga baja'],
    ['pedestrians','Pedestrian awareness / peatones'],
    ['ramps','Ramps & grades / Rampas y pendientes'],
    ['stacking','Stacking/unstacking / Apilado'],
    ['visibility','Maintain visibility / Mantener visibilidad'],
    ['speed','Safe speed/turning / Velocidad segura'],
    ['attachments','Attachments / Aditamentos'],
    ['battery','Charging/refueling / Carga/combustible'],
    ['shutdown','Shutdown & parking / Apagado y estacionamiento']
  ];
  const colX = [leftX, leftX+310];
  const check = (xx:number, yy:number, pass:boolean)=>{
    page.drawRectangle({ x: xx, y: yy, width: 10, height: 10, borderWidth: 1, borderColor: slate });
    if (pass) page.drawText('P', { x: xx+2, y: yy-2, size: 8, font: fontBold, color: orange });
    else page.drawText('F', { x: xx+2.5, y: yy-2, size: 8, font: fontBold, color: rgb(0.8,0,0) });
  };
  let row = 0; let yy = y;
  for (let i=0;i<items.length;i++){
    const key = items[i][0]; const labelText = items[i][1];
    const col = (i%2);
    const x = colX[col];
    if (col===0 && i>0){ yy -= 18; }
    page.drawText(labelText, { x: x+16, y: yy, size: 10, font, color: slate });
    check(x, yy+2, !!data.checklist[key]);
    if (col===1){ /* second column placed at same row */ }
  }
  y = yy - 36;

  // Overall result & notes
  page.drawText('Overall / Resultado', { x:leftX, y, size: 11, font: fontBold, color: slate });
  page.drawText(data.overall_pass ? 'PASS / APROBADO' : 'FAIL / REPROBADO', { x:leftX+140, y, size: 12, font: fontBold, color: data.overall_pass? rgb(0,0.55,0.2) : rgb(0.75,0,0) });
  y -= 20;
  if (data.notes){ page.drawText('Notes / Notas:', { x:leftX, y, size: 10, font: fontBold, color: slate }); y -= 14; page.drawText(String(data.notes).slice(0,500), { x:leftX, y, size: 10, font, color: rgb(0.1,0.1,0.1) }); y -= 18; }

  // Signature
  page.drawText('Evaluator signature / Firma del evaluador', { x:leftX, y, size: 10, font: fontBold, color: slate });
  if (data.signature_png_bytes){
    const img = await doc.embedPng(data.signature_png_bytes);
    page.drawImage(img, { x:leftX, y: y-80, width: 240, height: 80 });
  }

  // Footer
  page.drawRectangle({ x:0, y:0, width, height:60, color: rgb(0.97,0.97,0.97) });
  page.drawText('Retain with employer records — OSHA §1910.178(l)(6).', { x:32, y:22, size:10, font, color: slate });
  page.drawText('Conservar con los registros del empleador — §1910.178(l)(6).', { x:32, y:10, size:9, font, color: slate });

  return await doc.save();
}
