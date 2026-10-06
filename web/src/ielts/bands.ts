// Official Academic raw-score -> band tables (out of 40). Lower bound of each band, highest first.
const READING: [number, number][] = [[39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6], [19, 5.5], [15, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5]];
const LISTENING: [number, number][] = [[39, 9], [37, 8.5], [35, 8], [32, 7.5], [30, 7], [26, 6.5], [23, 6], [18, 5.5], [16, 5], [13, 4.5], [10, 4], [7, 3.5], [5, 3], [3, 2.5]];

/** Band for a raw score; scores out of fewer than 40 questions are scaled to 40. */
export function rawToBand(skill: 'listening' | 'reading', raw: number, of = 40): number {
  const scaled = of === 40 ? raw : Math.round((raw / of) * 40);
  const table = skill === 'reading' ? READING : LISTENING;
  const hit = table.find(([min]) => scaled >= min);
  return hit ? hit[1] : 2;
}

/** IELTS overall: mean of the four bands, rounded to nearest half band (.25 and .75 round up). */
export function averageBands(bands: number[]): number {
  const mean = bands.reduce((a, b) => a + b, 0) / bands.length;
  return Math.round(mean * 2) / 2;
}
