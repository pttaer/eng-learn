// web/src/core/adversary/adversary-registry.ts
import { CognitiveBottleneck } from './types';
import { ErrorCategory } from '../serl-gauntlet-engine';
import { Cefr } from '../cefr';

const STORAGE_KEY = 'eng_cognitive_adversary_bottlenecks';

export class AdversaryRegistry {
  private static cachedBottlenecks: Record<string, CognitiveBottleneck> | null = null;

  public static load(): Record<string, CognitiveBottleneck> {
    if (this.cachedBottlenecks) return this.cachedBottlenecks;
    if (typeof localStorage === 'undefined') {
      this.cachedBottlenecks = {};
      return this.cachedBottlenecks;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this.cachedBottlenecks = raw ? JSON.parse(raw) : {};
    } catch {
      this.cachedBottlenecks = {};
    }
    return this.cachedBottlenecks || {};
  }

  public static save(): void {
    if (typeof localStorage === 'undefined' || !this.cachedBottlenecks) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cachedBottlenecks));
    } catch {}
  }

  public static clearCache(): void {
    this.cachedBottlenecks = null;
  }

  public static generateId(category: ErrorCategory, prompt: string, expectedAnswer: string): string {
    const raw = `${category}::${prompt.trim().toLowerCase()}::${expectedAnswer.trim().toLowerCase()}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = ((hash << 5) - hash) + raw.charCodeAt(i);
      hash |= 0;
    }
    return `btnk_${Math.abs(hash).toString(36)}`;
  }

  public static recordEncounter(data: {
    sourceModule: string;
    category: ErrorCategory;
    academicTitle: string;
    cefrLevel: Cefr;
    prompt: string;
    userResponse: string;
    expectedAnswer: string;
    passed: boolean;
    linguisticExplanation: string;
    l1VietnameseTip?: string;
  }): CognitiveBottleneck {
    const all = this.load();
    const id = this.generateId(data.category, data.prompt, data.expectedAnswer);
    let bottleneck = all[id];

    const now = Date.now();

    if (!bottleneck) {
      bottleneck = {
        id,
        category: data.category,
        academicTitle: data.academicTitle,
        cefrLevel: data.cefrLevel,
        threatLevel: 1,
        failCount: data.passed ? 0 : 1,
        passStreak: data.passed ? 1 : 0,
        mutationStage: 'isolation',
        traits: ['recognition_deficit'],
        status: 'active',
        history: [],
        basePrompt: data.prompt,
        expectedAnswer: data.expectedAnswer,
        linguisticExplanation: data.linguisticExplanation,
        l1VietnameseTip: data.l1VietnameseTip,
        createdAt: now
      };
    } else {
      if (data.passed) {
        bottleneck.passStreak += 1;
        if (bottleneck.passStreak >= 3) {
          if (bottleneck.mutationStage === 'isolation') {
            bottleneck.mutationStage = 'permutation';
            bottleneck.passStreak = 0;
          } else if (bottleneck.mutationStage === 'permutation') {
            bottleneck.mutationStage = 'cross_skill';
            bottleneck.passStreak = 0;
          } else {
            bottleneck.status = 'fossilization_broken';
            bottleneck.threatLevel = Math.max(1, bottleneck.threatLevel - 1);
          }
        }
      } else {
        bottleneck.passStreak = 0;
        bottleneck.failCount += 1;
        bottleneck.threatLevel = Math.min(5, bottleneck.threatLevel + 1);
        bottleneck.status = 'active';
      }
    }

    bottleneck.history.push({
      timestamp: now,
      sourceModule: data.sourceModule,
      userResponse: data.userResponse,
      expectedResponse: data.expectedAnswer,
      passed: data.passed
    });

    all[id] = bottleneck;
    this.save();
    return bottleneck;
  }

  public static getActiveBottlenecks(): CognitiveBottleneck[] {
    const all = this.load();
    return Object.values(all).filter(b => b.status === 'active');
  }

  public static getHighestThreat(): CognitiveBottleneck | null {
    const active = this.getActiveBottlenecks();
    if (active.length === 0) return null;
    return [...active].sort((a, b) => b.threatLevel - a.threatLevel)[0];
  }
}
