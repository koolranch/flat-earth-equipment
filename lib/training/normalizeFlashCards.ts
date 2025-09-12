export type RawCard = {
  q?: string; a?: string; img?: string;
  question?: string; answer?: string;
  front?: string; back?: string;
};

export type DeckCard = { q: string; a: string; img?: string };

export function normalizeFlashCards(cards: RawCard[] | undefined | null): DeckCard[] {
  if (!cards || !Array.isArray(cards)) return [];
  return cards.map((c) => ({
    q: c.q ?? c.question ?? c.front ?? '',
    a: c.a ?? c.answer ?? c.back ?? '',
    img: c.img
  })).filter(c => c.q && c.a);
}
