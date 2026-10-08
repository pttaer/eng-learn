// Fluency metrics from the acoustic engine's RMS energy envelope. Local DSP only, no speech recognition.
// Thresholds match AcousticEngine.detectSilenceGaps (0.02 energy, 0.25 s gap) so the numbers agree.

export interface Fluency {
  speakingSec: number;   // from first to last voiced frame (leading/trailing silence ignored)
  pauses: number;        // silent gaps >= 0.25 s inside the talk
  longPauses: number;    // gaps >= 1 s: the "effortful searching" a band 7 avoids
  meanRunSec: number;    // mean stretch of speech between pauses
  syllables: number;     // energy peaks, a rough syllable count
  estWpm: number;        // syllables / 1.5 per word; an estimate, not a transcript
}

const FRAME = 0.05;
const THRESH = 0.02;

export function fluency(energy: number[], frameSec = FRAME, thresh = THRESH): Fluency {
  const first = energy.findIndex(e => e >= thresh);
  const last = energy.length - 1 - [...energy].reverse().findIndex(e => e >= thresh);
  if (first < 0) return { speakingSec: 0, pauses: 0, longPauses: 0, meanRunSec: 0, syllables: 0, estWpm: 0 };
  const e = energy.slice(first, last + 1);
  const minGap = Math.ceil(0.25 / frameSec);
  const longGap = Math.ceil(1 / frameSec);
  let pauses = 0, longPauses = 0, run = 0;
  for (let i = 0; i <= e.length; i++) {
    if (i < e.length && e[i] < thresh) { run++; continue; }
    if (run >= minGap) pauses++;
    if (run >= longGap) longPauses++;
    run = 0;
  }
  // Syllable nuclei: a local energy maximum that rises clearly above the dip since the previous nucleus.
  let syllables = 0, dip = Infinity, armed = true;
  for (let i = 1; i < e.length - 1; i++) {
    dip = Math.min(dip, e[i]);
    const peak = e[i] >= thresh && e[i] > e[i - 1] && e[i] >= e[i + 1];
    if (peak && (armed || e[i] - dip >= 0.3 * e[i])) { syllables++; dip = e[i]; armed = false; }
    if (e[i] < thresh) armed = true;
  }
  const speakingSec = e.length * frameSec;
  const r = (x: number): number => Math.round(x * 10) / 10;
  return {
    speakingSec: r(speakingSec),
    pauses,
    longPauses,
    meanRunSec: r(speakingSec / (pauses + 1)),
    syllables,
    estWpm: speakingSec ? Math.round((syllables / 1.5) * (60 / speakingSec)) : 0
  };
}

/** Plain-language hint. A hint only: the band comes from the learner's own rubric rating. */
export function fluencyNote(f: Fluency): string {
  const perMin = f.speakingSec ? (f.longPauses * 60) / f.speakingSec : 0;
  const pace = f.estWpm < 90 ? 'Your pace is slow; aim to keep talking in longer stretches.' : f.estWpm > 190 ? 'Your pace is very fast; slow down so stress and chunking stay clear.' : 'Your pace is in a natural range.';
  const gaps = perMin > 4 ? 'Many pauses over 1 second: band 7 speaks at length without noticeable effort.' : perMin > 2 ? 'Some long pauses: use fillers like "let me think" or rephrase instead of stopping.' : 'Few long pauses.';
  return `${pace} ${gaps}`;
}
