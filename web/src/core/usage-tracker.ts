/**
 * Time-in-app and practice-answer counters. Local only, stored in localStorage 'eng_usage_v1'.
 * - Time counts only while the page is visible and the learner touched it in the last 2 minutes.
 * - Answers come from the feedback hub's stats channel (practice mode only; exam answers never reach channels).
 * - Counts are kept as pending deltas and merged into storage on each flush, so the main app and the IELTS
 *   app (same origin, same storage) do not overwrite each other's totals.
 */

export const USAGE_STORAGE_KEY = 'eng_usage_v1';

const TICK_MS = 15_000;
const IDLE_MS = 2 * 60_000;
const FLUSH_MS = 60_000;

interface UsageStored {
  totalMs: number;
  answers: number;
  day: string;
  todayMs: number;
}

export interface UsageSummary {
  hours: number;
  todayMinutes: number;
  answers: number;
}

/** Local calendar day as YYYY-MM-DD (not UTC), so "today" matches the learner's clock. */
export function localDayKey(date: Date = new Date()): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

function read(): UsageStored {
  const day = localDayKey();
  const fresh: UsageStored = { totalMs: 0, answers: 0, day, todayMs: 0 };
  try {
    const raw = localStorage.getItem(USAGE_STORAGE_KEY);
    if (!raw) return fresh;
    const s = JSON.parse(raw) as Partial<UsageStored>;
    return {
      totalMs: Number(s.totalMs) || 0,
      answers: Number(s.answers) || 0,
      day,
      todayMs: s.day === day ? Number(s.todayMs) || 0 : 0,
    };
  } catch {
    return fresh;
  }
}

function write(s: UsageStored): void {
  try {
    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(s));
  } catch {
    // Storage blocked or full: keep counting in memory for this session
  }
}

export class UsageTracker {
  private static timer: ReturnType<typeof setInterval> | null = null;
  private static lastTick = 0;
  private static lastInput = 0;
  private static lastFlush = 0;
  private static pendingMs = 0;
  private static pendingAnswers = 0;
  private static isInitialized = false;

  public static start(): void {
    if (typeof window === 'undefined') return;
    const now = Date.now();
    this.lastTick = now;
    this.lastInput = now;
    this.lastFlush = now;

    if (!this.isInitialized) {
      this.isInitialized = true;
      const touch = () => {
        this.lastInput = Date.now();
        if (this.timer === null && (typeof document === 'undefined' || document.visibilityState === 'visible')) {
          this.resumeTimer();
        }
      };
      ['pointerdown', 'keydown', 'touchstart', 'wheel'].forEach(name =>
        window.addEventListener(name, touch, { passive: true })
      );
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'hidden') {
            this.flush();
            this.stopTimer();
          } else {
            this.resumeTimer();
          }
        });
      }
      window.addEventListener('pagehide', () => {
        this.flush();
        this.stopTimer();
      });
    }

    this.resumeTimer();
  }

  private static resumeTimer(): void {
    if (this.timer !== null || typeof window === 'undefined') return;
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
    this.lastTick = Date.now();
    this.timer = setInterval(() => this.tick(), TICK_MS);
  }

  private static stopTimer(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private static tick(): void {
    const now = Date.now();
    const elapsed = now - this.lastTick;
    this.lastTick = now;
    if (document.visibilityState === 'visible' && now - this.lastInput <= IDLE_MS) {
      // Cap one tick so a throttled background timer cannot add a long gap
      this.pendingMs += Math.min(elapsed, TICK_MS * 2);
    }
    if (now - this.lastFlush >= FLUSH_MS) this.flush();

    // Zero-CPU idle suspension: pause timer if idle beyond IDLE_MS or tab hidden
    if (now - this.lastInput > IDLE_MS || document.visibilityState === 'hidden') {
      this.flush();
      this.stopTimer();
    }
  }

  public static recordAnswer(): void {
    this.pendingAnswers += 1;
  }

  public static flush(): void {
    if (this.pendingMs === 0 && this.pendingAnswers === 0) return;
    const s = read();
    s.totalMs += this.pendingMs;
    s.todayMs += this.pendingMs;
    s.answers += this.pendingAnswers;
    write(s);
    this.pendingMs = 0;
    this.pendingAnswers = 0;
    this.lastFlush = Date.now();
  }

  public static summary(): UsageSummary {
    const s = read();
    return {
      hours: (s.totalMs + this.pendingMs) / 3_600_000,
      todayMinutes: (s.todayMs + this.pendingMs) / 60_000,
      answers: s.answers + this.pendingAnswers,
    };
  }
}
