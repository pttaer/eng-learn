/**
 * 12 Tenses Master Vault & Random Drill Engine
 * Dedicated module for mastering English tenses through timeline visualizers,
 * formula matrices, and randomized practice drills across 77+ questions.
 */

import { icon } from '../utils/icons';
import { AudioSynthesizer } from '../core/audio-synthesizer';
import { MotionEngine } from '../core/motion-engine';
import { ProgressionEngine } from '../core/progression-engine';
import tensesData from '../assets/data/tenses-bank.json';

export interface TenseMetadata {
  id: string;
  family: 'PRESENT' | 'PAST' | 'FUTURE';
  name: string;
  vietnameseName: string;
  formula: {
    affirmative: string;
    negative: string;
    interrogative: string;
  };
  signals: string[];
  coreUsage: string;
  commonPitfall: string;
  example: string;
}

export interface TenseQuestion {
  id: string;
  tenseId: string;
  tenseName: string;
  family: 'PRESENT' | 'PAST' | 'FUTURE';
  prompt: string;
  blankTarget: string;
  options: string[];
  answer: number;
  signal?: string;
  explanation: string;
  vietnameseExplanation: string;
  source?: string;
}

export type TensesViewMode = 'drill' | 'reference';

export class TensesDossier {
  private container: HTMLElement;
  private viewMode: TensesViewMode = 'drill';
  private activeFamily: 'ALL' | 'PRESENT' | 'PAST' | 'FUTURE' = 'ALL';
  private selectedTenseId: 'ALL' | string = 'ALL';
  
  private allQuestions: TenseQuestion[] = [];
  private currentPool: TenseQuestion[] = [];
  private currentQuestion: TenseQuestion | null = null;
  private currentShuffledOptions: string[] = [];
  private currentCorrectIndex: number = 0;
  
  private hasAnswered: boolean = false;
  private selectedChoiceIndex: number = -1;
  private isCorrect: boolean = false;
  
  private score: number = 0;
  private streak: number = 0;
  private totalAttempted: number = 0;

  public onNavigateBackToGrammar?: () => void;
  public onBatchComplete?: () => void;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'dossier-workspace dossier-tenses interactive';
    this.allQuestions = (tensesData as any).questions || [];
    this.filterPool();
    this.pickNextRandomQuestion();
  }

  private filterPool(): void {
    let pool = this.allQuestions;
    if (this.activeFamily !== 'ALL') {
      pool = pool.filter(q => q.family === this.activeFamily);
    }
    if (this.selectedTenseId !== 'ALL') {
      pool = pool.filter(q => q.tenseId === this.selectedTenseId);
    }
    this.currentPool = pool.length > 0 ? pool : this.allQuestions;
  }

  private pickNextRandomQuestion(): void {
    if (this.currentPool.length === 0) return;
    const randomIndex = Math.floor(Math.random() * this.currentPool.length);
    this.currentQuestion = this.currentPool[randomIndex];
    
    // Shuffle options while tracking the correct index
    const q = this.currentQuestion;
    const indexedOptions = q.options.map((opt, idx) => ({ opt, isCorrect: idx === q.answer }));
    
    // Fisher-Yates shuffle
    for (let i = indexedOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indexedOptions[i], indexedOptions[j]] = [indexedOptions[j], indexedOptions[i]];
    }

    this.currentShuffledOptions = indexedOptions.map(x => x.opt);
    this.currentCorrectIndex = indexedOptions.findIndex(x => x.isCorrect);
    if (this.currentCorrectIndex === -1) this.currentCorrectIndex = 0;

    this.hasAnswered = false;
    this.selectedChoiceIndex = -1;
    this.isCorrect = false;
  }

  public render(): HTMLElement {
    const totalTenses = (tensesData as any).tenses.length;
    const totalQuestions = this.allQuestions.length;

    this.container.innerHTML = `
      <div class="tenses-mode-header">
        <div class="view-mode-toggle">
          <button class="hud-btn view-toggle-btn ${this.viewMode === 'drill' ? 'active' : ''}" data-view="drill">
            ${icon('zap')} 🎲 Random Tense Drill (${this.currentPool.length}/${totalQuestions} Qs)
          </button>
          <button class="hud-btn view-toggle-btn ${this.viewMode === 'reference' ? 'active' : ''}" data-view="reference">
            ${icon('book')} ✦ 12 Tenses Codex (${totalTenses} Formulas)
          </button>
        </div>

        <div class="tenses-top-actions">
          <button class="hud-btn btn-switch-grammar" style="border-color: var(--cyan, #38bdf8); color: var(--cyan, #38bdf8);">
            ${icon('arrowLeft')} Advanced Syntax (B2–C2)
          </button>
        </div>
      </div>

      <div class="dossier-control-bar tenses-control-bar">
        <div class="dossier-tabs tenses-family-tabs">
          <button class="hud-btn filter-tab ${this.activeFamily === 'ALL' ? 'active' : ''}" data-family="ALL">All 12 Tenses</button>
          <button class="hud-btn filter-tab ${this.activeFamily === 'PRESENT' ? 'active' : ''}" data-family="PRESENT">Present (4)</button>
          <button class="hud-btn filter-tab ${this.activeFamily === 'PAST' ? 'active' : ''}" data-family="PAST">Past (4)</button>
          <button class="hud-btn filter-tab ${this.activeFamily === 'FUTURE' ? 'active' : ''}" data-family="FUTURE">Future (4)</button>
        </div>

        <div class="tenses-dropdown-selector">
          <label for="tense-select" class="telemetry-label" style="margin-right: 8px;">FILTER TENSE:</label>
          <select id="tense-select" class="tenses-select-input">
            <option value="ALL" ${this.selectedTenseId === 'ALL' ? 'selected' : ''}>-- All Tenses in Family --</option>
            ${(tensesData as any).tenses
              .filter((t: TenseMetadata) => this.activeFamily === 'ALL' || t.family === this.activeFamily)
              .map((t: TenseMetadata) => `<option value="${t.id}" ${this.selectedTenseId === t.id ? 'selected' : ''}>${t.name} (${t.vietnameseName})</option>`)
              .join('')}
          </select>
        </div>
      </div>

      <div class="tenses-telemetry-cluster">
        <div class="telemetry-item">
          <span class="telemetry-label">DRILL SCORE</span>
          <span class="telemetry-value" style="color: var(--accent-gold); font-weight: 700;">${this.score} / ${this.totalAttempted}</span>
        </div>
        <div class="telemetry-item">
          <span class="telemetry-label">HOT STREAK</span>
          <span class="telemetry-value" style="color: var(--good); font-weight: 700;">${icon('flame', 12)} ${this.streak} IN A ROW</span>
        </div>
        <div class="telemetry-item">
          <span class="telemetry-label">POOL COVERAGE</span>
          <span class="telemetry-value">${this.currentPool.length} QUESTIONS ACTIVE</span>
        </div>
      </div>

      <div class="tenses-main-stage">
        ${this.viewMode === 'drill' ? this.renderDrillView() : this.renderReferenceView()}
      </div>
    `;

    this.bindEvents();
    if (this.viewMode === 'drill') {
      MotionEngine.riseIn(this.container.querySelectorAll('.tenses-card-question, .tenses-choice-btn'), 10);
    } else {
      MotionEngine.riseIn(this.container.querySelectorAll('.tense-codex-card'), 8);
    }

    return this.container;
  }

  private renderDrillView(): string {
    const q = this.currentQuestion;
    if (!q) {
      return `
        <div class="empty-state-notice">
          <div class="telemetry-label">Zero questions available</div>
          <p>No questions found in this tense filter. Please choose another family.</p>
        </div>
      `;
    }

    const tenseMeta = (tensesData as any).tenses.find((t: TenseMetadata) => t.id === q.tenseId);
    const vnName = tenseMeta ? tenseMeta.vietnameseName : '';

    return `
      <div class="tenses-drill-container">
        <div class="tenses-card-question">
          <div class="tenses-badge-row">
            <span class="hud-badge tense-family-badge family-${q.family.toLowerCase()}">${q.family}</span>
            <span class="telemetry-value tense-title-tag">${q.tenseName} ${vnName ? `// ${vnName}` : ''}</span>
          </div>

          <div class="tenses-prompt-sentence">
            ${this.formatPromptWithBlank(q.prompt)}
          </div>

          ${q.signal ? `
            <div class="tenses-signal-pill">
              <span class="telemetry-label" style="color: var(--accent-gold);">${icon('target', 12)} KEYWORD SIGNAL:</span>
              <strong style="color: var(--ink-primary);">${this.escapeHtml(q.signal)}</strong>
            </div>
          ` : ''}

          <div class="tenses-choices-grid" role="group" aria-label="Select the correct verb form">
            ${this.currentShuffledOptions.map((opt, idx) => {
              let choiceClass = 'tenses-choice-btn';
              let statusIcon = '';
              if (this.hasAnswered) {
                if (idx === this.currentCorrectIndex) {
                  choiceClass += ' choice-correct';
                  statusIcon = ' ✓';
                } else if (idx === this.selectedChoiceIndex) {
                  choiceClass += ' choice-wrong';
                  statusIcon = ' ✗';
                } else {
                  choiceClass += ' choice-disabled';
                }
              }
              return `
                <button type="button" class="hud-btn ${choiceClass}" data-idx="${idx}" ${this.hasAnswered ? 'disabled' : ''}>
                  <span class="choice-letter">${String.fromCharCode(65 + idx)}.</span>
                  <span class="choice-text">${this.escapeHtml(opt)}</span>
                  <span class="choice-feedback-icon">${statusIcon}</span>
                </button>
              `;
            }).join('')}
          </div>

          ${this.hasAnswered ? `
            <div class="tenses-explanation-drawer ${this.isCorrect ? 'result-success' : 'result-failure'}">
              <div class="explanation-header">
                <strong>${this.isCorrect ? '✓ CHÍNH XÁC / WELL DONE!' : '✗ CHƯA ĐÚNG / INCORRECT'}</strong>
                <span class="correct-answer-callout">Đáp án đúng: <u>${this.escapeHtml(this.currentShuffledOptions[this.currentCorrectIndex])}</u></span>
              </div>
              <div class="explanation-body">
                <p class="explanation-en"><strong>Grammar Rule:</strong> ${this.escapeHtml(q.explanation)}</p>
                ${q.vietnameseExplanation ? `
                  <p class="explanation-vn"><strong>Giải thích tiếng Việt:</strong> ${this.escapeHtml(q.vietnameseExplanation)}</p>
                ` : ''}
              </div>
              <div class="explanation-actions">
                <button class="hud-btn btn-next-random-question" style="background: var(--accent-gold); color: var(--bg-canvas); font-weight: 700; padding: 10px 20px;">
                  🎲 RANDOM NEXT QUESTION (Enter / Space)
                </button>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  private renderReferenceView(): string {
    const tenses = (tensesData as any).tenses.filter((t: TenseMetadata) =>
      this.activeFamily === 'ALL' || t.family === this.activeFamily
    );

    return `
      <div class="tenses-reference-grid">
        ${tenses.map((t: TenseMetadata) => `
          <div class="tense-codex-card" data-tense="${t.id}">
            <div class="codex-header">
              <div class="codex-title-wrap">
                <span class="hud-badge family-${t.family.toLowerCase()}">${t.family}</span>
                <h3 class="codex-name">${t.name}</h3>
                <span class="codex-vn-name">${t.vietnameseName}</span>
              </div>
              <button class="hud-btn btn-drill-this-tense" data-tense="${t.id}" title="Drill questions for this tense">
                🎲 Drill
              </button>
            </div>

            <div class="codex-formula-box">
              <div class="telemetry-label" style="margin-bottom: 4px;">SYNTACTIC FORMULA:</div>
              <div class="formula-line"><span class="formula-type">[ + ]</span> ${this.escapeHtml(t.formula.affirmative)}</div>
              <div class="formula-line"><span class="formula-type">[ - ]</span> ${this.escapeHtml(t.formula.negative)}</div>
              <div class="formula-line"><span class="formula-type">[ ? ]</span> ${this.escapeHtml(t.formula.interrogative)}</div>
            </div>

            <div class="codex-section">
              <div class="telemetry-label">SIGNALS / DẤU HIỆU NHẬN BIẾT:</div>
              <div class="signal-tags-wrap">
                ${t.signals.map(s => `<span class="signal-tag">${this.escapeHtml(s)}</span>`).join('')}
              </div>
            </div>

            <div class="codex-section">
              <div class="telemetry-label">CORE USAGE // CÁCH DÙNG:</div>
              <p class="codex-text">${this.escapeHtml(t.coreUsage)}</p>
            </div>

            <div class="codex-section pitfall-section">
              <div class="telemetry-label" style="color: var(--alarm, #ef4444);">LỖI SAI KINH ĐIỂN // PITFALL:</div>
              <p class="codex-text">${this.escapeHtml(t.commonPitfall)}</p>
            </div>

            <div class="codex-example-box">
              <div class="telemetry-label">EXEMPLAR:</div>
              <div class="example-quote">“${this.escapeHtml(t.example)}”</div>
              <button class="hud-btn btn-speak-example" data-text="${this.escapeHtml(t.example)}" title="Listen to pronunciation" aria-label="Listen to example">
                ${icon('volume', 14)}
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  private formatPromptWithBlank(prompt: string): string {
    return this.escapeHtml(prompt).replace(
      /_{3,}/g,
      '<span class="tenses-blank-marker">[ &nbsp; ? &nbsp; ]</span>'
    );
  }

  private handleChoice(idx: number): void {
    if (this.hasAnswered) return;
    this.hasAnswered = true;
    this.selectedChoiceIndex = idx;
    this.isCorrect = (idx === this.currentCorrectIndex);
    this.totalAttempted++;

    if (this.isCorrect) {
      this.score++;
      this.streak++;
      AudioSynthesizer.play('absorb');
      ProgressionEngine.addXP(15);
    } else {
      this.streak = 0;
      AudioSynthesizer.play('alarm');
    }

    this.render();
  }

  private bindEvents(): void {
    // Mode toggle
    this.container.querySelectorAll('.view-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = (btn as HTMLElement).dataset.view as TensesViewMode;
        if (mode && mode !== this.viewMode) {
          this.viewMode = mode;
          AudioSynthesizer.play('click');
          this.render();
        }
      });
    });

    // Back to Advanced Syntax Grammar button
    this.container.querySelector('.btn-switch-grammar')?.addEventListener('click', () => {
      if (this.onNavigateBackToGrammar) {
        this.onNavigateBackToGrammar();
      } else {
        window.location.hash = '#grammar';
      }
    });

    // Family filter tabs
    this.container.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const family = (tab as HTMLElement).dataset.family as any;
        if (family && family !== this.activeFamily) {
          this.activeFamily = family;
          this.selectedTenseId = 'ALL';
          AudioSynthesizer.play('click');
          this.filterPool();
          this.pickNextRandomQuestion();
          this.render();
        }
      });
    });

    // Dropdown tense selector
    const tenseSelect = this.container.querySelector('#tense-select') as HTMLSelectElement;
    tenseSelect?.addEventListener('change', () => {
      this.selectedTenseId = tenseSelect.value;
      AudioSynthesizer.play('click');
      this.filterPool();
      this.pickNextRandomQuestion();
      this.render();
    });

    // Drill choice buttons
    if (this.viewMode === 'drill') {
      this.container.querySelectorAll('.tenses-choice-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = Number((btn as HTMLElement).dataset.idx);
          this.handleChoice(idx);
        });
      });

      // Next question button
      this.container.querySelector('.btn-next-random-question')?.addEventListener('click', () => {
        AudioSynthesizer.play('click');
        this.pickNextRandomQuestion();
        this.render();
      });
    }

    // Codex reference mode events
    if (this.viewMode === 'reference') {
      this.container.querySelectorAll('.btn-drill-this-tense').forEach(btn => {
        btn.addEventListener('click', () => {
          const tenseId = (btn as HTMLElement).dataset.tense;
          if (tenseId) {
            this.selectedTenseId = tenseId;
            this.viewMode = 'drill';
            AudioSynthesizer.play('click');
            this.filterPool();
            this.pickNextRandomQuestion();
            this.render();
          }
        });
      });

      this.container.querySelectorAll('.btn-speak-example').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const text = (btn as HTMLElement).dataset.text;
          if (text) AudioSynthesizer.speak(text);
        });
      });
    }
  }

  public handleGlobalKey(key: string): boolean {
    if (this.viewMode === 'drill') {
      if (!this.hasAnswered) {
        const num = Number(key);
        if (num >= 1 && num <= this.currentShuffledOptions.length) {
          this.handleChoice(num - 1);
          return true;
        }
      } else {
        if (key === 'Enter' || key === ' ') {
          this.pickNextRandomQuestion();
          this.render();
          return true;
        }
      }
    }
    return false;
  }

  private escapeHtml(str: string): string {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  public teardown(): void {
    // Clean up timers or audio handles if needed
  }
}
