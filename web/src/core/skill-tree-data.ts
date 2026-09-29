import { RouteId } from './router';

export type BranchId = 'grammar' | 'collocations' | 'writing' | 'speaking' | 'reading';

export interface SkillNode {
  id: string;
  branchId: BranchId;
  level: number; // 1 to 5
  title: string;
  subtitle: string;
  description: string;
  cefrLevel: 'B2' | 'C1' | 'C2';
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
    color: '#ca8a04',
    routeTarget: 'grammar',
    nodes: [
      {
        id: 'gram-1',
        branchId: 'grammar',
        level: 1,
        title: 'Core Fronting & Topicalization',
        subtitle: 'Adverbial & Prepositional Fronting',
        description: 'Establish rhetorical emphasis by fronting spatial and temporal phrases before the main clause.',
        cefrLevel: 'B2',
        routeTarget: 'grammar',
        prerequisites: [],
        masteryThreshold: 80,
        x: 12,
        y: 80
      },
      {
        id: 'gram-2',
        branchId: 'grammar',
        level: 2,
        title: 'Negative Inversion (Seldom / Rarely)',
        subtitle: 'Frequency Negative Fronting',
        description: 'Execute auxiliary inversion following negative frequency adverbs (Seldom have I seen, Rarely did they).',
        cefrLevel: 'C1',
        routeTarget: 'grammar',
        prerequisites: ['gram-1'],
        masteryThreshold: 80,
        x: 14,
        y: 64
      },
      {
        id: 'gram-3',
        branchId: 'grammar',
        level: 3,
        title: 'Restrictive Inversion (Only after / Not until)',
        subtitle: 'Time & Condition Restriction',
        description: 'Master delayed subject-auxiliary inversion where the second clause carries inverted order.',
        cefrLevel: 'C1',
        routeTarget: 'grammar',
        prerequisites: ['gram-2'],
        masteryThreshold: 80,
        x: 18,
        y: 48
      },
      {
        id: 'gram-4',
        branchId: 'grammar',
        level: 4,
        title: 'Hypothetical Inversion (Had we / Were you)',
        subtitle: 'Subjunctive Conditional Omission',
        description: 'Drop the conditional "if" and initiate direct inversion (Had we known / Were you to consider).',
        cefrLevel: 'C2',
        routeTarget: 'grammar',
        prerequisites: ['gram-3'],
        masteryThreshold: 80,
        x: 23,
        y: 32
      },
      {
        id: 'gram-5',
        branchId: 'grammar',
        level: 5,
        title: 'Master C2 Stylistic Condensation',
        subtitle: 'Absolute Clauses & Asymmetric Balance',
        description: 'Compress compound thought into high-impact periodic and participial structures with native cadence.',
        cefrLevel: 'C2',
        routeTarget: 'grammar',
        prerequisites: ['gram-4'],
        masteryThreshold: 80,
        x: 30,
        y: 16
      }
    ]
  },
  collocations: {
    id: 'collocations',
    name: 'Lexical Precision',
    tagline: '1,000 High-Frequency Collocations & Hubs',
    color: '#ca8a04',
    routeTarget: 'colloc',
    nodes: [
      {
        id: 'col-1',
        branchId: 'collocations',
        level: 1,
        title: 'Core Action Verb Hubs',
        subtitle: 'Make, Do, Take, Have, Give',
        description: 'Deconstruct de-lexical verbs and their natural noun partners with zero unnatural literal translation.',
        cefrLevel: 'B2',
        routeTarget: 'colloc',
        prerequisites: [],
        masteryThreshold: 80,
        x: 30,
        y: 82
      },
      {
        id: 'col-2',
        branchId: 'collocations',
        level: 2,
        title: 'Business & Legal Collocations',
        subtitle: 'Corporate Negotiations & Contracts',
        description: 'Broach a subject, reach consensus, settle disputes, execute covenants, and terminate liabilities.',
        cefrLevel: 'C1',
        routeTarget: 'colloc',
        prerequisites: ['col-1'],
        masteryThreshold: 80,
        x: 32,
        y: 65
      },
      {
        id: 'col-3',
        branchId: 'collocations',
        level: 3,
        title: 'Academic & Research Collocations',
        subtitle: 'Empirical Discourse & Analysis',
        description: 'Lend credence, cast doubt, corroborate findings, elucidate principles, and refute assertions.',
        cefrLevel: 'C1',
        routeTarget: 'colloc',
        prerequisites: ['col-2'],
        masteryThreshold: 80,
        x: 35,
        y: 49
      },
      {
        id: 'col-4',
        branchId: 'collocations',
        level: 4,
        title: 'Prepositional Finesse',
        subtitle: 'Pertain to, Bear on, Incur on',
        description: 'Eliminate L1 preposition errors and employ nuanced prepositional combinations instinctively.',
        cefrLevel: 'C2',
        routeTarget: 'colloc',
        prerequisites: ['col-3'],
        masteryThreshold: 80,
        x: 38,
        y: 33
      },
      {
        id: 'col-5',
        branchId: 'collocations',
        level: 5,
        title: 'High Idiomatic & Stylistic Nuance',
        subtitle: 'Sophisticated Conversational Metaphor',
        description: 'Command 1,000 collocations with native lexical selection, nuance, and effortless retrieval speed.',
        cefrLevel: 'C2',
        routeTarget: 'colloc',
        prerequisites: ['col-4'],
        masteryThreshold: 80,
        x: 42,
        y: 17
      }
    ]
  },
  writing: {
    id: 'writing',
    name: 'Rhetoric & Franklin Copywork',
    tagline: 'Deliberate Reconstruction & Clausal Cadence',
    color: '#ca8a04',
    routeTarget: 'write',
    nodes: [
      {
        id: 'wri-1',
        branchId: 'writing',
        level: 1,
        title: 'SVO Clarity & Clausal Balance',
        subtitle: 'Syntactic Anchoring & Cohesion',
        description: 'Construct unambiguous subject-verb-object spines that guide the reader through complex prose.',
        cefrLevel: 'B2',
        routeTarget: 'write',
        prerequisites: [],
        masteryThreshold: 80,
        x: 50,
        y: 84
      },
      {
        id: 'wri-2',
        branchId: 'writing',
        level: 2,
        title: 'Periodic Sentences & Suspense',
        subtitle: 'Delayed Main Predicate Design',
        description: 'Hold the reader in intellectual suspense by placing dependent modifiers before the primary predicate.',
        cefrLevel: 'C1',
        routeTarget: 'write',
        prerequisites: ['wri-1'],
        masteryThreshold: 80,
        x: 50,
        y: 66
      },
      {
        id: 'wri-3',
        branchId: 'writing',
        level: 3,
        title: 'Franklin Antithesis & Parallelism',
        subtitle: 'Rhetorical Symmetry & Inversion',
        description: 'Reconstruct Benjamin Franklin and Samuel Johnson essays, balancing contrary thoughts in parallel clauses.',
        cefrLevel: 'C1',
        routeTarget: 'write',
        prerequisites: ['wri-2'],
        masteryThreshold: 80,
        x: 50,
        y: 50
      },
      {
        id: 'wri-4',
        branchId: 'writing',
        level: 4,
        title: 'MEAL Argument Architecture',
        subtitle: 'Main claim, Evidence, Analysis, Link',
        description: 'Draft paragraphs where analytical synthesis outshines descriptive summary with unyielding logic.',
        cefrLevel: 'C2',
        routeTarget: 'write',
        prerequisites: ['wri-3'],
        masteryThreshold: 80,
        x: 50,
        y: 34
      },
      {
        id: 'wri-5',
        branchId: 'writing',
        level: 5,
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
    color: '#ca8a04',
    routeTarget: 'speak',
    nodes: [
      {
        id: 'spk-1',
        branchId: 'speaking',
        level: 1,
        title: 'Nuclear Tonic Stress & Pitch Accent',
        subtitle: 'Information Focus & Intonation Spikes',
        description: 'Identify the tonic syllable and pitch step-down to communicate intentional information hierarchy.',
        cefrLevel: 'B2',
        routeTarget: 'speak',
        prerequisites: [],
        masteryThreshold: 80,
        x: 70,
        y: 82
      },
      {
        id: 'spk-2',
        branchId: 'speaking',
        level: 2,
        title: 'Connected Speech & Catenation',
        subtitle: 'Liaison, Elision & Assimilation',
        description: 'Link final consonants to initial vowels and weaken functional words to achieve natural English rhythm.',
        cefrLevel: 'C1',
        routeTarget: 'speak',
        prerequisites: ['spk-1'],
        masteryThreshold: 80,
        x: 68,
        y: 65
      },
      {
        id: 'spk-3',
        branchId: 'speaking',
        level: 3,
        title: 'Nation 4-3-2 Fluency Sprint',
        subtitle: 'Time Pressure Speed Drills',
        description: 'Deliver the same speech in 4 minutes, then 3, then 2, shedding filler words and accelerating retrieval.',
        cefrLevel: 'C1',
        routeTarget: 'speak',
        prerequisites: ['spk-2'],
        masteryThreshold: 80,
        x: 65,
        y: 49
      },
      {
        id: 'spk-4',
        branchId: 'speaking',
        level: 4,
        title: 'Collocation Injection Under Pressure',
        subtitle: 'Real-Time Lexical Integration',
        description: 'Inject 4 high-level collocations into spontaneous speech without stalling or breaking vocal tone.',
        cefrLevel: 'C2',
        routeTarget: 'speak',
        prerequisites: ['spk-3'],
        masteryThreshold: 80,
        x: 62,
        y: 33
      },
      {
        id: 'spk-5',
        branchId: 'speaking',
        level: 5,
        title: 'Unrehearsed C2 Debate Rhetoric',
        subtitle: 'Persuasive Extemporaneous Speaking',
        description: 'Defend sophisticated theses in live discourse with melodic intonation and authoritative presence.',
        cefrLevel: 'C2',
        routeTarget: 'speak',
        prerequisites: ['spk-4'],
        masteryThreshold: 80,
        x: 58,
        y: 17
      }
    ]
  },
  reading: {
    id: 'reading',
    name: 'Epistemic Deconstruction',
    tagline: 'Hermeneutic Analysis & Syntactic Mining',
    color: '#ca8a04',
    routeTarget: 'read',
    nodes: [
      {
        id: 'read-1',
        branchId: 'reading',
        level: 1,
        title: 'Rapid Gist & Thesis Skeleton',
        subtitle: '60-Second Cognitive Reconnaissance',
        description: 'Map the core argument and structural milestones before deep-dive syntactic reading begins.',
        cefrLevel: 'B2',
        routeTarget: 'read',
        prerequisites: [],
        masteryThreshold: 80,
        x: 88,
        y: 80
      },
      {
        id: 'read-2',
        branchId: 'reading',
        level: 2,
        title: 'Lexical Target Extraction',
        subtitle: 'In-Context Vocabulary Mining',
        description: 'Identify specialized academic vocabulary and deduce nuanced definitions directly from context.',
        cefrLevel: 'C1',
        routeTarget: 'read',
        prerequisites: ['read-1'],
        masteryThreshold: 80,
        x: 86,
        y: 64
      },
      {
        id: 'read-3',
        branchId: 'reading',
        level: 3,
        title: 'Syntactic Reverse-Engineering',
        subtitle: 'Deconstructing Dense Inversions & Clefts',
        description: 'Parse multi-clause academic sentences and uncover how master authors vary clausal velocity.',
        cefrLevel: 'C1',
        routeTarget: 'read',
        prerequisites: ['read-2'],
        masteryThreshold: 80,
        x: 82,
        y: 48
      },
      {
        id: 'read-4',
        branchId: 'reading',
        level: 4,
        title: 'Rhetorical Intent & Subtext Biases',
        subtitle: 'Understated Irony & Implicit Premises',
        description: 'Detect subtle authorial tone, hedge phrases, concessive arguments, and rhetorical posturing.',
        cefrLevel: 'C2',
        routeTarget: 'read',
        prerequisites: ['read-3'],
        masteryThreshold: 80,
        x: 77,
        y: 32
      },
      {
        id: 'read-5',
        branchId: 'reading',
        level: 5,
        title: 'Hermeneutic C2 Synthesis',
        subtitle: 'Critical Dialectical Mastery',
        description: 'Synthesize opposing viewpoints across diverse philosophical and scientific treatises effortlessly.',
        cefrLevel: 'C2',
        routeTarget: 'read',
        prerequisites: ['read-4'],
        masteryThreshold: 80,
        x: 70,
        y: 16
      }
    ]
  }
};
