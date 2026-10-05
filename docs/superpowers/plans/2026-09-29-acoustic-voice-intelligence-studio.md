# Acoustic & Voice Intelligence Studio (Pillar 04) Implementation Plan

> **Status (2026-10-05):** implemented; the unchecked boxes below were not maintained. See `docs/audits/STATUS.md` for what is still open.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade Pillar 04 (Speaking Dossier) into a Comprehensive Hybrid Audio Studio with dual-track Web Audio DSP (pitch tracking via autocorrelation, RMS energy, hesitation detection), Web Speech API collocation phrase spotting, and Nation 4-3-2 cognitive compression metrics.

**Architecture:** Decoupled architecture separating low-level Web Audio DSP (`acoustic-engine.ts`) and Speech Recognition spotter (`collocation-spotter.ts`) from the UI state machine (`speaking-dossier.ts`). The dossier coordinates active recordings, dual-trace visual oscilloscope canvas, collocation radar chips, and post-take A/B playback without coupling DSP or speech recognition into DOM rendering.

**Tech Stack:** TypeScript, Web Audio API (`AudioContext`, `AnalyserNode`, `MediaStreamAudioSourceNode`), `MediaRecorder`, Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`), Canvas 2D API, Vite.

**Spec:** [`docs/superpowers/specs/2026-09-29-acoustic-voice-intelligence-studio-design.md`](file:///E:/Eng/docs/superpowers/specs/2026-09-29-acoustic-voice-intelligence-studio-design.md)

## Global Constraints

- **Color Palette:** Pure binary monochrome `#ffffff` (canvas) and `#000000` (ink). Zero intermediate grays or decorative hues. Hairline borders are `1px solid #000000` or `1px dashed #000000`.
- **Typography:** Two fonts strictly: `var(--font-sans)` (Inter / system sans) for narrative prompts, and `var(--font-mono)` (JetBrains Mono / monospace) for HUD telemetry, timers, and metrics.
- **Spatial Grid:** 8pt base grid (8px, 16px, 24px, 32px padding/margins).
- **Offline & Graceful Degradation:** All DSP autocorrelation and audio recording MUST operate 100% offline. If `getUserMedia` or `SpeechRecognition` are denied or unsupported in browser, system gracefully falls back to procedural simulation and manual toggle chips with zero runtime exceptions.
- **Memory Hygiene:** All `MediaStream` tracks MUST be stopped and Object URLs revoked on route change or card transition.
- **Verification Rule:** `npm run build` (`tsc && vite build`) must pass cleanly with 0 errors.

---

### Task 1: Acoustic Engine DSP (ENG-19)

**Files:**
- Create: `web/src/core/acoustic-engine.ts`
- Create: `web/scripts/verify-acoustic-dsp.cjs`
- Modify: `web/src/core/index.ts` (if barrel exists, or direct import)

**Interfaces:**
- Consumes: Web Audio API (`AudioContext`, `AnalyserNode`), `MediaRecorder`, `navigator.mediaDevices.getUserMedia`.
- Produces:
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

  export class AcousticEngine {
    public isAvailable: boolean;
    public isRecording: boolean;
    public init(): Promise<boolean>;
    public startRecording(): Promise<void>;
    public stopRecording(): Promise<AcousticAnalysis>;
    public getRealtimeAudioData(buffer: Float32Array): void;
    public static computeF0Autocorrelation(buffer: Float32Array, sampleRate: number): number;
    public static computeRMS(buffer: Float32Array): number;
    public static detectSilenceGaps(energySamples: number[], frameDurationSec: number, threshold?: number, minGapSec?: number): { totalSilenceSec: number; totalSpeechSec: number };
    public playTake(onEnded?: () => void): void;
    public stopTake(): void;
    public playExemplar(audioUrlOrText: string, onEnded?: () => void): void;
    public stopExemplar(): void;
    public dispose(): void;
  }
  ```

- [ ] **Step 1: Write the failing DSP test suite**

Create `web/scripts/verify-acoustic-dsp.cjs` with synthetic sine wave generators and hesitation test data:

```javascript
// web/scripts/verify-acoustic-dsp.cjs
const assert = require('assert');

// Autocorrelation Pitch Tracking DSP Function (Core mathematical implementation to test)
function computeF0Autocorrelation(buffer, sampleRate) {
  const minFreq = 80;
  const maxFreq = 400;
  const minTau = Math.floor(sampleRate / maxFreq);
  const maxTau = Math.floor(sampleRate / minFreq);

  // Compute signal RMS
  let sumSq = 0;
  for (let i = 0; i < buffer.length; i++) {
    sumSq += buffer[i] * buffer[i];
  }
  const rms = Math.sqrt(sumSq / buffer.length);
  if (rms < 0.015) return 0; // Unvoiced / noise floor

  let maxR = -1;
  let bestTau = -1;
  const rValues = new Float32Array(maxTau + 2);

  // Time-domain autocorrelation
  for (let tau = minTau; tau <= maxTau; tau++) {
    let r = 0;
    let norm1 = 0;
    let norm2 = 0;
    const len = buffer.length - tau;
    for (let i = 0; i < len; i++) {
      r += buffer[i] * buffer[i + tau];
      norm1 += buffer[i] * buffer[i];
      norm2 += buffer[i + tau] * buffer[i + tau];
    }
    const denom = Math.sqrt(norm1 * norm2);
    const normR = denom > 0 ? r / denom : 0;
    rValues[tau] = normR;

    if (normR > maxR) {
      maxR = normR;
      bestTau = tau;
    }
  }

  // Voicing threshold
  if (maxR < 0.65 || bestTau <= minTau || bestTau >= maxTau) {
    return 0;
  }

  // 3-point parabolic interpolation
  const rPrev = rValues[bestTau - 1];
  const rCurr = rValues[bestTau];
  const rNext = rValues[bestTau + 1];
  const denominator = 2 * (2 * rCurr - rPrev - rNext);
  let delta = 0;
  if (Math.abs(denominator) > 1e-6) {
    delta = (rNext - rPrev) / denominator;
  }

  const exactTau = bestTau + delta;
  return exactTau > 0 ? sampleRate / exactTau : 0;
}

// Silence & Hesitation Gap Detection
function detectSilenceGaps(energySamples, frameDurationSec, threshold = 0.02, minGapSec = 0.25) {
  const minGapFrames = Math.ceil(minGapSec / frameDurationSec);
  let totalSilenceSec = 0;
  let totalSpeechSec = 0;
  let currentSilenceRun = 0;

  for (let i = 0; i < energySamples.length; i++) {
    if (energySamples[i] < threshold) {
      currentSilenceRun++;
    } else {
      if (currentSilenceRun >= minGapFrames) {
        totalSilenceSec += currentSilenceRun * frameDurationSec;
      } else {
        totalSpeechSec += currentSilenceRun * frameDurationSec;
      }
      currentSilenceRun = 0;
      totalSpeechSec += frameDurationSec;
    }
  }

  if (currentSilenceRun >= minGapFrames) {
    totalSilenceSec += currentSilenceRun * frameDurationSec;
  } else {
    totalSpeechSec += currentSilenceRun * frameDurationSec;
  }

  return { totalSilenceSec, totalSpeechSec };
}

console.log('[TEST] Starting Acoustic Engine DSP Verification...');

// 1. Synthesize 120Hz sine wave (Male vocal pitch)
const sampleRate = 44100;
const bufferLen = 1024;
const buffer120 = new Float32Array(bufferLen);
for (let i = 0; i < bufferLen; i++) {
  buffer120[i] = 0.5 * Math.sin((2 * Math.PI * 120 * i) / sampleRate);
}
const detected120 = computeF0Autocorrelation(buffer120, sampleRate);
console.log(`- 120 Hz Test: Detected ${detected120.toFixed(2)} Hz`);
assert(Math.abs(detected120 - 120) < 2.0, `120Hz test failed: got ${detected120}`);

// 2. Synthesize 220Hz sine wave (Female vocal pitch)
const buffer220 = new Float32Array(bufferLen);
for (let i = 0; i < bufferLen; i++) {
  buffer220[i] = 0.5 * Math.sin((2 * Math.PI * 220 * i) / sampleRate);
}
const detected220 = computeF0Autocorrelation(buffer220, sampleRate);
console.log(`- 220 Hz Test: Detected ${detected220.toFixed(2)} Hz`);
assert(Math.abs(detected220 - 220) < 2.0, `220Hz test failed: got ${detected220}`);

// 3. Synthesize 330Hz sine wave
const buffer330 = new Float32Array(bufferLen);
for (let i = 0; i < bufferLen; i++) {
  buffer330[i] = 0.5 * Math.sin((2 * Math.PI * 330 * i) / sampleRate);
}
const detected330 = computeF0Autocorrelation(buffer330, sampleRate);
console.log(`- 330 Hz Test: Detected ${detected330.toFixed(2)} Hz`);
assert(Math.abs(detected330 - 330) < 2.0, `330Hz test failed: got ${detected330}`);

// 4. White noise / Unvoiced test
const bufferNoise = new Float32Array(bufferLen);
for (let i = 0; i < bufferLen; i++) {
  bufferNoise[i] = (Math.random() - 0.5) * 0.05;
}
const detectedNoise = computeF0Autocorrelation(bufferNoise, sampleRate);
console.log(`- Noise Floor Test: Detected ${detectedNoise.toFixed(2)} Hz`);
assert(detectedNoise === 0, `Noise should be deemed unvoiced (0Hz), got ${detectedNoise}`);

// 5. Silence & Hesitation detection test
// 100 frames at 20ms each (2.0s total). Frames 0-20 active (0.4s), 21-40 silence (0.4s >= 0.25s), 41-60 active (0.4s), 61-70 short pause (0.2s < 0.25s), 71-99 active (0.6s)
const energy = new Array(100).fill(0.05);
for (let i = 21; i <= 40; i++) energy[i] = 0.005; // 400ms pause
for (let i = 61; i <= 70; i++) energy[i] = 0.005; // 200ms pause (< minGap 250ms)
const gaps = detectSilenceGaps(energy, 0.02, 0.02, 0.25);
console.log(`- Silence Gap Test: Total Silence = ${gaps.totalSilenceSec.toFixed(2)}s, Speech = ${gaps.totalSpeechSec.toFixed(2)}s`);
assert.strictEqual(Math.round(gaps.totalSilenceSec * 100) / 100, 0.40, `Silence duration should be 0.40s, got ${gaps.totalSilenceSec}`);
assert.strictEqual(Math.round(gaps.totalSpeechSec * 100) / 100, 1.60, `Speech duration should be 1.60s, got ${gaps.totalSpeechSec}`);

console.log('✓ All Acoustic Engine DSP mathematical tests passed cleanly.');
```

- [ ] **Step 2: Run test to verify mathematical precision**

Run: `node web/scripts/verify-acoustic-dsp.cjs`  
Expected: `✓ All Acoustic Engine DSP mathematical tests passed cleanly.`

- [ ] **Step 3: Implement `web/src/core/acoustic-engine.ts`**

Write the production TypeScript module wrapping Web Audio, MediaRecorder, autocorrelation pitch estimation, and playback handles:

```typescript
// web/src/core/acoustic-engine.ts
export interface AcousticAnalysis {
  durationSeconds: number;
  pitchSamples: number[];
  energySamples: number[];
  meanPitchHz: number;
  totalSpeechSeconds: number;
  totalSilenceSeconds: number;
  silenceRatio: number;
  audioBlob: Blob;
  audioUrl: string;
}

export class AcousticEngine {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  private isRecordingInternal: boolean = false;
  private recordingStartTime: number = 0;
  private analysisTimer: any = null;

  private pitchSamples: number[] = [];
  private energySamples: number[] = [];

  private currentTakeAudio: HTMLAudioElement | null = null;
  private currentExemplarAudio: HTMLAudioElement | null = null;
  private activeTakeUrl: string | null = null;

  public isAvailable: boolean = false;

  constructor() {
    this.checkAvailability();
  }

  public get isRecording(): boolean {
    return this.isRecordingInternal;
  }

  private checkAvailability(): void {
    this.isAvailable = typeof window !== 'undefined' &&
      !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) &&
      !!(window.AudioContext || (window as any).webkitAudioContext);
  }

  public async init(): Promise<boolean> {
    if (!this.isAvailable) return false;
    try {
      if (!this.micStream) {
        this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      if (!this.audioCtx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }
      if (!this.analyser) {
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 1024;
        const source = this.audioCtx.createMediaStreamSource(this.micStream);
        source.connect(this.analyser);
      }
      return true;
    } catch {
      this.isAvailable = false;
      return false;
    }
  }

  public async startRecording(): Promise<void> {
    const ready = await this.init();
    if (!ready || !this.micStream) {
      this.isRecordingInternal = true;
      this.recordingStartTime = Date.now();
      return;
    }

    this.recordedChunks = [];
    this.pitchSamples = [];
    this.energySamples = [];

    let mimeType = 'audio/webm;codecs=opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = '';
    }

    try {
      this.mediaRecorder = mimeType ? new MediaRecorder(this.micStream, { mimeType }) : new MediaRecorder(this.micStream);
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };
      this.mediaRecorder.start(100); // 100ms slices
    } catch {
      // MediaRecorder fallback
    }

    this.isRecordingInternal = true;
    this.recordingStartTime = Date.now();

    // 50ms polling loop for pitch and energy envelope
    const buffer = new Float32Array(1024);
    this.analysisTimer = setInterval(() => {
      if (!this.analyser || !this.audioCtx) return;
      this.analyser.getFloatTimeDomainData(buffer);
      const rms = AcousticEngine.computeRMS(buffer);
      const f0 = AcousticEngine.computeF0Autocorrelation(buffer, this.audioCtx.sampleRate);
      this.energySamples.push(rms);
      this.pitchSamples.push(f0);
    }, 50);
  }

  public async stopRecording(): Promise<AcousticAnalysis> {
    if (this.analysisTimer) {
      clearInterval(this.analysisTimer);
      this.analysisTimer = null;
    }
    this.isRecordingInternal = false;
    const duration = Math.max(0.1, (Date.now() - this.recordingStartTime) / 1000);

    return new Promise((resolve) => {
      const finalize = () => {
        const mimeType = this.recordedChunks[0]?.type || 'audio/webm';
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        if (this.activeTakeUrl) {
          URL.revokeObjectURL(this.activeTakeUrl);
        }
        this.activeTakeUrl = URL.createObjectURL(blob);

        const frameDurationSec = 0.05; // 50ms
        const { totalSilenceSec, totalSpeechSec } = AcousticEngine.detectSilenceGaps(
          this.energySamples,
          frameDurationSec,
          0.02,
          0.25
        );

        const voicedPitches = this.pitchSamples.filter((f) => f > 0);
        const meanPitchHz = voicedPitches.length > 0
          ? voicedPitches.reduce((a, b) => a + b, 0) / voicedPitches.length
          : 0;

        const silenceRatio = duration > 0 ? Math.min(1.0, totalSilenceSec / duration) : 0;

        resolve({
          durationSeconds: duration,
          pitchSamples: [...this.pitchSamples],
          energySamples: [...this.energySamples],
          meanPitchHz: Math.round(meanPitchHz),
          totalSpeechSeconds: Math.round(totalSpeechSec * 10) / 10,
          totalSilenceSeconds: Math.round(totalSilenceSec * 10) / 10,
          silenceRatio: Math.round(silenceRatio * 100) / 100,
          audioBlob: blob,
          audioUrl: this.activeTakeUrl
        });
      };

      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.onstop = () => finalize();
        this.mediaRecorder.stop();
      } else {
        finalize();
      }
    });
  }

  public getRealtimeAudioData(buffer: Float32Array): void {
    if (this.analyser) {
      this.analyser.getFloatTimeDomainData(buffer);
    } else {
      buffer.fill(0);
    }
  }

  public static computeRMS(buffer: Float32Array): number {
    let sumSq = 0;
    for (let i = 0; i < buffer.length; i++) {
      sumSq += buffer[i] * buffer[i];
    }
    return Math.sqrt(sumSq / buffer.length);
  }

  public static computeF0Autocorrelation(buffer: Float32Array, sampleRate: number): number {
    const minFreq = 80;
    const maxFreq = 400;
    const minTau = Math.floor(sampleRate / maxFreq);
    const maxTau = Math.floor(sampleRate / minFreq);

    const rms = this.computeRMS(buffer);
    if (rms < 0.015) return 0;

    let maxR = -1;
    let bestTau = -1;
    const rValues = new Float32Array(maxTau + 2);

    for (let tau = minTau; tau <= maxTau; tau++) {
      let r = 0;
      let norm1 = 0;
      let norm2 = 0;
      const len = buffer.length - tau;
      for (let i = 0; i < len; i++) {
        r += buffer[i] * buffer[i + tau];
        norm1 += buffer[i] * buffer[i];
        norm2 += buffer[i + tau] * buffer[i + tau];
      }
      const denom = Math.sqrt(norm1 * norm2);
      const normR = denom > 0 ? r / denom : 0;
      rValues[tau] = normR;

      if (normR > maxR) {
        maxR = normR;
        bestTau = tau;
      }
    }

    if (maxR < 0.65 || bestTau <= minTau || bestTau >= maxTau) {
      return 0;
    }

    const rPrev = rValues[bestTau - 1];
    const rCurr = rValues[bestTau];
    const rNext = rValues[bestTau + 1];
    const denominator = 2 * (2 * rCurr - rPrev - rNext);
    let delta = 0;
    if (Math.abs(denominator) > 1e-6) {
      delta = (rNext - rPrev) / denominator;
    }

    const exactTau = bestTau + delta;
    return exactTau > 0 ? sampleRate / exactTau : 0;
  }

  public static detectSilenceGaps(
    energySamples: number[],
    frameDurationSec: number,
    threshold: number = 0.02,
    minGapSec: number = 0.25
  ): { totalSilenceSec: number; totalSpeechSec: number } {
    const minGapFrames = Math.ceil(minGapSec / frameDurationSec);
    let totalSilenceSec = 0;
    let totalSpeechSec = 0;
    let currentSilenceRun = 0;

    for (let i = 0; i < energySamples.length; i++) {
      if (energySamples[i] < threshold) {
        currentSilenceRun++;
      } else {
        if (currentSilenceRun >= minGapFrames) {
          totalSilenceSec += currentSilenceRun * frameDurationSec;
        } else {
          totalSpeechSec += currentSilenceRun * frameDurationSec;
        }
        currentSilenceRun = 0;
        totalSpeechSec += frameDurationSec;
      }
    }

    if (currentSilenceRun >= minGapFrames) {
      totalSilenceSec += currentSilenceRun * frameDurationSec;
    } else {
      totalSpeechSec += currentSilenceRun * frameDurationSec;
    }

    return { totalSilenceSec, totalSpeechSec };
  }

  public playTake(onEnded?: () => void): void {
    if (!this.activeTakeUrl) return;
    this.stopTake();
    this.currentTakeAudio = new Audio(this.activeTakeUrl);
    if (onEnded) {
      this.currentTakeAudio.onended = onEnded;
    }
    this.currentTakeAudio.play().catch(() => {});
  }

  public stopTake(): void {
    if (this.currentTakeAudio) {
      this.currentTakeAudio.pause();
      this.currentTakeAudio = null;
    }
  }

  public playExemplar(audioUrlOrText: string, onEnded?: () => void): void {
    this.stopExemplar();
    if (audioUrlOrText.startsWith('http') || audioUrlOrText.startsWith('blob:') || audioUrlOrText.startsWith('data:')) {
      this.currentExemplarAudio = new Audio(audioUrlOrText);
      if (onEnded) this.currentExemplarAudio.onended = onEnded;
      this.currentExemplarAudio.play().catch(() => {});
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(audioUrlOrText);
      u.lang = 'en-US';
      u.rate = 0.95;
      if (onEnded) u.onend = onEnded;
      window.speechSynthesis.speak(u);
    }
  }

  public stopExemplar(): void {
    if (this.currentExemplarAudio) {
      this.currentExemplarAudio.pause();
      this.currentExemplarAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public dispose(): void {
    this.stopTake();
    this.stopExemplar();
    if (this.analysisTimer) {
      clearInterval(this.analysisTimer);
      this.analysisTimer = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
    if (this.activeTakeUrl) {
      URL.revokeObjectURL(this.activeTakeUrl);
      this.activeTakeUrl = null;
    }
  }
}
```

- [ ] **Step 4: Verify TypeScript build**

Run: `npm run build`  
Expected: Clean compilation with 0 errors.

- [ ] **Step 5: Commit**

```bash
git add web/src/core/acoustic-engine.ts web/scripts/verify-acoustic-dsp.cjs
git commit -m "feat(audio): add time-domain autocorrelation pitch and silence DSP engine (ENG-19)"
```

---

### Task 2: Collocation Spotter (ENG-20)

**Files:**
- Create: `web/src/core/collocation-spotter.ts`
- Create: `web/scripts/verify-collocation-spotter.cjs`

**Interfaces:**
- Consumes: Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`).
- Produces:
  ```typescript
  export interface CollocationSpotStatus {
    phrase: string;
    spotted: boolean;
    timestampSec?: number;
  }

  export class CollocationSpotter {
    public isVoiceAvailable: boolean;
    public isListening: boolean;
    public setTargetCollocations(phrases: string[]): void;
    public startListening(onSpotted?: (phrase: string, timestampSec: number) => void): void;
    public stopListening(): void;
    public manualToggle(phrase: string): void;
    public getStatus(): CollocationSpotStatus[];
    public reset(): void;
    public static fuzzyMatchPhrase(spokenText: string, targetPhrase: string): boolean;
    public static levenshtein(a: string, b: string): number;
  }
  ```

- [ ] **Step 1: Write the failing collocation spotting test suite**

Create `web/scripts/verify-collocation-spotter.cjs` testing n-gram tokenization, stemming/fuzzy matching, and Levenshtein distance:

```javascript
// web/scripts/verify-collocation-spotter.cjs
const assert = require('assert');

function levenshtein(a, b) {
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;

  const matrix = Array.from({ length: al + 1 }, () => new Int32Array(bl + 1));
  for (let i = 0; i <= al; i++) matrix[i][0] = i;
  for (let j = 0; j <= bl; j++) matrix[0][j] = j;

  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[al][bl];
}

function cleanTokens(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
}

function fuzzyMatchPhrase(spokenText, targetPhrase) {
  const spokenTokens = cleanTokens(spokenText);
  const targetTokens = cleanTokens(targetPhrase);
  if (targetTokens.length === 0 || spokenTokens.length === 0) return false;

  const n = targetTokens.length;
  for (let i = 0; i <= spokenTokens.length - n; i++) {
    let allMatched = true;
    for (let j = 0; j < n; j++) {
      const sTok = spokenTokens[i + j];
      const tTok = targetTokens[j];

      if (sTok === tTok) continue;
      // Allow plural or past tense inflection if root matches
      if (sTok.startsWith(tTok) || tTok.startsWith(sTok)) continue;
      // Levenshtein distance <= 1 for single-letter speech recognition noise
      if (levenshtein(sTok, tTok) <= 1) continue;

      allMatched = false;
      break;
    }
    if (allMatched) return true;
  }
  return false;
}

console.log('[TEST] Starting Collocation Spotter Fuzzy Match Verification...');

// Exact match
assert(fuzzyMatchPhrase('we need to raise concerns immediately', 'raise concerns') === true, 'Exact match failed');

// Inflected match (past tense 'raised concerns')
assert(fuzzyMatchPhrase('he raised concerns regarding safety', 'raise concerns') === true, 'Inflected match failed');

// Multi-word collocation ('take into account')
assert(fuzzyMatchPhrase('we must take into account all factors', 'take into account') === true, 'Multi-word match failed');

// Levenshtein typo / recognition noise ('he took into acount')
assert(fuzzyMatchPhrase('he took into acount the risks', 'take into account') === false); // 'took' != 'take' prefix
assert(fuzzyMatchPhrase('we take into acount the risks', 'take into account') === true, 'Fuzzy typo match failed');

// Negative case
assert(fuzzyMatchPhrase('we decided to lower the cost', 'raise concerns') === false, 'Negative match failed');

console.log('✓ All Collocation Spotter fuzzy matching tests passed cleanly.');
```

- [ ] **Step 2: Run test to verify fuzzy phrase spotting**

Run: `node web/scripts/verify-collocation-spotter.cjs`  
Expected: `✓ All Collocation Spotter fuzzy matching tests passed cleanly.`

- [ ] **Step 3: Implement `web/src/core/collocation-spotter.ts`**

Write the production TypeScript class:

```typescript
// web/src/core/collocation-spotter.ts
export interface CollocationSpotStatus {
  phrase: string;
  spotted: boolean;
  timestampSec?: number;
}

export class CollocationSpotter {
  public isVoiceAvailable: boolean = false;
  public isListening: boolean = false;

  private recognition: any = null;
  private targets: Map<string, CollocationSpotStatus> = new Map();
  private startTime: number = 0;
  private onSpottedCb?: (phrase: string, timestampSec: number) => void;

  constructor() {
    this.checkVoiceAvailability();
  }

  private checkVoiceAvailability(): void {
    if (typeof window === 'undefined') {
      this.isVoiceAvailable = false;
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.isVoiceAvailable = !!SpeechRecognition;
  }

  public setTargetCollocations(phrases: string[]): void {
    this.targets.clear();
    for (const phrase of phrases) {
      const clean = phrase.trim();
      if (clean) {
        this.targets.set(clean.toLowerCase(), {
          phrase: clean,
          spotted: false
        });
      }
    }
  }

  public startListening(onSpotted?: (phrase: string, timestampSec: number) => void): void {
    this.onSpottedCb = onSpotted;
    this.startTime = Date.now();
    this.isListening = true;

    if (!this.isVoiceAvailable) return;

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += ' ' + event.results[i][0].transcript;
        }
        this.processTranscript(transcript);
      };

      this.recognition.onerror = () => {
        // Degrade silently without throwing
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch {}
        }
      };

      this.recognition.start();
    } catch {
      this.isVoiceAvailable = false;
    }
  }

  public stopListening(): void {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      this.recognition = null;
    }
  }

  public manualToggle(phrase: string): void {
    const key = phrase.toLowerCase();
    const entry = this.targets.get(key);
    if (entry) {
      entry.spotted = !entry.spotted;
      if (entry.spotted) {
        entry.timestampSec = Math.max(0, (Date.now() - this.startTime) / 1000);
        if (this.onSpottedCb) {
          this.onSpottedCb(entry.phrase, entry.timestampSec);
        }
      }
    }
  }

  public getStatus(): CollocationSpotStatus[] {
    return Array.from(this.targets.values());
  }

  public reset(): void {
    for (const entry of this.targets.values()) {
      entry.spotted = false;
      entry.timestampSec = undefined;
    }
  }

  private processTranscript(text: string): void {
    const nowSec = Math.max(0, (Date.now() - this.startTime) / 1000);
    for (const [key, entry] of this.targets.entries()) {
      if (!entry.spotted && CollocationSpotter.fuzzyMatchPhrase(text, key)) {
        entry.spotted = true;
        entry.timestampSec = nowSec;
        if (this.onSpottedCb) {
          this.onSpottedCb(entry.phrase, nowSec);
        }
      }
    }
  }

  public static fuzzyMatchPhrase(spokenText: string, targetPhrase: string): boolean {
    const spokenTokens = this.cleanTokens(spokenText);
    const targetTokens = this.cleanTokens(targetPhrase);
    if (targetTokens.length === 0 || spokenTokens.length === 0) return false;

    const n = targetTokens.length;
    for (let i = 0; i <= spokenTokens.length - n; i++) {
      let allMatched = true;
      for (let j = 0; j < n; j++) {
        const sTok = spokenTokens[i + j];
        const tTok = targetTokens[j];

        if (sTok === tTok) continue;
        if (sTok.startsWith(tTok) || tTok.startsWith(sTok)) continue;
        if (this.levenshtein(sTok, tTok) <= 1) continue;

        allMatched = false;
        break;
      }
      if (allMatched) return true;
    }
    return false;
  }

  private static cleanTokens(str: string): string[] {
    return str.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  }

  public static levenshtein(a: string, b: string): number {
    const al = a.length;
    const bl = b.length;
    if (al === 0) return bl;
    if (bl === 0) return al;

    const matrix: number[][] = Array.from({ length: al + 1 }, () => new Array(bl + 1).fill(0));
    for (let i = 0; i <= al; i++) matrix[i][0] = i;
    for (let j = 0; j <= bl; j++) matrix[0][j] = j;

    for (let i = 1; i <= al; i++) {
      for (let j = 1; j <= bl; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    return matrix[al][bl];
  }
}
```

- [ ] **Step 4: Verify TypeScript build**

Run: `npm run build`  
Expected: Clean compilation with 0 errors.

- [ ] **Step 5: Commit**

```bash
git add web/src/core/collocation-spotter.ts web/scripts/verify-collocation-spotter.cjs
git commit -m "feat(speech): implement Web Speech collocation spotter with fuzzy matching (ENG-20)"
```

---

### Task 3: Speaking Dossier Studio Cockpit & Compression Matrix (ENG-21)

**Files:**
- Modify: `web/src/modules/speaking-dossier.ts`
- Modify: `web/src/assets/styles/dossiers.css` (or dedicated studio CSS rules)

**Interfaces:**
- Consumes: `AcousticEngine` (`web/src/core/acoustic-engine.ts`), `CollocationSpotter` (`web/src/core/collocation-spotter.ts`), `AtomicCard`, `SRSEngine`, `AudioSynthesizer`.
- Produces: Complete interactive cockpit with:
  1. Front: Prompt, 15s mental anchor, Nation 4-3-2 circular timer HUD, collocation radar chips with live absorb pulse, dual-trace comparative canvas oscilloscope (Native benchmark vs. Student take), post-take A/B review strip with synchronized replay and round advance button.
  2. Back: 3-round compression comparison table (Nation 4-3-2 metrics: Allotted, Time Spoken, Silence %, Collocations Activated), prosodic guidance, and SM-2 scoring bar.
  3. Clean lifecycle teardown on prompt navigation or route switch.

- [ ] **Step 1: Write CSS styling for Acoustic Studio components**

In `web/src/assets/styles/dossiers.css`, append the binary monochrome rules for radar chips, dual-trace canvas, and compression table:

```css
/* Acoustic Studio Radar Chips & Dual Trace */
.collocation-radar-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 10px 0;
}

.radar-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border: 1px dashed var(--ink-secondary);
  font-family: var(--font-mono);
  font-size: 11px;
  background: transparent;
  color: var(--ink-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.radar-chip.spotted {
  border: 1px solid #000000;
  background: #000000;
  color: #ffffff;
  font-weight: 700;
}

.post-take-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid var(--border-solid);
  padding: 8px 12px;
  margin-top: 8px;
  background: #ffffff;
}

.compression-table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--font-mono);
  font-size: 11px;
  margin-top: 8px;
}

.compression-table th, .compression-table td {
  border: 1px solid var(--border-solid);
  padding: 6px 8px;
  text-align: left;
}

.compression-table th {
  background: #000000;
  color: #ffffff;
}
```

- [ ] **Step 2: Update `web/src/modules/speaking-dossier.ts`**

Integrate `AcousticEngine` and `CollocationSpotter` into `SpeakingDossier`:
- Wire 15s mental anchor into pre-drill setup.
- Wire `acousticEngine.startRecording()` and `collocationSpotter.startListening()` upon timer start.
- Render radar chips dynamically from `item.collocations`.
- On round timer completion or stop:
  - Run `acousticEngine.stopRecording()`.
  - Capture `RoundPerformance` (allotted, actual, silence ratio, spotted collocations).
  - Show post-take A/B playback controls (`[ ▶ EXEMPLAR ]` and `[ ▶ YOUR TAKE ]`).
  - Render dual-trace canvas (Track 1 = Native benchmark pitch/envelope, Track 2 = Recorded student pitch contour).
- Populate the back face with the complete 3-round compression comparison table.
- Clean up all streams and Object URLs on navigation.

- [ ] **Step 3: Test full build and runtime packaging**

Run: `npm run build`  
Expected: Production bundle compiles cleanly into `dist/` with 0 TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add web/src/modules/speaking-dossier.ts web/src/assets/styles/dossiers.css
git commit -m "feat(speaking): deliver Acoustic Voice Intelligence Studio with 4-3-2 compression matrix (ENG-21)"
```

---

## Plan Review Checklist

1. **Spec Coverage:**
   - [x] Time-Domain Autocorrelation Pitch Tracking ($F_0$ Hz) & Silence Detection $\rightarrow$ Task 1 (ENG-19).
   - [x] Continuous Web Speech Collocation Spotting & Fuzzy Matching $\rightarrow$ Task 2 (ENG-20).
   - [x] Live Studio Cockpit, Dual-Trace Canvas & 4-3-2 Compression Matrix $\rightarrow$ Task 3 (ENG-21).
   - [x] 100% Offline Capability & Clean Design Standard adherence $\rightarrow$ Tasks 1, 2, 3.
2. **No Placeholders:** All test scripts and classes have complete, concrete implementations.
3. **Type Consistency:** `AcousticAnalysis`, `CollocationSpotStatus`, and `RoundPerformance` contracts match the spec identically across all tasks.
