// content/training/flashcards/module-4.ts
import type { FlashCard } from '@/components/training/FlashCardDeck';
const cards: FlashCard[] = [
  { id: 1, front: 'Approaching a blind corner?', back: 'Slow/stop, sound horn, creep into sight line; use mirrors if installed; expect pedestrians.', icon: '/training/flashcards/m3-blind-corner.svg' },
  { id: 2, front: 'Pedestrian priority means…', back: 'Pedestrians always have the right of way. Keep eye contact; never assume they see you.', icon: '/training/flashcards/m3-pedestrian-priority.svg' },
  { id: 3, front: 'Spill on the floor—action?', back: 'Stop, mark/guard the area, report/clean per procedure before resuming operations.', icon: '/training/flashcards/m4-spill.svg' },
  { id: 4, front: 'Overhead obstacles—control?', back: 'Know truck height with mast/forks; look up; travel slow in low-clearance areas.', icon: '/training/flashcards/m4-overhead-obstruction.svg' },
  { id: 5, front: 'Speed management in aisles?', back: 'Adjust for conditions: congestion, visibility, floor condition, and load. No fast turns.', icon: '/training/flashcards/m4-speed-zone.svg' },
  { id: 6, front: 'Unstable/tilted pallet on rack?', back: 'Do not move under it. Secure or rework load; tag out the location if needed.', icon: '/training/flashcards/m4-unstable-load.svg' }
];
export default cards;
