// content/training/flashcards/module-2.ts
import type { FlashCard } from '@/components/training/FlashCardDeck';
const cards: FlashCard[] = [
  { id: 1, front: 'Forks: what fails inspection?', back: 'Cracks, bends, mismatched pair, missing lock pins, heel wear beyond limit. Replace as a pair.', icon: '/training/flashcards/m2-forks-damage.svg' },
  { id: 2, front: 'Chains: what are you looking for?', back: 'Kinks, tight links, stretch, broken links—proper tension and lubrication required.', icon: '/training/flashcards/m2-chains-hoses.svg' },
  { id: 3, front: 'Hydraulics: OK means…', back: 'No hose damage, no visible leaks, smooth lift/tilt with no jerks or drift.', icon: '/training/flashcards/m2-leaks.svg' },
  { id: 4, front: 'Horn & lights must be…', back: 'Present and functional before moving—horn at blind corners; lights in low visibility.', icon: '/training/flashcards/m1-lights.svg' },
  { id: 5, front: 'Tires/wheels pass if…', back: 'Adequate tread/inflation (pneumatic), no chunks or splits, lugs tight; no damage.', icon: '/training/flashcards/m2-tires.svg' },
  { id: 6, front: 'Data plate present and legible?', back: 'Yes—verify plate matches truck and attachments; do not operate if missing/illegible.', icon: '/training/flashcards/m1-data-plate.svg' },
  { id: 7, front: 'Hydraulic leaks: what to do?', back: 'Stop, tag out, report. Clean spills per procedure; do not operate until repaired.', icon: '/training/flashcards/m2-leaks.svg' },
  { id: 8, front: 'Brakes/steer check includes…', back: 'Service/parking brake engagement, steering responsiveness, no pulling or grinding.', icon: '/training/flashcards/m2-safety-devices.svg' }
];
export default cards;
