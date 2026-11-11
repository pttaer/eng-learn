# Four Pillars Study Workbenches 10/10 Perfection Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate all 4 Core Pillars (Reading Lab, Zen Mode, Franklin Copywork Studio, Listening Chamber, and Speaking Studio) from their current 7.34/10 average to a flawless 10/10 across aesthetics, cleanliness, UX flow, anti-clutter (zero cognitive overload), and long-session learning comfort.

**Architecture:** 
1. Upgrade Myers-Hirschberg diff engine from character-level fragmentation (`normOriginal.split('')`) to semantic word/token-level diff (`tokenizeWords`), eliminating the chaotic letter-soup in Step 3.
2. Perfect Zen Mode by hiding all redundant toolbars/steppers/subtabs via CSS `#app.zen-active`, fixing the floating rescue pill collision bug, and removing the desktop `Esc` key on mobile.
3. Streamline Reading Pass 1 layout by collapsing 7 stacked control tiers into a compact HUD header, bringing article text above the mobile fold.
4. Convert Speaking Studio's 3-row stacked mode buttons into an Apple-calm horizontal chip strip per `AGENTS.md` Rule 7.

**Tech Stack:** TypeScript, Vanilla CSS (CSS Variables, Apple Motion Tokens), Puppeteer (verification snapshots), Node.js verification scripts.

**Spec:** [`docs/TYPOGRAPHY_SPACING_RULES.md`](file:///e:/Eng/docs/TYPOGRAPHY_SPACING_RULES.md), [`AGENTS.md`](file:///e:/Eng/AGENTS.md)

## Global Constraints
- **Universal Radius:** All interactive buttons declare `border-radius: var(--radius-btn, 10px);`.
- **Breakpoint:** Exactly one boundary at 768px (`max-width: 768px`). No arbitrary breakpoints.
- **Tab Invariant:** No vertical stacking of horizontal tabs on mobile (use horizontal scroll per `AGENTS.md` §1 Rule 7).
- **Dock Clearance:** Views under fixed bottom navigation maintain `--safe-bottom-dock: 84px` clearance.
- **Zero External Dependencies:** 100% offline, local computation, zero external API calls.
- **Verification:** Run `npm test` in `web/` and capture new screenshots with `scripts/capture-all-flows.cjs` to confirm 10/10 visual perfection.

---

### Task 1: Semantic Word-Level Myers-Hirschberg Diff Engine

**Files:**
- Modify: `web/src/modules/writing-dossier.ts:31-110,404-422`
- Test: `web/src/core/writing-dossier.test.ts` (or verify via `npm test`)

**Interfaces:**
- Consumes: `masterSentence: string`, `typedContent: string`
- Produces: `computeDiffTokens(original: string, candidate: string): ProofreadDiffToken[]` with clean word/whitespace/punctuation tokens, preventing letter shredding.

- [ ] **Step 1: Write unit tests for word-level token diff**
Test that `computeDiffTokens("Over the past five years", "Rarely have institutional investors")` produces whole-word diff tokens (`delete` "Rarely", `delete` "have", etc. and `insert` "Over", `insert` "the", etc.) rather than broken individual characters like `'O'`, `'v'`, `'e'`.

- [ ] **Step 2: Refactor `computeDiffTokens` to word-level tokenization**
Replace `normOriginal.split('')` with a regex tokenizer:
```typescript
export function tokenizeWords(text: string): string[] {
  return text.match(/[\w'-]+|[^\w\s]|\s+/g) || [];
}
```
Compute Myers LCS table over word tokens `o = tokenizeWords(normOriginal)` and `c = tokenizeWords(normCandidate)`.

- [ ] **Step 3: Enhance diff rendering with clean pedagogical styling**
In `renderDiffHTML(tokens)`:
- Display matching words in `var(--ink-primary)`.
- Display omitted/target words in soft green/gold pill badge (`diff-insert`).
- Display extra/incorrect words with clean strikethrough (`diff-delete`).
- Add a parallel reference toggle: allow the learner to view side-by-side: "Bản bạn gõ" vs "Câu chuẩn", eliminating all visual confusion.

- [ ] **Step 4: Verify via test suite**
Run: `cd web; npm test`
Expected: PASS 91/91 scripts with no compiler errors.

- [ ] **Step 5: Commit**
`git commit -am "fix(writing): upgrade myers diff to semantic word-level tokenization"`

---

### Task 2: Pure Zen Immersion Mode & Floating Rescue Pill Fix

**Files:**
- Modify: `web/src/assets/styles/hud-base.css:1157-1280`
- Modify: `web/src/core/zen-mode.ts:160-210`

**Interfaces:**
- Consumes: `.zen-active` class on `#app`
- Produces: True zero-chrome distraction-free reading with safe top gutter and responsive rescue pill.

- [ ] **Step 1: Hide all Reading Dossier chrome in Zen Mode**
In `web/src/assets/styles/hud-base.css`:
Add selectors under `#app.zen-active`:
```css
#app.zen-active .reading-mode-bar,
#app.zen-active .reading-pass-stepper,
#app.zen-active .pass-skim-timer-card,
#app.zen-active .reading-subtabs,
#app.zen-active .article-meta-telemetry,
#app.zen-active .dossier-control-bar {
  display: none !important;
  opacity: 0 !important;
  pointer-events: none !important;
}
```

- [ ] **Step 2: Fix floating pill top spacing & overlap bug**
Adjust `#app.zen-active #workspace-mount` and container padding:
```css
#app.zen-active #workspace-mount {
  padding-top: clamp(64px, 10vh, 96px) !important;
}
```
Ensure `.zen-floating-pill` has a strong frosted glass backdrop:
```css
.zen-floating-pill {
  background: rgba(10, 14, 23, 0.90) !important;
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4) !important;
}
```

- [ ] **Step 3: Responsive rescue pill (remove desktop Esc on mobile)**
In `hud-base.css`:
```css
@media (max-width: 768px) {
  .zen-floating-pill .zen-pill-kbd {
    display: none !important;
  }
}
```

- [ ] **Step 4: Verify via test suite**
Run: `cd web; npm test`
Expected: PASS.

- [ ] **Step 5: Commit**
`git commit -am "fix(zen): pure distraction-free reading chrome and pill overlap clearance"`

---

### Task 3: Streamlined Reading Pass 1 & Anti-Control Overload

**Files:**
- Modify: `web/src/modules/reading-dossier.ts:416-520`
- Modify: `web/src/assets/styles/dossiers.css` (or `ux-c.css`)

**Interfaces:**
- Consumes: `articles: ReadingArticle[]`, `currentPass: ReadingPass`
- Produces: Above-the-fold article visibility with compact metadata and stepper.

- [ ] **Step 1: Consolidate metadata & mode selector**
Merge the bulky telemetry and CEFR bar into a cohesive, space-saving bar:
- Combine `Art 01`, `CEFR: B2`, and `286 words · 2.0 min` into an elegant single-line header on mobile.
- Make the 4-Pass Stepper (`01 ĐỌC LƯỚT -> 02 BỘ KHUNG -> 03 TỪ VỰNG -> 04 TỔNG HỢP`) a sleek compact pill strip.

- [ ] **Step 2: Optimize Pass 1 Skim Timer Card**
In Pass 1 Cold Read:
- Instead of a huge standalone card that pushes text offscreen, render the 60s Skim timer as a compact top bar with `Start 60s Skim` and mini countdown.
- Ensure the article title and first paragraph are immediately visible above the fold on mobile screens (≥375px).

- [ ] **Step 3: Verify via test suite**
Run: `cd web; npm test`
Expected: PASS.

- [ ] **Step 4: Commit**
`git commit -am "refactor(reading): streamline header layout to bring article text above fold"`

---

### Task 4: Speaking Studio Mobile Tab Strip Fix (`AGENTS.md` Rule 7)

**Files:**
- Modify: `web/src/assets/styles/ux-c.css:844-880`
- Modify: `web/src/assets/styles/dossiers.css:4679-4708`

**Interfaces:**
- Consumes: `.speaking-mode-cluster` containing 4 mode tabs.
- Produces: Single-line horizontal scrollable tab strip, saving ~90px vertical height.

- [ ] **Step 1: Replace `flex-wrap: wrap` with horizontal scroll on mobile**
In `web/src/assets/styles/ux-c.css`:
```css
.speaking-mode-cluster {
  display: flex !important;
  flex-wrap: nowrap !important;
  overflow-x: auto !important;
  overflow-y: hidden !important;
  -webkit-overflow-scrolling: touch !important;
  gap: 8px !important;
  padding-bottom: 4px !important;
  scrollbar-width: none !important;
}
.speaking-mode-cluster::-webkit-scrollbar {
  display: none !important;
}
.speaking-mode-cluster > * {
  flex: 0 0 auto !important;
  white-space: nowrap !important;
}
```

- [ ] **Step 2: Ensure button touch floor and active state polish**
Ensure all mode buttons declare `min-height: 44px`, `border-radius: var(--radius-btn, 10px)`, and symmetrical icon/label alignment.

- [ ] **Step 3: Verify via test suite**
Run: `cd web; npm test`
Expected: PASS.

- [ ] **Step 4: Commit**
`git commit -am "fix(speaking): convert stacked mode tabs into horizontal scroll per AGENTS.md rule 7"`

---

### Task 5: Recapture & Visual Verification

**Files:**
- Run: `scripts/capture-all-flows.cjs`
- Output: `Mobile/vivo/03-four-pillars/*.png`

- [ ] **Step 1: Build production bundle**
Run: `cd web; npm run build`
Verify `web/dist` is up to date with zero errors.

- [ ] **Step 2: Recapture Flow 03 screenshots**
Run script to regenerate all 17 screenshots in `Mobile/vivo/03-four-pillars`.

- [ ] **Step 3: Adversarial Visual Review**
Inspect all generated images to confirm:
- Writing Diff is 100% legible with whole words.
- Zen mode is pure distraction-free with zero overlap bugs.
- Reading Pass 1 shows article text above the fold.
- Speaking Studio is compact with single-line horizontal tabs.

- [ ] **Step 4: Final verification and status report**
Confirm all 17 screenshots meet 10/10 standards.

