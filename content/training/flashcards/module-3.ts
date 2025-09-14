// content/training/flashcards/module-3.ts
import type { FlashCard } from '@/components/training/FlashCardDeck';
const cards: FlashCard[] = [
  { id: 1, front: 'What is the stability triangle?', back: 'The triangle formed by the two front wheels and rear axle pivot. Keep the combined COG inside it.' },
  { id: 2, front: 'Load center—why it matters?', back: 'Further from the heel = less capacity. Keep loads tight to the carriage; respect rated load center.' },
  { id: 3, front: 'Best travel position with a load?', back: 'Forks low; mast slightly tilted back; look in the direction of travel.' },
  { id: 4, front: 'Going upslope with a load?', back: 'Drive forward uphill with load upgrade; downhill with load downgrade in reverse.' },
  { id: 5, front: 'Turning with elevated loads?', back: 'Avoid—high tip-over risk. Lower before turning; slow, smooth steering only.' },
  { id: 6, front: 'Stacking basics?', back: 'Square up; level forks; raise to height; inch forward; lower to rest; back out straight; lower forks to travel.' }
];
export default cards;
