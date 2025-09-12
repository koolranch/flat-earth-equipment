"use client";
import * as React from 'react';
import { normalizeFlashCards } from './normalizeFlashCards';

export type DeckCard = { id: string; front: string; back: string; icon?: string };

export function useFlashCards(moduleKey: string){
  const [cards, setCards] = React.useState<DeckCard[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!moduleKey) {
      setCards([]);
      setError(null);
      setLoading(false);
      return;
    }
    
    let alive = true;
    setLoading(true);
    setError(null);
    fetch(`/flashcards/${moduleKey}.json`, { cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        return r.json();
      })
      .then((data) => { if (!alive) return; setCards(normalizeFlashCards(data)); })
      .catch((e) => { if (!alive) return; setError(e.message); setCards([]); })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [moduleKey]);

  return { cards, loading, error };
}
