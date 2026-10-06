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
}

export interface DiagnosticAnswer {
  questionId: string;
  stage: number;
  skill: SkillId;
  level: Cefr;
  selectedOption: number;
  correctAnswer: number;
  isCorrect: boolean;
}

export interface StageSummary {
  stage: number;
  skill: SkillId;
  calibratedLevel: Cefr;
  correctCount: number;
  totalQuestions: number;
  percentage: number;
}

export interface DiagnosticResult {
  profile: SkillProfile;
  overallLevel: Cefr;
  stageSummaries: StageSummary[];
  answers: DiagnosticAnswer[];
  totalCorrect: number;
  totalQuestions: number;
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
      "Vowel lengthening: 'name' is stressed with /æz/"
    ],
    answer: 0,
    explanation: "When a word ending in a consonant (/z/ in 'is') is followed by a vowel (/æ/ in 'Anna'), catenation links them into /ɪ.zæ/.",
    vietnamese: "Tên cô ấy là Anna. Hiện tượng nối âm phụ âm - nguyên âm giữa 'is' và 'Anna'."
  },
  {
    id: 'diag-a2-listen',
    stage: 4,
    skill: 'listening',
    level: 'A2',
    prompt: "Listen to the audio. What happens to the preposition 'to' in fast spoken English?",
    audioPrompt: "I want to go to the supermarket.",
    ipa: "/aɪ wɒnt tə ɡəʊ tə ðə ˈsuːpəˌmɑːkɪt/",
    context: "Audio: 'I want to go to the supermarket.'",
    options: [
      "Weak form reduction: /tuː/ reduces to unstressed schwa /tə/",
      "Full strong vowel: /tuː/ is emphasized loudly",
      "Consonant shift: /t/ turns into /d/ at word boundaries",
      "Elision: the word 'to' is completely omitted"
    ],
    answer: 0,
    explanation: "Grammatical function words like 'to' weaken to unstressed /tə/ (schwa) in standard connected speech.",
    vietnamese: "Tôi muốn đi siêu thị. Từ chức năng 'to' giảm âm thành âm schwa /tə/."
  },
  {
    id: 'diag-b1-listen',
    stage: 4,
    skill: 'listening',
    level: 'B1',
    prompt: "Listen to the audio. Which connected speech phenomenon occurs between 'looking' and 'at it'?",
    audioPrompt: "What looks like patience is usually just a system that keeps working while you are not looking at it.",
    ipa: "/ˈlʊkɪŋ‿æt‿ɪt/",
    context: "Audio excerpt: '...while you are not looking at it.'",
    options: [
      "Continuous consonant-vowel catenation across both word boundaries",
      "Alveolar stop deletion: /t/ disappears completely in both words",
      "Regressive nasal assimilation: /ŋ/ becomes /m/",
      "Intrusive /r/ inserted between the open vowels"
    ],
    answer: 0,
    explanation: "'looking at it' links smoothly without pauses: the final velar nasal and stops attach across boundaries [lʊ.kɪ.ŋæ.tɪt].",
    vietnamese: "Catenation liên tục nối liền các âm đuôi với nguyên âm kế tiếp."
  },
  {
    id: 'diag-b2-listen',
    stage: 4,
    skill: 'listening',
    level: 'B2',
    prompt: "Listen to the audio. Why does 'most creators' sound like [məʊs kriˈeɪtəz]?",
    audioPrompt: "Without arbitrary limitations to direct their focus, most creators fall prey to the paralysis of infinite choice.",
    ipa: "[məʊs kriˈeɪtəz]",
    context: "Audio excerpt: '...most creators fall prey...'",
    options: [
      "Alveolar stop elision: /t/ drops between consonants /s/ and /k/",
      "Palatalization: /t/ blends with /k/ into an affricate /tʃ/",
      "Glottal replacement: /t/ becomes a voiced flap [ɾ]",
      "Epenthesis: an extra schwa vowel is inserted between words"
    ],
    answer: 0,
    explanation: "When an alveolar stop (/t/ or /d/) is flanked by other consonants across a word boundary, it undergoes elision (sound deletion).",
    vietnamese: "Hiện tượng nuốt âm (elision): âm /t/ bị triệt tiêu khi đứng giữa hai phụ âm."
  },
  {
    id: 'diag-c1-listen',
    stage: 4,
    skill: 'listening',
    level: 'C1',
    prompt: "Listen to the audio excerpt. Which two phonological phenomena occur in 'In an era' and 'feed optimization'?",
    audioPrompt: "In an era dominated by algorithmic feed optimization, human cognitive bandwidth has become the ultimate scarce commodity.",
    ipa: "[ɪ-nə-nɪərə]",
    context: "Audio excerpt: 'In an era dominated by algorithmic feed optimization...'",
    options: [
      "Double catenation [ɪ-nə-nɪərə] followed by coronal elision of /d/ before the vowel",
      "Glottal stopping across all syllables with syllable-timed staccato rhythm",
      "Velar assimilation converting /n/ to [ŋ] and complete gemination of /d/",
      "Syllabic consonant formation with loss of all unstressed vowels"
    ],
    answer: 0,
    explanation: "'In an era' links [ɪ-nə-nɪərə] via catenation, while 'feed optimization' demonstrates soft coronal boundary transition.",
    vietnamese: "Hiện tượng nối âm liên tiếp và chuyển dịch ranh giới âm tiết trong phát ngôn tốc độ cao."
  },
  {
    id: 'diag-c2-listen',
    stage: 4,
    skill: 'listening',
    level: 'C2',
    prompt: "Listen to the audio. In fast executive cadence, identify the acoustic transition in 'often suffer from severe':",
    audioPrompt: "Organizations that prioritize synchronous consensus often suffer from severe decision paralysis and diminished velocity.",
    ipa: "[ˌɒf(ə)n ˈsʌfə frəm sɪˈvɪə]",
    context: "Audio excerpt: '...often suffer from severe decision paralysis...'",
    options: [
      "Labiodental assimilation of /n/ toward [ɱ] with weak form reduction /frəm/",
      "Full vocalic release of /t/ in 'often' with aspiration [tʰ]",
      "Intrusive /w/ liaison bridging the fricative consonants",
      "Pitch-accent inversion causing tonic syllable fronting"
    ],
    answer: 0,
    explanation: "Fast connected speech reduces 'from' to weak form /frəm/ and /n/ before labiodental /f/ assimilates toward labiodental nasal [ɱ].",
    vietnamese: "Đồng hóa vị trí cấu âm môi-răng kết hợp dạng yếu (weak form) trong nhịp điệu diễn thuyết chuyên sâu."
  }
];

function shuffle<T>(list: readonly T[], rng: () => number = Math.random): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Evaluates the calibrated CEFR level for a skill based on answered questions.
 * Enforces educational ladder progression: failure at an earlier tier stops further promotion.
 */
export function calibrateSkillLevel(
  records: Array<{ level: Cefr; isCorrect: boolean }>,
  _totalInStage?: number
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

    // Passing threshold: 100% if single question, >= 66% (e.g. 2 of 3) if multiple
    const passed = entry.total === 1 ? entry.correct >= 1 : (entry.correct / entry.total) >= 0.66;

    if (passed) {
      calibrated = lvl;
      passedAny = true;
    } else {
      // Ladder climb stops at first failed tier
      break;
    }
  }

  // If 0 questions passed at tested tiers, return A1
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
  const rng = options.rng || Math.random;
  const targetLevels: readonly Cefr[] = mode === 'quick' ? QUICK_BATTERY_LEVELS : CEFR_ORDER;

  const battery: MultiSkillQuestion[] = [];

  // Stage 1: Vocab & Collocations
  const stage1Questions: MultiSkillQuestion[] = [];
  // Stage 2: Grammar
  const stage2Questions: MultiSkillQuestion[] = [];
  // Stage 3: Reading
  const stage3Questions: MultiSkillQuestion[] = [];
  // Stage 4: Listening
  const stage4Questions: MultiSkillQuestion[] = [];
  // Stage 5: Writing
  const stage5Questions: MultiSkillQuestion[] = [];

  // 1. Process curated questions if supplied
  if (options.curatedQuestions && options.curatedQuestions.length > 0) {
    for (const q of options.curatedQuestions) {
      if (q.stage === 1 || q.skill === 'vocab') stage1Questions.push(q);
      else if (q.stage === 2 || q.skill === 'grammar') stage2Questions.push(q);
      else if (q.stage === 3 || q.skill === 'reading') stage3Questions.push(q);
      else if (q.stage === 4 || q.skill === 'listening') stage4Questions.push(q);
      else if (q.stage === 5 || q.skill === 'writing') stage5Questions.push(q);
    }
  }

  // 2. Ensure Stage 4 (Listening) has questions
  if (stage4Questions.length === 0) {
    stage4Questions.push(...CURATED_LISTENING_QUESTIONS);
  }

  // 3. Helper to pick questions per level with fallback synthesis
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
        // Fallback synthesis from raw corpus
        const synthetic = synthesizeQuestion(stageNum, skill, lvl, backupItems, backupKind || '', rng);
        selected.push(synthetic);
      } else {
        // Fallback placeholder with distractor parity
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

  // Ensure randomized answer positioning if requested
  return battery.map((q, idx) => {
    // Ensure all options are distinct
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
      answer: newAnswer >= 0 ? newAnswer : 0
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
    explanation: `Demonstrates appropriate competence for ${level} ${skill}.`
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
  const levelItems = items.filter(x => x.cefrLevel === level);
  const pool = levelItems.length > 0 ? levelItems : items;
  const picked = pool[Math.floor(rng() * pool.length)] || {};

  if (kind === 'colloc' && picked.phrase) {
    const correct = picked.phrase;
    const distractors = pool.filter(x => x.phrase && x.phrase !== correct).map(x => x.phrase).slice(0, 3);
    while (distractors.length < 3) distractors.push(`${level} phrase ${distractors.length + 1}`);
    const options = shuffle([correct, ...distractors], rng);
    return {
      id: `diag-syn-colloc-${level}`,
      stage: 1,
      skill: 'vocab',
      level,
      prompt: "Select the natural collocation that fits the context:",
      context: picked.example || `Essential ${level} usage pattern.`,
      options,
      answer: options.indexOf(correct),
      vietnamese: picked.vietnamese || ''
    };
  }

  return createPlaceholderQuestion(stage, skill, level);
}

/**
 * 5-Stage Sequential Diagnostic Runner.
 * Manages stepper transitions, answer recording, per-stage feedback, and profile persistence.
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

  public recordAnswer(selectedOption: number): {
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

    this.answers.push({
      questionId: currentQ.id,
      stage: currentQ.stage,
      skill: currentQ.skill,
      level: currentQ.level,
      selectedOption,
      correctAnswer: currentQ.answer,
      isCorrect
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

    for (const info of DIAGNOSTIC_STAGES) {
      const stageAnswers = this.answers.filter(a => a.stage === info.stage);
      const stageQuestions = this.getQuestionsForStage(info.stage);
      const correctCount = stageAnswers.filter(a => a.isCorrect).length;
      const totalQuestions = stageQuestions.length;
      const calibratedLevel = calibrateSkillLevel(
        stageAnswers.map(a => ({ level: a.level, isCorrect: a.isCorrect }))
      );

      stageSummaries.push({
        stage: info.stage,
        skill: info.skill,
        calibratedLevel,
        correctCount,
        totalQuestions,
        percentage: totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
      });
    }

    const profile = calibrateSkillProfile(this.answers);

    const totalCorrect = this.answers.filter(a => a.isCorrect).length;

    return {
      profile,
      overallLevel: profile.overall,
      stageSummaries,
      answers: [...this.answers],
      totalCorrect,
      totalQuestions: this.questions.length
    };
  }

  public applyResults(persist: boolean = true): SkillProfile {
    const results = this.getResults();
    if (persist) {
      StorageManager.saveSkillProfile(results.profile);
    }
    return results.profile;
  }
}
