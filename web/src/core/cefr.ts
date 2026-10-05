export type Cefr = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export const CEFR_ORDER: readonly Cefr[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const CEFR_LABELS: Record<Cefr, string> = {
  A1: 'A1 Beginner',
  A2: 'A2 Elementary',
  B1: 'B1 Intermediate',
  B2: 'B2 Upper-intermediate',
  C1: 'C1 Advanced',
  C2: 'C2 Mastery'
};

export function isCefr(value: unknown): value is Cefr {
  return typeof value === 'string' && (CEFR_ORDER as readonly string[]).includes(value);
}

export function cefrIndex(level: Cefr): number {
  return CEFR_ORDER.indexOf(level);
}

/** The learner's level if it has content, else the nearest level that does (tie goes to the lower level). */
export function effectiveLevel(level: Cefr, available: ReadonlySet<Cefr>): Cefr {
  if (available.has(level) || available.size === 0) return level;
  const target = cefrIndex(level);
  let best: Cefr = level;
  let bestDist = Infinity;
  for (const c of CEFR_ORDER) {
    if (!available.has(c)) continue;
    const d = Math.abs(cefrIndex(c) - target);
    if (d < bestDist) { best = c; bestDist = d; }
  }
  return best;
}

/** Numeric difficulty tier the SRS engine understands (>= 3 starts with the harder ease factor). */
export function srsTier(level: Cefr): number {
  return level === 'C2' ? 3 : level === 'C1' ? 2 : 1;
}
