// Stub file for training plans
export const TRAINING_PLANS = {
  basic: {
    id: 'basic',
    name: 'Basic Training',
    price: 99,
    features: ['5 Modules', 'Certificate', 'Support'],
  },
  premium: {
    id: 'premium', 
    name: 'Premium Training',
    price: 199,
    features: ['5 Modules', 'Certificate', 'Priority Support', 'Extra Resources'],
  },
} as const;

export const PLANS = Object.values(TRAINING_PLANS);

export function getTrainingPlans() {
  return Object.values(TRAINING_PLANS);
}
