export const forkliftChargerFAQs = [
  {
    question: "What voltage charger do I need for my forklift?",
    answer: "The charger voltage must match your battery voltage exactly. Check your battery nameplate or count the cells (each cell = 2V). Common voltages are 24V (12 cells), 36V (18 cells), 48V (24 cells), and 80V (40 cells). Never use a charger with different voltage than your battery."
  },
  {
    question: "How do I calculate the right amperage for my forklift charger?",
    answer: "Use this formula: Required Amps = (Battery Ah ÷ Desired Charge Hours) ÷ 0.85. For example, a 750Ah battery charged in 8 hours needs: (750 ÷ 8) ÷ 0.85 = 110A charger. For overnight charging, use C/10 rate (10% of battery capacity). For fast charging, use C/5 to C/3 rates."
  },
  {
    question: "Can I use a higher amperage charger to charge faster?",
    answer: "Yes, but with trade-offs. Higher amperage reduces charging time but also reduces battery life. C/10 rate (overnight) gives 5-7 years battery life, while C/3 rate (fast charging) gives 2-4 years. Also ensure your electrical system can handle the higher current draw."
  },
  {
    question: "What's the difference between single-phase and three-phase chargers?",
    answer: "Single-phase chargers use standard 208V-240V power, suitable for smaller chargers (under 100A output). Three-phase chargers use 480V-600V industrial power, offering 5-10% better efficiency and supporting higher amperages (200A+). Choose based on your facility's electrical infrastructure."
  },
  {
    question: "Do I need special ventilation for forklift battery charging?",
    answer: "Yes, lead-acid batteries produce hydrogen gas during charging, which is explosive at 4% concentration. Install exhaust fans providing 6-12 air changes per hour. Calculate CFM needed: (Number of batteries × Ah capacity × 0.05) ÷ 0.25. Lithium batteries don't require special ventilation."
  },
  {
    question: "Can I use aftermarket chargers with my Crown/Toyota/Yale forklift?",
    answer: "Yes, most forklift brands use standard Anderson SB connectors and charging profiles. Aftermarket chargers are fully compatible and often cost 30-50% less than OEM chargers. Ensure voltage matches exactly and amperage is appropriate for your battery capacity."
  },
  {
    question: "What's opportunity charging and when should I use it?",
    answer: "Opportunity charging uses high-amperage chargers (C/3 to C/2 rates) for short charging sessions during breaks. It eliminates battery swapping but reduces battery life to 2-4 years. Best for 24/7 operations where downtime for full charging isn't available."
  },
  {
    question: "How often should I maintain my forklift charger?",
    answer: "Daily: visual inspection and connection check. Weekly: cable inspection and connection cleaning. Monthly: torque connections and clean housing. Annually: professional calibration and safety system testing. Proper maintenance extends charger life to 10-15 years."
  },
  {
    question: "What safety equipment do I need in the charging area?",
    answer: "Required safety equipment includes: eye wash station within 25 feet, safety shower for acid exposure, acid spill kits, face shields and acid-resistant gloves, proper ventilation system, GFCI protection on electrical circuits, and explosion-proof equipment in charging areas."
  },
  {
    question: "Can I charge lithium forklift batteries with a standard charger?",
    answer: "No, lithium batteries require chargers with BMS (Battery Management System) communication and specific charging profiles. They charge faster (1-2 hours) and don't produce gas, but need temperature monitoring to prevent thermal runaway. Initial cost is higher but operational benefits often justify the investment."
  },
  {
    question: "What's the ROI on investing in a quality forklift charger?",
    answer: "Quality chargers typically show 40-60% annual ROI through: reduced electricity costs (5-10% efficiency gains), extended battery life (2-3x longer), reduced downtime, and lower maintenance costs. Initial investment of $3,000-8,000 often pays back in 12-18 months."
  },
  {
    question: "How do I troubleshoot a charger that won't start?",
    answer: "Check in this order: 1) Verify input power with multimeter, 2) Inspect and replace blown fuses, 3) Check all connections for looseness/corrosion, 4) Reset emergency stops and safety switches, 5) Verify battery voltage matches charger setting. If problem persists, contact technical support."
  }
]

export const forkliftChargerHowToSteps = [
  {
    name: "Identify Your Battery Specifications",
    text: "Locate the battery nameplate and record: voltage (24V, 36V, 48V, or 80V), capacity in amp-hours (Ah), and connector type. If nameplate is missing, count battery cells and multiply by 2 for voltage. Take photos of existing connections for reference."
  },
  {
    name: "Determine Your Operational Requirements", 
    text: "Analyze your operation: single shift (8 hours), two shifts (16 hours), or continuous (24 hours). Identify available charging windows - overnight charging needs 10-12 hours, fast charging needs 6-8 hours, opportunity charging uses break periods."
  },
  {
    name: "Calculate Required Amperage",
    text: "Use the formula: Required Amps = (Battery Ah ÷ Charge Hours) ÷ 0.85. For maximum battery life, use C/10 rate (10% of capacity). For faster charging, use C/5 to C/3 rates but expect reduced battery life."
  },
  {
    name: "Assess Your Electrical Infrastructure",
    text: "Check available power: single-phase 208V-240V for smaller chargers, three-phase 480V-600V for larger ones. Verify panel capacity and plan dedicated circuits. Consult electrician for installations over 50A output."
  },
  {
    name: "Plan Installation Requirements",
    text: "Ensure proper ventilation for hydrogen gas removal (lead-acid batteries). Plan charger mounting location with 3-foot clearances. Install safety equipment: eye wash stations, spill kits, and proper PPE storage."
  },
  {
    name: "Select Charger Type and Features",
    text: "Choose between conventional (basic, lower cost), high-frequency (better efficiency), or smart chargers (remote monitoring). Consider features like automatic shut-off, temperature compensation, and equalization charging."
  },
  {
    name: "Verify Compatibility and Order",
    text: "Double-check voltage match, confirm connector compatibility, and verify amperage suits your charging window. Order from reputable supplier with technical support and warranty coverage."
  },
  {
    name: "Professional Installation and Testing",
    text: "Have qualified electrician install electrical connections and ventilation. Test all safety systems, verify proper charging operation, and train operators on safe charging procedures."
  }
]
