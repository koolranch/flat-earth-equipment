export type RawCard = {
  q?: string; a?: string; img?: string;
  question?: string; answer?: string;
  front?: string; back?: string;
};

export type DeckCard = { id: string; front: string; back: string; icon?: string };

export function normalizeFlashCards(cards: RawCard[] | undefined | null): DeckCard[] {
  if (!cards || !Array.isArray(cards)) return [];
  return cards.map((c, index) => ({
    id: `card-${index}`,
    front: c.q ?? c.question ?? c.front ?? '',
    back: c.a ?? c.answer ?? c.back ?? '',
    icon: c.img
  })).filter(c => c.front && c.back);
}
