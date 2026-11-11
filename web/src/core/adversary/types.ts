// web/src/core/adversary/types.ts
import { Cefr } from '../cefr';
import { ErrorCategory } from '../serl-gauntlet-engine';

export type BottleneckMutationStage = 'isolation' | 'permutation' | 'cross_skill';

export type ModalityTrait =
  | 'recognition_deficit'    // Fails active production, passes multiple choice
  | 'temporal_stress'        // Accuracy drops below 50% under 10s timer
  | 'l1_transfer'            // Rooted in Vietnamese calque / phonology
  | 'acoustic_masking';      // Fails connected speech elision / weak forms

export type BottleneckStatus = 'active' | 'quarantined' | 'fossilization_broken';

export interface EpisodicEncounter {
  timestamp: number;
  sourceModule: string;
  userResponse: string;
  expectedResponse: string;
  passed: boolean;
}

export interface CognitiveBottleneck {
  id: string;                     // Deterministic hash, e.g. "btnk_prep_discuss"
  category: ErrorCategory;
  academicTitle: string;          // E.g. "Dependent Preposition Calque: discuss [Ø]"
  cefrLevel: Cefr;
  threatLevel: number;            // 1 to 5 (escalates with repeated lapses)
  failCount: number;
  passStreak: number;
  mutationStage: BottleneckMutationStage;
  traits: ModalityTrait[];
  status: BottleneckStatus;
  history: EpisodicEncounter[];
  basePrompt: string;
  expectedAnswer: string;
  linguisticExplanation: string;
  l1VietnameseTip?: string;
  lastInterceptedAt?: number;
  createdAt: number;
}

export interface AmbushCondition {
  minThreatLevel: number;
  cooldownMs: number;
  maxDailyAmbushes: number;
  timeLimitSec: number;
}

