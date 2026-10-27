import { IeltsQuestion, TextOffsetRange, WordConstraint } from './types';
import { isCorrect, norm } from './scoring';

export { norm };

export function parseWordConstraint(text: string): WordConstraint | null {
  if (!text) return null;

  // 1. Strict "NO MORE THAN ONE WORD..."
  const m1 = text.match(/NO MORE THAN ONE WORD(?:\s+AND\/OR A NUMBER)?/i);
  if (m1) return { maxWords: 1, allowNumber: /NUMBER/i.test(m1[0]) };

  // 2. Strict "NO MORE THAN TWO WORDS..."
  const m2 = text.match(/NO MORE THAN TWO WORDS(?:\s+AND\/OR A NUMBER)?/i);
  if (m2) return { maxWords: 2, allowNumber: /NUMBER/i.test(m2[0]) };

  // 3. Strict "NO MORE THAN THREE WORDS..."
  const m3 = text.match(/NO MORE THAN THREE WORDS(?:\s+AND\/OR A NUMBER)?/i);
  if (m3) return { maxWords: 3, allowNumber: /NUMBER/i.test(m3[0]) };

  // 4. "A NUMBER ONLY" / "ONE NUMBER ONLY"
  const m4 = text.match(/\b(?:A|ONE)\s+NUMBER\s+ONLY\b/i);
  if (m4) return { maxWords: 0, allowNumber: true };

  // 5. "ONE WORD ONLY" / "ONE WORD"
  const m5 = text.match(/\bONE WORD(?:\s+ONLY)?(?:\s+AND\/OR A NUMBER)?\b/i);
  if (m5) return { maxWords: 1, allowNumber: /NUMBER/i.test(m5[0]) };

  return null;
}

export function countWordsAndNumbers(text: string): { words: number; numbers: number; total: number } {
  const cleaned = text
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .trim();
  const rawTokens = cleaned.split(/\s+/).filter(Boolean);
  let words = 0;
  let numbers = 0;
  for (const t of rawTokens) {
    // Strip trailing sentence punctuation attached to words or numbers
    const cleanToken = t.replace(/[.,;!?]+$/, '');
    if (!cleanToken) continue;
    // Numbers: digits, decimals, thousands separators, percentages, currency symbols, and simple ranges (e.g. 10-15)
    if (/^[$£€]?\d+(?:[.,]\d+)*%?$|^\d+-\d+$/.test(cleanToken)) {
      numbers++;
    } else {
      words++;
    }
  }
  return { words, numbers, total: words + numbers };
}

export function countWords(text: string): number {
  return countWordsAndNumbers(text).words;
}

export function isWithinLimit(answer: string, maxWords: number | null, allowNumber: boolean = true): boolean {
  if (maxWords == null) return true;
  const { words, numbers, total } = countWordsAndNumbers(answer);
  if (total === 0) return true;
  if (numbers > (allowNumber ? 1 : 0)) return false;
  return words <= maxWords;
}

export type MissReason = 'correct' | 'exceeded_limit' | 'wrong';

export function resolveQuestionWordConstraint(q: IeltsQuestion): WordConstraint | null {
  if (q.maxWords !== undefined && q.allowNumber !== undefined) {
    return { maxWords: q.maxWords, allowNumber: q.allowNumber };
  }
  if (q.maxWords !== undefined) {
    return { maxWords: q.maxWords, allowNumber: q.allowNumber ?? true };
  }
  const parsed = parseWordConstraint(q.instruction || q.prompt);
  if (parsed) return parsed;
  const isCompletion = ['complete', 'sentence', 'summary', 'table', 'short'].includes(q.type);
  if (isCompletion) {
    return { maxWords: 3, allowNumber: true };
  }
  return null;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function explainMiss(q: IeltsQuestion, given: string): MissReason {
  if (isCorrect(q, given)) return 'correct';
  const constraint = resolveQuestionWordConstraint(q);
  const maxWords = constraint ? constraint.maxWords : (q.maxWords ?? null);
  const allowNumber = constraint ? constraint.allowNumber : (q.allowNumber ?? true);

  if (!isWithinLimit(given, maxWords, allowNumber)) {
    const normGiven = norm(given);
    const accepted = Array.isArray(q.answer) ? q.answer : [q.answer];
    if (accepted.some(a => {
      const na = norm(a);
      if (!na) return false;
      // Match as whole tokens/phrases rather than arbitrary substrings (e.g. avoid 'art' in 'smart')
      const pattern = new RegExp(`(?:^|\\s)${escapeRegex(na)}(?:\\s|$)`);
      return pattern.test(normGiven);
    })) {
      return 'exceeded_limit';
    }
  }
  return 'wrong';
}

export function mergeHighlightRanges(ranges: TextOffsetRange[]): TextOffsetRange[] {
  if (!ranges || !ranges.length) return [];
  const valid = ranges.filter(r => r.start < r.end && r.start >= 0);
  if (!valid.length) return [];

  const sorted = [...valid].sort((a, b) => {
    if (a.paraIndex !== b.paraIndex) return a.paraIndex - b.paraIndex;
    if (a.start !== b.start) return a.start - b.start;
    return a.end - b.end;
  });

  const merged: TextOffsetRange[] = [{ ...sorted[0] }];

  for (let i = 1; i < sorted.length; i++) {
    const prev = merged[merged.length - 1];
    const curr = sorted[i];

    if (curr.paraIndex === prev.paraIndex && curr.start <= prev.end) {
      prev.end = Math.max(prev.end, curr.end);
    } else {
      merged.push({ ...curr });
    }
  }

  return merged;
}

export interface ParagraphSlice {
  text: string;
  start: number;
  end: number;
  isMark: boolean;
  isEvidence: boolean;
}

export function getParagraphSlices(
  text: string,
  userMarks: TextOffsetRange[] = [],
  transientEvidence?: TextOffsetRange
): ParagraphSlice[] {
  if (!text) return [];

  const boundarySet = new Set<number>([0, text.length]);

  for (const m of userMarks) {
    if (m.start >= 0 && m.start <= text.length) boundarySet.add(m.start);
    if (m.end >= 0 && m.end <= text.length) boundarySet.add(m.end);
  }

  if (transientEvidence) {
    if (transientEvidence.start >= 0 && transientEvidence.start <= text.length) {
      boundarySet.add(transientEvidence.start);
    }
    if (transientEvidence.end >= 0 && transientEvidence.end <= text.length) {
      boundarySet.add(transientEvidence.end);
    }
  }

  const boundaries = Array.from(boundarySet).sort((a, b) => a - b);
  const slices: ParagraphSlice[] = [];

  for (let i = 0; i < boundaries.length - 1; i++) {
    const b0 = boundaries[i];
    const b1 = boundaries[i + 1];
    if (b0 >= b1) continue;

    const sliceText = text.slice(b0, b1);
    const isEvidence = !!transientEvidence && b0 >= transientEvidence.start && b1 <= transientEvidence.end;
    const isMark = userMarks.some(m => b0 >= m.start && b1 <= m.end);

    slices.push({
      text: sliceText,
      start: b0,
      end: b1,
      isMark,
      isEvidence,
    });
  }

  return slices;
}

export function renderParagraphSpans(
  text: string,
  userMarks: TextOffsetRange[] = [],
  transientEvidence?: TextOffsetRange
): DocumentFragment {
  const frag = document.createDocumentFragment();
  const slices = getParagraphSlices(text, userMarks, transientEvidence);

  for (const slice of slices) {
    if (!slice.isMark && !slice.isEvidence) {
      frag.appendChild(document.createTextNode(slice.text));
    } else {
      const span = document.createElement('span');
      if (slice.isEvidence && slice.isMark) {
        span.className = 'ie-evidence ie-mark';
      } else if (slice.isEvidence) {
        span.className = 'ie-evidence';
      } else {
        span.className = 'ie-mark';
      }
      span.textContent = slice.text;
      span.dataset.start = String(slice.start);
      span.dataset.end = String(slice.end);
      frag.appendChild(span);
    }
  }

  return frag;
}

export function renderParagraph(
  text: string,
  userMarks: TextOffsetRange[] = [],
  transientEvidence?: TextOffsetRange
): HTMLElement {
  const p = document.createElement('p');
  p.appendChild(renderParagraphSpans(text, userMarks, transientEvidence));
  return p;
}
