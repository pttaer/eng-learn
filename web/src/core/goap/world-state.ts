// web/src/core/goap/world-state.ts
import { LearnerWorldState, CognitiveEnergyLevel } from './types';
import { AdversaryRegistry } from '../adversary/adversary-registry';
import { SRSEngine } from '../srs-engine';
import { StorageManager, SkillId } from '../../utils/storage';
import { CognitiveScaffoldingEngine } from '../cognitive-scaffolding-mode';

export class WorldStateEngine {
  public static getCurrentState(timeBudgetMin: number = 20): LearnerWorldState {
    const activeBottlenecks = AdversaryRegistry.getActiveBottlenecks();
    const srsDue = SRSEngine.getDueCount();

    // Determine weakest skill from calibrated levels
    const skillLevels = StorageManager.getSkillProfile().skills;
    const skillsOrder: SkillId[] = ['listening', 'reading', 'writing', 'speaking', 'grammar', 'vocab'];
    const cefrRank: Record<string, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };

    let weakestSkill: SkillId = 'listening';
    let lowestRank = 99;

    for (const s of skillsOrder) {
      const lvl = skillLevels[s] || 'B1';
      const r = cefrRank[lvl] || 3;
      if (r < lowestRank) {
        lowestRank = r;
        weakestSkill = s;
      }
    }

    // Determine cognitive energy
    let cognitiveEnergy: CognitiveEnergyLevel = 'focused';
    if (CognitiveScaffoldingEngine.isGentle()) {
      cognitiveEnergy = 'fresh';
    }

    return {
      timeBudgetMin,
      hasAudioInput: true,
      hasAudioOutput: true,
      activeBottlenecksCount: activeBottlenecks.length,
      srsDueCount: srsDue,
      weakestSkill,
      cognitiveEnergy,
      consecutiveErrors: 0,
      dailyQuestsPending: 3,
      isExamApproaching: false,
      retentionRatePct: 85
    };
  }
}
