import { StorageManager } from '../utils/storage';
import { HapticEngine } from './haptic-engine';
import { AcousticHaptics } from './acoustic-haptics';

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

export type IntonationContour = 'fall' | 'rise' | 'fall-rise' | 'flat';

export interface IntonationResult {
  contour: IntonationContour;
  symbol: string;        // '↘', '↗', '↘↗', '—'
  label: string;         // 'Statement Fall', 'Question Rise', 'Reservation Fall-Rise', 'Monotone Flat'
  confidence: number;    // 0.0 to 1.0
  startHz: number;
  endHz: number;
  minHz: number;
  maxHz: number;
  semitoneDelta: number;
}

export interface TonicProminenceResult {
  tonicIndex: number;
  prominenceScores: number[];
  isProminent: boolean;
  peakScore: number;
}

export interface RhythmAnalysisResult {
  npvi: number;
  cadence: 'stress-timed' | 'syllable-timed' | 'intermediate';
  label: string;
  description: string;
}

export interface VowelBenchmark {
  phoneme: string;
  label: string;
  example: string;
  f1: number;
  f2: number;
  radiusF1: number;
  radiusF2: number;
  l1Contrast?: string;
}

export interface VowelClassification {
  phoneme: string;
  label: string;
  example: string;
  distance: number;
  normX: number; // 0..100% on 2D chart (F2 inverted backness: 0=front, 100=back)
  normY: number; // 0..100% on 2D chart (F1 inverted height: 0=high/close, 100=low/open)
  isTargetMatch: boolean;
  driftGuidance: string;
}

export interface FormantResult {
  f1: number;
  f2: number;
  confidence: number;
  isVoiced: boolean;
  nearestVowel?: VowelClassification;
}

export interface MinimalPairResult {
  pairId?: string;
  wordA?: string;
  wordB?: string;
  durationRatio: number;
  durationPassed: boolean;
  formantDelta: number;
  codaTransientDetected: boolean;
  codaEnergy: number;
  overallScore: number;
  passed: boolean;
  feedback: string;
}

export interface MinimalPairItem {
  id: string;
  category: 'vowel-tense-lax' | 'vowel-front-open' | 'coda-retention' | 'coda-voicing';
  contrastLabel: string;
  wordA: string;
  ipaA: string;
  vowelA: string;
  wordB: string;
  ipaB: string;
  vowelB: string;
  targetDurationRatio?: number;
  focusHint: string;
}

export type AccentCadenceType = 'uk-rp' | 'general-american' | 'australian' | 'scottish';

export interface AccentCadenceModel {
  id: AccentCadenceType;
  label: string;
  langPrefixes: string[];
  preferredVoiceNames: RegExp[];
  rate: number;
  pitch: number;
  commaPauseMs: number;
  periodPauseMs: number;
  description: string;
}

export const ACCENT_CADENCE_MODELS: Record<AccentCadenceType, AccentCadenceModel> = {
  'uk-rp': {
    id: 'uk-rp',
    label: 'UK RP (Received Pronunciation)',
    langPrefixes: ['en-GB', 'en_GB'],
    preferredVoiceNames: [/george/i, /oliver/i, /hazel/i, /susan/i, /libby/i, /serena/i, /united kingdom/i, /great britain/i, /british/i],
    rate: 0.94,
    pitch: 1.0,
    commaPauseMs: 250,
    periodPauseMs: 420,
    description: 'Cambridge RP academic standard with measured tempo, crisp articulation, and deliberate pause structure.'
  },
  'general-american': {
    id: 'general-american',
    label: 'General American',
    langPrefixes: ['en-US', 'en_US'],
    preferredVoiceNames: [/david/i, /mark/i, /zira/i, /samantha/i, /alex/i, /united states/i, /american/i],
    rate: 0.98,
    pitch: 0.98,
    commaPauseMs: 200,
    periodPauseMs: 380,
    description: 'North American broadcast cadence with rhythmic continuity, rhotic vowels, and steady pacing.'
  },
  'australian': {
    id: 'australian',
    label: 'Australian',
    langPrefixes: ['en-AU', 'en_AU'],
    preferredVoiceNames: [/karen/i, /lee/i, /russell/i, /catherine/i, /natasha/i, /australia/i, /australian/i],
    rate: 0.95,
    pitch: 1.03,
    commaPauseMs: 220,
    periodPauseMs: 400,
    description: 'Australian cadence with natural high-rising terminal tendencies and relaxed vowel elongation.'
  },
  'scottish': {
    id: 'scottish',
    label: 'Scottish',
    langPrefixes: ['en-GB-scotland', 'en_GB', 'en-GB'],
    preferredVoiceNames: [/fiona/i, /scottish/i, /scotland/i, /gordon/i],
    rate: 0.91,
    pitch: 1.05,
    commaPauseMs: 260,
    periodPauseMs: 450,
    description: 'Scottish cadence featuring distinct prosodic lilts, rolling rhythmic cadences, and extended clause boundaries.'
  }
};

export const VOWEL_BENCHMARKS: VowelBenchmark[] = [
  {
    phoneme: '/iː/',
    label: 'Close Front Tense (sheep)',
    example: 'sheep',
    f1: 280,
    f2: 2250,
    radiusF1: 50,
    radiusF2: 130,
    l1Contrast: 'Vietnamese L1 often shortens /iː/ or lowers it to lax /ɪ/'
  },
  {
    phoneme: '/ɪ/',
    label: 'Near-Close Front Lax (ship)',
    example: 'ship',
    f1: 400,
    f2: 1920,
    radiusF1: 55,
    radiusF2: 130,
    l1Contrast: 'Vietnamese L1 often produces this too tense as /iː/'
  },
  {
    phoneme: '/e/',
    label: 'Open-Mid Front (bed)',
    example: 'bed',
    f1: 550,
    f2: 1800,
    radiusF1: 65,
    radiusF2: 140,
    l1Contrast: 'Easily confused with /æ/; keep mouth moderately open'
  },
  {
    phoneme: '/æ/',
    label: 'Near-Open Front (bad)',
    example: 'bad',
    f1: 750,
    f2: 1660,
    radiusF1: 70,
    radiusF2: 140,
    l1Contrast: 'Jaw insufficiently dropped (F1 < 600 Hz); drop jaw wider'
  },
  {
    phoneme: '/ʊ/',
    label: 'Near-Close Near-Back Lax (pull)',
    example: 'pull',
    f1: 440,
    f2: 1150,
    radiusF1: 55,
    radiusF2: 130,
    l1Contrast: 'Produced too tense or fronted as /uː/'
  },
  {
    phoneme: '/uː/',
    label: 'Close Back Tense (pool)',
    example: 'pool',
    f1: 310,
    f2: 940,
    radiusF1: 50,
    radiusF2: 130,
    l1Contrast: 'Lips unrounded or duration too brief; round lips tightly'
  },
  {
    phoneme: '/ʌ/',
    label: 'Open-Mid Back-Central (cup)',
    example: 'cup',
    f1: 640,
    f2: 1300,
    radiusF1: 65,
    radiusF2: 140,
    l1Contrast: 'Over-lengthened or backed into /ɑː/'
  },
  {
    phoneme: '/ɑː/',
    label: 'Open Back Tense (cart)',
    example: 'cart',
    f1: 720,
    f2: 1080,
    radiusF1: 65,
    radiusF2: 130,
    l1Contrast: 'Shortened or substituted with central vowel'
  }
];

export const MINIMAL_PAIRS_CURRICULUM: MinimalPairItem[] = [
  {
    id: 'mp-sheep-ship',
    category: 'vowel-tense-lax',
    contrastLabel: '/iː/ vs /ɪ/',
    wordA: 'sheep',
    ipaA: '/ʃiːp/',
    vowelA: '/iː/',
    wordB: 'ship',
    ipaB: '/ʃɪp/',
    vowelB: '/ɪ/',
    targetDurationRatio: 1.35,
    focusHint: 'Prolong /iː/ with wide smile; keep /ɪ/ brief and relaxed.'
  },
  {
    id: 'mp-seat-sit',
    category: 'vowel-tense-lax',
    contrastLabel: '/iː/ vs /ɪ/',
    wordA: 'seat',
    ipaA: '/siːt/',
    vowelA: '/iː/',
    wordB: 'sit',
    ipaB: '/sɪt/',
    vowelB: '/ɪ/',
    targetDurationRatio: 1.35,
    focusHint: 'Feel the tension in your facial muscles for "seat", relax for "sit".'
  },
  {
    id: 'mp-leave-live',
    category: 'vowel-tense-lax',
    contrastLabel: '/iː/ vs /ɪ/',
    wordA: 'leave',
    ipaA: '/liːv/',
    vowelA: '/iː/',
    wordB: 'live',
    ipaB: '/lɪv/',
    vowelB: '/ɪ/',
    targetDurationRatio: 1.35,
    focusHint: 'Sustain the long vowel in "leave" before voicing the final /v/.'
  },
  {
    id: 'mp-bad-bed',
    category: 'vowel-front-open',
    contrastLabel: '/æ/ vs /e/',
    wordA: 'bad',
    ipaA: '/bæd/',
    vowelA: '/æ/',
    wordB: 'bed',
    ipaB: '/bed/',
    vowelB: '/e/',
    targetDurationRatio: 1.25,
    focusHint: 'Drop your jaw down significantly for "bad" (/æ/); moderate opening for "bed".'
  },
  {
    id: 'mp-pan-pen',
    category: 'vowel-front-open',
    contrastLabel: '/æ/ vs /e/',
    wordA: 'pan',
    ipaA: '/pæn/',
    vowelA: '/æ/',
    wordB: 'pen',
    ipaB: '/pen/',
    vowelB: '/e/',
    targetDurationRatio: 1.25,
    focusHint: 'Lower your jaw two finger-widths for "pan", one finger-width for "pen".'
  },
  {
    id: 'mp-pool-pull',
    category: 'vowel-tense-lax',
    contrastLabel: '/uː/ vs /ʊ/',
    wordA: 'pool',
    ipaA: '/puːl/',
    vowelA: '/uː/',
    wordB: 'pull',
    ipaB: '/pʊl/',
    vowelB: '/ʊ/',
    targetDurationRatio: 1.35,
    focusHint: 'Round lips tightly for long "pool"; relax lips for short "pull".'
  },
  {
    id: 'mp-cart-cut',
    category: 'vowel-tense-lax',
    contrastLabel: '/ɑː/ vs /ʌ/',
    wordA: 'cart',
    ipaA: '/kɑːt/',
    vowelA: '/ɑː/',
    wordB: 'cut',
    ipaB: '/kʌt/',
    vowelB: '/ʌ/',
    targetDurationRatio: 1.35,
    focusHint: 'Deep open back vowel for "cart"; rapid central punch for "cut".'
  },
  {
    id: 'mp-white-why',
    category: 'coda-retention',
    contrastLabel: 'Final /t/ Stop Coda Retention',
    wordA: 'white',
    ipaA: '/waɪt/',
    vowelA: '/aɪ/',
    wordB: 'why',
    ipaB: '/waɪ/',
    vowelB: '/aɪ/',
    focusHint: 'Do not drop the final /t/! Ensure an audible alveolar plosive release transient.'
  },
  {
    id: 'mp-card-cart',
    category: 'coda-voicing',
    contrastLabel: 'Final Coda Voicing (/d/ vs /t/)',
    wordA: 'card',
    ipaA: '/kɑːd/',
    vowelA: '/ɑː/',
    wordB: 'cart',
    ipaB: '/kɑːt/',
    vowelB: '/ɑː/',
    targetDurationRatio: 1.20,
    focusHint: 'Vowels before voiced codas (/d/) are acoustically ~20% longer than before voiceless codas (/t/).'
  }
];


/**
 * Procedural Web Audio API Engine & Web Speech Telemetry Subsystem.
 * Features zero-latency context priming on initial interaction, Pythagorean Just Intonation
 * harmonic arpeggios, exponential ADSR amplitude envelopes, mobile haptic feedback,
 * and unified HUD master volume / decibel bus.
 */
export class AudioSynthesizer {
  private static ctx: AudioContext | null = null;
  private static masterGain: GainNode | null = null;

  // Triple-Bus Architecture: Decoupled SFX, Ambient Music, and Spoken Voice Buses
  private static sfxGain: GainNode | null = null;
  private static musicGain: GainNode | null = null;
  private static voiceGain: GainNode | null = null;
  private static sfxVolume: number = 0.8;
  private static musicVolume: number = 0.35;
  private static voiceVolume: number = 1.0;

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

  // Cambridge Exam Room Ambience Nodes (subtle pink noise + 40Hz acoustic room resonance)
  private static examAmbienceGain: GainNode | null = null;
  private static examAmbienceSubOsc: OscillatorNode | null = null;
  private static examAmbienceSubGain: GainNode | null = null;
  private static examAmbienceNoiseSource: AudioBufferSourceNode | null = null;
  private static examAmbienceNoiseFilter: BiquadFilterNode | null = null;
  private static examAmbienceNoiseGain: GainNode | null = null;
  private static isExamAmbienceRunning: boolean = false;
  private static examAmbienceStopTimer: any = null;

  // Multi-accent speech cadence model
  private static activeCadence: AccentCadenceType = 'uk-rp';

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
      AcousticHaptics.setMuted(this.isMuted);
      const savedVol = localStorage.getItem('eng_master_volume');
      if (savedVol !== null) {
        const parsed = parseFloat(savedVol);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          this.masterVolume = parsed;
        }
      }
      const savedSfx = localStorage.getItem('eng_sfx_volume');
      if (savedSfx !== null) {
        const parsed = parseFloat(savedSfx);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) this.sfxVolume = parsed;
      }
      const savedVoice = localStorage.getItem('eng_voice_volume');
      if (savedVoice !== null) {
        const parsed = parseFloat(savedVoice);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) this.voiceVolume = parsed;
      }
      const savedMusic = localStorage.getItem('eng_music_volume');
      if (savedMusic !== null) {
        const parsed = parseFloat(savedMusic);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) this.musicVolume = parsed;
      }
    } catch {
      this.isMuted = false;
      this.masterVolume = 0.8;
      this.sfxVolume = 0.8;
      this.voiceVolume = 1.0;
      this.musicVolume = 0.35;
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
        this.sfxGain = this.ctx.createGain();
        this.musicGain = this.ctx.createGain();
        this.voiceGain = this.ctx.createGain();

        const effectiveGain = this.isMuted
          ? this.MUTE_FLOOR
          : Math.max(this.EPSILON, this.masterVolume * this.NORMAL_GAIN);

        this.masterGain.gain.setValueAtTime(effectiveGain, this.ctx.currentTime);
        this.sfxGain.gain.setValueAtTime(Math.max(this.EPSILON, this.sfxVolume), this.ctx.currentTime);
        this.musicGain.gain.setValueAtTime(Math.max(this.EPSILON, this.musicVolume), this.ctx.currentTime);
        this.voiceGain.gain.setValueAtTime(Math.max(this.EPSILON, this.voiceVolume), this.ctx.currentTime);

        this.sfxGain.connect(this.masterGain);
        this.musicGain.connect(this.masterGain);
        this.voiceGain.connect(this.masterGain);
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

  public static getSfxGain(): GainNode | null {
    return this.sfxGain || this.masterGain;
  }

  public static getMusicGain(): GainNode | null {
    return this.musicGain || this.masterGain;
  }

  public static getVoiceGain(): GainNode | null {
    return this.voiceGain || this.masterGain;
  }

  public static setSfxVolume(val: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    this.applyVolumeToBus();
    try {
      localStorage.setItem('eng_sfx_volume', String(this.sfxVolume));
    } catch {}
  }

  public static getSfxVolume(): number {
    return this.sfxVolume;
  }

  public static setVoiceVolume(val: number): void {
    this.voiceVolume = Math.max(0, Math.min(1, val));
    this.applyVolumeToBus();
    try {
      localStorage.setItem('eng_voice_volume', String(this.voiceVolume));
    } catch {}
  }

  public static getVoiceVolume(): number {
    return this.voiceVolume;
  }

  public static setMusicVolume(val: number): void {
    this.musicVolume = Math.max(0, Math.min(1, val));
    this.applyVolumeToBus();
    try {
      localStorage.setItem('eng_music_volume', String(this.musicVolume));
    } catch {}
  }

  public static getMusicVolume(): number {
    return this.musicVolume;
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
    AcousticHaptics.setMuted(this.isMuted);
    return this.isMuted;
  }

  public static setMuted(state: boolean): void {
    this.isMuted = state;
    this.applyVolumeToBus();
    try {
      localStorage.setItem('eng_master_muted', String(this.isMuted));
    } catch {}
    AcousticHaptics.setMuted(this.isMuted);
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

      if (this.sfxGain) {
        this.sfxGain.gain.cancelScheduledValues(now);
        const currentSfx = Math.max(this.MUTE_FLOOR, this.sfxGain.gain.value);
        this.sfxGain.gain.setValueAtTime(currentSfx, now);
        this.sfxGain.gain.exponentialRampToValueAtTime(Math.max(this.EPSILON, this.sfxVolume), now + 0.03);
      }

      if (this.musicGain) {
        this.musicGain.gain.cancelScheduledValues(now);
        const currentMusic = Math.max(this.MUTE_FLOOR, this.musicGain.gain.value);
        this.musicGain.gain.setValueAtTime(currentMusic, now);
        this.musicGain.gain.exponentialRampToValueAtTime(Math.max(this.EPSILON, this.musicVolume), now + 0.03);
      }

      if (this.voiceGain) {
        this.voiceGain.gain.cancelScheduledValues(now);
        const currentVoice = Math.max(this.MUTE_FLOOR, this.voiceGain.gain.value);
        this.voiceGain.gain.setValueAtTime(currentVoice, now);
        this.voiceGain.gain.exponentialRampToValueAtTime(Math.max(this.EPSILON, this.voiceVolume), now + 0.03);
      }

      if (this.examAmbienceGain) {
        this.examAmbienceGain.gain.cancelScheduledValues(now);
        const currentAmb = Math.max(this.MUTE_FLOOR, this.examAmbienceGain.gain.value);
        this.examAmbienceGain.gain.setValueAtTime(currentAmb, now);
        const targetAmb = (this.isMuted || this.masterVolume === 0) ? this.MUTE_FLOOR : 0.025;
        this.examAmbienceGain.gain.exponentialRampToValueAtTime(targetAmb, now + 0.03);
      }
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

  // =========================================================================
  // CAMBRIDGE EXAM ROOM AMBIENCE SUBSYSTEM (40Hz RESONANCE + PINK NOISE)
  // =========================================================================

  /**
   * Activates or disables subtle procedural Cambridge exam hall acoustics.
   * Synthesizes 40Hz acoustic structural room resonance and soft Kellet-filtered
   * pink noise to emulate authentic exam presence with strict zero DC-pop envelopes.
   */
  public static playExamRoomAmbience(enabled: boolean): void {
    if (enabled) {
      this.isExamAmbienceRunning = true;
      if (this.examAmbienceStopTimer) {
        clearTimeout(this.examAmbienceStopTimer);
        this.examAmbienceStopTimer = null;
      }

      if (!this.ctx || this.ctx.state === 'suspended') {
        this.ensureActiveContext()
          .then(() => {
            if (!this.isExamAmbienceRunning || !this.ctx || !this.masterGain) return;
            this.initExamRoomAmbienceNodes();
          })
          .catch(() => {});
        return;
      }

      this.initExamRoomAmbienceNodes();
    } else {
      this.isExamAmbienceRunning = false;
      if (this.examAmbienceStopTimer) {
        clearTimeout(this.examAmbienceStopTimer);
        this.examAmbienceStopTimer = null;
      }

      if (!this.ctx || !this.examAmbienceGain) {
        this.cleanupExamRoomAmbienceNodes();
        return;
      }

      try {
        const t = this.ctx.currentTime;
        this.examAmbienceGain.gain.cancelScheduledValues(t);
        const curVal = Math.max(this.MUTE_FLOOR, this.examAmbienceGain.gain.value);
        this.examAmbienceGain.gain.setValueAtTime(curVal, t);
        this.examAmbienceGain.gain.exponentialRampToValueAtTime(this.MUTE_FLOOR, t + 0.3);

        this.examAmbienceStopTimer = setTimeout(() => {
          if (!this.isExamAmbienceRunning) {
            this.cleanupExamRoomAmbienceNodes();
          }
        }, 350);
      } catch {
        this.cleanupExamRoomAmbienceNodes();
      }
    }
  }

  public static isExamRoomAmbienceActive(): boolean {
    return this.isExamAmbienceRunning;
  }

  private static initExamRoomAmbienceNodes(): void {
    if (!this.ctx || !this.masterGain || this.examAmbienceGain) return;

    try {
      const ctx = this.ctx;
      const t = ctx.currentTime;

      // Master room ambience gain clamped to 0.025 (subtle, non-intrusive)
      const masterAmbGain = ctx.createGain();
      const targetGain = (this.isMuted || this.masterVolume === 0) ? this.MUTE_FLOOR : 0.025;
      masterAmbGain.gain.setValueAtTime(this.EPSILON, t);
      masterAmbGain.gain.exponentialRampToValueAtTime(targetGain, t + 0.4);

      // Connect to musicGain bus if present, else masterGain
      const destination = this.musicGain || this.masterGain;
      masterAmbGain.connect(destination);
      this.examAmbienceGain = masterAmbGain;

      // 1. 40Hz acoustic structural room resonance
      const subOsc = ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(40, t);

      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.35, t);
      subOsc.connect(subGain);
      subGain.connect(masterAmbGain);

      // 2. Subtle procedural pink noise floor simulating hall air circulation
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
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
        b6 = white * 0.115926;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      // Lowpass room filter shaping air handling resonance
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(450, t);
      noiseFilter.Q.setValueAtTime(1.1, t);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.5, t);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterAmbGain);

      subOsc.start(t);
      noiseSource.start(t);

      this.examAmbienceSubOsc = subOsc;
      this.examAmbienceSubGain = subGain;
      this.examAmbienceNoiseSource = noiseSource;
      this.examAmbienceNoiseFilter = noiseFilter;
      this.examAmbienceNoiseGain = noiseGain;
    } catch (err) {
      console.warn('[AUDIO] Error initializing exam room ambience:', err);
      this.cleanupExamRoomAmbienceNodes();
    }
  }

  private static cleanupExamRoomAmbienceNodes(): void {
    try {
      if (this.examAmbienceSubOsc) {
        this.examAmbienceSubOsc.stop();
        this.examAmbienceSubOsc.disconnect();
      }
    } catch {}
    try {
      if (this.examAmbienceSubGain) {
        this.examAmbienceSubGain.disconnect();
      }
    } catch {}
    try {
      if (this.examAmbienceNoiseSource) {
        this.examAmbienceNoiseSource.stop();
        this.examAmbienceNoiseSource.disconnect();
      }
    } catch {}
    try {
      if (this.examAmbienceNoiseFilter) {
        this.examAmbienceNoiseFilter.disconnect();
      }
    } catch {}
    try {
      if (this.examAmbienceNoiseGain) {
        this.examAmbienceNoiseGain.disconnect();
      }
    } catch {}
    try {
      if (this.examAmbienceGain) {
        this.examAmbienceGain.disconnect();
      }
    } catch {}

    this.examAmbienceSubOsc = null;
    this.examAmbienceSubGain = null;
    this.examAmbienceNoiseSource = null;
    this.examAmbienceNoiseFilter = null;
    this.examAmbienceNoiseGain = null;
    this.examAmbienceGain = null;
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

  // -------------------------------------------------------------------------
  // MULTI-ACCENT CADENCE & SPEECH RECOGNITION CONFIGURATION
  // -------------------------------------------------------------------------

  public static setCadence(cadence: AccentCadenceType): void {
    if (ACCENT_CADENCE_MODELS[cadence]) {
      this.activeCadence = cadence;
      try {
        localStorage.setItem('eng_accent_cadence', cadence);
      } catch {}
    }
  }

  public static getCadence(): AccentCadenceType {
    return this.activeCadence;
  }

  public static getCadenceModel(cadence?: AccentCadenceType): AccentCadenceModel {
    return ACCENT_CADENCE_MODELS[cadence || this.activeCadence] || ACCENT_CADENCE_MODELS['uk-rp'];
  }

  public static getAvailableCadences(): AccentCadenceModel[] {
    return Object.values(ACCENT_CADENCE_MODELS);
  }

  public static getVoiceForAccent(accent: AccentCadenceType): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

    const available = this.voices.length > 0 ? this.voices : window.speechSynthesis.getVoices();
    if (!available || available.length === 0) return null;

    const model = ACCENT_CADENCE_MODELS[accent] || ACCENT_CADENCE_MODELS['uk-rp'];

    // 1. Try matching preferred voice names for this accent
    for (const pattern of model.preferredVoiceNames) {
      const matched = available.find(v => pattern.test(v.name) && v.lang.toLowerCase().startsWith('en'));
      if (matched) return matched;
    }

    // 2. Try matching language prefix
    for (const prefix of model.langPrefixes) {
      const cleanPrefix = prefix.toLowerCase().replace('_', '-');
      const matched = available.find(v => v.lang.toLowerCase().replace('_', '-').startsWith(cleanPrefix));
      if (matched) return matched;
    }

    // 3. Fall back to preferred English voice
    return this.getPreferredEnglishVoice();
  }

  public static speak(
    text: string,
    rateOrOptions: number | { rate?: number; pitch?: number; accent?: AccentCadenceType; onEnd?: () => void } = 0.95,
    maybeAccent?: AccentCadenceType
  ): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('[SPEECH] Web Speech API not supported in this environment.');
      return;
    }

    try {
      window.speechSynthesis.cancel();

      let rate = 0.95;
      let pitch = 1.0;
      let accent: AccentCadenceType = this.activeCadence;
      let onEndCb: (() => void) | undefined;

      if (typeof rateOrOptions === 'number') {
        rate = rateOrOptions;
        if (maybeAccent) accent = maybeAccent;
      } else if (typeof rateOrOptions === 'object' && rateOrOptions !== null) {
        if (rateOrOptions.accent) accent = rateOrOptions.accent;
        const model = this.getCadenceModel(accent);
        rate = rateOrOptions.rate ?? model.rate;
        pitch = rateOrOptions.pitch ?? model.pitch;
        onEndCb = rateOrOptions.onEnd;
      }

      const UtteranceClass = (window as any).SpeechSynthesisUtterance || SpeechSynthesisUtterance;
      const utterance = new UtteranceClass(text);
      const voice = this.getVoiceForAccent(accent) || this.getPreferredEnglishVoice();

      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        const model = this.getCadenceModel(accent);
        utterance.lang = model.langPrefixes[0] || 'en-GB';
      }

      utterance.rate = rate;
      utterance.pitch = pitch;

      this.activeUtterance = utterance;
      utterance.onend = () => {
        this.activeUtterance = null;
        if (onEndCb) onEndCb();
      };
      utterance.onerror = (e: any) => {
        console.warn('[SPEECH] Playback error or cancelled:', e);
        this.activeUtterance = null;
        if (onEndCb) onEndCb();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[SPEECH] Speech playback failed:', err);
    }
  }

  /**
   * Synthesizes text applying multi-accent cadence prosody and punctuation micro-pauses (200-450ms).
   * Splits into clauses at punctuation (, ; : —) with commaPauseMs (200-260ms),
   * and at sentence boundaries (. ! ?) with periodPauseMs (380-450ms).
   */
  public static speakWithCadence(
    text: string,
    opts?: {
      accent?: AccentCadenceType;
      rate?: number;
      pitch?: number;
      onEnd?: () => void;
    }
  ): { stop(): void } {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      opts?.onEnd?.();
      return { stop() {} };
    }

    const synth = window.speechSynthesis;
    synth.cancel();

    const accent = opts?.accent || this.activeCadence;
    const model = this.getCadenceModel(accent);
    const voice = this.getVoiceForAccent(accent);
    const rate = opts?.rate ?? model.rate;
    const pitch = opts?.pitch ?? model.pitch;

    // Tokenize text into chunks preserving trailing punctuation
    const rawChunks = text.match(/[^.!?,;:]+[.!?,;:]*|[^.!?,;:]+$/g)?.map(s => s.trim()).filter(Boolean) || [text];

    let stopped = false;
    let currentIdx = 0;
    let timerId: any = null;

    const speakNext = () => {
      if (stopped) return;
      if (currentIdx >= rawChunks.length) {
        opts?.onEnd?.();
        return;
      }

      const chunk = rawChunks[currentIdx++];
      const UtteranceClass = (window as any).SpeechSynthesisUtterance || SpeechSynthesisUtterance;
      const utterance = new UtteranceClass(chunk);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = model.langPrefixes[0] || 'en-GB';
      }
      utterance.rate = rate;
      utterance.pitch = pitch;

      this.activeUtterance = utterance;

      const lastChar = chunk.slice(-1);
      const isSentenceEnd = ['.', '!', '?'].includes(lastChar);
      const isClauseEnd = [',', ';', ':', '—', '-'].includes(lastChar);
      const pauseDuration = isSentenceEnd
        ? model.periodPauseMs
        : (isClauseEnd ? model.commaPauseMs : 150);

      utterance.onend = () => {
        this.activeUtterance = null;
        if (!stopped) {
          timerId = setTimeout(speakNext, pauseDuration);
        }
      };

      utterance.onerror = () => {
        this.activeUtterance = null;
        if (!stopped) {
          timerId = setTimeout(speakNext, pauseDuration);
        }
      };

      synth.speak(utterance);
    };

    speakNext();

    return {
      stop: () => {
        stopped = true;
        if (timerId) {
          clearTimeout(timerId);
          timerId = null;
        }
        synth.cancel();
        this.activeUtterance = null;
      }
    };
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

  /**
   * Intonation Contour Classifier:
   * Categorizes pitch trajectory into Fall (↘), Rise (↗), Fall-Rise (↘↗), or Monotone Flat (—).
   */
  public static classifyIntonationContour(pitchSamples: number[]): IntonationResult {
    if (!pitchSamples || pitchSamples.length === 0) {
      return {
        contour: 'flat',
        symbol: '—',
        label: 'Monotone Flat',
        confidence: 0,
        startHz: 0,
        endHz: 0,
        minHz: 0,
        maxHz: 0,
        semitoneDelta: 0
      };
    }

    const voiced = pitchSamples.filter(f => typeof f === 'number' && !isNaN(f) && f > 40 && f < 600);
    if (voiced.length < 3) {
      const avg = voiced.length > 0 ? Math.round(voiced[0]) : 0;
      return {
        contour: 'flat',
        symbol: '—',
        label: 'Monotone Flat',
        confidence: 0,
        startHz: avg,
        endHz: avg,
        minHz: avg,
        maxHz: avg,
        semitoneDelta: 0
      };
    }

    // 3-point moving average smoothing
    const smoothed = voiced.map((val, idx, arr) => {
      const p1 = idx > 0 ? arr[idx - 1] : val;
      const p2 = val;
      const p3 = idx < arr.length - 1 ? arr[idx + 1] : val;
      return (p1 + p2 + p3) / 3;
    });

    const len = smoothed.length;
    const third = Math.max(1, Math.floor(len / 3));
    const head = smoothed.slice(0, third);
    const body = smoothed.slice(third, len - third);
    const tail = smoothed.slice(len - third);

    const startHz = Math.round(head.reduce((a, b) => a + b, 0) / head.length);
    const midHz = body.length > 0 ? Math.round(body.reduce((a, b) => a + b, 0) / body.length) : startHz;
    const endHz = Math.round(tail.reduce((a, b) => a + b, 0) / tail.length);
    const minHz = Math.round(Math.min(...smoothed));
    const maxHz = Math.round(Math.max(...smoothed));

    const semitoneDelta = Math.round((12 * Math.log2(Math.max(1, endHz) / Math.max(1, startHz))) * 10) / 10;
    const semitoneRange = Math.round((12 * Math.log2(Math.max(1, maxHz) / Math.max(1, minHz))) * 10) / 10;

    let contour: IntonationContour = 'flat';
    let symbol = '—';
    let label = 'Monotone Flat';

    if (semitoneRange < 1.4) {
      contour = 'flat';
      symbol = '—';
      label = 'Monotone Flat';
    } else if (midHz < startHz - 1.4 && endHz > midHz + 1.4) {
      contour = 'fall-rise';
      symbol = '↘↗';
      label = 'Reservation Fall-Rise';
    } else if (semitoneDelta >= 1.5) {
      contour = 'rise';
      symbol = '↗';
      label = 'Question Rise';
    } else if (semitoneDelta <= -1.5) {
      contour = 'fall';
      symbol = '↘';
      label = 'Statement Fall';
    } else if (endHz > startHz) {
      contour = 'rise';
      symbol = '↗';
      label = 'Question Rise';
    } else if (endHz < startHz) {
      contour = 'fall';
      symbol = '↘';
      label = 'Statement Fall';
    }

    const confidence = Math.min(1.0, Math.max(0.4, Math.round((Math.abs(semitoneDelta) / 3.5) * 100) / 100));

    return {
      contour,
      symbol,
      label,
      confidence,
      startHz,
      endHz,
      minHz,
      maxHz,
      semitoneDelta
    };
  }

  /**
   * Tonic Syllable Prominence Detector:
   * Evaluates acoustic prominence across voiced frames to identify nuclear stress position.
   */
  public static detectTonicProminence(
    pitchSamples: number[],
    energySamples: number[],
    frameDurationSec: number = 0.05
  ): TonicProminenceResult {
    if (!pitchSamples || !energySamples || pitchSamples.length === 0 || energySamples.length === 0) {
      return { tonicIndex: -1, prominenceScores: [], isProminent: false, peakScore: 0 };
    }

    const totalFrames = Math.min(pitchSamples.length, energySamples.length);
    const windowFrames = Math.max(2, Math.round(0.15 / frameDurationSec)); // ~150ms window
    const numChunks = Math.ceil(totalFrames / windowFrames);
    const chunkScores: number[] = [];

    let maxEnergy = 0.001;
    let maxPitch = 50;

    for (let c = 0; c < numChunks; c++) {
      const start = c * windowFrames;
      const end = Math.min(totalFrames, start + windowFrames);
      let sumEnergy = 0;
      let sumPitch = 0;
      let voicedCount = 0;
      for (let i = start; i < end; i++) {
        const e = energySamples[i] || 0;
        sumEnergy += e;
        if (e > maxEnergy) maxEnergy = e;
        const p = pitchSamples[i] || 0;
        if (p > 40 && p < 600) {
          sumPitch += p;
          voicedCount++;
          if (p > maxPitch) maxPitch = p;
        }
      }
      const avgE = sumEnergy / (end - start);
      const avgP = voicedCount > 0 ? sumPitch / voicedCount : 0;
      chunkScores.push(avgE * 0.6 + (avgP / 400) * 0.4);
    }

    const normDenominator = maxEnergy * 0.6 + (maxPitch / 400) * 0.4 || 1;
    const normScores = chunkScores.map(s => Math.round(Math.min(1.0, s / normDenominator) * 100) / 100);
    let peakScore = 0;
    let tonicIndex = -1;

    for (let i = 0; i < normScores.length; i++) {
      if (normScores[i] > peakScore) {
        peakScore = normScores[i];
        tonicIndex = i;
      }
    }

    const isProminent = peakScore >= 0.55 && maxEnergy >= 0.035;

    return {
      tonicIndex,
      prominenceScores: normScores,
      isProminent,
      peakScore
    };
  }

  /**
   * Stress-Timing Rhythm Meter:
   * Computes Normalized Pairwise Variability Index (nPVI) of vocalic duration intervals.
   * nPVI >= 60 indicates stress-timed cadence (native English standard).
   * nPVI < 45 indicates syllable-timed staccato rhythm.
   */
  public static computeRhythmMetrics(
    energySamples: number[],
    frameDurationSec: number = 0.05
  ): RhythmAnalysisResult {
    if (!energySamples || energySamples.length === 0) {
      return {
        npvi: 50,
        cadence: 'intermediate',
        label: 'Balanced Intermediate',
        description: 'Cadence within normal conversational parameters.'
      };
    }

    // Identify vocalic energy bursts (energy >= 0.035)
    const durations: number[] = [];
    let currentBurstFrames = 0;

    for (let i = 0; i < energySamples.length; i++) {
      if (energySamples[i] >= 0.035) {
        currentBurstFrames++;
      } else {
        if (currentBurstFrames > 0) {
          const durationSec = currentBurstFrames * frameDurationSec;
          // Filter out micro-clicks < 60ms
          if (durationSec >= 0.06) {
            durations.push(durationSec * 1000); // in ms
          }
          currentBurstFrames = 0;
        }
      }
    }
    if (currentBurstFrames > 0) {
      const durationSec = currentBurstFrames * frameDurationSec;
      if (durationSec >= 0.06) {
        durations.push(durationSec * 1000);
      }
    }

    if (durations.length < 2) {
      return {
        npvi: 50,
        cadence: 'intermediate',
        label: 'Balanced Intermediate',
        description: 'Insufficient syllable intervals to measure pairwise variability.'
      };
    }

    let sumDiff = 0;
    for (let k = 0; k < durations.length - 1; k++) {
      const d1 = durations[k];
      const d2 = durations[k + 1];
      const mean = (d1 + d2) / 2;
      if (mean > 0) {
        sumDiff += Math.abs(d1 - d2) / mean;
      }
    }

    const rawNpvi = (100 / (durations.length - 1)) * sumDiff;
    const npvi = Math.round(Math.min(150, Math.max(0, rawNpvi)) * 10) / 10;

    if (npvi >= 60) {
      return {
        npvi,
        cadence: 'stress-timed',
        label: 'Native Stress-Timed (nPVI ≥ 60)',
        description: 'High durational contrast between reduced unstressed syllables and elongated tonic content words.'
      };
    } else if (npvi < 45) {
      return {
        npvi,
        cadence: 'syllable-timed',
        label: 'Syllable-Timed (nPVI < 45)',
        description: 'Staccato equal-length syllable pacing. Practice reducing weak function words and elongating tonic words.'
      };
    } else {
      return {
        npvi,
        cadence: 'intermediate',
        label: 'Balanced Intermediate (45 ≤ nPVI < 60)',
        description: 'Moderate rhythmic variation approaching natural English prosodic cadence.'
      };
    }
  }

  /**
   * Real-Time Formant Frequency Estimator (F1 / F2):
   * Extracts vowel height (F1: 200-1000Hz) and vowel backness (F2: 850-2800Hz)
   * using Pre-emphasis, Voiced/Unvoiced gating (ZCR < 0.22, RMS >= 0.02),
   * and sub-bin Parabolic Peak Interpolation in <0.05ms execution budget.
   */
  public static estimateFormants(
    input: Float32Array | number[],
    sampleRate: number = 44100,
    isTimeDomain: boolean = false
  ): FormantResult {
    if (!input || input.length < 16) {
      return { f1: 0, f2: 0, confidence: 0, isVoiced: false };
    }

    let magnitude: number[] = [];
    let isVoiced = true;
    let confidence = 0.5;

    if (isTimeDomain) {
      // 1. Time-Domain Voiced Speech Gate (ZCR & RMS)
      const N = input.length;
      let zeroCrossings = 0;
      let sumSq = 0;
      for (let i = 0; i < N; i++) {
        const val = input[i];
        sumSq += val * val;
        if (i > 0) {
          if ((input[i] >= 0 && input[i - 1] < 0) || (input[i] < 0 && input[i - 1] >= 0)) {
            zeroCrossings++;
          }
        }
      }
      const rms = Math.sqrt(sumSq / N);
      const zcr = zeroCrossings / (2 * N);

      // Voiced vowels have low ZCR (< 0.22) and significant energy (RMS >= 0.02)
      if (rms < 0.02 || zcr >= 0.22) {
        return { f1: 0, f2: 0, confidence: 0, isVoiced: false };
      }

      // 2. Pre-emphasis High-Pass filter: y[n] = x[n] - 0.95 * x[n-1]
      const pre = new Float32Array(N);
      pre[0] = input[0];
      for (let i = 1; i < N; i++) {
        pre[i] = input[i] - 0.95 * input[i - 1];
      }

      // 3. Compact DFT across 512 frequency points (up to ~3400Hz)
      const numBins = 512;
      magnitude = new Array(numBins).fill(0);
      const maxFreqTarget = 3400;
      const binStep = maxFreqTarget / numBins;

      for (let k = 0; k < numBins; k++) {
        const freq = k * binStep;
        const omega = (2 * Math.PI * freq) / sampleRate;
        let real = 0;
        let imag = 0;
        const step = Math.max(1, Math.floor(N / 256));
        for (let n = 0; n < N; n += step) {
          // Hamming window
          const w = 0.54 - 0.46 * Math.cos((2 * Math.PI * n) / (N - 1));
          const val = pre[n] * w;
          real += val * Math.cos(omega * n);
          imag -= val * Math.sin(omega * n);
        }
        magnitude[k] = Math.sqrt(real * real + imag * imag);
      }
    } else {
      // Magnitude spectrum array provided (e.g. from AnalyserNode or FFT)
      magnitude = Array.from(input);
      // If dB values (e.g. -100 to 0), convert to linear magnitude
      if (magnitude.some(v => v < 0)) {
        magnitude = magnitude.map(db => Math.pow(10, db / 20));
      }
    }

    const totalBins = magnitude.length;
    const binHz = sampleRate / (2 * (totalBins > 1 ? totalBins - 1 : 1024));

    const maxMag = Math.max(...magnitude);
    if (maxMag <= 1e-6) {
      return { f1: 0, f2: 0, confidence: 0, isVoiced: false };
    }

    interface LocalPeak {
      freq: number;
      mag: number;
      bin: number;
    }
    const peaks: LocalPeak[] = [];

    for (let k = 1; k < totalBins - 1; k++) {
      if (magnitude[k] > magnitude[k - 1] && magnitude[k] > magnitude[k + 1]) {
        const alpha = magnitude[k - 1];
        const beta = magnitude[k];
        const gamma = magnitude[k + 1];
        const denom = alpha - 2 * beta + gamma;
        let delta = 0;
        if (Math.abs(denom) > 1e-9) {
          delta = 0.5 * (alpha - gamma) / denom;
          delta = Math.max(-1, Math.min(1, delta));
        }
        const freq = (k + delta) * binHz;
        if (freq >= 180 && freq <= 3200) {
          peaks.push({ freq, mag: beta, bin: k });
        }
      }
    }

    // F1 Search Band: 200 Hz to 1000 Hz
    const f1Candidates = peaks.filter(p => p.freq >= 200 && p.freq <= 1000);
    let bestF1: LocalPeak | null = null;
    let maxF1Mag = 0;
    for (const c of f1Candidates) {
      if (c.mag > maxF1Mag) {
        maxF1Mag = c.mag;
        bestF1 = c;
      }
    }

    // F2 Search Band: 850 Hz to 2800 Hz (separated from F1 by at least 140Hz)
    const f2Candidates = peaks.filter(p => {
      if (p.freq < 850 || p.freq > 2800) return false;
      if (bestF1 && Math.abs(p.freq - bestF1.freq) < 140) return false;
      return true;
    });
    let bestF2: LocalPeak | null = null;
    let maxF2Mag = 0;
    for (const c of f2Candidates) {
      if (c.mag > maxF2Mag) {
        maxF2Mag = c.mag;
        bestF2 = c;
      }
    }

    const f1 = bestF1 ? Math.round(bestF1.freq) : 0;
    const f2 = bestF2 ? Math.round(bestF2.freq) : 0;

    if (f1 > 0 && f2 > 0) {
      confidence = Math.min(1.0, Math.max(0.3, Math.round(((maxF1Mag + maxF2Mag) / (2 * maxMag)) * 100) / 100));
    } else {
      confidence = 0.2;
    }

    const nearestVowel = f1 > 0 && f2 > 0 ? this.classifyVowelFormants(f1, f2) : undefined;

    return {
      f1,
      f2,
      confidence,
      isVoiced,
      nearestVowel
    };
  }

  /**
   * Classifies F1/F2 coordinates into standard IPA vowel space,
   * calculating Euclidean distance, 2D normalized chart coordinates (0-100%),
   * and target drift biofeedback guidance.
   */
  public static classifyVowelFormants(f1: number, f2: number, targetPhoneme?: string): VowelClassification {
    let bestDist = Infinity;
    let bestBenchmark: VowelBenchmark = VOWEL_BENCHMARKS[0];

    for (const b of VOWEL_BENCHMARKS) {
      const d1 = (f1 - b.f1) / 200;
      const d2 = (f2 - b.f2) / 450;
      const dist = Math.sqrt(d1 * d1 + d2 * d2);
      if (dist < bestDist) {
        bestDist = dist;
        bestBenchmark = b;
      }
    }

    // 2D IPA Quadrilateral Coordinates:
    // X = F2 Backness Inverted (Front 2600Hz -> 0%, Back 800Hz -> 100%)
    const normX = Math.round(Math.max(0, Math.min(100, ((2600 - f2) / (2600 - 800)) * 100)) * 10) / 10;
    // Y = F1 Vowel Height Inverted (High/Close 250Hz -> 0%, Low/Open 900Hz -> 100%)
    const normY = Math.round(Math.max(0, Math.min(100, ((f1 - 250) / (900 - 250)) * 100)) * 10) / 10;

    const targetB = targetPhoneme
      ? VOWEL_BENCHMARKS.find(b => b.phoneme === targetPhoneme) || bestBenchmark
      : bestBenchmark;

    const isTargetMatch =
      Math.abs(f1 - targetB.f1) <= targetB.radiusF1 &&
      Math.abs(f2 - targetB.f2) <= targetB.radiusF2;

    let driftGuidance = '';
    if (isTargetMatch) {
      driftGuidance = `Optimal acoustic resonance match for ${targetB.phoneme} (${targetB.example}).`;
    } else {
      const guidanceParts: string[] = [];
      if (f1 > targetB.f1 + targetB.radiusF1) {
        guidanceParts.push('Close jaw / raise tongue slightly (F1 is too high)');
      } else if (f1 < targetB.f1 - targetB.radiusF1) {
        guidanceParts.push('Drop jaw wider / lower tongue (F1 is too low)');
      }

      if (f2 < targetB.f2 - targetB.radiusF2) {
        guidanceParts.push('Push tongue forward / spread lips wider (F2 is too low)');
      } else if (f2 > targetB.f2 + targetB.radiusF2) {
        guidanceParts.push('Pull tongue back / round lips slightly (F2 is too high)');
      }

      if (guidanceParts.length === 0) {
        guidanceParts.push(`Approaching target ${targetB.phoneme}; stabilize sustained resonance`);
      }
      driftGuidance = guidanceParts.join('; ') + '.';
    }

    return {
      phoneme: bestBenchmark.phoneme,
      label: bestBenchmark.label,
      example: bestBenchmark.example,
      distance: Math.round(bestDist * 100) / 100,
      normX,
      normY,
      isTargetMatch,
      driftGuidance
    };
  }

  /**
   * Minimal Pairs Tri-Factor Acoustic Evaluator:
   * Assesses duration ratio (e.g. /iː/ vs /ɪ/ >= 1.35x), formant spectral separation,
   * and coda plosive release transient energy (>2.5kHz burst).
   */
  public static evaluateMinimalPairAcoustics(params: {
    pairId?: string;
    durationA: number;
    durationB: number;
    formantsA?: { f1: number; f2: number };
    formantsB?: { f1: number; f2: number };
    codaEnergy?: number;
    expectedRatio?: number;
    requireCoda?: boolean;
  }): MinimalPairResult {
    const durA = Math.max(0.01, params.durationA);
    const durB = Math.max(0.01, params.durationB);
    const durationRatio = Math.round((durA / durB) * 100) / 100;
    const targetRatio = params.expectedRatio !== undefined ? params.expectedRatio : 1.35;

    const durationPassed = durationRatio >= targetRatio;

    let formantDelta = 0;
    if (params.formantsA && params.formantsB) {
      const df1 = params.formantsA.f1 - params.formantsB.f1;
      const df2 = params.formantsA.f2 - params.formantsB.f2;
      formantDelta = Math.round(Math.sqrt(df1 * df1 + df2 * df2));
    }

    const codaEnergy = params.codaEnergy !== undefined ? params.codaEnergy : 0;
    const codaTransientDetected = codaEnergy >= 0.025;

    let overallScore = 0;
    let feedback = '';
    let passed = false;

    if (params.requireCoda) {
      const codaScore = codaTransientDetected ? 70 : 20;
      const durBonus = Math.min(30, Math.round(Math.abs(durationRatio - 1.0) * 50));
      overallScore = Math.min(100, codaScore + durBonus);
      passed = codaTransientDetected;
      feedback = codaTransientDetected
        ? 'High-frequency coda release transient detected. Final stop consonant cleanly articulated!'
        : 'Coda unreleased or dropped! Ensure audible alveolar/velar stop burst at word end.';
    } else {
      const ratioScore = durationPassed ? 50 : Math.max(10, Math.round((durationRatio / targetRatio) * 35));
      const formantScore = formantDelta >= 80 ? 50 : Math.min(50, Math.round((formantDelta / 80) * 50));
      const rawScore = ratioScore + formantScore;
      overallScore = durationPassed ? Math.min(100, rawScore) : Math.min(65, rawScore);
      passed = durationPassed && (formantDelta >= 60 || !params.formantsA);
      if (passed) {
        feedback = `Acoustic contrast confirmed! Duration ratio (${durationRatio}x >= ${targetRatio}x) and formant separation (${formantDelta}Hz) meet target standard.`;
      } else if (!durationPassed) {
        feedback = `Insufficient vowel duration contrast (${durationRatio}x). Tense vowel must be held at least ${targetRatio}x longer than lax vowel.`;
      } else {
        feedback = `Formant separation too narrow (${formantDelta}Hz < 80Hz). Differentiate tongue height and lip spreading.`;
      }
    }

    return {
      pairId: params.pairId,
      durationRatio,
      durationPassed,
      formantDelta,
      codaTransientDetected,
      codaEnergy,
      overallScore,
      passed,
      feedback
    };
  }

  /**
   * Procedural Vowel Formant Acoustic Reference Synthesizer:
   * Pure native Web Audio API (sawtooth fundamental at 130Hz excited through
   * dual Biquad bandpass filters for F1 and F2) with exponential gain envelope.
   */
  public static playFormantReference(f1: number, f2: number, durationSec: number = 0.5): void {
    if (this.isMuted) return;

    this.ensureActiveContext().then((ctx) => {
      if (!ctx || ctx.state !== 'running') return;
      const t = ctx.currentTime;
      const voiceBus = this.getVoiceGain();

      try {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(130, t);

        const f1Filter = ctx.createBiquadFilter();
        f1Filter.type = 'bandpass';
        f1Filter.frequency.setValueAtTime(Math.max(200, Math.min(1200, f1)), t);
        f1Filter.Q.setValueAtTime(5.5, t);

        const f2Filter = ctx.createBiquadFilter();
        f2Filter.type = 'bandpass';
        f2Filter.frequency.setValueAtTime(Math.max(700, Math.min(3000, f2)), t);
        f2Filter.Q.setValueAtTime(7.0, t);

        const envGain = ctx.createGain();
        envGain.gain.setValueAtTime(this.EPSILON, t);
        envGain.gain.exponentialRampToValueAtTime(0.35, t + 0.03);
        envGain.gain.setValueAtTime(0.35, t + durationSec - 0.05);
        envGain.gain.exponentialRampToValueAtTime(this.EPSILON, t + durationSec);

        osc.connect(f1Filter);
        osc.connect(f2Filter);
        f1Filter.connect(envGain);
        f2Filter.connect(envGain);
        const targetBus = voiceBus || this.masterGain || ctx.destination;
        envGain.connect(targetBus);

        osc.start(t);
        osc.stop(t + durationSec + 0.02);
      } catch {}
    }).catch(() => {});
  }
}

