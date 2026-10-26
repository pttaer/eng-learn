# Precision Design System: Typography, Padding & Spacing Rules

> **AUTHORITATIVE DESIGN SPECIFICATION (UI/UX PRO-MAX & WCAG 2.2 AAA)**  
> **Target Scope:** Entire application suite (CEFR Skill Tree, 6 Mastery Dossiers, 12 Tenses Master Vault, IELTS Suite & Mock Cockpit).  
> **Source Tokens:** [`web/src/assets/styles/variables.css`](file:///e:/Eng/web/src/assets/styles/variables.css), [`web/src/assets/styles/hud-base.css`](file:///e:/Eng/web/src/assets/styles/hud-base.css), [`web/src/assets/styles/ux-c.css`](file:///e:/Eng/web/src/assets/styles/ux-c.css).

---

## 1. Core Architectural Principles

1. **4px / 8px Spatial Rhythm:** Every margin, padding, border radius, and flex/grid gap MUST resolve to the grid (`4px`, `6px`, `8px`, `10px`, `12px`, `14px`, `16px`, `20px`, `24px`, `32px`, `48px`, `64px`). `10px` and `14px` are the compact 2px step used by compact-tier and control padding. Never use other arbitrary values like `13px`, `21px`, or `37px`. Borders and 1–2px optical nudges are exempt.
2. **Two Typefaces Maximum:**
   - **Typeface 1 (`--font-sans` - Inter / System Neo-Grotesque):** Used for human reading comprehension, conversational prose, collocations, Vietnamese translations, and general UI controls.
   - **Typeface 2 (`--font-mono` - JetBrains Mono / SF Mono):** Used for scientific telemetry, coordinate kickers, CEFR levels (`[B2]`), timers, card indices (`[01 / 20]`), syntax formulas, and keycap cues.
3. **Fluid Clamping with Deterministic Mobile Fallbacks:** Typographic headers and container paddings use CSS `clamp()` to scale fluidly from compact mobile screens (360px–430px) to high-resolution desktop viewports (1440px+).
4. **Fitts's Law & WCAG 2.2 AAA Touch Targets:** All interactive triggers (buttons, filter tabs, level chips, rating docks) MUST have a minimum tap area of **`44px × 44px`** (`--touch-target-min`) with at least `6px` hit spacing. The 44px floor applies to every touch device, including tablets at 769–1024px. Only fine-pointer desktops (`@media (hover: hover) and (pointer: fine)`) may drop to `36px` min-height.
5. **Mobile Safe Dock Clearance:** Views under the fixed mobile bottom navigation bar (`.hud-bottom-nav`, visible at ≤768px) keep a content inset of **`84px`** (`--safe-bottom-dock` = 60px nav + 24px gap), plus `env(safe-area-inset-bottom)` added at the call site. Above 768px the nav is hidden and the inset is `0`. Views without a fixed bottom bar (IELTS has none) use `--pad-workspace` and no dock inset.
6. **Mobile-First Breakpoints:** Base styles are written for mobile. The only breakpoint boundary is **`768px`**: mobile is `max-width: 768px`, desktop overrides use `(width > 768px)`. `360px` is allowed only for small-phone tweaks. Do not add new `600`, `640`, `760`, `800`, `820`, `840`, or `900` queries. Existing ones fold into 768 only when that view is being edited.
7. **Minimum Text & Input Size:** Smallest text is `--font-kicker` (`11px`). `9px` and `10px` literals are prohibited. Form `input`, `select`, and `textarea` use `font-size: max(16px, var(--font-body))` on mobile so iOS Safari does not zoom on focus.

---

## 2. Typography Rules Matrix

| Role / Type | Selector / Utility | Typeface | Desktop Size | Mobile (≤768px) | Line Height | Weight | Letter Spacing | Text Transform | Intended Use |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **H1 Display / Page Title** | `h1`, `.hud-h1`, `.page-title`, `.ie-title` | `--font-sans` | `28px` (`1.75rem`) | `22px` (`1.375rem`) | `1.25` | `700` | `-0.02em` | Normal | Main screen title, Constellation hero, IELTS suite heading |
| **H2 Pillar / Module Title** | `h2`, `.hud-h2`, `.dossier-header-title`, `.pillar-title` | `--font-mono` | `20px` (`1.25rem`) | `15px` (`0.9375rem`) | `1.30` | `700` | `+0.04em` | Uppercase | Dossier banner (e.g. `[PILLAR 03 // FRANKLIN COPYWORK]`, `[12 TENSES MASTER VAULT]`) |
| **H3 Card / Section Heading** | `h3`, `.hud-h3`, `.card-title`, `.section-heading`, `.ie-sub` | `--font-sans` | `18px` (`1.125rem`) | `16px` (`1.000rem`) | `1.35` | `600` | `-0.01em` | Normal | Functional card headers, quiz sections, sub-feature banners |
| **H4 Component Cue / Field Subhead** | `h4`, `.hud-h4`, `.item-title`, `.cue-title` | `--font-sans` | `15px` (`0.9375rem`) | `14px` (`0.875rem`) | `1.40` | `600` | `0` | Normal | Step-by-step cue titles, field grouping subheadings |
| **Kicker / Overline / Telemetry** | `.hud-kicker`, `.telemetry-label` | `--font-mono` | `11px` (`0.6875rem`) | `11px` (`0.6875rem`) | `1.20` | `700` | `+0.08em` | Uppercase | Coordinate kickers, telemetry labels (`DRILL ACCURACY`, `REGISTER:`, `SIGNAL:`) |
| **Focus Prompt / Flashcard Cue** | `.card-cue-text`, `.tenses-prompt-sentence` | `--font-sans` | `22px` (`1.375rem`) | `16px` (`1.000rem`) | `1.35` | `600` | `-0.01em` | Normal | Primary flashcard prompt, copywork sentence, cloze sentence |
| **Body Prose (Reading Articles)** | `.hud-body`, `.prose-body`, `.article-content` | `--font-sans` | `16px` (`1.000rem`) | `15px` (`0.9375rem`) | `1.65` | `400` | `0` | Normal | Deep reading articles, Band 9 model essays, transcripts (max-width: 68ch) |
| **Body Compact / Notes** | `.hud-body-compact`, `.ie-lead`, `.explanation-text` | `--font-sans` | `13px` (`0.8125rem`) | `13px` (`0.8125rem`) | `1.50` | `400` | `0` | Normal | Descriptions, grammatical explanations, feedback hints |
| **Syntax Formula / Keycaps** | `.code-block`, `.formula-text`, `.keycap` | `--font-mono` | `12px` (`0.750rem`) | `11px` (`0.6875rem`) | `1.45` | `500` | `+0.02em` | Normal | Formula scaffolding (`[+] S + V(s/es)`), keyboard hotkey hints |

---

## 3. Padding Hierarchy Rules

Padding is structured in 6 strict tiers to maintain clear elevation and touch comfort across viewport sizes.

```
+---------------------------------------------------------------+  Tier 1: Screen Inset (--pad-screen: 12px mobile / 24px desktop)
|  +---------------------------------------------------------+  |  Tier 2: Workspace Container (--pad-workspace: 12px mobile / 24px desktop)
|  |  +---------------------------------------------------+  |  |  Tier 3: Surface Card (--pad-card: 14px mobile / 24px desktop)
|  |  |  +---------------------------------------------+  |  |  |  Tier 4: Sub-Card / Inner Block (--pad-card-compact: 10px / 16px)
|  |  |  |  [ Button / Tab / Chip ]                    |  |  |  |  Tier 6: Controls (--pad-btn: 8px 16px, min-height: 44px)
|  |  |  +---------------------------------------------+  |  |  |
|  |  +---------------------------------------------------+  |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
```

### Canonical Reference Exemplar (The Gold Standard View)

> **Exemplar Source:** IELTS Academic Writing View (`Mobile/1.0.0/37-mobile-ielts-writing.png` / `web/src/ielts/views/writing.ts` + `web/src/ielts/ielts.css`)  
> **Mandate:** All views across the application (Dossiers, Skill Tree, Placement Quiz, 12 Tenses, IELTS, Modals) must follow this visual spacing rhythm and padding rule.

- **Workspace Inset:** Defined by single sources of truth `--pad-screen-left: 12px;` and `--pad-screen-right: 12px;` in `variables.css`. Page Title, Lead paragraph, Hub Buttons, Section Subheadings, and Cards align flush along the same left edge.
- **Card Surface Geometry:** `padding: 16px` on all sides, `border-radius: 12px`, `border: 1px solid var(--border-hairline)`, and `display: flex; flex-direction: column; gap: 8px`.
- **Card Content Rhythm:** Bold card title (`<b>`) followed by an `8px` gap, then secondary metadata (`<span>` / `<small>`).
- **Interactive Buttons:** `padding: 8px 18px`, `border-radius: 9px`, stacked with `8px`–`12px` gap. Primary action button is filled with accent color (`var(--accent-cyan)` or lavender) with high-contrast text.
- **Section Separation:** `var(--gap-block)` (`12px` mobile / `16px`–`20px` desktop) between cards and between button stacks and section headers.
- **Top Header Bar:** `padding: 12px var(--pad-screen-right) 12px var(--pad-screen-left)`, sticky with `gap: 8px` on navigation pills (`padding: 8px 12px`, `border-radius: 8px`).

### Padding Tier Specifications

1. **Tier 1: Screen & Viewport Inset (Single Source of Truth in `variables.css`)**
   - **Left Inset:** `--pad-screen-left: 12px;` (1 place to control all left padding)
   - **Right Inset:** `--pad-screen-right: 12px;` (1 place to control all right padding)
   - **Vertical:** `10px`–`16px` (incorporating `env(safe-area-inset)`)

2. **Tier 2: Workspace & Module Mounting Inset (`--pad-workspace`)**
   - **Formula:** `16px var(--pad-screen-right) 24px var(--pad-screen-left);`
   - **Desktop & Mobile:** Automatically inherits `--pad-screen-left` and `--pad-screen-right`; mobile keeps `84px` bottom safe dock clearance (under the bottom nav only)

3. **Tier 3: Card & Surface Inset (`--pad-card`)**
   - **Desktop:** `24px` all sides
   - **Mobile (≤768px):** `14px` all sides
   - Token: `clamp(14px, 2.5vw, 24px)`
   - Applied to: `.atomic-card-container`, `.dossier-card`, `.ie-card`, `.tenses-card-question`

4. **Tier 4: Compact Card & Sub-Module Inset (`--pad-card-compact`)**
   - **Desktop:** `16px` all sides
   - **Mobile (≤768px):** `10px – 12px` all sides
   - Token: `clamp(10px, 1.8vw, 16px)`
   - Applied to: `.telemetry-cluster`, `.ie-q`, `.signal-box`, `.scaffolding-box`

5. **Tier 5: Modal & Action Sheet Inset (`--pad-modal`)**
   - **Desktop:** `28px` all sides, max-width `820px`
   - **Mobile (≤768px):** `16px` all sides, max-height `90dvh`
   - Token: `clamp(14px, 3vw, 28px)`
   - Applied to: `.hud-modal-box`, `.ie-tip-modal-box`, `.quiz-modal-box`

6. **Tier 6: Interactive Controls Inset & Touch Target**
   - **Primary Action Button:** Desktop `8px 16px` (min-height `40px`); Mobile `8px 14px` (min-height `44px`)
   - **Filter Tab / Category Tab:** Desktop fine-pointer `6px 14px` (min-height `36px`); Touch/mobile `6px 12px` (min-height `44px`, horizontal scroll)
   - **Level Chip (`A1`–`C2`):** Desktop fine-pointer `4px 10px` (min-height `36px`); Touch/mobile `4px 10px` (min-height `44px`, min-width `44px`). Six chips at 44px + 6px gaps = 294px, fits 390px minus 24px padding.
   - **Input & Search Field:** Desktop `8px 14px` (min-height `40px`); Mobile `10px 14px` (min-height `44px`)
   - **Card Rating Dock (Again / Reveal / Good):** Mobile `6px 8px` side-by-side (`flex: 1 1 0; min-height: 44px`)

---

## 4. Spacing & Spatial Rhythm Rules (Gaps & Margins)

All elements must use dedicated semantic gap tokens to prevent uneven visual spacing.

| Token | Desktop Value | Mobile Value | Semantic Purpose | Typical Usage |
| :--- | :--- | :--- | :--- | :--- |
| **`--gap-section`** | `32px` (`2.0rem`) | `16px` (`1.0rem`) | Separation between major layout sections | Between top navigation, control bar, and main workout area |
| **`--gap-block`** | `20px` (`1.25rem`) | `12px` (`0.75rem`) | Separation between sibling cards or grid items | Cards in `.ie-cards`, prompt vs telemetry block |
| **`--gap-group`** | `12px` (`0.75rem`) | `8px` (`0.50rem`) | Gap between related form fields, header elements | Between level chips and search bar in `.control-row` |
| **`--gap-element`** | `8px` (`0.50rem`) | `6px` (`0.375rem`) | Spacing between small pills, chips, and tags | Items inside `.dossier-tabs`, `.tenses-family-tabs` |
| **`--gap-inline`** | `4px` (`0.25rem`) | `4px` (`0.25rem`) | Spacing between inline icon and adjacent text label | Inside `.hud-btn`, `.ie-card-badge`, `.telemetry-item` |
| **`--safe-bottom-dock`** | `0px` | `84px` | Safe scroll clearance above the fixed mobile navigation bar (60px nav + 24px gap) | Bottom padding for `#workspace-mount` (main app only); `env(safe-area-inset-bottom)` added at call site |

---

## 5. CSS Utility Classes & Declarations

Developers and agents can utilize these standardized classes directly in HTML or module templates:

```css
/* Typography Utilities */
.hud-h1           { font-family: var(--font-sans); font-size: var(--font-h1); line-height: var(--font-h1-line); font-weight: var(--font-h1-weight); letter-spacing: -0.02em; }
.hud-h2           { font-family: var(--font-mono); font-size: var(--font-h2); line-height: var(--font-h2-line); font-weight: var(--font-h2-weight); text-transform: uppercase; letter-spacing: 0.04em; }
.hud-h3           { font-family: var(--font-sans); font-size: var(--font-h3); line-height: var(--font-h3-line); font-weight: var(--font-h3-weight); }
.hud-h4           { font-family: var(--font-sans); font-size: var(--font-h4); line-height: var(--font-h4-line); font-weight: var(--font-h4-weight); }
.hud-kicker       { font-family: var(--font-mono); font-size: var(--font-kicker); line-height: var(--font-kicker-line); font-weight: var(--font-kicker-weight); letter-spacing: var(--font-kicker-spacing); text-transform: uppercase; color: var(--ink-muted); }
.hud-body         { font-family: var(--font-sans); font-size: var(--font-body); line-height: var(--font-body-line); }
.hud-body-compact { font-family: var(--font-sans); font-size: var(--font-body-compact); line-height: var(--font-body-compact-line); color: var(--ink-secondary); }

/* Spacing Rhythm Utilities */
.hud-section-gap  { gap: var(--gap-section); }
.hud-block-gap    { gap: var(--gap-block); }
.hud-group-gap    { gap: var(--gap-group); }
.hud-element-gap  { gap: var(--gap-element); }

/* Padding Surface Utilities */
.hud-card-surface { padding: var(--pad-card); }
.hud-card-compact { padding: var(--pad-card-compact); }
.hud-workspace    { padding: var(--pad-workspace); }
```

---

## 6. Anti-Patterns & Quality Checks (Never Do These)

| Anti-Pattern (PROHIBITED) | Standard Solution (MANDATORY) | Rationale |
| :--- | :--- | :--- |
| **Hardcoded Arbitrary Font Sizes** (`font-size: 21px`, `font-size: 19px`, `9px`, `10px`) | Use semantic token (`var(--font-h3)`, `var(--font-prompt)`, `var(--font-kicker)` for the 11px floor) | Prevents uncoordinated typographic chaos across modules |
| **Vertical Stacking of Horizontal Tabs on Mobile** | Use `flex-direction: row; flex-wrap: nowrap; overflow-x: auto;` with scrollbar hidden | Stacking 6 category buttons consumes 240px vertical screen space, pushing exercises below fold |
| **Crushed Table Headers** (`overflow-wrap: anywhere` without `min-width`) | Wrap in horizontal scroll container, set `min-width: 600px; white-space: nowrap !important;` | Eliminates 1-letter-per-line vertical text destruction on mobile |
| **Floating Overlays Obscuring Bottom Navigation** | Hide corner compass & watermark version under `@media (max-width: 768px)` | Prevents touch obstruction over mobile Bottom Navigation Bar |
| **Rating Buttons Stacked in Vertical Column** | Maintain `flex-direction: row` side-by-side with `min-height: 44px` | Preserves Fitts's Law touch efficiency and vertical viewport budget |
| **Content Trapped Behind Fixed Mobile Bar** | Ensure `#workspace-mount` has `padding-bottom: calc(var(--safe-bottom-dock) + env(safe-area-inset-bottom, 0px))` on ≤768px | Guarantees all interactive choices and inputs can be scrolled fully into clear view |
| **Touch Target Below 44px on Touch Devices** (`min-height: 32px`–`42px` with no fine-pointer query) | `min-height: var(--touch-target-min)`; smaller only under `(hover: hover) and (pointer: fine)` | Fitts's Law; WCAG 2.2 AAA 44px; iPad portrait is touch but wider than 768px |
| **Input Font Below 16px on Mobile** | `font-size: max(16px, var(--font-body))` | iOS Safari zooms the page on focus when input text is under 16px |
| **Desktop-First Max-Width Breakpoints in New CSS** (`max-width: 900px`, `max-width: 640px`) | Mobile base styles + `(width > 768px)` for desktop | One boundary keeps nav, dock and layout switching in sync |
| **Duplicate Rule for One Class** (two `.telemetry-label` blocks, the later one overriding tokens) | One definition per class, written with tokens | A later duplicate silently overrides the spec and changes every view |
| **Kicker Drift** (inline `letter-spacing: 0.1em` / `0.12em`, or a size other than `--font-kicker`) | `--font-kicker` 11px, `--font-kicker-spacing` (0.08em), no inline overrides | Keeps kickers identical everywhere; wide tracking makes Vietnamese caps wrap |
| **Badge or Chip Breaking Across Lines** (`[ TỪ VỰNG ]` split inside its brackets) | `.hud-badge { white-space: nowrap; flex-shrink: 0 }`; a row holding a kicker plus a badge uses `flex-wrap: wrap; gap: 4px 8px` | A badge is one unit; it moves as a whole or stays on the line |
| **Mixed Alignment in One Block** (centred heading above flush-left body) | Flush-left everywhere; centre only a whole hero or empty-state card, where every line inside is centred | Mixed alignment reads as a mistake, not a choice |
| **Symmetric Ornaments on Left-Aligned Text** (`✦ TITLE ✦`) | Leading glyph only (`✦ TITLE`) | Matching ends imply centring; the text is flush-left |
| **0–4px Gap Between Stacked Text Blocks** (inline `gap: 2px` / `4px` in a column) | Mobile tiers: element 6px, group 8px, block 12px, section 16px (`--gap-element`, `--gap-group`, `--gap-block`, `--gap-section`). Exempt: a heading with its own one-line subtitle, and table rows | Lines that touch read as one crowded block |
| **Fixed-Height Nested Scroll Box for a Content List on Mobile** (a 309px box inside the page) | Let the page scroll; the list takes its natural height. Canvas and map views are exempt | A second scroller hides content and makes the view feel cramped |
| **Full-Width CTA Label Overflowing the Button** (`white-space: nowrap` at 390px) | `white-space: normal; text-align: center`; the label wraps inside the button | Text that spills past its container looks broken |

---

*Authored and Approved under Directive ENG-23 for English Singularity Core Architecture.*
