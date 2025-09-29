// Stub file for training plans
export const TRAINING_PLANS = {
  basic: {
    id: 'basic',
    key: 'basic',
    name: 'Basic Training',
    title: 'Basic Training',
    price: 99,
    priceText: '$99',
    priceId: 'price_basic_training',
    blurb: 'Essential forklift operator training',
    features: ['5 Modules', 'Certificate', 'Support'],
  },
  premium: {
    id: 'premium',
    key: 'premium', 
    name: 'Premium Training',
    title: 'Premium Training',
    price: 199,
    priceText: '$199',
    priceId: 'price_premium_training',
    blurb: 'Comprehensive training with extra support',
    features: ['5 Modules', 'Certificate', 'Priority Support', 'Extra Resources'],
  },
} as const;

export const PLANS = Object.values(TRAINING_PLANS);

export function getTrainingPlans() {
  return Object.values(TRAINING_PLANS);
}
