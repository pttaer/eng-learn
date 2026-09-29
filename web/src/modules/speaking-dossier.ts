import { AtomicCard } from '../core/atomic-card';
import { SRSEngine } from '../core/srs-engine';
import { StorageManager } from '../utils/storage';
import { AudioSynthesizer } from '../core/audio-synthesizer';
import drillsData from '../assets/data/drills.json';

export interface SpeakingItem {
  id: string;
  index: number;
  title: string;
  prompt: string;
  mode: string;
  anchor: string;
  collocations: string;
  phonetic: string;
}

export class SpeakingDossier {
  private container: HTMLElement;
  private items: SpeakingItem[] = [];
  private currentIndex: number = 0;
  private currentCardHandle: any = null;

  // 4-3-2 Timer State
  private rounds: number[] = [240, 180, 120]; // 4m, 3m, 2m in seconds
  private currentRoundIdx: number = 0;
  private secondsRemaining: number = 240;
  private isTimerRunning: boolean = false;
  private timerInterval: any = null;

  // Microphone Audio Analyser
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private waveformRaf: number | null = null;

  public onBatchComplete?: () => void;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'dossier-workspace dossier-speaking interactive';
    this.items = (drillsData as any).speaking || [];
  }

  public render(): HTMLElement {
    this.container.innerHTML = `
      <div class="dossier-control-bar">
        <div class="dossier-tabs">
          <span class="telemetry-label">[PILLAR 04 // PAUL NATION 4-3-2 FLUENCY ENGINE]</span>
        </div>
        <div class="dossier-status-pill">
          <span class="telemetry-value">30 HIGH-INTENSITY PROMPTS</span>
        </div>
      </div>
      <div class="dossier-card-slot"></div>
      <div class="dossier-nav-bar">
        <button class="hud-btn nav-btn-prev">[ ← PREV PROMPT ]</button>
        <span class="telemetry-value card-counter">PROMPT [ ${this.currentIndex + 1} / ${this.items.length} ]</span>
        <button class="hud-btn nav-btn-next">[ NEXT PROMPT → ]</button>
      </div>
    `;

    this.bindEvents();
    this.renderCurrentCard();
    return this.container;
  }

  private bindEvents(): void {
    this.container.querySelector('.nav-btn-prev')?.addEventListener('click', () => {
      if (this.currentIndex > 0) {
        this.resetTimer();
        this.currentIndex -= 1;
        this.renderCurrentCard();
      }
    });

    this.container.querySelector('.nav-btn-next')?.addEventListener('click', () => {
      if (this.currentIndex < this.items.length - 1) {
        this.resetTimer();
        this.currentIndex += 1;
        this.renderCurrentCard();
      }
    });
  }

  private renderCurrentCard(): void {
    const slot = this.container.querySelector('.dossier-card-slot');
    if (!slot) return;
    slot.innerHTML = '';

    if (this.items.length === 0) return;

    const item = this.items[this.currentIndex];
    const srsState = StorageManager.getCardState(item.id);
    let statusBadge: 'NEW' | 'REVIEW' | 'MASTERED' = 'NEW';
    if (srsState) {
      statusBadge = srsState.repetitions >= 3 ? 'MASTERED' : 'REVIEW';
    }

    // Front: Prompt, 15s Mental Anchor, 4-3-2 Circular HUD & Mic Waveform
    const frontEl = document.createElement('div');
    frontEl.className = 'speaking-front';
    frontEl.innerHTML = `
      <div class="card-prompt-label">NATION 4-3-2 DRILL // ROUND ${this.currentRoundIdx + 1} OF 3</div>
      <div class="card-main-text" style="font-size: 15px; font-weight: 600; line-height: 1.4; margin-bottom: 8px;">
        "${item.prompt}"
      </div>
      <div style="font-family: var(--font-mono); font-size: 11px; color: var(--ink-secondary); margin-bottom: 12px; border-left: 2px solid var(--ink-primary); padding-left: 8px;">
        <strong>15S MENTAL ANCHOR:</strong> ${item.anchor}
      </div>

      <!-- Circular Timer HUD & Waveform Panel -->
      <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px dashed var(--border-hairline); padding-top: 10px; gap: 16px;">
        <div style="display: flex; flex-direction: column; align-items: center;">
          <div style="position: relative; width: 68px; height: 68px;">
            <svg viewBox="0 0 36 36" style="width: 100%; height: 100%; transform: rotate(-90deg);">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="rgba(0, 0, 0, 0.15)" stroke-width="2.5" />
              <path class="timer-progress-ring" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="#000000" stroke-width="2.5" stroke-dasharray="100, 100" />
            </svg>
            <div class="timer-display-text" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); font-size: 13px; font-weight: 700;">
              ${this.formatTime(this.secondsRemaining)}
            </div>
          </div>
          <div style="display: flex; gap: 4px; margin-top: 6px;">
            <button class="hud-btn btn-timer-toggle" style="padding: 2px 8px; font-size: 10px;">[ ${this.isTimerRunning ? 'PAUSE' : 'START'} ]</button>
            <button class="hud-btn btn-timer-reset" style="padding: 2px 8px; font-size: 10px;">[ ↺ ]</button>
          </div>
        </div>

        <!-- Live Waveform Canvas -->
        <div style="flex: 1; height: 64px; border: 1px solid var(--border-solid); position: relative; background: #ffffff;">
          <div style="position: absolute; top: 2px; left: 4px; font-family: var(--font-mono); font-size: 9px; color: var(--ink-muted);">
            [ACOUSTIC TELEMETRY]
          </div>
          <canvas class="speaking-waveform-canvas" width="240" height="64" style="width: 100%; height: 100%;"></canvas>
        </div>
      </div>
    `;

    // Back: Target Collocations & Prosodic/Phonetic Guidance
    const backEl = document.createElement('div');
    backEl.className = 'speaking-back';
    backEl.innerHTML = `
      <div class="card-prompt-label">PROSODIC & PHONETIC TARGETS</div>
      <div style="margin-bottom: 12px; font-family: var(--font-sans); font-size: 14px;">
        <strong>Target Collocations to Activate:</strong>
        <div style="font-family: var(--font-mono); font-size: 12px; background: #fafafa; border: 1px solid var(--border-hairline); padding: 8px; margin-top: 6px;">
          ${item.collocations}
        </div>
      </div>
      <div style="font-family: var(--font-sans); font-size: 13px; border-top: 1px dashed var(--border-hairline); padding-top: 8px;">
        <strong>Phonetics & Prosody Check:</strong>
        <p style="font-family: var(--font-mono); font-size: 12px; color: var(--ink-secondary); margin-top: 4px;">
          ${item.phonetic}
        </p>
      </div>
    `;

    // Wire Timer buttons
    frontEl.querySelector('.btn-timer-toggle')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      this.toggleTimer(frontEl);
    });

    frontEl.querySelector('.btn-timer-reset')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.resetTimer(frontEl);
    });

    // Mount Waveform
    const canvas = frontEl.querySelector('.speaking-waveform-canvas') as HTMLCanvasElement;
    if (canvas) {
      this.initWaveform(canvas);
    }

    const cardHandle = AtomicCard.create({
      id: item.id,
      pillar: 'SPEAK',
      category: '4-3-2 DRILL',
      indexStr: `[ ${String(item.index).padStart(2, '0')} / 30 ]`,
      statusBadge,
      front: {
        customContent: frontEl,
        mainText: item.prompt
      },
      back: {
        customContent: backEl,
        mainText: item.collocations
      },
      audioText: item.prompt,
      onRate: (rating) => {
        const nextState = SRSEngine.rateCard(srsState, item.id, rating);
        StorageManager.setCardState(item.id, nextState);
        this.resetTimer();

        if (this.currentIndex < this.items.length - 1) {
          this.currentIndex += 1;
          this.renderCurrentCard();
        } else if (this.onBatchComplete) {
          this.onBatchComplete();
        }
      }
    });

    this.currentCardHandle = cardHandle;
    slot.appendChild(cardHandle.element);

    const counter = this.container.querySelector('.card-counter');
    if (counter) {
      counter.textContent = `PROMPT [ ${this.currentIndex + 1} / ${this.items.length} ]`;
    }
  }

  private toggleTimer(parentEl: HTMLElement): void {
    if (this.isTimerRunning) {
      clearInterval(this.timerInterval);
      this.isTimerRunning = false;
    } else {
      this.isTimerRunning = true;
      this.timerInterval = setInterval(() => {
        if (this.secondsRemaining > 0) {
          this.secondsRemaining -= 1;
          this.updateTimerDisplay(parentEl);
        } else {
          clearInterval(this.timerInterval);
          this.isTimerRunning = false;
          AudioSynthesizer.play('alarm');

          // Next round in 4-3-2 sequence
          if (this.currentRoundIdx < this.rounds.length - 1) {
            this.currentRoundIdx += 1;
            this.secondsRemaining = this.rounds[this.currentRoundIdx];
          }
          this.updateTimerDisplay(parentEl);
        }
      }, 1000);
    }
    const btn = parentEl.querySelector('.btn-timer-toggle');
    if (btn) {
      btn.textContent = `[ ${this.isTimerRunning ? 'PAUSE' : 'START'} ]`;
    }
  }

  private resetTimer(parentEl?: HTMLElement): void {
    clearInterval(this.timerInterval);
    this.isTimerRunning = false;
    this.currentRoundIdx = 0;
    this.secondsRemaining = this.rounds[0];
    if (parentEl) {
      this.updateTimerDisplay(parentEl);
      const btn = parentEl.querySelector('.btn-timer-toggle');
      if (btn) btn.textContent = '[ START ]';
    }
  }

  private updateTimerDisplay(parentEl: HTMLElement): void {
    const textEl = parentEl.querySelector('.timer-display-text');
    if (textEl) {
      textEl.textContent = this.formatTime(this.secondsRemaining);
    }
    const ring = parentEl.querySelector('.timer-progress-ring') as SVGPathElement;
    if (ring) {
      const total = this.rounds[this.currentRoundIdx];
      const pct = Math.max(0, (this.secondsRemaining / total) * 100);
      ring.setAttribute('stroke-dasharray', `${pct}, 100`);
    }
  }

  private formatTime(totalSeconds: number): string {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  private initWaveform(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d')!;

    // Attempt microphone connection
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && !this.micStream) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        this.micStream = stream;
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.audioCtx = new AudioCtx();
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume().catch(() => {});
        }
        const source = this.audioCtx.createMediaStreamSource(stream);
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 128;
        source.connect(this.analyser);
      }).catch(() => {
        // Fallback to simulated audio noise if microphone is not available or blocked
      });
    }

    if (this.waveformRaf) cancelAnimationFrame(this.waveformRaf);

    let simPhase = 0;
    const drawWaveform = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.beginPath();

      if (this.analyser) {
        const buffer = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteTimeDomainData(buffer);
        const sliceWidth = w / buffer.length;
        let x = 0;

        for (let i = 0; i < buffer.length; i++) {
          const v = buffer[i] / 128.0;
          const y = (v * h) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
      } else {
        // Simulated acoustic waveform
        simPhase += 0.08;
        for (let x = 0; x < w; x += 4) {
          const y = cy + Math.sin(x * 0.08 + simPhase) * (this.isTimerRunning ? 16 : 4) * Math.sin(simPhase * 0.5);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
      this.waveformRaf = requestAnimationFrame(drawWaveform);
    };

    drawWaveform();
  }

  public handleGlobalKey(key: string): boolean {
    if (!this.currentCardHandle) return false;

    if (key === ' ' || key === 'Space') {
      this.currentCardHandle.flip();
      return true;
    }
    if (key === '1' || key === 'ArrowLeft') {
      this.currentCardHandle.rate('again');
      return true;
    }
    if (key === '2' || key === 'ArrowRight') {
      this.currentCardHandle.rate('good');
      return true;
    }
    return false;
  }
}
