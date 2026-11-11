# Task 1: Semantic Word-Level Myers-Hirschberg Diff Engine

**Location in project:** Franklin Copywork Studio (Trụ cột 03 - Step 3: Myers-Hirschberg Split-Diff Evaluation).
**Files to modify:**
- `web/src/modules/writing-dossier.ts`

**Requirements:**
1. Currently in `web/src/modules/writing-dossier.ts`, `computeDiffTokens(original, candidate)` does:
   `const o = normOriginal.split('');`
   `const c = normCandidate.split('');`
   This performs character-by-character diff. When the user types a reconstructed sentence with mismatched words, it matches occasional single characters across words, resulting in an unreadable soup of chopped strikethrough characters (e.g. `θ R ∀ a e r th e - l past five y ears, l have l earn e s d th i a t...`).
2. Implement semantic word/token-level diff:
   Create a helper `tokenizeWords(text: string): string[]`:
   Preserve words, contractions, hyphenated words, punctuation, and whitespace sequences:
   Regex: `text.match(/[\w'-]+|[^\w\s]|\s+/g) || []`
3. In `computeDiffTokens(original: string, candidate: string): ProofreadDiffToken[]`:
   Tokenize `o = tokenizeWords(normOriginal)` and `c = tokenizeWords(normCandidate)`.
   Run the Myers LCS dynamic programming matrix over these word/token arrays.
   When reconstructing `tokens`, `token.value` will now be whole words, punctuation, or whitespace.
4. In `calculateWritingMetrics`:
   Ensure `errorCount` and `matchCount` calculate cleanly (e.g., matching word count vs missing/extra words).
   Make sure `accuracyPct` is a valid number 0-100 without NaN.
5. In `renderDiffHTML(tokens: ProofreadDiffToken[])`:
   Render whole-word diff cleanly:
   - `match`: `<span class="diff-match" style="color: var(--ink-primary);">${this.escapeHTML(chunk.value)}</span>`
   - `delete`: `<span class="diff-delete" style="color: #ef4444; text-decoration: line-through; background: rgba(239, 68, 68, 0.12); padding: 1px 4px; border-radius: 4px; margin: 0 1px;">${this.escapeHTML(chunk.value)}</span>`
   - `insert`: `<span class="diff-insert" style="color: var(--accent-gold); font-weight: 600; background: var(--accent-gold-soft); padding: 1px 4px; border-radius: 4px; margin: 0 1px;">${this.escapeHTML(chunk.value)}</span>`
   (Combine adjacent whitespace cleanly so words don't bunch up).
6. Also add a clean side-by-side or dual comparison block in Step 3 if appropriate, or ensure the word-level diff container has clean typography, line-height 1.8, and zero visual clutter.
7. Verification: Run `cd web; npm test` (or `tsc --noEmit && node scripts/run-verify.cjs`). It must PASS 91/91 scripts with 0 errors.
8. Write execution report to `.superpowers/sdd/2026-11-11-four-pillars-perfection-plan/task-1-report.md`.

