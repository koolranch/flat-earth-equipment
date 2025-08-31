/**
 * Module Registry for Forklift Certification Training
 * Defines the complete training flow with demos, guides, and quizzes
 */

export type ModuleDef = {
  order: number;
  slug: string;
  title: string;
  demoKey: 'MiniPPE' | 'HotspotsEight' | 'StabilityLite' | 'HazardHunt';
  guidesSlug: string; // for /api/guides/[slug]
  quizSlug: string;   // for /api/quiz/[slug]
  estMin: number;
  description?: string;
  objectives?: string[];
};

export const MODULES: ModuleDef[] = [
  {
    order: 1,
    slug: 'pre-operation-inspection',
    title: 'Pre-Operation Inspection',
    demoKey: 'MiniPPE',
    guidesSlug: 'pre-operation-inspection',
    quizSlug: 'pre-operation-inspection',
    estMin: 8,
    description: 'Learn essential PPE and pre-operation safety checks',
    objectives: [
      'Understand proper PPE sequence',
      'Complete pre-operation safety checklist',
      'Identify critical safety components'
    ]
  },
  {
    order: 2,
    slug: 'eight-point-inspection',
    title: '8-Point Inspection',
    demoKey: 'HotspotsEight',
    guidesSlug: 'eight-point-inspection',
    quizSlug: 'eight-point-inspection',
    estMin: 8,
    description: 'Master the daily 8-point safety inspection checklist',
    objectives: [
      'Complete all 8 inspection points',
      'Identify potential safety hazards',
      'Understand inspection criteria for each point'
    ]
  },
  {
    order: 3,
    slug: 'balance-load-handling',
    title: 'Balance & Load Handling',
    demoKey: 'StabilityLite',
    guidesSlug: 'balance-load-handling',
    quizSlug: 'balance-load-handling',
    estMin: 10,
    description: 'Understand stability principles and safe load handling',
    objectives: [
      'Learn the stability triangle concept',
      'Practice load capacity calculations',
      'Understand center of gravity effects'
    ]
  },
  {
    order: 4,
    slug: 'hazard-hunt',
    title: 'Hazard Hunt',
    demoKey: 'HazardHunt',
    guidesSlug: 'hazard-hunt',
    quizSlug: 'hazard-hunt',
    estMin: 8,
    description: 'Identify and respond to workplace hazards',
    objectives: [
      'Recognize common workplace hazards',
      'Understand proper hazard response procedures',
      'Practice situational awareness skills'
    ]
  }
];

/**
 * Get module definition by slug
 */
export function getModuleBySlug(slug: string): ModuleDef | null {
  return MODULES.find(m => m.slug === slug) || null;
}

/**
 * Get module definition by order number
 */
export function getModuleByOrder(order: number): ModuleDef | null {
  return MODULES.find(m => m.order === order) || null;
}

/**
 * Get next module in sequence
 */
export function getNextModule(currentSlug: string): ModuleDef | null {
  const current = getModuleBySlug(currentSlug);
  if (!current) return null;
  return getModuleByOrder(current.order + 1);
}

/**
 * Get previous module in sequence
 */
export function getPreviousModule(currentSlug: string): ModuleDef | null {
  const current = getModuleBySlug(currentSlug);
  if (!current) return null;
  return getModuleByOrder(current.order - 1);
}

/**
 * Get all modules in order
 */
export function getAllModules(): ModuleDef[] {
  return [...MODULES].sort((a, b) => a.order - b.order);
}

/**
 * Check if a module exists
 */
export function moduleExists(slug: string): boolean {
  return MODULES.some(m => m.slug === slug);
}
