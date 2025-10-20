// Comprehensive JCB Telehandler and Excavator Fault Codes Database
export const jcbFaultCodes = [
  // P-Series: Engine System Codes
  { code: "P0001", system: "Fuel System", description: "IMV driver fault detected", phenomenon: "Reduced performance", causes: "Faulty inlet metering valve or wiring", troubleshooting: "Check wiring, replace IMV", category: "Engine", severity: "High" },
  { code: "P0002", system: "Rail Pressure", description: "Rail pressure control error (too low)", phenomenon: "Poor performance", causes: "Unstable PID, pump/sensor issues", troubleshooting: "Pressure test fuel system, check controller", category: "Engine", severity: "High" },
  { code: "P0003", system: "Fuel System", description: "Rail pressure control feedback low error", phenomenon: "Power loss", causes: "Fuel leaks, pressure issues", troubleshooting: "Check for leaks, inspect HPV/IMV drivers", category: "Engine", severity: "High" },
  { code: "P0016", system: "Cam Sensor", description: "Cam sensor phase shift", phenomenon: "Timing issues", causes: "Sensor misalignment", troubleshooting: "Recalibrate cam position", category: "Engine", severity: "Medium" },
  { code: "P0045", system: "Turbo", description: "VNT control fault / Turbo EVRV fault", phenomenon: "Reduced performance", causes: "Actuator/wiring issue", troubleshooting: "Test EVRV solenoid", category: "Engine", severity: "Medium" },
  { code: "P0070", system: "CAN Bus", description: "CAN bus message error from engine ECU", phenomenon: "Communication loss", causes: "CAN wiring fault", troubleshooting: "Inspect CAN wiring", category: "Communication", severity: "High" },
  { code: "P007A", system: "Charge Air", description: "Charge air cooler temperature sensor circuit fault", phenomenon: "Sensor error", causes: "Sensor circuit issue", troubleshooting: "Test TMAP resistance", category: "Engine", severity: "Medium" },
  { code: "P007C", system: "Charge Air", description: "Charge air cooler temp sensor circuit low", phenomenon: "Low signal", causes: "Short to ground", troubleshooting: "Replace sensor", category: "Engine", severity: "Medium" },
  { code: "P007D", system: "Charge Air", description: "Charge air cooler temp sensor circuit high", phenomenon: "High signal", causes: "Open circuit", troubleshooting: "Check connections", category: "Engine", severity: "Medium" },
  { code: "P0087", system: "Fuel Pressure", description: "Rail pressure too low", phenomenon: "Strong vibration, unstable idle, power drop, smoke", causes: "Leaks, faulty pump/sensor", troubleshooting: "Perform pressure test", category: "Engine", severity: "High" },
  { code: "P0088", system: "Fuel Pressure", description: "Rail pressure too high", phenomenon: "Strong vibration, unstable idle, power drop, excessive smoke", causes: "Regulator stuck", troubleshooting: "Relieve and test pressure", category: "Engine", severity: "High" },
  { code: "P0089", system: "Rail Pressure", description: "Rail pressure control error", phenomenon: "Performance issues", causes: "PID instability, stuck HPV", troubleshooting: "Calibrate, check open loop", category: "Engine", severity: "High" },
  { code: "P0090", system: "Fuel System", description: "SCV open or short / HPV driver fault", phenomenon: "Engine may stop/start intermittently, excessive smoke", causes: "Circuit fault", troubleshooting: "Inspect HPV/SCV, replace if needed", category: "Engine", severity: "High" },
  { code: "P0095", system: "IAT Sensor", description: "Intake air temperature sensor 2 circuit", phenomenon: "Sensor fault", causes: "Faulty TMAP", troubleshooting: "Replace sensor", category: "Engine", severity: "Medium" },
  { code: "P0097", system: "IAT Sensor", description: "Intake air temp sensor 2 circuit low", phenomenon: "Low signal", causes: "Short circuit", troubleshooting: "Inspect wiring", category: "Engine", severity: "Medium" },
  { code: "P0098", system: "IAT Sensor", description: "Intake air temp sensor 2 circuit high", phenomenon: "High signal", causes: "Open circuit", troubleshooting: "Replace sensor", category: "Engine", severity: "Medium" },
  { code: "P0105", system: "MAP Sensor", description: "Manifold absolute pressure circuit fault", phenomenon: "Pressure reading error", causes: "Sensor fault", troubleshooting: "Replace TMAP", category: "Engine", severity: "Medium" },
  { code: "P0107", system: "Boost Pressure", description: "Boost pressure sensor low voltage", phenomenon: "Smoke", causes: "Open circuit", troubleshooting: "Check sensor", category: "Engine", severity: "Medium" },
  { code: "P0108", system: "Boost Pressure", description: "Boost pressure sensor high voltage", phenomenon: "Performance loss", causes: "Short circuit", troubleshooting: "Replace sensor", category: "Engine", severity: "Medium" },
  { code: "P0112", system: "IAT Sensor", description: "Intake air temp sensor malfunction (low)", phenomenon: "Cold start white smoke", causes: "Ground fault, short circuit", troubleshooting: "Inspect wiring", category: "Engine", severity: "Medium" },
  { code: "P0113", system: "IAT Sensor", description: "Intake air temp sensor malfunction (high)", phenomenon: "Cold start white smoke", causes: "Open circuit", troubleshooting: "Replace sensor", category: "Engine", severity: "Medium" },
  { code: "P0115", system: "Coolant Temp", description: "Engine coolant temp sensor circuit fault", phenomenon: "Temp reading error", causes: "Sensor error", troubleshooting: "Replace sensor", category: "Engine", severity: "High" },
  { code: "P0117", system: "Coolant Temp", description: "Engine coolant temp sensor low", phenomenon: "Smoke at normal temp, unstable idle when cold, hard start", causes: "Ground fault, short circuit", troubleshooting: "Test sensor", category: "Engine", severity: "High" },
  { code: "P0118", system: "Coolant Temp", description: "Engine coolant temp sensor high", phenomenon: "Smoke at normal temp, unstable idle when cold", causes: "Open circuit", troubleshooting: "Replace sensor", category: "Engine", severity: "High" },
  { code: "P0122", system: "Throttle Position", description: "Throttle position sensor low voltage", phenomenon: "Performance issues", causes: "Circuit fault", troubleshooting: "Replace TPS", category: "Engine", severity: "Medium" },
  { code: "P0123", system: "Throttle Position", description: "Throttle position sensor high voltage", phenomenon: "Performance issues", causes: "Open circuit", troubleshooting: "Check wiring", category: "Engine", severity: "Medium" },
  { code: "P0180", system: "Fuel Temp", description: "Fuel temperature sensor circuit fault", phenomenon: "Performance impact", causes: "Sensor fault", troubleshooting: "Replace sensor", category: "Engine", severity: "Low" },
  { code: "P0182", system: "Fuel Temp", description: "Fuel temp sensor low voltage", phenomenon: "Performance impact", causes: "Short to ground", troubleshooting: "Inspect wiring", category: "Engine", severity: "Low" },
  { code: "P0183", system: "Fuel Temp", description: "Fuel temp sensor high voltage", phenomenon: "Performance issues", causes: "Open circuit", troubleshooting: "Replace sensor", category: "Engine", severity: "Low" },
  { code: "P0190", system: "Rail Pressure", description: "Fuel rail pressure sensor circuit fault", phenomenon: "Pressure reading error", causes: "Signal drop", troubleshooting: "Check sensor", category: "Engine", severity: "High" },
  { code: "P0192", system: "Rail Pressure", description: "Fuel pressure sensor low voltage", phenomenon: "Engine may stop, reduced power", causes: "Short circuit", troubleshooting: "Test sensor", category: "Engine", severity: "High" },
  { code: "P0193", system: "Rail Pressure", description: "Fuel pressure sensor high voltage", phenomenon: "Engine may stop, power drop", causes: "Open circuit", troubleshooting: "Replace sensor", category: "Engine", severity: "High" },
  { code: "P0201", system: "Injector #1", description: "Injector circuit open - Cylinder 1", phenomenon: "Reduced power, rough running", causes: "Wiring/resistance fault", troubleshooting: "Test injector 1 resistance and wiring", category: "Fuel", severity: "High" },
  { code: "P0202", system: "Injector #2", description: "Injector circuit open - Cylinder 2", phenomenon: "Reduced power", causes: "Circuit fault", troubleshooting: "Test injector 2", category: "Fuel", severity: "High" },
  { code: "P0203", system: "Injector #3", description: "Injector circuit open - Cylinder 3", phenomenon: "Reduced power", causes: "Circuit fault", troubleshooting: "Test injector 3", category: "Fuel", severity: "High" },
  { code: "P0204", system: "Injector #4", description: "Injector circuit open - Cylinder 4", phenomenon: "Reduced power", causes: "Circuit fault", troubleshooting: "Test injector 4", category: "Fuel", severity: "High" },
  { code: "P0219", system: "Engine Overspeed", description: "Engine overspeed condition", phenomenon: "Power drop", causes: "Governor malfunction", troubleshooting: "Check governor, ECU", category: "Engine", severity: "High" },
  { code: "P0237", system: "Boost Pressure", description: "Boost pressure sensor low", phenomenon: "Smoke", causes: "Open circuit", troubleshooting: "Replace sensor", category: "Engine", severity: "Medium" },
  { code: "P0238", system: "Boost Pressure", description: "Boost pressure sensor high", phenomenon: "Performance loss", causes: "Short circuit", troubleshooting: "Check wiring", category: "Engine", severity: "Medium" },
  { code: "P0299", system: "Turbocharger", description: "Low boost pressure", phenomenon: "Poor performance", causes: "Turbo/wastegate issue", troubleshooting: "Check turbo, wastegate", category: "Engine", severity: "High" },
  { code: "P0335", system: "Crank Sensor", description: "Crankshaft sensor malfunction (no signal)", phenomenon: "Power drop, white smoke, severe vibration, may stop", causes: "Missing signal", troubleshooting: "Replace crank sensor", category: "Engine", severity: "High" },
  { code: "P0336", system: "Crank Sensor", description: "Crankshaft sensor signal fault", phenomenon: "Power drop, white smoke, vibration, may stop", causes: "Abnormal signal", troubleshooting: "Check timing, replace sensor", category: "Engine", severity: "High" },
  { code: "P0340", system: "Cam Sensor", description: "Cam sensor no signal / phase shift", phenomenon: "Timing issues", causes: "Phase shift, lost signal", troubleshooting: "Recalibrate cam sensor", category: "Engine", severity: "High" },
  
  // 100-Series: Open Circuit Faults
  { code: "101", system: "Crank Signal", description: "Crank signal not detected by ECU", phenomenon: "No start", causes: "Sensor fault", troubleshooting: "Check crank sensor", category: "Electrical", severity: "High" },
  { code: "102", system: "Fuel Sensor", description: "Fuel sensor open-circuit", phenomenon: "No fuel reading", causes: "Open circuit", troubleshooting: "Replace fuel sensor", category: "Electrical", severity: "Low" },
  { code: "103", system: "Engine Temp", description: "Engine temperature sensor open-circuit", phenomenon: "No temp reading", causes: "Open circuit", troubleshooting: "Replace temp sensor", category: "Electrical", severity: "Medium" },
  { code: "104", system: "Hydraulic Temp", description: "Hydraulic temperature sensor open-circuit", phenomenon: "No hydraulic temp", causes: "Open circuit", troubleshooting: "Replace sensor", category: "Hydraulic", severity: "Low" },
  { code: "105", system: "Throttle", description: "Throttle set potentiometer open-circuit", phenomenon: "No throttle control", causes: "Open circuit", troubleshooting: "Replace potentiometer", category: "Electrical", severity: "High" },
  { code: "106", system: "Throttle", description: "Throttle sense potentiometer open-circuit", phenomenon: "Throttle malfunction", causes: "Open circuit", troubleshooting: "Replace sensor", category: "Electrical", severity: "High" },
  { code: "107", system: "Oil Pressure", description: "Oil pressure switch reporting pressure with engine off", phenomenon: "False pressure reading", causes: "Stuck switch", troubleshooting: "Replace oil pressure switch", category: "Engine", severity: "Medium" },
  
  // 200-Series: Short Circuit Faults
  { code: "202", system: "Fuel Sensor", description: "Fuel level sensor short-circuit", phenomenon: "Incorrect fuel reading", causes: "Short circuit", troubleshooting: "Replace fuel sensor", category: "Electrical", severity: "Low" },
  { code: "203", system: "Engine Temp", description: "Engine temperature sensor short-circuit", phenomenon: "Incorrect temp reading", causes: "Short circuit", troubleshooting: "Replace sensor", category: "Electrical", severity: "Medium" },
  { code: "204", system: "Hydraulic Temp", description: "Hydraulic temperature sensor short-circuit", phenomenon: "Incorrect hydraulic temp", causes: "Short circuit", troubleshooting: "Replace sensor", category: "Hydraulic", severity: "Low" },
  { code: "205", system: "Throttle", description: "Throttle set potentiometer short-circuit", phenomenon: "Throttle error", causes: "Short circuit", troubleshooting: "Replace potentiometer", category: "Electrical", severity: "High" },
  { code: "206", system: "Throttle", description: "Throttle sense potentiometer short-circuit", phenomenon: "Throttle malfunction", causes: "Short circuit", troubleshooting: "Replace sensor", category: "Electrical", severity: "High" },
  
  // Hydraulic System Codes
  { code: "111", system: "Boom Control", description: "Boom lower speed regulation output open-circuit", phenomenon: "Boom control issue", causes: "Open circuit", troubleshooting: "Check boom solenoid wiring", category: "Hydraulic", severity: "Medium" },
  { code: "113", system: "Flow Control", description: "Max flow solenoid open-circuit", phenomenon: "Reduced hydraulic flow", causes: "Open circuit", troubleshooting: "Replace max flow solenoid", category: "Hydraulic", severity: "Medium" },
  { code: "115", system: "Boom Priority", description: "Boom priority solenoid open-circuit", phenomenon: "Boom priority lost", causes: "Open circuit", troubleshooting: "Replace solenoid", category: "Hydraulic", severity: "Medium" },
  { code: "119", system: "Slew Lock", description: "Slew lock solenoid open-circuit", phenomenon: "Slew function affected", causes: "Open circuit", troubleshooting: "Replace slew lock solenoid", category: "Hydraulic", severity: "Medium" },
  { code: "121", system: "Slew Brake", description: "Slew brake solenoid open-circuit", phenomenon: "Brake malfunction", causes: "Open circuit", troubleshooting: "Replace brake solenoid", category: "Hydraulic", severity: "High" },
  { code: "211", system: "Boom Control", description: "Boom lower speed regulation short-circuit", phenomenon: "Boom control issue", causes: "Short circuit", troubleshooting: "Inspect wiring", category: "Hydraulic", severity: "Medium" },
  { code: "213", system: "Flow Control", description: "Max flow solenoid short-circuit", phenomenon: "Flow control error", causes: "Short circuit", troubleshooting: "Replace solenoid", category: "Hydraulic", severity: "Medium" },
  { code: "219", system: "Slew Lock", description: "Slew lock solenoid short-circuit", phenomenon: "Slew error", causes: "Short circuit", troubleshooting: "Replace solenoid", category: "Hydraulic", severity: "Medium" },
  { code: "221", system: "Slew Brake", description: "Slew brake solenoid short-circuit", phenomenon: "Brake fault", causes: "Short circuit", troubleshooting: "Replace solenoid", category: "Hydraulic", severity: "High" },
  
  // Stabilizer System Codes
  { code: "161", system: "Stabilizer", description: "Stabilizer up solenoid open-circuit", phenomenon: "Stabilizer won't raise", causes: "Open circuit", troubleshooting: "Replace stabilizer solenoid", category: "Stabilizer", severity: "Medium" },
  { code: "162", system: "Stabilizer", description: "Stabilizer down solenoid open-circuit", phenomenon: "Stabilizer won't lower", causes: "Open circuit", troubleshooting: "Replace solenoid", category: "Stabilizer", severity: "Medium" },
  { code: "163", system: "Stabilizer", description: "Stabilizer left solenoid open-circuit", phenomenon: "Left stabilizer malfunction", causes: "Open circuit", troubleshooting: "Replace solenoid", category: "Stabilizer", severity: "Medium" },
  { code: "164", system: "Stabilizer", description: "Stabilizer right solenoid open-circuit", phenomenon: "Right stabilizer malfunction", causes: "Open circuit", troubleshooting: "Replace solenoid", category: "Stabilizer", severity: "Medium" },
  { code: "261", system: "Stabilizer", description: "Stabilizer up solenoid short-circuit", phenomenon: "Stabilizer error", causes: "Short circuit", troubleshooting: "Replace solenoid", category: "Stabilizer", severity: "Medium" },
  { code: "262", system: "Stabilizer", description: "Stabilizer down solenoid short-circuit", phenomenon: "Stabilizer fault", causes: "Short circuit", troubleshooting: "Replace solenoid", category: "Stabilizer", severity: "Medium" },
  { code: "263", system: "Stabilizer", description: "Stabilizer left solenoid short-circuit", phenomenon: "Left stabilizer fault", causes: "Short circuit", troubleshooting: "Replace solenoid", category: "Stabilizer", severity: "Medium" },
  { code: "264", system: "Stabilizer", description: "Stabilizer right solenoid short-circuit", phenomenon: "Right stabilizer fault", causes: "Short circuit", troubleshooting: "Replace solenoid", category: "Stabilizer", severity: "Medium" },
  
  // Travel System Codes  
  { code: "127", system: "Travel", description: "Travel change solenoid open-circuit", phenomenon: "Cannot change travel mode", causes: "Open circuit", troubleshooting: "Replace travel solenoid", category: "Travel", severity: "Medium" },
  { code: "156", system: "Travel", description: "Travel flow 3 solenoid open-circuit", phenomenon: "Travel flow reduced", causes: "Open circuit", troubleshooting: "Replace solenoid", category: "Travel", severity: "Medium" },
  { code: "157", system: "Travel", description: "Travel flow 2 solenoid open-circuit", phenomenon: "Travel flow reduced", causes: "Open circuit", troubleshooting: "Replace solenoid", category: "Travel", severity: "Medium" },
  { code: "158", system: "Gear Change", description: "Gear change solenoid open-circuit", phenomenon: "Cannot shift gears", causes: "Open circuit", troubleshooting: "Replace gear solenoid", category: "Travel", severity: "High" },
  { code: "227", system: "Travel", description: "Travel change solenoid short-circuit", phenomenon: "Travel error", causes: "Short circuit", troubleshooting: "Replace solenoid", category: "Travel", severity: "Medium" },
  { code: "258", system: "Gear Change", description: "Gear change solenoid short-circuit", phenomenon: "Shift fault", causes: "Short circuit", troubleshooting: "Replace solenoid", category: "Travel", severity: "High" },
  
  // Brake System Codes
  { code: "159", system: "Brake Light", description: "Brake light output open-circuit", phenomenon: "No brake lights", causes: "Open circuit", troubleshooting: "Check brake light circuit", category: "Safety", severity: "Low" },
  { code: "167", system: "Park Brake", description: "Park brake solenoid open-circuit", phenomenon: "Park brake malfunction", causes: "Open circuit", troubleshooting: "Replace park brake solenoid", category: "Safety", severity: "High" },
  { code: "259", system: "Brake Light", description: "Brake light output short-circuit", phenomenon: "Brake light fault", causes: "Short circuit", troubleshooting: "Inspect wiring", category: "Safety", severity: "Low" },
  { code: "267", system: "Park Brake", description: "Park brake solenoid short-circuit", phenomenon: "Brake fault", causes: "Short circuit", troubleshooting: "Replace solenoid", category: "Safety", severity: "High" },
  
  // CAN Communication Codes
  { code: "300", system: "CAN Bus", description: "CAN data bus open-circuit", phenomenon: "Communication loss", causes: "Open circuit", troubleshooting: "Check CAN wiring", category: "Communication", severity: "High" },
  { code: "301", system: "CAN Bus", description: "CAN data bus short-circuit", phenomenon: "Communication failure", causes: "Short circuit", troubleshooting: "Inspect CAN bus", category: "Communication", severity: "High" },
  
  // Calibration & ECU Codes
  { code: "302", system: "Throttle Cal", description: "Throttle calibration points out of range", phenomenon: "Throttle error", causes: "Calibration lost", troubleshooting: "Recalibrate throttle", category: "Calibration", severity: "Medium" },
  { code: "305", system: "Calibration", description: "Machine requires calibration", phenomenon: "Functions limited", causes: "Lost calibration", troubleshooting: "Perform full calibration", category: "Calibration", severity: "Medium" },
  { code: "306", system: "Calibration", description: "Machine calibration lost", phenomenon: "Multiple errors", causes: "EEPROM reset", troubleshooting: "Recalibrate machine", category: "Calibration", severity: "High" },
  { code: "308", system: "ECU", description: "ECU EEPROM corrupted", phenomenon: "System errors", causes: "Memory fault", troubleshooting: "Replace ECU or reprogram", category: "ECU", severity: "High" },
  { code: "310", system: "ECU", description: "ECU flash memory corrupted", phenomenon: "ECU malfunction", causes: "Memory corruption", troubleshooting: "Reflash or replace ECU", category: "ECU", severity: "High" },
];

export function searchJCBCodes(query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return jcbFaultCodes;
  
  return jcbFaultCodes.filter(code => 
    code.code.toLowerCase().includes(q) ||
    code.description.toLowerCase().includes(q) ||
    code.system.toLowerCase().includes(q) ||
    (code.phenomenon && code.phenomenon.toLowerCase().includes(q))
  );
}

export function getJCBCodesByCategory(category: string) {
  return jcbFaultCodes.filter(code => code.category === category);
}

