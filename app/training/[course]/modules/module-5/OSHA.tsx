import React from 'react';
import InteractiveChecklist, { ChecklistItem } from '@/components/training/InteractiveChecklist';

export default function Module5OSHA() {
  const checklistItems: ChecklistItem[] = [
    {
      text: "Battery charging: Park, set brake, forks down, power off; ventilated area; no smoking/open flames.",
      details: (
        <>
          <p className="font-semibold">Battery Charging Procedures (OSHA 1910.178(g)):</p>
          <p><strong>Before charging:</strong></p>
          <ul className="list-disc pl-5 space-y-1 mb-2">
            <li>Park in designated charging area with adequate ventilation</li>
            <li>Set parking brake and lower forks completely</li>
            <li>Turn off truck power (key off, disconnect switch if equipped)</li>
            <li>Allow battery to cool if just used</li>
          </ul>
          <p className="font-semibold">Area Requirements:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Adequate ventilation to disperse hydrogen gas</li>
            <li>No smoking or open flame signs posted</li>
            <li>Eyewash station within 10 seconds</li>
            <li>Spill kit with acid neutralizer available</li>
          </ul>
          <p className="text-red-600 font-bold mt-2">⚠️ Hydrogen gas generated during charging is explosive. One spark can cause battery explosion with acid spray.</p>
        </>
      )
    },
    {
      text: "Wear PPE (eye/face, gloves, apron per SDS). Eyewash and spill neutralizer available.",
      details: (
        <>
          <p className="font-semibold">Required PPE for Battery Handling:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Face shield or goggles:</strong> Full face protection against acid splash</li>
            <li><strong>Rubber gloves:</strong> Chemical-resistant, extend past wrists</li>
            <li><strong>Rubber apron:</strong> Protects torso and legs from acid</li>
            <li><strong>Safety shoes:</strong> Chemical-resistant with toe protection</li>
          </ul>
          <p className="font-semibold mt-2">Emergency Equipment (OSHA 1910.178(g)(2)):</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Eyewash station accessible within 10 seconds</li>
            <li>Acid neutralizer (baking soda solution) for spills</li>
            <li>Absorbent materials for containment</li>
            <li>First aid kit with burn treatment supplies</li>
          </ul>
          <p className="text-orange-600 font-medium mt-2">⚠️ Battery acid causes severe chemical burns on contact. Know location of safety equipment before handling batteries.</p>
        </>
      )
    },
    {
      text: "Unplug truck; inspect cables/connectors; connect charger leads correctly; verify charger settings.",
      details: (
        <>
          <p className="font-semibold">Safe Charging Connection Procedure:</p>
          <p><strong>Step-by-step process:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>1. Unplug truck:</strong> Disconnect battery from truck (if removable) or turn off all switches</li>
            <li><strong>2. Inspect cables:</strong> Check for fraying, exposed wires, damaged insulation, or corrosion</li>
            <li><strong>3. Clean connectors:</strong> Remove any corrosion or debris from terminals</li>
            <li><strong>4. Verify polarity:</strong> Match positive to positive, negative to negative</li>
            <li><strong>5. Connect charger:</strong> Plug charger leads firmly into battery connector</li>
            <li><strong>6. Check charger:</strong> Verify correct voltage and amperage settings for your battery</li>
          </ul>
          <p className="font-semibold mt-2">Charger Settings:</p>
          <p>Verify charger voltage matches battery (24V, 36V, 48V, etc.). Incorrect settings can damage battery or create fire hazard. Modern chargers auto-detect, but older models require manual selection.</p>
          <p className="text-red-600 font-bold mt-2">⚠️ Reversed polarity or wrong voltage can cause battery damage, fire, or explosion. Always verify before starting charge.</p>
        </>
      )
    },
    {
      text: "After charge, turn charger off (if required), then disconnect; inspect for heat/damage; keep vent caps in place.",
      details: (
        <>
          <p className="font-semibold">Post-Charging Procedures:</p>
          <p><strong>Disconnection sequence:</strong></p>
          <ul className="list-disc pl-5 space-y-1 mb-2">
            <li><strong>1. Turn off charger:</strong> Stop charging cycle if manual charger</li>
            <li><strong>2. Disconnect leads:</strong> Remove charger connector from battery</li>
            <li><strong>3. Inspect connections:</strong> Check for heat damage, melting, or corrosion</li>
            <li><strong>4. Check electrolyte:</strong> Verify levels (if applicable) - add distilled water only</li>
            <li><strong>5. Secure vent caps:</strong> Ensure all caps are tightened to prevent acid spray</li>
          </ul>
          <p className="font-semibold">Heat and Damage Inspection:</p>
          <p>Batteries and connectors get hot during charging. Excessive heat indicates problems - damaged cables, poor connections, or charger malfunction. Report any overheating immediately.</p>
          <p className="text-orange-600 font-medium mt-2">⚠️ Hot batteries can off-gas more hydrogen. Allow cooling time before use. Never add water immediately after charging.</p>
        </>
      )
    },
    {
      text: "LP fuel (if applicable): Shut engine off; close cylinder valve; allow area to cool; no ignition sources.",
      details: (
        <>
          <p className="font-semibold">LP Cylinder Change Procedure (OSHA 1910.178(f)):</p>
          <p><strong>Before removing cylinder:</strong></p>
          <ul className="list-disc pl-5 space-y-1 mb-2">
            <li>Shut off engine completely</li>
            <li>Close cylinder valve (turn clockwise)</li>
            <li>Allow engine to burn remaining fuel in lines</li>
            <li>Wait for exhaust system to cool (hot surfaces ignite LP)</li>
            <li>Park in well-ventilated area away from ignition sources</li>
          </ul>
          <p className="font-semibold">Cylinder Removal/Installation:</p>
          <p>LP cylinders must be handled upright. Never drop or roll cylinders. Inspect for damage, dents, rust, or leaks before installing. Secure with strap/clamp and locating pin. Leak test connections with soap solution before starting engine.</p>
          <p className="text-red-600 font-bold mt-2">⚠️ LP gas is heavier than air and collects in low areas. If you smell propane (rotten egg odor), evacuate area immediately.</p>
        </>
      )
    },
    {
      text: "Wear PPE; remove/replace cylinder upright with locating pin engaged; secure clamp/strap.",
      details: (
        <>
          <p className="font-semibold">LP Cylinder Handling PPE:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Safety gloves (protect hands from cold and sharp edges)</li>
            <li>Safety glasses or face shield</li>
            <li>Steel-toe boots (cylinders are heavy ~35 lbs)</li>
          </ul>
          <p className="font-semibold mt-2">Proper Cylinder Installation:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Keep upright:</strong> Never tip or lay cylinders horizontally</li>
            <li><strong>Locating pin:</strong> Must engage properly to prevent cylinder movement</li>
            <li><strong>Secure clamp/strap:</strong> Tighten to prevent shifting during operation</li>
            <li><strong>Connection:</strong> Thread fitting carefully - don't cross-thread</li>
            <li><strong>Valve operation:</strong> Open slowly (counter-clockwise) after connection</li>
          </ul>
          <p className="text-orange-600 font-medium mt-2">⚠️ Improperly secured cylinders can fall off during operation, causing leaks or impact hazards.</p>
        </>
      )
    },
    {
      text: "Reconnect; open valve slowly; leak-check; if odor/leak—shut down and report.",
      details: (
        <>
          <p className="font-semibold">Leak Detection Procedures:</p>
          <p><strong>After installing LP cylinder:</strong></p>
          <ul className="list-disc pl-5 space-y-1 mb-2">
            <li><strong>Open valve slowly:</strong> Turn counter-clockwise 1-2 full turns</li>
            <li><strong>Soap test:</strong> Apply soap solution to all connections</li>
            <li><strong>Look for bubbles:</strong> Any bubbling indicates a leak</li>
            <li><strong>Smell test:</strong> LP has added odorant (mercaptan) - smells like rotten eggs</li>
          </ul>
          <p className="font-semibold">If Leak Detected:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Close cylinder valve immediately</li>
            <li>Do NOT attempt to repair - call maintenance</li>
            <li>Evacuate area if strong odor present</li>
            <li>Tag truck out of service</li>
            <li>Report to supervisor</li>
          </ul>
          <p className="text-red-600 font-bold mt-2">⚠️ NEVER use open flames or matches to check for leaks. LP gas is extremely flammable and forms explosive mixtures.</p>
        </>
      )
    },
    {
      text: "Care & records: Only authorized personnel repair/adjust trucks; defective trucks are removed from service.",
      details: (
        <>
          <p className="font-semibold">Maintenance Authorization (OSHA 1910.178(q)(1)):</p>
          <p>Only persons trained and authorized by the employer may perform repairs or adjustments to powered industrial trucks. Operators should NEVER attempt repairs.</p>
          <p className="font-semibold mt-2">Operator Responsibilities:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Report all defects immediately to supervisor</li>
            <li>Tag out defective equipment to prevent use</li>
            <li>Document defects on inspection forms</li>
            <li>Never bypass safety devices or make field repairs</li>
            <li>Follow lockout/tagout procedures when applicable</li>
          </ul>
          <p className="font-semibold mt-2">Recordkeeping Requirements (OSHA 1910.178(l)(6)):</p>
          <p>Employers must maintain records of operator training including: operator name, training dates, evaluation dates, and identity of persons conducting training and evaluation. Records demonstrate compliance during OSHA inspections.</p>
          <p className="text-orange-600 font-medium mt-2">⚠️ Unauthorized repairs or modifications can void certifications and create liability for accidents.</p>
        </>
      )
    },
    {
      text: "Operator certification records include name, training date, evaluation date, and trainer/evaluator. Provide refresher training after incidents/unsafe operation/workplace changes, and evaluate each operator at least every 3 years.",
      details: (
        <>
          <p className="font-semibold">Certification Requirements (OSHA 1910.178(l)):</p>
          <p><strong>Initial Certification Must Include:</strong></p>
          <ul className="list-disc pl-5 space-y-1 mb-2">
            <li>Formal instruction (classroom or online)</li>
            <li>Practical training (hands-on with equipment)</li>
            <li>Evaluation of operator performance in workplace</li>
            <li>Training on workplace-specific conditions and equipment</li>
          </ul>
          <p className="font-semibold">Refresher Training Required (OSHA 1910.178(l)(4)):</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Every 3 years minimum</strong> - re-evaluate and document</li>
            <li><strong>After any accident or near-miss</strong> involving the operator</li>
            <li><strong>After observed unsafe operation</strong> by supervisor</li>
            <li><strong>When assigned to new truck type</strong> with different characteristics</li>
            <li><strong>When workplace conditions change</strong> (new hazards, equipment, processes)</li>
          </ul>
          <p className="font-semibold mt-2">Documentation to Maintain:</p>
          <p>Records must include operator name, training dates, evaluation dates, and identity of persons who trained and evaluated the operator. These records prove OSHA compliance.</p>
          <p className="text-orange-600 font-medium mt-2">⚠️ Operating without current certification violates OSHA and exposes employer to penalties up to $156,000+ per violation.</p>
        </>
      )
    },
  ].map((item, index) => ({
    id: item.text.split(':')[0].toLowerCase().replace(/[^a-z0-9]/g, '-'),
    title: item.text.split(':')[0],
    description: item.text.split(':').slice(1).join(':').trim(),
    icon: ['🔋', '🦺', '🔌', '🔍', '🔧', '📋'][index]
  }));

  return (
    <InteractiveChecklist
      title="OSHA 1910.178 — Charging/Fueling & Care"
      subtitle="Safe battery charging and maintenance procedures."
      items={checklistItems}
      requireAllChecked={true}
      storageKey="module-5-osha-checklist"
      onComplete={() => {
        console.log('Module 5 OSHA checklist completed');
      }}
    />
  );
}
