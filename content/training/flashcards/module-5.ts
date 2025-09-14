// content/training/flashcards/module-5.ts
import type { FlashCard } from '@/components/training/FlashCardDeck';
const cards: FlashCard[] = [
  { id: 1, front: 'Shutdown steps, in order?', back: 'Neutral → Steer straight → Parking brake → Forks down → Key off → Connect charger → Wheel chock.' },
  { id: 2, front: 'Why chock the wheel?', back: 'Prevents unintended movement during parking/charging; required in many dock areas.' },
  { id: 3, front: 'Charging safety basics?', back: 'No smoking/open flames; vent caps in place; PPE; eyewash nearby; good ventilation.' },
  { id: 4, front: 'Battery connections—what to check?', back: 'Cables intact, connectors clean/secure; connect charger only with key off and truck secured.' },
  { id: 5, front: 'After charging…', back: 'Disconnect properly; coil cables; inspect area; update logs as required.' },
  { id: 6, front: 'When do you tag out instead of parking?', back: 'Any critical defect (brakes, steering, hydraulics, forks, guards). Remove from service and report.' }
];
export default cards;
