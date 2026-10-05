import { SKILL_BRANCHES, SkillNode } from './skill-tree-data';
import { StorageManager } from '../utils/storage';

export type NodeStatus = 'locked' | 'unlocked' | 'mastered';

export interface SummitProgress {
  masteredCount: number;
  unlockedCount: number;
  totalNodes: number;
  progressPct: number;
  currentRank: string;
}

export class SkillTreeEngine {
  private static findNode(nodeId: string): SkillNode | null {
    for (const branch of Object.values(SKILL_BRANCHES)) {
      const match = branch.nodes.find(n => n.id === nodeId);
      if (match) return match;
    }
    return null;
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

    // Default simulation: root Level 1 nodes start with high progress (75-85%) for C1 learners
    const node = this.findNode(nodeId);
    if (!node) return 0;

    if (node.level === 1) {
      return 85; // B2/C1 baseline learner has already mastered level 1 fundamentals
    } else if (node.level === 2) {
      return 60; // Currently training level 2
    }
    return 0;
  }

  public static setNodeMasteryPct(nodeId: string, pct: number): void {
    const state = StorageManager.loadState();
    if (!(state as any).treeProgress) {
      (state as any).treeProgress = {};
    }
    (state as any).treeProgress[nodeId] = Math.max(0, Math.min(100, Math.round(pct)));
    StorageManager.saveState(state);
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
