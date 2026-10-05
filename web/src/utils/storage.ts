import { Cefr, isCefr } from '../core/cefr';
import { SRSCardState } from '../core/srs-engine';

export interface AppStorageState {
  version: number;
  learnerLevel: Cefr;
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
}

const STORAGE_KEY = 'STARK_ENG_STATE';
const CURRENT_VERSION = 2;

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const DEFAULT_STATE: AppStorageState = {
  version: CURRENT_VERSION,
  learnerLevel: 'A1',
  soundMuted: false,
  cardStates: {},
  streak: {
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: ''
  },
  habitProgress: {},
  totalCardsReviewed: 0,
  lastSyncTimestamp: Date.now()
};

export class StorageManager {
  private static cachedState: AppStorageState | null = null;

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
      this.cachedState = {
        ...DEFAULT_STATE,
        ...parsed,
        version: CURRENT_VERSION,
        learnerLevel: this.migratedLevel(parsed),
        streak: { ...DEFAULT_STATE.streak, ...(parsed.streak || {}) },
        habitProgress: parsed.habitProgress || {},
        cardStates: parsed.cardStates || {}
      };
      return this.cachedState;
    } catch (err) {
      console.error('[STORAGE] Failed to parse localStorage state, resetting to default.', err);
      this.cachedState = { ...DEFAULT_STATE };
      return this.cachedState;
    }
  }

  // v1 states have no learnerLevel; those users were already working at B2+, so start them at B2
  private static migratedLevel(parsed: Partial<AppStorageState>): Cefr {
    return isCefr(parsed.learnerLevel) ? parsed.learnerLevel : 'B2';
  }

  public static getLearnerLevel(): Cefr {
    return this.loadState().learnerLevel;
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

  public static exportBackup(): string {
    const state = this.loadState();
    return JSON.stringify(state, null, 2);
  }

  public static importBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString) as AppStorageState;
      if (parsed && typeof parsed === 'object' && parsed.cardStates) {
        this.saveState({
          ...DEFAULT_STATE,
          ...parsed,
          version: CURRENT_VERSION,
          learnerLevel: this.migratedLevel(parsed)
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
