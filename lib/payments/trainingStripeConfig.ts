export const TRAINING_PRICE_IDS = (process.env.TRAINING_PRICE_IDS || '').split(',').map(s=>s.trim()).filter(Boolean);
export const TRAINING_COURSE_SLUG = process.env.TRAINING_COURSE_SLUG || 'forklift';

export function isTrainingPrice(priceId?: string | null) { 
  return !!priceId && TRAINING_PRICE_IDS.includes(priceId); 
}
