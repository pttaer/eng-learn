// Offline writing checks. These flag objective, countable features; they never claim to be a band score.
export interface WritingReport {
  words: number;
  paragraphs: number;
  sentences: number;
  avgSentenceLength: number;
  lexicalDiversity: number; // unique words / total words over the first 250 words
  linkers: string[];
  overusedLinkers: string[];
  complexSentences: number;
  passives: number;
  repeated: { word: string; count: number }[];
  hasOverview: boolean;
  hasPosition: boolean;
  positionInIntro: boolean;
  positionInConclusion: boolean;
  hasConclusion: boolean;
  speculation: string[];
  /** Distinct 6-word sequences copied from the prompt. */
  promptCopies: number;
  /** Share of the prompt's key words (first 5 letters) that the answer uses; 1 when no prompt given. */
  topicCoverage: number;
  flags: string[];
}

const LINKERS = ['however', 'moreover', 'furthermore', 'in addition', 'therefore', 'consequently', 'whereas', 'while', 'although', 'despite', 'in contrast', 'on the other hand', 'for example', 'for instance', 'as a result', 'in conclusion', 'overall', 'nevertheless', 'similarly', 'by contrast', 'in particular', 'as well as', 'in summary'];
const SUBORD = /\b(which|who|whom|whose|although|though|whereas|while|because|since|unless|if|when|whilst|so that)\b/i;
const PASSIVE = /\b(is|are|was|were|be|been|being)\s+(\w+ed|\w+en|made|built|seen|done|taken|given|shown|known|found|held|kept|set|put)\b/gi;
const STOP = new Set('the a an and or but of to in on at for with by from as is are was were be been it its this that these those they their them he she his her we our you your i not no can could will would should may might have has had do does did there which who what more most than then also very such'.split(' '));
// Words an IELTS prompt always contains; they say nothing about the topic.
const PROMPT_STOP = new Set('give reasons answer include relevant examples knowledge experience summarise information selecting reporting features make comparisons where discuss both views opinion extent agree disagree people some others believe think argue what which why the below shows chart graph table diagram illustrates become becoming increasingly significant recent years common countries many nations modern society evaluate decide whether overall impact positive negative determine consider important issue address effectively their your these those'.split(' '));
const OVERVIEW = /\b(overall|in general|in summary|to summari[sz]e|generally)\b/i;
const POSITION = /\b(i (strongly |firmly |partly |largely |fully |completely )?(agree|disagree|believe|think|feel|would argue|am convinced)|in my (opinion|view)|this essay|my view|should|must|outweigh|outweighs|argue|arguably|undoubtedly|clearly)\b/i;
const CONCLUSION = /\b(in conclusion|to conclude|to sum up|in summary|on balance|all things considered|overall|in short|to summari[sz]e)\b/i;
// Task 1 reports what the visual shows; reasons and opinions are not in the data.
const SPECULATION = /\b(i think|i believe|in my opinion|due to|because of|driven by|caused by|reflecting|probably|likely because|this suggests|suggesting that|this shows that people)\b/gi;

const paras = (text: string): string[] => text.trim().split(/\n\s*\n/).filter(p => p.trim());
const wordList = (text: string): string[] => text.toLowerCase().match(/[a-z'-]+/g) || [];
const grams = (w: string[], n: number): Set<string> => new Set(w.slice(0, Math.max(0, w.length - n + 1)).map((_, i) => w.slice(i, i + n).join(' ')));

export function analyse(text: string, task: 1 | 2, prompt = ''): WritingReport {
  const clean = text.trim();
  const tokens = wordList(clean);
  const words = clean ? clean.split(/\s+/).length : 0;
  const parts = paras(clean);
  const paragraphs = parts.length;
  const sents = clean.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 2);
  const lengths = sents.map(s => s.split(/\s+/).length);
  const avg = lengths.length ? lengths.reduce((a, b) => a + b, 0) / lengths.length : 0;
  const first = tokens.slice(0, 250);
  const diversity = first.length ? new Set(first).size / first.length : 0;
  const lower = clean.toLowerCase();
  const linkerCount = (l: string): number => (lower.match(new RegExp(`\\b${l}\\b`, 'g')) || []).length;
  const linkers = LINKERS.filter(l => linkerCount(l) > 0);
  const overusedLinkers = linkers.filter(l => linkerCount(l) > 3);
  const counts = new Map<string, number>();
  tokens.filter(t => t.length > 3 && !STOP.has(t)).forEach(t => counts.set(t, (counts.get(t) || 0) + 1));
  const repeated = [...counts.entries()].filter(([, c]) => c >= 5).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([word, count]) => ({ word, count }));
  const complexSentences = sents.filter(s => SUBORD.test(s)).length;
  const passives = (clean.match(PASSIVE) || []).length;
  const hasOverview = OVERVIEW.test(clean);
  const hasPosition = POSITION.test(clean);
  const positionInIntro = paragraphs > 0 && POSITION.test(parts[0]);
  const positionInConclusion = paragraphs > 1 && POSITION.test(parts[paragraphs - 1]);
  const hasConclusion = paragraphs > 1 && CONCLUSION.test(parts[paragraphs - 1]);
  const speculation = task === 1 ? [...new Set((clean.match(SPECULATION) || []).map(s => s.toLowerCase()))] : [];
  const promptWords = wordList(prompt);
  const answerGrams = grams(tokens, 6);
  const promptCopies = [...grams(promptWords, 6)].filter(g => answerGrams.has(g)).length;
  const stems = (w: string[]): Set<string> => new Set(w.filter(t => t.length > 4 && !STOP.has(t) && !PROMPT_STOP.has(t)).map(t => t.slice(0, 5)));
  const keys = stems(promptWords);
  const used = stems(tokens);
  const topicCoverage = keys.size ? Math.round(([...keys].filter(k => used.has(k)).length / keys.size) * 100) / 100 : 1;

  const min = task === 1 ? 150 : 250;
  const flags: string[] = [];
  if (words < min) flags.push(`Under length: ${words}/${min} words. Short answers lose Task ${task === 1 ? 'Achievement' : 'Response'} marks.`);
  if (task === 1 && words > 0 && !hasOverview) flags.push('No overview found. Add one sentence starting "Overall," that states the main trend or contrast. Band 7 needs a clear overview.');
  if (task === 1 && speculation.length) flags.push(`Possible speculation or opinion (${speculation.join(', ')}). Task 1 reports only what the visual shows; reasons that are not in the data cost Task Achievement marks.`);
  if (task === 2 && words > 0 && !hasPosition) flags.push('Could not detect a clear position (we look for stance words such as should, must, I believe). State your view in the introduction and repeat it in the conclusion.');
  if (task === 2 && hasPosition && paragraphs >= 3 && !(positionInIntro && positionInConclusion)) flags.push(`Position found, but not in the ${positionInIntro ? 'conclusion' : 'introduction'}. Band 7 keeps one clear position from introduction to conclusion.`);
  if (task === 2 && paragraphs >= 3 && !hasConclusion) flags.push('No conclusion signal in the last paragraph (for example "In conclusion" or "On balance"). Finish by restating your answer to the question.');
  if (task === 2 && paragraphs > 0 && paragraphs < 4) flags.push(`${paragraphs} paragraph(s). Use 4-5: introduction, two body paragraphs, conclusion.`);
  if (task === 1 && paragraphs > 0 && paragraphs < 3) flags.push(`${paragraphs} paragraph(s). Use intro, overview, and two detail paragraphs.`);
  if (words >= min && paragraphs >= 3 && parts.some(p => p.split(/\s+/).length > words * 0.6)) flags.push('One paragraph holds more than 60% of the answer. Split it so each paragraph has one main idea.');
  if (words >= 60 && linkers.length < 4) flags.push(`Only ${linkers.length} distinct linking phrases. Aim for 5+ without overusing any.`);
  if (overusedLinkers.length) flags.push(`Overused linker: ${overusedLinkers.map(l => `"${l}" x${linkerCount(l)}`).join(', ')}. Mechanical linking holds Coherence at band 6.`);
  if (words >= 60 && complexSentences < Math.max(3, sents.length * 0.3)) flags.push('Few complex sentences. Mix in relative clauses, concession (although/whereas) and conditionals.');
  if (task === 1 && words >= 60 && passives === 0) flags.push('No passives found. Process and map answers usually need them.');
  if (avg > 28) flags.push(`Average sentence length ${avg.toFixed(0)} words. Very long sentences risk grammar errors.`);
  if (words >= 100 && diversity < 0.5) flags.push(`Lexical diversity ${diversity.toFixed(2)} (below 0.50). Vary your vocabulary.`);
  if (repeated.length) flags.push(`Repeated words: ${repeated.map(r => `${r.word} x${r.count}`).join(', ')}. Use synonyms or restructure.`);
  if (promptCopies >= 3) flags.push(`${promptCopies} six-word chunks copied from the question. Examiners do not count copied words; paraphrase the question.`);
  if (task === 2 && words >= 100 && topicCoverage < 0.3) flags.push(`Only ${Math.round(topicCoverage * 100)}% of the question's key words appear. Check you answer every part of this question, not a similar one.`);

  return { words, paragraphs, sentences: sents.length, avgSentenceLength: Math.round(avg * 10) / 10, lexicalDiversity: Math.round(diversity * 100) / 100, linkers, overusedLinkers, complexSentences, passives, repeated, hasOverview, hasPosition, positionInIntro, positionInConclusion, hasConclusion, speculation, promptCopies, topicCoverage, flags };
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

export type Criterion = 'ta' | 'tr' | 'cc' | 'lr' | 'gra';
export type RubricBand = 5 | 6 | 7 | 8;

/** Per-criterion, per-band examples (our own sentences) so a learner can see what each band looks like. */
export const BAND_EXAMPLES: Record<Criterion, Record<RubricBand, { looks: string; example: string }>> = {
  ta: {
    5: { looks: 'Lists numbers one by one; no overview; some details wrong or missing.', example: 'In 2000 it was 20. In 2005 it was 25. In 2010 it was 40.' },
    6: { looks: 'Has an overview, but key features are not clearly chosen; some figures are irrelevant or slightly wrong.', example: 'Overall, the numbers changed a lot. Car use was 20% in 2000 and it went up to 40%.' },
    7: { looks: 'Clear overview of the main trends; key features selected and supported with accurate figures.', example: 'Overall, car use doubled while bus use fell, so cars overtook buses by 2010.' },
    8: { looks: 'Every key feature covered and well grouped; figures accurate and precisely chosen.', example: 'Car use climbed steadily from a fifth of journeys to two fifths, overtaking buses in 2008, the only crossover in the period.' }
  },
  tr: {
    5: { looks: 'Answers only part of the question; position unclear; ideas listed, not explained.', example: 'Technology is good and bad. Many people use phones. Phones are useful.' },
    6: { looks: 'Answers all parts, but some ideas are general or not fully developed; conclusion may repeat.', example: 'I agree that phones help students because they can find information quickly.' },
    7: { looks: 'Clear position throughout; main ideas extended and supported with a reason and an example.', example: 'I agree, because a phone gives a student instant access to sources; a pupil revising for a chemistry test can check a definition in seconds.' },
    8: { looks: 'Fully developed, well-supported ideas; position precise, including its limits.', example: 'Phones help students most when the search is guided; left alone, the same device fragments attention, so schools should teach how to use it, not ban it.' }
  },
  cc: {
    5: { looks: 'Some organisation, but linkers are missing, wrong or repeated; paragraphs unclear.', example: 'Firstly, cars are bad. Secondly, cars are bad for health. Thirdly, also pollution.' },
    6: { looks: 'Paragraphs and linkers used, but mechanically or not always accurately.', example: 'Moreover, cars pollute. Moreover, they are expensive. In conclusion, cars are bad.' },
    7: { looks: 'Logical order; one idea per paragraph; range of linkers and reference words used naturally.', example: 'Cars pollute city air. This problem is worst at rush hour, when traffic barely moves.' },
    8: { looks: 'Cohesion so smooth it is barely noticed; paragraphing always fits the argument.', example: 'That cost falls on those least able to avoid it: children walking to school beside main roads.' }
  },
  lr: {
    5: { looks: 'Limited, repetitive vocabulary; spelling or word-form errors that strain the reader.', example: 'Pollution is a big problem and it makes big problems for big cities.' },
    6: { looks: 'Adequate range; tries less common words with some errors in choice or collocation.', example: 'Pollution makes a huge damage to the environment.' },
    7: { looks: 'Some less common words and good collocations; occasional slips in word choice.', example: 'Air pollution poses a serious threat to public health in densely populated areas.' },
    8: { looks: 'Wide, precise vocabulary used naturally; rare minor slips.', example: 'Fine particulate matter lodges deep in the lungs, which is why urban asthma rates track traffic volume.' }
  },
  gra: {
    5: { looks: 'Mostly simple sentences; frequent errors in tense, agreement or articles.', example: 'The number of student increase and the government don\'t do nothing.' },
    6: { looks: 'Mix of simple and complex sentences; errors are noticeable but meaning is clear.', example: 'Although the number of students increased, but the government did not build schools.' },
    7: { looks: 'Varied complex structures; many error-free sentences; good control of punctuation.', example: 'Although student numbers rose sharply, the government, which had promised new schools, built none.' },
    8: { looks: 'Wide range of structures used flexibly; the great majority of sentences error-free.', example: 'Had the government acted on its own forecasts, the shortage of school places could have been avoided.' }
  }
};

/** Estimate = mean of 4 self-ratings, minus 0.5 when under the minimum length. Always an estimate. */
export function estimateBand(ratings: number[], words: number, task: 1 | 2): number {
  const mean = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  const penalty = words < (task === 1 ? 150 : 250) ? 0.5 : 0;
  return Math.max(0, Math.round((mean - penalty) * 2) / 2);
}

export interface ParagraphEvaluation {
  hasTopicSentence: boolean;
  hasExplanation: boolean;
  hasEvidence: boolean;
  hasImpactSentence: boolean;
  sentenceCount: number;
  wordCount: number;
  feedback: string[];
  scoreEstimate: 'Band 6.0' | 'Band 7.0' | 'Band 8.0+';
}

const TOPIC_MARKERS = /\b(one (of the )?(primary|main|key|major|significant|central|crucial)|the (main|primary|chief|key|first|central)|firstly|first and foremost|to begin with|a (major|key|primary|significant|fundamental)|it is (clear|evident|arguable|undeniable|essential)|plays a (vital|crucial|major|key)|argument|advantage|disadvantage|benefit|drawback|factor|reason|cause|problem|solution|should|must|ought to|contend|argue|believe|maintain|suggest)\b/i;
const CAUSAL_EXPLANATION = /\b(because|since|as a result|leads to|leading to|this means that|this is because|due to|owing to|in order to|thereby|causes|resulting in|results in|enables|allows|consequently|stems from|in turn|by doing so|this occurs because|which makes|triggers|generates|fosters|explains why|serves to|ensures that)\b/i;
const CONCRETE_EVIDENCE = /\b(for instance|for example|specifically|such as|to illustrate|a case in point|evidence (from|suggests|shows)|studies (show|have shown|indicate)|research (indicates|shows|demonstrates)|according to|exemplified by|take (\w+ )?for example|in particular|as seen in|a notable example|data reveals|statistics show|case study)\b/i;
const IMPACT_CONCLUDING = /\b(consequently|thus|therefore|as a consequence|hence|ultimately|this demonstrates that|this highlights that|this underscores that|this proves that|in this way|as such|it is clear that|clearly shows that|without this|the result is that|in turn|as a direct outcome|this ensures that|serves as|proves crucial)\b/i;

/**
 * Validates a body paragraph against Keino Campbell's 4-Sentence Paragraph Architecture:
 * 1. Topic Sentence (main claim / stance)
 * 2. Explanation (causal logic / mechanism)
 * 3. Concrete Evidence (data point, study, or real-world exemplar)
 * 4. Concluding / Impact Sentence (link back to thesis / broader implication)
 */
export function validateFourSentenceParagraph(text: string): ParagraphEvaluation {
  const clean = text.trim();
  if (!clean) {
    return {
      hasTopicSentence: false,
      hasExplanation: false,
      hasEvidence: false,
      hasImpactSentence: false,
      sentenceCount: 0,
      wordCount: 0,
      feedback: ['Please enter a paragraph to evaluate.'],
      scoreEstimate: 'Band 6.0'
    };
  }

  const sentences = clean.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length;
  const words = clean.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const firstSent = sentences[0] || '';
  const startsWithEvidenceOrImpact = /^(for (example|instance)|specifically|take |such as|consequently|thus|therefore|in conclusion|overall)\b/i.test(firstSent);
  const hasTopicSentence = sentenceCount >= 1 && (TOPIC_MARKERS.test(firstSent) || (firstSent.split(/\s+/).length >= 7 && !startsWithEvidenceOrImpact));

  const hasExplanation = CAUSAL_EXPLANATION.test(clean);
  const hasEvidence = CONCRETE_EVIDENCE.test(clean);
  const hasImpactSentence = IMPACT_CONCLUDING.test(clean);

  const feedback: string[] = [];

  if (!hasTopicSentence) {
    feedback.push('Missing clear Topic Sentence: Begin with a strong claim identifying the core argument.');
  } else {
    feedback.push('✓ Topic Sentence detected: Clear main claim established.');
  }

  if (!hasExplanation) {
    feedback.push('Missing Explanation: Add causal reasoning using linkers like "because", "this means that", or "leads to".');
  } else {
    feedback.push('✓ Causal Explanation detected: Mechanism explained logically.');
  }

  if (!hasEvidence) {
    feedback.push('Missing Concrete Evidence: Provide specific support or an exemplar using "for instance", "specifically", or a study reference.');
  } else {
    feedback.push('✓ Concrete Evidence detected: Specific illustration provided.');
  }

  if (!hasImpactSentence) {
    feedback.push('Missing Impact/Concluding Sentence: Conclude with the broader consequence using "consequently", "thus", or "therefore".');
  } else {
    feedback.push('✓ Concluding Impact detected: Strong link back to broader thesis.');
  }

  if (sentenceCount < 4) {
    feedback.push(`Paragraph has ${sentenceCount} sentence(s). Aim for 4 sentences for a fully balanced paragraph.`);
  } else if (sentenceCount > 4) {
    feedback.push(`Paragraph has ${sentenceCount} sentences. The 4-sentence formula keeps development concise and focused.`);
  }

  if (wordCount < 60) {
    feedback.push(`Short paragraph (${wordCount} words). A well-developed Band 7+ body paragraph is typically 80–110 words.`);
  }

  const allFourPresent = hasTopicSentence && hasExplanation && hasEvidence && hasImpactSentence;
  let scoreEstimate: 'Band 6.0' | 'Band 7.0' | 'Band 8.0+';

  if (allFourPresent && sentenceCount === 4 && wordCount >= 75) {
    scoreEstimate = 'Band 8.0+';
  } else if (allFourPresent && wordCount >= 55) {
    scoreEstimate = 'Band 7.0';
  } else {
    scoreEstimate = 'Band 6.0';
  }

  return {
    hasTopicSentence,
    hasExplanation,
    hasEvidence,
    hasImpactSentence,
    sentenceCount,
    wordCount,
    feedback,
    scoreEstimate
  };
}

