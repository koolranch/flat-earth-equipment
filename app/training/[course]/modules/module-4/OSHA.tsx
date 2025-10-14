import React from 'react';
import InteractiveChecklist, { ChecklistItem } from '@/components/training/InteractiveChecklist';

export default function Module4OSHA() {
  const checklistItems: ChecklistItem[] = [
    {
      text: "Train for your facility's hazards and use the scene hotspots to practice. Control hazards before operating.",
      details: (
        <>
          <p className="font-semibold">Workplace-Specific Training (OSHA 1910.178(l)(3)):</p>
          <p>OSHA requires training in operating conditions specific to YOUR workplace. This includes:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Surface conditions (wet, uneven, slopes)</li>
            <li>Load types and characteristics common to your facility</li>
            <li>Traffic patterns and pedestrian zones</li>
            <li>Specific hazards unique to your environment</li>
          </ul>
          <p className="font-semibold mt-2">Hazard Control Hierarchy:</p>
          <p>1. <strong>Eliminate</strong> hazards if possible | 2. <strong>Engineer controls</strong> (barriers, guards) | 3. <strong>Administrative</strong> (policies, training) | 4. <strong>PPE</strong> as last resort</p>
          <p className="text-orange-600 font-medium mt-2">⚠️ Your employer must document site-specific hazards and provide additional training for any unique conditions.</p>
        </>
      )
    },
    {
      text: "Blind corners & aisles: Stop/creep, sound horn, look; use convex mirrors; keep corners clear of parked equipment.",
      details: (
        <>
          <p className="font-semibold">Blind Corner Procedures:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Slow to creep speed</strong> as you approach (2-3 mph max)</li>
            <li><strong>Sound horn</strong> to alert anyone around the corner</li>
            <li><strong>Check mirrors</strong> if available to see ahead</li>
            <li><strong>Edge forward carefully</strong> - never commit to a turn without clear view</li>
            <li><strong>Listen</strong> for other equipment or voices</li>
          </ul>
          <p className="font-semibold mt-2">Facility Controls:</p>
          <p>Convex mirrors should be installed at blind intersections. Keep corners clear of parked equipment, pallets, or boxes. Mark high-traffic intersections with lines or signage.</p>
          <p className="text-red-600 font-bold mt-2">⚠️ T-bone collisions at blind corners can be fatal. Always assume someone is coming.</p>
        </>
      )
    },
    {
      text: "Pedestrians: Marked walkways, eye contact, spotters when required; maintain separation; right-of-way to pedestrians.",
      details: (
        <>
          <p className="font-semibold">Pedestrian Protection (OSHA 1910.178(l)(1)):</p>
          <p>OSHA requires permanent aisles and passageways be appropriately marked. Pedestrians have absolute right-of-way.</p>
          <p className="font-semibold mt-2">Safe Practices:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Marked walkways:</strong> Respect pedestrian-only zones with painted lines</li>
            <li><strong>Eye contact:</strong> Never pass a pedestrian without making direct eye contact</li>
            <li><strong>Spotter required:</strong> Congested areas, limited visibility, or when backing long distances</li>
            <li><strong>Safe separation:</strong> Maintain at least 3 feet clearance when passing workers</li>
            <li><strong>Stop and yield:</strong> Always give pedestrians right-of-way without exception</li>
          </ul>
          <p className="text-red-600 font-bold mt-2">⚠️ Pedestrian fatalities are preventable. Treat every person as if they can't see or hear you.</p>
        </>
      )
    },
    {
      text: "Ramps & slopes: Keep forks low/tilted back; no turning on ramps; control speed; chock as needed.",
      details: (
        <>
          <p className="font-semibold">Ramp and Slope Procedures:</p>
          <p className="font-medium">Load position based on direction:</p>
          <ul className="list-disc pl-5 space-y-1 mb-2">
            <li><strong>Loaded going uphill:</strong> Forks point uphill to prevent load sliding</li>
            <li><strong>Unloaded going downhill:</strong> Forks point downhill for stability</li>
          </ul>
          <p className="font-semibold">Critical Rules for Grades:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Keep forks 4-6 inches off surface, mast tilted back</li>
            <li><strong>NEVER</strong> turn on a ramp - straighten out first, then turn</li>
            <li>Descend slowly using service brake, not neutral coasting</li>
            <li>Use wheel chocks when loading/unloading on slopes</li>
            <li>Watch for surface conditions (wet, icy, loose gravel)</li>
          </ul>
          <p className="text-red-600 font-bold mt-2">⚠️ Tip-overs on ramps are usually lateral (sideways). Never turn while on a grade.</p>
        </>
      )
    },
    {
      text: "Docks & edges: Use dock locks/chocks; verify dock plates (capacity, lip engaged, dry); maintain a setback from edges; watch overhead doors.",
      details: (
        <>
          <p className="font-semibold">Loading Dock Safety (OSHA 1910.178(k)(1)):</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Dock locks:</strong> Engage restraints before driving onto trailer</li>
            <li><strong>Wheel chocks:</strong> Place at trailer wheels as backup restraint</li>
            <li><strong>Dock plate inspection:</strong> Verify capacity rating, lip properly engaged, surface dry and clean</li>
            <li><strong>Edge awareness:</strong> Maintain 12-inch setback from edges at all times</li>
            <li><strong>Communication:</strong> Coordinate with dock supervisor and truck driver</li>
          </ul>
          <p className="font-semibold mt-2">Trailer Safety:</p>
          <p>Verify trailer is stable and won't roll. Check floor condition inside trailer - look for holes, weak spots, or damage. Ensure adequate lighting inside trailer. Never enter a trailer if it's moving or unstable.</p>
          <p className="text-red-600 font-bold mt-2">⚠️ Trailers creeping away from dock or dock plate failure causes serious accidents. Always verify restraints.</p>
        </>
      )
    },
    {
      text: "Spills & leaks: Clean or barricade; report leaks; never travel through unidentified liquids.",
      details: (
        <>
          <p className="font-semibold">Spill Response Procedures:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Stop operations:</strong> Don't drive through spills - creates slip hazard</li>
            <li><strong>Barricade immediately:</strong> Use cones or caution tape to warn others</li>
            <li><strong>Identify substance:</strong> Check container labels, ask supervisor</li>
            <li><strong>Clean per SDS:</strong> Use appropriate absorbent and disposal method</li>
            <li><strong>Report all leaks:</strong> Document location, substance, and action taken</li>
          </ul>
          <p className="font-semibold mt-2">Common Hazardous Fluids:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Battery acid (sulfuric acid - extremely corrosive)</li>
            <li>Hydraulic fluid (slippery, fire hazard if heated)</li>
            <li>LP gas (explosion hazard)</li>
            <li>Fuel (fire hazard)</li>
          </ul>
          <p className="text-orange-600 font-medium mt-2">⚠️ Unidentified liquids may be hazardous. Never attempt cleanup without proper PPE and SDS guidance.</p>
        </>
      )
    },
    {
      text: "Speed & visibility: Obey posted speed; maintain lighting; beacon/reverse beeper operating; slow for wet/icy floors.",
      details: (
        <>
          <p className="font-semibold">Speed Control (OSHA 1910.178(n)(8)):</p>
          <p>Speed limits must be posted and obeyed. Typical limits are 5-8 mph in open areas, 2-3 mph in congested zones or at intersections.</p>
          <p className="font-semibold mt-2">Speed Reduction Required:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Wet, icy, or oily surfaces (reduce speed 50% or more)</li>
            <li>Congested areas with pedestrians</li>
            <li>Approaching intersections or blind corners</li>
            <li>Uneven surfaces or floor joints</li>
            <li>When carrying large or unstable loads</li>
          </ul>
          <p className="font-semibold mt-2">Visibility Equipment:</p>
          <p>Headlights, beacons, and backup alarms must be operational. These devices alert pedestrians to your presence and improve your visibility of the environment.</p>
          <p className="text-orange-600 font-medium mt-2">⚠️ Speed-related accidents increase in severity. Slower speeds allow more reaction time to avoid collisions.</p>
        </>
      )
    },
    {
      text: "Overhead obstructions: Verify clearances; never travel with an elevated load; watch sprinklers/doors/fixtures.",
      details: (
        <>
          <p className="font-semibold">Overhead Clearance Verification:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Mast height:</strong> Know your truck's maximum mast height (extended)</li>
            <li><strong>Load height:</strong> Add load height to mast height for total clearance needed</li>
            <li><strong>Overhead guard clearance:</strong> Factor in overhead guard when going under structures</li>
            <li><strong>Sprinkler systems:</strong> Contact can discharge fire suppression or cause flooding</li>
            <li><strong>Door frames:</strong> Verify adequate clearance before entering</li>
            <li><strong>Electrical conduits:</strong> Contact with high-voltage can be fatal</li>
          </ul>
          <p className="font-semibold mt-2">Safe Practices:</p>
          <p>Mark low clearance areas with warning signs and height indicators. Never raise loads higher than necessary for travel. When approaching low clearances, stop and visually verify safe passage.</p>
          <p className="text-red-600 font-bold mt-2">⚠️ Striking overhead obstacles can cause load falls, structural damage, or electrocution. Always verify clearance before proceeding.</p>
        </>
      )
    },
    {
      text: "Charging/fueling areas: Ventilated, no ignition sources; eyewash/spill kits available and known.",
      details: (
        <>
          <p className="font-semibold">Battery Charging Area Requirements (OSHA 1910.178(g)):</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Ventilation:</strong> Adequate to disperse hydrogen gas generated during charging</li>
            <li><strong>No smoking:</strong> Posted signs prohibiting smoking and open flames</li>
            <li><strong>Eyewash station:</strong> Within 10 seconds travel time for battery acid exposure</li>
            <li><strong>Spill kit:</strong> Acid neutralizer and absorbent materials readily available</li>
            <li><strong>Fire extinguisher:</strong> Class ABC rated, accessible and charged</li>
          </ul>
          <p className="font-semibold mt-2">LP Fueling Area Requirements:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Well-ventilated area (preferably outdoors)</li>
            <li>No ignition sources within 20 feet</li>
            <li>Cylinder storage must be secure and upright</li>
            <li>Fire extinguisher readily available</li>
          </ul>
          <p className="text-red-600 font-bold mt-2">⚠️ Battery acid can cause chemical burns. LP gas is explosive. Know emergency procedures before charging/fueling.</p>
        </>
      )
    },
  ].map((item, index) => ({
    id: item.text.split(':')[0].toLowerCase().replace(/[^a-z0-9]/g, '-'),
    title: item.text.split(':')[0],
    description: item.text.split(':').slice(1).join(':').trim(),
    icon: ['⚠️', '🚧', '🚶‍♂️', '⛰️', '🚪', '⚡', '🔥'][index]
  }));

  return (
    <InteractiveChecklist
      title="OSHA 1910.178 — Workplace Hazards"
      subtitle="Identify and control hazards in your facility."
      items={checklistItems}
      requireAllChecked={true}
      storageKey="module-4-osha-checklist"
      onComplete={() => {
        console.log('Module 4 OSHA checklist completed');
      }}
    />
  );
}
