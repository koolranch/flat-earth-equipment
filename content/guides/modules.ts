export const moduleGuides: Record<string, { title: string; guides: { title: string; items: string[]; cite?: string }[] }> = {
  'pre-operation-inspection': {
    title: 'Pre-operation Inspection',
    guides: [
      { 
        title: 'What good looks like', 
        items: [
          'PPE on: hi-vis vest, hard hat, seat belt fastened',
          'Forks lowered, brake set, wheel chocks if required',
          'Data plate legible; no visible leaks or damage'
        ], 
        cite: '§1910.178(l)(1),(l)(3)' 
      },
      { 
        title: 'Common violations', 
        items: [
          'Skipping checks under time pressure',
          'Operating with leaks or damaged chains',
          'Seat belt not used'
        ] 
      },
      { 
        title: 'Stop-work triggers', 
        items: [
          'Hydraulic leak, cracked forks, chain defects',
          'Inoperative horn/lights/brake',
          'Illegible/missing data plate'
        ], 
        cite: '§1910.178(p),(q)' 
      }
    ]
  },
  'eight-point-inspection': {
    title: 'Daily Inspection (8-point)',
    guides: [
      { 
        title: 'What good looks like', 
        items: [
          'Tires inflated/no major damage',
          'Chains/hydraulics intact; no leaks',
          'Controls/horn operate; battery/LP secure'
        ], 
        cite: '§1910.178(q)' 
      },
      { 
        title: 'Common violations', 
        items: [
          'Ignoring small leaks', 
          'Running with warning lights on', 
          'Loose LP tank/battery hold-down'
        ] 
      },
      { 
        title: 'Stop-work triggers', 
        items: [
          'Any fluid leak', 
          'Brake issues', 
          'Loose/unsafe attachments'
        ] 
      }
    ]
  },
  'balance-load-handling': {
    title: 'Balance & Load Handling',
    guides: [
      { 
        title: 'What good looks like', 
        items: [
          'Know rated capacity (@ 24" load center typical)',
          'Keep load low; mast tilted back when traveling',
          'Center of gravity inside stability triangle'
        ], 
        cite: '§1910.178(o)' 
      },
      { 
        title: 'Common violations', 
        items: [
          'Overhanging/uneven loads', 
          'Turning with raised load', 
          'Load center too far out'
        ] 
      },
      { 
        title: 'Stop-work triggers', 
        items: [
          'Capacity exceeded', 
          'Unstable/shifted load', 
          'Obstructed view with no spotter'
        ] 
      }
    ]
  },
  'hazard-hunt': {
    title: 'Hazard Recognition',
    guides: [
      { 
        title: 'What good looks like', 
        items: [
          'Sound horn at intersections/doorways', 
          'Yield to pedestrians', 
          'Respect speed/ramps'
        ], 
        cite: '§1910.178(n)' 
      },
      { 
        title: 'Common violations', 
        items: [
          'Blind corners without horn', 
          'Pedestrian proximity', 
          'Wet floors/obstacles'
        ] 
      },
      { 
        title: 'Stop-work triggers', 
        items: [
          'Blocked/unsafe aisle', 
          'Spill not contained', 
          'Pedestrians in high-risk zone'
        ] 
      }
    ]
  },
  'shutdown-sequence': {
    title: 'Shutdown Sequence',
    guides: [
      { 
        title: 'What good looks like', 
        items: [
          'Neutral → parking brake → forks down',
          'Key off; LPG closed or charger plugged',
          'Truck parked out of traffic'
        ], 
        cite: '§1910.178(m)' 
      },
      { 
        title: 'Common violations', 
        items: [
          'Leaving forks raised', 
          'Not setting brake', 
          'Not plugging in charger'
        ] 
      },
      { 
        title: 'Stop-work triggers', 
        items: [
          'Inability to secure truck', 
          'Parking in pedestrian/door area'
        ] 
      }
    ]
  }
};
