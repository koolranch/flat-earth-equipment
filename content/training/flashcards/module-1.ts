// content/training/flashcards/module-1.ts
import type { FlashCard } from '@/components/training/FlashCardDeck';

const cards: FlashCard[] = [
  { 
    id: 1, 
    front: 'Hi-vis vest — when?', 
    back: 'Always on the floor. Improves visibility around moving equipment.',
    img: <img src="/training/icons/icon-ppe-vest.svg" alt="Hi-vis vest" className="w-16 h-16 object-contain" />
  },
  { 
    id: 2, 
    front: 'Hard hat — where?', 
    back: 'Any area with overhead guards, racks, or suspended loads.',
    img: <img src="/training/icons/icon-ppe-hardhat.svg" alt="Hard hat" className="w-16 h-16 object-contain" />
  },
  { 
    id: 3, 
    front: 'Safety boots — why?', 
    back: 'Toe protection + slip resistance on dusty/wet warehouse floors.',
    img: <img src="/training/icons/icon-ppe-boots.svg" alt="Safety boots" className="w-16 h-16 object-contain" />
  },
  { 
    id: 4, 
    front: 'Eye/Ear protection — when?', 
    back: 'Grinding, battery rooms, loud docks, or as posted by site policy.',
    img: <img src="/training/icons/icon-ppe-goggles.svg" alt="Eye protection" className="w-16 h-16 object-contain" />
  },
  { 
    id: 5, 
    front: 'Horn test — what are you checking?', 
    back: 'Audible warning works before moving. Use at intersections and blind corners.',
    img: <img src="/training/icons/icon-control-horn.svg" alt="Horn control" className="w-16 h-16 object-contain" />
  },
  { 
    id: 6, 
    front: 'Lights test — what must be lit?', 
    back: 'Headlights + rear/blue spot if equipped. Replace failed bulbs before operation.',
    img: <img src="/training/icons/icon-control-lights.svg" alt="Lights control" className="w-16 h-16 object-contain" />
  },
  { 
    id: 7, 
    front: 'Data plate — what to verify?', 
    back: 'Rated capacity, mast/attachments, and that it matches your forklift/attachment combo.',
    img: <img src="/training/icons/inspect-data-plate.svg" alt="Data plate" className="w-16 h-16 object-contain" />
  },
  { 
    id: 8, 
    front: 'Seatbelt — when to latch?', 
    back: 'Before moving. Prevents ejection in tip-overs; stay in the protective zone.',
    img: <img src="/training/anim/D1_seatbelt.svg" alt="Seatbelt" className="w-16 h-16 object-contain" />
  }
];

export default cards;
