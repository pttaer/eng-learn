/**
 * Picks "related-but-wrong" distractors for generated quiz questions.
 * Candidates are ranked by closeness to the target (shared English words plus caller bonuses
 * such as same category or level), and any candidate whose meaning overlaps the target's is
 * dropped, because a synonym would be a second correct answer.
 */

const EN_STOP = new Set(['a', 'an', 'the', 'to', 'of', 'in', 'on', 'for', 'with', 'and', 'or', 'at', 'by', 'from', 'sb', 'sth', 'one', 'be', 'is', 'it', 'your', 'my']);
const VN_STOP = new Set(['sự', 'việc', 'của', 'một', 'những', 'các', 'cho', 'và', 'với', 'được', 'bị', 'là', 'có', 'đến', 'tới', 'ra']);

function enWords(s: string): Set<string> {
  return new Set(s.toLowerCase().split(/[^a-z']+/).filter(w => w && !EN_STOP.has(w)));
}

function syllables(s: string): Set<string> {
  return new Set(s.toLowerCase().split(/[\s,;/()."'-]+/).filter(w => w && !VN_STOP.has(w)));
}

/**
 * True when two meanings would both count as correct: one sense's syllables all appear in another sense
 * ("đi xe buýt" / "đi bằng xe buýt", "vui" / "vui vẻ"). Related senses like "cảm thấy vui" / "cảm thấy buồn" pass.
 */
export function meaningsOverlap(a: string, b: string): boolean {
  const senses = (s: string) => s.toLowerCase().split(/[,;/]/).map(x => syllables(x.replace(/\(.*?\)/g, ''))).filter(x => x.size > 0);
  const subset = (x: Set<string>, y: Set<string>) => Array.from(x).every(t => y.has(t));
  const sb = senses(b);
  return senses(a).some(x => sb.some(y => subset(x, y) || subset(y, x)));
}

/** Shared Vietnamese syllables: "cảm thấy vui" and "cảm thấy buồn" are related meanings. */
function sharedSyllables(a: string, b: string): number {
  const tb = syllables(b);
  let shared = 0;
  syllables(a).forEach(t => { if (tb.has(t)) shared++; });
  return shared;
}

export interface DecoyOptions<T> {
  /** Text shown as the option; must differ from the target's. */
  answer: (x: T) => string;
  /** English text used to measure relatedness (shared content words). */
  text?: (x: T) => string;
  /** Meaning compared against the target to reject synonyms; defaults to `answer`. */
  meaning?: (x: T) => string;
  /** Extra closeness, e.g. +2 same category, +1 same level. */
  bonus?: (x: T) => number;
  /** Hard filter, e.g. same part of speech. */
  accept?: (x: T) => boolean;
}

export function pickDecoys<T>(target: T, pool: T[], n: number, opts: DecoyOptions<T>, rng: () => number = Math.random): T[] {
  const meaning = opts.meaning || opts.answer;
  const targetAnswer = opts.answer(target).trim().toLowerCase();
  const targetMeaning = meaning(target);
  const targetWords = opts.text ? enWords(opts.text(target)) : new Set<string>();

  const seen = new Set([targetAnswer]);
  const ranked: Array<{ item: T; score: number }> = [];
  for (const item of pool) {
    if (item === target) continue;
    const ans = opts.answer(item)?.trim();
    if (!ans || seen.has(ans.toLowerCase())) continue;
    if (opts.accept && !opts.accept(item)) continue;
    if (meaningsOverlap(meaning(item), targetMeaning)) continue;
    seen.add(ans.toLowerCase());

    let score = opts.bonus ? opts.bonus(item) : 0;
    if (opts.text) {
      enWords(opts.text(item)).forEach(w => { if (targetWords.has(w)) score += 3; });
    }
    score += Math.min(3, sharedSyllables(meaning(item), targetMeaning));
    ranked.push({ item, score: score + rng() * 0.5 });
  }

  ranked.sort((a, b) => b.score - a.score);
  // Shuffle a slightly wider window than needed so the same target doesn't always get the same decoys.
  const window = ranked.slice(0, n + 2);
  for (let i = window.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [window[i], window[j]] = [window[j], window[i]];
  }
  // Two decoys with the same meaning ("full-time job" / "a full-time job") eliminate each other, so skip twins.
  const picked: T[] = [];
  for (const { item } of window.concat(ranked.slice(n + 2))) {
    if (picked.length === n) break;
    if (!picked.some(p => meaningsOverlap(meaning(p), meaning(item)))) picked.push(item);
  }
  return picked;
}
