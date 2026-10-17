// web/src/ielts/diagnostic-engine.ts

export type DiagnosticCategory = 'grammar' | 'vocabulary';

export type DiagnosticSubType =
  | 'subject_verb'
  | 'tenses'
  | 'articles'
  | 'clauses'
  | 'prepositions'
  | 'collocations'
  | string;

export interface DiagnosticQuestion {
  id: string;
  category: DiagnosticCategory;
  subType: DiagnosticSubType;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  impactOnBand: string;
}

export interface FlawAnalysis {
  subType: string;
  impactOnBand: string;
  recommendation: string;
}

export interface SubTypeSummary {
  total: number;
  correct: number;
  percentage: number;
}

export interface DiagnosticReport {
  timestamp: number;
  totalQuestions: number;
  score: number;
  percentage: number;
  bandEstimate: string; // e.g. "Band 6.0" | "Band 6.5" | "Band 7.0+" | "Band 7.5+"
  subTypeBreakdown: Record<string, SubTypeSummary>;
  flawsDetected: FlawAnalysis[];
  checklistItems: string[];
}

const SUBTYPE_RECOMMENDATIONS: Record<string, { recommendation: string; checklistItem: string; defaultImpact: string }> = {
  subject_verb: {
    recommendation: 'Enforce subject-verb agreement checks on complex and inverted noun phrases before submission.',
    checklistItem: 'Verify subject-verb agreement on post-modified nouns (e.g. head noun vs adjunct plural).',
    defaultImpact: 'Prevents Band 7.0 GRA due to systematic subject-verb agreement slips.'
  },
  tenses: {
    recommendation: 'Lock in tense markers: reserve past simple for completed historical actions and present perfect for open timeframes.',
    checklistItem: 'Audit tense consistency against chronological time markers (e.g. "over the past decade has increased").',
    defaultImpact: 'Caps GRA at Band 6.0 if past simple is incorrectly substituted for continuous historical trends.'
  },
  articles: {
    recommendation: 'Audit zero-article usage with plural/uncountable general abstracts and definite article with unique referents.',
    checklistItem: 'Verify article necessity on abstract nouns (check for zero article on uncountables).',
    defaultImpact: 'Systematic article omission or erroneous insertion prevents Band 7.0 GRA.'
  },
  clauses: {
    recommendation: 'Avoid comma splices and dangling modifiers; punctuate subordinate and relative clauses appropriately.',
    checklistItem: 'Ensure dependent clauses attach to an independent clause without comma splices.',
    defaultImpact: 'Limits GRA to Band 6.0 due to run-ons, comma splices, or dangling participial modifiers.'
  },
  prepositions: {
    recommendation: 'Drill dependent prepositions following verbs, adjectives, and nouns to eliminate calques.',
    checklistItem: 'Check dependent prepositions for lexical compliance (e.g. "invest in", "barrier to").',
    defaultImpact: 'Inaccurate prepositional collocations cap Lexical Resource at Band 6.0.'
  },
  collocations: {
    recommendation: 'Use high-frequency academic collocations; avoid literal native-language word-for-word calques.',
    checklistItem: 'Verify academic collocations against AWL collocations ledger before submission.',
    defaultImpact: 'Imprecise collocations prevent Band 7.0+ Lexical Resource rating.'
  }
};

export class DiagnosticEngine {
  public static readonly STORAGE_KEY = 'ieltsDiagnosticProfile';
  public static readonly LEGACY_KEY = 'IELTS_DIAGNOSTIC_PROFILE';

  /**
   * Evaluate a set of user answers against diagnostic questions.
   */
  public static evaluateDiagnostic(
    answers: Record<string, number>,
    questions: DiagnosticQuestion[]
  ): DiagnosticReport {
    const totalQuestions = questions.length;
    let score = 0;
    const subTypeBreakdown: Record<string, SubTypeSummary> = {};
    const flawsMap: Map<string, { impactOnBand: string; recommendation: string }> = new Map();
    const checklistSet: Set<string> = new Set();

    // Initialize subtype breakdown counters
    for (const q of questions) {
      if (!subTypeBreakdown[q.subType]) {
        subTypeBreakdown[q.subType] = { total: 0, correct: 0, percentage: 0 };
      }
      subTypeBreakdown[q.subType].total++;
    }

    // Evaluate answers
    for (const q of questions) {
      const userAnswer = answers[q.id];
      const isCorrect = userAnswer !== undefined && userAnswer === q.correctIndex;
      if (isCorrect) {
        score++;
        subTypeBreakdown[q.subType].correct++;
      } else {
        // Collect flaw
        const config = SUBTYPE_RECOMMENDATIONS[q.subType];
        const impact = q.impactOnBand || config?.defaultImpact || 'Impairs grammatical accuracy score';
        const recommendation = config?.recommendation || `Review and practice ${q.subType} rules.`;
        if (!flawsMap.has(q.subType)) {
          flawsMap.set(q.subType, { impactOnBand: impact, recommendation });
        }
        if (config?.checklistItem) {
          checklistSet.add(config.checklistItem);
        } else {
          checklistSet.add(`Review accuracy for ${q.subType}`);
        }
      }
    }

    // Compute percentages
    for (const key of Object.keys(subTypeBreakdown)) {
      const item = subTypeBreakdown[key];
      item.percentage = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
    }

    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    let bandEstimate: string;
    if (percentage >= 90) {
      bandEstimate = 'Band 7.5+';
    } else if (percentage >= 80) {
      bandEstimate = 'Band 7.0';
    } else if (percentage >= 65) {
      bandEstimate = 'Band 6.5';
    } else if (percentage >= 50) {
      bandEstimate = 'Band 6.0';
    } else {
      bandEstimate = 'Band 5.5';
    }

    const flawsDetected: FlawAnalysis[] = Array.from(flawsMap.entries()).map(([subType, data]) => ({
      subType,
      impactOnBand: data.impactOnBand,
      recommendation: data.recommendation
    }));

    return {
      timestamp: Date.now(),
      totalQuestions,
      score,
      percentage,
      bandEstimate,
      subTypeBreakdown,
      flawsDetected,
      checklistItems: Array.from(checklistSet)
    };
  }

  /**
   * Save diagnostic report to local persistence.
   */
  public static saveDiagnosticProfile(report: DiagnosticReport): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const serialized = JSON.stringify(report);
      localStorage.setItem(DiagnosticEngine.STORAGE_KEY, serialized);
      localStorage.setItem(DiagnosticEngine.LEGACY_KEY, serialized);
    } catch {
      // Storage unavailable or quota exceeded
    }
  }

  /**
   * Retrieve saved diagnostic report from local persistence.
   */
  public static getDiagnosticProfile(): DiagnosticReport | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(DiagnosticEngine.STORAGE_KEY) || localStorage.getItem(DiagnosticEngine.LEGACY_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as DiagnosticReport;
    } catch {
      return null;
    }
  }
}
