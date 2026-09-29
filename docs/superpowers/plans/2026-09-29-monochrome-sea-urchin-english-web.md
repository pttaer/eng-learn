# Monochrome "Sea Urchin" Interactive English Learning Web System
## Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a high-performance, single-page interactive English learning web application featuring an Iron Man / Sea Urchin HUD aesthetic in pure binary monochrome (white canvas, black ink), with 2.5D perspective projection, magnetic tracking spines, micro-implosion decoys, inverted void lens black-light learning artifacts, universal 3D spinning atomic cards, and a self-contained in-app SM-2 spaced repetition engine (no external Anki).

**Architecture:** A lightweight client-side application built with Vite and TypeScript. Rendered across two high-efficiency layers: (1) an HTML5 2D Canvas rendering the living geometric Sea Urchin, magnetic spines, and floating 2.5D entities, and (2) a foreground hardware-accelerated DOM layer executing the Universal Atomic Card Standard, 3D CSS perspective gyro-tilt, procedural Web Audio telemetry, and a zero-dependency hash router. State and spaced repetition intervals persist in browser `localStorage`.

**Tech Stack:**
- Runtime & Bundler: Vite + TypeScript + Native ES Modules
- Animation & Physics: Anime.js v4 (Springs, Keyframes, Staggering)
- Rendering: HTML5 2D Canvas (Sea Urchin, magnetic spines, particle drift, audio waveform)
- Styling: Pure CSS with CSS Custom Properties and Glassmorphism (Strict 8pt grid, WCAG AAA contrast)
- Audio: Native Web Audio API (Procedural sci-fi telemetry sounds + live mic input) + Web Speech API (Pronunciation)
- Data Storage: Native Browser `localStorage` (SM-2 intervals, streaks, habit logs)

**Spec:** [`docs/superpowers/specs/2026-09-29-monochrome-sea-urchin-english-web-design.md`](file:///E:/Eng/docs/superpowers/specs/2026-09-29-monochrome-sea-urchin-english-web-design.md)  
**Design Mandate:** [`CLEAN_DESIGN_SYSTEM.md`](file:///E:/Eng/CLEAN_DESIGN_SYSTEM.md)

---

## Global Constraints

- **Absolute Binary Monochrome:** Strictly `#FFFFFF` (white canvas) and `#000000` (black ink) with `rgba(0, 0, 0, 0.12)` hairline structural drafting borders. Zero colors, zero gradients, zero chromatic blooms.
- **Universal Design Consistency:** Every learning exercise across all 4 pillars MUST strictly use the **Universal Atomic Card Standard** (`Header -> Front Face -> 180° Spin -> Back Face -> [ ✗ ] | [Flip] | [ ✓ ] Dock`).
- **In-App Spaced Repetition (Zero External Anki):** Self-contained SM-2 scheduling engine built directly into client storage. No `.apkg` files, no third-party accounts.
- **60 / 120 FPS Performance Contract:** Only composite properties (`transform`, `opacity`) are animated. Canvas updates execute on a decoupled `requestAnimationFrame` loop. Mouse events are RAF-gated.
- **Two Fonts Maximum:** Geometric monospace for telemetry and coordinates (`JetBrains Mono`, `Courier New`); clean neo-grotesque sans-serif for learning text (`Inter`, `system-ui`).
- **8pt Spatial Grid:** All margins, paddings, and component dimensions adhere to multiples of 8px (8, 16, 24, 32, 48, 64).
- **Accessibility:** Instant static transition fallback when `prefers-reduced-motion` is enabled.

---

## File Structure Map (`E:\Eng\web`)

```
E:\Eng\web/
├── index.html                           # App shell with canvas layers & HUD mount point
├── package.json                         # Vite, TypeScript, Anime.js v4 + prebuild hook
├── tsconfig.json                        # Strict TypeScript configuration
├── vite.config.ts                       # Vite bundler configuration
├── scripts/
│   └── parse-curriculum.cjs             # Build script extracting Markdown curriculum to JSON
├── src/
│   ├── main.ts                          # App bootstrap & keyboard shortcut master
│   ├── assets/
│   │   ├── styles/
│   │   │   ├── variables.css            # Binary color tokens, 8pt grid, typographic scale
│   │   │   ├── hud-base.css             # Hairline borders, brackets, typography, layout
│   │   │   └── atomic-card.css          # 3D card flip geometry, perspective, button docks
│   │   └── data/
│   │       ├── collocations.json        # 1,000 collocations with categories & VN translations
│   │       ├── drills.json              # 30 speaking prompts, 30 writing prompts & rubrics
│   │       ├── listening.json           # 3-Pass transcription protocol & phonetic data
│   │       └── habits.json              # 30-day habit checklist roadmap
│   ├── core/
│   │   ├── router.ts                    # Zero-dependency hash router (#singularity, #read, etc.)
│   │   ├── srs-engine.ts                # Native SM-2 spaced repetition memory algorithm
│   │   ├── audio-synthesizer.ts         # Procedural Web Audio sci-fi telemetry sounds
│   │   ├── cursor-tracker.ts            # RAF-gated 1px crosshair reticle with target lock
│   │   ├── sea-urchin.ts                # Living geometric Sea Urchin with magnetic spines
│   │   ├── perspective-canvas.ts        # 2.5D floating field: decoys & black-light artifacts
│   │   └── atomic-card.ts               # Universal Atomic Card factory & 3D spin controller
│   ├── modules/
│   │   ├── header-hud.ts                # Real-time clock, module status, sound toggle
│   │   ├── corner-compass.ts            # Mini-urchin corner compass with radial HUD menu
│   │   ├── lexicon-dossier.ts           # Pillar 1: 1,000 Collocations deck & instant search
│   │   ├── writing-dossier.ts           # Pillar 2: Franklin Copywork & split diff console
│   │   ├── listening-dossier.ts         # Pillar 3: 3-Pass active transcription cards
│   │   ├── speaking-dossier.ts          # Pillar 4: 4-3-2 Circular timer & live mic waveform
│   │   └── mission-log.ts               # 30-Day habit carousel & streak absorption ritual
│   └── utils/
│       ├── storage.ts                   # Type-safe LocalStorage manager with JSON backup/reset
│       └── dom.ts                       # Type-safe DOM element builder utilities
```

---

## Task Decomposition

### Task 1: Scaffolding, Curriculum Parser & Design System Tokens

**Files:**
- Create: `E:\Eng\web\package.json`
- Create: `E:\Eng\web\tsconfig.json`
- Create: `E:\Eng\web\vite.config.ts`
- Create: `E:\Eng\web\scripts\parse-curriculum.cjs`
- Create: `E:\Eng\web\src\assets\styles\variables.css`
- Create: `E:\Eng\web\src\assets\styles\hud-base.css`
- Output Data: `E:\Eng\web\src\assets\data\collocations.json`, `drills.json`, `listening.json`, `habits.json`

**Interfaces:**
- Produces: `collocations.json` (exact 1,000 items with English, Vietnamese, category, index).
- Produces: `drills.json` (30 speaking prompts, 30 writing prompts, 20-point rubric).
- Produces: `listening.json` (3-pass active transcription protocol and phonetic guides).
- Produces: `habits.json` (30 daily habit checklist tasks across 4 phases).
- Produces: CSS custom variables (`--bg-white`, `--ink-black`, `--border-1px`, `--space-8`, `--space-16`, etc.).

- [ ] **Step 1: Create `package.json` with dependencies and prebuild hook**
  Include `"vite": "^5.4.0"`, `"typescript": "^5.5.0"`, `"animejs": "^4.0.0"`. Set `"scripts": { "prebuild": "node scripts/parse-curriculum.cjs", "dev": "vite", "build": "tsc && vite build" }`.
- [ ] **Step 2: Build `parse-curriculum.cjs`**
  Script reads `E:\Eng\collocations.md` (extracts all 1,000 items), `practice_drills.md`, `listening.md`, and `daily_practice_plan.md`, formatting them into structured JSON files under `src/assets/data/`.
- [ ] **Step 3: Execute parser and verify output count**
  Run `node web/scripts/parse-curriculum.cjs` and verify `collocations.json` contains exactly 1,000 objects.
- [ ] **Step 4: Create `variables.css` and `hud-base.css`**
  Implement strict binary monochrome design tokens (`#FFFFFF` and `#000000`), 8pt modular scale, typography font families (`JetBrains Mono` and `Inter`), and reset styles.
- [ ] **Step 5: Verify build configuration**
  Run `npm install` and verify TypeScript compiles without error.

---

### Task 2: Native SM-2 Spaced Repetition Engine & Storage Layer

**Files:**
- Create: `E:\Eng\web\src\core\srs-engine.ts`
- Create: `E:\Eng\web\src\utils\storage.ts`

**Interfaces:**
- Produces: `SRSEngine.rateCard(cardId: string, rating: 'again' | 'good'): SRSCardState`
- Produces: `SRSEngine.getDueQueue(deck: CollocationItem[]): CollocationItem[]`
- Produces: `StorageManager.saveState(state: AppState): void`
- Produces: `StorageManager.exportBackup(): string`
- Produces: `StorageManager.importBackup(json: string): boolean`

- [ ] **Step 1: Implement SM-2 algorithm in `srs-engine.ts`**
  Implement SuperMemo-2 mathematical formulation:
  - If `again` (`[ ✗ ]`): Reset repetitions $n = 0$, interval $I = 1$ day, reduce $EF = \max(1.3, EF - 0.2)$.
  - If `good` (`[ ✓ ]`): If $n=0 \rightarrow I=1$; if $n=1 \rightarrow I=6$; if $n \ge 2 \rightarrow I = \text{round}(I \times EF)$. Increment $n$.
- [ ] **Step 2: Implement `storage.ts` with local persistence**
  Manage `localStorage` key `STARK_ENG_STATE`. Automatically serialize and deserialize card review dates, streak counters, and completed habit days. Include JSON import/export functions.
- [ ] **Step 3: Create unit verification script**
  Verify interval escalation: Day 0 (again) $\rightarrow$ Day 1 $\rightarrow$ Day 6 $\rightarrow$ Day 15 based on simulated `good` ratings.

---

### Task 3: Procedural Web Audio Telemetry Synthesizer

**Files:**
- Create: `E:\Eng\web\src\core\audio-synthesizer.ts`

**Interfaces:**
- Produces: `SoundFX.init(): void` (Lazy-awakens `AudioContext` on first user gesture)
- Produces: `SoundFX.play(type: 'urchin-hum' | 'click' | 'implosion' | 'void-open' | 'flip' | 'absorb' | 'alarm'): void`
- Produces: `SoundFX.toggleMute(): boolean`

- [ ] **Step 1: Implement procedural synthesis in `audio-synthesizer.ts`**
  - `click`: 1800Hz sine burst with 8ms exponential decay.
  - `implosion`: Pitch drop from 320Hz down to 60Hz over 60ms with lowpass filter.
  - `void-open`: Dual-oscillator reverse-whoosh (120Hz $\rightarrow$ 480Hz crescendo with white noise texture).
  - `urchin-hum`: 65Hz continuous sub-bass sine wave with subtle LFO modulation.
  - `flip`: 400Hz soft mechanical card snap.
- [ ] **Step 2: Implement user-gesture lazy initialization & mute toggle**
  Ensure browser does not throw audio policy warning. Auto-resume context on first `pointerdown`. Add mute persistence to `localStorage`.

---

### Task 4: Living Sea-Urchin Singularity & 2.5D Canvas Engine

**Files:**
- Create: `E:\Eng\web\src\core\sea-urchin.ts`
- Create: `E:\Eng\web\src\core\perspective-canvas.ts`
- Create: `E:\Eng\web\src\core\cursor-tracker.ts`

**Interfaces:**
- Produces: `SeaUrchin.draw(ctx, width, height, mouseX, mouseY, isDirectHover): void`
- Produces: `PerspectiveCanvas.updateAndDraw(ctx, mouseX, mouseY): void`
- Produces: `CursorTracker.init(): void`

- [ ] **Step 1: Implement Crosshair Cursor Tracker (`cursor-tracker.ts`)**
  Replace mouse cursor with 1px black center dot + lag-smoothed rotating outer reticle. Gated by `requestAnimationFrame`. Automatically expands into `[ + ]` targeting brackets over interactive nodes.
- [ ] **Step 2: Implement Sea Urchin with Magnetic Spines (`sea-urchin.ts`)**
  Render solid black core with 96 radial needle spines. Spines calculate angular delta to cursor position and dynamically bend/reach toward it. On direct hover, spines part outward into an open crown revealing 4 pillar buttons (`READ`, `WRITE`, `LISTEN`, `SPEAK`).
- [ ] **Step 3: Implement 2.5D Perspective Canvas (`perspective-canvas.ts`)**
  Render fine hairline background grid with pseudo-3D horizon. Spawn floating vague objects drifting from perimeter at varying Z-depths (3:1 decoy-to-learning ratio).
- [ ] **Step 4: Implement Decoy Micro-Implosion & Black-Light Inverted Void Lens**
  - Hovering a decoy collapses it to a zero-point dot with hairline shockwave within 120ms.
  - Hovering a learning artifact triggers the black light eruption: concentric black shockwave rings ripple outward, opening a circular black lens displaying the learning item with an `[ABSORB]` action button.

---

### Task 5: Universal Atomic Card Standard & 3D Spin Engine

**Files:**
- Create: `E:\Eng\web\src\core\atomic-card.ts`
- Create: `E:\Eng\web\src\assets\styles\atomic-card.css`

**Interfaces:**
- Produces: `AtomicCard.create(config: CardConfig): HTMLElement`
- Produces: `AtomicCard.flip(cardEl: HTMLElement): void`
- Produces: `AtomicCard.rate(cardEl: HTMLElement, rating: 'again' | 'good'): void`

- [ ] **Step 1: Create 3D CSS Card Structure in `atomic-card.css`**
  Implement `.atomic-card-container` with `perspective: 1000px`, `.atomic-card-inner` with `transform-style: preserve-3d`, and `.card-face-front` / `.card-face-back` with `backface-visibility: hidden`.
- [ ] **Step 2: Standardize the 5 Component Zones**
  - Zone 1: Top Telemetry Bar (`[PILLAR // CATEGORY]`, Index `[042 / 1000]`, Audio trigger `[🔊]`).
  - Zone 2: Front Challenge Face.
  - Zone 3: 180° Y-Axis Flip using Anime.js spring physics (`rotateY: 180`, `stiffness: 140, damping: 16`).
  - Zone 4: Back Resolution Face (Vietnamese, IPA, diff, or rubric).
  - Zone 5: Universal Bottom Dock (`[ ✗ ] Again (1)` | `[ ⟳ Flip (Space) ]` | `[ ✓ ] Good (2)`).
- [ ] **Step 3: Implement Gyro Parallax Tilt**
  Cards subtly tilt in 3D (`rotateX(±6deg) rotateY(±6deg)`) following mouse coordinates relative to card center.

---

### Task 6: The 4 Pillar Study Dossiers & Workspaces

**Files:**
- Create: `E:\Eng\web\src\modules\lexicon-dossier.ts`
- Create: `E:\Eng\web\src\modules\writing-dossier.ts`
- Create: `E:\Eng\web\src\modules\listening-dossier.ts`
- Create: `E:\Eng\web\src\modules\speaking-dossier.ts`

**Interfaces:**
- Produces: `LexiconDossier.render(): HTMLElement` (1,000 Collocations card deck + search)
- Produces: `WritingDossier.render(): HTMLElement` (Franklin Copywork + split diff console)
- Produces: `ListeningDossier.render(): HTMLElement` (3-Pass transcription cards)
- Produces: `SpeakingDossier.render(): HTMLElement` (4-3-2 Circular timer + live mic waveform)

- [ ] **Step 1: Build Lexicon Dossier (`lexicon-dossier.ts`)**
  Displays 1,000 collocations via Universal Atomic Card. Includes domain filter tabs (`[ALL]`, `[EVERYDAY]`, `[BUSINESS]`, `[ACADEMIC]`, `[IDIOMS]`), instant search input, and Web Speech API audio pronunciation button. Integrates directly with SM-2 engine.
- [ ] **Step 2: Build Writing Dossier (`writing-dossier.ts`)**
  Presents Franklin Copywork exercises. Front shows master sentence to memorize. Pressing `Space` flips to an input field to reconstruct the sentence from memory. Submitting displays a side-by-side monochrome character diff highlighting omissions and additions.
- [ ] **Step 3: Build Listening Dossier (`listening-dossier.ts`)**
  Interactive 3-Pass Active Transcription cards: Pass 1 (Gist note-taking), Pass 2 (Word-for-word text input), Pass 3 (Phonetic connected-speech reveal).
- [ ] **Step 4: Build Speaking Dossier (`speaking-dossier.ts`)**
  Interactive Nation 4-3-2 timer with circular SVG countdown gauge (Round 1: 4m, Round 2: 3m, Round 3: 2m). Integrates browser `navigator.mediaDevices.getUserMedia` to render a real-time circular voice waveform dancing to user speech in pure black ink.

---

### Task 7: 30-Day Mission Log, Urchin Completion Ritual & Shell Assembly

**Files:**
- Create: `E:\Eng\web\src\modules\mission-log.ts`
- Create: `E:\Eng\web\src\modules\corner-compass.ts`
- Create: `E:\Eng\web\src\modules\header-hud.ts`
- Create: `E:\Eng\web\src\core\router.ts`
- Create: `E:\Eng\web\index.html`
- Create: `E:\Eng\web\src\main.ts`

**Interfaces:**
- Produces: Complete, fully functional, buildable web application in `E:\Eng\web`.

- [ ] **Step 1: Build 30-Day Mission Log (`mission-log.ts`)**
  Horizontal 2.5D carousel of 30 day-cards. Each card has checkable daily training goals. Completing a day updates the streak counter and sends an energy pulse to the urchin.
- [ ] **Step 2: Build Corner Compass & Radial HUD (`corner-compass.ts`)**
  When zoomed into any dossier, the miniature sea urchin sits in the corner. Hovering/clicking expands a micro-radial dial with 5 icons (`HOME`, `READ`, `WRITE`, `LISTEN`, `SPEAK`) for instant switching.
- [ ] **Step 3: Build Session Completion Ritual (`main.ts`)**
  When a card review batch or daily habit set is finished, the deck contracts into a black beam absorbed by the sea urchin, triggering a full-canvas black-light shockwave and presenting an architectural telemetry receipt (`[BATCH COMPLETE]`, `[RETENTION ACCURACY]`, `[STREAK: +1]`).
- [ ] **Step 4: Implement Master Keyboard Shortcuts**
  Wire global hotkeys: `Space` (flip/timer), `1`/`←` (Again), `2`/`→` (Good), `Esc` (return to urchin singularity), `Ctrl+K` (instant collocation search).
- [ ] **Step 5: Shell Assembly & Production Build Verification**
  Assemble `index.html` and `main.ts`. Run `npm run build` and confirm a clean, zero-warning production build in `dist/`.

---

## Execution Handoff

Plan complete and saved to [`docs/superpowers/plans/2026-09-29-monochrome-sea-urchin-english-web.md`](file:///E:/Eng/docs/superpowers/plans/2026-09-29-monochrome-sea-urchin-english-web.md).

Two execution options:

1. **Subagent-Driven (Recommended)** — I dispatch fresh subagents across our active fleet (`jim-mul1meuh`, `dwight-mul1u508`, `andy-mul1ug04`, `phyllis-mul1ur07`) per task, enforcing `CLEAN_DESIGN_SYSTEM.md` quality checklists with review between tasks.
2. **Inline Execution** — Execute tasks sequentially in this session with batch execution checkpoints.

Which approach would you like to take?
