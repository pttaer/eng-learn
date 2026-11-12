// web/src/core/goap/world-state.ts
import { LearnerWorldState, CognitiveEnergyLevel } from './types';
import { AdversaryRegistry } from '../adversary/adversary-registry';
import { SRSEngine } from '../srs-engine';
import { StorageManager, SkillId } from '../../utils/storage';
import { CognitiveScaffoldingEngine } from '../cognitive-scaffolding-mode';
import { cefrIndex, Cefr } from '../cefr';

export class WorldStateEngine {
  public static getCurrentState(timeBudgetMin: number = 20): LearnerWorldState {
    const activeBottlenecks = AdversaryRegistry.getActiveBottlenecks();
    const srsDue = SRSEngine.getDueCount();

    // Determine weakest skill from calibrated levels
    const skillLevels = StorageManager.getSkillProfile().skills;
    const skillsOrder: SkillId[] = ['listening', 'reading', 'writing', 'speaking', 'grammar', 'vocab'];
    const weakestSkill = skillsOrder.reduce((min, s) =>
      cefrIndex((skillLevels[s] || 'B1') as Cefr) < cefrIndex((skillLevels[min] || 'B1') as Cefr) ? s : min
      , skillsOrder[0]);

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

