# IELTS Band 7+ Complete Prep Course Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fully operationalize the 35-section Udemy IELTS Band 7+ Complete Prep Course (~2.1 MB, 526+ lectures by Keino Campbell) into the English Singularity and IELTS Cockpit platforms with interactive strategy drawers, diagnostic profiling, 4-sentence paragraph validation, listening distractor heuristics, and automated test coverage.

**Architecture:** Decompose the 2.1 MB master document into 7 structured Markdown curriculum files under `web/content/ielts/course/`. Extend `compile-content.cjs` to emit rich JSON data structures. Engineer client-side diagnostic profiling and writing workbenches in `web/src/ielts/`, and verify via automated unit verification and Puppeteer E2E test suites.

**Tech Stack:** TypeScript, Node.js (CommonJS build scripts), Web Audio API, Vanilla DOM helpers (`ui.ts`), Vite, Puppeteer-Core.

**Spec:** `docs/superpowers/specs/2026-10-13-ielts-band7-udemy-course-integration-design.md`

## Global Constraints

- **Strict IELTS 9-Band Descriptors**: Criteria must explicitly map to TR/TA, CC, LR, and GRA for Writing, and FC, LR, GRA, and PR for Speaking.
- **20/80 Rule**: Strategy is kept concise and immediately actionable, pairing explanations directly with drills and visual formulas.
- **Zero New External Runtime Dependencies**: All parsing, heuristics, and evaluation must use native TypeScript and zero-dependency scripts.
- **Offline PWA / Electron Compatibility**: All emitted assets and logic must run locally in browser and Electron without external API requirements.

---

### Task 1: Content Extraction & Markdown Partitioning [ENG-110]

**Owner:** `jim-mul1meuh` (Jim)  
**Files:**
- Create: `web/content/ielts/course/01-diagnostics-foundations.md`
- Create: `web/content/ielts/course/02-listening-tactics.md`
- Create: `web/content/ielts/course/03-reading-14-types.md`
- Create: `web/content/ielts/course/04-cbt-navigation.md`
- Create: `web/content/ielts/course/05-writing-task1-formulas.md`
- Create: `web/content/ielts/course/06-writing-task2-architectures.md`
- Create: `web/content/ielts/course/07-speaking-mastery.md`

**Interfaces:**
- Consumes: `E:\Eng\docs\IELTS_Band7_Udemy_Complete_Course.md`
- Produces: 7 clean Markdown files under `web/content/ielts/course/` with YAML frontmatter, standardized `## Section` headers, and structured tables/lists ready for parsing.

- [ ] **Step 1: Create directory `web/content/ielts/course/`**
- [ ] **Step 2: Partition Foundations & Diagnostics (Sections 1–3)** into `01-diagnostics-foundations.md` with 20 diagnostic grammar and vocabulary questions, answer keys, and error impact metadata.
- [ ] **Step 3: Partition Listening Tactics (Sections 4–12)** into `02-listening-tactics.md` with Section 1–4 strategies, map/diagram directions, distractor rules (qualifiers, negative reversals, self-corrections), and exact-word guidelines.
- [ ] **Step 4: Partition Reading 14 Question Types (Sections 13–17)** into `03-reading-14-types.md` with scanning rules, keyword synonym pairs, step-by-step algorithms, and common traps for each of the 14 question types.
- [ ] **Step 5: Partition CBT Exam Navigation (Section 23)** into `04-cbt-navigation.md` with screen management, highlighting shortcuts, scratchpad strategies, and One Skill Retake (OSR) tactics.
- [ ] **Step 6: Partition Writing Task 1 Formulas (Sections 24–25)** into `05-writing-task1-formulas.md` with structural formulas for Line, Bar, Pie, Table, Process, and Maps, plus the 2-Sentence Overview rule.
- [ ] **Step 7: Partition Writing Task 2 Architectures (Sections 28–29)** into `06-writing-task2-architectures.md` with 5 essay architectures, the 4-sentence paragraph formula (Topic, Explanation, Evidence, Concluding), and transition matrices.
- [ ] **Step 8: Partition Speaking Mastery (Sections 30–35)** into `07-speaking-mastery.md` with Part 1–3 tactics, 1-min cue card 4-keyword notepad strategy, conversational fillers, and comparative Band 6.5 vs 7.5 vs 8.5 annotated responses.
- [ ] **Step 9: Commit partitioned content**

---

### Task 2: Compiler Pipeline Expansion & Diagnostic Engine [ENG-111]

**Owner:** `dwight-mul1u508` (Dwight)  
**Files:**
- Modify: `web/scripts/compile-content.cjs`
- Create: `web/src/ielts/diagnostic-engine.ts`
- Emit: `web/src/ielts/data/strategy.json` (35+ cards)
- Emit: `web/src/assets/data/ielts-course.json`

**Interfaces:**
- Consumes: `web/content/ielts/course/*.md`
- Produces: `compileIeltsCourse()` function in `compile-content.cjs` and `DiagnosticEngine` class:
  ```typescript
  export class DiagnosticEngine {
    static evaluateDiagnostic(answers: Record<string, number>, questions: DiagnosticQuestion[]): DiagnosticReport;
    static saveDiagnosticProfile(report: DiagnosticReport): void;
    static getDiagnosticProfile(): DiagnosticReport | null;
  }
  ```

- [ ] **Step 1: Write failing compiler test / verification script snippet for `compileIeltsCourse()`**
- [ ] **Step 2: Implement `compileIeltsCourse()` in `web/scripts/compile-content.cjs`** to parse all 7 course files, extracting strategy cards into `web/src/ielts/data/strategy.json` and diagnostic/formula data into `web/src/assets/data/ielts-course.json`.
- [ ] **Step 3: Run compiler script** (`node web/scripts/compile-content.cjs`) and verify `strategy.json` contains $\ge 30$ detailed cards.
- [ ] **Step 4: Implement `web/src/ielts/diagnostic-engine.ts`** with scoring calculation, error categorization (Tense Consistency, Subject-Verb Agreement, Article Omission, Clausal Subordination, Collocation Selection), and persistence via `localStorage` / `storage.ts`.
- [ ] **Step 5: Verify diagnostic engine logic with unit tests**
- [ ] **Step 6: Commit compiler and diagnostic engine**

---

### Task 3: Listening Distractor Engine & Speaking Prep Simulator [ENG-112]

**Owner:** `andy-mul1ug04` (Andy)  
**Files:**
- Create: `web/src/ielts/distractor-engine.ts`
- Modify: `web/src/ielts/views/speaking.ts`
- Modify: `web/src/ielts/types.ts`

**Interfaces:**
- Produces:
  ```typescript
  export class DistractorEngine {
    static detectTraps(text: string): { qualifiers: string[]; reversals: string[]; selfCorrections: string[]; riskLevel: 'low' | 'medium' | 'high' };
    static validateExactWord(userInput: string, passageTarget: string, maxWords: number): { valid: boolean; reason?: string };
  }
  ```
- speaking simulator enhancement: 60-second prep countdown + 4-keyword bullet scratchpad + Band 6.5 vs 7.5 vs 8.5 comparative model audios.

- [ ] **Step 1: Implement `DistractorEngine`** in `web/src/ielts/distractor-engine.ts` detecting qualifiers (`always`, `never`, `only`, `all`, `solely`), reversals (`however`, `but`, `on the contrary`, `instead`), and oral self-corrections (`no, wait`, `actually`, `I mean`, `rather`).
- [ ] **Step 2: Add exact-word word count and morphological inflection validator** enforcing zero added suffixes for IELTS fill-in-the-blank listening questions.
- [ ] **Step 3: Enhance `speakingView` in `web/src/ielts/views/speaking.ts`** with a dedicated Part 2 1-minute prep timer that displays a 4-bullet keyword notepad.
- [ ] **Step 4: Integrate Band 6.5, 7.5, and 8.5 comparative tabs** in the speaking cue card section with audio playback triggers using `tts.ts` and examiner annotations.
- [ ] **Step 5: Verify distractor heuristics and speaking timer interactions**
- [ ] **Step 6: Commit distractor engine and speaking simulator**

---

### Task 4: IELTS Cockpit UI: Strategy Explorer & Writing Workbenches [ENG-113]

**Owner:** `phyllis-mul1ur07` (Phyllis)  
**Files:**
- Modify: `web/src/ielts/views/strategy.ts`
- Modify: `web/src/ielts/views/writing.ts`
- Modify: `web/src/ielts/writing-heuristics.ts`
- Modify: `web/src/ielts/ielts.css`

**Interfaces:**
- Consumes: `web/src/ielts/data/strategy.json`, `web/src/assets/data/ielts-course.json`
- Produces:
  - Interactive multi-skill filter & search in `strategyView`.
  - Task 1 Visual Formula Inspector in `writingView`.
  - Task 2 4-Sentence Paragraph Workbench in `writingView` and `writing-heuristics.ts`.

- [ ] **Step 1: Upgrade `strategyView` in `web/src/ielts/views/strategy.ts`** with interactive skill tabs (`All`, `Listening`, `Reading`, `Writing Task 1`, `Writing Task 2`, `Speaking`, `CBT`), a search bar, and expandable drawer cards detailing formulas, traps, and synonym mappings.
- [ ] **Step 2: Enhance `writing-heuristics.ts`** with a `validateFourSentenceParagraph(text: string): ParagraphEvaluation` function checking sentence count, topic claims, causal linkers (`because`, `as a result`, `leads to`), evidence phrases (`for instance`, `specifically`), and impact conclusions (`consequently`, `thus`).
- [ ] **Step 3: Upgrade `writingView` in `web/src/ielts/views/writing.ts`** with:
  - Task 1: Visual Formula Inspector toggle showing the 4 structural components (Paraphrased Intro, 2-Sentence Overview, Body 1, Body 2) alongside the active chart.
  - Task 2: 4-Sentence Paragraph Workbench toggle providing real-time visual feedback on paragraph structure before essay submission.
- [ ] **Step 4: Style strategy cards, drawers, and writing workbenches** in `web/src/ielts/ielts.css` maintaining dark-theme design consistency and WCAG 2.2 AAA contrast.
- [ ] **Step 5: Verify interactive UI behavior and responsive layout**
- [ ] **Step 6: Commit UI upgrades**

---

### Task 5: Automated Verification Suite & Headless Browser QA [ENG-114]

**Owner:** `jim-mum0qdlb` (JimMA)  
**Files:**
- Create: `web/scripts/verify-ielts-course-pipeline.cjs`
- Modify: `web/scripts/browser-qa-test.cjs`
- Repack: `web/release/win-unpacked/resources/app.asar`

**Interfaces:**
- Consumes: All deliverables from ENG-110 through ENG-113
- Produces: 100% passing test assertion suite and browser E2E test report.

- [ ] **Step 1: Author verification test suite `web/scripts/verify-ielts-course-pipeline.cjs`** asserting:
  - All 7 partitioned Markdown course files exist and are populated.
  - `compileIeltsCourse()` successfully outputs `strategy.json` with $\ge 30$ cards across all skills.
  - `DistractorEngine` accurately flags traps and enforces exact-word constraints.
  - `validateFourSentenceParagraph` correctly scores structured vs incomplete paragraphs.
  - `DiagnosticEngine` correctly evaluates sample inputs and serializes profiles.
- [ ] **Step 2: Run verification test suite** (`node web/scripts/verify-ielts-course-pipeline.cjs`) and confirm 100% assertions pass.
- [ ] **Step 3: Run full TypeScript check** (`npx tsc --noEmit`) and verify 0 errors.
- [ ] **Step 4: Run full production Vite build** (`npm run build`) and verify clean compilation into `web/dist/`.
- [ ] **Step 5: Add Test 20 & Test 21 to `web/scripts/browser-qa-test.cjs`** verifying the strategy view filter drawers and writing paragraph workbench in headless Chrome.
- [ ] **Step 6: Run headless browser QA** (`node web/scripts/browser-qa-test.cjs`) and verify all 21 E2E tests pass cleanly.
- [ ] **Step 7: Repack desktop application `app.asar`** in `web/release/win-unpacked/resources/app.asar`.
- [ ] **Step 8: Commit verification test suite and build artifacts**
