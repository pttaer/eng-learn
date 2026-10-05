import { Cefr, CEFR_ORDER } from './cefr';

export interface PlacementQuestion {
  level: Cefr;
  kind: 'word' | 'phrase';
  prompt: string;
  context: string;
  options: string[];
  answer: number;
}

interface Source {
  cefrLevel: string;
  vietnamese: string;
}

interface WordItem extends Source { wordOrChunk: string; contextSentence: string }
interface PhraseItem extends Source { phrase: string; example?: string }

export const QUESTIONS_PER_LEVEL = 3;
export const PASS_MARK = 2;

function shuffle<T>(list: T[], rng: () => number): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function toQuestion(level: Cefr, kind: 'word' | 'phrase', prompt: string, context: string, correct: string, pool: string[], rng: () => number): PlacementQuestion {
  const distractors = shuffle(pool.filter(v => v !== correct), rng).slice(0, 3);
  const options = shuffle([correct, ...distractors], rng);
  return { level, kind, prompt, context, options, answer: options.indexOf(correct) };
}

/** Three questions per level that has enough content: two words and one phrase, meaning chosen among Vietnamese glosses of the same level. */
export function buildQuestions(words: WordItem[], phrases: PhraseItem[], rng: () => number = Math.random): PlacementQuestion[] {
  const out: PlacementQuestion[] = [];
  for (const level of CEFR_ORDER) {
    const w = words.filter(x => x.cefrLevel === level);
    const p = phrases.filter(x => x.cefrLevel === level);
    if (w.length < 2 || p.length < 1) continue;
    const pool = [...w, ...p].map(x => x.vietnamese);
    shuffle(w, rng).slice(0, 2).forEach(x => out.push(toQuestion(level, 'word', x.wordOrChunk, x.contextSentence, x.vietnamese, pool, rng)));
    const ph = shuffle(p, rng)[0];
    out.push(toQuestion(level, 'phrase', ph.phrase, ph.example || '', ph.vietnamese, pool, rng));
  }
  return out;
}

/** Highest level passed (>= PASS_MARK correct), stopping at the first level that is not; A1 if none. */
export function placeLevel(correctByLevel: Partial<Record<Cefr, number>>): Cefr {
  let placed: Cefr = 'A1';
  for (const level of CEFR_ORDER) {
    if ((correctByLevel[level] ?? 0) >= PASS_MARK) placed = level;
    else break;
  }
  return placed;
}
