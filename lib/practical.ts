export type PracticalChecklistItem = { id: string; label: string; required?: boolean };
export const DEFAULT_PRACTICAL: PracticalChecklistItem[] = [
  { id: 'preop', label: 'Performs pre-operation inspection correctly', required: true },
  { id: 'seatbelt', label: 'Seatbelt worn and secured before movement', required: true },
  { id: 'forks-low', label: 'Travels with forks low and tilted slightly back', required: true },
  { id: 'horn', label: 'Sounds horn at intersections and blind corners' },
  { id: 'pedestrians', label: 'Maintains safe distance from pedestrians', required: true },
  { id: 'ramps', label: 'Handles ramps/grades correctly (load upgrade)' },
  { id: 'stack', label: 'Stacks/un-stacks smoothly without striking rack' },
  { id: 'shutdown', label: 'Proper shutdown (neutral, brake, forks down, key off, charger, chock)', required: true }
];
