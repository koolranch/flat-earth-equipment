import React from 'react';
import OshaBasicsCard from '@/components/training/OshaBasicsCard';

export default function Module2OSHA() {
  const bullets = [
    {
      text: "Run the full inspection each shift and record defects. Remove trucks from service if any condition adversely affects safety (29 CFR 1910.178(q)(7)).",
      details: (
        <>
          <p className="font-semibold">Daily Inspection Requirements:</p>
          <p>OSHA 1910.178(q)(7) requires powered industrial trucks to be examined at least daily before being placed in service. Document all defects and remove defective equipment from service until repairs are made by authorized personnel only.</p>
          <p className="font-semibold mt-2">What to Record:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Date and time of inspection</li>
            <li>Truck identification number</li>
            <li>All defects found (even minor ones)</li>
            <li>Operator name and signature</li>
          </ul>
          <p className="text-orange-600 font-medium mt-2">⚠️ Documentation proves compliance during OSHA inspections and protects your employer from liability.</p>
        </>
      )
    },
    {
      text: "Forks: No cracks or bends; matched pair; lock pins in place; heel wear within limit.",
      details: (
        <>
          <p className="font-semibold">Fork Inspection Checklist:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Cracks:</strong> Check top and bottom surfaces, especially at heel and near mounting</li>
            <li><strong>Bends or twists:</strong> Forks must be straight - misalignment causes load instability</li>
            <li><strong>Matched pair:</strong> Forks must be same length, thickness, and model</li>
            <li><strong>Lock pins:</strong> Verify retention hardware is secure to prevent forks sliding off</li>
            <li><strong>Heel wear:</strong> Generally reject if worn more than 10% of original thickness</li>
            <li><strong>Tip wear:</strong> Excessive rounding or damage reduces load security</li>
          </ul>
          <p className="text-red-600 font-bold mt-2">⚠️ Damaged forks are a major cause of dropped loads and accidents. Replace immediately if defective.</p>
        </>
      )
    },
    {
      text: "Chains & hoses: No kinks, tight/broken links, frays, or leaks; proper tension/lube; guards in place.",
      details: (
        <>
          <p className="font-semibold">Lift Chain Inspection:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Wear:</strong> Reject if any 3-inch section is stretched more than 3% over new length</li>
            <li><strong>Broken links:</strong> Any broken or cracked link requires immediate replacement</li>
            <li><strong>Tight links:</strong> Links should move freely - frozen links indicate wear or lack of lubrication</li>
            <li><strong>Lubrication:</strong> Chains must be properly lubricated for smooth operation</li>
          </ul>
          <p className="font-semibold mt-2">Hydraulic Hose Inspection:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Check for cracks, abrasions, or bulges in hoses</li>
            <li>Verify all fittings are tight with no leaks</li>
            <li>Look for fluid on the ground under the mast</li>
            <li>Test lift/tilt functions for smooth operation</li>
          </ul>
          <p className="text-orange-600 font-medium mt-2">⚠️ Chain or hydraulic failure while carrying a load can cause catastrophic accidents.</p>
        </>
      )
    },
    {
      text: "Tires & wheels: Adequate tread/inflation (pneumatic); no chunks/splits; lugs tight; rims undamaged.",
      details: (
        <>
          <p className="font-semibold">Tire Types and Inspection:</p>
          <p><strong>Pneumatic (air-filled):</strong> Check pressure with gauge; inspect sidewalls for cuts or bulges; verify valve stems are intact.</p>
          <p><strong>Solid/cushion:</strong> Check for chunks missing, excessive wear, or separation from rim.</p>
          <p className="font-semibold mt-2">Critical Checkpoints:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Tread depth:</strong> Adequate tread prevents slipping, especially on wet surfaces</li>
            <li><strong>Sidewall damage:</strong> Cuts or punctures can cause sudden failure</li>
            <li><strong>Wheel lugs:</strong> Torque specs must be met - loose lugs cause wheel separation</li>
            <li><strong>Rim condition:</strong> Bent or cracked rims affect stability and tire seating</li>
          </ul>
          <p className="text-orange-600 font-medium mt-2">⚠️ Tire failure is a leading cause of forklift tip-overs. Never operate with worn or damaged tires.</p>
        </>
      )
    },
    {
      text: "Horn & lights: Horn works (use at blind corners); head/taillights, beacon, and reverse beeper functional.",
      details: (
        <>
          <p className="font-semibold">Warning Device Requirements:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Horn test:</strong> Must be audible throughout your work area before operation begins</li>
            <li><strong>Required usage:</strong> Sound horn at intersections, blind corners, doorways, and when backing</li>
            <li><strong>Backup alarm:</strong> Automatically sounds when in reverse (must be functioning)</li>
          </ul>
          <p className="font-semibold mt-2">Lighting System Check:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Headlights and taillights for low-light areas</li>
            <li>Blue safety lights project warning ahead of truck path</li>
            <li>Amber rotating beacon for visibility in high-traffic zones</li>
          </ul>
          <p className="text-orange-600 font-medium mt-2">⚠️ Most pedestrian accidents involve workers who didn't see or hear the forklift. All warning devices must function.</p>
        </>
      )
    },
    {
      text: "Seat belt & data plate: Seat belt present/working; data plate present, legible, and matches attachments/capacity.",
      details: (
        <>
          <p className="font-semibold">Seatbelt Requirements (OSHA 1910.178(m)(12)):</p>
          <p>When a seatbelt is installed on the forklift, it MUST be worn at all times during operation. Seatbelts prevent ejection during tip-overs, which is the leading cause of forklift fatalities.</p>
          <p className="font-semibold mt-2">Data Plate Verification:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Load capacity at specified load center</li>
            <li>Attachment deductions (if applicable)</li>
            <li>Serial number and model information</li>
            <li>Fuel type and specifications</li>
          </ul>
          <p className="text-orange-600 font-medium mt-2">⚠️ Always verify capacity before lifting. Attachments reduce available capacity significantly.</p>
        </>
      )
    },
    {
      text: "Leaks/undercarriage: No hydraulic, fuel, or coolant leaks; mast/undercarriage clear; clean spills per procedure.",
      details: (
        <>
          <p className="font-semibold">Leak Inspection Procedures:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Hydraulic leaks:</strong> Red/amber fluid indicates hydraulic system damage</li>
            <li><strong>Fuel leaks:</strong> Smell or visible fuel requires immediate shutdown</li>
            <li><strong>Coolant leaks:</strong> Green/orange fluid indicates cooling system issues</li>
            <li><strong>Oil leaks:</strong> Engine or transmission leaks create slip hazards</li>
          </ul>
          <p className="font-semibold mt-2">Undercarriage Inspection:</p>
          <p>Remove debris, check for damage to mast rails, inspect counterweight security, verify no loose components. Clean any fluid spills according to your facility's hazmat procedures.</p>
          <p className="text-red-600 font-bold mt-2">⚠️ Fuel leaks create fire hazards. Shut down immediately and notify maintenance if fuel odor is detected.</p>
        </>
      )
    },
    {
      text: "Battery/LP system: Cables/connectors intact and secure; charger leads OK; LP cylinder secured, no leaks/odor.",
      details: (
        <>
          <p className="font-semibold">Electric Forklift Battery Check:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Battery cables secure with no fraying or exposed wires</li>
            <li>Connectors clean and tight - no corrosion</li>
            <li>Battery secured in compartment (no movement)</li>
            <li>Electrolyte levels adequate (if applicable)</li>
            <li>No cracks in battery case</li>
          </ul>
          <p className="font-semibold mt-2">LP (Propane) Forklift Check:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Cylinder properly secured with strap/clamp and locating pin</li>
            <li>No propane odor (rotten egg smell)</li>
            <li>Hoses and connections intact with no damage</li>
            <li>Cylinder valve accessible and functional</li>
          </ul>
          <p className="text-red-600 font-bold mt-2">⚠️ LP leaks are fire/explosion hazards. If you smell propane, shut down immediately and evacuate the area.</p>
        </>
      )
    },
    {
      text: "Safety devices: Parking brake, deadman, brakes, and steering respond correctly; alarms present and working.",
      details: (
        <>
          <p className="font-semibold">Critical Safety Systems Test:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Parking brake:</strong> Must hold truck on maximum grade - test before use</li>
            <li><strong>Service brake:</strong> Should bring truck to smooth, controlled stop</li>
            <li><strong>Deadman seat:</strong> Engine should stop when operator leaves seat</li>
            <li><strong>Steering:</strong> No excessive play, responds smoothly, no binding</li>
            <li><strong>Tilt lock:</strong> Prevents unintended mast movement during travel</li>
            <li><strong>Load backrest:</strong> In place and undamaged to prevent load from sliding back</li>
          </ul>
          <p className="font-semibold mt-2">Alarm Systems:</p>
          <p>Backup alarm, low battery warning, overheat indicators, and any other installed safety alarms must be functional. These alerts prevent accidents and protect equipment.</p>
          <p className="text-red-600 font-bold mt-2">⚠️ Brake or steering failure while carrying a load is extremely dangerous. Test before moving.</p>
        </>
      )
    },
  ];

  return (
    <OshaBasicsCard
      title="OSHA Basics — 8-Point Inspection"
      bullets={bullets}
      tip="References: 29 CFR 1910.178 (p), (q); ANSI/ITSDF B56.1."
      testId="osha-m2"
    />
  );
}
