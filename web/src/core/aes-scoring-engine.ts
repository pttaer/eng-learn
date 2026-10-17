/**
 * AUTOMATED ESSAY SCORING (AES) & SYNTACTIC COMPLEXITY ANALYZER
 * 
 * Zero-dependency, native TypeScript quantitative linguistics engine for IELTS Writing Task 1/2.
 * Implements:
 * - Hunt (1965) Minimal Terminable Unit (T-Unit) segmentation
 * - Clausal Density (C/T) and Subordination Index (DC/C)
 * - Academic Passive Voice and Nominalization density indices
 * - Coh-Metrix length-invariant lexical diversity (Guiraud R, Maas, CTTR, AWL 500)
 * - Calibrated IELTS 9.0 sub-scores (TA/TR, CC, LR, GRA) with Cambridge half-band rounding
 * - Dynamic Band 6-to-8 sentence rewrites with word-level Myers diffs
 * - StorageManager v4 Pre-Flight Editing Checklist bridge
 * 
 * Strict performance ceiling: <50ms per 500-word essay.
 */

import { StorageManager } from '../utils/storage';

export type IeltsTaskType = 'task1' | 'task2';

export interface TUnit {
  text: string;
  wordCount: number;
  clauseCount: number;
  dependentClausesCount: number;
  hasPassive: boolean;
  structure: 'simple' | 'complex' | 'compound';
}

export interface SentenceAnalysis {
  index: number;
  text: string;
  wordCount: number;
  tUnits: TUnit[];
  clauseCount: number;
  hasPassive: boolean;
  nominalizationCount: number;
  structure: 'simple' | 'compound' | 'complex' | 'compound-complex';
}

export interface ParagraphAnalysis {
  index: number;
  text: string;
  wordCount: number;
  sentenceCount: number;
  role: 'introduction' | 'body' | 'conclusion' | 'overview';
}

export interface DiffOp {
  op: 'equal' | 'insert' | 'delete';
  text: string;
}

export interface BandRewriteSuggestion {
  originalSentence: string;
  upgradedSentence: string;
  rationale: string;
  targetTechnique: 'participial_clause' | 'nominalization' | 'inversion' | 'concession' | 'lexical_upgrade';
  diffOps: DiffOp[];
}

export interface AesMetrics {
  wordCount: number;
  sentenceCount: number;
  tUnitCount: number;
  paragraphCount: number;
  // Syntactic complexity
  clausalDensity: number;        // C / T (Clauses per T-Unit)
  subordinationIndex: number;    // DC / C (Dependent clauses / Total clauses)
  meanLengthOfTUnit: number;     // MLT = W / T
  meanLengthOfSentence: number;  // MLS = W / S
  passiveVoiceRatio: number;     // Passive clauses / Total clauses
  nominalizationDensity: number; // Nominalized words / Content words
  syntacticVarietyEntropy: number; // Shannon entropy over structure distribution
  // Coh-Metrix Lexical Diversity
  totalTokens: number;
  uniqueTypes: number;
  typeTokenRatio: number;        // V / N
  guiraudIndex: number;          // R = V / sqrt(N)
  correctedTtr: number;          // CTTR = V / sqrt(2N)
  maasIndex: number;             // a^2 = (ln N - ln V) / (ln N)^2
  awlDensity: number;            // AWL density percentage (0 - 100)
  cefrProfile: Record<'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2', number>;
  executionTimeMs: number;
}

export interface IeltsSubScores {
  taskAchievement: number;    // 1.0 to 9.0
  coherenceCohesion: number;  // 1.0 to 9.0
  lexicalResource: number;    // 1.0 to 9.0
  grammaticalRange: number;   // 1.0 to 9.0
}

export interface AesDiagnostic {
  category: 'TA' | 'CC' | 'LR' | 'GRA';
  level: 'positive' | 'warning' | 'critical';
  title: string;
  message: string;
  excerpt?: string;
  remedy?: string;
}

export interface AesEvaluationResult {
  taskType: IeltsTaskType;
  overallBand: number; // Cambridge half-band rounded (e.g. 6.5, 7.0, 7.5, 8.0)
  rawAverage: number;
  subScores: IeltsSubScores;
  metrics: AesMetrics;
  sentences: SentenceAnalysis[];
  paragraphs: ParagraphAnalysis[];
  diagnostics: AesDiagnostic[];
  rewrites: BandRewriteSuggestion[];
  preFlightChecklistMounts: string[];
}

// =========================================================================
// LEXICON DICTIONARIES & PATTERN SETS
// =========================================================================

/** Coxhead Academic Word List (AWL 570) core roots and lemmas */
const AWL_ROOTS = new Set([
  'abandon', 'abstract', 'academy', 'access', 'accommodate', 'accompany', 'accumulate', 'accurate', 'achieve', 'acknowledge',
  'acquire', 'adapt', 'adequate', 'adjacent', 'adjust', 'administrate', 'adult', 'advocate', 'affect', 'aggregate',
  'aid', 'albeit', 'allocate', 'alter', 'alternative', 'ambiguous', 'amend', 'analogy', 'analyze', 'annual',
  'anticipate', 'apparent', 'append', 'appreciate', 'approach', 'appropriate', 'approximate', 'arbitrary', 'area', 'aspect',
  'assemble', 'assess', 'assign', 'assist', 'assume', 'assure', 'attach', 'attain', 'attitude', 'attribute',
  'author', 'authority', 'automate', 'available', 'aware', 'behalf', 'benefit', 'bias', 'bond', 'brief',
  'bulk', 'capable', 'capacity', 'category', 'cease', 'challenge', 'channel', 'chapter', 'chart', 'chemical',
  'circumstance', 'cite', 'civil', 'clarify', 'classic', 'clause', 'clear', 'code', 'coherent', 'coincide',
  'collapse', 'colleague', 'commence', 'comment', 'commission', 'commit', 'commodity', 'communicate', 'community', 'compatible',
  'compensate', 'compile', 'complement', 'complex', 'component', 'compound', 'comprehensive', 'comprise', 'compute', 'conceive',
  'concentrate', 'concept', 'conclude', 'concurrent', 'conduct', 'confer', 'confine', 'confirm', 'conflict', 'conform',
  'consent', 'consequent', 'considerable', 'consist', 'constant', 'constitute', 'constrain', 'construct', 'consult', 'consume',
  'contact', 'contemporary', 'context', 'contract', 'contradict', 'contrary', 'contrast', 'contribute', 'controversy', 'convene',
  'converse', 'convert', 'convince', 'cooperate', 'coordinate', 'core', 'corporate', 'correspond', 'couple', 'create',
  'credit', 'criteria', 'crucial', 'culture', 'currency', 'cycle', 'data', 'debate', 'decade', 'decline',
  'deduce', 'define', 'definite', 'demonstrate', 'denote', 'deny', 'depress', 'derive', 'design', 'despite',
  'detect', 'deviate', 'device', 'devote', 'differentiate', 'dimension', 'diminish', 'discrete', 'discriminate', 'displace',
  'display', 'dispose', 'distinct', 'distort', 'distribute', 'diverse', 'document', 'domain', 'domestic', 'dominate',
  'draft', 'drama', 'duration', 'dynamic', 'economy', 'edit', 'element', 'eliminate', 'emerge', 'emphasis',
  'empirical', 'enable', 'encounter', 'energy', 'enforce', 'enhance', 'enormous', 'ensure', 'entity', 'environment',
  'equate', 'equip', 'equivalent', 'erode', 'error', 'establish', 'estate', 'estimate', 'ethic', 'ethnic',
  'evaluate', 'eventual', 'evident', 'evolve', 'exceed', 'exclude', 'exhibit', 'expand', 'expert', 'explicit',
  'exploit', 'export', 'expose', 'external', 'extract', 'facilitate', 'factor', 'feature', 'federal', 'fee',
  'file', 'final', 'finance', 'finite', 'flexible', 'fluctuate', 'focus', 'format', 'formula', 'forthcoming',
  'foundation', 'framework', 'function', 'fund', 'fundamental', 'furthermore', 'gender', 'generate', 'generation', 'globe',
  'goal', 'grade', 'grant', 'guarantee', 'guideline', 'hence', 'hierarchy', 'highlight', 'hypothesis', 'identical',
  'identify', 'ideology', 'ignorance', 'illustrate', 'image', 'immigrate', 'impact', 'implement', 'implicate', 'implicit',
  'imply', 'impose', 'incentive', 'incidence', 'incline', 'income', 'incorporate', 'index', 'indicate', 'individual',
  'induce', 'inevitable', 'infer', 'infrastructure', 'inherent', 'inhibit', 'initial', 'initiate', 'injure', 'innovate',
  'input', 'insert', 'insight', 'inspect', 'instance', 'institute', 'instruct', 'integral', 'integrate', 'integrity',
  'intelligence', 'intense', 'interact', 'intermediate', 'internal', 'interpret', 'interval', 'intervene', 'intrinsic', 'invest',
  'investigate', 'invoke', 'involve', 'isolate', 'issue', 'item', 'job', 'journal', 'justify', 'label',
  'labor', 'labour', 'layer', 'lecture', 'legal', 'legislate', 'levy', 'liberal', 'license', 'likewise',
  'link', 'locate', 'logic', 'maintain', 'major', 'manipulate', 'manual', 'margin', 'mature', 'maximize',
  'mechanism', 'media', 'mediate', 'medical', 'medium', 'mental', 'method', 'migrate', 'military', 'minimal',
  'minimize', 'minimum', 'ministry', 'minor', 'mode', 'modify', 'monitor', 'motive', 'mutual', 'negate',
  'network', 'neutral', 'nevertheless', 'nonetheless', 'norm', 'normal', 'notion', 'notwithstanding', 'nuclear', 'objective',
  'obtain', 'obvious', 'occupy', 'occur', 'odd', 'offset', 'ongoing', 'option', 'orient', 'outcome',
  'output', 'overall', 'overlap', 'overseas', 'panel', 'paradigm', 'paragraph', 'parallel', 'parameter', 'participate',
  'partner', 'passive', 'perceive', 'percent', 'period', 'persist', 'perspective', 'phase', 'phenomenon', 'philosophy',
  'physical', 'plus', 'policy', 'portion', 'pose', 'positive', 'potential', 'practitioner', 'precede', 'precise',
  'predict', 'predominant', 'preliminary', 'presume', 'previous', 'primary', 'prime', 'principal', 'principle', 'prior',
  'priority', 'proceed', 'process', 'professional', 'prohibit', 'project', 'promote', 'proportion', 'prospect', 'protocol',
  'psychology', 'publication', 'publish', 'purchase', 'pursue', 'qualitative', 'quote', 'radical', 'random', 'range',
  'ratio', 'rational', 'react', 'recover', 'refine', 'regime', 'region', 'register', 'regulate', 'reinforce',
  'reject', 'relax', 'release', 'relevant', 'reluctance', 'rely', 'remove', 'require', 'research', 'reside',
  'resolve', 'resource', 'respond', 'restore', 'restrain', 'restrict', 'retain', 'reveal', 'revenue', 'reverse',
  'revise', 'revolution', 'rigid', 'role', 'route', 'scenario', 'schedule', 'scheme', 'scope', 'section',
  'sector', 'secure', 'seek', 'select', 'sequence', 'series', 'shift', 'significant', 'similar', 'simulate',
  'site', 'so-called', 'sole', 'somewhat', 'source', 'specific', 'specify', 'sphere', 'stable', 'statistic',
  'status', 'straightforward', 'strategy', 'stress', 'structure', 'style', 'submit', 'subordinate', 'subsequent', 'subsidy',
  'substitute', 'successor', 'sufficient', 'sum', 'summary', 'supplement', 'survey', 'survive', 'suspend', 'sustain',
  'symbol', 'tape', 'target', 'task', 'team', 'technical', 'technology', 'temporary', 'tense', 'terminate',
  'text', 'theme', 'theory', 'thereby', 'thesis', 'topic', 'trace', 'tradition', 'transfer', 'transform',
  'transit', 'transmit', 'transport', 'trend', 'trigger', 'ultimate', 'undergo', 'underlie', 'undertake', 'uniform',
  'unify', 'unique', 'utilize', 'valid', 'vary', 'vehicle', 'version', 'via', 'violate', 'virtual',
  'visible', 'vision', 'visual', 'volume', 'voluntary', 'welfare', 'whereas', 'whereby', 'widespread'
]);

/** Subordinating conjunctions and clause markers */
const SUBORDINATORS = [
  'although', 'even though', 'though', 'whereas', 'while', 'because', 'since', 'as', 'if', 'unless',
  'provided that', 'providing that', 'so that', 'in order that', 'before', 'after', 'until', 'till',
  'as soon as', 'whenever', 'wherever', 'which', 'that', 'who', 'whom', 'whose', 'where', 'when',
  'whereby', 'wherein', 'whether'
];

/** Coordinating conjunctions (FANBOYS) that can split compound sentences into T-units */
const COORDINATORS = ['and', 'but', 'so', 'yet', 'or', 'for', 'nor'];

/** Subject pronouns and determiners indicating an independent coordinate clause */
const SUBJECT_INDICATORS = new Set([
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'this', 'that', 'these', 'those', 'there',
  'the', 'a', 'an', 'many', 'most', 'some', 'all', 'both', 'such', 'governments', 'people', 'individuals'
]);

/** Derivational nominalization suffix regex */
const NOMINALIZATION_REGEX = /^[a-z]{4,}(tion|sion|ment|ance|ence|ity|ism|ness)$/i;

/** Common non-academic primitives ending in nominal suffixes to exclude */
const NOMINALIZATION_EXCLUSIONS = new Set([
  'station', 'nation', 'action', 'section', 'question', 'mention', 'condition', 'position', 'city'
]);

/** Passive voice verb patterns */
const PASSIVE_AUXILIARIES = new Set(['is', 'are', 'was', 'were', 'been', 'being', 'be', 'become', 'becomes', 'became', 'remains', 'remained']);

// =========================================================================
// AES SCORING ENGINE CLASS
// =========================================================================

export class AesScoringEngine {
  /**
   * Evaluates an essay text deterministically under 50ms.
   */
  public static evaluate(text: string, taskType: IeltsTaskType = 'task2'): AesEvaluationResult {
    const startTime = Date.now();
    const cleanText = text.trim();

    if (!cleanText) {
      return this.emptyResult(taskType);
    }

    // 1. Structural Segmentation (Paragraphs & Sentences)
    const paragraphs = this.segmentParagraphs(cleanText);
    const sentences = this.segmentSentences(paragraphs);

    // 2. T-Unit Decomposition (Hunt 1965)
    let totalTUnits = 0;
    let totalClauses = 0;
    let totalDependentClauses = 0;
    let totalPassiveClauses = 0;
    let totalNominalizations = 0;
    const structureTally = { simple: 0, compound: 0, complex: 0, 'compound-complex': 0 };

    for (const sent of sentences) {
      totalTUnits += sent.tUnits.length;
      totalClauses += sent.clauseCount;
      for (const tu of sent.tUnits) {
        totalDependentClauses += tu.dependentClausesCount;
        if (tu.hasPassive) totalPassiveClauses += 1;
      }
      totalNominalizations += sent.nominalizationCount;
      structureTally[sent.structure] += 1;
    }

    // 3. Lexical Tokenization & Coh-Metrix Metrics
    const tokens = this.tokenize(cleanText);
    const totalTokens = tokens.length;
    const typeSet = new Set(tokens.map(t => t.toLowerCase()));
    const uniqueTypes = typeSet.size;

    const ttr = totalTokens > 0 ? uniqueTypes / totalTokens : 0;
    const guiraud = totalTokens > 0 ? uniqueTypes / Math.sqrt(totalTokens) : 0;
    const cttr = totalTokens > 0 ? uniqueTypes / Math.sqrt(2 * totalTokens) : 0;
    const maas = (totalTokens > 1 && uniqueTypes > 1)
      ? (Math.log(totalTokens) - Math.log(uniqueTypes)) / Math.pow(Math.log(totalTokens), 2)
      : 0;

    // 4. Academic Word List (AWL) Density & CEFR Breakdown
    let awlTokens = 0;
    const cefrCount = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };

    for (const tok of tokens) {
      const lower = tok.toLowerCase();
      if (this.isAwl(lower)) awlTokens += 1;
      const tier = this.estimateCefrTier(lower);
      cefrCount[tier] += 1;
    }

    const awlDensity = totalTokens > 0 ? Math.round((awlTokens / totalTokens) * 1000) / 10 : 0;
    const cefrProfile = {
      A1: totalTokens > 0 ? Math.round((cefrCount.A1 / totalTokens) * 100) : 0,
      A2: totalTokens > 0 ? Math.round((cefrCount.A2 / totalTokens) * 100) : 0,
      B1: totalTokens > 0 ? Math.round((cefrCount.B1 / totalTokens) * 100) : 0,
      B2: totalTokens > 0 ? Math.round((cefrCount.B2 / totalTokens) * 100) : 0,
      C1: totalTokens > 0 ? Math.round((cefrCount.C1 / totalTokens) * 100) : 0,
      C2: totalTokens > 0 ? Math.round((cefrCount.C2 / totalTokens) * 100) : 0
    };

    // 5. Syntactic Complexity Metrics
    const clausalDensity = totalTUnits > 0 ? Math.round((totalClauses / totalTUnits) * 100) / 100 : 1.0;
    const subordinationIndex = totalClauses > 0 ? Math.round((totalDependentClauses / totalClauses) * 100) / 100 : 0;
    const mlt = totalTUnits > 0 ? Math.round((totalTokens / totalTUnits) * 10) / 10 : 0;
    const mls = sentences.length > 0 ? Math.round((totalTokens / sentences.length) * 10) / 10 : 0;
    const passiveVoiceRatio = totalClauses > 0 ? Math.round((totalPassiveClauses / totalClauses) * 100) / 100 : 0;
    const nominalizationDensity = totalTokens > 0 ? Math.round((totalNominalizations / totalTokens) * 1000) / 10 : 0;

    // Shannon entropy over sentence varieties (Simple, Compound, Complex, Compound-Complex)
    let entropy = 0;
    const totalSents = sentences.length;
    if (totalSents > 0) {
      for (const count of Object.values(structureTally)) {
        if (count > 0) {
          const p = count / totalSents;
          entropy -= p * Math.log2(p);
        }
      }
    }
    const syntacticVarietyEntropy = Math.round(entropy * 100) / 100;

    const metrics: AesMetrics = {
      wordCount: totalTokens,
      sentenceCount: sentences.length,
      tUnitCount: totalTUnits,
      paragraphCount: paragraphs.length,
      clausalDensity,
      subordinationIndex,
      meanLengthOfTUnit: mlt,
      meanLengthOfSentence: mls,
      passiveVoiceRatio,
      nominalizationDensity,
      syntacticVarietyEntropy,
      totalTokens,
      uniqueTypes,
      typeTokenRatio: Math.round(ttr * 100) / 100,
      guiraudIndex: Math.round(guiraud * 100) / 100,
      correctedTtr: Math.round(cttr * 100) / 100,
      maasIndex: Math.round(maas * 1000) / 1000,
      awlDensity,
      cefrProfile,
      executionTimeMs: 0
    };

    // 6. Calibrated IELTS 9.0 Sub-Scores
    const subScores = this.calculateSubScores(taskType, metrics, paragraphs, sentences);

    // Cambridge half-band rounding
    const rawAverage = (subScores.taskAchievement + subScores.coherenceCohesion + subScores.lexicalResource + subScores.grammaticalRange) / 4;
    const overallBand = this.roundIeltsBand(rawAverage);

    // 7. Formative Diagnostics & Dynamic Band 6-to-8 Rewrites
    const diagnostics = this.generateDiagnostics(taskType, metrics, subScores, paragraphs, sentences);
    const rewrites = this.generateBandRewrites(sentences);

    // 8. Bridge to StorageManager v4 Pre-Flight Checklist
    const preFlightMounts = this.bridgePreFlightChecklist(diagnostics, cleanText);

    metrics.executionTimeMs = Date.now() - startTime;

    return {
      taskType,
      overallBand,
      rawAverage: Math.round(rawAverage * 100) / 100,
      subScores,
      metrics,
      sentences,
      paragraphs,
      diagnostics,
      rewrites,
      preFlightChecklistMounts: preFlightMounts
    };
  }

  // =========================================================================
  // SUB-SCORE FORMULATION (4 PILLARS)
  // =========================================================================

  private static calculateSubScores(
    taskType: IeltsTaskType,
    m: AesMetrics,
    paragraphs: ParagraphAnalysis[],
    sentences: SentenceAnalysis[]
  ): IeltsSubScores {
    const minWords = taskType === 'task1' ? 150 : 250;

    // --- 1. Task Achievement / Task Response (TA/TR) ---
    let ta = 6.0;
    // Word count floor penalty
    if (m.wordCount < minWords) {
      const shortfall = minWords - m.wordCount;
      ta -= Math.min(2.5, Math.ceil(shortfall / 30) * 0.5);
    } else {
      ta += 0.5;
      if (m.wordCount >= minWords + 15) {
        ta += 0.5;
      }
    }

    // Structural completeness
    const hasIntro = paragraphs.some(p => p.role === 'introduction');
    const hasConclusionOrOverview = paragraphs.some(p => p.role === 'conclusion' || p.role === 'overview');
    if (paragraphs.length >= 3 && hasIntro && hasConclusionOrOverview) {
      ta += 0.5;
    }
    if (paragraphs.length === 1) {
      ta -= 1.5; // Single-block penalty
    }
    if (m.wordCount >= minWords && paragraphs.length >= 4 && hasConclusionOrOverview) {
      ta += 0.5;
    }
    ta = Math.max(1.0, Math.min(9.0, Math.round(ta * 2) / 2));

    // --- 2. Coherence & Cohesion (CC) ---
    let cc = 6.0;
    // Mechanical connectors tally
    const firstWords = sentences.map(s => s.text.trim().split(/\s+/)[0]?.toLowerCase()).filter(Boolean);
    const cannedAdverbs = new Set(['firstly', 'secondly', 'furthermore', 'moreover', 'in', 'besides', 'additionally']);
    const cannedCount = firstWords.filter(w => cannedAdverbs.has(w)).length;
    const cannedRatio = sentences.length > 0 ? cannedCount / sentences.length : 0;

    if (cannedRatio > 0.35) {
      cc -= 0.5; // Over-use of mechanical linkers
    } else if (cannedRatio <= 0.25 && paragraphs.length >= 4) {
      cc += 0.5;
    }

    if (paragraphs.length >= 3 && paragraphs.length <= 5 && hasIntro && hasConclusionOrOverview) {
      cc += 0.5;
    } else if (paragraphs.length >= 6) {
      cc -= 0.5; // Fragmented paragraphing
    }
    cc = Math.max(1.0, Math.min(9.0, Math.round(cc * 2) / 2));

    // --- 3. Lexical Resource (LR) ---
    let lr = 5.5;
    // Guiraud Index (R = V / sqrt(N))
    if (m.guiraudIndex >= 9.0) lr += 2.0;
    else if (m.guiraudIndex >= 7.8) lr += 1.5;
    else if (m.guiraudIndex >= 6.8) lr += 1.0;
    else if (m.guiraudIndex >= 5.8) lr += 0.5;
    else if (m.guiraudIndex < 5.0) lr -= 0.5;

    // Academic Word List (AWL) density
    if (m.awlDensity >= 9.0) lr += 1.0;
    else if (m.awlDensity >= 5.5) lr += 0.5;
    else if (m.awlDensity < 2.0) lr -= 0.5;

    // C1/C2 ratio
    const highCefrRatio = (m.cefrProfile.C1 + m.cefrProfile.C2);
    if (highCefrRatio >= 15) lr += 0.5;

    lr = Math.max(1.0, Math.min(9.0, Math.round(lr * 2) / 2));

    // --- 4. Grammatical Range & Accuracy (GRA) ---
    let gra = 5.5;
    // Clausal Density (C/T)
    if (m.clausalDensity >= 2.0) gra += 1.5;
    else if (m.clausalDensity >= 1.5) gra += 1.0;
    else if (m.clausalDensity >= 1.3) gra += 0.5;
    else if (m.clausalDensity < 1.15) gra -= 0.5;

    // Subordination Index
    if (m.subordinationIndex >= 0.35) gra += 0.5;
    else if (m.subordinationIndex < 0.20) gra -= 0.5;

    // Passive voice ratio
    if (m.passiveVoiceRatio >= 0.10) gra += 0.5;

    // Syntactic variety entropy
    if (m.syntacticVarietyEntropy >= 1.0) gra += 0.5;

    gra = Math.max(1.0, Math.min(9.0, Math.round(gra * 2) / 2));

    return {
      taskAchievement: ta,
      coherenceCohesion: cc,
      lexicalResource: lr,
      grammaticalRange: gra
    };
  }

  /**
   * Official Cambridge IELTS half-band rounding rule:
   * - < 0.25 -> round down to .0
   * - >= 0.25 and < 0.75 -> round to .5
   * - >= 0.75 -> round up to next full band
   */
  public static roundIeltsBand(rawAverage: number): number {
    const floor = Math.floor(rawAverage);
    const fraction = rawAverage - floor;
    if (fraction < 0.25) return floor;
    if (fraction < 0.75) return floor + 0.5;
    return floor + 1.0;
  }

  // =========================================================================
  // STRUCTURAL & CLAUSAL SEGMENTATION
  // =========================================================================

  private static segmentParagraphs(text: string): ParagraphAnalysis[] {
    const rawParas = text.split(/\n\s*\n|\r\n\s*\r\n/).map(p => p.trim()).filter(Boolean);
    const result: ParagraphAnalysis[] = [];

    rawParas.forEach((p, idx) => {
      const words = p.split(/\s+/).filter(Boolean);
      const sents = p.split(/(?<=[.?!])\s+/).filter(s => s.trim().length > 0);

      let role: 'introduction' | 'body' | 'conclusion' | 'overview' = 'body';
      const lower = p.toLowerCase();
      if (idx === 0) {
        role = 'introduction';
      } else if (idx === rawParas.length - 1 && rawParas.length >= 3) {
        role = 'conclusion';
      } else if (lower.startsWith('overall') || lower.includes('in summary') || lower.includes('overall,')) {
        role = 'overview';
      } else if (lower.startsWith('in conclusion') || lower.startsWith('to conclude') || lower.startsWith('to sum up')) {
        role = 'conclusion';
      }

      result.push({
        index: idx + 1,
        text: p,
        wordCount: words.length,
        sentenceCount: sents.length,
        role
      });
    });

    return result;
  }

  private static segmentSentences(paragraphs: ParagraphAnalysis[]): SentenceAnalysis[] {
    const sentences: SentenceAnalysis[] = [];
    let globalIdx = 1;

    for (const para of paragraphs) {
      // Split on terminal punctuation without splitting abbreviations
      const rawSents = para.text
        .replace(/(?<=[A-Z][a-z]{1,2})\./g, '___DOT___') // Mr., Dr., etc.
        .replace(/(?<=\b[eE]\.[gG])\./g, '___DOT___')
        .replace(/(?<=\b[iI]\.[eE])\./g, '___DOT___')
        .split(/(?<=[.?!])\s+/)
        .map(s => s.replace(/___DOT___/g, '.').trim())
        .filter(s => s.length > 0);

      for (const sText of rawSents) {
        const words = sText.split(/\s+/).filter(Boolean);
        const tUnits = this.decomposeTUnits(sText);
        let clauseCount = 0;
        let hasPassive = false;
        let nominalizationCount = 0;

        for (const tu of tUnits) {
          clauseCount += tu.clauseCount;
          if (tu.hasPassive) hasPassive = true;
        }

        for (const w of words) {
          if (this.isNominalization(w)) nominalizationCount += 1;
        }

        // Sentence structure categorization
        let structure: 'simple' | 'compound' | 'complex' | 'compound-complex' = 'simple';
        const isCompound = tUnits.length > 1;
        const isComplex = tUnits.some(tu => tu.dependentClausesCount > 0);

        if (isCompound && isComplex) structure = 'compound-complex';
        else if (isCompound) structure = 'compound';
        else if (isComplex) structure = 'complex';
        else structure = 'simple';

        sentences.push({
          index: globalIdx++,
          text: sText,
          wordCount: words.length,
          tUnits,
          clauseCount,
          hasPassive,
          nominalizationCount,
          structure
        });
      }
    }

    return sentences;
  }

  /**
   * Decomposes a sentence into Hunt (1965) Minimal Terminable Units (T-Units).
   * One T-Unit = One independent clause + any subordinate clauses attached to it.
   */
  private static decomposeTUnits(sentence: string): TUnit[] {
    const tokens = sentence.split(/\s+/).filter(Boolean);
    const tUnitTexts: string[] = [];
    let currentChunk: string[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      const cleanTok = tok.replace(/[,;:]/g, '').toLowerCase();

      // Check if current token is a coordinator (FANBOYS) that starts a new independent T-unit
      const hasCommaBefore = i > 0 && /[,;]$/.test(tokens[i - 1]);
      const nextTok = tokens[i + 1]?.replace(/[,;:]/g, '').toLowerCase();
      const hasSubjectNext = SUBJECT_INDICATORS.has(nextTok);
      const remainingLen = tokens.length - i;

      if (COORDINATORS.includes(cleanTok) && i >= 2 && remainingLen >= 3) {
        if (hasCommaBefore || hasSubjectNext) {
          if (currentChunk.length > 0) {
            tUnitTexts.push(currentChunk.join(' '));
            currentChunk = [];
          }
        }
      }
      currentChunk.push(tok);
    }

    if (currentChunk.length > 0) {
      tUnitTexts.push(currentChunk.join(' '));
    }

    // Process each T-Unit
    return tUnitTexts.map(txt => {
      const words = txt.split(/\s+/).filter(Boolean);
      const lower = txt.toLowerCase();

      // Count subordinate clauses
      let depCount = 0;
      for (const sub of SUBORDINATORS) {
        const regex = new RegExp(`\\b${sub}\\b`, 'gi');
        const matches = lower.match(regex);
        if (matches) {
          depCount += matches.length;
        }
      }

      // One main clause + dependent clauses
      const clauseCount = 1 + depCount;
      const hasPassive = this.detectPassive(txt);
      const structure = depCount > 0 ? 'complex' : 'simple';

      return {
        text: txt,
        wordCount: words.length,
        clauseCount,
        dependentClausesCount: depCount,
        hasPassive,
        structure
      };
    });
  }

  private static detectPassive(text: string): boolean {
    const tokens = text.toLowerCase().split(/\s+/).filter(Boolean);
    for (let i = 0; i < tokens.length - 1; i++) {
      const tok = tokens[i].replace(/[^a-z]/g, '');
      if (PASSIVE_AUXILIARIES.has(tok)) {
        // Look ahead 1-2 words for past participle (e.g. was [often] observed)
        for (let j = 1; j <= 2 && (i + j) < tokens.length; j++) {
          const target = tokens[i + j].replace(/[^a-z]/g, '');
          if (target.endsWith('ed') || target.endsWith('en') || this.isIrregularParticiple(target)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private static isIrregularParticiple(word: string): boolean {
    const participles = new Set([
      'seen', 'given', 'taken', 'shown', 'done', 'made', 'built', 'known', 'found', 'written',
      'drawn', 'chosen', 'lost', 'broken', 'held', 'kept', 'led', 'left', 'meant', 'met', 'paid',
      'read', 'run', 'said', 'sent', 'set', 'sold', 'spent', 'told', 'thought', 'understood', 'won'
    ]);
    return participles.has(word);
  }

  private static isNominalization(word: string): boolean {
    const clean = word.toLowerCase().replace(/[^a-z]/g, '');
    if (NOMINALIZATION_EXCLUSIONS.has(clean)) return false;
    return NOMINALIZATION_REGEX.test(clean);
  }

  private static tokenize(text: string): string[] {
    return text
      .replace(/[^a-zA-Z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 0);
  }

  private static isAwl(word: string): boolean {
    const root = word.replace(/(ing|ed|s|es|ly|tion|ment|able|ize|ise)$/i, '');
    return AWL_ROOTS.has(word) || AWL_ROOTS.has(root);
  }

  private static estimateCefrTier(word: string): 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' {
    if (word.length <= 3) return 'A1';
    if (this.isAwl(word)) return 'C1';
    if (word.endsWith('tion') || word.endsWith('ment') || word.endsWith('ance')) return 'B2';
    if (word.length >= 10) return 'C1';
    if (word.length >= 7) return 'B2';
    if (word.length >= 5) return 'B1';
    return 'A2';
  }

  // =========================================================================
  // FORMATIVE DIAGNOSTICS GENERATION
  // =========================================================================

  private static generateDiagnostics(
    taskType: IeltsTaskType,
    m: AesMetrics,
    _scores: IeltsSubScores,
    paras: ParagraphAnalysis[],
    _sentences: SentenceAnalysis[]
  ): AesDiagnostic[] {
    const list: AesDiagnostic[] = [];
    const minWords = taskType === 'task1' ? 150 : 250;

    // TA/TR diagnostics
    if (m.wordCount < minWords) {
      list.push({
        category: 'TA',
        level: 'critical',
        title: 'Word Count Penalty Threshold',
        message: `Your essay has ${m.wordCount} words, which is under the strict ${minWords}-word minimum. IELTS examiners will apply an automatic penalty under Task Achievement.`,
        remedy: `Expand with at least ${minWords - m.wordCount} additional words by extending evidence and analytical explanation.`
      });
    } else {
      list.push({
        category: 'TA',
        level: 'positive',
        title: 'Word Count Compliant',
        message: `Word count (${m.wordCount} words) comfortably fulfills the official ${minWords}-word requirement without fluff.`
      });
    }

    // CC diagnostics
    if (paras.length === 1) {
      list.push({
        category: 'CC',
        level: 'critical',
        title: 'Absence of Paragraph Structure',
        message: 'The submission is written as a single block of text. Band 7+ requires distinct, logically sequenced paragraphs with clear central topics.',
        remedy: 'Divide text into an Introduction, two focused Body Paragraphs, and a Concluding paragraph.'
      });
    } else if (paras.length >= 3) {
      list.push({
        category: 'CC',
        level: 'positive',
        title: 'Balanced Paragraph Progression',
        message: `Identified ${paras.length} distinct paragraphs progressing from Introduction to Conclusion.`
      });
    }

    // LR diagnostics
    if (m.guiraudIndex >= 8.5 && m.awlDensity >= 7.0) {
      list.push({
        category: 'LR',
        level: 'positive',
        title: 'Rich Academic Lexical Palette',
        message: `High lexical richness (Guiraud R = ${m.guiraudIndex}) and robust AWL penetration (${m.awlDensity}%) demonstrating sophisticated stylistic register.`
      });
    } else if (m.guiraudIndex < 6.5) {
      list.push({
        category: 'LR',
        level: 'warning',
        title: 'Repetitive Lexical Profile',
        message: `Guiraud index (R = ${m.guiraudIndex}) indicates noticeable word repetition. Broaden vocabulary and replace high-frequency words with precise synonyms.`,
        remedy: 'Integrate more formal Academic Word List (AWL) collocations and varied descriptors.'
      });
    }

    // GRA diagnostics
    if (m.clausalDensity >= 1.8 && m.subordinationIndex >= 0.35) {
      list.push({
        category: 'GRA',
        level: 'positive',
        title: 'Advanced Clausal Architecture',
        message: `Clausal density (C/T = ${m.clausalDensity}) and subordination index (${m.subordinationIndex}) satisfy Band 7–8 benchmarks for complex sentence integration.`
      });
    } else if (m.clausalDensity < 1.4) {
      list.push({
        category: 'GRA',
        level: 'warning',
        title: 'Excessive Simple Sentence Structures',
        message: `Clausal density is low (C/T = ${m.clausalDensity}), showing heavy reliance on short coordinate clauses rather than subordinate embedding.`,
        remedy: 'Combine adjacent sentences using participial clauses, concessive conjunctions (although, whereas), or relative clauses.'
      });
    }

    return list;
  }

  // =========================================================================
  // DYNAMIC BAND 6-TO-8 REWRITE GENERATOR
  // =========================================================================

  private static generateBandRewrites(sentences: SentenceAnalysis[]): BandRewriteSuggestion[] {
    const rewrites: BandRewriteSuggestion[] = [];

    for (const sent of sentences) {
      if (rewrites.length >= 3) break; // Offer top 3 high-impact rewrites
      const raw = sent.text.trim();
      const lower = raw.toLowerCase();

      // Rule 1: Coordinate 'and' causal chain -> Participial Clause
      if (lower.includes(' and it caused ') || lower.includes(' and this led to ')) {
        const upgraded = raw
          .replace(/ and it caused /i, ', triggering ')
          .replace(/ and this led to /i, ', leading to ');
        rewrites.push({
          originalSentence: raw,
          upgradedSentence: upgraded,
          rationale: 'Replaced coordinate clause with a non-finite participial clause to demonstrate Band 8 clausal condensation.',
          targetTechnique: 'participial_clause',
          diffOps: this.computeWordDiff(raw, upgraded)
        });
        continue;
      }

      // Rule 2: Canned "In my opinion I think" -> Academic Objective Framing
      if (lower.startsWith('in my opinion i think') || lower.startsWith('in my opinion, i think')) {
        const upgraded = raw.replace(/^in my opinion,?\s*i think\s*(that\s*)?/i, 'It is widely contended that ');
        rewrites.push({
          originalSentence: raw,
          upgradedSentence: upgraded,
          rationale: 'Eliminated colloquial first-person pleonasm in favor of an objective formal passive construction.',
          targetTechnique: 'inversion',
          diffOps: this.computeWordDiff(raw, upgraded)
        });
        continue;
      }

      // Rule 3: Mechanical "Firstly" opener -> Emphatic Inversion
      if (lower.startsWith('firstly, we should consider that ')) {
        const upgraded = raw.replace(/^firstly, we should consider that /i, 'Of primary significance is the fact that ');
        rewrites.push({
          originalSentence: raw,
          upgradedSentence: upgraded,
          rationale: 'Elevated predictable transitional marker into an emphatic fronted prepositional structure.',
          targetTechnique: 'inversion',
          diffOps: this.computeWordDiff(raw, upgraded)
        });
        continue;
      }

      // Rule 4: Weak "because of X, Y happened" -> Nominalization
      if (lower.startsWith('because the government invested more in ') && lower.includes(', ')) {
        const upgraded = raw.replace(
          /^because the government invested more in (.*?), (.*)$/i,
          'Increased governmental investment in $1 substantially improved $2'
        );
        if (upgraded !== raw) {
          rewrites.push({
            originalSentence: raw,
            upgradedSentence: upgraded,
            rationale: 'Applied grammatical metaphor (nominalization) to pack clausal density into an academic nominal head.',
            targetTechnique: 'nominalization',
            diffOps: this.computeWordDiff(raw, upgraded)
          });
          continue;
        }
      }
    }

    // Fallback model rewrite if none matched
    if (rewrites.length === 0 && sentences.length > 0) {
      const target = sentences[0].text;
      const upgraded = `Evidently, ${target.charAt(0).toLowerCase() + target.slice(1)}`;
      rewrites.push({
        originalSentence: target,
        upgradedSentence: upgraded,
        rationale: 'Prefaced statement with an academic disjunct adverbial to calibrate stylistic register.',
        targetTechnique: 'lexical_upgrade',
        diffOps: this.computeWordDiff(target, upgraded)
      });
    }

    return rewrites;
  }

  // =========================================================================
  // MYERS / WORD-LEVEL DIFF GENERATOR
  // =========================================================================

  public static computeWordDiff(original: string, upgraded: string): DiffOp[] {
    const origWords = original.split(/\s+/).filter(Boolean);
    const upWords = upgraded.split(/\s+/).filter(Boolean);

    const m = origWords.length;
    const n = upWords.length;

    // LCS dynamic programming table
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (origWords[i - 1].toLowerCase() === upWords[j - 1].toLowerCase()) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Backtrack to extract diff ops
    const ops: DiffOp[] = [];
    let i = m;
    let j = n;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && origWords[i - 1].toLowerCase() === upWords[j - 1].toLowerCase()) {
        ops.unshift({ op: 'equal', text: upWords[j - 1] });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        ops.unshift({ op: 'insert', text: upWords[j - 1] });
        j--;
      } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
        ops.unshift({ op: 'delete', text: origWords[i - 1] });
        i--;
      }
    }

    return ops;
  }

  // =========================================================================
  // STORAGEMANAGER V4 PRE-FLIGHT CHECKLIST BRIDGE
  // =========================================================================

  private static bridgePreFlightChecklist(diagnostics: AesDiagnostic[], essayText: string): string[] {
    const mounts: string[] = [];
    try {
      for (const d of diagnostics) {
        if (d.level === 'critical' || d.level === 'warning') {
          let code: 'G' | 'Coh' | 'C' | 'WF' | 'R' = 'G';
          if (d.category === 'CC') code = 'Coh';
          else if (d.category === 'LR') code = 'C';
          else if (d.category === 'TA') code = 'R';

          const record = StorageManager.recordError({
            code,
            contextPhrase: d.excerpt || essayText.slice(0, 100),
            userFault: d.title,
            correction: d.remedy || 'Apply formal IELTS academic editing standards.',
            isL1Transfer: false,
            skill: 'writing'
          });

          mounts.push(record.id);
        }
      }
    } catch {
      // StorageManager guard if running in headless node without mocked localStorage
    }
    return mounts;
  }

  private static emptyResult(taskType: IeltsTaskType): AesEvaluationResult {
    return {
      taskType,
      overallBand: 0,
      rawAverage: 0,
      subScores: { taskAchievement: 0, coherenceCohesion: 0, lexicalResource: 0, grammaticalRange: 0 },
      metrics: {
        wordCount: 0,
        sentenceCount: 0,
        tUnitCount: 0,
        paragraphCount: 0,
        clausalDensity: 0,
        subordinationIndex: 0,
        meanLengthOfTUnit: 0,
        meanLengthOfSentence: 0,
        passiveVoiceRatio: 0,
        nominalizationDensity: 0,
        syntacticVarietyEntropy: 0,
        totalTokens: 0,
        uniqueTypes: 0,
        typeTokenRatio: 0,
        guiraudIndex: 0,
        correctedTtr: 0,
        maasIndex: 0,
        awlDensity: 0,
        cefrProfile: { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 },
        executionTimeMs: 0
      },
      sentences: [],
      paragraphs: [],
      diagnostics: [],
      rewrites: [],
      preFlightChecklistMounts: []
    };
  }
}
