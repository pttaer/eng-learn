// web/src/core/goap/planner.ts
import { LearnerWorldState, GoapAction, GoapGoal, GoapPlan } from './types';

interface PlanNode {
  state: LearnerWorldState;
  action: GoapAction | null;
  parent: PlanNode | null;
  gCost: number;
  hCost: number;
  fCost: number;
}

export class GoapPlanner {
  public static plan(
    startState: LearnerWorldState,
    goal: GoapGoal,
    availableActions: GoapAction[]
  ): GoapPlan | null {
    const openList: PlanNode[] = [];
    const closedList: Set<string> = new Set();

    const root: PlanNode = {
      state: { ...startState },
      action: null,
      parent: null,
      gCost: 0,
      hCost: goal.getHeuristic(startState),
      fCost: goal.getHeuristic(startState)
    };

    openList.push(root);

    let iterations = 0;
    const MAX_ITERATIONS = 500;

    while (openList.length > 0 && iterations < MAX_ITERATIONS) {
      iterations++;
      openList.sort((a, b) => a.fCost - b.fCost);
      const current = openList.shift()!;

      if (goal.isSatisfied(current.state)) {
        return this.reconstructPlan(current, goal);
      }

      const stateHash = this.hashState(current.state);
      closedList.add(stateHash);

      for (const action of availableActions) {
        if (!action.preconditions(current.state)) continue;

        const nextState = action.applyEffects({ ...current.state });
        const nextHash = this.hashState(nextState);
        if (closedList.has(nextHash)) continue;

        const stepCost = action.getDynamicCost(current.state);
        const gCost = current.gCost + stepCost;
        const hCost = goal.getHeuristic(nextState);

        const neighbor: PlanNode = {
          state: nextState,
          action,
          parent: current,
          gCost,
          hCost,
          fCost: gCost + hCost
        };

        const existing = openList.find(n => this.hashState(n.state) === nextHash);
        if (!existing) {
          openList.push(neighbor);
        } else if (gCost < existing.gCost) {
          existing.gCost = gCost;
          existing.fCost = gCost + existing.hCost;
          existing.parent = current;
          existing.action = action;
        }
      }
    }

    return null;
  }

  private static reconstructPlan(endNode: PlanNode, goal: GoapGoal): GoapPlan {
    const actions: GoapAction[] = [];
    let curr: PlanNode | null = endNode;
    let totalDuration = 0;
    let totalCost = endNode.gCost;

    while (curr && curr.action) {
      actions.unshift(curr.action);
      totalDuration += curr.action.durationMin;
      curr = curr.parent;
    }

    return {
      goal,
      actions,
      totalDurationMin: totalDuration,
      totalCost,
      createdAt: Date.now()
    };
  }

  private static hashState(s: LearnerWorldState): string {
    return `${s.timeBudgetMin}|${s.activeBottlenecksCount}|${s.srsDueCount}|${s.weakestSkill}|${s.cognitiveEnergy}`;
  }
}
