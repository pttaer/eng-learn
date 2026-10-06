// IELTS progress lives in its own localStorage key; the CEFR app's state is never touched.
const KEY = 'IELTS_STATE';

export type Skill = 'listening' | 'reading' | 'writing' | 'speaking';

export interface Attempt {
  skill: Skill;
  date: string;
  itemId: string;
  band: number;
  /** listening/reading: raw score out of `of`; writing/speaking: self-rating mean (estimate) */
  raw?: number;
  of?: number;
  byType?: Record<string, { ok: number; n: number }>;
  mock?: boolean;
  estimate?: boolean;
}

interface State { attempts: Attempt[] }

function read(): State {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (s && Array.isArray(s.attempts)) return s;
  } catch { /* private mode or corrupt: start empty */ }
  return { attempts: [] };
}

export function addAttempt(a: Omit<Attempt, 'date'>): void {
  const s = read();
  s.attempts.push({ ...a, date: new Date().toISOString() });
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage full or blocked */ }
}

export const attempts = (): Attempt[] => read().attempts;

/** Mean band of the last `n` attempts for a skill, or null when none. */
export function recentBand(skill: Skill, n = 3, mockOnly = false): number | null {
  const list = attempts().filter(a => a.skill === skill && (!mockOnly || a.mock)).slice(-n);
  if (!list.length) return null;
  return Math.round((list.reduce((t, a) => t + a.band, 0) / list.length) * 2) / 2;
}

/** 7.0-ready: last 2 mocks of Listening and Reading each >= 7, Writing and Speaking estimates >= 6.5. Estimates alone never certify. */
export function readiness(): { ready: boolean; lines: string[] } {
  const last2 = (skill: Skill) => attempts().filter(a => a.skill === skill && a.mock).slice(-2);
  const lines: string[] = [];
  let ready = true;
  for (const skill of ['listening', 'reading'] as const) {
    const l = last2(skill);
    const ok = l.length === 2 && l.every(a => a.band >= 7);
    if (!ok) ready = false;
    lines.push(`${skill}: ${l.length < 2 ? `${l.length}/2 mocks taken` : `last 2 mocks ${l.map(a => a.band).join(', ')}`}${ok ? ' (pass)' : ' (need 7.0 twice)'}`);
  }
  for (const skill of ['writing', 'speaking'] as const) {
    const b = recentBand(skill, 3);
    const ok = b !== null && b >= 6.5;
    if (!ok) ready = false;
    lines.push(`${skill}: ${b === null ? 'no estimate yet' : `estimate ${b}`}${ok ? ' (pass)' : ' (need 6.5+)'}`);
  }
  return { ready, lines };
}
