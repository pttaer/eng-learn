// web/src/core/goap/types.ts
import { SkillId } from '../../utils/storage';

export type CognitiveEnergyLevel = 'fresh' | 'focused' | 'depleted';

export interface LearnerWorldState {
  timeBudgetMin: number;
  hasAudioInput: boolean;
  hasAudioOutput: boolean;
  activeBottlenecksCount: number;
  srsDueCount: number;
  weakestSkill: SkillId;
  cognitiveEnergy: CognitiveEnergyLevel;
  consecutiveErrors: number;
  dailyQuestsPending: number;
  isExamApproaching: boolean;
  retentionRatePct: number;
}

export interface GoapAction {
  id: string;
  title: string;
  durationMin: number;
  routeTarget?: string;
  cost: number;
  preconditions: (ws: LearnerWorldState) => boolean;
  applyEffects: (ws: LearnerWorldState) => LearnerWorldState;
  getDynamicCost?: (ws: LearnerWorldState) => number;
}

export interface GoapGoal {
  id: string;
  title: string;
  description: string;
  calculateUtility: (ws: LearnerWorldState) => number;
  isSatisfied: (ws: LearnerWorldState) => boolean;
  getHeuristic: (ws: LearnerWorldState) => number;
}

export interface GoapPlan {
  goal: GoapGoal;
  actions: GoapAction[];
  totalDurationMin: number;
  totalCost: number;
  createdAt: number;
}

