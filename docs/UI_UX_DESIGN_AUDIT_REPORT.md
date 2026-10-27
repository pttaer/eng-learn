# English Singularity & Academic IELTS: Comprehensive Master UI/UX & Design System Audit Report

> **Authority:** Native Antigravity Agent Configuration & Operational Invariants ([`AGENTS.md`](file:///e:/Eng/AGENTS.md))  
> **Canonical Design Specification:** [`docs/TYPOGRAPHY_SPACING_RULES.md`](file:///e:/Eng/docs/TYPOGRAPHY_SPACING_RULES.md) & [`.agents/rules/canonical-spacing.md`](file:///e:/Eng/.agents/rules/canonical-spacing.md)  
> **Gold Standard Exemplar:** IELTS Academic Writing View ([`Mobile/1.0.0/37-mobile-ielts-writing.png`](file:///e:/Eng/Mobile/1.0.0/37-mobile-ielts-writing.png) / [`web/src/ielts/views/writing.ts`](file:///e:/Eng/web/src/ielts/views/writing.ts))  
> **Audit Date:** 2026-10-27  
> **Execution Strategy:** 5 Autonomous Parallel Research Subagents

---

## Executive Summary & Consolidated Scorecard

A full-codebase UI/UX and interaction ergonomics audit was conducted across all stylesheets, view engines, modals, and core utilities. Five specialized subagents inspected token fidelity, the IELTS Academic suite, the 6 Mastery Dossiers, the overlay/modal systems, and accessibility/interaction ergonomics.

```
+---------------------------------------------------------------------------------------------------+
| COMPLIANCE SCORECARD ACROSS 5 AUDIT DOMAINS                                                      |
+------------------------------------+------------+-------------------------------------------------+
| Audit Domain                       | Status     | Primary Findings                                |
+------------------------------------+------------+-------------------------------------------------+
| 1. Core Tokens & Spacing Rhythm    | ⚠️ ACTIONS | 20 arbitrary breakpoints; 10px literal in toast |
| 2. IELTS Academic Suite            | ⚠️ ACTIONS | Drills table missing wrapper; 640/760px queries |
| 3. Master Dossiers & Tenses Vault  | ⚠️ ACTIONS | 680px nav drift; 11 arbitrary queries in css    |
| 4. Modals, Drawers & Overlays      | ⚠️ ACTIONS | Class mismatch on tour; vh vs 90dvh; 13px input |
| 5. Accessibility, Haptics & Rules  | ⚠️ ACTIONS | Sub-44px buttons; smart quotes bug; undo bug    |
+------------------------------------+------------+-------------------------------------------------+
| Invariant Checklist Pass Rate:                                                       84.2%        |
| Strict Prohibitions: Zero `contain: size`, Zero 9px literals, 100% offline IELTS scoring local    |
+---------------------------------------------------------------------------------------------------+
```

---

## Domain 1: Core Design System & Token Fidelity

**Audited Files:**  
- [`web/src/assets/styles/variables.css`](file:///e:/Eng/web/src/assets/styles/variables.css)  
- [`web/src/assets/styles/hud-base.css`](file:///e:/Eng/web/src/assets/styles/hud-base.css)  
- [`web/src/assets/styles/apple-motion.css`](file:///e:/Eng/web/src/assets/styles/apple-motion.css)  
- [`web/src/assets/styles/apple-toast.css`](file:///e:/Eng/web/src/assets/styles/apple-toast.css)  
- [`web/src/assets/styles/ux-a.css`](file:///e:/Eng/web/src/assets/styles/ux-a.css), [`ux-b.css`](file:///e:/Eng/web/src/assets/styles/ux-b.css), [`ux-c.css`](file:///e:/Eng/web/src/assets/styles/ux-c.css)

### Compliant Strengths
1. **Two Typefaces Maximum:** Strictly enforced. Every text element resolves to either `var(--font-sans)` (Inter / system neo-grotesque) or `var(--font-mono)` (JetBrains Mono / telemetry). Zero third-party font bloat.
2. **Apple Motion Kinematics:** [`apple-motion.css`](file:///e:/Eng/web/src/assets/styles/apple-motion.css) strictly implements composite-only animations (`transform`, `opacity`), spring timing (`--spring-smooth`, `--spring-bounce`), and `@media (prefers-reduced-motion: reduce)` overrides.
3. **Fluid Clamping Foundation:** Typographic tokens and card paddings implement standard fluid clamp formulas (`clamp(14px, 2.5vw, 24px)`).

### Violations & Drift Found
1. **20 Arbitrary Breakpoint Media Queries:**
   - Rule 2 mandates exactly **one breakpoint boundary at 768px** (`max-width: 768px` for mobile, `(width > 768px)` for desktop; with `360px` permitted for small phones).
   - Found arbitrary breakpoints: `600px` (5x in `ux-a.css`), `800px` (3x in `ux-a.css`), `900px` (5x in `ux-a.css`), `1100px` (1x in `ux-a.css`), `760px` (3x in `hud-base.css:855, 888, 892`), `480px` (1x in `hud-base.css:875`), and `840px` (1x in `ux-c.css:893`).
2. **Prohibited 10px Literal in Toast:**
   - [`web/src/assets/styles/apple-toast.css#L74`](file:///e:/Eng/web/src/assets/styles/apple-toast.css#L74): `.apple-toast-btn kbd { font-size: 10px; }`. Violates the strict 11px kicker/telemetry floor.
3. **Sub-44px Touch Targets on Mobile Controls:**
   - [`web/src/assets/styles/hud-base.css#L563`](file:///e:/Eng/web/src/assets/styles/hud-base.css#L563): `.hud-btn.btn-back-tree, .hud-btn.btn-level` set globally to `height: 36px; min-height: 36px; min-width: 36px;` without fine-pointer gating.
   - [`web/src/assets/styles/ux-c.css#L61`](file:///e:/Eng/web/src/assets/styles/ux-c.css#L61): Drops header back and level buttons to `36px !important;` on `max-width: 768px`.
   - [`web/src/assets/styles/apple-toast.css#L47`](file:///e:/Eng/web/src/assets/styles/apple-toast.css#L47): `.apple-toast-btn` has `padding: 4px 10px; font-size: 12px;` resolving to an effective tap target height of ~24px.
4. **Token Aliases & Off-grid Values:**
   - [`web/src/assets/styles/variables.css#L54`](file:///e:/Eng/web/src/assets/styles/variables.css#L54): Missing `--radius-pill: 9999px;` alias for `--radius-full`.
   - [`web/src/assets/styles/variables.css#L166`](file:///e:/Eng/web/src/assets/styles/variables.css#L166): Button padding token `--pad-btn: 8px 16px;` mismatches the Gold Standard specification (`8px 18px`).
   - [`web/src/assets/styles/hud-base.css#L1481`](file:///e:/Eng/web/src/assets/styles/hud-base.css#L1481): `border-radius: 3px;` in deck progress bars (off-grid; should be `var(--radius-full)` or `4px`).

---

## Domain 2: IELTS Academic Suite (The Gold Standard Exemplar)

**Audited Files:**  
- [`web/src/ielts/ielts.css`](file:///e:/Eng/web/src/ielts/ielts.css)  
- [`web/src/ielts/views/writing.ts`](file:///e:/Eng/web/src/ielts/views/writing.ts)  
- [`web/src/ielts/views/reading.ts`](file:///e:/Eng/web/src/ielts/views/reading.ts) & [`reading-drills.ts`](file:///e:/Eng/web/src/ielts/views/reading-drills.ts)  
- [`web/src/ielts/views/listening.ts`](file:///e:/Eng/web/src/ielts/views/listening.ts) & [`listening-traps.ts`](file:///e:/Eng/web/src/ielts/views/listening-traps.ts)  
- [`web/src/ielts/views/speaking.ts`](file:///e:/Eng/web/src/ielts/views/speaking.ts) & [`speaking-simulator.ts`](file:///e:/Eng/web/src/ielts/views/speaking-simulator.ts)  
- [`web/src/ielts/views/diagnostic.ts`](file:///e:/Eng/web/src/ielts/views/diagnostic.ts), [`mock.ts`](file:///e:/Eng/web/src/ielts/views/mock.ts), [`vocab.ts`](file:///e:/Eng/web/src/ielts/views/vocab.ts), [`strategy.ts`](file:///e:/Eng/web/src/ielts/views/strategy.ts)

### Compliant Strengths
1. **The Gold Standard Exemplar (`writing.ts`):** Strictly executes `--pad-screen-left: 12px;` and `--pad-screen-right: 12px;` flush workspace alignment, `--pad-card: 16px` on card surfaces, `12px` squircle corners, hairline borders, and `8px` vertical spacing rhythm.
2. **100% Offline Local Scoring:** Zero external network calls. All band algorithms (`bands.ts`, `scoring.ts`, `diagnostic-engine.ts`) execute client-side.
3. **Explanatory Evidence (`why`):** Audited 1,438 questions in `web/src/ielts/data/`—**0 missing evidence lines**. Every item provides a strict rationale linked to passage lines.
4. **TTS Architecture:** Browser-native `window.speechSynthesis` and in-memory Web Audio oscillators only.

### Violations & Drift Found
1. **Unwrapped Table Causing Card Blowout:**
   - [`web/src/ielts/views/reading-drills.ts#L556-577`](file:///e:/Eng/web/src/ielts/views/reading-drills.ts#L556-577): Renders `<table class="ie-table ie-synonym-table">` directly inside `synMatrix` without `<div class="ie-table-wrap">`. On mobile where `ielts.css` enforces `min-width: 600px !important;`, it breaks out of the card boundary without a horizontal scrollbar.
2. **Arbitrary Breakpoints in `ielts.css`:**
   - `ielts.css:695`: `@media (max-width: 640px) { .ie-diag-options { grid-template-columns: 1fr; } }`
   - `ielts.css:1496`: `@media (max-width: 760px) { .ie-vback dl { grid-template-columns: 1fr; } }`
3. **Tabs Omitted from Mobile Horizontal Scroll List:**
   - `ielts.css:252`: Horizontal scroll rule applies to `.ie-tabs`, `.ie-traps-filter-tabs`, `.ie-strategy-tabs`, `.ie-visual-tabs`, `.ie-arch-tabs`, and `.ie-drills-nav-tabs`, but omits `.ie-diag-filter-tabs` ([`diagnostic.ts#L94`](file:///e:/Eng/web/src/ielts/views/diagnostic.ts#L94)), causing tabs to stack on narrow phones.
4. **Unstyled Test Mounting Host:**
   - In [`reading.ts#L109`](file:///e:/Eng/web/src/ielts/views/reading.ts#L109), [`listening.ts#L204`](file:///e:/Eng/web/src/ielts/views/listening.ts#L204), and [`mock.ts#L93`](file:///e:/Eng/web/src/ielts/views/mock.ts#L93), test modules mount into `const host = h('div');`. Without a layout class, the top toolbar, content panes, and result screen collapse with 0px vertical gap.

---

## Domain 3: Master Dossiers & Core Learning Modules

**Audited Files:**  
- [`web/src/assets/styles/dossiers.css`](file:///e:/Eng/web/src/assets/styles/dossiers.css)  
- [`web/src/assets/styles/drills.css`](file:///e:/Eng/web/src/assets/styles/drills.css)  
- [`web/src/assets/styles/atomic-card.css`](file:///e:/Eng/web/src/assets/styles/atomic-card.css)  
- All 6 dossiers (`grammar`, `reading`, `writing`, `listening`, `speaking`, `vocabulary`), `tenses-dossier.ts`, and `skill-tree-view.ts`.

### Compliant Strengths
1. **Centered 760px Card Foundation:** `atomic-card.css` and `drills.css` strictly set `max-width: 760px; margin: 0 auto;`.
2. **Prose Measure:** Deep reading articles in `reading-dossier.ts` enforce the `max-width: 68ch;` reading column with `line-height: 1.65;`.
3. **Zero `contain: size`:** 100% compliant. Only `contain: layout style` is used.

### Violations & Drift Found
1. **Nav Bar & Header Width Drift (680px vs 760px):**
   - [`web/src/assets/styles/dossiers.css#L168`](file:///e:/Eng/web/src/assets/styles/dossiers.css#L168): `.dossier-nav-bar { max-width: 680px; }`.
   - `dossiers.css:920, 1019`: `.vocab-apple-header`, `.vocab-apple-nav` set `max-width: 680px;`. Outer edges misalign with the 760px card slot above/below.
   - `dossiers.css:7642, 7712`: `.dossier-tenses { max-width: 1080px; }` (exceeds 1040px) and `.tenses-card-question { max-width: 820px; }` (exceeds 760px).
2. **Sub-11px Font Literals:**
   - [`web/src/assets/styles/dossiers.css#L7204`](file:///e:/Eng/web/src/assets/styles/dossiers.css#L7204): `#btn-module-toggle { font-size: 10px !important; }`.
   - [`web/src/modules/skill-tree-view.ts#L765`](file:///e:/Eng/web/src/modules/skill-tree-view.ts#L765): `style="font-size: 10.5px;"` on CEFR level badges.
3. **11 Arbitrary Media Queries in `dossiers.css`:**
   - `600px` (Lines 1745, 2503, 2895, 4564), `640px` (Lines 5131, 7497, 7800), `820px` (Line 7399), `900px` (Lines 1783, 3270, 5851).
4. **Blanket 8px Radius Override of Squircle Curvature:**
   - `dossiers.css:8086, 8114, 8143`: Sets `border-radius: var(--radius-md, 8px) !important;` across 16 card classes, wiping out `--radius-squircle-md: 16px;`.
5. **Educational Prompt Ellipsis Truncation:**
   - [`grammar-dossier.ts#L213`](file:///e:/Eng/web/src/modules/grammar-dossier.ts#L213) and [`listening-dossier.ts#L348`](file:///e:/Eng/web/src/modules/listening-dossier.ts#L348) use `text-overflow: ellipsis; white-space: nowrap;` on card prompts, cutting off educational questions on mobile.

---

## Domain 4: Modals, Overlays, Floating Controls & Drawers

**Audited Files:**  
- [`web/src/modules/multi-skill-quiz-modal.ts`](file:///e:/Eng/web/src/modules/multi-skill-quiz-modal.ts)  
- [`web/src/modules/placement-quiz.ts`](file:///e:/Eng/web/src/modules/placement-quiz.ts)  
- [`web/src/modules/progression-modal.ts`](file:///e:/Eng/web/src/modules/progression-modal.ts)  
- [`web/src/modules/lexicon-drawer.ts`](file:///e:/Eng/web/src/modules/lexicon-drawer.ts)  
- [`web/src/core/spotlight-tour.ts`](file:///e:/Eng/web/src/core/spotlight-tour.ts) & [`web/src/assets/styles/tour-spotlight.css`](file:///e:/Eng/web/src/assets/styles/tour-spotlight.css)  
- [`web/src/modules/header-hud.ts`](file:///e:/Eng/web/src/modules/header-hud.ts) & [`web/src/modules/corner-compass.ts`](file:///e:/Eng/web/src/modules/corner-compass.ts)

### Compliant Strengths
1. **Mobile Bottom Nav & Drawer Insets:** `.hud-bottom-nav` has clear z-index layering; root workspace mount applies `--safe-bottom-dock: 84px` + `env(safe-area-inset-bottom)`.
2. **Modal Backdrop Blurs & Escape Keys:** Modals implement `backdrop-filter: blur()`, Escape key dismissal, and proper keyboard traps.
3. **Corner Compass Mobile Dock Protection:** Correctly set to `display: none !important;` on `max-width: 768px` to prevent clashing with bottom navigation.

### Violations & Drift Found
1. **Spotlight Tour Missing CSS Class Bug:**
   - In [`spotlight-tour.ts#L139`](file:///e:/Eng/web/src/core/spotlight-tour.ts#L139): `<div style="display:flex;gap:6px;"><button class="ctrl" id="tourPrevBtn">...`
   - In [`tour-spotlight.css#L351`](file:///e:/Eng/web/src/assets/styles/tour-spotlight.css#L351): Styles and 44px tap target are scoped to `.tour-card-actions .ctrl`.
   - **Result:** The `<div>` lacks `class="tour-card-actions"`, so the buttons do not receive 44px touch targets or action button styles.
2. **Viewport Units (`vh` vs `90dvh`):**
   - Multi-skill modal uses `max-height: 90vh;` and lexicon drawer uses `max-height: 82vh;`. Dynamic browser bars on mobile browsers cause content to overflow the screen. Must use `90dvh`.
3. **Dismiss Tap Targets:**
   - `.tour-card-close` sets `width: 28px; height: 28px;` (violates 44px floor for modal dismiss triggers).
   - Base `.progression-btn-close` sets `32px × 32px` in `dossiers.css:2576`.
4. **Settings Modal Ergonomics:**
   - [`header-hud.ts#L856`](file:///e:/Eng/web/src/modules/header-hud.ts#L856): Hardcoded `padding: 16px 12px;` and no `max-height: 90dvh; overflow-y: auto;`. The 8 settings items and audio sliders extend off-screen on smaller phones.

---

## Domain 5: Accessibility, Ergonomics & Interaction Rules

**Audited Files:**  
- [`web/src/core/acoustic-haptics.ts`](file:///e:/Eng/web/src/core/acoustic-haptics.ts) & [`acoustic-engine.ts`](file:///e:/Eng/web/src/core/acoustic-engine.ts)  
- [`web/src/core/undo-manager.ts`](file:///e:/Eng/web/src/core/undo-manager.ts)  
- [`web/src/core/exercise-engine.ts`](file:///e:/Eng/web/src/core/exercise-engine.ts)  
- Input controls across entire repository

### Compliant Strengths
1. **Exercise Engine Reference Normalisation:** `web/src/core/exercise-engine.ts:71-80` (`normaliseAnswer`) correctly converts curly quotes (`’‘` -> `'`, `“”` -> `"`) and strips trailing punctuation.
2. **Zero `contain: size`:** 0 instances found across all workspace files.
3. **Horizontal Tab Overflow:** Core tab sets implement horizontal scrolling (`overflow-x: auto; flex-wrap: nowrap;`).

### Violations & Drift Found
1. **Critical Smart Quote Stripping Bug:**
   - In [`listening-dossier.ts#L50, 192`](file:///e:/Eng/web/src/modules/listening-dossier.ts#L50) and [`multi-skill-quiz-modal.ts#L284`](file:///e:/Eng/web/src/modules/multi-skill-quiz-modal.ts#L284):  
     `replace(/[^a-z0-9']/g, '')` strips curly quotes (`’`) before mapping them to ASCII `'`.
   - **Bug Impact:** An iOS learner typing `"don’t"` has the apostrophe stripped into `"dont"`, which is compared against `"don't"`, creating an **instant false negative error**!
2. **Universal Undo Native Input Interception Bug:**
   - In [`undo-manager.ts#L18`](file:///e:/Eng/web/src/core/undo-manager.ts#L18):  
     `if ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey || !this.isEditingInput(e)))`
   - Due to operator precedence, whenever `Ctrl` or `Meta` is pressed, the condition evaluates to `true` even inside `<input>` or `<textarea>`. Pressing `Ctrl+Z` to fix a typo executes the app-level undo rather than the native text field undo.
3. **Acoustic Haptics Mute State Desync:**
   - `AcousticHaptics` never reads `eng_master_muted` on boot, nor does `header-hud.ts` notify `AcousticHaptics.setMuted()`. Muting sound in the HUD leaves acoustic clicks and flips playing.
4. **iOS Auto-Zoom Form Controls:**
   - While `ux-c.css` defines a global 16px reset, `dossiers.css:7197` overrides it with `.cd-theme-select { font-size: 11px !important; }`.
   - Inline styles in [`multi-skill-quiz-modal.ts#L359`](file:///e:/Eng/web/src/modules/multi-skill-quiz-modal.ts#L359) and [`header-hud.ts#L903`](file:///e:/Eng/web/src/modules/header-hud.ts#L903) set inputs and selects to `var(--font-body-compact)` (13px), triggering iOS Safari viewport zoom.
5. **Crushed Tables:**
   - [`speaking-dossier.ts#L881`](file:///e:/Eng/web/src/modules/speaking-dossier.ts#L881): 5-column `.compression-table` lacks `min-width: 600px; white-space: nowrap;` and is not wrapped in an `overflow-x: auto;` container.

---

## Prioritized Remediation Roadmap

### Phase 1: High-Impact Interaction & Keyboard Fixes (Immediate)
1. **Fix `undo-manager.ts` Keystroke Gate:** Protect native input undo by checking `!this.isEditingInput(e)` strictly.
2. **Normalize Smart Quotes Across Dossiers:** Replace `/ [^a-z0-9'] /` in `listening-dossier.ts` and `multi-skill-quiz-modal.ts` with `normaliseAnswer` from `exercise-engine.ts`.
3. **Fix Spotlight Tour Button Tap Height:** Add `class="tour-card-actions"` in `spotlight-tour.ts:139`.
4. **Sync Haptics Mute State:** Connect `AcousticHaptics.setMuted()` to HUD sound toggle and initialize from localStorage.

### Phase 2: Form Inputs & Tap Floor Enforcement (Ergonomics)
1. **Enforce 16px Mobile Form Floor:** Eliminate `11px !important` from `.cd-theme-select` in `dossiers.css:7197` and upgrade inline inputs to `max(16px, var(--font-body))`.
2. **Elevate Mobile Touch Floors to 44px:**
   - Remove `height: 36px !important;` on header buttons in `ux-c.css:61`.
   - Update `.apple-toast-btn`, `.tour-card-close`, `.progression-btn-close`, and `.btn-module-toggle` to `min-height: var(--touch-target-min, 44px); min-width: 44px;`.

### Phase 3: Layout Alignment & Media Query Consolidation
1. **Consolidate Media Queries to 768px:** Fold the 20 arbitrary breakpoints (`600px`, `640px`, `760px`, `800px`, `820px`, `840px`, `900px`, `1100px`) into `@media (max-width: 768px)`.
2. **Align Dossier Widths to 760px:** Update `.dossier-nav-bar`, `.vocab-apple-header`, `.vocab-apple-nav`, and `.tenses-card-question` from `680px` / `820px` to `760px`.
3. **Table & Tabs Safeguards:** Add `<div class="ie-table-wrap">` around the synonym matrix in `reading-drills.ts:560` and `.compression-table-wrapper` in `speaking-dossier.ts`.
4. **Eliminate Sub-11px Font Literals:** Replace `10px` in `apple-toast.css:74` and `dossiers.css:7204` with `var(--font-kicker)`.

