# Battle Plan Pitch II: Spaced Error Rehabilitation Gauntlet (SERL 2.0), Native Analytics & Stress QA 3.0
**Initiative 31: Whole-Floor Plan Battle II (Contract ENG-104)**  
**Author:** JimMA (`jim-mum0qdlb`) — Quality Assurance, Verification & Compiler Architect  
**Target Standard:** IELTS 9-Band Descriptors & CEFR Companion Volume (2020)  
**Philosophy:** `/ponytail ultra` (YAGNI extremist, zero unrequested bloat, native stdlib/SVG, pure math verification)  
**Target File:** `docs/superpowers/plans/battle2/2026-10-12-plan-pitch-jimma.md`  
**Date:** 2026-10-12  

---

## Executive Summary

While Initiative 30 successfully deployed the 6-branch, 48-node Constellation DAG and interactive Mediation Workbench, our cognitive training architecture suffers from a critical structural deficiency: **learner errors remain dead ends**. When a candidate misinterprets a B2 reading distracter, drops a phonetic coda in acoustic speaking, or misplaces an inversion clause, existing systems mark it incorrect and discard the cognitive friction.

Furthermore, learners have no unified diagnostic feedback loop translating granular task performance into an authoritative **IELTS Band Trajectory** or multi-axial **CEFR Competency Radar**.

This proposal establishes **Three Invariant Cognitive & Quality Pillars**:

1. **Spaced Error Rehabilitation Gauntlet (SERL 2.0)**: A universal error ingestion pipeline converting mistakes across all 6 skills and CD-IELTS mocks into 3-stage adaptive micro-rehabilitation drills (Spot-the-Flaw $\rightarrow$ Scaffolded Repair $\rightarrow$ Generative Transfer) using an exponential memory decay schedule.
2. **Native SVG Learner Mastery Analytics Dashboard**: Zero-dependency, pure mathematical SVG rendering for a 6-axis CEFR Competency Radar and 30-day predictive IELTS Band Trajectory curves with 95% confidence bands.
3. **End-to-End Headless QA Suite 3.0**: Puppeteer test suite expansion (Tests 17, 18, 19) verifying full-length exam simulation, headless Web Audio synthesis fallbacks, and 100% offline air-gapped PWA resilience alongside 3 new automated invariant verification scripts (62/62 total passing suites).

---

## Ponytail Ultra Architecture Decisions

In strict conformance with `/ponytail ultra`, every component ruthlessly eliminates speculative abstractions, third-party runtime dependencies, and boilerplate:

```
┌──────────────────────────────────────┬──────────────────────────────────────┐
│ Traditional Over-Engineered Bloat   │ Ponytail Ultra Lean Equivalent       │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ Chart.js / D3.js (250KB+ gzip)       │ Native SVG <polygon> & <path> (2KB,  │
│ for Radar & Trajectory curves        │ 0 deps, 60 FPS, zero CLS)            │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ Heavy external NLP grammar parser    │ Deterministic Regex Tokenizer +      │
│ for error diagnosis                  │ Rule-indexed Error Taxonomy in JSON  │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ Multi-table relational IndexedDB     │ Atomic `errorLedger` array in        │
│ with async migration wrappers        │ `StorageManager` with O(1) key map   │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ Web Audio external soundfont lib     │ Native Web Audio API procedural      │
│ (5MB+ assets)                        │ oscillator chirps + AudioBuffer mocks│
└──────────────────────────────────────┴──────────────────────────────────────┘
```

> **Ponytail Summary:** Skipped external chart and audio libraries. All visualizations run on native inline SVG math ($O(1)$ CPU), state persists in existing atomic `StorageManager`, and all verification runs headless on pure Node stdlib assertions.

---

## 1. Spaced Error Rehabilitation Gauntlet (SERL 2.0)

### 1.1 Universal Error Ingestion Architecture
Any module—whether Franklin Copywork (`#write`), Acoustic Lab (`#speak`), CD-IELTS Mock (`#ielts`), or Mediation Workbench (`#mediate`)—emits a unified `ErrorEvent` that feeds directly into the central error ledger.

```
       [ Franklin Copywork ]     [ CD-IELTS Reading/Listening ]     [ Acoustic Prosody ]
                │                               │                           │
                └───────────────┬───────────────┴───────────────────────────┘
                                │
                                ▼
                   StorageManager.recordError()
                                │
                                ▼
                   ┌─────────────────────────┐
                   │   Global Error Ledger   │
                   │   (Bounded FIFO + SRS)  │
                   └────────────┬────────────┘
                                │
                                ▼
            SERL 2.0 Adaptive Micro-Drill Generator
          ┌─────────────────────┬─────────────────────┐
          │                     │                     │
          ▼                     ▼                     ▼
    Stage 1: Spot        Stage 2: Repair      Stage 3: Transfer
    (Flaw Isolation)     (Cloze / Rebuild)    (Timed Production)
```

### 1.2 Data Schema: `ErrorRecord`
```typescript
export type ErrorCategory = 
  | 'SYNTACTIC'            // Subject-verb agreement, inversion, tense sequencing
  | 'LEXICAL_COLLOCATION'  // Preposition mismatch, unnatural pairing, thesaurus trap
  | 'L1_INTERFERENCE'      // Vietnamese topic-comment transfer, pronoun omission
  | 'AUDITORY_DECODING'    // Missed connected speech, weak form, coda drop
  | 'PRAGMATIC_REGISTER'   // Blunt imperative, inappropriate tenor, lack of hedging
  | 'EXAM_STRATEGY';       // Time trap, skipped overview, over-word limit

export interface ErrorRecord {
  id: string;                      // sha256 short hash (source + prompt + timestamp)
  sourceModule: SkillId | 'ielts';  // 'grammar' | 'vocab' | 'reading' | 'writing' | 'speaking' | 'mediation' | 'ielts'
  category: ErrorCategory;
  cefrLevel: Cefr;                 // 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  ieltsBandEquivalent: number;     // e.g. 5.5, 6.5, 7.5
  prompt: string;                  // Original question or model target
  learnerInput: string;            // The erroneous learner attempt
  expectedOutput: string;          // Correct canonical token or phrasing
  explanation: string;             // Pedagogical remediation rule (concise)
  l1VietnameseTip?: string;        // Contrastive linguistic warning
  
  // SRS Spaced Rehabilitation Telemetry
  rehabStreak: number;             // Count of consecutive successful micro-drill solves (0 to 3)
  nextDueTimestamp: number;        // Epoch ms when error re-enters active Gauntlet
  intervalHours: number;           // Current spacing interval (e.g. 4h -> 24h -> 72h)
  lapseCount: number;              // Total historical failures on this specific pattern
  status: 'active' | 'graduated';  // Graduated after 3 consecutive clean rehabilitations
}
```

### 1.3 Mathematical Decay & Spacing Schedule
The rehabilitation schedule uses an **Aggressive Short-Interval Decay Model** designed to interrupt forgetting curves within the first 72 hours:

$$I_n = I_0 \times 2.5^{\text{rehabStreak}} \times \left(1.0 - 0.15 \times \min(3, \text{lapseCount})\right)$$

- **Base Interval ($I_0$)**: $4\text{ hours}$.
- **Progression**:
  - `Streak 0`: Due in **4 hours** (immediate reactivation on next session).
  - `Streak 1`: Due in **10 hours**.
  - `Streak 2`: Due in **25 hours** (~1 day).
  - `Streak 3`: **Graduated** ($\ge 3$ consecutive correct passes). Archived into durable mastery index.
- **Lapse Penalty**: If failed at any stage, `rehabStreak` resets to $0$, `lapseCount` increments by $1$, and item is scheduled for immediate re-test ($I = 1\text{ hour}$).

### 1.4 3-Stage Adaptive Micro-Drill Mechanics
Instead of presenting the original question (which only tests static recognition of the answer key), the Gauntlet constructs **dynamic three-tier recovery drills**:

1. **Stage 1: Spot the Flaw (Recognition)**
   - The learner is presented with 3–4 sentences or phonetic transcriptions containing the error.
   - Learner must click the exact token/clause causing the ungrammaticality or unnaturalness within 15 seconds.
2. **Stage 2: Scaffolded Contrastive Repair (Reconstruction)**
   - Minimal cloze slot targeting the exact failure point.
   - Interactive tokens provided with an anti-L1 contrastive hint (*"Chú ý: tiếng Anh bắt buộc dùng giới từ 'on', không dùng 'at' cho 'depend'"*).
3. **Stage 3: Generative Transfer (Production)**
   - New prompt with identical syntactic/lexical constraint but novel subject matter.
   - 30-second live typing input evaluated against Myers string distance and target token retention.

---

## 2. Learner Mastery Analytics Dashboard

### 2.1 Native SVG CEFR 6-Pillar Radar
A pure mathematical SVG `<polygon>` visualization requiring zero external libraries.

```
                        Speaking [C1]
                             (90, 15)
                                ▲
                               │
            Reading [B2]       │       Mediation [C1]
            (30, 40)  \        │        /  (150, 40)
                       \       │       /
                        \      │      /
                         \     │     /
                          \    │    /
                           \   │   /
                            \  │  /
                             \ │ /
                              \│/
         ──────────────────────┼───────────────────────
                              /│\
                             / │ \
                            /  │  \
                           /   │   \
                          /    │    \
                         /     │     \
                        /      │      \
            Grammar [C2]       │       Collocations [C1]
            (30, 140)          │       (150, 140)
                               ▼
                         Writing [B2]
                           (90, 165)
```

#### Trigonometric Coordinate Mapping:
Given center $(cx, cy) = (100, 100)$, radius $R = 80$, and 6 equiangular axes ($\theta_i = \frac{2\pi \cdot i}{6} - \frac{\pi}{2}$ for $i \in [0..5]$):
$$x_i = cx + R \times \left(\frac{\text{Mastery}_i}{100}\right) \times \cos(\theta_i)$$
$$y_i = cy + R \times \left(\frac{\text{Mastery}_i}{100}\right) \times \sin(\theta_i)$$

The resulting points form a smooth, responsive SVG polygon:
```html
<svg viewBox="0 0 200 200" class="cefr-radar-svg">
  <!-- Concentric Reference Polygons: A1, A2, B1, B2, C1, C2 -->
  <polygon points="..." class="radar-grid-tier" />
  <!-- Current Learner Mastery Polygon -->
  <polygon points="${pointsString}" class="radar-mastery-poly" />
  <!-- Target IELTS Band Overlay (e.g. Band 7.5 Benchmark) -->
  <polygon points="${targetPointsString}" class="radar-target-poly" />
</svg>
```

### 2.2 IELTS Band Trajectory Projection Curve
Predicts overall and component IELTS bands ($0.0 - 9.0$) based on calibrated mastery across the 6 branches combined with mock test velocity and error decay rates.

#### Calibrated Psychometric Band Estimator:
$$\text{Band}_{\text{estimated}} = \text{round}\left( 2.0 \times \left[ 4.0 + 5.0 \cdot \frac{1}{1 + e^{-0.045 \cdot (\bar{M} - 50)}} \right] \right) / 2.0$$

Where:
- $\bar{M} \in [0, 100]$ is the weighted aggregate mastery across all active CEFR branches:
  $$\bar{M} = 0.25 \cdot M_{\text{read}} + 0.25 \cdot M_{\text{write}} + 0.25 \cdot M_{\text{listen}} + 0.25 \cdot M_{\text{speak}}$$
- Output is strictly rounded to the nearest official half-band increment ($5.0, 5.5, 6.0, \dots, 9.0$).

#### SVG Trajectory Curve with Confidence Corridor:
The 30-day trajectory renders a continuous cubic Bézier path (`M x0 y0 C cp1x cp1y, ...`) alongside a shaded confidence region representing $\pm 0.5$ band error variance:

```
  Band
   9.0 ┤
   8.0 ┤                                        ╭───── Upper Bound (+0.5)
   7.5 ┤                              ╭─────────★ Target 7.5
   7.0 ┤                    ╭─────────╯
   6.5 ┤          ╭─────────╯ ░░░░░░░░░░░░░░░░░ ╰───── Lower Bound (-0.5)
   6.0 ┤  ╭───────╯ (Projected Trajectory)
   5.5 ┤──★ Current (Day 1)
   5.0 ┼──┬──────┬──────┬──────┬──────┬──────┬──────┬──
       0  5     10     15     20     25     30    Days
```

---

## 3. End-to-End Headless QA Suite 3.0

The automated verification pipeline expands to guarantee enterprise stability across exam workflows, audio hardware emulation, and network disconnections.

### 3.1 Puppeteer Test Matrix Expansion (`browser-qa-test.cjs`)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              HEADLESS BROWSER QA 3.0 TEST EXPANSION (TESTS 17–19)               │
├─────────┬──────────────────────────────────┬────────────────────────────────────┤
│ TEST    │ TARGET SURFACE                   │ INVARIANT VERIFICATION CRITERIA    │
├─────────┼──────────────────────────────────┼────────────────────────────────────┤
│ Test 17 │ Full CD-IELTS Mock Simulation    │ • 60-min timer countdown decrement │
│         │ (`#ielts` route)                 │ • Split-pane resizer drag events   │
│         │                                  │ • Question palette state syncing   │
│         │                                  │ • Auto-save on unmount / crash     │
├─────────┼──────────────────────────────────┼────────────────────────────────────┤
│ Test 18 │ Web Audio Synthesis & Hardware   │ • Mock AudioContext initialization │
│         │ Graceful Degradation             │ • AudioBuffer allocation bounds    │
│         │                                  │ • Zero uncaught rejections when mic│
│         │                                  │   or speaker permission is denied  │
├─────────┼──────────────────────────────────┼────────────────────────────────────┤
│ Test 19 │ 100% Offline PWA Air-Gap         │ • `page.setOfflineMode(true)`      │
│         │ Verification                     │ • Zero failed asset network requests│
│         │                                  │ • Full route traversal offline     │
│         │                                  │ • `localStorage` write persistence │
└─────────┴──────────────────────────────────┴────────────────────────────────────┘
```

#### Detailed Test 17: CD-IELTS Mock Simulator Flow
1. Navigates to `#ielts-mock-reading`.
2. Asserts split-screen container mounted (`.ielts-passage-pane` and `.ielts-question-pane`).
3. Simulates passage text highlighting and note bookmarking.
4. Completes 5 test items (True/False/Not Given, Heading Matching, Summary Fill).
5. Advances section; verifies answered status badges in navigation ribbon (`1..40`).
6. Enforces time-out simulation: verifies modal lock and auto-scoring emission.
7. Emits visual screenshot: `web/screenshots/16-cd-ielts-mock-sim.png`.

#### Detailed Test 18: Headless Audio Synthesis & DSP Fallback
1. Overrides `window.AudioContext` in browser context with strict telemetry wrapper.
2. Triggers acoustic prosody rehearsal and feedback chimes.
3. Asserts sample rate standard ($44.1\text{kHz}$ or $48\text{kHz}$) and channel count $\le 2$.
4. Simulates microphone access failure (`NotAllowedError`): verifies UI immediately switches to visual waveform fallback without runtime exceptions.
5. Emits visual screenshot: `web/screenshots/17-audio-dsp-fallback.png`.

#### Detailed Test 19: Offline State & PWA Resilience
1. Navigates to root `#tree`.
2. Executes `await page.setOfflineMode(true)`.
3. Traverses across all 9 views (`#tree`, `#write`, `#read`, `#speak`, `#vocab`, `#colloc`, `#grammar`, `#habits`, `#analytics`).
4. Answers a SERL micro-drill; asserts local state updates and event triggers without network socket errors.
5. Re-enables online mode; verifies telemetry synchronization queue is non-destructive.
6. Emits visual screenshot: `web/screenshots/18-offline-pwa-airgap.png`.

---

## 4. Automated Verification Test Suite Expansion (62/62 Target)

The master test runner `web/scripts/run-verify.cjs` currently executes 59 test suites. Three new zero-flake static/algorithmic suites will be introduced to reach **62/62 verified suites**:

### 4.1 Suite 1: `verify-serl-engine.cjs`
- **Schema Parity**: Asserts every `ErrorRecord` contains valid `id`, `category`, `cefrLevel`, and non-empty remediation tips.
- **Decay Mathematics**: Simulates 1,000 randomized error events and verifies intervals conform strictly to $[4\text{h}, 72\text{h}]$ bounds.
- **Graduation Invariant**: Formally asserts that any record reaching `rehabStreak === 3` transitions to `status: 'graduated'` and never resurfaces in active queues.
- **Lapse Reset Invariant**: Asserts that a single failure at `rehabStreak === 2` resets streak to 0 and increments lapse count.

### 4.2 Suite 2: `verify-analytics-dashboard.cjs`
- **Trigonometric Precision**: Asserts radar polygon coordinates are within valid SVG viewBox $[0, 200] \times [0, 200]$ with zero `NaN` or subpixel overflows.
- **Band Projection Bounding**: Validates that all estimated IELTS bands map strictly to $[0.0, 9.0]$ on standard 0.5-step boundaries across all permutations of CEFR masteries $[0, 100]$.
- **Zero CLS Geometry**: Asserts radar and trajectory SVG containers specify explicit `viewBox` and `aspect-ratio` to prevent layout reflow.

### 4.3 Suite 3: `verify-offline-manifest.cjs`
- **Asset Self-Containment**: Scans compiled `dist/` bundle to ensure **0 external CDN references** (`https://cdnjs`, `https://fonts.googleapis.com`, etc.).
- **Local Audio Fallbacks**: Verifies fallback tone generation uses Web Audio synth oscillators instead of remote MP3 audio streams.
- **Storage Budget Check**: Verifies default initialized state is under $150\text{KB}$, well below the standard $5\text{MB}$ `localStorage` quota.

---

## 5. Comparative Evaluation: Battle II Floor Matrix

| Evaluation Vector | Status Quo (Initiative 30) | Rival Pitch (Jim / ENG-100) | **JimMA Architecture (ENG-104)** |
|---|---|---|---|
| **Error Handling** | Transient errors; discarded after drill | Static error lists without spaced decay | **SERL 2.0 Spaced Rehabilitation**: 3-stage adaptive micro-drills with exponential memory decay |
| **Learner Analytics** | Raw numerical % per skill | Tabular IELTS band lists | **Dual Native Visualizations**: 6-axis CEFR Radar + 30-day IELTS Band Trajectory curve |
| **Dependency Footprint** | Zero external charting libraries | Risk of bundling chart libs or external NLP | **100% Native SVG & Web APIs**: 0 npm dependencies added, 0 runtime bundle overhead |
| **Verification Depth** | 59 test suites | Pedagogical review | **62 Rigorous Test Suites**: Formal math invariants, deterministic interval tests, offline air-gap proofs |
| **End-to-End Headless QA** | 16 Puppeteer tests | No automated browser test plan | **19 Comprehensive E2E Tests**: Full CD-IELTS simulation, Web Audio DSP fallback, offline PWA validation |
| **Philosophy Alignment** | Standard feature delivery | `/caveman ultra` | **`/ponytail ultra`**: YAGNI extremist, shortest diff, maximum reuse of existing engine patterns |

---

## 6. Implementation Rollout Plan

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          FOUR-PHASE EXECUTION ROADMAP                           │
├───────────────────┬─────────────────────────────────────────────────────────────┤
│ Phase 1: Core     │ • Author `web/src/core/serl-engine.ts` with error ledger    │
│ Engine & Ledger   │ • Wire `recordError()` across Writing, Collocations, IELTS  │
│ (Est: 20 min)     │ • Author `web/scripts/verify-serl-engine.cjs`               │
├───────────────────┼─────────────────────────────────────────────────────────────┤
│ Phase 2: Analytics│ • Build `web/src/modules/analytics-dossier.ts`              │
│ & Visualizations  │ • Implement zero-dep SVG Radar & Band Trajectory generator  │
│ (Est: 25 min)     │ • Author `web/scripts/verify-analytics-dashboard.cjs`       │
├───────────────────┼─────────────────────────────────────────────────────────────┤
│ Phase 3: Headless │ • Update `web/scripts/browser-qa-test.cjs` (Tests 17–19)    │
│ QA 3.0 Harness    │ • Validate full CD-IELTS, Audio, and Offline airgap tests   │
│ (Est: 25 min)     │ • Author `web/scripts/verify-offline-manifest.cjs`          │
├───────────────────┼─────────────────────────────────────────────────────────────┤
│ Phase 4: Build &  │ • Run master suite `run-verify.cjs` (62/62 passing)         │
│ Verification      │ • Verify production Vite build & desktop ASAR integrity     │
│ (Est: 15 min)     │ • Deliver final QA report to Floor                          │
└───────────────────┴─────────────────────────────────────────────────────────────┘
```

---

## 7. Conclusion & Floor Recommendation

A learning platform's efficacy is measured not by how well it delivers new content, but by **how reliably it rehabilitates learner failure**. The **Spaced Error Rehabilitation Gauntlet (SERL 2.0)** transforms every mistake into permanent cognitive engrams, while the **Native Analytics Dashboard** provides clear, motivating progress visualization without incurring a single byte of third-party charting bloat.

Paired with our **End-to-End Headless QA Suite 3.0 (62/62 suites, 19 Puppeteer tests)**, this proposal delivers the most mathematically rigorous, resilient, and lightweight foundation for Whole-Floor Battle II.

I recommend the floor adopt this proposal for execution.
