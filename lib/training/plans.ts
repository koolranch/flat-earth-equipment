export type TrainingPlan = { key: string; title: string; priceText: string; priceId: string; blurb: string };

export const PLANS: TrainingPlan[] = [
  { key: 'single',  title: 'Forklift Certification – Single',              priceText: '$59',    priceId: 'price_1RS834HJI548rO8JpJMyGhL3', blurb: '1 seat for one learner' },
  { key: 'five',    title: 'Forklift Certification – 5 Pack',              priceText: '$275',   priceId: 'price_1RS835HJI548rO8JkMXj7FMQ', blurb: '5 seats for your team' },
  { key: 'twenty5', title: 'Forklift Certification – 25 Pack',             priceText: '$1,375', priceId: 'price_1RS835HJI548rO8JbvRrMwUv', blurb: '25 seats for your team' },
  { key: 'unlim',   title: 'Forklift Certification – Facility Unlimited',  priceText: '$1,999', priceId: 'price_1RS836HJI548rO8JwlCAzg7m', blurb: 'Unlimited seats for one facility' }
];
