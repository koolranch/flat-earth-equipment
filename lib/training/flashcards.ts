// lib/training/flashcards.ts
import type { FlashCard } from '@/components/training/FlashCardDeck';

// Safe function to get locale from browser cookies (client-side only)
function getClientLocale(): 'en' | 'es' {
  if (typeof window === 'undefined') return 'en';
  try {
    const cookie = document.cookie.match(/(?:^|; )locale=([^;]+)/);
    return cookie?.[1] === 'es' ? 'es' : 'en';
  } catch {
    return 'en';
  }
}

// Enhanced function with locale support - 100% backward compatible
export function getModuleFlashcards(slug: string, locale?: 'en' | 'es'): FlashCard[] {
  // Determine locale safely
  const targetLocale = locale || getClientLocale();
  
  // Try to load Spanish content via dynamic import (safe for client-side)
  if (targetLocale === 'es') {
    try {
      // Map module slug to module number
      const moduleMap: Record<string, string> = {
        'module-1': 'm1',
        'module-2': 'm2', 
        'module-3': 'm3',
        'module-4': 'm4',
        'module-5': 'm5'
      };
      
      const moduleNum = moduleMap[slug];
      if (moduleNum) {
        // Try to dynamically require Spanish content
        const spanishContent = require(`@/content/flashcards/${moduleNum}.es.json`);
        if (spanishContent && Array.isArray(spanishContent)) {
          return spanishContent as FlashCard[];
        }
      }
    } catch (error) {
      console.warn(`Spanish flashcards not available for ${slug}, using English:`, error);
    }
  }
  
  // Fallback to existing TypeScript files (preserves all existing functionality)
  switch (slug) {
    case 'module-1': return (require('@/content/training/flashcards/module-1').default as FlashCard[]);
    case 'module-2': return (require('@/content/training/flashcards/module-2').default as FlashCard[]);
    case 'module-3': return (require('@/content/training/flashcards/module-3').default as FlashCard[]);
    case 'module-4': return (require('@/content/training/flashcards/module-4').default as FlashCard[]);
    case 'module-5': return (require('@/content/training/flashcards/module-5').default as FlashCard[]);
    default: return [];
  }
}
