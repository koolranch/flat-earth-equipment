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
      "Run the full inspection and record defects.",
      "Any crack, leak, inoperative horn/beeper/light, unreadable plate, or unsecured battery/LP = do not operate."
    ]
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
