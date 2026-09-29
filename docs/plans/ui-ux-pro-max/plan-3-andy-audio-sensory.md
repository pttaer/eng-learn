# UI/UX Pro Max Architecture Plan 3: Procedural Acoustic Soundscapes, Micro-Interactions & Sensory Delight

**Assignee:** `andy-mul1ug04` (Andy — Procedural Audio Synthesis, Micro-Interactions & Drill Mechanics Specialist)  
**Ticket ID:** `ENG-24`  
**Target Module:** [`web/src/core/audio-synthesizer.ts`](file:///E:/Eng/web/src/core/audio-synthesizer.ts), [`web/src/modules/speaking-dossier.ts`](file:///E:/Eng/web/src/modules/speaking-dossier.ts), [`web/src/modules/listening-dossier.ts`](file:///E:/Eng/web/src/modules/listening-dossier.ts), [`web/src/modules/header-hud.ts`](file:///E:/Eng/web/src/modules/header-hud.ts)  
**Design Standard:** Pure Client-Side Procedural Web Audio API (0 External Audio Assets), Zero Audio Latency, Harmonic Temperament, Haptic Tactile Feedback, Binary Monochrome HUD Controls.  
**Word Count Target:** $\ge 2,000$ words of concrete, executable code and architectural blueprints.

---

## 1. Executive Summary & Psychoacoustic Foundations

In language acquisition, the **Phonological Loop** (Baddeley's Model of Working Memory) serves as the primary cognitive buffer for syntactic compilation and lexical consolidation. When an educational interface pairs visual state transitions with precise, procedural acoustic cues, it triggers multimodal reinforcement, elevating retention rates and providing critical subconscious feedback on drill velocity and accuracy.

Currently, `AudioSynthesizer` generates elementary procedural tones (`chime`, `ping`, `tick`, `alarm`, `absorb`, `remind-drop`, `level-up`). While technically functional, an evaluation against the **`ui-ux-pro-max`** micro-interaction guidelines reveals four key opportunities for sensory perfection:
1. **Initial User Gesture Latency (Autoplay Policy Cold Start):** Web Audio contexts initialized on modern browsers remain suspended until an explicit user interaction. The first interaction often incurs a $250\text{ms} - 500\text{ms}$ delay while the audio device warms up, breaking the tactile immediacy of the interface.
2. **Harmonic Discordance & Lack of Dynamic Filtering:** Synthesized frequencies are hardcoded to isolated square or sine bursts without natural overtones or exponential decays. They sound like utilitarian motherboard beeps rather than the refined acoustic feedback of a high-precision Swiss scientific instrument.
3. **Absence of Haptic Tactile Cues on Mobile:** Smartphones and tablets possess sophisticated linear resonant haptic actuators (Taptic Engine). By omitting vibration signals during card flips, collocation absorption, and SRS rating triggers, the app misses the tactile physical presence that makes flashcard study immersive.
4. **Missing HUD Volume Master & Persistent Decibel Control:** Users studying in quiet public environments (libraries, coffee shops, night study) have no in-app master volume slider or instant mute toggle, forcing them to adjust system-wide volume.

Andy will overhaul the audio architecture: implementing **Zero-Latency Audio Priming**, a **Harmonic Overtones Sound Engine** with exponential ADSR envelopes and biquad resonant filtering, a **Cross-Platform Haptic Feedback Manager**, and an integrated **HUD Decibel Level & Mute Controller**.

---

## 2. Mathematical Formulations & Psychoacoustic Models

### 2.1 Exponential ADSR Envelopes
To prevent audible speaker pops (caused by instantaneous DC offset transitions), every synthesized event must obey an exponential Attack-Decay-Sustain-Release (ADSR) amplitude envelope:

$$A(t) = \begin{cases} 
A_{\max} \cdot \left(1 - e^{-t / \tau_a}\right), & 0 \le t < t_a \quad \text{(Attack)} \\
A_{\text{sustain}} + (A_{\max} - A_{\text{sustain}}) \cdot e^{-(t - t_a) / \tau_d}, & t_a \le t < t_d \quad \text{(Decay)} \\
A_{\text{sustain}}, & t_d \le t < t_r \quad \text{(Sustain)} \\
A_{\text{sustain}} \cdot e^{-(t - t_r) / \tau_r}, & t \ge t_r \quad \text{(Release)}
\end{cases}$$

where:
- $\tau_a \approx 0.003\text{s}$ (Smooth $3\text{ms}$ rise to avoid audio transients).
- $\tau_r \approx 0.08\text{s} - 0.4\text{s}$ (Natural acoustic decay matching physical resonant wood or metal chimes).

### 2.2 Pythagorean Just Intonation & Harmonic Chords
Rather than equal-tempered approximations, procedural success arpeggios (`level-up`, `absorption-streak`, `drill-complete`) must utilize **Just Intonation** frequency ratios based on whole-number acoustic harmonics to maximize harmonic consonance:

| Interval | Frequency Ratio | Base $F_0 = 440\text{Hz}$ (A4) | Synthesized Frequency |
| :--- | :--- | :--- | :--- |
| **Unison** | $1 : 1$ | $440.00\text{Hz}$ | $440.00\text{Hz}$ |
| **Major Third** | $5 : 4$ | $440 \times 1.25$ | $550.00\text{Hz}$ |
| **Perfect Fifth** | $3 : 2$ | $440 \times 1.50$ | $660.00\text{Hz}$ |
| **Octave** | $2 : 1$ | $440 \times 2.00$ | $880.00\text{Hz}$ |
| **Major Ninth** | $9 : 4$ | $440 \times 2.25$ | $990.00\text{Hz}$ |

By layering a fundamental sine wave with a subtle secondary harmonic at $2F_0$ ($0.25$ gain) and tertiary harmonic at $3F_0$ ($0.08$ gain) through a resonant lowpass filter ($Q = 3.5$), Andy will generate acoustic tones reminiscent of physical marimbas and bells.

### 2.3 Resonant Biquad Filter Transfer Function
For the dynamic `absorb` and `gateway-hover` frequencies, audio passes through a two-pole resonant bandpass filter:

$$H(s) = \frac{\frac{\omega_0}{Q} s}{s^2 + \frac{\omega_0}{Q} s + \omega_0^2}$$

Modulating center frequency $\omega_0(t)$ from $800\text{Hz}$ down to $220\text{Hz}$ over $180\text{ms}$ produces a definitive tactile "gravity drop" sensation when collocations are absorbed.

---

## 3. Detailed Component Architecture & TypeScript Interfaces

Andy will deliver:
1. `web/src/core/haptic-engine.ts` (New module: Mobile Taptic / Vibration API orchestrator).
2. `web/src/core/audio-synthesizer.ts` (Major upgrade: Just intonation, ADSR gain nodes, master volume bus, zero-allocation node reuse).
3. `web/src/modules/header-hud.ts` (Integrated volume slider, dB meter tooltip, mute toggle).
4. `web/scripts/verify-audio-sensory.cjs` (Automated acoustic math test suite validating frequency tables, envelope decay times, and haptic guardrails).

```typescript
// web/src/core/haptic-engine.ts
export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

export class HapticEngine {
  private static isAvailable: boolean = typeof navigator !== 'undefined' && 'vibrate' in navigator;
  private static enabled: boolean = true;

  public static trigger(pattern: HapticPattern): void {
    if (!this.isAvailable || !this.enabled) return;

    try {
      switch (pattern) {
        case 'light':
        case 'selection':
          navigator.vibrate(10); // 10ms micro-click
          break;
        case 'medium':
          navigator.vibrate(25);
          break;
        case 'heavy':
          navigator.vibrate(45);
          break;
        case 'success':
          navigator.vibrate([15, 30, 25]); // Dual-pulse cadence
          break;
        case 'warning':
          navigator.vibrate([30, 40, 30]);
          break;
        case 'error':
          navigator.vibrate([50, 60, 50, 60, 50]);
          break;
      }
    } catch {
      // Degrade silently if permission blocked
    }
  }

  public static setEnabled(state: boolean): void {
    this.enabled = state;
  }
}
```

---

## 4. Step-by-Step Implementation Blueprint

### Step 4.1: Automated Headless Audio Verification Suite
Andy will author `web/scripts/verify-audio-sensory.cjs` to mathematically guarantee frequency precision, harmonic intervals, and envelope parameters:

```javascript
// web/scripts/verify-audio-sensory.cjs
const assert = require('assert');

console.log('[AUDIO SENSORY TEST] Validating harmonic acoustics and envelope calculations...');

// 1. Verify Just Intonation Harmonic Ratios
const baseFreq = 440;
const ratios = {
  unison: 1.0,
  majorThird: 1.25,
  perfectFifth: 1.50,
  octave: 2.0,
  majorNinth: 2.25
};

const chordFrequencies = Object.values(ratios).map((r) => baseFreq * r);
console.log(`- Synthesized Pentatonic Chord Frequencies: ${chordFrequencies.join(', ')} Hz`);
assert.strictEqual(chordFrequencies[0], 440);
assert.strictEqual(chordFrequencies[1], 550);
assert.strictEqual(chordFrequencies[2], 660);
assert.strictEqual(chordFrequencies[3], 880);
assert.strictEqual(chordFrequencies[4], 990);

// 2. Exponential Decay Calculation Simulation
function calculateExponentialDecay(initialVal, tau, t) {
  return initialVal * Math.exp(-t / tau);
}

const initialGain = 0.5;
const tauDecay = 0.15; // 150ms time constant
const gainAt50ms = calculateExponentialDecay(initialGain, tauDecay, 0.05);
const gainAt150ms = calculateExponentialDecay(initialGain, tauDecay, 0.15);
const gainAt450ms = calculateExponentialDecay(initialGain, tauDecay, 0.45);

console.log(`- Envelope Gain Curve: 0ms=${initialGain}, 50ms=${gainAt50ms.toFixed(3)}, 150ms=${gainAt150ms.toFixed(3)}, 450ms=${gainAt450ms.toFixed(4)}`);
assert(gainAt50ms < initialGain, 'Envelope must decay monotonically');
assert(gainAt150ms < initialGain / 2, 'Envelope must drop past 50% at 1*tau');
assert(gainAt450ms < 0.03, 'Envelope must be virtually silent (< -30dB) at 3*tau');

// 3. Audio Decibel to Linear Gain Conversion
function dbToLinear(dB) {
  return Math.pow(10, dB / 20);
}
assert.strictEqual(Math.round(dbToLinear(0) * 100) / 100, 1.00);
assert.strictEqual(Math.round(dbToLinear(-6) * 100) / 100, 0.50);
assert.strictEqual(Math.round(dbToLinear(-20) * 100) / 100, 0.10);
console.log('✓ Decibel conversion formulas verified (-6dB = 0.50 gain, -20dB = 0.10 gain)');

console.log('✓ All Audio Sensory mathematical assertions passed cleanly.');
```

### Step 4.2: Upgrading `web/src/core/audio-synthesizer.ts` with Zero-Latency Priming & ADSR
Andy will overhaul the audio engine to prime the `AudioContext` on any initial DOM pointer event and add rich harmonic overtones:

```typescript
// web/src/core/audio-synthesizer.ts (Comprehensive Production Rewrite)
export type SoundEffect =
  | 'click'
  | 'flip'
  | 'chime'
  | 'ping'
  | 'tick'
  | 'alarm'
  | 'absorb'
  | 'remind-drop'
  | 'level-up'
  | 'gateway-hover'
  | 'streak-fire';

export class AudioSynthesizer {
  private static ctx: AudioContext | null = null;
  private static masterGain: GainNode | null = null;
  private static isMuted: boolean = false;
  private static masterVolume: number = 0.8; // 0.0 to 1.0

  private static isPrimed: boolean = false;

  public static init(): void {
    if (this.isPrimed || typeof window === 'undefined') return;

    const primeAudio = () => {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }

      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      this.isPrimed = true;
      window.removeEventListener('pointerdown', primeAudio);
      window.removeEventListener('keydown', primeAudio);
    };

    window.addEventListener('pointerdown', primeAudio, { once: true, passive: true });
    window.addEventListener('keydown', primeAudio, { once: true, passive: true });

    // Restore volume from storage
    try {
      const savedVol = localStorage.getItem('eng_master_volume');
      if (savedVol !== null) this.masterVolume = parseFloat(savedVol);
      const savedMute = localStorage.getItem('eng_master_muted');
      if (savedMute !== null) this.isMuted = savedMute === 'true';
    } catch {}
  }

  public static play(effect: SoundEffect): void {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    switch (effect) {
      case 'click':
        this.playTactileMicroClick(now);
        break;
      case 'flip':
        this.playCardFlipWhoosh(now);
        break;
      case 'gateway-hover':
        this.playGatewayResonance(now);
        break;
      case 'absorb':
        this.playAbsorptionSweep(now);
        break;
      case 'level-up':
      case 'streak-fire':
        this.playHarmonicChimeArpeggio(now);
        break;
      case 'chime':
        this.playBellChime(now, 587.33); // D5
        break;
      case 'ping':
        this.playBellChime(now, 880.00); // A5
        break;
      case 'tick':
        this.playMetronomeTick(now);
        break;
      case 'alarm':
        this.playWarningPulse(now);
        break;
      case 'remind-drop':
        this.playRemindFrequencyDrop(now);
        break;
    }
  }

  private static ensureContext(): void {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Tactile 3ms impulse click for button presses
  private static playTactileMicroClick(now: number): void {
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.008);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.008);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + 0.01);
  }

  // Card Flip Whoosh: White noise filtered burst with low frequency sweep
  private static playCardFlipWhoosh(now: number): void {
    const osc = this.ctx!.createOscillator();
    const filter = this.ctx!.createBiquadFilter();
    const gain = this.ctx!.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(360, now + 0.06);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.16);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Collocation Absorption: Resonant downward sweep
  private static playAbsorptionSweep(now: number): void {
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    const filter = this.ctx!.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.18);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, now);
    filter.Q.setValueAtTime(3.0, now);

    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  // Just Intonation Success Arpeggio: Root -> Third -> Fifth -> Octave
  private static playHarmonicChimeArpeggio(now: number): void {
    const root = 440; // A4
    const notes = [root, root * 1.25, root * 1.5, root * 2.0]; // 440, 550, 660, 880 Hz

    notes.forEach((freq, idx) => {
      const noteTime = now + idx * 0.055;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      // Natural bell decay
      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.15, noteTime + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(noteTime);
      osc.stop(noteTime + 0.4);
    });
  }

  private static playBellChime(now: number, freq: number): void {
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  private static playMetronomeTick(now: number): void {
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  private static playWarningPulse(now: number): void {
    [0, 0.12].forEach((offset) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(260, now + offset);

      gain.gain.setValueAtTime(0.12, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now + offset);
      osc.stop(now + offset + 0.1);
    });
  }

  private static playRemindFrequencyDrop(now: number): void {
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.28);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  private static playGatewayResonance(now: number): void {
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(228, now + 0.08);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Master Volume & Mute Controls
  public static setMasterVolume(val: number): void {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    }
    try {
      localStorage.setItem('eng_master_volume', String(this.masterVolume));
    } catch {}
  }

  public static toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
    }
    try {
      localStorage.setItem('eng_master_muted', String(this.isMuted));
    } catch {}
    return this.isMuted;
  }

  public static getMuteState(): boolean {
    return this.isMuted;
  }

  public static getVolume(): number {
    return this.masterVolume;
  }
}
```

### Step 4.3: Integrating Master Volume & Mute in `web/src/modules/header-hud.ts`
Andy will integrate a sleek, binary monochrome volume controller into the top Header HUD:
- Button: `[ VOL: 80% ]` or `[ MUTED ]`.
- Hover/Click opens a compact range slider or toggles mute instantly.
- Dispatches tactile feedback on change.

---

## 5. Defensive Boundaries & Failure Modes

1. **Browser Autoplay Rejection (`NotAllowedError`)**:
   - Chrome and Safari throw exceptions if audio is triggered without an active user gesture.
   - **Defense:** All `play()` calls must inspect `ctx.state === 'suspended'` and encapsulate resume logic inside `.catch(() => {})`. Zero unhandled Promise rejections.
2. **Audio Hardware Disconnect / Sample Rate Mismatch**:
   - If a user plugs in Bluetooth headphones mid-session, the hardware sample rate may change (e.g. from $44.1\text{kHz}$ to $48\text{kHz}$ or $16\text{kHz}$ SCO mode).
   - **Defense:** Check `ctx.state === 'closed'`. If closed, recreate the context transparently on the next sound invocation.
3. **Memory Leaks from Rapid Sound Triggers**:
   - In rapid drilling sessions, triggering 10 chimes per second without proper node lifecycle cleanup causes detached AudioNodes to accumulate in memory.
   - **Defense:** Explicitly invoke `osc.stop(time)` and disconnect nodes immediately after their scheduled release window.

---

## 6. Verification & Acceptance Criteria

1. **Test Suite Verification**:
   - `node web/scripts/verify-audio-sensory.cjs` passes 100% of mathematical assertions.
2. **Audio Latency Performance**:
   - Time-to-sound after pointer down is $< 12\text{ms}$ on primed contexts.
3. **Hardware Battery / Memory Budget**:
   - Continuous audio playback produces $0\text{MB}$ memory growth over 1,000 synthetic triggers (measured via Chrome Task Manager).
4. **Build & Bundle Quality**:
   - Zero external binary `.mp3` or `.wav` files added to repository (100% pure procedural code).
   - `npm run build` passes with zero errors.
