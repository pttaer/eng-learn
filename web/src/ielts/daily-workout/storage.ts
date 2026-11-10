import { DailyWorkoutProgressState, StepCompletionRecord, WorkoutStreakData } from './types';

const WORKOUT_STATE_KEY = 'IELTS_DAILY_WORKOUT_STATE';
const WORKOUT_STREAK_KEY = 'IELTS_DAILY_WORKOUT_STREAK';

export class DailyWorkoutStorage {
  public static getTodayDateKey(date: Date = new Date()): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  public static loadWorkoutState(dateKey: string = this.getTodayDateKey()): DailyWorkoutProgressState {
    try {
      const raw = localStorage.getItem(WORKOUT_STATE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DailyWorkoutProgressState;
        if (parsed && parsed.dateKey === dateKey) {
          return parsed;
        }
      }
    } catch {
      /* storage blocked or corrupt: return empty state */
    }
    return {
      dateKey,
      timeBudget: 30,
      completedStepIndexes: [],
      stepRecords: {},
      completed: false
    };
  }

  public static saveWorkoutState(state: DailyWorkoutProgressState): void {
    try {
      localStorage.setItem(WORKOUT_STATE_KEY, JSON.stringify(state));
    } catch {
      /* storage quota exceeded or disabled */
    }
  }

  public static markStepComplete(
    dateKey: string,
    stepIndex: number,
    record: StepCompletionRecord,
    totalSteps: number = 4
  ): DailyWorkoutProgressState {
    const state = this.loadWorkoutState(dateKey);
    if (!state.completedStepIndexes.includes(stepIndex)) {
      state.completedStepIndexes.push(stepIndex);
      state.completedStepIndexes.sort((a, b) => a - b);
    }
    state.stepRecords[stepIndex] = record;

    if (state.completedStepIndexes.length >= totalSteps) {
      state.completed = true;
      state.completedAt = Date.now();
      this.incrementStreak(dateKey);
    }

    this.saveWorkoutState(state);
    return state;
  }

  public static getWorkoutStreak(): WorkoutStreakData {
    try {
      const raw = localStorage.getItem(WORKOUT_STREAK_KEY);
      if (raw) {
        const data = JSON.parse(raw) as WorkoutStreakData;
        if (data && typeof data.currentStreak === 'number') {
          return data;
        }
      }
    } catch {
      /* fallback on fresh data */
    }
    return { currentStreak: 0, lastCompletedDate: null, totalWorkoutsCompleted: 0 };
  }

  public static incrementStreak(todayDateKey: string): WorkoutStreakData {
    const streakData = this.getWorkoutStreak();
    if (streakData.lastCompletedDate === todayDateKey) {
      return streakData; // Already credited today
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = this.getTodayDateKey(yesterday);

    if (streakData.lastCompletedDate === yesterdayKey) {
      streakData.currentStreak += 1;
    } else {
      streakData.currentStreak = 1;
    }

    streakData.lastCompletedDate = todayDateKey;
    streakData.totalWorkoutsCompleted += 1;

    try {
      localStorage.setItem(WORKOUT_STREAK_KEY, JSON.stringify(streakData));
    } catch {
      /* storage blocked */
    }
    return streakData;
  }
}
