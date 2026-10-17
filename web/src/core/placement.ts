import { Cefr, CEFR_ORDER } from './cefr';
import { pickDecoys } from './decoys';

export type PlacementSkill = 'vocab' | 'collocation' | 'grammar' | 'reading';

export interface PlacementQuestion {
  level: Cefr;
  kind: PlacementSkill;
  prompt: string;
  context: string;
  options: string[];
  answer: number;
}

export interface WordItem {
  cefrLevel: string;
  wordOrChunk?: string;
  prompt?: string;
  vietnamese?: string;
  contextSentence?: string;
  definition?: string;
  [key: string]: any;
}

export interface PhraseItem {
  cefrLevel: string;
  phrase?: string;
  prompt?: string;
  vietnamese?: string;
  example?: string;
  [key: string]: any;
}

/** Curated multiple-choice grammar item (diagnostic-questions.json shape). */
export interface GrammarItem {
  level: string;
  prompt: string;
  context?: string;
  options: string[];
  answer: number;
  [key: string]: any;
}

export interface ReadingItem {
  cefrLevel: string;
  title?: string;
  content?: string;
  fourPassProtocol?: {
    pass3SentenceMining?: Array<{
      targetWord: string;
      contextSentence: string;
      vietnamese?: string;
      definition?: string;
    }>;
  };
  targetWord?: string;
  contextSentence?: string;
  vietnamese?: string;
  [key: string]: any;
}

export const QUESTIONS_PER_LEVEL = 4;
export const PASS_MARK = 3;

function shuffle<T>(list: T[], rng: () => number): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function toQuestion(
  level: Cefr,
  kind: PlacementSkill,
  prompt: string,
  context: string,
  correct: string,
  distractors: string[],
  rng: () => number
): PlacementQuestion {
  const options = shuffle([correct, ...distractors], rng);
  return { level, kind, prompt, context, options, answer: options.indexOf(correct) };
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Blanks the target word in its sentence; null when the word isn't there as a whole word (the blank would be fake). */
function blankOut(sentence: string, target: string): string | null {
  const re = new RegExp('\\b' + escapeRe(target) + '\\b', 'i');
  return re.test(sentence) ? sentence.replace(re, '[ _____ ]') : null;
}

/**
 * Builds exactly 24 diagnostic placement questions (4 per level A1-C2):
 * 1. Vocab: word -> meaning, decoys are related meanings of same-level words
 * 2. Collocation: phrase -> meaning, decoys are related same-level phrases
 * 3. Grammar: curated multiple-choice item for the level
 * 4. Reading: mini-passage cloze, decoys share the target's part of speech
 */
export function buildQuestions(
  words: WordItem[],
  phrases: PhraseItem[],
  grammarItems: GrammarItem[] = [],
  readingArticles: any = [],
  rng: () => number = Math.random
): PlacementQuestion[] {
  const out: PlacementQuestion[] = [];
  const normalizedReading: ReadingItem[] = Array.isArray(readingArticles)
    ? readingArticles
    : (readingArticles && Array.isArray((readingArticles as any).articles) ? (readingArticles as any).articles : []);

  const minedItems: Array<{ level: string; targetWord: string; contextSentence: string; partOfSpeech?: string; title?: string }> = [];
  for (const art of normalizedReading) {
    const mined = art.fourPassProtocol?.pass3SentenceMining;
    const list = Array.isArray(mined) ? mined : (art.targetWord && art.contextSentence ? [art] : []);
    for (const m of list) {
      if (m.targetWord && m.contextSentence) {
        minedItems.push({ level: art.cefrLevel, targetWord: m.targetWord.trim(), contextSentence: m.contextSentence, partOfSpeech: (m as any).partOfSpeech, title: art.title });
      }
    }
  }

  for (const level of CEFR_ORDER) {
    // 1. Vocabulary Question
    const w = words.filter(x => x.cefrLevel === level && x.wordOrChunk && x.vietnamese);
    if (w.length > 0) {
      const selected = shuffle(w, rng)[0];
      const decoys = pickDecoys(selected, words, 3, {
        answer: x => x.vietnamese || '',
        text: x => x.wordOrChunk || '',
        bonus: x => (x.cefrLevel === level ? 4 : 0) + (x.mode && x.mode === selected.mode ? 2 : 0)
      }, rng);
      out.push(toQuestion(level, 'vocab', selected.wordOrChunk!, selected.contextSentence || '', selected.vietnamese!, decoys.map(x => x.vietnamese!), rng));
    }

    // 2. Collocation Question
    const p = phrases.filter(x => x.cefrLevel === level && x.phrase && x.vietnamese);
    if (p.length > 0) {
      const selected = shuffle(p, rng)[0];
      const decoys = pickDecoys(selected, phrases, 3, {
        answer: x => x.vietnamese || '',
        text: x => x.phrase || '',
        bonus: x => (x.cefrLevel === level ? 4 : 0) + (x.category && x.category === selected.category ? 2 : 0)
      }, rng);
      out.push(toQuestion(level, 'collocation', selected.phrase!, selected.example || '', selected.vietnamese!, decoys.map(x => x.vietnamese!), rng));
    }

    // 3. Grammar Question: curated items whose distractors were written for that exact sentence
    const g = grammarItems.filter(x => x.level === level && Array.isArray(x.options) && x.options.length > 1);
    if (g.length > 0) {
      const selected = shuffle(g, rng)[0];
      const correct = selected.options[selected.answer];
      out.push(toQuestion(level, 'grammar', selected.prompt, selected.context || '', correct, selected.options.filter(o => o !== correct), rng));
    }

    // 4. Reading Cloze Question
    // Decoys share the part of speech but come from other passages: words from the same passage often fit the blank too.
    const clozeDecoys = (m: typeof minedItems[number]) => pickDecoys(m, minedItems, 3, {
      answer: x => x.targetWord,
      accept: x => x.title !== m.title && (!m.partOfSpeech || x.partOfSpeech === m.partOfSpeech),
      bonus: x => (x.level === level ? 4 : 0)
    }, rng);
    const cloze = shuffle(minedItems.filter(m => m.level === level && blankOut(m.contextSentence, m.targetWord)), rng);
    const selected = cloze.find(m => clozeDecoys(m).length === 3);
    if (selected) {
      const decoys = clozeDecoys(selected);
      const context = selected.title ? `From passage: "${selected.title}"` : 'Reading cloze comprehension';
      out.push(toQuestion(level, 'reading', blankOut(selected.contextSentence, selected.targetWord)!, context, selected.targetWord, decoys.map(m => m.targetWord), rng));
    }
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
