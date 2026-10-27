# Mobile-First IELTS Reading Architecture & Enhancements Spec

> **Date:** 2026-10-27  
> **Status:** Approved  
> **Target System:** IELTS Academic Reading Module (`web/src/ielts/`)

---

## 1. Overview & Problem Statement

IELTS Academic Reading tests assess 3 passages (40 questions total) in 60 minutes. While the desktop split layout (passage left, questions right) is functional, the mobile (`max-width: 768px`) experience suffers from critical usability bottlenecks:
1. **Vertical Stacking Penalty:** 800+ word passages sit directly above 13 questions, requiring repeated full-page scrolling between text and answer inputs.
2. **Absence of Exam Highlighting:** The official Computer-Delivered (CD) IELTS enables candidates to highlight keywords. On mobile touchscreens, native selection menus conflict with test workflows.
3. **Disconnected Review:** Post-test explanations cite evidence, but do not jump or visually surface the exact passage sentence.
4. **Silent Word-Limit Traps:** Prompts stipulating *"NO MORE THAN TWO WORDS"* give no real-time word feedback, risking avoidable zero marks.

---

## 2. Core Architectural Pillars

### Pillar A: Mobile Viewport & Persistent Bottom Switcher
* **Breakpoint:** Strictly `max-width: 768px` (using `matchMedia` listener to support screen rotation seamlessly). Desktop (`width > 768px`) remains untouched.
* **Persistent Bottom Dock:**
  * Located at the bottom of the viewport with `padding-bottom: calc(var(--safe-bottom-dock, 84px) + env(safe-area-inset-bottom))`.
  * Features thumb-reachable segmented controls:
    `[ ⏱ 19:45 ]  [ 📖 Passage ]  [ ✍️ Questions (X/13) ]`
  * Dynamic counter tracks answered items (`X / N`), where "answered" means non-empty after `trim()`. Delegated `change`/`input` listener on questions container.
* **Independent Scroll Preservation:**
  * Switching between tabs saves `scrollTop` per pane.
  * On tab switch, `scrollTop` is restored inside `requestAnimationFrame`.
  * Evidence jump overrides restored scroll position.
* **Soft Keyboard Management:**
  * Delegated `focusin` / `focusout` on the container.
  * `focusin` immediately hides the bottom dock to maximize visible viewport.
  * `focusout` restores the bottom dock after a 100ms debounce (preventing flicker when tabbing between consecutive inputs).

---

### Pillar B: Text Highlighting & Offset Engine
* **Shared Offset Schema:**
  ```ts
  export interface TextOffsetRange {
    paraIndex: number;
    start: number;
    end: number;
  }

  export interface UserHighlight extends TextOffsetRange {
    id: string;
  }
  ```
* **Pure Model Source of Truth:**
  * Highlight state is maintained in a `Map<string, UserHighlight[]>` keyed by `passageId` (retained across tab swaps and mock passage transitions, cleaned up on test teardown).
  * On adding a highlight, overlapping and contiguous intervals are automatically merged.
  * Multi-paragraph selections are split into per-paragraph offsets.
* **Single Boundary-Split Projection Function:**
  ```ts
  export function renderParagraph(
    text: string,
    userMarks: TextOffsetRange[],
    transientEvidence?: TextOffsetRange
  ): HTMLElement
  ```
  * Gathers all boundaries `[0, mark.start, mark.end, ..., text.length]`, sorts them, and iterates sliced spans.
  * User marks receive `.ie-mark`. Overlapping transient evidence receives `.ie-evidence` (cyan/emerald glow with visual priority).
* **Floating Touch Action Pill:**
  * When a text selection occurs inside the passage, a compact floating pill appears:
    `[ 🖍️ Highlight ]` / `[ ✕ Clear ]`
  * Tapping `Highlight` commits the range and clears native window selection.

---

### Pillar C: Sentence-Level Evidence Anchoring & Cross-Linking
* **Question Evidence Schema:**
  ```ts
  export interface EvidenceAnchor {
    paraIndex: number;
    start: number;
    end: number;
    evidenceText?: string;
  }
  ```
* **Question Item Rules:**
  * **Not Given Questions:** `evidence: null`. The "Inspect in passage" button is omitted and replaced with a muted tag: `Silent in passage (NOT GIVEN)`.
  * **Matching Headings:** Anchors the entire paragraph (`start: 0, end: text.length`).
  * **Dev-time Invariant:** If `evidenceText` is present, `assert(para.text.slice(start, end) === evidenceText)`.
* **Two-Way Jump Flow:**
  1. On clicking `[ 🔍 Inspect in passage ]` on a question:
  2. Activates the **Passage tab** (overriding scroll restoration).
  3. Projects transient `.ie-evidence` range onto the target paragraph.
  4. Calls `evidenceSpan.scrollIntoView({ behavior: 'smooth', block: 'center' })`.
  5. Renders a sticky top banner: `[ ↩ Back to Question #X ]`.
  6. Clicking the back chip returns to the Questions tab, invokes `card.scrollIntoView({ behavior: 'smooth', block: 'center' })`, sets `tabindex="-1"`, and focuses the card with `{ preventScroll: true }` (avoiding soft keyboard popups).

---

### Pillar D: Live Word-Limit Validation Engine & Miss Diagnostics
* **Constraint Parsing Semantics (Fix 3 & Fix 4):**
  * Parsed once on test initialization into:
    ```ts
    export interface WordConstraint {
      maxWords: number;
      allowNumber: boolean;
    }
    ```
  * Semantic rules:
    - `"A NUMBER ONLY"` / `"ONE NUMBER ONLY"`: `maxWords: 0, allowNumber: true`.
    - `"NO MORE THAN TWO WORDS AND/OR A NUMBER"`: `maxWords: 2, allowNumber: true`.
    - `"NO MORE THAN THREE WORDS"`: `maxWords: 3, allowNumber: false`.
    - `"ONE WORD ONLY"`: `maxWords: 1, allowNumber: false`.
  * Regex matching is ordered from most specific to loosest with word boundaries:
    1. `/NO MORE THAN ONE WORD(?:\s+AND\/OR A NUMBER)?/i` -> `{ maxWords: 1, allowNumber: /NUMBER/i.test(...) }`
    2. `/NO MORE THAN TWO WORDS(?:\s+AND\/OR A NUMBER)?/i` -> `{ maxWords: 2, allowNumber: /NUMBER/i.test(...) }`
    3. `/NO MORE THAN THREE WORDS(?:\s+AND\/OR A NUMBER)?/i` -> `{ maxWords: 3, allowNumber: /NUMBER/i.test(...) }`
    4. `/\b(?:A|ONE)\s+NUMBER\s+ONLY\b/i` -> `{ maxWords: 0, allowNumber: true }`
    5. `/\bONE WORD(?:\s+ONLY)?(?:\s+AND\/OR A NUMBER)?\b/i` -> `{ maxWords: 1, allowNumber: /NUMBER/i.test(...) }`
  * Questions without a parsed constraint on completion types default to standard fallback (`maxWords: 3, allowNumber: true`) with a dev-time warning logged.
  * Unconstrained questions (`q.maxWords == null` e.g. radios, selects) always return `true`.

* **Validation Function (`isWithinLimit`):**
  ```ts
  export function isWithinLimit(answer: string, maxWords: number | null, allowNumber: boolean = true): boolean {
    if (maxWords == null) return true;
    const tokens = answer.trim().split(/\s+/).filter(Boolean);
    if (!tokens.length) return true;
    
    let words = 0;
    let numbers = 0;
    for (const t of tokens) {
      if (/^\d+(?:[.,]\d+)?%?$/.test(t)) {
        numbers++;
      } else {
        words++;
      }
    }
    if (numbers > (allowNumber ? 1 : 0)) return false;
    return words <= maxWords;
  }
  ```

* **Dev-Time Invariant Check (Fix 1 - Rule 18):**
  * On module load / test run, iterate every accepted answer in `reading.json` across completion questions.
  * Verify `assert(isWithinLimit(acceptedAnswer, q.maxWords, q.allowNumber))` passes for 100% of authored answers. Fail loud on any discrepancy.

* **Targeted Miss Diagnostics (`explainMiss` - Fix 2):**
  * `isCorrect(q, given): boolean` remains strictly boolean to protect existing callers.
  * A dedicated diagnostic helper handles post-test feedback:
    ```ts
    export type MissReason = 'correct' | 'exceeded_limit' | 'wrong';
    export function explainMiss(q: IeltsQuestion, given: string): MissReason {
      if (isCorrect(q, given)) return 'correct';
      if (!isWithinLimit(given, q.maxWords ?? null, q.allowNumber ?? true)) {
        const normGiven = norm(given);
        const accepted = Array.isArray(q.answer) ? q.answer : [q.answer];
        // Only trigger exceeded_limit if the candidate actually wrote the key terms plus extra words
        if (accepted.some(a => normGiven.includes(norm(a)))) {
          return 'exceeded_limit';
        }
      }
      return 'wrong';
    }
    ```
  * In the UI, if `explainMiss` returns `'exceeded_limit'`, the feedback highlights: *"Contains the correct keywords, but exceeds the word limit (maximum ${q.maxWords} words) — automatic zero in IELTS."*

* **Real-Time Input Badge:**
  * Fill-in-the-blank inputs render an adjacent `.ie-word-meter`:
    - `1/2 words` (subtle ink secondary).
    - `3/2 words (Exceeds limit!)` with `.is-exceeded` (amber/red indicator).


---

## 3. Files & Modules Affected

| File | Nature of Changes |
| :--- | :--- |
| [`web/src/ielts/types.ts`](file:///e:/Eng/web/src/ielts/types.ts) | Add `TextOffsetRange`, `UserHighlight`, `EvidenceAnchor`, and update `IeltsQuestion` with `evidence`, `maxWords`, `allowNumber`. |
| [`web/src/ielts/scoring.ts`](file:///e:/Eng/web/src/ielts/scoring.ts) | Add shared `isWithinLimit()` and `countWords()` utilities. |
| [`web/src/ielts/questions.ts`](file:///e:/Eng/web/src/ielts/questions.ts) | Add `parseWordLimit()`, render dynamic word count meters, add delegated answered-count listeners, and render `Inspect in passage` actions. |
| [`web/src/ielts/views/reading.ts`](file:///e:/Eng/web/src/ielts/views/reading.ts) | Implement mobile bottom dock, scroll position memory, selection highlight floating menu, transient evidence projection, and return chip. |
| [`web/src/ielts/ielts.css`](file:///e:/Eng/web/src/ielts/ielts.css) | Add styling for `.ie-reading-dock`, `.ie-mark`, `.ie-evidence`, `.ie-word-meter`, `.ie-return-chip`, and media query overrides for `<= 768px`. |
| [`web/src/ielts/data/reading.json`](file:///e:/Eng/web/src/ielts/data/reading.json) | Integrate authored evidence offsets for reading passages. |

---

## 4. Verification & Testing Criteria

1. **Mobile Responsiveness:** At 390px viewport, verify the bottom dock is visible with 44px tap targets, timer is legible, and tabs switch smoothly.
2. **Keyboard Interaction:** On focusing any text input, verify the dock disappears immediately, and reappears 100ms after blur without layout jumping.
3. **Scroll Restoration:** Scroll Passage to Paragraph E -> switch to Questions -> scroll to Q8 -> switch back to Passage -> verify position is still at Paragraph E.
4. **Highlighting & Merging:** Select text across two words -> tap Highlight -> select overlapping word -> verify single merged `<mark>`.
5. **Evidence Jump:** Submit test -> tap `Inspect in passage` on Q2 -> verify passage opens, sentence pulses in green/blue, and tapping `Back to Question #2` returns to the question card.
6. **Word Count Validation:** Type 3 words in a "NO MORE THAN TWO WORDS" input -> verify badge displays `3/2 words` in warning red, and scorer records violation.

