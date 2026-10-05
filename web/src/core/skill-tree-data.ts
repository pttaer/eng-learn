import { RouteId } from './router';
import { Cefr } from './cefr';

export type BranchId = 'grammar' | 'collocations' | 'writing' | 'speaking' | 'reading';

export interface SkillNode {
  id: string;
  branchId: BranchId;
  level: number; // 1 to 8 (A1, A2, B1, then the five B2-C2 tiers)
  title: string;
  subtitle: string;
  description: string;
  cefrLevel: Cefr;
  routeTarget: RouteId;
  prerequisites: string[]; // Node IDs required before unlocking
  masteryThreshold: number; // e.g. 80 (%)
  x: number; // Percentage coordinate on canvas (0-100)
  y: number; // Percentage coordinate on canvas (0-100, bottom to top)
}

export interface SkillBranch {
  id: BranchId;
  name: string;
  tagline: string;
  color: string;
  routeTarget: RouteId;
  nodes: SkillNode[];
}

export const SKILL_BRANCHES: Record<BranchId, SkillBranch> = {
  grammar: {
    id: 'grammar',
    name: 'Syntactic Architecture',
    tagline: 'Inversion, Fronting & Clausal Mastery',
    color: '#5b5bd6',
    routeTarget: 'grammar',
    nodes: [
      {
        id: 'gram-a1',
        branchId: 'grammar',
        level: 1,
        title: 'Be, Have & Present Simple',
        subtitle: 'A1 Sentence Foundations',
        description: 'Build the first correct sentences: be, have, there is/are, can, and present simple statements, questions and negatives.',
        cefrLevel: 'A1',
        routeTarget: 'grammar',
        prerequisites: [],
        masteryThreshold: 80,
        x: 12,
        y: 80
      },
      {
        id: 'gram-a2',
        branchId: 'grammar',
        level: 2,
        title: 'Past, Future & Comparison',
        subtitle: 'A2 Essential Tenses',
        description: 'Talk about yesterday, plans and differences: past simple, going to/will, comparatives, superlatives and basic modals.',
        cefrLevel: 'A2',
        routeTarget: 'grammar',
        prerequisites: ['gram-a1'],
        masteryThreshold: 80,
        x: 12,
        y: 71
      },
      {
        id: 'gram-b1',
        branchId: 'grammar',
        level: 3,
        title: 'Perfect, Conditionals & Passive',
        subtitle: 'B1 Core Structures',
        description: 'Connect time and cause: present perfect, first and second conditionals, passive voice and reported speech.',
        cefrLevel: 'B1',
        routeTarget: 'grammar',
        prerequisites: ['gram-a2'],
        masteryThreshold: 80,
        x: 12,
        y: 61
      },
      {
        id: 'gram-1',
        branchId: 'grammar',
        level: 4,
        title: 'Core Fronting & Topicalization',
        subtitle: 'Adverbial & Prepositional Fronting',
        description: 'Establish rhetorical emphasis by fronting spatial and temporal phrases before the main clause.',
        cefrLevel: 'B2',
        routeTarget: 'grammar',
        prerequisites: ['gram-b1'],
        masteryThreshold: 80,
        x: 12,
        y: 52
      },
      {
        id: 'gram-2',
        branchId: 'grammar',
        level: 5,
        title: 'Negative Inversion (Seldom / Rarely)',
        subtitle: 'Frequency Negative Fronting',
        description: 'Execute auxiliary inversion following negative frequency adverbs (Seldom have I seen, Rarely did they).',
        cefrLevel: 'C1',
        routeTarget: 'grammar',
        prerequisites: ['gram-1'],
        masteryThreshold: 80,
        x: 14,
        y: 43
      },
      {
        id: 'gram-3',
        branchId: 'grammar',
        level: 6,
        title: 'Restrictive Inversion (Only after / Not until)',
        subtitle: 'Time & Condition Restriction',
        description: 'Master delayed subject-auxiliary inversion where the second clause carries inverted order.',
        cefrLevel: 'C1',
        routeTarget: 'grammar',
        prerequisites: ['gram-2'],
        masteryThreshold: 80,
        x: 18,
        y: 34
      },
      {
        id: 'gram-4',
        branchId: 'grammar',
        level: 7,
        title: 'Hypothetical Inversion (Had we / Were you)',
        subtitle: 'Subjunctive Conditional Omission',
        description: 'Drop the conditional "if" and initiate direct inversion (Had we known / Were you to consider).',
        cefrLevel: 'C2',
        routeTarget: 'grammar',
        prerequisites: ['gram-3'],
        masteryThreshold: 80,
        x: 23,
        y: 24
      },
      {
        id: 'gram-5',
        branchId: 'grammar',
        level: 8,
        title: 'Master C2 Stylistic Condensation',
        subtitle: 'Absolute Clauses & Asymmetric Balance',
        description: 'Compress compound thought into high-impact periodic and participial structures with native cadence.',
        cefrLevel: 'C2',
        routeTarget: 'grammar',
        prerequisites: ['gram-4'],
        masteryThreshold: 80,
        x: 30,
        y: 15
      }
    ]
  },
  collocations: {
    id: 'collocations',
    name: 'Lexical Precision',
    tagline: 'High-Frequency Collocations & Hubs',
    color: '#5b5bd6',
    routeTarget: 'colloc',
    nodes: [
      {
        id: 'col-a1',
        branchId: 'collocations',
        level: 1,
        title: 'Everyday Basics',
        subtitle: 'A1 Core Collocations',
        description: 'Learn the word pairs of daily life: have breakfast, go to school, take a shower, a cup of tea.',
        cefrLevel: 'A1',
        routeTarget: 'colloc',
        prerequisites: [],
        masteryThreshold: 80,
        x: 30,
        y: 80
      },
      {
        id: 'col-a2',
        branchId: 'collocations',
        level: 2,
        title: 'Shopping, Travel & Health',
        subtitle: 'A2 Practical Collocations',
        description: 'Handle real situations: book a table, miss the bus, catch a cold, pay by card.',
        cefrLevel: 'A2',
        routeTarget: 'colloc',
        prerequisites: ['col-a1'],
        masteryThreshold: 80,
        x: 30,
        y: 71
      },
      {
        id: 'col-b1',
        branchId: 'collocations',
        level: 3,
        title: 'Opinions, Work & News',
        subtitle: 'B1 Expressive Collocations',
        description: 'Express views and experiences: raise awareness, meet a deadline, reach an agreement, under pressure.',
        cefrLevel: 'B1',
        routeTarget: 'colloc',
        prerequisites: ['col-a2'],
        masteryThreshold: 80,
        x: 30,
        y: 61
      },
      {
        id: 'col-1',
        branchId: 'collocations',
        level: 4,
        title: 'Core Action Verb Hubs',
        subtitle: 'Make, Do, Take, Have, Give',
        description: 'Deconstruct de-lexical verbs and their natural noun partners with zero unnatural literal translation.',
        cefrLevel: 'B2',
        routeTarget: 'colloc',
        prerequisites: ['col-b1'],
        masteryThreshold: 80,
        x: 30,
        y: 52
      },
      {
        id: 'col-2',
        branchId: 'collocations',
        level: 5,
        title: 'Business & Legal Collocations',
        subtitle: 'Corporate Negotiations & Contracts',
        description: 'Broach a subject, reach consensus, settle disputes, execute covenants, and terminate liabilities.',
        cefrLevel: 'C1',
        routeTarget: 'colloc',
        prerequisites: ['col-1'],
        masteryThreshold: 80,
        x: 32,
        y: 43
      },
      {
        id: 'col-3',
        branchId: 'collocations',
        level: 6,
        title: 'Academic & Research Collocations',
        subtitle: 'Empirical Discourse & Analysis',
        description: 'Lend credence, cast doubt, corroborate findings, elucidate principles, and refute assertions.',
        cefrLevel: 'C1',
        routeTarget: 'colloc',
        prerequisites: ['col-2'],
        masteryThreshold: 80,
        x: 35,
        y: 34
      },
      {
        id: 'col-4',
        branchId: 'collocations',
        level: 7,
        title: 'Prepositional Finesse',
        subtitle: 'Pertain to, Bear on, Incur on',
        description: 'Eliminate L1 preposition errors and employ nuanced prepositional combinations instinctively.',
        cefrLevel: 'C2',
        routeTarget: 'colloc',
        prerequisites: ['col-3'],
        masteryThreshold: 80,
        x: 38,
        y: 24
      },
      {
        id: 'col-5',
        branchId: 'collocations',
        level: 8,
        title: 'High Idiomatic & Stylistic Nuance',
        subtitle: 'Sophisticated Conversational Metaphor',
        description: 'Command the full collocation vault with native lexical selection, nuance, and effortless retrieval speed.',
        cefrLevel: 'C2',
        routeTarget: 'colloc',
        prerequisites: ['col-4'],
        masteryThreshold: 80,
        x: 42,
        y: 15
      }
    ]
  },
  writing: {
    id: 'writing',
    name: 'Rhetoric & Franklin Copywork',
    tagline: 'Deliberate Reconstruction & Clausal Cadence',
    color: '#5b5bd6',
    routeTarget: 'write',
    nodes: [
      {
        id: 'wri-a1',
        branchId: 'writing',
        level: 1,
        title: 'Four-Sentence Paragraph',
        subtitle: 'A1 First Writing',
        description: 'Write four correct sentences about yourself, your family and your day.',
        cefrLevel: 'A1',
        routeTarget: 'write',
        prerequisites: [],
        masteryThreshold: 80,
        x: 50,
        y: 80
      },
      {
        id: 'wri-a2',
        branchId: 'writing',
        level: 2,
        title: 'Six-Sentence Paragraph',
        subtitle: 'A2 Short Paragraphs',
        description: 'Write a short paragraph with past and future time and simple linking words.',
        cefrLevel: 'A2',
        routeTarget: 'write',
        prerequisites: ['wri-a1'],
        masteryThreshold: 80,
        x: 50,
        y: 71
      },
      {
        id: 'wri-b1',
        branchId: 'writing',
        level: 3,
        title: 'Eight-Sentence Paragraph',
        subtitle: 'B1 Linked Paragraphs',
        description: 'Write an opinion or experience paragraph with reasons, examples and linkers.',
        cefrLevel: 'B1',
        routeTarget: 'write',
        prerequisites: ['wri-a2'],
        masteryThreshold: 80,
        x: 50,
        y: 61
      },
      {
        id: 'wri-1',
        branchId: 'writing',
        level: 4,
        title: 'SVO Clarity & Clausal Balance',
        subtitle: 'Syntactic Anchoring & Cohesion',
        description: 'Construct unambiguous subject-verb-object spines that guide the reader through complex prose.',
        cefrLevel: 'B2',
        routeTarget: 'write',
        prerequisites: ['wri-b1'],
        masteryThreshold: 80,
        x: 50,
        y: 52
      },
      {
        id: 'wri-2',
        branchId: 'writing',
        level: 5,
        title: 'Periodic Sentences & Suspense',
        subtitle: 'Delayed Main Predicate Design',
        description: 'Hold the reader in intellectual suspense by placing dependent modifiers before the primary predicate.',
        cefrLevel: 'C1',
        routeTarget: 'write',
        prerequisites: ['wri-1'],
        masteryThreshold: 80,
        x: 50,
        y: 43
      },
      {
        id: 'wri-3',
        branchId: 'writing',
        level: 6,
        title: 'Franklin Antithesis & Parallelism',
        subtitle: 'Rhetorical Symmetry & Inversion',
        description: 'Reconstruct Benjamin Franklin and Samuel Johnson essays, balancing contrary thoughts in parallel clauses.',
        cefrLevel: 'C1',
        routeTarget: 'write',
        prerequisites: ['wri-2'],
        masteryThreshold: 80,
        x: 50,
        y: 34
      },
      {
        id: 'wri-4',
        branchId: 'writing',
        level: 7,
        title: 'MEAL Argument Architecture',
        subtitle: 'Main claim, Evidence, Analysis, Link',
        description: 'Draft paragraphs where analytical synthesis outshines descriptive summary with unyielding logic.',
        cefrLevel: 'C2',
        routeTarget: 'write',
        prerequisites: ['wri-3'],
        masteryThreshold: 80,
        x: 50,
        y: 24
      },
      {
        id: 'wri-5',
        branchId: 'writing',
        level: 8,
        title: 'Forensic C2 Essay Synthesis',
        subtitle: 'Authoritative Prose & Rhythmic Flow',
        description: 'Produce polished essays exhibiting varied cadence, rhetorical power, and zero syntactic hesitation.',
        cefrLevel: 'C2',
        routeTarget: 'write',
        prerequisites: ['wri-4'],
        masteryThreshold: 80,
        x: 50,
        y: 15
      }
    ]
  },
  speaking: {
    id: 'speaking',
    name: 'Prosody & Spontaneous Fluency',
    tagline: 'Nation 4-3-2 Compression & Stress Timbre',
    color: '#5b5bd6',
    routeTarget: 'speak',
    nodes: [
      {
        id: 'spk-a1',
        branchId: 'speaking',
        level: 1,
        title: 'Short Talks (30 seconds)',
        subtitle: 'A1 First Speaking',
        description: 'Introduce yourself and describe your family, home and routine in simple sentences.',
        cefrLevel: 'A1',
        routeTarget: 'speak',
        prerequisites: [],
        masteryThreshold: 80,
        x: 70,
        y: 80
      },
      {
        id: 'spk-a2',
        branchId: 'speaking',
        level: 2,
        title: 'Short Talks (60 seconds)',
        subtitle: 'A2 Everyday Speaking',
        description: 'Describe a trip, a weekend or your plans, with past and future time.',
        cefrLevel: 'A2',
        routeTarget: 'speak',
        prerequisites: ['spk-a1'],
        masteryThreshold: 80,
        x: 70,
        y: 71
      },
      {
        id: 'spk-b1',
        branchId: 'speaking',
        level: 3,
        title: 'Opinion Talks (90 seconds)',
        subtitle: 'B1 Opinion Speaking',
        description: 'Give an opinion with reasons, tell an experience, and compare options.',
        cefrLevel: 'B1',
        routeTarget: 'speak',
        prerequisites: ['spk-a2'],
        masteryThreshold: 80,
        x: 70,
        y: 61
      },
      {
        id: 'spk-1',
        branchId: 'speaking',
        level: 4,
        title: 'Nuclear Tonic Stress & Pitch Accent',
        subtitle: 'Information Focus & Intonation Spikes',
        description: 'Identify the tonic syllable and pitch step-down to communicate intentional information hierarchy.',
        cefrLevel: 'B2',
        routeTarget: 'speak',
        prerequisites: ['spk-b1'],
        masteryThreshold: 80,
        x: 70,
        y: 52
      },
      {
        id: 'spk-2',
        branchId: 'speaking',
        level: 5,
        title: 'Connected Speech & Catenation',
        subtitle: 'Liaison, Elision & Assimilation',
        description: 'Link final consonants to initial vowels and weaken functional words to achieve natural English rhythm.',
        cefrLevel: 'C1',
        routeTarget: 'speak',
        prerequisites: ['spk-1'],
        masteryThreshold: 80,
        x: 68,
        y: 43
      },
      {
        id: 'spk-3',
        branchId: 'speaking',
        level: 6,
        title: 'Nation 4-3-2 Fluency Sprint',
        subtitle: 'Time Pressure Speed Drills',
        description: 'Deliver the same speech in 4 minutes, then 3, then 2, shedding filler words and accelerating retrieval.',
        cefrLevel: 'C1',
        routeTarget: 'speak',
        prerequisites: ['spk-2'],
        masteryThreshold: 80,
        x: 65,
        y: 34
      },
      {
        id: 'spk-4',
        branchId: 'speaking',
        level: 7,
        title: 'Collocation Injection Under Pressure',
        subtitle: 'Real-Time Lexical Integration',
        description: 'Inject 4 high-level collocations into spontaneous speech without stalling or breaking vocal tone.',
        cefrLevel: 'C2',
        routeTarget: 'speak',
        prerequisites: ['spk-3'],
        masteryThreshold: 80,
        x: 62,
        y: 24
      },
      {
        id: 'spk-5',
        branchId: 'speaking',
        level: 8,
        title: 'Unrehearsed C2 Debate Rhetoric',
        subtitle: 'Persuasive Extemporaneous Speaking',
        description: 'Defend sophisticated theses in live discourse with melodic intonation and authoritative presence.',
        cefrLevel: 'C2',
        routeTarget: 'speak',
        prerequisites: ['spk-4'],
        masteryThreshold: 80,
        x: 58,
        y: 15
      }
    ]
  },
  reading: {
    id: 'reading',
    name: 'Epistemic Deconstruction',
    tagline: 'Hermeneutic Analysis & Syntactic Mining',
    color: '#5b5bd6',
    routeTarget: 'read',
    nodes: [
      {
        id: 'read-a1',
        branchId: 'reading',
        level: 1,
        title: 'Simple Present Texts',
        subtitle: 'A1 First Reading',
        description: 'Read short texts of about 100 words about daily life.',
        cefrLevel: 'A1',
        routeTarget: 'read',
        prerequisites: [],
        masteryThreshold: 80,
        x: 88,
        y: 80
      },
      {
        id: 'read-a2',
        branchId: 'reading',
        level: 2,
        title: 'Short Stories & Advice',
        subtitle: 'A2 Everyday Reading',
        description: 'Read short stories and advice texts of about 170 words.',
        cefrLevel: 'A2',
        routeTarget: 'read',
        prerequisites: ['read-a1'],
        masteryThreshold: 80,
        x: 88,
        y: 71
      },
      {
        id: 'read-b1',
        branchId: 'reading',
        level: 3,
        title: 'Opinion & Explanation Texts',
        subtitle: 'B1 Connected Reading',
        description: 'Read texts of about 235 words that explain ideas and give opinions.',
        cefrLevel: 'B1',
        routeTarget: 'read',
        prerequisites: ['read-a2'],
        masteryThreshold: 80,
        x: 88,
        y: 61
      },
      {
        id: 'read-1',
        branchId: 'reading',
        level: 4,
        title: 'Rapid Gist & Thesis Skeleton',
        subtitle: '60-Second Cognitive Reconnaissance',
        description: 'Map the core argument and structural milestones before deep-dive syntactic reading begins.',
        cefrLevel: 'B2',
        routeTarget: 'read',
        prerequisites: ['read-b1'],
        masteryThreshold: 80,
        x: 88,
        y: 52
      },
      {
        id: 'read-2',
        branchId: 'reading',
        level: 5,
        title: 'Lexical Target Extraction',
        subtitle: 'In-Context Vocabulary Mining',
        description: 'Identify specialized academic vocabulary and deduce nuanced definitions directly from context.',
        cefrLevel: 'C1',
        routeTarget: 'read',
        prerequisites: ['read-1'],
        masteryThreshold: 80,
        x: 86,
        y: 43
      },
      {
        id: 'read-3',
        branchId: 'reading',
        level: 6,
        title: 'Syntactic Reverse-Engineering',
        subtitle: 'Deconstructing Dense Inversions & Clefts',
        description: 'Parse multi-clause academic sentences and uncover how master authors vary clausal velocity.',
        cefrLevel: 'C1',
        routeTarget: 'read',
        prerequisites: ['read-2'],
        masteryThreshold: 80,
        x: 82,
        y: 34
      },
      {
        id: 'read-4',
        branchId: 'reading',
        level: 7,
        title: 'Rhetorical Intent & Subtext Biases',
        subtitle: 'Understated Irony & Implicit Premises',
        description: 'Detect subtle authorial tone, hedge phrases, concessive arguments, and rhetorical posturing.',
        cefrLevel: 'C2',
        routeTarget: 'read',
        prerequisites: ['read-3'],
        masteryThreshold: 80,
        x: 77,
        y: 24
      },
      {
        id: 'read-5',
        branchId: 'reading',
        level: 8,
        title: 'Hermeneutic C2 Synthesis',
        subtitle: 'Critical Dialectical Mastery',
        description: 'Synthesize opposing viewpoints across diverse philosophical and scientific treatises effortlessly.',
        cefrLevel: 'C2',
        routeTarget: 'read',
        prerequisites: ['read-4'],
        masteryThreshold: 80,
        x: 70,
        y: 15
      }
    ]
  }
};
