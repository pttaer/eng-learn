import { AtomicCard } from '../core/atomic-card';
import { icon } from '../utils/icons';
import { SRSEngine } from '../core/srs-engine';
import { StorageManager } from '../utils/storage';
import { AudioSynthesizer } from '../core/audio-synthesizer';
import { computeDiffTokens, ProofreadDiffToken } from './writing-dossier';
import grammarData from '../assets/data/grammar.json';

export type GrammarMode = 'INVERSION_EMPHASIS' | 'SUBJUNCTIVE_UNREAL' | 'CLAUSAL_CONDENSATION' | 'SYNTACTIC_PRECISION';

export interface GrammarItem {
  id: string;
  mode: GrammarMode;
  level: number; // 1, 2, 3
  title: string;
  promptSentence: string;
  targetTransformation: string;
  grammaticalCue: string;
  vietnamese: string;
  formula: string;
  analysis: string;
  exemplarContext: string;
}

export class GrammarDossier {
  private container: HTMLElement;
  private allDeck: GrammarItem[];
  private activeMode: GrammarMode = 'INVERSION_EMPHASIS';
  private activeLevel: number = 1; // 1, 2, 3
  private currentList: GrammarItem[] = [];
  private currentIndex: number = 0;
  private reviewCountInRun: number = 0;
  private currentCardHandle: any = null;
  public onBatchComplete?: () => void;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'dossier-workspace dossier-grammar interactive';
    this.allDeck = grammarData as GrammarItem[];
    this.filterDeck();
  }

  private filterDeck(): void {
    this.currentList = this.allDeck.filter(
      item => item.mode === this.activeMode && item.level === this.activeLevel
    );
    this.currentIndex = 0;
  }

  public render(): HTMLElement {
    const modeTitles: Record<GrammarMode, string> = {
      INVERSION_EMPHASIS: 'MODE A: INVERSION & EMPHASIS',
      SUBJUNCTIVE_UNREAL: 'MODE B: SUBJUNCTIVE & UNREAL',
      CLAUSAL_CONDENSATION: 'MODE C: CLAUSAL CONDENSATION',
      SYNTACTIC_PRECISION: 'MODE D: SYNTACTIC PRECISION'
    };

    this.container.innerHTML = `
      <div class="dossier-control-bar">
        <div class="dossier-tabs grammar-mode-tabs">
          <button class="hud-btn mode-tab ${this.activeMode === 'INVERSION_EMPHASIS' ? 'active' : ''}" data-mode="INVERSION_EMPHASIS">
            Mode A: Inversion
          </button>
          <button class="hud-btn mode-tab ${this.activeMode === 'SUBJUNCTIVE_UNREAL' ? 'active' : ''}" data-mode="SUBJUNCTIVE_UNREAL">
            Mode B: Subjunctive
          </button>
          <button class="hud-btn mode-tab ${this.activeMode === 'CLAUSAL_CONDENSATION' ? 'active' : ''}" data-mode="CLAUSAL_CONDENSATION">
            Mode C: Condensation
          </button>
          <button class="hud-btn mode-tab ${this.activeMode === 'SYNTACTIC_PRECISION' ? 'active' : ''}" data-mode="SYNTACTIC_PRECISION">
            Mode D: Precision
          </button>
        </div>

        <div class="grammar-level-selector">
          <span class="telemetry-label" style="margin-right: 8px;">TIER:</span>
          <button class="hud-btn level-tab ${this.activeLevel === 1 ? 'active' : ''}" data-lvl="1">Lvl 1: Baseline</button>
          <button class="hud-btn level-tab ${this.activeLevel === 2 ? 'active' : ''}" data-lvl="2">Lvl 2: Advanced</button>
          <button class="hud-btn level-tab ${this.activeLevel === 3 ? 'active' : ''}" data-lvl="3">Lvl 3: Mastery (C2)</button>
        </div>
      </div>

      <div class="vocab-telemetry-banner">
        <div class="telemetry-item">
          <span class="telemetry-label">SYNTACTIC DRILL RUN</span>
          <span class="telemetry-value streak-counter">${this.reviewCountInRun} TRANSFORMATIONS</span>
        </div>
        <div class="telemetry-item">
          <span class="telemetry-label">COGNITIVE LOAD FACTOR</span>
          <span class="telemetry-value">${this.activeLevel >= 3 ? 'EF 2.30 (HIGH COGNITIVE)' : 'EF 2.50 (CANONICAL)'}</span>
        </div>
        <div class="telemetry-item">
          <span class="telemetry-label">SYNTAX CLASSIFIER</span>
          <span class="telemetry-value">${modeTitles[this.activeMode]}</span>
        </div>
      </div>

      <div class="dossier-card-slot"></div>

      <div class="dossier-nav-bar">
        <button class="hud-btn nav-btn-prev">${icon('arrowLeft')} Prev</button>
        <span class="telemetry-value card-counter">SYNTAX NODE ${this.currentIndex + 1} / ${Math.max(1, this.currentList.length)}</span>
        <button class="hud-btn nav-btn-next">Next ${icon('arrowRight')}</button>
      </div>
    `;

    this.bindEvents();
    this.renderCurrentCard();
    return this.container;
  }

  private bindEvents(): void {
    // Mode tabs
    const modeTabs = this.container.querySelectorAll('.mode-tab');
    modeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.activeMode = (tab as HTMLElement).dataset.mode as GrammarMode;
        AudioSynthesizer.play('click');
        this.filterDeck();
        this.render();
      });
    });

    // Level tabs
    const levelTabs = this.container.querySelectorAll('.level-tab');
    levelTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const newLevel = parseInt((tab as HTMLElement).dataset.lvl || '1', 10);
        if (newLevel > this.activeLevel) {
          AudioSynthesizer.play('level-up');
        } else {
          AudioSynthesizer.play('click');
        }
        this.activeLevel = newLevel;
        this.filterDeck();
        this.render();
      });
    });

    // Navigation buttons
    const prevBtn = this.container.querySelector('.nav-btn-prev');
    const nextBtn = this.container.querySelector('.nav-btn-next');

    prevBtn?.addEventListener('click', () => this.navigateCard(-1));
    nextBtn?.addEventListener('click', () => this.navigateCard(1));
  }

  private navigateCard(delta: number): void {
    if (this.currentList.length === 0) return;
    this.currentIndex = (this.currentIndex + delta + this.currentList.length) % this.currentList.length;
    this.renderCurrentCard();
    const counter = this.container.querySelector('.card-counter');
    if (counter) {
      counter.textContent = `SYNTAX NODE [ ${this.currentIndex + 1} / ${Math.max(1, this.currentList.length)} ]`;
    }
  }

  private renderCurrentCard(): void {
    const slot = this.container.querySelector('.dossier-card-slot');
    if (!slot) return;
    slot.innerHTML = '';

    if (this.currentList.length === 0) {
      slot.innerHTML = `
        <div class="empty-state-notice">
          <div class="telemetry-label">[TIER DEPLETED]</div>
          <p>No grammar items available for this mode and difficulty level.</p>
        </div>
      `;
      return;
    }

    const item = this.currentList[this.currentIndex];

    const srsState = StorageManager.getCardState(item.id);
    let statusBadge: 'NEW' | 'REVIEW' | 'MASTERED' = 'NEW';
    if (srsState) {
      statusBadge = srsState.repetitions >= 3 ? 'MASTERED' : 'REVIEW';
    }

    const categoryLabel = `${item.mode.replace('_', ' ')} [LVL ${item.level}]`;

    // FRONT: Prompt sentence, Cue, and Formula Bar
    const frontEl = document.createElement('div');
    frontEl.className = 'grammar-front-content';
    frontEl.innerHTML = `
      <div class="card-prompt-label">SYNTACTIC TRANSFORMATION // ${item.title.toUpperCase()}</div>
      <div class="card-main-text" style="font-size: 16px; line-height: 1.62; font-weight: 500; max-width: 68ch; margin: 12px 0;">
        "${item.promptSentence}"
      </div>
      <div class="card-sub-text" style="font-family: var(--font-mono); font-size: 12px; margin-bottom: 8px;">
        CUE: ${item.grammaticalCue}
      </div>
      <div class="grammar-formula-bar">
        [ STEP-BY-STEP SYNTACTIC FORMULA ]: ${item.formula}
      </div>
    `;

    // BACK: Target Resolution, Repair Diff, Vietnamese Callout, Rhetorical Analysis
    const backEl = document.createElement('div');
    backEl.className = 'grammar-back-content';

    const diffTokens = computeDiffTokens(item.promptSentence, item.targetTransformation);
    const repairDiffHtml = this.formatRepairDiffHtml(diffTokens);

    backEl.innerHTML = `
      <div class="card-prompt-label">TARGET RESOLUTION // ${item.title.toUpperCase()}</div>
      <div class="card-main-text" style="font-size: 16px; line-height: 1.62; font-weight: 700; max-width: 68ch; margin: 10px 0;">
        "${item.targetTransformation}"
      </div>

      <!-- Syntactic Repair Diff -->
      <div class="grammar-repair-diff-box">
        <div class="telemetry-label" style="margin-bottom: 4px;">[SYNTACTIC REPAIR DIFF: BASELINE → TRANSFORMED]</div>
        <div class="repair-diff-content" style="line-height: 1.8;">
          ${repairDiffHtml}
        </div>
      </div>

      <!-- Formula Bar -->
      <div class="grammar-formula-bar">
        [ STEP-BY-STEP SYNTACTIC MATRIX ]: ${item.formula}
      </div>

      <!-- Vietnamese Comparative Syntax Drawer -->
      <div class="grammar-vietnamese-callout">
        <strong>[VIETNAMESE L1 COMPARATIVE INTERFERENCE]:</strong>
        ${item.vietnamese}
      </div>

      <!-- Rhetorical Analysis -->
      <div class="grammar-analysis-box" style="margin-top: 8px;">
        <span class="telemetry-label">[RHETORICAL & SYNTACTIC ANALYSIS]:</span>
        <p style="font-size: 13px; line-height: 1.5; margin-top: 4px;">${item.analysis}</p>
      </div>

      <!-- Contrastive Advanced Register Exemplar -->
      <div class="grammar-exemplar-box" style="margin-top: 8px;">
        <span class="telemetry-label">[CONTRASTIVE EXEMPLAR IN ADVANCED REGISTER]:</span>
        <blockquote style="font-style: italic; border-left: 2px solid var(--accent-gold); padding-left: 10px; margin: 6px 0; font-size: 13px; line-height: 1.5;">
          "${item.exemplarContext}"
        </blockquote>
      </div>
    `;

    this.currentCardHandle = AtomicCard.create({
      id: item.id,
      pillar: 'GRAMMAR',
      category: categoryLabel,
      indexStr: `[ ${this.currentIndex + 1} / ${this.currentList.length} ]`,
      statusBadge,
      front: {
        customContent: frontEl,
        mainText: item.promptSentence
      },
      back: {
        customContent: backEl,
        mainText: item.targetTransformation
      },
      audioText: item.targetTransformation,
      onRate: (rating: 'again' | 'good') => {
        this.handleRate(item.id, rating, item.level);
      }
    });

    slot.appendChild(this.currentCardHandle.element);
  }

  private formatRepairDiffHtml(tokens: ProofreadDiffToken[]): string {
    if (tokens.length === 0) return '';
    let html = '';
    let currentType = tokens[0].type;
    let currentVal = '';

    const flushChunk = () => {
      if (!currentVal) return;
      const escaped = this.escapeHtml(currentVal);
      if (currentType === 'match') {
        html += `<span class="diff-token-match">${escaped}</span>`;
      } else if (currentType === 'delete') {
        html += `<span class="diff-token-delete" title="Omission / Baseline Element">[del: ${escaped}]</span>`;
      } else {
        html += `<span class="diff-token-insert" title="Syntactic Repair / Transformation">[ins: ${escaped}]</span>`;
      }
    };

    for (const token of tokens) {
      if (token.type === currentType) {
        currentVal += token.value;
      } else {
        flushChunk();
        currentType = token.type;
        currentVal = token.value;
      }
    }
    flushChunk();
    return html;
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private handleRate(cardId: string, rating: 'again' | 'good', cardLevel: number): void {
    const srsState = StorageManager.getCardState(cardId);
    const nextCardState = SRSEngine.rateCard(srsState, cardId, rating, cardLevel);
    StorageManager.setCardState(cardId, nextCardState);

    this.reviewCountInRun += 1;
    const streakEl = this.container.querySelector('.streak-counter');
    if (streakEl) {
      streakEl.textContent = `${this.reviewCountInRun} TRANSFORMATIONS`;
    }

    // Standard progression
    this.currentIndex = (this.currentIndex + 1) % this.currentList.length;

    // Check tier completion (e.g. reviewed full list)
    if (this.currentIndex === 0 && this.reviewCountInRun >= this.currentList.length) {
      AudioSynthesizer.play('level-up');
      if (this.onBatchComplete) {
        this.onBatchComplete();
        return;
      }
    }

    this.renderCurrentCard();
    const counter = this.container.querySelector('.card-counter');
    if (counter) {
      counter.textContent = `SYNTAX NODE [ ${this.currentIndex + 1} / ${Math.max(1, this.currentList.length)} ]`;
    }
  }

  public handleGlobalKey(key: string): boolean {
    if (key === 'ArrowRight' || key === 'l') {
      this.navigateCard(1);
      return true;
    }
    if (key === 'ArrowLeft' || key === 'h') {
      this.navigateCard(-1);
      return true;
    }
    if (this.currentCardHandle) {
      if (key === ' ') {
        this.currentCardHandle.flip();
        return true;
      }
      if (key === '1') {
        this.currentCardHandle.rate('again');
        return true;
      }
      if (key === '2') {
        this.currentCardHandle.rate('good');
        return true;
      }
    }
    return false;
  }
}
