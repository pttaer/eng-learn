# IELTS Band 7+ Complete Prep Course Integration Specification

> **Feature**: Full Integration of Udemy IELTS Band 7+ Complete Prep Course (Keino Campbell, Esq.) into English Singularity & IELTS Cockpit  
> **Source**: `E:\Eng\docs\IELTS_Band7_Udemy_Complete_Course.md` (35 Sections, 526+ Lectures, ~87 Hours)  
> **Target Status**: Validated Architectural Specification  
> **Date**: 2026-10-13  
> **Author**: Michael (god), Hive Orchestrator  

---

## 1. Executive Summary & Pedagogical Directives

The objective of this initiative is to operationalize the complete 35-section Udemy master course into the English Singularity application and its dedicated Computer-Delivered IELTS cockpit (`ielts.html`). 

### Core Pedagogical Pillars (Strictly Calibrated with `/ielts-coach`):
1. **Rubric-First Calibration**: All interactive modules, feedback loops, and evaluations strictly map to official IELTS 9-band criteria:
   - **Writing**: Task Achievement/Task Response (25%), Coherence & Cohesion (25%), Lexical Resource (25%), Grammatical Range & Accuracy (25%).
   - **Speaking**: Fluency & Coherence (25%), Lexical Resource (25%), Grammatical Range & Accuracy (25%), Pronunciation (25%).
2. **Practice Over Passive Reading (20/80 Rule)**: Tactical insights are kept bite-sized and actionable, immediately triggering interactive drill exercises, deconstructions, or simulator checks.
3. **Unified Organization Method (Keino Campbell Formulas)**:
   - **Task 1 Visuals**: Paraphrased Introduction + 2-Sentence Overview (major trends/contrasts without raw numbers) + 2 Grouped Body Paragraphs.
   - **Task 2 Discursive**: 5 Distinct Architectures (Opinion, Discussion, Adv/Disadv, Problem-Solution, Two-Part) with the strict **4-Sentence Paragraph Formula** (Topic Sentence $\rightarrow$ Explanation/Mechanism $\rightarrow$ Concrete Example $\rightarrow$ Impact/Concluding Sentence).
4. **Keyword & Paraphrasing Engine**: Training the recognition of synonym pairs and antonyms under strict time pressure.
5. **Defensive Trap Neutralization**: Identifying examiner distractors (qualifiers like *always/never/only*, negative reversals like *however/on the contrary*, and oral self-corrections like *“No, wait, actually...”*).

---

## 2. Architecture & File Structure

### 2.1 Content Partitioning Pipeline (`web/content/ielts/course/`)
The single 2.1 MB master course document is decomposed into structured Markdown modules with frontmatter and predictable headers:
- `web/content/ielts/course/01-diagnostics-foundations.md`: Sections 1–3 (Exam architecture, scoring conversions, diagnostic grammar & vocabulary tests with answer keys and error taxonomy).
- `web/content/ielts/course/02-listening-tactics.md`: Sections 4–12 (Sections 1–4 strategies, map & plan navigation, multiple choice elimination, exact-word fill-the-blank rules, self-correction traps).
- `web/content/ielts/course/03-reading-14-types.md`: Sections 13–17 (Scanning tactics, synonym mapping engine, tactical blueprints for all 14 question types, timing matrix).
- `web/content/ielts/course/04-cbt-navigation.md`: Section 23 (Computer-based testing ergonomics, split-screen shortcuts, highlighting, scratchpad, OSR rules).
- `web/content/ielts/course/05-writing-task1-formulas.md`: Sections 24–25 (Line, Bar, Pie, Table, Process, Map formulas; overview rules; grouping principles; band 7+ vs band 6 models).
- `web/content/ielts/course/06-writing-task2-architectures.md`: Sections 28–29 (5 essay architectures, 4-sentence paragraph formula, thesis formulation, clausal density, transition matrices).
- `web/content/ielts/course/07-speaking-mastery.md`: Sections 30–35 (Parts 1–3 tactics, 1-min cue card notes formula, conversational fillers, band 6.5 vs 7.5 vs 8.5 comparative models).

### 2.2 Compilation Engine (`web/scripts/compile-content.cjs`)
A new dedicated compiler pass `compileIeltsCourse()` extracts and outputs:
- `web/src/ielts/data/strategy.json`: Expanded from 11 generic cards to a comprehensive 35-card tactical matrix covering all question types, trap alerts, and step-by-step algorithms.
- `web/src/assets/data/ielts-course.json`: Master structured database containing:
  - `diagnostics`: Grammar and vocabulary diagnostic test items with error categorization.
  - `questionTypes`: 14 Reading question types with step-by-step workflows and synonym pairs.
  - `listeningTraps`: Distractor catalog and self-correction rules.
  - `writingFormulas`: Task 1 visual structures and Task 2 4-sentence paragraph blueprints.
  - `speakingModels`: Annotated comparative models (Band 6.5, 7.5, 8.5) across Parts 1, 2, and 3.

### 2.3 Interactive Application Units (`web/src/ielts/`)
1. **Diagnostic & Error Profiling View / Modal** (`web/src/ielts/views/diagnostic.ts` & `web/src/ielts/diagnostic-engine.ts`):
   - Administers baseline grammar and vocabulary diagnostic checks.
   - Diagnoses high-impact error patterns: Tense Consistency, Subject-Verb Agreement, Article Omission, Clausal Subordination, Collocation Selection.
   - Stores diagnostics in `StorageManager` under `ieltsDiagnosticProfile`.
2. **Enhanced Strategy & Tactics Explorer** (`web/src/ielts/views/strategy.ts`):
   - Filterable by skill (Listening, Reading, Writing T1, Writing T2, Speaking, CBT).
   - Deep dive drawers with full Keino Campbell walkthroughs, trap alerts, and synonym tables.
3. **Task 1 Visual Formula Inspector** (`web/src/ielts/views/writing.ts`):
   - Interactive breakdown of sample charts into: Paraphrased Introduction, 2-Sentence Overview, Body 1, and Body 2.
   - Live vocabulary palette (trend verbs, percentage quantifiers, prepositions of change).
4. **Task 2 4-Sentence Paragraph Workbench** (`web/src/ielts/views/writing.ts` & `writing-heuristics.ts`):
   - Interactive paragraph composer validating:
     1. Topic Sentence (Clear main claim)
     2. Explanation Sentence (Causal logic / mechanism)
     3. Evidence Sentence (Concrete exemplar or data point)
     4. Concluding / Impact Sentence (Link back to thesis)
   - Real-time heuristic feedback enforcing minimum word counts and clausal complexity before submission to AES.
5. **Speaking Cue Card 1-Minute Prep Simulator** (`web/src/ielts/views/speaking.ts`):
   - Dedicated 60-second prep countdown with 4-keyword bullet notepad.
   - Side-by-side Band 6.5 vs 7.5 vs 8.5 response comparison with Web Audio TTS playback and examiner notes.

---

## 3. Data Schemas & Interfaces

### 3.1 Course Strategy Card Schema (`strategy.json`)
```typescript
interface StrategyCard {
  id: string;
  skill: 'Listening' | 'Reading' | 'Writing Task 1' | 'Writing Task 2' | 'Speaking' | 'CBT Navigation';
  title: string;
  sectionRef: string; // e.g., "Sec 15: Academic Reading Specific Question Strategy"
  tips: string[];
  traps: string[];
  formula?: string;
  synonymPairs?: { promptWord: string; passageWord: string }[];
  modelRef?: string;
}
```

### 3.2 Diagnostic Question Schema (`ielts-course.json`)
```typescript
interface DiagnosticQuestion {
  id: string;
  category: 'grammar' | 'vocabulary';
  subType: 'subject_verb' | 'tenses' | 'articles' | 'clauses' | 'prepositions' | 'collocations';
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  impactOnBand: string; // e.g. "Prevents Band 7.0 GRA due to systematic error"
}
```

### 3.3 4-Sentence Paragraph Validation Schema
```typescript
interface ParagraphEvaluation {
  hasTopicSentence: boolean;
  hasExplanation: boolean;
  hasEvidence: boolean;
  hasImpactSentence: boolean;
  sentenceCount: number;
  wordCount: number;
  feedback: string[];
  scoreEstimate: 'Band 6.0' | 'Band 7.0' | 'Band 8.0+';
}
```

---

## 4. Verification & QA Matrix

1. **Compiler Pipeline Integrity**:
   - `node web/scripts/compile-content.cjs` executes in < 100ms with 0 errors.
   - Emits valid, non-empty `strategy.json` (>= 30 cards) and `ielts-course.json`.
2. **Automated Unit Verification Suite** (`web/scripts/verify-ielts-course-pipeline.cjs`):
   - Asserts all 35 course sections are represented in the extracted content.
   - Asserts all 14 Reading question types possess valid tactical workflows and synonym mappings.
   - Asserts Task 1 formulas cover Line, Bar, Pie, Table, Process, and Map.
   - Asserts Task 2 4-sentence paragraph validator correctly flags incomplete paragraph structures.
   - Asserts Diagnostic engine accurately scores and categorizes baseline flaws.
3. **TypeScript & Production Vite Build**:
   - `npx tsc --noEmit` passes with 0 type errors.
   - `npm run build` compiles cleanly into `web/dist/`.
4. **Headless Browser E2E Test** (`web/scripts/browser-qa-test.cjs`):
   - Test 20: Navigate to `ielts.html#strategy`, filter by Reading, verify 14 question type drawers open and render formulas.
   - Test 21: Navigate to `ielts.html#writing`, test the 4-Sentence Paragraph Workbench live validation.

---

## 5. Floor Fleet Allocation & Contracts

1. **`jim-mul1meuh` (Jim - ENG-110)**: Content extraction & Markdown curriculum partitioning from `IELTS_Band7_Udemy_Complete_Course.md` into `web/content/ielts/course/` (7 modular files).
2. **`dwight-mul1u508` (Dwight - ENG-111)**: Compiler expansion in `web/scripts/compile-content.cjs` + Diagnostic Engine & Error Profiling logic.
3. **`andy-mul1ug04` (Andy - ENG-112)**: Listening Distractor/Correction Engine heuristics + Speaking Cue Card 1-Minute Prep Simulator & Comparative Model Audio.
4. **`phyllis-mul1ur07` (Phyllis - ENG-113)**: IELTS Cockpit UI Upgrades (`strategy.ts`, `writing.ts` Task 1 Visual Inspector & Task 2 4-Sentence Paragraph Workbench, styling).
5. **`jim-mum0qdlb` (JimMA - ENG-114)**: Verification test suite `verify-ielts-course-pipeline.cjs`, production Vite build, repacked desktop `app.asar`, and Puppeteer E2E tests 20 & 21.
