// content/training/flashcards/module-1.ts
import type { FlashCard } from '@/components/training/FlashCardDeck';
const cards: FlashCard[] = [
  { id: 1, front: 'When must a hi-vis vest be worn?', back: 'On the floor, yard, or dock—anywhere equipment is moving. Keep it zipped/visible per site rules.' },
  { id: 2, front: 'Seat belt: why always buckle in?', back: 'Prevents ejection during tip-overs and keeps you within the overhead guard protective zone.' },
  { id: 3, front: 'Before start: what PPE items are required?', back: 'Hi-vis vest, hard hat (site dependent), eye/foot protection, hearing protection in noisy areas.' },
  { id: 4, front: 'Data plate—what do you verify?', back: 'Capacity, attachments, lift height. Plate present/legible. Never exceed the rated capacity.' },
  { id: 5, front: 'Key "no-go" findings before operation?', back: 'Cracked forks, leaking hydraulics, missing guards, no horn/lights, faulty brakes—tag out and report.' },
  { id: 6, front: 'Where should forks be during travel without a load?', back: 'Low to the ground and level, with mast slightly back when loaded; never travel with elevated forks.' }
];
export default cards;
