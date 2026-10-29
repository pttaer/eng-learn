import { StorageManager } from '../utils/storage';
import { AudioSynthesizer } from './audio-synthesizer';

export type AmbientMusicMode =
  | 'off'
  | 'calm-chords'
  | 'celestial-void'
  | 'zen-drone'
  | 'alpha-baroque'
  | 'lofi-study'
  | 'gamma-focus'
  | 'rain-piano'
  | 'binaural-theta'
  | 'synthwave-drive';

export const AMBIENT_MODES: readonly AmbientMusicMode[] = [
  'off',
  'calm-chords',
  'celestial-void',
  'zen-drone',
  'alpha-baroque',
  'lofi-study',
  'gamma-focus',
  'rain-piano',
  'binaural-theta',
  'synthwave-drive'
];

export const AMBIENT_MODE_LABELS: Record<AmbientMusicMode, string> = {
  'off': 'Off',
  'calm-chords': 'Calm Chords',
  'celestial-void': 'Celestial Void',
  'zen-drone': 'Zen Drone',
  'alpha-baroque': 'Alpha Baroque (60 BPM)',
  'lofi-study': 'Lo-Fi Study Beats',
  'gamma-focus': 'Gamma Focus (40Hz MIT Neuro)',
  'rain-piano': 'Raindrop & Piano Flow',
  'binaural-theta': 'Binaural Theta (6Hz Zen Bowl)',
  'synthwave-drive': 'Synthwave Drive (80 BPM)'
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
      if (AMBIENT_MODES.includes(storedMode)) {
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
    const modes: AmbientMusicMode[] = [...AMBIENT_MODES];
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
      case 'alpha-baroque':
        return this.createAlphaBaroqueSoundscape(ctx, destination);
      case 'lofi-study':
        return this.createLoFiStudySoundscape(ctx, destination);
      case 'gamma-focus':
        return this.createGammaFocusSoundscape(ctx, destination);
      case 'rain-piano':
        return this.createRainPianoSoundscape(ctx, destination);
      case 'binaural-theta':
        return this.createBinauralThetaSoundscape(ctx, destination);
      case 'synthwave-drive':
        return this.createSynthwaveDriveSoundscape(ctx, destination);
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
   * Mode: 'alpha-baroque'
   * Suggestopedia / Superlearning 60 BPM Baroque Flow Soundscape.
   * Based on psychoacoustic research into 60 BPM largo rhythms for accelerated learning:
   * - 60 BPM (1.0 Hz) rhythmic subtle acoustic filter breath.
   * - 10Hz Alpha-wave binaural pulse inducing relaxed yet sharp cognitive focus.
   * - Warm Basso Continuo / cello ground bass (G2 98Hz + G1 49Hz).
   * - Modal baroque counterpoint chord voices (D3, G3, B3, D4, F#4) breathing with prime-period LFOs.
   */
  private createAlphaBaroqueSoundscape(ctx: AudioContext, destination: GainNode): SoundscapeInstance {
    const busGain = ctx.createGain();
    busGain.gain.setValueAtTime(AmbientMusicEngine.EPSILON, ctx.currentTime);
    busGain.connect(destination);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(620, ctx.currentTime);
    filter.Q.setValueAtTime(1.4, ctx.currentTime);
    filter.connect(busGain);

    // 60 BPM (1.0 Hz) rhythmic breathing LFO - Suggestopedia tempo
    const tempoLfo = ctx.createOscillator();
    tempoLfo.type = 'sine';
    tempoLfo.frequency.setValueAtTime(1.0, ctx.currentTime); // Exactly 60 BPM

    const tempoLfoGain = ctx.createGain();
    tempoLfoGain.gain.setValueAtTime(80, ctx.currentTime); // Subtle filter modulation
    tempoLfo.connect(tempoLfoGain);
    tempoLfoGain.connect(filter.frequency);
    tempoLfo.start();

    const allSources: (OscillatorNode | AudioBufferSourceNode)[] = [tempoLfo];

    // 1. 10Hz Alpha Binaural beat carrier (205Hz Left, 215Hz Right = 10Hz Alpha)
    const binauralL = ctx.createOscillator();
    const binauralR = ctx.createOscillator();
    binauralL.type = 'sine';
    binauralR.type = 'sine';
    binauralL.frequency.setValueAtTime(205, ctx.currentTime);
    binauralR.frequency.setValueAtTime(215, ctx.currentTime);

    const panL = this.createSafePanner(ctx, -0.7);
    const panR = this.createSafePanner(ctx, 0.7);
    const binGain = ctx.createGain();
    binGain.gain.setValueAtTime(0.06, ctx.currentTime);

    binauralL.connect(panL);
    binauralR.connect(panR);
    panL.connect(binGain);
    panR.connect(binGain);
    binGain.connect(busGain);

    binauralL.start();
    binauralR.start();
    allSources.push(binauralL, binauralR);

    // 2. Baroque Basso Continuo (Cello / Organ fundament)
    // G2 (98.00Hz) + Sub G1 (49.00Hz)
    const bassVoices = [
      { freq: 49.00, type: 'sine' as OscillatorType, gain: 0.26 },
      { freq: 98.00, type: 'triangle' as OscillatorType, gain: 0.22 },
      { freq: 146.83, type: 'sine' as OscillatorType, gain: 0.18 } // D3 fifth
    ];

    bassVoices.forEach((b) => {
      const osc = ctx.createOscillator();
      osc.type = b.type;
      osc.frequency.setValueAtTime(b.freq, ctx.currentTime);

      const bGain = ctx.createGain();
      bGain.gain.setValueAtTime(b.gain, ctx.currentTime);

      osc.connect(bGain);
      bGain.connect(filter);
      osc.start();
      allSources.push(osc);
    });

    // 3. Baroque Chamber Counter-voices (G Maj9 / Dsus chord tapestry)
    // G3=196.00Hz, B3=246.94Hz, D4=293.66Hz, F#4=369.99Hz, A4=440.00Hz
    const counterVoices = [
      { freq: 196.00, type: 'sine' as OscillatorType, gain: 0.16 },
      { freq: 246.94, type: 'sine' as OscillatorType, gain: 0.14 },
      { freq: 293.66, type: 'triangle' as OscillatorType, gain: 0.12 },
      { freq: 369.99, type: 'sine' as OscillatorType, gain: 0.10 }
    ];

    counterVoices.forEach((cv) => {
      const osc = ctx.createOscillator();
      osc.type = cv.type;
      osc.frequency.setValueAtTime(cv.freq, ctx.currentTime);

      const cvGain = ctx.createGain();
      cvGain.gain.setValueAtTime(cv.gain, ctx.currentTime);

      osc.connect(cvGain);
      cvGain.connect(filter);
      osc.start();
      allSources.push(osc);
    });

    const cleanup = () => {
      try {
        allSources.forEach((src) => {
          try {
            src.stop();
            src.disconnect();
          } catch {}
        });
        filter.disconnect();
        binGain.disconnect();
        busGain.disconnect();
      } catch {}
    };

    return {
      mode: 'alpha-baroque',
      busGain,
      oscillators: allSources,
      cleanup
    };
  }

  /**
   * Mode: 'lofi-study'
   * Relaxed Chillhop Study Beats Soundscape.
   * Induces flow and eliminates external distractions:
   * - Lush jazz 9th chords (Dm9 -> Cmaj9) on warm Rhodes electric piano emulation.
   * - Gentle tremolo modulation (4.0Hz).
   * - Lo-Fi analog vinyl cassette tape warmth (filtered pink noise).
   * - Subtle 72 BPM relaxed heartbeat pulse.
   */
  private createLoFiStudySoundscape(ctx: AudioContext, destination: GainNode): SoundscapeInstance {
    const busGain = ctx.createGain();
    busGain.gain.setValueAtTime(AmbientMusicEngine.EPSILON, ctx.currentTime);
    busGain.connect(destination);

    // Warm high-cut filter preserving clarity of TTS and internal reading
    const masterFilter = ctx.createBiquadFilter();
    masterFilter.type = 'lowpass';
    masterFilter.frequency.setValueAtTime(780, ctx.currentTime);
    masterFilter.Q.setValueAtTime(1.0, ctx.currentTime);
    masterFilter.connect(busGain);

    const allSources: (OscillatorNode | AudioBufferSourceNode)[] = [];

    // 1. Tremolo LFO (4.0 Hz subtle Rhodes chorus / tremolo)
    const tremoloLfo = ctx.createOscillator();
    tremoloLfo.type = 'sine';
    tremoloLfo.frequency.setValueAtTime(4.0, ctx.currentTime);

    const tremoloDepth = ctx.createGain();
    tremoloDepth.gain.setValueAtTime(0.06, ctx.currentTime);
    tremoloLfo.connect(tremoloDepth);

    const chordBus = ctx.createGain();
    chordBus.gain.setValueAtTime(0.24, ctx.currentTime);
    tremoloDepth.connect(chordBus.gain);
    chordBus.connect(masterFilter);

    tremoloLfo.start();
    allSources.push(tremoloLfo);

    // 2. Jazz 9th Rhodes Chord Voicing (D3, F3, A3, C4, E4 - Dm9 lush color)
    const rhodesNotes = [
      { freq: 146.83, type: 'triangle' as OscillatorType, gain: 0.28 }, // D3 Root
      { freq: 174.61, type: 'sine' as OscillatorType, gain: 0.20 },     // F3 Minor Third
      { freq: 220.00, type: 'sine' as OscillatorType, gain: 0.18 },     // A3 Fifth
      { freq: 261.63, type: 'sine' as OscillatorType, gain: 0.16 },     // C4 Seventh
      { freq: 329.63, type: 'sine' as OscillatorType, gain: 0.14 }      // E4 Ninth
    ];

    rhodesNotes.forEach((rn) => {
      const osc = ctx.createOscillator();
      osc.type = rn.type;
      osc.frequency.setValueAtTime(rn.freq, ctx.currentTime);

      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(rn.gain, ctx.currentTime);

      osc.connect(nGain);
      nGain.connect(chordBus);
      osc.start();
      allSources.push(osc);
    });

    // 3. Lo-Fi Vinyl Tape Warmth (Kellet pink noise filtered with tape bandpass)
    const vinylBuffer = this.getPinkNoiseBuffer(ctx);
    const vinylSource = ctx.createBufferSource();
    vinylSource.buffer = vinylBuffer;
    vinylSource.loop = true;

    const vinylFilter = ctx.createBiquadFilter();
    vinylFilter.type = 'bandpass';
    vinylFilter.frequency.setValueAtTime(420, ctx.currentTime);
    vinylFilter.Q.setValueAtTime(1.6, ctx.currentTime);

    const vinylGain = ctx.createGain();
    vinylGain.gain.setValueAtTime(0.016, ctx.currentTime); // Very subtle, warm texture

    vinylSource.connect(vinylFilter);
    vinylFilter.connect(vinylGain);
    vinylGain.connect(busGain);

    vinylSource.start();
    allSources.push(vinylSource);

    // 4. Relaxed 72 BPM Chillhop Heartbeat Pulse (72 BPM = 1.2 Hz)
    const beatLfo = ctx.createOscillator();
    beatLfo.type = 'sine';
    beatLfo.frequency.setValueAtTime(1.2, ctx.currentTime); // 72 BPM

    const beatSubOsc = ctx.createOscillator();
    beatSubOsc.type = 'sine';
    beatSubOsc.frequency.setValueAtTime(58.0, ctx.currentTime); // Warm 58Hz sub

    const beatSubGain = ctx.createGain();
    beatSubGain.gain.setValueAtTime(0.04, ctx.currentTime);

    const beatMod = ctx.createGain();
    beatMod.gain.setValueAtTime(0.03, ctx.currentTime);
    beatLfo.connect(beatMod);
    beatMod.connect(beatSubGain.gain);

    beatSubOsc.connect(beatSubGain);
    beatSubGain.connect(busGain);

    beatLfo.start();
    beatSubOsc.start();
    allSources.push(beatLfo, beatSubOsc);

    const cleanup = () => {
      try {
        allSources.forEach((src) => {
          try {
            src.stop();
            src.disconnect();
          } catch {}
        });
        masterFilter.disconnect();
        vinylFilter.disconnect();
        busGain.disconnect();
      } catch {}
    };

    return {
      mode: 'lofi-study',
      busGain,
      oscillators: allSources,
      cleanup
    };
  }

  /**
   * Mode: 'gamma-focus'
   * 40Hz Gamma Focus & Neoclassical Pad Tapestry.
   * Based on MIT neurobiology research showing 40Hz sensory stimulation coordinates
   * gamma oscillations across prefrontal cortex and hippocampus, clearing mental fatigue
   * and accelerating vocabulary encoding.
   */
  private createGammaFocusSoundscape(ctx: AudioContext, destination: GainNode): SoundscapeInstance {
    const busGain = ctx.createGain();
    busGain.gain.setValueAtTime(AmbientMusicEngine.EPSILON, ctx.currentTime);
    busGain.connect(destination);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, ctx.currentTime);
    filter.Q.setValueAtTime(1.2, ctx.currentTime);
    filter.connect(busGain);

    // 0.04Hz (25s) slow breathing filter sweep
    const sweepLfo = ctx.createOscillator();
    sweepLfo.type = 'sine';
    sweepLfo.frequency.setValueAtTime(0.04, ctx.currentTime);
    const sweepGain = ctx.createGain();
    sweepGain.gain.setValueAtTime(130, ctx.currentTime);
    sweepLfo.connect(sweepGain);
    sweepGain.connect(filter.frequency);
    sweepLfo.start();

    const allSources: (OscillatorNode | AudioBufferSourceNode)[] = [sweepLfo];

    // 1. 432Hz Carrier with 40.0Hz Isochronic amplitude modulation
    const carrier = ctx.createOscillator();
    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(432.0, ctx.currentTime);

    const isochronicLfo = ctx.createOscillator();
    isochronicLfo.type = 'sine';
    isochronicLfo.frequency.setValueAtTime(40.0, ctx.currentTime); // Exactly 40Hz Gamma

    const isochronicDepth = ctx.createGain();
    isochronicDepth.gain.setValueAtTime(0.04, ctx.currentTime);
    isochronicLfo.connect(isochronicDepth);

    const carrierGain = ctx.createGain();
    carrierGain.gain.setValueAtTime(0.10, ctx.currentTime);
    isochronicDepth.connect(carrierGain.gain);

    carrier.connect(carrierGain);
    carrierGain.connect(filter);

    carrier.start();
    isochronicLfo.start();
    allSources.push(carrier, isochronicLfo);

    // 2. Meditative A-Major-9th Pad Chord
    // A2 (110.00Hz), E3 (164.81Hz), G#3 (207.65Hz), C#4 (277.18Hz), E4 (329.63Hz)
    const padVoices = [
      { freq: 110.00, type: 'triangle' as OscillatorType, pan: 0.0, gain: 0.22 },
      { freq: 164.81, type: 'sine' as OscillatorType, pan: -0.4, gain: 0.18 },
      { freq: 207.65, type: 'sine' as OscillatorType, pan: 0.4, gain: 0.16 },
      { freq: 277.18, type: 'sine' as OscillatorType, pan: -0.2, gain: 0.14 },
      { freq: 329.63, type: 'triangle' as OscillatorType, pan: 0.2, gain: 0.10 }
    ];

    padVoices.forEach((pv) => {
      const osc = ctx.createOscillator();
      osc.type = pv.type;
      osc.frequency.setValueAtTime(pv.freq, ctx.currentTime);

      const panner = this.createSafePanner(ctx, pv.pan);
      const vGain = ctx.createGain();
      vGain.gain.setValueAtTime(pv.gain, ctx.currentTime);

      osc.connect(panner);
      panner.connect(vGain);
      vGain.connect(filter);
      osc.start();
      allSources.push(osc);
    });

    const cleanup = () => {
      try {
        allSources.forEach((src) => {
          try {
            src.stop();
            src.disconnect();
          } catch {}
        });
        sweepGain.disconnect();
        filter.disconnect();
        busGain.disconnect();
      } catch {}
    };

    return {
      mode: 'gamma-focus',
      busGain,
      oscillators: allSources,
      cleanup
    };
  }

  /**
   * Mode: 'rain-piano'
   * Continuous Rain Shower & Generative Erik Satie Impressionist Piano.
   * Drowns out erratic ambient noise while generative, non-repetitive pentatonic piano notes
   * stimulate human aesthetic engagement without activating linguistic processing centers.
   */
  private createRainPianoSoundscape(ctx: AudioContext, destination: GainNode): SoundscapeInstance {
    const busGain = ctx.createGain();
    busGain.gain.setValueAtTime(AmbientMusicEngine.EPSILON, ctx.currentTime);
    busGain.connect(destination);

    const allSources: (OscillatorNode | AudioBufferSourceNode)[] = [];
    let isTerminated = false;
    const activeTimers: ReturnType<typeof setTimeout>[] = [];

    // 1. Dual-channel pink noise rain texture
    const rainBuffer = this.getPinkNoiseBuffer(ctx);
    const rainSource = ctx.createBufferSource();
    rainSource.buffer = rainBuffer;
    rainSource.loop = true;

    // Body of rain (warm low-mid bandpass)
    const rainFilter1 = ctx.createBiquadFilter();
    rainFilter1.type = 'bandpass';
    rainFilter1.frequency.setValueAtTime(750, ctx.currentTime);
    rainFilter1.Q.setValueAtTime(1.2, ctx.currentTime);

    // Droplet splash (high-frequency air texture)
    const rainFilter2 = ctx.createBiquadFilter();
    rainFilter2.type = 'bandpass';
    rainFilter2.frequency.setValueAtTime(2400, ctx.currentTime);
    rainFilter2.Q.setValueAtTime(2.0, ctx.currentTime);

    const rainGain1 = ctx.createGain();
    rainGain1.gain.setValueAtTime(0.045, ctx.currentTime);

    const rainGain2 = ctx.createGain();
    rainGain2.gain.setValueAtTime(0.015, ctx.currentTime);

    rainSource.connect(rainFilter1);
    rainSource.connect(rainFilter2);
    rainFilter1.connect(rainGain1);
    rainFilter2.connect(rainGain2);
    rainGain1.connect(busGain);
    rainGain2.connect(busGain);

    rainSource.start();
    allSources.push(rainSource);

    // 2. Generative Pentatonic Piano (Db major pentatonic: Db4, Eb4, F4, Ab4, Bb4, Db5, Eb5)
    const pentatonicScale = [277.18, 311.13, 349.23, 415.30, 466.16, 554.37, 622.25];
    const pianoFilter = ctx.createBiquadFilter();
    pianoFilter.type = 'lowpass';
    pianoFilter.frequency.setValueAtTime(1400, ctx.currentTime);
    pianoFilter.connect(busGain);

    const triggerNextPianoNote = () => {
      if (isTerminated || !this.ctx || this.ctx.state !== 'running') return;
      const t = ctx.currentTime;
      const noteFreq = pentatonicScale[Math.floor(Math.random() * pentatonicScale.length)];
      const panVal = (Math.random() - 0.5) * 0.8;
      const panner = this.createSafePanner(ctx, panVal);

      // Acoustic Piano Voice: Fundamental + 2nd Harmonic + Decay Envelope
      const osc1 = ctx.createOscillator();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(noteFreq, t);

      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(noteFreq * 2, t);

      const noteGain = ctx.createGain();
      const noteDur = 2.4 + Math.random() * 1.2;

      noteGain.gain.setValueAtTime(AmbientMusicEngine.EPSILON, t);
      noteGain.gain.linearRampToValueAtTime(0.12, t + 0.006); // Fast hammer attack
      noteGain.gain.exponentialRampToValueAtTime(AmbientMusicEngine.EPSILON, t + noteDur);

      osc1.connect(noteGain);
      osc2.connect(noteGain);
      noteGain.connect(panner);
      panner.connect(pianoFilter);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + noteDur);
      osc2.stop(t + noteDur);

      // Schedule next organic note in 2.2 to 4.5 seconds
      const nextDelayMs = 2200 + Math.random() * 2300;
      const tid = setTimeout(triggerNextPianoNote, nextDelayMs);
      activeTimers.push(tid);
    };

    // First note triggered after 1 second
    const initialTid = setTimeout(triggerNextPianoNote, 1000);
    activeTimers.push(initialTid);

    const cleanup = () => {
      isTerminated = true;
      activeTimers.forEach((tid) => clearTimeout(tid));
      activeTimers.length = 0;
      try {
        allSources.forEach((src) => {
          try {
            src.stop();
            src.disconnect();
          } catch {}
        });
        rainFilter1.disconnect();
        rainFilter2.disconnect();
        pianoFilter.disconnect();
        busGain.disconnect();
      } catch {}
    };

    return {
      mode: 'rain-piano',
      busGain,
      oscillators: allSources,
      cleanup
    };
  }

  /**
   * Mode: 'binaural-theta'
   * 6Hz Theta Brainwave & Tibetan Singing Bowl Harmonics.
   * Drops neural oscillations into 6Hz theta rhythm, inducing deep intuitive comprehension,
   * removing test anxiety, and supporting extended academic reading endurance.
   */
  private createBinauralThetaSoundscape(ctx: AudioContext, destination: GainNode): SoundscapeInstance {
    const busGain = ctx.createGain();
    busGain.gain.setValueAtTime(AmbientMusicEngine.EPSILON, ctx.currentTime);
    busGain.connect(destination);

    const allSources: (OscillatorNode | AudioBufferSourceNode)[] = [];

    // 1. 6.0Hz Binaural Beat Carrier (144Hz Left, 150Hz Right)
    const binauralL = ctx.createOscillator();
    const binauralR = ctx.createOscillator();
    binauralL.type = 'sine';
    binauralR.type = 'sine';
    binauralL.frequency.setValueAtTime(144.0, ctx.currentTime);
    binauralR.frequency.setValueAtTime(150.0, ctx.currentTime);

    const panL = this.createSafePanner(ctx, -1.0);
    const panR = this.createSafePanner(ctx, 1.0);

    const binGain = ctx.createGain();
    binGain.gain.setValueAtTime(0.08, ctx.currentTime);

    binauralL.connect(panL);
    binauralR.connect(panR);
    panL.connect(binGain);
    panR.connect(binGain);
    binGain.connect(busGain);

    binauralL.start();
    binauralR.start();
    allSources.push(binauralL, binauralR);

    // 2. Tibetan Singing Bowl Acoustic Resonator
    // Fundamental 216Hz, 3rd Harmonic 648Hz, 5th Harmonic 1080Hz
    const bowlMasterFilter = ctx.createBiquadFilter();
    bowlMasterFilter.type = 'lowpass';
    bowlMasterFilter.frequency.setValueAtTime(950, ctx.currentTime);
    bowlMasterFilter.connect(busGain);

    // Slow rotary Doppler rim-rubbing chorus (0.12Hz)
    const rotaryLfo = ctx.createOscillator();
    rotaryLfo.type = 'sine';
    rotaryLfo.frequency.setValueAtTime(0.12, ctx.currentTime);

    const rotaryDepth = ctx.createGain();
    rotaryDepth.gain.setValueAtTime(0.04, ctx.currentTime);
    rotaryLfo.connect(rotaryDepth);

    const bowlVoices = [
      { freq: 216.0, type: 'sine' as OscillatorType, gain: 0.20 },
      { freq: 648.0, type: 'sine' as OscillatorType, gain: 0.08 },
      { freq: 1080.0, type: 'triangle' as OscillatorType, gain: 0.03 }
    ];

    bowlVoices.forEach((bv) => {
      const osc = ctx.createOscillator();
      osc.type = bv.type;
      osc.frequency.setValueAtTime(bv.freq, ctx.currentTime);

      const vGain = ctx.createGain();
      vGain.gain.setValueAtTime(bv.gain, ctx.currentTime);
      rotaryDepth.connect(vGain.gain);

      osc.connect(vGain);
      vGain.connect(bowlMasterFilter);
      osc.start();
      allSources.push(osc);
    });

    rotaryLfo.start();
    allSources.push(rotaryLfo);

    // 3. Grounding Sub-bass (54Hz warm resonance)
    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(54.0, ctx.currentTime);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.14, ctx.currentTime);

    subOsc.connect(subGain);
    subGain.connect(busGain);
    subOsc.start();
    allSources.push(subOsc);

    const cleanup = () => {
      try {
        allSources.forEach((src) => {
          try {
            src.stop();
            src.disconnect();
          } catch {}
        });
        bowlMasterFilter.disconnect();
        busGain.disconnect();
      } catch {}
    };

    return {
      mode: 'binaural-theta',
      busGain,
      oscillators: allSources,
      cleanup
    };
  }

  /**
   * Mode: 'synthwave-drive'
   * 80 BPM Retro Cyber Study Flow & Gamified Sprint.
   * Energizes timed quizzes and rapid-fire vocabulary blitzes with warm analog synth bass,
   * gentle lo-fi drum pulse, and dreamy 80s polyphonic synth chords.
   */
  private createSynthwaveDriveSoundscape(ctx: AudioContext, destination: GainNode): SoundscapeInstance {
    const busGain = ctx.createGain();
    busGain.gain.setValueAtTime(AmbientMusicEngine.EPSILON, ctx.currentTime);
    busGain.connect(destination);

    const allSources: (OscillatorNode | AudioBufferSourceNode)[] = [];

    // Master filter warming the synth textures
    const masterFilter = ctx.createBiquadFilter();
    masterFilter.type = 'lowpass';
    masterFilter.frequency.setValueAtTime(850, ctx.currentTime);
    masterFilter.connect(busGain);

    // 1. 80 BPM Clock (1.333 Hz)
    const clockLfo = ctx.createOscillator();
    clockLfo.type = 'sine';
    clockLfo.frequency.setValueAtTime(1.333, ctx.currentTime); // 80 BPM

    // 2. Analog Synth Bassline (A1 55Hz, C2 65.4Hz, E2 82.4Hz, G2 98Hz)
    const bassVoices = [
      { freq: 55.00, type: 'sawtooth' as OscillatorType, gain: 0.16 },
      { freq: 110.00, type: 'triangle' as OscillatorType, gain: 0.12 }
    ];

    const bassFilter = ctx.createBiquadFilter();
    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(320, ctx.currentTime);
    bassFilter.Q.setValueAtTime(2.2, ctx.currentTime);
    bassFilter.connect(masterFilter);

    bassVoices.forEach((bv) => {
      const osc = ctx.createOscillator();
      osc.type = bv.type;
      osc.frequency.setValueAtTime(bv.freq, ctx.currentTime);

      const bGain = ctx.createGain();
      bGain.gain.setValueAtTime(bv.gain, ctx.currentTime);

      osc.connect(bGain);
      bGain.connect(bassFilter);
      osc.start();
      allSources.push(osc);
    });

    // 3. Dreamy Poly-Synth Pad (Am7 -> Fmaj7 lush retro chord voicings)
    // A3 (220Hz), C4 (261.63Hz), E4 (329.63Hz), G4 (392.00Hz)
    const chordVoices = [
      { freq: 220.00, pan: -0.5, gain: 0.12 },
      { freq: 261.63, pan: 0.5, gain: 0.10 },
      { freq: 329.63, pan: -0.2, gain: 0.10 },
      { freq: 392.00, pan: 0.2, gain: 0.08 }
    ];

    chordVoices.forEach((cv) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(cv.freq, ctx.currentTime);

      const panner = this.createSafePanner(ctx, cv.pan);
      const vGain = ctx.createGain();
      vGain.gain.setValueAtTime(cv.gain, ctx.currentTime);

      osc.connect(panner);
      panner.connect(vGain);
      vGain.connect(masterFilter);
      osc.start();
      allSources.push(osc);
    });

    // 4. Soft Lo-Fi Kick & Snare Pulse (80 BPM)
    const beatSub = ctx.createOscillator();
    beatSub.type = 'sine';
    beatSub.frequency.setValueAtTime(55, ctx.currentTime);

    const beatGain = ctx.createGain();
    beatGain.gain.setValueAtTime(0.04, ctx.currentTime);

    const beatMod = ctx.createGain();
    beatMod.gain.setValueAtTime(0.03, ctx.currentTime);
    clockLfo.connect(beatMod);
    beatMod.connect(beatGain.gain);

    beatSub.connect(beatGain);
    beatGain.connect(busGain);

    clockLfo.start();
    beatSub.start();
    allSources.push(clockLfo, beatSub);

    const cleanup = () => {
      try {
        allSources.forEach((src) => {
          try {
            src.stop();
            src.disconnect();
          } catch {}
        });
        bassFilter.disconnect();
        masterFilter.disconnect();
        busGain.disconnect();
      } catch {}
    };

    return {
      mode: 'synthwave-drive',
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
