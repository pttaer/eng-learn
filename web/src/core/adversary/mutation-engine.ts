// web/src/core/adversary/mutation-engine.ts
import { CognitiveBottleneck, BottleneckMutationStage } from './types';

export interface AdversaryChallenge {
  bottleneckId: string;
  stage: BottleneckMutationStage;
  instruction: string;
  prompt: string;
  expectedAnswer: string;
  options?: string[];
  timeLimitSec: number;
  socraticContext: string;
}

const STAGE_CONFIGS: Record<BottleneckMutationStage, {
  instruction: string;
  prompt: (p: string) => string;
  timeLimitSec: number;
  context: (b: CognitiveBottleneck) => string;
}> = {
  isolation: {
    instruction: 'Cognitive Flaw Isolation: Identify and repair the syntactic violation.',
    prompt: p => p,
    timeLimitSec: 15,
    context: b => `Historical Telemetry: You experienced ${b.failCount} slips on this exact pattern.`
  },
  permutation: {
    instruction: 'Syntactic Permutation: The target pattern has shifted into a formal subordinate clause.',
    prompt: p => `Rewrite or complete without the habitual slip: "${p}"`,
    timeLimitSec: 20,
    context: () => 'Stage 2 Permutation: Demonstrating deep mastery beyond rote sentence recall.'
  },
  cross_skill: {
    instruction: 'Cross-Skill Transfer Challenge: Reflexive deployment under speed constraint.',
    prompt: p => p,
    timeLimitSec: 10,
    context: () => 'Stage 3 Transfer: Final verification before this engram is certified Fossilization Broken.'
  }
};

export class MutationEngine {
  public static generateChallenge(bottleneck: CognitiveBottleneck): AdversaryChallenge {
    const cfg = STAGE_CONFIGS[bottleneck.mutationStage];
    return {
      bottleneckId: bottleneck.id,
      stage: bottleneck.mutationStage,
      instruction: cfg.instruction,
      prompt: cfg.prompt(bottleneck.basePrompt),
      expectedAnswer: bottleneck.expectedAnswer,
      timeLimitSec: cfg.timeLimitSec,
      socraticContext: cfg.context(bottleneck)
    };
  }
}

