import { Cefr, CEFR_ORDER } from './cefr';

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

export interface GrammarItem {
  cefrLevel: string;
  promptSentence?: string;
  prompt?: string;
  targetTransformation?: string;
  grammaticalCue?: string;
  vietnamese?: string;
  formula?: string;
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
  pool: string[],
  rng: () => number
): PlacementQuestion {
  const uniquePool = Array.from(new Set(pool.filter(v => typeof v === 'string' && v.trim() !== '' && v !== correct)));
  const distractors = shuffle(uniquePool, rng).slice(0, 3);
  let padIdx = 1;
  while (distractors.length < 3) {
    const filler = `${level} option ${padIdx++}`;
    if (!distractors.includes(filler) && filler !== correct) {
      distractors.push(filler);
    }
  }
  const options = shuffle([correct, ...distractors], rng);
  return { level, kind, prompt, context, options, answer: options.indexOf(correct) };
}

/**
 * Builds exactly 24 diagnostic placement questions (4 per level A1-C2):
 * 1. Vocab: Vocabulary definition / meaning
 * 2. Collocation: Phrase completion / meaning
 * 3. Grammar: Syntactic transformation / cue
 * 4. Reading: Mini-passage cloze comprehension
 */
export function buildQuestions(
  words: WordItem[],
  phrases: PhraseItem[],
  grammarRules: GrammarItem[] = [],
  readingArticles: any = [],
  rng: () => number = Math.random
): PlacementQuestion[] {
  const out: PlacementQuestion[] = [];
  const normalizedReading: ReadingItem[] = Array.isArray(readingArticles)
    ? readingArticles
    : (readingArticles && Array.isArray((readingArticles as any).articles) ? (readingArticles as any).articles : []);

  for (const level of CEFR_ORDER) {
    // 1. Vocabulary Question
    const w = words.filter(x => x.cefrLevel === level);
    if (w.length > 0) {
      const selected = shuffle(w, rng)[0];
      const prompt = selected.wordOrChunk || selected.prompt || `${level} Word`;
      const context = selected.contextSentence || selected.definition || '';
      const correct = selected.vietnamese || selected.definition || prompt;
      const pool = w.map(x => x.vietnamese || x.definition || x.wordOrChunk).filter(Boolean) as string[];
      out.push(toQuestion(level, 'vocab', prompt, context, correct, pool, rng));
    }

    // 2. Collocation Question
    const p = phrases.filter(x => x.cefrLevel === level);
    if (p.length > 0) {
      const selected = shuffle(p, rng)[0];
      const prompt = selected.phrase || selected.prompt || `${level} Collocation`;
      const context = selected.example || '';
      const correct = selected.vietnamese || prompt;
      const pool = p.map(x => x.vietnamese || x.phrase).filter(Boolean) as string[];
      out.push(toQuestion(level, 'collocation', prompt, context, correct, pool, rng));
    }

    // 3. Grammar Question
    const g = grammarRules.filter(x => x.cefrLevel === level);
    if (g.length > 0) {
      const selected = shuffle(g, rng)[0];
      const prompt = selected.promptSentence || selected.prompt || `${level} Grammar Prompt`;
      const context = selected.grammaticalCue || selected.formula || 'Syntactic transformation';
      const correct = selected.targetTransformation || selected.vietnamese || prompt;
      const pool = g.map(x => x.targetTransformation || x.vietnamese).filter(Boolean) as string[];
      out.push(toQuestion(level, 'grammar', prompt, context, correct, pool, rng));
    } else {
      // Fallback if grammar rules not provided
      const fallbackPool = w.map(x => x.vietnamese || x.wordOrChunk).filter(Boolean) as string[];
      out.push(toQuestion(level, 'grammar', `${level} Grammar structure`, 'Choose the correct form', `${level} grammatical resolution`, fallbackPool, rng));
    }

    // 4. Reading Cloze Question
    const r = normalizedReading.filter(x => x.cefrLevel === level);
    const minedItems: Array<{ targetWord: string; contextSentence: string; title?: string }> = [];

    for (const art of r) {
      if (art.fourPassProtocol?.pass3SentenceMining && Array.isArray(art.fourPassProtocol.pass3SentenceMining)) {
        for (const m of art.fourPassProtocol.pass3SentenceMining) {
          if (m.targetWord && m.contextSentence) {
            minedItems.push({ targetWord: m.targetWord, contextSentence: m.contextSentence, title: art.title });
          }
        }
      } else if (art.targetWord && art.contextSentence) {
        minedItems.push({ targetWord: art.targetWord, contextSentence: art.contextSentence, title: art.title });
      }
    }

    if (minedItems.length > 0) {
      const selected = shuffle(minedItems, rng)[0];
      const target = selected.targetWord.trim();
      let promptSentence = selected.contextSentence;
      const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp('\\b' + escaped + '\\b', 'i');
      if (re.test(promptSentence)) {
        promptSentence = promptSentence.replace(re, '[ _____ ]');
      } else {
        promptSentence = promptSentence.replace(target, '[ _____ ]');
      }
      const context = selected.title ? `From passage: "${selected.title}"` : 'Reading cloze comprehension';
      const correct = target;
      const pool = minedItems.map(m => m.targetWord.trim()).filter(Boolean);
      out.push(toQuestion(level, 'reading', promptSentence, context, correct, pool, rng));
    } else {
      // Fallback: build reading cloze from words of that level
      const poolWords = w.filter(x => x.wordOrChunk && x.contextSentence);
      if (poolWords.length > 0) {
        const selected = shuffle(poolWords, rng)[0];
        const target = (selected.wordOrChunk || '').trim();
        let promptSentence = selected.contextSentence || '';
        const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp('\\b' + escaped + '\\b', 'i');
        if (re.test(promptSentence)) {
          promptSentence = promptSentence.replace(re, '[ _____ ]');
        } else {
          promptSentence = `${promptSentence} [ _____ ]`;
        }
        const context = 'Reading cloze comprehension';
        const correct = target;
        const pool = poolWords.map(x => (x.wordOrChunk || '').trim()).filter(Boolean);
        out.push(toQuestion(level, 'reading', promptSentence, context, correct, pool, rng));
      } else {
        const fallbackWord = `${level} target`;
        out.push(toQuestion(level, 'reading', `Sentence with [ _____ ] in context.`, 'Reading cloze', fallbackWord, [`${level} opt1`, `${level} opt2`, `${level} opt3`], rng));
      }
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
