/**
 * EscapePathEngine: Deprogramming Vietnamese Exam Habits into Spontaneous Autonomous Acquisition.
 *
 * Implements 4-stage cognitive deprogramming:
 * 1. Contrastive L1 Spotting (Calque Radar) - identifies L1 negative transfer traps under time pressure
 * 2. Timed Chunk Jigsaw (Anti-Linear Assembly) - breaks word-by-word translation using multi-word lexical chunks
 * 3. Anti-Template De-Slop Studio - converts Band 5.5 cram-school templates into Band 8.5+ authentic English
 * 4. World Englishes & Connected Speech Demasking - ear-tuner across US, UK, AU, and Indian accents + ghost words
 *
 * 100% offline, zero external LLM dependencies.
 */

import { AccentCadenceType } from './audio-synthesizer';

export interface ContrastiveToken {
  text: string;
  isFault: boolean;
  faultExplanation?: string;
  replacement?: string;
}

export interface ContrastiveSpottingItem {
  id: string;
  title: string;
  cefr: 'B2' | 'C1' | 'C2';
  timeLimitSec: number;
  contextPrompt: string;
  tokens: ContrastiveToken[];
  contrastiveL1Rationale: string;
}

export interface ChunkJigsawItem {
  id: string;
  title: string;
  cefr: 'B2' | 'C1' | 'C2';
  timeLimitSec: number;
  communicativeGoal: string;
  correctOrder: string[];
  distractors: string[];
  grammaticalFrameNote: string;
  vietnameseContrast: string;
}

export interface AntiTemplateParaphraseItem {
  id: string;
  title: string;
  cefr: 'C1' | 'C2';
  bloatedSentence: string;
  detectedCliche: string;
  catalystKeyword: string;
  maxWordCount: number;
  exemplaryRewrite: string;
  forbiddenPhrases: string[];
  requiredConcepts: string[];
  vietnameseAnalysis: string;
}

export interface AccentComparisonItem {
  id: string;
  title: string;
  utterance: string;
  audioPrompt: string;
  divergenceFeatures: Array<{
    word: string;
    us: string;
    uk: string;
    au: string;
    in: string;
    featureNote: string;
  }>;
  cadences: Record<string, { label: string; accentId: AccentCadenceType; ipa: string; characteristics: string }>;
}

export interface GhostWordToken {
  index: number;
  word: string;
  citationIpa: string;
  connectedIpa: string;
  reductionType: 'weak_form' | 'elision' | 'catenation' | 'assimilation';
  explanation: string;
}

export interface GhostWordDemaskingItem {
  id: string;
  title: string;
  fullSentence: string;
  audioText: string;
  ghostTokens: GhostWordToken[];
  pedagogicalTip: string;
}

export const ESCAPE_SPOTTING_BANK: ContrastiveSpottingItem[] = [
  {
    id: 'spot-existential-01',
    title: 'Existential Trap: Locations Possessing Entities',
    cefr: 'B2',
    timeLimitSec: 8,
    contextPrompt: 'Identify the Vietnamese L1 calque token in this municipal development report:',
    tokens: [
      { text: 'In', isFault: false },
      { text: 'the', isFault: false },
      { text: 'central', isFault: false },
      { text: 'business', isFault: false },
      { text: 'district', isFault: false },
      {
        text: 'has',
        isFault: true,
        faultExplanation: 'Locations cannot possess entities. Vietnamese "có" must be translated as "there are", not "has".',
        replacement: 'there are'
      },
      { text: 'multiple', isFault: false },
      { text: 'pedestrian', isFault: false },
      { text: 'boulevards.', isFault: false }
    ],
    contrastiveL1Rationale: 'Tiếng Việt dùng "Ở khu trung tâm có nhiều phố đi bộ" (chủ ngữ nơi chốn + có). Tiếng Anh bắt buộc dùng dummy pronoun "There are", không dùng động từ sở hữu "has".'
  },
  {
    id: 'spot-dual-conj-02',
    title: 'Dual Conjunction Correlative Trap',
    cefr: 'B2',
    timeLimitSec: 8,
    contextPrompt: 'Spot the redundant connector in this academic summary:',
    tokens: [
      { text: 'Although', isFault: false },
      { text: 'the', isFault: false },
      { text: 'algorithm', isFault: false },
      { text: 'converged', isFault: false },
      { text: 'rapidly,', isFault: false },
      {
        text: 'but',
        isFault: true,
        faultExplanation: 'Subordinating "Although" already establishes the contrast. Coordinating "but" is strictly forbidden.',
        replacement: ''
      },
      { text: 'the', isFault: false },
      { text: 'precision', isFault: false },
      { text: 'decayed.', isFault: false }
    ],
    contrastiveL1Rationale: 'Cặp liên từ tương hỗ tiếng Việt "Mặc dù... nhưng..." bị cấm trong tiếng Anh. Chỉ dùng duy nhất một liên từ cho một mối quan hệ logic.'
  },
  {
    id: 'spot-polysemy-open-03',
    title: 'Polysemy Mismatch: Electrical Aperture',
    cefr: 'B2',
    timeLimitSec: 8,
    contextPrompt: 'Spot the mechanical translation of "mở":',
    tokens: [
      { text: 'Before', isFault: false },
      { text: 'the', isFault: false },
      { text: 'presentation,', isFault: false },
      { text: 'please', isFault: false },
      {
        text: 'open',
        isFault: true,
        faultExplanation: 'Physical containers or doors "open"; electrical circuits are "turned on" or "switched on".',
        replacement: 'turn on'
      },
      { text: 'the', isFault: false },
      { text: 'projector', isFault: false },
      { text: 'immediately.', isFault: false }
    ],
    contrastiveL1Rationale: 'Tiếng Việt dùng từ "mở" cho cả mở cửa và bật máy chiếu. Tiếng Anh phân biệt rõ "open" (cơ học) vs "turn on / power on" (điện tử).'
  },
  {
    id: 'spot-zero-copula-04',
    title: 'Zero Copula with Stative Adjectives',
    cefr: 'B2',
    timeLimitSec: 8,
    contextPrompt: 'Spot the missing predicate link:',
    tokens: [
      { text: 'The', isFault: false },
      { text: 'proposed', isFault: false },
      { text: 'fiscal', isFault: false },
      { text: 'amendment', isFault: false },
      {
        text: 'very',
        isFault: true,
        faultExplanation: 'Vietnamese adjectives act as verbal predicates ("rất khả thi"), but English adjectives require the copula "is".',
        replacement: 'is very'
      },
      { text: 'feasible', isFault: false },
      { text: 'under', isFault: false },
      { text: 'current', isFault: false },
      { text: 'market', isFault: false },
      { text: 'conditions.', isFault: false }
    ],
    contrastiveL1Rationale: 'Tiếng Việt cho phép tính từ trực tiếp làm vị ngữ ("Đề xuất rất khả thi"). Tiếng Anh bắt buộc phải có trợ động từ to-be: "The amendment IS very feasible".'
  },
  {
    id: 'spot-preposition-discuss-05',
    title: 'Transitive Verb Preposition Calque',
    cefr: 'B2',
    timeLimitSec: 8,
    contextPrompt: 'Spot the Vietnamese preposition calque ("về"):',
    tokens: [
      { text: 'The', isFault: false },
      { text: 'committee', isFault: false },
      { text: 'convened', isFault: false },
      { text: 'to', isFault: false },
      { text: 'discuss', isFault: false },
      {
        text: 'about',
        isFault: true,
        faultExplanation: '"Discuss" is a direct transitive verb taking an immediate object. Do not translate "về" as "about".',
        replacement: ''
      },
      { text: 'the', isFault: false },
      { text: 'revenue', isFault: false },
      { text: 'discrepancy.', isFault: false }
    ],
    contrastiveL1Rationale: 'Tiếng Việt nói "thảo luận VỀ vấn đề", nhưng tiếng Anh "discuss" là ngoại động từ trực tiếp, không bao giờ có "about".'
  },
  {
    id: 'spot-mass-noun-06',
    title: 'Pluralization of Mass Concept',
    cefr: 'B2',
    timeLimitSec: 8,
    contextPrompt: 'Spot the uncountable mass noun infraction:',
    tokens: [
      { text: 'The', isFault: false },
      { text: 'analyst', isFault: false },
      { text: 'retrieved', isFault: false },
      { text: 'vital', isFault: false },
      {
        text: 'informations',
        isFault: true,
        faultExplanation: '"Information" is strictly an uncountable mass noun in English; never add plural -s.',
        replacement: 'information'
      },
      { text: 'from', isFault: false },
      { text: 'the', isFault: false },
      { text: 'database.', isFault: false }
    ],
    contrastiveL1Rationale: 'Tiếng Việt đếm "nhiều thông tin", nhưng tiếng Anh coi "information" là khối lượng trừu tượng không đếm được, không có số nhiều -s.'
  }
];

export const ESCAPE_JIGSAW_BANK: ChunkJigsawItem[] = [
  {
    id: 'jigsaw-strain-01',
    title: 'Economic Pressure Formulation',
    cefr: 'B2',
    timeLimitSec: 14,
    communicativeGoal: 'Express that inflation severely harms vulnerable families without word-by-word translation:',
    correctOrder: [
      'Unchecked inflation',
      'places acute strain on',
      'low-income households',
      'across the region.'
    ],
    distractors: [
      'makes very difficult for',
      'in low-income has'
    ],
    grammaticalFrameNote: 'Collocation frame: [ Subject ] + [ places acute strain on ] + [ Noun Phrase ]',
    vietnameseContrast: 'Tránh dịch từng chữ "Lạm phát làm cho cuộc sống rất khó khăn", dùng cụm collocation chuẩn: "places acute strain on".'
  },
  {
    id: 'jigsaw-underpin-02',
    title: 'Foundational Infrastructure',
    cefr: 'C1',
    timeLimitSec: 14,
    communicativeGoal: 'State that clean energy supports modern industrial expansion (replacing "plays an indispensable role"):',
    correctOrder: [
      'Reliable renewable energy',
      'underpins sustainable growth',
      'in high-tech manufacturing',
      'sectors.'
    ],
    distractors: [
      'plays an indispensable role for',
      'because makes good'
    ],
    grammaticalFrameNote: 'Direct active verb: [ X underpins Y ] replaces the 5-word cram cliché "plays an indispensable role in".',
    vietnameseContrast: 'Động từ mạnh "underpins" thay thế hoàn toàn cho lối học vẹt "plays an indispensable role in".'
  },
  {
    id: 'jigsaw-concession-03',
    title: 'Academic Concession & Caveat',
    cefr: 'C1',
    timeLimitSec: 14,
    communicativeGoal: 'Concede that while the policy reduces emissions, it demands substantial initial capital:',
    correctOrder: [
      'While the policy curbs emissions,',
      'it entails substantial capital',
      'expenditure during initial',
      'deployment.'
    ],
    distractors: [
      'but it needs much money',
      'although has many cost'
    ],
    grammaticalFrameNote: 'Complex concession: [ While Clause ], [ Subject + entails + Object ] (no "but").',
    vietnameseContrast: 'Không dùng cặp "While... but...", và dùng "entails substantial capital expenditure" thay cho "needs much money".'
  },
  {
    id: 'jigsaw-existential-04',
    title: 'Demographic Shift Formulation',
    cefr: 'B2',
    timeLimitSec: 14,
    communicativeGoal: 'State that urban centers are experiencing an influx of skilled workers:',
    correctOrder: [
      'There is a marked influx',
      'of specialized software engineers',
      'into provincial tech hubs',
      'this quarter.'
    ],
    distractors: [
      'In provincial hubs have',
      'tech hubs are very have'
    ],
    grammaticalFrameNote: 'Existential nominalization: [ There is a marked influx of X into Y ]',
    vietnameseContrast: 'Xóa bỏ lối dịch "Ở các tỉnh có nhiều kỹ sư", thay bằng "There is a marked influx of...".'
  }
];

export const ESCAPE_PARAPHRASE_BANK: AntiTemplateParaphraseItem[] = [
  {
    id: 'deslop-role-01',
    title: 'De-Slop: "Plays an Indispensable Role"',
    cefr: 'C1',
    bloatedSentence: 'It is widely known that the internet plays an indispensable role in the daily lives of people in this day and age.',
    detectedCliche: 'plays an indispensable role in ... in this day and age',
    catalystKeyword: 'underpins',
    maxWordCount: 12,
    exemplaryRewrite: 'The internet underpins virtually every aspect of contemporary life.',
    forbiddenPhrases: ['plays an indispensable role', 'in this day and age', 'daily lives of people'],
    requiredConcepts: ['internet', 'underpins', 'life'],
    vietnameseAnalysis: 'Cắt bỏ 23 từ rườm rà xuống còn 9 từ sắc sảo. Thay thế cụm từ đệm rỗng bằng động từ nòng cốt "underpins".'
  },
  {
    id: 'deslop-coin-02',
    title: 'De-Slop: "Every Coin Has Two Sides"',
    cefr: 'C1',
    bloatedSentence: 'Taking all the aforementioned points into consideration, every coin has two sides when it comes to remote work.',
    detectedCliche: 'aforementioned points into consideration ... every coin has two sides',
    catalystKeyword: 'trade-offs',
    maxWordCount: 10,
    exemplaryRewrite: 'Ultimately, remote working models entail complex structural trade-offs.',
    forbiddenPhrases: ['every coin has two sides', 'taking all the aforementioned', 'when it comes to'],
    requiredConcepts: ['remote', 'trade-offs'],
    vietnameseAnalysis: 'Loại bỏ thành ngữ sáo rỗng thường thấy ở band 5.5, nâng cấp thành thuật ngữ kinh tế - xã hội chính xác "trade-offs".'
  },
  {
    id: 'deslop-debate-03',
    title: 'De-Slop: "Sparked a Heated Debate"',
    cefr: 'C1',
    bloatedSentence: 'In recent years, whether artificial intelligence will replace teachers has sparked a heated debate among scientists and society.',
    detectedCliche: 'has sparked a heated debate',
    catalystKeyword: 'contentious',
    maxWordCount: 11,
    exemplaryRewrite: 'The potential automation of educational instruction remains deeply contentious.',
    forbiddenPhrases: ['sparked a heated debate', 'whether', 'scientists and society'],
    requiredConcepts: ['automation', 'contentious'],
    vietnameseAnalysis: 'Chuyển hóa câu mở đầu khuôn mẫu thành câu tuyên bố học thuật khách quan, trang trọng.'
  },
  {
    id: 'deslop-horizon-04',
    title: 'De-Slop: "Broaden Horizons & Knowledge"',
    cefr: 'C1',
    bloatedSentence: 'Studying abroad helps international students widen their horizon and broaden their knowledge about foreign cultures.',
    detectedCliche: 'widen their horizon and broaden their knowledge',
    catalystKeyword: 'perspectives',
    maxWordCount: 10,
    exemplaryRewrite: 'Overseas education deepens cultural fluency and academic perspectives.',
    forbiddenPhrases: ['widen their horizon', 'broaden their knowledge'],
    requiredConcepts: ['education', 'perspectives'],
    vietnameseAnalysis: 'Xóa bỏ cặp thành ngữ sinh đôi rỗng tuếch, thay bằng danh từ thực chất: "cultural fluency and academic perspectives".'
  }
];

export const WORLD_ACCENTS_BANK: AccentComparisonItem[] = [
  {
    id: 'accent-tech-schedule-01',
    title: 'Global Tech Standup: Schedule & Data Migration',
    utterance: 'We need to schedule the quarterly data migration for next Tuesday.',
    audioPrompt: 'We need to schedule the quarterly data migration for next Tuesday.',
    divergenceFeatures: [
      {
        word: 'schedule',
        us: '/ˈskedʒuːl/',
        uk: '/ˈʃedjuːl/',
        au: '/ˈʃedjʉːl/',
        in: '/ˈskeɖʒuːl/',
        featureNote: 'UK/AU start with /ʃ/ (sh); US starts with /sk/. Indian uses retroflex [ɖ].'
      },
      {
        word: 'quarterly',
        us: '/ˈkwɔːrɾərli/',
        uk: '/ˈkwɔːtəli/',
        au: '/ˈkwoːtəli/',
        in: '/ˈkwaːrʈərli/',
        featureNote: 'US uses flap T [ɾ] and post-vocalic /r/; UK/AU are non-rhotic; Indian articulates retroflex [ʈ].'
      },
      {
        word: 'data',
        us: '/ˈdeɪɾə/',
        uk: '/ˈdeɪtə/',
        au: '/ˈdɑːtə/',
        in: '/ˈɖeːʈaː/',
        featureNote: 'US flaps T; AU uses broad BATH vowel [ˈdɑːtə]; Indian uses unreduced monophthongs [ɖeːʈaː].'
      },
      {
        word: 'Tuesday',
        us: '/ˈtuːzdeɪ/',
        uk: '/ˈtjuːzdeɪ/',
        au: '/ˈtʃʉːzdæɪ/',
        in: '/ˈʈjuːzɖeː/',
        featureNote: 'US drops yod (/tuː/); UK retains yod (/tjuː/); AU coalesces to affricate (/tʃʉː/); Indian applies retroflex.'
      }
    ],
    cadences: {
      us: {
        label: 'General American',
        accentId: 'general-american',
        ipa: '[wi niːd tə ˈskedʒuːl ðə ˈkwɔːrɾərli ˈdeɪɾə maɪˈɡreɪʃn̩ fər neks ˈtuːzdeɪ]',
        characteristics: 'Flap T [ɾ] on "quarterly" & "data", rhotic /r/, yod-dropping on "Tuesday".'
      },
      uk: {
        label: 'UK RP (British)',
        accentId: 'uk-rp',
        ipa: '[wiː niːd tə ˈʃedjuːl ðə ˈkwɔːtəli ˈdeɪtə maɪˈɡreɪʃn̩ fə neks ˈtjuːzdeɪ]',
        characteristics: 'Palato-alveolar [ʃ] in "schedule", crisp alveolar T, non-rhotic schwa in "for".'
      },
      au: {
        label: 'Australian',
        accentId: 'australian',
        ipa: '[wiː niːd tə ˈʃedjʉːl ðə ˈkwoːtəli ˈdɑːtə maɪˈɡræɪʃn̩ fə neks ˈtʃʉːzdæɪ]',
        characteristics: 'Broad BATH vowel in "data" [ˈdɑːtə], Australian diphthong shift in "Tuesday" [dæɪ].'
      },
      in: {
        label: 'Indian English',
        accentId: 'indian',
        ipa: '[ʋiː niːɖ ʈuː ˈskeɖʒuːl d̪ə ˈkwaːrʈərli ˈɖeːʈaː maɪˈɡreːʃən faːr nekst ˈʈjuːzɖeː]',
        characteristics: 'Retroflex stops [ʈ, ɖ], full unreduced vowels in "to" and "for", syllable-timed rhythm.'
      }
    }
  },
  {
    id: 'accent-academic-research-02',
    title: 'Academic Lecture: Empirical Observation',
    utterance: 'The laboratory director cannot verify whether the water sample is pure.',
    audioPrompt: 'The laboratory director cannot verify whether the water sample is pure.',
    divergenceFeatures: [
      {
        word: 'laboratory',
        us: '/ˈlæbrətɔːri/',
        uk: '/ləˈbɒrətri/',
        au: '/ləˈbɔrətri/',
        in: '/ləˈbɔːrəʈoːri/',
        featureNote: 'Stress shift: US stresses 1st syllable (LAB-ra-tory); UK stresses 2nd (la-BOR-a-try).'
      },
      {
        word: 'water',
        us: '/ˈwɑːɾər/',
        uk: '/ˈwɔːtə/',
        au: '/ˈwoːtə/',
        in: '/ˈʋaːʈər/',
        featureNote: 'US flaps T; UK/AU non-rhotic; Indian uses retroflex [ʈ] and labiodental [ʋ].'
      },
      {
        word: 'sample',
        us: '/ˈsæmpəl/',
        uk: '/ˈsɑːmpəl/',
        au: '/ˈsɑːmpəl/',
        in: '/ˈsaːmpəl/',
        featureNote: 'TRAP-BATH split: US uses short flat /æ/; UK/AU use broad back /ɑː/.'
      }
    ],
    cadences: {
      us: {
        label: 'General American',
        accentId: 'general-american',
        ipa: '[ðə ˈlæbrətɔːri dəˈrektər ˈkænɑːt ˈverɪfaɪ ˈweðər ðə ˈwɑːɾər ˈsæmpəl ɪz pjʊr]',
        characteristics: 'First-syllable stress on "laboratory", flat /æ/ in "sample", flap T in "water".'
      },
      uk: {
        label: 'UK RP (British)',
        accentId: 'uk-rp',
        ipa: '[ðə ləˈbɒrətri daɪˈrektə ˈkɑːnɒt ˈverɪfaɪ ˈweðə ðə ˈwɔːtə ˈsɑːmpəl ɪz pjʊə]',
        characteristics: 'Second-syllable stress on "laboratory", broad /ɑː/ in "sample" and "cannot".'
      },
      au: {
        label: 'Australian',
        accentId: 'australian',
        ipa: '[ðə ləˈbɔrətri dəˈrektə ˈkɑːnɔt ˈverəfɑɪ ˈweðə ðə ˈwoːtə ˈsɑːmpəl ɪz pjʉːə]',
        characteristics: 'Broad vowel in "sample", high-rising cadence on clause boundary.'
      },
      in: {
        label: 'Indian English',
        accentId: 'indian',
        ipa: '[d̪ə ləˈbɔːrəʈoːri ɖaɪˈrekʈər ˈkæn nɑːʈ ˈʋerɪfaːɪ ˈʋed̪ər d̪ə ˈʋaːʈər ˈsaːmpəl ɪz pjuːr]',
        characteristics: 'Distinct retroflex [ʈ, ɖ], clear syllable-timed articulation, no flap T.'
      }
    }
  }
];

export const GHOST_WORDS_BANK: GhostWordDemaskingItem[] = [
  {
    id: 'ghost-catenation-01',
    title: 'Catenation & Resyllabification (Liaison)',
    fullSentence: 'Could you hold on an hour until I pick it up?',
    audioText: 'Could you hold on an hour until I pick it up?',
    ghostTokens: [
      {
        index: 2,
        word: 'hold on',
        citationIpa: '/həʊld ɒn/',
        connectedIpa: '/həʊl.dɒn/',
        reductionType: 'catenation',
        explanation: 'Final consonant /d/ migrates to the vowel of "on", sounding like "hol-don".'
      },
      {
        index: 4,
        word: 'an hour',
        citationIpa: '/æn ˈaʊər/',
        connectedIpa: '/ə.naʊ.ə/',
        reductionType: 'catenation',
        explanation: 'Weak "an" /ən/ links /n/ into "hour", sounding like "a nour".'
      },
      {
        index: 8,
        word: 'pick it up',
        citationIpa: '/pɪk ɪt ʌp/',
        connectedIpa: '/pɪ.kɪ.tʌp/',
        reductionType: 'catenation',
        explanation: 'Triple consonant-to-vowel catenation creates a single acoustic wave: "pi-ki-tup".'
      }
    ],
    pedagogicalTip: 'Người Việt có thói quen phát âm từng từ rời rạc. Khi người bản xứ nói lướt, phụ âm cuối nối thẳng vào nguyên âm sau khiến não bộ tưởng nhầm là từ vựng lạ.'
  },
  {
    id: 'ghost-elision-02',
    title: 'Alveolar Elision in Consonant Clusters',
    fullSentence: 'The next door neighbor asked me for the last night reports.',
    audioText: 'The next door neighbor asked me for the last night reports.',
    ghostTokens: [
      {
        index: 1,
        word: 'next door',
        citationIpa: '/nekst dɔːr/',
        connectedIpa: '/neks dɔːr/',
        reductionType: 'elision',
        explanation: 'The /t/ in "next" is completely dropped before the consonant /d/ of "door".'
      },
      {
        index: 4,
        word: 'asked me',
        citationIpa: '/ɑːskt miː/',
        connectedIpa: '/ɑːsk miː/ or /ɑːst miː/',
        reductionType: 'elision',
        explanation: 'The past tense cluster /skt/ drops /t/ before /m/, causing learners to miss the past tense.'
      },
      {
        index: 7,
        word: 'last night',
        citationIpa: '/lɑːst naɪt/',
        connectedIpa: '/lɑːs naɪt/',
        reductionType: 'elision',
        explanation: 'The final /t/ disappears completely before /n/.'
      }
    ],
    pedagogicalTip: 'Khi âm /t/ hoặc /d/ đứng giữa hai phụ âm, người bản xứ gần như nuốt hoàn toàn. Đừng tìm kiếm âm bật /t/ khi nghe cụm "next door" hay "last night".'
  },
  {
    id: 'ghost-weakform-can-03',
    title: 'The "Can" vs "Can\'t" Stress Paradox',
    fullSentence: 'I can meet you on Friday, but I can\'t stay long.',
    audioText: 'I can meet you on Friday, but I can\'t stay long.',
    ghostTokens: [
      {
        index: 1,
        word: 'can',
        citationIpa: '/kæn/',
        connectedIpa: '/kən/',
        reductionType: 'weak_form',
        explanation: 'Affirmative "can" is unstressed and reduces to Schwa /kən/ (~40ms, low pitch).'
      },
      {
        index: 7,
        word: 'can\'t',
        citationIpa: '/kɑːnt/ or /kænt/',
        connectedIpa: '/kɑːn/ or /kæn/ (T elided)',
        reductionType: 'weak_form',
        explanation: 'Negative "can\'t" is stressed with full long vowel (~180ms, high pitch), even though /t/ is omitted!'
      }
    ],
    pedagogicalTip: 'Đừng đợi nghe âm đuôi /t/ để biết là phủ định. Người bản xứ phân biệt: "can" = ngắn, lướt, giảm âm schwa /kən/; "can\'t" = dài, nhấn mạnh, nguyên âm căng.'
  }
];

export class EscapePathEngine {
  private static readonly STORAGE_KEY = 'eng_escape_path_progress_v1';

  public static getProgress(): {
    spottingCompleted: string[];
    jigsawCompleted: string[];
    paraphraseCompleted: string[];
    ghostDemasked: string[];
    totalScore: number;
  } {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return {
      spottingCompleted: [],
      jigsawCompleted: [],
      paraphraseCompleted: [],
      ghostDemasked: [],
      totalScore: 0
    };
  }

  public static markCompleted(category: 'spotting' | 'jigsaw' | 'paraphrase' | 'ghost', id: string, points = 10): void {
    const p = this.getProgress();
    let changed = false;
    if (category === 'spotting' && !p.spottingCompleted.includes(id)) {
      p.spottingCompleted.push(id);
      changed = true;
    } else if (category === 'jigsaw' && !p.jigsawCompleted.includes(id)) {
      p.jigsawCompleted.push(id);
      changed = true;
    } else if (category === 'paraphrase' && !p.paraphraseCompleted.includes(id)) {
      p.paraphraseCompleted.push(id);
      changed = true;
    } else if (category === 'ghost' && !p.ghostDemasked.includes(id)) {
      p.ghostDemasked.push(id);
      changed = true;
    }
    if (changed) {
      p.totalScore += points;
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(p));
      } catch (err) {
        console.warn('[ESCAPE PATH] Storage error:', err);
      }
    }
  }

  public static evaluateParaphrase(
    userText: string,
    item: AntiTemplateParaphraseItem
  ): { passed: boolean; feedback: string; wordReductionPct: number } {
    const clean = userText.trim();
    if (!clean) {
      return { passed: false, feedback: 'Please write your revised sentence.', wordReductionPct: 0 };
    }

    const words = clean.split(/\s+/).filter(w => w.length > 0);
    const originalWords = item.bloatedSentence.split(/\s+/).length;
    const wordReductionPct = Math.round(((originalWords - words.length) / originalWords) * 100);

    // 1. Check forbidden cliché phrases
    const lower = clean.toLowerCase();
    for (const forbidden of item.forbiddenPhrases) {
      if (lower.includes(forbidden.toLowerCase())) {
        return {
          passed: false,
          feedback: `Forbidden cram-school cliché still present: "${forbidden}". Remove it completely.`,
          wordReductionPct
        };
      }
    }

    // 2. Check catalyst keyword usage
    const catRegex = new RegExp(`\\b${item.catalystKeyword}`, 'i');
    if (!catRegex.test(lower)) {
      return {
        passed: false,
        feedback: `Must include the catalyst keyword or its derivation: "${item.catalystKeyword}".`,
        wordReductionPct
      };
    }

    // 3. Word count ceiling check
    if (words.length > item.maxWordCount) {
      return {
        passed: false,
        feedback: `Word ceiling exceeded: ${words.length}/${item.maxWordCount} words. Be more concise!`,
        wordReductionPct
      };
    }

    return {
      passed: true,
      feedback: `Outstanding! Word count slashed by ${wordReductionPct}% with high semantic density.`,
      wordReductionPct
    };
  }
}
