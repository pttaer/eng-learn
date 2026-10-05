# Monochrome "Sea Urchin" Interactive English Learning Web System
## Design Specification Document

**Document ID:** `SPEC-2026-09-29-URCHIN-ENG`  
**Status:** Validated & Approved via `/grill-me` Architectural Review  
**Date:** 2026-09-29  
**Authors:** Michael (`god`), Mic (`michael-mum0t4d1`), and User  

---

## 1. Executive Summary & Aesthetic Vision

The **Monochrome "Sea Urchin" English Learning Web System** is an ultra-high performance, distraction-free web application combining the interactive delight of an **Iron Man HUD** with **stark architectural minimalism**. 

### Core Aesthetic Constraints
1. **Absolute Binary Monochrome:** Strict adherence to "less color the better." The palette is purely binary:
   - Canvas: Solid Paper-White (`#FFFFFF`).
   - Entities & Typography: Pitch-Black (`#000000`).
   - Structural Drafting Accents: 1px hairline black strokes (`rgba(0, 0, 0, 0.12)`).
   - Zero color accents, zero chromatic aberration, zero neon blooms.
2. **Universal Design Consistency:** Every single learning material across all four language pillars is standardized on the **Universal Atomic Card Standard**. No disparate UI widgets or disjointed layouts.
3. **In-App Spaced Repetition (No External Anki):** The system fully implements the SM-2 spaced repetition memory algorithm natively in browser storage. Users never need to export or install third-party software.
4. **Faked 3D (2.5D Math + CSS Perspective):** Zero heavy 3D engine overhead. Depth is computed purely via lightweight 2D perspective projection math on the background canvas, paired with native hardware-accelerated CSS 3D perspective transforms (`perspective: 1000px`) on foreground cards.

---

## 2. Canvas & Singularity Mechanics

### 2.1 The Living Geometric "Sea Urchin"
At the center of the white canvas sits a dynamic mathematical singularity:
- **Structure:** A dense solid black circular core surrounded by 96 radial needle spines of varying mathematical lengths.
- **Magnetic Kinematics:** 
  - Each spine acts as a flexible magnetic compass needle.
  - As the cursor moves across the screen, the spines compute angular distance and dynamically lean, bend, and orient themselves toward the pointer.
  - Proximity tightens the magnetic pull, causing spines to reach outward toward the cursor.
- **Spine Parting & Pillar Gateways:**
  - Hovering directly within the central singularity's proximity zone triggers the parting animation: spines smoothly swing outward into an open crown with spring physics (`stiffness: 120, damping: 14`).
  - Revealing the **4 Core English Pillar Gateways** nested inside the core:
    - `[01 // READ]` — 1,000 Collocations & Lexical Foundations
    - `[02 // WRITE]` — Benjamin Franklin Copywork & MEAL Architecture
    - `[03 // LISTEN]` — 3-Pass Active Transcription Protocol & Connected Speech
    - `[04 // SPEAK]` — Nation 4-3-2 Fluency Drills & Arguelles Shadowing

### 2.2 Navigation Transition: Minimalist Split Dossier
- Clicking any pillar node initiates a smooth perspective zoom into that module's **Minimalist Split Dossier**:
  - The active study module occupies a central 3D-tilting workspace card with 1px black borders.
  - The central sea urchin gracefully scales down and transitions to the top corner as an **Interactive Miniature Compass**.

### 2.3 Corner Miniature Urchin Compass & Radial HUD
- In the workspace corner, the mini-urchin continues to live, its tiny spines reacting to cursor moves.
- **Hovering / Clicking the Corner Urchin:** Spines bristle and expand into a micro-radial HUD dial with 5 instant one-click jump targets:
  - `[HOME]` — Smoothly returns camera out to the full-screen sea urchin singularity.
  - `[READ]`, `[WRITE]`, `[LISTEN]`, `[SPEAK]` — Instant module switching without losing session state.

---

## 3. The Floaty Field: Decoys vs. Black-Light Artifacts

### 3.1 Continuous Cosmic Drift
- Floating geometric silhouettes drift continuously from canvas perimeters across the screen at varying pseudo-3D depths ($Z \in [100, 800]$).
- Debris Ratio: **3:1** (75% non-learning decoys, 25% valid learning artifacts).

### 3.2 Decoy Interaction: Micro-Implosion
- When the cursor hovers over a non-learning decoy:
  - The object snaps and implodes inward to a single zero-point dot within 120ms.
  - Emits a faint, hairline 1px concentric shockwave ring that dissolves into the white canvas.
  - Audio: A subtle, crisp vacuum snap.

### 3.3 Learning Artifacts: Inverted Void Lens ("Black Light")
- When the cursor touches a valid learning artifact:
  - **The Black Light Eruption:** The object emits concentric pitch-black shockwaves rippling across the white background.
  - **Inverted Void Lens:** A tight circular black lens snaps open with razor-sharp white text inside, revealing a high-impact collocation, idiom, or phonetic secret.
  - **Action Dock:** Features an **`[ABSORB]`** button. Clicking it pulls the item into today's in-app SRS queue with a gravity beam animation.
  - Audio: A deep resonant reverse-whoosh and sub-bass pulse.

---

## 4. The Universal Atomic Card Standard

To maintain absolute design consistency, **every single learning activity** across all modules adheres to this exact architectural blueprint:

```
┌──────────────────────────────────────────────────────────────┐
│ [01 // READ : COLLOCATIONS]            [CARD 042 / 1000] [🔊] │  <-- Top Telemetry Header
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                      "bear in mind"                          │  <-- Front Face: English Prompt
│                                                              │
│             [Click or Space to Spin / Reveal]                │
├──────────────────────────────────────────────────────────────┤
│                 (180° 3D Y-Axis Flip)                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│       Ghi nhớ, khắc sâu trong tâm trí                        │  <-- Back Face: Vietnamese / IPA /
│       IPA: /beər ɪn maɪnd/                                   │      Analysis / Master Diff
│       Ex: "Please bear in mind that deadlines are strict."    │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│   [ ✗ ] Again (1)       [ ⟳ Spin (Space) ]      [ ✓ ] Good (2)│  <-- Universal Bottom Dock
└──────────────────────────────────────────────────────────────┘
```

### Universal Card Anatomy
1. **Top Telemetry Header:**
   - Left: Module & Category breadcrumb (`[PILLAR // CATEGORY]`).
   - Right: Queue index counter (`[CARD 042 / 1000]`) and native speech synthesis audio trigger `[🔊]`.
2. **Front Face:** The active recall challenge (English collocation, transcription audio player, speaking prompt, or Franklin master text).
3. **180° 3D Y-Axis Flip:** Card rotates around the Y-axis with spring dynamics upon click or `Space` keypress.
4. **Back Face:** The solution/resolution (Vietnamese translation, phonetic transcription, side-by-side diff comparison, or rubric).
5. **Universal Bottom Dock:**
   - Left: `[ ✗ ]` (Again / Retry) — hotkey `1` or `Left Arrow`.
   - Center: `[ ⟳ Flip ]` — hotkey `Space`.
   - Right: `[ ✓ ]` (Good / Mastered) — hotkey `2` or `Right Arrow`.

---

## 5. In-App Spaced Repetition Engine (Native SM-2)

The system completely eliminates reliance on external Anki software by embedding the **SuperMemo-2 (SM-2) Spaced Repetition Algorithm** directly into client storage.

### Mathematical Formulation
For each card, the engine maintains:
- $n$: Repetition number.
- $EF$: Easiness factor (initialized to $2.5$, lower-bounded at $1.3$).
- $I$: Interval in days.

Upon user rating:
- If `[ ✗ ]` (Grade = 1):
  $$n = 0, \quad I = 1 \text{ day}, \quad EF = \max(1.3, EF - 0.2)$$
- If `[ ✓ ]` (Grade = 4):
  $$I(1) = 1 \text{ day}, \quad I(2) = 6 \text{ days}, \quad I(n) = \text{round}(I(n-1) \times EF) \text{ for } n > 2$$
  $$EF = EF + (0.1 - (5 - 4) \times (0.08 + (5 - 4) \times 0.02)) = EF$$

### Queue & Session Lifecycle
- Each card record stores: `{ id, front, back, n, ef, interval, nextReviewDate, lastReviewedDate }`.
- On app launch, the engine gathers all cards where `nextReviewDate <= today`.
- Cards are reviewed in standard batches of 20.
- Session completion triggers the **Urchin Gravitational Absorption Ritual** (Section 7).

---

## 6. The 4 Pillar Study Dossiers

### 6.1 Pillar 1: Reading & Lexicon (`[01 // READ]`)
- **Curriculum Source:** `collocations.md` (exact 1,000 items partitioned into 4 domains: Everyday Verbs 1–250, Business & Law 251–500, Academic & Science 501–750, Emotions & Idioms 751–1000).
- **Interface:** 
  - Standard Universal Card deck.
  - Front: English collocation in bold monospace.
  - Back: Natural Vietnamese translation, phonetic breakdown, and authentic example sentence.
  - Domain filter switch (`[ALL]`, `[EVERYDAY]`, `[BUSINESS]`, `[ACADEMIC]`, `[IDIOMS]`).
  - Command Search Palette (`Ctrl+K`) for instant real-time filtering across all 1,000 items.

### 6.2 Pillar 2: Writing & Franklin Copywork (`[02 // WRITE]`)
- **Curriculum Source:** `writing.md` (Syntactic hierarchy, MEAL/PEEL paragraph architecture, Franklin copywork technique).
- **Interface:**
  - Front Face: Presents a master stylistic sentence/paragraph. User studies the sentence, takes mental notes, and hits `Space` to begin.
  - Active Input Face: Master sentence is hidden; user reconstructs the sentence from memory into a clean, distraction-free monospace text input.
  - Back Face (Evaluation): Submitting reveals a **Split Diff Console** highlighting character/word differences in clean monochrome (strikethrough vs bold). User grades their fidelity via `[ ✗ ]` or `[ ✓ ]`.

### 6.3 Pillar 3: Listening & Transcription (`[03 // LISTEN]`)
- **Curriculum Source:** `listening.md` (3-Pass Active Transcription Protocol & Connected Speech acoustics).
- **Interface:**
  - Front Face: Built-in audio playback player with speed toggles (`0.75x`, `1.0x`).
  - 3-Pass Workflow:
    - Pass 1: Gist comprehension notes.
    - Pass 2: Word-for-word verbatim transcription field.
    - Pass 3: Phonetic analysis card revealing weak forms, schwa reductions, and connected speech catenation points.
  - Evaluation via universal `[ ✗ ]` / `[ ✓ ]` dock.

### 6.4 Pillar 4: Speaking & Fluency (`[04 // SPEAK]`)
- **Curriculum Source:** `speaking.md` and `practice_drills.md` (Nation 4-3-2 Fluency Technique, 30 Jamming/Debate Prompts).
- **Interface:**
  - Front Face: Presents a randomized speaking prompt from the 30 curated prompts.
  - Circular Arc Gauge Countdown:
    - Round 1: 4 Minutes.
    - Round 2: 3 Minutes (speed increase).
    - Round 3: 2 Minutes (high-speed automation).
  - Optional Live Voice Waveform: Native Web Audio microphone input rendering an organic circular waveform that bounces to the user's vocal cadence in pitch-black ink.
  - Back Face: 20-Point self-evaluation rubric.

---

## 7. Habit Engine & Session Completion Ritual

### 7.1 30-Day Mission Log Card Deck
- **Curriculum Source:** `daily_practice_plan.md` (4-phase 30-day habit roadmap).
- **Interface:**
  - 30 minimalist day-cards organized in a 2.5D horizontal carousel.
  - Each day lists the 4 daily habit checkboxes (e.g., 20 SRS Cards, 15 min 4-3-2 Speaking, 15 min Transcription, 10 min Copywork).
  - Checking off all daily targets completes the day-card, incrementing the global persistent streak counter.

### 7.2 Session Completion Ritual: Gravitational Absorption
When the final card of a review batch or daily habit set is marked:
1. The card deck contracts into a black laser beam that is gravitationally drawn into the corner sea-urchin compass.
2. The sea urchin awakens and fires a full-canvas **Black-Light Shockwave** (pitch-black ripple spreading across the white canvas).
3. A clean, architectural telemetry receipt slides into focus:
   - `[MISSION COMPLETE: 20 CARDS REVIEWED]`
   - `[RETENTION ACCURACY: 95%]`
   - `[CURRENT STREAK: 12 DAYS]`
   - Actions: `[RETURN TO ORBIT (Esc)]` or `[COMMENCE NEXT BATCH]`.

---

## 8. Keyboard Controls, Sound & Data Storage

### 8.1 Power-User Keyboard Command Map
- `Space`: Spin / Flip active card; Start/Pause 4-3-2 timer.
- `1` or `←` (Left Arrow): Rate card as `[ ✗ ]` (Again / Fail).
- `2` or `→` (Right Arrow): Rate card as `[ ✓ ]` (Good / Mastered).
- `Esc`: Instant escape from any study dossier back to the Sea Urchin canvas.
- `Ctrl+K` / `Cmd+K`: Instant HUD command search across 1,000 collocations.

### 8.2 Minimalist Sci-Fi Soundscape (Procedural Web Audio)
- Zero external audio files; all feedback is procedurally synthesized using the browser `AudioContext`:
  - **Urchin Proximity:** Gentle low-frequency sub-bass hum (50Hz–80Hz).
  - **Pointer Hover:** Delicate high-frequency micro-click (1800Hz, 8ms decay).
  - **Decoy Implosion:** Snappy vacuum pop (300Hz $\rightarrow$ 60Hz drop, 60ms).
  - **Black Light Lens Open:** Resonant reverse-whoosh (120Hz $\rightarrow$ 4/c80Hz crescendo).
  - **Master Mute:** Instant toggle in the top telemetry bar.

### 8.3 Data Storage & Backup Schema
- Data is stored in `localStorage` under key `STARK_ENG_STATE`:
  ```json
  {
    "version": 1,
    "streak": 7,
    "lastCompletedDate": "2026-09-29",
    "completedHabitDays": [1, 2, 3, 4, 5, 6, 7],
    "srsCards": {
      "colloc-042": { "n": 3, "ef": 2.5, "interval": 6, "nextReview": "2026-10-05" }
    },
    "absorbedArtifacts": ["colloc-042", "colloc-118"],
    "soundMuted": false
  }
  ```
- Includes a discreet corner setting to export a `backup.json` file or perform a complete clean reset.

---

## 9. Spec Self-Review Checklist

1. **Placeholder Scan:** Zero `TODO`, `TBD`, or ambiguous placeholders. Every interaction, mathematical formula, keybinding, and asset is explicitly specified.
2. **Internal Consistency:** The pure binary monochrome palette is maintained across all sections. The Universal Atomic Card Standard is strictly observed across all 4 pillars.
3. **Scope Check:** The system is completely self-contained within client-side Vite/TypeScript and directly integrates all existing Markdown curriculum files in `E:\Eng`.
4. **Ambiguity Check:** All interaction triggers, keyboard hotkeys, and data structures are uniquely defined with unambiguous parameters.

---
*End of Design Specification.*
