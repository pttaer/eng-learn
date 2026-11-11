# Task 1 Report: Semantic Word-Level Myers-Hirschberg Diff Engine

**Status:** DONE  
**Completed At:** 2026-11-11T12:54:00+08:00  
**Target Files Modified:**
- `web/src/modules/writing-dossier.ts`

---

## 1. Problem Addressed
Previously in `web/src/modules/writing-dossier.ts`, `computeDiffTokens` split the original sentence and student candidate into character arrays (`normOriginal.split('')`). When learners reconstructed sentences with mismatched or rephrased words, the LCS dynamic programming matrix matched isolated matching characters between completely different words. This resulted in an unreadable visual soup of chopped strikethrough characters (e.g. `θ R ∀ a e r th e - l past five y ears, l have l earn e s d th i a t...`).

## 2. Technical Implementation Summary
1. **Semantic Word & Punctuation Tokenizer (`tokenizeWords`)**:
   - Added `tokenizeWords(text: string): string[]` using regex `/[\w'-]+|[^\w\s]|\s+/g`.
   - Correctly preserves words, contractions (`don't`), hyphenated compounds (`state-of-the-art`), punctuation symbols (`,`, `.`, `!`, `?`), and whitespace runs as atomic units.
2. **Word/Token-Level Myers LCS Diff Alignment (`computeDiffTokens`)**:
   - Tokenizes input strings into arrays of whole words and delimiters.
   - Computes dynamic programming alignment matrix over token sequences.
   - Backtracks to produce `ProofreadDiffToken[]` with whole-word units for `match`, `delete`, and `insert`.
3. **Telemetry & Writing Metrics Precision (`calculateWritingMetrics`)**:
   - Compares token-level matches against `targetTokens.length`.
   - Correctly handles trailing deletes (`trailingDeletes`) for partial sentence typing so learners are not penalized with active errors for untyped tails.
   - Computes `accuracyPct` defensively within `[0, 100]` with `Number.isFinite` guard, completely eliminating `NaN%`.
   - Computes completion flag: `matchCount === targetTokens.length && errorCount === 0`.
4. **Clean Whole-Word Diff Rendering (`renderDiffHTML`)**:
   - Merges contiguous tokens of the same diff type to avoid fragmented word wrapping.
   - Renders clean whole-word inline pills:
     - `match`: `<span class="diff-match" style="color: var(--ink-primary);">${this.escapeHTML(chunk.value)}</span>`
     - `delete`: `<span class="diff-delete" style="color: #ef4444; text-decoration: line-through; background: rgba(239, 68, 68, 0.12); padding: 1px 4px; border-radius: 4px; margin: 0 1px;">${this.escapeHTML(chunk.value)}</span>`
     - `insert`: `<span class="diff-insert" style="color: var(--accent-gold); font-weight: 600; background: var(--accent-gold-soft); padding: 1px 4px; border-radius: 4px; margin: 0 1px;">${this.escapeHTML(chunk.value)}</span>`
5. **UI & Typographic Polish in Step 3**:
   - Added a clear typographic diff legend in the section header (`● Matched`, `● Missing`, `● Inserted`).
   - Configured `.copywork-diff-container` with `white-space: pre-wrap; word-break: break-word; line-height: 1.8;` for seamless responsive wrapping down to 375px viewports.

---

## 3. Verification & Test Results
- Ran `cd web; npm test` (`tsc --noEmit && node scripts/run-verify.cjs`).
- **Result:** **91/91 verify scripts passed** with 0 errors.
- Ran standalone unit verification testing edge cases (contractions, partial typing, exact match, empty candidate, and complex word-substitution sentences) with 100% assertions passing.
