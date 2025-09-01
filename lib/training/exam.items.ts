export type Locale = 'en' | 'es';

export interface ExamChoice {
  id: string;
  text: string;
}

export interface ExamItem {
  id: string;
  prompt: string;
  choices: ExamChoice[];
  correctId: string;
  explanation: string;
}

export interface ExamBank {
  items: Record<Locale, ExamItem[]>;
  passPct: number;
}

export const FINAL_EXAM: ExamBank = {
  passPct: 80,
  items: {
    en: [
      {
        id: 'ex1',
        prompt: 'Moving the load center farther from the mast will…',
        choices: [
          { id: 'a', text: 'increase stability' },
          { id: 'b', text: 'reduce stability' },
          { id: 'c', text: 'have no effect' }
        ],
        correctId: 'b',
        explanation: 'Longer load center increases tipping moment and reduces stability (stability triangle). The farther the load is from the mast, the more likely the forklift will tip forward.'
      },
      {
        id: 'ex2',
        prompt: 'If you find a hydraulic leak during the pre-shift check, you should…',
        choices: [
          { id: 'a', text: 'wipe it clean and continue working' },
          { id: 'b', text: 'tag out the equipment and report the defect' },
          { id: 'c', text: 'ignore it if the leak is small' }
        ],
        correctId: 'b',
        explanation: 'Defects affecting safe operation require removing the truck from service per OSHA 1910.178(q). Any hydraulic leak can lead to brake failure or loss of lift capacity.'
      },
      {
        id: 'ex3',
        prompt: 'At a blind intersection you should…',
        choices: [
          { id: 'a', text: 'increase speed to clear it quickly' },
          { id: 'b', text: 'slow down, sound horn, and proceed with caution' },
          { id: 'c', text: 'drive in reverse at high speed' }
        ],
        correctId: 'b',
        explanation: 'Reduce speed and warn pedestrians with the horn; maintain control at all times. Visibility is critical for safe operation around pedestrians and other equipment.'
      },
      {
        id: 'ex4',
        prompt: 'The data plate tells you…',
        choices: [
          { id: 'a', text: 'recommended music volume limits' },
          { id: 'b', text: 'rated capacity with and without attachments' },
          { id: 'c', text: 'paint color code information' }
        ],
        correctId: 'b',
        explanation: 'Use the data plate to confirm rated capacity given attachments and load center. This is critical for preventing overload conditions that can cause tip-overs.'
      },
      {
        id: 'ex5',
        prompt: 'When parking on an incline you should…',
        choices: [
          { id: 'a', text: 'leave the forks raised for visibility' },
          { id: 'b', text: 'lower forks, set brake, and chock wheels if needed' },
          { id: 'c', text: 'turn off the brake to let it cool down' }
        ],
        correctId: 'b',
        explanation: 'Lower forks to floor, shift to neutral, set parking brake; chock wheels if necessary to prevent movement. This prevents runaway incidents on grades.'
      },
      {
        id: 'ex6',
        prompt: 'Pedestrians have right of way. As you approach them you should…',
        choices: [
          { id: 'a', text: 'assume they see and hear you coming' },
          { id: 'b', text: 'yield, make eye contact, and proceed slowly' },
          { id: 'c', text: 'sound horn continuously and pass closely' }
        ],
        correctId: 'b',
        explanation: 'Yield to pedestrians and confirm they are aware of your presence; maintain safe distance and low speed. Never assume pedestrians see or hear you.'
      },
      {
        id: 'ex7',
        prompt: 'Charging a battery requires…',
        choices: [
          { id: 'a', text: 'keeping the ignition on for airflow' },
          { id: 'b', text: 'proper ventilation and personal protective equipment' },
          { id: 'c', text: 'no special safety steps' }
        ],
        correctId: 'b',
        explanation: 'Battery charging emits hydrogen gas which is explosive; use proper ventilation and PPE including eye protection; follow site standard operating procedures.'
      },
      {
        id: 'ex8',
        prompt: 'Traveling with a raised load…',
        choices: [
          { id: 'a', text: 'improves visibility over obstacles' },
          { id: 'b', text: 'raises the center of gravity and risks tip-over' },
          { id: 'c', text: 'is the preferred method on ramps' }
        ],
        correctId: 'b',
        explanation: 'Keep loads as low as possible (4-6 inches) to maintain stability. Raised loads shift the center of gravity upward, increasing tip-over risk.'
      },
      {
        id: 'ex9',
        prompt: 'Before starting the truck you should…',
        choices: [
          { id: 'a', text: 'raise the forks to check hydraulics' },
          { id: 'b', text: 'lower forks to floor and set the parking brake' },
          { id: 'c', text: 'rev the engine to warm it up' }
        ],
        correctId: 'b',
        explanation: 'Lowered forks and engaged parking brake reduce risk of unintended movement during startup. This is part of safe startup procedures.'
      },
      {
        id: 'ex10',
        prompt: 'If the rated capacity is 4,000 lb at 24" load center and your load is 4,000 lb at 30" load center…',
        choices: [
          { id: 'a', text: 'the load is still safe to lift' },
          { id: 'b', text: 'not safe; the load center exceeds the rating' },
          { id: 'c', text: 'safe only when traveling in reverse' }
        ],
        correctId: 'b',
        explanation: 'Increased load center reduces the effective capacity below the rating. At 30" load center, the 4,000 lb load exceeds safe capacity and risks tip-over.'
      },
      {
        id: 'ex11',
        prompt: 'On a ramp with a load, you should travel…',
        choices: [
          { id: 'a', text: 'with the load facing uphill (upgrade)' },
          { id: 'b', text: 'with the load facing downhill' },
          { id: 'c', text: 'sideways across the ramp to save time' }
        ],
        correctId: 'a',
        explanation: 'Keep the load upgrade (facing uphill) to maintain control and prevent the load from sliding off the forks. This applies to both loaded travel up and down ramps.'
      },
      {
        id: 'ex12',
        prompt: 'Refueling/charging area best practice is…',
        choices: [
          { id: 'a', text: 'no smoking or ignition sources allowed' },
          { id: 'b', text: 'keep all doors and windows closed' },
          { id: 'c', text: 'overfill tanks to reduce refueling trips' }
        ],
        correctId: 'a',
        explanation: 'Eliminate all ignition sources including smoking, sparks, and open flames. Follow all posted hazard controls and ventilation requirements in fuel/charging areas.'
      }
    ],
    es: [] // Spanish translations to be added later
  }
};

// Helper function to get exam items for a specific locale
export function getExamItems(locale: Locale): ExamItem[] {
  return FINAL_EXAM.items[locale] || FINAL_EXAM.items.en;
}

// Helper function to get a random subset of exam items
export function getRandomExamItems(locale: Locale, count: number = 12): ExamItem[] {
  const items = getExamItems(locale);
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, items.length));
}

// Helper function to validate an answer
export function validateAnswer(itemId: string, choiceId: string, locale: Locale): {
  correct: boolean;
  explanation: string;
} {
  const items = getExamItems(locale);
  const item = items.find(i => i.id === itemId);
  
  if (!item) {
    return { correct: false, explanation: 'Question not found.' };
  }
  
  return {
    correct: item.correctId === choiceId,
    explanation: item.explanation
  };
}
