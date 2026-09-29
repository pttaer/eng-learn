import { SRSEngine } from '../core/srs-engine';
import { StorageManager } from '../utils/storage';
import { AudioSynthesizer } from '../core/audio-synthesizer';
import { SkillTreeEngine } from '../core/skill-tree-engine';
import { MotionEngine } from '../core/motion-engine';
import drillsData from '../assets/data/drills.json';

export interface WritingItem {
  id: string;
  index: number;
  title: string;
  question: string;
  mode: string;
  register: string;
  masterSentence: string;
  meal: {
    m: string;
    e: string;
    a: string;
    l: string;
  };
  stylistic: string;
}

export interface ProofreadDiffToken {
  type: 'match' | 'insert' | 'delete';
  value: string;
}

export interface WritingTelemetry {
  grossWpm: number;
  netWpm: number;
  accuracyPct: number;
  elapsedSec: number;
  errorCount: number;
  completed: boolean;
}

export function computeDiffTokens(original: string, candidate: string): ProofreadDiffToken[] {
  const o = original.split('');
  const c = candidate.split('');
  const m = o.length;
  const n = c.length;

  const dp = Array.from({ length: m + 1 }, () => new Int32Array(n + 1));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (o[i - 1] === c[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  const tokens: ProofreadDiffToken[] = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && o[i - 1] === c[j - 1]) {
      tokens.unshift({ type: 'match', value: o[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] <= dp[i - 1][j])) {
      tokens.unshift({ type: 'insert', value: c[j - 1] });
      j--;
    } else {
      tokens.unshift({ type: 'delete', value: o[i - 1] });
      i--;
    }
  }
  return tokens;
}

export function calculateWritingMetrics(targetStr: string, typedStr: string, elapsedSec: number): WritingTelemetry {
  const charsTyped = typedStr.length;
  const minutes = Math.max(0.016, elapsedSec / 60);
  const grossWpm = Math.round((charsTyped / 5) / minutes);

  const diffTokens = computeDiffTokens(targetStr, typedStr);
  let errorCount = 0;
  let matchCount = 0;
  for (const token of diffTokens) {
    if (token.type === 'delete' || token.type === 'insert') {
      errorCount++;
    } else if (token.type === 'match') {
      matchCount++;
    }
  }

  const netWpm = Math.max(0, Math.round(((charsTyped / 5) - Math.floor(errorCount / 2)) / minutes));
  const accuracyPct = targetStr.length === 0 ? 100 : Math.max(0, Math.min(100, Math.round((matchCount / targetStr.length) * 100)));
  const completed = matchCount === targetStr.length && errorCount === 0;

  return {
    grossWpm,
    netWpm,
    accuracyPct,
    elapsedSec,
    errorCount,
    completed
  };
}

export type CopyworkStep = 'analyze' | 'type' | 'diff';

export class WritingDossier {
  private container: HTMLElement;
  private items: WritingItem[] = [];
  private currentIndex: number = 0;
  private currentStep: CopyworkStep = 'analyze';
  private typedContent: string = '';
  private timerInterval: any = null;
  private elapsedSeconds: number = 0;
  public onBatchComplete?: () => void;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'dossier-workspace dossier-writing interactive';
    this.items = (drillsData as any).writing || [];
  }

  public render(): HTMLElement {
    if (this.items.length === 0) {
      this.container.innerHTML = '<div class="empty-state-notice">No writing drills available.</div>';
      return this.container;
    }

    const item = this.items[this.currentIndex];

    this.container.innerHTML = `
      <div class="copywork-studio" style="width: 100%; max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px;">
        <!-- Top Studio Bar -->
        <div class="dossier-control-bar" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-hairline); padding-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span class="telemetry-label" style="color: var(--accent-gold); font-weight: 700;">[PILLAR 03 // FRANKLIN COPYWORK]</span>
            <span class="hud-status-badge">REGISTER: ${item.register}</span>
          </div>
          <div class="step-indicator" style="display: flex; gap: 8px; font-family: var(--font-mono); font-size: 11px;">
            <span class="${this.currentStep === 'analyze' ? 'active-step' : ''}">1. ANALYZE</span>
            <span>→</span>
            <span class="${this.currentStep === 'type' ? 'active-step' : ''}">2. RECALL & TYPE</span>
            <span>→</span>
            <span class="${this.currentStep === 'diff' ? 'active-step' : ''}">3. EVALUATE</span>
          </div>
        </div>

        <!-- Dynamic Studio Content Pane -->
        <div class="copywork-body-pane">
          ${this.renderStepContent(item)}
        </div>

        <!-- Bottom Navigation & Counter -->
        <div class="dossier-nav-bar" style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-hairline); padding-top: 16px; margin-top: 12px;">
          <button class="hud-btn nav-btn-prev" ${this.currentIndex === 0 ? 'disabled' : ''}>[ ← PREV PROMPT ]</button>
          <span class="telemetry-value card-counter" style="font-family: var(--font-mono);">
            PROMPT [ ${this.currentIndex + 1} / ${this.items.length} ]
          </span>
          <button class="hud-btn nav-btn-next" ${this.currentIndex === this.items.length - 1 ? 'disabled' : ''}>[ NEXT PROMPT → ]</button>
        </div>
      </div>
    `;

    this.bindEvents(item);

    // Choreograph step entrance animation
    const copyworkCard = this.container.querySelector('.copywork-card') as HTMLElement | null;
    if (copyworkCard) {
      MotionEngine.fadeSlideIn(copyworkCard);
    }

    // Dynamic number rollups for Accuracy % and Net WPM in Step 3
    if (this.currentStep === 'diff') {
      const metrics = calculateWritingMetrics(item.masterSentence, this.typedContent, this.elapsedSeconds);
      const accEl = this.container.querySelector('.val-accuracy') as HTMLElement | null;
      const wpmEl = this.container.querySelector('.val-wpm') as HTMLElement | null;
      if (accEl) {
        MotionEngine.tweenNumber(accEl, 0, metrics.accuracyPct, '%');
      }
      if (wpmEl) {
        MotionEngine.tweenNumber(wpmEl, 0, metrics.netWpm);
      }
    }

    return this.container;
  }

  private renderStepContent(item: WritingItem): string {
    switch (this.currentStep) {
      case 'analyze':
        return `
          <div class="copywork-card" style="background: var(--bg-surface); border: 1px solid var(--border-hairline); padding: 28px; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
              <span class="telemetry-label">[STEP 1 // DECONSTRUCT RHETORICAL ARCHITECTURE]</span>
              <button class="hud-btn btn-speak-model" style="padding: 4px 10px; font-size: 11px;" title="Listen to Native Pronunciation">[ 🔊 PLAY MODEL ]</button>
            </div>

            <div class="model-sentence-display" style="font-size: 21px; line-height: 1.6; font-weight: 500; color: var(--ink-primary); max-width: 68ch; margin: 16px 0 20px 0; border-left: 3px solid var(--accent-gold); padding-left: 16px;">
              "${item.masterSentence}"
            </div>

            <!-- MEAL Structural Decomposition -->
            <div class="meal-blueprint-box" style="border: 1px solid var(--border-hairline); padding: 16px; background: rgba(0, 0, 0, 0.02); border-radius: 4px; margin-bottom: 20px;">
              <div class="telemetry-label" style="margin-bottom: 10px;">[MEAL STRUCTURAL SCAFFOLDING]</div>
              <div style="display: grid; grid-template-columns: 32px 1fr; gap: 8px 12px; font-size: 13px; line-height: 1.5;">
                <strong style="font-family: var(--font-mono); color: var(--accent-gold);">M:</strong> <span>${item.meal.m}</span>
                <strong style="font-family: var(--font-mono); color: var(--accent-gold);">E:</strong> <span>${item.meal.e}</span>
                <strong style="font-family: var(--font-mono); color: var(--accent-gold);">A:</strong> <span>${item.meal.a}</span>
                <strong style="font-family: var(--font-mono); color: var(--accent-gold);">L:</strong> <span>${item.meal.l}</span>
              </div>
            </div>

            <div style="font-size: 13px; color: var(--ink-muted); margin-bottom: 24px; line-height: 1.5;">
              <strong>Rhetorical Commentary:</strong> ${item.stylistic}
            </div>

            <button class="hud-btn btn-proceed-type" style="width: 100%; justify-content: center; background: var(--ink-primary); color: var(--ink-inverted); padding: 14px 0; font-size: 14px; font-weight: 600; border: none; cursor: pointer;">
              [ MEMORIZED — HIDE MODEL & START TYPING → ]
            </button>
          </div>
        `;

      case 'type':
        return `
          <div class="copywork-card" style="background: var(--bg-surface); border: 1px solid var(--border-hairline); padding: 28px; border-radius: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span class="telemetry-label">[STEP 2 // RECONSTRUCT FROM MEMORY]</span>
              <button class="hud-btn btn-peek-model" style="padding: 4px 10px; font-size: 11px;">[ 👁 PEEK MODEL (2s) ]</button>
            </div>

            <div id="peek-container" style="display: none; font-size: 15px; line-height: 1.5; color: var(--ink-muted); padding: 12px; background: rgba(0,0,0,0.03); border: 1px dashed var(--border-hairline); margin-bottom: 16px; border-radius: 4px;">
              "${item.masterSentence}"
            </div>

            <div style="font-size: 14px; margin-bottom: 12px; color: var(--ink-secondary);">
              Topic: <strong>${item.title}</strong> (${item.register})
            </div>

            <textarea
              class="copywork-input"
              rows="6"
              placeholder="Reconstruct the complete master sentence from memory..."
              style="width: 100%; font-family: var(--font-sans); font-size: 17px; line-height: 1.65; padding: 16px; border: 1px solid var(--border-solid); border-radius: 4px; box-sizing: border-box; resize: vertical; outline: none; background: var(--bg-canvas);"
            >${this.typedContent}</textarea>

            <div class="typing-telemetry-bar" style="display: flex; justify-content: space-between; align-items: center; margin: 12px 0 20px 0; font-family: var(--font-mono); font-size: 12px; color: var(--ink-muted);">
              <span id="char-word-counter">0 CHARS | 0 WORDS</span>
              <span id="elapsed-timer">TIME: 00:00</span>
            </div>

            <button class="hud-btn btn-evaluate-type" style="width: 100%; justify-content: center; background: var(--ink-primary); color: var(--ink-inverted); padding: 14px 0; font-size: 14px; font-weight: 600; border: none; cursor: pointer;">
              [ EVALUATE RECONSTRUCTION → ]
            </button>
          </div>
        `;

      case 'diff':
        const metrics = calculateWritingMetrics(item.masterSentence, this.typedContent, this.elapsedSeconds);
        const tokens = computeDiffTokens(item.masterSentence, this.typedContent);

        return `
          <div class="copywork-card" style="background: var(--bg-surface); border: 1px solid var(--border-hairline); padding: 28px; border-radius: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <span class="telemetry-label">[STEP 3 // MYERS/HIRSCHBERG SPLIT-DIFF EVALUATION]</span>
              <span class="telemetry-value" style="color: var(--accent-gold); font-size: 16px; font-weight: 700;">ACCURACY: ${metrics.accuracyPct}%</span>
            </div>

            <!-- Fluency Metrics Bar -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; background: rgba(0,0,0,0.02); border: 1px solid var(--border-hairline); padding: 12px 16px; border-radius: 4px; margin-bottom: 20px; font-family: var(--font-mono); font-size: 12px; text-align: center;">
              <div>
                <div class="telemetry-label">ACCURACY</div>
                <div class="val-accuracy" style="font-size: 16px; font-weight: 700;">${metrics.accuracyPct}%</div>
              </div>
              <div>
                <div class="telemetry-label">NET WPM</div>
                <div class="val-wpm" style="font-size: 16px; font-weight: 700;">${metrics.netWpm}</div>
              </div>
              <div>
                <div class="telemetry-label">ERRORS</div>
                <div class="val-errors" style="font-size: 16px; font-weight: 700; color: ${metrics.errorCount === 0 ? 'var(--accent-gold)' : '#dc2626'};">${metrics.errorCount}</div>
              </div>
              <div>
                <div class="telemetry-label">TIME</div>
                <div class="val-time" style="font-size: 16px; font-weight: 700;">${metrics.elapsedSec}s</div>
              </div>
            </div>

            <!-- Original Exemplar -->
            <div style="margin-bottom: 16px;">
              <div class="telemetry-label" style="margin-bottom: 6px;">[ORIGINAL EXEMPLAR]</div>
              <div style="font-size: 16px; line-height: 1.6; padding: 12px; background: rgba(0,0,0,0.02); border-left: 3px solid var(--accent-gold); border-radius: 2px;">
                "${item.masterSentence}"
              </div>
            </div>

            <!-- Side-by-Side Highlighted Diff -->
            <div style="margin-bottom: 24px;">
              <div class="telemetry-label" style="margin-bottom: 6px;">[YOUR RECONSTRUCTION & CORRECTIONS]</div>
              <div class="copywork-diff-container" style="font-size: 16px; line-height: 1.8; padding: 14px; border: 1px solid var(--border-hairline); border-radius: 4px; background: var(--bg-canvas);">
                ${this.renderDiffHTML(tokens)}
              </div>
            </div>

            <!-- Self-Assessment SRS Rating Bar -->
            <div style="border-top: 1px solid var(--border-hairline); padding-top: 16px;">
              <div class="telemetry-label" style="text-align: center; margin-bottom: 12px;">[LOG RETENTION RATING // UPDATE CONSTELLATION MASTERY]</div>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                <button class="hud-btn btn-rate-srs" data-rating="0" style="padding: 10px 0; justify-content: center; font-size: 12px;">[ AGAIN (0) ]</button>
                <button class="hud-btn btn-rate-srs" data-rating="2" style="padding: 10px 0; justify-content: center; font-size: 12px;">[ HARD (2) ]</button>
                <button class="hud-btn btn-rate-srs" data-rating="3" style="padding: 10px 0; justify-content: center; font-size: 12px; font-weight: 700;">[ GOOD (3) ]</button>
                <button class="hud-btn btn-rate-srs" data-rating="5" style="padding: 10px 0; justify-content: center; font-size: 12px; color: var(--accent-gold); font-weight: 700;">[ EASY (5) ]</button>
              </div>
            </div>
          </div>
        `;
    }
  }

  private renderDiffHTML(tokens: ProofreadDiffToken[]): string {
    return tokens.map(token => {
      if (token.type === 'match') {
        return `<span class="diff-match" style="color: var(--ink-primary);">${this.escapeHTML(token.value)}</span>`;
      } else if (token.type === 'delete') {
        return `<span class="diff-delete" style="color: #dc2626; text-decoration: line-through; background: rgba(220, 38, 38, 0.1); padding: 0 2px;">${this.escapeHTML(token.value)}</span>`;
      } else {
        return `<span class="diff-insert" style="color: #ca8a04; font-weight: 700; background: rgba(202, 138, 4, 0.15); padding: 0 2px;">${this.escapeHTML(token.value)}</span>`;
      }
    }).join('');
  }

  private escapeHTML(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  private bindEvents(item: WritingItem): void {
    // Navigation prev / next
    this.container.querySelector('.nav-btn-prev')?.addEventListener('click', () => {
      if (this.currentIndex > 0) {
        this.clearTimer();
        this.currentIndex--;
        this.currentStep = 'analyze';
        this.typedContent = '';
        this.render();
      }
    });

    this.container.querySelector('.nav-btn-next')?.addEventListener('click', () => {
      if (this.currentIndex < this.items.length - 1) {
        this.clearTimer();
        this.currentIndex++;
        this.currentStep = 'analyze';
        this.typedContent = '';
        this.render();
      }
    });

    // Step 1: Speak Model
    this.container.querySelector('.btn-speak-model')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(item.masterSentence);
        u.lang = 'en-US';
        u.rate = 0.95;
        window.speechSynthesis.speak(u);
      }
    });

    // Step 1 -> Step 2
    this.container.querySelector('.btn-proceed-type')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      this.currentStep = 'type';
      this.typedContent = '';
      this.elapsedSeconds = 0;
      this.render();
      this.startTypingTimer();
      const textarea = this.container.querySelector('.copywork-input') as HTMLTextAreaElement | null;
      textarea?.focus();
    });

    // Step 2: Typing input & Peek
    const textarea = this.container.querySelector('.copywork-input') as HTMLTextAreaElement | null;
    textarea?.addEventListener('input', () => {
      this.typedContent = textarea.value;
      const chars = this.typedContent.length;
      const words = this.typedContent.trim() ? this.typedContent.trim().split(/\s+/).length : 0;
      const counterEl = this.container.querySelector('#char-word-counter');
      if (counterEl) {
        counterEl.textContent = `${chars} CHARS | ${words} WORDS`;
      }
    });

    const peekBtn = this.container.querySelector('.btn-peek-model');
    const peekContainer = this.container.querySelector('#peek-container') as HTMLElement | null;
    peekBtn?.addEventListener('click', () => {
      if (peekContainer) {
        peekContainer.style.display = 'block';
        setTimeout(() => {
          peekContainer.style.display = 'none';
        }, 2000);
      }
    });

    // Step 2 -> Step 3
    this.container.querySelector('.btn-evaluate-type')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      this.clearTimer();
      this.currentStep = 'diff';
      this.render();
    });

    // Step 3: SRS Rating buttons
    this.container.querySelectorAll('.btn-rate-srs').forEach(btn => {
      btn.addEventListener('click', () => {
        const ratingRaw = parseInt((btn as HTMLElement).dataset.rating || '3', 10);
        const rating: 'again' | 'good' = ratingRaw >= 3 ? 'good' : 'again';
        AudioSynthesizer.play('absorb');

        // Update SRS State
        const srsState = StorageManager.getCardState(item.id);
        const nextState = SRSEngine.rateCard(srsState, item.id, rating);
        StorageManager.setCardState(item.id, nextState);

        // Update Constellation Tree Mastery for Writing Branch
        const currentMastery = SkillTreeEngine.getNodeMasteryPct('wri-1');
        SkillTreeEngine.setNodeMasteryPct('wri-1', Math.min(100, currentMastery + 5));

        if (this.currentIndex < this.items.length - 1) {
          this.currentIndex++;
          this.currentStep = 'analyze';
          this.typedContent = '';
          this.render();
        } else if (this.onBatchComplete) {
          this.onBatchComplete();
        }
      });
    });
  }

  private startTypingTimer(): void {
    this.clearTimer();
    this.elapsedSeconds = 0;
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds++;
      const timerEl = this.container.querySelector('#elapsed-timer');
      if (timerEl) {
        const m = String(Math.floor(this.elapsedSeconds / 60)).padStart(2, '0');
        const s = String(this.elapsedSeconds % 60).padStart(2, '0');
        timerEl.textContent = `TIME: ${m}:${s}`;
      }
    }, 1000);
  }

  private clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  public teardown(): void {
    this.clearTimer();
  }
}
