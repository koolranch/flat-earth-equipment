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
  page.drawText("Employer Forklift Practical Evaluation — OSHA 29 CFR 1910.178(l)", {
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
  line("Operator:", 40, 170); line("Emp ID:", 320, 90);
  y -= 16; line("Evaluator:", 40, 170); line("Date:", 320, 90);
  y -= 16; line("Truck Class/Type:", 40, 170); line("Make/Model/Serial:", 320, 170);

  // Instruction blurb
  y -= 20;
  const instructions = [
    "Instructions: Evaluate the operator on the truck classes used on-site. Check each item. Coach and re-test as needed.",
    "Keep this record for audits. Re-evaluate at least every 3 years or after incidents, new equipment, or observed deficiencies."
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

  section("Pre-Use Inspection");
  y = drawCheckbox(page, 40, y, "Forks/mast/chains/guards OK", font);
  y = drawCheckbox(page, 40, y, "Horn, lights, alarms function", font);
  y = drawCheckbox(page, 40, y, "Tires/brakes/steering OK", font);
  y = drawCheckbox(page, 40, y, "Seat belt used; battery/LP secured", font);
  y -= 4;

  section("Travel & Signaling");
  y = drawCheckbox(page, 40, y, "Speed within posted limits; obeys signage", font);
  y = drawCheckbox(page, 40, y, "Horn at blind corners; eye contact at crossings", font);
  y = drawCheckbox(page, 40, y, "Blue-light lane discipline (pedestrian right-of-way rules)", font);
  y = drawCheckbox(page, 40, y, "Maintains clear view; travels in reverse if view blocked", font);
  y -= 4;

  section("Maneuvering in Yard Conditions");
  y = drawCheckbox(page, 40, y, "Controlled S-turns; tight backing with spotter when required", font);
  y = drawCheckbox(page, 40, y, "Observes wind/stack-height policy; requests spotter above limits", font);
  y = drawCheckbox(page, 40, y, "Uses mirrors; keeps aisles clear; respects staging boxes", font);
  y -= 4;

  section("Load Handling");
  y = drawCheckbox(page, 40, y, "Approach square; forks level; lift/tilt back to travel height", font);
  y = drawCheckbox(page, 40, y, "Stable transport; load within rated capacity & load center", font);
  y = drawCheckbox(page, 40, y, "Accurate placement at stack face; no damage to goods/equipment", font);
  y -= 4;

  section("Pedestrian & Spotter Interaction");
  y = drawCheckbox(page, 40, y, "Understands/uses standard spotter hand signals", font);
  y = drawCheckbox(page, 40, y, "Stops for pedestrians; proceeds only on clear acknowledgement", font);
  y -= 4;

  section("Parking & Shutdown");
  y = drawCheckbox(page, 40, y, "Forks lowered/neutral/parking brake set; power off; chock if required", font);

  // Scoring & sign-off
  y -= 14;
  page.drawText("Notes / Coaching:", { x: 40, y, size: 10, font: fontBold, color: slate });
  y -= 52; // space for notes box
  page.drawRectangle({ x: 40, y, width: 532, height: 48, borderWidth: 0.8, borderColor: slate });

  y -= 20;
  page.drawText("Result:", { x: 40, y, size: 10, font: fontBold, color: slate });
  page.drawRectangle({ x: 90, y: y - 10, width: 10, height: 10, borderWidth: 1, borderColor: slate });
  page.drawText("PASS", { x: 104, y: y - 10, size: 10, font, color: slate });
  page.drawRectangle({ x: 150, y: y - 10, width: 10, height: 10, borderWidth: 1, borderColor: slate });
  page.drawText("RECOACH / RETEST", { x: 164, y: y - 10, size: 10, font, color: slate });

  y -= 18;
  page.drawText("Evaluator Signature:", { x: 40, y, size: 10, font: fontBold, color: slate });
  page.drawLine({ start: { x: 160, y: y - 2 }, end: { x: 360, y: y - 2 }, thickness: 0.8, color: slate });
  page.drawText("Operator Signature:", { x: 370, y, size: 10, font: fontBold, color: slate });
  page.drawLine({ start: { x: 470, y: y - 2 }, end: { x: 572, y: y - 2 }, thickness: 0.8, color: slate });

  // Footer
  page.drawText(
    "This evaluation pairs with formal instruction (theory) and meets OSHA 29 CFR 1910.178(l) practical evaluation requirements.",
    { x: 40, y: 48, size: 8.5, font, color: slate, maxWidth: 532 }
  );

  const bytes = await pdf.save();
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=forklift-employer-eval.pdf",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}

