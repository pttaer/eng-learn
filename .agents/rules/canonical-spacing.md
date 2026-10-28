# Rule: Canonical Spacing, Layout & Sensory UI/UX Standard

> **MANDATORY SPECIFICATION FOR ALL AGENTS AND DEVELOPERS**  
> **Source Exemplar:** IELTS Academic Writing View ([`Mobile/1.0.0/37-mobile-ielts-writing.png`](file:///e:/Eng/Mobile/1.0.0/37-mobile-ielts-writing.png) / [`web/src/ielts/views/writing.ts`](file:///e:/Eng/web/src/ielts/views/writing.ts) & [`web/src/ielts/ielts.css`](file:///e:/Eng/web/src/ielts/ielts.css)).  
> **Master Specification:** [`docs/TYPOGRAPHY_SPACING_RULES.md`](file:///e:/Eng/docs/TYPOGRAPHY_SPACING_RULES.md). Both documents must stay in strict lockstep sync.  
> **Scope:** Entire application suite (CEFR Skill Tree, 6 Mastery Dossiers, Placement Quiz, 12 Tenses, IELTS Suite & Modals).

From now on, all views across the application must strictly adhere to the paddings, spacing rhythms, component geometry, sensory physics, and emotional safety patterns established by this canonical view.

---

## 1. Visual Hierarchy & Spacing Rhythm

```
+--------------------------------------------------------------------------+
|  HEADER: [Brand: IELTS 7.0]                  [Action: ← Back / Nav]      |  padding: 12px 24px;
|  NAV TRACK: [ Pill 1 ] [ Pill 2 (active) ] [ Pill 3 ]                    |  gap: 8px; pill-pad: 8px 12px; radius: 8px;
+--------------------------------------------------------------------------+
                                                                             
  WORKSPACE CONTAINER (max-width: 1040px; margin: 0 auto; padding: 24px;)
  All elements share strict flush-left alignment along the 24px inset.

  [ H1 PAGE TITLE: Academic Writing ]                                        gap-below: 12px–16px (margin: 0)
  
  [ LEAD TEXT: Task 1: describe visual... Task 2: write 250+... ]            max-width: 760px; line-height: 1.5; gap-below: 16px
  
  +------------------------------------------------------------------------+
  | [ Button: Task 1 Visual Formula Inspector ]                            |  pad: 8px 18px; radius: 10px (--radius-btn); min-h: 38–44px
  | [ Button: Task 2 4-Sentence Paragraph Workbench ]                      |  gap: 8px–12px between buttons
  | [ Primary Button: Launch Writing Studio (6 Blueprints & 5 Arch...) ]   |  accent-filled, high-contrast, radius: 10px (--radius-btn)
  +------------------------------------------------------------------------+
                                                                             gap-below: 20px–24px
  [ H2 / H3 SECTION SUBHEAD: Task 1 ]                                        margin: 0; gap-below: 12px–16px
  
  +------------------------------------------------------------------------+
  | CARD (Energy Consumption in Four Countries (1990–2020))                |  padding: 16px all sides; radius: 12px;
  |   <b>Title Text</b>                                                    |  border: 1px solid var(--border-hairline);
  |   <span>metadata / category (line)</span>                              |  internal flex-col gap: 8px; min-height: 88px;
  +------------------------------------------------------------------------+
  | CARD (Internet Penetration by Region (2000–2020))                      |  card-to-card gap: 12px (mobile) / 16–20px (desktop)
  +------------------------------------------------------------------------+
```

---

## 2. Definitive Padding Tiers (Single Source of Truth)

1. **Workspace & Screen Inset (`variables.css`):**
   - **Single place for Left:** `--pad-screen-left: 12px;`
   - **Single place for Right:** `--pad-screen-right: 12px;`
   - Derived tokens: `--pad-screen-x: var(--pad-screen-left);`, `--pad-workspace: 16px var(--pad-screen-right) 24px var(--pad-screen-left);`
   - Changing `--pad-screen-left` and `--pad-screen-right` in `variables.css` propagates across the entire application (`#hud-overlay`, `.ie-header`, `.ie-main`, and all viewports).
   - Title, lead copy, hub action buttons, subheadings, and card edges **must strictly align to this same left margin**.
2. **Card Surfaces (`.ie-card`, `.dossier-card`, etc.):**
   - Padding: **`16px`** on all sides.
   - Border radius: **`12px`** (or `--radius-squircle-md`).
   - Border: `1px solid var(--border-hairline)` (0.04 to 0.08 subtle hairlines; avoid harsh 0.18 outlines).
   - Background: `var(--bg-card)`.
   - Internal gap: **`8px`** vertical rhythm between card title and secondary tags/metadata.
3. **Interactive Controls & Buttons:**
   - Button padding: **`8px 18px`** (or `8px 16px` compact).
   - Border radius: **`9px`** (for standard buttons and primary action bars) or `--radius-squircle-sm`.
   - Navigation pills: **`8px 12px`** with **`8px`** border radius (or `--radius-pill`).
   - Touch floor: Minimum **`44px`** tap height on touch/mobile viewports; fine-pointer desktop minimum **`38px`**.
4. **Header Navigation:**
   - Bar padding: **`var(--space-12) var(--pad-screen-right) var(--space-12) var(--pad-screen-left)`**.
   - Pill track gap: **`8px`**.

---

## 3. Spatial Gap Rhythm

- **Between Major Sections:** `var(--gap-section)` (`16px` mobile / `32px` desktop).
- **Between Stacked Blocks / Cards:** `var(--gap-block)` (`12px` mobile / `16px–20px` desktop).
- **Between Header / Title / Lead text:** `12px`–`16px` (zero margins on headings, spacing handled via container `gap`).
- **Between Action Buttons:** `8px`–`12px`.
- **Inside Cards (between title and metadata):** `8px`.
- **Mobile Safe Dock Clearance:** `--safe-bottom-dock: 84px` (60px fixed bottom navigation + 24px buffer) + `env(safe-area-inset-bottom)` on views rendered under the bottom nav bar at `≤768px`.

---

## 4. Enforcement & Compliance

- Never use random arbitrary padding like `13px`, `19px`, `21px`, or `30px`.
- Never let cards or buttons touch the screen edge; always preserve the workspace inset.
- Never wrap card contents with uneven margins; always rely on `padding: 16px` and `gap: 8px`.
- Never use more than two typeface families (`--font-sans` for human prose/UI, `--font-mono` for telemetry/kickers/formulas).
- Never allow text below 11px (`--font-kicker`). 9px and 10px literals are strictly banned.

---

## 5. Mobile Vertical Rhythm & Text Alignment

Mirrors spec §11 in [`docs/TYPOGRAPHY_SPACING_RULES.md`](file:///e:/Eng/docs/TYPOGRAPHY_SPACING_RULES.md). Both must stay in sync.

- **One rule per class:** A class is defined once. A later duplicate silently overrides tokens.
- **Kickers:** `--font-kicker` (11px), `--font-kicker-spacing` (0.08em), uppercase. No inline `letter-spacing` or font-size overrides.
- **Badges and chips stay on one line** (`white-space: nowrap`). A flex row holding a kicker plus a badge uses `flex-wrap: wrap; gap: 4px 8px`.
- **Alignment is flush-left:** Centre only a whole hero or empty-state card, where every line inside is centred.
- **No leading diamond star ornaments (`✦`):** Strictly banned across all headings, telemetry labels, and kickers. Use plain unornamented text (`ROADMAP`, `ENGLISH MASTERY`), or 5-pointed white star (`☆`) when semantic distinction is needed. Never use `★` or `✦`.
- **No 0–4px gaps between stacked text blocks:** Mobile tiers: element 6px, group 8px, block 12px, section 16px. Exempt: a heading with its own one-line subtitle (line-height spacing), and table rows.
- **No fixed-height nested scroll box for a content list on mobile:** The page scrolls. Canvas and map views are exempt.
- **Full-width CTA labels wrap** inside the button (`white-space: normal`). They never overflow.
- **Every clickable is at least 44×44 on phones** (`button`, `a[href]`, `[role=button]`, `[role=tab]`, `[data-route]`). Inline prose links are exempt.
- **Mobile titles and labels wrap:** No `text-overflow: ellipsis` on them.
- **Horizontal Tabs on Mobile:** Use `flex-direction: row; flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none;` instead of stacking category tabs vertically.
- **Crushed Table Prevention:** Wrap wide tables in a horizontal scroller with `min-width: 600px; white-space: nowrap !important;`.

---

## 6. Apple-Calm Squircle Tokens & Motion Physics

- **Squircle Curvature:** `--radius-squircle-sm: 10px`, `--radius-squircle-md: 16px`, `--radius-squircle-lg: 24px`, `--radius-pill: 9999px`.
- **Tactile Button Press:** `.apple-press` or `.hud-btn:active` compresses to `scale(0.975)` over 120ms with spring release.
- **Mistake Physics (No Aggressive Buzzers):** Gentle `@keyframes apple-shake` oscillating horizontally 6px over 340ms with warm amber status instead of harsh red flashing.
- **Composite-Only Transitions:** Animate only `transform` and `opacity`.
- **Skeleton Shimmer Loading:** Use `.skeleton-box` or `.skeleton-shimmer` with `--shimmer-base` and `--shimmer-highlight` for async loading states.
- **Reduced Motion:** Respect `prefers-reduced-motion: reduce` by disabling scales, shakes, and shimmer animations.

---

## 6.1 Canonical Z-Index Hierarchy Scale

All layers MUST bind to canonical z-index tokens instead of arbitrary literals (`9999`, `10000`, `100050`):
- Canvas & Base: `--z-sunk: -1`, `--z-base: 0`, `--z-canvas-bg: 1`, `--z-surface: 5`, `--z-hud-base: 10`.
- Interaction & Structure: `--z-sticky: 100`, `--z-card-layer: 200`, `--z-bottom-nav: 400`, `--z-dropdown: 500`, `--z-drawer: 600`.
- Overlays & Popups: `--z-modal-backdrop: 800`, `--z-modal: 900` (`--z-modal-lens: 900`), `--z-toast: 1000`, `--z-tooltip: 1100`, `--z-cursor: 9999`.

---

## 6.2 Semantic Status & WCAG 2.2 AAA Contrast Tokens

- Success/Good: `--good`, `--good-soft`, `--good-border`, `--ink-good`, `--ink-on-good` (Dark: `#34d399` / Light: `#047857` on paper for 7:1 ratio).
- Warning: `--warning`, `--warning-soft`, `--warning-border`, `--ink-warning`, `--ink-on-warning` (Dark: `#fbbf24` / Light: `#92400e`).
- Critical: `--critical`, `--critical-soft`, `--critical-border`, `--ink-critical`, `--ink-on-critical` (Dark: `#f87171` / Light: `#b91c1c`).
- Info: `--info`, `--info-soft`, `--info-border`, `--ink-info`, `--ink-on-info` (Dark: `#60a5fa` / Light: `#1d4ed8`).

---

## 7. Acoustic Haptics Architecture (`acoustic-haptics.ts`)

- Provide subtle auditory reassurance using zero-byte procedural Web Audio API synthesis:
  - `AcousticHaptics.tap()`: 25ms wooden/glass click for buttons (sine 420Hz -> 140Hz).
  - `AcousticHaptics.flip()`: 40ms bandpass noise sweep for card flip (1200Hz, Q=2.5).
  - `AcousticHaptics.chime()`: 350ms major-third chime for mastery/milestones (E5 [659.25Hz] -> A5 [880Hz]).
  - `AcousticHaptics.nudge()`: 160ms triangle-wave downward pluck for reconsideration without shame (E4 [329.63Hz] -> D4 [293.66Hz]).
- Silent on muted settings and respects system sound preferences.

---

## 8. Universal Undo & Emotional Safety (`undo-manager.ts`)

- Register reversible actions (SRS ratings, quiz choices, deck advances) with `UndoManager.register(message, undoFn, timeoutMs)`.
- Displays a floating squircle pill (`.apple-toast-undo`) with a 4-second countdown drain bar and keyboard shortcut <kbd>Z</kbd> (or <kbd>Ctrl+Z</kbd> / <kbd>Cmd+Z</kbd>).
- Intelligently suppressed when typing inside `<input>`, `<textarea>`, or `[contenteditable]` to protect native editing history.
- Eliminates test-taking and review anxiety through safe instant reversal.

---

## 9. Mobile Virtual Keyboard & Input Resiliency

- **iOS Auto-Zoom Prevention:** All form `input`, `textarea`, and `select` elements must declare `font-size: max(16px, var(--font-body))` on mobile (≤768px).
- **Defensive Normalisation:** The engine (`exercise-engine.ts`) automatically normalizes smart quotes (`’‘` &rarr; `'`, `“”` &rarr; `"`) and trims accidental trailing punctuation so autocorrect quirks never penalize the learner.

---

## 10. Shared Workspace Skeleton & Containment

- All dossier views share one structural skeleton:
  - Max workspace width: `1040px`.
  - Cards and toolbars share a centered `760px` column (`margin: 0 auto`) so outer edges align across routes.
  - Every view begins at the exact same top coordinate.
  - Containment: use `contain: layout style` for CSS rendering isolation; **never set `contain: size` on content slots** (preventing collapsed containers or overlapping sibling cards).

---

## 11. Single Breakpoint Boundary Rule

- Base CSS is written mobile-first (`max-width: 768px`).
- Desktop overrides strictly use `@media (width > 768px)`.
- Small-phone tweaks use `360px` only.
- Splintered breakpoints (`600px`, `640px`, `800px`, `840px`, `900px`) are strictly banned in new code.

---

## 12. Prohibited Anti-Patterns Reference Matrix

Mirrors §11 in [`docs/TYPOGRAPHY_SPACING_RULES.md`](file:///e:/Eng/docs/TYPOGRAPHY_SPACING_RULES.md):

| Anti-Pattern (PROHIBITED) | Standard Solution (MANDATORY) | Technical Rationale |
| :--- | :--- | :--- |
| **Hardcoded Arbitrary Font Sizes** (`font-size: 21px`, `19px`, `9px`, `10px`) | Use semantic token (`var(--font-h3)`, `var(--font-prompt)`, `var(--font-kicker)` for the 11px floor) | Prevents uncoordinated typographic chaos across modules. |
| **Vertical Stacking of Horizontal Tabs on Mobile** | Use `flex-direction: row; flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none;` | Stacking 6 category buttons consumes 240px vertical space, pushing content below the fold. |
| **Crushed Table Columns** (`overflow-wrap: anywhere` without `min-width`) | Wrap in horizontal scroll container, set `min-width: 600px; white-space: nowrap !important;` | Eliminates 1-letter-per-line vertical text destruction on mobile. |
| **Floating Overlays Obscuring Bottom Navigation** | Hide corner compass & watermark version under `@media (max-width: 768px)` | Prevents touch obstruction over mobile Bottom Navigation Bar. |
| **Rating Buttons Stacked in Vertical Column** | Maintain `flex-direction: row` side-by-side with `min-height: 44px` | Preserves Fitts's Law touch efficiency and vertical viewport budget. |
| **Content Trapped Behind Fixed Mobile Bar** | Ensure `#workspace-mount` has `padding-bottom: calc(var(--safe-bottom-dock) + env(safe-area-inset-bottom, 0px))` on ≤768px | Guarantees all interactive choices and inputs can be scrolled fully into clear view. |
| **Touch Target Below 44px on Touch Devices** (`min-height: 32px`–`42px` with no fine-pointer query) | `min-height: var(--touch-target-min)`; smaller only under `(hover: hover) and (pointer: fine)` | Fitts's Law; WCAG 2.2 AAA 44px; iPad portrait is touch but wider than 768px. |
| **Input Font Below 16px on Mobile** | `font-size: max(16px, var(--font-body))` | iOS Safari zooms the page on focus when input text is under 16px. |
| **Desktop-First Max-Width Breakpoints in New CSS** (`max-width: 900px`, `max-width: 640px`) | Mobile base styles + `(width > 768px)` for desktop | One boundary keeps nav, dock and layout switching in sync. |
| **Duplicate Rule for One Class** (two `.telemetry-label` blocks, the later overriding tokens) | One definition per class, written with tokens | A later duplicate silently overrides the spec and changes every view. |
| **Kicker Drift** (inline `letter-spacing: 0.1em` / `0.12em`, or a size other than `--font-kicker`) | `--font-kicker` 11px, `--font-kicker-spacing` (0.08em), no inline overrides | Keeps kickers identical everywhere; wide tracking makes Vietnamese caps wrap. |
| **Badge or Chip Breaking Across Lines** (`[ TỪ VỰNG ]` split inside its brackets) | `.hud-badge { white-space: nowrap; flex-shrink: 0 }`; a row holding a kicker plus a badge uses `flex-wrap: wrap; gap: 4px 8px` | A badge is one unit; it moves as a whole or stays on the line. |
| **Mixed Alignment in One Block** (centred heading above flush-left body) | Flush-left everywhere; centre only a whole hero or empty-state card, where every line inside is centred | Mixed alignment reads as a mistake, not a choice. |
| **Leading / Symmetric Ornaments** (`✦ TITLE`, `✦ TITLE ✦`, `★ TITLE`) | Plain clean text (`TITLE`) or white 5-star (`☆ TITLE`) | Eliminates visual noise; `✦` and `★` are strictly banned. |
| **0–4px Gap Between Stacked Text Blocks** (inline `gap: 2px` / `4px` in a column) | Mobile tiers: element 6px, group 8px, block 12px, section 16px (`--gap-element`, `--gap-group`, `--gap-block`, `--gap-section`). Exempt: a heading with its own one-line subtitle, and table rows | Lines that touch read as one crowded block. |
| **Fixed-Height Nested Scroll Box for a Content List on Mobile** (a 309px box inside the page) | Let the page scroll; the list takes its natural height. Canvas and map views are exempt | A second scroller hides content and makes the view feel cramped. |
| **Full-Width CTA Label Overflowing the Button** (`white-space: nowrap` at 390px) | `white-space: normal; text-align: center`; the label wraps inside the button | Text that spills past its container looks broken. |
| **Text Overflow Ellipsis on Mobile Titles** (`text-overflow: ellipsis`) | Allow multi-line wrapping with clean line-height | Truncating educational titles prevents learners from reading the question. |
| **Overlapping Content via `contain: size`** | Never set `contain: size` on content slots | Forces 0px height or overlaps sibling elements when content expands dynamically. |
| **Double Outlines / Nested Bordered Containers** (bordered box/card placed inside another bordered surface) | Use pure tonal elevation / background contrast (`--bg-surface-sunk`, `--bg-surface`, `--bg-card`) with zero inner stroke | Eliminates "box-in-a-box" clutter, concentric borders, and heavy visual noise. |
| **Redundant Bottom Action Buttons in Grid Tiles** (`VÀO ĐỌC →` button squeezed into each card bottom) | Card-as-Button: make whole card clickable, place unbordered `44×44px` arrow `→` at top-right | Frees card vertical space, stops ellipsis truncation, eliminates clumsy visual heaviness. |
| **Crowded Single-Row Telemetry** (`ROADMAP RANK: Scholar SUMMIT: 38%` on 1 line) | Defensive multi-row telemetry with `justify-content: space-between` and progress bar on separate line | Stops text collisions and bar lines intersecting letter descenders on 360–390px screens. |
| **Aggressive Red Error Alarms on Mistake** | Use gentle `@keyframes apple-shake` and warm amber cues with `UndoManager` pill | Reduces cognitive anxiety and prevents learner burnout during long study sessions. |

---

## 13. Mobile Card-as-Button Grid & Hero Balancing Philosophy

> **Reference Exemplar & Case Study:** Constellation Skill Tree & Skill Deck Overhaul ([`Mobile/1.0.0/01-mobile-constellation-tree.png`](file:///e:/Eng/Mobile/1.0.0/01-mobile-constellation-tree.png)).

### 1. Card-as-Button with Clean Corner Arrow Affordance
- **Anti-Pattern (View cũ):** Each grid item had a heavy, full-width button squeezed into the bottom of the card (`VÀO ĐỌC →`). This consumed ~44px of vertical card height, forced taglines to truncate into ellipses (`Intensive A...`), and created visual weight that felt like an early-2000s web portal.
- **Enforced Solution (View mới):** The entire card surface is the interactive target (`cursor: pointer; position: relative`). A minimalist arrow glyph (`${icon('arrowRight', 16)}`) is positioned at the top-right corner. It satisfies the `44×44px` touch floor without any outline or background box (`background: transparent; border: none; outline: none;`). This eliminates visual clutter while preserving instantaneous cognitive affordance.

### 2. Proportional Vertical Budgeting & Anti-Void Balancing
- **Anti-Pattern (View cũ):** Compressing the summary hero banner (Roadmap) into a narrow, squashed ~60px strip while forcing the 2-column card grid below to stretch across ~600px. This created a giant, cavernous empty void (~120px) inside each card between the tagline and the mastery progress bar.
- **Enforced Solution (View mới):** Distribute the viewport vertical budget proportionally. The top Roadmap banner is expanded into a rich, informative hero card (~125px tall, canonical 16px padding) displaying the Summit progress bar and a 3-item Daily Tasks checklist. Consequently, the grid cards below occupy a balanced, comfortable height (~170px), allowing internal whitespace (~40px) to feel calm, intentional, and grounded.

### 3. Absolute Prohibition of Diamond Stars (`✦`) and Filled Stars (`★`)
- **Anti-Pattern (View cũ):** Prepending `✦` or `★` before titles and kickers (`✦ ROADMAP`, `✦ ENGLISH MASTERY`, `✦ TÌM ĐIỂM XUẤT PHÁT`, `★ WORKOUT`). It created visual noise and felt like automated AI markdown gimmicks.
- **Enforced Solution (View mới):** Pure typography provides superior authority and elegance. Diamond stars (`✦`) and black filled stars (`★`) are strictly banned across all headers, HUD titles, badges, and kickers. When an icon or star is semantically required, only a refined 5-pointed white star (`☆`) is permitted (e.g. `☆ WORKOUT [B2]`, `☆ C2 SUMMIT ☆`).

### 4. Zero Double Outlines (Concentric Borders Prohibition)
- **Anti-Pattern (View cũ):** Outlining secondary badges or buttons inside an already-bordered card (e.g. bordered pill around `RANK: Scholar`, or 1px border stroke around the corner arrow button).
- **Enforced Solution (View mới):** A bordered surface (`1px solid var(--border-hairline)`) must never contain child elements with their own border strokes. Metadata must rely on mono typography, color contrast, or borderless background shifts.

### 5. Defensive Multi-Row Telemetry on Narrow Viewports
- **Anti-Pattern (View cũ):** Stuffing multiple variable-width labels into a single flex row (`ROADMAP`, `RANK: Scholar`, `SUMMIT: 38% (18/48 Nodes)`), causing text overlap and progress bar lines to cut through letter descenders on 360px–390px screens.
- **Enforced Solution (View mới):** Structure mobile telemetry into distinct, defensive micro-rows:
  - *Row 1:* Section Kicker (`ROADMAP`) on left, Status (`RANK: Scholar`) on right.
  - *Row 2:* Progress Metric (`SUMMIT: 38%`) on left, Fraction Count (`(18/48 Nodes)`) on right.
  - *Row 3:* Dedicated progress bar track with explicit margins.
  - *Daily Tasks:* Bound by `max-width` with text truncation so they never collide with the hero action button (`CONTINUE →`).

### 6. Zero-Scroll vs. Natural Scroll Principle
- **Contextual Scope:** Zero-Scroll (`overflow: 0px` on 844px height) applies **only when a view's content can naturally be compacted into an elegant, uncrowded surface** (e.g. Constellation Skill Deck, Star Map, or Home Dashboard).
- **Rich Content Exemption (Scroll Naturally):** It is **never a dogmatic requirement for every view**. Views containing deep or expansive content (Reading Articles, Writing Studio, Strategy Guides, Lexicon Lists, Exam Passages) MUST scroll naturally (`overflow-y: auto`) with `--safe-bottom-dock` clearance. Never artificially crush or compress rich educational content into an unscrollable container.

### 7. The iPhone 6 (375×667px) Resilience Test
- **The Ultimate Compact Benchmark:** Every view across both English Singularity and IELTS must be flexible enough to render flawlessly on legacy compact viewports down to **iPhone 6 (375×667px)**.
- **Resilience Criteria:**
  - Zero horizontal overflow (`overflow-x: hidden; scrollWidth === clientWidth`).
  - Safe Dock Clearance: The lowest interactive element or card must comfortably clear the fixed bottom dock (`padding-bottom: calc(var(--safe-bottom-dock, 84px) + 12px)`).
  - Adaptive Height: Use `min-height: 100%` instead of hardcoded `height: 100%`. On taller modern phones (iPhone 15 Pro, 390×844px), compact views fit seamlessly without scrolling; on compact phones (iPhone 6, 375×667px), the page gracefully and smoothly scrolls vertically without cutting off tiles or text.

### 8. Badge & Pill Anti-Wrap Invariant
- **Anti-Pattern (View cũ):** Inline badges, CEFR level chips, or category pills (`.skill-badge-pill`, `.hud-badge`, `.hud-pill`) lacking `white-space: nowrap`, causing words inside the oval to break awkwardly into 2–3 lines (e.g. `VOCABULARY &` / `COLLOCATIONS ·` / `A1` or `CELESTIAL` / `RADAR`).
- **Enforced Solution (View mới):** Every badge or pill must strictly enforce `white-space: nowrap; flex-shrink: 0;` and use borderless background shifts (`border: none; background: var(--soft-gold, ...)`) to eliminate concentric double borders inside cards.

### 9. Defensive Assessment & Telemetry Rendering (No `undefined` / `NaN%`)
- **Anti-Pattern (View cũ):** Directly interpolating caller data into telemetry or scorecard receipts (`${data.p1Correct} / 13` and `Math.round((data.p1Correct / 13) * 100)%`), outputting ugly `undefined / 13` and `NaN%` when detailed sub-scores are not passed, or jamming numbers into unspaced strings (`undefined/13undefined/13undefined/14`).
- **Enforced Solution (View mới):** All score calculation and modal report engines must defensively fall back to finite numbers calculated proportionally from `rawScore` if breakdown fields are missing. Never expose raw `undefined` or `NaN%` in UI receipts.

### 10. Modal Language & Action Consistency
- **Anti-Pattern (View cũ):** Mixing a lone localized string (e.g. `Đóng`) into an all-English Cambridge test report, or vice versa, and forcing programmatic focus on modal open which creates disruptive, thick coaxial focus rings before user interaction.
- **Enforced Solution (View mới):** Maintain 100% language consistency across modal content and actions (e.g. `Close Score Report` for English Cambridge tests; `Đóng báo cáo kết quả` for Vietnamese). Do not force programmatic focus if it triggers disruptive focus rings on render.

### 11. Universal Button Border-Radius Invariant (`--radius-btn: 10px`)
- **Anti-Pattern (View cũ):** Inconsistent button radii across different button lengths/widths: short chips (like `B2`) had 6px or 10px, medium buttons had 6px or 8px (`Evaluate Reconstruction ->`: 6px), wide/full-width buttons had 12px or 16px (`Flip Reveal`: 12px !important), creating an incoherent, mismatched visual rhythm.
- **Enforced Solution (View mới):** **EVERY SINGLE BUTTON ACROSS THE APP MUST USE THE EXACT SAME RADIUS:** `border-radius: var(--radius-btn, 10px);`. Button length/width does not dictate radius; short chips (`B2`), medium action buttons, and full-width CTAs (`Flip Reveal`, `Evaluate Reconstruction`, `Apply Profile`) share identical `10px` squircle curvature. Circle icon buttons (`border-radius: 50%`) are the only exception.

### 12. Focus-Ring & Outline Clearance Invariant
- **Anti-Pattern (View cũ):** Interactive buttons with focus outline or active rings protruding 3–4px into adjacent elements due to tight `gap: 8px` or mobile container reset rules (`.completion-receipt-card > * { margin: 0 !important; }`), colliding into paragraph descenders above (*kỳ lúc nào.*) and touching sibling buttons below. Horizontal strips (like `Hotkeys: 1 - 4 ...` next to `Skip Stage ->`) squeezed without gap on 375px/390px screens.
- **Enforced Solution (View mới):**
  - **Coaxial Ring Boundary:** Dual-layer focus ring uses `outline: 2px solid var(--focus-ring-inner) !important; outline-offset: 2px !important; box-shadow: 0 0 0 2px var(--focus-ring-outer) !important;` so the contrast halo stays within the offset gap without sprawling outward into adjacent elements.
  - **Button Stack Gap:** Vertical button groups use `gap: 12px !important;` (`.action-stack`, `.modal-actions`, `.button-stack`, `.placement-actions-cluster`, `.radar-actions-cluster`) ensuring at least 8px of pristine negative space between the outline and adjacent buttons.
  - **Preceding Content Clearance:** Action clusters must enforce `margin-top: 18px`–`22px` to guarantee ≥16px buffer from text descenders, active chips, or cards above.
  - **Narrow Viewport Action Strips:** Footer action rows with text hints (e.g. `quiz-footer-strip`) collapse to `flex-direction: column-reverse; align-items: stretch; gap: 12px;` on mobile (`max-width: 768px`), giving full-width 44px touch targets and centering hints below without horizontal squeezing.

### 13. Button Icon Padding & Spacing Invariant (Symmetrical Centering & Anti-Lopsided Layout)
- **Anti-Pattern (View cũ - Bị chê):**
  - Buttons with icons using default `display: inline-block` or inline text flow without flex centering.
  - Using ad-hoc hacks like `<span style="margin-left: 6px;">` next to an `${icon(...)}`, which combined with template literal whitespaces produces 10px+ uneven gaps while the left edge of the button has only ~6px browser default padding. Result: Icon hugs the left border, text is pushed far right, creating an asymmetrical, lopsided, distorted button ("méo hẳn, padding & spacing fail").
  - Icon SVG vertically misaligned against font baseline.
  - Roadmap/List items appending buttons directly to raw text without a flex row, causing buttons to break onto line 2 on longer items while staying on line 1 on shorter items.
- **Enforced Solution (View mới - Chuẩn Apple):**
  - **Flex Alignment & Gap:** Every button containing an icon MUST declare `display: inline-flex !important; align-items: center !important; justify-content: center !important; gap: 8px !important;` (or `gap: 6px` on compact badges/chips). Never use `margin-left` or `margin-right` on adjacent spans; `gap` controls icon-to-text distance cleanly.
  - **Symmetrical Edge Padding:** Minimum horizontal padding `padding: 10px 16px !important;` (or `8px 18px` / `6px 14px` on sm/xs) ensures the distance from the left edge to the icon equals the distance from the right edge to the text.
  - **SVG Alignment:** Icons inside buttons must declare `flex-shrink: 0 !important; display: block !important;` (or `display: inline-block; vertical-align: middle;`) to lock onto the vertical center axis of font descenders without baseline sag.
  - **Consistent List Step Rows:** Steps/roadmap rows must be structured flex cards (`display: flex; align-items: center; justify-content: space-between; gap: 12px;`) with `flex-shrink: 0; align-self: center !important;` on action buttons, preventing buttons from wrapping onto arbitrary second lines.
  - **100% Bilingual Button Consistency:** Multi-button modals (e.g. Cambridge 9.0 Score Report) must never mix English action buttons (`Review Answers`, `Retake Test`) with Vietnamese close buttons (`Đóng báo cáo kết quả`). Action verbs must be completely localized per active `I18n.getLocale()`.

### 14. File Explorer Folder Tabs & Uniform Grid Distribution Invariant
- **Anti-Pattern (View cũ - Bị chê):**
  - Tabs in multi-tab widgets/cards using ad-hoc `flex: 1` with loose padding and variable label lengths, causing the active tab pill to distort and stretch unevenly across states (e.g. `Word` was narrow while `4 Pillars` was excessively wide and lopsided: "thấy lúc active thì lại chưa đều nè").
  - Floating pill tabs disconnected from the card content below, lacking semantic visual connection between the active trigger and its viewport container.
- **Enforced Solution (View mới - Chuẩn File Explorer Folder):**
  - **Strict Uniform Grid (`repeat(N, 1fr)`):** Tab headers spanning multiple views MUST declare an exact uniform grid distribution (`display: grid; grid-template-columns: repeat(N, 1fr); width: 100%; gap: 4px;` in CSS or `layout_width="0dp"` with equal `layout_weight="1"` in Android XML). Every single tab slot is mathematically identical (e.g. 25.0% width for 4 tabs), guaranteeing that active tabs across any view or state remain 100% uniform, symmetrical, and consistent in dimension.
  - **File Explorer Folder Top Shoulders (`border-radius: 8px 8px 0 0`):** Each tab mimics a physical index folder tab protruding from the folder body, declaring rounded top corners (`border-radius: 8px 8px 0 0` / Android `topLeftRadius="8dp" topRightRadius="8dp"`) with a flat base.
  - **Seamless Folder Junction & Top Highlight:** The active tab physically merges with the folder body below: sharing the exact same elevated background tone (`#182030`), with a top accent indicator (`box-shadow: inset 0 2.5px 0 0 var(--accent, #a5b4fc);` or subtle gradient line) and zero bottom divider (`border-bottom: 1px solid var(--folder-surface)` / `margin-bottom: -1px; z-index: 3`). Inactive tabs remain recessed behind (`#11151f`, muted `#64748b`) like closed binder sections.
  - **Balanced Character Budget:** Tab labels pair 1 clean emoji/icon with 1 concise noun (e.g. `📖 Word`, `🧠 Quiz`, `🎯 Quests`, `⚡ Pillars`), avoiding multi-word sprawl that could induce font clipping or uneven baseline descent.

### Comparative Synthesis

| Feature | Legacy Approach (View cũ - Bị chê) | Canonical Solution (View mới - Chuẩn Apple) |
| :--- | :--- | :--- |
| **Card Action** | Nút bấm riêng ở đáy thẻ chiếm 44px chiều cao | Mũi tên góc phải không viền, toàn bộ thẻ là nút bấm |
| **Taglines** | Bị chèn ép thành dấu ba chấm `Intensive A...` | Súc tích, trọn vẹn 100% (`Articles`, `Studio`, `Phonetics`) |
| **Hero Banner** | Bị ép mỏng dẹt, giấu hết thông tin nhiệm vụ | Mở rộng đầy đặn: thanh Summit 38% + 3 dòng Daily Tasks |
| **Khoảng trống Card** | Cavernous void: trống rỗng ~120px giữa thẻ | Cân đối hoàn hảo, khoảng thở 35–45px tự nhiên |
| **Biểu tượng Sao** | Sao 4 cánh `✦` và sao đen `★` gây nhiễu | Không sao trang trí hoặc chỉ dùng sao 5 cánh trắng `☆` |
| **Viền huy hiệu** | Viền lồng viền (Double outlines quanh Rank & Arrow) | Không viền lồng, typography phẳng chuẩn Apple |
| **Bố cục Telemetry** | Dồn 1 dòng bị text overlap trên màn hình hẹp | Tách 2 vi hàng `space-between` + thanh bar riêng biệt |
| **Chữ trong Badge/Pill**| Bị bẻ gãy thành 2-3 dòng chữ vụn trong khung oval | Bắt buộc `white-space: nowrap; flex-shrink: 0; border: none;` |
| **Dữ liệu Điểm số** | Hiển thị `undefined / 13` và `NaN%` khi thiếu breakdown | Fallback phòng thủ tự động từ `rawScore`, 100% số hợp lệ |
| **Nút bấm Modal** | Nút `Đóng` cộc lốc lạc quẻ trong phiếu Cambridge | Nút ngữ nghĩa đầy đủ (`Close Score Report` / `Đóng báo cáo`) |
| **Góc bo Button** | Lộn xộn theo độ dài (chip 6px, nút vừa 8px, nút full 12px) | 100% dùng chung 1 radius duy nhất `--radius-btn: 10px` |
| **Khoảng thở Focus Outline** | Outline đè lên chữ (*kỳ lúc nào.*) và dính sát nút dưới | Coaxial shadow 2px, buffer ≥8px giữa các nút (gap 12px), ≥18px tới text |
| **Padding & Spacing Icon** | Icon dính mép trái, lệch trục chữ do margin-left hack | `inline-flex`, `gap: 8px`, `padding: 10px 16px`, cân xứng tuyệt đối |
| **Phân bổ Tab & Folder** | Tab co giãn lệch lạc theo độ dài chữ, pill lơ lửng | Lưới đều `repeat(N, 1fr)` (25%), tai folder `8px 8px 0 0`, gắn liền thân |
| **Zero-Scroll vs Cuộn** | Ép zero-scroll mù quáng hoặc để vỡ layout | Zero-scroll cho compact decks; view dài cuộn tự nhiên (`overflow-y: auto`) |
| **Khả năng tương thích** | Vỡ vụn hoặc bị cắt cụt trên màn hình ngắn | Đạt chuẩn iPhone 6 (375×667px): linh hoạt, không kẹt UI |

---

## 15. Specification-to-Code Fidelity Mandate

- Never quote or document design tokens from memory or speculative design plans.
- Always cross-reference exact names and values in [`web/src/assets/styles/variables.css`](file:///e:/Eng/web/src/assets/styles/variables.css) (`--shadow-tactile`, `--border-hairline`, `--pad-modal`, etc.) and implementation TypeScript engines.
- When updating [`docs/TYPOGRAPHY_SPACING_RULES.md`](file:///e:/Eng/docs/TYPOGRAPHY_SPACING_RULES.md), update [`.agents/rules/canonical-spacing.md`](file:///e:/Eng/.agents/rules/canonical-spacing.md), [`CLAUDE.md`](file:///e:/Eng/CLAUDE.md), and [`AGENTS.md`](file:///e:/Eng/AGENTS.md) in lockstep sync.

