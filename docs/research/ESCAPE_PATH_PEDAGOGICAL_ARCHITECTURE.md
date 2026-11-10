# The Escape Path: Pedagogical & Cognitive Architecture
## Deprogramming Vietnamese Exam Habits into Spontaneous Autonomous English Acquisition

**Architectural Specification & Pedagogical Research Blueprint**  
*English Singularity & IELTS Academic Platform*  
*November 2026*

---

## Executive Abstract

For over three decades, English language pedagogy in Vietnam has been trapped in an institutional washback loop. The convergence of high-stakes multiple-choice testing (THPT, University Entrance, VNU-ĐGNL) and commercial test-prep cram factories (*lò luyện thi* IELTS/TOEIC) has conditioned learners to approach English as a static, decontextualized cryptographic code. 

The resulting cognitive pathology is characterized by:
1. **The Dual-Translation Relay:** A compulsive mental loop that constructs propositions in Vietnamese syntax and performs word-by-word lexical substitution, inducing a 1,500ms–3,000ms retrieval latency and catastrophic communicative mutism.
2. **Interlanguage Fossilization:** Systematic negative L1 transfer arising from typological clashes between an isolating, tonal, topic-prominent language (Vietnamese) and a stress-timed, subject-prominent language (English).
3. **"Học Vẹt" Rhetorical Atrophy:** An addiction to bloated, formulaic cram-school templates (*"plays an indispensable role in"*, *"every coin has two sides"*, *"in this day and age"*) that simulate fluency while crippling genuine communicative competence and critical epistemic agility.

**The Escape Path** is a cognitive-orthopedic pedagogical and software architecture designed to systematically deprogram these fossilized exam habits. By transitioning learners from open-choice lexical assembly to formulaic chunk processing, providing contrastive anti-calque debiasing, and enforcing timed active reconstruction across a 4-stage progression (**Deconstruction $\to$ Scaffolding $\to$ Constrained Reconstruction $\to$ Spontaneous Production**), this framework enables autonomous, native-paced English acquisition within an offline-first TypeScript application.

---

# Part I: Deprogramming the Vietnamese Translation Bottleneck

```
                             COMMUNICATIVE INTENT
                                      │
           ┌──────────────────────────┴──────────────────────────┐
           ▼                                                     ▼
   [PATHOLOGICAL RELAY]                                  [THE ESCAPE PATH]
Vietnamese Conceptualizer                              Non-Verbal Concept / Goal
           │                                                     │
           ▼                                                     ▼
 Vietnamese Syntax Frame                                Direct Formulaic Retrieval
 ("Ở VN có nhiều xe...")                                [ There is / There are ]
           │                                                     │
           ▼                                                     ▼
Word-by-Word Translation                               Lexical Chunk Snapping
 "In VN" + "have" + "many"                             [ there is a surge in ] +
           │                                           [ two-wheeled transport ]
           ▼                                                     │
   L1 Syntactic Calque                                           ▼
*"In Vietnam have many..."*                             Direct Surface Realization
 [Latency: 2,500ms | Crash]                             [Latency: 350ms | Fluent]
```

### 1.1 The Dual-Translation Relay & Neurocognitive Mechanics

Under Willem Levelt's canonical model of speech production (*Speaking: From Intention to Articulation*, 1989), fluent language generation operates through three tightly synchronized autonomous components:
1. **The Conceptualizer:** Generates pre-verbal communicative intentions and conceptual propositions.
2. **The Formulator:** Translates conceptual structures into linguistic form via:
   - *Grammatical Encoding:* Lemma retrieval and syntactic frame creation.
   - *Phonological Encoding:* Prosodic packaging and phonetic plan generation.
3. **The Articulator:** Executes the motor program to produce acoustic speech.

In native or highly proficient bilingual speakers, the transfer between the Conceptualizer and Formulator takes **200 to 400 milliseconds**.

#### The Vietnamese Interlanguage Disruption
In Vietnamese exam-conditioned learners, the Formulator is infected with an invasive L1 mediation loop:
1. The **Conceptualizer** outputs a proposition, but instead of accessing L2 conceptual lemmas, it fires Vietnamese conceptual lemmas (*L1 Conceptual Activation*).
2. The learner builds a **Vietnamese syntactic blueprint** governed by Vietnamese typological grammar (Topic-Comment order, zero-copula, uninflected verbal particles).
3. The learner initiates a sequential, word-by-word **bilingual dictionary lookup** (*Lexical Substitution Relay*).
4. The learner attempts to reconcile Vietnamese syntax with English rules (e.g., retroactively attempting to insert prepositions, articles, or tense inflections).

```
Levelt's Pipeline:      [Concept] ───────► [L2 Formulator] ───────► [Articulator] (300ms)

Vietnamese Relay:       [Concept] ──► [L1 Lemma Frame] ──► [Word Translation] ──► [L2 Patching] ──► [Articulator] (2500ms)
                                             ▲                                         │
                                             └──────── Failure & Panic Loop ───────────┘
```

#### Chronometric Breakdown of Cognitive Latency
- **Direct Native Path:** $250\text{ ms} \pm 50\text{ ms}$.
- **Vietnamese Relay Path:**
  - Vietnamese sentence construction: $\approx 600\text{ ms}$
  - Lemma-by-lemma bilingual translation (4–7 words): $\approx 1,200\text{ ms}$
  - Structural error check & editing anxiety: $\approx 800\text{ ms}$
  - **Total Latency: 2,600ms.**

When real-time conversation or timed writing demands immediate output, this 2.6-second delay overruns the **phonological loop buffer** (Baddeley's Working Memory Model). The learner experiences cognitive freeze, elevated affective filter (Krashen), and abrupt communicative breakdown.

---

### 1.2 Transitioning from Lexical to Conceptual/Chunk-Level Processing

To deprogram this latency, the brain must be shifted from John Sinclair’s **Open-Choice Principle** to the **Idiom Principle**:
- **The Open-Choice Principle (The Cram School Pathology):** The belief that language production consists of choosing grammatical slots and filling each slot independently with single vocabulary words from a bilingual dictionary. Vietnamese high school instruction trains this exclusively through gap-fills and multiple-choice tests.
- **The Idiom Principle (The Native Reality):** Language users have available a semi-preconstructed phraseological stock of multi-word lexical chunks, formulaic sequences, and colligations that are retrieved and decoded as single cognitive units (Pawley & Syder, 1983; Nattinger & DeCarrico, 1992; Schmitt, 2004).

#### Cognitive Mechanisms of Chunk Acquisition
1. **Perceptual Unit Expansion:** Rather than storing single words (`indispensable`, `role`, `play`, `in`), the mental lexicon stores the unified collocational frame: `[ play a vital role in NP/V-ing ]` or better: `[ is pivotal to NP ]`.
2. **Slot-and-Frame Processing:** Chunks possess fixed anchors and open slots:
   - `[ It is widely recognized that [X] ]`
   - `[ [X] stems largely from [Y] ]`
   - `[ Rather than [V-ing], [Agent] opted to [Base Verb] ]`
3. **Suppression of Intermediate L1 Encoding:** Because multi-word chunks carry their own intrinsic syntax, articles, and prepositions, the learner does not need to compute English grammar on the fly. Syntax is pre-packaged within the chunk.

---

### 1.3 Contrastive Analysis & Anti-Calque Debiasing

L1 negative transfer is not random; it is the predictable projection of Vietnamese typological structures onto English. The Escape Path deploys **Contrastive Invalidation Drills** that deliberately engineer *predictive failure* (Rescorla-Wagner associative learning) to alert the learner's brain to the transfer before articulation occurs.

#### The 8 Critical Vietnamese $\to$ English Typological Clashes

| # | Transfer Phenomenon | Vietnamese Root Cause | Spurious Calque | Authentic Native English | Cognitive Invalidation Trigger |
|---|---------------------|-----------------------|-----------------|--------------------------|--------------------------------|
| **1** | **Existential "Have"** | *Có* denotes both possession (*tôi có tiền*) and existence (*ở đây có rạp chiếu phim*). Topic-prominent grammar. | *"In my university has many international students."* | *"There are many international students at my university."* | *"Places cannot possess entities. English requires dummy 'There is/are'."* |
| **2** | **Zero Copula with Adjectives** | Adjectives (*tính từ*) act directly as stative predicative verbs without linking verbs (*Cô ấy đẹp*). | *"The methodology very effective."* / *"She agree with me."* | *"The methodology is highly effective."* / *"She agrees with me."* | *"English adjectives cannot predicate an action; they demand a copular verb."* |
| **3** | **Dual Conjunction Correlatives** | Paired correlative conjunctions balance topic and comment clauses (*Mặc dù... nhưng...*, *Vì... cho nên...*). | *"Although the protocol was tested, but errors occurred."* | *"Although the protocol was tested, errors occurred."* | *"Subordination rule: One causal relationship = One conjunction only."* |
| **4** | **Uninflected Tense/Aspect** | Temporal anchoring relies on adverbs (*hôm qua*) or particles (*đã*). Aspect marker *đã* is conflated with past. | *"Yesterday the manager has approved the budget."* | *"Yesterday the manager approved the budget."* | *"Specific past time anchor (yesterday) strictly forbids Present Perfect."* |
| **5** | **Bare Countable Nouns & Mass Plurals** | No grammatical articles; uses classifiers (*cái, con*) or bare nouns. Mass/count distinction is semantic, not inflectional. | *"She gave me many useful advices."* / *"He became engineer."* | *"She gave me valuable advice."* / *"He became an engineer."* | *"Advice is a non-count mass noun. Singular count jobs require 'a/an'."* |
| **6** | **Prepositional Calquing** | Translating Vietnamese relational words literally (*về $\to$ about, với $\to$ with*). | *"We must discuss about this crisis."* / *"She married with a lawyer."* | *"We must discuss this crisis."* / *"She married a lawyer."* | *"Direct transitive verb: 'discuss' and 'marry' license direct objects without prepositions."* |
| **7** | **Semantic Extension & Lexical Blur** | Broader semantic scope of high-frequency Vietnamese verbs (*học, xem, mở, chơi*). | *"I open the light."* / *"I watch books."* / *"I play with my coworkers on weekends."* | *"I turn on the light."* / *"I read books."* / *"I hang out with my colleagues."* | *"Physical apertures open; electrical circuits switch on. Adults hang out, not play."* |
| **8** | **Blunt Imperative vs. Epistemic Modality** | Vietnamese shows respect via honorific address pronouns (*thầy, cô, em*) and discourse particles (*ạ, dạ*). Stripped of particles, English translations sound harsh. | *"I want you to sign this document immediately."* | *"Could you please review and sign this document when you have a moment?"* | *"English politeness lives in modal hedging, not demanding intent."* |

---

# Part II: Active Reconstruction & Cognitive Scaffolding ("The Escape Path")

The transition from fossilized translation to spontaneous production cannot occur through unstructured immersion. It requires a 4-stage graduated scaffolding architecture:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                            THE ESCAPE PATH PIPELINE                              │
├─────────────────────┬────────────────────────────────────────────────────────────┤
│ STAGE 1:            │ Diagnostic pattern-matching. Flagging unnatural calques,   │
│ DECONSTRUCTION      │ empty templates, and L1 interference in authentic text.   │
├─────────────────────┼────────────────────────────────────────────────────────────┤
│ STAGE 2:            │ Cognitive offloading. Providing collocation frames,        │
│ SCAFFOLDING         │ functional sentence stems, and colligational constraints.  │
├─────────────────────┼────────────────────────────────────────────────────────────┤
│ STAGE 3:            │ Semantic transformation. Building accurate sentences from │
│ CONSTRAINED RECON.  │ conceptual graphs without allowing word-for-word L1 paths. │
├─────────────────────┼────────────────────────────────────────────────────────────┤
│ STAGE 4:            │ Autonomous formulation. Real-time timed production with   │
│ SPONTANEOUS PROD.   │ latency shrinkage and acoustic/lexical boundary checks.    │
└─────────────────────┴────────────────────────────────────────────────────────────┘
```

---

### 2.1 The 4-Stage Progression Detailed

#### Stage 1: Deconstruction (Unmasking & Isolation)
- **Pedagogical Goal:** Disrupt the learner’s blind spot. Vietnamese learners frequently believe their sentences are correct because each word is grammatically valid in isolation.
- **Cognitive Task:** Present sentences containing subtle L1 interference, register clashes, or mechanical templates. The learner must pinpoint the exact fault zone and articulate the underlying typological flaw.
- **Example:**
  - Input: *"In modern days, the rapid growth of technology plays an indispensable role in developing the economy, but every coin has two sides."*
  - Identified Faults:
    1. `In modern days` (Low-register pseudo-academic opening $\to$ use *In recent decades* or simply *Rapid technological expansion*).
    2. `plays an indispensable role in developing` (Pervasive cram-school padding $\to$ use *drives economic development*).
    3. `every coin has two sides` (Cliche conversational idiom in academic context $\to$ use *yet entails distinct trade-offs*).

#### Stage 2: Scaffolding (Collocation Frames & Stems)
- **Pedagogical Goal:** Anchor formulaic sequences into procedural memory before production.
- **Cognitive Task:** Provide structured lexical scaffolds where syntax is pre-locked, leaving only conceptual variables open for instantiation.
- **Structural Frame Library:**
  - *Causal Linkage:* `[ Substantial increases in [X] ] + [ have catalyzed / triggered ] + [ [Y] ]`
  - *Concessive Stance:* `[ While [Claim X] is undeniably valid, ] + [ it overlooks the countervailing reality that [Y] ]`
  - *Remedial Action:* `[ To mitigate [Problem X], policymakers must ] + [ institute / mandate ] + [ [Measure Y] ]`

#### Stage 3: Constrained Reconstruction (L1-Free Sentence Building)
- **Pedagogical Goal:** Prevent the dual-translation relay from engaging by presenting **Semantic Concept Cards** instead of Vietnamese translation prompts.
- **Cognitive Task:** The learner is provided with non-linguistic conceptual nodes or concise conceptual cues:
  - Concept: `[Urban Migration] ──(Drives)──► [Housing Shortages] ──(Exacerbates)──► [Social Inequality]`
  - Required Catalyst: `stem: "By fueling..."` or `verb: "exacerbate"`
  - Allowed Tokens: Pre-selected phraseological tiles.
- **Rule:** The learner is never asked to "Dịch câu sau sang tiếng Anh" (Translate this sentence). Translation prompts guarantee L1 syntactic transfer. Conceptual graphs force direct English formulation.

#### Stage 4: Spontaneous Production (Autonomous Fluency)
- **Pedagogical Goal:** Real-time retrieval under strict temporal constraints, shrinking inter-turn pause latency to $<500\text{ms}$.
- **Cognitive Task:** Rapid verbal/written response prompts with an active countdown timer (8–15 seconds). Real-time heuristic parsing flags any regression into L1 transfer patterns (e.g., detecting `discuss about`, `have many`, `although... but`).

---

### 2.2 The Anti-Template Paraphrase Challenge ("De-Slop Engine")

Vietnamese cram centers produce essays saturated with empty syntactic weight. The Escape Path teaches students to excise "template slop" and replace it with dense, authoritative native prose.

#### De-Slop Substitution Directory

| Category | Cram-School Slop (Band 5.5–6.0) | High-Impact Native Synthesis (Band 8.0–9.0) | Structural Transformation Mechanism |
|---|---|---|---|
| **Pervasive Cliché** | *"plays an indispensable role in"* | *underpins / anchors / drives / is vital to* | Verbing the predicate; cutting empty 5-word nominalization down to 1 potent transitive verb. |
| **Introductory Fluff** | *"In this day and age, whether X is good or bad has sparked a heated debate."* | *"The question of whether X is advantageous remains deeply contentious."* | Eliminating temporal filler; transforming personal debate cliché into an objective state of inquiry. |
| **False Idiom** | *"Taking all factors into consideration, every coin has two sides."* | *"Ultimately, this policy entails considerable structural trade-offs."* | Replacing adolescent conversational proverb with precise socio-economic terminology. |
| **Exemplification** | *"A telling example of this issue that can be mentioned is..."* | *"This is well illustrated by... / Consider the case of..."* | Stripping passive padding; using concise demonstrative or imperative frame. |
| **Knowledge Growth** | *"This helps young people widen their horizon and broaden their knowledge."* | *"This broadens students' cultural perspective and deepens technical insight."* | Eliminating twin platitude; providing concrete domain nouns (*perspective, insight*). |
| **General Assertion** | *"Nowadays, more and more people tend to use..."* | *"An increasing proportion of consumers rely on..."* | Replacing informal *"more and more"* with quantifiable demographic noun phrase. |
| **Hedging Failure** | *"Using smartphones completely destroys students' concentration."* | *"Prolonged smartphone use significantly undermines cognitive endurance."* | Applying epistemic hedging (*significantly impairs / tends to undermine*) over crude hyperbole. |

---

# Part III: Software Exercise Taxonomy for the TypeScript Web App

The following four drill formats are engineered specifically for our offline-first architecture. They require zero external APIs, zero LLM runtime latency, and execute entirely via deterministic TypeScript state machines and regex/heuristic evaluators.

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                    OFFLINE SOFTWARE DRILL TAXONOMY                            │
├───────────────────────────────────────────────────────────────────────────────┤
│ DRILL A: Contrastive L1 Spotting (The Calque Radar)                           │
│ Mechanics: 10s countdown. Tap the specific L1 transfer trap in context.       │
│ Pedagogical Goal: Train pre-articulatory self-monitoring of L1 interference.  │
├───────────────────────────────────────────────────────────────────────────────┤
│ DRILL B: Timed Chunk-Building / Sentence Jigsaw                               │
│ Mechanics: Multi-word lexical tile snapping under speed pressure (12s).       │
│ Pedagogical Goal: Physically prevent word-by-word assembly via chunking.      │
├───────────────────────────────────────────────────────────────────────────────┤
│ DRILL C: Anti-Template Paraphrase Challenge ("De-Slop Studio")                 │
│ Mechanics: Transform bloated cram-school text into crisp academic English.    │
│ Pedagogical Goal: Eliminate memorized templates; foster lexical density.     │
├───────────────────────────────────────────────────────────────────────────────┤
│ DRILL D: Rapid Response Fluency Prompts                                       │
│ Mechanics: Audio prompt + 3s reaction countdown + instant regex heuristic.    │
│ Pedagogical Goal: Shrink inter-turn latency; eliminate subvocalization.       │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

### 3.1 Drill Format A: Contrastive L1 Spotting (The Calque Radar)

- **Pedagogical Objective:** Force the user's brain to develop an autonomous cognitive radar for Vietnamese grammatical and collocational transfer.
- **Interaction Design:**
  - Display a full, naturalistic sentence with 3–4 interactive token zones.
  - One zone contains a subtle L1 calque (e.g., *"The committee met yesterday to [discuss about] [the municipal budget]."*)
  - The user has **8 to 10 seconds** to tap the infected zone.
  - **Success:** Instant acoustic chime (`AcousticHaptics.chime()`), green token border, and display of the contrastive linguistic rationale:
    > *Vietnamese: "Thảo luận VỀ" $\to$ English: "Discuss" is directly transitive. No preposition.*
  - **Failure:** Soft haptic nudge (`AcousticHaptics.nudge()`), reveals the trap with highlighted contrastive analysis.

```
[ TIMER: 00:07 ]
Select the unnatural or L1-transferred segment:

"Although the initial clinical trial was successful, [ but ] [ researchers ] [ cautioned against ] premature adoption."
                                                        ▲
                                             [ Learner Taps Here ]
                                                        │
                                                        ▼
                        [ ⚡ L1 DUAL-CONJUNCTION TRAP IDENTIFIED! ]
      Vietnamese: "Mặc dù... nhưng..." allows correlative pairs.
      English Invariant: A subordinate clause (Although) strictly prohibits
      a coordinate conjunction (but) in the main clause.
```

---

### 3.2 Drill Format B: Timed Chunk-Building (Sentence Jigsaw)

- **Pedagogical Objective:** Make word-by-word translation mechanically impossible by supplying only **multi-word prefabricated formulaic sequences**.
- **Interaction Design:**
  - Prompt presents a communicative objective (never a direct Vietnamese sentence).
  - Target sentence is split into 3–4 cohesive formulaic chunks, mixed with 2 plausible distractor chunks that reflect Vietnamese calques.
  - Countdown timer: **12 seconds**.
  - Learner taps tiles in grammatical sequence.
  - **Anti-Calque Distractor Feature:** If the user selects a distractor tile representing a Vietnamese calque (e.g., selecting `[ has many factors ]` instead of `[ there are numerous factors ]`), the system immediately flashes a specific L1 warning without resetting the entire drill.

```
Objective: State that technological disruption triggers profound workplace transformations.

[ Target Chunk Tiles ]:
[ Technological disruption ]   [ is bound to trigger ]   [ far-reaching changes ]   [ across the labor market. ]

[ Distractor Tiles (L1 Traps) ]:
[ is very change ]  [ makes people difficult to work ]

Timer: [████████░░░░] 6s
Current Assembly: [ Technological disruption ] + [ is bound to trigger ] + ...
```

---

### 3.3 Drill Format C: Anti-Template Paraphrase Challenge ("De-Slop Studio")

- **Pedagogical Objective:** Actively dismantle the "IELTS Fighter / Lò Luyện" Band 6 template addiction by transforming bloated, clichéd academic prose into Band 8.5+ native concision.
- **Interaction Design:**
  - The app displays a "Cram School Original" sentence scored at Band 6.0 (high word count, low informational entropy).
  - The user is assigned an **Optimization Objective**:
    - Mode 1: *Verbal Condensation* (Replace a 5-word clichéd verb phrase with a single high-impact verb).
    - Mode 2: *Clause Inversion / Participle Chaining* (Eliminate clichéd linkers like *"Furthermore"* or *"On the one hand"*).
    - Mode 3: *Epistemic Hedging* (Soften dogmatic assertions).
  - The user inputs or constructs their reconstruction.
  - The offline `SemanticParaphraseEvaluator` checks:
    1. Key concept coverage ($\ge 85\%$).
    2. Elimination of blacklisted cliché tokens.
    3. Adoption of designated target verbs/structures.
    4. Concision ratio ($\text{Length}_{\text{New}} \le 0.70 \times \text{Length}_{\text{Original}}$).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DE-SLOP STUDIO v1.0                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ CRAM-SCHOOL ORIGINAL (Band 6.0):                                           │
│ "It is an undeniable fact that renewable energy plays an indispensable role │
│ in protecting our living environment from getting worse."                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ MISSION: Eliminate the 2 template clichés. Target Concision: ≤12 words.    │
│ Required Catalyst Verb: [ anchors | preserves | underpins ]                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ USER INPUT:                                                                 │
│ "Renewable energy underpins environmental preservation."                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ EVALUATION:                                                                 │
│ ✅ Clichés Eradicated: ("undeniable fact that", "plays an indispensable...") │
│ ✅ Concision: 5 words vs 22 words original (-77% cognitive waste)          │
│ ✅ Sophistication Score: 96/100 (Band 8.5/9.0 Syntax)                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 3.4 Drill Format D: Rapid Response Fluency Prompts (Latency Shrinker)

- **Pedagogical Objective:** Compress the inter-turn cognitive formulation latency down to $<500\text{ms}$ while immunizing the user against L1 transfer under conversational pressure.
- **Interaction Design:**
  - Audio prompt plays via browser TTS (`AudioSynthesizer`).
  - A 3-second **Reaction Bar** counts down immediately upon audio completion. The learner must begin speaking or typing before the bar expires to prevent the dual-translation relay from engaging.
  - Prompt features intentional L1 baiting:
    - Examiner: *"What is the public transit system like in your hometown?"*
    - (Bait: Prompts Vietnamese learners to say *"In my city have many bus..."*)
  - The offline Speech Evaluator / Heuristic Parser scans the first 4 words of the user's transcript or input:
    - Trap detected: `/\b(in\s+\w+\s+(have|has))\b/i`
    - Instant haptic alert + prompt: *"Start with 'There is/are' or 'My hometown boasts...'!"*

---

# Part IV: Concrete TypeScript Architecture & Data Schemas

Below is the complete, self-contained TypeScript engine specification and seed schema designed to be integrated into `web/src/core/` and `web/src/assets/data/`.

```typescript
/**
 * EscapePathEngine: Architecture for Deprogramming Vietnamese Interlanguage Habits.
 * 100% offline, zero runtime API calls.
 */

export type EscapePathDrillType =
  | 'contrastive_l1_spotting'
  | 'timed_chunk_jigsaw'
  | 'anti_template_paraphrase'
  | 'rapid_fluency_prompt';

export type EscapeStage = 'deconstruction' | 'scaffolding' | 'reconstruction' | 'production';

export type L1CalqueCategory =
  | 'EXISTENTIAL_HAVE'
  | 'ZERO_COPULA'
  | 'DUAL_CONJUNCTIONS'
  | 'TENSE_ASPECT_BLINDNESS'
  | 'MASS_COUNT_DETERMINER'
  | 'PREPOSITIONAL_CALQUE'
  | 'SEMANTIC_BLUR'
  | 'PRAGMATIC_BLUNTNESS';

// ============================================================================
// 1. Contrastive L1 Spotting Drill Schema
// ============================================================================
export interface L1SpottingToken {
  id: string;
  text: string;
  isCalque: boolean;
  calqueCategory?: L1CalqueCategory;
  vietnameseExplanation?: string;
  linguisticRationale?: string;
  authenticAlternative?: string;
}

export interface ContrastiveSpottingDrill {
  id: string;
  type: 'contrastive_l1_spotting';
  stage: 'deconstruction';
  cefrLevel: 'B2' | 'C1' | 'C2';
  timeLimitSec: number; // typically 8 - 12s
  promptContext: string;
  tokens: L1SpottingToken[];
}

// ============================================================================
// 2. Timed Chunk-Building / Sentence Jigsaw Drill Schema
// ============================================================================
export interface JigsawTile {
  id: string;
  text: string;
  orderIndex: number; // correct 0-based sequence position (-1 if distractor)
  isDistractor: boolean;
  l1TrapExplanation?: string;
}

export interface TimedChunkJigsawDrill {
  id: string;
  type: 'timed_chunk_jigsaw';
  stage: 'scaffolding' | 'reconstruction';
  cefrLevel: 'B2' | 'C1' | 'C2';
  timeLimitSec: number; // typically 10 - 15s
  communicativeGoal: string; // What the learner is trying to express
  tiles: JigsawTile[];
  grammaticalFrameNote: string;
}

// ============================================================================
// 3. Anti-Template Paraphrase Drill Schema ("De-Slop")
// ============================================================================
export interface AntiTemplateParaphraseDrill {
  id: string;
  type: 'anti_template_paraphrase';
  stage: 'reconstruction';
  cefrLevel: 'C1' | 'C2';
  bloatedSentence: string;
  detectedCliches: string[];
  catalystKeywords: string[]; // e.g. ["underpins", "preserves"]
  maxWordCountTarget: number;
  exemplaryModelAnswers: string[];
  evaluationRubric: {
    forbiddenPhrases: string[];
    requiredSemanticNodes: string[];
    minConcisionGainPct: number; // e.g. 30% reduction in words
  };
}

// ============================================================================
// 4. Rapid Response Fluency Prompt Schema
// ============================================================================
export interface RapidFluencyPromptDrill {
  id: string;
  type: 'rapid_fluency_prompt';
  stage: 'production';
  cefrLevel: 'B2' | 'C1' | 'C2';
  audioPromptText: string;
  audioAccent: 'us' | 'uk';
  reactionTimeLimitSec: number; // typically 3.0s to begin articulation
  fullSpeechTimeLimitSec: number; // typically 15.0s to finish response
  l1TransferBaitDescription: string;
  trapRegexPatterns: Array<{
    regex: string; // string-serialized regex for JSON storage
    flagName: string;
    instantRemediationHint: string;
  }>;
  exemplaryOpeners: string[];
}
```

---

# Part V: Curated Seed Dataset (Production Ready)

Below are concrete, high-leverage seed items ready for direct deployment into the web application's offline data bank.

### Seed 1: Contrastive L1 Spotting Bank (`contrastive_l1_spotting`)

```json
[
  {
    "id": "spot-existential-01",
    "type": "contrastive_l1_spotting",
    "stage": "deconstruction",
    "cefrLevel": "B2",
    "timeLimitSec": 10,
    "promptContext": "Identify the unnatural or L1-transferred segment:",
    "tokens": [
      {
        "id": "t1",
        "text": "In the emerging technology zone,",
        "isCalque": false
      },
      {
        "id": "t2",
        "text": "has more than thirty foreign enterprise headquarters",
        "isCalque": true,
        "calqueCategory": "EXISTENTIAL_HAVE",
        "vietnameseExplanation": "Tiếng Việt nói 'Ở đâu đó CÓ...', nhưng tiếng Anh không dùng 'has' cho địa điểm mà phải dùng cấu trúc tồn tại 'there are'.",
        "linguisticRationale": "English is subject-prominent and requires an expletive dummy subject ('There are') for existential propositions.",
        "authenticAlternative": "there are more than thirty foreign enterprise headquarters"
      },
      {
        "id": "t3",
        "text": "operating at full commercial capacity.",
        "isCalque": false
      }
    ]
  },
  {
    "id": "spot-dualconj-02",
    "type": "contrastive_l1_spotting",
    "stage": "deconstruction",
    "cefrLevel": "B2",
    "timeLimitSec": 8,
    "promptContext": "Identify the ungrammatical segment caused by L1 transfer:",
    "tokens": [
      {
        "id": "t1",
        "text": "Although the preliminary audit revealed discrepancies,",
        "isCalque": false
      },
      {
        "id": "t2",
        "text": "but the managing director signed off on the balance sheet,",
        "isCalque": true,
        "calqueCategory": "DUAL_CONJUNCTIONS",
        "vietnameseExplanation": "Thói quen 'Mặc dù... nhưng...' trong tiếng Việt dẫn đến dùng cả 'Although' và 'but'. Tiếng Anh chỉ cho phép một liên từ.",
        "linguisticRationale": "Subordinating clauses (Although) preclude coordinating conjunctions (but) in the matrix clause.",
        "authenticAlternative": "the managing director nonetheless signed off on the balance sheet"
      },
      {
        "id": "t3",
        "text": "triggering an immediate regulatory inquiry.",
        "isCalque": false
      }
    ]
  },
  {
    "id": "spot-prep-03",
    "type": "contrastive_l1_spotting",
    "stage": "deconstruction",
    "cefrLevel": "C1",
    "timeLimitSec": 9,
    "promptContext": "Pinpoint the collocational calque in the academic debate:",
    "tokens": [
      {
        "id": "t1",
        "text": "The panel scheduled an extraordinary session",
        "isCalque": false
      },
      {
        "id": "t2",
        "text": "to discuss about the environmental ramifications",
        "isCalque": true,
        "calqueCategory": "PREPOSITIONAL_CALQUE",
        "vietnameseExplanation": "Dịch nguyên văn 'thảo luận về' thành 'discuss about'. 'Discuss' là ngoại động từ trực tiếp, không đi kèm 'about'.",
        "linguisticRationale": "'Discuss' is a monotransitive verb licensing a direct noun phrase complement without a prepositional mediator.",
        "authenticAlternative": "to discuss the environmental ramifications"
      },
      {
        "id": "t3",
        "text": "of seabed mineral extraction.",
        "isCalque": false
      }
    ]
  }
]
```

---

### Seed 2: Timed Chunk-Building Bank (`timed_chunk_jigsaw`)

```json
[
  {
    "id": "jigsaw-chunk-01",
    "type": "timed_chunk_jigsaw",
    "stage": "reconstruction",
    "cefrLevel": "C1",
    "timeLimitSec": 12,
    "communicativeGoal": "Assert that rapid urbanization strains municipal infrastructure.",
    "tiles": [
      {
        "id": "tile-1",
        "text": "Unchecked demographic expansion",
        "orderIndex": 0,
        "isDistractor": false
      },
      {
        "id": "tile-2",
        "text": "places acute strain on",
        "orderIndex": 1,
        "isDistractor": false
      },
      {
        "id": "tile-3",
        "text": "municipal utility grids.",
        "orderIndex": 2,
        "isDistractor": false
      },
      {
        "id": "dist-1",
        "text": "makes very difficult for",
        "orderIndex": -1,
        "isDistractor": true,
        "l1TrapExplanation": "Calque of 'làm rất khó khăn cho...'. Weak verbalization."
      },
      {
        "id": "dist-2",
        "text": "has many problems in",
        "orderIndex": -1,
        "isDistractor": true,
        "l1TrapExplanation": "Existential 'have' calque from Vietnamese 'có nhiều vấn đề ở'."
      }
    ],
    "grammaticalFrameNote": "Collocation: [ Subject ] + [ places acute strain on ] + [ Noun Phrase ]"
  },
  {
    "id": "jigsaw-chunk-02",
    "type": "timed_chunk_jigsaw",
    "stage": "reconstruction",
    "cefrLevel": "C1",
    "timeLimitSec": 14,
    "communicativeGoal": "Express that higher carbon taxes incentivize corporate sustainability without hurting growth.",
    "tiles": [
      {
        "id": "tile-1",
        "text": "Instituting stringent carbon levies",
        "orderIndex": 0,
        "isDistractor": false
      },
      {
        "id": "tile-2",
        "text": "incentivizes green innovation",
        "orderIndex": 1,
        "isDistractor": false
      },
      {
        "id": "tile-3",
        "text": "without stifling capital investment.",
        "orderIndex": 2,
        "isDistractor": false
      },
      {
        "id": "dist-1",
        "text": "is very save environment but",
        "orderIndex": -1,
        "isDistractor": true,
        "l1TrapExplanation": "Calque of 'rất tiết kiệm môi trường nhưng'. Part-of-speech confusion."
      }
    ],
    "grammaticalFrameNote": "Gerund Subject + Transitive Verb + Prepositional Negative Modifier"
  }
]
```

---

### Seed 3: Anti-Template Paraphrase Bank ("De-Slop") (`anti_template_paraphrase`)

```json
[
  {
    "id": "deslop-01",
    "type": "anti_template_paraphrase",
    "stage": "reconstruction",
    "cefrLevel": "C1",
    "bloatedSentence": "In this day and age, it is universally acknowledged that artificial intelligence plays an indispensable role in revolutionizing the healthcare sector.",
    "detectedCliches": [
      "In this day and age",
      "it is universally acknowledged that",
      "plays an indispensable role in"
    ],
    "catalystKeywords": ["transforms", "anchors", "underpins", "drives"],
    "maxWordCountTarget": 10,
    "exemplaryModelAnswers": [
      "Artificial intelligence fundamentally transforms modern medical care.",
      "Artificial intelligence underpins the ongoing modernization of healthcare.",
      "Machine learning increasingly drives diagnostic precision in healthcare."
    ],
    "evaluationRubric": {
      "forbiddenPhrases": [
        "in this day and age",
        "indispensable role",
        "universally acknowledged",
        "every coin"
      ],
      "requiredSemanticNodes": ["artificial intelligence", "healthcare / medicine"],
      "minConcisionGainPct": 50
    }
  },
  {
    "id": "deslop-02",
    "type": "anti_template_paraphrase",
    "stage": "reconstruction",
    "cefrLevel": "C2",
    "bloatedSentence": "Taking all aforementioned arguments into consideration, every coin has two sides, so governments must pay attention to both the advantages and disadvantages of tourism.",
    "detectedCliches": [
      "Taking all aforementioned arguments into consideration",
      "every coin has two sides",
      "pay attention to both the advantages and disadvantages"
    ],
    "catalystKeywords": ["weigh", "balance", "trade-offs", "reconcile"],
    "maxWordCountTarget": 11,
    "exemplaryModelAnswers": [
      "Governments must reconcile tourism revenue with environmental degradation.",
      "Policymakers must balance the economic dividends of tourism against its ecological costs.",
      "Sustainable governance requires weighing tourism growth against local disruption."
    ],
    "evaluationRubric": {
      "forbiddenPhrases": [
        "every coin has two sides",
        "aforementioned",
        "pay attention to",
        "advantages and disadvantages"
      ],
      "requiredSemanticNodes": ["government / policymakers", "tourism", "balance / trade-offs"],
      "minConcisionGainPct": 55
    }
  }
]
```

---

### Seed 4: Rapid Fluency Prompt Bank (`rapid_fluency_prompt`)

```json
[
  {
    "id": "rapid-fluency-01",
    "type": "rapid_fluency_prompt",
    "stage": "production",
    "cefrLevel": "B2",
    "audioPromptText": "How convenient is public transportation in your home city?",
    "audioAccent": "us",
    "reactionTimeLimitSec": 3.0,
    "fullSpeechTimeLimitSec": 15.0,
    "l1TransferBaitDescription": "Baits the learner to use 'In my city have...' or 'Public transport is very save money...'",
    "trapRegexPatterns": [
      {
        "regex": "\\b(in\\s+my\\s+city\\s+(have|has))\\b",
        "flagName": "EXISTENTIAL_HAVE_TRAP",
        "instantRemediationHint": "Avoid 'In my city has...'. Start with 'My city features...' or 'There is an extensive...'"
      },
      {
        "regex": "\\b(very\\s+save|very\\s+convenient\\s+for\\s+me\\s+to)\\b",
        "flagName": "COLLOCATIONAL_CALQUE",
        "instantRemediationHint": "Use 'economical', 'cost-effective', or 'It allows residents to commute seamlessly.'"
      }
    ],
    "exemplaryOpeners": [
      "The transit network is remarkably efficient, featuring...",
      "While subway connectivity is expanding, the bus system remains...",
      "Commuters benefit from an affordable, high-frequency rail link..."
    ]
  },
  {
    "id": "rapid-fluency-02",
    "type": "rapid_fluency_prompt",
    "stage": "production",
    "cefrLevel": "C1",
    "audioPromptText": "Should governments invest heavily in space exploration right now?",
    "audioAccent": "uk",
    "reactionTimeLimitSec": 2.5,
    "fullSpeechTimeLimitSec": 15.0,
    "l1TransferBaitDescription": "Baits dual conjunctions ('Although space is expensive but...') and unhedged overstatement ('It definitely destroys budget').",
    "trapRegexPatterns": [
      {
        "regex": "\\b(although|even though)\\b.*?\\b(but|however)\\b",
        "flagName": "DUAL_CONJUNCTION_TRAP",
        "instantRemediationHint": "Do not pair 'Although' with 'but'. Use one subordinating clause only."
      },
      {
        "regex": "\\b(will\\s+definitely\\s+waste|plays\\s+an\\s+indispensable\\s+role)\\b",
        "flagName": "TEMPLATE_CLICHE_OR_UNHEDGED",
        "instantRemediationHint": "Use epistemic hedging: 'arguably yields substantial technological spillovers...'"
      }
    ],
    "exemplaryOpeners": [
      "While astronomical spending invites scrutiny, aerospace research yields...",
      "Allocating capital to space exploration fosters critical technological spillovers...",
      "Given pressing terrestrial crises, orbital research warrants measured prioritization..."
    ]
  }
]
```

---

# Part VI: Implementation Roadmap & Metric Validation

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   METRIC VALIDATION TARGETS (THE ESCAPE PATH)                    │
├─────────────────────────┬──────────────────────────────┬─────────────────────────┤
│ Metric                  │ Baseline (Vietnamese Cram)   │ Target (The Escape Path)│
├─────────────────────────┼──────────────────────────────┼─────────────────────────┤
│ Speech Initiation Delay │ 1,800ms – 3,200ms            │ 350ms – 550ms           │
│ L1 Calque Frequency     │ 4.2 errors / 100 words       │ < 0.2 errors / 100 words│
│ Formulaic Chunk Density │ 18% (Single-word assembly)   │ 68% (Collocational)     │
│ Cram-Cliché Word Share  │ 24% of Task 2 word count     │ 0% (Clean vocabulary)   │
│ Concision Ratio         │ 28.5 words / sentence        │ 16.2 words / sentence   │
└─────────────────────────┴──────────────────────────────┴─────────────────────────┘
```

### Integration Points in the TypeScript Web App
1. **Core Diagnostic Integration:** Add `EscapePathDrillType` into `web/src/core/exercise-engine.ts` and `web/src/core/l1-vietnamese-diagnostic.ts`.
2. **SERL Gauntlet Binding:** When an L1 error is flagged during any writing or speaking activity, automatically enroll the corresponding item into `SerlGauntletEngine` using the 3-stage Spaced Rehabilitation model.
3. **Writing Studio De-Slop Filter:** Hook the cliché blacklist and concision heuristics directly into `web/src/ielts/writing-heuristics.ts` to actively flag and penalize template memorization during essay drafting.
4. **Sensory Feedback Pairing:** Pair every caught L1 calque with `AcousticHaptics.nudge()` and every successful de-slopped sentence with `AcousticHaptics.chime()`, providing visceral multi-sensory deprogramming.
