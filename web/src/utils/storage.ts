import { Cefr, isCefr } from '../core/cefr';
import { SKILL_BRANCHES } from '../core/skill-tree-data';
import { SRSCardState } from '../core/srs-engine';

export type SkillId = 'vocab' | 'grammar' | 'reading' | 'listening' | 'writing' | 'speaking';

export const ALL_SKILLS: readonly SkillId[] = ['vocab', 'grammar', 'reading', 'listening', 'writing', 'speaking'];

export interface SkillProfile {
  overall: Cefr;
  skills: Record<SkillId, Cefr>;
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
}

const STORAGE_KEY = 'STARK_ENG_STATE';
export const CURRENT_VERSION = 3;

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
  notificationsEnabled: false
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
        cardStates: parsed.cardStates || {}
      };
      if (parsed.version !== CURRENT_VERSION || !parsed.skillLevels) {
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

  public static exportBackup(): string {
    const state = this.loadState();
    return JSON.stringify(state, null, 2);
  }

  public static importBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString) as AppStorageState;
      if (parsed && typeof parsed === 'object' && parsed.cardStates) {
        if (!isCefr(parsed.learnerLevel)) this.seedLegacyTreeProgress(parsed);
        const migratedLevel = this.migratedLevel(parsed);
        this.saveState({
          ...DEFAULT_STATE,
          ...parsed,
          version: CURRENT_VERSION,
          learnerLevel: migratedLevel,
          skillLevels: this.migratedSkillLevels(parsed, migratedLevel),
          skillProfileHistory: Array.isArray(parsed.skillProfileHistory) ? parsed.skillProfileHistory : [],
          placementDone: parsed.placementDone ?? !isCefr(parsed.learnerLevel)
        });
        return true;
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
