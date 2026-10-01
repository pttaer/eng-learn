/**
 * RPG PROGRESSION ENGINE
 * Singleton managing player XP, Level (Level = Math.floor(Math.sqrt(xp / 100)) + 1),
 * consecutive day streak calculation, and 3 daily quests.
 * Persists to localStorage key: 'eng_progression_v1'.
 * Zero external dependencies.
 */

import { AudioSynthesizer } from './audio-synthesizer';
import { StorageManager } from '../utils/storage';

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  xpReward: number;
  completed: boolean;
  category: 'srs' | 'copywork' | 'studio' | 'reading' | 'grammar' | string;
}

export interface ProgressionState {
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string; // ISO format 'YYYY-MM-DD'
  lastQuestDate?: string; // ISO format 'YYYY-MM-DD'
  quests: DailyQuest[];
}

export interface LevelInfo {
  level: number;
  xp: number;
  currentLevelBaseXP: number;
  nextLevelXP: number;
  progressInLevel: number;
  spanInLevel: number;
  percentage: number;
  rankTitle: string;
}

export const STORAGE_KEY = 'eng_progression_v1';

export const DEFAULT_DAILY_QUESTS: DailyQuest[] = [
  {
    id: 'quest_srs_colloc',
    title: 'Lexicon & SRS Drill',
    description: 'Review 15 Collocations or Spaced Repetition flashcards',
    current: 0,
    target: 15,
    xpReward: 50,
    completed: false,
    category: 'srs'
  },
  {
    id: 'quest_copywork',
    title: 'Franklin Copywork',
    description: 'Complete 1 Benjamin Franklin rhetorical writing session',
    current: 0,
    target: 1,
    xpReward: 75,
    completed: false,
    category: 'copywork'
  },
  {
    id: 'quest_studio_drill',
    title: 'Acoustic or Syntactic Studio',
    description: 'Complete 1 Speaking 4-3-2 take, Transcription, or Grammar matrix',
    current: 0,
    target: 1,
    xpReward: 75,
    completed: false,
    category: 'studio'
  }
];

export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateLevelFromXP(xp: number): number {
  const validXp = Math.max(0, xp || 0);
  return Math.floor(Math.sqrt(validXp / 100)) + 1;
}

export function getRankTitle(level: number): string {
  if (level <= 1) return 'NOVICE INITIATE';
  if (level <= 2) return 'APPRENTICE SCHOLAR';
  if (level <= 4) return 'ADEPT LINGUIST';
  if (level <= 6) return 'RHETORICAL PRACTITIONER';
  if (level <= 9) return 'C2 SYNTACTIC MASTER';
  return 'APEX C2 SCHOLAR';
}

export class ProgressionEngine {
  private static instance: ProgressionEngine | null = null;
  private state: ProgressionState;
  private listeners: Set<(state: ProgressionState) => void> = new Set();

  private constructor() {
    this.state = this.loadInitialState();
  }

  public static getInstance(): ProgressionEngine {
    if (!this.instance) {
      this.instance = new ProgressionEngine();
    }
    return this.instance;
  }

  // Static Convenience Facade
  public static getState(): ProgressionState {
    return this.getInstance().getState();
  }

  public static getLevelInfo(): LevelInfo {
    return this.getInstance().getLevelInfo();
  }

  public static addXP(amount: number): void {
    this.getInstance().addXP(amount);
  }

  public static recordActivity(category: string, amount: number = 1): void {
    this.getInstance().recordActivity(category, amount);
  }

  public static onProgressUpdate(callback: (state: ProgressionState) => void): () => void {
    return this.getInstance().onProgressUpdate(callback);
  }

  public static resetDailyQuests(): void {
    this.getInstance().resetDailyQuests();
  }

  public static resetAll(): void {
    this.getInstance().resetAll();
  }

  private loadInitialState(): ProgressionState {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<ProgressionState>;
          if (parsed && typeof parsed.xp === 'number') {
            const xp = Math.max(0, parsed.xp);
            const level = calculateLevelFromXP(xp);
            const loadedState: ProgressionState = {
              xp,
              level,
              streak: Math.max(0, parsed.streak || 0),
              lastActiveDate: parsed.lastActiveDate || '',
              lastQuestDate: parsed.lastQuestDate || getTodayString(),
              quests: Array.isArray(parsed.quests) && parsed.quests.length === 3
                ? parsed.quests
                : JSON.parse(JSON.stringify(DEFAULT_DAILY_QUESTS))
            };

            // Check if day changed to reset daily quests
            const today = getTodayString();
            if (loadedState.lastQuestDate && loadedState.lastQuestDate !== today) {
              loadedState.quests = JSON.parse(JSON.stringify(DEFAULT_DAILY_QUESTS));
              loadedState.lastQuestDate = today;
            }

            return loadedState;
          }
        }
      }
    } catch (err) {
      console.warn('[PROGRESSION] Failed to parse localStorage state:', err);
    }

    // Default Fresh State
    let initialStreak = 0;
    let initialLastActive = '';
    try {
      const storageState = StorageManager.loadState();
      if (storageState?.streak?.currentStreak) {
        initialStreak = storageState.streak.currentStreak;
        initialLastActive = storageState.streak.lastActiveDate || '';
      }
    } catch {
      // StorageManager unavailable or not initialized
    }

    const defaultState: ProgressionState = {
      xp: 0,
      level: 1,
      streak: initialStreak,
      lastActiveDate: initialLastActive,
      lastQuestDate: getTodayString(),
      quests: JSON.parse(JSON.stringify(DEFAULT_DAILY_QUESTS))
    };

    this.persist(defaultState);
    return defaultState;
  }

  private persist(stateToSave: ProgressionState): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      }
    } catch (err) {
      console.error('[PROGRESSION] Failed to save state to localStorage:', err);
    }
  }

  public getState(): ProgressionState {
    return {
      ...this.state,
      quests: this.state.quests.map(q => ({ ...q }))
    };
  }

  public getLevelInfo(): LevelInfo {
    const xp = this.state.xp;
    const level = this.state.level;
    const currentLevelBaseXP = Math.pow(level - 1, 2) * 100;
    const nextLevelXP = Math.pow(level, 2) * 100;
    const progressInLevel = Math.max(0, xp - currentLevelBaseXP);
    const spanInLevel = Math.max(1, nextLevelXP - currentLevelBaseXP);
    const percentage = Math.min(100, Math.max(0, Math.round((progressInLevel / spanInLevel) * 100)));
    const rankTitle = getRankTitle(level);

    return {
      level,
      xp,
      currentLevelBaseXP,
      nextLevelXP,
      progressInLevel,
      spanInLevel,
      percentage,
      rankTitle
    };
  }

  public touchStreak(): void {
    const today = getTodayString();
    if (this.state.lastActiveDate === today) {
      return;
    }

    const yesterday = getYesterdayString();
    if (this.state.lastActiveDate === yesterday) {
      this.state.streak += 1;
    } else if (!this.state.lastActiveDate) {
      this.state.streak = 1;
    } else {
      this.state.streak = 1;
    }

    this.state.lastActiveDate = today;
  }

  public addXP(amount: number, touch: boolean = true): void {
    if (amount <= 0) return;

    if (touch) {
      this.touchStreak();
    }

    const oldLevel = this.state.level;
    this.state.xp += amount;
    this.state.level = calculateLevelFromXP(this.state.xp);

    const leveledUp = this.state.level > oldLevel;
    if (leveledUp) {
      try {
        AudioSynthesizer.play('level-up');
        if (typeof window !== 'undefined' && (window as any).ParticleCanvas) {
          (window as any).ParticleCanvas.burst();
        }
      } catch {
        // Safe fallback in test environments
      }
    } else {
      try {
        AudioSynthesizer.playXpPickup();
      } catch {
        // Safe fallback in test environments
      }
    }

    this.persist(this.state);
    this.notifyListeners();
  }

  public recordActivity(category: string, amount: number = 1): void {
    if (amount <= 0) return;
    this.touchStreak();

    let updatedAny = false;
    let completedAny = false;

    // Normalize category
    const cat = category.toLowerCase().trim();

    for (const quest of this.state.quests) {
      if (quest.completed) continue;

      const matches =
        quest.category === cat ||
        (quest.category === 'srs' && (cat === 'colloc' || cat === 'vocab' || cat === 'srs' || cat === 'flashcard')) ||
        (quest.category === 'studio' && (cat === 'speech' || cat === 'speaking' || cat === 'listening' || cat === 'grammar' || cat === 'studio')) ||
        (quest.category === 'copywork' && (cat === 'writing' || cat === 'copywork'));

      if (matches) {
        quest.current = Math.min(quest.target, quest.current + amount);
        updatedAny = true;

        if (quest.current >= quest.target && !quest.completed) {
          quest.completed = true;
          completedAny = true;
          // Award XP bonus for quest completion
          this.addXP(quest.xpReward, false);
        }
      }
    }

    if (completedAny) {
      try {
        AudioSynthesizer.play('absorb');
        if (typeof window !== 'undefined' && (window as any).ParticleCanvas) {
          (window as any).ParticleCanvas.burst();
        }
      } catch {
        // Safe fallback
      }
    }

    if (updatedAny) {
      this.persist(this.state);
      this.notifyListeners();
    }
  }

  public resetDailyQuests(): void {
    this.state.quests = JSON.parse(JSON.stringify(DEFAULT_DAILY_QUESTS));
    this.state.lastQuestDate = getTodayString();
    this.persist(this.state);
    this.notifyListeners();
  }

  public resetAll(): void {
    this.state = {
      xp: 0,
      level: 1,
      streak: 0,
      lastActiveDate: '',
      lastQuestDate: getTodayString(),
      quests: JSON.parse(JSON.stringify(DEFAULT_DAILY_QUESTS))
    };
    this.persist(this.state);
    this.notifyListeners();
  }

  public onProgressUpdate(callback: (state: ProgressionState) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(): void {
    const currentState = this.getState();
    this.listeners.forEach((callback) => {
      try {
        callback(currentState);
      } catch (err) {
        console.error('[PROGRESSION] Error in progress listener:', err);
      }
    });
  }
}
