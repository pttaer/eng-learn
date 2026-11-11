// web/src/core/goap/action-bank.ts
import { GoapAction, LearnerWorldState } from './types';

export const ACTION_MISTAKE_BLITZ: GoapAction = {
  id: 'act_mistake_blitz',
  title: 'SERL Mistake Rehabilitation Blitz',
  durationMin: 6,
  routeTarget: '#analytics',
  cost: 2,
  preconditions: (ws: LearnerWorldState) => ws.activeBottlenecksCount > 0 && ws.timeBudgetMin >= 6,
  applyEffects: (ws: LearnerWorldState) => ({
    ...ws,
    activeBottlenecksCount: Math.max(0, ws.activeBottlenecksCount - 2),
    timeBudgetMin: ws.timeBudgetMin - 6
  }),
  getDynamicCost: (ws: LearnerWorldState) => (ws.cognitiveEnergy === 'depleted' ? 8 : 2)
};

export const ACTION_SRS_REVIEW: GoapAction = {
  id: 'act_srs_review',
  title: 'Spaced Repetition Lexicon Clear',
  durationMin: 7,
  routeTarget: '#vocab',
  cost: 2,
  preconditions: (ws: LearnerWorldState) => ws.srsDueCount > 0 && ws.timeBudgetMin >= 7,
  applyEffects: (ws: LearnerWorldState) => ({
    ...ws,
    srsDueCount: Math.max(0, ws.srsDueCount - 15),
    timeBudgetMin: ws.timeBudgetMin - 7
  }),
  getDynamicCost: (ws: LearnerWorldState) => Math.max(1, 5 - Math.min(4, Math.floor(ws.srsDueCount / 10)))
};

export const ACTION_LISTENING_TRAPS: GoapAction = {
  id: 'act_listening_traps',
  title: 'Connected Speech & Auditory Decoding',
  durationMin: 8,
  routeTarget: '#listening',
  cost: 3,
  preconditions: (ws: LearnerWorldState) => ws.timeBudgetMin >= 8 && ws.hasAudioOutput,
  applyEffects: (ws: LearnerWorldState) => ({
    ...ws,
    timeBudgetMin: ws.timeBudgetMin - 8
  }),
  getDynamicCost: (ws: LearnerWorldState) => (ws.weakestSkill === 'listening' ? 1 : 4)
};

export const ACTION_WEAKNESS_DRILL: GoapAction = {
  id: 'act_weakness_drill',
  title: 'Targeted Weakness Mastery Drill',
  durationMin: 8,
  routeTarget: '#drills',
  cost: 3,
  preconditions: (ws: LearnerWorldState) => ws.timeBudgetMin >= 8,
  applyEffects: (ws: LearnerWorldState) => ({
    ...ws,
    timeBudgetMin: ws.timeBudgetMin - 8
  }),
  getDynamicCost: (_ws: LearnerWorldState) => 3
};

export const ACTION_FRANKLIN_STUDIO: GoapAction = {
  id: 'act_franklin_studio',
  title: 'Benjamin Franklin Rhetorical Reconstruction',
  durationMin: 12,
  routeTarget: '#writing',
  cost: 5,
  preconditions: (ws: LearnerWorldState) => ws.timeBudgetMin >= 12 && ws.cognitiveEnergy !== 'depleted',
  applyEffects: (ws: LearnerWorldState) => ({
    ...ws,
    timeBudgetMin: ws.timeBudgetMin - 12,
    cognitiveEnergy: 'depleted'
  }),
  getDynamicCost: (ws: LearnerWorldState) => (ws.timeBudgetMin < 15 ? 15 : 4)
};

export const DEFAULT_GOAP_ACTIONS: GoapAction[] = [
  ACTION_MISTAKE_BLITZ,
  ACTION_SRS_REVIEW,
  ACTION_LISTENING_TRAPS,
  ACTION_WEAKNESS_DRILL,
  ACTION_FRANKLIN_STUDIO
];
