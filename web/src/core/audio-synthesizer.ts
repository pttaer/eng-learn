import { StorageManager } from '../utils/storage';

export type SoundEffectType =
  | 'click'
  | 'implosion'
  | 'void-open'
  | 'urchin-hum'
  | 'flip'
  | 'absorb'
  | 'alarm'
  | 'remind-drop'
  | 'level-up';

export class AudioSynthesizer {
  private static ctx: AudioContext | null = null;
  private static masterGain: GainNode | null = null;
  private static isMuted: boolean = false;
  private static humOscillator: OscillatorNode | null = null;
  private static humGain: GainNode | null = null;
  private static initialized: boolean = false;

  // Non-zero baseline constant to prevent DAC pop & AudioParam exponential ramp errors
  private static readonly EPSILON = 0.001;
  private static readonly MUTE_FLOOR = 0.0001;
  private static readonly NORMAL_GAIN = 0.45;

  // Voice dialect cache for Web Speech API
  private static voices: SpeechSynthesisVoice[] = [];
  private static speechInitialized: boolean = false;
  private static activeUtterance: SpeechSynthesisUtterance | null = null;

  /**
   * Initializes AudioContext and Web Speech subsystem on first user gesture.
   */
  public static init(): void {
    if (this.initialized) return;

    this.isMuted = StorageManager.isSoundMuted();
    this.initSpeechVoices();

    const unlockEvents = ['pointerdown', 'touchstart', 'touchend', 'click', 'keydown'];

    const unlockAudio = async () => {
      try {
        await this.ensureActiveContext();
        if (this.ctx && this.ctx.state === 'running') {
          // Remove listeners once successfully unlocked and running
          unlockEvents.forEach((evt) => window.removeEventListener(evt, unlockAudio));
        }
      } catch (err) {
        console.warn('[AUDIO] Audio unlock attempt failed:', err);
      }
    };

    unlockEvents.forEach((evt) => {
      window.addEventListener(evt, unlockAudio, { passive: true });
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
   * Ensures AudioContext exists and is actively running.
   */
  public static async ensureActiveContext(): Promise<AudioContext | null> {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return null;

        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(
          this.isMuted ? this.MUTE_FLOOR : this.NORMAL_GAIN,
          this.ctx.currentTime
        );
        this.masterGain.connect(this.ctx.destination);

        // Track context state transitions
        this.ctx.addEventListener('statechange', () => {
          if (this.ctx?.state === 'running' && !this.humOscillator) {
            this.startUrchinHum();
          }
        });

        // Start subtle urchin ambient hum if already running
        if (this.ctx.state === 'running') {
          this.startUrchinHum();
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
      } catch {
        // Will resume on subsequent user interaction
      }
    }

    return this.ctx;
  }

  public static toggleMute(): boolean {
    this.isMuted = StorageManager.toggleSoundMute();
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      const currentGain = Math.max(this.MUTE_FLOOR, this.masterGain.gain.value);
      this.masterGain.gain.setValueAtTime(currentGain, now);
      const targetGain = this.isMuted ? this.MUTE_FLOOR : this.NORMAL_GAIN;
      this.masterGain.gain.exponentialRampToValueAtTime(targetGain, now + 0.03);
    }
    return this.isMuted;
  }

  public static isMute(): boolean {
    return this.isMuted;
  }

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
        this.playClick(t);
        break;
      case 'implosion':
        this.playImplosion(t);
        break;
      case 'void-open':
        this.playVoidOpen(t);
        break;
      case 'flip':
        this.playFlip(t);
        break;
      case 'absorb':
        this.playAbsorb(t);
        break;
      case 'alarm':
        this.playAlarm(t);
        break;
      case 'remind-drop':
        this.playRemindDrop(t);
        break;
      case 'level-up':
        this.playLevelUp(t);
        break;
      default:
        break;
    }
  }

  /**
   * 1800Hz sine burst with micro-attack and exponential decay to non-zero baseline (0.001).
   */
  private static playClick(t: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.012);

    // Micro-attack (2ms) from EPSILON baseline, then decay to EPSILON baseline
    gain.gain.setValueAtTime(this.EPSILON, t);
    gain.gain.exponentialRampToValueAtTime(0.3, t + 0.002);
    gain.gain.exponentialRampToValueAtTime(this.EPSILON, t + 0.015);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.016);
  }

  /**
   * Vacuum pop: Pitch drops from 320Hz down to 45Hz over 70ms with lowpass filter and pop-free envelope.
   */
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

  /**
   * Dual-oscillator reverse-whoosh: 110Hz/165Hz -> 480Hz/720Hz crescendo with smooth baseline.
   */
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

  /**
   * 440Hz -> 220Hz soft mechanical card snap with pop-free ramp.
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
   * Upward resonant chime (520Hz -> 1040Hz) with 220ms decay to non-zero baseline.
   */
  private static playAbsorb(t: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.exponentialRampToValueAtTime(1040, t + 0.18);

    gain.gain.setValueAtTime(this.EPSILON, t);
    gain.gain.exponentialRampToValueAtTime(0.3, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(this.EPSILON, t + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.23);
  }

  /**
   * Alert tone (880Hz) with attack and decay ramps to non-zero baseline.
   */
  private static playAlarm(t: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(880, t);

    gain.gain.setValueAtTime(this.EPSILON, t);
    gain.gain.exponentialRampToValueAtTime(0.15, t + 0.002);
    gain.gain.exponentialRampToValueAtTime(this.EPSILON, t + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  /**
   * Glitch/warp frequency chirp (480Hz -> 180Hz drop with high-pass modulation, 100ms) for Remind Card injection.
   */
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

    // Micro-attack from EPSILON baseline, then decay back to EPSILON baseline (100ms total)
    gain.gain.setValueAtTime(this.EPSILON, t);
    gain.gain.exponentialRampToValueAtTime(0.3, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(this.EPSILON, t + 0.095);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.10);
  }

  /**
   * Ascending resonant arpeggio/chime (440Hz -> 660Hz -> 880Hz, 240ms) for vocabulary tier ascension.
   */
  private static playLevelUp(t: number): void {
    if (!this.ctx || !this.masterGain) return;

    const notes = [
      { freq: 440, start: 0, dur: 0.09, peak: 0.25 },
      { freq: 660, start: 0.07, dur: 0.09, peak: 0.28 },
      { freq: 880, start: 0.14, dur: 0.10, peak: 0.32 }
    ];

    notes.forEach(({ freq, start, dur, peak }) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + start);

      const nStart = t + start;
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
   * Continuous sub-bass 65Hz hum for Sea Urchin singularity with pop-free fade-in.
   */
  private static startUrchinHum(): void {
    if (!this.ctx || !this.masterGain || this.humOscillator) return;
    try {
      this.humOscillator = this.ctx.createOscillator();
      this.humGain = this.ctx.createGain();

      this.humOscillator.type = 'sine';
      this.humOscillator.frequency.setValueAtTime(65, this.ctx.currentTime);

      // Soft fade-in from EPSILON baseline to 0.06
      this.humGain.gain.setValueAtTime(this.EPSILON, this.ctx.currentTime);
      this.humGain.gain.exponentialRampToValueAtTime(0.06, this.ctx.currentTime + 0.2);

      this.humOscillator.connect(this.humGain);
      this.humGain.connect(this.masterGain);
      this.humOscillator.start();
    } catch {
      // Ignored if browser blocks background oscillator
    }
  }

  // =========================================================================
  // WEB SPEECH API TELEMETRY & VOICE DIALECT FALLBACK SUBSYSTEM
  // =========================================================================

  /**
   * Pre-fetches and registers voices for Web Speech synthesis across browsers.
   */
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

  /**
   * Resolves the best available English voice with graceful fallbacks:
   * 1. Exact 'en-US'
   * 2. Any US English dialect variant
   * 3. Fallback to British English 'en-GB'
   * 4. Fallback to any English dialect (en-CA, en-AU, etc.)
   * 5. Fallback to browser/system default voice
   */
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

  /**
   * Synthesizes speech with robust voice resolution, queue clearing, and dialect fallbacks.
   * Safe across Lexicon, Listening, Speaking, and Writing dossiers.
   */
  public static speak(text: string, rate: number = 0.95): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('[SPEECH] Web Speech API not supported in this environment.');
      return;
    }

    try {
      // Cancel previous utterance to prevent queue deadlock in Chromium/WebKit
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

      // Keep active reference to avoid Chromium GC bug during speech playback
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
}

