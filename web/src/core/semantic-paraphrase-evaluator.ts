/**
 * SemanticParaphraseEvaluator: Offline Semantic Evaluation & Paraphrase Flexibility Engine.
 * Evaluates candidate reconstructions against reference models using:
 * - Semantic Proposition & Concept Recall (keyword stemming & extraction)
 * - Academic Synonym & Lexical Equivalence Matching (offline dictionary)
 * - Syntactic Variation & Transformation Recognition (active/passive, clause inversion, nominalization)
 * - Academic Collocations and Transitional Cohesion scoring
 *
 * 100% offline, zero API dependencies.
 */

export interface DetectedSynonymPair {
  original: string;
  used: string;
}

export interface ParaphraseEvaluationResult {
  originalSentence: string;
  candidateSentence: string;
  semanticSimilarityPct: number;       // 0 - 100%
  conceptCoveragePct: number;          // 0 - 100% of core propositions
  syntacticSophisticationScore: number;// 0 - 100
  collocationBonus: number;            // 0 - 20
  overallScore: number;                // 0 - 100
  isAcceptableParaphrase: boolean;     // >= 70% overall score
  detectedSynonyms: DetectedSynonymPair[];
  detectedSyntacticShifts: string[];
  matchedKeyConcepts: string[];
  missingKeyConcepts: string[];
  actionableFeedback: string[];
}

// High-utility academic synonym sets for offline evaluation
const SYNONYM_CLUSTERS: string[][] = [
  ['show', 'demonstrate', 'illustrate', 'depict', 'indicate', 'reveal', 'present', 'display', 'exhibit', 'prove', 'exemplify', 'clarify'],
  ['increase', 'rise', 'grow', 'escalate', 'surge', 'soar', 'climb', 'expand', 'augment', 'go up'],
  ['decrease', 'reduce', 'decline', 'drop', 'fall', 'diminish', 'dwindle', 'plummet', 'shrink', 'go down', 'cut', 'curb', 'curtail', 'lower', 'lessen'],
  ['cause', 'trigger', 'precipitate', 'induce', 'bring about', 'lead to', 'generate', 'prompt'],
  ['improve', 'enhance', 'boost', 'upgrade', 'ameliorate', 'elevate', 'refine', 'advance'],
  ['worsen', 'deteriorate', 'aggravate', 'exacerbate', 'decline', 'degenerate'],
  ['implement', 'execute', 'adopt', 'enact', 'apply', 'carry out', 'deploy', 'institute'],
  ['solve', 'resolve', 'address', 'tackle', 'remedy', 'settle', 'rectify'],
  ['prevent', 'avert', 'hinder', 'impede', 'inhibit', 'forestall', 'preclude', 'curb'],
  ['require', 'necessitate', 'demand', 'call for', 'entail', 'mandate'],
  ['emphasize', 'highlight', 'underscore', 'accentuate', 'stress'],
  ['examine', 'scrutinize', 'investigate', 'analyze', 'probe', 'inspect', 'explore'],
  ['achieve', 'attain', 'accomplish', 'realize', 'fulfil', 'reach'],
  ['discover', 'uncover', 'find', 'identify', 'reveal', 'detect', 'locate'],
  ['revolutionize', 'transform', 'reshape', 'overhaul', 'reform', 'modernize'],
  ['develop', 'create', 'generate', 'produce', 'devise', 'establish', 'advance'],
  ['significant', 'substantial', 'considerable', 'marked', 'notable', 'pronounced', 'meaningful', 'sizable', 'large', 'weighty', 'important'],
  ['crucial', 'vital', 'essential', 'critical', 'indispensable', 'paramount', 'pivotal', 'key', 'important', 'prominent'],
  ['ubiquitous', 'omnipresent', 'pervasive', 'widespread', 'universal', 'prevalent', 'extensive', 'broad'],
  ['beneficial', 'advantageous', 'favorable', 'constructive', 'lucrative', 'rewarding'],
  ['harmful', 'detrimental', 'damaging', 'deleterious', 'injurious', 'adverse'],
  ['obvious', 'apparent', 'evident', 'manifest', 'conspicuous', 'clear'],
  ['difficult', 'challenging', 'arduous', 'demanding', 'formidable', 'laborious'],
  ['rapid', 'swift', 'expeditious', 'accelerated', 'speedy', 'prompt'],
  ['different', 'distinct', 'divergent', 'disparate', 'diverse', 'contrasting'],
  ['fundamental', 'essential', 'basic', 'foundational', 'underlying', 'radical', 'profound'],
  ['benefit', 'advantage', 'merit', 'asset', 'upside', 'perk', 'dividend', 'virtue', 'edge'],
  ['drawback', 'disadvantage', 'shortcoming', 'downside', 'limitation', 'defect'],
  ['problem', 'issue', 'dilemma', 'challenge', 'obstacle', 'predicament', 'complication'],
  ['impact', 'influence', 'effect', 'repercussion', 'consequence', 'ramification', 'bearing'],
  ['trend', 'tendency', 'pattern', 'trajectory', 'inclination', 'drift'],
  ['method', 'approach', 'strategy', 'technique', 'procedure', 'methodology'],
  ['reason', 'rationale', 'justification', 'motive', 'factor', 'cause'],
  ['result', 'outcome', 'consequence', 'upshot', 'effect', 'finding'],
  ['change', 'transformation', 'shift', 'alteration', 'modification', 'evolution']
];

const ACADEMIC_SYNONYMS: Record<string, string[]> = {};
for (const group of SYNONYM_CLUSTERS) {
  for (const word of group) {
    const others = group.filter(w => w !== word);
    ACADEMIC_SYNONYMS[word] = ACADEMIC_SYNONYMS[word]
      ? Array.from(new Set([...ACADEMIC_SYNONYMS[word], ...others]))
      : others;
  }
}

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'nor', 'at', 'by', 'for', 'from', 'in', 'into',
  'of', 'on', 'to', 'with', 'about', 'as', 'is', 'am', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'that', 'this', 'these', 'those',
  'it', 'its', 'they', 'them', 'their', 'he', 'she', 'him', 'her', 'we', 'us', 'our'
]);

const ADVANCED_TRANSITIONS = [
  'furthermore', 'moreover', 'nevertheless', 'nonetheless', 'consequently',
  'subsequently', 'conversely', 'notwithstanding', 'inasmuch as', 'whereas',
  'whereby', 'in contrast', 'on the contrary', 'as a corollary', 'predominantly'
];

export class SemanticParaphraseEvaluator {
  /**
   * Normalizes text by removing smart quotes, excess whitespace, and low-yield punctuation.
   */
  public static normalize(text: string): string {
    return text
      .replace(/[’‘]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Tokenizes text into word tokens without punctuation.
   */
  public static tokenize(text: string): string[] {
    const norm = this.normalize(text).toLowerCase();
    const matches = norm.match(/\b[a-z0-9'-]+\b/g);
    return matches || [];
  }

  /**
   * Extracts essential semantic concept keywords (excluding stopwords).
   */
  public static extractConcepts(text: string): string[] {
    const valid = this.tokenize(text)
      .map(t => t.replace(/^['-]+|['-]+$/g, ''))
      .filter(c => c.length > 2 && !STOP_WORDS.has(c));
    return Array.from(new Set(valid));
  }

  /**
   * Stemming heuristic to match plural/tense/derivational variants.
   */
  public static getStem(word: string): string {
    if (word.length <= 3) return word;
    let s = word
      .replace(/ing$/, '')
      .replace(/ed$/, '')
      .replace(/es$/, '')
      .replace(/ly$/, '')
      .replace(/ment$/, '')
      .replace(/tion$/, '')
      .replace(/able$/, '');
    if (s.length > 3 && s.endsWith('s') && !s.endsWith('ss')) {
      s = s.slice(0, -1);
    }
    return s.replace(/e$/, '');
  }

  /**
   * Checks if two words share the same stem or known synonym cluster.
   */
  public static isEquivalentWord(w1: string, w2: string): boolean {
    if (w1 === w2) return true;
    const stem1 = this.getStem(w1);
    const stem2 = this.getStem(w2);
    if (stem1.length >= 3 && stem2.length >= 3) {
      if (stem1 === stem2) return true;
      // Allow prefix-root matching (e.g. demonstrate vs demonstration)
      if (
        Math.abs(stem1.length - stem2.length) <= 2 &&
        (stem1.startsWith(stem2) || stem2.startsWith(stem1)) &&
        Math.min(stem1.length, stem2.length) >= 4
      ) {
        return true;
      }
    }

    // Direct synonym check
    const syns1 = ACADEMIC_SYNONYMS[w1] || ACADEMIC_SYNONYMS[stem1] || [];
    if (syns1.includes(w2) || syns1.some(s => this.getStem(s) === stem2)) return true;

    const syns2 = ACADEMIC_SYNONYMS[w2] || ACADEMIC_SYNONYMS[stem2] || [];
    if (syns2.includes(w1) || syns2.some(s => this.getStem(s) === stem1)) return true;

    return false;
  }

  /**
   * Detects syntactic variations such as passive/active inversion or subordinate clause shifts.
   */
  private static detectSyntacticVariations(original: string, candidate: string): string[] {
    const shifts: string[] = [];
    const origLower = original.toLowerCase();
    const candLower = candidate.toLowerCase();

    // Check passive to active or active to passive
    const passiveRegex = /\b(is|are|was|were|been|being|be)\s+([a-z]+ed|[a-z]+en|made|built|done|taken|given|seen|held|discovered)\b/i;
    const origPassive = passiveRegex.test(origLower);
    const candPassive = passiveRegex.test(candLower);

    if (origPassive && !candPassive) {
      shifts.push('Passive to Active Voice Conversion');
    } else if (!origPassive && candPassive) {
      shifts.push('Active to Passive Voice Inversion');
    }

    // Check clause inversion (e.g. "Although X, Y" vs "Y, although X")
    const subordRegex = /\b(although|even though|while|whereas|because|since|despite|in spite of)\b/i;
    if (subordRegex.test(origLower) && subordRegex.test(candLower)) {
      const origStartsSubord = /^(although|even though|while|whereas|because|since|despite|in spite of)\b/i.test(origLower);
      const candStartsSubord = /^(although|even though|while|whereas|because|since|despite|in spite of)\b/i.test(candLower);
      if (origStartsSubord !== candStartsSubord) {
        shifts.push('Subordinate Clausal Fronting / Inversion');
      }
    }

    // Check nominalization
    const nominalRegex = /\b([a-z]+tion|[a-z]+ment|[a-z]+ance|[a-z]+ence|[a-z]+ity)\b/i;
    const candNominals = candLower.match(nominalRegex);
    const origNominals = origLower.match(nominalRegex);
    if (candNominals && (!origNominals || candNominals.length > origNominals.length)) {
      shifts.push('Academic Nominalization Variation');
    }

    return shifts;
  }

  /**
   * Main evaluation entry point: evaluates candidate sentence against reference master sentence.
   */
  public static evaluate(originalSentence: string, candidateSentence: string): ParaphraseEvaluationResult {
    const normOrig = this.normalize(originalSentence);
    const normCand = this.normalize(candidateSentence);

    if (!normCand) {
      return {
        originalSentence: normOrig,
        candidateSentence: '',
        semanticSimilarityPct: 0,
        conceptCoveragePct: 0,
        syntacticSophisticationScore: 0,
        collocationBonus: 0,
        overallScore: 0,
        isAcceptableParaphrase: false,
        detectedSynonyms: [],
        detectedSyntacticShifts: [],
        matchedKeyConcepts: [],
        missingKeyConcepts: this.extractConcepts(normOrig),
        actionableFeedback: ['Please provide a sentence reconstruction.']
      };
    }

    const origConcepts = this.extractConcepts(normOrig);
    const candConcepts = this.extractConcepts(normCand);
    const candTokens = this.tokenize(normCand);

    const matchedKeyConcepts: string[] = [];
    const missingKeyConcepts: string[] = [];
    const detectedSynonyms: DetectedSynonymPair[] = [];

    // Evaluate concept coverage and synonym substitutions
    for (const concept of origConcepts) {
      let matched = false;

      // Exact or stem match in candidate
      for (const candConcept of candConcepts) {
        if (candConcept === concept || this.getStem(candConcept) === this.getStem(concept)) {
          matched = true;
          matchedKeyConcepts.push(concept);
          break;
        }
      }

      // Check academic synonym equivalence
      if (!matched) {
        for (const candToken of candTokens) {
          if (this.isEquivalentWord(concept, candToken)) {
            matched = true;
            matchedKeyConcepts.push(`${concept} (via "${candToken}")`);
            detectedSynonyms.push({ original: concept, used: candToken });
            break;
          }
        }
      }

      if (!matched) {
        missingKeyConcepts.push(concept);
      }
    }

    const conceptCoveragePct = origConcepts.length === 0 ? 100 :
      Math.round((matchedKeyConcepts.length / origConcepts.length) * 100);

    // Syntactic shifts
    const detectedSyntacticShifts = this.detectSyntacticVariations(normOrig, normCand);

    // Transitional / Collocation bonus
    let collocationBonus = 0;
    const lowerCand = normCand.toLowerCase();
    for (const transition of ADVANCED_TRANSITIONS) {
      if (lowerCand.includes(transition)) {
        collocationBonus += 5;
      }
    }
    collocationBonus = Math.min(20, collocationBonus);

    // Syntactic sophistication
    let syntacticScore = 60; // baseline
    if (detectedSyntacticShifts.length > 0) {
      syntacticScore += detectedSyntacticShifts.length * 15;
    }
    if (normCand.split(/\s+/).length >= 10) {
      syntacticScore += 10;
    }
    syntacticScore = Math.min(100, syntacticScore);

    // Semantic similarity calculation (blended concept recall + word overlap)
    const semanticSimilarityPct = Math.round(
      (conceptCoveragePct * 0.75) +
      (Math.min(100, (candConcepts.length / Math.max(1, origConcepts.length)) * 100) * 0.25)
    );

    // Overall holistic paraphrase score
    let overallScore: number;
    if (normCand.toLowerCase() === normOrig.toLowerCase()) {
      overallScore = 100;
    } else {
      overallScore = Math.min(
        100,
        Math.round((semanticSimilarityPct * 0.65) + (syntacticScore * 0.25) + collocationBonus)
      );
    }

    const isAcceptableParaphrase = conceptCoveragePct >= 70 && overallScore >= 68;

    // Generate actionable feedback
    const actionableFeedback: string[] = [];

    if (isAcceptableParaphrase) {
      actionableFeedback.push('✓ Excellent paraphrase: Core propositions accurately retained with legitimate structural variation.');
    } else if (conceptCoveragePct < 60) {
      actionableFeedback.push(`⚠️ Missing key semantic ideas: ${missingKeyConcepts.slice(0, 3).join(', ')}.`);
    }

    if (detectedSynonyms.length > 0) {
      actionableFeedback.push(
        `✓ Academic Lexical Variety: Detected synonyms ${detectedSynonyms.map(s => `"${s.used}" for "${s.original}"`).join(', ')}.`
      );
    }

    if (detectedSyntacticShifts.length > 0) {
      actionableFeedback.push(`✓ Sophisticated Syntactic Shift: ${detectedSyntacticShifts.join('; ')}.`);
    }

    if (collocationBonus > 0) {
      actionableFeedback.push(`✓ Discourse Linker Bonus: +${collocationBonus}pts for cohesive transitions.`);
    }

    return {
      originalSentence: normOrig,
      candidateSentence: normCand,
      semanticSimilarityPct,
      conceptCoveragePct,
      syntacticSophisticationScore: syntacticScore,
      collocationBonus,
      overallScore,
      isAcceptableParaphrase,
      detectedSynonyms,
      detectedSyntacticShifts,
      matchedKeyConcepts,
      missingKeyConcepts,
      actionableFeedback
    };
  }
}
