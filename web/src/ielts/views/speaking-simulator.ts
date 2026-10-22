/**
 * IELTS Speaking 3-Part Examiner Simulator (ENG-119)
 *
 * Implements real-time examiner simulation adhering strictly to /ielts-coach principles:
 * 1. Part 1 Interactive Drill: Examiner prompts with speech recording/text input enforcing
 *    the 'Direct Answer + 2-3 sentence extension' formula (rejecting 1-word truncation or rambling).
 * 2. Part 2 Cue Card Laboratory: 60-second prep countdown enforcing the 4-keyword notepad
 *    technique, followed by 2-minute sustained speech simulation.
 * 3. Part 3 Abstract Justification & Conversational Fillers Drill: Interactive audio trainer
 *    for native fillers with real-time filler usage counter.
 * 4. Comparative Model Deconstruction: Interactive paragraph-by-paragraph breakdown comparing
 *    Band 6.5 vs Band 7.5 vs Band 8.5 answers with examiner scoring notes.
 */

import { h, esc, fmtTime, countdown, Countdown } from '../ui';
import { playText, Playback } from '../tts';
import { AcousticEngine } from '../../core/acoustic-engine';

// ============================================================================
// DATA STRUCTURES & INTERFACES
// ============================================================================

export interface Part1Prompt {
  id: string;
  topic: string;
  question: string;
  modelAnswerBand7: string;
  modelAnswerBand8: string;
  rubricNotes: string;
}

export interface Part1Validation {
  valid: boolean;
  sentenceCount: number;
  wordCount: number;
  status: 'truncated' | 'rambling' | 'acceptable';
  feedback: string;
  scoreEstimate: 'Band 5.0' | 'Band 6.0' | 'Band 7.0+' | 'Band 8.0+';
}

export interface Part2NotepadValidation {
  valid: boolean;
  filledCount: number;
  isConcise: boolean;
  feedback: string[];
}

export interface ConversationalFiller {
  id: string;
  phrase: string;
  category: 'opening_stall' | 'perspective_shift' | 'contingency' | 'macro_reflection';
  phoneticGuide: string;
  contextUsage: string;
  audioExample: string;
}

export interface Part3Validation {
  valid: boolean;
  fillerCount: number;
  detectedFillers: string[];
  hasGeneralization: boolean;
  hasCausalMechanism: boolean;
  hasNuance: boolean;
  feedback: string[];
  scoreEstimate: 'Band 6.0' | 'Band 7.0' | 'Band 7.0+' | 'Band 8.0+';
}

export interface DeconstructionModel {
  band: '6.5' | '7.5' | '8.5';
  transcript: string;
  fcScore: string;
  fcAnalysis: string;
  lrScore: string;
  lrAnalysis: string;
  graScore: string;
  graAnalysis: string;
  prScore: string;
  prAnalysis: string;
  keyFeatures: string[];
}

export interface DeconstructionCase {
  id: string;
  part: 'Part 1' | 'Part 2' | 'Part 3';
  topic: string;
  prompt: string;
  models: Record<'6.5' | '7.5' | '8.5', DeconstructionModel>;
}

// ============================================================================
// CATALOG DATA
// ============================================================================

export const PART1_PROMPTS: Part1Prompt[] = [
  {
    id: 'p1-hometown-change',
    topic: 'Hometown',
    question: 'Has your hometown changed much in recent years?',
    modelAnswerBand7: 'Yes, it has transformed substantially over the past decade. The local government has invested heavily in modern transit systems and green parks. Because of this, it is far more cosmopolitan than when I was growing up.',
    modelAnswerBand8: 'Significantly so; in fact, over the past decade it has undergone rapid urbanization. The municipal council has rolled out subsidized light rail networks and pedestrianized cultural quarters. Consequently, while it has lost some of its tranquil rural charm, it has become a remarkably dynamic commercial hub.',
    rubricNotes: 'Direct affirmative answer + 2 specific transformation vectors (transit, urbanization) + evaluative concluding reflection.'
  },
  {
    id: 'p1-reading-habits',
    topic: 'Reading Habits',
    question: 'Do you prefer reading physical books or reading on digital screens?',
    modelAnswerBand7: 'I definitely lean toward physical books, especially when reading literature in the evening. There is something tactile about turning printed pages that helps me disconnect from electronic devices. That said, I still use an e-reader when traveling for the sake of convenience.',
    modelAnswerBand8: 'Without hesitation, I favor physical volumes, particularly for dense non-fiction and history. Engaging with printed text provides a restorative tactile pause after hours of glare-heavy office work. Having said that, for academic research I inevitably rely on digital formats due to their instant searchability.',
    rubricNotes: 'Definitive preference + sensory/cognitive rationale + pragmatic concession showing grammatical range.'
  },
  {
    id: 'p1-daily-routine',
    topic: 'Daily Routine',
    question: 'What is the most productive part of your day?',
    modelAnswerBand7: 'I find that my peak productivity occurs in the early morning between seven and ten. During those hours, my concentration is at its highest before emails and phone notifications start pouring in. As a result, I always tackle my most demanding tasks first thing.',
    modelAnswerBand8: 'Undoubtedly the early morning hours before eight o’clock, as my mental clarity is entirely uncompromised by workplace distractions. I reserve that uninterrupted window exclusively for creative writing and strategic planning. By the time the afternoon lull sets in, my primary milestones are already secured.',
    rubricNotes: 'Direct time anchor + psychological mechanism + strategic routine consequence.'
  },
  {
    id: 'p1-travel-preference',
    topic: 'Travel',
    question: 'Do you prefer traveling alone or in a group with friends?',
    modelAnswerBand7: 'I generally prefer traveling solo because it grants me complete autonomy over my itinerary. I can alter my schedule on a whim without having to negotiate every decision with travel companions. However, for wilderness excursions, I do appreciate the camaraderie and safety of a small group.',
    modelAnswerBand8: 'I gravitate decisively towards solo travel, principally because it affords complete logistical autonomy and fosters authentic immersion with local communities. When unaccompanied, one is compelled to engage with unfamiliar environs rather than retreating into the comfort of a peer group. Nonetheless, for high-altitude trekking, collective safety necessitates traveling with experienced partners.',
    rubricNotes: 'Clear personal stance + sociopsychological justification + balanced safety qualification.'
  }
];

export const CONVERSATIONAL_FILLERS: ConversationalFiller[] = [
  {
    id: 'filler-intriguing',
    phrase: 'Well, that is an intriguing inquiry...',
    category: 'opening_stall',
    phoneticGuide: '/wɛl ðæt ɪz ən ɪnˈtriːɡɪŋ ɪnˈkwaɪəri/',
    contextUsage: 'Buys 2-3 seconds to formulate a structured response to an abstract or unexpected question without emitting disfluent "uh" or "um" sounds.',
    audioExample: 'Well, that is an intriguing inquiry. If we look at historical precedents...'
  },
  {
    id: 'filler-observed',
    phrase: 'From what I have observed in recent times...',
    category: 'observational_foundation' as any,
    phoneticGuide: '/frɒm wɒt aɪ hæv əbˈzɜːvd ɪn ˈriːsnt taɪmz/',
    contextUsage: 'Introduces empirical or societal evidence smoothly without resorting to childish personal anecdotes.',
    audioExample: 'From what I have observed in recent times, younger generations prioritize experiential living over material ownership.'
  },
  {
    id: 'filler-hinges',
    phrase: 'It largely hinges upon...',
    category: 'contingency',
    phoneticGuide: '/ɪt ˈlɑːdʒli ˈhɪndʒɪz əˈpɒn/',
    contextUsage: 'Demonstrates Band 8.0+ sophistication by establishing that a societal issue is multi-faceted and conditional rather than binary.',
    audioExample: 'It largely hinges upon the socioeconomic strata of the demographic in question.'
  },
  {
    id: 'filler-perspective',
    phrase: 'To put it into broader perspective...',
    category: 'perspective_shift',
    phoneticGuide: '/tuː pʊt ɪt ˈɪntuː ˈbrɔːdər pəˈspɛktɪv/',
    contextUsage: 'Transitions from a localized example to a macro-sociological or global principle in Part 3.',
    audioExample: 'To put it into broader perspective, urbanization is not merely an architectural shift, but a profound cultural transformation.'
  },
  {
    id: 'filler-societal',
    phrase: 'If we examine this from a societal standpoint...',
    category: 'macro_reflection',
    phoneticGuide: '/ɪf wi ɪɡˈzæmɪn ðɪs frɒm ə səˈsaɪətl ˈstændpɔɪnt/',
    contextUsage: 'Elevates Part 3 discourse from superficial observations into academic social science analysis.',
    audioExample: 'If we examine this from a societal standpoint, state-subsidized childcare generates immense dividend yields for national productivity.'
  },
  {
    id: 'filler-head',
    phrase: 'Off the top of my head, I would contend that...',
    category: 'opening_stall',
    phoneticGuide: '/ɒf ðə tɒp ɒv maɪ hɛd aɪ wʊd kənˈtɛnd ðæt/',
    contextUsage: 'Native conversational idiom indicating an immediate, thoughtful opinion while holding the conversational floor.',
    audioExample: 'Off the top of my head, I would contend that technological displacement is accelerating faster than institutional retraining.'
  }
];

export const COMPARATIVE_DECONSTRUCTIONS: DeconstructionCase[] = [
  {
    id: 'case-p1-routine',
    part: 'Part 1',
    topic: 'Daily Routine (Evening Relaxation)',
    prompt: 'What do you usually do to relax in the evening?',
    models: {
      '6.5': {
        band: '6.5',
        transcript: 'Usually, I watch television or play games on my computer. I work all day so I feel very tired. In the evening, I just want to relax and talk with my family. Sometimes we eat dinner together and it is nice.',
        fcScore: '6.5',
        fcAnalysis: 'Speaks at sufficient length, but relies heavily on basic coordinating linkers ("and", "so"). Ideas are somewhat repetitive ("relax", "tired").',
        lrScore: '6.0',
        lrAnalysis: 'Vocabulary is repetitive and generic ("watch television", "very tired", "nice"). Lacks less common idiomatic or collocated expressions.',
        graScore: '6.5',
        graAnalysis: 'Grammatically accurate simple sentences, but limited subordination; lacks participial or conditional variety.',
        prScore: '6.5',
        prAnalysis: 'Intelligible throughout; minor flat intonation at clause boundaries.',
        keyFeatures: ['Basic coordinating linkers ("and", "so")', 'Generic adjectives ("nice", "very tired")', 'Simple subject-verb-object structures'],
      },
      '7.5': {
        band: '7.5',
        transcript: 'Typically, I unwind by preparing a home-cooked meal while listening to jazz or podcasts. Engaging in culinary tasks allows me to decompress after an intense workday in front of digital monitors. Later in the evening, I tend to read fiction for half an hour, which reliably helps me transition into restful sleep.',
        fcScore: '7.5',
        fcAnalysis: 'Speaks fluently with natural sequencing ("Typically", "Later in the evening"). Seamless flow between activities without searching pauses.',
        lrScore: '7.5',
        lrAnalysis: 'Shows precise lexical flexibility: "unwind", "decompress", "culinary tasks", "transition into restful sleep".',
        graScore: '7.5',
        graAnalysis: 'Natural mix of complex sentences with adverbial time clauses ("while listening to", "which reliably helps me"). Error-free.',
        prScore: '7.5',
        prAnalysis: 'Expressive rhythm with appropriate tonic stress on key nouns ("culinary", "decompress").',
        keyFeatures: ['Precise collocations ("culinary tasks", "digital monitors")', 'Non-restrictive relative clause ("which reliably helps me...")', 'Natural discourse flow'],
      },
      '8.5': {
        band: '8.5',
        transcript: 'My evening ritual centers on conscious decompression; I generally step away from all electronic screens to prepare a slow culinary dinner or immerse myself in contemporary literature. Imposing this deliberate boundary between vocational demands and personal downtime is crucial for preventing cognitive burnout. On occasion, I’ll take a brisk stroll through the neighborhood, which effortlessly clears my head before retiring for the night.',
        fcScore: '8.5',
        fcAnalysis: 'Effortless, native-like discourse progression with sophisticated rhythmic pacing and zero hesitations.',
        lrScore: '8.5',
        lrAnalysis: 'Extensive high-register lexical resource used idiomatically and naturally ("conscious decompression", "vocational demands", "cognitive burnout", "retiring for the night").',
        graScore: '8.5',
        graAnalysis: 'Mastery of gerund subject phrases ("Imposing this deliberate boundary... is crucial"), compound-complex syntax, and semicolon coordination.',
        prScore: '8.5',
        prAnalysis: 'Nuanced intonational contours conveying reflective maturity; effortless phonetic chunking.',
        keyFeatures: ['Nominalized gerund subject ("Imposing this deliberate boundary...")', 'High-register conceptual lexis ("cognitive burnout", "vocational demands")', 'Flawless cadence and intonation'],
      }
    }
  },
  {
    id: 'case-p2-decision',
    part: 'Part 2',
    topic: 'A Difficult Decision with a Positive Outcome',
    prompt: 'Describe a challenging decision you made that had a positive outcome.',
    models: {
      '6.5': {
        band: '6.5',
        transcript: 'I want to talk about when I decided to change my career two years ago. I worked in an office as an accountant, but I did not enjoy it. It was very boring and the salary was not so high. So I chose to learn software programming. It was very difficult because I had to study every night after my work. My family was worried that I would fail. But after six months, I passed the test and found a job in a software company. Now, I am earning more money and I feel much happier with my daily life.',
        fcScore: '6.5',
        fcAnalysis: 'Maintains flow for the full 2 minutes, but relies on predictable chronological sequencing ("So", "Because", "But", "Now"). Frequent repetition of "very".',
        lrScore: '6.0',
        lrAnalysis: 'Relies on basic evaluative words ("boring", "not so high", "earning more money", "much happier"). Limited stylistic range.',
        graScore: '6.5',
        graAnalysis: 'Accurate past simple narrative; attempts complex concession clauses with minor clausal stiffness.',
        prScore: '6.5',
        prAnalysis: 'Clear pronunciation, though with occasional stress syllable neutralization.',
        keyFeatures: ['Basic connectors ("So", "But", "Now")', 'Repetitive intensifiers ("very boring", "very difficult")', 'Monotonous simple past tense sequence'],
      },
      '7.5': {
        band: '7.5',
        transcript: 'I’d like to recount a pivotal decision I confronted approximately two years ago, specifically my choice to transition from accounting into software development. At the time, I felt trapped in a routine that offered minimal intellectual fulfillment, yet resigning was intimidating due to the financial uncertainty it entailed. I resolved to undertake an intensive six-month coding bootcamp while continuing my daytime employment, which demanded immense self-discipline. In retrospect, persevering through those grueling late-night study sessions was completely justified, as it enabled me to secure an engineering role that has proven both financially rewarding and professionally invigorating.',
        fcScore: '7.5',
        fcAnalysis: 'Sustained fluency across all bullet points. Cohesive discourse markers ("At the time", "In retrospect", "as it enabled me to").',
        lrScore: '7.5',
        lrAnalysis: 'Sophisticated academic and idiomatic collocations: "pivotal decision", "intellectual fulfillment", "financial uncertainty it entailed", "professionally invigorating".',
        graScore: '7.5',
        graAnalysis: 'Complex subordinate structures, non-restrictive relative clauses, and participial phrases ("persevering through... was completely justified").',
        prScore: '7.5',
        prAnalysis: 'Clear sentence rhythm and expressive pitch modulation over contrastive junctures.',
        keyFeatures: ['Idiomatic academic collocations ("pivotal decision", "intellectual fulfillment")', 'Participial subject phrase', 'Seamless narrative progression across 2 minutes'],
      },
      '8.5': {
        band: '8.5',
        transcript: 'Reflecting on the past few years, the single most arduous yet consequential crossroads I’ve navigated was electing to relinquish a predictable corporate trajectory in finance to bootstrap an educational technology venture. Having spent three years in commercial auditing, the default trajectory was to pursue an executive track; however, I was acutely conscious that my core values were fundamentally misaligned with institutional compliance. Taking that leap plunged me into profound financial precarity, requiring eighteen months of relentless bootstrapping under intense peer skepticism. What ultimately validated that calculated risk was witnessing our platform scale to serve over ten thousand students in regional schools. Had I succumbed to risk aversion and remained in corporate practice, I would undoubtedly have experienced chronic vocational stagnation; instead, that audacious pivot cultivated an enduring resilience that governs my worldview today.',
        fcScore: '9.0',
        fcAnalysis: 'Effortless, eloquent delivery with sophisticated rhetorical pacing. Transitions between narrative backstory and existential reflection without the slightest hesitation.',
        lrScore: '8.5',
        lrAnalysis: 'Rare, nuanced academic vocabulary deployed with absolute naturalness: "arduous yet consequential crossroads", "relinquish a predictable corporate trajectory", "profound financial precarity", "chronic vocational stagnation".',
        graScore: '8.5',
        graAnalysis: 'Flawless grammatical virtuosity: inverted third conditional ("Had I succumbed... I would undoubtedly have..."), perfect participial adjuncts ("Having spent three years..."), and balanced semicolons.',
        prScore: '9.0',
        prAnalysis: 'Exemplary phonological control with subtle contrastive stress, rhythmic pauses at clause boundaries, and natural native-like intonation.',
        keyFeatures: ['Inverted third conditional ("Had I succumbed...")', 'Participial narrative opening ("Having spent three years...")', 'Exceptional lexical precision ("profound financial precarity", "chronic vocational stagnation")'],
      }
    }
  },
  {
    id: 'case-p3-technology',
    part: 'Part 3',
    topic: 'Automation and Future of Employment',
    prompt: 'Do you believe artificial intelligence will eliminate more jobs than it creates in the coming decades?',
    models: {
      '6.5': {
        band: '6.5',
        transcript: 'I think that artificial intelligence will take away many jobs in the future, like drivers and factory workers. But at the same time, it will also create new jobs for computer scientists. However, old people might find it very difficult to learn new technology, so governments need to train them. In my opinion, society must be careful about this.',
        fcScore: '6.5',
        fcAnalysis: 'Addresses the question directly, but structure is simple (Claim -> Counter -> Problem -> Opinion). Connectors are standard ("But", "However", "In my opinion").',
        lrScore: '6.0',
        lrAnalysis: 'Vocabulary is limited to common words ("take away jobs", "old people", "very difficult", "careful"). Lacks precision in economic terms.',
        graScore: '6.5',
        graAnalysis: 'Basic modal auxiliary structures ("will take away", "might find"). No inverted or participial structures.',
        prScore: '6.5',
        prAnalysis: 'Easy to follow, though lacks varied intonation.',
        keyFeatures: ['Basic contrastive conjunctions', 'Everyday lexis ("take away jobs", "old people")', 'Literal surface-level argumentation'],
      },
      '7.5': {
        band: '7.5',
        transcript: 'Well, that is an intriguing inquiry. From what I’ve observed, artificial intelligence will undoubtedly displace conventional clerical and repetitive manual roles, as algorithmic systems achieve higher cost-efficiency than human labor. Nevertheless, historical industrial revolutions suggest that technological disruption invariably spawns entirely novel employment sectors, particularly in AI oversight, ethical compliance, and personalized healthcare. Consequently, the primary challenge will not be an aggregate shortage of jobs, but rather the velocity of workforce reskilling required to prevent structural unemployment.',
        fcScore: '7.5',
        fcAnalysis: 'Uses natural opening filler seamlessly. Develops argument from immediate displacement to historical synthesis.',
        lrScore: '7.5',
        lrAnalysis: 'High-level macroeconomic lexis: "displace conventional clerical roles", "algorithmic systems", "technological disruption", "structural unemployment".',
        graScore: '7.5',
        graAnalysis: 'Strong command of complex sentences: causal conjunctions ("as algorithmic systems achieve..."), concessive adverbials ("Nevertheless"), and compound predicates.',
        prScore: '7.5',
        prAnalysis: 'Clear chunking into meaningful phrase units; tonic stress placed effectively on contrastive terms ("aggregate shortage" vs "velocity of reskilling").',
        keyFeatures: ['Opening conversational filler ("Well, that is an intriguing inquiry...")', 'Macroeconomic lexis ("structural unemployment", "technological disruption")', 'Abstract balanced synthesis'],
      },
      '8.5': {
        band: '8.5',
        transcript: 'To put it into broader perspective, the trajectory of artificial intelligence will likely induce qualitative labor restructuring rather than quantitative employment obliteration. It largely hinges upon whether institutional educational pipelines can adapt with sufficient agility to bridge the transitional gap. While cognitive automation is already rendering routine white-collar tasks obsolete, it simultaneously elevates demand for higher-order synthesis, empathetic human care, and regulatory stewardship. The critical hazard lies not in a net deficit of economic vocations, but rather in socio-economic stratification if displaced labor pools are left disenfranchised by sluggish legislative interventions.',
        fcScore: '8.5',
        fcAnalysis: 'Speaks with effortless academic fluency, deploying macro-sociological frameworks and speculative nuance with total confidence.',
        lrScore: '8.5',
        lrAnalysis: 'Profound lexical sophistication: "qualitative labor restructuring", "quantitative employment obliteration", "cognitive automation", "regulatory stewardship", "sluggish legislative interventions".',
        graScore: '8.5',
        graAnalysis: 'Flawless syntactic variety: cleft-like conditional structures ("It largely hinges upon whether..."), concessive clauses ("While cognitive automation is already..."), and parallel noun phrases.',
        prScore: '8.5',
        prAnalysis: 'Flawless phonological control with subtle rhetorical pauses, emphasizing semantic weight without any mechanical rhythm.',
        keyFeatures: ['Native transition fillers ("To put it into broader perspective...", "It largely hinges upon...")', 'Advanced abstract conceptual lexis ("qualitative labor restructuring")', 'Flawless clausal synthesis and sociopolitical depth'],
      }
    }
  }
];

// ============================================================================
// SIMULATOR ENGINE (LOGIC & EVALUATORS)
// ============================================================================

export class SpeakingSimulatorEngine {
  /**
   * Part 1 Evaluator:
   * Enforces the 'Direct Answer + 2-3 sentence extension' formula (20-30s / 20-80 words).
   * Rejects 1-word truncation and rambling monologues.
   */
  public static validatePart1Response(text: string): Part1Validation {
    const trimmed = text.trim();
    if (!trimmed) {
      return {
        valid: false,
        sentenceCount: 0,
        wordCount: 0,
        status: 'truncated',
        scoreEstimate: 'Band 5.0',
        feedback: 'No response entered. Part 1 requires a direct answer plus a 2-3 sentence extension.'
      };
    }

    const sentences = trimmed.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map(s => s.trim()).filter(Boolean) || [];
    const words = trimmed.match(/\b[\w'-]+\b/g) || [];
    const sentenceCount = sentences.length;
    const wordCount = words.length;

    // 1. Truncation check (1 word or 1 tiny sentence under 15 words)
    if (sentenceCount < 2 || wordCount < 15) {
      return {
        valid: false,
        sentenceCount,
        wordCount,
        status: 'truncated',
        scoreEstimate: 'Band 5.0',
        feedback: `Truncated response (${wordCount} words in ${sentenceCount} sentence). Part 1 requires a Direct Answer followed by 2–3 sentences explaining why, giving an example, or providing habitus nuance. Never stop at a 1-word or 1-sentence answer.`
      };
    }

    // 2. Rambling monologue check (more than 4 sentences or over 85 words)
    if (sentenceCount > 4 || wordCount > 85) {
      return {
        valid: false,
        sentenceCount,
        wordCount,
        status: 'rambling',
        scoreEstimate: 'Band 6.0',
        feedback: `Rambling monologue (${wordCount} words across ${sentenceCount} sentences). In Part 1, the examiner expects concise, 20–30 second answers. Save extended dissertations for Part 2 and Part 3.`
      };
    }

    // 3. Within acceptable bounds (2 to 4 sentences, 15 to 85 words)
    const lower = trimmed.toLowerCase();
    const hasConnector = /\b(because|since|as|for instance|for example|particularly|especially|that said|however|although|in fact|to be honest|actually|tend to|find that|usually|in recent years|consequently|as a result)\b/i.test(lower);

    let scoreEstimate: Part1Validation['scoreEstimate'] = 'Band 6.0';
    if (hasConnector && wordCount >= 30) {
      scoreEstimate = 'Band 8.0+';
    } else if (hasConnector || wordCount >= 22) {
      scoreEstimate = 'Band 7.0+';
    }

    return {
      valid: true,
      sentenceCount,
      wordCount,
      status: 'acceptable',
      scoreEstimate,
      feedback: `Well-calibrated response! Exactly ${sentenceCount} sentences (${wordCount} words) adhering to the Direct Answer + Extension formula.`
    };
  }

  /**
   * Part 2 Evaluator:
   * Enforces the 1-minute 4-keyword notepad bullet technique.
   * Notes must be concise keywords/phrases (<= 6 words per bullet) across 4 quadrants.
   */
  public static validatePart2Notepad(bullets: string[]): Part2NotepadValidation {
    const feedback: string[] = [];
    let filledCount = 0;
    let isConcise = true;

    bullets.forEach((bullet, idx) => {
      const trimmed = bullet.trim();
      if (!trimmed) return;
      filledCount++;
      const words = trimmed.match(/\b[\w'-]+\b/g) || [];
      if (words.length > 6) {
        isConcise = false;
        feedback.push(`Quadrant ${idx + 1} ("${trimmed.slice(0, 25)}...") contains ${words.length} words. Use concise keywords/shorthand (≤ 6 words), not full sentences, to maximize the 1-minute prep window.`);
      }
    });

    if (filledCount < 3) {
      feedback.unshift(`Only ${filledCount} of 4 quadrants populated. Fill at least 3 quadrants to anchor your 2-minute speech.`);
    }

    const valid = filledCount >= 3 && isConcise;
    if (valid) {
      feedback.push(`Great 4-keyword notepad execution! ${filledCount}/4 quadrants anchored with concise lexical prompts.`);
    }

    return {
      valid,
      filledCount,
      isConcise,
      feedback
    };
  }

  /**
   * Conversational Filler Detection Engine:
   * Scans text for native conversational hesitation phrases.
   */
  public static detectFillers(text: string): { count: number; matches: string[] } {
    const lower = text.toLowerCase();
    const matches: string[] = [];

    const FILLER_PATTERNS = [
      { name: 'Well, that is an intriguing inquiry', regex: /\b(well,?\s+that\s+is\s+an\s+intriguing\s+inquiry|well,?\s+that's\s+an\s+intriguing\s+question)\b/i },
      { name: 'From what I have observed in recent times', regex: /\bfrom\s+what\s+i\s+(have|'ve)\s+observed(\s+in\s+recent\s+(times|years))?\b/i },
      { name: 'It largely hinges upon', regex: /\b(it\s+(largely|really)\s+hinges\s+(upon|on)|it\s+hinges\s+(upon|on))\b/i },
      { name: 'To put it into broader perspective', regex: /\bto\s+put\s+it\s+(in|into)\s+(a\s+)?broader\s+perspective\b/i },
      { name: 'If we examine this from a societal standpoint', regex: /\b(if\s+we\s+examine\s+this\s+from\s+a\s+societal\s+standpoint|from\s+a\s+societal\s+(standpoint|perspective))\b/i },
      { name: 'Off the top of my head, I would contend that', regex: /\boff\s+the\s+top\s+of\s+my\s+head(,\s+i\s+would\s+contend\s+that)?\b/i },
      { name: 'In the grand scheme of things', regex: /\bin\s+the\s+grand\s+scheme\s+of\s+things\b/i },
      { name: 'That said, one must also account for', regex: /\bthat\s+said,?\s+one\s+must\s+also\s+account\s+for\b/i },
      { name: 'There is no simple consensus, but', regex: /\bthere\s+is\s+no\s+(simple|straightforward)\s+consensus\b/i }
    ];

    FILLER_PATTERNS.forEach(fp => {
      if (fp.regex.test(lower)) {
        matches.push(fp.name);
      }
    });

    return {
      count: matches.length,
      matches
    };
  }

  /**
   * Part 3 Evaluator:
   * Enforces abstract sociological depth, causal mechanisms, nuance, and native filler usage.
   */
  public static validatePart3Response(text: string): Part3Validation {
    const trimmed = text.trim();
    const lower = trimmed.toLowerCase();
    const words = trimmed.match(/\b[\w'-]+\b/g) || [];
    const wordCount = words.length;

    const fillerResult = this.detectFillers(trimmed);
    const feedback: string[] = [];

    const hasGeneralization = /\b(society|societal|community|policymakers|broader|macro|generations|demographic|institutions|widespread|generally speaking|in most cases)\b/i.test(lower);
    const hasCausalMechanism = /\b(because|stems from|driven by|precipitated by|as a consequence|leads to|results in|reason is|underlying mechanism)\b/i.test(lower);
    const hasNuance = /\b(nevertheless|that said|however|conversely|notwithstanding|on the other hand|yet|hinges upon|contingent upon)\b/i.test(lower);

    if (wordCount < 25) {
      feedback.push('Response is too brief for Part 3. Provide an abstract generalization, explain the causal mechanism, and weigh nuances.');
      return {
        valid: false,
        fillerCount: fillerResult.count,
        detectedFillers: fillerResult.matches,
        hasGeneralization,
        hasCausalMechanism,
        hasNuance,
        feedback,
        scoreEstimate: 'Band 6.0'
      };
    }

    if (fillerResult.count === 0) {
      feedback.push('Tip: Incorporate a native conversational filler (e.g., "Well, that is an intriguing inquiry..." or "It largely hinges upon...") to buy cognitive planning time.');
    } else {
      feedback.push(`Recognized ${fillerResult.count} native conversational filler(s): ${fillerResult.matches.join(', ')}.`);
    }

    if (!hasGeneralization) {
      feedback.push('Avoid purely personal anecdotes ("I", "my friend"). Pivot towards macro-societal perspectives.');
    }
    if (!hasCausalMechanism) {
      feedback.push('Strengthen causal depth: Explain WHY or HOW this occurs using causal linkers (e.g., "stems primarily from", "driven by").');
    }
    if (!hasNuance) {
      feedback.push('Add balance or concession: Weigh counter-perspectives with markers like "That said," or "Nevertheless".');
    }

    let scoreEstimate: Part3Validation['scoreEstimate'] = 'Band 6.0';
    if (hasGeneralization && hasCausalMechanism && hasNuance && wordCount >= 45) {
      scoreEstimate = fillerResult.count >= 1 ? 'Band 8.0+' : 'Band 7.0+';
    } else if ((hasGeneralization || hasCausalMechanism) && wordCount >= 30) {
      scoreEstimate = 'Band 7.0+';
    }

    const valid = wordCount >= 25 && (hasGeneralization || hasCausalMechanism);

    return {
      valid,
      fillerCount: fillerResult.count,
      detectedFillers: fillerResult.matches,
      hasGeneralization,
      hasCausalMechanism,
      hasNuance,
      feedback,
      scoreEstimate
    };
  }
}

// ============================================================================
// UI VIEW RENDERER
// ============================================================================

export function speakingSimulatorView(root: HTMLElement, onBack?: () => void): () => void {
  const engine = new AcousticEngine();
  let activePlayback: Playback | null = null;

  const stopActiveAudio = (): void => {
    if (activePlayback) {
      activePlayback.stop();
      activePlayback = null;
    }
  };

  const render = (): void => {
    stopActiveAudio();
    root.innerHTML = '';

    // Header HUD
    const header = h('div', 'ie-sim-header');
    const titleRow = h('div', 'ie-testbar');
    const backBtn = h('button', 'ie-btn', '← Back to Speaking Hub');
    backBtn.addEventListener('click', () => {
      stopActiveAudio();
      engine.dispose();
      if (onBack) onBack();
      else location.hash = '#speaking';
    });

    const badge = h('span', 'ie-sim-badge', '3-Part Examiner Simulator (Band 7.0–8.5+)');
    titleRow.append(backBtn, badge);

    const intro = h('div', 'ie-stage');
    intro.append(
      h('h1', 'ie-title', 'IELTS Speaking 3-Part Examiner Simulator'),
      h('p', 'ie-lead', 'Interactive examination room executing Keino Campbell’s Band 7+ formulas and /ielts-coach principles: Direct Answer + 2–3 sentence extension, 1-minute 4-keyword notepad prep, native conversational fillers, and comparative deconstructions.')
    );

    // Mode Navigation Tabs
    const navRow = h('div', 'ie-tabs ie-sim-tabs');
    const modes = [
      { id: 'part1', label: 'Part 1: Interview Drill' },
      { id: 'part2', label: 'Part 2: Cue Card Lab' },
      { id: 'part3', label: 'Part 3: Abstract & Fillers' },
      { id: 'deconstruct', label: 'Comparative Deconstruction' }
    ];

    const contentArea = h('div', 'ie-sim-panel');
    let currentMode = 'part1';

    const switchMode = (modeId: string): void => {
      stopActiveAudio();
      currentMode = modeId;
      navRow.querySelectorAll('.ie-tab').forEach(btn => {
        const target = (btn as HTMLElement).dataset.mode;
        btn.classList.toggle('is-on', target === modeId);
      });
      contentArea.innerHTML = '';

      if (modeId === 'part1') renderPart1(contentArea);
      else if (modeId === 'part2') renderPart2(contentArea);
      else if (modeId === 'part3') renderPart3(contentArea);
      else if (modeId === 'deconstruct') renderDeconstruction(contentArea);
    };

    modes.forEach(m => {
      const btn = h('button', `ie-tab ${m.id === currentMode ? 'is-on' : ''}`, m.label);
      btn.dataset.mode = m.id;
      btn.addEventListener('click', () => switchMode(m.id));
      navRow.append(btn);
    });

    header.append(titleRow, intro, navRow);
    root.append(header, contentArea);

    switchMode('part1');
  };

  // --------------------------------------------------------------------------
  // PART 1 INTERACTIVE DRILL
  // --------------------------------------------------------------------------
  const renderPart1 = (container: HTMLElement): void => {
    let promptIndex = 0;
    const prompt = PART1_PROMPTS[promptIndex];

    const card = h('div', 'ie-passage');
    card.append(
      h('div', 'ie-testbar', `<span class="ie-plabel">Part 1 Focus</span><strong>Topic: ${esc(prompt.topic)}</strong>`),
      h('p', 'ie-cue', esc(prompt.question)),
      h('p', 'ie-note', '<b>Formula Mandate:</b> Direct Answer + 2–3 sentence extension (20–30s). Avoid 1-word truncation ("Yes", "London") and long rambling monologues.')
    );

    const controls = h('div', 'ie-testbar');
    const listenPromptBtn = h('button', 'ie-btn ie-btn-primary', '🔊 Listen to Examiner Prompt');
    listenPromptBtn.addEventListener('click', () => {
      stopActiveAudio();
      activePlayback = playText(prompt.question, { rate: 0.95 });
    });

    const nextPromptBtn = h('button', 'ie-btn', 'Next Question');
    nextPromptBtn.addEventListener('click', () => {
      promptIndex = (promptIndex + 1) % PART1_PROMPTS.length;
      container.innerHTML = '';
      renderPart1(container);
    });

    controls.append(listenPromptBtn, nextPromptBtn);

    const inputArea = h('div', 'ie-qcol');
    inputArea.append(h('label', 'ie-wb-label', 'Speak aloud or type your 2–3 sentence response below:'));
    const textarea = document.createElement('textarea');
    textarea.className = 'ie-textarea';
    textarea.style.minHeight = '110px';
    textarea.placeholder = 'Type your response here to evaluate sentence count, word count, and extension formula...';

    const evalBtn = h('button', 'ie-btn ie-btn-primary', 'Evaluate Response Formula');
    const resultBox = h('div', 'ie-result');
    resultBox.style.display = 'none';

    evalBtn.addEventListener('click', () => {
      const val = SpeakingSimulatorEngine.validatePart1Response(textarea.value);
      resultBox.style.display = 'flex';
      resultBox.innerHTML = `
        <div class="ie-feedback-col">
          <div class="ie-eval-top">
            <span class="ie-eval-badge ${val.valid ? 'is-valid' : 'is-invalid'}">${val.status.toUpperCase()}</span>
            <span class="ie-eval-badge ${val.scoreEstimate === 'Band 8.0+' ? 'band-80' : val.scoreEstimate === 'Band 7.0+' ? 'band-70' : 'band-60'}">${val.scoreEstimate}</span>
          </div>
          <div class="ie-eval-metrics">
            <span>Sentences: <b>${val.sentenceCount}</b> (Goal: 2–4)</span>
            <span>Words: <b>${val.wordCount}</b> (Goal: 20–80)</span>
          </div>
          <p class="ie-note">${esc(val.feedback)}</p>
        </div>
        <div class="ie-feedback-col">
          <h4>Band 8.0+ Model Answer</h4>
          <p class="ie-model-text">${esc(prompt.modelAnswerBand8)}</p>
          <p class="ie-note"><b>Rubric Note:</b> ${esc(prompt.rubricNotes)}</p>
        </div>
      `;
    });

    inputArea.append(textarea, evalBtn, resultBox);
    container.append(card, controls, inputArea);
  };

  // --------------------------------------------------------------------------
  // PART 2 CUE CARD LABORATORY
  // --------------------------------------------------------------------------
  const renderPart2 = (container: HTMLElement): void => {
    const cueCard = h('article', 'ie-passage ie-cuecard');
    cueCard.append(
      h('div', 'ie-testbar', '<span class="ie-plabel">Part 2 Cue Card</span><strong>Pivotal Life Crossroads</strong>'),
      h('p', 'ie-cue', 'Describe a challenging decision you made that had a positive outcome.'),
      h('p', 'ie-note', 'You should say:'),
      h('ul', '', `
        <li>What the decision was and who was involved</li>
        <li>When and why you were compelled to make it</li>
        <li>What personal doubts or difficulties you encountered</li>
        <li>And explain why the outcome turned out to be positive</li>
      `)
    );

    const labCard = h('div', 'ie-qcol');
    const timerRow = h('div', 'ie-testbar');
    const clock = h('span', 'ie-clock', '01:00');
    const startPrepBtn = h('button', 'ie-btn ie-btn-primary', 'Start 1-Minute Prep Countdown');
    const resetPrepBtn = h('button', 'ie-btn', 'Reset Timer');
    timerRow.append(clock, startPrepBtn, resetPrepBtn);

    const notepadGuide = h('p', 'ie-note',
      '<b>The Keino Campbell 4-Keyword Notepad:</b> In Part 2, examiners penalize candidates who try to write full sentences during the 60s prep. Instead, anchor your talk with <b>concise keywords (≤ 6 words)</b> across the 4 narrative quadrants.'
    );

    const quadrants = [
      { label: 'Quadrant 1: WHO / WHERE / CONTEXT', placeholder: 'e.g. Pivot finance -> tech; startup team' },
      { label: 'Quadrant 2: CHRONOLOGY / ACTION', placeholder: 'e.g. Resigned corporate; 6mo coding bootcamp' },
      { label: 'Quadrant 3: EMOTION / ADVERSITY', placeholder: 'e.g. Acute financial precarity; peer skepticism' },
      { label: 'Quadrant 4: REFLECTION / LEGACY', placeholder: 'e.g. Fulfilling engineering role; resilience' }
    ];

    const inputs: HTMLInputElement[] = [];
    const notepadGrid = h('div', 'ie-formula-components');
    quadrants.forEach(q => {
      const qBox = h('div', 'ie-formula-card');
      const label = h('label', 'ie-vocab-label', q.label);
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'ie-input';
      input.placeholder = q.placeholder;
      inputs.push(input);
      qBox.append(label, input);
      notepadGrid.append(qBox);
    });

    let prepCd: Countdown | null = null;
    startPrepBtn.addEventListener('click', () => {
      startPrepBtn.disabled = true;
      prepCd = countdown(60, left => {
        clock.textContent = fmtTime(left);
      }, () => {
        clock.textContent = '00:00 (Time Up!)';
        startPrepBtn.disabled = false;
      });
    });

    resetPrepBtn.addEventListener('click', () => {
      if (prepCd) prepCd.stop();
      clock.textContent = '01:00';
      startPrepBtn.disabled = false;
    });

    const validateNotepadBtn = h('button', 'ie-btn ie-btn-primary', 'Validate 4-Keyword Notepad');
    const notepadResult = h('div', 'ie-result');
    notepadResult.style.display = 'none';

    validateNotepadBtn.addEventListener('click', () => {
      const values = inputs.map(inp => inp.value);
      const res = SpeakingSimulatorEngine.validatePart2Notepad(values);
      notepadResult.style.display = 'flex';
      notepadResult.innerHTML = `
        <div class="ie-feedback-col">
          <div class="ie-eval-top">
            <span class="ie-eval-badge ${res.valid ? 'is-valid' : 'is-invalid'}">${res.valid ? 'NOTEPAD VALIDATED' : 'REVISE NOTEPAD'}</span>
            <span class="ie-count">Quadrants Filled: ${res.filledCount}/4</span>
          </div>
          <ul class="ie-workbench-feedback">
            ${res.feedback.map(fb => `<li>${esc(fb)}</li>`).join('')}
          </ul>
        </div>
      `;
    });

    // 2-Minute Speech Simulation Section
    const speechSection = h('div', 'ie-passage');
    speechSection.append(
      h('h3', '', '2-Minute Sustained Speech Simulation'),
      h('p', 'ie-note', 'Deliver your 2-minute response while referencing your 4-keyword anchors above. Speak continuously until the timer reaches zero.')
    );

    const speechTimerRow = h('div', 'ie-testbar');
    const speechClock = h('span', 'ie-clock', '02:00');
    const startTalkBtn = h('button', 'ie-btn ie-btn-primary', 'Start 2-Minute Speech Timer');
    const quickBtn = h('button', 'ie-btn', '20s answer');
    const elabBtn = h('button', 'ie-btn', '60s answer');
    const rungRow = h('div', 'ie-chips');
    rungRow.append(quickBtn, elabBtn);
    const phaseCue = h('p', 'ie-note', 'Phase prompts appear during the 2-minute timer.');
    const startButtons = [startTalkBtn, quickBtn, elabBtn];
    let speechCd: Countdown | null = null;

    // cues=true shows the prompt for the current stage of the 2-minute answer.
    const startSpeech = (seconds: number, cues: boolean): void => {
      if (speechCd) speechCd.stop();
      startButtons.forEach(b => { b.disabled = true; });
      if (!cues) phaseCue.textContent = 'Phase prompts appear during the 2-minute timer.';
      speechCd = countdown(seconds, left => {
        speechClock.textContent = fmtTime(left);
        if (cues) {
          const elapsed = seconds - left;
          phaseCue.textContent = elapsed < 30 ? 'Who and where' : elapsed < 75 ? 'What happened' : 'Why it mattered to you';
        }
      }, () => {
        speechClock.textContent = '00:00 (Finished)';
        startButtons.forEach(b => { b.disabled = false; });
      });
    };

    startTalkBtn.addEventListener('click', () => startSpeech(120, true));
    quickBtn.addEventListener('click', () => startSpeech(20, false));
    elabBtn.addEventListener('click', () => startSpeech(60, false));

    const resetTalkBtn = h('button', 'ie-btn', 'Reset');
    resetTalkBtn.addEventListener('click', () => {
      if (speechCd) speechCd.stop();
      speechClock.textContent = '02:00';
      phaseCue.textContent = 'Phase prompts appear during the 2-minute timer.';
      startButtons.forEach(b => { b.disabled = false; });
    });

    speechTimerRow.append(speechClock, startTalkBtn, resetTalkBtn);
    speechSection.append(speechTimerRow, rungRow, phaseCue);


    labCard.append(timerRow, notepadGuide, notepadGrid, validateNotepadBtn, notepadResult, speechSection);
    container.append(cueCard, labCard);
  };

  // --------------------------------------------------------------------------
  // PART 3 ABSTRACT DRILL & FILLERS TRAINER
  // --------------------------------------------------------------------------
  const renderPart3 = (container: HTMLElement): void => {
    const introCard = h('div', 'ie-passage');
    introCard.append(
      h('div', 'ie-testbar', '<span class="ie-plabel">Part 3 Focus</span><strong>Abstract Societal Inquiry & Conversational Fillers</strong>'),
      h('p', 'ie-cue', 'Do you believe automation will displace more employment opportunities than it creates in the coming decades?'),
      h('p', 'ie-note', '<b>Objective:</b> Eliminate childish "um / uh" hesitations by deploying native academic fillers. Formulate a 3-step abstract response: (1) Macro Generalization $\\to$ (2) Causal Mechanism $\\to$ (3) Societal Nuance.')
    );

    // Fillers Audio Trainer Bar
    const fillerTrainer = h('div', 'ie-qcol');
    fillerTrainer.append(
      h('h3', '', 'Interactive Conversational Fillers Trainer (Click 🔊 to hear native delivery)'),
      h('p', 'ie-note', 'Native speakers use these set phrases to buy 2–3 seconds of planning time without surrendering the conversational floor.')
    );

    const fillerGrid = h('div', 'ie-formula-components');
    CONVERSATIONAL_FILLERS.forEach(cf => {
      const fCard = h('div', 'ie-formula-card');
      fCard.append(
        h('b', '', esc(cf.phrase)),
        h('small', 'ie-note', `${esc(cf.phoneticGuide)}`),
        h('p', 'ie-fdesc', esc(cf.contextUsage))
      );
      const playBtn = h('button', 'ie-btn ie-btn-sm', '🔊 Listen to Filler');
      playBtn.addEventListener('click', () => {
        stopActiveAudio();
        activePlayback = playText(cf.audioExample, { rate: 0.95 });
      });
      fCard.append(playBtn);
      fillerGrid.append(fCard);
    });

    fillerTrainer.append(fillerGrid);

    // Interactive Response & Real-Time Filler Usage Counter
    const responseBox = h('div', 'ie-passage');
    responseBox.append(
      h('h3', '', 'Deliver Your Part 3 Answer'),
      h('p', 'ie-note', 'Type your transcript or speech below. The real-time counter immediately identifies deployed conversational fillers and scores abstract depth.')
    );

    const textarea = document.createElement('textarea');
    textarea.className = 'ie-textarea';
    textarea.style.minHeight = '120px';
    textarea.placeholder = 'Type your Part 3 response here... (Try starting with "Well, that is an intriguing inquiry..." or "It largely hinges upon...")';

    const evalBtn = h('button', 'ie-btn ie-btn-primary', 'Analyze Part 3 Answer & Fillers');
    const resultBox = h('div', 'ie-result');
    resultBox.style.display = 'none';

    evalBtn.addEventListener('click', () => {
      const val = SpeakingSimulatorEngine.validatePart3Response(textarea.value);
      resultBox.style.display = 'flex';
      resultBox.innerHTML = `
        <div class="ie-feedback-col">
          <div class="ie-eval-top">
            <span class="ie-eval-badge ${val.valid ? 'is-valid' : 'is-invalid'}">${val.valid ? 'VALIDATED PART 3' : 'INCOMPLETE STRUCTURE'}</span>
            <span class="ie-eval-badge ${val.scoreEstimate === 'Band 8.0+' ? 'band-80' : val.scoreEstimate === 'Band 7.0+' ? 'band-70' : 'band-60'}">${val.scoreEstimate}</span>
          </div>
          <div class="ie-eval-metrics">
            <span>Fillers Detected: <b>${val.fillerCount}</b></span>
            <span>Generalization: <b>${val.hasGeneralization ? 'YES' : 'NO'}</b></span>
            <span>Causal Link: <b>${val.hasCausalMechanism ? 'YES' : 'NO'}</b></span>
            <span>Nuance: <b>${val.hasNuance ? 'YES' : 'NO'}</b></span>
          </div>
          <ul class="ie-workbench-feedback">
            ${val.feedback.map(f => `<li>${esc(f)}</li>`).join('')}
          </ul>
        </div>
      `;
    });

    responseBox.append(textarea, evalBtn, resultBox);
    container.append(introCard, fillerTrainer, responseBox);
  };

  // --------------------------------------------------------------------------
  // COMPARATIVE MODEL DECONSTRUCTION
  // --------------------------------------------------------------------------
  const renderDeconstruction = (container: HTMLElement): void => {
    let activeCaseIndex = 1; // Default to Part 2 Case
    const activeCase = COMPARATIVE_DECONSTRUCTIONS[activeCaseIndex];

    const caseSelectRow = h('div', 'ie-tabs');
    COMPARATIVE_DECONSTRUCTIONS.forEach((c, i) => {
      const tab = h('button', `ie-tab ${i === activeCaseIndex ? 'is-on' : ''}`, `${c.part}: ${c.topic}`);
      tab.addEventListener('click', () => {
        activeCaseIndex = i;
        container.innerHTML = '';
        renderDeconstruction(container);
      });
      caseSelectRow.append(tab);
    });

    const promptCard = h('div', 'ie-passage');
    promptCard.append(
      h('div', 'ie-testbar', `<span class="ie-plabel">${activeCase.part}</span><strong>Prompt: ${esc(activeCase.prompt)}</strong>`),
      h('p', 'ie-lead', 'Examine the paragraph-by-paragraph comparative breakdown below. Hear how identical prompts diverge from Band 6.5 common errors to Band 8.5 master discourse.')
    );

    const bands: ('6.5' | '7.5' | '8.5')[] = ['6.5', '7.5', '8.5'];
    const modelGrid = h('div', 'ie-formula-components');

    bands.forEach(band => {
      const m = activeCase.models[band];
      const mCard = h('div', 'ie-formula-card');
      const badgeClass = band === '8.5' ? 'band-80' : band === '7.5' ? 'band-70' : 'band-60';

      mCard.append(
        h('div', 'ie-testbar', `<span class="ie-eval-badge ${badgeClass}">Band ${band} Model</span>`),
        h('p', 'ie-model-text', `"${esc(m.transcript)}"`),
        h('h4', 'ie-vocab-label', 'Examiner 4-Criterion Evaluation:')
      );

      const criteriaList = h('ul', 'ie-traps-list');
      criteriaList.innerHTML = `
        <li><b>FC (${m.fcScore}):</b> ${esc(m.fcAnalysis)}</li>
        <li><b>LR (${m.lrScore}):</b> ${esc(m.lrAnalysis)}</li>
        <li><b>GRA (${m.graScore}):</b> ${esc(m.graAnalysis)}</li>
        <li><b>PR (${m.prScore}):</b> ${esc(m.prAnalysis)}</li>
      `;

      const audioBtn = h('button', 'ie-btn ie-btn-primary ie-btn-sm', `🔊 Listen to Band ${band} Delivery`);
      audioBtn.addEventListener('click', () => {
        stopActiveAudio();
        activePlayback = playText(m.transcript, { rate: 0.95 });
      });

      mCard.append(criteriaList, audioBtn);
      modelGrid.append(mCard);
    });

    container.append(caseSelectRow, promptCard, modelGrid);
  };

  render();

  return () => {
    stopActiveAudio();
    engine.dispose();
  };
}
