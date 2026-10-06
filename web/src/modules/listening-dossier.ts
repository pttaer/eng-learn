import { Cefr } from '../core/cefr';
import { defaultLevel, levelRowHtml, bindLevelChips } from '../core/level-filter';
import { AtomicCard } from '../core/atomic-card';
import { icon } from '../utils/icons';
import { SRSEngine } from '../core/srs-engine';
import { StorageManager } from '../utils/storage';
import { AudioSynthesizer } from '../core/audio-synthesizer';
import listeningData from '../assets/data/listening.json';

export type ListeningMode = 'passive' | 'cloze';

export interface ClozeToken {
  type: 'text' | 'blank';
  text: string;
  cleanWord: string;
  trailingPunct?: string;
  gapIndex?: number;
}

export interface ListeningPassage {
  id: string;
  cefrLevel: Cefr;
  title: string;
  audioText: string;
  ipa: string;
  traps: string;
  clozeGaps?: string[];
}

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'in', 'on', 'at', 'to', 'of', 'for', 'is', 'am', 'are', 'was', 'were',
  'it', 'its', 'he', 'she', 'we', 'i', 'my', 'his', 'her', 'and', 'but', 'or', 'so', 'as',
  'by', 'do', 'does', 'did', 'if', 'be', 'been', 'being', 'this', 'that', 'these', 'those',
  'with', 'from', 'they', 'them', 'their', 'you', 'your', 'have', 'has', 'had', 'what',
  'who', 'whom', 'which', 'where', 'when', 'why', 'how', 'all', 'any', 'both', 'each',
  'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
  'same', 'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now'
]);

/**
 * Extracts and tokenizes a passage into normal text and blanked cloze keywords.
 */
export function parseClozeTokens(audioText: string, explicitGaps?: string[]): { tokens: ClozeToken[]; totalGaps: number } {
  const rawWords = audioText.split(/\s+/).filter(Boolean);
  const explicitSet = explicitGaps && explicitGaps.length > 0
    ? new Set(explicitGaps.map(g => g.toLowerCase().trim()))
    : null;

  const parsed = rawWords.map((raw) => {
    const clean = raw.toLowerCase().replace(/[^a-z0-9']/g, '');
    const m = raw.match(/([^a-zA-Z0-9']+)$/);
    const trailingPunct = m ? m[1] : '';
    return { raw, clean, trailingPunct };
  });

  const blankIndices = new Set<number>();

  if (explicitSet) {
    parsed.forEach((p, idx) => {
      if (explicitSet.has(p.clean)) {
        blankIndices.add(idx);
      }
    });
  } else {
    const candidates: number[] = [];
    parsed.forEach((p, idx) => {
      if (p.clean.length >= 3 && !STOP_WORDS.has(p.clean)) {
        candidates.push(idx);
      }
    });

    if (candidates.length === 0) {
      parsed.forEach((p, idx) => {
        if (p.clean.length >= 2) candidates.push(idx);
      });
    }

    const targetCount = Math.max(1, Math.min(5, Math.round(parsed.length * 0.25)));
    let lastChosen = -2;
    const step = Math.max(1, Math.floor(candidates.length / targetCount));

    for (let i = 0; i < candidates.length && blankIndices.size < targetCount; i += step) {
      const idx = candidates[i];
      if (idx - lastChosen >= 2) {
        blankIndices.add(idx);
        lastChosen = idx;
      }
    }
  }

  let gapCounter = 0;
  const tokens: ClozeToken[] = parsed.map((p, idx) => {
    if (blankIndices.has(idx)) {
      return {
        type: 'blank',
        text: p.raw,
        cleanWord: p.clean,
        trailingPunct: p.trailingPunct,
        gapIndex: gapCounter++
      };
    }
    return {
      type: 'text',
      text: p.raw,
      cleanWord: p.clean
    };
  });

  return { tokens, totalGaps: gapCounter };
}

export class ListeningDossier {
  private container: HTMLElement;
  private allPassages: ListeningPassage[] = [];
  private passages: ListeningPassage[] = [];
  private activeLevel: Cefr;
  private currentIndex: number = 0;
  private currentCardHandle: any = null;
  private currentMode: ListeningMode = 'passive';
  private playbackSpeed: number = 1.0; // 0.8x, 1.0x, 1.2x
  private userGapInputs: Map<number, string> = new Map();
  private completedPassages: Set<string> = new Set();
  public onBatchComplete?: () => void;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'dossier-workspace dossier-listening interactive';
    this.allPassages = (listeningData as any).samplePassages || [];
    this.activeLevel = defaultLevel(this.allPassages, StorageManager.getSkillLevel('listening'));
    this.applyLevel();
    window.addEventListener('learner-level-change', () => {
      this.activeLevel = defaultLevel(this.allPassages, StorageManager.getSkillLevel('listening'));
      this.applyLevel();
      if (this.container.isConnected) this.render();
    });
  }

  private applyLevel(): void {
    this.passages = this.allPassages.filter(p => p.cefrLevel === this.activeLevel);
    this.currentIndex = 0;
    this.userGapInputs.clear();
  }

  public setMode(mode: ListeningMode): void {
    this.currentMode = mode;
    this.userGapInputs.clear();
    this.render();
  }

  public getMode(): ListeningMode {
    return this.currentMode;
  }

  public setPlaybackSpeed(speed: number): void {
    this.playbackSpeed = speed;
    this.container.querySelectorAll('.btn-speed').forEach(btn => {
      const s = parseFloat((btn as HTMLElement).dataset.speed || '1.0');
      if (Math.abs(s - speed) < 0.01) {
        btn.classList.add('active-speed');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('active-speed');
        btn.setAttribute('aria-pressed', 'false');
      }
    });
  }

  public getPlaybackSpeed(): number {
    return this.playbackSpeed;
  }

  public getClozeTokens(item?: any): { tokens: ClozeToken[]; totalGaps: number } {
    const targetItem = item || this.passages[this.currentIndex];
    if (!targetItem) return { tokens: [], totalGaps: 0 };
    return parseClozeTokens(targetItem.audioText, targetItem.clozeGaps);
  }

  public getClozeInput(gapIndex: number): string {
    return this.userGapInputs.get(gapIndex) || '';
  }

  public setClozeInput(gapIndex: number, val: string): void {
    this.userGapInputs.set(gapIndex, val);
  }

  public evaluateClozeInput(gapIndex: number, userVal: string): boolean {
    const currentItem = this.passages[this.currentIndex];
    if (!currentItem) return false;
    const { tokens } = this.getClozeTokens(currentItem);
    const token = tokens.find(t => t.type === 'blank' && t.gapIndex === gapIndex);
    if (!token) return false;
    const cleanUser = userVal.trim().toLowerCase().replace(/[^a-z0-9']/g, '');
    return cleanUser === token.cleanWord;
  }

  public getClozeScore(item?: any): { correct: number; total: number; percentage: number } {
    const targetItem = item || this.passages[this.currentIndex];
    if (!targetItem) return { correct: 0, total: 0, percentage: 100 };
    const { tokens, totalGaps } = this.getClozeTokens(targetItem);
    if (totalGaps === 0) return { correct: 0, total: 0, percentage: 100 };

    let correct = 0;
    tokens.forEach(t => {
      if (t.type === 'blank' && t.gapIndex !== undefined) {
        const userVal = this.userGapInputs.get(t.gapIndex) || '';
        const cleanUser = userVal.trim().toLowerCase().replace(/[^a-z0-9']/g, '');
        if (cleanUser === t.cleanWord) {
          correct++;
        }
      }
    });

    const percentage = Math.round((correct / totalGaps) * 100);
    return { correct, total: totalGaps, percentage };
  }

  public render(): HTMLElement {
    this.container.innerHTML = `
      <div class="dossier-control-bar">
        <div class="dossier-tabs" style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <span class="telemetry-label">[PILLAR 03 // ACTIVE TRANSCRIPTION & PHONETICS]</span>
          <div class="listening-mode-cluster" role="tablist" aria-label="Listening Mode">
            <button type="button" class="hud-btn mode-tab ${this.currentMode === 'passive' ? 'active' : ''}" data-mode="passive" aria-pressed="${this.currentMode === 'passive'}">
              📖 Passive Passages
            </button>
            <button type="button" class="hud-btn mode-tab ${this.currentMode === 'cloze' ? 'active' : ''}" data-mode="cloze" aria-pressed="${this.currentMode === 'cloze'}">
              ✍️ Cloze Transcription
            </button>
          </div>
        </div>
        ${levelRowHtml(this.allPassages, this.activeLevel)}
        <div class="dossier-status-pill">
          <span class="telemetry-value">${this.currentMode === 'cloze' ? 'ACTIVE CLOZE GAP-FILL' : '3-PASS ACTIVE PROTOCOL'}</span>
        </div>
      </div>
      <div class="dossier-card-slot"></div>
      <div class="dossier-nav-bar">
        <button class="hud-btn nav-btn-prev" ${this.currentIndex === 0 ? 'disabled' : ''}>${icon('arrowLeft')} Prev Passage</button>
        <span class="telemetry-value card-counter">Passage ${this.currentIndex + 1} / ${this.passages.length}</span>
        <button class="hud-btn nav-btn-next" ${this.currentIndex >= this.passages.length - 1 ? 'disabled' : ''}>Next Passage ${icon('arrowRight')}</button>
      </div>
    `;

    this.bindEvents();
    this.renderCurrentCard();
    return this.container;
  }

  private bindEvents(): void {
    bindLevelChips(this.container, level => {
      this.activeLevel = level;
      this.applyLevel();
      this.render();
    });

    this.container.querySelectorAll('.mode-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const mode = (tab as HTMLElement).dataset.mode as ListeningMode;
        if (mode && mode !== this.currentMode) {
          AudioSynthesizer.play('click');
          this.setMode(mode);
        }
      });
    });

    this.container.querySelector('.nav-btn-prev')?.addEventListener('click', () => {
      if (this.currentIndex > 0) {
        this.currentIndex -= 1;
        this.userGapInputs.clear();
        this.renderCurrentCard();
      }
    });

    this.container.querySelector('.nav-btn-next')?.addEventListener('click', () => {
      if (this.currentIndex < this.passages.length - 1) {
        this.currentIndex += 1;
        this.userGapInputs.clear();
        this.renderCurrentCard();
      }
    });
  }

  private renderCurrentCard(): void {
    const slot = this.container.querySelector('.dossier-card-slot');
    if (!slot) return;
    slot.innerHTML = '';

    if (this.passages.length === 0) {
      slot.innerHTML = '<div class="empty-state-notice">No passages available for this level.</div>';
      return;
    }

    const item = this.passages[this.currentIndex];
    const srsState = StorageManager.getCardState(item.id);
    let statusBadge: 'NEW' | 'REVIEW' | 'MASTERED' = 'NEW';
    if (srsState) {
      statusBadge = srsState.repetitions >= 3 ? 'MASTERED' : 'REVIEW';
    }

    const frontEl = this.currentMode === 'cloze'
      ? this.renderClozeFront(item)
      : this.renderPassiveFront(item);

    const backEl = this.renderBackContent(item);

    const cardHandle = AtomicCard.create({
      id: item.id,
      pillar: 'LISTEN',
      category: this.currentMode === 'cloze' ? 'CLOZE TRANSCRIPTION' : 'PHONETICS',
      indexStr: `${String(this.currentIndex + 1).padStart(2, '0')} / ${String(this.passages.length).padStart(2, '0')}`,
      statusBadge,
      front: {
        customContent: frontEl,
        mainText: item.title
      },
      back: {
        customContent: backEl,
        mainText: item.audioText
      },
      audioText: item.audioText,
      onRate: (rating) => {
        const nextState = SRSEngine.rateCard(srsState, item.id, rating);
        StorageManager.setCardState(item.id, nextState);

        if (this.currentIndex < this.passages.length - 1) {
          this.currentIndex += 1;
          this.userGapInputs.clear();
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
      counter.textContent = `Passage ${this.currentIndex + 1} / ${this.passages.length}`;
    }
  }

  private renderPassiveFront(item: ListeningPassage): HTMLElement {
    const frontEl = document.createElement('div');
    frontEl.className = 'listening-front';
    frontEl.innerHTML = `
      <div class="card-prompt-label">Pass 1 & 2 · Active Audio Transcription</div>
      <div style="font-family: var(--font-sans); font-size: 15px; font-weight: 600; margin-bottom: 8px;">
        Topic: ${item.title}
      </div>
      <div style="display: flex; gap: 8px; margin-bottom: 12px;">
        <button type="button" class="hud-btn btn-play-audio" style="font-size: 11px; padding: 4px 10px;">▶ Play 1.0x</button>
        <button type="button" class="hud-btn btn-play-slow" style="font-size: 11px; padding: 4px 10px;">⏵ Play 0.8x</button>
      </div>
      <textarea class="listening-transcribe-box" placeholder="Pass 2: Transcribe word-for-word here..." rows="3" style="width: 100%; font-family: var(--font-mono); font-size: 12px; padding: 10px; border: 1px solid var(--border-subtle); background: var(--bg-surface-sunk); color: var(--ink-primary); border-radius: 6px; outline: none; resize: none; box-sizing: border-box;"></textarea>
      <div style="font-family: var(--font-mono); font-size: 10px; color: var(--ink-muted); margin-top: 6px;">
        Listen at least twice before pressing Space / Flip to reveal phonetic analysis.
      </div>
    `;

    const speak = (rate: number) => {
      AudioSynthesizer.speak(item.audioText, rate);
    };

    frontEl.querySelector('.btn-play-audio')?.addEventListener('click', (e) => {
      e.stopPropagation();
      speak(1.0);
    });

    frontEl.querySelector('.btn-play-slow')?.addEventListener('click', (e) => {
      e.stopPropagation();
      speak(0.8);
    });

    return frontEl;
  }

  private renderClozeFront(item: ListeningPassage): HTMLElement {
    const frontEl = document.createElement('div');
    frontEl.className = 'listening-front listening-cloze-console';

    const { tokens, totalGaps } = this.getClozeTokens(item);
    const score = this.getClozeScore(item);
    const isComplete = totalGaps > 0 && score.correct === totalGaps;

    frontEl.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <div class="card-prompt-label">
          CLOZE TRANSCRIPTION // CEFR ${item.cefrLevel}
        </div>
        <div class="cloze-progress-badge" style="font-family: var(--font-mono); font-size: 11px;">
          GAPS: <span class="cloze-correct-count" style="font-weight: 700; color: ${isComplete ? 'var(--good)' : 'var(--accent-gold)'};">${score.correct}</span> / <span class="cloze-total-count">${totalGaps}</span> (${score.percentage}%)
        </div>
      </div>

      <div style="font-family: var(--font-sans); font-size: 15px; font-weight: 600; margin-bottom: 12px; color: var(--ink-primary);">
        Topic: ${item.title}
      </div>

      <!-- Audio Player Strip with Speed Controls -->
      <div class="cloze-player-strip">
        <div style="display: flex; align-items: center; gap: 6px;">
          <button type="button" class="hud-btn btn-cloze-play" style="font-size: 11px; padding: 4px 12px; font-weight: 700; background: var(--accent-gold); color: var(--bg-canvas); border: none;">
            ▶ Play Audio
          </button>
        </div>
        <div class="speed-control-group">
          <span style="font-family: var(--font-mono); font-size: 10px; color: var(--ink-muted); margin-right: 4px;">SPEED:</span>
          <button type="button" class="hud-btn btn-speed ${Math.abs(this.playbackSpeed - 0.8) < 0.01 ? 'active-speed' : ''}" data-speed="0.8" aria-pressed="${Math.abs(this.playbackSpeed - 0.8) < 0.01}">0.8x</button>
          <button type="button" class="hud-btn btn-speed ${Math.abs(this.playbackSpeed - 1.0) < 0.01 ? 'active-speed' : ''}" data-speed="1.0" aria-pressed="${Math.abs(this.playbackSpeed - 1.0) < 0.01}">1.0x</button>
          <button type="button" class="hud-btn btn-speed ${Math.abs(this.playbackSpeed - 1.2) < 0.01 ? 'active-speed' : ''}" data-speed="1.2" aria-pressed="${Math.abs(this.playbackSpeed - 1.2) < 0.01}">1.2x</button>
        </div>
      </div>

      <!-- Masked Transcript Sentence Container -->
      <div class="cloze-transcript-container">
        ${this.renderClozeSentenceHTML(tokens)}
      </div>

      <!-- Hint & Reset Controls -->
      <div style="display: flex; justify-content: space-between; align-items: center; font-family: var(--font-mono); font-size: 11px; color: var(--ink-muted);">
        <div>
          Listen closely & transcribe the missing phonetic words.
        </div>
        <div style="display: flex; gap: 6px;">
          <button type="button" class="hud-btn btn-cloze-hint" style="font-size: 10px; padding: 2px 8px;">💡 Hint</button>
          <button type="button" class="hud-btn btn-cloze-reset" style="font-size: 10px; padding: 2px 8px;">↺ Reset</button>
        </div>
      </div>

      <!-- Completion Celebration Banner -->
      <div class="cloze-completion-banner" style="display: ${isComplete ? 'block' : 'none'};">
        ★ ALL GAPS CORRECT (100% ACCURACY)! Press Space or Flip to review IPA & connected speech.
      </div>
    `;

    this.bindClozeEvents(frontEl, item, tokens);
    return frontEl;
  }

  private renderClozeSentenceHTML(tokens: ClozeToken[]): string {
    return tokens.map(token => {
      if (token.type === 'text') {
        return `<span class="cloze-text">${this.escapeHTML(token.text)}</span>`;
      }

      const idx = token.gapIndex ?? 0;
      const currentVal = this.userGapInputs.get(idx) || '';
      const cleanUser = currentVal.trim().toLowerCase().replace(/[^a-z0-9']/g, '');

      let statusClass = '';
      if (cleanUser.length > 0) {
        if (cleanUser === token.cleanWord) {
          statusClass = 'is-correct';
        } else if (!token.cleanWord.startsWith(cleanUser) || cleanUser.length >= token.cleanWord.length) {
          statusClass = 'is-incorrect';
        }
      }

      const widthCh = Math.max(5, token.cleanWord.length + 1.5);
      const placeholder = '_'.repeat(Math.min(token.cleanWord.length, 8));

      return `<span class="cloze-gap-slot"><input type="text" class="cloze-gap-input ${statusClass}" data-gap-index="${idx}" data-answer="${token.cleanWord}" placeholder="${placeholder}" value="${this.escapeHTML(currentVal)}" aria-label="Gap ${idx + 1}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" style="width: ${widthCh}ch;" /><span class="cloze-punct">${this.escapeHTML(token.trailingPunct || '')}</span></span>`;
    }).join(' ');
  }

  private bindClozeEvents(frontEl: HTMLElement, item: ListeningPassage, tokens: ClozeToken[]): void {
    // 1. Play audio at active speed
    frontEl.querySelector('.btn-cloze-play')?.addEventListener('click', (e) => {
      e.stopPropagation();
      AudioSynthesizer.speak(item.audioText, this.playbackSpeed);
    });

    // 2. Playback speed selection
    frontEl.querySelectorAll('.btn-speed').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const speed = parseFloat((btn as HTMLElement).dataset.speed || '1.0');
        if (!isNaN(speed)) {
          this.setPlaybackSpeed(speed);
          AudioSynthesizer.play('click');
        }
      });
    });

    // 3. Real-time typing evaluation on cloze gap inputs
    const inputs = frontEl.querySelectorAll('.cloze-gap-input') as NodeListOf<HTMLInputElement>;
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        const gapIdx = parseInt(input.dataset.gapIndex || '0', 10);
        const target = (input.dataset.answer || '').toLowerCase();
        const userVal = input.value;
        this.userGapInputs.set(gapIdx, userVal);

        // Keystroke sound with slight pitch variance
        const pitchMod = 0.94 + Math.random() * 0.12;
        AudioSynthesizer.playMechanicalClick(pitchMod);

        const clean = userVal.trim().toLowerCase().replace(/[^a-z0-9']/g, '');
        const wasCorrect = input.classList.contains('is-correct');

        if (clean.length === 0) {
          input.classList.remove('is-correct', 'is-incorrect');
        } else if (clean === target) {
          input.classList.remove('is-incorrect');
          input.classList.add('is-correct');
          if (!wasCorrect) {
            AudioSynthesizer.play('absorb');

            // Auto-advance focus to next incomplete gap
            for (const otherInput of Array.from(inputs)) {
              const otherIdx = parseInt(otherInput.dataset.gapIndex || '0', 10);
              const otherClean = (this.userGapInputs.get(otherIdx) || '').trim().toLowerCase().replace(/[^a-z0-9']/g, '');
              const otherTarget = (otherInput.dataset.answer || '').toLowerCase();
              if (otherClean !== otherTarget) {
                otherInput.focus();
                break;
              }
            }
          }
        } else if (!target.startsWith(clean) || clean.length >= target.length) {
          input.classList.remove('is-correct');
          input.classList.add('is-incorrect');
        } else {
          input.classList.remove('is-correct', 'is-incorrect');
        }

        // Update score indicators
        const score = this.getClozeScore(item);
        const correctCountEl = frontEl.querySelector('.cloze-correct-count');
        const badgeEl = frontEl.querySelector('.cloze-progress-badge');
        const bannerEl = frontEl.querySelector('.cloze-completion-banner') as HTMLElement | null;

        if (correctCountEl) {
          correctCountEl.textContent = String(score.correct);
        }
        if (badgeEl) {
          badgeEl.innerHTML = `GAPS: <span class="cloze-correct-count" style="font-weight: 700; color: ${score.percentage === 100 ? 'var(--good)' : 'var(--accent-gold)'};">${score.correct}</span> / <span class="cloze-total-count">${score.total}</span> (${score.percentage}%)`;
        }

        if (score.percentage === 100 && score.total > 0) {
          if (!this.completedPassages.has(item.id)) {
            this.completedPassages.add(item.id);
            AudioSynthesizer.play('level-up');
            AudioSynthesizer.play('streak-chime');

            const srsState = StorageManager.getCardState(item.id);
            const nextState = SRSEngine.rateCard(srsState, item.id, 'good');
            StorageManager.setCardState(item.id, nextState);
          }
          if (bannerEl) {
            bannerEl.style.display = 'block';
          }
        } else if (bannerEl) {
          bannerEl.style.display = 'none';
        }
      });
    });

    // 4. Hint button: fills in the first letter of the first incomplete gap
    frontEl.querySelector('.btn-cloze-hint')?.addEventListener('click', (e) => {
      e.stopPropagation();
      for (const input of Array.from(inputs)) {
        const gapIdx = parseInt(input.dataset.gapIndex || '0', 10);
        const target = (input.dataset.answer || '').toLowerCase();
        const currentClean = (this.userGapInputs.get(gapIdx) || '').trim().toLowerCase().replace(/[^a-z0-9']/g, '');
        if (currentClean !== target && target.length > 0) {
          const hint = target.slice(0, Math.min(2, target.length));
          input.value = hint;
          input.dispatchEvent(new Event('input'));
          input.focus();
          AudioSynthesizer.play('tick');
          break;
        }
      }
    });

    // 5. Reset button: clears inputs for current passage
    frontEl.querySelector('.btn-cloze-reset')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.userGapInputs.clear();
      inputs.forEach(input => {
        input.value = '';
        input.classList.remove('is-correct', 'is-incorrect');
      });
      AudioSynthesizer.play('click');
      const bannerEl = frontEl.querySelector('.cloze-completion-banner') as HTMLElement | null;
      if (bannerEl) bannerEl.style.display = 'none';
      const badgeEl = frontEl.querySelector('.cloze-progress-badge');
      if (badgeEl) {
        badgeEl.innerHTML = `GAPS: <span class="cloze-correct-count" style="font-weight: 700; color: var(--accent-gold);">0</span> / <span class="cloze-total-count">${tokens.filter(t => t.type === 'blank').length}</span> (0%)`;
      }
    });
  }

  private renderBackContent(item: ListeningPassage): HTMLElement {
    const backEl = document.createElement('div');
    backEl.className = 'listening-back';

    const transcriptHtml = this.currentMode === 'cloze'
      ? this.renderHighlightedTranscript(item)
      : `"${this.escapeHTML(item.audioText)}"`;

    backEl.innerHTML = `
      <div class="card-prompt-label">Pass 3 · Phonetic Gap Analysis & Transcript</div>
      <div class="card-main-text" style="font-size: 15px; font-weight: 600; line-height: 1.6; margin-bottom: 10px;">
        ${transcriptHtml}
      </div>
      <div class="card-ipa-text" style="font-size: 11px; margin-bottom: 8px; background: var(--bg-surface-sunk); color: var(--accent-gold); border: 1px solid var(--border-subtle); border-radius: 4px; padding: 6px 10px; font-family: var(--font-mono);">
        IPA: ${this.escapeHTML(item.ipa)}
      </div>
      <div style="font-family: var(--font-mono); font-size: 11px; line-height: 1.4; border-top: 1px dashed var(--border-hairline); padding-top: 6px;">
        <strong>CONNECTED SPEECH PHENOMENA:</strong><br />
        ${this.escapeHTML(item.traps)}
      </div>
    `;

    return backEl;
  }

  private renderHighlightedTranscript(item: ListeningPassage): string {
    const { tokens } = this.getClozeTokens(item);
    return `"${tokens.map(token => {
      if (token.type === 'blank') {
        return `<strong class="cloze-target-chip" style="color: var(--accent-gold); text-decoration: underline;">${this.escapeHTML(token.text)}</strong>`;
      }
      return this.escapeHTML(token.text);
    }).join(' ')}"`;
  }

  private escapeHTML(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  public handleGlobalKey(key: string): boolean {
    if (!this.currentCardHandle) return false;

    const active = document.activeElement;
    if (active && (active.tagName === 'TEXTAREA' || active.tagName === 'INPUT')) {
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
