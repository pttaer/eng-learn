import { Cefr, CEFR_LABELS, CEFR_ORDER } from '../core/cefr';
import { PlacementQuestion, buildQuestions, placeLevel, PASS_MARK, QUESTIONS_PER_LEVEL } from '../core/placement';
import { StorageManager } from '../utils/storage';
import { AcousticHaptics } from '../core/acoustic-haptics';
import { t } from '../core/i18n';
import vocabularyData from '../assets/data/vocabulary.json';
import collocationsData from '../assets/data/collocations.json';
import diagnosticData from '../assets/data/diagnostic-questions.json';
import readingData from '../assets/data/reading.json';

/**
 * First-run placement: questions are asked level by level (A1 upward); the quiz stops at the first level with
 * fewer than PASS_MARK correct answers. The learner can accept the result, pick another level, or skip.
 */
export class PlacementQuiz {
  private overlay: HTMLElement;
  private questions: PlacementQuestion[];
  private index = 0;
  private correct: Partial<Record<Cefr, number>> = {};
  private asked: Partial<Record<Cefr, number>> = {};
  private opener: HTMLElement | null;
  private onDone: () => void;
  private keyHandler: (e: KeyboardEvent) => void;
  private static activeInstance: PlacementQuiz | null = null;

  public static open(onDone: () => void = () => {}): void {
    this.close();
    this.activeInstance = new PlacementQuiz(onDone);
  }

  public static close(): void {
    if (this.activeInstance) {
      document.removeEventListener('keydown', this.activeInstance.keyHandler, true);
      this.activeInstance.overlay.remove();
      this.activeInstance = null;
    }
  }

  private constructor(onDone: () => void) {
    this.onDone = onDone;
    this.opener = document.activeElement as HTMLElement | null;
    const articles = Array.isArray(readingData) ? readingData : (readingData as any).articles || [];
    this.questions = buildQuestions(
      vocabularyData as any[],
      collocationsData as any[],
      (diagnosticData as any[]).filter(q => q.skill === 'grammar'),
      articles as any[]
    );
    this.overlay = document.createElement('div');
    this.overlay.className = 'completion-modal-overlay interactive';
    this.overlay.setAttribute('role', 'dialog');
    this.overlay.setAttribute('aria-modal', 'true');
    this.overlay.setAttribute('aria-label', 'Find your English level');
    document.body.appendChild(this.overlay);

    this.keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        this.skip();
        return;
      }
      const n = Number(e.key);
      if (n >= 1 && n <= 4) this.overlay.querySelectorAll<HTMLElement>('.placement-option')[n - 1]?.click();
    };
    document.addEventListener('keydown', this.keyHandler, true);
    this.renderIntro();
  }

  private card(inner: string): void {
    this.overlay.innerHTML = `<div class="completion-receipt-card placement-quiz-card squircle-md" style="max-width: 520px; width: 100%; max-height: calc(100dvh - 32px); overflow-y: auto; text-align: left; align-items: stretch; box-sizing: border-box; border-radius: var(--radius-squircle-md, 16px); box-shadow: var(--shadow-ambient);">${inner}</div>`;
  }

  private renderIntro(): void {
    this.card(`
      <div class="telemetry-label" style="margin-bottom: var(--space-8); color: var(--accent-gold); font-weight: 700;">${t('placement.title', undefined, 'FIND YOUR STARTING POINT')}</div>
      <p style="font-size: var(--font-h4); line-height: 1.6; margin: 0 0 var(--space-20, 20px) 0; color: var(--ink-secondary);">
        ${t('placement.intro', undefined, 'Takes about 2 minutes with gentle exploratory questions (from A1 to C2). The test stops dynamically as soon as questions exceed your pace so you never feel exhausted. You can adjust your level anytime.')}
      </p>
      <div class="action-stack placement-actions-cluster" style="width: 100%; display: flex; flex-direction: column; gap: 12px; margin-top: 20px;">
        <button class="hud-btn placement-start btn-start-placement apple-press" style="width: 100%; justify-content: center; min-height: 44px; padding: 12px 0; font-weight: 700; border-radius: var(--radius-btn, 10px);">${t('placement.start_btn', undefined, 'Start (~2 mins)')}</button>
        <button class="hud-btn placement-skip apple-press" style="width: 100%; justify-content: center; min-height: 44px; padding: 10px 0; border-radius: var(--radius-btn, 10px);">${t('placement.skip_to_a1', undefined, 'Skip and start at A1')}</button>
      </div>
    `);
    this.overlay.querySelector('.placement-start')?.addEventListener('click', () => this.renderQuestion());
    this.overlay.querySelector('.placement-skip')?.addEventListener('click', () => this.skip());
    (this.overlay.querySelector('.placement-start') as HTMLElement | null)?.focus();
  }

  private renderQuestion(): void {
    const q = this.questions[this.index];
    if (!q) return this.renderResult();
    const badgeMap: Record<string, string> = {
      vocab: `[ ${t('dossier.vocab', undefined, 'VOCABULARY').toUpperCase()} ]`,
      collocation: `[ ${t('dossier.collocations', undefined, 'COLLOCATIONS').toUpperCase()} ]`,
      grammar: `[ ${t('dossier.grammar', undefined, 'GRAMMAR').toUpperCase()} ]`,
      reading: `[ ${t('dossier.reading', undefined, 'READING').toUpperCase()} ]`
    };
    const badgeText = badgeMap[q.kind] || `[ ${q.kind.toUpperCase()} ]`;
    this.card(`
      <div class="telemetry-label" style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 4px 8px; margin-bottom: var(--space-8);">
        <span>${t('placement.question_header', { current: this.index + 1, total: this.questions.length, level: q.level }, `QUESTION ${this.index + 1} / ${this.questions.length} · LEVEL ${q.level}`)}</span>
        <span class="hud-badge placement-skill-badge" style="letter-spacing: 0.08em; font-weight: 700; color: var(--gold-primary, #ca8a04); text-transform: uppercase; white-space: nowrap; flex-shrink: 0;">${badgeText}</span>
      </div>
      <div class="placement-prompt-title" style="font-size: var(--font-h3); font-weight: 700; line-height: 1.35; margin: 0 0 ${q.context ? 'var(--space-8)' : 'var(--space-16)'} 0; color: var(--ink-primary);">${this.escape(q.prompt)}</div>
      ${q.context ? `<div class="placement-context-box" style="font-size: var(--font-body-compact); color: var(--ink-secondary); line-height: 1.5; margin: 0 0 var(--space-16) 0;">${this.escape(q.context)}</div>` : ''}
      <div role="group" aria-label="Choose the answer" class="action-stack" style="width: 100%; display: flex; flex-direction: column; gap: 12px; margin-top: 14px;">
        ${q.options.map((o, i) => `<button class="hud-btn placement-option apple-press" data-i="${i}" style="width: 100%; box-sizing: border-box; justify-content: flex-start; padding: 12px 14px; text-align: left; white-space: normal; min-height: 44px; text-transform: none; border-radius: var(--radius-btn, 10px); font-family: var(--font-sans); font-size: var(--font-body-compact); line-height: 1.4; display: inline-flex; align-items: center; gap: 8px;"><strong style="font-family: var(--font-mono); flex-shrink: 0;">${i + 1}.</strong> <span>${this.escape(o)}</span></button>`).join('')}
      </div>
      <button class="hud-btn placement-skip apple-press" style="width: 100%; justify-content: center; min-height: 44px; padding: 8px 0; margin-top: 18px; border-radius: var(--radius-btn, 10px);">${t('placement.skip_survey', undefined, 'Skip diagnostic quiz')}</button>
    `);
    this.overlay.querySelectorAll<HTMLElement>('.placement-option').forEach(btn => {
      btn.addEventListener('click', () => this.answer(Number(btn.dataset.i)));
    });
    this.overlay.querySelector('.placement-skip')?.addEventListener('click', () => this.skip());
    (this.overlay.querySelector('.placement-option') as HTMLElement | null)?.focus();
  }

  private answer(choice: number): void {
    const q = this.questions[this.index];
    this.asked[q.level] = (this.asked[q.level] ?? 0) + 1;
    const isCorrect = choice === q.answer;
    if (isCorrect) {
      this.correct[q.level] = (this.correct[q.level] ?? 0) + 1;
      AcousticHaptics.tap();
    } else {
      AcousticHaptics.nudge();
    }

    // After the last question of a level: stop at the first level that is not passed
    if (this.asked[q.level] === QUESTIONS_PER_LEVEL && (this.correct[q.level] ?? 0) < PASS_MARK) {
      this.index = this.questions.length;
    } else {
      this.index++;
    }
    this.renderQuestion();
  }

  public renderResult(): void {
    const level = placeLevel(this.correct);
    this.card(`
      <div class="telemetry-label" style="margin-bottom: var(--space-8);">${t('placement.your_level', undefined, 'YOUR LEVEL')}</div>
      <div style="font-size: var(--font-h1); font-weight: 700; margin-bottom: var(--space-8);">${CEFR_LABELS[level]}</div>
      <p style="font-size: var(--font-h4); color: var(--ink-secondary); margin-bottom: var(--space-16);">
        ${t('placement.result_desc', undefined, 'This is a balanced 24-question multi-skill diagnostic estimate (Vocabulary, Collocations, Grammar, and Reading). Pick another level if it feels too easy or too hard.')}
      </p>
      <div class="action-stack placement-actions-cluster" style="width: 100%; display: flex; flex-direction: column; gap: 12px; margin-top: 20px;">
        <button class="hud-btn placement-accept" style="width: 100%; justify-content: center; min-height: 44px; padding: 12px 0; font-weight: 700; border-radius: var(--radius-btn, 10px);">${t('placement.start_at', { level }, `Start at ${level}`)}</button>
        <div style="display: flex; flex-wrap: wrap; gap: 8px 10px; justify-content: center; margin-top: 6px;">
          ${CEFR_ORDER.filter(l => l !== level).map(l => `<button class="hud-btn placement-pick" data-level="${l}" style="padding: 6px 14px; min-height: 44px; min-width: 44px; border-radius: var(--radius-btn, 10px); display: inline-flex; align-items: center; justify-content: center;">${l}</button>`).join('')}
        </div>
      </div>
    `);
    this.overlay.querySelector('.placement-accept')?.addEventListener('click', () => this.finish(level));
    this.overlay.querySelectorAll<HTMLElement>('.placement-pick').forEach(b => {
      b.addEventListener('click', () => this.finish(b.dataset.level as Cefr));
    });
    (this.overlay.querySelector('.placement-accept') as HTMLElement | null)?.focus();
  }

  private skip(): void {
    this.finish(StorageManager.getLearnerLevel());
  }

  private finish(level: Cefr): void {
    StorageManager.setLearnerLevel(level);
    StorageManager.setPlacementDone();
    window.dispatchEvent(new CustomEvent('learner-level-change'));
    document.removeEventListener('keydown', this.keyHandler, true);
    this.overlay.remove();
    PlacementQuiz.activeInstance = null;
    this.opener?.focus();
    this.onDone();
  }

  private escape(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}

(window as any).PlacementQuiz = PlacementQuiz;

