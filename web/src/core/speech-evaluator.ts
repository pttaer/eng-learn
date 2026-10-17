/**
 * SpeechEvaluator: Offline Speech Recognition Evaluator & Accuracy Scorer.
 * Uses Web Speech API transcripts vs target scripts to compute:
 * - Word Error Rate (WER = (S + D + I) / N) via Wagner-Fischer token alignment
 * - Normalized Levenshtein similarity percentage (0 - 100%)
 * - Precise per-word classification: correct, omitted, mispronounced (near-miss), substituted
 * - Highlighted HTML output with semantic CSS status classes
 * - Optional interactive real-time evaluation via continuous SpeechRecognition
 *
 * Zero external dependencies.
 */

export type WordEvaluationStatus = 'correct' | 'omitted' | 'mispronounced' | 'substituted';

export interface EvaluatedWord {
  word: string;               // Normalized word token
  originalWord: string;       // Word token preserving punctuation/casing
  status: WordEvaluationStatus;
  spokenAlternative?: string; // What was spoken instead (for substituted / mispronounced)
  similarity?: number;        // Token Levenshtein similarity percentage (0..100)
  levenshteinDistance?: number;
}

export interface InsertedWord {
  word: string;
  position: number;
}

export interface SpeechEvaluationResult {
  targetText: string;
  spokenText: string;
  wer: number;                 // Word Error Rate as decimal (e.g. 0.15 for 15%)
  werPct: number;              // Word Error Rate percentage (0 to 100+)
  accuracyPct: number;         // Accuracy score percentage (0 to 100)
  similarityPct: number;       // Character-level Levenshtein similarity (0 to 100)
  substitutions: number;       // S
  deletions: number;           // D (omitted words)
  insertions: number;          // I (extra words)
  correctCount: number;        // C
  totalTargetWords: number;    // N
  totalSpokenWords: number;    // M
  words: EvaluatedWord[];      // Full word-by-word annotated target tokens
  omittedWords: EvaluatedWord[];
  mispronouncedWords: EvaluatedWord[];
  substitutedWords: EvaluatedWord[];
  insertedWords: InsertedWord[];
  formattedHtml: string;       // Formatted HTML snippet with semantic highlights
}

export class SpeechEvaluator {
  private recognition: any = null;
  private isListening: boolean = false;
  private targetScript: string = '';
  private currentTranscript: string = '';
  private onUpdateCb?: (result: SpeechEvaluationResult) => void;
  private latestResult: SpeechEvaluationResult | null = null;

  constructor() {}

  // =========================================================================
  // OFFLINE STATIC EVALUATION ENGINE
  // =========================================================================

  /**
   * Evaluates a spoken transcript against a target script.
   * Fully offline and synchronous; works in both browser and headless Node.js environments.
   */
  public static evaluate(targetScript: string, spokenTranscript: string): SpeechEvaluationResult {
    const rawTargetWords = this.tokenizePreserving(targetScript);
    const targetTokens = rawTargetWords.map(w => this.normalizeToken(w));
    const spokenTokens = this.tokenizeAndClean(spokenTranscript);

    const N = targetTokens.length;
    const M = spokenTokens.length;

    // Boundary case: Empty target script
    if (N === 0) {
      const wer = M === 0 ? 0 : 1.0;
      const werPct = wer * 100;
      return {
        targetText: targetScript,
        spokenText: spokenTranscript,
        wer,
        werPct,
        accuracyPct: M === 0 ? 100 : 0,
        similarityPct: M === 0 ? 100 : 0,
        substitutions: 0,
        deletions: 0,
        insertions: M,
        correctCount: 0,
        totalTargetWords: 0,
        totalSpokenWords: M,
        words: [],
        omittedWords: [],
        mispronouncedWords: [],
        substitutedWords: [],
        insertedWords: spokenTokens.map((w, i) => ({ word: w, position: i })),
        formattedHtml: '<div class="speech-eval-block"></div>'
      };
    }

    // Boundary case: Empty spoken transcript
    if (M === 0) {
      const omittedWords: EvaluatedWord[] = targetTokens.map((w, idx) => ({
        word: w,
        originalWord: rawTargetWords[idx],
        status: 'omitted' as WordEvaluationStatus,
        similarity: 0,
        levenshteinDistance: w.length
      }));

      const html = this.buildFormattedHtml(omittedWords);
      return {
        targetText: targetScript,
        spokenText: spokenTranscript,
        wer: 1.0,
        werPct: 100,
        accuracyPct: 0,
        similarityPct: 0,
        substitutions: 0,
        deletions: N,
        insertions: 0,
        correctCount: 0,
        totalTargetWords: N,
        totalSpokenWords: 0,
        words: omittedWords,
        omittedWords,
        mispronouncedWords: [],
        substitutedWords: [],
        insertedWords: [],
        formattedHtml: html
      };
    }

    // Wagner-Fischer Dynamic Programming alignment for Word Error Rate (WER)
    // dp[i][j] stores the minimum edit operations (S + D + I)
    const dp: number[][] = Array.from({ length: N + 1 }, () => new Array(M + 1).fill(0));

    for (let i = 0; i <= N; i++) dp[i][0] = i; // Deletions
    for (let j = 0; j <= M; j++) dp[0][j] = j; // Insertions

    for (let i = 1; i <= N; i++) {
      for (let j = 1; j <= M; j++) {
        if (targetTokens[i - 1] === spokenTokens[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1]; // Match
        } else {
          const deletionCost = dp[i - 1][j] + 1;
          const insertionCost = dp[i][j - 1] + 1;
          const substitutionCost = dp[i - 1][j - 1] + 1;
          dp[i][j] = Math.min(deletionCost, insertionCost, substitutionCost);
        }
      }
    }

    // Backtrack to extract optimal alignment
    let i = N;
    let j = M;
    const alignedTarget: EvaluatedWord[] = [];
    const insertedWords: InsertedWord[] = [];
    let substitutions = 0;
    let deletions = 0;
    let insertions = 0;
    let correctCount = 0;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && targetTokens[i - 1] === spokenTokens[j - 1]) {
        // Match
        alignedTarget.unshift({
          word: targetTokens[i - 1],
          originalWord: rawTargetWords[i - 1],
          status: 'correct',
          spokenAlternative: spokenTokens[j - 1],
          similarity: 100,
          levenshteinDistance: 0
        });
        correctCount++;
        i--;
        j--;
      } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
        // Substitution / Mispronunciation
        substitutions++;
        const tTok = targetTokens[i - 1];
        const sTok = spokenTokens[j - 1];
        const dist = this.levenshtein(tTok, sTok);
        const maxLen = Math.max(tTok.length, sTok.length);
        const sim = maxLen > 0 ? Math.round((1 - dist / maxLen) * 100) : 0;

        // Phonetic / orthographic near-miss threshold:
        // If Levenshtein distance <= 2 or similarity >= 60%, classify as mispronounced
        const isMispronounced = dist <= 2 || sim >= 60;
        const status: WordEvaluationStatus = isMispronounced ? 'mispronounced' : 'substituted';

        alignedTarget.unshift({
          word: tTok,
          originalWord: rawTargetWords[i - 1],
          status,
          spokenAlternative: sTok,
          similarity: sim,
          levenshteinDistance: dist
        });
        i--;
        j--;
      } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
        // Deletion (Omitted reference word)
        deletions++;
        const tTok = targetTokens[i - 1];
        alignedTarget.unshift({
          word: tTok,
          originalWord: rawTargetWords[i - 1],
          status: 'omitted',
          similarity: 0,
          levenshteinDistance: tTok.length
        });
        i--;
      } else {
        // Insertion (Extra word in transcript)
        insertions++;
        insertedWords.unshift({
          word: spokenTokens[j - 1],
          position: j - 1
        });
        j--;
      }
    }

    const wer = Math.round(((substitutions + deletions + insertions) / N) * 1000) / 1000;
    const werPct = Math.round(wer * 1000) / 10;
    const accuracyPct = Math.max(0, Math.min(100, Math.round(((correctCount) / N) * 1000) / 10));

    const similarityPct = this.calculateLevenshteinSimilarity(targetScript, spokenTranscript);

    const omittedWords = alignedTarget.filter(w => w.status === 'omitted');
    const mispronouncedWords = alignedTarget.filter(w => w.status === 'mispronounced');
    const substitutedWords = alignedTarget.filter(w => w.status === 'substituted');

    const formattedHtml = this.buildFormattedHtml(alignedTarget);

    return {
      targetText: targetScript,
      spokenText: spokenTranscript,
      wer,
      werPct,
      accuracyPct,
      similarityPct,
      substitutions,
      deletions,
      insertions,
      correctCount,
      totalTargetWords: N,
      totalSpokenWords: M,
      words: alignedTarget,
      omittedWords,
      mispronouncedWords,
      substitutedWords,
      insertedWords,
      formattedHtml
    };
  }

  /**
   * Computes standalone Word Error Rate (WER) and raw edit operation counts.
   */
  public static calculateWER(targetScript: string, spokenTranscript: string): {
    wer: number;
    werPct: number;
    substitutions: number;
    deletions: number;
    insertions: number;
    totalWords: number;
  } {
    const res = this.evaluate(targetScript, spokenTranscript);
    return {
      wer: res.wer,
      werPct: res.werPct,
      substitutions: res.substitutions,
      deletions: res.deletions,
      insertions: res.insertions,
      totalWords: res.totalTargetWords
    };
  }

  /**
   * Computes normalized character-level Levenshtein similarity percentage (0 to 100%).
   */
  public static calculateLevenshteinSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().replace(/\s+/g, ' ').trim();
    const s2 = str2.toLowerCase().replace(/\s+/g, ' ').trim();

    if (s1 === s2) return 100;
    if (s1.length === 0 && s2.length === 0) return 100;
    if (s1.length === 0 || s2.length === 0) return 0;

    const dist = this.levenshtein(s1, s2);
    const maxLen = Math.max(s1.length, s2.length);
    const sim = Math.max(0, Math.min(100, (1 - dist / maxLen) * 100));
    return Math.round(sim * 10) / 10;
  }

  /**
   * Highlights words from target script against spoken transcript.
   */
  public static highlightWords(targetScript: string, spokenTranscript: string): EvaluatedWord[] {
    return this.evaluate(targetScript, spokenTranscript).words;
  }

  // =========================================================================
  // LIVE WEB SPEECH API RECOGNITION EVALUATOR
  // =========================================================================

  /**
   * Checks whether the Web Speech recognition API is available in current environment.
   */
  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    return !!Recognition;
  }

  /**
   * Starts live speech evaluation of a learner against a target script.
   */
  public startLiveEvaluation(
    targetScript: string,
    onUpdate?: (result: SpeechEvaluationResult) => void,
    lang: string = 'en-US'
  ): void {
    this.targetScript = targetScript;
    this.currentTranscript = '';
    this.onUpdateCb = onUpdate;
    this.isListening = true;

    if (!this.isSupported()) {
      console.warn('[SPEECH-EVAL] SpeechRecognition not available; static evaluate() should be used.');
      return;
    }

    try {
      const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new Recognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = lang;

      this.recognition.onresult = (event: any) => {
        let fullTranscript = '';
        for (let i = 0; i < event.results.length; ++i) {
          fullTranscript += event.results[i][0].transcript + ' ';
        }
        this.currentTranscript = fullTranscript.trim();
        this.latestResult = SpeechEvaluator.evaluate(this.targetScript, this.currentTranscript);
        if (this.onUpdateCb && this.latestResult) {
          this.onUpdateCb(this.latestResult);
        }
      };

      this.recognition.onerror = (e: any) => {
        console.warn('[SPEECH-EVAL] Recognition error:', e?.error || e);
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          try {
            this.recognition?.start();
          } catch {}
        }
      };

      this.recognition.start();
    } catch (err) {
      console.warn('[SPEECH-EVAL] Failed to start SpeechRecognition:', err);
    }
  }

  /**
   * Stops live evaluation and returns the final SpeechEvaluationResult.
   */
  public stopLiveEvaluation(): SpeechEvaluationResult | null {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      this.recognition = null;
    }

    if (this.targetScript) {
      this.latestResult = SpeechEvaluator.evaluate(this.targetScript, this.currentTranscript);
    }
    return this.latestResult;
  }

  /**
   * Returns latest evaluation result.
   */
  public getLatestResult(): SpeechEvaluationResult | null {
    return this.latestResult;
  }

  // =========================================================================
  // HELPER UTILITIES
  // =========================================================================

  private static tokenizePreserving(text: string): string[] {
    return text.trim().split(/\s+/).filter(Boolean);
  }

  private static normalizeToken(word: string): string {
    return word.toLowerCase().replace(/^[^a-z0-9']+|[^a-z0-9']+$/g, '');
  }

  private static tokenizeAndClean(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9'\s-]/g, ' ')
      .split(/\s+/)
      .map(w => w.replace(/^[^a-z0-9']+|[^a-z0-9']+$/g, ''))
      .filter(Boolean);
  }

  public static levenshtein(a: string, b: string): number {
    const al = a.length;
    const bl = b.length;
    if (al === 0) return bl;
    if (bl === 0) return al;

    const matrix: number[][] = Array.from({ length: al + 1 }, () => new Array(bl + 1).fill(0));
    for (let i = 0; i <= al; i++) matrix[i][0] = i;
    for (let j = 0; j <= bl; j++) matrix[0][j] = j;

    for (let i = 1; i <= al; i++) {
      for (let j = 1; j <= bl; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    return matrix[al][bl];
  }

  public static buildFormattedHtml(words: EvaluatedWord[]): string {
    const items = words.map(w => {
      const escaped = w.originalWord
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      let cls = 'speech-word ';
      let titleAttr = '';

      switch (w.status) {
        case 'correct':
          cls += 'is-correct';
          titleAttr = 'Accurately pronounced';
          break;
        case 'omitted':
          cls += 'is-omitted';
          titleAttr = 'Word omitted in speech';
          break;
        case 'mispronounced':
          cls += 'is-mispronounced';
          titleAttr = `Mispronounced (heard: "${w.spokenAlternative || ''}", sim: ${w.similarity ?? 0}%)`;
          break;
        case 'substituted':
          cls += 'is-substituted';
          titleAttr = `Substituted with "${w.spokenAlternative || ''}"`;
          break;
      }

      return `<span class="${cls}" data-status="${w.status}" title="${titleAttr}">${escaped}</span>`;
    });

    return `<div class="speech-eval-block">${items.join(' ')}</div>`;
  }
}
