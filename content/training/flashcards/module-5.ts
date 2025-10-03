// content/training/flashcards/module-5.ts
import type { FlashCard } from '@/components/training/FlashCardDeck';
const cards: FlashCard[] = [
  { id: 1, front: 'Shutdown steps, in order?', back: 'Neutral → Steer straight → Parking brake → Forks down → Key off → Connect charger → Wheel chock.', icon: '/training/flashcards/m5-shutdown.svg' },
  { id: 2, front: 'Why chock the wheel?', back: 'Prevents unintended movement during parking/charging; required in many dock areas.', icon: '/training/flashcards/m5-parking.svg' },
  { id: 3, front: 'Charging safety basics?', back: 'No smoking/open flames; vent caps in place; PPE; eyewash nearby; good ventilation.', icon: '/training/flashcards/m5-charging-area.svg' },
  { id: 4, front: 'Battery connections—what to check?', back: 'Cables intact, connectors clean/secure; connect charger only with key off and truck secured.', icon: '/training/flashcards/m5-charger-connect.svg' },
  { id: 5, front: 'After charging…', back: 'Disconnect properly; coil cables; inspect area; update logs as required.', icon: '/training/flashcards/m5-charger-connect.svg' },
  { id: 6, front: 'When do you tag out instead of parking?', back: 'Any critical defect (brakes, steering, hydraulics, forks, guards). Remove from service and report.', icon: '/training/flashcards/m2-safety-devices.svg' }
];
export default cards;
