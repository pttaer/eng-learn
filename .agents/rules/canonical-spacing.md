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
  | [ Button: Task 1 Visual Formula Inspector ]                            |  pad: 8px 18px; radius: 9px; min-h: 38–44px
  | [ Button: Task 2 4-Sentence Paragraph Workbench ]                      |  gap: 8px–12px between buttons
  | [ Primary Button: Launch Writing Studio (6 Blueprints & 5 Arch...) ]   |  accent-filled, high-contrast, radius: 9px
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
- **No symmetric ornaments on left-aligned text:** Use `✦ TITLE`, never `✦ TITLE ✦`.
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
- **Reduced Motion:** Respect `prefers-reduced-motion: reduce` by disabling scales and vibrations.

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
| **Symmetric Ornaments on Left-Aligned Text** (`✦ TITLE ✦`) | Leading glyph only (`✦ TITLE`) | Matching ends imply centring; the text is flush-left. |
| **0–4px Gap Between Stacked Text Blocks** (inline `gap: 2px` / `4px` in a column) | Mobile tiers: element 6px, group 8px, block 12px, section 16px (`--gap-element`, `--gap-group`, `--gap-block`, `--gap-section`). Exempt: a heading with its own one-line subtitle, and table rows | Lines that touch read as one crowded block. |
| **Fixed-Height Nested Scroll Box for a Content List on Mobile** (a 309px box inside the page) | Let the page scroll; the list takes its natural height. Canvas and map views are exempt | A second scroller hides content and makes the view feel cramped. |
| **Full-Width CTA Label Overflowing the Button** (`white-space: nowrap` at 390px) | `white-space: normal; text-align: center`; the label wraps inside the button | Text that spills past its container looks broken. |
| **Text Overflow Ellipsis on Mobile Titles** (`text-overflow: ellipsis`) | Allow multi-line wrapping with clean line-height | Truncating educational titles prevents learners from reading the question. |
| **Overlapping Content via `contain: size`** | Never set `contain: size` on content slots | Forces 0px height or overlaps sibling elements when content expands dynamically. |
| **Double Outlines / Nested Bordered Containers** (bordered box/card placed inside another bordered surface) | Use pure tonal elevation / background contrast (`--bg-surface-sunk`, `--bg-surface`, `--bg-card`) with zero inner stroke | Eliminates "box-in-a-box" clutter, concentric borders, and heavy visual noise. |
| **Aggressive Red Error Alarms on Mistake** | Use gentle `@keyframes apple-shake` and warm amber cues with `UndoManager` pill | Reduces cognitive anxiety and prevents learner burnout during long study sessions. |

---

## 13. Specification-to-Code Fidelity Mandate

- Never quote or document design tokens from memory or speculative design plans.
- Always cross-reference exact names and values in [`web/src/assets/styles/variables.css`](file:///e:/Eng/web/src/assets/styles/variables.css) (`--shadow-tactile`, `--border-hairline`, `--pad-modal`, etc.) and implementation TypeScript engines.
- When updating [`docs/TYPOGRAPHY_SPACING_RULES.md`](file:///e:/Eng/docs/TYPOGRAPHY_SPACING_RULES.md), update [`.agents/rules/canonical-spacing.md`](file:///e:/Eng/.agents/rules/canonical-spacing.md), [`CLAUDE.md`](file:///e:/Eng/CLAUDE.md), and [`AGENTS.md`](file:///e:/Eng/AGENTS.md) in lockstep sync.

