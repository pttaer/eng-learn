# Design Specification: Acoustic & Voice Intelligence Studio (Pillar 04)

**Status:** Approved & Ready for Implementation Planning  
**Target Module:** [`web/src/modules/speaking-dossier.ts`](file:///E:/Eng/web/src/modules/speaking-dossier.ts)  
**Author:** Michael (`god`) & The Hive Fleet  
**Date:** 2026-09-29  
**Specification Key:** `ENG-SPEC-SPEAK-ACOUSTIC`  

---

## 1. Overview & Pedagogical Objectives

Pillar 04 currently implements Paul Nation's 4-3-2 Fluency Technique with a circular countdown timer, prompt cards, and a basic microphone volume analyser. This specification upgrades Pillar 04 into a **Comprehensive Hybrid Audio Studio** that combines:
1. **Acoustic Signal Processing (DSP)**: High-resolution time-domain autocorrelation for Fundamental Frequency ($F_0$ pitch in Hz), Root-Mean-Square (RMS) energy envelope, and silence/hesitation detection.
2. **Dual-Track Comparative Oscilloscope**: Side-by-side visual and auditory comparison between native speaker benchmarks and student takes.
3. **Automated Target Collocation Spotting**: Real-time keyword phrase spotting via the Web Speech API that detects whether required collocations are voiced during the drill.
4. **4-3-2 Cognitive Compression Matrix**: Objective round-over-round metrics (speaking rate, silence ratio, collocation activation) proving fluency automation as time drops from 4 to 3 to 2 minutes.

---

## 2. System Architecture & Components

```
+---------------------------------------------------------------------------------+
|                                 SPEAKING DOSSIER                                |
|                        (Pillar 04 Cockpit & State Machine)                      |
+------------------------+--------------------------------+-----------------------+
                         |                                |
                         v                                v
+----------------------------------------+ +--------------------------------------+
|            ACOUSTIC ENGINE             | |         COLLOCATION SPOTTER          |
|  (`web/src/core/acoustic-engine.ts`)   | | (`web/src/core/collocation-spotter.ts`)|
+----------------------------------------+ +--------------------------------------+
| - AudioContext & MediaStream lifecycle | | - SpeechRecognition lifecycle        |
| - MediaRecorder memory buffer (Blob)   | | - Continuous interim/final stream    |
| - Time-Domain Autocorrelation (F0 Hz)  | | - Lemma & n-gram phrase matching     |
| - Energy RMS & Silence Thresholding    | | - Real-time `onSpot` callback event  |
| - Dual-track A/B playback controls     | | - 100% graceful offline degradation  |
+----------------------------------------+ +--------------------------------------+
```

### Component Breakdown
1. **`AcousticEngine` (`web/src/core/acoustic-engine.ts`)**:
   - Manages audio hardware input via `navigator.mediaDevices.getUserMedia`.
   - Records takes into memory via `MediaRecorder` encoded as `audio/webm;codecs=opus` (with fallback to default audio MIME).
   - Computes vocal pitch contour ($F_0$) on rolling 1024-sample windows using time-domain autocorrelation.
   - Computes RMS volume envelope and segments audio into speech vs. hesitation ($> 250\text{ms}$ silence).
   - Provides audio playback instances for both native exemplar and student take.

2. **`CollocationSpotter` (`web/src/core/collocation-spotter.ts`)**:
   - Manages `SpeechRecognition` / `webkitSpeechRecognition` stream during active recording.
   - Parses target collocations from prompt metadata into normalized n-grams.
   - Performs fuzzy matching (Levenshtein distance $\le 1$ per word) on incoming speech tokens.
   - Emits `onCollocationSpotted(phrase: string, timestamp: number)` events when detected.
   - If browser lacks speech recognition or runs offline, degrades seamlessly into manual interactive toggle chips.

3. **`SpeakingDossier` (`web/src/modules/speaking-dossier.ts`)**:
   - Hosts the Nation 4-3-2 state machine (15s mental anchor $\rightarrow$ Round 1 [4m] $\rightarrow$ Round 2 [3m] $\rightarrow$ Round 3 [2m]).
   - Renders the dual-trace canvas oscilloscope, collocation radar chips, and post-take A/B playback strip.
   - Populates the card back face with the 3-round compression comparison table, prosodic check, and SM-2 rating buttons.

---

## 3. Data Contracts & Interfaces

```typescript
export interface AcousticAnalysis {
  durationSeconds: number;
  pitchSamples: number[];      // F0 pitch contour in Hz (80Hz to 400Hz)
  energySamples: number[];     // RMS energy envelope (normalized 0.0 to 1.0)
  meanPitchHz: number;         // Average fundamental frequency during voiced frames
  totalSpeechSeconds: number;  // Cumulative active vocalization duration
  totalSilenceSeconds: number; // Cumulative hesitation / pause duration (gaps >= 250ms)
  silenceRatio: number;        // totalSilenceSeconds / durationSeconds
  audioBlob: Blob;             // Compressed student audio take
  audioUrl: string;            // Object URL for browser playback
}

export interface CollocationSpotStatus {
  phrase: string;              // Target phrase (e.g. "take into account")
  spotted: boolean;            // Whether confirmed by voice recognition
  timestampSec?: number;       // Time offset in seconds when phrase was spoken
}

export interface RoundPerformance {
  roundIdx: number;            // 0 = 4 min, 1 = 3 min, 2 = 2 min
  allocatedSeconds: number;    // 240, 180, 120
  actualSeconds: number;       // Elapsed speaking duration
  silenceRatio: number;        // Proportion of pauses
  spottedCollocations: number; // Count of target collocations successfully voiced
  totalCollocations: number;   // Total target collocations for prompt
  analysis?: AcousticAnalysis;
}

export interface SpeakingSessionState {
  promptId: string;
  currentRoundIdx: number;     // 0, 1, 2
  rounds: RoundPerformance[];
  completed: boolean;
}
```

---

## 4. Digital Signal Processing (DSP) Mathematical Pipeline

### 4.1 Vocal Pitch Tracking ($F_0$) via Time-Domain Autocorrelation
For vocal fundamental frequencies between $80\text{ Hz}$ and $400\text{ Hz}$ at sampling rate $f_s$:
$$\tau_{\min} = \left\lfloor \frac{f_s}{400} \right\rfloor, \quad \tau_{\max} = \left\lfloor \frac{f_s}{80} \right\rfloor$$

For an audio window $x$ of length $N = 1024$:
$$R(\tau) = \sum_{i=0}^{N-\tau-1} x[i] \cdot x[i + \tau]$$

To achieve sub-sample precision without high computational overhead, 3-point parabolic interpolation is applied to the maximal correlation peak $\tau^*$:
$$\tau_{\text{exact}} = \tau^* + \frac{R(\tau^* - 1) - R(\tau^* + 1)}{2 \cdot [R(\tau^* - 1) - 2R(\tau^*) + R(\tau^* + 1)]}$$

$$F_0 = \frac{f_s}{\tau_{\text{exact}}}$$

**Voicing Decision**: If normalized cross-correlation peak $r(\tau^*) < 0.65$ or signal $\text{RMS} < 0.015$, the frame is deemed unvoiced (e.g., fricative, aspiration, or background noise), and $F_0 = 0$.

### 4.2 Energy RMS & Hesitation Tracking
$$\text{RMS} = \sqrt{\frac{1}{N} \sum_{i=0}^{N-1} x[i]^2}$$

- Any contiguous block of frames with $\text{RMS} < 0.02$ persisting for $\ge 250\text{ms}$ is counted as a **Hesitation Gap**.
- The ratio of silence to total speaking time tracks cognitive fluency:
  $$\text{SilenceRatio} = \frac{\text{TotalSilenceDuration}}{\text{TotalTakeDuration}}$$

---

## 5. UI/UX & Interaction Architecture

### 5.1 Front Face: Live Studio Cockpit
1. **Header HUD**: Prompt category, CEFR rating, and active Nation round indicator (`ROUND 1 OF 3 [4 MIN]`).
2. **Prompt & 15s Mental Anchor**: Key question, semantic trigger, and 15-second planning hint.
3. **Collocation Radar Strip**: Real-time chips for each target collocation:
   - Initial state: `[  ] raise concerns` (hairline dashed border).
   - Activated state: `[✓] RAISE CONCERNS` (solid high-contrast black fill + `absorb` audio chime).
4. **Dual-Trace Oscilloscope Canvas** ($240\text{px} \times 96\text{px}$, responsive):
   - **Track 1 (Native Exemplar):** Benchmark intonation and rhythm curve generated from synthesized speech.
   - **Track 2 (Student Take):** Live green-room oscilloscope during recording; converts to pitch contour post-take.
5. **Post-Take Audio Strip (Between Rounds)**:
   - Appears immediately upon take completion.
   - Dual replay buttons: `[ ▶ EXEMPLAR ]` and `[ ▶ YOUR TAKE ]` with synchronized playback playhead.
   - Delivery Telemetry: Elapsed time, silence %, collocations activated.
   - Progression trigger: `[ ADVANCE TO ROUND 2 (3 MIN) → ]`.

### 5.2 Back Face: 3-Round Compression Matrix & Scoring
1. **Nation 4-3-2 Performance Ledger**:

| Round | Allotted | Time Spoken | Silence % | Collocations Activated |
| :--- | :--- | :--- | :--- | :--- |
| **Round 1** | `4:00` | `3:44` | `24%` | 3 / 3 |
| **Round 2** | `3:00` | `2:51` | `15%` | 3 / 3 |
| **Round 3** | `2:00` | `1:56` | `8%` *(Peak Fluency)* | 3 / 3 |

2. **Phonetic & Prosodic Diagnostic Checklist**:
   - Nuclear stress analysis.
   - IPA segmental friction points.
3. **SRS Rating Bar**:
   - `[ 1: AGAIN ]` / `[ 2: GOOD ]` buttons updating card intervals in browser storage.

---

## 6. Defensive Boundaries & Error Handling

1. **Microphone Access Denied**:
   - If `getUserMedia` rejects or throws `NotAllowedError`:
   - Display non-blocking HUD indicator: `[MIC UNAVAILABLE // PROCEDURAL AUDIO MODE]`.
   - 4-3-2 countdown timer and native exemplar playback remain 100% operational.
2. **Speech Recognition Support**:
   - If `SpeechRecognition` is missing or fails (offline/unsupported browser):
   - `CollocationSpotter` silently defaults to manual interactive toggle chips.
   - Zero console runtime exceptions thrown.
3. **Resource Lifecycle & Memory Hygiene**:
   - Active `MediaStream` tracks are stopped (`track.stop()`) on route navigation or prompt changes.
   - Audio Object URLs (`URL.createObjectURL`) are revoked (`URL.revokeObjectURL`) when leaving the card to prevent memory leaks during marathon study sessions.

---

## 7. Verification & Testing Strategy

1. **DSP Algorithmic Test Suite (`web/scripts/verify-acoustic-dsp.cjs`)**:
   - Synthesizes pure sine waves at 120 Hz, 220 Hz, and 330 Hz.
   - Validates that `AcousticEngine` autocorrelation resolves fundamental frequency within $\pm 2\text{ Hz}$.
   - Tests silence threshold detector with quiet vs. speech frames.
2. **TypeScript Compilation & Production Bundle**:
   - Execute `npm run build` (`tsc && vite build`) to confirm zero compilation errors.
3. **PWA Offline Verification**:
   - Confirm that all DSP calculations and audio playback run offline without network connectivity.
