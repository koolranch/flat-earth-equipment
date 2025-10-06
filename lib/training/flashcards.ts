// lib/training/flashcards.ts
import type { FlashCard } from '@/components/training/FlashCardDeck';
import fs from 'fs';
import path from 'path';

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
  
  // Map module slug to module number for JSON files
  const moduleMap: Record<string, string> = {
    'module-1': 'm1',
    'module-2': 'm2', 
    'module-3': 'm3',
    'module-4': 'm4',
    'module-5': 'm5'
  };
  
  const moduleNum = moduleMap[slug];
  
  // Try to load Spanish JSON files first (if Spanish locale and files exist)
  if (targetLocale === 'es' && moduleNum) {
    try {
      const jsonPath = path.join(process.cwd(), 'content', 'flashcards', `${moduleNum}.es.json`);
      if (fs.existsSync(jsonPath)) {
        const content = fs.readFileSync(jsonPath, 'utf8');
        return JSON.parse(content) as FlashCard[];
      }
    } catch (error) {
      console.warn(`Failed to load Spanish flashcards for ${slug}, falling back to English:`, error);
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
