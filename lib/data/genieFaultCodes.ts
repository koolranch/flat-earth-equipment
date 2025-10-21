// Comprehensive Genie Scissor Lift and Boom Lift Fault Codes
// Covers GS series scissor lifts and boom lift models
export const genieFaultCodes = [
  // E-Series: Common Scissor Lift Error Codes (GS-1930, GS-2032, GS-2646, GS-3246, GS-4047)
  { code: "E1", system: "Emergency Stop", description: "Emergency stop activated", phenomenon: "All functions disabled", causes: "Switch pressed or faulty", troubleshooting: "Reset emergency stop button, check all e-stop switches for proper function", category: "Safety", severity: "High" },
  { code: "E2", system: "Platform Load", description: "Platform overload", phenomenon: "Functions restricted", causes: "Excess weight, sensor fault", troubleshooting: "Reduce load below capacity (varies by model), check load sensors", category: "Safety", severity: "High" },
  { code: "E3", system: "Hydraulic", description: "Hydraulic oil temperature too high", phenomenon: "Performance degraded", causes: "Overuse, low fluid, cooling issue", troubleshooting: "Cool down unit, check hydraulic fluid levels, inspect cooling system", category: "Hydraulic", severity: "Medium" },
  { code: "E4", system: "Battery Voltage", description: "Low battery voltage", phenomenon: "Reduced performance or shutdown", causes: "Discharged battery, poor connections", troubleshooting: "Charge battery fully, check/clean battery connections and terminals", category: "Electrical", severity: "High" },
  { code: "E5", system: "Battery Voltage", description: "High battery voltage", phenomenon: "Charging issues", causes: "Overcharge, charger fault", troubleshooting: "Check charger settings, test battery health, verify voltage regulator", category: "Electrical", severity: "Medium" },
  { code: "E6", system: "Tilt Sensor", description: "Tilt sensor activated", phenomenon: "Movement restricted", causes: "Uneven surface, sensor fault", troubleshooting: "Level machine on flat surface, calibrate tilt sensor, check sensor wiring", category: "Safety", severity: "High" },
  { code: "E7", system: "Drive Interlock", description: "Drive function not permitted with raised platform", phenomenon: "Cannot drive while elevated", causes: "Safety interlock engaged (normal operation)", troubleshooting: "Lower platform completely to enable drive function", category: "Safety", severity: "Low" },
  { code: "E8", system: "Potentiometer", description: "Potentiometer out of range", phenomenon: "Control malfunction", causes: "Potentiometer fault or miscalibration", troubleshooting: "Check potentiometer wiring, recalibrate, replace if faulty", category: "Control", severity: "Medium" },
  { code: "E9", system: "Joystick", description: "Joystick not in neutral position", phenomenon: "Functions disabled", causes: "Joystick stuck or fault", troubleshooting: "Return joystick to neutral, check for mechanical binding, test joystick module", category: "Control", severity: "Medium" },
  { code: "E10", system: "Hydraulic Pump", description: "Hydraulic pump overcurrent", phenomenon: "Pump shuts down", causes: "Overload, pump fault, electrical issue", troubleshooting: "Reduce load, check pump motor current draw, inspect pump for mechanical issues", category: "Hydraulic", severity: "High" },
  { code: "E11", system: "Drive Motor", description: "Traction motor overcurrent", phenomenon: "Drive disabled", causes: "Overload, motor fault, electrical issue", troubleshooting: "Reduce load, check motor current, inspect drive motor and wiring", category: "Drive", severity: "High" },
  { code: "E12", system: "Communication", description: "Platform control not communicating with ground control", phenomenon: "Communication loss", causes: "Wiring fault, CANbus issue, control box fault", troubleshooting: "Check all communication wiring, CANbus connections; may need ground control box replacement", category: "Communication", severity: "High" },
  { code: "E13", system: "Communication", description: "Ground control not communicating with platform control", phenomenon: "Communication loss", causes: "Wiring fault, CANbus issue, control box fault", troubleshooting: "Same as E12; inspect ground control box and connections", category: "Communication", severity: "High" },
  { code: "E14", system: "Platform Control", description: "Platform control system error", phenomenon: "Platform controls malfunction", causes: "Control system fault, software issue", troubleshooting: "Reset system, check platform control module, update software if needed", category: "Control", severity: "High" },
  { code: "E15", system: "Ground Control", description: "Ground control system error", phenomenon: "Ground controls malfunction", causes: "Control system fault, software issue", troubleshooting: "Reset system, check ground control module; may need Gen 6 ground control box replacement", category: "Control", severity: "High" },
  { code: "E16", system: "Sensor", description: "General sensor error", phenomenon: "Sensor fault detected", causes: "Faulty sensor, wiring issue", troubleshooting: "Inspect sensors, check wiring, replace faulty sensor", category: "Sensor", severity: "Medium" },
  { code: "E17", system: "Drive Speed Sensor", description: "Drive speed sensor error", phenomenon: "Speed monitoring fault", causes: "Speed sensor fault or wiring", troubleshooting: "Check drive speed sensor, test wiring, replace if needed", category: "Sensor", severity: "Medium" },
  { code: "E18", system: "Elevation Limit", description: "Elevation limit switch error", phenomenon: "Height limit malfunction", causes: "Limit switch fault or misalignment", troubleshooting: "Check elevation limit switch, adjust/replace, verify wiring", category: "Safety", severity: "Medium" },
  { code: "E19", system: "Hydraulic Pressure", description: "Hydraulic pressure sensor error", phenomenon: "Pressure monitoring fault", causes: "Pressure sensor fault or wiring", troubleshooting: "Test hydraulic pressure sensor, check connections, replace if faulty", category: "Sensor", severity: "Medium" },
  { code: "E20", system: "Steering Angle", description: "Steering angle sensor error", phenomenon: "Steering monitoring fault", causes: "Angle sensor fault or wiring", troubleshooting: "Check steering angle sensor, test wiring, calibrate or replace", category: "Sensor", severity: "Medium" },

  // Numbered DTC Codes
  { code: "01", system: "ECM", description: "Internal ECM error", phenomenon: "Complete system fault", causes: "ECM hardware or software defect", troubleshooting: "High criticality - stop immediately; contact technician for ECM replacement or reprogram", category: "ECU", severity: "High" },
  { code: "02", system: "Communication", description: "Communication error between ECM and controls", phenomenon: "Control failure", causes: "Wiring issues, loose connections, module fault", troubleshooting: "High criticality; check CANbus, wiring, reset; dealer diagnostic required", category: "Communication", severity: "High" },
  { code: "03", system: "Configuration", description: "Software conflict or dip switch setting error", phenomenon: "Function limitations", causes: "Configuration changes, switch settings, pump wear, relief valve weak", troubleshooting: "Check dip switches, power cycle, inspect pump/relief valve", category: "System", severity: "Medium" },
  { code: "18", system: "Emergency Stop", description: "Pothole protection or emergency stop error", phenomenon: "Safety system engaged", causes: "Activated emergency stop, loose contacts", troubleshooting: "Check and reset all emergency stops, inspect switch contacts", category: "Safety", severity: "High" },
  { code: "20", system: "Choke/Glow Switch", description: "Choke or glow switch fault", phenomenon: "Engine start issues", causes: "Defective switch or wiring", troubleshooting: "Inspect switch, test wiring, replace if needed", category: "Engine", severity: "High" },
  { code: "21", system: "Engine Switch", description: "Engine switch fault", phenomenon: "Engine control issue", causes: "Defective switch or wiring", troubleshooting: "Test engine switch, check wiring, replace switch", category: "Engine", severity: "High" },
  { code: "26", system: "Up/Down Switch", description: "Up/down function switch fault", phenomenon: "Lift control malfunction", causes: "Defective switch or wiring", troubleshooting: "Inspect up/down switches, test wiring, replace", category: "Control", severity: "High" },
  { code: "30", system: "Joystick", description: "Joystick calibration faulty or hardware defective", phenomenon: "Joystick malfunction", causes: "Calibration error, damaged module", troubleshooting: "Recalibrate joystick via service menu or replace joystick module", category: "Control", severity: "Medium" },
  { code: "32", system: "Drive System", description: "Traction drive circuit error", phenomenon: "Drive disabled or limited", causes: "Defective sensors, wiring, drive motor issues", troubleshooting: "Inspect drive sensors, check wiring, test drive motors, reset system", category: "Drive", severity: "High" },
  { code: "40-43", system: "Hydraulic Coils", description: "Hydraulic coil defective", phenomenon: "Hydraulic function loss", causes: "Defective coil, broken cable, short circuit", troubleshooting: "Test coil resistance, check wiring for shorts, replace coil if faulty", category: "Hydraulic", severity: "High" },
  { code: "44-47", system: "Engine", description: "Engine overload", phenomenon: "Engine performance issues", causes: "Dirty cooling fins, overload condition", troubleshooting: "Clean engine cooling fins, reduce operational load, check air filter", category: "Engine", severity: "Medium" },
  { code: "49-51", system: "Drive Coils", description: "Drive coils faulty", phenomenon: "Drive malfunction", causes: "Electrical defects, short circuit", troubleshooting: "Inspect drive circuit wiring, test coil resistance, replace faulty coils", category: "Drive", severity: "High" },
  { code: "59", system: "Lift Motor", description: "Lift motor circuit issue or solenoid open circuit", phenomenon: "Lift function impaired", causes: "Wiring fault, solenoid failure", troubleshooting: "Power cycle, check wiring/solenoid; use Jaltest for root cause analysis", category: "Hydraulic", severity: "High" },

  // Model-Specific Codes
  { code: "A5", system: "Control Board", description: "Joystick or control board communication issue (GS-1930)", phenomenon: "Lift lowers but stops, operates down but not up", causes: "Joystick/control board fault, low pressure (pump wear, weak relief valve)", troubleshooting: "Power cycle, check emergency lowering valve (ensure closed), test pump pressure, replace pump/relief valve if weak", category: "Control", severity: "High" },
  { code: "H102", system: "Relief Valve", description: "Relief valve coil fault - Short to BAT+ (GS-4047)", phenomenon: "Hydraulic control issue", causes: "Short circuit to battery positive, coil defect", troubleshooting: "Inspect relief valve coil/wiring for shorts, replace if shorted to positive", category: "Hydraulic", severity: "Medium" },
  { code: "H103", system: "Relief Valve", description: "Relief valve coil fault - Short to BAT- (GS-4047)", phenomenon: "Hydraulic control issue", causes: "Short circuit to battery negative, coil defect", troubleshooting: "Inspect relief valve coil/wiring for shorts to ground, replace coil", category: "Hydraulic", severity: "Medium" },

  // OIC Codes (Operation Indicator Codes)
  { code: "LL", system: "Tilt Sensor", description: "Lift is off level", phenomenon: "Movement restricted, tilt alarm", causes: "Uneven surface or tilt sensor activation", troubleshooting: "Move to level surface, calibrate tilt sensor if needed, contact service if persists", category: "Safety", severity: "High" },
  { code: "OIL", system: "Platform Load", description: "Platform overload indicator", phenomenon: "Weight limit exceeded", causes: "Load limit exceeded or incorrect sensor detection", troubleshooting: "Remove excess weight, verify actual load vs capacity, inspect load sensors", category: "Safety", severity: "High" },
  { code: "CH", system: "Chassis Mode", description: "Chassis mode active", phenomenon: "Operational mode indicator", causes: "Mode switch engaged", troubleshooting: "Verify correct mode for operation, check mode switches, reset if needed", category: "System", severity: "Low" },
  { code: "PHS", system: "Pothole Protection", description: "Pothole protection system fault", phenomenon: "System not functioning or blocked", causes: "Faulty switch, sensor, improper installation of guards", troubleshooting: "Cease operation, inspect pothole guard system, ensure proper installation, repair/replace components", category: "Safety", severity: "High" },

  // Boom Lift Codes
  { code: "P100C", system: "Engine Coolant", description: "Engine coolant temp above threshold - PTO kill", phenomenon: "PTO disabled at >105°C", causes: "Overheating", troubleshooting: "Check cooling fan, airflow, coolant level; test temperature sender/wiring", category: "Engine", severity: "High" },
  { code: "P100D", system: "Engine Coolant", description: "Engine coolant temp above threshold - Engine kill", phenomenon: "Engine shutdown at >115°C", causes: "Critical overheating", troubleshooting: "Same as P100C; immediate shutdown for safety, let engine cool", category: "Engine", severity: "High" },
  { code: "3-2", system: "Jib Cylinder", description: "Jib boom lift cylinder fault", phenomenon: "Jib function impaired", causes: "Cylinder leak, seal failure, wiring", troubleshooting: "Inspect jib cylinder for leaks, test seals, repair or replace", category: "Hydraulic", severity: "Medium" },
  { code: "4-3", system: "Boom Cylinder", description: "Main boom lift cylinder fault", phenomenon: "Boom function impaired", causes: "Cylinder leak, seal failure", troubleshooting: "Inspect boom cylinder, test hydraulic seals, repair or replace", category: "Hydraulic", severity: "Medium" },
];

export function searchGenieCodes(query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return genieFaultCodes;
  
  return genieFaultCodes.filter(code => 
    code.code.toLowerCase().includes(q) ||
    code.description.toLowerCase().includes(q) ||
    code.system.toLowerCase().includes(q) ||
    (code.phenomenon && code.phenomenon.toLowerCase().includes(q))
  );
}

export function getGenieCodesByCategory(category: string) {
  return genieFaultCodes.filter(code => code.category === category);
}


