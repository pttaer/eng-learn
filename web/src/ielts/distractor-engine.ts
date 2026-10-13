/**
 * IELTS Listening & Reading Distractor Engine
 * Heuristics calibrated to Cambridge Official Material & Keino Campbell Band 7+ Course.
 */

export interface DistractorTraps {
  qualifiers: string[];
  reversals: string[];
  selfCorrections: string[];
  mapDirections?: string[];
  riskLevel: 'low' | 'medium' | 'high';
}


export interface ExactWordValidation {
  valid: boolean;
  reason?: string;
}

const QUALIFIER_PATTERNS = [
  /\balways\b/i,
  /\bnever\b/i,
  /\bonly\b/i,
  /\ball\b/i,
  /\bsolely\b/i,
  /\bentirely\b/i,
  /\bcompletely\b/i,
  /\bexclusively\b/i,
  /\bmust\b/i,
  /\bevery\b/i,
  /\bnone\b/i,
  /\bimpossible\b/i,
  /\binevitable\b/i,
  /\bmost\b/i,
  /\bmostly\b/i,
  /\bpredominantly\b/i,
  /\bat all times\b/i,
  /\bwithout exception\b/i,
];

const REVERSAL_PATTERNS = [
  /\bhowever\b/i,
  /\bbut\b/i,
  /\bon the contrary\b/i,
  /\binstead\b/i,
  /\balthough\b/i,
  /\byet\b/i,
  /\bexcept\b/i,
  /\bin fact\b/i,
  /\bthough\b/i,
  /\bdespite\b/i,
  /\bon the other hand\b/i,
  /\bconversely\b/i,
  /\brather than\b/i,
  /\bwhereas\b/i,
];

const SELF_CORRECTION_PATTERNS = [
  /\bno,?\s+wait\b/i,
  /\bactually\b/i,
  /\bi mean\b/i,
  /\brather\b/i,
  /\bsorry\b/i,
  /\bwait a minute\b/i,
  /\bor rather\b/i,
  /\blet me correct that\b/i,
  /\blet me check\b/i,
  /\bhold on\b/i,
];

const MAP_DIRECTION_PATTERNS = [
  /\bturn left\b/i,
  /\bturn right\b/i,
  /\bpast the\b/i,
  /\broundabout\b/i,
  /\bopposite\b/i,
  /\bbear right\b/i,
  /\bbear left\b/i,
  /\bstraight ahead\b/i,
  /\bcontinue straight\b/i,
  /\bignore the\b/i,
  /\bpedestrian crossing\b/i,
  /\bfootpath\b/i,
  /\bintersection\b/i,
  /\bnext to\b/i,
  /\bbeside the\b/i,
];


const RECOGNIZED_SUFFIXES = new Set([
  's', 'es', 'ies', 'ed', 'd', 'ied', 'ing', 'ly',
  'tion', 'ation', 'ition', 'sion', 'ment', 'ness',
  'ity', 'ance', 'ence', 'able', 'ible', 'ful', 'less',
  'al', 'ic', 'ist', 'er', 'est'
]);

function cleanWord(w: string): string {
  return w.toLowerCase().replace(/^[^\w]+|[^\w]+$/g, '');
}

function detectAddedSuffix(userWord: string, targetWord: string): string | null {
  if (userWord === targetWord) return null;
  if (userWord.length <= targetWord.length) return null;

  // 1. Direct suffix appended: targetWord + suffix (e.g. book -> books, quick -> quickly)
  if (userWord.startsWith(targetWord)) {
    const suffix = userWord.slice(targetWord.length);
    if (RECOGNIZED_SUFFIXES.has(suffix)) return suffix;
  }

  // 2. Base ends with 'e' (dropped before vowel suffix): e.g. preserve -> preserving, create -> creation
  if (targetWord.endsWith('e') && targetWord.length > 2) {
    const stem = targetWord.slice(0, -1);
    if (userWord.startsWith(stem)) {
      const suffix = userWord.slice(stem.length);
      if (RECOGNIZED_SUFFIXES.has(suffix) || RECOGNIZED_SUFFIXES.has('e' + suffix)) return suffix;
    }
  }

  // 3. Base ends with 'y' -> 'i' + suffix: e.g. library -> libraries, apply -> applied
  if (targetWord.endsWith('y') && targetWord.length > 2) {
    const stem = targetWord.slice(0, -1) + 'i';
    if (userWord.startsWith(stem)) {
      const suffix = userWord.slice(stem.length);
      if (RECOGNIZED_SUFFIXES.has(suffix) || suffix === 'es' || suffix === 'ed') return suffix;
    }
  }

  // 4. Doubled final consonant: e.g. stop -> stopped, stopping; run -> running
  const lastChar = targetWord.slice(-1);
  if (targetWord.length > 2 && userWord.startsWith(targetWord + lastChar)) {
    const suffix = userWord.slice(targetWord.length + 1);
    if (RECOGNIZED_SUFFIXES.has(suffix)) return suffix;
  }

  return null;
}

function extractMatches(text: string, patterns: RegExp[]): string[] {
  const matches: string[] = [];
  for (const regex of patterns) {
    const flags = regex.flags.includes('g') ? regex.flags : regex.flags + 'g';
    const globalRegex = new RegExp(regex.source, flags);
    let m: RegExpExecArray | null;
    while ((m = globalRegex.exec(text)) !== null) {
      matches.push(m[0].toLowerCase());
    }
  }
  return [...new Set(matches)];
}

export class DistractorEngine {
  /**
   * Scans text or transcript for common IELTS listening/reading distractors:
   * - Qualifiers: restrictive or absolute terms that alter the condition
   * - Reversals: transition markers indicating an opposite fact
   * - Self-corrections: spoken cues where the speaker amends a previous utterance
   */
  static detectTraps(text: string): DistractorTraps {
    if (!text || !text.trim()) {
      return {
        qualifiers: [],
        reversals: [],
        selfCorrections: [],
        riskLevel: 'low',
      };
    }

    const qualifiers = extractMatches(text, QUALIFIER_PATTERNS);
    const reversals = extractMatches(text, REVERSAL_PATTERNS);
    const selfCorrections = extractMatches(text, SELF_CORRECTION_PATTERNS);
    const mapDirections = extractMatches(text, MAP_DIRECTION_PATTERNS);

    const count = qualifiers.length + reversals.length + selfCorrections.length + mapDirections.length;
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    if (count >= 3 || (selfCorrections.length >= 1 && (reversals.length >= 1 || qualifiers.length >= 1))) {
      riskLevel = 'high';
    } else if (count >= 1) {
      riskLevel = 'medium';
    }

    return {
      qualifiers,
      reversals,
      selfCorrections,
      mapDirections,
      riskLevel,
    };

  }

  /**
   * Validates user answers against target passage word(s):
   * - Checks word count against maxWords
   * - Verifies exact word match from passage
   * - Enforces zero added suffixes (morphological inflections like -s, -ed, -ing, -ly, -tion, etc.)
   */
  static validateExactWord(userInput: string, passageTarget: string, maxWords: number): ExactWordValidation {
    if (!userInput || !userInput.trim()) {
      return { valid: false, reason: 'Empty answer provided' };
    }

    const rawInputWords = userInput.trim().split(/\s+/).filter(Boolean);
    if (rawInputWords.length > maxWords) {
      return {
        valid: false,
        reason: `Exceeds maximum word count of ${maxWords} (received ${rawInputWords.length} words)`,
      };
    }

    const inputWords = rawInputWords.map(cleanWord).filter(Boolean);
    if (inputWords.length === 0) {
      return { valid: false, reason: 'Empty answer provided' };
    }

    const targetWords = passageTarget.split(/\s+/).map(cleanWord).filter(Boolean);
    if (targetWords.length === 0) {
      return { valid: false, reason: 'Passage target is empty' };
    }

    const cleanedInput = inputWords.join(' ');
    const cleanedTarget = targetWords.join(' ');

    // Exact whole-string equality
    if (cleanedInput === cleanedTarget) {
      return { valid: true };
    }

    // Subsequence check (user answer is exact sequence in passage target)
    const isSubsequence = (): boolean => {
      if (inputWords.length > targetWords.length) return false;
      for (let i = 0; i <= targetWords.length - inputWords.length; i++) {
        let match = true;
        for (let j = 0; j < inputWords.length; j++) {
          if (targetWords[i + j] !== inputWords[j]) {
            match = false;
            break;
          }
        }
        if (match) return true;
      }
      return false;
    };

    if (isSubsequence()) {
      return { valid: true };
    }

    // Check for morphological inflections (added suffixes)
    for (const uWord of inputWords) {
      for (const tWord of targetWords) {
        const suffix = detectAddedSuffix(uWord, tWord);
        if (suffix) {
          return {
            valid: false,
            reason: `Invalid morphological inflection: do not add suffixes to the exact word heard in the recording ("${uWord}" contains added suffix "-${suffix}" for base "${tWord}").`,
          };
        }
      }
    }

    // Check if user provided root when passage had inflected form
    for (const uWord of inputWords) {
      for (const tWord of targetWords) {
        if (detectAddedSuffix(tWord, uWord)) {
          return {
            valid: false,
            reason: `Word form mismatch: exact form required from passage ("${uWord}" vs "${tWord}").`,
          };
        }
      }
    }

    return {
      valid: false,
      reason: 'Answer does not match the exact word from the passage.',
    };
  }
}
