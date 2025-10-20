// Toro Dingo Compact Utility Loader Fault Codes
// Focus on e-Dingo 500 electric model and diesel variants
export const toroDingoFaultCodes = [
  // E-Series: Battery & Charging Codes (e-Dingo 500)
  { code: "E-0-0-1", system: "Battery Charging", description: "Battery high voltage", phenomenon: "Charging stops or fails, overcharge risk", causes: "Mismatched battery/charger voltage, faulty cables, degraded battery cells", troubleshooting: "Verify battery specs (48V for e-Dingo), secure connections, test voltage; replace if >52V unloaded", category: "Electric", severity: "High" },
  { code: "E-0-4-7", system: "Battery Charging", description: "Battery high voltage (alternate)", phenomenon: "Charging fails", causes: "Same as E-0-0-1; using non-Toro charger", troubleshooting: "Use OEM Toro charger, check voltage compatibility", category: "Electric", severity: "High" },
  { code: "E-0-0-4", system: "BMS/Battery", description: "BMS or battery fault detected", phenomenon: "System shutdown to prevent damage", causes: "Internal BMS error, cell imbalance, physical battery damage", troubleshooting: "Inspect for swelling/leaks; reset by disconnecting/reconnecting; dealer diagnostic for BMS reprogram", category: "Electric", severity: "High" },
  { code: "E-0-0-7", system: "Battery Capacity", description: "Battery amp hour limit exceeded", phenomenon: "Incomplete charge, reduced runtime", causes: "Aging battery, excessive discharge cycles, parasitic drains", troubleshooting: "Cycle power, check for drains, replace battery if capacity <80%; annual health check recommended", category: "Electric", severity: "Medium" },
  { code: "E-0-1-2", system: "Battery Connection", description: "Reverse polarity error", phenomenon: "No power flow, risk of short", causes: "Reversed positive/negative terminals", troubleshooting: "Double-check polarity (red +, black -); correct and retry; may damage electronics if persistent", category: "Electric", severity: "High" },
  { code: "E-0-2-3", system: "AC Input", description: "High AC voltage error (>270VAC)", phenomenon: "Charger protects against surge", causes: "Unstable grid power, generator overload, faulty outlet", troubleshooting: "Test AC source with multimeter; use surge protector or stable 120V/60Hz outlet; avoid extension cords >15m", category: "Charging", severity: "Medium" },
  { code: "E-0-2-4", system: "Charger Init", description: "Charger failed to initialize", phenomenon: "No startup sequence", causes: "Power interruption, internal relay fault", troubleshooting: "Unplug AC and battery for 30+ seconds, replug; test outlet voltage (110-130V); may need charger replacement", category: "Charging", severity: "High" },
  { code: "E-0-2-5", system: "AC Input", description: "Low AC voltage oscillation error", phenomenon: "Erratic charging", causes: "Undersized generator (<2kW), long/thin extension cords", troubleshooting: "Use direct wall outlet or higher-capacity generator; shorten cord, use min 12 AWG gauge", category: "Charging", severity: "Medium" },
  { code: "E-0-3-7", system: "Software", description: "Re-programming failed", phenomenon: "Software update aborted", causes: "Interrupted update, incompatible firmware", troubleshooting: "Retry update via Toro app/tool; ensure stable connection/power; dealer-assisted update", category: "System", severity: "Low" },
  { code: "E-0-2-9", system: "BMS Communication", description: "Communication error with battery", phenomenon: "Charging halts", causes: "Loose CANbus/signal wires, corrosion on pins", troubleshooting: "Clean/secure all connectors; test continuity; common after wet exposure", category: "Communication", severity: "Medium" },
  { code: "E-0-3-0", system: "BMS Communication", description: "Battery communication fault", phenomenon: "Data loss between BMS/charger", causes: "Signal wire issues", troubleshooting: "Same as E-0-2-9", category: "Communication", severity: "Medium" },
  { code: "E-0-3-2", system: "BMS Communication", description: "Battery data error", phenomenon: "Communication failure", causes: "Connector fault", troubleshooting: "Check waterproof plugs, clean pins", category: "Communication", severity: "Medium" },
  { code: "E-0-4-6", system: "BMS Communication", description: "Battery signal fault", phenomenon: "Communication loss", causes: "Wiring damage", troubleshooting: "Inspect signal wires, replace if damaged", category: "Communication", severity: "Medium" },
  { code: "E-0-6-0", system: "BMS Communication", description: "Battery communication error", phenomenon: "Charging interrupted", causes: "Poor connection", troubleshooting: "Secure all battery connections", category: "Communication", severity: "Medium" },
  
  // F-Series: Internal Charger Faults
  { code: "F-0-0-1", system: "Charger Internal", description: "Internal charger fault", phenomenon: "Complete shutdown", causes: "Overheat, component failure (capacitor, etc.)", troubleshooting: "Power cycle (disconnect AC/battery 30s); ventilate charger (0-40°C); dealer repair if persists", category: "Charging", severity: "High" },
  { code: "F-0-0-2", system: "Charger Internal", description: "Internal charger fault", phenomenon: "No charging", causes: "Component failure", troubleshooting: "Same as F-0-0-1; warranty may cover", category: "Charging", severity: "High" },
  { code: "F-0-0-3", system: "Charger Internal", description: "Internal charger fault", phenomenon: "Charging failure", causes: "Internal fault", troubleshooting: "Power cycle; avoid dusty/hot areas", category: "Charging", severity: "High" },
  { code: "F-0-0-4", system: "Charger Internal", description: "Internal charger fault", phenomenon: "No charge", causes: "Hardware fault", troubleshooting: "Dealer service required", category: "Charging", severity: "High" },
  { code: "F-0-0-5", system: "Charger Internal", description: "Internal charger fault", phenomenon: "Charger malfunction", causes: "Component failure", troubleshooting: "Replace charger if under warranty", category: "Charging", severity: "High" },
  { code: "F-0-0-6", system: "Charger Internal", description: "Internal charger fault", phenomenon: "System fault", causes: "Internal issue", troubleshooting: "Dealer diagnostic required", category: "Charging", severity: "High" },
  { code: "F-0-0-7", system: "Charger Internal", description: "Internal charger fault", phenomenon: "Complete failure", causes: "Hardware failure", troubleshooting: "Contact Toro dealer for charger replacement", category: "Charging", severity: "High" },
  
  // P-Series: Traction & Pedal Sensors (TEC Controller)
  { code: "P0225", system: "Traction Pedal", description: "Traction pedal analog sensor 1 - Open circuit", phenomenon: "Traction disabled until key cycle", causes: "No device on input pin, sensor fault", troubleshooting: "Verify sensor movement; check wiring/voltage; test assembly; swap TEC if needed", category: "Traction", severity: "High" },
  { code: "P0227", system: "Traction Pedal", description: "Traction pedal analog sensor 1 - Short to ground", phenomenon: "Traction disabled, voltage out of range", causes: "Short circuit", troubleshooting: "Same as P0225; inspect for shorts to ground", category: "Traction", severity: "High" },
  { code: "P0460", system: "Fuel Level", description: "Fuel level sensor - Open circuit", phenomenon: "Fuel reading out of range", causes: "Sensor/wiring fault", troubleshooting: "Check wiring/connector; test fuel gauge", category: "Sensor", severity: "Low" },
  { code: "P0461", system: "Fuel Level", description: "Fuel level sensor - Short to ground", phenomenon: "Incorrect fuel reading", causes: "Short detected", troubleshooting: "Same as P0460; test for shorts", category: "Sensor", severity: "Low" },
  { code: "P0575", system: "Cruise Control", description: "Cruise control switch correlation fault", phenomenon: "Cruise disabled; engage active but enable off", causes: "Switch malfunction", troubleshooting: "Check switch wiring; test switch operation", category: "Control", severity: "Low" },
  { code: "P057C", system: "Brake Pedal", description: "Brake pedal analog sensor 1 - Short to ground", phenomenon: "Traction disabled, voltage out of range", causes: "Sensor short", troubleshooting: "Verify sensor; check wiring/voltage; test sensor", category: "Safety", severity: "High" },
  { code: "P057D", system: "Brake Pedal", description: "Brake pedal analog sensor 1 - Open circuit", phenomenon: "Traction disabled", causes: "Open detected", troubleshooting: "Same as P057C; replace sensor if faulty", category: "Safety", severity: "High" },
  { code: "P05E0", system: "Brake Pedal", description: "Brake pedal sensor analog to digital correlation fault", phenomenon: "Traction disabled; inputs mismatch", causes: "Sensor mismatch", troubleshooting: "Check pedal movement/switch; test sensors; verify wiring", category: "Safety", severity: "High" },
  { code: "P0615", system: "Start Relay", description: "Start relay - Open circuit", phenomenon: "Starting fault", causes: "Open on start circuit", troubleshooting: "Check wiring/connectors; test between TEC/ECU; swap TEC", category: "Electrical", severity: "High" },
  { code: "P0616", system: "Start Relay", description: "Start relay - Short to ground/Overcurrent", phenomenon: "Starting fault", causes: "Overcurrent detected", troubleshooting: "Same as P0615; check for shorts", category: "Electrical", severity: "High" },
  { code: "P0617", system: "Start Relay", description: "Start relay - Short to battery", phenomenon: "Relay fault", causes: "Low current/short to 12V", troubleshooting: "Test relay circuit; replace if faulty", category: "Electrical", severity: "High" },
  { code: "P06E9", system: "Starter", description: "Starter timeout", phenomenon: "Starter disabled; engaged >15 seconds", causes: "Key switch or relay fault", troubleshooting: "Check key switch; test/replace switch/relay", category: "Electrical", severity: "Medium" },
  { code: "P0939", system: "Hydraulic Oil Temp", description: "Hydraulic oil temperature sensor - Short to ground", phenomenon: "Incorrect temp reading", causes: "Short circuit", troubleshooting: "Check wiring/connector; test sender", category: "Hydraulic", severity: "Low" },
  { code: "P0940", system: "Hydraulic Oil Temp", description: "Hydraulic oil temperature sensor - Open circuit", phenomenon: "No temp reading", causes: "Open detected", troubleshooting: "Same as P0939; replace sensor", category: "Hydraulic", severity: "Low" },
  { code: "P100C", system: "Engine Coolant", description: "Engine coolant temperature above threshold - PTO kill", phenomenon: "PTO disabled at >105°C", causes: "Overheating", troubleshooting: "Check fan/airflow/coolant; test sender/wiring", category: "Engine", severity: "High" },
  { code: "P100D", system: "Engine Coolant", description: "Engine coolant temperature above threshold - Engine kill", phenomenon: "Engine shutdown at >115°C", causes: "Critical overheating", troubleshooting: "Same as P100C; immediate shutdown for safety", category: "Engine", severity: "High" },
  { code: "P1104", system: "Traction Coil", description: "Traction coil 1 FWD - Overcurrent", phenomenon: "Traction disabled", causes: "Short to ground", troubleshooting: "Verify coil; check wiring; test coil; swap TEC", category: "Traction", severity: "High" },
  { code: "P110C", system: "Traction Coil", description: "Traction coil C1 validation failure - Current converge", phenomenon: "Traction disabled; variance in current", causes: "Current mismatch", troubleshooting: "Same as P1104; test coil performance", category: "Traction", severity: "High" },
  { code: "P110D", system: "Traction Coil", description: "Traction coil C1 validation failure - PWM converge", phenomenon: "Traction disabled; duty cycle issues", causes: "PWM fault", troubleshooting: "Test PWM signal; replace TEC if needed", category: "Traction", severity: "High" },
  { code: "P1114", system: "Traction Coil", description: "Traction coil C2 overcurrent (Reverse)", phenomenon: "Reverse traction disabled", causes: "Short to ground", troubleshooting: "Verify reverse coil; check wiring; test; swap TEC", category: "Traction", severity: "High" },
  
  // Communication/ECM Codes
  { code: "U0100", system: "ECM Communication", description: "Lost communication with ECM", phenomenon: "No crank, no start", causes: "Wiring/module faults", troubleshooting: "Check harness, reset system, dealer scan required", category: "Communication", severity: "High" },
];

export function searchToroDingoCodes(query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return toroDingoFaultCodes;
  
  return toroDingoFaultCodes.filter(code => 
    code.code.toLowerCase().includes(q) ||
    code.description.toLowerCase().includes(q) ||
    code.system.toLowerCase().includes(q) ||
    (code.phenomenon && code.phenomenon.toLowerCase().includes(q))
  );
}

export function getToroDingoCodesByCategory(category: string) {
  return toroDingoFaultCodes.filter(code => code.category === category);
}

