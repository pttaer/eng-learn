# Game-Style Spotlight Onboarding Tour & Sensory Interactions Design Spec

**Date**: 2026-09-30  
**Initiative**: 16 (`ENG-40` .. `ENG-43`)  
**Design Authority**: `TokenTrackerAntigravity` (`antigravity_token_tracker.html`), `CLEAN_DESIGN_SYSTEM.md`, `ui-ux-pro-max`  
**Status**: Validated Design (Ready for Execution)

---

## 1. Executive Summary & Goals

The English Singularity learning platform requires a game-style, interactive onboarding tutorial and sensory upgrade inspired by the GPU-accelerated spotlight tour in `TokenTrackerAntigravity`.

### Objectives
1. **GPU-Accelerated Spotlight Cutout**: An immersive focus curtain (`box-shadow: 0 0 0 9999px rgba(10, 10, 12, 0.85)`) with a glowing gold perimeter (`var(--accent-gold)`) that smoothly snaps to and tracks target elements.
2. **Dynamic Bouncing Directional Pointer**: An animated directional glyph (`👈`, `👉`, `👆`, `👇`) that dynamically calculates optimal positioning relative to the target element without viewport clipping.
3. **Floating Glassmorphic HUD Holo-Card**: A floating command dialog with step badges (`STEP 1 OF 6 // DIRECTIVE HUD`), pedagogical mission briefings, live mini progress bar (`tour-mini-bar`), step counter (`3 / 6`), and controls (`[← Previous]`, `[Skip]`, `[Next →]`).
4. **Hands-On Interactions & Audio Synthesis**: Procedural Web Audio sound cues on each step advance, and an animated 2D canvas gold particle burst (`confettiCanvas`) upon tour completion with level-up fanfare.
5. **On-Demand & First-Run Intelligence**: Automatic welcome prompt for first-time visitors (`localStorage` check), plus a permanent `[ 🎮 TOUR ]` button in the top Header HUD for re-running the briefing at any time.

---

## 2. Component Architecture & System Decomposition

### 2.1 Spotlight Engine (`web/src/core/spotlight-tour.ts`)
- **Overlay Container (`#tourOverlay`)**: Fixed viewport overlay with `z-index: 100000`, pointer-events management.
- **Spotlight Box (`#tourSpotlight`)**:
  - `box-shadow: 0 0 0 9999px rgba(10, 10, 12, 0.85), 0 0 16px var(--accent-gold)`
  - Border: `2px solid var(--accent-gold)`
  - Transition: `top 0.32s cubic-bezier(0.2, 0, 0, 1), left 0.32s, width 0.32s, height 0.32s`
  - Clicking on the spotlight advances the tour.
- **Pointer Arrow (`#tourArrow`)**:
  - Computes target element center `(targetX, targetY)`.
  - Determines available quadrant space (Right > Left > Bottom > Top).
  - Bounces via CSS keyframe animations (`bounceLeft`, `bounceRight`, `bounceUp`, `bounceDown`).
- **Tour Card (`#tourCard`)**:
  - Clamped within viewport bounds `(14px <= top <= window.innerHeight - cardHeight - 16px)`.
  - Step counter, description, progress track, and controls.
  - Keyboard event listeners: `ArrowRight` / `Enter` (Next), `ArrowLeft` (Previous), `Escape` (Close/Skip).

### 2.2 Tour Curriculum: 6 Core Directives

1. **Step 1: Neural Telemetry & Streak**
   - **Target**: `.hud-telemetry-cluster`
   - **Title**: `🔥 Neural Engram Telemetry`
   - **Description**: "Track your daily study streak, overall C2 Summit completion percentage, and active SM-2 retention rate across all 1,000 collocations and grammar rules."
2. **Step 2: Today's 15-Minute Daily Workout**
   - **Target**: `.workout-banner`
   - **Title**: `★ Today's 15-Minute Workout`
   - **Description**: "Your mandatory daily tripartite cognitive workout: 10 Spaced Collocations, 1 Benjamin Franklin MEAL Copywork, and 1 Nation 4-3-2 Speaking take."
3. **Step 3: The Skyrim Constellation Skill Tree**
   - **Target**: `.constellation-container`
   - **Title**: `🌌 Prerequisite Constellation Matrix`
   - **Description**: "Navigate 25 engram nodes spanning 5 levels of linguistic sophistication. Master foundational tier 1 perks to illuminate pathways toward the C2 Summit."
4. **Step 4: Interactive Perk Engram & Prerequisites**
   - **Target**: `.constellation-node[data-node-id="voc-1"]`
   - **Title**: `★ Perk Engram & Gated Criteria`
   - **Description**: "Click any star node to inspect syllabus objectives, required prerequisite skills, and retention metrics before launching targeted drills."
5. **Step 5: The 5 Pillars of C2 Nuance**
   - **Target**: `.branches-summary-grid`
   - **Title**: `🏛 The 5 Mastery Disciplines`
   - **Description**: "Syntactic Architecture, Lexical Precision, Rhetoric & Copywork, Prosody Fluency, and Epistemic Deconstruction. Click any pillar to jump directly into its dedicated studio."
6. **Step 6: Acoustic Synthesis & Cloud Sync**
   - **Target**: `.hud-actions`
   - **Title**: `⚙ Sensory Settings & Backup Sync`
   - **Description**: "Toggle Pythagorean Just-Intonation procedural soundscapes, export your JSON progress backup, or restore across multiple desktop and mobile devices."

### 2.3 Fullscreen Particle Celebration Canvas (`web/src/core/particle-canvas.ts`)
- Canvas: `<canvas id="confettiCanvas"></canvas>` with `position: fixed; inset: 0; pointer-events: none; z-index: 100005`.
- Particle types: Golden star sparks, geometric confetti strips, and luminescent embers.
- Physics: High-velocity radial explosion, gravity `0.18`, drag `0.985`, rotational angular momentum.
- Lifecycle: Automatic animation loop using `requestAnimationFrame` that terminates and clears memory when all particles settle.

### 2.4 Audio Telemetry Extensions (`web/src/core/audio-synthesizer.ts`)
- `tour-step`: Ascending micro-tone blip (`f0 = 587.33 Hz → 880 Hz`, duration `65ms`).
- `tour-fanfare`: 4-note ascending major arpeggio (`C5 → E5 → G5 → C6`, Just Intonation, duration `480ms`).

---

## 3. Delegation & Fleet Work Allocation

| Ticket | Owner | Module | Objective |
| :--- | :--- | :--- | :--- |
| `ENG-40` | `dwight-mul1u508` | `web/src/core/particle-canvas.ts` | High-performance 2D Canvas confetti & gold particle celebration engine with procedural physics and memory cleanup. |
| `ENG-41` | `andy-mul1ug04` | `web/src/core/spotlight-tour.ts` | Complete Spotlight Cutout Engine, 6-step curriculum, pointer arrow tracking, keyboard shortcuts, and sound cues. |
| `ENG-42` | `phyllis-mul1ur07` | `web/src/assets/styles/dossiers.css` | GPU-accelerated styling for spotlight, glowing aura pulse, glassmorphic tour card, progress bar HUD, and reduced motion fallbacks. |
| `ENG-43` | `jim-mum0qdlb` | Integration & Headless QA | Header HUD `[ 🎮 TOUR ]` button binding, `main.ts` first-run welcome prompt, and end-to-end automated test suite (`verify-spotlight-tour.cjs`). |

---

## 4. Verification & Definition of Done

1. `verify-spotlight-tour.cjs`:
   - Headless verification of all 6 steps with target bounding rect alignments.
   - Verified directional pointer repositioning on each step.
   - Validated keyboard navigation (`ArrowRight`, `ArrowLeft`, `Escape`).
   - Verified `confettiCanvas` particle generation and automatic termination.
   - Tested local storage flag `eng_onboarding_completed`.
2. Full production build (`npm run build`) compiling with zero TypeScript errors.
3. Updated unpacked desktop executable (`web/release/win-unpacked/resources/app.asar`).
