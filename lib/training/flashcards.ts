// lib/training/flashcards.ts
import type { FlashCard } from '@/components/training/FlashCardDeck';

export function getModuleFlashcards(slug: string): FlashCard[] {
  switch (slug) {
    case 'module-1': return (require('@/content/training/flashcards/module-1').default as FlashCard[]);
    case 'module-2': return (require('@/content/training/flashcards/module-2').default as FlashCard[]);
    case 'module-3': return (require('@/content/training/flashcards/module-3').default as FlashCard[]);
    case 'module-4': return (require('@/content/training/flashcards/module-4').default as FlashCard[]);
    case 'module-5': return (require('@/content/training/flashcards/module-5').default as FlashCard[]);
    default: return [];
  }
}
