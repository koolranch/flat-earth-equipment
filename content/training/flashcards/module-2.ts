// content/training/flashcards/module-2.ts
import type { FlashCard } from '@/components/training/FlashCardDeck';
const cards: FlashCard[] = [
  { id: 1, front: 'Forks: what fails inspection?', back: 'Cracks, bends, mismatched pair, missing lock pins, heel wear beyond limit. Replace as a pair.' },
  { id: 2, front: 'Chains: what are you looking for?', back: 'Kinks, tight links, stretch, broken links—proper tension and lubrication required.' },
  { id: 3, front: 'Hydraulics: OK means…', back: 'No hose damage, no visible leaks, smooth lift/tilt with no jerks or drift.' },
  { id: 4, front: 'Horn & lights must be…', back: 'Present and functional before moving—horn at blind corners; lights in low visibility.' },
  { id: 5, front: 'Tires/wheels pass if…', back: 'Adequate tread/inflation (pneumatic), no chunks or splits, lugs tight; no damage.' },
  { id: 6, front: 'Data plate present and legible?', back: 'Yes—verify plate matches truck and attachments; do not operate if missing/illegible.' },
  { id: 7, front: 'Hydraulic leaks: what to do?', back: 'Stop, tag out, report. Clean spills per procedure; do not operate until repaired.' },
  { id: 8, front: 'Brakes/steer check includes…', back: 'Service/parking brake engagement, steering responsiveness, no pulling or grinding.' }
];
export default cards;
