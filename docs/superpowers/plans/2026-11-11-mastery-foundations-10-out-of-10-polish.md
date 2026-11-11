# Mastery Foundations (Flow 04) 10/10 Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate all 27 views in Flow 04 (`Mobile/vivo/04-mastery-foundations`) to a flawless 10/10 in visual elegance, neatness, UX ergonomics, cognitive comfort, and zero clutter.

**Architecture:** Refactor UI renderers, typography, and responsive CSS across 6 modules (`vocabulary-dossier.ts`, `collocations-dossier.ts`, `grammar-dossier.ts`, `tenses-dossier.ts`, `lexicon-drawer.ts`, and `drills-dossier.ts`). Eliminate above-the-fold quiz clipping on mobile, fix multi-row tab wrapping into horizontal scrollers, format morphological dense text into structured semantic chips, remove desktop keyboard hints on mobile devices, transform drill cards to Card-as-Button, and fix modal drawer safe dock clearance.

**Tech Stack:** TypeScript, CSS3 custom properties (design tokens), Vite, Puppeteer, DOM manipulation.

**Spec:** `AGENTS.md` and `docs/TYPOGRAPHY_SPACING_RULES.md`

## Global Constraints

- Screen Inset: `--pad-screen-left: 12px;` and `--pad-screen-right: 12px;`
- Card Surface: `padding: 16px`, `border-radius: 12px` (or `--radius-squircle-md`), `border: 1px solid var(--border-hairline)`, internal vertical gap `8px`
- Buttons: `border-radius: var(--radius-btn, 10px);` tap floor >= 44px
- Mobile Breakpoint: exactly `768px` (`max-width: 768px`)
- Mobile Safe Dock Clearance: `--safe-bottom-dock: 84px` + `env(safe-area-inset-bottom)`
- Invariant 7: No vertical stacking of horizontal tabs on mobile (use horizontal scroll)
- Invariant 9: Card-as-Button with unbordered 44x44px top-right arrow affordance. Never squeeze full-width buttons into tile bottoms
- Invariant 16: File explorer folder tabs with uniform grid distribution (`repeat(N, 1fr)`)
- Zero-Scroll for active quizzes: The question and all 4 choices (A, B, C, D) must fit above the fold without requiring vertical scrolling on 360x800px viewports
- Offline-first: zero external network dependencies

---

### Task 1: Vocab Vault & Morphological Formatting Polish

**Files:**
- Modify: `web/src/modules/vocabulary-dossier.ts`
- Modify: `web/src/assets/styles/dossiers.css`

**Interfaces:**
- Consumes: `VocabItem`, `VocabBreakdown`, `t()`
- Produces: Formatted `vocab-progress-badge` with separator dot; structured morphological breakdown cards with clear labels (`Tiền tố / Prefix`, `Gốc từ / Root`, `Họ từ / Family`, `Phân tích / Analysis`).

- [ ] **Step 1: Update progress counter in `vocabulary-dossier.ts`**
Add clean separator dot between `card-counter` and `streak-counter`:
`<span class="vocab-count-indicator"><strong class="card-counter">${t('vocab.card_counter', { current: this.currentIndex + 1, total: totalCount })}</strong></span><span class="vocab-counter-divider" style="opacity: 0.4; margin: 0 6px;">·</span><span class="streak-counter">${t('vocab.reviewed_count', { count: this.reviewCountInRun })}</span>`

- [ ] **Step 2: Format morphological analysis into structured semantic layout**
In `vocabulary-dossier.ts`, replace the dense unformatted string in `ROOT_FORGE` back face:
Instead of raw text concatenated into `backSubText`, generate structured HTML for morphology breakdown with styled rows/chips for Prefix, Root, Suffix, and Word Family.

- [ ] **Step 3: Update CSS styling in `dossiers.css`**
Add styles for `.vocab-counter-divider`, `.morph-breakdown-card`, `.morph-chip`, `.morph-label`, `.morph-value` ensuring clean spacing and contrast.

- [ ] **Step 4: Verify with TypeScript build**
Run: `npm run build:fast` in `web`
Expected: SUCCESS with zero compilation errors.

---

### Task 2: Collocations Vault & Mobile Searchbox UX

**Files:**
- Modify: `web/src/modules/collocations-dossier.ts`
- Modify: `web/src/assets/styles/dossiers.css`

**Interfaces:**
- Consumes: `CollocationsDossier`, `t()`
- Produces: Mobile-friendly placeholder (no desktop `Ctrl+K`), streamlined single-row category scroll, compact header budget.

- [ ] **Step 1: Remove desktop `(Ctrl+K)` on mobile devices**
In `web/src/modules/collocations-dossier.ts`, dynamically select the search input placeholder: on screens <= 768px or touch devices, use `Tìm kiếm cụm từ...` (or `Search collocations...`), omitting `(Ctrl+K)`.

- [ ] **Step 2: Streamline filter pills and search wrapper on mobile**
In `dossiers.css`, ensure category pills and CEFR filters use horizontal scroll with no vertical bloat on mobile, reducing top header height by ~40px so vocabulary items appear higher above the fold.

- [ ] **Step 3: Verify with TypeScript build**
Run: `npm run build:fast` in `web`
Expected: SUCCESS.

---

### Task 3: Grammar Codex & Syntax Inversion Clean-up

**Files:**
- Modify: `web/src/modules/grammar-dossier.ts`
- Modify: `web/src/assets/styles/dossiers.css`

**Interfaces:**
- Consumes: `GrammarDossier`, `GrammarItem`
- Produces: Sleek compact mobile telemetry banner; unified, intuitive action flow between self-verification and SRS evaluation.

- [ ] **Step 1: Make `vocab-telemetry-banner` compact on mobile**
In `dossiers.css`, under `@media (max-width: 768px)`, convert `.vocab-telemetry-banner` into a single-line compact horizontal telemetry bar or pill strip, reducing vertical height from ~110px to ~36px.

- [ ] **Step 2: Clarify interactive production vs SRS reveal flow**
In `grammar-dossier.ts`, clearly differentiate the optional typing challenge from the reveal CTA: add helper hint `[Tùy chọn: Nhập câu trước khi lật]` and ensure action buttons are cleanly clustered.

- [ ] **Step 3: Verify with TypeScript build**
Run: `npm run build:fast` in `web`
Expected: SUCCESS.

---

### Task 4: 12 Tenses Zero-Scroll Mobile Optimization (Fix Above-The-Fold Quiz Clipping)

**Files:**
- Modify: `web/src/modules/tenses-dossier.ts`
- Modify: `web/src/assets/styles/dossiers.css`

**Interfaces:**
- Consumes: `TensesDossier`, `TenseQuestion`, `TensesViewMode`
- Produces: Zero-Scroll mobile quiz view for Drill & Gauntlet modes; compact folder tabs for 3 view modes; all 4 options (A, B, C, D) visible without scrolling.

- [ ] **Step 1: Compact View Mode Folder Tabs on Mobile**
In `tenses-dossier.ts` and `dossiers.css`:
Style `.view-mode-toggle` as a 3-column uniform grid (`display: grid; grid-template-columns: repeat(3, 1fr); width: 100%; gap: 4px;`) per Invariant 16, with compact tab labels (`🎲 Luyện`, `🎯 Thử thách`, `📖 Cẩm nang`).

- [ ] **Step 2: Compact breadcrumb / telemetry in active drill mode**
In `tenses-dossier.ts`: When in active `drill` mode on mobile, collapse `tenses-control-bar` and `tenses-telemetry-cluster` into a compact single-line HUD telemetry strip (`Độ chính xác: X/Y (Z%) · Chuỗi: 🔥 N · Kho: 102`), freeing ~140px of vertical space.

- [ ] **Step 3: Zero-scroll fit for question and all 4 choices**
In `dossiers.css`: Under mobile media query, tune padding of `.tenses-card-question` and `.tenses-choice-btn` so that Question prompt, Keyword Signal, and Choices A, B, C, D fit 100% inside standard viewports (360x800px / 375x667px) without any vertical scroll needed.

- [ ] **Step 4: Verify with TypeScript build**
Run: `npm run build:fast` in `web`
Expected: SUCCESS.

---

### Task 5: Lexicon Detail Drawer Mobile Clearance & Backdrop

**Files:**
- Modify: `web/src/modules/lexicon-drawer.ts`
- Modify: `web/src/assets/styles/dossiers.css`

**Interfaces:**
- Consumes: `LexiconDrawer`
- Produces: Fully visible footer action buttons (`+ Add to SRS Deck` and `Đóng`) above the safe bottom dock with zero cut-off.

- [ ] **Step 1: Fix mobile drawer height and bottom dock clearance**
In `dossiers.css`: Set `.lexicon-drawer` `z-index: var(--z-modal, 1200);` and update `.lexicon-drawer-footer` padding to `padding: 12px 16px max(16px, env(safe-area-inset-bottom));`. Ensure max-height allows full view of both buttons without cutoff.

- [ ] **Step 2: Verify with TypeScript build**
Run: `npm run build:fast` in `web`
Expected: SUCCESS.

---

### Task 6: Cambridge Drills Tabs, Card-As-Button & Email Sandbox Polish

**Files:**
- Modify: `web/src/modules/drills-dossier.ts`
- Modify: `web/src/assets/styles/drills.css`
- Modify: `web/src/modules/email-builder.ts`

**Interfaces:**
- Consumes: `DrillsDossier`, `renderSoundsPanel`, `renderEmailBuilder`
- Produces: Single-row horizontal scroll for skill chips (Invariant 7); 3-column uniform grid for Drills/Sounds/Email (Invariant 16); Card-as-Button for drill cards with top-right arrow affordance (Invariant 9); "Copy email draft" button in email builder.

- [ ] **Step 1: Enforce single-row horizontal scroll on `.drill-chips`**
In `web/src/assets/styles/drills.css`:
Change `.drill-chips` to `flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch; gap: 8px; padding-bottom: 4px;` and `.drill-chip { white-space: nowrap; flex-shrink: 0; }`. Eliminates the 3-row vertical wrapping!

- [ ] **Step 2: Enforce uniform 3-column grid on `.drills-tabs`**
In `drills.css`: Set `.drills-tabs` to `display: grid; grid-template-columns: repeat(3, 1fr); width: 100%; gap: 6px;`.

- [ ] **Step 3: Implement Card-as-Button on `.drill-card`**
In `web/src/modules/drills-dossier.ts` and `drills.css`:
Make each `.drill-card` clickable with `cursor: pointer;` and `data-action="open"`. Replace the bulky bottom `Start` button with a sleek top-right affordance arrow `→` with `44x44px` touch floor per Invariant 9.

- [ ] **Step 4: Polish Email Builder Sandbox**
In `email-builder.ts`: Add a "Sao chép thư" (Copy draft) button next to "Xóa bản nháp" and ensure clean spacing.

- [ ] **Step 5: Verify with TypeScript build**
Run: `npm run build:fast` in `web`
Expected: SUCCESS.

---

### Task 7: Comprehensive Re-capture Audit & Verification

**Files:**
- Script: `scripts/capture-vivo-audit.cjs`
- Output: `Mobile/vivo/04-mastery-foundations/*.png`

**Interfaces:**
- Consumes: Puppeteer, static local server, Chrome headless
- Produces: Fresh, high-fidelity 27 screenshots in `Mobile/vivo/04-mastery-foundations/`

- [ ] **Step 1: Build production bundle**
Run: `npm run build:fast` in `web`

- [ ] **Step 2: Execute Flow 04 capture script**
Run: Node script targeting Flow 04 in `scripts/capture-vivo-audit.cjs` to update `Mobile/vivo/04-mastery-foundations/`.

- [ ] **Step 3: Adversarial visual review of all refreshed screenshots**
Inspect the updated images with `read_file` to verify that all 27 views achieve 10/10 perfection.

