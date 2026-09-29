/**
 * STARK // English Singularity HUD - Acoustic DSP Engine
 * Fundamental Frequency (F0) Autocorrelation Pitch Tracking, RMS Energy Envelopes,
 * Silence/Hesitation Gap Detection, and Audio Take Lifecycle Management.
 * 100% Offline Client-Side Web Audio API.
 */

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
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  private isRecordingInternal: boolean = false;
  private recordingStartTime: number = 0;
  private analysisTimer: ReturnType<typeof setInterval> | null = null;

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
      !!(window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
  }

  public async init(): Promise<boolean> {
    if (!this.isAvailable) return false;
    try {
      if (!this.micStream) {
        this.micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
      }
      if (!this.audioCtx) {
        const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioCtx = new AudioCtxClass();
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
      // Graceful degraded mode (offline without microphone)
      this.isRecordingInternal = true;
      this.recordingStartTime = Date.now();
      return;
    }

    this.recordedChunks = [];
    this.pitchSamples = [];
    this.energySamples = [];

    let mimeType = 'audio/webm;codecs=opus';
    if (typeof MediaRecorder !== 'undefined' && !MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = '';
    }

    try {
      if (typeof MediaRecorder !== 'undefined') {
        this.mediaRecorder = mimeType
          ? new MediaRecorder(this.micStream, { mimeType })
          : new MediaRecorder(this.micStream);

        this.mediaRecorder.ondataavailable = (e: BlobEvent) => {
          if (e.data && e.data.size > 0) {
            this.recordedChunks.push(e.data);
          }
        };
        this.mediaRecorder.start(100); // 100ms time slices
      }
    } catch {
      // MediaRecorder fallback
      this.mediaRecorder = null;
    }

    this.isRecordingInternal = true;
    this.recordingStartTime = Date.now();

    // 50ms polling loop for pitch and energy envelope
    const buffer = new Float32Array(1024);
    this.analysisTimer = setInterval(() => {
      if (!this.analyser || !this.audioCtx) return;
      this.analyser.getFloatTimeDomainData(buffer as any);
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

        const frameDurationSec = 0.05; // 50ms interval
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
      this.analyser.getFloatTimeDomainData(buffer as any);
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
    if (rms < 0.015) return 0; // Unvoiced / ambient floor

    let globalMaxR = -1;
    let globalBestTau = -1;
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

      if (normR > globalMaxR) {
        globalMaxR = normR;
        globalBestTau = tau;
      }
    }

    if (globalMaxR < 0.65 || globalBestTau <= minTau || globalBestTau >= maxTau) {
      return 0; // Voicing threshold not met
    }

    // Select the first significant local maximum to prevent octave-drop (subharmonic halving)
    let bestTau = globalBestTau;
    const peakThreshold = Math.max(0.65, globalMaxR * 0.85);
    for (let tau = minTau + 1; tau < globalBestTau; tau++) {
      if (rValues[tau] > rValues[tau - 1] && rValues[tau] > rValues[tau + 1] && rValues[tau] >= peakThreshold) {
        bestTau = tau;
        break;
      }
    }

    // 3-point parabolic interpolation for sub-sample accuracy
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
