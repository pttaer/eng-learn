import { AtomicCard } from '../core/atomic-card';
import { icon } from '../utils/icons';
import { SRSEngine } from '../core/srs-engine';
import { StorageManager } from '../utils/storage';
import { AudioSynthesizer } from '../core/audio-synthesizer';
import { computeDiffTokens, ProofreadDiffToken } from './writing-dossier';
import grammarData from '../assets/data/grammar.json';
import { Cefr, srsTier } from '../core/cefr';
import { levelsWithContent, defaultLevel, levelChipsHtml } from '../core/level-filter';
import { SkillTreeEngine } from '../core/skill-tree-engine';

export type GrammarMode = string;

const MODE_TABS: Record<string, string> = {
  INVERSION_EMPHASIS: 'Mode A: Inversion',
  SUBJUNCTIVE_UNREAL: 'Mode B: Subjunctive',
  CLAUSAL_CONDENSATION: 'Mode C: Condensation',
  SYNTACTIC_PRECISION: 'Mode D: Precision'
};

const MODE_TITLES: Record<string, string> = {
  INVERSION_EMPHASIS: 'MODE A: INVERSION & EMPHASIS',
  SUBJUNCTIVE_UNREAL: 'MODE B: SUBJUNCTIVE & UNREAL',
  CLAUSAL_CONDENSATION: 'MODE C: CLAUSAL CONDENSATION',
  SYNTACTIC_PRECISION: 'MODE D: SYNTACTIC PRECISION'
};

const prettyMode = (m: string) => m.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');

export interface GrammarItem {
  id: string;
  mode: GrammarMode;
  level: number; // legacy tier 1-3, superseded by cefrLevel
  cefrLevel: Cefr;
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
  private activeLevel: Cefr;
  private currentList: GrammarItem[] = [];
  private currentIndex: number = 0;
  private reviewCountInRun: number = 0;
  private currentCardHandle: any = null;
  public onBatchComplete?: () => void;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'dossier-workspace dossier-grammar interactive';
    this.allDeck = grammarData as GrammarItem[];
    this.activeLevel = defaultLevel(this.allDeck, StorageManager.getSkillLevel('grammar'));
    this.filterDeck();
    window.addEventListener('learner-level-change', () => {
      this.activeLevel = defaultLevel(this.allDeck, StorageManager.getSkillLevel('grammar'));
      this.filterDeck();
      if (this.container.isConnected) this.render();
    });
  }

  private modesAtLevel(): GrammarMode[] {
    return [...new Set(this.allDeck.filter(i => i.cefrLevel === this.activeLevel).map(i => i.mode))];
  }

  private filterDeck(): void {
    const modes = this.modesAtLevel();
    if (modes.length > 0 && !modes.includes(this.activeMode)) this.activeMode = modes[0];
    this.currentList = this.allDeck.filter(
      item => item.mode === this.activeMode && item.cefrLevel === this.activeLevel
    );
    this.currentIndex = 0;
  }

  public render(): HTMLElement {
    const modeTitles = MODE_TITLES;
    const modes = this.modesAtLevel();

    this.container.innerHTML = `
      <div class="dossier-control-bar">
        <div class="dossier-tabs grammar-mode-tabs">
          ${modes.map(m => `<button class="hud-btn mode-tab ${this.activeMode === m ? 'active' : ''}" data-mode="${m}">${MODE_TABS[m] || prettyMode(m)}</button>`).join('')}
        </div>

        <div class="grammar-level-selector">
          <span class="telemetry-label" style="margin-right: 8px;">LEVEL:</span>
          ${levelChipsHtml(levelsWithContent(this.allDeck), this.activeLevel)}
        </div>
      </div>

      <div class="vocab-telemetry-banner">
        <div class="telemetry-item">
          <span class="telemetry-label">SYNTACTIC DRILL RUN</span>
          <span class="telemetry-value streak-counter">${this.reviewCountInRun} TRANSFORMATIONS</span>
        </div>
        <div class="telemetry-item">
          <span class="telemetry-label">COGNITIVE LOAD FACTOR</span>
          <span class="telemetry-value">${this.activeLevel === 'C1' || this.activeLevel === 'C2' ? 'EF 2.30 (HIGH COGNITIVE)' : 'EF 2.50 (CANONICAL)'}</span>
        </div>
        <div class="telemetry-item">
          <span class="telemetry-label">SYNTAX CLASSIFIER</span>
          <span class="telemetry-value">${modeTitles[this.activeMode] || prettyMode(this.activeMode).toUpperCase()}</span>
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
        const newLevel = (tab as HTMLElement).dataset.cefr as Cefr;
        const order = levelsWithContent(this.allDeck);
        if (order.indexOf(newLevel) > order.indexOf(this.activeLevel)) {
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

    const categoryLabel = `${item.mode.replace('_', ' ')} [${item.cefrLevel}]`;

    // FRONT: Prompt sentence, Cue, Formula Bar, and Interactive Transformation Console (ENG-60)
    const frontEl = document.createElement('div');
    frontEl.className = 'grammar-front-content';
    frontEl.innerHTML = `
      <div class="card-prompt-label">SYNTACTIC TRANSFORMATION // ${item.title.toUpperCase()}</div>
      <div class="card-main-text" style="font-size: 16px; line-height: 1.62; font-weight: 500; max-width: 68ch; margin: 10px 0;">
        "${item.promptSentence}"
      </div>
      <div class="card-sub-text" style="font-family: var(--font-mono); font-size: 12px; margin-bottom: 8px;">
        CUE: ${item.grammaticalCue}
      </div>
      <div class="grammar-formula-bar" style="margin-bottom: 12px;">
        [ STEP-BY-STEP SYNTACTIC FORMULA ]: ${item.formula}
      </div>

      <!-- Interactive Syntactic Transformation Console (ENG-60) -->
      <div class="grammar-transform-console">
        <label for="grammar-transform-input" class="telemetry-label" style="display: block; margin-bottom: 6px;">
          [ ACTIVE SYNTACTIC TRANSFORMATION INPUT ]:
        </label>
        <div class="grammar-input-row">
          <input
            type="text"
            class="grammar-transform-input"
            id="grammar-transform-input"
            placeholder="Type transformed syntactic resolution (or press Space to flip)..."
            autocomplete="off"
            spellcheck="false"
            aria-label="Type transformed syntactic resolution"
          />
          <button type="button" class="hud-btn grammar-verify-btn" aria-label="Verify Transformation">
            ${icon('zap', 14)} [ Verify Transformation ]
          </button>
        </div>
        <div class="grammar-diff-feedback grammar-diff-preview" aria-live="polite"></div>
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
        this.handleRate(item.id, rating, srsTier(item.cefrLevel));
      }
    });

    slot.appendChild(this.currentCardHandle.element);

    // Interactive Syntactic Console Event Wiring (ENG-60)
    const transformInput = frontEl.querySelector('.grammar-transform-input') as HTMLInputElement | null;
    const verifyBtn = frontEl.querySelector('.grammar-verify-btn') as HTMLButtonElement | null;
    const diffFeedback = frontEl.querySelector('.grammar-diff-feedback') as HTMLElement | null;

    let lastKeystrokeTime = 0;
    transformInput?.addEventListener('input', () => {
      const now = performance.now();
      if (now - lastKeystrokeTime >= 35) {
        lastKeystrokeTime = now;
        AudioSynthesizer.play('keystroke');
      }
    });

    const runVerify = () => {
      if (!transformInput || !diffFeedback) return;
      const userText = transformInput.value.trim();
      const targetText = item.targetTransformation.trim();

      if (userText.length === 0) {
        diffFeedback.className = 'grammar-diff-feedback grammar-diff-preview match-mismatch';
        diffFeedback.innerHTML = `<span class="diff-token-delete" style="padding: 4px 8px;">Please enter a transformation before verifying.</span>`;
        AudioSynthesizer.play('alarm');
        transformInput.focus();
        return;
      }

      const diffTokens = computeDiffTokens(userText, targetText);
      let matchCount = 0;
      for (const token of diffTokens) {
        if (token.type === 'match') {
          matchCount += token.value.length;
        }
      }
      const maxLen = Math.max(targetText.length, userText.length);
      const accuracyPct = maxLen === 0 ? 100 : Math.round((matchCount / maxLen) * 100);
      const isCaseInsensitiveExact = userText.toLowerCase() === targetText.toLowerCase() ||
        userText.toLowerCase().replace(/[.,!?;:]$/, '') === targetText.toLowerCase().replace(/[.,!?;:]$/, '');
      const isSuccess = isCaseInsensitiveExact || accuracyPct >= 90;

      const diffHtml = this.formatInlineDiffHtml(diffTokens);

      if (isSuccess) {
        diffFeedback.className = 'grammar-diff-feedback grammar-diff-preview match-success';
        diffFeedback.innerHTML = `
          <div class="diff-result-header" style="color: var(--good); font-weight: 700; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
            ${icon('zap', 14)} SYNTACTIC RESOLUTION VERIFIED (${isCaseInsensitiveExact ? 100 : accuracyPct}% MATCH)
          </div>
          <div class="diff-tokens-stream">${diffHtml}</div>
        `;
        AudioSynthesizer.play('absorb');
        setTimeout(() => {
          if (this.currentCardHandle && !this.currentCardHandle.isFlipped()) {
            this.currentCardHandle.flip();
          }
        }, 750);
      } else {
        diffFeedback.className = 'grammar-diff-feedback grammar-diff-preview match-mismatch';
        diffFeedback.innerHTML = `
          <div class="diff-result-header" style="color: var(--warning); font-weight: 700; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
            SYNTACTIC MISMATCH (${accuracyPct}% MATCH) — REVIEW REPAIR TOKENS:
          </div>
          <div class="diff-tokens-stream">${diffHtml}</div>
        `;
        AudioSynthesizer.play('alarm');
      }
    };

    verifyBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      AudioSynthesizer.play('click');
      runVerify();
    });

    transformInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        runVerify();
      } else if (e.key === ' ' && transformInput.value.trim().length === 0) {
        e.preventDefault();
        e.stopPropagation();
        this.currentCardHandle?.flip();
      }
    });
  }

  public formatInlineDiffHtml(tokens: ProofreadDiffToken[]): string {
    return this.formatRepairDiffHtml(tokens);
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

    if (rating === 'good') {
      SkillTreeEngine.advanceBranchMastery('grammar', this.activeLevel, 5);
    }

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
      if (key === 'Enter') {
        const verifyBtn = this.container.querySelector('.grammar-verify-btn') as HTMLButtonElement | null;
        if (verifyBtn && (!this.currentCardHandle || !this.currentCardHandle.isFlipped())) {
          verifyBtn.click();
          return true;
        }
      }
    }
    return false;
  }
}
