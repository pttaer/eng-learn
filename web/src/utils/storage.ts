import { Cefr, isCefr } from '../core/cefr';
import { SKILL_BRANCHES } from '../core/skill-tree-data';
import { SRSCardState } from '../core/srs-engine';
import type { ImportMode, ImportResult, UnifiedProfile } from '../core/profile-sync-engine';

export type { ImportMode, ImportResult, UnifiedProfile };

export interface ProfileSyncEngineAdapter {
  exportProfile(triggerDownload?: boolean): string;
  importProfile(jsonStr: string, mode?: ImportMode): ImportResult;
}

export type SkillId = 'vocab' | 'grammar' | 'reading' | 'listening' | 'writing' | 'speaking';

export const ALL_SKILLS: readonly SkillId[] = ['vocab', 'grammar', 'reading', 'listening', 'writing', 'speaking'];

export interface SkillProfile {
  overall: Cefr;
  skills: Record<SkillId, Cefr>;
  assessedAt: string;
}

export type ErrorCode = 'G' | 'V' | 'WF' | 'C' | 'Sp' | 'P' | 'WO' | 'R' | 'Coh' | 'Pr';

export const ALL_ERROR_CODES: readonly ErrorCode[] = [
  'G', 'V', 'WF', 'C', 'Sp', 'P', 'WO', 'R', 'Coh', 'Pr'
];

export interface ErrorTaxonomyRecord {
  id: string;
  code: ErrorCode;
  subcategory?: string;
  contextPhrase: string;
  userFault: string;
  correction: string;
  isL1Transfer: boolean;
  l1Pattern?: string; // e.g., 'zero_copula', 'dual_conjunction', 'preposition_calque', 'final_consonant_drop'
  skill?: SkillId;
  timestamp: number;
  recurrenceCount: number;
  status: 'active' | 'in_remediation' | 'resolved';
  lastPracticedAt?: number;
  remediationCardId?: string;
}

export interface PreFlightChecklistRule {
  id: string;
  code: ErrorCode;
  ruleTitle: string;
  description: string;
  goodExample: string;
  badExample: string;
  cleanStreak: number; // Retires when >= 3
  createdAt: number;
}

export interface CatAssessmentRecord {
  skill: SkillId;
  theta: number; // Latent ability estimate (-3.0 to +3.0)
  sem: number;   // Standard Error of Measurement
  confidence: 'low' | 'medium' | 'high';
  itemsAdministered: number;
  calibratedLevel: Cefr;
  assessedAt: string;
}

export interface AppStorageState {
  version: number;
  learnerLevel: Cefr;
  skillLevels: Record<SkillId, Cefr>;
  skillProfileHistory?: SkillProfile[];
  placementDone: boolean;
  soundMuted: boolean;
  cardStates: Record<string, SRSCardState>;
  streak: {
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string; // ISO date 'YYYY-MM-DD'
  };
  habitProgress: Record<number, {
    completed: boolean;
    completedTasks: number[];
    completedAt?: number;
  }>;
  totalCardsReviewed: number;
  lastSyncTimestamp: number;
  notificationsEnabled?: boolean;
  musicVolume?: number;
  musicMode?: string;
  // v4 state extensions:
  errorLedger?: {
    records: Record<string, ErrorTaxonomyRecord>;
    checklist: PreFlightChecklistRule[];
    totalLogged: number;
    totalResolved: number;
  };
  catProfiles?: Partial<Record<SkillId, CatAssessmentRecord>>;
}

const STORAGE_KEY = 'STARK_ENG_STATE';

// Marker written by the retired "every flashcard Again is an error" path. Used only to purge that data.
export const SYNTHETIC_AGAIN_FAULT = 'Again (SRS Reset)';
export const CURRENT_VERSION = 4;

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function defaultSkillLevels(level: Cefr = 'A1'): Record<SkillId, Cefr> {
  return {
    vocab: level,
    grammar: level,
    reading: level,
    listening: level,
    writing: level,
    speaking: level
  };
}

const DEFAULT_STATE: AppStorageState = {
  version: CURRENT_VERSION,
  learnerLevel: 'A1',
  skillLevels: defaultSkillLevels('A1'),
  skillProfileHistory: [],
  placementDone: false,
  soundMuted: false,
  cardStates: {},
  streak: {
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: ''
  },
  habitProgress: {},
  totalCardsReviewed: 0,
  lastSyncTimestamp: Date.now(),
  notificationsEnabled: false,
  musicVolume: 0.35,
  musicMode: 'off',
  errorLedger: {
    records: {},
    checklist: [],
    totalLogged: 0,
    totalResolved: 0
  },
  catProfiles: {}
};

export class StorageManager {
  public static readonly CURRENT_VERSION = CURRENT_VERSION;
  private static cachedState: AppStorageState | null = null;

  public static clearCache(): void {
    this.cachedState = null;
  }

  public static loadState(): AppStorageState {
    if (this.cachedState) {
      return this.cachedState;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.cachedState = { ...DEFAULT_STATE };
        this.saveState(this.cachedState);
        return this.cachedState;
      }

      const parsed = JSON.parse(raw) as Partial<AppStorageState>;
      if (!isCefr(parsed.learnerLevel)) this.seedLegacyTreeProgress(parsed);
      const migratedLevel = this.migratedLevel(parsed);
      this.cachedState = {
        ...DEFAULT_STATE,
        ...parsed,
        version: CURRENT_VERSION,
        learnerLevel: migratedLevel,
        skillLevels: this.migratedSkillLevels(parsed, migratedLevel),
        skillProfileHistory: Array.isArray(parsed.skillProfileHistory) ? parsed.skillProfileHistory : [],
        placementDone: parsed.placementDone ?? !isCefr(parsed.learnerLevel),
        streak: { ...DEFAULT_STATE.streak, ...(parsed.streak || {}) },
        habitProgress: parsed.habitProgress || {},
        cardStates: parsed.cardStates || {},
        errorLedger: this.migratedErrorLedger(parsed),
        catProfiles: parsed.catProfiles || {}
      };
      const purged = this.purgeSyntheticAgainErrors(this.cachedState);
      if (purged || parsed.version !== CURRENT_VERSION || !parsed.skillLevels || !parsed.errorLedger) {
        this.saveState(this.cachedState);
      }
      return this.cachedState;
    } catch (err) {
      console.error('[STORAGE] Failed to parse localStorage state, resetting to default.', err);
      this.cachedState = { ...DEFAULT_STATE };
      return this.cachedState;
    }
  }

  // v1 users saw the five B2-C2 tiers with default progress (tier 1 = 85, tier 2 = 60); freeze that so the new
  // lower tiers do not lock them out of what they had unlocked
  private static seedLegacyTreeProgress(parsed: any): void {
    const progress = parsed.treeProgress || (parsed.treeProgress = {});
    for (const branch of Object.values(SKILL_BRANCHES)) {
      for (const node of branch.nodes) {
        const legacyTier = node.level - 3;
        if (legacyTier >= 1 && progress[node.id] === undefined) progress[node.id] = legacyTier === 1 ? 85 : legacyTier === 2 ? 60 : 0;
      }
    }
  }

  // v1 states have no learnerLevel; those users were already working at B2+, so start them at B2
  private static migratedLevel(parsed: Partial<AppStorageState>): Cefr {
    return isCefr(parsed.learnerLevel) ? parsed.learnerLevel : 'B2';
  }

  private static defaultSkillLevels(level: Cefr): Record<SkillId, Cefr> {
    return {
      vocab: level,
      grammar: level,
      reading: level,
      listening: level,
      writing: level,
      speaking: level
    };
  }

  private static migratedSkillLevels(parsed: Partial<AppStorageState>, defaultLevel: Cefr): Record<SkillId, Cefr> {
    const raw = (parsed.skillLevels || {}) as Partial<Record<SkillId, Cefr>>;
    const result: Record<SkillId, Cefr> = this.defaultSkillLevels(defaultLevel);
    for (const skill of ALL_SKILLS) {
      if (isCefr(raw[skill])) {
        result[skill] = raw[skill] as Cefr;
      }
    }
    return result;
  }

  /**
   * Removes data written by the retired path that logged every flashcard "Again" as an error: the ledger
   * records, their SRS remediation cards (which were due immediately and fed the reminder's due-word list),
   * the counters, and checklist rules those records created. Idempotent; true only when something changed.
   * Delete this block once no build from before the fix is still in use.
   */
  private static purgeSyntheticAgainErrors(state: AppStorageState): boolean {
    const ledger = state.errorLedger;
    if (!ledger) return false;
    let changed = false;
    for (const [id, rec] of Object.entries(ledger.records)) {
      if (rec.userFault !== SYNTHETIC_AGAIN_FAULT) continue;
      if (rec.remediationCardId) delete state.cardStates[rec.remediationCardId];
      if (rec.status === 'resolved') ledger.totalResolved = Math.max(0, ledger.totalResolved - 1);
      ledger.totalLogged = Math.max(0, ledger.totalLogged - 1);
      delete ledger.records[id];
      changed = true;
    }
    const rules = ledger.checklist.filter(r => r.badExample !== SYNTHETIC_AGAIN_FAULT);
    if (rules.length !== ledger.checklist.length) {
      ledger.checklist = rules;
      changed = true;
    }
    return changed;
  }

  private static migratedErrorLedger(parsed: Partial<AppStorageState>): {
    records: Record<string, ErrorTaxonomyRecord>;
    checklist: PreFlightChecklistRule[];
    totalLogged: number;
    totalResolved: number;
  } {
    const existing = parsed.errorLedger;
    if (existing && typeof existing === 'object' && existing.records) {
      return {
        records: existing.records || {},
        checklist: Array.isArray(existing.checklist) ? existing.checklist : [],
        totalLogged: typeof existing.totalLogged === 'number' ? existing.totalLogged : Object.keys(existing.records || {}).length,
        totalResolved: typeof existing.totalResolved === 'number' ? existing.totalResolved : 0
      };
    }
    return {
      records: {},
      checklist: [],
      totalLogged: 0,
      totalResolved: 0
    };
  }

  public static getSkillLevel(skill: SkillId): Cefr {
    const state = this.loadState();
    return state.skillLevels?.[skill] || state.learnerLevel || 'A1';
  }

  public static setSkillLevel(skill: SkillId, level: Cefr): void {
    const state = this.loadState();
    if (!state.skillLevels) {
      state.skillLevels = this.migratedSkillLevels(state, state.learnerLevel);
    }
    state.skillLevels[skill] = level;
    this.saveState(state);
  }

  public static getSkillProfile(): SkillProfile {
    const state = this.loadState();
    return {
      overall: state.learnerLevel,
      skills: { ...(state.skillLevels || this.defaultSkillLevels(state.learnerLevel)) },
      assessedAt: new Date().toISOString()
    };
  }

  public static saveSkillProfile(profile: SkillProfile): void {
    const state = this.loadState();
    state.learnerLevel = profile.overall;
    state.skillLevels = { ...profile.skills };
    state.placementDone = true;
    if (!Array.isArray(state.skillProfileHistory)) {
      state.skillProfileHistory = [];
    }
    state.skillProfileHistory.push(profile);
    this.saveState(state);
  }

  public static getLearnerLevel(): Cefr {
    return this.loadState().learnerLevel;
  }

  /** v1 users (no learnerLevel yet) never see the quiz; brand-new users do. */
  public static isPlacementDone(): boolean {
    return this.loadState().placementDone;
  }

  public static setPlacementDone(): void {
    const state = this.loadState();
    state.placementDone = true;
    this.saveState(state);
  }

  public static setLearnerLevel(level: Cefr): void {
    const state = this.loadState();
    state.learnerLevel = level;
    this.saveState(state);
  }

  public static saveState(state: AppStorageState): void {
    this.cachedState = state;
    state.lastSyncTimestamp = Date.now();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error('[STORAGE] Failed to persist state to localStorage:', err);
    }
  }

  public static getCardState(cardId: string): SRSCardState | undefined {
    const state = this.loadState();
    return state.cardStates[cardId];
  }

  public static setCardState(cardId: string, cardState: SRSCardState): void {
    const state = this.loadState();
    state.cardStates[cardId] = cardState;
    state.totalCardsReviewed += 1;
    this.touchStreak(state);
    this.saveState(state);
  }

  public static toggleSoundMute(): boolean {
    const state = this.loadState();
    state.soundMuted = !state.soundMuted;
    this.saveState(state);
    return state.soundMuted;
  }

  public static isSoundMuted(): boolean {
    return this.loadState().soundMuted;
  }

  public static isNotificationsEnabled(): boolean {
    return Boolean(this.loadState().notificationsEnabled);
  }

  public static setNotificationsEnabled(enabled: boolean): void {
    const state = this.loadState();
    state.notificationsEnabled = enabled;
    this.saveState(state);
  }

  public static getMusicVolume(): number {
    try {
      const v = localStorage.getItem('eng_music_volume');
      if (v !== null) {
        const parsed = parseFloat(v);
        if (!isNaN(parsed)) return Math.max(0, Math.min(1, parsed));
      }
    } catch {}
    return this.loadState().musicVolume ?? 0.35;
  }

  public static setMusicVolume(vol: number): void {
    const clamped = Math.max(0, Math.min(1, vol));
    const state = this.loadState();
    state.musicVolume = clamped;
    this.saveState(state);
    try {
      localStorage.setItem('eng_music_volume', String(clamped));
    } catch {}
  }

  public static getMusicMode(): string {
    try {
      const mode = localStorage.getItem('eng_music_mode');
      if (mode) return mode;
    } catch {}
    return this.loadState().musicMode || 'off';
  }

  public static setMusicMode(mode: string): void {
    const state = this.loadState();
    state.musicMode = mode;
    this.saveState(state);
    try {
      localStorage.setItem('eng_music_mode', mode);
    } catch {}
  }

  public static setHabitTask(dayNum: number, taskIndex: number, checked: boolean, totalTasksForDay: number): void {
    const state = this.loadState();
    if (!state.habitProgress[dayNum]) {
      state.habitProgress[dayNum] = {
        completed: false,
        completedTasks: []
      };
    }

    const dayEntry = state.habitProgress[dayNum];
    const taskSet = new Set(dayEntry.completedTasks);

    if (checked) {
      taskSet.add(taskIndex);
    } else {
      taskSet.delete(taskIndex);
    }

    dayEntry.completedTasks = Array.from(taskSet).sort((a, b) => a - b);
    dayEntry.completed = dayEntry.completedTasks.length >= totalTasksForDay && totalTasksForDay > 0;
    if (dayEntry.completed) {
      dayEntry.completedAt = Date.now();
      this.touchStreak(state);
    }

    this.saveState(state);
  }

  private static touchStreak(state: AppStorageState): void {
    const today = getTodayString();
    if (state.streak.lastActiveDate === today) {
      return; // Already registered today
    }

    if (!state.streak.lastActiveDate) {
      state.streak.currentStreak = 1;
    } else {
      const last = new Date(state.streak.lastActiveDate);
      const now = new Date(today);
      const diffDays = Math.round((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        state.streak.currentStreak += 1;
      } else if (diffDays > 1) {
        state.streak.currentStreak = 1;
      }
    }

    state.streak.lastActiveDate = today;
    if (state.streak.currentStreak > state.streak.longestStreak) {
      state.streak.longestStreak = state.streak.currentStreak;
    }
  }

  public static getStreak(): number {
    return this.loadState().streak.currentStreak || 0;
  }

  public static isNotificationEnabled(): boolean {
    return this.loadState().notificationsEnabled ?? false;
  }

  public static setNotificationEnabled(enabled: boolean): void {
    const state = this.loadState();
    state.notificationsEnabled = enabled;
    this.saveState(state);
  }

  // =========================================================================
  // FORMATIVE ERROR TAXONOMY & SPACED ERROR RECYCLING (SERL)
  // =========================================================================

  /**
   * Records a learner error according to the 10-code CEFR error taxonomy.
   * - Automatically updates recurrence counters.
   * - Bridges into the SM-2 Spaced Repetition queue as a high-priority remediation card.
   * - Synthesizes a Pre-Flight Checklist rule when an error pattern recurs >= 3 times.
   */
  public static recordError(input: {
    id?: string;
    code: ErrorCode;
    subcategory?: string;
    contextPhrase: string;
    userFault: string;
    correction: string;
    isL1Transfer?: boolean;
    l1Pattern?: string;
    skill?: SkillId;
  }): ErrorTaxonomyRecord {
    const state = this.loadState();
    if (!state.errorLedger) {
      state.errorLedger = { records: {}, checklist: [], totalLogged: 0, totalResolved: 0 };
    }

    const ledger = state.errorLedger;
    // Look for matching existing pattern by code + normalized fault
    const normFault = input.userFault.trim().toLowerCase();
    let existingId: string | undefined;

    for (const [id, rec] of Object.entries(ledger.records)) {
      if (rec.code === input.code && rec.userFault.trim().toLowerCase() === normFault) {
        existingId = id;
        break;
      }
    }

    const errorId = input.id || existingId || `err_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const now = Date.now();
    let record: ErrorTaxonomyRecord;

    if (existingId && ledger.records[existingId]) {
      record = ledger.records[existingId];
      record.recurrenceCount += 1;
      record.timestamp = now;
      record.contextPhrase = input.contextPhrase;
      record.correction = input.correction;
      record.status = 'active';
      if (input.isL1Transfer !== undefined) record.isL1Transfer = input.isL1Transfer;
      if (input.l1Pattern) record.l1Pattern = input.l1Pattern;
    } else {
      record = {
        id: errorId,
        code: input.code,
        subcategory: input.subcategory,
        contextPhrase: input.contextPhrase,
        userFault: input.userFault,
        correction: input.correction,
        isL1Transfer: Boolean(input.isL1Transfer),
        l1Pattern: input.l1Pattern,
        skill: input.skill,
        timestamp: now,
        recurrenceCount: 1,
        status: 'active'
      };
      ledger.records[errorId] = record;
      ledger.totalLogged += 1;
    }

    // Spaced Error Recycling (SERL) bridge:
    // Create or re-queue remediation flashcard in SM-2 cardStates
    const remediationCardId = `remed_${record.code.toLowerCase()}_${record.id}`;
    record.remediationCardId = remediationCardId;

    if (!state.cardStates[remediationCardId]) {
      state.cardStates[remediationCardId] = {
        cardId: remediationCardId,
        repetitions: 0,
        interval: 1, // High frequency 1-day initial review
        easeFactor: record.isL1Transfer ? 2.30 : 2.40, // Increased cognitive load for L1 transfer traps
        dueDate: now, // Due immediately
        lastReviewed: 0,
        totalReviews: 0,
        totalLapses: 0,
        lapses: 0,
        history: []
      };
    } else {
      // Re-trigger due state for recurring lapse
      const card = state.cardStates[remediationCardId];
      card.dueDate = now;
      card.lapses = (card.lapses ?? 0) + 1;
      card.interval = 1;
    }

    // Pre-Flight Checklist Synthesis:
    // If error pattern recurs >= 3 times, mount/update a rule on the Personal Editing Checklist
    if (record.recurrenceCount >= 3) {
      this.ensureChecklistRule(state, record);
    }

    this.saveState(state);
    return record;
  }

  private static ensureChecklistRule(state: AppStorageState, record: ErrorTaxonomyRecord): void {
    if (!state.errorLedger) return;
    const checklist = state.errorLedger.checklist;
    const ruleId = `rule_${record.code}_${record.l1Pattern || record.subcategory || 'general'}`;

    const existing = checklist.find(r => r.id === ruleId);
    if (existing) {
      existing.cleanStreak = 0; // Reset clean streak when error recurs
      return;
    }

    // Generate tailored pedagogical title and guidance from error taxonomy
    let ruleTitle = `Check ${record.code} Pattern`;
    let description = `Review for recurring ${record.code} errors before submitting.`;
    if (record.code === 'G') {
      ruleTitle = record.isL1Transfer ? 'Verify Copula & Tense Inflection' : 'Check Verb Agreement & Tenses';
      description = 'Ensure every past event uses past simple and adjectives have a form of "be".';
    } else if (record.code === 'Coh') {
      ruleTitle = 'Avoid Dual Conjunction Collisions';
      description = 'Do not combine Although/Even though with But in the same sentence.';
    } else if (record.code === 'C') {
      ruleTitle = 'Verify Collocational Prepositions';
      description = 'Check fixed prepositions and verbs: e.g., depend on, spend on, increase by.';
    } else if (record.code === 'WF') {
      ruleTitle = 'Check Word Class & Derivation';
      description = 'Verify part of speech (e.g. feel lonely [adj], not feel loneliness [noun]).';
    } else if (record.code === 'WO') {
      ruleTitle = 'Check Adverbial Word Order';
      description = 'Keep Verb and Object adjacent (e.g. like English very much, not like very much English).';
    }

    const newRule: PreFlightChecklistRule = {
      id: ruleId,
      code: record.code,
      ruleTitle,
      description,
      goodExample: record.correction,
      badExample: record.userFault,
      cleanStreak: 0,
      createdAt: Date.now()
    };

    checklist.push(newRule);
    // Limit active checklist to top 5 most relevant items
    if (checklist.length > 5) {
      // Keep rules with lowest cleanStreak
      checklist.sort((a, b) => a.cleanStreak - b.cleanStreak);
      state.errorLedger.checklist = checklist.slice(0, 5);
    }
  }

  /**
   * Retrieves the current active Pre-Flight Checklist rules.
   * Rules are retired once cleanStreak >= 3.
   */
  public static getPreFlightChecklist(): PreFlightChecklistRule[] {
    const state = this.loadState();
    if (!state.errorLedger || !Array.isArray(state.errorLedger.checklist)) {
      return [];
    }
    return state.errorLedger.checklist.filter(r => r.cleanStreak < 3);
  }

  /**
   * Marks a pre-flight checklist rule as clean in a submission.
   * When cleanStreak reaches >= 3, the rule is retired.
   */
  public static markChecklistRuleClean(ruleId: string): boolean {
    const state = this.loadState();
    if (!state.errorLedger) return false;
    const rule = state.errorLedger.checklist.find(r => r.id === ruleId);
    if (!rule) return false;

    rule.cleanStreak += 1;
    this.saveState(state);
    return rule.cleanStreak >= 3;
  }

  public static getErrorRecords(): ErrorTaxonomyRecord[] {
    const state = this.loadState();
    return Object.values(state.errorLedger?.records || {});
  }

  public static getErrorRemediationQueue(): ErrorTaxonomyRecord[] {
    const state = this.loadState();
    const records = Object.values(state.errorLedger?.records || {});
    return records.filter(r => r.status === 'active' || r.status === 'in_remediation');
  }

  public static resolveErrorRecord(errorId: string): void {
    const state = this.loadState();
    if (!state.errorLedger || !state.errorLedger.records[errorId]) return;
    const rec = state.errorLedger.records[errorId];
    if (rec.status !== 'resolved') {
      rec.status = 'resolved';
      state.errorLedger.totalResolved += 1;
      this.saveState(state);
    }
  }

  // =========================================================================
  // COMPUTERIZED ADAPTIVE TESTING (CAT) STATE PERSISTENCE
  // =========================================================================

  public static getCatProfile(skill?: SkillId): CatAssessmentRecord | Record<SkillId, CatAssessmentRecord> | null {
    const state = this.loadState();
    const profiles = state.catProfiles || {};
    if (skill) {
      return profiles[skill] || null;
    }
    return profiles as Record<SkillId, CatAssessmentRecord>;
  }

  public static saveCatProfile(skill: SkillId, record: CatAssessmentRecord): void {
    const state = this.loadState();
    if (!state.catProfiles) {
      state.catProfiles = {};
    }
    state.catProfiles[skill] = record;
    // Align skillLevels with CAT calibrated level
    if (!state.skillLevels) {
      state.skillLevels = this.migratedSkillLevels(state, state.learnerLevel);
    }
    state.skillLevels[skill] = record.calibratedLevel;
    this.saveState(state);
  }

  private static syncEngine: ProfileSyncEngineAdapter | null = null;

  public static registerSyncEngine(engine: ProfileSyncEngineAdapter): void {
    this.syncEngine = engine;
  }

  public static exportBackup(): string {
    const state = this.loadState();
    return JSON.stringify(state, null, 2);
  }

  public static exportUnifiedProfile(triggerDownload: boolean = true): string {
    if (this.syncEngine) {
      return this.syncEngine.exportProfile(triggerDownload);
    }
    if (typeof (globalThis as any).ProfileSyncEngine !== 'undefined') {
      return (globalThis as any).ProfileSyncEngine.exportProfile(triggerDownload);
    }
    return this.exportBackup();
  }

  public static importUnifiedProfile(jsonStr: string, mode: ImportMode = 'overwrite'): ImportResult {
    if (this.syncEngine) {
      return this.syncEngine.importProfile(jsonStr, mode);
    }
    if (typeof (globalThis as any).ProfileSyncEngine !== 'undefined') {
      return (globalThis as any).ProfileSyncEngine.importProfile(jsonStr, mode);
    }
    const success = this.importBackup(jsonStr);
    return {
      success,
      mode,
      detectedVersion: 4,
      migratedFromLegacy: true,
      itemsRestored: { singularityCards: 0, ieltsKeys: 0, errorRecords: 0 }
    };
  }

  public static importBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString) as any;
      if (parsed && typeof parsed === 'object') {
        // Transparently handle v5 UnifiedProfile envelope
        if (parsed.version === 5 || parsed.singularity) {
          const res = this.importUnifiedProfile(jsonString, 'overwrite');
          return res.success;
        }

        // Handle v1-v4 backup formats
        if (parsed.cardStates || parsed.learnerLevel) {
          if (!isCefr(parsed.learnerLevel)) this.seedLegacyTreeProgress(parsed);
          const migratedLevel = this.migratedLevel(parsed);
          this.saveState({
            ...DEFAULT_STATE,
            ...parsed,
            version: CURRENT_VERSION,
            learnerLevel: migratedLevel,
            skillLevels: this.migratedSkillLevels(parsed, migratedLevel),
            skillProfileHistory: Array.isArray(parsed.skillProfileHistory) ? parsed.skillProfileHistory : [],
            placementDone: parsed.placementDone ?? !isCefr(parsed.learnerLevel),
            errorLedger: this.migratedErrorLedger(parsed),
            catProfiles: parsed.catProfiles || {}
          });
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('[STORAGE] Import backup failed:', err);
      return false;
    }
  }

  public static resetAll(): void {
    this.cachedState = { ...DEFAULT_STATE };
    this.saveState(this.cachedState);
  }
}
