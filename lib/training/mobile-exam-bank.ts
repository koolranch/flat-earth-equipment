export type MobileExamAnswer = {
  questionId: string;
  optionId: string;
};

export type MobileExamQuestionResult = {
  questionId: string;
  selectedOptionId: string;
  correctOptionId: string;
  isCorrect: boolean;
};

export type MobileExamGradeResult = {
  score: number;
  passed: boolean;
  correctCount: number;
  totalCount: number;
  questionResults: MobileExamQuestionResult[];
};

type MobileExamQuestionDefinition = {
  id: string;
  order: number;
  category: string;
  question: string;
  explanation: string;
  options: Array<{ id: string; text: string; is_correct: boolean }>;
};

const PASS_SCORE = 80;

const MOBILE_EXAM_QUESTIONS: MobileExamQuestionDefinition[] = [
  { id: 'e1', order: 1, category: 'Pre-Operation Inspection', question: 'According to OSHA 1910.178, how often must a forklift be inspected?', options: [{ id: 'a', text: 'Once a week', is_correct: false }, { id: 'b', text: 'Before each shift or use', is_correct: true }, { id: 'c', text: 'Once a month', is_correct: false }, { id: 'd', text: 'Only after an incident', is_correct: false }], explanation: 'OSHA 1910.178(q)(7) requires industrial trucks to be examined before being placed in service and defective trucks shall not be used.' },
  { id: 'e2', order: 2, category: 'Pre-Operation Inspection', question: 'Which condition would require a forklift to be immediately removed from service?', options: [{ id: 'a', text: 'Dusty exterior', is_correct: false }, { id: 'b', text: 'Minor paint scratches', is_correct: false }, { id: 'c', text: 'Hydraulic fluid leak from the lift cylinder', is_correct: true }, { id: 'd', text: 'Faded warning labels', is_correct: false }], explanation: 'Hydraulic leaks can cause sudden loss of lift function, creating an imminent hazard. The truck must be removed from service immediately.' },
  { id: 'e3', order: 3, category: 'Pre-Operation Inspection', question: 'What is the primary purpose of the overhead guard on a forklift?', options: [{ id: 'a', text: 'To protect against sun and rain', is_correct: false }, { id: 'b', text: 'To protect the operator from falling objects', is_correct: true }, { id: 'c', text: 'To mount warning lights', is_correct: false }, { id: 'd', text: 'To improve aerodynamics', is_correct: false }], explanation: 'The overhead guard is designed to protect the operator from falling objects, though it cannot protect against every impact.' },
  { id: 'e4', order: 4, category: 'Pre-Operation Inspection', question: 'Who is authorized to make repairs to a forklift?', options: [{ id: 'a', text: 'Any operator who identifies the problem', is_correct: false }, { id: 'b', text: 'The shift supervisor', is_correct: false }, { id: 'c', text: 'Only qualified and authorized maintenance personnel', is_correct: true }, { id: 'd', text: 'The operator and a spotter working together', is_correct: false }], explanation: 'OSHA requires that only trained, qualified maintenance personnel make repairs to prevent introducing new hazards.' },
  { id: 'e5', order: 5, category: 'Pre-Operation Inspection', question: 'During a pre-operation inspection, you discover the backup alarm is not functioning. What should you do?', options: [{ id: 'a', text: 'Proceed with caution and extra mirrors', is_correct: false }, { id: 'b', text: 'Have a spotter walk behind you all day', is_correct: false }, { id: 'c', text: 'Tag the forklift out of service and report it', is_correct: true }, { id: 'd', text: 'Only use the forklift for forward travel', is_correct: false }], explanation: 'A non-functional backup alarm is a safety defect. The forklift must be tagged out and repaired before use.' },
  { id: 'e6', order: 6, category: '8-Point Inspection', question: 'What is the correct sequence for a walk-around inspection?', options: [{ id: 'a', text: 'Start anywhere and check what you remember', is_correct: false }, { id: 'b', text: 'Follow a systematic pattern covering all 8 inspection points', is_correct: true }, { id: 'c', text: 'Only check the items that failed last time', is_correct: false }, { id: 'd', text: 'Start the engine first, then inspect while idling', is_correct: false }], explanation: 'A systematic inspection ensures no critical components are missed. Follow the same pattern every time.' },
  { id: 'e7', order: 7, category: '8-Point Inspection', question: 'When testing the service brakes, the forklift should:', options: [{ id: 'a', text: 'Stop within a reasonable distance at normal travel speed', is_correct: true }, { id: 'b', text: 'Only be tested at full speed', is_correct: false }, { id: 'c', text: 'Lock up completely when applied', is_correct: false }, { id: 'd', text: 'Only work when the engine is at full RPM', is_correct: false }], explanation: 'Service brakes should stop the forklift smoothly and within a reasonable distance. Locking up indicates a problem.' },
  { id: 'e8', order: 8, category: '8-Point Inspection', question: 'Which of the following is NOT typically part of an 8-point inspection?', options: [{ id: 'a', text: 'Checking tire condition', is_correct: false }, { id: 'b', text: 'Testing the horn', is_correct: false }, { id: 'c', text: 'Measuring the warehouse temperature', is_correct: true }, { id: 'd', text: 'Inspecting hydraulic hoses', is_correct: false }], explanation: 'Warehouse temperature is an environmental factor, not part of the vehicle inspection.' },
  { id: 'e9', order: 9, category: '8-Point Inspection', question: 'Chains and cables on the mast should be inspected for:', options: [{ id: 'a', text: 'Color consistency', is_correct: false }, { id: 'b', text: 'Wear, damage, and proper lubrication', is_correct: true }, { id: 'c', text: 'Brand markings', is_correct: false }, { id: 'd', text: 'Length only', is_correct: false }], explanation: 'Worn or damaged chains can break under load. Proper lubrication prevents premature wear.' },
  { id: 'e10', order: 10, category: '8-Point Inspection', question: 'The parking brake on a forklift should hold the truck:', options: [{ id: 'a', text: 'Only on flat surfaces', is_correct: false }, { id: 'b', text: 'On an incline or ramp with or without a load', is_correct: true }, { id: 'c', text: 'Only when the engine is running', is_correct: false }, { id: 'd', text: 'Only in designated parking areas', is_correct: false }], explanation: 'The parking brake must hold the forklift stationary on slopes to prevent rollaway incidents.' },
  { id: 'e11', order: 11, category: 'Balance & Load Handling', question: 'The stability triangle of a counterbalanced forklift is formed by:', options: [{ id: 'a', text: 'The three points of the overhead guard', is_correct: false }, { id: 'b', text: 'The two front axle ends and the rear axle pivot point', is_correct: true }, { id: 'c', text: 'The forks and the counterweight', is_correct: false }, { id: 'd', text: 'The operator, the load, and the ground', is_correct: false }], explanation: 'The stability triangle is formed by the two front wheel ground contact points and the rear axle pivot.' },
  { id: 'e12', order: 12, category: 'Balance & Load Handling', question: 'What effect does raising a load have on forklift stability?', options: [{ id: 'a', text: 'No effect on stability', is_correct: false }, { id: 'b', text: 'It raises the center of gravity, decreasing stability', is_correct: true }, { id: 'c', text: 'It increases stability by moving weight upward', is_correct: false }, { id: 'd', text: 'It only affects fuel consumption', is_correct: false }], explanation: 'A higher center of gravity makes the forklift more prone to tipping, especially during turns.' },
  { id: 'e13', order: 13, category: 'Balance & Load Handling', question: 'The rated capacity on a forklift data plate assumes a load center of:', options: [{ id: 'a', text: '12 inches', is_correct: false }, { id: 'b', text: '24 inches', is_correct: true }, { id: 'c', text: '36 inches', is_correct: false }, { id: 'd', text: '48 inches', is_correct: false }], explanation: 'Standard load center is 24 inches from the fork face. Longer loads reduce effective capacity.' },
  { id: 'e14', order: 14, category: 'Balance & Load Handling', question: 'When traveling with a load on a ramp, the load should face:', options: [{ id: 'a', text: 'Downhill always', is_correct: false }, { id: 'b', text: 'Uphill always', is_correct: true }, { id: 'c', text: 'Sideways on the ramp', is_correct: false }, { id: 'd', text: 'It does not matter', is_correct: false }], explanation: 'The load faces uphill to prevent it from sliding off the forks due to gravity.' },
  { id: 'e15', order: 15, category: 'Balance & Load Handling', question: 'If a load is too wide for the forks, the operator should:', options: [{ id: 'a', text: 'Spread the forks as wide as possible and proceed', is_correct: false }, { id: 'b', text: 'Refuse to move the load until proper equipment or assistance is provided', is_correct: true }, { id: 'c', text: 'Tilt the mast forward to grip the load', is_correct: false }, { id: 'd', text: 'Drive slowly and it will be fine', is_correct: false }], explanation: 'Moving improperly sized loads creates instability. Use appropriate attachments or equipment.' },
  { id: 'e16', order: 16, category: 'Hazard Awareness', question: 'What is the minimum safe distance a forklift should maintain from a pedestrian?', options: [{ id: 'a', text: '1 foot', is_correct: false }, { id: 'b', text: '2 feet', is_correct: false }, { id: 'c', text: 'At least 4 feet or as specified by facility rules', is_correct: true }, { id: 'd', text: 'No minimum is specified', is_correct: false }], explanation: 'Maintaining adequate distance allows reaction time. Many facilities require at least 4 feet.' },
  { id: 'e17', order: 17, category: 'Hazard Awareness', question: 'When approaching a blind intersection, an operator should:', options: [{ id: 'a', text: 'Accelerate through quickly to minimize exposure time', is_correct: false }, { id: 'b', text: 'Slow down, stop, sound the horn, and look in all directions', is_correct: true }, { id: 'c', text: 'Flash the headlights repeatedly', is_correct: false }, { id: 'd', text: 'Proceed at normal speed if they have the right of way', is_correct: false }], explanation: 'Blind intersections require stopping, sounding the horn, and checking all directions before proceeding.' },
  { id: 'e18', order: 18, category: 'Hazard Awareness', question: 'Floor markings in yellow typically indicate:', options: [{ id: 'a', text: 'Pedestrian-only zones', is_correct: false }, { id: 'b', text: 'Forklift travel lanes and caution areas', is_correct: true }, { id: 'c', text: 'Emergency exits only', is_correct: false }, { id: 'd', text: 'Chemical storage areas', is_correct: false }], explanation: 'Yellow floor markings typically designate forklift pathways and caution zones in warehouses.' },
  { id: 'e19', order: 19, category: 'Hazard Awareness', question: 'A forklift operator notices a liquid spill in the travel path. The correct action is to:', options: [{ id: 'a', text: 'Drive through slowly', is_correct: false }, { id: 'b', text: 'Drive around it without stopping', is_correct: false }, { id: 'c', text: 'Stop, report the spill, and ensure it is cleaned or barricaded before proceeding', is_correct: true }, { id: 'd', text: 'Ignore it if it appears to be water', is_correct: false }], explanation: 'Any spill reduces traction and may be hazardous. Stop, report, and wait for cleanup.' },
  { id: 'e20', order: 20, category: 'Hazard Awareness', question: 'When is it permissible to allow a person to ride on the forks of a forklift?', options: [{ id: 'a', text: 'When moving between nearby locations', is_correct: false }, { id: 'b', text: 'Only when an approved work platform with railings is attached', is_correct: true }, { id: 'c', text: 'When the supervisor authorizes it', is_correct: false }, { id: 'd', text: 'Never under any circumstances', is_correct: false }], explanation: 'Elevating personnel requires an approved work platform. Riding on bare forks is always prohibited.' },
  { id: 'e21', order: 21, category: 'Advanced Operations', question: 'When refueling a propane-powered forklift, the operator must:', options: [{ id: 'a', text: 'Keep the engine running for faster refueling', is_correct: false }, { id: 'b', text: 'Turn off the engine and move to a designated, well-ventilated area', is_correct: true }, { id: 'c', text: 'Refuel inside the warehouse to avoid weather delays', is_correct: false }, { id: 'd', text: 'Wear chemical splash goggles', is_correct: false }], explanation: 'Propane is flammable. Engine must be off and the area must be well-ventilated during tank changes.' },
  { id: 'e22', order: 22, category: 'Advanced Operations', question: 'Before entering a trailer for loading/unloading, the operator should verify:', options: [{ id: 'a', text: 'Only that the trailer door is open', is_correct: false }, { id: 'b', text: 'Wheel chocks are in place, dock lock is engaged, and the trailer floor is sound', is_correct: true }, { id: 'c', text: 'That the truck driver is in the cab', is_correct: false }, { id: 'd', text: 'The trailer is at least half full for stability', is_correct: false }], explanation: 'Securing the trailer prevents separation from the dock. Floor integrity prevents collapse.' },
  { id: 'e23', order: 23, category: 'Advanced Operations', question: 'If a forklift begins to tip over, the operator should:', options: [{ id: 'a', text: 'Jump out of the forklift immediately', is_correct: false }, { id: 'b', text: 'Stay in the seat, brace with feet, grip the wheel, and lean away from the direction of fall', is_correct: true }, { id: 'c', text: 'Steer hard in the opposite direction', is_correct: false }, { id: 'd', text: 'Accelerate to regain balance', is_correct: false }], explanation: 'Jumping out is the leading cause of fatality in tip-overs. Stay buckled, brace, and lean away.' },
  { id: 'e24', order: 24, category: 'Advanced Operations', question: 'According to OSHA 1910.178(l), what must forklift operator training include?', options: [{ id: 'a', text: 'Classroom instruction only', is_correct: false }, { id: 'b', text: 'Hands-on driving test only', is_correct: false }, { id: 'c', text: 'Formal instruction, practical training, and evaluation in the workplace', is_correct: true }, { id: 'd', text: 'A written test with no practical component', is_correct: false }], explanation: 'OSHA requires all three components: formal instruction, practical training, and an evaluation of the operator in the workplace.' },
  { id: 'e25', order: 25, category: 'Advanced Operations', question: 'How often must a certified forklift operator be re-evaluated per OSHA standards?', options: [{ id: 'a', text: 'Every 6 months', is_correct: false }, { id: 'b', text: 'At least every 3 years', is_correct: true }, { id: 'c', text: 'Every 5 years', is_correct: false }, { id: 'd', text: 'Re-evaluation is not required once certified', is_correct: false }], explanation: 'OSHA 1910.178(l)(4)(iii) requires evaluation at least every three years.' },
];

const QUESTION_BY_ID = Object.fromEntries(MOBILE_EXAM_QUESTIONS.map((question) => [question.id, question]));

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export function buildPerfectMobileExamAnswers(): MobileExamAnswer[] {
  return MOBILE_EXAM_QUESTIONS.map((question) => ({
    questionId: question.id,
    optionId: question.options.find((option) => option.is_correct)?.id ?? '',
  }));
}

export function getShuffledMobileExamQuestions() {
  return shuffle(MOBILE_EXAM_QUESTIONS).map((question, index) => ({
    id: question.id,
    order: index + 1,
    category: question.category,
    question: question.question,
    explanation: question.explanation,
    options: question.options.map(({ id, text }) => ({ id, text })),
  }));
}

export function gradeMobileExamAnswers(answers: MobileExamAnswer[]): MobileExamGradeResult {
  const questionResults: MobileExamQuestionResult[] = [];
  let correctCount = 0;

  for (const answer of answers) {
    const question = QUESTION_BY_ID[answer.questionId];
    if (!question) continue;

    const correctOption = question.options.find((option) => option.is_correct);
    const correctOptionId = correctOption?.id ?? '';
    const isCorrect = answer.optionId === correctOptionId;
    if (isCorrect) correctCount += 1;

    questionResults.push({
      questionId: answer.questionId,
      selectedOptionId: answer.optionId,
      correctOptionId,
      isCorrect,
    });
  }

  const totalCount = answers.length;
  const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  return {
    score,
    passed: score >= PASS_SCORE,
    correctCount,
    totalCount,
    questionResults,
  };
}

export function getMobileExamPassScore(): number {
  return PASS_SCORE;
}
