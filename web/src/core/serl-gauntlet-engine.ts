/**
 * Spaced Error Rehabilitation Gauntlet (SERL 2.0)
 * 
 * Auto-captures wrong answers from any test, drill, or mock exam across all 6 skills
 * into 3-stage adaptive micro-rehabilitation drills:
 *   Stage 1: Spot the Flaw (Recognition & Isolation within 15s)
 *   Stage 2: Scaffolded Contrastive Repair (Cloze & L1 Contrast within 20s)
 *   Stage 3: Generative Transfer (Novel Production under 30s)
 * 
 * Scheduling uses an aggressive exponential half-life decay model:
 *   Base interval: 4 hours
 *   Multiplier: 2.5^streak
 *   Lapse penalty: Resets streak to 0, increments lapses, schedules 1-hour re-test
 *   Graduation: 3 consecutive clean passes moves record to 'graduated'
 */

import { Cefr } from './cefr';
import { StorageManager, SYNTHETIC_AGAIN_FAULT } from '../utils/storage';

export type ErrorCategory =
  | 'SYNTACTIC'
  | 'LEXICAL_COLLOCATION'
  | 'L1_INTERFERENCE'
  | 'AUDITORY_DECODING'
  | 'PRAGMATIC_REGISTER'
  | 'EXAM_STRATEGY';

export type RehabStage = 'spot' | 'repair' | 'transfer';

export interface SerlErrorRecord {
  id: string;
  sourceModule: string; // 'grammar' | 'vocab' | 'reading' | 'writing' | 'speaking' | 'mediation' | 'ielts'
  category: ErrorCategory;
  cefrLevel: Cefr;
  ieltsBandEquivalent: number;
  prompt: string;
  learnerInput: string;
  expectedOutput: string;
  explanation: string;
  l1VietnameseTip?: string;
  rehabStreak: number;
  nextDueTimestamp: number;
  intervalHours: number;
  lapseCount: number;
  status: 'active' | 'graduated';
  createdAt: number;
  lastReviewedAt?: number;
}

export interface RehabMicroDrill {
  errorId: string;
  stage: RehabStage;
  category: ErrorCategory;
  cefrLevel: Cefr;
  instructions: string;
  prompt: string;
  options?: string[]; // For stage 'spot'
  clozeTemplate?: string; // For stage 'repair'
  targetToken?: string;
  expectedAnswer: string;
  l1Tip?: string;
  timeLimitSec: number;
}

export interface SerlEvaluationResult {
  success: boolean;
  errorId: string;
  previousStreak: number;
  newStreak: number;
  graduated: boolean;
  nextStage?: RehabStage;
  nextDueTimestamp: number;
  feedback: string;
}

export interface SerlStats {
  totalActive: number;
  totalDue: number;
  totalGraduated: number;
  totalLapses: number;
  byCategory: Record<ErrorCategory, number>;
}

const STORAGE_SERL_KEY = 'eng_serl_gauntlet_records';
const BASE_INTERVAL_HOURS = 4;

export class SerlGauntletEngine {
  private static cachedRecords: Record<string, SerlErrorRecord> | null = null;

  private static loadRecords(): Record<string, SerlErrorRecord> {
    if (this.cachedRecords) return this.cachedRecords;

    if (typeof localStorage === 'undefined') {
      this.cachedRecords = {};
      return this.cachedRecords;
    }

    try {
      const raw = localStorage.getItem(STORAGE_SERL_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, SerlErrorRecord>;
        // Retired path: flashcard "Again" used to be logged here. Drop those records once.
        // Remove together with StorageManager.purgeSyntheticAgainErrors.
        const stale = Object.keys(parsed).filter(id => parsed[id].learnerInput === SYNTHETIC_AGAIN_FAULT);
        stale.forEach(id => delete parsed[id]);
        this.cachedRecords = parsed;
        if (stale.length > 0) this.saveRecords();
      } else {
        this.cachedRecords = {};
      }
    } catch {
      this.cachedRecords = {};
    }
    return this.cachedRecords || {};
  }

  private static saveRecords(): void {
    if (typeof localStorage === 'undefined' || !this.cachedRecords) return;
    try {
      localStorage.setItem(STORAGE_SERL_KEY, JSON.stringify(this.cachedRecords));
    } catch {
      // quota or storage guard
    }
  }

  /**
   * Generates a deterministic short hash from key error attributes
   */
  public static generateErrorId(sourceModule: string, prompt: string, expectedOutput: string): string {
    const raw = `${sourceModule}::${prompt.trim().toLowerCase()}::${expectedOutput.trim().toLowerCase()}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = ((hash << 5) - hash) + raw.charCodeAt(i);
      hash |= 0;
    }
    return `serl_${Math.abs(hash).toString(36)}`;
  }

  /**
   * Universal Error Ingestion: Ingests an error from any module into the SERL 2.0 ledger.
   */
  public static recordError(input: {
    sourceModule: string;
    category: ErrorCategory;
    cefrLevel: Cefr;
    ieltsBandEquivalent?: number;
    prompt: string;
    learnerInput: string;
    expectedOutput: string;
    explanation: string;
    l1VietnameseTip?: string;
  }): SerlErrorRecord {
    const records = this.loadRecords();
    const id = this.generateErrorId(input.sourceModule, input.prompt, input.expectedOutput);
    const now = Date.now();

    let record = records[id];
    if (record) {
      // Existing error re-encountered
      record.lapseCount += 1;
      record.rehabStreak = 0;
      record.status = 'active';
      record.learnerInput = input.learnerInput;
      record.intervalHours = 1; // Immediate 1-hour priority review
      record.nextDueTimestamp = now; // Due immediately
      record.lastReviewedAt = now;
      if (input.l1VietnameseTip) record.l1VietnameseTip = input.l1VietnameseTip;
    } else {
      // New error
      const intervalHours = BASE_INTERVAL_HOURS;
      record = {
        id,
        sourceModule: input.sourceModule,
        category: input.category,
        cefrLevel: input.cefrLevel,
        ieltsBandEquivalent: input.ieltsBandEquivalent ?? this.cefrToBand(input.cefrLevel),
        prompt: input.prompt,
        learnerInput: input.learnerInput,
        expectedOutput: input.expectedOutput,
        explanation: input.explanation,
        l1VietnameseTip: input.l1VietnameseTip,
        rehabStreak: 0,
        nextDueTimestamp: now, // Due immediately for initial review
        intervalHours,
        lapseCount: 0,
        status: 'active',
        createdAt: now,
        lastReviewedAt: now
      };
      records[id] = record;
    }

    this.saveRecords();

    // Also mirror to StorageManager errorLedger for cross-system consistency
    try {
      StorageManager.recordError({
        code: this.categoryToErrorCode(input.category),
        contextPhrase: input.prompt.slice(0, 100),
        userFault: input.learnerInput,
        correction: input.expectedOutput,
        isL1Transfer: input.category === 'L1_INTERFERENCE' || Boolean(input.l1VietnameseTip),
        l1Pattern: input.l1VietnameseTip ? 'serl_l1_pattern' : undefined,
        skill: this.sourceToSkillId(input.sourceModule)
      });
    } catch {
      // Headless or non-storage fallback
    }

    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        window.dispatchEvent(new CustomEvent('serl-error-recorded', { detail: { record } }));
      } catch {}
    }

    return record;
  }

  /**
   * Calculates the interval until next review in hours based on streak and lapses
   */
  public static calculateIntervalHours(streak: number, lapses: number): number {
    const multiplier = Math.pow(2.5, streak);
    const lapsePenalty = Math.max(0.5, 1.0 - 0.15 * Math.min(3, lapses));
    return Math.round(BASE_INTERVAL_HOURS * multiplier * lapsePenalty);
  }

  /**
   * Generates a 3-Stage Adaptive Micro-Drill based on the record's current rehabilitation streak
   */
  public static generateMicroDrill(record: SerlErrorRecord): RehabMicroDrill {
    // Stage selection: Streak 0 -> Spot, Streak 1 -> Repair, Streak 2 -> Transfer
    const stage: RehabStage = record.rehabStreak === 0
      ? 'spot'
      : record.rehabStreak === 1
      ? 'repair'
      : 'transfer';

    if (stage === 'spot') {
      return this.buildSpotDrill(record);
    } else if (stage === 'repair') {
      return this.buildRepairDrill(record);
    } else {
      return this.buildTransferDrill(record);
    }
  }

  private static buildSpotDrill(record: SerlErrorRecord): RehabMicroDrill {
    // Stage 1: Spot the Flaw (15 seconds)
    // Extract flawed token vs canonical alternatives
    const flawed = record.learnerInput.trim();
    const correct = record.expectedOutput.trim();

    // The learner's own version against the corrected one: same form, exactly one flawed option.
    // Generic decoys would be fragments next to full sentences (a giveaway) or flawed themselves (two right answers).
    const uniqueOptions = Array.from(new Set([flawed, correct]));
    // Vary the position by record id so the flawed version isn't always first
    const rotatedOptions = (record.id.charCodeAt(record.id.length - 1) % 2) ? uniqueOptions.reverse() : uniqueOptions;

    return {
      errorId: record.id,
      stage: 'spot',
      category: record.category,
      cefrLevel: record.cefrLevel,
      instructions: 'STAGE 1: SPOT THE FLAW — Identify the erroneous or non-standard token in this context.',
      prompt: `Context: "${record.prompt}"\nWhich token represents the error that occurred?`,
      options: rotatedOptions,
      targetToken: flawed,
      expectedAnswer: flawed, // Learner must spot the flawed token
      l1Tip: record.l1VietnameseTip,
      timeLimitSec: 15
    };
  }

  private static buildRepairDrill(record: SerlErrorRecord): RehabMicroDrill {
    // Stage 2: Scaffolded Contrastive Repair (20 seconds)
    // Create a cloze template replacing the error point
    const flawed = record.learnerInput.trim();
    const correct = record.expectedOutput.trim();
    let cloze = record.prompt;
    if (cloze.includes(flawed)) {
      cloze = cloze.replace(flawed, '[ ______ ]');
    } else {
      cloze = `${cloze} [ ______: ${correct.slice(0, 2)}... ]`;
    }

    return {
      errorId: record.id,
      stage: 'repair',
      category: record.category,
      cefrLevel: record.cefrLevel,
      instructions: 'STAGE 2: CONTRASTIVE REPAIR — Fill in the correct target structure or preposition.',
      prompt: cloze,
      clozeTemplate: cloze,
      targetToken: correct,
      expectedAnswer: correct,
      l1Tip: record.l1VietnameseTip || record.explanation,
      timeLimitSec: 20
    };
  }

  private static buildTransferDrill(record: SerlErrorRecord): RehabMicroDrill {
    // Stage 3: Generative Transfer (30 seconds)
    // Ask learner to produce the target phrasing in a parallel sentence context
    return {
      errorId: record.id,
      stage: 'transfer',
      category: record.category,
      cefrLevel: record.cefrLevel,
      instructions: 'STAGE 3: GENERATIVE PRODUCTION — Type the correct canonical construction to seal engram mastery.',
      prompt: `Apply the rule: "${record.explanation}".\nProvide the correct phrase for: "${record.prompt}"`,
      expectedAnswer: record.expectedOutput,
      l1Tip: record.l1VietnameseTip,
      timeLimitSec: 30
    };
  }

  /**
   * Evaluates a micro-drill response and advances/resets the rehabilitation schedule.
   */
  public static evaluateDrillAnswer(errorId: string, answer: string): SerlEvaluationResult {
    const records = this.loadRecords();
    const record = records[errorId];
    if (!record) {
      return {
        success: false,
        errorId,
        previousStreak: 0,
        newStreak: 0,
        graduated: false,
        nextDueTimestamp: Date.now(),
        feedback: 'Error record not found.'
      };
    }

    const currentDrill = this.generateMicroDrill(record);
    const normalizedInput = answer.trim().toLowerCase();
    const normalizedExpected = currentDrill.expectedAnswer.trim().toLowerCase();

    // Check match or high-similarity match
    const isCorrect = normalizedInput === normalizedExpected ||
      (currentDrill.stage === 'transfer' && this.stringSimilarity(normalizedInput, normalizedExpected) >= 0.85);

    const now = Date.now();
    const prevStreak = record.rehabStreak;

    if (isCorrect) {
      record.rehabStreak += 1;
      record.lastReviewedAt = now;

      if (record.rehabStreak >= 3) {
        // Graduated!
        record.status = 'graduated';
        record.intervalHours = 720; // 30 days
        record.nextDueTimestamp = now + 720 * 3600 * 1000;
        this.saveRecords();

        this.notifyCompletion(record, true, true);
        return {
          success: true,
          errorId,
          previousStreak: prevStreak,
          newStreak: record.rehabStreak,
          graduated: true,
          nextDueTimestamp: record.nextDueTimestamp,
          feedback: `★ ENGRAM SEALED! "${record.expectedOutput}" successfully rehabilitated and graduated from the active Gauntlet.`
        };
      } else {
        // Advance to next interval
        record.intervalHours = this.calculateIntervalHours(record.rehabStreak, record.lapseCount);
        record.nextDueTimestamp = now + record.intervalHours * 3600 * 1000;
        this.saveRecords();

        const nextStage: RehabStage = record.rehabStreak === 1 ? 'repair' : 'transfer';
        this.notifyCompletion(record, true, false);
        return {
          success: true,
          errorId,
          previousStreak: prevStreak,
          newStreak: record.rehabStreak,
          graduated: false,
          nextStage,
          nextDueTimestamp: record.nextDueTimestamp,
          feedback: `✓ Correct! Advanced to Streak ${record.rehabStreak}/3. Next interval: ${record.intervalHours}h.`
        };
      }
    } else {
      // Lapse: Reset streak to 0, increment lapses, 1-hour urgent re-queue
      record.rehabStreak = 0;
      record.lapseCount += 1;
      record.intervalHours = 1;
      record.nextDueTimestamp = now + 1 * 3600 * 1000;
      record.lastReviewedAt = now;
      this.saveRecords();

      this.notifyCompletion(record, false, false);
      return {
        success: false,
        errorId,
        previousStreak: prevStreak,
        newStreak: 0,
        graduated: false,
        nextStage: 'spot',
        nextDueTimestamp: record.nextDueTimestamp,
        feedback: `✗ Incorrect. Expected: "${currentDrill.expectedAnswer}". Streak reset to 0; re-queued in 1 hour.`
      };
    }
  }

  private static notifyCompletion(record: SerlErrorRecord, success: boolean, graduated: boolean): void {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        window.dispatchEvent(new CustomEvent('serl-drill-completed', {
          detail: { record, success, graduated }
        }));
      } catch {}
    }
  }

  /**
   * Retrieves all active records currently due for review
   */
  public static getDueRecords(now: number = Date.now()): SerlErrorRecord[] {
    const records = this.loadRecords();
    return Object.values(records).filter(r => r.status === 'active' && r.nextDueTimestamp <= now);
  }

  /**
   * Retrieves all active records (whether currently due or waiting on timer)
   */
  public static getActiveRecords(): SerlErrorRecord[] {
    const records = this.loadRecords();
    return Object.values(records).filter(r => r.status === 'active');
  }

  /**
   * Retrieves all records (active and graduated)
   */
  public static getAllRecords(): SerlErrorRecord[] {
    const records = this.loadRecords();
    return Object.values(records);
  }

  /**
   * Generates global rehabilitation statistics
   */
  public static getStats(): SerlStats {
    const records = Object.values(this.loadRecords());
    const now = Date.now();

    const stats: SerlStats = {
      totalActive: 0,
      totalDue: 0,
      totalGraduated: 0,
      totalLapses: 0,
      byCategory: {
        SYNTACTIC: 0,
        LEXICAL_COLLOCATION: 0,
        L1_INTERFERENCE: 0,
        AUDITORY_DECODING: 0,
        PRAGMATIC_REGISTER: 0,
        EXAM_STRATEGY: 0
      }
    };

    for (const r of records) {
      if (r.status === 'graduated') {
        stats.totalGraduated++;
      } else {
        stats.totalActive++;
        if (r.nextDueTimestamp <= now) stats.totalDue++;
      }
      stats.totalLapses += r.lapseCount;
      if (stats.byCategory[r.category] !== undefined) {
        stats.byCategory[r.category]++;
      }
    }

    return stats;
  }

  /**
   * Clear all records (testing/reset)
   */
  public static clearAll(): void {
    this.cachedRecords = {};
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_SERL_KEY);
    }
  }

  // --- Helper methods ---

  private static cefrToBand(cefr: Cefr): number {
    switch (cefr) {
      case 'A1': return 3.5;
      case 'A2': return 4.5;
      case 'B1': return 5.5;
      case 'B2': return 6.5;
      case 'C1': return 7.5;
      case 'C2': return 8.5;
      default: return 5.0;
    }
  }

  private static categoryToErrorCode(category: ErrorCategory): any {
    switch (category) {
      case 'SYNTACTIC': return 'G';
      case 'LEXICAL_COLLOCATION': return 'C';
      case 'L1_INTERFERENCE': return 'Coh';
      case 'AUDITORY_DECODING': return 'P';
      case 'PRAGMATIC_REGISTER': return 'Pr';
      default: return 'V';
    }
  }

  private static sourceToSkillId(source: string): any {
    if (source === 'grammar') return 'grammar';
    if (source === 'reading') return 'reading';
    if (source === 'speaking') return 'speaking';
    if (source === 'writing') return 'writing';
    if (source === 'listening') return 'listening';
    return 'vocab';
  }

  private static stringSimilarity(s1: string, s2: string): number {
    if (s1 === s2) return 1.0;
    if (s1.length === 0 || s2.length === 0) return 0.0;
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    let matches = 0;
    for (let i = 0; i < shorter.length; i++) {
      if (longer.includes(shorter[i])) matches++;
    }
    return matches / longer.length;
  }
}
