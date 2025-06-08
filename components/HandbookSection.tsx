import { useState } from 'react'
import Link from 'next/link'

interface HandbookSectionProps {
  moduleOrder: number
  moduleTitle: string
}

export default function HandbookSection({ moduleOrder, moduleTitle }: HandbookSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Map module order to handbook content
  const getHandbookContent = (order: number) => {
    switch (order) {
      case 1:
        return {
          title: "Course Introduction & Overview",
          sections: [
            {
              title: "Training Purpose",
              items: [
                "OSHA-compliant forklift operator certification",
                "Safety compliance per 29 CFR 1910.178",
                "Workplace accident prevention",
                "Professional skill development"
              ]
            },
            {
              title: "Course Structure",
              items: [
                "Interactive video lessons and demos",
                "Hands-on training simulations",
                "Knowledge assessment quizzes",
                "Real-world scenario practice"
              ]
            },
            {
              title: "Certification Requirements",
              items: [
                "Complete all 5 training modules",
                "Pass all module quizzes (80% minimum)",
                "Demonstrate practical competency",
                "Maintain 3-year certification validity"
              ]
            }
          ]
        }
      case 2:
        return {
          title: "Pre-Operation Inspection Guide",
          sections: [
            {
              title: "PPE Requirements",
              items: [
                "Hard hat - ANSI Z89.1 Type I, Class C minimum",
                "High-visibility vest - ANSI/ISEA 107 Class 2 or 3",
                "Steel-toed boots - ASTM F2413 protection",
                "Safety glasses - ANSI Z87.1 impact rated"
              ]
            },
            {
              title: "Control Familiarization",
              items: [
                "Direction control lever (forward/neutral/reverse)",
                "Lift/lower controls for mast operation",
                "Tilt controls (forward/back)",
                "Service brake and parking brake location"
              ]
            },
            {
              title: "Pre-Operation Checklist",
              items: [
                "Check fluid levels (hydraulic, engine oil)",
                "Inspect tires for damage and proper inflation",
                "Test steering and braking systems",
                "Verify load backrest and overhead guard"
              ]
            }
          ]
        }
      case 3:
        return {
          title: "8-Point Daily Inspection",
          sections: [
            {
              title: "8 Critical Inspection Points",
              items: [
                "1. Tires - Check for cuts, wear, proper inflation",
                "2. Forks - Inspect for cracks, heel wear, straightness", 
                "3. Mast chains - Look for dry links, kinks, damage",
                "4. Hydraulics - Check for leaks on cylinder rods",
                "5. Battery - Inspect terminals, electrolyte levels",
                "6. Overhead guard - Check for bent posts, cracks",
                "7. Seat-belt - Test latch function, check webbing",
                "8. Data plate - Ensure present and legible"
              ]
            },
            {
              title: "Tag-Out Procedures",
              items: [
                "Remove forklift from service immediately",
                "Remove key from ignition",
                "Attach orange 'DO NOT OPERATE' tag",
                "Complete detailed defect report",
                "Notify supervisor and maintenance"
              ]
            }
          ]
        }
      case 4:
        return {
          title: "Operating Procedures & Load Handling",
          sections: [
            {
              title: "Capacity Plate Information",
              items: [
                "Maximum load weight at 24-inch load center",
                "Attachment weight restrictions",
                "Load center distance limitations",
                "Maximum lift height specifications"
              ]
            },
            {
              title: "Stability Triangle Principles",
              items: [
                "Front axle and rear wheels form stability triangle",
                "Load center affects tip-over point",
                "Elevated loads reduce stability",
                "Turn radius increases instability"
              ]
            },
            {
              title: "Safe Operating Speeds",
              items: [
                "Loaded travel: 3-5 mph maximum",
                "Unloaded travel: 5-8 mph maximum", 
                "Pedestrian areas: Walking speed only",
                "Ramps and inclines: 3 mph maximum"
              ]
            }
          ]
        }
      case 5:
        return {
          title: "Hazard Recognition & Safety",
          sections: [
            {
              title: "Pedestrian Safety Distances",
              items: [
                "Walking pedestrians: 10 feet minimum",
                "Working personnel: 15 feet minimum",
                "Groups of people: 20 feet minimum",
                "Children/visitors: 25 feet minimum"
              ]
            },
            {
              title: "Common Workplace Hazards",
              items: [
                "Liquid spills of any size",
                "Damaged pallets with protruding nails",
                "Overhead obstacles and low clearances",
                "Poor lighting and blind corners",
                "Blocked emergency exits",
                "Unstable or shifting loads"
              ]
            },
            {
              title: "Emergency Procedures",
              items: [
                "Stop operation immediately when hazard spotted",
                "Sound horn to warn others in area",
                "Block access to prevent others from entering",
                "Report hazard to supervisor immediately"
              ]
            }
          ]
        }
      case 6:
        return {
          title: "Shutdown & Advanced Operations",
          sections: [
            {
              title: "Proper Shutdown Sequence",
              items: [
                "1. Shift to NEUTRAL (first step)",
                "2. Set parking brake firmly",
                "3. Lower forks completely to ground",
                "4. Turn key off and remove",
                "5. Connect charger (electric) or refuel",
                "6. Chock wheels if on slope"
              ]
            },
            {
              title: "Battery Charging PPE",
              items: [
                "Rubber insulating gloves - electrical protection",
                "Face shield - acid splash protection", 
                "Nitrile gloves - chemical burn prevention",
                "Acid-resistant apron - clothing protection"
              ]
            },
            {
              title: "Cold Weather Procedures",
              items: [
                "Allow 10-15 minute warm-up period",
                "Check hydraulic fluid consistency",
                "Test braking effectiveness on ice",
                "Reduce operating speeds by 50%"
              ]
            }
          ]
        }
      default:
        return null
    }
  }

  const handbookContent = getHandbookContent(moduleOrder)
  
  if (!handbookContent) return null

  return (
    <div className="mb-4 border border-blue-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div className="text-left">
            <h4 className="font-medium text-blue-900">{handbookContent.title}</h4>
            <p className="text-sm text-blue-700">Reference guide for {moduleTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link 
            href={`/handbooks/${moduleOrder}-${moduleTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.mdx`}
            target="_blank"
            onClick={(e) => e.stopPropagation()}
            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
          >
            Download PDF
          </Link>
          <svg 
            className={`w-5 h-5 text-blue-600 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {isExpanded && (
        <div className="p-4 bg-white border-t border-blue-200">
          <div className="space-y-4">
            {handbookContent.sections.map((section, index) => (
              <div key={index}>
                <h5 className="font-semibold text-gray-900 mb-2">{section.title}</h5>
                <ul className="space-y-1">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-blue-600 mt-1.5 w-1 h-1 bg-current rounded-full flex-shrink-0"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              💡 <strong>Tip:</strong> Review this content before starting the interactive demo, then refer back as needed during practice.
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 