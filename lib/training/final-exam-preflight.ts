// Stub file for final exam preflight
export async function checkExamEligibility(userId: string): Promise<boolean> {
  return true;
}

export async function examPreflight(userId?: string): Promise<{ eligible: boolean; reason?: string; settings: any; moduleSlugs: string[]; quizBySlug: any; orphanSlugs: string[]; counts: any; sampleIds: any[] }> {
  const eligible = userId ? await checkExamEligibility(userId) : true;
  return { 
    eligible, 
    settings: {
      minimumModulesCompleted: 5,
      requiredScore: 80,
      examEnabled: true
    },
    moduleSlugs: ['intro', 'inspection', 'safety', 'hazards', 'operations'],
    quizBySlug: {
      'intro': { count: 5 },
      'inspection': { count: 8 },
      'safety': { count: 10 },
      'hazards': { count: 12 },
      'operations': { count: 8 }
    },
    orphanSlugs: [],
    counts: {
      totalQuestions: 43,
      moduleQuestions: 43,
      orphanQuestions: 0
    },
    sampleIds: ['q1', 'q2', 'q3', 'q4', 'q5']
  };
}

export function getExamRequirements() {
  return {
    minimumModulesCompleted: 5,
    requiredScore: 80,
  };
}
