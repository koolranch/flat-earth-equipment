export type RecommendInput = { voltage?: number|null; amps?: number|null; phase?: '1P'|'3P'|null; chemistry?: string|null; limit?: number };
export type RecommendReason = { label: string; weight?: number };
export type RecommendedPart = {
  id: string; slug: string; name: string;
  image_url: string|null; price: string|null; price_cents: number|null; stripe_price_id: string|null; sku: string|null;
  dc_voltage_v?: number|null; dc_current_a?: number|null; input_phase?: '1P'|'3P'|null; chemistry_support?: string[]|null; quick_ship?: boolean|null;
  score: number; reasons: RecommendReason[]; matchType?: 'best'|'alternate';
};
export type RecommendResponse = { 
  ok: true; 
  items: RecommendedPart[]; 
  topPick?: RecommendedPart | null;
  otherBestMatches?: RecommendedPart[];
  alternatives?: RecommendedPart[];
  debug?: any 
} | { 
  ok: false; 
  error: string; 
  hint?: string 
};