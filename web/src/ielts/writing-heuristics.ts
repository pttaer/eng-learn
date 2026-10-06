// Offline writing checks. These flag objective, countable features; they never claim to be a band score.
export interface WritingReport {
  words: number;
  paragraphs: number;
  sentences: number;
  avgSentenceLength: number;
  lexicalDiversity: number; // unique words / total words over the first 250 words
  linkers: string[];
  complexSentences: number;
  passives: number;
  repeated: { word: string; count: number }[];
  hasOverview: boolean;
  hasPosition: boolean;
  flags: string[];
}

const LINKERS = ['however', 'moreover', 'furthermore', 'in addition', 'therefore', 'consequently', 'whereas', 'while', 'although', 'despite', 'in contrast', 'on the other hand', 'for example', 'for instance', 'as a result', 'in conclusion', 'overall', 'nevertheless', 'similarly', 'by contrast', 'in particular', 'as well as', 'in summary'];
const SUBORD = /\b(which|who|whom|whose|although|though|whereas|while|because|since|unless|if|when|whilst|so that)\b/i;
const PASSIVE = /\b(is|are|was|were|be|been|being)\s+(\w+ed|\w+en|made|built|seen|done|taken|given|shown|known|found|held|kept|set|put)\b/gi;
const STOP = new Set('the a an and or but of to in on at for with by from as is are was were be been it its this that these those they their them he she his her we our you your i not no can could will would should may might have has had do does did there which who what more most than then also very such'.split(' '));
const OVERVIEW = /\b(overall|in general|in summary|to summari[sz]e|generally)\b/i;
const POSITION = /\b(i (strongly |firmly |partly |largely )?(agree|disagree|believe|think|feel|would argue|am convinced)|in my (opinion|view)|this essay|my view|should|must|outweigh|outweighs|argue|arguably|undoubtedly|clearly)\b/i;

export function analyse(text: string, task: 1 | 2): WritingReport {
  const clean = text.trim();
  const tokens = (clean.toLowerCase().match(/[a-z'-]+/g) || []);
  const words = clean ? clean.split(/\s+/).length : 0;
  const paragraphs = clean ? clean.split(/\n\s*\n/).filter(p => p.trim()).length : 0;
  const sents = clean.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 2);
  const lengths = sents.map(s => s.split(/\s+/).length);
  const avg = lengths.length ? lengths.reduce((a, b) => a + b, 0) / lengths.length : 0;
  const first = tokens.slice(0, 250);
  const diversity = first.length ? new Set(first).size / first.length : 0;
  const lower = clean.toLowerCase();
  const linkers = LINKERS.filter(l => new RegExp(`\\b${l}\\b`).test(lower));
  const counts = new Map<string, number>();
  tokens.filter(t => t.length > 3 && !STOP.has(t)).forEach(t => counts.set(t, (counts.get(t) || 0) + 1));
  const repeated = [...counts.entries()].filter(([, c]) => c >= 5).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([word, count]) => ({ word, count }));
  const complexSentences = sents.filter(s => SUBORD.test(s)).length;
  const passives = (clean.match(PASSIVE) || []).length;
  const hasOverview = OVERVIEW.test(clean);
  const hasPosition = POSITION.test(clean);

  const min = task === 1 ? 150 : 250;
  const flags: string[] = [];
  if (words < min) flags.push(`Under length: ${words}/${min} words. Short answers lose Task ${task === 1 ? 'Achievement' : 'Response'} marks.`);
  if (task === 1 && words > 0 && !hasOverview) flags.push('No overview found. Add one sentence starting "Overall," that states the main trend or contrast. Band 7 needs a clear overview.');
  if (task === 2 && words > 0 && !hasPosition) flags.push('Could not detect a clear position (we look for stance words such as should, must, I believe). State your view in the introduction and repeat it in the conclusion.');
  if (task === 2 && paragraphs > 0 && paragraphs < 4) flags.push(`${paragraphs} paragraph(s). Use 4-5: introduction, two body paragraphs, conclusion.`);
  if (task === 1 && paragraphs > 0 && paragraphs < 3) flags.push(`${paragraphs} paragraph(s). Use intro, overview, and two detail paragraphs.`);
  if (words >= 60 && linkers.length < 4) flags.push(`Only ${linkers.length} distinct linking phrases. Aim for 5+ without overusing any.`);
  if (words >= 60 && complexSentences < Math.max(3, sents.length * 0.3)) flags.push('Few complex sentences. Mix in relative clauses, concession (although/whereas) and conditionals.');
  if (task === 1 && words >= 60 && passives === 0) flags.push('No passives found. Process and map answers usually need them.');
  if (avg > 28) flags.push(`Average sentence length ${avg.toFixed(0)} words. Very long sentences risk grammar errors.`);
  if (words >= 100 && diversity < 0.5) flags.push(`Lexical diversity ${diversity.toFixed(2)} (below 0.50). Vary your vocabulary.`);
  if (repeated.length) flags.push(`Repeated words: ${repeated.map(r => `${r.word} x${r.count}`).join(', ')}. Use synonyms or restructure.`);

  return { words, paragraphs, sentences: sents.length, avgSentenceLength: Math.round(avg * 10) / 10, lexicalDiversity: Math.round(diversity * 100) / 100, linkers, complexSentences, passives, repeated, hasOverview, hasPosition, flags };
}

export const RUBRIC = {
  task1: ['Task Achievement', 'Coherence & Cohesion', 'Lexical Resource', 'Grammatical Range & Accuracy'],
  task2: ['Task Response', 'Coherence & Cohesion', 'Lexical Resource', 'Grammatical Range & Accuracy'],
  speaking: ['Fluency & Coherence', 'Lexical Resource', 'Grammatical Range & Accuracy', 'Pronunciation']
};

/** Band descriptors (condensed from the public IELTS band descriptors) shown beside each self-rating. */
export const DESCRIPTORS: Record<number, string> = {
  5: 'Partial: basic ideas, limited range, frequent errors, some repetition or weak organisation.',
  6: 'Competent: addresses the task, some development, adequate range, errors that rarely block meaning.',
  7: 'Good: clear position/overview, well-developed ideas, flexible vocabulary and complex grammar, occasional errors.',
  8: 'Very good: fully developed, precise vocabulary, wide grammatical range, rare errors.'
};

/** Estimate = mean of 4 self-ratings, minus 0.5 when under the minimum length. Always an estimate. */
export function estimateBand(ratings: number[], words: number, task: 1 | 2): number {
  const mean = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  const penalty = words < (task === 1 ? 150 : 250) ? 0.5 : 0;
  return Math.max(0, Math.round((mean - penalty) * 2) / 2);
}
