// English OSHA content (existing)
export const OSHA_BASICS: Record<string, { title: string; bullets: string[]; note?: string }> = {
  m1: {
    title: "OSHA 1910.178 — Pre-Operation Requirements",
    bullets: [
      "Inspect the truck before each shift and remove from service if any condition adversely affects safety (29 CFR 1910.178(q)). Only authorized personnel perform repairs.",
      "PPE & seat belt: Wear required PPE (hi-vis vest, hard hat, eye/ear protection, safety boots) and use the seat belt.",
      "Data plate: Present, legible, and reflects all attachments; know capacity and load center.",
      "Controls & alerts: Test horn, lights/beacon, reverse beeper, and alarms; sound horn at blind corners and intersections.",
      "Forks, chains, hoses: Matched forks, pins in place, no cracks/bends; chains lubricated with no kinks/broken links; hoses/cylinders free of leaks.",
      "Brakes & steering: Service brake, parking brake, and steering respond correctly.",
      "Tires & wheels: Adequate tread/inflation, no cuts/chunks; lugs tight; rims undamaged.",
      "Housekeeping: Keep aisles clear; clean or barricade spills promptly.",
      "Tag out unsafe trucks: Report defects; do not operate until repaired and verified safe."
    ],
    note: "Reference: OSHA 29 CFR 1910.178."
  },
  m2: {
    title: "OSHA Basics — 8-Point Inspection",
    bullets: [
      "Run the full inspection each shift and record defects. Remove trucks from service if any condition adversely affects safety (29 CFR 1910.178(q)(7)). Repairs must be by authorized personnel.",
      "Forks: No cracks or bends; matched pair; lock pins in place; heel wear within limit.",
      "Chains & hoses: No kinks, tight/broken links, frays, or leaks; proper tension/lube; guards in place.",
      "Tires & wheels: Adequate tread/inflation (pneumatic); no chunks/splits; lugs tight; rims undamaged.",
      "Horn & lights: Horn works (use at blind corners); head/taillights, beacon, and reverse beeper functional.",
      "Seat belt & data plate: Seat belt present/working; data plate present, legible, and matches attachments/capacity.",
      "Leaks/undercarriage: No hydraulic, fuel, or coolant leaks; mast/undercarriage clear; clean spills per procedure.",
      "Battery/LP system: Cables/connectors intact and secure; charger leads OK; LP cylinder secured, no leaks/odor.",
      "Safety devices: Parking brake, deadman, brakes, and steering respond correctly; alarms present and working."
    ],
    note: "References: 29 CFR 1910.178 (p), (q); ANSI/ITSDF B56.1."
  },
  m3: {
    title: "OSHA Basics — Balance & Load Handling",
    bullets: [
      "Capacity & attachments: Never exceed nameplate capacity; attachments change capacity and load center—use the data plate.",
      "Keep load low & tilted back: Travel with forks ~4–6 in (10–15 cm) off the floor; mast slightly back; avoid sudden starts/stops/turns.",
      "Stability triangle: Keep the combined center of gravity inside the triangle; slow at corners and uneven surfaces; no riders and keep body inside the compartment.",
      "Visibility: Maintain a clear view; if the load blocks view, travel in reverse when safe or use a spotter.",
      "Grades/ramps: With a load, drive upgrade; without a load, drive downgrade. Do not turn on ramps; forks low and tilted back; descend slowly.",
      "Stacking/unstacking: Stop; set parking brake; square mast; level forks; lift/lower smoothly; do not raise or lower while moving.",
      "Pedestrians: Sound horn at intersections; make eye contact; maintain safe separation; pedestrians have right-of-way."
    ],
    note: "Reference: OSHA 29 CFR 1910.178(n); ANSI/ITSDF B56.1."
  },
  m4: {
    title: "OSHA Basics — Workplace Hazards",
    bullets: [
      "Train for your facility's hazards and use the scene hotspots to practice. Control hazards before operating.",
      "Blind corners & aisles: Stop/creep, sound horn, look; use convex mirrors; keep corners clear of parked equipment.",
      "Pedestrians: Marked walkways, eye contact, spotters when required; maintain separation; right-of-way to pedestrians.",
      "Ramps & slopes: Keep forks low/tilted back; no turning on ramps; control speed; chock as needed.",
      "Docks & edges: Use dock locks/chocks; verify dock plates (capacity, lip engaged, dry); maintain a setback from edges; watch overhead doors.",
      "Spills & leaks: Clean or barricade; report leaks; never travel through unidentified liquids.",
      "Speed & visibility: Obey posted speed; maintain lighting; beacon/reverse beeper operating; slow for wet/icy floors.",
      "Overhead obstructions: Verify clearances; never travel with an elevated load; watch sprinklers/doors/fixtures.",
      "Charging/fueling areas: Ventilated, no ignition sources; eyewash/spill kits available and known."
    ],
    note: "Reference: OSHA 29 CFR 1910.178(n), (o), (p)."
  },
  m5: {
    title: "OSHA Basics — Charging/Fueling & Care",
    bullets: [
      "Battery charging: Park, set brake, forks down, power off; ventilated area; no smoking/open flames.",
      "Wear PPE (eye/face, gloves, apron per SDS). Eyewash and spill neutralizer available.",
      "Unplug truck; inspect cables/connectors; connect charger leads correctly; verify charger settings.",
      "After charge, turn charger off (if required), then disconnect; inspect for heat/damage; keep vent caps in place.",
      "LP fuel (if applicable): Shut engine off; close cylinder valve; allow area to cool; no ignition sources.",
      "Wear PPE; remove/replace cylinder upright with locating pin engaged; secure clamp/strap.",
      "Reconnect; open valve slowly; leak-check; if odor/leak—shut down and report.",
      "Care & records: Only authorized personnel repair/adjust trucks; defective trucks are removed from service.",
      "Operator certification records include name, training date, evaluation date, and trainer/evaluator. Provide refresher training after incidents/unsafe operation/workplace changes, and evaluate each operator at least every 3 years."
    ],
    note: "Reference: OSHA 29 CFR 1910.178(g), (l); manufacturer manuals; SDS."
  }
};

// Spanish OSHA content (new - safe addition)
export const OSHA_BASICS_ES: Record<string, { title: string; bullets: string[]; note?: string }> = {
  m1: {
    title: "OSHA 1910.178 — Requisitos de Pre-Operación",
    bullets: [
      "Inspeccionar el montacargas antes de cada turno y retirar del servicio si cualquier condición afecta adversamente la seguridad (29 CFR 1910.178(q)). Solo personal autorizado realiza reparaciones.",
      "EPP y cinturón de seguridad: Usar EPP requerido (chaleco de alta visibilidad, casco, protección ocular/auditiva, botas de seguridad) y usar el cinturón de seguridad.",
      "Placa de datos: Presente, legible, y refleja todos los aditamentos; conocer capacidad y centro de carga.",
      "Controles y alertas: Probar bocina, luces/baliza, pitido de reversa, y alarmas; sonar bocina en esquinas ciegas e intersecciones.",
      "Horquillas, cadenas, mangueras: Horquillas emparejadas, pasadores en lugar, sin grietas/dobleces; cadenas lubricadas sin torceduras/eslabones rotos; mangueras/cilindros libres de fugas.",
      "Frenos y dirección: Freno de servicio, freno de estacionamiento, y dirección responden correctamente.",
      "Llantas y ruedas: Banda de rodadura/inflado adecuado, sin cortes/pedazos; tuercas apretadas; rines sin daño.",
      "Limpieza: Mantener pasillos despejados; limpiar o acordonar derrames prontamente.",
      "Etiquetar montacargas inseguros: Reportar defectos; no operar hasta reparar y verificar seguridad."
    ],
    note: "Referencia: OSHA 29 CFR 1910.178."
  },
  m2: {
    title: "Básicos OSHA — Inspección de 8 Puntos",
    bullets: [
      "Ejecutar la inspección completa cada turno y registrar defectos. Retirar montacargas del servicio si cualquier condición afecta adversamente la seguridad (29 CFR 1910.178(q)(7)). Las reparaciones deben ser por personal autorizado.",
      "Horquillas: Sin grietas o dobleces; par emparejado; pasadores de bloqueo en lugar; desgaste del talón dentro del límite.",
      "Cadenas y mangueras: Sin torceduras, eslabones rotos, deshilachado, o fugas; tensión/lubricación adecuada; guardas en lugar.",
      "Llantas y ruedas: Banda de rodadura/inflado adecuado (neumáticas), sin cortes/pedazos; tuercas apretadas; rines sin daño.",
      "Bocina y luces: La bocina funciona (usar en esquinas ciegas); faros/luces traseras/baliza, pitido de reversa funcional.",
      "Cinturón de seguridad y placa de datos: Cinturón presente/funcionando; placa de datos presente, legible, y coincide con aditamentos/capacidad.",
      "Fugas/tren de rodaje: Sin fugas hidráulicas, combustible, o refrigerante; mástil/tren de rodaje despejado; limpiar derrames según procedimiento.",
      "Batería/sistema LP: Cables/conectores intactos y seguros; cargador lleva OK; cilindro LP asegurado, sin fugas/olor.",
      "Dispositivos de seguridad: Freno de estacionamiento, hombre muerto, frenos, y dirección responden correctamente; alarmas presentes y funcionando."
    ],
    note: "Referencia: OSHA 29 CFR 1910.178(q), (a); ANSI/ITSDF B56.1."
  },
  m3: {
    title: "Básicos OSHA — Equilibrio y Manejo de Carga",
    bullets: [
      "Triángulo de estabilidad: dos ruedas delanteras + pivote del eje trasero.",
      "Mantener carga baja e inclinada hacia atrás; viajar con horquillas ~4–6 pulg.",
      "Conocer centro de carga y capacidad nominal de la placa de datos.",
      "Girar despacio con carga elevada u descentrada; sin giros bruscos.",
      "Nivelar horquillas antes de entrada/salida; usar bocina en intersecciones."
    ],
    note: "Referencia: OSHA 29 CFR 1910.178(n), (o); manuales del fabricante."
  },
  m4: {
    title: "Básicos OSHA — Conciencia de Peligros",
    bullets: [
      "Esquinas ciegas: despacio, sonar bocina, avanzar lentamente en intersecciones.",
      "Zonas peatonales: contacto visual, derecho de paso, guías.",
      "Obstrucciones aéreas: espacio libre del mástil, marcos de puertas, rociadores.",
      "Rampas y muelles: aproximarse derecho; calzar ruedas.",
      "Limpieza: derrames y escombros son peligros de control."
    ],
    note: "Referencia: OSHA 29 CFR 1910.178(n); políticas del sitio."
  },
  m5: {
    title: "Básicos OSHA — Operaciones Avanzadas",
    bullets: [
      "Área de carga: lavaojos, ventilación, protección contra incendios, neutralizador de derrames disponible.",
      "Conectar cargador: estacionar, freno, energía APAGADA, enchufar según SOP; verificar cables/conectores.",
      "Cambio de cilindro LP: cerrar válvula, motor APAGADO, enfriar, desconectar cuidadosamente, verificar fugas después de instalar.",
      "Estacionamiento: horquillas abajo, neutral, freno puesto, energía APAGADA; calzar si es requerido.",
      "Reconectar; abrir válvula despacio; verificar fugas; si olor/fuga—apagar y reportar.",
      "Cuidado y registros: Solo personal autorizado repara/ajusta montacargas; montacargas defectuosos se retiran del servicio.",
      "Los registros de certificación del operador incluyen nombre, fecha de entrenamiento, fecha de evaluación, y entrenador/evaluador. Proporcionar entrenamiento de repaso después de incidentes/operación insegura/cambios en el lugar de trabajo, y evaluar cada operador al menos cada 3 años."
    ],
    note: "Referencia: OSHA 29 CFR 1910.178(g), (l); manuales del fabricante; SDS."
  }
};

// Safe helper function to get OSHA content with locale support
export function getOSHABasics(moduleKey: string, locale?: 'en' | 'es') {
  // Safe locale detection
  const targetLocale = locale || (() => {
    if (typeof window === 'undefined') return 'en';
    try {
      const cookie = document.cookie.match(/(?:^|; )locale=([^;]+)/);
      return cookie?.[1] === 'es' ? 'es' : 'en';
    } catch {
      return 'en';
    }
  })();
  
  // Return Spanish content if available, otherwise fallback to English
  const content = targetLocale === 'es' ? OSHA_BASICS_ES[moduleKey] : OSHA_BASICS[moduleKey];
  return content || OSHA_BASICS[moduleKey]; // Double fallback for safety
}
