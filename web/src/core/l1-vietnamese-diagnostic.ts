/**
 * L1VietnameseDiagnosticEngine: Specialized Vietnamese EFL Interlanguage Error Taxonomy & Remediation Engine.
 *
 * Diagnoses and remediates the 8 core systematic L1 transfer phenomena from Vietnamese:
 * 1. FINAL_CONSONANT_DELETION: Omission of 3rd person singular -s/-es, past -ed, plural -s
 * 2. ARTICLE_CLASSIFIER_CONFUSION: Misuse/omission of a/an/the
 * 3. ASPECT_VS_TENSE_CONFLATION: Present Perfect vs Simple Past (đã / rồi confusion)
 * 4. PREPOSITION_CALQUE: Direct translation ("discuss about", "marry with", "listen music")
 * 5. ZERO_COPULA_ADJECTIVE: Omission of "to be" before adjectives ("She very beautiful")
 * 6. TOPIC_COMMENT_DUAL_CONJUNCTIONS: "Although... but...", "Because... so..."
 * 7. THERE_HAVE_EXISTENTIAL: "In my city have many parks" (from "có")
 * 8. PLURAL_MASS_COUNT: "informations", "advices", "equipments"
 *
 * 100% offline, zero external dependencies.
 */

import { StorageManager } from '../utils/storage';

export type L1FaultType =
  | 'FINAL_CONSONANT_DELETION'
  | 'ARTICLE_CLASSIFIER_CONFUSION'
  | 'ASPECT_VS_TENSE_CONFLATION'
  | 'PREPOSITION_CALQUE'
  | 'ZERO_COPULA_ADJECTIVE'
  | 'TOPIC_COMMENT_DUAL_CONJUNCTIONS'
  | 'THERE_HAVE_EXISTENTIAL'
  | 'PLURAL_MASS_COUNT';

export interface L1PatternDefinition {
  type: L1FaultType;
  title: string;
  vietnameseRootCause: string;
  linguisticExplanation: string;
  commonExamples: Array<{ bad: string; good: string }>;
  diagnosticRegex?: RegExp;
}

export interface DetectedL1Fault {
  type: L1FaultType;
  matchedText: string;
  explanation: string;
  correctionSuggestion: string;
  vietnameseContrast: string;
}

export interface RemediationDrill {
  id: string;
  type: L1FaultType;
  title: string;
  prompt: string;
  faultySentence: string;
  expectedCorrection: string;
  vietnameseExplanation: string;
  contrastiveAnalysis: string;
}

export const L1_TAXONOMY: Record<L1FaultType, L1PatternDefinition> = {
  FINAL_CONSONANT_DELETION: {
    type: 'FINAL_CONSONANT_DELETION',
    title: 'Omission of Suffixes (-s / -es / -ed)',
    vietnameseRootCause: 'Tiếng Việt là ngôn ngữ đơn lập, không biến hình và các âm cuối chỉ đóng bằng phụ âm đơn (/p, t, k, m, n, ŋ/), không có phụ âm xát hoặc chùm phụ âm cuối như /-s, -z, -ts, -st, -vd/.',
    linguisticExplanation: 'Vietnamese is an isolating language without inflectional morphology. Learners systematically drop 3rd person singular -s, past tense -ed, and plural -s endings.',
    commonExamples: [
      { bad: 'She play tennis every day.', good: 'She plays tennis every day.' },
      { bad: 'He watch TV yesterday.', good: 'He watched TV yesterday.' },
      { bad: 'I have two brother.', good: 'I have two brothers.' }
    ],
    diagnosticRegex: /\b(he|she|it)\s+(like|play|work|want|need|go|watch|look|live|make|think|feel|take|see|know|come|say|get|give)\b/i
  },

  ARTICLE_CLASSIFIER_CONFUSION: {
    type: 'ARTICLE_CLASSIFIER_CONFUSION',
    title: 'Article System (a / an / the vs Ø)',
    vietnameseRootCause: 'Tiếng Việt dùng lượng từ / loại từ (cái, con, chiếc) thay vì hệ thống mạo từ xác định / bất định.',
    linguisticExplanation: 'Vietnamese lacks articles, leading learners to omit articles before singular count nouns or overgeneralize "the" before generic plurals or uncountables.',
    commonExamples: [
      { bad: 'I went to cinema yesterday.', good: 'I went to the cinema yesterday.' },
      { bad: 'The life is very difficult.', good: 'Life is very difficult.' },
      { bad: 'He is teacher.', good: 'He is a teacher.' }
    ],
    diagnosticRegex: /\b(is|become|became)\s+(teacher|doctor|engineer|student|driver|lawyer)\b/i
  },

  ASPECT_VS_TENSE_CONFLATION: {
    type: 'ASPECT_VS_TENSE_CONFLATION',
    title: 'Present Perfect vs Past Simple (Đã / Rồi)',
    vietnameseRootCause: 'Tiếng Việt chỉ dùng phó từ chỉ thể (đã, vừa mới, rồi) cho mọi hành động xảy ra trước hiện tại mà không biến đổi động từ theo thì.',
    linguisticExplanation: 'Vietnamese aspect marker "đã" is applied indiscriminately to both definite finished past and open experiential present perfect.',
    commonExamples: [
      { bad: 'I have seen him two hours ago.', good: 'I saw him two hours ago.' },
      { bad: 'Yesterday I have visited my parents.', good: 'Yesterday I visited my parents.' },
      { bad: 'I already saw this movie.', good: 'I have already seen this movie.' }
    ],
    diagnosticRegex: /\b(have|has)\s+([a-z]+ed|[a-z]+en|seen|done|gone|visited)\s+.*?\b(yesterday|ago|last\s+(year|month|week)|in\s+19\d\d|in\s+20[012]\d)\b/i
  },

  PREPOSITION_CALQUE: {
    type: 'PREPOSITION_CALQUE',
    title: 'Preposition Calque (Dịch thô giới từ)',
    vietnameseRootCause: 'Dịch nguyên văn từ giới từ tiếng Việt sang tiếng Anh (thảo luận về -> discuss about; cưới với -> marry with).',
    linguisticExplanation: 'Direct word-for-word calquing of Vietnamese prepositions with English verbs that are transitive or take different prepositions.',
    commonExamples: [
      { bad: 'We will discuss about this problem.', good: 'We will discuss this problem.' },
      { bad: 'He married with a doctor.', good: 'He married a doctor. / He is married to a doctor.' },
      { bad: 'I like to listen music.', good: 'I like to listen to music.' }
    ],
    diagnosticRegex: /\b(discuss\s+about|marry\s+with|listen\s+(the|music|songs)|mention\s+about|explain\s+about|complain\s+with)\b/i
  },

  ZERO_COPULA_ADJECTIVE: {
    type: 'ZERO_COPULA_ADJECTIVE',
    title: 'Zero Copula with Adjectives (Thiếu "to be")',
    vietnameseRootCause: 'Trong tiếng Việt, tính từ có thể đóng vai trò là vị ngữ trực tiếp ("Cô ấy rất đẹp", "Chợ đông đúc") mà không cần trợ động từ "thì/là".',
    linguisticExplanation: 'Vietnamese adjectives act directly as verbal predicates, causing learners to omit the copula "to be".',
    commonExamples: [
      { bad: 'She very beautiful.', good: 'She is very beautiful.' },
      { bad: 'The food very delicious.', good: 'The food is very delicious.' },
      { bad: 'They not ready.', good: 'They are not ready.' }
    ],
    diagnosticRegex: /\b(she|he|it|they|we|this|that)\s+(very|so|quite|really|too)\s+(beautiful|good|nice|happy|expensive|busy|important|difficult|tired)\b/i
  },

  TOPIC_COMMENT_DUAL_CONJUNCTIONS: {
    type: 'TOPIC_COMMENT_DUAL_CONJUNCTIONS',
    title: 'Dual Conjunctions (Mặc dù... nhưng / Vì... nên)',
    vietnameseRootCause: 'Cấu trúc cặp liên từ hô ứng trong tiếng Việt ("Mặc dù... nhưng...", "Vì... cho nên...").',
    linguisticExplanation: 'Vietnamese routinely pairs subordinate and coordinate conjunctions together; English only allows one conjunction per clause relationship.',
    commonExamples: [
      { bad: 'Although it rained, but we went out.', good: 'Although it rained, we went out.' },
      { bad: 'Because he was ill, so he stayed home.', good: 'Because he was ill, he stayed home.' }
    ],
    diagnosticRegex: /\b(although|even though|though)\b.*?\b(but|however)\b|\b(because|since|as)\b.*?\b(so|therefore)\b/i
  },

  THERE_HAVE_EXISTENTIAL: {
    type: 'THERE_HAVE_EXISTENTIAL',
    title: '"There is/are" vs "Have" (Có tồn tại)',
    vietnameseRootCause: 'Tiếng Việt dùng từ "có" cho cả hai nghĩa: sở hữu ("Tôi có tiền") và tồn tại ("Có nhiều người ở công viên").',
    linguisticExplanation: 'Using "have" for existential propositions instead of the dummy pronoun "there is/are".',
    commonExamples: [
      { bad: 'In my city have many bridges.', good: 'In my city, there are many bridges.' },
      { bad: 'On the table has a book.', good: 'On the table, there is a book.' }
    ],
    diagnosticRegex: /\b(in|on|at|under)\s+[a-z\s]+(have|has)\s+(many|a lot of|several|much|[0-9]+)\b/i
  },

  PLURAL_MASS_COUNT: {
    type: 'PLURAL_MASS_COUNT',
    title: 'Uncountable Mass Nouns as Plurals',
    vietnameseRootCause: 'Tiếng Việt không có phân biệt hình thái số nhiều -s/-es giữa danh từ đếm được và không đếm được.',
    linguisticExplanation: 'Adding plural -s to uncountable collective or mass nouns.',
    commonExamples: [
      { bad: 'He gave me many useful advices.', good: 'He gave me much useful advice / many pieces of advice.' },
      { bad: 'All the informations are correct.', good: 'All the information is correct.' },
      { bad: 'New modern equipments.', good: 'New modern equipment.' }
    ],
    diagnosticRegex: /\b(informations|advices|equipments|furnitures|homeworks|feedbacks|evidences)\b/i
  }
};

const REMEDIATION_BANK: RemediationDrill[] = [
  {
    id: 'rem-final-s-1',
    type: 'FINAL_CONSONANT_DELETION',
    title: '3rd Person Singular Verb Inflection',
    prompt: 'Fix the subject-verb agreement for the 3rd person singular subject:',
    faultySentence: 'Every morning, my sister cook breakfast for the entire family.',
    expectedCorrection: 'Every morning, my sister cooks breakfast for the entire family.',
    vietnameseExplanation: 'Chủ ngữ "my sister" là ngôi thứ 3 số ít (she), động từ bắt buộc phải thêm "-s": cook -> cooks.',
    contrastiveAnalysis: 'Tiếng Việt không chia động từ, nhưng tiếng Anh bắt buộc phải có âm gió /-s/ hoặc /-z/ ở ngôi thứ ba số ít.'
  },
  {
    id: 'rem-article-1',
    type: 'ARTICLE_CLASSIFIER_CONFUSION',
    title: 'Indefinite Article Before Singular Count Nouns',
    prompt: 'Add the missing indefinite article before the profession noun:',
    faultySentence: 'After graduating from university, her brother became software engineer.',
    expectedCorrection: 'After graduating from university, her brother became a software engineer.',
    vietnameseExplanation: 'Trước danh từ đếm được số ít chỉ nghề nghiệp (software engineer, teacher...), bắt buộc phải dùng mạo từ "a/an": became a software engineer.',
    contrastiveAnalysis: 'Tiếng Việt nói "trở thành kỹ sư" không cần mạo từ, nhưng tiếng Anh bắt buộc phải có mạo từ "a/an" trước danh từ đếm được số ít.'
  },
  {
    id: 'rem-tense-conflation-1',
    type: 'ASPECT_VS_TENSE_CONFLATION',
    title: 'Past Simple with Definite Past Time Markers',
    prompt: 'Correct the tense error with the definite past time adverbial:',
    faultySentence: 'The clinical team has completed the patient trials two weeks ago.',
    expectedCorrection: 'The clinical team completed the patient trials two weeks ago.',
    vietnameseExplanation: 'Khi có mốc thời gian xác định trong quá khứ ("two weeks ago"), bắt buộc dùng thì Quá khứ đơn (completed), không dùng Hiện tại hoàn thành (has completed).',
    contrastiveAnalysis: 'Tiếng Việt dùng từ "đã" cho cả hai trường hợp ("đã hoàn thành hai tuần trước"), nhưng tiếng Anh phân biệt rạch ròi: thời điểm quá khứ xác định phải dùng Past Simple.'
  },
  {
    id: 'rem-prep-calque-1',
    type: 'PREPOSITION_CALQUE',
    title: 'Transitive Verbs without Preposition',
    prompt: 'Correct the preposition error in the board meeting sentence:',
    faultySentence: 'The committee met yesterday to discuss about the budget deficit.',
    expectedCorrection: 'The committee met yesterday to discuss the budget deficit.',
    vietnameseExplanation: 'Động từ "discuss" là ngoại động từ trực tiếp (transitive verb), đi thẳng với tân ngữ, KHÔNG thêm "about".',
    contrastiveAnalysis: 'Tiếng Việt nói "thảo luận VỀ một vấn đề", nhưng tiếng Anh là "discuss something", không có "about".'
  },
  {
    id: 'rem-zero-copula-1',
    type: 'ZERO_COPULA_ADJECTIVE',
    title: 'Copula "to be" with Predicative Adjectives',
    prompt: 'Insert the required auxiliary verb before the predicative adjective:',
    faultySentence: 'The scientific evidence very compelling to the international researchers.',
    expectedCorrection: 'The scientific evidence is very compelling to the international researchers.',
    vietnameseExplanation: 'Tính từ "compelling" cần động từ to be "is" đứng trước làm vị ngữ.',
    contrastiveAnalysis: 'Trong tiếng Việt, tính từ tự làm vị ngữ ("Chứng cứ rất thuyết phục"), nhưng tiếng Anh bắt buộc phải có "to be".'
  },
  {
    id: 'rem-dual-conj-1',
    type: 'TOPIC_COMMENT_DUAL_CONJUNCTIONS',
    title: 'Single Subordinate Conjunction Rule',
    prompt: 'Remove the redundant coordinating conjunction:',
    faultySentence: 'Although the weather was extremely harsh, but the climbers reached the summit.',
    expectedCorrection: 'Although the weather was extremely harsh, the climbers reached the summit.',
    vietnameseExplanation: 'Đã có "Although" ở mệnh đề phụ thì mệnh đề chính KHÔNG được có "but".',
    contrastiveAnalysis: 'Tiếng Việt có thói quen dùng "Mặc dù... nhưng...", nhưng tiếng Anh chỉ được giữ một liên từ duy nhất.'
  },
  {
    id: 'rem-existential-1',
    type: 'THERE_HAVE_EXISTENTIAL',
    title: 'Existential "There are" instead of "Have"',
    prompt: 'Correct the existential clause error:',
    faultySentence: 'In the international research lab have six specialized electron microscopes.',
    expectedCorrection: 'In the international research lab, there are six specialized electron microscopes.',
    vietnameseExplanation: 'Để diễn tả "có cái gì ở đâu", tiếng Anh dùng "There is / There are", không dùng động từ sở hữu "have".',
    contrastiveAnalysis: 'Tiếng Việt dùng từ "có" cho cả sở hữu và tồn tại, nhưng tiếng Anh phân biệt rạch ròi giữa "have" và "there is/are".'
  },
  {
    id: 'rem-mass-count-1',
    type: 'PLURAL_MASS_COUNT',
    title: 'Uncountable Mass Nouns: "Information"',
    prompt: 'Correct the plural noun form of the uncountable noun:',
    faultySentence: 'The whistleblower provided critical informations regarding the offshore transactions.',
    expectedCorrection: 'The whistleblower provided critical information regarding the offshore transactions.',
    vietnameseExplanation: '"Information" là danh từ không đếm được (uncountable), không bao giờ có đuôi số nhiều "-s".',
    contrastiveAnalysis: 'Tiếng Việt đếm "nhiều thông tin", nhưng tiếng Anh coi "information" là khối lượng trừu tượng (mass noun).'
  }
];

export class L1VietnameseDiagnosticEngine {
  /**
   * Scans an input sentence and identifies any Vietnamese L1 interlanguage transfer patterns.
   */
  public static analyzeSentence(text: string): DetectedL1Fault[] {
    const detected: DetectedL1Fault[] = [];
    const clean = text.trim();

    for (const [key, pattern] of Object.entries(L1_TAXONOMY)) {
      const match = pattern.diagnosticRegex ? clean.match(pattern.diagnosticRegex) : null;
      if (match) {
        detected.push({
          type: key as L1FaultType,
          matchedText: match[0],
          explanation: pattern.linguisticExplanation,
          correctionSuggestion: pattern.commonExamples[0].good,
          vietnameseContrast: pattern.vietnameseRootCause
        });
      }
    }

    return detected;
  }

  /**
   * Automatically logs an L1 transfer fault to the persistent StorageManager errorLedger.
   */
  public static logL1Fault(
    faultType: L1FaultType,
    phrase: string,
    userFault: string,
    correction: string
  ): void {
    try {
      StorageManager.recordError({
        code: 'G',
        contextPhrase: phrase,
        userFault,
        correction,
        isL1Transfer: true,
        l1Pattern: faultType,
        skill: 'grammar'
      });
    } catch (err) {
      console.warn('[L1 DIAGNOSTIC] Could not persist to errorLedger:', err);
    }
  }

  /**
   * Returns learner L1 diagnostic profile and recurrence breakdown.
   */
  public static getL1Profile(): {
    totalL1Errors: number;
    breakdown: Record<L1FaultType, number>;
    topVulnerabilities: Array<{ type: L1FaultType; count: number; title: string }>;
  } {
    const records = StorageManager.getErrorRecords();
    const l1Records = records.filter((r: any) => r.isL1Transfer && r.l1Pattern);

    const breakdown = Object.fromEntries(
      Object.keys(L1_TAXONOMY).map(k => [k, 0])
    ) as Record<L1FaultType, number>;

    for (const rec of l1Records) {
      const pat = rec.l1Pattern as L1FaultType;
      if (breakdown[pat] !== undefined) {
        breakdown[pat] += rec.recurrenceCount || 1;
      }
    }

    const topVulnerabilities = Object.entries(breakdown)
      .map(([type, count]) => ({
        type: type as L1FaultType,
        count,
        title: L1_TAXONOMY[type as L1FaultType]?.title || type
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalL1Errors: l1Records.length,
      breakdown,
      topVulnerabilities
    };
  }

  /**
   * Generates targeted remediation drills for a specific L1 transfer category or the learner's weakest area.
   */
  public static getRemediationDrills(faultType?: L1FaultType): RemediationDrill[] {
    if (faultType) {
      return REMEDIATION_BANK.filter(d => d.type === faultType);
    }
    return [...REMEDIATION_BANK];
  }
}
