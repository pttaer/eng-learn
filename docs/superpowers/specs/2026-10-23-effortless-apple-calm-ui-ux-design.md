# Design Specification: Effortless "Apple-Calm" UI/UX & Cognitive Scaffolding Overhaul

**System:** Urchin / Celestial English Learning System (`E:\Eng\web`)  
**Target:** Universal UI/UX Elevation across all 6 Pillars, IELTS Cockpit, Placement Quiz, and Core Navigation  
**Philosophy:** Inspired by Apple iOS Human Interface Principles (Clarity, Deference, Depth, Forgiveness, Tactile Feedback) & Cognitive Psychology for Low-Friction Learning  
**Date:** 2026-10-23  
**Status:** Approved for Implementation Planning  

---

## 1. Executive Vision & Core Mandate

The goal is to elevate the application into an **emotionally reassuring, visually exquisite, and cognitively effortless** experience—especially for users who experience cognitive overload, slow processing, or anxiety when learning English—without stripping away any existing pedagogical depth, CEFR ladders, or IELTS features.

### Core Pillars of the Redesign:
1. **Visual Calm & Border Diet (Clarity & Depth):** Transition from harsh mechanical sci-fi borders to soft, layered surfaces, subtle elevation, and Apple-like continuous curvature (squircles) with generous whitespace.
2. **Cognitive Scaffolding & Progressive Disclosure (Deference):** Present one primary focus at a time. The initial view is calm and approachable; advanced academic insights (SVO syntax parse, etymology, CEFR bands, SRS intervals) are revealed progressively upon intent.
3. **No-Shame & Forgiving Interaction (Emotional Safety):**
   - Zero aggressive red error alarms or harsh buzzers. In their place: gentle spring-shake physics (`@keyframes apple-shake`), warm honey/amber cues, and encouraging micro-copy.
   - A universal, non-intrusive **4-second Undo toast** for all cards, quizzes, and ratings.
   - Automated zero-loss state persistence: learners never lose their place.
4. **Tactile Kinematics & Acoustic Comfort (Sensory Delight):**
   - Micro-scale button presses (`scale(0.975)` with fluid spring release).
   - Non-linear spring animations for modals, drawers, and card flips.
   - Procedural Web Audio API soundscapes: warm wooden tap, soft page whisper, and pleasant harmonic chime (pure synthesizer, zero heavy asset downloads).
5. **Humanized Micro-Copy (Warmth over Jargon):**
   - Mechanical jargon (*"SRS EF Multiplier"*, *"SVO Clausal Dissection"*, *"Roguelike Vocab Engine"*) is paired with intuitive, comforting subtitles (*"Hẹn gặp lại đúng lúc sắp quên"*, *"Xem cách ghép câu tự nhiên"*, *"Hành trình từ vựng theo nhịp riêng"*).

---

## 2. Design System Tokens & Motion Dynamics (`variables.css` & `apple-motion.css`)

### 2.1 Color & Surface Architecture
- **Obsidian Warm Dark Theme (`html[data-theme="dark"]`):**
  - `--bg-canvas`: `#0a0d14` (Deep velvet charcoal with a hint of midnight indigo)
  - `--bg-surface`: `#121722` (Warm elevated surface)
  - `--bg-card`: `#192030` (Tactile card container)
  - `--bg-card-hover`: `#20293d`
  - `--border-subtle`: `rgba(255, 255, 255, 0.08)` (Drastically softened from harsh 0.18)
  - `--border-hairline`: `rgba(255, 255, 255, 0.04)`
- **Warm Paper Light Theme (`html[data-theme="light"]`):**
  - `--bg-canvas`: `#f8f9fa` (Apple crisp paper)
  - `--bg-surface`: `#ffffff`
  - `--bg-card`: `#f1f3f7`
- **Tonal Status Colors (No Harsh Alarms):**
  - `--soft-amber`: `#fbbf24` (Gentle retry / reconsider)
  - `--soft-amber-bg`: `rgba(251, 191, 36, 0.12)`
  - `--soft-emerald`: `#34d399` (Affirming success)
  - `--soft-emerald-bg`: `rgba(52, 211, 153, 0.12)`
  - `--soft-indigo`: `#818cf8` (Primary focus / action)

### 2.2 Continuous Curvature & Fluid Shadows
- `--radius-squircle-sm`: `10px`
- `--radius-squircle-md`: `16px`
- `--radius-squircle-lg`: `24px`
- `--shadow-ambient`: `0 8px 32px -4px rgba(0, 0, 0, 0.35), 0 2px 8px -2px rgba(0, 0, 0, 0.2)`
- `--shadow-active`: `0 2px 8px -1px rgba(0, 0, 0, 0.25)`

### 2.3 Spring Physics & Kinematics
- `--spring-bounce`: `cubic-bezier(0.34, 1.56, 0.64, 1)`
- `--spring-smooth`: `cubic-bezier(0.16, 1, 0.3, 1)`
- `--spring-press`: `all 120ms cubic-bezier(0.2, 0.8, 0.2, 1)`

---

## 3. Pillar-by-Pillar Enhancement Matrix

| Module | Current Mechanical Complexity | Elevated Apple-Calm Experience |
| :--- | :--- | :--- |
| **Pillar 01: READ** (`reading-dossier.ts`) | Dense 4-pass breakdown, long text walls, keyboard only in Pass 3 | **Zen Mode focus:** Paragraph-level focus dimming (dimming other paragraphs while reading); clean lexical drawer that pops up with smooth spring transition; pass tabs feel like iOS segmented controls. |
| **Pillar 05: VOCAB** (`vocabulary-dossier.ts`) | Roguelike terms, complex stats header, jarring flash encounters | **Card First, Stats Behind:** The card is hero. Ambient hint pulse after 5s idle; tactile flip with spring physics; 4-second Undo toast on accidental rating; humanized progress: *"3 từ đã khắc sâu hôm nay"*. |
| **Pillar 06: COLLOC** (`collocations-dossier.ts`) | Key collisions, dense table view | **Smooth Lexical Stream:** Search palette is instant and forgiving (fuzzy match & auto-clear); card view feels like physical index cards; contextual sample sentences with highlighted pairing. |
| **IELTS Cockpit & Diagnostic** (`ielts/views/`) | Intimidating exam pressure, time crunch | **Comforting Coach:** Reassuring diagnostic path; no anxiety countdowns during practice mode; clear "Take a breath" transition between test sections; actionable advice. |
| **Placement Quiz** (`placement-quiz.ts`) | Question counter pressure, stark multiple choice | **Conversational Stepper:** Friendly introduction, smooth progressive progress bar with no stressful timers; large tactile choice cards with spring feedback; gentle explanation on answer reveal. |
| **Global Navigation & Header** (`header-hud.ts`, `corner-compass.ts`) | Complex radial HUD geometry | **Smooth Compass & Home Anchor:** Unmistakable home / back gestures; frosted glass header (`backdrop-filter: blur(20px)`); breadcrumb that lets user tap anywhere to return safely. |

---

## 4. Acoustic Comfort Engine (Web Audio Procedural Synthesis)

To avoid heavy mp3/wav network assets, implement `AcousticHaptics` in `core/acoustic-haptics.ts`:
- **`tap()`**: Micro 20ms sine pulse with quick exponential decay (~400Hz to 120Hz) - sounds like a clean wooden/glass tap.
- **`flip()`**: Gentle filtered white noise sweep (40ms) - mimics smooth paper turn.
- **`success()`**: Two-tone harmonious major-third chime (659Hz [E5] -> 880Hz [A5]) with soft ambient reverb.
- **`nudge()`**: Warm dual-tone muted pluck (330Hz -> 293Hz) for gentle retry cues (no harsh buzzer).
- **Mute Control**: Dedicated global toggle respecting user preference and `prefers-reduced-motion`.

---

## 5. Universal Undo & State Safety Architecture

- Universal `UndoManager` singleton:
  - Registers last actionable state (e.g., `srsReviewCommit`, `quizChoiceSelect`, `cardAdvance`).
  - Displays a floating pill toast (`.apple-toast-undo`) at the bottom center:
    *"Đã ghi nhận • [Hoàn tác (Z)]"* with a 4-second subtle countdown circle.
  - Pressing `Undo` or `Z` reverses state cleanly with spring reverse transition.
