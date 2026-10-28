# Precision Design System: Master UI/UX, Typography, Padding & Motion Rules

> **AUTHORITATIVE DESIGN SPECIFICATION (UI/UX PRO-MAX, APPLE-CALM & WCAG 2.2 AAA)**  
> **Target Scope:** Entire application suite (CEFR Skill Tree, 6 Mastery Dossiers, 12 Tenses Master Vault, IELTS Suite & Mock Cockpit, Modals & Drawers).  
> **Source Files & Tokens:** [`web/src/assets/styles/variables.css`](file:///e:/Eng/web/src/assets/styles/variables.css), [`web/src/assets/styles/apple-motion.css`](file:///e:/Eng/web/src/assets/styles/apple-motion.css), [`web/src/assets/styles/apple-toast.css`](file:///e:/Eng/web/src/assets/styles/apple-toast.css), [`web/src/assets/styles/hud-base.css`](file:///e:/Eng/web/src/assets/styles/hud-base.css), [`web/src/assets/styles/ux-c.css`](file:///e:/Eng/web/src/assets/styles/ux-c.css), [`web/src/core/acoustic-haptics.ts`](file:///e:/Eng/web/src/core/acoustic-haptics.ts), [`web/src/core/undo-manager.ts`](file:///e:/Eng/web/src/core/undo-manager.ts), [`web/src/core/exercise-engine.ts`](file:///e:/Eng/web/src/core/exercise-engine.ts).  
> **Canonical Reference Screenshot:** [`Mobile/1.0.0/37-mobile-ielts-writing.png`](file:///e:/Eng/Mobile/1.0.0/37-mobile-ielts-writing.png).

---

## 1. Core Architectural Principles

1. **4px / 8px Spatial Rhythm:** Every margin, padding, border radius, and flex/grid gap MUST resolve to the grid (`4px`, `6px`, `8px`, `10px`, `12px`, `14px`, `16px`, `20px`, `24px`, `32px`, `48px`, `64px`). `10px` and `14px` are the compact 2px step used by compact-tier and control padding. Never use other arbitrary values like `13px`, `21px`, or `37px`. Borders and 1–2px optical nudges are exempt.
2. **Two Typefaces Maximum:**
   - **Typeface 1 (`--font-sans` - Inter / System Neo-Grotesque):** Used for human reading comprehension, conversational prose, collocations, Vietnamese translations, and general UI controls.
   - **Typeface 2 (`--font-mono` - JetBrains Mono / SF Mono):** Used for scientific telemetry, coordinate kickers, CEFR levels (`[B2]`), timers, card indices (`[01 / 20]`), syntax formulas, and keycap cues.
3. **Fluid Clamping with Deterministic Mobile Fallbacks:** Typographic headers and container paddings use CSS `clamp()` to scale fluidly from compact mobile screens (360px–430px) to high-resolution desktop viewports (1440px+).
4. **Fitts's Law & WCAG 2.2 AAA Touch Targets:** All interactive triggers (buttons, filter tabs, level chips, rating docks, modal dismiss triggers) MUST have a minimum tap area of **`44px × 44px`** (`--touch-target-min`) with at least `6px` hit spacing. The 44px floor applies to every touch device, including tablets at 769–1024px. Only fine-pointer desktops (`@media (hover: hover) and (pointer: fine)`) may drop to `36px`–`38px` min-height.
5. **Mobile Safe Dock Clearance:** Views under the fixed mobile bottom navigation bar (`.hud-bottom-nav`, visible at ≤768px) keep a content inset of **`84px`** (`--safe-bottom-dock` = 60px nav + 24px gap), plus `env(safe-area-inset-bottom)` added at the call site. Above 768px the nav is hidden and the inset is `0`. Views without a fixed bottom bar (such as the IELTS suite) use `--pad-workspace` and no dock inset.
6. **Mobile-First Breakpoints (Single Boundary):** Base styles are written for mobile. The only breakpoint boundary is **`768px`**: mobile is `max-width: 768px`, desktop overrides use `(width > 768px)`. `360px` is allowed only for small-phone tweaks. Do not add new `600`, `640`, `760`, `800`, `820`, `840`, or `900` queries. Existing ones fold into 768 only when that view is being edited.
7. **Minimum Text & Input Size:** Smallest text is `--font-kicker` (`11px`). `9px` and `10px` literals are prohibited. Form `input`, `select`, and `textarea` use `font-size: max(16px, var(--font-body))` on mobile so iOS Safari does not zoom on focus.
8. **Shared Workspace Skeleton & Containment:** All views share one structural skeleton: toolbars span the 1040px max workspace; cards and nav bars share one centered 760px column so outer edges align identically across views. Every view starts at the same top edge. Use `contain: layout style` for performance, but **never use `contain: size` on content slots** (preventing clipped text or overlapping siblings).
9. **Border Diet, Layered Depth & Double-Outline Prohibition:** Soften harsh mechanical lines. Transition from dense borders (`rgba(255, 255, 255, 0.18)`) to calm hairlines (`rgba(255, 255, 255, 0.04)` to `0.08`), relying on layered background elevations and subtle ambient shadows for depth. **Strictly prohibit double outlines / concentric bordered boxes:** never place a bordered container, card, or box directly inside another bordered card/surface. Use pure tonal elevation (`--bg-surface-sunk`, `--bg-surface`, `--bg-card`) with zero inner stroke.

---

## 2. Typography Rules Matrix

| Role / Type | Selector / Utility | Typeface | Desktop Size | Mobile (≤768px) | Line Height | Weight | Letter Spacing | Text Transform | Intended Use |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **H1 Display / Page Title** | `h1`, `.hud-h1`, `.page-title`, `.ie-title` | `--font-sans` | `28px` (`1.75rem`) | `22px` (`1.375rem`) | `1.25` | `700` | `-0.02em` | Normal | Main screen title, Constellation hero, IELTS suite heading |
| **H2 Pillar / Module Title** | `h2`, `.hud-h2`, `.dossier-header-title`, `.pillar-title` | `--font-mono` | `20px` (`1.25rem`) | `15px` (`0.9375rem`) | `1.30` | `700` | `+0.04em` | Uppercase | Dossier banner (e.g. `[PILLAR 03 // FRANKLIN COPYWORK]`, `[12 TENSES MASTER VAULT]`) |
| **H3 Card / Section Heading** | `h3`, `.hud-h3`, `.card-title`, `.section-heading`, `.ie-sub` | `--font-sans` | `18px` (`1.125rem`) | `16px` (`1.000rem`) | `1.35` | `600` | `-0.01em` | Normal | Functional card headers, quiz sections, sub-feature banners |
| **H4 Component Cue / Field Subhead** | `h4`, `.hud-h4`, `.item-title`, `.cue-title` | `--font-sans` | `15px` (`0.9375rem`) | `14px` (`0.875rem`) | `1.40` | `600` | `0` | Normal | Step-by-step cue titles, field grouping subheadings |
| **Kicker / Overline / Telemetry** | `.hud-kicker`, `.telemetry-label` | `--font-mono` | `11px` (`0.6875rem`) | `11px` (`0.6875rem`) | `1.20` | `700` | `+0.08em` | Uppercase | Coordinate kickers, telemetry labels (`DRILL ACCURACY`, `REGISTER:`, `SIGNAL:`). Minimum 11px floor. |
| **Focus Prompt / Flashcard Cue** | `.card-cue-text`, `.tenses-prompt-sentence` | `--font-sans` | `22px` (`1.375rem`) | `16px` (`1.000rem`) | `1.35` | `600` | `-0.01em` | Normal | Primary flashcard prompt, copywork sentence, cloze sentence |
| **Body Prose (Reading Articles)** | `.hud-body`, `.prose-body`, `.article-content` | `--font-sans` | `16px` (`1.000rem`) | `15px` (`0.9375rem`) | `1.65` | `400` | `0` | Normal | Deep reading articles, Band 9 model essays, transcripts (max-width: 68ch) |
| **Body Compact / Notes** | `.hud-body-compact`, `.ie-lead`, `.explanation-text` | `--font-sans` | `13px` (`0.8125rem`) | `13px` (`0.8125rem`) | `1.50` | `400` | `0` | Normal | Descriptions, grammatical explanations, feedback hints |
| **Syntax Formula / Keycaps** | `.code-block`, `.formula-text`, `.keycap` | `--font-mono` | `12px` (`0.750rem`) | `11px` (`0.6875rem`) | `1.45` | `500` | `+0.02em` | Normal | Formula scaffolding (`[+] S + V(s/es)`), keyboard hotkey hints |
| **Form Inputs & Textareas** | `input`, `textarea`, `select`, `.ie-trap-input` | `--font-sans` | `14px` (`0.875rem`) | `max(16px, var(--font-body))` | `1.40` | `400` | `0` | Normal | Eliminates iOS Safari auto-zoom on field focus |

---

## 3. Padding Hierarchy Rules & Elevation Tiers

Padding is structured in 6 strict tiers to maintain clear elevation, breathing room, and touch comfort across viewport sizes.

```
+---------------------------------------------------------------+  Tier 1: Screen Inset (--pad-screen: 12px mobile / 24px desktop)
|  +---------------------------------------------------------+  |  Tier 2: Workspace Container (--pad-workspace: 16px 12px 24px 12px)
|  |  +---------------------------------------------------+  |  |  Tier 3: Surface Card (--pad-card: 16px mobile / 24px desktop)
|  |  |  +---------------------------------------------+  |  |  |  Tier 4: Sub-Card / Inner Block (--pad-card-compact: 10px / 16px)
|  |  |  |  [ Button / Tab / Chip ]                    |  |  |  |  Tier 6: Controls (--pad-btn: 8px 18px, min-h: 44px)
|  |  |  +---------------------------------------------+  |  |  |
|  |  +---------------------------------------------------+  |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
```

### Canonical Reference Exemplar (The Gold Standard View)

> **Exemplar Source:** IELTS Academic Writing View ([`Mobile/1.0.0/37-mobile-ielts-writing.png`](file:///e:/Eng/Mobile/1.0.0/37-mobile-ielts-writing.png) / [`web/src/ielts/views/writing.ts`](file:///e:/Eng/web/src/ielts/views/writing.ts) & [`web/src/ielts/ielts.css`](file:///e:/Eng/web/src/ielts/ielts.css))  
> **Mandate:** All views across the application (Dossiers, Skill Tree, Placement Quiz, 12 Tenses, IELTS, Modals) must follow this visual spacing rhythm and padding rule.

- **Workspace Inset:** Defined by single sources of truth `--pad-screen-left: 12px;` and `--pad-screen-right: 12px;` in `variables.css`. Page Title, Lead paragraph, Hub Buttons, Section Subheadings, and Cards align flush along the same left edge.
- **Card Surface Geometry:** `padding: 16px` on all sides, `border-radius: 12px` (or `--radius-squircle-md`), `border: 1px solid var(--border-hairline)`, and `display: flex; flex-direction: column; gap: 8px`.
- **Card Content Rhythm:** Bold card title (`<b>`) followed by an `8px` gap, then secondary metadata (`<span>` / `<small>`).
- **Interactive Buttons:** `padding: 8px 18px`, `border-radius: 10px` (or `--radius-btn` / `--radius-squircle-sm`), stacked with `8px`–`12px` gap. Primary action button is filled with accent color (`var(--accent-cyan)` or lavender) with high-contrast text. All buttons share the exact same radius token `--radius-btn: 10px` regardless of button width.
- **Section Separation:** `var(--gap-block)` (`12px` mobile / `16px`–`20px` desktop) between cards and between button stacks and section headers.
- **Top Header Bar:** `padding: 12px var(--pad-screen-right) 12px var(--pad-screen-left)`, sticky with `gap: 8px` on navigation pills (`padding: 8px 12px`, `border-radius: 8px`).

### Padding Tier Specifications

1. **Tier 1: Screen & Viewport Inset (Single Source of Truth in `variables.css`)**
   - **Left Inset:** `--pad-screen-left: 12px;` (1 place to control all left padding)
   - **Right Inset:** `--pad-screen-right: 12px;` (1 place to control all right padding)
   - **Vertical:** `10px`–`16px` (incorporating `env(safe-area-inset)`)

2. **Tier 2: Workspace & Module Mounting Inset (`--pad-workspace`)**
   - **Formula:** `16px var(--pad-screen-right) 24px var(--pad-screen-left);`
   - **Desktop & Mobile:** Automatically inherits `--pad-screen-left` and `--pad-screen-right`; mobile keeps `84px` bottom safe dock clearance (under the bottom nav only).

3. **Tier 3: Card & Surface Inset (`--pad-card`)**
   - **Desktop:** `24px` all sides
   - **Mobile (≤768px):** `14px`–`16px` all sides
   - Token: `clamp(14px, 2.5vw, 24px)`
   - Applied to: `.atomic-card-container`, `.dossier-card`, `.ie-card`, `.tenses-card-question`

4. **Tier 4: Compact Card & Sub-Module Inset (`--pad-card-compact`)**
   - **Desktop:** `16px` all sides
   - **Mobile (≤768px):** `10px`–`12px` all sides
   - Token: `clamp(10px, 1.8vw, 16px)`
   - Applied to: `.telemetry-cluster`, `.ie-q`, `.signal-box`, `.scaffolding-box`

5. **Tier 5: Modal & Action Sheet Inset (`--pad-modal`)**
   - **Desktop:** `28px` all sides, max-width `820px`
   - **Mobile (≤768px):** `16px` all sides, max-height `90dvh`
   - Token: `clamp(16px, 3vw, 28px)`
   - Applied to: `.hud-modal-box`, `.ie-tip-modal-box`, `.quiz-modal-box`

6. **Tier 6: Interactive Controls Inset & Touch Target**
   - **Primary Action Button:** Desktop `8px 18px` (min-height `40px`); Mobile `8px 14px` (min-height `44px`)
   - **Filter Tab / Category Tab:** Desktop fine-pointer `6px 14px` (min-height `36px`); Touch/mobile `6px 12px` (min-height `44px`, horizontal scroll)
   - **Level Chip (`A1`–`C2`):** Desktop fine-pointer `4px 10px` (min-height `36px`); Touch/mobile `4px 10px` (min-height `44px`, min-width `44px`).
   - **Input & Search Field:** Desktop `8px 14px` (min-height `40px`); Mobile `10px 14px` (min-height `44px`, font-size `max(16px, var(--font-body))`)
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

## 5. Apple-Calm Squircle & Continuous Curvature Tokens

To minimize cognitive fatigue, the design system utilizes Apple-like continuous curvature (squircles) and layered surface elevation instead of aggressive angular borders.

### 5.1 Radius Tokens
- **`--radius-squircle-sm: 10px`**: Applied to compact controls, pill tags, badges, and inline keycaps (`.squircle-sm`).
- **`--radius-squircle-md: 16px`**: Applied to primary cards, telemetry clusters, and modal inner containers (`.squircle-md`).
- **`--radius-squircle-lg: 24px`**: Applied to primary feature dialogs, hero containers, and sheet modals (`.squircle-lg`).
- **`--radius-pill: 9999px`**: Applied to filter tabs, navigation pills, and universal undo notifications.

### 5.2 Layered Ambient Depth & Soft Border Diet
- **Obsidian Dark Surface Elevation (`html[data-theme="dark"]`):**
  - Canvas: `--bg-canvas: #080a0f;` (Deep space obsidian canvas)
  - Surface: `--bg-surface: #111622;` (Warm elevated pane)
  - Card: `--bg-card: #182030;` (Tactile card surface)
  - Sunk: `--bg-surface-sunk: #0d121c;` (Recessed input background)
  - Border Hairline: `--border-hairline: rgba(255, 255, 255, 0.06);` (Replaced harsh 0.18 outlines)
  - Border Subtle: `--border-subtle: rgba(255, 255, 255, 0.12);`
- **Warm Paper Light Surface Elevation (`html[data-theme="light"]`):**
  - Canvas: `--bg-canvas: #fafaf9;` (Crisp archival paper)
  - Surface: `--bg-surface: #ffffff;`
  - Card: `--bg-card: #ffffff;`
  - Sunk: `--bg-surface-sunk: #f1f5f9;`
  - Border Hairline: `--border-hairline: rgba(15, 23, 42, 0.10);`
  - Border Subtle: `--border-subtle: rgba(15, 23, 42, 0.20);`
- **Soft Ambient & Tactile Shadows:**
  - Ambient: `--shadow-ambient: 0 8px 32px -4px rgba(0, 0, 0, 0.35), 0 2px 8px -2px rgba(0, 0, 0, 0.20);`
  - Tactile: `--shadow-tactile: 0 2px 8px -1px rgba(0, 0, 0, 0.25);`
  - Card: `--shadow-card: 0 4px 24px rgba(0, 0, 0, 0.55), 0 0 1px rgba(255, 255, 255, 0.14);`
- **Frosted Glass Surface (`.apple-glass`):**
  - Dark: `background: rgba(18, 23, 34, 0.78); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid var(--border-hairline);`
  - Light: `background: rgba(255, 255, 255, 0.82); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(0, 0, 0, 0.06);`

### 5.3 Semantic Status & WCAG 2.2 AAA Contrast Tokens
All status alerts, tags, and feedback messages must pair status surfaces with high-contrast inks:
- **Obsidian Dark:**
  - Success: `--good: #34d399;`, `--good-soft: rgba(52, 211, 153, 0.16);`, `--good-border: rgba(52, 211, 153, 0.35);`, `--ink-good: #34d399;`, `--ink-on-good: #064e3b;`
  - Warning: `--warning: #fbbf24;`, `--warning-soft: rgba(251, 191, 36, 0.16);`, `--warning-border: rgba(251, 191, 36, 0.35);`, `--ink-warning: #fbbf24;`, `--ink-on-warning: #78350f;`
  - Critical: `--critical: #f87171;`, `--critical-soft: rgba(248, 113, 113, 0.16);`, `--critical-border: rgba(248, 113, 113, 0.35);`, `--ink-critical: #f87171;`, `--ink-on-critical: #ffffff;`
  - Info: `--info: #60a5fa;`, `--info-soft: rgba(96, 165, 250, 0.16);`, `--info-border: rgba(96, 165, 250, 0.35);`, `--ink-info: #60a5fa;`, `--ink-on-info: #ffffff;`
- **Warm Paper Light (WCAG 4.5:1+ Floor):**
  - Success: `--good: #10b981;`, `--good-soft: rgba(16, 185, 129, 0.12);`, `--ink-good: #047857;` (7.0:1 contrast)
  - Warning: `--warning: #f59e0b;`, `--warning-soft: rgba(245, 158, 11, 0.12);`, `--ink-warning: #92400e;` (5.9:1 contrast)
  - Critical: `--critical: #ef4444;`, `--critical-soft: rgba(239, 68, 68, 0.12);`, `--ink-critical: #b91c1c;` (6.2:1 contrast)
  - Info: `--info: #2563eb;`, `--info-soft: rgba(37, 99, 235, 0.10);`, `--ink-info: #1d4ed8;` (5.8:1 contrast)

### 5.4 Canonical Z-Index Hierarchy Scale
Eliminates arbitrary z-index literals (`9999`, `10000`, `100050`). All stacked elements MUST bind to:
- Canvas & Base: `--z-sunk: -1`, `--z-base: 0`, `--z-canvas-bg: 1`, `--z-surface: 5`, `--z-hud-base: 10`.
- Interaction & Structure: `--z-sticky: 100`, `--z-card-layer: 200`, `--z-bottom-nav: 400`, `--z-dropdown: 500`, `--z-drawer: 600`.
- Overlays & Popups: `--z-modal-backdrop: 800`, `--z-modal: 900` (`--z-modal-lens: 900`), `--z-toast: 1000`, `--z-tooltip: 1100`, `--z-cursor: 9999`.

### 5.5 Skeleton Loading & Shimmer Tokens
For asynchronous and cached state loading transitions:
- Dark: `--shimmer-base: rgba(255, 255, 255, 0.05);`, `--shimmer-highlight: rgba(255, 255, 255, 0.12);`
- Light: `--shimmer-base: rgba(15, 23, 42, 0.06);`, `--shimmer-highlight: rgba(15, 23, 42, 0.14);`
- Utility: `.skeleton-box`, `.skeleton-shimmer` with `@keyframes apple-shimmer` (disabled under `prefers-reduced-motion`).

---

## 6. Kinematics & Motion Physics (`apple-motion.css`)

Motion must provide tactile sensory reassurance without performing for its own sake.

1. **Native Spring Curves:**
   - `--spring-smooth: cubic-bezier(0.16, 1, 0.3, 1)` (Fluid modal entrance and card flips).
   - `--spring-bounce: cubic-bezier(0.34, 1.56, 0.64, 1)` (Floating toast pops).
   - `--spring-press: cubic-bezier(0.2, 0.8, 0.2, 1)` (120ms button depression).
2. **Tactile Spring Press (`.apple-press`, `.hud-btn:active`, `.atomic-btn:active`):**
   - Compresses slightly to `scale(0.975)` with a 120ms spring release (`cubic-bezier(0.2, 0.8, 0.2, 1)`), providing physical confirmation of touch.
3. **Gentle Mistake Physics (No Harsh Red Alarms):**
   - `@keyframes apple-shake`: Gentle spring oscillation (`translateX(-6px)` to `+6px` over 340ms via `--spring-smooth`). Avoids jarring red flashings that provoke user anxiety.
4. **Paragraph Focus Dimming (Zen Mode Immersion):**
   - `.reading-paragraph`, `.paragraph-dimmed` (dimmed to 0.42 opacity), `.paragraph-focused` (opacity 1 with subtle focus tint `rgba(165, 180, 252, 0.06)`) to isolate active sentences and eliminate distraction during deep reading.
5. **Ambient Idle Hint Pulse:**
   - `@keyframes ambient-hint-pulse`: Subtle breathing glow (`box-shadow: 0 0 0 8px rgba(165, 180, 252, 0.22)`) that emerges after 5 seconds of learner inactivity to guide hesitant users gently without interrupting flow.
6. **Composite-Only Rule:** Animate exclusively `transform` and `opacity`. Never tween `width`, `height`, `top`, `left`, `margin`, or `padding`.
7. **Accessibility Override:** Strictly respect `prefers-reduced-motion: reduce`: disable scale compression, shakes, and pulses completely.

---

## 7. Acoustic Haptics Architecture (`acoustic-haptics.ts`)

Auditory feedback provides high-confidence tactile confirmation for mobile and desktop learners without requiring heavy MP3/WAV network downloads.

- **Zero-Byte Asset Synthesis:** Powered by native browser `AudioContext` procedural synthesis.
- **Auditory Profiles:**
  - **`tap()` (25ms):** Sine wave sweeping `420Hz` &rarr; `140Hz` with exponential decay. Sounds like a crisp wooden/glass tap.
  - **`flip()` (40ms):** Bandpass-filtered white noise burst (1200Hz, Q=2.5) with exponential decay. Mimics turning a real paper study card.
  - **`chime()` (350ms):** Dual-tone harmonious major-third chime (`E5` [659.25Hz] &rarr; `A5` [880Hz]). Celebrates mastery without sounding arcade-like.
  - **`nudge()` (160ms):** Soft downward triangle-wave muted pluck (`E4` [329.63Hz] &rarr; `D4` [293.66Hz]) with exponential gain drop (`0.07` &rarr; `0.001`). Gently informs the learner to reconsider an answer without shame.
- **Global Mute Persistence:** Respects user sound preference in settings and silences automatically when muted.

---

## 8. Cognitive Scaffolding, Emotional Safety & Universal Undo (`undo-manager.ts`)

Learning anxiety is neutralized by guaranteeing emotional safety and error forgiveness.

1. **Universal Undo Pill Toast (`.apple-toast-undo`):**
   - Fixed floating squircle pill anchored at `bottom: calc(var(--bottom-nav-height, 60px) + 24px); left: 50%; transform: translateX(-50%);`.
   - Displays confirmation message with a 4-second animated progress drain bar (`@keyframes apple-toast-drain`).
   - Triggered either by tapping the "Hoàn tác" button or pressing keyboard hotkey <kbd>Z</kbd> (or <kbd>Ctrl+Z</kbd> / <kbd>Cmd+Z</kbd>).
   - Intelligently suppressed when focus is inside an `<input>`, `<textarea>`, or `[contenteditable]` element so native text editing undo is preserved.
   - Automatically reverses SRS card rating, quiz submission, or state advance without data loss.
2. **Empathetic Bilingual Micro-Copy:**
   - Technical concepts are paired with friendly humanizing subtitles:
     - *"Spaced Repetition Engine"* &rarr; *"Hẹn gặp lại đúng lúc sắp quên"*
     - *"Myers Split-Diff Diagnostics"* &rarr; *"So sánh trực quan từng ký tự"*
     - *"4-Sentence Architectural Blueprint"* &rarr; *"Khung dựng đoạn văn chuẩn 7.0+"*
3. **Progressive Disclosure:**
   - Show the essential prompt and question first.
   - Defer complex clausal breakdowns, phonetic trees, and CEFR rubric notes behind clear expandable toggles.

---

## 9. Input Resiliency & Virtual Keyboard Normalisation

Learners using virtual keyboards (iOS Safari / Android Chrome) must never be penalized for platform autocorrect or viewport shifts.

1. **iOS Auto-Zoom Prevention:**
   - Any `input`, `textarea`, or `select` must set `font-size: max(16px, var(--font-body))` on touch viewports (≤768px). When input font is smaller than 16px, iOS Safari forces an unrequested zoom on field focus that destroys layout alignment.
2. **Defensive Input Sanitisation ([`exercise-engine.ts`](file:///e:/Eng/web/src/core/exercise-engine.ts)):**
   - Automatically normalize typographic quotes: `’` and `‘` map to `'`; `“` and `”` map to `"`.
   - Strip accidental trailing punctuation (`.`, `,`, `!`, `?`, `;`, `:`).
   - Collapse multiple consecutive whitespace characters to a single space.
   - Case-insensitive comparison ensuring answer correctness is judged on lexical knowledge, not punctuation quirks.

---

## 10. CSS Utility Classes & Declarations

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

/* Apple-Calm Squircle, Sensory & Motion Utilities */
.squircle-sm       { border-radius: var(--radius-squircle-sm, 10px); }
.squircle-md       { border-radius: var(--radius-squircle-md, 16px); }
.squircle-lg       { border-radius: var(--radius-squircle-lg, 24px); }
.apple-press       { transform: scale(0.975); transition: transform 120ms var(--spring-press); }
.apple-shake       { animation: apple-shake 340ms var(--spring-smooth) both; }
.apple-glass       { backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
.ambient-hint-pulse { animation: ambient-hint-pulse 2.4s ease-in-out infinite; }
.paragraph-dimmed  { opacity: 0.42; transition: opacity 220ms ease; }
.paragraph-focused { opacity: 1; transition: opacity 220ms ease; }
```

---

## 11. Prohibited Anti-Patterns & Enforced Solutions

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

## 12. Mobile Card-as-Button Grid & Hero Balancing Philosophy

> **Reference Exemplar & Case Study:** Constellation Skill Tree & Skill Deck Overhaul ([`Mobile/1.0.0/01-mobile-constellation-tree.png`](file:///e:/Eng/Mobile/1.0.0/01-mobile-constellation-tree.png)).

The evolution of the mobile Skill Grid from an over-engineered control dashboard into an Apple-Calm interactive surface revealed 5 fundamental design philosophies:

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

## 15. Git Provenance & Evolution History

The master rules above synthesize the following milestone commits from git history:

- **Commit `0ab6944` & Staged Working Tree:** Established Section 5 mobile vertical rhythm and text alignment rules, input auto-zoom fix (`max(16px, var(--font-body))`), defensive typo normalisation in `exercise-engine.ts`, mobile close button touch target unifications, and drills dossier container max-widths.
- **Commit `3140040`:** Fixed mobile bottom navigation anchoring, ensuring fixed dock clearance and viewports stay synchronized during route transitions.
- **Commit `d1e090c`:** Comprehensive headless mobile audit verifying all 47 phone screens across both C2 Singularity and Academic IELTS suites at Retina @2x.
- **Commit `907047c`:** Introduced Apple-Calm squircle tokens (`--radius-squircle-*`), native CSS spring physics, procedural acoustic haptics (`acoustic-haptics.ts`), and universal 4-second Undo pill toast (`undo-manager.ts`).
- **Commit `1ba2d74`:** Published design specification for Apple-Calm cognitive scaffolding and sensory comfort.
- **Commit `3b6ca21`:** Unified border radius and spacing tokens, established canonical reference exemplar (`Mobile/1.0.0/37-mobile-ielts-writing.png`), single source of truth in `variables.css` (`--pad-screen-left: 12px`, `--pad-screen-right: 12px`), and safe dock clearance (`--safe-bottom-dock: 84px`).
- **Commit `08e68fb`:** Audited IELTS parts, harmonized component headers and navigation breadcrumbs.
- **Commit `fc2424d`:** Enacted Initiative 36 mobile phone overhaul, touch ergonomics, and single `768px` responsive boundary.
- **Commit `acdce3c`:** Replaced harsh neon gold/orange glows with gentle periwinkle/cyan accent palette.

---

*Authored and Approved under Directive ENG-23 for English Singularity Core Architecture.*
