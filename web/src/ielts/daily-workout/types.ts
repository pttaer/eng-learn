export type TimeBudgetMinutes = 15 | 30 | 45 | 60;

export type WorkoutStepType = 'vocab' | 'reading' | 'phrasebank' | 'strategy';

export interface VocabCardItem {
  id: string;
  word: string;
  topic: string;
  band: number;
  definition: string;
  example: string;
  collocations: string[];
  vietnamese?: string;
}

export interface ReadingQuestionItem {
  id: string;
  type: string;
  prompt: string;
  options?: string[];
  answer: string | string[];
  why: string;
}

export interface ReadingDrillItem {
  passageId: string;
  title: string;
  topic: string;
  band: number;
  excerptParagraphs: string[];
  questions: ReadingQuestionItem[];
}

export interface PhrasebankDrillItem {
  id: string;
  sectionId: string;
  sectionTitle: string;
  category: string;
  template: string;
  clozeTarget: string;
  promptSentence: string;
  options: string[];
  explanation: string;
}

export interface StrategyTipItem {
  id: string;
  skill: string;
  title: string;
  sectionRef: string;
  tips: string[];
  traps: string[];
  formula: string;
}

export interface DailyWorkoutStep {
  index: number;
  type: WorkoutStepType;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  completed: boolean;
  data: {
    vocabCards?: VocabCardItem[];
    readingDrill?: ReadingDrillItem;
    phrasebankDrills?: PhrasebankDrillItem[];
    strategyTip?: StrategyTipItem;
  };
}

export interface DailyWorkoutSession {
  dateKey: string;
  timeBudget: TimeBudgetMinutes;
  createdAt: number;
  steps: DailyWorkoutStep[];
  totalEstimatedMinutes: number;
}

export interface StepCompletionRecord {
  stepIndex: number;
  type: WorkoutStepType;
  completedAt: number;
  score?: { correct: number; total: number };
}

export interface DailyWorkoutProgressState {
  dateKey: string;
  timeBudget: TimeBudgetMinutes;
  completedStepIndexes: number[];
  stepRecords: Record<number, StepCompletionRecord>;
  completed: boolean;
  completedAt?: number;
}

export interface WorkoutStreakData {
  currentStreak: number;
  lastCompletedDate: string | null;
  totalWorkoutsCompleted: number;
}
