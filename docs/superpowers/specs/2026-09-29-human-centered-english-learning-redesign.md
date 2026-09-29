# English Mastery Platform: The Constellation Skill Tree & Human Ergonomics

**Specification Document:** `SPEC-2026-09-29-CONSTELLATION-ENG`  
**Target User Persona:** Upper-Intermediate to Advanced Learner (CEFR B2/C1 aiming for C2 / Native-Level Nuance)  
**Core Architectural Pillars:** Skyrim-Style Prerequisite Skill Tree, Real Interactive Practice Consoles, Calm Human Ergonomics.  
**Visual & Interaction Standard:** Clean Minimalist Monochrome (`#111111` on `#fafaf9`), Native OS Mouse Ergonomics, Natural Document Scrolling, Zero Sci-Fi Gimmicks.

---

## 1. Executive Summary & Persona Profile

### 1.1 The Advanced Learner Problem
The student using this application is **already good at English**. They can converse, write emails, and read articles. However, they are stuck on the **intermediate-to-advanced plateau**:
- They want to sound articulate, authoritative, and nuanced (C1/C2), but revert to basic grammatical patterns when writing or speaking.
- They know advanced words individually, but struggle with natural collocations and preposition hubs.
- They want a **clear, visual map of mastery**: *"What specific skills separate me from native-level fluency? Exactly what do I need to unlock next to reach the top?"*

### 1.2 The Solution
We transform the platform from an abstract sci-fi HUD into a **Skyrim-style English Skill Constellation** paired with dedicated, distraction-free practice studios:
1. **The Constellation Skill Tree:** An interactive RPG-style milestone progression tree where learning nodes have clear prerequisites and visual unlock paths leading to C2 Summit Mastery.
2. **Real Interactive Practice:** Replacing passive flashcards with real tools — an active Franklin Copywork typing editor with live diffs, a searchable 1,000-collocation lexicon, and a 3-stage speaking studio.
3. **Calm, Premium UX:** Native OS cursor, clear header navigation (`[ ← Back to Tree ]`), soft eye-friendly contrast, and natural scrolling.

---

## 2. The Skyrim-Style Constellation Skill Tree (`#tree`)

### 2.1 The Visual & Interactive Metaphor
Instead of an abstract twitching sea urchin, the primary curriculum map is rendered as an elegant **Interactive Constellation Skill Tree** (SVG / Canvas):
- **Branches (Constellations):** 5 dedicated branches radiate upward toward the "C2 Mastery Summit":
  1. **Branch I: Syntactic Architecture (Grammar)**
  2. **Branch II: Lexical Precision (1,000 Collocations & Vocab)**
  3. **Branch III: Rhetoric & Franklin Copywork (Writing)**
  4. **Branch IV: Prosody & Spontaneous Fluency (Speaking)**
  5. **Branch V: Epistemic Deconstruction (Reading)**
- **Connecting Filaments (Branches):** Crisp lines connect parent nodes to dependent child nodes. As prerequisites are met, the filament illuminates.

### 2.2 Node States & Prerequisite Gating
Each perk node exists in one of three states:
1. **LOCKED (Dimmed, Lock Icon):**
   - Prerequisites not yet fulfilled.
   - Clicking reveals a clean modal: *"LOCKED: Requires [Parent Skill Name] at 80% Mastery (Current: 45%). Complete 2 more review drills to unlock."*
2. **UNLOCKED / READY TO TRAIN (Pulsing Outline, Active Pointer):**
   - All prerequisites satisfied.
   - Clicking opens the Perk Dossier with a direct **`[ Start Practice Drill → ]`** CTA that launches the student into that specific skill's practice module.
3. **MASTERED (Illuminated Star, Solid Fill):**
   - Student has achieved $\ge 80\%$ retention or 3 consecutive "Good" ratings in spaced repetition.
   - Unlocks dependent higher-tier perks.

### 2.3 The 5 Master Skill Constellations & Prerequisite Trees

#### Branch I: Syntactic Architecture (Grammar)
```
[Level 1: Core Fronting] ──> [Level 2: Negative Inversion (Seldom/Rarely)] ──> [Level 3: Restrictive Inversion (Only after/Not until)]
                                                                                       │
                                                                                       ▼
[Level 5: Master C2 Stylistic Condensation] <── [Level 4: Hypothetical Inversion (Had we known / Were you to)]
```

#### Branch II: Lexical Precision (Collocations & Vocab)
```
[Perk 1: Core Action Verbs] ──> [Perk 2: Business & Legal Hubs] ──> [Perk 3: Academic & Research Collocations]
                                                                              │
                                                                              ▼
[Perk 5: High Idiomatic Nuance] <── [Perk 4: Prepositional Finesse (Bear on / Pertain to)]
```

#### Branch III: Rhetoric & Copywork (Writing)
```
[Perk 1: SVO Clarity & Clausal Balance] ──> [Perk 2: Periodic Sentences & Suspense] ──> [Perk 3: Franklin Antithesis & Parallelism]
                                                                                                  │
                                                                                                  ▼
[Perk 5: Forensic C2 Essay Synthesis] <── [Perk 4: MEAL Argument Architecture]
```

#### Branch IV: Prosody & Spontaneity (Speaking)
```
[Perk 1: Nuclear Tonic Stress] ──> [Perk 2: Connected Speech & Catenation] ──> [Perk 3: Nation 4-3-2 Fluency (Pacing)]
                                                                                         │
                                                                                         ▼
[Perk 5: Unrehearsed C2 Debate Rhetoric] <── [Perk 4: Collocation Injection Under Pressure]
```

#### Branch V: Epistemic Deconstruction (Reading)
```
[Perk 1: Rapid Gist & Skeleton] ──> [Perk 2: Lexical Target Extraction] ──> [Perk 3: Syntactic Reverse-Engineering]
                                                                                      │
                                                                                      ▼
[Perk 5: Hermeneutic C2 Synthesis] <── [Perk 4: Rhetorical Intent & Biases]
```

---

## 3. Dedicated Practice Studios (No More "Everything is a Flashcard")

Each skill node in the tree launches the learner into a dedicated, fit-for-purpose practice studio.

### 3.1 Writing Studio: True Benjamin Franklin Copywork
* **Step 1 (Analyze):** Display the model sentence with grammatical breakdown and stylistic notes.
* **Step 2 (Recall & Type):** Model hides. Student types in a generous auto-focused `<textarea>` with character and word counters.
* **Step 3 (Instant Split-Diff):** Side-by-side comparison with word-level Myers/Hirschberg diff highlighting:
  - Exact matches in crisp black ink.
  - Missed words (`[-deleted-]`) in strike-through.
  - Extra or incorrect words (`{+inserted+}`) in highlighted badges.
  - Accuracy %, WPM, and pedagogical tip explaining the contrast.
  - Self-rating updates the Constellation node's mastery score.

### 3.2 Collocations Studio: Dual View (Drill + Full Lexicon)
* **View A: Active SRS Drill:** High-focus cards featuring the collocation, preposition cues, audio pronunciation, and real example sentences.
* **View B: Full 1,000 Searchable Dictionary:** Fast table with live search (English & Vietnamese), category filters (`Everyday`, `Business`, `Academic`, `Idioms`), and audio speaker on every row.

### 3.3 Speaking Studio: 3-Stage 4-3-2 Flow
* **Stage 1 (Prep):** 15-second countdown with native model audio and 4 target collocation chips.
* **Stage 2 (Speak):** Clean countdown timer (4 min $\rightarrow$ 3 min $\rightarrow$ 2 min) with live audio level visualizer.
* **Stage 3 (Review):** Immediate playback of student take vs. native model, with detected collocation checklist and pacing metrics.

### 3.4 Reading Studio: Calm Document Reader
* Relaxed reading typography: `68ch` measure, `1.65` line height, generous paragraph spacing.
* Clickable vocabulary targets: clicking any underlined term reveals natural Vietnamese meaning and collocation partners in a clean side drawer.
* Optional unhurried 60s skim timer (no forced cutoffs).

---

## 4. Ergonomics, Sensory & Navigation Overhaul

| Problem Area | Legacy Flaw | New Human Standard |
| :--- | :--- | :--- |
| **Cursor** | Custom canvas reticle, `cursor: none` | **Native OS pointer** (`default`, `pointer`, `text`). Zero input lag. |
| **Navigation** | No back button; secret `Esc` key only | **Prominent `[ ← Back to Tree ]`** top-left on every single page. |
| **Page Layout** | `overflow: hidden`, fixed 720x440 card | **Natural document scrolling**; containers expand to fit content. |
| **Color & Eye Strain** | Harsh `#000000` on `#ffffff` glare | **Soft Paper Ink:** Deep charcoal `#111111` on soft warm white `#fafaf9` with Dark Mode. |
| **Audio Noise** | Synthesized beeps on every click | **Silent navigation**; audio plays *only* when user clicks [Speaker] or finishes a daily milestone. |
| **Telemetry Bloat** | Digital clock, JSON buttons, `EF 2.50` | Clean header: `Day X of 30`, `Streak: X Days`, `Sound Toggle`, `Settings`. |

---

## 5. Home Dashboard & The Daily 15-Minute Workout

When the student opens the application:
1. **Header:** Clean branding (`ENGLISH MASTERY`), current level/rank (`C1 Scholar`), streak counter (`🔥 5 Days`), sound toggle.
2. **Top Banner: Today's 15-Minute Daily Workout:**
   - A single clean checklist with progress indicator:
     - `[✓] 10 Collocations`
     - `[ ] 1 Franklin Copywork (Inversion)`
     - `[ ] 1 Speaking Take (4-3-2)`
   - Primary Action Button: **`[ CONTINUE TODAY'S WORKOUT → ]`**.
3. **Main Canvas: The Constellation Skill Tree:**
   - Full interactive visualization of all 5 skill branches radiating to the summit.
   - Shows locked nodes, unlocked available drills, and mastered star perks.
   - Student can click any unlocked node to jump directly into focused deliberate practice.

---

## 6. Verification & Acceptance Criteria

1. **The 60-Second Human Test:**
   - Learner immediately understands their level, current streak, and what to do next.
   - Learner can navigate to any skill and return to the Constellation Tree with a single click on `[ ← Back to Tree ]`.
   - Native OS mouse pointer feels snappy, responsive, and familiar with zero lag.
2. **Skill Tree Interactivity:**
   - Prerequisite logic strictly enforced: locked nodes cannot be trained until parents reach mastery threshold.
   - Clicking unlocked nodes launches the exact matching practice module.
   - Completing drills updates node mastery and illuminates the branch.
3. **Copywork & Input Integrity:**
   - Real typing in a textarea with instant Myers/Hirschberg split-diff evaluation.
   - Zero text clipping on prompt sentences across any screen width.
4. **Browser QA & Performance:**
   - Zero console errors, zero network failures, zero horizontal overflow.
   - Production bundle compiles in $< 2.0\text{s}$ with 0 errors.
