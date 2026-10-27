# Mobile-First IELTS Reading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement mobile-first enhancements for IELTS Academic Reading: persistent bottom dock with timer and scroll memory, pure-offset text highlight engine, two-way sentence evidence cross-linking, and live word-limit validation with targeted miss feedback.

**Architecture:** Pure function logic for offset projections, interval merging, and constraint validation; modular extension of `reading.ts`, `questions.ts`, and `scoring.ts`; strictly responsive via single 768px boundary with desktop untouched; mount-safe teardown.

**Tech Stack:** TypeScript (ES2022), Vanilla DOM APIs, CSS variables, Node.js verify test runner.

**Spec:** [`docs/superpowers/specs/2026-10-27-mobile-ielts-reading-design.md`](file:///e:/Eng/docs/superpowers/specs/2026-10-27-mobile-ielts-reading-design.md)

## Global Constraints

- **Breakpoint:** Exactly one breakpoint boundary at 768px (`max-width: 768px` for mobile, `width > 768px` for desktop). No arbitrary 600, 640, or 800px queries.
- **Tokens:** Single source of truth `--pad-screen-left: 12px;`, `--pad-screen-right: 12px;`, `--safe-bottom-dock: 84px;`, `--touch-target-min: 44px;`.
- **Form Elements:** `font-size: max(16px, var(--font-body))` on inputs to prevent iOS Safari auto-zoom.
- **API Isolation:** 100% offline, local synchronous computation, zero external API calls or LLM dependencies.
- **Backward Compatibility:** Zero breaking changes to `mock.ts`, diagnostic engine, or `isCorrect()` boolean return signature.

---

### Task 1: Type Definitions & Schema Enhancements

**Files:**
- Modify: `web/src/ielts/types.ts`

**Interfaces:**
- Consumes: Existing `IeltsQuestion`, `ReadingPassage`
- Produces: `TextOffsetRange`, `UserHighlight`, `EvidenceAnchor`, `WordConstraint`, and augmented `IeltsQuestion`

- [x] **Step 1: Update `types.ts` with offset, evidence, and constraint interfaces**
  Add the shared offset schema, user highlight interface, evidence anchor, and optional constraint fields:
  ```ts
  export interface TextOffsetRange {
    paraIndex: number;
    start: number;
    end: number;
  }

  export interface UserHighlight extends TextOffsetRange {
    id: string;
  }

  export interface EvidenceAnchor extends TextOffsetRange {
    evidenceText?: string;
  }

  export interface WordConstraint {
    maxWords: number;
    allowNumber: boolean;
  }
  ```
  Add optional fields to `IeltsQuestion`:
  ```ts
  maxWords?: number;
  allowNumber?: boolean;
  instruction?: string;
  evidence?: EvidenceAnchor | null;
  ```

- [x] **Step 2: Run typecheck to verify no breakages**
  Run: `cd web && npx tsc --noEmit`
  Expected: Success with 0 errors.

- [x] **Step 3: Commit changes**
  Run: `git add web/src/ielts/types.ts && git commit -m "feat(ielts): add reading offset and constraint type interfaces"`

---

### Task 2: Pure Functions & Unit Tests (Word Limits, Miss Diagnostics, Highlight Interval Merge, Paragraph Text Projection)

**Files:**
- Create: `web/src/ielts/reading-engine.ts`
- Create: `web/test/reading-engine.test.cjs`

**Interfaces:**
- Consumes: `TextOffsetRange`, `UserHighlight`, `WordConstraint`, `IeltsQuestion`
- Produces: `parseWordConstraint()`, `isWithinLimit()`, `explainMiss()`, `mergeHighlightRanges()`, `renderParagraphSpans()`

- [x] **Step 1: Write unit tests for pure functions**
  Create `web/test/reading-engine.test.cjs` covering:
  - `parseWordConstraint` across all regex clauses (strict specific to loose, `A NUMBER ONLY`, `NO MORE THAN TWO WORDS AND/OR A NUMBER`).
  - `isWithinLimit` validating word counts and number allowances.
  - `explainMiss` distinguishing between `correct`, `exceeded_limit` (with subset match), and `wrong`.
  - `mergeHighlightRanges` sorting and collapsing contiguous/overlapping intervals.
  - `renderParagraphSpans` slicing text into clean intervals with `.ie-mark` and `.ie-evidence`.

- [x] **Step 2: Implement pure functions in `web/src/ielts/reading-engine.ts`**
  - Implement `parseWordConstraint(text: string): WordConstraint | null`.
  - Implement `isWithinLimit(answer: string, maxWords: number | null, allowNumber = true): boolean`.
  - Implement `explainMiss(q: IeltsQuestion, given: string): 'correct' | 'exceeded_limit' | 'wrong'`.
  - Implement `mergeHighlightRanges(ranges: TextOffsetRange[]): TextOffsetRange[]`.
  - Implement `renderParagraphSpans(text: string, userMarks: TextOffsetRange[], transientEvidence?: TextOffsetRange): DocumentFragment`.

- [x] **Step 3: Run the unit test suite**
  Run: `node web/test/reading-engine.test.cjs`
  Expected: All assertion tests pass.

- [x] **Step 4: Commit changes**
  Run: `git add web/src/ielts/reading-engine.ts web/test/reading-engine.test.cjs && git commit -m "feat(ielts): add reading engine pure functions with unit tests"`

---

### Task 3: Dev-Time Invariant Validator (Rule 18)

**Files:**
- Create: `web/scripts/verify-reading-invariants.cjs`

**Interfaces:**
- Consumes: `web/src/ielts/data/reading.json`
- Produces: Verification CLI script running as part of test pipeline

- [x] **Step 1: Write invariant verification script**
  Iterate all 30 passages in `reading.json`:
  1. For every question with accepted answers: verify each accepted answer string passes `isWithinLimit(ans, q.maxWords, q.allowNumber)`. Fail loud if any accepted answer exceeds the parsed limit.
  2. For every question with an `evidence` anchor: verify `paraIndex < passage.paragraphs.length`, `start >= 0`, `end <= para.text.length`, and if `evidenceText` is present, `para.text.slice(start, end)` matches `evidenceText`.
  3. Ensure zero unparsed completion questions without logged/handled constraints.

- [x] **Step 2: Run verification script**
  Run: `node web/scripts/verify-reading-invariants.cjs`
  Expected: Passes or surfaces explicit authoring warnings.

- [x] **Step 3: Commit changes**
  Run: `git add web/scripts/verify-reading-invariants.cjs && git commit -m "test(ielts): add dev-time verification script for reading invariants"`

---

### Task 4: Real-Time Word Meter & Delegated Answered Counter in Questions View

**Files:**
- Modify: `web/src/ielts/questions.ts`

**Interfaces:**
- Consumes: `parseWordConstraint`, `isWithinLimit`, `explainMiss` from `reading-engine.ts`
- Produces: Dynamic `.ie-word-meter` attached to text inputs, answered count callback, and `Inspect in passage` action buttons on review.

- [x] **Step 1: Add live word meter to input controls**
  In `control()` inside `questions.ts`:
  - When rendering text input, parse `q.maxWords` and `q.allowNumber`.
  - If `q.maxWords != null`, render `<span class="ie-word-meter">0/${q.maxWords} words</span>`.
  - On `input` event, calculate word count; toggle `.is-exceeded` class when exceeding limit.

- [x] **Step 2: Add delegated listener for answered count**
  In `renderQuestions(questions, startAt, onChange)`:
  - Add delegated `change` and `input` handler counting non-empty answers (trimmed strings for text, selected radios/selects).
  - Fire `onChange(answeredCount, totalQuestions)`.

- [x] **Step 3: Update `reveal()` with `explainMiss` & `Inspect in passage` trigger**
  - When revealing answers after submission, if wrong and `explainMiss` returns `'exceeded_limit'`, append an amber alert tag: `"Contains correct terms but exceeded word limit (${q.maxWords} words max)"`.
  - For questions with `evidence` anchor, render `<button class="ie-btn-inspect-evidence" data-qid="${q.id}">Inspect in passage</button>`.
  - For NOT GIVEN questions with `evidence: null`, render `<span class="ie-evidence-silent">No evidence in passage (NOT GIVEN)</span>`.

- [x] **Step 4: Verify questions module with build check**
  Run: `cd web && npx tsc --noEmit`
  Expected: Clean compile.

- [x] **Step 5: Commit changes**
  Run: `git add web/src/ielts/questions.ts && git commit -m "feat(ielts): add live word meter and inspect-evidence action to questions"`

---

### Task 5: Mobile Bottom Dock, Scroll Memory & Keyboard Handling

**Files:**
- Modify: `web/src/ielts/views/reading.ts`

**Interfaces:**
- Consumes: DOM elements from `mountReadingTest`
- Produces: Mobile bottom dock, independent pane scroll restoration, keyboard focus hide/restore.

- [x] **Step 1: Implement mobile media query detector & tab controller**
  - Use `window.matchMedia('(max-width: 768px)')`.
  - Create `.ie-reading-dock` with elements:
    - Timer badge (`.ie-clock`)
    - `[ 📖 Passage ]` button
    - `[ ✍️ Questions (X/N) ]` button
  - When viewport switches to desktop (`> 768px`), automatically unhide both panes and remove mobile active classes.

- [x] **Step 2: Implement pane scroll memory**
  - Store `scrollPositions: Map<string, { passage: number; questions: number }>` keyed by passage ID.
  - On switching from Passage to Questions: save `passagePane.scrollTop`.
  - On switching to Questions: restore `questionsPane.scrollTop` via `requestAnimationFrame`.
  - On switching from Questions to Passage: save `questionsPane.scrollTop`, restore `passagePane.scrollTop`.

- [x] **Step 3: Implement soft keyboard hide/restore with 100ms debounce**
  - Add delegated `focusin` on the container: if active element is `input, textarea`, add `.is-keyboard-open` to the dock (hiding it).
  - Add delegated `focusout` on the container: debounce 100ms before removing `.is-keyboard-open` (restoring dock without flicker when hopping between inputs).

- [x] **Step 4: Teardown hygiene**
  - In `stop()`, detach `matchMedia` listener, focus listeners, and clear scroll maps.

- [x] **Step 5: Commit changes**
  Run: `git add web/src/ielts/views/reading.ts && git commit -m "feat(ielts): add mobile bottom dock with scroll preservation and keyboard handling"`

---

### Task 6: Touch Text Highlighting & Evidence Cross-Linking Flow

**Files:**
- Modify: `web/src/ielts/views/reading.ts`

**Interfaces:**
- Consumes: `renderParagraphSpans`, `mergeHighlightRanges` from `reading-engine.ts`
- Produces: In-passage touch selection pill (`[ 🖍️ Highlight ] / [ ✕ Clear ]`), transient evidence glow, and sticky return chip.

- [x] **Step 1: Wire up passage paragraph rendering with offset engine**
  - Render each paragraph through `renderParagraphSpans(para.text, userHighlights, transientEvidence)`.
  - Add `data-para-index="${i}"` to each paragraph element.

- [x] **Step 2: Implement floating selection action pill**
  - Listen for `selectionchange` on document (when selection is inside `.ie-passage`).
  - Calculate selection bounding rect; position floating pill `.ie-selection-pill` above selection.
  - On clicking `Highlight`: convert `window.getSelection()` range into `{ paraIndex, start, end }`, split cross-paragraph selections, invoke `mergeHighlightRanges`, re-render paragraph spans, clear selection, and hide pill.
  - On clicking a highlighted span: show pill with `Clear highlight`.

- [x] **Step 3: Implement evidence jump & sticky return chip**
  - Attach click handler to `.ie-btn-inspect-evidence`:
    1. Extract question's `evidence` anchor.
    2. Switch to **Passage tab** (overriding scroll restoration).
    3. Set `transientEvidence` and re-render target paragraph.
    4. Call `evidenceSpan.scrollIntoView({ behavior: 'smooth', block: 'center' })`.
    5. Render sticky top chip `.ie-return-chip`: `[ ↩ Back to Question #X ]`.
    6. On clicking chip: switch to Questions tab, scroll question card into view with smooth center behavior, set `tabindex="-1"`, and focus card with `{ preventScroll: true }`.

- [x] **Step 4: Commit changes**
  Run: `git add web/src/ielts/views/reading.ts && git commit -m "feat(ielts): implement touch highlight pill and evidence cross-linking"`

---

### Task 7: CSS Architecture & Design Token Fidelity

**Files:**
- Modify: `web/src/ielts/ielts.css`

**Interfaces:**
- Consumes: Design tokens from `web/src/assets/styles/variables.css` (`--safe-bottom-dock`, `--touch-target-min`, `--pad-screen-left`, `--radius-squircle-sm`)
- Produces: CSS rules for dock, marks, word meters, and mobile overrides under `@media (max-width: 768px)`.

- [x] **Step 1: Style the mobile bottom dock**
  - Add `.ie-reading-dock`: fixed at bottom, `z-index: 50`, `min-height: var(--touch-target-min, 44px)`.
  - Padding: `padding: var(--space-8) var(--pad-screen-left) calc(var(--safe-bottom-dock, 84px) + env(safe-area-inset-bottom)) var(--pad-screen-left)`.
  - Buttons: squircle radii, 44px min touch target, smooth transitions.
  - Transition `.is-keyboard-open`: `transform: translateY(100%); opacity: 0; pointer-events: none;`.

- [x] **Step 2: Style marks, evidence glow, and word meters**
  - `.ie-mark`: Yellow accent highlight (`background: rgba(250, 204, 21, 0.35); border-radius: 2px; padding: 0 1px;`).
  - `.ie-evidence`: Calming emerald/cyan glow (`background: rgba(52, 211, 153, 0.35); box-shadow: 0 0 8px rgba(52, 211, 153, 0.5); border-bottom: 2px solid #10b981;`).
  - `.ie-word-meter`: compact kicker typography, font size 11px floor, transitioning to `.is-exceeded` (amber/red).
  - `.ie-return-chip`: sticky at top of passage pane, 44px touch height, shadow tactile.

- [x] **Step 3: Verify single breakpoint boundary**
  - Confirm all responsive overrides are grouped strictly under `@media (max-width: 768px)`.
  - Confirm desktop (`width > 768px`) displays dock as `display: none !important;`.

- [x] **Step 4: Commit changes**
  Run: `git add web/src/ielts/ielts.css && git commit -m "style(ielts): add mobile reading dock, highlight marks, and word meter styles"`

---

### Task 8: Verification & Regression Test Suite

**Files:**
- Create: `web/scripts/verify-reading-mobile.cjs`

**Interfaces:**
- Consumes: Test runner `web/scripts/run-verify.cjs`
- Produces: Automated verification report in the test pipeline

- [x] **Step 1: Implement full integration verification script**
  Test and verify:
  1. `cd web && npx tsc --noEmit` succeeds with zero errors.
  2. `node web/scripts/verify-reading-invariants.cjs` passes.
  3. All pure functions pass `node web/test/reading-engine.test.cjs`.
  4. Headless DOM simulation verifies:
     - Media query switch between desktop and mobile.
     - Scroll memory persistence between tab toggles.
     - Highlight interval merging.
     - `explainMiss` diagnostics.

- [x] **Step 2: Run complete project test suite**
  Run: `cd web && npm test`
  Expected: All verify scripts pass.

- [x] **Step 3: Commit changes**
  Run: `git add web/scripts/verify-reading-mobile.cjs && git commit -m "test(ielts): add automated verification test for mobile reading suite"`

