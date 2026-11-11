// web/src/core/goap/goal-arbiter.ts
import { GoapGoal, LearnerWorldState } from './types';

export const GOAL_CLEAR_DEBT: GoapGoal = {
  id: 'goal_clear_debt',
  title: 'Clear Cognitive & Retention Debt',
  description: 'Neutralize active error bottlenecks and clear due spaced repetition flashcards.',
  calculateUtility: (ws: LearnerWorldState) => {
    if (ws.activeBottlenecksCount > 0 && ws.srsDueCount > 0) return 95;
    if (ws.activeBottlenecksCount > 0) return 85;
    if (ws.srsDueCount > 10) return 80;
    return 30;
  },
  isSatisfied: (ws: LearnerWorldState) => ws.activeBottlenecksCount === 0 && ws.srsDueCount === 0,
  getHeuristic: (ws: LearnerWorldState) => ws.activeBottlenecksCount * 3 + Math.ceil(ws.srsDueCount / 10)
};

export const GOAL_ATTACK_WEAKNESS: GoapGoal = {
  id: 'goal_attack_weakness',
  title: 'Overcome Lowest Band Weakness',
  description: 'Target the weakest skill to unlock the IELTS readiness gate.',
  calculateUtility: (ws: LearnerWorldState) => {
    if (ws.activeBottlenecksCount === 0 && ws.srsDueCount <= 5) return 90;
    return 60;
  },
  isSatisfied: (ws: LearnerWorldState) => ws.timeBudgetMin <= 5,
  getHeuristic: (ws: LearnerWorldState) => Math.max(0, ws.timeBudgetMin - 5)
};

export const GOAL_BALANCED_PRACTICE: GoapGoal = {
  id: 'goal_balanced_practice',
  title: 'Structured Multi-Skill Mastery Session',
  description: 'Engage in balanced rhetoric, syntax, and acoustic drills.',
  calculateUtility: (ws: LearnerWorldState) => (ws.cognitiveEnergy === 'fresh' ? 70 : 40),
  isSatisfied: (ws: LearnerWorldState) => ws.timeBudgetMin <= 6,
  getHeuristic: (ws: LearnerWorldState) => Math.max(0, ws.timeBudgetMin - 6)
};

export class GoalArbiter {
  public static readonly ALL_GOALS: GoapGoal[] = [
    GOAL_CLEAR_DEBT,
    GOAL_ATTACK_WEAKNESS,
    GOAL_BALANCED_PRACTICE
  ];

  public static selectGoal(ws: LearnerWorldState): GoapGoal {
    return this.ALL_GOALS.reduce((best, g) =>
      g.calculateUtility(ws) > best.calculateUtility(ws) ? g : best
    );
  }
}

