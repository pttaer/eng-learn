# Human-Centered English Learning Platform Redesign Specification

**Status:** Approved via `/grill-me` Architectural Interview  
**Date:** 2026-09-29  
**Target:** [`web/src/`](file:///E:/Eng/web/src/)  
**Standard:** Clean Minimalist Monochrome (`#000000` / `#ffffff`), WCAG 2.2 AAA, Native OS Ergonomics, Zero Sci-Fi Jargon.

---

## 1. Executive Summary & Problem Diagnosis

The English Singularity web platform was built with complex 2.5D perspective mathematics, audio synthesis, and spaced repetition algorithms. However, user feedback from real 60-second learning trials revealed that the user experience felt like an alien sci-fi terminal rather than an inviting, effective tool for mastering English:

1. **Intimidating Onboarding:** Learners land on an abstract geometric sea urchin with bristling spines, floating decoy shards, and cold military telemetry (`STARK // ENG SINGULARITY [NODE: SINGULARITY]`), with zero guidance on what to do first.
2. **Trapped Navigation:** No visible `[ ← Back to Home ]` button exists inside study modules. Learners are forced to guess the developer `Escape` shortcut or decode a tiny rotating dial in the bottom right corner.
3. **Robotic Jargon:** Interfaces are cluttered with internal developer telemetry (`COGNITIVE LOAD FACTOR EF 2.50 (CANONICAL)`, `SYNTACTIC DRILL RUN 0 TRANSFORMATIONS`).
4. **Missing Copywork Mechanics:** The Writing module claims to teach Benjamin Franklin Copywork but lacks a text input area, reducing the exercise to a passive flashcard. Long prompt sentences are vertically clipped by fixed card boundaries.
5. **Floaty, Lagged Cursor:** Overriding the native mouse with `cursor: none` and a custom spring-physics reticle causes clicks, text selection, and typing to feel floaty and unresponsive.
6. **Cramped Collocations Exploration:** Studying 1,000 items one card at a time with a truncated search input (`SEARCH 1,000 COI`) is exhausting.

This specification details the comprehensive **Human-Centered Redesign** that preserves the elegant binary monochrome aesthetic while transforming the application into a calm, focused, and intuitive study platform.

---

## 2. Shared Architectural Decisions (Interview Consensus)

| Domain | Legacy State | Redesigned Standard |
| :--- | :--- | :--- |
| **Cursor & Pointer** | `cursor: none` + Canvas spring crosshair | **Native OS Cursor** (`default`, `pointer`, `text`). Zero input lag. |
| **Header Navigation** | Telemetry nodes (`[NODE: WRITE]`), no back button | **Permanent `[ ← Home ]` Button**, clear title (`Writing & Copywork`), Mute & Streak. |
| **Wayfinding Widget** | Corner Compass with 8px label | **Retired**. Clean header navigation is the single source of truth. |
| **Home Dashboard** | Only Sea Urchin in center | **Dual Mode**: "Today's Guided Workout" (15 min) + Interactive Urchin Gateways. |
| **Writing (Franklin)** | Passive flashcard with cut-off text | **Two-Step Studio**: Read Prompt → Hide & Type in Textarea → Instant Split-Diff. |
| **Collocations & Vocab** | Flashcard-only with truncated search | **Dual View**: Toggle between "Daily Flashcards" and "Searchable Dictionary". |
| **Reading & Grammar** | Robotic telemetry badges, dense walls | **Human Typography**: Clean rule callouts, Vietnamese translations, relaxed reading. |
| **Speaking Studio** | Fixed card crammed with 6 sub-widgets | **3-Stage Clean Flow**: 1) Prepare & Collocations → 2) Record & Timer → 3) Review & Check. |
| **Audio Feedback** | Constant oscillator clicks on every button | **Speech-First**: Clean TTS on [Audio] click, silent navigation, gentle completion chime. |

---

## 3. Detailed Component Specifications

### 3.1 Global Shell & Navigation (`header-hud.ts`, `hud-base.css`)

1. **Native Cursor Restoration:**
   - Remove `cursor: none` from `html, body`.
   - Remove `CursorTracker` canvas reticle overlay or set to inactive.
   - Enforce standard interactive cursor rules: `cursor: pointer` on buttons/tabs, `cursor: text` on inputs/textareas, `cursor: default` on canvas.

2. **Persistent Header Navigation Bar:**
   - **Left Section:**
     - On Home screen (`#singularity`): Clean brand mark `ENGLISH SINGULARITY` with subtitle `Mastery Platform`.
     - Inside any module (`#read`, `#write`, `#listen`, `#speak`, `#vocab`, `#colloc`, `#grammar`, `#habits`): Prominent **`[ ← Home ]`** button (`.hud-btn-back`) with keyboard shortcut hint (`Esc`).
     - Module Title badge in clean plain English: e.g. `Pillar 02 // Writing & Copywork`.
   - **Right Section:**
     - `Streak: 0 Days` (clean tabular numbers).
     - `Sound: On / Mute` toggle button.
     - `[ Backup ]` dropdown for Export/Import JSON.
   - **Mobile Viewport Hardening:**
     - Replace dense horizontal cluster with responsive wrap and 44px minimum touch targets. Eliminate overlapping text and clipping.

3. **Retire Corner Compass:**
   - Remove the bottom-right corner compass widget from DOM and CSS to eliminate visual clutter and touch conflicts with OS gesture bars.

---

### 3.2 Home Screen: "Today's Guided Workout" Hub (`main.ts`, `perspective-canvas.ts`)

1. **Guided Daily Workout Card:**
   - Render a calm, centered dashboard card below or alongside the Sea Urchin:
     - **Title:** `TODAY'S 15-MINUTE WORKOUT`
     - **Daily Checklist:**
       1. `[ ] 5 Collocations` (Everyday & Business hubs)
       2. `[ ] 1 Reading Article` (Intensive 4-Pass)
       3. `[ ] 1 Franklin Copywork` (Structure reconstruction)
       4. `[ ] 1 Speaking Drill` (4-3-2 Fluency)
     - **Primary Action:** Large prominent button: **`[ START TODAY'S LESSON ]`** which launches the student directly into the first pending daily task.
2. **Interactive Urchin Gateways:**
   - Retain the living geometric Sea Urchin with 7 radial gateway nodes (READ, WRITE, LISTEN, SPEAK, VOCAB, COLLOC, GRAMMAR).
   - Display items due directly on the gateway nodes (e.g. `COLLOC (5 DUE)`).
   - Students can click any node to explore freely outside the guided workout.

---

### 3.3 Pillar 02: True Benjamin Franklin Copywork Studio (`writing-dossier.ts`)

1. **Step 1: Understand the Model Sentence & Argument:**
   - Display prompt topic and register (e.g., *Academic Jurisprudence / Legal Philosophy*).
   - Display model exemplar sentence with generous line height and clean typography.
   - Display MEAL structural argument hints (Main idea, Evidence, Analysis, Link).
   - Action Button: **`[ START RECALL & TYPING ]`** (Shortcut: `Enter`).

2. **Step 2: Blind Recall & Active Typing:**
   - Hide the full model sentence (leaving only brief topic cues).
   - Render a generous, auto-focused textarea (`.copywork-textarea`):
     - `placeholder="Type the sentence from memory. Focus on sentence structure, syntactic connectors, and precision..."`
     - Clean monospace/sans typography, min-height 120px, responsive width up to 720px.
   - Telemetry strip above textarea: Live word counter, character counter, elapsed timer.
   - Action Button: **`[ SUBMIT & COMPARE DIFF ]`** (Shortcut: `Ctrl+Enter`).

3. **Step 3: Split-Diff Comparison & Metric Evaluation:**
   - Execute Myers/Hirschberg Longest Common Subsequence (LCS) character/word diff:
     - Exact matches: Neutral crisp ink.
     - Missed words (Deletions): Strike-through with subtle outline.
     - Extra/misspelled words (Insertions): Underlined or highlighted badge.
   - Metrics display:
     - **Accuracy %**: Calculated based on Levenshtein/LCS match ratio.
     - **WPM**: Net typing speed.
     - **Error Count**: Mismatched tokens.
   - Self-Scoring SM-2 Bar: `[ Again (1) ]` / `[ Good (2) ]` to update spaced repetition schedule and automatically advance to the next prompt.

---

### 3.4 Pillars 05 & 06: Dual-View Collocations & Vocab Vault (`collocations-dossier.ts`, `vocabulary-dossier.ts`)

1. **View Mode Switcher:**
   - Prominent toggle tabs at top of dossier:
     - **`[ DAILY FLASHCARDS ]`**: For active SRS review sessions (cards due today).
     - **`[ FULL DICTIONARY (1,000) ]`**: For browsing, searching, and reference.

2. **Full Dictionary View:**
   - Instant search input with clear placeholder: `Search 1,000 collocations in English or Vietnamese...`.
   - Category pill filters: `[ All ]`, `[ Everyday Verbs ]`, `[ Business & Law ]`, `[ Academic & Tech ]`, `[ Idioms & Social ]`.
   - Clean, paginated table/card list (25 items per page):
     - English Collocation (bold, audio speaker button).
     - Vietnamese Meaning (natural idiomatic translation).
     - Preposition & Structural Pattern (e.g., `pay attention + to + [noun]`).
     - Mastery Status indicator (`New`, `Learning`, `Mastered`).

3. **Daily Flashcard View:**
   - Card dimensions expanded with dynamic content sizing (no text clipping).
   - Front: Collocation in large clear typography, preposition prompt, and prompt context.
   - Back: Vietnamese meaning, complete exemplar sentence, and SRS rating bar.

---

### 3.5 Pillar 01 Reading & Pillar 07 Grammar: Calm, Human Typography (`reading-dossier.ts`, `grammar-dossier.ts`)

1. **Grammar Dossier:**
   - Eliminate robotic labels (`COGNITIVE LOAD FACTOR`, `SYNTACTIC DRILL RUN`).
   - Clear, friendly header: `Grammar Focus: Inversion & Emphasis` with CEFR indicator (`C1`).
   - Bold formula callout box: `Hardly + had + Subject + Past Participle + when...`.
   - Exemplar sentence with side-by-side Vietnamese structural comparison.
   - Interactive syntactic repair challenge: Click to reveal the master transformation.

2. **Reading Dossier:**
   - Safe paragraph parsing supporting string and array structures (bug fixed).
   - Unhurried reading mode: Optional 60-second skim timer, but no mandatory cutoff.
   - Generous reading measure (`68ch`), relaxed line-height (`1.65`), clear paragraph spacing.
   - Interactive vocabulary highlights: Clicking marked target phrases displays Vietnamese definitions and usage context.

---

### 3.6 Pillar 04: 3-Stage Speaking Cockpit (`speaking-dossier.ts`)

1. **Stage 1: Preparation (15s):**
   - Clean prompt text displayed in commanding typography.
   - Native exemplar audio button (`[ Listen to Model ]`).
   - 4 Target Collocation chips with plain pronunciation hints.
   - Action: `[ Ready to Speak ]`.

2. **Stage 2: Fluency Recording (Nation 4-3-2):**
   - Circular countdown timer (4 min Round 1, 3 min Round 2, 2 min Round 3).
   - Live visual audio level meter (reassures student that microphone is capturing).
   - Live collocation spotter highlighting phrases as the student utters them.
   - Action: `[ Finish Speaking ]`.

3. **Stage 3: Review & Progression:**
   - Synchronized audio replay: Play student take vs native exemplar.
   - Collocation checklist showing detected collocations.
   - 3-round compression comparison metrics (word count and fluency increase).
   - SM-2 score bar to save session.

---

### 3.7 Sound & Sensory Polish (`audio-synthesizer.ts`)

1. **Silent Navigation:**
   - Remove synthesized oscillator beep on routine navigation clicks and button hovers.
2. **High-Fidelity Speech Audio:**
   - Web Speech API dialect selection (en-US / en-GB) on speaker buttons.
3. **Gentle Milestone Chime:**
   - Harmonic, soft completion chime only when completing a full exercise or daily workout.
4. **Header Mute Control:**
   - One-click global mute button in the top navigation bar.

---

## 4. Verification & Acceptance Criteria

1. **Human Usability (The 60-Second Test):**
   - A new student opening the app can immediately identify what to do via "Today's Guided Workout".
   - A student can enter any module and navigate back to Home with a single click on `[ ← Home ]`.
   - The native mouse pointer feels snappy, responsive, and familiar with zero lag.
2. **Copywork Functionality:**
   - Student can type into a real textarea, press Submit, and see an accurate word-by-word diff against the model sentence with accuracy and WPM metrics.
3. **Responsive & Visual Invariants:**
   - Zero text clipping or vertical overflow on cards across all 8 modules.
   - Zero horizontal scrollbars across desktop (1440x900) and mobile (375x812).
   - All 5 automated unit test suites pass 100%.
   - Headless browser QA (`web/scripts/browser-qa-test.cjs`) executes with zero console errors and zero network failures.
4. **Production Build:**
   - `npm run build` compiles cleanly with zero TypeScript or Vite errors in $< 2.0\text{s}$.
