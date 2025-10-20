// Comprehensive Toyota Forklift Fault Codes Database
export const toyotaFaultCodes = [
  // Internal Combustion Codes (4Y-ECS Engine)
  { code: "01-01", system: "4Y-ECS (gasoline)", description: "Fuel feedback control error rich", phenomenon: "Engine speed unstable, may stop", causes: "Intake/exhaust defects, sensor/ignition/fuel issues, harness defect, controller fault", troubleshooting: "Use diagnostic software; check O2 sensor and wiring", category: "IC", severity: "High" },
  { code: "01-02", system: "4Y-ECS (gasoline)", description: "Fuel feedback control error lean", phenomenon: "Engine speed unstable, may stop", causes: "Similar to 01-01; exhaust/ignition defects", troubleshooting: "Inspect wiring; test sensor resistance", category: "IC", severity: "High" },
  { code: "01-03", system: "4Y-ECS (LPG/CNG)", description: "Fuel feedback control error rich", phenomenon: "Display only", causes: "Sensor defect, fuel system issues", troubleshooting: "Check O2 sensor; verify connections", category: "IC", severity: "Medium" },
  { code: "01-04", system: "4Y-ECS (LPG/CNG)", description: "Fuel feedback control error lean", phenomenon: "Engine may have problem at low temperatures", causes: "Exhaust/ignition defects", troubleshooting: "Inspect wiring harness; replace sensor if faulty", category: "IC", severity: "Medium" },
  { code: "01-05", system: "4Y-ECS", description: "O2 sensor open abnormality", phenomenon: "Engine may have problem at low temperatures", causes: "Harness defect, failed sensor", troubleshooting: "Replace O2 sensor; test with multimeter", category: "IC", severity: "Medium" },
  { code: "01-06", system: "4Y-ECS", description: "O2 sensor heater open abnormality", phenomenon: "Limiting speed due to limited engine power", causes: "Heater circuit issue", troubleshooting: "Check connections; calibrate or replace", category: "IC", severity: "Medium" },
  { code: "02-01", system: "4Y-ECS", description: "Intake temperature sensor open abnormality", phenomenon: "Engine may have problem", causes: "Sensor defect", troubleshooting: "Test sensor resistance; inspect wiring", category: "IC", severity: "Medium" },
  { code: "02-02", system: "4Y-ECS", description: "Intake temperature sensor short abnormality", phenomenon: "Engine problem at low temperatures", causes: "Short circuit", troubleshooting: "Replace sensor; check ECU connections", category: "IC", severity: "Medium" },
  { code: "03-01", system: "4Y-ECS", description: "Intake pipe pressure sensor open", phenomenon: "Limiting speed due to limited power", causes: "Open circuit", troubleshooting: "Verify with multimeter; replace if faulty", category: "IC", severity: "Medium" },
  { code: "03-02", system: "4Y-ECS", description: "Intake pipe pressure sensor short", phenomenon: "Limiting speed", causes: "Short to ground", troubleshooting: "Inspect throttle body wiring", category: "IC", severity: "Medium" },
  { code: "04-01", system: "4Y-ECS", description: "Coolant temperature sensor open", phenomenon: "Engine speed unstable, may stop", causes: "Sensor open", troubleshooting: "Calibrate or replace; check wiring", category: "IC", severity: "High" },
  { code: "04-02", system: "4Y-ECS", description: "Coolant temperature sensor short", phenomenon: "Engine unstable", causes: "Short circuit", troubleshooting: "Use analyzer for testing", category: "IC", severity: "High" },
  { code: "05-01", system: "4Y-ECS", description: "Throttle position sensor 1 open", phenomenon: "Engine unstable", causes: "Open abnormality", troubleshooting: "Test continuity; replace solenoid", category: "IC", severity: "High" },
  { code: "05-02", system: "4Y-ECS", description: "Throttle position sensor 1 short", phenomenon: "Limiting speed", causes: "Short", troubleshooting: "Inspect connections; recalibrate", category: "IC", severity: "Medium" },
  { code: "05-03", system: "4Y-ECS", description: "Throttle position sensor 2 open", phenomenon: "Display only", causes: "Open abnormality", troubleshooting: "Check load cell; test sensor", category: "IC", severity: "Low" },
  { code: "05-04", system: "4Y-ECS", description: "Throttle position sensor 2 short", phenomenon: "Fuel specification changeover switch error", causes: "Short", troubleshooting: "Replace switches; inspect wiring", category: "IC", severity: "Medium" },
  { code: "06-01", system: "4Y-ECS", description: "Throttle motor drive circuit open abnormality", phenomenon: "Engine may stop", causes: "Open circuit", troubleshooting: "Use analyzer mode for testing", category: "IC", severity: "High" },
  { code: "11-1", system: "EGR", description: "EGR position sensor circuit open abnormality", phenomenon: "High input", causes: "Open circuit", troubleshooting: "Check sensor", category: "IC", severity: "Medium" },
  { code: "12-4", system: "Turbocharger", description: "Variable nozzle turbo actuator malfunction", phenomenon: "Feedback malfunction", causes: "Feedback issue", troubleshooting: "Test feedback", category: "IC", severity: "Medium" },

  // SAS/OPS (Stability & Safety) Codes
  { code: "41-1", system: "SAS/OPS", description: "Matching connector abnormal", phenomenon: "Only connector display faulty", causes: "Broken matching cable or controller", troubleshooting: "Inspect connections; replace cable", category: "SAS", severity: "Medium" },
  { code: "51-1", system: "SAS/OPS", description: "Speed sensor open", phenomenon: "Speed shows 0 km/h, swing control limited", causes: "Faulty connector/sensor", troubleshooting: "Test with multimeter", category: "SAS", severity: "Medium" },
  { code: "52-1", system: "SAS/OPS", description: "Yaw rate sensor open", phenomenon: "Swing control limited", causes: "Damaged cable/sensor", troubleshooting: "Calibrate yaw rate", category: "SAS", severity: "Medium" },
  { code: "61-1", system: "SAS/OPS", description: "Load sensor open", phenomenon: "Swing/mast/drive limited, no load display", causes: "Broken connector/sensor", troubleshooting: "Inspect load cell", category: "SAS", severity: "High" },
  { code: "62-1", system: "SAS/OPS", description: "Tilt angle sensor open", phenomenon: "Mast control limited", causes: "Faulty sensor/cable", troubleshooting: "Recalibrate tilt", category: "SAS", severity: "Medium" },
  { code: "63-1", system: "SAS/OPS", description: "Tilt switches ON simultaneously", phenomenon: "Mast limited", causes: "Faulty switch installation", troubleshooting: "Replace switches", category: "SAS", severity: "Medium" },
  { code: "64-1", system: "SAS/OPS", description: "Lift lower lock solenoid open", phenomenon: "Fork won't lower", causes: "Broken solenoid/cable", troubleshooting: "Test continuity", category: "SAS", severity: "High" },
  { code: "A5", system: "SAS/OPS", description: "Seat switch abnormal (sit-down electric)", phenomenon: "Drive & hydraulic operate even if not seated", causes: "Faulty connector, damaged cable, broken switch, controller fault", troubleshooting: "Inspect seat switch", category: "SAS", severity: "High" },
  { code: "A7-1", system: "SAS/OPS", description: "Abnormal brake switch", phenomenon: "Partial restriction of drive control", causes: "Broken brake switch/cable", troubleshooting: "Replace switch", category: "SAS", severity: "Medium" },
  { code: "H1-1", system: "SAS/OPS", description: "Lift lever potentiometer abnormal", phenomenon: "Lift cannot operate", causes: "Damaged potentiometer wire", troubleshooting: "Replace potentiometer", category: "SAS", severity: "High" },
  { code: "H2-1", system: "SAS/OPS", description: "Tilt lever potentiometer abnormal", phenomenon: "Tilt does not operate", causes: "Damaged wire", troubleshooting: "Replace", category: "SAS", severity: "High" },

  // Electric Forklift Codes
  { code: "F8", system: "Electric Charging", description: "Charging completion failure", phenomenon: "Charging failure", causes: "Disconnected cables during charging", troubleshooting: "Verify transformer connections", category: "Electric", severity: "Medium" },
  { code: "C02", system: "Display", description: "Error in multi-display functions", phenomenon: "Abnormalities detected", causes: "Display circuit issue", troubleshooting: "Test circuits", category: "Electric", severity: "Low" },
  { code: "C05", system: "Display", description: "Error in display or related functions", phenomenon: "Similar to C02", causes: "Display fault", troubleshooting: "Analyzer mode", category: "Electric", severity: "Low" },
  { code: "AD1", system: "CAN Comm", description: "CAN communication error", phenomenon: "Partial drive limitation", causes: "Faulty harness or controller", troubleshooting: "Inspect CAN bus", category: "Electric", severity: "High" },
  { code: "ADE2", system: "CAN Comm", description: "Lost communication", phenomenon: "Drive/mast functions restricted", causes: "Comm loss", troubleshooting: "Reset and test", category: "Electric", severity: "High" },
  { code: "201-262", system: "Traction Logic (8-series)", description: "Drive logic unit errors", phenomenon: "May disable traveling", causes: "Main circuits/sensors abnormalities", troubleshooting: "Use analyzer for traction testing", category: "Electric", severity: "High" },
  { code: "501-562", system: "Lift Logic", description: "Lifting logic unit errors", phenomenon: "Abnormalities in lift circuits", causes: "Sensors/circuits fault", troubleshooting: "Test sensors and circuits", category: "Electric", severity: "High" },
  { code: "F5-1", system: "Material Handling", description: "Material handling error", phenomenon: "Lift may stop", causes: "Solenoid or potentiometer fault", troubleshooting: "Check wiring", category: "Electric", severity: "Medium" },
  
  // Special/Common Codes
  { code: "E A5-1", system: "Speed Control", description: "Vehicle speed control system fault", phenomenon: "Speed control issues", causes: "Speed control circuit malfunction", troubleshooting: "See detailed guide", category: "Special", severity: "Medium", hasGuide: true, link: "/diagnostic-codes/e-a5-1-code-on-toyota-forklift-2" },
  { code: "E AS-1", system: "Alarm", description: "Alarm code", phenomenon: "Seat switch issue", causes: "Switch fault", troubleshooting: "Check seat switch", category: "Special", severity: "Low" },
];

export function searchCodes(query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return toyotaFaultCodes;
  
  return toyotaFaultCodes.filter(code => 
    code.code.toLowerCase().includes(q) ||
    code.description.toLowerCase().includes(q) ||
    code.system.toLowerCase().includes(q) ||
    code.phenomenon.toLowerCase().includes(q)
  );
}

export function getCodesByCategory(category: string) {
  return toyotaFaultCodes.filter(code => code.category === category);
}

