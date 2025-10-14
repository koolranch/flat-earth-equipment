import React from 'react';
import InteractiveChecklist, { ChecklistItem } from '@/components/training/InteractiveChecklist';

export default function Module3OSHA() {
  const checklistItems: ChecklistItem[] = [
    {
      text: "Capacity & attachments: Never exceed nameplate capacity; attachments change capacity and load center—use the data plate.",
      details: (
        <>
          <p className="font-semibold">Understanding Load Capacity:</p>
          <p>The data plate shows maximum capacity at a specific load center (usually 24 inches). If your load's center of gravity is farther away, capacity decreases significantly.</p>
          <p className="font-semibold mt-2">Attachment Impact on Capacity:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Attachments add weight to the front of the truck</li>
            <li>This shifts the combined center of gravity forward</li>
            <li>Available lifting capacity is reduced by attachment weight PLUS additional derating</li>
            <li>Always check the attachment data plate for new capacity limits</li>
          </ul>
          <p className="text-red-600 font-bold mt-2">⚠️ Operating beyond capacity is a leading cause of tip-overs and fatalities. Always verify before lifting.</p>
        </>
      )
    },
    {
      text: "Keep load low & tilted back: Travel with forks ~4–6 in (10–15 cm) off the floor; mast slightly back; avoid sudden starts/stops/turns.",
      details: (
        <>
          <p className="font-semibold">Proper Travel Position (OSHA 1910.178(n)(6)):</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Fork height:</strong> 4-6 inches (10-15 cm) above ground clears obstacles but maintains low center of gravity</li>
            <li><strong>Mast tilt:</strong> Tilt mast back slightly to secure load and prevent sliding forward</li>
            <li><strong>Load against backrest:</strong> Keep load tight against load backrest extension</li>
          </ul>
          <p className="font-semibold mt-2">Why This Matters:</p>
          <p>A raised load dramatically raises the combined center of gravity, making the forklift unstable. Sudden movements (starts, stops, turns) shift weight and can cause tip-overs even with stable loads.</p>
          <p className="text-orange-600 font-medium mt-2">⚠️ Traveling with elevated loads is prohibited except during stacking operations. Always lower forks before moving.</p>
        </>
      )
    },
    {
      text: "Stability triangle: Keep the combined center of gravity inside the triangle; slow at corners and uneven surfaces; no riders and keep body inside the compartment.",
      details: (
        <>
          <p className="font-semibold">The Stability Triangle:</p>
          <p>Three-wheel forklifts have a triangular stability zone formed by the two front wheels and the pivot point of the rear wheel. Four-wheel forklifts have a rectangular zone but the concept is similar.</p>
          <p className="font-semibold mt-2">Center of Gravity Rules:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Empty truck: COG is within the triangle</li>
            <li>With load: Combined COG shifts forward toward the load</li>
            <li>Turning: COG shifts to the outside of the turn</li>
            <li>Elevated load: COG rises, reducing stability</li>
          </ul>
          <p className="font-semibold mt-2">Maintaining Stability:</p>
          <p>Slow down when turning, especially with loads. Avoid turning on slopes or uneven surfaces. Never carry riders - extra weight destabilizes the truck. Always keep your body inside the operator compartment and overhead guard.</p>
          <p className="text-red-600 font-bold mt-2">⚠️ If the combined COG moves outside the stability zone, the forklift will tip over. No exceptions.</p>
        </>
      )
    },
    {
      text: "Visibility: Maintain a clear view; if the load blocks view, travel in reverse when safe or use a spotter.",
      details: (
        <>
          <p className="font-semibold">Visibility Requirements (OSHA 1910.178(n)(6)):</p>
          <p>Operators must have a clear view of the travel path at all times. When the load obstructs forward visibility:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Option 1:</strong> Travel in reverse (forks trailing) with frequent looks ahead</li>
            <li><strong>Option 2:</strong> Use a spotter to guide you (maintain constant communication)</li>
            <li><strong>Never:</strong> Travel blind or rely solely on memory of the path</li>
          </ul>
          <p className="font-semibold mt-2">Additional Visibility Considerations:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Keep mast upright when traveling to maximize sight lines</li>
            <li>Use mirrors to check blind spots</li>
            <li>Ensure adequate lighting in work areas</li>
            <li>Sound horn at intersections even if you think you can see</li>
          </ul>
          <p className="text-orange-600 font-medium mt-2">⚠️ Most collisions occur when operators can't see pedestrians or obstacles. Never guess - always verify clear path.</p>
        </>
      )
    },
    {
      text: "Grades/ramps: With a load, drive upgrade; without a load, drive downgrade. Do not turn on ramps; forks low and tilted back; descend slowly.",
      details: (
        <>
          <p className="font-semibold">Grade and Ramp Safety (OSHA 1910.178(n)(7)):</p>
          <p className="font-medium">The Golden Rule:</p>
          <ul className="list-disc pl-5 space-y-1 mb-2">
            <li><strong>Loaded:</strong> Forks pointing UPHILL (prevents load from sliding forward)</li>
            <li><strong>Unloaded:</strong> Forks pointing DOWNHILL (keeps forklift stable)</li>
          </ul>
          <p className="font-semibold">Critical Grade Procedures:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Keep forks 4-6 inches off surface with mast tilted back</li>
            <li>NEVER turn on a ramp or slope - tip-over risk is extreme</li>
            <li>Control speed - descend slowly using brakes, not momentum</li>
            <li>Watch for slippery conditions (water, ice, oil)</li>
            <li>Use chocks when loading/unloading on grades</li>
          </ul>
          <p className="text-red-600 font-bold mt-2">⚠️ Turning on a ramp is one of the most dangerous forklift maneuvers. Always straighten out before changing direction.</p>
        </>
      )
    },
    {
      text: "Stacking/unstacking: Stop; set parking brake; square mast; level forks; lift/lower smoothly; do not raise or lower while moving.",
      details: (
        <>
          <p className="font-semibold">Safe Stacking Procedure (OSHA 1910.178(o)(2)):</p>
          <p><strong>Before lifting:</strong></p>
          <ul className="list-disc pl-5 space-y-1 mb-2">
            <li>Come to complete stop</li>
            <li>Set parking brake</li>
            <li>Square the mast (vertical)</li>
            <li>Level the forks (equal height)</li>
            <li>Position forks fully under load</li>
          </ul>
          <p><strong>During lifting:</strong></p>
          <ul className="list-disc pl-5 space-y-1 mb-2">
            <li>Lift smoothly - no jerking motions</li>
            <li>Tilt mast back slightly once load clears rack</li>
            <li>Never raise or lower loads while the truck is moving</li>
            <li>Watch for overhead obstructions</li>
          </ul>
          <p className="text-orange-600 font-medium mt-2">⚠️ Lifting while moving or jerky hydraulic movements can cause loads to shift or fall. Always stop completely before raising/lowering.</p>
        </>
      )
    },
    {
      text: "Pedestrians: Sound horn at intersections; make eye contact; maintain safe separation; pedestrians have right-of-way.",
      details: (
        <>
          <p className="font-semibold">Pedestrian Safety Priority (OSHA 1910.178(n)(4)):</p>
          <p>Pedestrians ALWAYS have the right of way. The forklift operator is responsible for avoiding pedestrian contact under all circumstances.</p>
          <p className="font-semibold mt-2">Safe Pedestrian Practices:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Sound horn:</strong> At ALL intersections, blind corners, doorways, and when approaching pedestrians</li>
            <li><strong>Eye contact:</strong> Make direct eye contact before passing near anyone</li>
            <li><strong>Safe distance:</strong> Maintain at least 3 feet of clearance when passing</li>
            <li><strong>Spotter required:</strong> When visibility is limited or in congested areas</li>
            <li><strong>Stop if uncertain:</strong> If you can't confirm it's safe, stop and wait</li>
          </ul>
          <p className="font-semibold mt-2">Common Pedestrian Hazards:</p>
          <p>Workers wearing headphones, backing out of aisles, focused on tasks, or crossing at non-designated points. Never assume pedestrians see or hear you.</p>
          <p className="text-red-600 font-bold mt-2">⚠️ Pedestrian accidents are often fatal. Defensive driving and constant vigilance are required.</p>
        </>
      )
    },
  ].map((item, index) => ({
    id: item.text.split(':')[0].toLowerCase().replace(/[^a-z0-9]/g, '-'),
    title: item.text.split(':')[0],
    description: item.text.split(':').slice(1).join(':').trim(),
    icon: ['⚖️', '📏', '🔺', '👁️', '⛰️', '📦', '🚶'][index]
  }));

  return (
    <InteractiveChecklist
      title="OSHA 1910.178 — Balance & Load Handling"
      subtitle="Master load stability and safe travel procedures."
      items={checklistItems}
      requireAllChecked={true}
      storageKey="module-3-osha-checklist"
      onComplete={() => {
        console.log('Module 3 OSHA checklist completed');
      }}
    />
  );
}
