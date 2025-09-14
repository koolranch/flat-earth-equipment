export const OSHA_BASICS: Record<string, { title: string; bullets: string[]; note?: string }> = {
  m1: {
    title: "OSHA 1910.178 — Pre-Operation Requirements",
    bullets: [
      "Inspect your truck every shift; do not use if any safety defect exists.",
      "Check forks, chains/hoses, tires/wheels, horn & reverse beeper, seatbelt/guards, lights, data plate legible, leaks/fluids.",
      "If it's unsafe: tag out and remove from service until repaired."
    ]
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
      "Stay within nameplate capacity; know load center and the stability triangle.",
      "Travel with forks low/tilted back; no elevated-load travel; slow at corners; sound horn; clear view; no riders."
    ]
  },
  m4: {
    title: "OSHA Basics — Workplace Hazards",
    bullets: [
      "Train for your facility's hazards: blind corners, pedestrians & aisles, ramps, docks/edges, spills, speed limits, lighting/visibility.",
      "Use the scene hotspots to spot and control each hazard."
    ]
  },
  m5: {
    title: "OSHA Basics — Charging/Fueling & Care",
    bullets: [
      "Battery charging areas: eyewash, spill neutralization, fire protection, ventilation, and no ignition sources.",
      "Only safe trucks in service; defects repaired by authorized personnel."
    ],
    note: "Operator certification records must include name, training date, evaluation date, and trainer/evaluator. Give refresher training after unsafe operation, incidents, workplace changes, or when an evaluation shows need; evaluate each operator at least every 3 years."
  }
};
