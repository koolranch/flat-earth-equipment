// Comprehensive Hyster Forklift Fault Codes Database
// Covers A, E, H, J, RS, S series and electric/IC models
export const hysterFaultCodes = [
  // Err Series: Display & Communication
  { code: "Errd001", system: "CANbus Communication", description: "Communication data fault over CANbus", phenomenon: "Communication loss", causes: "CANbus/wiring/display fault", troubleshooting: "Check voltages (2.5V HI/LO), resistance (60Ω), replace display", category: "Communication", severity: "High" },
  { code: "Errd002", system: "EEPROM", description: "EEPROM readout fault", phenomenon: "Data read error", causes: "CANbus/wiring/display fault", troubleshooting: "Check operator manual for hour meter, replace display", category: "EEPROM", severity: "Medium" },
  { code: "Errd003", system: "EEPROM Hour Meter", description: "EEPROM writing fault (hour meter)", phenomenon: "Hour meter won't save", causes: "CANbus/wiring/display fault", troubleshooting: "Test CANbus, replace display if needed", category: "EEPROM", severity: "Low" },
  { code: "Errd004", system: "EEPROM Controller", description: "EEPROM writing fault (controller instructions)", phenomenon: "Settings won't save", causes: "CANbus/wiring/display fault", troubleshooting: "Check CANbus communication", category: "EEPROM", severity: "Medium" },
  { code: "Errd011", system: "Display Switch", description: "Switch 1 (► Button) continuously ON", phenomenon: "Display/setting does not change", causes: "Faulty display component", troubleshooting: "Power cycle, inspect connectors/wiring, clean/replace display", category: "Display", severity: "Low" },
  { code: "Errd012", system: "Display Switch", description: "Switch 2 (◄ Button) continuously ON", phenomenon: "Button stuck", causes: "Faulty display component", troubleshooting: "Same as Errd011; replace if stuck", category: "Display", severity: "Low" },
  { code: "Errd013", system: "Display Switch", description: "Switch 3 (M Button) continuously ON", phenomenon: "Button stuck", causes: "Faulty display component", troubleshooting: "Clean or replace display", category: "Display", severity: "Low" },
  
  // Err Series: Sensors
  { code: "ErrE600", system: "MAP Sensor", description: "MAP sensor signal out of range high", phenomenon: "Reduced performance", causes: "Wiring/sensor fault", troubleshooting: "Check 5V supply, resistance, replace TMAP", category: "Sensor", severity: "Medium" },
  { code: "ErrE601", system: "MAP Sensor", description: "MAP sensor signal out of range low", phenomenon: "Performance loss", causes: "Wiring/sensor fault", troubleshooting: "Test sensor, check wiring", category: "Sensor", severity: "Medium" },
  { code: "ErrE602", system: "Fuel Pressure", description: "Primary fuel pressure higher than expected", phenomenon: "Pressure too high", causes: "Sensor/wiring/controller fault", troubleshooting: "Check 5V/ground, resistance, replace sensor; test 40-90 PSI", category: "Fuel", severity: "High" },
  { code: "ErrE603", system: "Fuel Pressure", description: "Primary fuel pressure lower than expected", phenomenon: "Pressure too low", causes: "Sensor/wiring/controller fault", troubleshooting: "Pressure test, replace sensor", category: "Fuel", severity: "High" },
  { code: "ErrE604", system: "Fuel Pressure", description: "Fuel pressure circuit voltage out of range high", phenomenon: "High voltage fault", causes: "Sensor/wiring fault", troubleshooting: "Check voltage, replace sensor", category: "Fuel", severity: "Medium" },
  { code: "ErrE605", system: "Fuel Pressure", description: "Fuel pressure circuit voltage out of range low", phenomenon: "Low voltage fault", causes: "Sensor/wiring fault", troubleshooting: "Test circuit, replace sensor", category: "Fuel", severity: "Medium" },
  { code: "ErrE609", system: "Coolant Temp", description: "ECT sensor out of range high/open (>4.9V)", phenomenon: "No temp reading", causes: "Wiring/sensor/ECU fault", troubleshooting: "Check 5V, resistance (2.5kΩ at 20°C), replace sensor/ECU", category: "Sensor", severity: "High" },
  { code: "ErrE610", system: "Coolant Temp", description: "ECT sensor voltage out of range low (<0.10V)", phenomenon: "Temp sensor fault", causes: "Wiring/sensor/ECU fault", troubleshooting: "Test voltage and resistance", category: "Sensor", severity: "High" },
  { code: "ErrE611", system: "Intake Air Temp", description: "IAT sensor voltage out of range high (>4.90V)", phenomenon: "Air temp sensor error", causes: "Wiring/signal/sensor fault", troubleshooting: "Check 5V/ground, resistance, replace IAT", category: "Sensor", severity: "Medium" },
  { code: "ErrE612", system: "Intake Air Temp", description: "IAT sensor voltage out of range low (<0.10V)", phenomenon: "Sensor fault", causes: "Wiring/signal/sensor fault", troubleshooting: "Test sensor, replace if needed", category: "Sensor", severity: "Medium" },
  { code: "ErrE614", system: "Barometric Pressure", description: "Barometric pressure below limit", phenomenon: "Pressure sensor error", causes: "Wiring/sensor fault", troubleshooting: "Replace barometric sensor", category: "Sensor", severity: "Low" },
  { code: "ErrE615", system: "Battery Voltage", description: "Battery voltage out of range high", phenomenon: "Engine does not start or alternator icon on", causes: "Battery/alternator failure, short cycle, high draw", troubleshooting: "Test battery (>9V), alternator, draw (<30mA)", category: "Electrical", severity: "High" },
  { code: "ErrE616", system: "Battery Voltage", description: "Battery voltage out of range low", phenomenon: "Engine does not start", causes: "Battery/alternator failure, short cycle, high draw", troubleshooting: "Charge or replace battery, test alternator", category: "Electrical", severity: "High" },
  
  // AL Series: Component Faults
  { code: "AL01", system: "Control Card", description: "Traction/hoist not working", phenomenon: "No movement/lift", causes: "Throttle/lift calibration out of range, damaged card, incomplete connections", troubleshooting: "Check voltage, connections, replace control card", category: "Electrical", severity: "High" },
  { code: "AL02", system: "Contactor/Motor", description: "Traction/hydraulic not working", phenomenon: "No functions", causes: "Welded contactor tips, broken motor field circuit", troubleshooting: "Test open circuit, check connections, replace contactor", category: "Electrical", severity: "High" },
  { code: "AL4", system: "Lowering Valve", description: "Traction/hydraulic not working", phenomenon: "Fork won't lower", causes: "Damaged connection/coil/cartridge", troubleshooting: "Check connection, resistance (17.7 ohms), replace valve", category: "Hydraulic", severity: "High" },
  { code: "AL5", system: "Brake", description: "Traction/hydraulic not working", phenomenon: "Brake malfunction", causes: "Damaged connection/coil", troubleshooting: "Check resistance (27.36-30.24 ohms), replace brake coil", category: "Safety", severity: "High" },
  { code: "AL6", system: "Traction Motor", description: "Traction/hydraulic not working", phenomenon: "No drive", causes: "Damaged connection, low armature resistance, loose field wires, shorted field winding", troubleshooting: "Check connections, test shorts/resistance (0.5-1.5 ohms), check contactor (52 ohms)", category: "Drive", severity: "High" },
  { code: "AL7", system: "Controller Temp", description: "Traction reduced below 14°F or above 167°F; not working above 194°F", phenomenon: "Temperature-related performance loss", causes: "Extreme temperature, incorrect calibration, damaged sensor/controller", troubleshooting: "Move truck to better temp, calibrate with handset", category: "Electrical", severity: "Medium" },
  { code: "AL8", system: "Over Current", description: "Traction/hydraulic not working", phenomenon: "Overcurrent protection", causes: "Over current in component", troubleshooting: "Check harness for shorts, test coils (52/27.36-30.24/17.7 ohms)", category: "Electrical", severity: "High" },
  { code: "AL10", system: "Controller/Motor", description: "Traction/hydraulic not working", phenomenon: "Complete shutdown", causes: "Damaged controller/wire, short harness, ground/short in windings, failed driver, damaged watchdog", troubleshooting: "Cycle key, check connections/harness/shorts/resistance (1.5 ohms), replace controller", category: "Electrical", severity: "High" },
  { code: "AL66", system: "Hydraulic", description: "Hydraulic function not working", phenomenon: "No hydraulics", causes: "Low battery voltage, incorrect calibration", troubleshooting: "Charge/replace battery, calibrate with handset", category: "Hydraulic", severity: "High" },
  { code: "AL94", system: "Data Transfer", description: "Traction/hydraulic not working for 1 minute", phenomenon: "Temporary shutdown", causes: "Controller installing hour meter memory (new controller)", troubleshooting: "No action needed; wait for data transfer to complete", category: "System", severity: "Low" },
  { code: "AL99", system: "Battery Mismatch", description: "Traction/hydraulic not working", phenomenon: "No functions", causes: "Incorrect battery voltage, damaged battery/connection", troubleshooting: "Check voltage matches specs, inspect crimps/cables, replace battery", category: "Electrical", severity: "High" },
  
  // P-Series: Engine Codes
  { code: "P0087", system: "Fuel Pressure", description: "Low fuel rail/system pressure", phenomenon: "Insufficient fuel pressure", causes: "Wiring/sensor/pump issues", troubleshooting: "Scan/correct via Jaltest, pressure test fuel system", category: "Engine", severity: "High" },
  { code: "P2293", system: "Fuel Pressure Regulator", description: "Abnormal fuel pressure regulator performance", phenomenon: "Pressure regulation error", causes: "Regulator fault", troubleshooting: "Scan/correct via Jaltest, replace regulator", category: "Engine", severity: "High" },
  { code: "P2294", system: "Fuel Pressure Regulator", description: "Fuel pressure regulator/pump fault", phenomenon: "Pressure issues", causes: "Wiring issues or malfunctioning regulator/pump", troubleshooting: "Scan/correct via Jaltest, replace component", category: "Engine", severity: "High" },
  { code: "P3001", system: "DPF/Emissions", description: "High soot buildup in DPF/after-treatment", phenomenon: "Performance drop, limp mode, emissions issues", causes: "Soot accumulation in diesel particulate filter", troubleshooting: "Perform force regen (High/Very High) via Jaltest", category: "Engine", severity: "High" },
  { code: "P3008", system: "Cam Sensor", description: "Cam position sensor circuit fault", phenomenon: "Timing issues", causes: "Improper wiring/sensor", troubleshooting: "Scan/correct via Jaltest, replace cam sensor", category: "Engine", severity: "High" },
  
  // SPN Codes
  { code: "SPN 522755", system: "Backup Alarm", description: "Backup alarm not sounding", phenomenon: "No reverse alarm", causes: "Wiring/PSI code", troubleshooting: "Check connections, troubleshoot per electrical manual", category: "Safety", severity: "Medium" },
  { code: "SPN 524245", system: "Seat Sensor", description: "Seat sensor voltage <1.4V with operator seated", phenomenon: "Seat not detected", causes: "Sensor failure", troubleshooting: "Replace seat sensor", category: "Safety", severity: "High" },
  { code: "524223-0", system: "Transmission", description: "Transmission reverse pressure > commanded", phenomenon: "Limp mode possible", causes: "Sensor supply open, sensor/mechanical failure", troubleshooting: "Diagnose/correct via Jaltest", category: "Transmission", severity: "High" },
  { code: "522593-12", system: "EPR Communication", description: "EPR communication loss", phenomenon: "Display screen fault", causes: "Electronic pressure regulator fault", troubleshooting: "Check communication/wiring to EPR", category: "Communication", severity: "Medium" },
];

export function searchHysterCodes(query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return hysterFaultCodes;
  
  return hysterFaultCodes.filter(code => 
    code.code.toLowerCase().includes(q) ||
    code.description.toLowerCase().includes(q) ||
    code.system.toLowerCase().includes(q) ||
    (code.phenomenon && code.phenomenon.toLowerCase().includes(q))
  );
}

export function getHysterCodesByCategory(category: string) {
  return hysterFaultCodes.filter(code => code.category === category);
}

