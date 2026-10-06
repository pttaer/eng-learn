import { SKILL_BRANCHES, SkillNode, BranchId } from './skill-tree-data';
import { StorageManager, SkillId } from '../utils/storage';
import { Cefr, cefrIndex } from './cefr';

export type NodeStatus = 'locked' | 'unlocked' | 'mastered';

export interface SummitProgress {
  masteredCount: number;
  unlockedCount: number;
  totalNodes: number;
  progressPct: number;
  currentRank: string;
}

export const BRANCH_TO_SKILL: Record<BranchId, SkillId> = {
  grammar: 'grammar',
  collocations: 'vocab',
  reading: 'reading',
  speaking: 'speaking',
  writing: 'writing'
};

export class SkillTreeEngine {
  public static getSkillForBranch(branchId: BranchId): SkillId {
    return BRANCH_TO_SKILL[branchId];
  }

  private static findNode(nodeId: string): SkillNode | null {
    for (const branch of Object.values(SKILL_BRANCHES)) {
      const match = branch.nodes.find(n => n.id === nodeId);
      if (match) return match;
    }
    return null;
  }

  /** The branch's first node at a CEFR level: the one practice at that level should advance. */
  public static nodeForLevel(branchId: BranchId, level: Cefr): SkillNode | null {
    return SKILL_BRANCHES[branchId].nodes.find(n => n.cefrLevel === level) ?? null;
  }

  public static getAllNodes(): SkillNode[] {
    const list: SkillNode[] = [];
    for (const branch of Object.values(SKILL_BRANCHES)) {
      list.push(...branch.nodes);
    }
    return list;
  }

  public static getNodeMasteryPct(nodeId: string): number {
    const state = StorageManager.loadState();
    const treeProgress = (state as any).treeProgress || {};
    if (typeof treeProgress[nodeId] === 'number') {
      return treeProgress[nodeId];
    }

    // No recorded progress: derive it from the learner's calibrated CEFR level for this branch's skill.
    // Tiers below the learner count as mastered; the learner's own tier is unlocked and in training once its
    // prerequisites are met; anything above stays locked.
    const node = this.findNode(nodeId);
    if (!node) return 0;

    const skillId = BRANCH_TO_SKILL[node.branchId] || 'vocab';
    const learner = StorageManager.getSkillLevel(skillId);
    if (cefrIndex(node.cefrLevel) < cefrIndex(learner)) return 100;
    const prereqsMet = node.prerequisites.every(id => {
      const pre = this.findNode(id);
      return !!pre && this.getNodeMasteryPct(id) >= pre.masteryThreshold;
    });
    if (!prereqsMet) return 0;
    return node.cefrLevel === learner ? 40 : 0;
  }

  public static setNodeMasteryPct(nodeId: string, pct: number): void {
    const state = StorageManager.loadState();
    if (!(state as any).treeProgress) {
      (state as any).treeProgress = {};
    }
    (state as any).treeProgress[nodeId] = Math.max(0, Math.min(100, Math.round(pct)));
    StorageManager.saveState(state);
  }

  public static advanceBranchMastery(branchId: BranchId, level: Cefr, delta = 5): void {
    const node = this.nodeForLevel(branchId, level);
    if (!node) return;
    const current = this.getNodeMasteryPct(node.id);
    const next = Math.max(current, Math.min(100, Math.round(current + delta)));
    this.setNodeMasteryPct(node.id, next);
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        window.dispatchEvent(new CustomEvent('tree-mastery-updated', {
          detail: { branchId, level, nodeId: node.id, previousMastery: current, newMastery: next, delta }
        }));
      } catch (e) {
        // Non-browser environment
      }
    }
  }

  public static getNodeStatus(nodeId: string): NodeStatus {
    const node = this.findNode(nodeId);
    if (!node) return 'locked';

    const mastery = this.getNodeMasteryPct(nodeId);
    if (mastery >= node.masteryThreshold) {
      return 'mastered';
    }

    // Check prerequisites
    if (this.isNodeUnlocked(nodeId)) {
      return 'unlocked';
    }

    return 'locked';
  }

  public static isNodeUnlocked(nodeId: string): boolean {
    const node = this.findNode(nodeId);
    if (!node) return false;

    // Root nodes with 0 prerequisites are always unlocked
    if (node.prerequisites.length === 0) {
      return true;
    }

    // All prerequisites must be mastered (>= threshold)
    return node.prerequisites.every(prereqId => {
      const prereqNode = this.findNode(prereqId);
      if (!prereqNode) return false;
      const prereqMastery = this.getNodeMasteryPct(prereqId);
      return prereqMastery >= prereqNode.masteryThreshold;
    });
  }

  public static getPrerequisiteStatus(nodeId: string): { prereqName: string; requiredPct: number; currentPct: number } | null {
    const node = this.findNode(nodeId);
    if (!node || node.prerequisites.length === 0) return null;

    for (const prereqId of node.prerequisites) {
      const prereqNode = this.findNode(prereqId);
      if (!prereqNode) continue;
      const currentPct = this.getNodeMasteryPct(prereqId);
      if (currentPct < prereqNode.masteryThreshold) {
        return {
          prereqName: prereqNode.title,
          requiredPct: prereqNode.masteryThreshold,
          currentPct
        };
      }
    }
    return null;
  }

  public static calculateSummitProgress(): SummitProgress {
    const allNodes = this.getAllNodes();
    let masteredCount = 0;
    let unlockedCount = 0;

    for (const node of allNodes) {
      const status = this.getNodeStatus(node.id);
      if (status === 'mastered') {
        masteredCount++;
        unlockedCount++;
      } else if (status === 'unlocked') {
        unlockedCount++;
      }
    }

    const totalNodes = allNodes.length; // 25
    const progressPct = Math.round((masteredCount / totalNodes) * 100);

    // Progress titles only; the learner's CEFR level is shown separately in the header
    let currentRank = 'Explorer';
    if (progressPct >= 80) {
      currentRank = 'Summit Master';
    } else if (progressPct >= 50) {
      currentRank = 'Candidate';
    } else if (progressPct >= 20) {
      currentRank = 'Scholar';
    }

    return {
      masteredCount,
      unlockedCount,
      totalNodes,
      progressPct,
      currentRank
    };
  }
}
