import { AtomicCard } from '../core/atomic-card';
import { SRSEngine } from '../core/srs-engine';
import { StorageManager } from '../utils/storage';
import { AudioSynthesizer } from '../core/audio-synthesizer';
import { AcousticEngine, AcousticAnalysis } from '../core/acoustic-engine';
import { CollocationSpotter } from '../core/collocation-spotter';
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

export interface RoundPerformance {
  roundIdx: number;            // 0 = 4 min, 1 = 3 min, 2 = 2 min
  allocatedSeconds: number;    // 240, 180, 120
  actualSeconds: number;       // Elapsed speaking duration
  silenceRatio: number;        // Proportion of pauses
  spottedCollocations: number; // Count of target collocations successfully voiced
  totalCollocations: number;   // Total target collocations for prompt
  analysis?: AcousticAnalysis;
}

export class SpeakingDossier {
  private container: HTMLElement;
  private items: SpeakingItem[] = [];
  private currentIndex: number = 0;
  private currentCardHandle: any = null;

  // Nation 4-3-2 State Machine (4 min -> 3 min -> 2 min)
  private readonly rounds: number[] = [240, 180, 120];
  private currentRoundIdx: number = 0;
  private secondsRemaining: number = 240;
  private isTimerRunning: boolean = false;
  private timerInterval: any = null;

  // Acoustic DSP & Web Speech Subsystems
  private acousticEngine: AcousticEngine;
  private collocationSpotter: CollocationSpotter;

  // Round Performance Ledger & Take State
  private roundsPerformance: (RoundPerformance | null)[] = [null, null, null];
  private latestAnalysis: AcousticAnalysis | null = null;
  private hasCompletedTake: boolean = false;
  private waveformRaf: number | null = null;

  public onBatchComplete?: () => void;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'dossier-workspace dossier-speaking interactive';
    this.items = (drillsData as any).speaking || [];

    this.acousticEngine = new AcousticEngine();
    this.collocationSpotter = new CollocationSpotter();
  }

  public render(): HTMLElement {
    this.container.innerHTML = `
      <div class="dossier-control-bar">
        <div class="dossier-tabs">
          <span class="telemetry-label">[PILLAR 04 // ACOUSTIC VOICE STUDIO: NATION 4-3-2 MATRIX]</span>
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
        this.resetPromptState();
        this.currentIndex -= 1;
        this.renderCurrentCard();
      }
    });

    this.container.querySelector('.nav-btn-next')?.addEventListener('click', () => {
      if (this.currentIndex < this.items.length - 1) {
        this.resetPromptState();
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

    // Configure collocation spotter with current prompt targets
    const rawCollocs = item.collocations.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
    this.collocationSpotter.setTargetCollocations(rawCollocs);

    // Front: Prompt, 15s Mental Anchor, 4-3-2 Circular HUD, Radar Strip & Dual-Trace Canvas
    const frontEl = document.createElement('div');
    frontEl.className = 'speaking-front';
    this.updateFrontContent(frontEl, item);

    // Back: 3-Round Compression Matrix, Prosody Targets & Scoring
    const backEl = document.createElement('div');
    backEl.className = 'speaking-back';
    this.updateBackContent(backEl, item);

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
        this.resetPromptState();

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

  private updateFrontContent(frontEl: HTMLElement, item: SpeakingItem): void {
    const allocatedMins = this.rounds[this.currentRoundIdx] / 60;
    const targetStatus = this.collocationSpotter.getStatus();
    const perf = this.roundsPerformance[this.currentRoundIdx];

    frontEl.innerHTML = `
      <div class="card-prompt-label">
        NATION 4-3-2 DRILL // ROUND ${this.currentRoundIdx + 1} OF 3 [${allocatedMins} MIN]
      </div>

      <div class="card-main-text" style="font-size: 15px; font-weight: 600; line-height: 1.4; margin-bottom: 8px;">
        "${item.prompt}"
      </div>

      <!-- 15s Mental Anchor -->
      <div style="font-family: var(--font-mono); font-size: 11px; color: var(--ink-secondary); margin-bottom: 10px; border-left: 2px solid var(--ink-primary); padding-left: 8px; background: rgba(0, 0, 0, 0.02);">
        <strong>15S MENTAL ANCHOR:</strong> ${item.anchor}
      </div>

      <!-- Collocation Voice Radar Strip -->
      <div style="margin-bottom: 8px;">
        <div style="font-family: var(--font-mono); font-size: 10px; color: var(--ink-muted); margin-bottom: 4px;">
          [TARGET COLLOCATIONS // ACOUSTIC RADAR]
        </div>
        <div class="collocation-radar-strip">
          ${targetStatus.map((t) => `
            <button type="button" class="radar-chip ${t.spotted ? 'spotted' : ''}" data-phrase="${t.phrase}" title="${t.spotted ? 'Voiced in take' : 'Click to manually mark as voiced'}">
              <span>${t.spotted ? '[✓]' : '[ ]'}</span>
              <span>${t.phrase.toUpperCase()}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Circular Timer HUD & Waveform Area -->
      <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px dashed var(--border-hairline); padding-top: 8px; gap: 14px;">
        <div style="display: flex; flex-direction: column; align-items: center;">
          <div style="position: relative; width: 64px; height: 64px;">
            <svg viewBox="0 0 36 36" style="width: 100%; height: 100%; transform: rotate(-90deg);">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="rgba(0, 0, 0, 0.12)" stroke-width="2.5" />
              <path class="timer-progress-ring" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="#000000" stroke-width="2.5" stroke-dasharray="100, 100" />
            </svg>
            <div class="timer-display-text" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); font-size: 13px; font-weight: 700;">
              ${this.formatTime(this.secondsRemaining)}
            </div>
          </div>
          <div style="display: flex; gap: 4px; margin-top: 6px;">
            <button type="button" class="hud-btn btn-timer-toggle" style="padding: 2px 8px; font-size: 10px;">[ ${this.isTimerRunning ? 'PAUSE' : 'START'} ]</button>
            <button type="button" class="hud-btn btn-take-complete" style="padding: 2px 8px; font-size: 10px;" ${!this.isTimerRunning ? 'disabled' : ''}>[ STOP ]</button>
          </div>
        </div>

        <!-- Dual-Trace Oscilloscope Canvas -->
        <div class="speaking-oscilloscope-container" style="flex: 1; margin-top: 0;">
          <div class="oscilloscope-header">
            <span>[TRACK 1: NATIVE BENCHMARK F₀]</span>
            <span>[TRACK 2: ${this.isTimerRunning ? 'LIVE MIC TAKE' : (this.latestAnalysis ? 'STUDENT PITCH PROFILE' : 'STUDENT TAKE IDLE')}]</span>
          </div>
          <canvas class="speaking-waveform-canvas" width="480" height="72"></canvas>
        </div>
      </div>

      <!-- Post-Take Review Strip -->
      ${this.hasCompletedTake && perf ? `
        <div class="post-take-strip">
          <div class="post-take-metrics">
            <span>TAKE ${this.currentRoundIdx + 1}: <strong>${Math.round(perf.actualSeconds)}s</strong> / ${perf.allocatedSeconds}s</span>
            <span>SILENCE: <strong>${Math.round(perf.silenceRatio * 100)}%</strong></span>
            <span>COLLOC: <strong>${perf.spottedCollocations}/${perf.totalCollocations}</strong></span>
          </div>
          <div class="post-take-actions">
            <button type="button" class="hud-btn btn-play-exemplar" style="font-size: 10px; padding: 2px 8px;">[ ▶ EXEMPLAR ]</button>
            <button type="button" class="hud-btn btn-play-take" style="font-size: 10px; padding: 2px 8px;">[ ▶ YOUR TAKE ]</button>
            <button type="button" class="hud-btn btn-stop-audio" style="font-size: 10px; padding: 2px 8px;">[ ⏹ STOP ]</button>
            ${this.currentRoundIdx < 2 ? `
              <button type="button" class="hud-btn btn-advance-round" style="font-size: 10px; padding: 2px 10px; background: #000000; color: #ffffff;">
                [ ADVANCE TO ROUND ${this.currentRoundIdx + 2} (${this.rounds[this.currentRoundIdx + 1] / 60} MIN) → ]
              </button>
            ` : `
              <button type="button" class="hud-btn btn-view-matrix" style="font-size: 10px; padding: 2px 10px; background: #000000; color: #ffffff;">
                [ VIEW 3-ROUND COMPRESSION MATRIX → ]
              </button>
            `}
          </div>
        </div>
      ` : ''}
    `;

    this.bindFrontEvents(frontEl, item);
  }

  private bindFrontEvents(frontEl: HTMLElement, item: SpeakingItem): void {
    // 1. Radar Chip Manual Toggles
    const chips = frontEl.querySelectorAll('.radar-chip');
    chips.forEach((chip) => {
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        const phrase = chip.getAttribute('data-phrase');
        if (phrase) {
          this.collocationSpotter.manualToggle(phrase);
          AudioSynthesizer.play('absorb');
          this.updateRadarChipDisplays(frontEl);
        }
      });
    });

    // 2. Timer Toggle Button
    frontEl.querySelector('.btn-timer-toggle')?.addEventListener('click', (e) => {
      e.stopPropagation();
      AudioSynthesizer.play('click');
      this.toggleTimer(frontEl, item);
    });

    // 3. Complete Take Button
    frontEl.querySelector('.btn-take-complete')?.addEventListener('click', (e) => {
      e.stopPropagation();
      AudioSynthesizer.play('click');
      this.completeCurrentTake(frontEl, item);
    });

    // 4. A/B Audio Replay Controls
    frontEl.querySelector('.btn-play-exemplar')?.addEventListener('click', (e) => {
      e.stopPropagation();
      AudioSynthesizer.play('click');
      this.acousticEngine.playExemplar(item.prompt, () => {
        AudioSynthesizer.play('click');
      });
    });

    frontEl.querySelector('.btn-play-take')?.addEventListener('click', (e) => {
      e.stopPropagation();
      AudioSynthesizer.play('click');
      this.acousticEngine.playTake(() => {
        AudioSynthesizer.play('click');
      });
    });

    frontEl.querySelector('.btn-stop-audio')?.addEventListener('click', (e) => {
      e.stopPropagation();
      AudioSynthesizer.play('click');
      this.stopPlayback();
    });

    // 5. Advance Round or Flip to Back Face
    frontEl.querySelector('.btn-advance-round')?.addEventListener('click', (e) => {
      e.stopPropagation();
      AudioSynthesizer.play('click');
      this.advanceToNextRound(frontEl, item);
    });

    frontEl.querySelector('.btn-view-matrix')?.addEventListener('click', (e) => {
      e.stopPropagation();
      AudioSynthesizer.play('click');
      if (this.currentCardHandle) {
        this.currentCardHandle.flip();
      }
    });

    // 6. Mount Canvas Dual-Trace
    const canvas = frontEl.querySelector('.speaking-waveform-canvas') as HTMLCanvasElement;
    if (canvas) {
      this.initDualTraceCanvas(canvas);
    }
  }

  private updateBackContent(backEl: HTMLElement, item: SpeakingItem): void {
    backEl.innerHTML = `
      <div class="card-prompt-label">NATION 4-3-2 FLUENCY COMPRESSION MATRIX</div>

      <!-- 3-Round Compression Comparison Table -->
      <table class="compression-table">
        <thead>
          <tr>
            <th>ROUND</th>
            <th>ALLOTTED</th>
            <th>TIME SPOKEN</th>
            <th>SILENCE %</th>
            <th>COLLOCATIONS ACTIVATED</th>
          </tr>
        </thead>
        <tbody>
          ${[0, 1, 2].map((rIdx) => {
            const perf = this.roundsPerformance[rIdx];
            const allocatedMins = this.rounds[rIdx] / 60;
            const isRound3 = rIdx === 2;
            if (perf) {
              const silencePct = Math.round(perf.silenceRatio * 100);
              const tag = isRound3 ? ' <span style="font-size: 9px; opacity: 0.8;">(Peak Fluency)</span>' : '';
              return `
                <tr class="${isRound3 ? 'highlight-fluency' : ''}">
                  <td><strong>ROUND ${rIdx + 1}</strong> (${allocatedMins} MIN)</td>
                  <td>${allocatedMins}:00</td>
                  <td>${this.formatTime(Math.round(perf.actualSeconds))}</td>
                  <td>${silencePct}%</td>
                  <td>${perf.spottedCollocations} / ${perf.totalCollocations}${tag}</td>
                </tr>
              `;
            } else {
              return `
                <tr>
                  <td>ROUND ${rIdx + 1} (${allocatedMins} MIN)</td>
                  <td>${allocatedMins}:00</td>
                  <td style="color: var(--ink-muted);">--:--</td>
                  <td style="color: var(--ink-muted);">--%</td>
                  <td style="color: var(--ink-muted);">--</td>
                </tr>
              `;
            }
          }).join('')}
        </tbody>
      </table>

      <!-- Target Collocations Reference -->
      <div style="margin-top: 12px; font-family: var(--font-sans); font-size: 13px;">
        <strong>Target Collocations:</strong>
        <div style="font-family: var(--font-mono); font-size: 12px; background: #ffffff; border: 1px solid var(--border-hairline); padding: 6px 10px; margin-top: 4px;">
          ${item.collocations}
        </div>
      </div>

      <!-- Phonetics & Prosody Guidance -->
      <div style="font-family: var(--font-sans); font-size: 13px; border-top: 1px dashed var(--border-hairline); padding-top: 8px; margin-top: 8px;">
        <strong>Phonetics & Prosody Check:</strong>
        <p style="font-family: var(--font-mono); font-size: 12px; color: var(--ink-secondary); margin-top: 4px;">
          ${item.phonetic}
        </p>
      </div>
    `;
  }

  private toggleTimer(frontEl: HTMLElement, item: SpeakingItem): void {
    if (this.isTimerRunning) {
      // Pause
      clearInterval(this.timerInterval);
      this.isTimerRunning = false;
      this.collocationSpotter.stopListening();
      this.acousticEngine.stopTake();
      this.updateFrontContent(frontEl, item);
    } else {
      // Start recording & timer
      this.isTimerRunning = true;
      this.hasCompletedTake = false;

      this.acousticEngine.startRecording().catch(() => {});
      this.collocationSpotter.startListening(() => {
        AudioSynthesizer.play('absorb');
        this.updateRadarChipDisplays(frontEl);
      });

      this.timerInterval = setInterval(() => {
        if (this.secondsRemaining > 0) {
          this.secondsRemaining -= 1;
          this.updateTimerDisplay(frontEl);
        } else {
          // Timer reached 0: complete current take
          this.completeCurrentTake(frontEl, item);
        }
      }, 1000);

      this.updateFrontContent(frontEl, item);
    }
  }

  private async completeCurrentTake(frontEl: HTMLElement, item: SpeakingItem): Promise<void> {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isTimerRunning = false;
    this.collocationSpotter.stopListening();
    AudioSynthesizer.play('alarm');

    const analysis = await this.acousticEngine.stopRecording();
    this.latestAnalysis = analysis;
    this.hasCompletedTake = true;

    const allocatedSec = this.rounds[this.currentRoundIdx];
    const actualSec = Math.max(1, allocatedSec - this.secondsRemaining);
    const spottedList = this.collocationSpotter.getStatus();
    const spottedCount = spottedList.filter((s) => s.spotted).length;

    const performance: RoundPerformance = {
      roundIdx: this.currentRoundIdx,
      allocatedSeconds: allocatedSec,
      actualSeconds: actualSec,
      silenceRatio: analysis.silenceRatio,
      spottedCollocations: spottedCount,
      totalCollocations: spottedList.length,
      analysis
    };

    this.roundsPerformance[this.currentRoundIdx] = performance;

    // Refresh front and back views with new take data
    this.updateFrontContent(frontEl, item);
    const backEl = this.container.querySelector('.speaking-back') as HTMLElement;
    if (backEl) {
      this.updateBackContent(backEl, item);
    }
  }

  private advanceToNextRound(frontEl: HTMLElement, item: SpeakingItem): void {
    if (this.currentRoundIdx < this.rounds.length - 1) {
      this.stopPlayback();
      this.currentRoundIdx += 1;
      this.secondsRemaining = this.rounds[this.currentRoundIdx];
      this.hasCompletedTake = false;
      this.collocationSpotter.reset();
      this.updateFrontContent(frontEl, item);

      const backEl = this.container.querySelector('.speaking-back') as HTMLElement;
      if (backEl) {
        this.updateBackContent(backEl, item);
      }
    }
  }

  private updateRadarChipDisplays(frontEl: HTMLElement): void {
    const status = this.collocationSpotter.getStatus();
    const chips = frontEl.querySelectorAll('.radar-chip');
    chips.forEach((chip) => {
      const phrase = chip.getAttribute('data-phrase');
      const found = status.find((s) => s.phrase.toLowerCase() === phrase?.toLowerCase());
      if (found && found.spotted) {
        chip.classList.add('spotted');
        const iconSpan = chip.querySelector('span:first-child');
        if (iconSpan) iconSpan.textContent = '[✓]';
      }
    });
  }

  private updateTimerDisplay(frontEl: HTMLElement): void {
    const textEl = frontEl.querySelector('.timer-display-text');
    if (textEl) {
      textEl.textContent = this.formatTime(this.secondsRemaining);
    }
    const ring = frontEl.querySelector('.timer-progress-ring') as SVGPathElement;
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

  private initDualTraceCanvas(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d')!;
    if (this.waveformRaf) {
      cancelAnimationFrame(this.waveformRaf);
    }

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const halfH = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Center divider & measurement grid
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, halfH);
      ctx.lineTo(w, halfH);
      for (let x = 0; x < w; x += 48) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      ctx.stroke();

      // TRACK 1: Native Benchmark Intonation (Top Half: 0 to halfH)
      ctx.save();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      const track1Mid = halfH * 0.55;
      for (let x = 0; x < w; x += 3) {
        const t = x / w;
        const peak = Math.exp(-Math.pow((t - 0.38) / 0.18, 2)) * 14;
        const declination = (1 - t * 0.4) * 4;
        const microMod = Math.sin(t * Math.PI * 8) * 2;
        const y = track1Mid - (peak + declination + microMod);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      // TRACK 2: Student Take (Bottom Half: halfH to h)
      ctx.save();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const track2Mid = halfH + halfH * 0.5;

      if (this.isTimerRunning && this.acousticEngine.isRecording) {
        // Realtime live microphone oscilloscope
        const buffer = new Float32Array(256);
        this.acousticEngine.getRealtimeAudioData(buffer);
        const sliceWidth = w / buffer.length;
        let x = 0;
        for (let i = 0; i < buffer.length; i++) {
          const v = buffer[i];
          const y = track2Mid + v * (halfH * 0.45);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.stroke();
      } else if (this.latestAnalysis && this.latestAnalysis.pitchSamples.length > 0) {
        // Post-take recorded pitch contour
        const pitches = this.latestAnalysis.pitchSamples;
        const step = w / Math.max(1, pitches.length - 1);
        let started = false;

        for (let i = 0; i < pitches.length; i++) {
          const p = pitches[i];
          const x = i * step;
          if (p > 0) {
            const norm = Math.max(0, Math.min(1, (p - 80) / 320));
            const y = (h - 6) - norm * (halfH * 0.82);
            if (!started) {
              ctx.moveTo(x, y);
              started = true;
            } else {
              ctx.lineTo(x, y);
            }
          } else {
            started = false;
          }
        }
        ctx.stroke();
      } else {
        // Idle baseline
        ctx.moveTo(0, track2Mid);
        ctx.lineTo(w, track2Mid);
        ctx.stroke();
      }
      ctx.restore();

      this.waveformRaf = requestAnimationFrame(draw);
    };

    draw();
  }

  private stopPlayback(): void {
    this.acousticEngine.stopTake();
    this.acousticEngine.stopExemplar();
  }

  private resetPromptState(): void {
    this.stopPlayback();
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isTimerRunning = false;
    this.currentRoundIdx = 0;
    this.secondsRemaining = this.rounds[0];
    this.roundsPerformance = [null, null, null];
    this.latestAnalysis = null;
    this.hasCompletedTake = false;
    this.collocationSpotter.reset();
  }

  public teardown(): void {
    this.dispose();
  }

  public dispose(): void {
    this.resetPromptState();
    if (this.waveformRaf) {
      cancelAnimationFrame(this.waveformRaf);
      this.waveformRaf = null;
    }
    this.collocationSpotter.stopListening();
    this.acousticEngine.dispose();
  }

  public handleGlobalKey(key: string): boolean {
    if (!this.currentCardHandle) return false;

    // Check if user is typing into search or form input
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      return false;
    }

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
