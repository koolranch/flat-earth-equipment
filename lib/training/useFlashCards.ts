"use client";
import * React from 'react';

export type DeckCard = { q: string; a: string; img?: string };

export function useFlashCards(moduleKey: string){
  const [cards, setCards] = React.useState<DeckCard[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    fetch(`/flashcards/${moduleKey}.json`, { cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        return r.json();
      })
      .then((data) => { if (!alive) return; setCards(Array.isArray(data) ? data : []); })
      .catch((e) => { if (!alive) return; setError(e.message); setCards([]); })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [moduleKey]);

  return { cards, loading, error };
}
