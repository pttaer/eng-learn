/**
 * 12 Tenses Master Vault, Random Drill Engine & 12-Tense Gauntlet Challenge
 * Dedicated module for mastering English tenses through timeline visualizers,
 * formula matrices, randomized practice drills across 102+ questions, and
 * a 12-question diagnostic gauntlet covering every single tense.
 */

import { icon } from '../utils/icons';
import { AudioSynthesizer } from '../core/audio-synthesizer';
import { MotionEngine } from '../core/motion-engine';
import { ProgressionEngine } from '../core/progression-engine';
import { ScrollAffordance } from '../core/scroll-affordance';
import tensesData from '../assets/data/tenses-bank.json';
import { t } from '../core/i18n';

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

export type TensesViewMode = 'drill' | 'reference' | 'gauntlet';

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

  // 12-Tense Gauntlet Challenge State
  private gauntletQuestions: TenseQuestion[] = [];
  private gauntletIndex: number = 0;
  private gauntletResults: Array<{ tenseId: string; tenseName: string; isCorrect: boolean }> = [];
  private gauntletCompleted: boolean = false;

  public onNavigateBackToGrammar?: () => void;
  public onBatchComplete?: () => void;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'dossier-workspace dossier-tenses interactive';
    this.allQuestions = (tensesData as any).questions || [];
    this.filterPool();
    this.pickNextRandomQuestion();
    window.addEventListener('eng:locale-changed', () => {
      if (this.container.isConnected) this.render();
    });
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
    this.setupQuestion(this.currentQuestion);
  }

  private setupQuestion(q: TenseQuestion): void {
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

  public startGauntlet(): void {
    const tenses: TenseMetadata[] = (tensesData as any).tenses;
    const questions: TenseQuestion[] = [];

    // Select exactly 1 question for each of the 12 tenses
    tenses.forEach(t => {
      const matching = this.allQuestions.filter(q => q.tenseId === t.id);
      if (matching.length > 0) {
        const picked = matching[Math.floor(Math.random() * matching.length)];
        questions.push(picked);
      }
    });

    this.gauntletQuestions = questions;
    this.gauntletIndex = 0;
    this.gauntletResults = [];
    this.gauntletCompleted = false;
    this.viewMode = 'gauntlet';

    if (this.gauntletQuestions.length > 0) {
      this.currentQuestion = this.gauntletQuestions[0];
      this.setupQuestion(this.currentQuestion);
    }
  }

  public render(): HTMLElement {
    this.container.innerHTML = `
      <div class="tenses-mode-header">
        <div class="view-mode-toggle">
          <button class="hud-btn view-toggle-btn ${this.viewMode === 'drill' ? 'active' : ''}" data-view="drill" style="white-space: nowrap;">
            ${icon('dice', 13)} ${t('tenses.random_drill', { count: this.currentPool.length })}
          </button>
          <button class="hud-btn view-toggle-btn ${this.viewMode === 'gauntlet' ? 'active' : ''}" data-view="gauntlet" data-mode="gauntlet" style="white-space: nowrap;">
            ${icon('target', 13)} ${t('tenses.gauntlet')}
          </button>
          <button class="hud-btn view-toggle-btn ${this.viewMode === 'reference' ? 'active' : ''}" data-view="reference" data-mode="codex" style="white-space: nowrap;">
            ${icon('book', 13)} ${t('tenses.codex')}
          </button>
        </div>

        <div class="tenses-top-actions">
          <button class="hud-btn btn-switch-grammar" style="border: none !important; background: transparent !important; box-shadow: none !important; color: var(--cyan, #38bdf8); padding: 4px 6px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
            <span style="font-size: 14px; font-weight: 700;">&lt;</span> ${t('tenses.advanced_syntax')}
          </button>
        </div>
      </div>

      ${this.viewMode !== 'gauntlet' ? `
        <div class="dossier-control-bar tenses-control-bar">
          <div class="dossier-tabs tenses-family-tabs">
            <button class="hud-btn filter-tab ${this.activeFamily === 'ALL' ? 'active' : ''}" data-family="ALL">${t('tenses.all_tenses')}</button>
            <button class="hud-btn filter-tab ${this.activeFamily === 'PRESENT' ? 'active' : ''}" data-family="PRESENT">${t('tenses.present')}</button>
            <button class="hud-btn filter-tab ${this.activeFamily === 'PAST' ? 'active' : ''}" data-family="PAST">${t('tenses.past')}</button>
            <button class="hud-btn filter-tab ${this.activeFamily === 'FUTURE' ? 'active' : ''}" data-family="FUTURE">${t('tenses.future')}</button>
          </div>

          <div class="tenses-dropdown-selector">
            <label for="tense-select" class="telemetry-label" style="margin-right: 8px;">${t('tenses.filter_tense')}</label>
            <select id="tense-select" class="tenses-select-input">
              <option value="ALL" ${this.selectedTenseId === 'ALL' ? 'selected' : ''}>${t('tenses.all_in_family')}</option>
              ${(tensesData as any).tenses
                .filter((t: TenseMetadata) => this.activeFamily === 'ALL' || t.family === this.activeFamily)
                .map((t: TenseMetadata) => `<option value="${t.id}" ${this.selectedTenseId === t.id ? 'selected' : ''}>${t.name} (${t.vietnameseName})</option>`)
                .join('')}
            </select>
          </div>
        </div>

        ${this.viewMode === 'drill' ? `
          <div class="tenses-telemetry-cluster">
            <div class="telemetry-item">
              <span class="telemetry-label">${t('tenses.drill_accuracy')}</span>
              <span class="telemetry-value" style="color: var(--accent-gold); font-weight: 700;">${this.score} / ${this.totalAttempted} (${this.totalAttempted > 0 ? Math.round((this.score / this.totalAttempted) * 100) : 0}%)</span>
            </div>
            <div class="telemetry-item">
              <span class="telemetry-label">${t('tenses.hot_streak')}</span>
              <span class="telemetry-value" style="color: var(--good); font-weight: 700;">${icon('flame', 12)} ${t('tenses.streak_in_row', { count: this.streak })}</span>
            </div>
            <div class="telemetry-item">
              <span class="telemetry-label">${t('tenses.active_pool')}</span>
              <span class="telemetry-value">${t('tenses.questions_count', { count: this.currentPool.length })}</span>
            </div>
          </div>
        ` : ''}
      ` : ''}

      <div class="tenses-main-stage">
        ${this.viewMode === 'drill' ? this.renderDrillView() : this.viewMode === 'gauntlet' ? this.renderGauntletView() : this.renderReferenceView()}
      </div>
    `;

    this.bindEvents();
    if (this.viewMode === 'drill' || this.viewMode === 'gauntlet') {
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
          <p>${t('tenses.zero_questions')}</p>
        </div>
      `;
    }

    const tenseMeta = (tensesData as any).tenses.find((t: TenseMetadata) => t.id === q.tenseId);
    const vnName = tenseMeta ? tenseMeta.vietnameseName : '';
    const spokenText = q.prompt.replace(/_{3,}/g, q.blankTarget);

    return `
      <div class="tenses-drill-container">
        <div class="tenses-card-question">
          <div class="tenses-badge-row">
            <span class="hud-badge tense-family-badge family-${q.family.toLowerCase()}">${q.family}</span>
            <span class="telemetry-value tense-title-tag" title="${this.escapeHtml(q.tenseName + (vnName ? ' // ' + vnName : ''))}"><span class="tense-en-title">${q.tenseName}</span>${vnName ? ` <span class="tense-vn-title">// ${vnName}</span>` : ''}</span>
            <button type="button" class="hud-btn btn-speak-prompt" data-text="${this.escapeHtml(spokenText)}" title="Listen to complete sentence audio" aria-label="Listen to sentence">
              ${icon('volume', 14)} ${t('action.pronounce')}
            </button>
          </div>

          <div class="tenses-prompt-sentence">
            ${this.formatPromptWithBlank(q.prompt)}
          </div>

          ${q.signal ? `
            <div class="tenses-signal-pill">
              <span class="telemetry-label" style="color: var(--accent-gold);">${icon('target', 12)} ${t('feedback.keyword_signal')}:</span>
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
                <strong>${this.isCorrect ? '✓ ' + t('feedback.correct') : '✗ ' + t('feedback.try_again')}</strong>
                <span class="correct-answer-callout">${t('action.show_answer')}: <u>${this.escapeHtml(this.currentShuffledOptions[this.currentCorrectIndex])}</u></span>
              </div>
              <div class="explanation-body">
                <p class="explanation-en"><strong>Grammar Rule:</strong> ${this.escapeHtml(q.explanation)}</p>
                ${q.vietnameseExplanation ? `
                  <p class="explanation-vn"><strong>${t('feedback.vietnamese_translation')}:</strong> ${this.escapeHtml(q.vietnameseExplanation)}</p>
                ` : ''}
              </div>
              <div class="explanation-actions">
                <button class="hud-btn btn-next-random-question" style="background: var(--accent-gold); color: var(--bg-canvas); font-weight: 700; padding: 10px 20px;">
                  ${icon('dice', 14)} ${t('action.next')} (Enter / Space)
                </button>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  private renderGauntletView(): string {
    if (this.gauntletCompleted) {
      return this.renderGauntletScorecard();
    }

    const q = this.currentQuestion;
    if (!q) {
      return `
        <div class="empty-state-notice">
          <p>No questions initialized for Gauntlet Challenge.</p>
          <button class="hud-btn btn-start-gauntlet" style="margin-top: 12px; font-weight: 700;">${t('tenses.btn_start_gauntlet', undefined, 'Start Gauntlet Challenge')}</button>
        </div>
      `;
    }

    const progressPct = Math.round((this.gauntletIndex / 12) * 100);
    const spokenText = q.prompt.replace(/_{3,}/g, q.blankTarget);

    return `
      <div class="tenses-drill-container">
        <div class="tenses-card-question">
          <!-- Gauntlet Header & Progress Bar -->
          <div class="gauntlet-progress-cluster">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; gap: 8px;">
              <span class="telemetry-label" style="font-weight: 700; color: var(--accent-gold); display: flex; align-items: center; gap: 6px;">${icon('target', 14)} Question ${this.gauntletIndex + 1} of 12</span>
              <span class="telemetry-value" style="white-space: nowrap; font-weight: 600;">${progressPct}% complete</span>
            </div>
            <div class="gauntlet-progress-track" style="height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden;">
              <div class="gauntlet-progress-fill" style="width: ${progressPct}%; height: 100%; background: var(--accent-gold); transition: width 0.3s ease;"></div>
            </div>
          </div>

          <div class="tenses-badge-row">
            <span class="hud-badge tense-family-badge family-${q.family.toLowerCase()}">${q.family}</span>
            <span class="telemetry-value tense-title-tag">${q.tenseName}</span>
            <button type="button" class="hud-btn btn-speak-prompt" data-text="${this.escapeHtml(spokenText)}" title="Listen to complete sentence audio" aria-label="Listen to sentence">
              ${icon('volume', 14)} Pronounce
            </button>
          </div>

          <div class="tenses-prompt-sentence">
            ${this.formatPromptWithBlank(q.prompt)}
          </div>

          ${q.signal ? `
            <div class="tenses-signal-pill">
              <span class="telemetry-label" style="color: var(--accent-gold);">${icon('target', 12)} Keyword signal:</span>
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
                <strong>${this.isCorrect ? t('tenses.feedback_correct', undefined, '✓ CHÍNH XÁC / WELL DONE!') : t('tenses.feedback_incorrect', undefined, '✗ CHƯA ĐÚNG / INCORRECT')}</strong>
                <span class="correct-answer-callout">${t('tenses.correct_ans_label', undefined, 'Đáp án đúng:')} <u>${this.escapeHtml(this.currentShuffledOptions[this.currentCorrectIndex])}</u></span>
              </div>
              <div class="explanation-body">
                <p class="explanation-en"><strong>Grammar Rule:</strong> ${this.escapeHtml(q.explanation)}</p>
                ${q.vietnameseExplanation ? `
                  <p class="explanation-vn"><strong>Giải thích tiếng Việt:</strong> ${this.escapeHtml(q.vietnameseExplanation)}</p>
                ` : ''}
              </div>
              <div class="explanation-actions">
                <button class="hud-btn btn-next-gauntlet-question" style="background: var(--accent-gold); color: var(--bg-canvas); font-weight: 700; padding: 10px 20px;">
                  ${this.gauntletIndex < 11 ? t('tenses.btn_next_q', { next: this.gauntletIndex + 2, total: 12 }, `NEXT QUESTION (${this.gauntletIndex + 2}/12) →`) : t('tenses.btn_finish_scorecard', undefined, 'FINISH & VIEW SCORECARD') + ' ' + icon('target', 14)}
                </button>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  private renderGauntletScorecard(): string {
    const total = 12;
    const correctCount = this.gauntletResults.filter(r => r.isCorrect).length;
    const scorePct = Math.round((correctCount / total) * 100);

    let gradeTitle = t('tenses.grade_c1_title', undefined, 'C1/C2 NATIVE TENSE MASTERY');
    let gradeComment = scorePct === 100
      ? t('tenses.grade_c1_comment', undefined, 'Khả năng chia động từ và phân tích ngữ cảnh thời gian của bạn đạt độ chuẩn xác tuyệt đối 100%!')
      : t('tenses.grade_c1_near_comment', undefined, 'Khả năng phân tích thì và ngữ cảnh thời gian rất xuất sắc, gần như bản xứ! Chỉ cần lưu ý thêm một vài trường hợp ngoại lệ nhỏ.');
    let gradeColor = 'var(--good, #22c55e)';

    if (scorePct < 60) {
      gradeTitle = t('tenses.grade_foundation_title', undefined, 'FOUNDATION REVIEW REQUIRED');
      gradeComment = t('tenses.grade_foundation_comment', undefined, 'Bạn cần ôn lại công thức và các dấu hiệu nhận biết của các thì cơ bản trong 12 Tenses Codex.');
      gradeColor = 'var(--alarm, #ef4444)';
    } else if (scorePct < 85) {
      gradeTitle = t('tenses.grade_b2_title', undefined, 'B2 UPPER-INTERMEDIATE');
      gradeComment = t('tenses.grade_b2_comment', undefined, 'Nền tảng khá vững vàng, tuy nhiên bạn cần lưu ý kỹ các thì hoàn thành tiếp diễn và mốc thời gian quá khứ.');
      gradeColor = 'var(--accent-gold, #ca8a04)';
    }

    return `
      <div class="gauntlet-scorecard-wrap" style="width: 100%; max-width: 820px; margin: 0 auto;">
        <div class="tenses-card-question" style="text-align: center; gap: 20px;">
          <div class="telemetry-label" style="font-size: var(--font-h4); color: var(--accent-gold); display: flex; align-items: center; justify-content: center; gap: 8px;">
            ${icon('target', 16)} ${t('tenses.receipt_title', undefined, '12-TENSE GAUNTLET DIAGNOSTIC RECEIPT')}
          </div>

          <div style="font-size: var(--font-h1); font-weight: 800; color: ${gradeColor}; font-family: var(--font-mono);">
            ${correctCount} / ${total} <span style="font-size: var(--font-h1); color: var(--ink-secondary);">(${scorePct}%)</span>
          </div>

          <div style="font-size: var(--font-h3); font-weight: 700; color: var(--ink-primary);">
            ${gradeTitle}
          </div>

          <p style="font-size: var(--font-h4); line-height: 1.6; color: var(--ink-secondary); max-width: 60ch; margin: 0 auto;">
            ${gradeComment}
          </p>

          <div class="gauntlet-matrix-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; text-align: left; margin: 12px 0;">
            ${this.gauntletResults.map(r => `
              <div class="matrix-item ${r.isCorrect ? 'matrix-correct' : 'matrix-wrong'}" style="padding: 10px; border-radius: 6px; border: 1px solid ${r.isCorrect ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}; background: ${r.isCorrect ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)'}; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: var(--font-body-compact); font-weight: 600; color: var(--ink-primary);">${this.escapeHtml(r.tenseName)}</span>
                <span style="font-weight: 700; color: ${r.isCorrect ? '#22c55e' : '#ef4444'};">${r.isCorrect ? '✓' : '✗'}</span>
              </div>
            `).join('')}
          </div>

          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <button class="hud-btn btn-restart-gauntlet" style="background: var(--accent-gold); color: var(--bg-canvas); font-weight: 700; padding: 12px 24px; display: inline-flex; align-items: center; gap: 8px;">
              ${icon('target', 14)} ${t('tenses.retake_gauntlet', undefined, 'RE-TAKE 12-TENSE GAUNTLET')}
            </button>
            <button class="hud-btn btn-go-codex" style="padding: 12px 24px; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;">
              ${icon('sparkles', 14)} ${t('tenses.view_codex', undefined, 'VIEW 12 TENSES CODEX')}
            </button>
            <button class="hud-btn btn-go-drill" style="padding: 12px 24px; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;">
              ${icon('dice', 14)} ${t('tenses.free_drill', undefined, 'FREE RANDOM DRILL')}
            </button>
          </div>
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
                <span class="hud-badge tense-family-badge family-${t.family.toLowerCase()}">${t.family}</span>
                <h3 class="codex-name">${t.name}</h3>
                <span class="codex-vn-name">${t.vietnameseName}</span>
              </div>
              <button class="hud-btn btn-drill-this-tense" data-tense="${t.id}" title="Drill questions for this tense" style="display: inline-flex; align-items: center; gap: 6px;">
                ${icon('dice', 12)} Drill
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

    if (this.viewMode === 'gauntlet') {
      if (this.currentQuestion) {
        this.gauntletResults.push({
          tenseId: this.currentQuestion.tenseId,
          tenseName: this.currentQuestion.tenseName,
          isCorrect: this.isCorrect
        });
      }
    }

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

  private advanceGauntlet(): void {
    this.gauntletIndex++;
    if (this.gauntletIndex >= this.gauntletQuestions.length) {
      this.gauntletCompleted = true;
      AudioSynthesizer.play('level-up');
      ProgressionEngine.addXP(100);
      if (this.onBatchComplete) this.onBatchComplete();
    } else {
      this.currentQuestion = this.gauntletQuestions[this.gauntletIndex];
      this.setupQuestion(this.currentQuestion);
    }
    this.render();
  }

  private bindEvents(): void {
    ScrollAffordance.scan(this.container);

    // Mode toggle
    this.container.querySelectorAll('.view-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = (btn as HTMLElement).dataset.view as TensesViewMode;
        if (mode === 'gauntlet') {
          AudioSynthesizer.play('click');
          this.startGauntlet();
          this.render();
        } else if (mode && mode !== this.viewMode) {
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

    // Speak Prompt button
    this.container.querySelectorAll('.btn-speak-prompt').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = (btn as HTMLElement).dataset.text;
        if (text) AudioSynthesizer.speak(text);
      });
    });

    // Drill & Gauntlet choice buttons
    if (this.viewMode === 'drill' || this.viewMode === 'gauntlet') {
      this.container.querySelectorAll('.tenses-choice-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = Number((btn as HTMLElement).dataset.idx);
          this.handleChoice(idx);
        });
      });

      // Next random question button
      this.container.querySelector('.btn-next-random-question')?.addEventListener('click', () => {
        AudioSynthesizer.play('click');
        this.pickNextRandomQuestion();
        this.render();
      });

      // Next gauntlet question button
      this.container.querySelector('.btn-next-gauntlet-question')?.addEventListener('click', () => {
        AudioSynthesizer.play('click');
        this.advanceGauntlet();
      });
    }

    // Gauntlet Scorecard actions
    if (this.viewMode === 'gauntlet' && this.gauntletCompleted) {
      this.container.querySelector('.btn-restart-gauntlet')?.addEventListener('click', () => {
        AudioSynthesizer.play('click');
        this.startGauntlet();
        this.render();
      });

      this.container.querySelector('.btn-go-codex')?.addEventListener('click', () => {
        AudioSynthesizer.play('click');
        this.viewMode = 'reference';
        this.render();
      });

      this.container.querySelector('.btn-go-drill')?.addEventListener('click', () => {
        AudioSynthesizer.play('click');
        this.viewMode = 'drill';
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
    if (this.viewMode === 'drill' || this.viewMode === 'gauntlet') {
      if (!this.hasAnswered) {
        const num = Number(key);
        if (num >= 1 && num <= this.currentShuffledOptions.length) {
          this.handleChoice(num - 1);
          return true;
        }
      } else {
        if (key === 'Enter' || key === ' ') {
          if (this.viewMode === 'gauntlet') {
            this.advanceGauntlet();
          } else {
            this.pickNextRandomQuestion();
            this.render();
          }
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
    // Clean up handles if needed
  }

  public showSampleScorecard(): void {
    this.viewMode = 'gauntlet';
    this.gauntletCompleted = true;
    this.gauntletResults = [
      { tenseId: 't1', tenseName: 'Present Simple', isCorrect: true },
      { tenseId: 't2', tenseName: 'Present Continuous', isCorrect: true },
      { tenseId: 't3', tenseName: 'Present Perfect', isCorrect: true },
      { tenseId: 't4', tenseName: 'Present Perfect Continuous', isCorrect: true },
      { tenseId: 't5', tenseName: 'Past Simple', isCorrect: true },
      { tenseId: 't6', tenseName: 'Past Continuous', isCorrect: true },
      { tenseId: 't7', tenseName: 'Past Perfect', isCorrect: true },
      { tenseId: 't8', tenseName: 'Past Perfect Continuous', isCorrect: false },
      { tenseId: 't9', tenseName: 'Future Simple', isCorrect: true },
      { tenseId: 't10', tenseName: 'Future Continuous', isCorrect: true },
      { tenseId: 't11', tenseName: 'Future Perfect', isCorrect: true },
      { tenseId: 't12', tenseName: 'Future Perfect Continuous', isCorrect: true }
    ];
    this.render();
  }
}

(window as any).TensesDossier = TensesDossier;

