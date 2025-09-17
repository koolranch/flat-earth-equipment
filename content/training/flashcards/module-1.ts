// content/training/flashcards/module-1.ts
import type { FlashCard } from '@/components/training/FlashCardDeck';

const cards: FlashCard[] = [
  { 
    id: 1, 
    front: 'Hi-vis vest — when?', 
    back: 'Always on the floor. Improves visibility around moving equipment.'
  },
  { 
    id: 2, 
    front: 'Hard hat — where?', 
    back: 'Any area with overhead guards, racks, or suspended loads.'
  },
  { 
    id: 3, 
    front: 'Safety boots — why?', 
    back: 'Toe protection + slip resistance on dusty/wet warehouse floors.'
  },
  { 
    id: 4, 
    front: 'Eye/Ear protection — when?', 
    back: 'Grinding, battery rooms, loud docks, or as posted by site policy.'
  },
  { 
    id: 5, 
    front: 'Horn test — what are you checking?', 
    back: 'Audible warning works before moving. Use at intersections and blind corners.'
  },
  { 
    id: 6, 
    front: 'Lights test — what must be lit?', 
    back: 'Headlights + rear/blue spot if equipped. Replace failed bulbs before operation.'
  },
  { 
    id: 7, 
    front: 'Data plate — what to verify?', 
    back: 'Rated capacity, mast/attachments, and that it matches your forklift/attachment combo.'
  },
  { 
    id: 8, 
    front: 'Seatbelt — when to latch?', 
    back: 'Before moving. Prevents ejection in tip-overs; stay in the protective zone.'
  }
];

export default cards;
