export type RecommendInput = {
  voltage?: number | null;
  amps?: number | null; // auto-computed from charge speed, refined by Ah if provided
  phase?: '1P' | '3P' | null;
  chemistry?: string | null; // optional filter: 'lead-acid' | 'lithium' | etc.
  limit?: number;
};

export type RecommendReason = {
  label: string; // e.g., 'Voltage match', 'Overnight charge (~8–12h)', 'Quick ship'
  weight?: number; // optional weight contribution
};

export type RecommendedPart = {
  id: string;
  slug: string;
  name: string;
  image_url: string | null;
  price: string | null;
  price_cents: number | null;
  stripe_price_id: string | null;
  sku: string | null;
  dc_voltage_v?: number | null;
  dc_current_a?: number | null;
  input_phase?: '1P' | '3P' | null;
  chemistry_support?: string[] | null;
  quick_ship?: boolean | null;
  score: number; // total weighted score from backend
  reasons: RecommendReason[]; // short explanation points
  fallback?: boolean; // true when shown as 'closest available'
  matchType: 'best' | 'alternate'; // indicates match quality tier
};

export type RecommendResponse = {
  ok: true;
  items: RecommendedPart[];
  debug?: any; // backend diagnostics if provided
} | { ok: false; error: string };
