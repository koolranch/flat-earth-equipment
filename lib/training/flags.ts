// Stub file for training flags
export const TRAINING_FLAGS = {
  enableTabs: true,
  enableFlashcards: true,
  enableQuiz: true,
  enableDemo: true,
} as const;

export const PRELAUNCH_PREVIEW = false;

export function getTrainingFlag(flag: keyof typeof TRAINING_FLAGS): boolean {
  return TRAINING_FLAGS[flag] ?? false;
}
