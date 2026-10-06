import { StorageManager } from '../utils/storage';
import { AudioSynthesizer } from './audio-synthesizer';

export type AmbientMusicMode = 'off' | 'calm-chords' | 'celestial-void' | 'zen-drone';

export const AMBIENT_MODES: readonly AmbientMusicMode[] = ['off', 'calm-chords', 'celestial-void', 'zen-drone'];

export const AMBIENT_MODE_LABELS: Record<AmbientMusicMode, string> = {
  'off': 'Off',
  'calm-chords': 'Calm Chords',
  'celestial-void': 'Celestial Void',
  'zen-drone': 'Zen Drone'
};

export interface SoundscapeInstance {
  mode: AmbientMusicMode;
  busGain: GainNode;
  oscillators: (OscillatorNode | AudioBufferSourceNode)[];
  cleanup: () => void;
}

/**
 * Procedural Ambient Music Synth Engine & Dual Audio Bus.
 * Provides zero-bundle background music synthesis via native Web Audio API
 * with complete dual-bus isolation from SFX (`AudioSynthesizer.masterGain`).
 */
export class AmbientMusicEngine {
  private static instance: AmbientMusicEngine | null = null;

  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;

  private currentMode: AmbientMusicMode = 'off';
  private targetMode: AmbientMusicMode = 'off';
  private musicVolume: number = 0.35; // default 0.35 (0.0 to 1.0 clamped)

  private activeSoundscape: SoundscapeInstance | null = null;
  private fadingSoundscapes: SoundscapeInstance[] = [];

  private initialized: boolean = false;
  private isPrimed: boolean = false;
  private pinkNoiseBuffer: AudioBuffer | null = null;

  private subscribers: Set<(mode: AmbientMusicMode, volume: number) => void> = new Set();

  public static readonly EPSILON = 0.0001;
  public static readonly CROSSFADE_DURATION = 1.5; // 1.5s seamless crossfade
  public static readonly MUSIC_SCALING = 0.5; // Baseline musical headroom
  public static readonly DEFAULT_VOLUME = 0.35;

  constructor() {
    this.restoreStoredSettings();
  }

  /**
   * Singleton accessor.
   */
  public static getInstance(): AmbientMusicEngine {
    if (!AmbientMusicEngine.instance) {
      AmbientMusicEngine.instance = new AmbientMusicEngine();
    }
    return AmbientMusicEngine.instance;
  }

  /**
   * Restores persisted music settings from StorageManager / localStorage.
   */
  private restoreStoredSettings(): void {
    try {
      this.musicVolume = StorageManager.getMusicVolume();
      const storedMode = StorageManager.getMusicMode() as AmbientMusicMode;
      if (['off', 'calm-chords', 'celestial-void', 'zen-drone'].includes(storedMode)) {
        this.targetMode = storedMode;
      }
    } catch {
      this.musicVolume = AmbientMusicEngine.DEFAULT_VOLUME;
      this.targetMode = 'off';
    }
  }

  /**
   * Initializes audio priming listeners, visibility handling, and initial context.
   */
  public init(): void {
    if (this.initialized) return;

    if (typeof window !== 'undefined') {
      const unlockEvents = ['pointerdown', 'touchstart', 'touchend', 'click', 'keydown'];
      const primeAudio = async () => {
        try {
          await this.ensureActiveContext();
          if (this.ctx && this.ctx.state === 'running') {
            this.isPrimed = true;
            unlockEvents.forEach((evt) => window.removeEventListener(evt, primeAudio));
            if (this.targetMode !== 'off' && this.currentMode !== this.targetMode) {
              this.applyMode(this.targetMode);
            }
          }
        } catch (err) {
          console.warn('[MUSIC] Prime attempt failed:', err);
        }
      };

      unlockEvents.forEach((evt) => {
        window.addEventListener(evt, primeAudio, { passive: true });
      });

      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible' && this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
          }
        });
      }
    }

    this.initialized = true;
  }

  /**
   * Ensures an active AudioContext exists with dual-bus isolation:
   * routes `musicGain` independently to `ctx.destination`.
   */
  public async ensureActiveContext(): Promise<AudioContext | null> {
    if (typeof window === 'undefined') return null;

    if (!this.ctx || this.ctx.state === 'closed') {
      try {
        // Share AudioSynthesizer context if available to prevent multiple AudioContext limits
        let sharedCtx = AudioSynthesizer.getContext();
        if (!sharedCtx) {
          sharedCtx = await AudioSynthesizer.ensureActiveContext();
        }

        if (!sharedCtx) {
          const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
          if (!AudioCtxClass) return null;
          this.ctx = new AudioCtxClass();
        } else {
          this.ctx = sharedCtx;
        }

        // Construct independent musicGain routed directly to destination
        this.musicGain = this.ctx.createGain();
        const initialGain = this.currentMode === 'off'
          ? AmbientMusicEngine.EPSILON
          : Math.max(AmbientMusicEngine.EPSILON, this.musicVolume * AmbientMusicEngine.MUSIC_SCALING);

        this.musicGain.gain.setValueAtTime(initialGain, this.ctx.currentTime);
        this.musicGain.connect(this.ctx.destination);

        this.ctx.addEventListener('statechange', () => {
          if (this.ctx?.state === 'running') {
            if (this.targetMode !== 'off' && this.currentMode !== this.targetMode) {
              this.applyMode(this.targetMode);
            }
          }
        });
      } catch (err) {
        console.warn('[MUSIC] Web Audio API context setup failed:', err);
        return null;
      }
    }

    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch {
        // Will resume on subsequent user gesture
      }
    }

    return this.ctx;
  }

  /**
   * Sets music volume (0.0 to 1.0 clamped) with smooth pop-free ramping.
   */
  public setMusicVolume(val: number): void {
    this.musicVolume = Math.max(0, Math.min(1, val));
    try {
      StorageManager.setMusicVolume(this.musicVolume);
    } catch {}

    if (this.musicGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.musicGain.gain.cancelScheduledValues(now);
        const currentGain = Math.max(AmbientMusicEngine.EPSILON, this.musicGain.gain.value);
        this.musicGain.gain.setValueAtTime(currentGain, now);

        const targetGain = this.currentMode === 'off'
          ? AmbientMusicEngine.EPSILON
          : Math.max(AmbientMusicEngine.EPSILON, this.musicVolume * AmbientMusicEngine.MUSIC_SCALING);

        this.musicGain.gain.linearRampToValueAtTime(targetGain, now + 0.05);
      } catch {}
    }

    this.notifySubscribers();
  }

  /**
   * Gets current music volume (0.0 to 1.0).
   */
  public getMusicVolume(): number {
    return this.musicVolume;
  }

  /**
   * Gets current active ambient soundscape mode.
   */
  public getMode(): AmbientMusicMode {
    return this.currentMode;
  }

  /**
   * Checks whether ambient music is actively playing or queued to play.
   */
  public isPlaying(): boolean {
    return this.currentMode !== 'off' || (this.targetMode !== 'off' && (!this.ctx || this.ctx.state !== 'running'));
  }

  /**
   * Cycles to the next soundscape mode and returns the newly active mode.
   */
  public cycleMode(): AmbientMusicMode {
    const modes: AmbientMusicMode[] = ['off', 'calm-chords', 'celestial-void', 'zen-drone'];
    const active = this.targetMode !== 'off' ? this.targetMode : this.currentMode;
    const currentIndex = modes.indexOf(active);
    const nextIndex = (currentIndex + 1) % modes.length;
    const nextMode = modes[nextIndex];
    this.setMode(nextMode);
    return nextMode;
  }

  /**
   * Checks whether audio context has been primed via user gesture.
   */
  public isAudioPrimed(): boolean {
    return this.isPrimed;
  }

  /**
   * Gets current music GainNode (for verification or bus inspection).
   */
  public getMusicGain(): GainNode | null {
    return this.musicGain;
  }

  /**
   * Switches ambient soundscape mode with a seamless 1.5s crossfade ramp.
   */
  public async setMode(mode: AmbientMusicMode): Promise<void> {
    this.targetMode = mode;
    try {
      StorageManager.setMusicMode(mode);
    } catch {}

    const ctx = await this.ensureActiveContext();
    if (!ctx || ctx.state !== 'running') {
      // AudioContext is not yet active/unlocked; mode will start upon gesture unlock
      this.currentMode = mode === 'off' ? 'off' : this.currentMode;
      this.notifySubscribers();
      return;
    }

    await this.applyMode(mode);
  }

  /**
   * Executes the 1.5s crossfade between existing soundscape and target mode.
   */
  private async applyMode(mode: AmbientMusicMode): Promise<void> {
    if (this.currentMode === mode && this.activeSoundscape) return;
    if (!this.ctx || !this.musicGain) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const duration = AmbientMusicEngine.CROSSFADE_DURATION;

    // 1. Fade out current active soundscape
    if (this.activeSoundscape) {
      const fading = this.activeSoundscape;
      this.fadingSoundscapes.push(fading);
      this.activeSoundscape = null;

      try {
        fading.busGain.gain.cancelScheduledValues(now);
        const currentVal = Math.max(AmbientMusicEngine.EPSILON, fading.busGain.gain.value);
        fading.busGain.gain.setValueAtTime(currentVal, now);
        fading.busGain.gain.linearRampToValueAtTime(AmbientMusicEngine.EPSILON, now + duration);

        setTimeout(() => {
          fading.cleanup();
          const idx = this.fadingSoundscapes.indexOf(fading);
          if (idx !== -1) this.fadingSoundscapes.splice(idx, 1);
        }, (duration + 0.05) * 1000);
      } catch (err) {
        fading.cleanup();
      }
    }

    // 2. Adjust music master gain for off vs active
    try {
      this.musicGain.gain.cancelScheduledValues(now);
      const currentGain = Math.max(AmbientMusicEngine.EPSILON, this.musicGain.gain.value);
      this.musicGain.gain.setValueAtTime(currentGain, now);

      const targetGain = mode === 'off'
        ? AmbientMusicEngine.EPSILON
        : Math.max(AmbientMusicEngine.EPSILON, this.musicVolume * AmbientMusicEngine.MUSIC_SCALING);

      this.musicGain.gain.linearRampToValueAtTime(targetGain, now + duration);
    } catch {}

    // 3. Instantiate new soundscape if mode !== 'off'
    if (mode !== 'off') {
      const newSoundscape = this.createSoundscape(mode, ctx, this.musicGain);
      if (newSoundscape) {
        this.activeSoundscape = newSoundscape;
        try {
          newSoundscape.busGain.gain.setValueAtTime(AmbientMusicEngine.EPSILON, now);
          newSoundscape.busGain.gain.linearRampToValueAtTime(1.0, now + duration);
        } catch {}
      }
    }

    this.currentMode = mode;
    this.notifySubscribers();
  }

  /**
   * Soundscape factory dispatch.
   */
  private createSoundscape(
    mode: AmbientMusicMode,
    ctx: AudioContext,
    destination: GainNode
  ): SoundscapeInstance | null {
    switch (mode) {
      case 'calm-chords':
        return this.createCalmChordsSoundscape(ctx, destination);
      case 'celestial-void':
        return this.createCelestialVoidSoundscape(ctx, destination);
      case 'zen-drone':
        return this.createZenDroneSoundscape(ctx, destination);
      case 'off':
      default:
        return null;
    }
  }

  /**
   * Mode: 'calm-chords'
   * Soft modal pentatonic chord pads (sine/triangle waves through gentle BiquadFilter
   * lowpass ~400-800Hz with slow breathing LFO cycle).
   */
  private createCalmChordsSoundscape(ctx: AudioContext, destination: GainNode): SoundscapeInstance {
    const busGain = ctx.createGain();
    busGain.gain.setValueAtTime(AmbientMusicEngine.EPSILON, ctx.currentTime);
    busGain.connect(destination);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, ctx.currentTime); // ~600Hz center (400-800Hz range)
    filter.Q.setValueAtTime(1.2, ctx.currentTime);
    filter.connect(busGain);

    // Slow breathing LFO modulating the filter cutoff between 450Hz and 750Hz
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.08, ctx.currentTime); // ~12.5s slow breathing cycle

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(150, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    // Pentatonic chord frequencies (D Dorian: D3, F3, A3, C4, E4)
    // D3=146.83Hz, F3=174.61Hz, A3=220.00Hz, C4=261.63Hz, E4=329.63Hz
    const voices = [
      { freq: 146.83, type: 'sine' as OscillatorType, gain: 0.28 },
      { freq: 147.20, type: 'triangle' as OscillatorType, gain: 0.12 }, // subtle detune
      { freq: 174.61, type: 'sine' as OscillatorType, gain: 0.22 },
      { freq: 220.00, type: 'sine' as OscillatorType, gain: 0.24 },
      { freq: 261.63, type: 'sine' as OscillatorType, gain: 0.20 },
      { freq: 329.63, type: 'sine' as OscillatorType, gain: 0.16 }
    ];

    const oscillators: OscillatorNode[] = [lfo];

    voices.forEach((v) => {
      const osc = ctx.createOscillator();
      osc.type = v.type;
      osc.frequency.setValueAtTime(v.freq, ctx.currentTime);

      const vGain = ctx.createGain();
      vGain.gain.setValueAtTime(v.gain, ctx.currentTime);

      osc.connect(vGain);
      vGain.connect(filter);
      osc.start();
      oscillators.push(osc);
    });

    const cleanup = () => {
      try {
        oscillators.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {}
        });
        filter.disconnect();
        busGain.disconnect();
      } catch {}
    };

    return {
      mode: 'calm-chords',
      busGain,
      oscillators,
      cleanup
    };
  }

  /**
   * Mode: 'celestial-void'
   * Deep space drone (low-frequency fundamentals 55Hz/110Hz with subtle Pythagorean
   * detuning and slow harmonic swells).
   */
  private createCelestialVoidSoundscape(ctx: AudioContext, destination: GainNode): SoundscapeInstance {
    const busGain = ctx.createGain();
    busGain.gain.setValueAtTime(AmbientMusicEngine.EPSILON, ctx.currentTime);
    busGain.connect(destination);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(480, ctx.currentTime);
    filter.Q.setValueAtTime(2.0, ctx.currentTime);
    filter.connect(busGain);

    // Harmonic swell LFO (modulating upper harmonics over 20-second waves)
    const swellLfo = ctx.createOscillator();
    swellLfo.type = 'sine';
    swellLfo.frequency.setValueAtTime(0.05, ctx.currentTime); // 20s wave

    const swellGain = ctx.createGain();
    swellGain.gain.setValueAtTime(0.12, ctx.currentTime);
    swellLfo.connect(swellGain);

    const harmonicSubBus = ctx.createGain();
    harmonicSubBus.gain.setValueAtTime(0.18, ctx.currentTime);
    swellGain.connect(harmonicSubBus.gain);
    harmonicSubBus.connect(filter);
    swellLfo.start();

    const oscillators: OscillatorNode[] = [swellLfo];

    // Fundamentals with Pythagorean detuning:
    // Sub: 55Hz (A1) + 55.35Hz (subtle 0.35Hz beating)
    // Octave: 110Hz (A2) + 110.55Hz
    const fundamentals = [
      { freq: 55.0, type: 'sine' as OscillatorType, gain: 0.35 },
      { freq: 55.35, type: 'sine' as OscillatorType, gain: 0.30 },
      { freq: 110.0, type: 'triangle' as OscillatorType, gain: 0.22 },
      { freq: 110.55, type: 'sine' as OscillatorType, gain: 0.18 }
    ];

    fundamentals.forEach((v) => {
      const osc = ctx.createOscillator();
      osc.type = v.type;
      osc.frequency.setValueAtTime(v.freq, ctx.currentTime);

      const vGain = ctx.createGain();
      vGain.gain.setValueAtTime(v.gain, ctx.currentTime);

      osc.connect(vGain);
      vGain.connect(filter);
      osc.start();
      oscillators.push(osc);
    });

    // Swelling Pythagorean harmonics: 165Hz (3:2 fifth), 220Hz (octave), 275Hz (5:4 third), 330Hz (fifth)
    const swellingHarmonics = [
      { freq: 165.0, type: 'sine' as OscillatorType },
      { freq: 220.0, type: 'sine' as OscillatorType },
      { freq: 275.0, type: 'sine' as OscillatorType },
      { freq: 330.0, type: 'sine' as OscillatorType }
    ];

    swellingHarmonics.forEach((h) => {
      const osc = ctx.createOscillator();
      osc.type = h.type;
      osc.frequency.setValueAtTime(h.freq, ctx.currentTime);
      osc.connect(harmonicSubBus);
      osc.start();
      oscillators.push(osc);
    });

    const cleanup = () => {
      try {
        oscillators.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {}
        });
        filter.disconnect();
        busGain.disconnect();
      } catch {}
    };

    return {
      mode: 'celestial-void',
      busGain,
      oscillators,
      cleanup
    };
  }

  /**
   * Mode: 'zen-drone'
   * Binaural meditation wash / pink noise texture + soothing drone tone.
   */
  private createZenDroneSoundscape(ctx: AudioContext, destination: GainNode): SoundscapeInstance {
    const busGain = ctx.createGain();
    busGain.gain.setValueAtTime(AmbientMusicEngine.EPSILON, ctx.currentTime);
    busGain.connect(destination);

    const allSources: (OscillatorNode | AudioBufferSourceNode)[] = [];

    // 1. Binaural carrier (136.1Hz Om frequency with 6Hz Theta beat)
    // Left channel: 136.1Hz, Right channel: 142.1Hz
    const oscLeft = ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(136.1, ctx.currentTime);

    const oscRight = ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(142.1, ctx.currentTime);

    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(68.05, ctx.currentTime); // Sub octave

    const pannerLeft = this.createSafePanner(ctx, -0.75);
    const pannerRight = this.createSafePanner(ctx, 0.75);

    const toneGain = ctx.createGain();
    toneGain.gain.setValueAtTime(0.18, ctx.currentTime);

    oscLeft.connect(pannerLeft);
    oscRight.connect(pannerRight);
    pannerLeft.connect(toneGain);
    pannerRight.connect(toneGain);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.22, ctx.currentTime);
    subOsc.connect(subGain);
    subGain.connect(toneGain);

    toneGain.connect(busGain);

    oscLeft.start();
    oscRight.start();
    subOsc.start();
    allSources.push(oscLeft, oscRight, subOsc);

    // 2. Pink noise texture with soothing breathing swell
    const noiseBuffer = this.getPinkNoiseBuffer(ctx);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(360, ctx.currentTime);
    noiseFilter.Q.setValueAtTime(1.0, ctx.currentTime);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.025, ctx.currentTime);

    // Pink noise breathing swell LFO
    const noiseLfo = ctx.createOscillator();
    noiseLfo.type = 'sine';
    noiseLfo.frequency.setValueAtTime(0.065, ctx.currentTime); // ~15s breath

    const noiseLfoGain = ctx.createGain();
    noiseLfoGain.gain.setValueAtTime(0.012, ctx.currentTime);
    noiseLfo.connect(noiseLfoGain);
    noiseLfoGain.connect(noiseGain.gain);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(busGain);

    noiseLfo.start();
    noiseSource.start();
    allSources.push(noiseLfo, noiseSource);

    const cleanup = () => {
      try {
        allSources.forEach((src) => {
          try {
            src.stop();
            src.disconnect();
          } catch {}
        });
        noiseFilter.disconnect();
        toneGain.disconnect();
        busGain.disconnect();
      } catch {}
    };

    return {
      mode: 'zen-drone',
      busGain,
      oscillators: allSources,
      cleanup
    };
  }

  /**
   * Helper to create a StereoPannerNode with graceful fallback if unsupported.
   */
  private createSafePanner(ctx: AudioContext, pan: number): AudioNode {
    if (typeof (ctx as any).createStereoPanner === 'function') {
      const panner = (ctx as any).createStereoPanner();
      panner.pan.setValueAtTime(pan, ctx.currentTime);
      return panner;
    }
    // Fallback: standard GainNode if StereoPanner is not available
    const fallbackGain = ctx.createGain();
    fallbackGain.gain.setValueAtTime(0.8, ctx.currentTime);
    return fallbackGain;
  }

  /**
   * Generates a 3-second seamless looping pink noise buffer using Paul Kellet's algorithm.
   */
  private getPinkNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.pinkNoiseBuffer && this.pinkNoiseBuffer.sampleRate === ctx.sampleRate) {
      return this.pinkNoiseBuffer;
    }

    const duration = 3.0; // 3 seconds loop
    const sampleRate = ctx.sampleRate || 44100;
    const bufferSize = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    this.pinkNoiseBuffer = buffer;
    return buffer;
  }

  /**
   * Subscriber notification.
   */
  private notifySubscribers(): void {
    this.subscribers.forEach((fn) => {
      try {
        fn(this.currentMode, this.musicVolume);
      } catch (err) {
        console.warn('[MUSIC] Subscriber callback error:', err);
      }
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('eng:music-change', {
          detail: { mode: this.currentMode, volume: this.musicVolume }
        })
      );
      window.dispatchEvent(
        new CustomEvent('ambient-music-mode-change', {
          detail: { mode: this.currentMode, volume: this.musicVolume }
        })
      );
    }
  }

  /**
   * Subscribe to music mode and volume changes.
   */
  public subscribe(fn: (mode: AmbientMusicMode, volume: number) => void): () => void {
    this.subscribers.add(fn);
    return () => this.subscribers.delete(fn);
  }

  // --- Static Convenience API ---
  public static init(): void {
    AmbientMusicEngine.getInstance().init();
  }

  public static isPlaying(): boolean {
    return AmbientMusicEngine.getInstance().isPlaying();
  }

  public static cycleMode(): AmbientMusicMode {
    return AmbientMusicEngine.getInstance().cycleMode();
  }

  public static isAudioPrimed(): boolean {
    return AmbientMusicEngine.getInstance().isAudioPrimed();
  }

  public static setMode(mode: AmbientMusicMode): Promise<void> {
    return AmbientMusicEngine.getInstance().setMode(mode);
  }

  public static getMode(): AmbientMusicMode {
    return AmbientMusicEngine.getInstance().getMode();
  }

  public static setMusicVolume(val: number): void {
    AmbientMusicEngine.getInstance().setMusicVolume(val);
  }

  public static getMusicVolume(): number {
    return AmbientMusicEngine.getInstance().getMusicVolume();
  }

  public static getMusicGain(): GainNode | null {
    return AmbientMusicEngine.getInstance().getMusicGain();
  }

  public static subscribe(fn: (mode: AmbientMusicMode, volume: number) => void): () => void {
    return AmbientMusicEngine.getInstance().subscribe(fn);
  }
}

export const ambientMusicEngine = AmbientMusicEngine.getInstance();
