import { IeltsQuestion } from './types';

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s.%-]/g, '').replace(/\s+/g, ' ').trim().replace(/\.+$/, '');

export function isCorrect(q: IeltsQuestion, given: string): boolean {
  const g = norm(given);
  if (!g) return false;
  const accepted = Array.isArray(q.answer) ? q.answer : [q.answer];
  return accepted.some(a => norm(a) === g);
}

export interface SetScore {
  raw: number;
  of: number;
  byType: Record<string, { ok: number; n: number }>;
  wrong: string[];
}

export function scoreSet(questions: IeltsQuestion[], answers: Record<string, string>): SetScore {
  const byType: SetScore['byType'] = {};
  const wrong: string[] = [];
  let raw = 0;
  for (const q of questions) {
    const t = (byType[q.type] ||= { ok: 0, n: 0 });
    t.n++;
    if (isCorrect(q, answers[q.id] || '')) { raw++; t.ok++; } else wrong.push(q.id);
  }
  return { raw, of: questions.length, byType, wrong };
}
