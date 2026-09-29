import { StorageManager } from '../utils/storage';

export type SoundEffectType =
  | 'click'
  | 'implosion'
  | 'void-open'
  | 'urchin-hum'
  | 'flip'
  | 'absorb'
  | 'alarm';

export class AudioSynthesizer {
  private static ctx: AudioContext | null = null;
  private static masterGain: GainNode | null = null;
  private static isMuted: boolean = false;
  private static humOscillator: OscillatorNode | null = null;
  private static humGain: GainNode | null = null;
  private static initialized: boolean = false;

  /**
   * Lazy initializes AudioContext on first user gesture.
   */
  public static init(): void {
    if (this.initialized) return;

    this.isMuted = StorageManager.isSoundMuted();

    const initAudio = () => {
      if (this.ctx) return;
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.45, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
        this.initialized = true;

        // Start subtle urchin ambient hum
        this.startUrchinHum();
      } catch (err) {
        console.warn('[AUDIO] Web Audio API not supported or blocked:', err);
      }

      window.removeEventListener('pointerdown', initAudio);
      window.removeEventListener('keydown', initAudio);
    };

    window.addEventListener('pointerdown', initAudio, { once: true });
    window.addEventListener('keydown', initAudio, { once: true });
  }

  public static toggleMute(): boolean {
    this.isMuted = StorageManager.toggleSoundMute();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(
        this.isMuted ? 0 : 0.45,
        this.ctx.currentTime
      );
    }
    return this.isMuted;
  }

  public static isMute(): boolean {
    return this.isMuted;
  }

  public static play(type: SoundEffectType): void {
    if (!this.ctx || this.isMuted || this.ctx.state === 'suspended') {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

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
      default:
        break;
    }
  }

  /**
   * 1800Hz sine burst with 8ms exponential decay.
   */
  private static playClick(t: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.012);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.015);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.016);
  }

  /**
   * Vacuum pop: Pitch drops from 320Hz down to 50Hz over 70ms with lowpass filter.
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

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.075);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  /**
   * Dual-oscillator reverse-whoosh: 120Hz -> 480Hz crescendo with white noise texture.
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

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.18);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.26);
    osc2.stop(t + 0.26);
  }

  /**
   * 400Hz soft mechanical card snap.
   */
  private static playFlip(t: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.035);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.045);
  }

  /**
   * Upward resonant chime (520Hz -> 1040Hz) with 180ms decay.
   */
  private static playAbsorb(t: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.exponentialRampToValueAtTime(1040, t + 0.18);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.23);
  }

  /**
   * Alert tone (880Hz).
   */
  private static playAlarm(t: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(880, t);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  /**
   * Continuous sub-bass 65Hz hum for Sea Urchin singularity.
   */
  private static startUrchinHum(): void {
    if (!this.ctx || !this.masterGain || this.humOscillator) return;
    try {
      this.humOscillator = this.ctx.createOscillator();
      this.humGain = this.ctx.createGain();

      this.humOscillator.type = 'sine';
      this.humOscillator.frequency.setValueAtTime(65, this.ctx.currentTime);

      this.humGain.gain.setValueAtTime(0.06, this.ctx.currentTime);

      this.humOscillator.connect(this.humGain);
      this.humGain.connect(this.masterGain);
      this.humOscillator.start();
    } catch {
      // Ignored if browser blocks background oscillator
    }
  }
}
