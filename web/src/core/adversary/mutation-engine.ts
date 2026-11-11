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

export class MutationEngine {
  public static generateChallenge(bottleneck: CognitiveBottleneck): AdversaryChallenge {
    switch (bottleneck.mutationStage) {
      case 'isolation':
        return {
          bottleneckId: bottleneck.id,
          stage: 'isolation',
          instruction: 'Cognitive Flaw Isolation: Identify and repair the syntactic violation.',
          prompt: bottleneck.basePrompt,
          expectedAnswer: bottleneck.expectedAnswer,
          timeLimitSec: 15,
          socraticContext: `Historical Telemetry: You experienced ${bottleneck.failCount} slips on this exact pattern.`
        };

      case 'permutation':
        return {
          bottleneckId: bottleneck.id,
          stage: 'permutation',
          instruction: 'Syntactic Permutation: The target pattern has shifted into a formal subordinate clause.',
          prompt: `Rewrite or complete without the habitual slip: "${bottleneck.basePrompt}"`,
          expectedAnswer: bottleneck.expectedAnswer,
          timeLimitSec: 20,
          socraticContext: `Stage 2 Permutation: Demonstrating deep mastery beyond rote sentence recall.`
        };

      case 'cross_skill':
        return {
          bottleneckId: bottleneck.id,
          stage: 'cross_skill',
          instruction: 'Cross-Skill Transfer Challenge: Reflexive deployment under speed constraint.',
          prompt: bottleneck.basePrompt,
          expectedAnswer: bottleneck.expectedAnswer,
          timeLimitSec: 10,
          socraticContext: `Stage 3 Transfer: Final verification before this engram is certified Fossilization Broken.`
        };
    }
  }
}
