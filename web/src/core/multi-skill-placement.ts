import { Cefr, CEFR_ORDER, cefrIndex } from './cefr';
import { SkillId, SkillProfile, StorageManager } from '../utils/storage';

export type DiagnosticSkill = SkillId;
export type DiagnosticMode = 'quick' | 'comprehensive';

export interface MultiSkillQuestion {
  id: string;
  stage: number; // 1 to 5
  skill: SkillId;
  level: Cefr;
  prompt: string;
  context?: string;
  audioPrompt?: string; // Text for Speech Synthesis / Audio playback in Stage 4
  ipa?: string;
  options: string[];
  answer: number; // Index 0..3 of correct option
  explanation?: string;
  vietnamese?: string;
  difficulty?: number;     // 2PL IRT b parameter (-2.5 to +2.5)
  discrimination?: number; // 2PL IRT a parameter (typically 1.0 to 1.8)
}

export interface DiagnosticAnswer {
  questionId: string;
  stage: number;
  skill: SkillId;
  level: Cefr;
  selectedOption: number;
  correctAnswer: number;
  isCorrect: boolean;
  isGuessed?: boolean; // Per diagnostic-test.md §4: answer marked with ? gets 0.5 score
  score?: number;      // 1.0 (correct), 0.5 (guessed correct), 0.0 (incorrect)
  thetaAfter?: number; // Estimated ability after this response
  semAfter?: number;   // Standard error after this response
}

export interface StageSummary {
  stage: number;
  skill: SkillId;
  calibratedLevel: Cefr;
  correctCount: number;
  totalQuestions: number;
  percentage: number;
}

export type CatConfidence = 'low' | 'medium' | 'high';

export interface CatSkillEstimate {
  skill: SkillId;
  theta: number; // Latent ability parameter (-3.0 to +3.0)
  sem: number;   // Standard Error of Measurement
  confidence: CatConfidence;
  itemsAdministered: number;
  calibratedLevel: Cefr;
}

export interface DiagnosticResult {
  profile: SkillProfile;
  overallLevel: Cefr;
  stageSummaries: StageSummary[];
  answers: DiagnosticAnswer[];
  totalCorrect: number;
  totalQuestions: number;
  // Optional CAT IRT metrics
  catSkillEstimates?: Record<SkillId, CatSkillEstimate>;
  overallTheta?: number;
  overallSem?: number;
  overallConfidence?: CatConfidence;
}

export interface CatDiagnosticResult extends DiagnosticResult {
  catSkillEstimates: Record<SkillId, CatSkillEstimate>;
  overallTheta: number;
  overallSem: number;
  overallConfidence: CatConfidence;
}

export interface DiagnosticStageInfo {
  stage: number;
  skill: SkillId;
  name: string;
  vietnameseName: string;
  description: string;
  totalQuestions: number;
}

export const DIAGNOSTIC_STAGES: readonly DiagnosticStageInfo[] = [
  {
    stage: 1,
    skill: 'vocab',
    name: 'Vocabulary & Collocations',
    vietnameseName: 'Từ vựng & Cụm từ cố định',
    description: 'Assesses lexical precision, idiomatic collocations, and contextual usage across CEFR tiers.',
    totalQuestions: 3
  },
  {
    stage: 2,
    skill: 'grammar',
    name: 'Grammar & Syntax',
    vietnameseName: 'Ngữ pháp & Biến đổi cú pháp',
    description: 'Assesses grammatical formula application, syntactic transformations, and clause structures.',
    totalQuestions: 3
  },
  {
    stage: 3,
    skill: 'reading',
    name: 'Reading Comprehension',
    vietnameseName: 'Đọc hiểu suy luận',
    description: 'Assesses mini-passage comprehension, context clues, and sentence-mining inference.',
    totalQuestions: 3
  },
  {
    stage: 4,
    skill: 'listening',
    name: 'Listening & Connected Speech',
    vietnameseName: 'Nghe hiểu & Nối âm biến âm',
    description: 'Assesses phonetic decoding, elision, catenation, assimilation, and acoustic comprehension.',
    totalQuestions: 3
  },
  {
    stage: 5,
    skill: 'writing',
    name: 'Writing & Rhetorical Precision',
    vietnameseName: 'Kỹ năng viết & Tu từ học thuật',
    description: 'Assesses sentence balance, formal register, PEEL structure, and rhetorical precision.',
    totalQuestions: 3
  }
];

export const QUICK_BATTERY_LEVELS: readonly Cefr[] = ['A2', 'B2', 'C1'];

/**
 * 2PL IRT Theta Difficulty anchors mapped to CEFR tiers.
 */
export const CEFR_THETA_CALIBRATION: Record<Cefr, number> = {
  A1: -2.5,
  A2: -1.5,
  B1: -0.5,
  B2: 0.5,
  C1: 1.5,
  C2: 2.5
};

/**
 * Converts latent ability theta (-3.0 to +3.0) to corresponding CEFR tier.
 */
export function thetaToCefr(theta: number): Cefr {
  if (theta < -2.0) return 'A1';
  if (theta < -1.0) return 'A2';
  if (theta < 0.0) return 'B1';
  if (theta < 1.0) return 'B2';
  if (theta < 2.0) return 'C1';
  return 'C2';
}

/**
 * 2-Parameter Logistic (2PL) Item Response Function:
 * P(X = 1 | theta, b, a) = 1 / (1 + exp(-a * (theta - b)))
 */
export function calcIrtProbability(theta: number, b: number, a: number = 1.2): number {
  const exponent = -a * (theta - b);
  if (exponent > 40) return 0;
  if (exponent < -40) return 1;
  return 1 / (1 + Math.exp(exponent));
}

/**
 * Fisher Information for 2PL IRT item:
 * I(theta) = a^2 * P(theta) * (1 - P(theta))
 */
export function calcFisherInformation(theta: number, b: number, a: number = 1.2): number {
  const p = calcIrtProbability(theta, b, a);
  return (a * a) * p * (1 - p);
}

/**
 * Standard Error of Measurement (SEM) given accumulated Fisher Information:
 * SEM(theta) = 1 / sqrt(Sum(I_i) + 1/priorVariance)
 */
export function calcSem(totalInformation: number, priorVariance: number = 1.0): number {
  const denom = totalInformation + (1 / priorVariance);
  return denom > 0 ? 1 / Math.sqrt(denom) : 1.0;
}

/**
 * Classifies CAT confidence rating from SEM and administered count.
 */
export function classifyCatConfidence(sem: number, administeredCount: number): CatConfidence {
  if (sem <= 0.35 && administeredCount >= 3) return 'high';
  if (sem <= 0.50 && administeredCount >= 2) return 'medium';
  return 'low';
}

/**
 * Sequential Bayesian EAP ability updating:
 * delta = (a * (score - P(theta))) / (newInfo + 1/priorVariance)
 */
export function updateThetaEAP(
  currentTheta: number,
  response: number, // 1.0 (correct), 0.5 (guessed), 0.0 (incorrect)
  b: number,
  a: number = 1.2,
  accumulatedInformation: number = 0,
  priorVariance: number = 1.0
): { newTheta: number; newInformation: number; sem: number } {
  const p = calcIrtProbability(currentTheta, b, a);
  const info = calcFisherInformation(currentTheta, b, a);
  const newInformation = accumulatedInformation + info;
  const delta = (a * (response - p)) / (newInformation + (1 / priorVariance));
  const rawTheta = currentTheta + delta;
  const clampedTheta = Math.max(-3.0, Math.min(3.0, rawTheta));
  const sem = calcSem(newInformation, priorVariance);
  return { newTheta: clampedTheta, newInformation, sem };
}

/**
 * Selects candidate item from question pool that maximizes Fisher Information at current theta.
 */
export function selectNextCatItem(
  pool: MultiSkillQuestion[],
  administeredIds: Set<string>,
  currentTheta: number,
  targetSkill?: SkillId
): MultiSkillQuestion | null {
  const candidates = pool.filter(q => {
    if (administeredIds.has(q.id)) return false;
    if (targetSkill && q.skill !== targetSkill) return false;
    return true;
  });

  if (candidates.length === 0) return null;

  let bestItem: MultiSkillQuestion = candidates[0];
  let maxInfo = -1;

  for (const item of candidates) {
    const b = item.difficulty ?? CEFR_THETA_CALIBRATION[item.level] ?? 0;
    const a = item.discrimination ?? 1.2;
    const info = calcFisherInformation(currentTheta, b, a);
    if (info > maxInfo) {
      maxInfo = info;
      bestItem = item;
    }
  }

  return bestItem;
}

/**
 * High-fidelity curated listening questions for Stage 4 covering A1 to C2.
 */
export const CURATED_LISTENING_QUESTIONS: readonly MultiSkillQuestion[] = [
  {
    id: 'diag-a1-listen',
    stage: 4,
    skill: 'listening',
    level: 'A1',
    prompt: "Listen to the audio. How do the words 'is' and 'Anna' link together in natural connected speech?",
    audioPrompt: "Her name is Anna.",
    ipa: "/hɜː neɪm ɪz ˈænə/",
    context: "Audio: 'Her name is Anna.' [hɜː neɪm ɪz ˈænə]",
    options: [
      "Consonant-to-vowel catenation: /ɪ.zæ/ links smoothly",
      "Glottal stop separation: /ɪz | ˈænə/ with full pause",
      "Sound deletion: /z/ is completely dropped",
      "Vowel substitution: /ɪz/ turns into /eɪz/"
    ],
    answer: 0,
    explanation: "Consonant-to-vowel catenation links final consonant /z/ to initial vowel /æ/ without interruption.",
    vietnamese: "Nối âm phụ âm sang nguyên âm /z/ sang /æ/.",
    difficulty: -2.5,
    discrimination: 1.2
  },
  {
    id: 'diag-a2-listen',
    stage: 4,
    skill: 'listening',
    level: 'A2',
    prompt: "Listen to the audio. What happens to the function word 'to' in 'going to' in fluent everyday speech?",
    audioPrompt: "We are going to buy a new car.",
    ipa: "/wɪər ˈɡoʊ.ɪŋ tə baɪ ə njuː kɑːr/",
    context: "Audio: 'We are going to buy a new car.'",
    options: [
      "Weak form: /tuː/ reduces to schwa /tə/",
      "Strong stress: /tuː/ is emphasized loudly",
      "Elision: the word 'to' is completely omitted",
      "Catenation: /t/ turns into /d/"
    ],
    answer: 0,
    explanation: "In connected speech, unstressed 'to' reduces to weak form /tə/.",
    vietnamese: "Dạng yếu (weak form): /tuː/ giản lược thành âm schwa /tə/.",
    difficulty: -1.5,
    discrimination: 1.2
  },
  {
    id: 'diag-b1-listen',
    stage: 4,
    skill: 'listening',
    level: 'B1',
    prompt: "Listen to the audio. What phonetic phenomenon occurs at the word boundary in 'red bag'?",
    audioPrompt: "She placed the red bag on the wooden table.",
    ipa: "/ʃi pleɪst ðə reb bæɡ ɒn ðə ˈwʊd.ən ˈteɪ.bəl/",
    context: "Audio: 'She placed the red bag on the wooden table.'",
    options: [
      "Regressive assimilation: alveolar /d/ assimilates to bilabial /b/",
      "Elision: /d/ is pronounced as a silent vowel",
      "Intrusive /r/ linking across syllables",
      "Glottalization: /d/ replaced by loud aspiration"
    ],
    answer: 0,
    explanation: "Regressive assimilation occurs when the alveolar /d/ takes the bilabial place of articulation of following /b/, sounding like 'reb bag'.",
    vietnamese: "Đồng hóa âm (regressive assimilation): âm /d/ biến thành âm môi /b/ trước từ 'bag'.",
    difficulty: -0.5,
    discrimination: 1.2
  },
  {
    id: 'diag-b2-listen',
    stage: 4,
    skill: 'listening',
    level: 'B2',
    prompt: "Listen to the audio. What happens to the final alveolar /t/ in the word 'next' in 'next door'?",
    audioPrompt: "The family living next door just adopted a rescue dog.",
    ipa: "/ðə ˈfæm.əl.i ˈlɪv.ɪŋ neks dɔːr dʒʌst əˈdɒp.tɪd ə ˈres.kjuː dɒɡ/",
    context: "Audio: 'The family living next door just adopted a rescue dog.'",
    options: [
      "Consonant cluster elision: /t/ is omitted between /ks/ and /d/",
      "Assimilation: /t/ turns into voiced /z/",
      "Gemination: /t/ duplicates into a double stop",
      "Nasalization: /t/ becomes /n/"
    ],
    answer: 0,
    explanation: "Alveolar elision drops /t/ when it appears in a consonant cluster followed by another consonant.",
    vietnamese: "Nuốt âm (elision): âm /t/ bị lược bỏ giữa cụm phụ âm /ks/ và /d/.",
    difficulty: 0.5,
    discrimination: 1.3
  },
  {
    id: 'diag-c1-listen',
    stage: 4,
    skill: 'listening',
    level: 'C1',
    prompt: "Listen to the audio. What phonetic feature connects 'law and order' in non-rhotic native speech?",
    audioPrompt: "The magistrate emphasized the indispensable need for law and order.",
    ipa: "/ðə ˈmædʒ.ɪ.streɪt ˈem.fə.saɪzd ði ˌɪn.dɪˈspen.sə.bəl niːd fɔː lɔːr ən ˈɔː.dər/",
    context: "Audio: 'The magistrate emphasized the indispensable need for law and order.'",
    options: [
      "Intrusive /r/ inserted between /ɔː/ and /ə/",
      "Voicing assimilation of /n/ into /ŋ/",
      "Glottal reinforcement of the initial vowel in 'order'",
      "Palatalization of /l/ to /j/"
    ],
    answer: 0,
    explanation: "Intrusive /r/ is inserted by non-rhotic speakers between two vowel sounds where no historical 'r' exists in spelling.",
    vietnamese: "Âm /r/ chèn (intrusive /r/): chèn âm /r/ nối giữa hai nguyên âm /ɔː/ và /ə/.",
    difficulty: 1.5,
    discrimination: 1.4
  },
  {
    id: 'diag-c2-listen',
    stage: 4,
    skill: 'listening',
    level: 'C2',
    prompt: "Listen to the audio. In rapid oratorical speech, how does 'don't you think' phonetically coalesce?",
    audioPrompt: "Don't you think the proposition carries unwarranted presuppositions?",
    ipa: "/dəʊntʃu θɪŋk ðə ˌprɒp.əˈzɪʃ.ən ˈkær.iz ʌnˈwɒr.ən.tɪd ˌpriː.sʌp.əˈzɪʃ.ənz/",
    context: "Audio: 'Don't you think the proposition carries unwarranted presuppositions?'",
    options: [
      "Coalescent assimilation: /t/ + /j/ merges into affricate /tʃ/",
      "Total elision: both words reduce to an unvoiced whisper",
      "Vowel nasalization without consonantal contact",
      "Syllabic consonant formation with glottal stops"
    ],
    answer: 0,
    explanation: "Coalescent assimilation merges the final alveolar /t/ with palatal glide /j/ to produce postalveolar affricate /tʃ/ ('don'tchu').",
    vietnamese: "Hòa âm (coalescent assimilation): âm /t/ kết hợp cùng /j/ tạo thành âm tắc xát /tʃ/.",
    difficulty: 2.5,
    discrimination: 1.5
  }
];

/**
 * Calibrates the CEFR level for a single skill based on testing records.
 * Uses sequential ladder climbing: failure at an earlier tier prevents premature promotion.
 */
export function calibrateSkillLevel(
  records: Array<{ level: Cefr; isCorrect: boolean }>
): Cefr {
  if (!records || records.length === 0) return 'A1';

  // Group by level
  const byLevel: Partial<Record<Cefr, { correct: number; total: number }>> = {};
  for (const r of records) {
    if (!byLevel[r.level]) {
      byLevel[r.level] = { correct: 0, total: 0 };
    }
    const entry = byLevel[r.level]!;
    entry.total += 1;
    if (r.isCorrect) entry.correct += 1;
  }

  // Iterate ascending through CEFR ladder
  let calibrated: Cefr = 'A1';
  let passedAny = false;

  for (const lvl of CEFR_ORDER) {
    const entry = byLevel[lvl];
    if (!entry || entry.total === 0) {
      continue;
    }

    // Passing threshold: 100% if single question, >= 66% if multiple
    const passed = entry.total === 1 ? entry.correct >= 1 : (entry.correct / entry.total) >= 0.66;

    if (passed) {
      calibrated = lvl;
      passedAny = true;
    } else {
      break;
    }
  }

  if (!passedAny) {
    return 'A1';
  }

  return calibrated;
}

/**
 * Initializes Speaking baseline from listening and writing levels.
 */
export function resolveSpeakingBaseline(listening: Cefr, writing: Cefr): Cefr {
  const avgIndex = Math.floor((cefrIndex(listening) + cefrIndex(writing)) / 2);
  const clamped = Math.max(0, Math.min(avgIndex, CEFR_ORDER.length - 1));
  return CEFR_ORDER[clamped];
}

/**
 * Resolves overall median CEFR level across skill proficiencies.
 */
export function resolveMedianLevel(skills: Record<SkillId, Cefr> | Cefr[]): Cefr {
  const levels: Cefr[] = Array.isArray(skills)
    ? skills
    : [skills.vocab, skills.grammar, skills.reading, skills.listening, skills.writing];

  if (levels.length === 0) return 'A1';

  const indices = levels.map(cefrIndex).sort((a, b) => a - b);
  const mid = Math.floor(indices.length / 2);
  const medianIdx = indices.length % 2 !== 0
    ? indices[mid]
    : Math.floor((indices[mid - 1] + indices[mid]) / 2);

  const clamped = Math.max(0, Math.min(medianIdx, CEFR_ORDER.length - 1));
  return CEFR_ORDER[clamped];
}

/**
 * Calibrates a complete SkillProfile from recorded diagnostic answers.
 */
export function calibrateSkillProfile(
  answers: Array<{ skill: SkillId; level: Cefr; isCorrect: boolean }>
): SkillProfile {
  const bySkill: Record<SkillId, Array<{ level: Cefr; isCorrect: boolean }>> = {
    vocab: [],
    grammar: [],
    reading: [],
    listening: [],
    writing: [],
    speaking: []
  };

  for (const a of answers) {
    if (bySkill[a.skill]) {
      bySkill[a.skill].push({ level: a.level, isCorrect: a.isCorrect });
    }
  }

  const vocabLevel = calibrateSkillLevel(bySkill.vocab);
  const grammarLevel = calibrateSkillLevel(bySkill.grammar);
  const readingLevel = calibrateSkillLevel(bySkill.reading);
  const listeningLevel = calibrateSkillLevel(bySkill.listening);
  const writingLevel = calibrateSkillLevel(bySkill.writing);
  const speakingLevel = resolveSpeakingBaseline(listeningLevel, writingLevel);

  const skills: Record<SkillId, Cefr> = {
    vocab: vocabLevel,
    grammar: grammarLevel,
    reading: readingLevel,
    listening: listeningLevel,
    writing: writingLevel,
    speaking: speakingLevel
  };

  const overall = resolveMedianLevel(skills);

  return {
    overall,
    skills,
    assessedAt: new Date().toISOString()
  };
}

export interface BuildBatteryOptions {
  curatedQuestions?: MultiSkillQuestion[];
  vocabWords?: any[];
  collocations?: any[];
  grammarRules?: any[];
  readingArticles?: any[];
  listeningPassages?: any[];
  rhetoricItems?: any[];
  mode?: DiagnosticMode;
  rng?: () => number;
}

/**
 * Builds a balanced multi-skill diagnostic battery.
 * - 'quick' mode: 15 questions total (3 questions x 5 stages across ladder checkpoints A2, B2, C1).
 * - 'comprehensive' mode: 30 questions total (6 questions x 5 stages across all levels A1 to C2).
 */
export function buildDiagnosticBattery(options: BuildBatteryOptions = {}): MultiSkillQuestion[] {
  const mode = options.mode || 'quick';
  const targetLevels = mode === 'quick' ? QUICK_BATTERY_LEVELS : CEFR_ORDER;
  const rng = options.rng || Math.random;

  const battery: MultiSkillQuestion[] = [];

  // Partition curated questions if provided
  const stage1Questions: MultiSkillQuestion[] = [];
  const stage2Questions: MultiSkillQuestion[] = [];
  const stage3Questions: MultiSkillQuestion[] = [];
  const stage4Questions: MultiSkillQuestion[] = [];
  const stage5Questions: MultiSkillQuestion[] = [];

  if (options.curatedQuestions) {
    for (const q of options.curatedQuestions) {
      if (q.stage === 1 || q.skill === 'vocab') stage1Questions.push(q);
      else if (q.stage === 2 || q.skill === 'grammar') stage2Questions.push(q);
      else if (q.stage === 3 || q.skill === 'reading') stage3Questions.push(q);
      else if (q.stage === 4 || q.skill === 'listening') stage4Questions.push(q);
      else if (q.stage === 5 || q.skill === 'writing') stage5Questions.push(q);
    }
  }

  if (stage4Questions.length === 0) {
    stage4Questions.push(...CURATED_LISTENING_QUESTIONS);
  }

  function selectQuestionsForStage(
    stageNum: number,
    skill: SkillId,
    pool: MultiSkillQuestion[],
    backupItems?: any[],
    backupKind?: string
  ): MultiSkillQuestion[] {
    const selected: MultiSkillQuestion[] = [];

    for (const lvl of targetLevels) {
      const matching = pool.filter(q => q.level === lvl);
      if (matching.length > 0) {
        selected.push(matching[0]);
      } else if (backupItems && backupItems.length > 0) {
        const synthetic = synthesizeQuestion(stageNum, skill, lvl, backupItems, backupKind || '', rng);
        selected.push(synthetic);
      } else {
        selected.push(createPlaceholderQuestion(stageNum, skill, lvl));
      }
    }

    return selected;
  }

  battery.push(...selectQuestionsForStage(1, 'vocab', stage1Questions, options.collocations, 'colloc'));
  battery.push(...selectQuestionsForStage(2, 'grammar', stage2Questions, options.grammarRules, 'grammar'));
  battery.push(...selectQuestionsForStage(3, 'reading', stage3Questions, options.readingArticles, 'reading'));
  battery.push(...selectQuestionsForStage(4, 'listening', stage4Questions, options.listeningPassages, 'listening'));
  battery.push(...selectQuestionsForStage(5, 'writing', stage5Questions, options.rhetoricItems, 'writing'));

  return battery.map((q, idx) => {
    const uniqueOptions = Array.from(new Set(q.options));
    let pad = 1;
    while (uniqueOptions.length < 4) {
      uniqueOptions.push(`${q.level} option ${pad++}`);
    }
    const correctVal = q.options[q.answer] || uniqueOptions[0];
    const shuffledOptions = shuffle(uniqueOptions.slice(0, 4), rng);
    const newAnswer = shuffledOptions.indexOf(correctVal);

    return {
      ...q,
      id: q.id || `diag-q-${idx + 1}`,
      options: shuffledOptions,
      answer: newAnswer >= 0 ? newAnswer : 0,
      difficulty: q.difficulty ?? CEFR_THETA_CALIBRATION[q.level] ?? 0,
      discrimination: q.discrimination ?? 1.2
    };
  });
}

function createPlaceholderQuestion(stage: number, skill: SkillId, level: Cefr): MultiSkillQuestion {
  return {
    id: `diag-gen-${stage}-${level}`,
    stage,
    skill,
    level,
    prompt: `Diagnostic check for ${skill} at level ${level}:`,
    context: `Demonstrate ${skill} mastery at CEFR ${level}.`,
    options: [
      `${level} accurate exemplar formulation`,
      `${level} flawed distractor formulation A`,
      `${level} flawed distractor formulation B`,
      `${level} flawed distractor formulation C`
    ],
    answer: 0,
    explanation: `Demonstrates appropriate competence for ${level} ${skill}.`,
    difficulty: CEFR_THETA_CALIBRATION[level] ?? 0,
    discrimination: 1.2
  };
}

function synthesizeQuestion(
  stage: number,
  skill: SkillId,
  level: Cefr,
  items: any[],
  kind: string,
  rng: () => number
): MultiSkillQuestion {
  const matching = items.filter(it => it.level === level || it.cefrLevel === level);
  const pool = matching.length > 0 ? matching : items;
  const picked = pool[Math.floor(rng() * pool.length)];

  if (kind === 'colloc' && picked) {
    const correct = picked.phrase || picked.word || 'essential collocation';
    const sameLevelDistractors = pool
      .filter(it => it !== picked)
      .map(it => it.phrase || it.word)
      .filter(Boolean);
    const options = [correct, ...sameLevelDistractors.slice(0, 3)];
    while (options.length < 4) {
      options.push(`Alternative ${level} phrasing ${options.length}`);
    }

    return {
      id: `diag-syn-colloc-${level}`,
      stage: 1,
      skill: 'vocab',
      level,
      prompt: "Select the natural collocation that fits the context:",
      context: picked.example || `Essential ${level} usage pattern.`,
      options,
      answer: options.indexOf(correct),
      vietnamese: picked.vietnamese || '',
      difficulty: CEFR_THETA_CALIBRATION[level] ?? 0,
      discrimination: 1.2
    };
  }

  return createPlaceholderQuestion(stage, skill, level);
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// =========================================================================
// COMPUTERIZED ADAPTIVE TESTING (CAT) PLACEMENT ENGINE
// =========================================================================

export interface CatPlacementEngineOptions {
  questionPool?: MultiSkillQuestion[];
  semThreshold?: number;     // Stopping rule SEM threshold (default: 0.35 per contract)
  maxItemsPerSkill?: number; // Maximum items per skill (default: 5)
  minItemsPerSkill?: number; // Minimum items before SEM check (default: 3)
  maxTotalItems?: number;    // Maximum items for overall battery (default: 18 per contract)
  initialTheta?: number;     // Initial starting ability (default: -0.5 for B1)
}

export class CatPlacementEngine {
  private pool: MultiSkillQuestion[];
  private semThreshold: number;
  private maxItemsPerSkill: number;
  private minItemsPerSkill: number;
  private maxTotalItems: number;
  private currentStageIndex: number = 0; // 0..4 (Stage 1..5)
  private currentThetaBySkill: Record<SkillId, number>;
  private infoBySkill: Record<SkillId, number>;
  private administeredIds: Set<string> = new Set();
  private answers: DiagnosticAnswer[] = [];
  private currentQuestion: MultiSkillQuestion | null = null;
  private quizCompleted: boolean = false;

  constructor(options: CatPlacementEngineOptions = {}) {
    this.pool = options.questionPool && options.questionPool.length > 0
      ? options.questionPool
      : buildDiagnosticBattery({ mode: 'comprehensive' });
    this.semThreshold = options.semThreshold ?? 0.35;
    this.maxItemsPerSkill = options.maxItemsPerSkill ?? 5;
    this.minItemsPerSkill = options.minItemsPerSkill ?? 3;
    this.maxTotalItems = options.maxTotalItems ?? 18;

    const startTheta = options.initialTheta ?? -0.5; // B1 provisional anchor
    this.currentThetaBySkill = {
      vocab: startTheta,
      grammar: startTheta,
      reading: startTheta,
      listening: startTheta,
      writing: startTheta,
      speaking: startTheta
    };
    this.infoBySkill = {
      vocab: 0,
      grammar: 0,
      reading: 0,
      listening: 0,
      writing: 0,
      speaking: 0
    };

    this.selectNextQuestion();
  }

  public getCurrentSkill(): SkillId {
    return DIAGNOSTIC_STAGES[this.currentStageIndex]?.skill || 'vocab';
  }

  public getCurrentStageNumber(): number {
    return this.currentStageIndex + 1;
  }

  public getCurrentQuestion(): MultiSkillQuestion | null {
    return this.currentQuestion;
  }

  public getTheta(skill?: SkillId): number {
    return skill ? this.currentThetaBySkill[skill] : this.getOverallTheta();
  }

  public getSem(skill?: SkillId): number {
    const s = skill || this.getCurrentSkill();
    return calcSem(this.infoBySkill[s]);
  }

  public isComplete(): boolean {
    return this.quizCompleted;
  }

  public getAdministeredCount(): number {
    return this.answers.length;
  }

  public getAnswers(): readonly DiagnosticAnswer[] {
    return this.answers;
  }

  private selectNextQuestion(): void {
    if (this.answers.length >= this.maxTotalItems) {
      this.quizCompleted = true;
      this.currentQuestion = null;
      return;
    }

    const currentSkill = this.getCurrentSkill();
    const stageAnswers = this.answers.filter(a => a.skill === currentSkill);
    const currentSem = this.getSem(currentSkill);

    // Stopping criteria for current skill stage:
    const stageItemsMaxed = stageAnswers.length >= this.maxItemsPerSkill;
    const stageSemMet = stageAnswers.length >= this.minItemsPerSkill && currentSem <= this.semThreshold;

    if (stageItemsMaxed || stageSemMet) {
      // Step to next stage
      if (this.currentStageIndex + 1 < DIAGNOSTIC_STAGES.length) {
        this.currentStageIndex += 1;
        const prevTheta = this.currentThetaBySkill[currentSkill];
        const nextSkill = this.getCurrentSkill();
        // Warm-start next skill theta from previous skill
        this.currentThetaBySkill[nextSkill] = (prevTheta + this.currentThetaBySkill[nextSkill]) / 2;
        return this.selectNextQuestion();
      } else {
        this.quizCompleted = true;
        this.currentQuestion = null;
        return;
      }
    }

    // Maximum Fisher Information item selection
    const nextItem = selectNextCatItem(
      this.pool,
      this.administeredIds,
      this.currentThetaBySkill[currentSkill],
      currentSkill
    );

    if (!nextItem) {
      if (this.currentStageIndex + 1 < DIAGNOSTIC_STAGES.length) {
        this.currentStageIndex += 1;
        return this.selectNextQuestion();
      } else {
        this.quizCompleted = true;
        this.currentQuestion = null;
        return;
      }
    }

    this.currentQuestion = nextItem;
  }

  public recordAnswer(selectedOption: number, isGuessed: boolean = false): {
    isCorrect: boolean;
    correctAnswer: number;
    newTheta: number;
    sem: number;
    stageCompleted: boolean;
    quizCompleted: boolean;
  } {
    if (!this.currentQuestion) {
      return {
        isCorrect: false,
        correctAnswer: -1,
        newTheta: 0,
        sem: 1.0,
        stageCompleted: true,
        quizCompleted: true
      };
    }

    const q = this.currentQuestion;
    const isCorrect = selectedOption === q.answer;
    // Fractional credit 0.5 for guesses marked with '?' per diagnostic-test.md
    const score = isCorrect ? (isGuessed ? 0.5 : 1.0) : 0.0;

    const b = q.difficulty ?? CEFR_THETA_CALIBRATION[q.level] ?? 0;
    const a = q.discrimination ?? 1.2;
    const skill = q.skill;

    const update = updateThetaEAP(
      this.currentThetaBySkill[skill],
      score,
      b,
      a,
      this.infoBySkill[skill]
    );

    this.currentThetaBySkill[skill] = update.newTheta;
    this.infoBySkill[skill] = update.newInformation;

    this.administeredIds.add(q.id);
    this.answers.push({
      questionId: q.id,
      stage: q.stage,
      skill: q.skill,
      level: q.level,
      selectedOption,
      correctAnswer: q.answer,
      isCorrect,
      isGuessed,
      score,
      thetaAfter: update.newTheta,
      semAfter: update.sem
    });

    const prevStage = this.currentStageIndex;
    this.selectNextQuestion();
    const stageCompleted = this.currentStageIndex !== prevStage || this.quizCompleted;

    return {
      isCorrect,
      correctAnswer: q.answer,
      newTheta: update.newTheta,
      sem: update.sem,
      stageCompleted,
      quizCompleted: this.quizCompleted
    };
  }

  public getOverallTheta(): number {
    const assessed: SkillId[] = ['vocab', 'grammar', 'reading', 'listening', 'writing'];
    const thetas = assessed.map(s => this.currentThetaBySkill[s]).sort((a, b) => a - b);
    return thetas[Math.floor(thetas.length / 2)];
  }

  public getCatResults(): CatDiagnosticResult {
    const catSkillEstimates: Record<SkillId, CatSkillEstimate> = {} as any;
    const stageSummaries: StageSummary[] = [];

    for (const info of DIAGNOSTIC_STAGES) {
      const skill = info.skill;
      const stageAnswers = this.answers.filter(a => a.skill === skill);
      const theta = this.currentThetaBySkill[skill];
      const sem = this.getSem(skill);
      const calibratedLevel = thetaToCefr(theta);
      const confidence = classifyCatConfidence(sem, stageAnswers.length);
      const correctCount = stageAnswers.filter(a => a.isCorrect).length;

      catSkillEstimates[skill] = {
        skill,
        theta,
        sem,
        confidence,
        itemsAdministered: stageAnswers.length,
        calibratedLevel
      };

      stageSummaries.push({
        stage: info.stage,
        skill: info.skill,
        calibratedLevel,
        correctCount,
        totalQuestions: stageAnswers.length,
        percentage: stageAnswers.length > 0 ? Math.round((correctCount / stageAnswers.length) * 100) : 0
      });
    }

    // Interpolate speaking proficiency from listening and writing
    const speakingLevel = resolveSpeakingBaseline(
      catSkillEstimates.listening.calibratedLevel,
      catSkillEstimates.writing.calibratedLevel
    );
    const speakingTheta = (catSkillEstimates.listening.theta + catSkillEstimates.writing.theta) / 2;
    catSkillEstimates.speaking = {
      skill: 'speaking',
      theta: speakingTheta,
      sem: (catSkillEstimates.listening.sem + catSkillEstimates.writing.sem) / 2,
      confidence: 'medium',
      itemsAdministered: 0,
      calibratedLevel: speakingLevel
    };

    const overallTheta = this.getOverallTheta();
    const overallLevel = thetaToCefr(overallTheta);
    const overallSem = calcSem(
      Object.values(this.infoBySkill).reduce((acc, v) => acc + v, 0)
    );
    const overallConfidence = classifyCatConfidence(overallSem, this.answers.length);

    const profile: SkillProfile = {
      overall: overallLevel,
      skills: {
        vocab: catSkillEstimates.vocab.calibratedLevel,
        grammar: catSkillEstimates.grammar.calibratedLevel,
        reading: catSkillEstimates.reading.calibratedLevel,
        listening: catSkillEstimates.listening.calibratedLevel,
        writing: catSkillEstimates.writing.calibratedLevel,
        speaking: speakingLevel
      },
      assessedAt: new Date().toISOString()
    };

    const totalCorrect = this.answers.filter(a => a.isCorrect).length;

    return {
      profile,
      overallLevel,
      stageSummaries,
      answers: [...this.answers],
      totalCorrect,
      totalQuestions: this.answers.length,
      catSkillEstimates,
      overallTheta,
      overallSem,
      overallConfidence
    };
  }

  public applyResults(persist: boolean = true): SkillProfile {
    const results = this.getCatResults();
    if (persist) {
      StorageManager.saveSkillProfile(results.profile);
      for (const [skill, est] of Object.entries(results.catSkillEstimates)) {
        StorageManager.saveCatProfile(skill as SkillId, {
          skill: skill as SkillId,
          theta: est.theta,
          sem: est.sem,
          confidence: est.confidence,
          itemsAdministered: est.itemsAdministered,
          calibratedLevel: est.calibratedLevel,
          assessedAt: results.profile.assessedAt
        });
      }
    }
    return results.profile;
  }
}

/**
 * 5-Stage Sequential Diagnostic Runner.
 * Manages stepper transitions, answer recording, per-stage feedback, and profile persistence.
 * Compatible with both linear battery and adaptive CAT item sequencing.
 */
export class MultiSkillDiagnosticRunner {
  private questions: MultiSkillQuestion[];
  private currentStageIndex: number = 0; // 0..4 (Stage 1..5)
  private currentQuestionInStage: number = 0;
  private answers: DiagnosticAnswer[] = [];

  constructor(questions?: MultiSkillQuestion[]) {
    this.questions = questions && questions.length > 0
      ? questions
      : buildDiagnosticBattery();
  }

  public getQuestions(): readonly MultiSkillQuestion[] {
    return this.questions;
  }

  public getQuestionsForStage(stageNum: number): MultiSkillQuestion[] {
    return this.questions.filter(q => q.stage === stageNum);
  }

  public getCurrentStageInfo(): DiagnosticStageInfo {
    const stageNum = this.currentStageIndex + 1;
    const found = DIAGNOSTIC_STAGES.find(s => s.stage === stageNum);
    return found || DIAGNOSTIC_STAGES[0];
  }

  public getCurrentQuestion(): MultiSkillQuestion | null {
    const stageQuestions = this.getQuestionsForStage(this.currentStageIndex + 1);
    if (this.currentQuestionInStage < stageQuestions.length) {
      return stageQuestions[this.currentQuestionInStage];
    }
    return null;
  }

  public getCurrentStageNumber(): number {
    return this.currentStageIndex + 1;
  }

  public getCurrentQuestionIndexInStage(): number {
    return this.currentQuestionInStage;
  }

  public getOverallQuestionIndex(): number {
    let index = 0;
    for (let s = 0; s < this.currentStageIndex; s++) {
      index += this.getQuestionsForStage(s + 1).length;
    }
    return index + this.currentQuestionInStage;
  }

  public getTotalQuestions(): number {
    return this.questions.length;
  }

  public getProgress(): {
    currentStage: number;
    totalStages: number;
    stageQuestionIndex: number;
    stageTotalQuestions: number;
    overallQuestionIndex: number;
    totalQuestions: number;
    percentComplete: number;
  } {
    const stageQuestions = this.getQuestionsForStage(this.currentStageIndex + 1);
    const overallIdx = this.getOverallQuestionIndex();
    const total = this.getTotalQuestions();
    return {
      currentStage: this.currentStageIndex + 1,
      totalStages: DIAGNOSTIC_STAGES.length,
      stageQuestionIndex: this.currentQuestionInStage,
      stageTotalQuestions: stageQuestions.length,
      overallQuestionIndex: overallIdx,
      totalQuestions: total,
      percentComplete: total > 0 ? Math.round((this.answers.length / total) * 100) : 0
    };
  }

  public recordAnswer(selectedOption: number, isGuessed: boolean = false): {
    isCorrect: boolean;
    correctAnswer: number;
    explanation?: string;
    stageCompleted: boolean;
    quizCompleted: boolean;
  } {
    const currentQ = this.getCurrentQuestion();
    if (!currentQ) {
      return {
        isCorrect: false,
        correctAnswer: -1,
        stageCompleted: true,
        quizCompleted: true
      };
    }

    const isCorrect = selectedOption === currentQ.answer;
    const score = isCorrect ? (isGuessed ? 0.5 : 1.0) : 0.0;

    this.answers.push({
      questionId: currentQ.id,
      stage: currentQ.stage,
      skill: currentQ.skill,
      level: currentQ.level,
      selectedOption,
      correctAnswer: currentQ.answer,
      isCorrect,
      isGuessed,
      score
    });

    const stageQuestions = this.getQuestionsForStage(this.currentStageIndex + 1);
    const stageCompleted = this.currentQuestionInStage + 1 >= stageQuestions.length;
    const isLastStage = this.currentStageIndex + 1 >= DIAGNOSTIC_STAGES.length;
    const quizCompleted = stageCompleted && isLastStage;

    return {
      isCorrect,
      correctAnswer: currentQ.answer,
      explanation: currentQ.explanation,
      stageCompleted,
      quizCompleted
    };
  }

  public advanceToNextQuestion(): boolean {
    const stageQuestions = this.getQuestionsForStage(this.currentStageIndex + 1);
    if (this.currentQuestionInStage + 1 < stageQuestions.length) {
      this.currentQuestionInStage += 1;
      return true;
    }

    if (this.currentStageIndex + 1 < DIAGNOSTIC_STAGES.length) {
      this.currentStageIndex += 1;
      this.currentQuestionInStage = 0;
      return true;
    }

    return false; // Quiz complete
  }

  public isStageComplete(): boolean {
    const stageQuestions = this.getQuestionsForStage(this.currentStageIndex + 1);
    const answeredForStage = this.answers.filter(a => a.stage === this.currentStageIndex + 1).length;
    return answeredForStage >= stageQuestions.length;
  }

  public isQuizComplete(): boolean {
    return this.answers.length >= this.questions.length;
  }

  public getResults(): DiagnosticResult {
    const stageSummaries: StageSummary[] = [];
    const catSkillEstimates: Record<SkillId, CatSkillEstimate> = {} as any;

    for (const info of DIAGNOSTIC_STAGES) {
      const stageAnswers = this.answers.filter(a => a.stage === info.stage);
      const stageQuestions = this.getQuestionsForStage(info.stage);
      const correctCount = stageAnswers.filter(a => a.isCorrect).length;
      const totalQuestions = stageQuestions.length;
      const calibratedLevel = calibrateSkillLevel(
        stageAnswers.map(a => ({ level: a.level, isCorrect: a.isCorrect }))
      );

      // Estimate theta and SEM for this stage
      let stageTheta = CEFR_THETA_CALIBRATION[calibratedLevel] ?? -0.5;
      let stageInfo = 0;
      for (const a of stageAnswers) {
        const b = CEFR_THETA_CALIBRATION[a.level] ?? 0;
        stageInfo += calcFisherInformation(stageTheta, b, 1.2);
      }
      const stageSem = calcSem(stageInfo);

      catSkillEstimates[info.skill] = {
        skill: info.skill,
        theta: stageTheta,
        sem: stageSem,
        confidence: classifyCatConfidence(stageSem, stageAnswers.length),
        itemsAdministered: stageAnswers.length,
        calibratedLevel
      };

      stageSummaries.push({
        stage: info.stage,
        skill: info.skill,
        calibratedLevel,
        correctCount,
        totalQuestions,
        percentage: totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
      });
    }

    const speakingLevel = resolveSpeakingBaseline(
      catSkillEstimates.listening.calibratedLevel,
      catSkillEstimates.writing.calibratedLevel
    );
    catSkillEstimates.speaking = {
      skill: 'speaking',
      theta: (catSkillEstimates.listening.theta + catSkillEstimates.writing.theta) / 2,
      sem: (catSkillEstimates.listening.sem + catSkillEstimates.writing.sem) / 2,
      confidence: 'medium',
      itemsAdministered: 0,
      calibratedLevel: speakingLevel
    };

    const profile = calibrateSkillProfile(this.answers);
    const totalCorrect = this.answers.filter(a => a.isCorrect).length;
    const overallTheta = CEFR_THETA_CALIBRATION[profile.overall] ?? 0;
    const overallSem = calcSem(
      Object.values(catSkillEstimates).reduce((acc, v) => acc + (1 / (v.sem * v.sem || 1)), 0)
    );

    return {
      profile,
      overallLevel: profile.overall,
      stageSummaries,
      answers: [...this.answers],
      totalCorrect,
      totalQuestions: this.questions.length,
      catSkillEstimates,
      overallTheta,
      overallSem,
      overallConfidence: classifyCatConfidence(overallSem, this.answers.length)
    };
  }

  public getCatResults(): CatDiagnosticResult {
    const res = this.getResults();
    return {
      ...res,
      catSkillEstimates: res.catSkillEstimates!,
      overallTheta: res.overallTheta!,
      overallSem: res.overallSem!,
      overallConfidence: res.overallConfidence!
    };
  }

  public applyResults(persist: boolean = true): SkillProfile {
    const results = this.getResults();
    if (persist) {
      StorageManager.saveSkillProfile(results.profile);
      if (results.catSkillEstimates) {
        for (const [skill, est] of Object.entries(results.catSkillEstimates)) {
          StorageManager.saveCatProfile(skill as SkillId, {
            skill: skill as SkillId,
            theta: est.theta,
            sem: est.sem,
            confidence: est.confidence,
            itemsAdministered: est.itemsAdministered,
            calibratedLevel: est.calibratedLevel,
            assessedAt: results.profile.assessedAt
          });
        }
      }
    }
    return results.profile;
  }
}

// Re-export Automated Essay Scoring (AES) engine
export { AesScoringEngine, type AesEvaluationResult, type AesMetrics, type BandRewriteSuggestion, type IeltsTaskType } from './aes-scoring-engine';
