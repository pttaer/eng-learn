# Mobile Layout Contract & Viewport Constraints

> **Authority:** Autonomous Overhaul Stream C  
> **Status:** Canonical & Active  
> **Mobile Target Viewports:** Small (320dp–360dp), Medium (375dp–390dp), Large (412dp–430dp).

---

## 1. Architectural Principles

1. **Zero-Scroll vs. Natural Scroll Classification:**
   - **Zero-Scroll Views:** Must fit exactly within 100vh / 100dvh without page-level vertical scrollbars. Content adapts to available space via flex scaling, fluid typography (`clamp()`), and adaptive node packing.
   - **Natural Scroll Views:** Views with extensive prose, long reading passages, or deep lesson cards scroll vertically (`overflow-y: auto`), declaring `--safe-bottom-dock: 84px` plus `env(safe-area-inset-bottom)` so content is never occluded by fixed bottom navigation docks.
2. **Breakpoints:** Base styles are mobile-first with exactly ONE breakpoint boundary at 768px (`max-width: 768px` for mobile, `width > 768px` for desktop/tablet).
3. **No Rigid Heights:** Zero hardcoded pixel heights (e.g. `height: 520px;`) on root view containers. Layout containers must use `flex: 1`, `min-height: 0`, and CSS dynamic viewport units (`100dvh`, `100svh`).
4. **Touch Target Flooring:** Interactive elements declare `min-height: 44px; min-width: 44px;`.
5. **Safe Inset Clearance:** Both left/right padding bind to `--pad-screen-left: 12px;` / `--pad-screen-right: 12px;` on mobile, scaling up to 24px on desktop.

---

## 2. Screen-by-Screen Layout Contract

| Route / Screen | View Name | Scroll Allowed | Viewport Strategy | Responsive Adaptation Mechanics |
|---|---|---|---|---|
| `#tree` | Constellation Skill Tree | **NO** (Zero-Scroll) | Fixed 100dvh Canvas Shell | Interactive SVG DAG with fluid viewBox. Panning/pinch-zoom enabled; nodes adapt radius with fluid text scaling (`clamp(11px, 1.8vw, 13px)`). No page scroll. |
| `#blitz` | Speed Blitz Challenge | **NO** (Zero-Scroll) | 100dvh Game Cockpit | Header HUD at top (44px), timer bar, centered challenge prompt, and stacked 2x2 or 4x1 option buttons fitting within remaining vertical space without scrolling. |
| `#cockpit` | CD-IELTS Exam Cockpit | **NO Viewport Scroll** (Internal Scroll) | 100dvh Dual-Split Workspace | Split container spans 100dvh. Left passage pane and right question pane declare independent `overflow-y: auto`. Top testbar and bottom navigation bar remain fixed. |
| `ielts.html#mock` | IELTS Full Mock Exam | **NO Viewport Scroll** (Internal Scroll) | 100dvh Exam Shell | Fixed header with countdown timer, split scrollable columns, fixed footer answer navigation grid. |
| `PlacementQuiz` | First-Run Diagnostic Modal | **NO** (Zero-Scroll per question) | 100dvh Floating Modal | Modal card flexes to viewport. Question prompt, options stack, and bottom action bar fit without outer page scroll. |
| `#read` | Intensive Reading Lab | **YES** (Natural Scroll) | Centered Column (max 760px) | Naturally scrollable prose. 4-pass collapsible cards with 16px padding. Sticky or inline audio playback bar. Safe bottom clearance (84px). |
| `#write` | Copywork Studio & Diff | **YES** (Natural Scroll) | Centered Column (max 760px) | Multi-step copywork card. Textarea auto-expands with min-height: 120px; diff comparison view scrolls naturally. |
| `#listen` | Acoustic Listening Chamber | **YES** (Natural Scroll) | Centered Column (max 760px) | Waveform visualizer, multi-accent cadence switcher, transcription exercise cards. |
| `#speak` | Speaking Studio & Examiner | **YES** (Natural Scroll) | Centered Column (max 760px) | Recording controls fixed/sticky; topic cue cards and assessment criteria cards scroll naturally. |
| `#vocab` | Vocabulary Dossier | **YES** (Natural Scroll) | Centered Column (max 760px) | AtomicCard review face + lexicon list. Table wrapped in horizontal scroll with `white-space: nowrap`. |
| `#colloc` | Collocation Forge | **YES** (Natural Scroll) | Centered Column (max 760px) | Filter chips horizontal scroll; collocation table scrollable horizontally; page scrolls vertically. |
| `#grammar` | Grammar Codex | **YES** (Natural Scroll) | Centered Column (max 760px) | Transformation console and interactive diff cards scroll naturally. |
| `#tenses` | Twelve Verb Tenses | **YES** (Natural Scroll) | Centered Column (max 760px) | Interactive tense timeline codex and gauntlet cards scroll naturally. |
| `#habits` | Mission Log & Daily Habits | **YES** (Natural Scroll) | Centered Column (max 760px) | Daily quest cards, streak multiplier, and habit tracker cards scroll naturally. |
| `#mediate` | CEFR Mediation Workbench | **YES** (Natural Scroll) | Centered Column (max 760px) | Source-to-target mediation translation workbench scrolls naturally. |
| `#analytics` | Progress & SERL Analytics | **YES** (Natural Scroll) | Centered Column (max 760px) | Trajectory charts and error rehabilitation gauntlet cards scroll naturally. |
| `#drills` | Attack Drills Lab | **YES** (Natural Scroll) | Centered Column (max 760px) | Interactive drill cards scroll naturally. |
| `#settings` | Settings Dossier | **YES** (Natural Scroll) | Centered Column (max 760px) | Toggle rows, volume sliders, profile import/export buttons scroll naturally with safe bottom dock clearance. |
| `ielts.html#home` | Academic Home Dashboard | **YES** (Natural Scroll) | Centered Column (max 760px) | Hero roadmap banner (~125px) balanced against card-as-button grid tiles (~170px) with 16px padding. |
| `ielts.html#diagnostic` | Band Score Diagnostic | **YES** (Natural Scroll) | Centered Column (max 760px) | Step-by-step diagnostic questionnaire with progress bar. |
| `ielts.html#reading` | Academic Reading Passages | **YES** (Natural Scroll) | Centered Column (max 760px) | Authentic academic reading passages with highlight toolbar and questions. |
| `ielts.html#reading-drills` | Reading Drills Lab | **YES** (Natural Scroll) | Centered Column (max 760px) | Split passage-question layout collapsing to single-column scroll on <=768px. |
| `ielts.html#listening` | Academic Listening Hub | **YES** (Natural Scroll) | Centered Column (max 760px) | Audio player HUD and question sets scroll naturally. |
| `ielts.html#listening-traps` | Listening Traps Lab | **YES** (Natural Scroll) | Centered Column (max 760px) | Trap scenario cards and audio deconstruction scroll naturally. |
| `ielts.html#writing` | Academic Writing Hub | **YES** (Natural Scroll) | Gold Standard Column (760px) | Canonical reference exemplar. Task 1 / Task 2 cards with 16px padding and 10px button radius. |
| `ielts.html#writing-studio` | Writing Architecture Studio | **YES** (Natural Scroll) | Centered Column (max 760px) | Scaffolded essay drafting steps scroll naturally. |
| `ielts.html#speaking` | Speaking Simulator Hub | **YES** (Natural Scroll) | Centered Column (max 760px) | Simulator cards and rubric breakdown scroll naturally. |
| `ielts.html#strategy` | Examiner Strategy Codex | **YES** (Natural Scroll) | Centered Column (max 760px) | Strategy tips, band descriptors, and scoring criteria scroll naturally. |

---

## 3. Resilience Standards on Narrow Viewports (320px–360px)

1. **Zero Horizontal Overflow:** Every element inside containers must observe `max-width: 100%; box-sizing: border-box; overflow-wrap: break-word;`.
2. **Horizontal Table Wrapping:** All data tables (Lexicon, Collocations, Divergence, Band Scorecard) must be enclosed in `.table-scroll-wrap` / `.ie-table-wrap` declaring `overflow-x: auto; -webkit-overflow-scrolling: touch;`.
3. **No Concentric Borders:** Bordered cards must never reside inside bordered surfaces; elevation tone shifts (`rgba(255,255,255,0.03)`) are used instead of nested strokes.
4. **Touch Target Clearance:** Vertical stacks maintain `gap: 12px` or `margin-top: 18px` to ensure dual-layer focus rings never collide with adjacent elements.

