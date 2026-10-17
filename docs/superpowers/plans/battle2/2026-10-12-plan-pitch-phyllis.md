# Pitch: Official Computer-Delivered IELTS (CD-IELTS) Exam Cockpit UI & Engine
**Author**: Phyllis (`phyllis-mul1ur07`) — Lead UI/UX, Ergonomics & Dossier Systems Specialist  
**Ticket**: ENG-103 (Initiative 31 — Whole-Floor Battle II: Next-Gen IELTS & Cognitive Mastery)  
**Date**: October 12, 2026  
**Status**: Ready for Floor Review & Orchestrator Adjudication  
**Target Specification**: `docs/superpowers/plans/battle2/2026-10-12-plan-pitch-phyllis.md`  
**Philosophy**: `/ui-ux-pro-max` Precision Architecture + `/ponytail` Ultra (Native Web Standards, Zero Bloat, Minimalist Power)

---

## 1. Executive Summary & Core Value Proposition

Current in-browser IELTS test suites fail candidates for one fundamental reason: they simulate the **content** of the exam while ignoring the **sensory and spatial cockpit ergonomics** of the real British Council / IDP Computer-Delivered IELTS (CD-IELTS) test stations. 

Candidates in the actual computer test face a rigid, zero-scroll 100dvh desktop terminal with high-contrast accessibility schemes, a bottom question palette (1–40) with review flags, split-pane passage synchronization, strict timer alerts (10m / 5m remaining), and a distraction-free fullscreen environment.

This proposal pitches the **CD-IELTS Master Exam Cockpit UI (`IeltsExamCockpit`)** — a native, high-performance test station built with **pure CSS Grid/Flexbox**, **zero external dependencies**, **native DOM Fullscreen & Web Audio APIs**, and **WCAG 2.2 AAA contrast standards**.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [✦ IELTS CD-COCKPIT] [MODE: TIMED EXAM]  [⏱ 58:42 REMAINING]  [🎨 SCHEME: NORMAL] [⛶ FULL]│
├───────────────────────────────────────────────────┬────────────────────────────────────┤
│           PASSAGE / PROMPT PANE (50%)             │      QUESTION / EDITOR PANE (50%)  │
│                                                   │                                    │
│  [READING PASSAGE 1: The Falkirk Wheel]           │  [QUESTIONS 1–13: TRUE/FALSE/NG]   │
│  The Falkirk Wheel in Scotland is the world's     │                                    │
│  only rotating boat lift. Opened in 2002...       │  Q1. The Falkirk Wheel was built to│
│                                                   │      replace a flight of locks.    │
│  [HIGHLIGHTED TEXT: "opened in 2002 to connect"]  │  ( ) TRUE   (•) FALSE   ( ) NOT G. │
│                                                   │                                    │
│  [INLINE SCRATCHPAD DRAWER (COLLAPSED)]           │  Q2. It took three years to build. │
│  "Note: Check paragraph C for dates"              │  ( ) TRUE   ( ) FALSE   ( ) NOT G. │
├───────────────────────────────────────────────────┴────────────────────────────────────┤
│ [◄ BACK] [1] [2] [3*] [4] [5] ... [39] [40] [NEXT ►]  [🚩 FLAG FOR REVIEW] [SUBMIT TEST]│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Spatial Layout & Viewport Architecture (100dvh Zero-Scroll)

In adherence to `/ponytail` ultra, we reject bulky layout frameworks. Everything is anchored by pure native CSS:

### 2.1 Three-Zone Cockpit Structure (`ielts-cockpit.css`)
1. **Top Command Strip (`.cockpit-top-bar`, height: 48px)**:
   - Module indicator: `READING // PASSAGE 1 OF 3` or `WRITING // TASK 2`.
   - Real-time countdown timer: Monospace tabular numerals (`font-variant-numeric: tabular-nums`). Flashes yellow at 10:00, red at 05:00.
   - Contrast scheme selector: 4 official Cambridge accessibility modes.
   - Text size scaler: `[ A- | A | A+ ]` adjusting root `--cd-font-scale` dynamically.
   - Fullscreen distraction-free toggle: `[ ⛶ Fullscreen ]`.
2. **Synchronized Split Arena (`.cockpit-split-arena`, height: `calc(100dvh - 96px)`)**:
   - Two equal 50/50 CSS Grid columns with independent internal overflow scrolling (`overflow-y: auto; overflow-x: hidden`).
   - Drag-to-resize divider (CSS `resize: horizontal` or native 8-line pointer move handler).
   - Left: Source passage / listening transcript / writing prompt / speaking cue card.
   - Right: Interactive question forms / writing editor / speaking recorder.
3. **Bottom Question Palette & Navigation Strip (`.cockpit-bottom-bar`, height: 48px)**:
   - Question Matrix: Compact pills numbered 1 to 40.
   - States: `answered` (bold filled), `unanswered` (outline), `flagged` (small top-right corner marker `*`).
   - Hotkey controls: `[ ◄ Previous (Alt+P) ]`, `[ Next ► (Alt+N) ]`, `[ Flag for Review (Alt+F) ]`.

### 2.2 Mobile & Tablet Responsive Fallback (<768px)
- The split grid shifts to a high-speed **Sticky Tab Header**:
  - `[ 📄 Passage ]` vs `[ ✍️ Questions (N/40) ]`.
  - Zero layout jumping; candidate's answer and cursor position persist across tab switches.

---

## 3. The 4 Modular Skill Cockpits

### 3.1 Reading Cockpit: Text-to-Question Synchronization
- **Native Selection Highlighter**: Selecting any text in the left pane spawns an instant native tooltip `[ 🖌 Highlight ]` and `[ 📝 Note ]` persisting in memory. Zero external libraries (uses native `window.getSelection()`).
- **Synchronized Scroll Anchors**: Clicking question "Questions 7–13 relate to Paragraph D" automatically scrolls the passage pane to anchor `<p data-label="D">`.

### 3.2 Writing Cockpit: Live Telemetry & Autosave Scratchpad
- **Live Word Counter**:
  - Computes active word count (`trim().split(/\s+/).length`) without regex overhead.
  - Visual pacing badge: Task 1 ($<150$ red, $\ge 150$ green); Task 2 ($<250$ red, $\ge 250$ green).
  - Paragraph & sentence count telemetry shown non-intrusively.
- **Autosave Scratchpad (`localStorage`)**:
  - Auto-persists candidate text every 1,000ms. If candidate accidentally reloads or loses power, text restores seamlessly with a 1-second toast notice.
  - Collapsible side-by-side scratchpad for outline planning.

### 3.3 Speaking Cockpit: Official Cue-Card Station & Acoustic Timer
- **Part 2 One-Minute Preparation Phase**:
  - Circular SVG countdown ring (60s) with 15s acoustic tick reminder.
  - Built-in digital note-taking scratchpad simulating the pencil and paper provided in real exams.
- **Two-Minute Long Turn Recorder**:
  - Automatic transition to 120s recording stage using existing `AcousticEngine`.
  - Real-time RMS silence/pause detection showing candidate hesitation percentage.

### 3.4 Listening Cockpit: Audio Sync & Timed Transfer
- Native Web Audio playback with persistent playback position.
- Official 10-minute check/transfer phase for reviewing flagged questions before final lock.

---

## 4. High-Contrast Accessible Color Palettes (Official Cambridge Standards)

In strict accordance with WCAG 2.2 AAA (minimum 7:1 for normal text, 21:1 for key test anchors), candidates can cycle through the 4 official Cambridge computer test schemes:

| Scheme Name | Canvas (`--bg`) | Surface (`--panel`) | Ink (`--text`) | Contrast Ratio | Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Standard Light** | `#ffffff` | `#f4f6f8` | `#0f172a` | **18.2 : 1** | Default daylight test center standard |
| **Dark Obsidian** | `#080a0f` | `#111622` | `#f8fafc` | **17.5 : 1** | Reduced glare & dark-room focus |
| **Yellow on Black** | `#000000` | `#121212` | `#facc15` | **19.1 : 1** | High-contrast visual impairment mode |
| **Blue on Cream** | `#fdfbf7` | `#f5efe6` | `#1e3a8a` | **14.8 : 1** | Dyslexia & low-stress visual comfort |

All schemes enforce **dual-layer coaxial focus rings** (`outline: 2px solid var(--ring-inner); box-shadow: 0 0 0 4px var(--ring-outer);`) guaranteeing instantaneous keyboard focus visibility.

---

## 5. Fullscreen Exam Mode & Distraction-Free Lock

Candidates can enter native fullscreen mode:
```typescript
function toggleExamMode(root: HTMLElement): void {
  if (!document.fullscreenElement) {
    root.requestFullscreen().catch(() => {});
    root.classList.add('in-exam-mode');
  } else {
    document.exitFullscreen().catch(() => {});
    root.classList.remove('in-exam-mode');
  }
}
```
- When active, all peripheral web navigation, headers, and footers are suppressed.
- `Escape` key displays an exit confirmation modal preventing accidental test aborts.
- `beforeunload` guard alerts candidate if unsaved answers exist.

---

## 6. Ergonomic Keyboard Shortcuts Matrix

| Key Combo | Action | Description |
| :--- | :--- | :--- |
| `Alt + N` | Next Question | Advances cursor to next question field |
| `Alt + P` | Previous Question | Returns cursor to previous question field |
| `Alt + F` | Flag / Unflag | Toggles review flag on active question |
| `Alt + T` | Toggle Tab | Switches between passage and questions on mobile |
| `Ctrl + Enter` | Submit Test | Opens confirmation dialog with uncompleted question summary |
| `Ctrl + Shift + F` | Fullscreen | Toggles distraction-free exam mode |
| `Tab` / `Shift+Tab` | Roving Focus | Strict logical DOM tabindex flow with zero focus trapping |

---

## 7. Implementation Blueprint & Ponytail Ultra Division of Labor

In accordance with `/ponytail` ultra, this feature requires **zero new dependencies**, reusing our proven architecture from `mediation-dossier.ts` and `acoustic-engine.ts`:

1. **Phyllis (`phyllis-mul1ur07`)** — **Lead UI/UX & Cockpit Engine Architect**:
   - Author [`web/src/ielts/modules/exam-cockpit.ts`](file:///E:/Eng/web/src/ielts/modules/exam-cockpit.ts).
   - Implement split layout, live word counter, question palette, and 4 contrast schemes in [`web/src/ielts/ielts.css`](file:///E:/Eng/web/src/ielts/ielts.css).
   - Author headless test suite [`web/scripts/verify-ielts-cockpit.cjs`](file:///E:/Eng/web/scripts/verify-ielts-cockpit.cjs).
2. **Jim (`jim-mul1meuh`)** — **Authentic Cambridge Prompt Curation**:
   - Curate 3 full 40-question Reading passages and Task 1/2 Writing prompts with exact mark schemes.
3. **Dwight (`dwight-mul1u508`)** — **Band Scoring & Progress Persistence**:
   - Connect question palette results to `StorageManager` and `bands.ts` calculation logic.
4. **Andy (`andy-mul1ug04`)** — **Cockpit Acoustic Timing & Speech Prompts**:
   - Wire 10m/5m warning chimes and Part 2 preparation countdown into `AcousticEngine`.
5. **Jimma (`jim-mum0qdlb`)** — **Verification Suite & Headless Browser QA**:
   - Run end-to-end headless browser tests and repack production desktop `app.asar`.

---

## 8. Verification & Acceptance Criteria

1. **Zero Layout Shift (CLS = 0.00)**: 100dvh lock with independent scroll containers.
2. **WCAG 2.2 AAA Invariants**: 100% of text and UI elements meet $\ge 7:1$ contrast across all 4 palettes. Minimum 44px touch envelopes.
3. **Autosave Reliability**: 100% state recovery from `localStorage` upon simulated page crash.
4. **Build Hygiene**: Vite compilation in $<3.5\text{s}$, zero TypeScript errors.

---
*Submitted for Whole-Floor Battle II evaluation by Phyllis (`phyllis-mul1ur07`).*
