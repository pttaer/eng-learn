# Iron Man Interactive English Learning System (STARK HUD) — Implementation Plan

> **Audited & Approved by Mic (`michael-mum0t4d1`):** Incorporating 13 architectural, performance, and pedagogical audit recommendations (Virtual Scroll, Dual-Tier Motion Mode, 3-Pass Listening Protocol, SM-2 Engine, Lazy AudioContext).

**Goal:** Build a high-performance, ultra-interactive, Iron Man / JARVIS HUD-inspired web application for professional and efficient English mastery, featuring floaty 3D parallax, magnetic cursor tracking, holographic micro-interactions, while guaranteeing uncompromising visual cleanliness and deep pedagogical execution backed by the hive's English curriculum.

**Architecture:** A lightweight single-page application built with Vite and TypeScript with zero framework bloat. Features an aesthetic Stark Industries HUD design system with glassmorphic cards, dynamic 2D Canvas particle/reticle tracking, 3D CSS perspective gyro-tilt, Anime.js v4 for fluid spring physics, and Web Audio API for subtle sci-fi telemetry sounds. A lightweight `hashchange` router manages navigation across modules. Data is generated build-time via `parse-curriculum.cjs` from the hive's Markdown files (`collocations.md`, `reading.md`, `writing.md`, `listening.md`, `speaking.md`, `practice_drills.md`, `daily_practice_plan.md`, `resources_and_tools.md`).

**Tech Stack:** 
- Core: Vite + TypeScript + Vanilla DOM Architecture (Hash-based router)
- Animation & Physics: Anime.js v4 (Springs, Timelines, Staggering, ScrollObserver)
- Rendering: HTML5 Canvas (Holographic background grid, particle constellation, audio frequency visualizer)
- Styling: Custom CSS Design System with CSS variables and Glassmorphism (no heavy bloated frameworks)
- Audio: Native Web Audio API (Lazy-initialized procedural JARVIS interface sounds) + Web Speech API (Native pronunciation)
- State & Persistence: LocalStorage (settings, streaks, logs) & IndexedDB (SRS flashcard review history)

**Spec Reference:** [`docs/superpowers/specs/2026-09-29-monochrome-sea-urchin-english-web-design.md`](file:///E:/Eng/docs/superpowers/specs/2026-09-29-monochrome-sea-urchin-english-web-design.md) (Validated & committed design spec)  
**Mandatory Design Directive:** [`CLEAN_DESIGN_SYSTEM.md`](file:///E:/Eng/CLEAN_DESIGN_SYSTEM.md) (7-Pillar Clean Design Standard & 8-point agent checklist)

---

## Global Constraints & Guarantees

1. **Uncompromising Visual Cleanliness (The "Stark Aerospace" Standard):**
   - High text contrast ratio exceeding WCAG AAA (≥ 7:1) for all core reading and learning content.
   - **Dual-Tier Motion Architecture:**
     - **Standard Mode (Default for focused study):** Clean HUD framing, magnetic cursor reticle, and subtle 3D parallax card tilt. Zero floating dust or particle distraction.
     - **Immersive Mode (Opt-in via HUD toggle):** Full ambient floating particle constellation, holographic energy links, and expanded Stark aura.
   - **No Scanlines Over Text:** CRT scanline textures are strictly restricted to decorative corner brackets and frame borders; learning text areas remain 100% clean and razor-sharp.
2. **60 / 120 FPS Performance Contract:**
   - Only hardware-accelerated composite properties (`transform`, `opacity`) are animated.
   - Pointer events gated via `requestAnimationFrame` (no raw mousemove layout storms).
   - Lexicon Matrix features pagination (50 items/page) and virtualized DOM to prevent layout thrashing on 1,000 items.
3. **Full 4-Pillar Pedagogical Curriculum:**
   - **Reading & Lexicon:** 1,000 collocations partitioned across 4 domains with Vietnamese translations and native speech synthesis.
   - **Speaking:** Nation 4-3-2 fluency timer with live microphone visualizer.
   - **Listening:** 3-Pass Active Transcription Protocol and 5-Tier audio ladder (from `listening.md`).
   - **Writing:** MEAL/PEEL paragraph architecture and Benjamin Franklin copywork drills.
   - **Spaced Repetition & Habits:** SM-2 spaced repetition flashcard engine and 30-day daily habit mission log.
   - **Tools & Resources:** Dedicated telemetry drawer linking Praat, Audacity, LanguageTool, and reading ladders from `resources_and_tools.md`.
4. **Resilience & Accessibility:**
   - Full `prefers-reduced-motion` compliance (instantly collapses all motion into instant static states).
   - Defensive initialization: All `core/` modules (AudioContext, Canvas, Mic) are wrapped in try-catch error boundaries with graceful fallbacks.

---

## File Structure & Module Map

```
E:\Eng\web/
├── index.html                           # App shell with holographic HUD frame & canvas layers
├── package.json                         # Project manifest with prebuild parser hook
├── tsconfig.json                        # TypeScript configuration
├── vite.config.ts                       # Vite bundler configuration
├── src/
│   ├── main.ts                          # App bootstrap and lightweight hashchange router
│   ├── assets/
│   │   ├── styles/
│   │   │   ├── variables.css            # Stark HUD color tokens, glows, typography, spacing
│   │   │   ├── hud-base.css             # Holographic borders, brackets, glassmorphism (clean text)
│   │   │   └── animations.css           # Keyframes, hover transforms, reduced motion overrides
│   │   └── data/
│   │       ├── collocations.json        # 1,000 collocations with categories & natural VN translations
│   │       ├── drills.json              # 30 speaking prompts, 30 writing drills, and rubrics
│   │       ├── roadmap.json             # 4 pillars summary & 30-day practice tracker tasks
│   │       ├── listening.json           # 3-Pass transcription protocol & 5-tier audio difficulty ladder
│   │       ├── resources.json           # Curated tools & configuration guides
│   │       └── srs_cards.json           # 50 starter spaced-repetition flashcards
│   ├── core/
│   │   ├── router.ts                    # Zero-dependency hash-based view router
│   │   ├── audio-synthesizer.ts         # Lazy-initialized procedural Web Audio JARVIS sound generator
│   │   ├── cursor-tracker.ts            # RAF-gated magnetic reticle with target acquisition brackets
│   │   ├── floaty-particles.ts          # Canvas background particle field with ResizeObserver
│   │   └── parallax-controller.ts       # 3D gyro tilt for HUD glass cards via cursor coordinates
│   ├── modules/
│   │   ├── header-hud.ts                # Telemetry header, digital clock, sound & motion-tier toggles
│   │   ├── lexicon-matrix.ts            # 1,000 Collocations paginated explorer with instant search & TTS
│   │   ├── command-pillars.ts           # 4 Pillars interactive breakdown with radar skill visualizer
│   │   ├── sonic-drills.ts              # 4-3-2 Speaking timer + live mic visualizer + Listening 3-Pass protocol
│   │   ├── srs-deck.ts                  # SM-2 flashcard trainer with tactile 3D flip & 4 rating grades
│   │   ├── mission-log.ts               # 30-Day habit tracker with holographic progress checkmarks
│   │   └── resources-drawer.ts          # Slide-out telemetry drawer for tools and reference guides
│   └── utils/
│       ├── storage.ts                   # LocalStorage (settings/streaks) & IndexedDB (SRS history)
│       └── dom.ts                       # Type-safe DOM helper utilities
└── scripts/
    └── parse-curriculum.cjs             # Build script parsing E:\Eng Markdown files into structured JSON
```

---

## Detailed Task Breakdown

### Task 1: Scaffolding, Curriculum Parser & Design Tokens

**Files:**
- Create: `E:\Eng\web\package.json` (Includes `"prebuild": "node scripts/parse-curriculum.cjs"`)
- Create: `E:\Eng\web\tsconfig.json`
- Create: `E:\Eng\web\vite.config.ts`
- Create: `E:\Eng\web\scripts\parse-curriculum.cjs`
- Create: `E:\Eng\web\src\assets\styles\variables.css`
- Create: `E:\Eng\web\src\assets\styles\hud-base.css`
- Output Data: `collocations.json`, `drills.json`, `roadmap.json`, `listening.json`, `resources.json`, `srs_cards.json`

**Interfaces:**
- Produces: Normalized JSON curriculum datasets from all 8 hive English Markdown files.
- Produces: CSS design token variables (`--stark-cyan`, `--stark-amber`, `--stark-obsidian`, `--stark-glass`, etc.).

- [ ] **Step 1: Create package.json and project configuration**
  Initialize Vite project with TypeScript, Anime.js v4, and prebuild curriculum extraction hook.
- [ ] **Step 2: Build curriculum parsing script (`parse-curriculum.cjs`)**
  Parse `collocations.md` (exact 1,000 items with Vietnamese meanings), `reading.md`, `writing.md`, `listening.md`, `speaking.md`, `practice_drills.md`, `daily_practice_plan.md`, and `resources_and_tools.md`.
- [ ] **Step 3: Run the parser and verify JSON output integrity**
  Verify all 1,000 collocations, 60 drills, 4 pillars, and tools index parsed cleanly into JSON.
- [ ] **Step 4: Define Iron Man HUD Design Tokens in CSS**
  Set up Obsidian background (`#040711`), Arc Cyan (`#00f0ff`), Energy Amber (`#ffaa00`), High-Contrast Chalk (`#e8f4f8`), subtle telemetry borders (`rgba(0, 240, 255, 0.2)`), and glassmorphic blur with scanlines isolated strictly to decorative frame borders.

---

### Task 2: Iron Man Interactive HUD Engine (Cursor, Particles, 3D Parallax & Audio)

**Files:**
- Create: `E:\Eng\web\src\core\cursor-tracker.ts`
- Create: `E:\Eng\web\src\core\floaty-particles.ts`
- Create: `E:\Eng\web\src\core\parallax-controller.ts`
- Create: `E:\Eng\web\src\core\audio-synthesizer.ts`
- Create: `E:\Eng\web\src\assets\styles\animations.css`

**Interfaces:**
- Produces: `CursorTracker.init()` — RAF-gated mouse tracking with magnetic reticle lock.
- Produces: `FloatyParticles.init(canvasId)` — Canvas particle field with ResizeObserver and proximity links.
- Produces: `ParallaxController.attach(elements)` — 3D gyro tilt for HUD glass cards (`±8°` max).
- Produces: `SoundFX.play(type)` — Procedural Web Audio sounds with lazy initialization on first user interaction.

- [ ] **Step 1: Implement Procedural Web Audio Sound Generator**
  Generate subtle sci-fi telemetry sounds (800Hz–2400Hz, <80ms decay) with lazy `AudioContext` resume on first user click/hover, plus master mute state.
- [ ] **Step 2: Implement RAF-Gated Magnetic Reticle Cursor Tracker**
  Dual-ring cursor with center laser dot + lag-smoothed outer reticle. Gated by `requestAnimationFrame` to prevent event storms on high-polling mice/trackpads.
- [ ] **Step 3: Implement Ambient Floaty Particle Constellation with ResizeObserver**
  Lightweight 2D canvas simulation with 60 particles drifting on sine waves. Includes `ResizeObserver` on the canvas container to adapt dynamically to window resizes.
- [ ] **Step 4: Implement 3D Card Parallax Gyro Controller**
  Calculate mouse offset from card centers, applying subtle hardware-accelerated `perspective(1000px) rotateX(...) rotateY(...) translateZ(15px)` transformations.

---

### Task 3: Arc Reactor Lexicon (1,000 Collocations Paginated Explorer + TTS)

**Files:**
- Create: `E:\Eng\web\src\modules\lexicon-matrix.ts`
- Create: `E:\Eng\web\src\utils\dom.ts`

**Interfaces:**
- Consumes: `collocations.json`, `SoundFX`, `ParallaxController`
- Produces: Paginated (50 items/page), instantly searchable 1,000-collocation matrix with real-time text-to-speech audio pronunciation.

- [ ] **Step 1: Build the Lexicon UI Grid and Filter Bar**
  Tabs for 4 domains (Everyday, Business/Law, Academic/Tech, Emotions/Idiomatic), instant search input with debounced filtering, and 50-item pagination controls.
- [ ] **Step 2: Implement Floaty Holographic Detail Inspection Card with Speech Synthesis**
  Hovering over any collocation row highlights it with a cyan laser beam indicator, floats an adjacent telemetry card with Vietnamese translation and usage notes, and provides an audio button using browser `speechSynthesis` for natural British/American pronunciation.
- [ ] **Step 3: Implement Quick-Drill Flashcard Mode**
  Toggle to convert the list into a tactile 3D flipping card stack for rapid collocation memorization.

---

### Task 4: Stark Command Pillars HUD & Radar Skill Visualizer

**Files:**
- Create: `E:\Eng\web\src\modules\command-pillars.ts`
- Create: `E:\Eng\web\src\modules\resources-drawer.ts`

**Interfaces:**
- Consumes: `roadmap.json`, `resources.json`, `SoundFX`
- Produces: 4-Pillar command switchboard with circular radar telemetry chart and slide-out Resources & Tools drawer.

- [ ] **Step 1: Build the Holographic Arc Reactor Radar Chart**
  Render an interactive Canvas radar gauge tracking user mastery across Reading, Writing, Listening, and Speaking (A1 to C2 progression).
- [ ] **Step 2: Implement Pillar Deep-Dive Modules**
  Tabbed views for each pillar detailing the Nation 4-3-2 technique, Arguelles Shadowing, Franklin Copywork, and Connected Speech phonetic rules in crisp, scannable HUD cards with collapsible telemetry panels.
- [ ] **Step 3: Implement Resources & Tools Telemetry Drawer**
  Slide-out drawer containing curated software setups (Praat, Audacity, LanguageTool, Obsidian) and difficulty ladders from `resources_and_tools.md`.

---

### Task 5: Sonic Fluency & Drills Deck (4-3-2 Speaking + 3-Pass Listening Protocol)

**Files:**
- Create: `E:\Eng\web\src\modules\sonic-drills.ts`

**Interfaces:**
- Consumes: `drills.json`, `listening.json`, `SoundFX`
- Produces: 4-3-2 Fluency countdown timer with live microphone visualizer, 3-Pass active listening transcription module, and 30 writing prompt tracker.

- [ ] **Step 1: Implement 4-3-2 Countdown Engine with Arc Gauge**
  Circular SVG countdown timer (Round 1: 4 min, Round 2: 3 min, Round 3: 2 min) with alert chimes, round indicators, and speech prompt selector.
- [ ] **Step 2: Implement Live Microphone Canvas Visualizer**
  Optional browser microphone access to render a real-time Iron Man circular voice wave / frequency bar HUD while user speaks.
- [ ] **Step 3: Implement 3-Pass Active Listening Transcription Mode**
  Interactive 3-pass workflow (Pass 1: Gist Comprehension, Pass 2: Word-for-Word Transcription with input box, Pass 3: Connected Speech analysis) implementing `listening.md`.
- [ ] **Step 4: Implement Writing Drill & Rubric Evaluator**
  Interactive prompt browser with integrated MEAL/PEEL paragraph structure guide and 20-point self-evaluation rubric.

---

### Task 6: Spaced Repetition SRS & Mission Log Habit Tracker

**Files:**
- Create: `E:\Eng\web\src\modules\srs-deck.ts`
- Create: `E:\Eng\web\src\modules\mission-log.ts`
- Create: `E:\Eng\web\src\utils\storage.ts`

**Interfaces:**
- Consumes: `srs_cards.json`, `roadmap.json`
- Produces: Daily Anki-style review deck with SM-2 interval algorithm (`Again`, `Hard`, `Good`, `Easy`) and 30-Day Habit Tracker with local streak persistence.

- [ ] **Step 1: Build Storage Engine (LocalStorage + IndexedDB)**
  LocalStorage for user preferences, streak counts, and daily tasks; IndexedDB for scalable card review interval logs.
- [ ] **Step 2: Build Holographic SRS Flashcard Interface with SM-2 Algorithm**
  3D card flip animation with Anime.js spring physics, keyboard shortcuts (`Space` to flip, `1-4` to rate), and SM-2 interval calculator.
- [ ] **Step 3: Build 30-Day Mission Log Matrix**
  Interactive 30-day checklist organized into 4 training phases with holographic status locks and completion badges.

---

### Task 7: Shell Assembly, Routing, Motion Tiers & Build Verification

**Files:**
- Create: `E:\Eng\web\index.html`
- Create: `E:\Eng\web\src\core\router.ts`
- Create: `E:\Eng\web\src\main.ts`
- Create: `E:\Eng\web\src\modules\header-hud.ts`

**Interfaces:**
- Produces: Complete, unified, production-ready web application.

- [ ] **Step 1: Build Lightweight Hash-Based Router (`router.ts`)**
  Zero-dependency router listening to `hashchange` to swap active view sections (`#lexicon`, `#pillars`, `#drills`, `#srs`, `#mission`) with fluid transitions.
- [ ] **Step 2: Assemble Header HUD with Motion-Tier & Sound Toggles**
  Integrate top HUD header with real-time digital clock, telemetry stats, sound mute toggle, and **Standard vs Immersive motion tier switch**.
- [ ] **Step 3: Performance Profiling & Reduced Motion Verification**
  Verify composite-only animation execution, test at 60 FPS, and verify that enabling `prefers-reduced-motion` cleanly disables particle loops and 3D tilts while preserving complete learning functionality.
- [ ] **Step 4: Build & Bundle Validation**
  Execute `npm run build` with Vite, ensuring clean production output in `dist/` with zero TypeScript errors.
