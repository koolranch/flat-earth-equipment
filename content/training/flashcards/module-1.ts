// content/training/flashcards/module-1.ts
import type { FlashCard } from '@/components/training/FlashCardDeck';

const cards: FlashCard[] = [
  { 
    id: 1, 
    front: 'Hi-vis vest — when?', 
    back: 'Always on the floor. Improves visibility around moving equipment.',
    icon: '/training/flashcards/m1-hivis-vest.svg'
  },
  { 
    id: 2, 
    front: 'Hard hat — where?', 
    back: 'Any area with overhead guards, racks, or suspended loads.',
    icon: '/training/flashcards/m1-hard-hat.svg'
  },
  { 
    id: 3, 
    front: 'Safety boots — why?', 
    back: 'Toe protection + slip resistance on dusty/wet warehouse floors.',
    icon: '/training/flashcards/m1-safety-boots.svg'
  },
  { 
    id: 4, 
    front: 'Eye/Ear protection — when?', 
    back: 'Grinding, battery rooms, loud docks, or as posted by site policy.'
  },
  { 
    id: 5, 
    front: 'Horn test — what are you checking?', 
    back: 'Audible warning works before moving. Use at intersections and blind corners.',
    icon: '/training/flashcards/m1-horn-test.svg'
  },
  { 
    id: 6, 
    front: 'Lights test — what must be lit?', 
    back: 'Headlights + rear/blue spot if equipped. Replace failed bulbs before operation.',
    icon: '/training/flashcards/m1-lights.svg'
  },
  { 
    id: 7, 
    front: 'Data plate — what to verify?', 
    back: 'Rated capacity, mast/attachments, and that it matches your forklift/attachment combo.',
    icon: '/training/flashcards/m1-data-plate.svg'
  },
  { 
    id: 8, 
    front: 'Seatbelt — when to latch?', 
    back: 'Before moving. Prevents ejection in tip-overs; stay in the protective zone.',
    icon: '/training/flashcards/m1-seatbelt.svg'
  }
];

export default cards;
