/**
 * Zero-asset procedural acoustic haptics engine using native Web Audio API.
 * Provides subtle tactile auditory feedback: wood tap, paper flip, chime, and gentle retry nudge.
 */
class AcousticHapticsEngine {
  private ctx: AudioContext | null = null;
  private destNode: AudioNode | null = null;
  private muted = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('eng_master_muted');
        if (stored !== null) {
          this.muted = stored === 'true';
        } else {
          const raw = localStorage.getItem('eng_state');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed.soundMuted === 'boolean') {
              this.muted = parsed.soundMuted;
            }
          }
        }
      } catch {}
    }
  }

  /**
   * Binds to shared AudioSynthesizer context & SFX gain bus to eliminate duplicate AudioContexts.
   */
  public attachAudioContext(ctx: AudioContext, destNode?: AudioNode): void {
    this.ctx = ctx;
    if (destNode) {
      this.destNode = destNode;
    }
  }

  private getDestination(ctx: AudioContext): AudioNode {
    return this.destNode || ctx.destination;
  }

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    }
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) this.ctx = new AudioCtx();
    return this.ctx;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  /** Subtle wooden / glass tap on button press (25ms) */
  tap(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.025);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

    osc.connect(gain);
    gain.connect(this.getDestination(ctx));
    osc.start(t);
    osc.stop(t + 0.025);
  }

  /** Smooth paper flip sound on card flip (40ms filtered noise) */
  flip(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const bufferSize = ctx.sampleRate * 0.04;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);
    filter.Q.setValueAtTime(2.5, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.getDestination(ctx));
    noise.start();
  }

  /** Warm dual-tone chime on card mastery / streak (E5 -> A5) */
  chime(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    [659.25, 880].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = t + idx * 0.08;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.06, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
      osc.connect(gain);
      gain.connect(this.getDestination(ctx));
      osc.start(start);
      osc.stop(start + 0.35);
    });
  }

  /** Gentle warm retry cue (330Hz -> 293Hz) - no aggressive buzzer */
  nudge(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(329.63, t);
    osc.frequency.exponentialRampToValueAtTime(293.66, t + 0.16);

    gain.gain.setValueAtTime(0.07, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.getDestination(ctx));
    osc.start(t);
    osc.stop(t + 0.16);
  }

  /**
   * Interactive Streak Combo chime:
   * Dynamically steps up the pentatonic scale (C5 -> D5 -> E5 -> G5 -> A5 -> C6)
   * rewarding consecutive correct answers with ascending dopamine cues.
   */
  combo(streak: number = 1): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    // C Pentatonic scale: C5, D5, E5, G5, A5, C6
    const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
    const noteIdx = Math.min(pentatonic.length - 1, Math.max(0, streak - 1));
    const freq = pentatonic[noteIdx];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = streak >= 5 ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, t);

    const dur = 0.22;
    gain.gain.setValueAtTime(0.07, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc.connect(gain);
    gain.connect(this.getDestination(ctx));
    osc.start(t);
    osc.stop(t + dur);

    // Add overtone shimmer on high streaks (streak >= 5)
    if (streak >= 5) {
      const harm = ctx.createOscillator();
      const harmGain = ctx.createGain();
      harm.type = 'sine';
      harm.frequency.setValueAtTime(freq * 1.5, t + 0.04);
      harmGain.gain.setValueAtTime(0.04, t + 0.04);
      harmGain.gain.exponentialRampToValueAtTime(0.001, t + dur + 0.08);
      harm.connect(harmGain);
      harmGain.connect(this.getDestination(ctx));
      harm.start(t + 0.04);
      harm.stop(t + dur + 0.08);
    }
  }

  /** Subtle organic bubble pop on option selection / chip tap (14ms) */
  pop(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(550, t);
    osc.frequency.exponentialRampToValueAtTime(1350, t + 0.014);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.014);

    osc.connect(gain);
    gain.connect(this.getDestination(ctx));
    osc.start(t);
    osc.stop(t + 0.015);
  }

  /** Shimmering crystal sparkle for card mastery / star unlock */
  sparkle(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    [1046.50, 1318.51, 1567.98, 2093.00].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = t + idx * 0.045;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.045, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.24);
      osc.connect(gain);
      gain.connect(this.getDestination(ctx));
      osc.start(start);
      osc.stop(start + 0.24);
    });
  }

  /** Soft aerodynamic air sweep on route switch, modal reveal, drawer slide (110ms) */
  whoosh(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const dur = 0.11;
    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    const t = ctx.currentTime;
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(2600, t + dur * 0.4);
    filter.frequency.exponentialRampToValueAtTime(450, t + dur);
    filter.Q.setValueAtTime(1.8, t);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.055, t + dur * 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.getDestination(ctx));
    noise.start(t);
  }

  /** Apple-calm spring toggle click (crisp rise for ON, soft warm thud for OFF) */
  toggle(active: boolean): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = active ? 'triangle' : 'sine';
    const startFreq = active ? 640 : 540;
    const endFreq = active ? 1080 : 320;
    const dur = active ? 0.03 : 0.045;

    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur);

    gain.gain.setValueAtTime(0.07, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc.connect(gain);
    gain.connect(this.getDestination(ctx));
    osc.start(t);
    osc.stop(t + dur);
  }

  /** Rewarding harmonic arpeggio when unlocking a badge, grammar node, or skill */
  unlock(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = t + idx * 0.055;
      const dur = 0.28;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.065, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

      osc.connect(gain);
      gain.connect(this.getDestination(ctx));
      osc.start(start);
      osc.stop(start + dur);
    });
  }

  /** Full celebratory orchestral C Maj9 chord on quiz completion / streak milestones */
  celebration(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const chord = [261.63, 392.00, 493.88, 587.33, 659.25];
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const delay = idx * 0.035;
      const start = t + delay;
      const dur = 0.65;

      osc.type = idx < 2 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.055, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

      osc.connect(gain);
      gain.connect(this.getDestination(ctx));
      osc.start(start);
      osc.stop(start + dur);
    });

    if (typeof setTimeout !== 'undefined') {
      setTimeout(() => {
        this.sparkle();
      }, 280);
    }
  }

  /** High-stakes focused countdown heartbeat (dual pulse 68Hz / 52Hz) */
  heartbeat(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    [0, 0.12].forEach((offset, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = t + offset;
      const dur = 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(idx === 0 ? 68 : 52, start);
      osc.frequency.exponentialRampToValueAtTime(35, start + dur);

      gain.gain.setValueAtTime(0.09, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

      osc.connect(gain);
      gain.connect(this.getDestination(ctx));
      osc.start(start);
      osc.stop(start + dur);
    });
  }

  /** Tactile physical card draw / shuffle friction (35ms) */
  cardDraw(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const dur = 0.035;
    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, ctx.currentTime);
    filter.Q.setValueAtTime(3.0, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.045, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.getDestination(ctx));
    noise.start();
  }

  private boundInteractive = false;
  private lastInteractiveTap = 0;

  /**
   * Binds lightweight acoustic haptics to interactive DOM elements
   * (buttons, chips, pills, tab buttons, toggles).
   * Debounced to 60ms to prevent acoustic clipping.
   */
  bindInteractiveElements(root?: HTMLElement | Document): void {
    if (typeof document === 'undefined') return;
    const targetRoot = root || document;
    if (this.boundInteractive) return;
    this.boundInteractive = true;

    targetRoot.addEventListener('pointerdown', (e: Event) => {
      const target = (e.target as HTMLElement | null)?.closest(
        'button, [role="button"], .hud-btn, .bnav-btn, .chip, .badge-pill, .skill-pill, input[type="radio"], input[type="checkbox"]'
      ) as HTMLElement | null;

      if (!target || target.hasAttribute('disabled') || target.getAttribute('aria-disabled') === 'true') {
        return;
      }

      const now = performance.now();
      if (now - this.lastInteractiveTap < 60) return;
      this.lastInteractiveTap = now;

      // Chip, radio, or checkbox -> organic pop
      if (
        target.classList.contains('chip') ||
        target.classList.contains('badge-pill') ||
        target.classList.contains('skill-pill') ||
        target.tagName === 'INPUT'
      ) {
        this.pop();
      } else {
        // Standard interactive button -> tactile tap
        this.tap();
      }
    }, { passive: true });
  }
}

export const AcousticHaptics = new AcousticHapticsEngine();
