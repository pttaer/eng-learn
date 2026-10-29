// Guided 7.0 study path: pure logic, no DOM and no storage, so the verifier can run it under Node.
// Rules are written up in docs/curriculum/ielts_path.md; keep the two in step.
import type { Skill } from './progress';
export type { Skill };

export const SKILLS: Skill[] = ['listening', 'reading', 'writing', 'speaking'];
export const TARGET = 7;
export const ROUTE: Record<Skill, string> = { listening: '#listening', reading: '#reading', writing: '#writing', speaking: '#speaking' };
/** Focus skill for the roadmap: Reading, by choice. The learner does not yet trust the other skills' results. */
export const FOCUS: Skill = 'reading';

export type Placement = Partial<Record<Skill, number>>;
export interface WeekPlan { week: number; skill: Skill; task: string; route: string }
export interface Attempt { skill: Skill; band: number; mock?: boolean }

const TASKS = ['strategy cards', 'skill drill', 'vocabulary review', 'full mock'];

/** Start band: mean of the bands passed in, rounded to the nearest half band. Untested skills are left out. */
export function estimateStart(p: Placement): number | null {
  const v = SKILLS.map(s => p[s]).filter((x): x is number => typeof x === 'number');
  if (!v.length) return null;
  return Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 2) / 2;
}

/** Current band per skill: mean of the last 3 attempts. Listening and Reading use mocks only, as the gate does. Placement is the fallback until a skill has such an attempt. */
export function currentBands(att: Attempt[], placement: Placement): Placement {
  const out: Placement = {};
  for (const s of SKILLS) {
    const mockOnly = s === 'listening' || s === 'reading';
    const last = att.filter(a => a.skill === s && (!mockOnly || a.mock)).slice(-3);
    const v = last.length ? last.reduce((t, a) => t + a.band, 0) / last.length : placement[s];
    if (typeof v === 'number') out[s] = v;
  }
  return out;
}

/** Current target band: defaults to TARGET (7), reads from localStorage when available. */
export function getTarget(): number {
  if (typeof localStorage !== 'undefined') {
    const val = parseFloat(localStorage.getItem('eng_target_band') || '7.0');
    return (!isNaN(val) && val >= 5.5 && val <= 8.5) ? val : TARGET;
  }
  return TARGET;
}

/** 6 weeks per band below target band (a half band gives 3), capped at 24. At target or above there are no weeks left. */
export function weeksFor(start: number, target: number = getTarget()): number {
  const gap = Math.max(0, target - start);
  return Math.min(24, Math.round(gap * 6));
}

/** Weeks left. 0 only once all four gates pass; until then at least 4 weeks, one full task cycle ending in a mock. */
export function roadmapWeeks(start: number, att: Attempt[], target: number = getTarget()): number {
  if (SKILLS.every(s => gate(s, att).ok)) return 0;
  return Math.max(4, weeksFor(start, target));
}

/** Lowest placement band. An untested skill counts as weakest so it is tested first. */
export function weakestSkill(p: Placement): Skill {
  const rank = (s: Skill) => p[s] ?? -1;
  return [...SKILLS].sort((a, b) => rank(a) - rank(b))[0];
}

/** The weakest skill gets two weeks in every three; the others take turns in the third. Task types rotate every week. */
export function roadmap(weeks: number, weakest: Skill): WeekPlan[] {
  const others = SKILLS.filter(s => s !== weakest);
  return Array.from({ length: weeks }, (_, i) => {
    const week = i + 1;
    const skill = week % 3 === 0 ? others[(week / 3 - 1) % others.length] : weakest;
    const task = TASKS[(week - 1) % TASKS.length];
    const route = task === 'full mock' ? '#mock' : task === 'vocabulary review' ? '#vocab' : ROUTE[skill];
    return { week, skill, task, route };
  });
}

/** First week not yet marked done, or null when the whole roadmap is finished. */
export function nextTask(plan: WeekPlan[], done: number[]): WeekPlan | null {
  return plan.find(w => !done.includes(w.week)) ?? null;
}

/** Roadmap that adds 4-week cycles once every week is marked done. Call only while a gate is still red. */
export function extendedRoadmap(weeks: number, weakest: Skill, done: number[]): WeekPlan[] {
  let plan = roadmap(weeks, weakest);
  while (!nextTask(plan, done)) plan = roadmap(plan.length + 4, weakest);
  return plan;
}

/** Readiness gate per skill. Listening and Reading: last two mocks at 7.0+. Writing and Speaking: recent estimate at 6.5+. */
export function gate(skill: Skill, att: Attempt[]): { have: number; need: number; ok: boolean } {
  if (skill === 'listening' || skill === 'reading') {
    const last2 = att.filter(a => a.skill === skill && a.mock).slice(-2);
    const have = last2.filter(a => a.band >= TARGET).length;
    return { have, need: 2, ok: have === 2 };
  }
  const mine = att.filter(a => a.skill === skill).slice(-3);
  const mean = mine.length ? mine.reduce((t, a) => t + a.band, 0) / mine.length : 0;
  const ok = mine.length > 0 && mean >= 6.5;
  return { have: ok ? 1 : 0, need: 1, ok };
}

/** The earliest attempt per skill is the placement. */
export function placementFrom(att: Attempt[]): Placement {
  const p: Placement = {};
  for (const a of att) if (p[a.skill] === undefined) p[a.skill] = a.band;
  return p;
}
