import { StorageManager } from '../utils/storage';
import { HapticEngine } from './haptic-engine';

export type SoundEffectType =
  | 'click'
  | 'implosion'
  | 'void-open'
  | 'urchin-hum'
  | 'flip'
  | 'absorb'
  | 'alarm'
  | 'remind-drop'
  | 'level-up'
  | 'chime'
  | 'ping'
  | 'tick'
  | 'gateway-hover'
  | 'streak-fire'
  | 'tour-step'
  | 'tour-fanfare'
  | 'stage-fanfare'
  | 'radar-reveal'
  | 'mechanical-click'
  | 'keystroke'
  | 'streak-chime'
  | 'xp-pickup';

export type SoundEffect = SoundEffectType;

/**
 * Procedural Web Audio API Engine & Web Speech Telemetry Subsystem.
 * Features zero-latency context priming on initial interaction, Pythagorean Just Intonation
 * harmonic arpeggios, exponential ADSR amplitude envelopes, mobile haptic feedback,
 * and unified HUD master volume / decibel bus.
 */
export class AudioSynthesizer {
  private static ctx: AudioContext | null = null;
  private static masterGain: GainNode | null = null;
  private static isMuted: boolean = false;
  private static masterVolume: number = 0.8; // 0.0 to 1.0 (defaults to 80% / -2dB)
  private static humOscillator: OscillatorNode | null = null;
  private static humGain: GainNode | null = null;

  // Zen Immersion Mode Focus Drone Nodes (40Hz Gamma binaural beat + soft pink noise)
  private static focusHumGain: GainNode | null = null;
  private static focusHumOsc1: OscillatorNode | null = null;
  private static focusHumOsc2: OscillatorNode | null = null;
  private static focusHumSubOsc: OscillatorNode | null = null;
  private static focusHumNoiseSource: AudioBufferSourceNode | null = null;
  private static focusHumFilter: BiquadFilterNode | null = null;
  private static isFocusHumRunning: boolean = false;
  private static focusStopTimer: any = null;

  // Mechanical Keystroke Shared Buffer
  private static clickNoiseBuffer: AudioBuffer | null = null;

  private static initialized: boolean = false;
  private static isPrimed: boolean = false;

  // Non-zero baseline constant to prevent DAC DC pop & AudioParam exponential ramp exceptions
  private static readonly EPSILON = 0.001;
  private static readonly MUTE_FLOOR = 0.0001;
  private static readonly NORMAL_GAIN = 0.45;

  // Voice dialect cache for Web Speech API
  private static voices: SpeechSynthesisVoice[] = [];
  private static speechInitialized: boolean = false;
  private static activeUtterance: SpeechSynthesisUtterance | null = null;

  /**
   * Initializes AudioContext, zero-latency priming listeners, and Web Speech subsystem.
   */
  public static init(): void {
    if (this.initialized) return;

    // Restore saved volume and mute states
    try {
      this.isMuted = StorageManager.isSoundMuted();
      const savedVol = localStorage.getItem('eng_master_volume');
      if (savedVol !== null) {
        const parsed = parseFloat(savedVol);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          this.masterVolume = parsed;
        }
      }
    } catch {
      this.isMuted = false;
      this.masterVolume = 0.8;
    }

    this.initSpeechVoices();

    const unlockEvents = ['pointerdown', 'touchstart', 'touchend', 'click', 'keydown'];

    const primeAudio = async () => {
      try {
        await this.ensureActiveContext();
        if (this.ctx && this.ctx.state === 'running') {
          this.isPrimed = true;
          unlockEvents.forEach((evt) => window.removeEventListener(evt, primeAudio));
        }
      } catch (err) {
        console.warn('[AUDIO] Audio prime attempt failed:', err);
      }
    };

    unlockEvents.forEach((evt) => {
      window.addEventListener(evt, primeAudio, { passive: true });
    });

    // Handle tab visibility resume
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
      });
    }

    this.initialized = true;
  }

  /**
   * Ensures AudioContext exists and is actively running with zero-latency priming.
   */
  public static async ensureActiveContext(): Promise<AudioContext | null> {
    if (typeof window === 'undefined') return null;

    if (!this.ctx || this.ctx.state === 'closed') {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return null;

        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        const effectiveGain = this.isMuted
          ? this.MUTE_FLOOR
          : Math.max(this.EPSILON, this.masterVolume * this.NORMAL_GAIN);

        this.masterGain.gain.setValueAtTime(effectiveGain, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        // Track context state transitions
        this.ctx.addEventListener('statechange', () => {
          if (this.ctx?.state === 'running') {
            if (!this.humOscillator) this.startUrchinHum();
            if (this.isFocusHumRunning && !this.focusHumGain) this.initFocusHumNodes();
          }
        });

        if (this.ctx.state === 'running') {
          this.startUrchinHum();
          if (this.isFocusHumRunning && !this.focusHumGain) this.initFocusHumNodes();
        }
      } catch (err) {
        console.warn('[AUDIO] Web Audio API initialization failed:', err);
        return null;
      }
    }

    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
        if (!this.humOscillator) {
          this.startUrchinHum();
        }
        if (this.isFocusHumRunning && !this.focusHumGain) {
          this.initFocusHumNodes();
        }
      } catch {
        // Will resume on subsequent user gesture
      }
    }

    return this.ctx;
  }

  public static getContext(): AudioContext | null {
    return this.ctx;
  }

  public static getMasterGain(): GainNode | null {
    return this.masterGain;
  }

  /**
   * Toggles master audio mute state with smooth exponential ramping.
   */
  public static toggleMute(): boolean {
    this.isMuted = StorageManager.toggleSoundMute();
    this.applyVolumeToBus();
    try {
      localStorage.setItem('eng_master_muted', String(this.isMuted));
    } catch {}
    return this.isMuted;
  }

  public static setMuted(state: boolean): void {
    this.isMuted = state;
    this.applyVolumeToBus();
    try {
      localStorage.setItem('eng_master_muted', String(this.isMuted));
    } catch {}
  }

  public static isMute(): boolean {
    return this.isMuted;
  }

  public static getMuteState(): boolean {
    return this.isMuted;
  }

  public static isAudioPrimed(): boolean {
    return this.isPrimed;
  }

  /**
   * Sets master volume level (0.0 to 1.0) and adjusts the master gain bus.
   */
  public static setMasterVolume(val: number): void {
    this.masterVolume = Math.max(0, Math.min(1, val));
    this.applyVolumeToBus();
    try {
      localStorage.setItem('eng_master_volume', String(this.masterVolume));
    } catch {}
  }

  public static getVolume(): number {
    return this.masterVolume;
  }

  private static applyVolumeToBus(): void {
    if (!this.masterGain || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      const currentGain = Math.max(this.MUTE_FLOOR, this.masterGain.gain.value);
      this.masterGain.gain.setValueAtTime(currentGain, now);

      const targetGain = this.isMuted
        ? this.MUTE_FLOOR
        : Math.max(this.EPSILON, this.masterVolume * this.NORMAL_GAIN);

      this.masterGain.gain.exponentialRampToValueAtTime(targetGain, now + 0.03);
    } catch {
      // Degrade gracefully
    }
  }

  /**
   * Plays a designated procedural sound effect with haptic tactile accompaniment.
   */
  public static play(type: SoundEffectType): void {
    if (this.isMuted) return;

    if (!this.ctx || this.ctx.state === 'suspended') {
      this.ensureActiveContext()
        .then(() => {
          if (!this.isMuted && this.ctx && this.ctx.state === 'running') {
            this.dispatchSound(type);
          }
        })
        .catch(() => {});
      return;
    }

    this.dispatchSound(type);
  }

  private static dispatchSound(type: SoundEffectType): void {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    switch (type) {
      case 'click':
        this.playTactileMicroClick(t);
        HapticEngine.trigger('selection');
        break;
      case 'implosion':
        this.playImplosion(t);
        HapticEngine.trigger('medium');
        break;
      case 'void-open':
        this.playVoidOpen(t);
        HapticEngine.trigger('light');
        break;
      case 'flip':
        this.playFlip(t);
        HapticEngine.trigger('light');
        break;
      case 'absorb':
        this.playAbsorb(t);
        HapticEngine.trigger('success');
        break;
      case 'alarm':
        this.playAlarm(t);
        HapticEngine.trigger('warning');
        break;
      case 'remind-drop':
        this.playRemindDrop(t);
        HapticEngine.trigger('medium');
        break;
      case 'level-up':
      case 'streak-fire':
        this.playHarmonicArpeggio(t);
        HapticEngine.trigger('success');
        break;
      case 'chime':
        this.playBellChime(t, 587.33); // D5
        HapticEngine.trigger('light');
        break;
      case 'ping':
        this.playBellChime(t, 880.0); // A5
        HapticEngine.trigger('light');
        break;
      case 'tick':
        this.playMetronomeTick(t);
        break;
      case 'gateway-hover':
        this.playGatewayResonance(t);
        break;
      case 'tour-step':
        this.playTourStep(t);
        HapticEngine.trigger('light');
        break;
      case 'tour-fanfare':
        this.playTourFanfare(t);
        HapticEngine.trigger('success');
        break;
      case 'stage-fanfare':
        this.playStageFanfare(t);
        HapticEngine.trigger('success');
        break;
      case 'radar-reveal':
        this.playRadarReveal(t);
        HapticEngine.trigger('success');
        break;
      case 'mechanical-click':
      case 'keystroke':
        this.dispatchMechanicalClick(1.0);
        break;
      case 'streak-chime':
        this.dispatchStreakChime(1);
        break;
      case 'xp-pickup':
        this.dispatchXpPickup();
        break;
      default:
        break;
    }
  }

  /**
   * Procedural Mechanical Keystroke Sound:
   * Combines high-frequency bandpass-filtered noise burst (transient switch click)
   * with a 120Hz resonant sine bottom-out thock.
   * Zero external audio files required.
   */
  public static playMechanicalClick(pitchMod: number = 1.0): void {
    if (this.isMuted) return;

    if (!this.ctx || this.ctx.state === 'suspended') {
      this.ensureActiveContext()
        .then(() => {
          if (!this.isMuted && this.ctx && this.ctx.state === 'running') {
            this.dispatchMechanicalClick(pitchMod);
          }
        })
        .catch(() => {});
      return;
    }

    this.dispatchMechanicalClick(pitchMod);
  }

  private static getClickNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (!this.clickNoiseBuffer || this.clickNoiseBuffer.sampleRate !== ctx.sampleRate) {
      const len = Math.floor(ctx.sampleRate * 0.04); // 40ms buffer
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      this.clickNoiseBuffer = buf;
    }
    return this.clickNoiseBuffer;
  }

  private static dispatchMechanicalClick(pitchMod: number = 1.0): void {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const clampedMod = Math.max(0.6, Math.min(1.8, pitchMod));

    try {
      // 1. High-frequency click transient (Bandpass filtered noise burst)
      const noiseBuffer = this.getClickNoiseBuffer(ctx);
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const clickFilter = ctx.createBiquadFilter();
      clickFilter.type = 'bandpass';
      clickFilter.frequency.setValueAtTime(3200 * clampedMod, t);
      clickFilter.Q.setValueAtTime(2.8, t);

      const clickGain = ctx.createGain();
      clickGain.gain.setValueAtTime(this.EPSILON, t);
      clickGain.gain.exponentialRampToValueAtTime(0.24, t + 0.001);
      clickGain.gain.exponentialRampToValueAtTime(this.EPSILON, t + 0.015);

      noiseSource.connect(clickFilter);
      clickFilter.connect(clickGain);
      clickGain.connect(this.masterGain);

      noiseSource.start(t);
      noiseSource.stop(t + 0.018);

      // 2. Resonant Bottom-out Thock (120Hz resonant body with pitch drop)
      const thockOsc = ctx.createOscillator();
      thockOsc.type = 'sine';
      thockOsc.frequency.setValueAtTime(120 * clampedMod, t);
      thockOsc.frequency.exponentialRampToValueAtTime(55 * clampedMod, t + 0.035);

      const thockFilter = ctx.createBiquadFilter();
      thockFilter.type = 'lowpass';
      thockFilter.frequency.setValueAtTime(320 * clampedMod, t);

      const thockGain = ctx.createGain();
      thockGain.gain.setValueAtTime(this.EPSILON, t);
      thockGain.gain.exponentialRampToValueAtTime(0.36, t + 0.0015);
      thockGain.gain.exponentialRampToValueAtTime(this.EPSILON, t + 0.040);

      thockOsc.connect(thockFilter);
      thockFilter.connect(thockGain);
      thockGain.connect(this.masterGain);

      thockOsc.start(t);
      thockOsc.stop(t + 0.042);

      HapticEngine.trigger('selection');
    } catch (err) {
      // Graceful fallback in test environments
    }
  }

  /**
   * Streak Combo Chime:
   * Ascending Just Intonation harmonic arpeggio escalating with combo multiplier.
   */
  public static playStreakChime(comboCount: number = 1): void {
    if (this.isMuted) return;

    if (!this.ctx || this.ctx.state === 'suspended') {
      this.ensureActiveContext()
        .then(() => {
          if (!this.isMuted && this.ctx && this.ctx.state === 'running') {
            this.dispatchStreakChime(comboCount);
          }
        })
        .catch(() => {});
      return;
    }

    this.dispatchStreakChime(comboCount);
  }

  private static dispatchStreakChime(comboCount: number = 1): void {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;

    try {
      // Just Intonation harmonic ratios: 1/1, 5/4 (major third), 3/2 (perfect fifth), 15/8, 2/1 (octave)
      const baseFreq = 440 * (comboCount >= 10 ? 1.25 : 1.0);
      const allRatios = [1.0, 1.25, 1.5, 1.875, 2.0];
      const noteCount = Math.min(5, Math.max(2, Math.floor(comboCount / 3) + 2));

      for (let i = 0; i < noteCount; i++) {
        const freq = baseFreq * allRatios[i];
        const delay = i * 0.045;
        const dur = 0.24;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + delay);

        const nStart = t + delay;
        const nEnd = nStart + dur;

        gain.gain.setValueAtTime(this.EPSILON, nStart);
        gain.gain.exponentialRampToValueAtTime(0.25, nStart + 0.003);
        gain.gain.exponentialRampToValueAtTime(this.EPSILON, nEnd - 0.005);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(nStart);
        osc.stop(nEnd);
      }

      HapticEngine.trigger('success');
    } catch {}
  }

  /**
   * XP Pickup Chime:
   * Sparkling ascending crystal chime for XP increments.
   */
  public static playXpPickup(): void {
    if (this.isMuted) return;

    if (!this.ctx || this.ctx.state === 'suspended') {
      this.ensureActiveContext()
        .then(() => {
          if (!this.isMuted && this.ctx && this.ctx.state === 'running') {
            this.dispatchXpPickup();
          }
        })
        .catch(() => {});
      return;
    }

    this.dispatchXpPickup();
  }

  private static dispatchXpPickup(): void {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;

    try {
      // 3 ascending crystal tones: 784Hz (G5), 1046.5Hz (C6), 1318.5Hz (E6)
      const notes = [
        { freq: 783.99, delay: 0.0, dur: 0.18, peak: 0.20 },
        { freq: 1046.50, delay: 0.05, dur: 0.20, peak: 0.22 },
        { freq: 1318.51, delay: 0.10, dur: 0.26, peak: 0.25 }
      ];

      notes.forEach(({ freq, delay, dur, peak }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + delay);

        const nStart = t + delay;
        const nEnd = nStart + dur;

        gain.gain.setValueAtTime(this.EPSILON, nStart);
        gain.gain.exponentialRampToValueAtTime(peak, nStart + 0.003);
        gain.gain.exponentialRampToValueAtTime(this.EPSILON, nEnd - 0.005);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(nStart);
        osc.stop(nEnd);
      });

      HapticEngine.trigger('light');
    } catch {}
  }

  /**
   * Tactile 8-10ms micro-click with triangle wave and exponential decay.
   */
  private static playTactileMicroClick(t: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.008);

    gain.gain.setValueAtTime(this.EPSILON, t);
    gain.gain.exponentialRampToValueAtTime(0.28, t + 0.001);
    gain.gain.exponentialRampToValueAtTime(this.EPSILON, t + 0.012);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.014);
  }

  /**
   * Card Flip Whoosh: Resonant mechanical flip snap.
   */
  private static playFlip(t: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.035);

    gain.gain.setValueAtTime(this.EPSILON, t);
    gain.gain.exponentialRampToValueAtTime(0.25, t + 0.002);
    gain.gain.exponentialRampToValueAtTime(this.EPSILON, t + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.045);
  }

  /**
   * Collocation Absorption: Resonant downward-to-upward bandpass sweep.
   */
  private static playAbsorb(t: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.18);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, t);
    filter.Q.setValueAtTime(3.0, t);

    gain.gain.setValueAtTime(this.EPSILON, t);
    gain.gain.exponentialRampToValueAtTime(0.35, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(this.EPSILON, t + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.24);
  }

  /**
   * Pythagorean Just Intonation Success Arpeggio:
   * Root (440Hz), Major Third 5:4 (550Hz), Perfect Fifth 3:2 (660Hz), Octave 2:1 (880Hz).
   */
  private static playHarmonicArpeggio(t: number): void {
    if (!this.ctx || !this.masterGain) return;

    const root = 440;
    const notes = [
      { freq: root, delay: 0.0, dur: 0.28, peak: 0.22 },
      { freq: root * 1.25, delay: 0.055, dur: 0.28, peak: 0.24 }, // 550 Hz
      { freq: root * 1.5, delay: 0.11, dur: 0.32, peak: 0.26 },  // 660 Hz
      { freq: root * 2.0, delay: 0.165, dur: 0.38, peak: 0.3 }   // 880 Hz
    ];

    notes.forEach(({ freq, delay, dur, peak }) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + delay);

      const nStart = t + delay;
      const nEnd = nStart + dur;

      gain.gain.setValueAtTime(this.EPSILON, nStart);
      gain.gain.exponentialRampToValueAtTime(peak, nStart + 0.004);
      gain.gain.exponentialRampToValueAtTime(this.EPSILON, nEnd - 0.005);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(nStart);
      osc.stop(nEnd);
    });
  }

  private static playBellChime(t: number, freq: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(this.EPSILON, t);
    gain.gain.exponentialRampToValueAtTime(0.22, t + 0.003);
    gain.gain.exponentialRampToValueAtTime(this.EPSILON, t + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.32);
  }

  private static playMetronomeTick(t: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, t);

    gain.gain.setValueAtTime(this.EPSILON, t);
    gain.gain.exponentialRampToValueAtTime(0.12, t + 0.001);
    gain.gain.exponentialRampToValueAtTime(this.EPSILON, t + 0.02);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.025);
  }

  private static playWarningPulse(t: number): void {
    if (!this.ctx || !this.masterGain) return;

    [0, 0.12].forEach((offset) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(260, t + offset);

      gain.gain.setValueAtTime(this.EPSILON, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.12, t + offset + 0.002);
      gain.gain.exponentialRampToValueAtTime(this.EPSILON, t + offset + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(t + offset);
      osc.stop(t + offset + 0.09);
    });
  }

  private static playAlarm(t: number): void {
    this.playWarningPulse(t);
  }

  private static playRemindDrop(t: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(480, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.09);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(700, t);
    filter.frequency.exponentialRampToValueAtTime(220, t + 0.09);
    filter.Q.setValueAtTime(3.5, t);

    gain.gain.setValueAtTime(this.EPSILON, t);
    gain.gain.exponentialRampToValueAtTime(0.3, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(this.EPSILON, t + 0.095);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  private static playGatewayResonance(t: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.linearRampToValueAtTime(228, t + 0.08);

    gain.gain.setValueAtTime(this.EPSILON, t);
    gain.gain.linearRampToValueAtTime(0.1, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(this.EPSILON, t + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.14);
  }

  private static playImplosion(t: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.07);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, t);
    filter.frequency.linearRampToValueAtTime(120, t + 0.07);

    gain.gain.setValueAtTime(this.EPSILON, t);
    gain.gain.exponentialRampToValueAtTime(0.4, t + 0.003);
    gain.gain.exponentialRampToValueAtTime(this.EPSILON, t + 0.075);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  private static playVoidOpen(t: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(110, t);
    osc1.frequency.exponentialRampToValueAtTime(480, t + 0.22);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(165, t);
    osc2.frequency.exponentialRampToValueAtTime(720, t + 0.22);

    gain.gain.setValueAtTime(this.EPSILON, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.18);
    gain.gain.exponentialRampToValueAtTime(this.EPSILON, t + 0.25);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.26);
    osc2.stop(t + 0.26);
  }

  private static startUrchinHum(): void {
    if (!this.ctx || !this.masterGain || this.humOscillator) return;
    try {
      this.humOscillator = this.ctx.createOscillator();
      this.humGain = this.ctx.createGain();

      this.humOscillator.type = 'sine';
      this.humOscillator.frequency.setValueAtTime(65, this.ctx.currentTime);

      this.humGain.gain.setValueAtTime(this.EPSILON, this.ctx.currentTime);
      this.humGain.gain.exponentialRampToValueAtTime(0.06, this.ctx.currentTime + 0.2);

      this.humOscillator.connect(this.humGain);
      this.humGain.connect(this.masterGain);
      this.humOscillator.start();
    } catch {
      // Ignored if browser blocks background oscillator
    }
  }

  /**
   * Starts gentle 40Hz binaural audio drone with soft pink noise at gain 0.04
   * for Zen Focus Mode.
   */
  public static startFocusHum(): void {
    this.isFocusHumRunning = true;
    if (this.focusStopTimer) {
      clearTimeout(this.focusStopTimer);
      this.focusStopTimer = null;
    }

    if (!this.ctx || this.ctx.state === 'suspended') {
      this.ensureActiveContext()
        .then(() => {
          if (!this.isFocusHumRunning || !this.ctx || !this.masterGain) return;
          this.initFocusHumNodes();
        })
        .catch(() => {});
      return;
    }

    this.initFocusHumNodes();
  }

  /**
   * Stops the Zen Focus Mode audio drone with smooth exponential ramp-down and clean node teardown.
   */
  public static stopFocusHum(): void {
    this.isFocusHumRunning = false;
    if (this.focusStopTimer) {
      clearTimeout(this.focusStopTimer);
      this.focusStopTimer = null;
    }

    if (!this.ctx || !this.focusHumGain) {
      this.cleanupFocusHumNodes();
      return;
    }

    try {
      const t = this.ctx.currentTime;
      this.focusHumGain.gain.cancelScheduledValues(t);
      const curVal = Math.max(this.MUTE_FLOOR, this.focusHumGain.gain.value);
      this.focusHumGain.gain.setValueAtTime(curVal, t);
      this.focusHumGain.gain.exponentialRampToValueAtTime(this.MUTE_FLOOR, t + 0.35);

      this.focusStopTimer = setTimeout(() => {
        if (!this.isFocusHumRunning) {
          this.cleanupFocusHumNodes();
        }
      }, 380);
    } catch {
      this.cleanupFocusHumNodes();
    }
  }

  public static isFocusHumActive(): boolean {
    return this.isFocusHumRunning;
  }

  private static initFocusHumNodes(): void {
    if (!this.ctx || !this.masterGain || this.focusHumGain) return;

    try {
      const ctx = this.ctx;
      const t = ctx.currentTime;

      // Master focus gain clamped to 0.04
      const masterFocusGain = ctx.createGain();
      masterFocusGain.gain.setValueAtTime(this.EPSILON, t);
      masterFocusGain.gain.exponentialRampToValueAtTime(0.04, t + 0.5);
      masterFocusGain.connect(this.masterGain);
      this.focusHumGain = masterFocusGain;

      // 1. Binaural Beat Pair: 200 Hz (Left) and 240 Hz (Right) -> 40 Hz Gamma difference
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(200, t);

      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(240, t);

      const hasPanner = typeof ctx.createStereoPanner === 'function';
      if (hasPanner) {
        const pan1 = ctx.createStereoPanner();
        pan1.pan.setValueAtTime(-0.8, t);
        osc1.connect(pan1);
        pan1.connect(masterFocusGain);

        const pan2 = ctx.createStereoPanner();
        pan2.pan.setValueAtTime(0.8, t);
        osc2.connect(pan2);
        pan2.connect(masterFocusGain);
      } else {
        osc1.connect(masterFocusGain);
        osc2.connect(masterFocusGain);
      }

      // 2. Direct 40Hz sub-bass sine tone
      const subOsc = ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(40, t);
      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.5, t);
      subOsc.connect(subGain);
      subGain.connect(masterFocusGain);

      // 3. Soft Pink Noise floor (Kellet filter algorithm)
      const sampleRate = ctx.sampleRate || 44100;
      const bufferSize = Math.floor(sampleRate * 2); // 2-second looped buffer
      const noiseBuffer = ctx.createBuffer(1, bufferSize, sampleRate);
      const data = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(320, t);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(masterFocusGain);

      // Start sound sources
      osc1.start(t);
      osc2.start(t);
      subOsc.start(t);
      noiseSource.start(t);

      this.focusHumOsc1 = osc1;
      this.focusHumOsc2 = osc2;
      this.focusHumSubOsc = subOsc;
      this.focusHumNoiseSource = noiseSource;
      this.focusHumFilter = noiseFilter;
    } catch (err) {
      console.warn('[AUDIO] Error initializing focus hum nodes:', err);
      this.cleanupFocusHumNodes();
    }
  }

  private static cleanupFocusHumNodes(): void {
    try {
      if (this.focusHumOsc1) {
        this.focusHumOsc1.stop();
        this.focusHumOsc1.disconnect();
      }
    } catch {}
    try {
      if (this.focusHumOsc2) {
        this.focusHumOsc2.stop();
        this.focusHumOsc2.disconnect();
      }
    } catch {}
    try {
      if (this.focusHumSubOsc) {
        this.focusHumSubOsc.stop();
        this.focusHumSubOsc.disconnect();
      }
    } catch {}
    try {
      if (this.focusHumNoiseSource) {
        this.focusHumNoiseSource.stop();
        this.focusHumNoiseSource.disconnect();
      }
    } catch {}
    try {
      if (this.focusHumFilter) {
        this.focusHumFilter.disconnect();
      }
    } catch {}
    try {
      if (this.focusHumGain) {
        this.focusHumGain.disconnect();
      }
    } catch {}

    this.focusHumOsc1 = null;
    this.focusHumOsc2 = null;
    this.focusHumSubOsc = null;
    this.focusHumNoiseSource = null;
    this.focusHumFilter = null;
    this.focusHumGain = null;
  }

  /**
   * Tour Step: Ascending micro-tone blip (587.33Hz -> 880Hz, 65ms).
   */
  private static playTourStep(t: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, t);
    osc.frequency.exponentialRampToValueAtTime(880.0, t + 0.055);

    gain.gain.setValueAtTime(this.EPSILON, t);
    gain.gain.exponentialRampToValueAtTime(0.24, t + 0.003);
    gain.gain.exponentialRampToValueAtTime(this.EPSILON, t + 0.06);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.065);
  }

  /**
   * Tour Fanfare: 4-note ascending major arpeggio (C5 -> E5 -> G5 -> C6, Just Intonation, 480ms).
   */
  private static playTourFanfare(t: number): void {
    if (!this.ctx || !this.masterGain) return;

    const notes = [
      { freq: 523.25, delay: 0.0, dur: 0.22, peak: 0.22 },      // C5
      { freq: 654.06, delay: 0.08, dur: 0.22, peak: 0.24 },     // E5 (5/4)
      { freq: 784.88, delay: 0.16, dur: 0.24, peak: 0.26 },     // G5 (3/2)
      { freq: 1046.50, delay: 0.24, dur: 0.24, peak: 0.30 }     // C6 (2/1)
    ];

    notes.forEach(({ freq, delay, dur, peak }) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + delay);

      const nStart = t + delay;
      const nEnd = nStart + dur;

      gain.gain.setValueAtTime(this.EPSILON, nStart);
      gain.gain.exponentialRampToValueAtTime(peak, nStart + 0.005);
      gain.gain.exponentialRampToValueAtTime(this.EPSILON, nEnd - 0.005);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(nStart);
      osc.stop(nEnd);
    });
  }

  /**
   * Stage Fanfare: Triumphant ascending arpeggio for multi-skill stage completion.
   */
  private static playStageFanfare(t: number): void {
    this.playTourFanfare(t);
  }

  /**
   * Radar Reveal: 5-note celestial pentatonic arpeggio (D4 -> F#4 -> A4 -> C#5 -> E5, 600ms)
   * representing the 5 axes of the Celestial Radar Profile Pentagram.
   * Synthesized with pure sines, 4ms micro-attacks from non-zero EPSILON, and smooth exponential decays.
   */
  private static playRadarReveal(t: number): void {
    if (!this.ctx || !this.masterGain) return;

    const notes = [
      { freq: 293.66, delay: 0.00, dur: 0.35, peak: 0.20 }, // D4 (Vocab)
      { freq: 369.99, delay: 0.09, dur: 0.35, peak: 0.22 }, // F#4 (Grammar)
      { freq: 440.00, delay: 0.18, dur: 0.38, peak: 0.24 }, // A4 (Reading)
      { freq: 554.37, delay: 0.27, dur: 0.40, peak: 0.26 }, // C#5 (Listening)
      { freq: 659.25, delay: 0.36, dur: 0.45, peak: 0.28 }  // E5 (Writing)
    ];

    notes.forEach(({ freq, delay, dur, peak }) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + delay);

      const nStart = t + delay;
      const nEnd = nStart + dur;

      gain.gain.setValueAtTime(this.EPSILON, nStart);
      gain.gain.exponentialRampToValueAtTime(peak, nStart + 0.004);
      gain.gain.exponentialRampToValueAtTime(this.EPSILON, nEnd - 0.004);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(nStart);
      osc.stop(nEnd);
    });
  }

  // =========================================================================
  // WEB SPEECH API TELEMETRY & VOICE DIALECT FALLBACK SUBSYSTEM
  // =========================================================================

  public static initSpeechVoices(): void {
    if (this.speechInitialized || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const updateVoices = () => {
      try {
        const loaded = window.speechSynthesis.getVoices();
        if (loaded && loaded.length > 0) {
          this.voices = loaded;
        }
      } catch (err) {
        console.warn('[SPEECH] Error fetching voices:', err);
      }
    };

    updateVoices();
    if ('onvoiceschanged' in window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    this.speechInitialized = true;
  }

  public static getPreferredEnglishVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

    const available = this.voices.length > 0 ? this.voices : window.speechSynthesis.getVoices();
    if (!available || available.length === 0) return null;

    // 1. Exact 'en-US' or 'en_US'
    const exactUS = available.find(
      (v) => v.lang === 'en-US' || v.lang === 'en_US'
    );
    if (exactUS) return exactUS;

    // 2. Fuzzy US English (e.g. en-us-x-sfg)
    const fuzzyUS = available.find(
      (v) => v.lang.toLowerCase().replace('_', '-').startsWith('en-us')
    );
    if (fuzzyUS) return fuzzyUS;

    // 3. Fallback: British English 'en-GB'
    const britishGB = available.find(
      (v) => v.lang.toLowerCase().replace('_', '-').startsWith('en-gb')
    );
    if (britishGB) return britishGB;

    // 4. Fallback: Any English regional dialect
    const anyEnglish = available.find(
      (v) => v.lang.toLowerCase().startsWith('en')
    );
    if (anyEnglish) return anyEnglish;

    // 5. Fallback: System default voice
    const systemDefault = available.find((v) => v.default);
    if (systemDefault) return systemDefault;

    // 6. Return first voice if present
    return available[0] || null;
  }

  public static speak(text: string, rate: number = 0.95): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('[SPEECH] Web Speech API not supported in this environment.');
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = this.getPreferredEnglishVoice();

      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = 'en-US';
      }

      utterance.rate = rate;

      this.activeUtterance = utterance;
      utterance.onend = () => {
        this.activeUtterance = null;
      };
      utterance.onerror = (e) => {
        console.warn('[SPEECH] Playback error or cancelled:', e);
        this.activeUtterance = null;
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[SPEECH] Speech playback failed:', err);
    }
  }

  public static getActiveUtterance(): SpeechSynthesisUtterance | null {
    return this.activeUtterance;
  }

  public static stopSpeech(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    this.activeUtterance = null;
  }
}
