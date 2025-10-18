import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const dynamic = "force-static";

function drawCheckbox(page: any, x: number, y: number, label: string, font: any, size: number = 10) {
  page.drawRectangle({ x, y: y - 10, width: 10, height: 10, borderWidth: 1, borderColor: rgb(0.06, 0.09, 0.16) });
  page.drawText(label, { x: x + 14, y: y - 10, size, font, color: rgb(0.06, 0.09, 0.16) });
  return y - 16;
}

export async function GET() {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]); // US Letter
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const slate = rgb(0.06, 0.09, 0.16);     // approx slate-900
  const orange = rgb(0.969, 0.396, 0.067); // #F76511

  // Header
  page.drawRectangle({ x: 40, y: 735, width: 532, height: 32, color: orange });
  page.drawText("Evaluación Práctica de Montacargas — OSHA 29 CFR 1910.178(l)", {
    x: 48, y: 744, size: 12, font: fontBold, color: rgb(1, 1, 1)
  });
  page.drawText("Flat Earth Equipment — flatearthequipment.com/safety", {
    x: 48, y: 730, size: 9, font, color: rgb(1, 1, 1)
  });

  // Pilot line (who/when)
  let y = 705;
  const line = (label: string, x: number, w: number) => {
    page.drawText(label, { x, y, size: 10, font: fontBold, color: slate });
    page.drawLine({ start: { x: x + 90, y: y - 2 }, end: { x: x + 90 + w, y: y - 2 }, thickness: 0.8, color: slate });
  };
  line("Operador:", 40, 170); line("ID Emp:", 320, 90);
  y -= 16; line("Evaluador:", 40, 170); line("Fecha:", 320, 90);
  y -= 16; line("Clase/Tipo:", 40, 170); line("Marca/Modelo/Serie:", 320, 170);

  // Instruction blurb
  y -= 20;
  const instructions = [
    "Instrucciones: Evalúe al operador en las clases de montacargas usadas en el sitio. Marque cada elemento.",
    "Entrene y vuelva a probar según sea necesario. Mantenga este registro para auditorías. Re-evalúe al menos cada 3 años",
    "o después de incidentes, equipo nuevo o deficiencias observadas."
  ];
  for (const line of instructions) {
    page.drawText(line, { x: 40, y, size: 9, font, color: slate, maxWidth: 532 });
    y -= 11;
  }
  y -= 10;

  // Sections
  const section = (title: string) => {
    page.drawText(title, { x: 40, y, size: 11, font: fontBold, color: slate });
    y -= 14;
  };

  section("Inspección Pre-Uso");
  y = drawCheckbox(page, 40, y, "Horquillas/mástil/cadenas/guardas OK", font);
  y = drawCheckbox(page, 40, y, "Bocina, luces, alarmas funcionan", font);
  y = drawCheckbox(page, 40, y, "Neumáticos/frenos/dirección OK", font);
  y = drawCheckbox(page, 40, y, "Cinturón usado; batería/LP asegurado", font);
  y -= 4;

  section("Viaje y Señalización");
  y = drawCheckbox(page, 40, y, "Velocidad dentro de límites; obedece señalización", font);
  y = drawCheckbox(page, 40, y, "Bocina en esquinas ciegas; contacto visual en cruces", font);
  y = drawCheckbox(page, 40, y, "Disciplina de carril luz azul (reglas de paso peatonal)", font);
  y = drawCheckbox(page, 40, y, "Mantiene vista clara; viaja en reversa si vista bloqueada", font);
  y -= 4;

  section("Maniobras en Condiciones de Patio");
  y = drawCheckbox(page, 40, y, "Curvas S controladas; retroceso con observador cuando se requiera", font);
  y = drawCheckbox(page, 40, y, "Observa política viento/altura-apilamiento; solicita observador sobre límites", font);
  y = drawCheckbox(page, 40, y, "Usa espejos; mantiene pasillos despejados; respeta cajas de staging", font);
  y -= 4;

  section("Manejo de Carga");
  y = drawCheckbox(page, 40, y, "Aproximación cuadrada; horquillas niveladas; elevar/inclinar para altura viaje", font);
  y = drawCheckbox(page, 40, y, "Transporte estable; carga dentro de capacidad nominal y centro de carga", font);
  y = drawCheckbox(page, 40, y, "Colocación precisa en cara de apilamiento; sin daños a bienes/equipo", font);
  y -= 4;

  section("Interacción con Peatones y Observador");
  y = drawCheckbox(page, 40, y, "Entiende/usa señales manuales estándar del observador", font);
  y = drawCheckbox(page, 40, y, "Se detiene para peatones; procede solo con reconocimiento claro", font);
  y -= 4;

  section("Estacionamiento y Apagado");
  y = drawCheckbox(page, 40, y, "Horquillas bajadas/neutral/freno puesto; apagado; calzos si requerido", font);

  // Scoring & sign-off
  y -= 14;
  page.drawText("Notas / Entrenamiento:", { x: 40, y, size: 10, font: fontBold, color: slate });
  y -= 52; // space for notes box
  page.drawRectangle({ x: 40, y, width: 532, height: 48, borderWidth: 0.8, borderColor: slate });

  y -= 20;
  page.drawText("Resultado:", { x: 40, y, size: 10, font: fontBold, color: slate });
  page.drawRectangle({ x: 105, y: y - 10, width: 10, height: 10, borderWidth: 1, borderColor: slate });
  page.drawText("APROBADO", { x: 119, y: y - 10, size: 10, font, color: slate });
  page.drawRectangle({ x: 190, y: y - 10, width: 10, height: 10, borderWidth: 1, borderColor: slate });
  page.drawText("REENTRENAR / REPROBAR", { x: 204, y: y - 10, size: 10, font, color: slate });

  y -= 18;
  page.drawText("Firma Evaluador:", { x: 40, y, size: 10, font: fontBold, color: slate });
  page.drawLine({ start: { x: 140, y: y - 2 }, end: { x: 340, y: y - 2 }, thickness: 0.8, color: slate });
  page.drawText("Firma Operador:", { x: 360, y, size: 10, font: fontBold, color: slate });
  page.drawLine({ start: { x: 460, y: y - 2 }, end: { x: 572, y: y - 2 }, thickness: 0.8, color: slate });

  // Footer
  const footerText = "Esta evaluación se combina con la instrucción formal (teoría) y cumple con los requisitos de evaluación práctica de OSHA 29 CFR 1910.178(l).";
  page.drawText(footerText, {
    x: 40, y: 48, size: 8.5, font, color: slate, maxWidth: 532
  });

  const bytes = await pdf.save();
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=evaluacion-practica-montacargas.pdf",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}

