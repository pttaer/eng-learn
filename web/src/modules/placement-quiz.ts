import { Cefr, CEFR_LABELS, CEFR_ORDER } from '../core/cefr';
import { PlacementQuestion, buildQuestions, placeLevel, PASS_MARK, QUESTIONS_PER_LEVEL } from '../core/placement';
import { StorageManager } from '../utils/storage';
import { AudioSynthesizer } from '../core/audio-synthesizer';
import vocabularyData from '../assets/data/vocabulary.json';
import collocationsData from '../assets/data/collocations.json';

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

  public static open(onDone: () => void = () => {}): void {
    new PlacementQuiz(onDone);
  }

  private constructor(onDone: () => void) {
    this.onDone = onDone;
    this.opener = document.activeElement as HTMLElement | null;
    this.questions = buildQuestions(vocabularyData as any[], collocationsData as any[]);
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
    this.overlay.innerHTML = `<div class="completion-receipt-card" style="max-width: 520px; width: 90%;">${inner}</div>`;
  }

  private renderIntro(): void {
    this.card(`
      <div class="telemetry-label" style="margin-bottom: var(--space-8);">FIND YOUR LEVEL</div>
      <p style="font-size: 14px; line-height: 1.5; margin-bottom: var(--space-16); color: var(--ink-secondary);">
        Answer a few quick questions and the app will start you at the right CEFR level (A1 to C2). It stops as soon as
        questions get too hard. You can change your level at any time.
      </p>
      <div style="width: 100%; display: flex; flex-direction: column; gap: var(--space-8);">
        <button class="hud-btn placement-start" style="width: 100%; justify-content: center; padding: 12px 0; font-weight: 700;">Start (about 2 minutes)</button>
        <button class="hud-btn placement-skip" style="width: 100%; justify-content: center; padding: 10px 0;">Skip and start at A1</button>
      </div>
    `);
    this.overlay.querySelector('.placement-start')?.addEventListener('click', () => this.renderQuestion());
    this.overlay.querySelector('.placement-skip')?.addEventListener('click', () => this.skip());
    (this.overlay.querySelector('.placement-start') as HTMLElement | null)?.focus();
  }

  private renderQuestion(): void {
    const q = this.questions[this.index];
    if (!q) return this.renderResult();
    this.card(`
      <div class="telemetry-label" style="margin-bottom: var(--space-8);">QUESTION ${this.index + 1} / ${this.questions.length} &middot; ${q.level}</div>
      <div style="font-size: 20px; font-weight: 700; margin-bottom: var(--space-4);">${this.escape(q.prompt)}</div>
      ${q.context ? `<div style="font-size: 13px; color: var(--ink-secondary); margin-bottom: var(--space-16);">${this.escape(q.context)}</div>` : '<div style="margin-bottom: var(--space-16);"></div>'}
      <div role="group" aria-label="Choose the meaning" style="width: 100%; display: flex; flex-direction: column; gap: var(--space-8);">
        ${q.options.map((o, i) => `<button class="hud-btn placement-option" data-i="${i}" style="width: 100%; box-sizing: border-box; justify-content: flex-start; padding: 10px 14px; text-align: left; white-space: normal; height: auto; text-transform: none;">${i + 1}. ${this.escape(o)}</button>`).join('')}
      </div>
      <button class="hud-btn placement-skip" style="width: 100%; justify-content: center; padding: 8px 0; margin-top: var(--space-16);">Skip the quiz</button>
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
    if (choice === q.answer) this.correct[q.level] = (this.correct[q.level] ?? 0) + 1;
    AudioSynthesizer.play('click');

    // After the last question of a level: stop at the first level that is not passed
    if (this.asked[q.level] === QUESTIONS_PER_LEVEL && (this.correct[q.level] ?? 0) < PASS_MARK) {
      this.index = this.questions.length;
    } else {
      this.index++;
    }
    this.renderQuestion();
  }

  private renderResult(): void {
    const level = placeLevel(this.correct);
    this.card(`
      <div class="telemetry-label" style="margin-bottom: var(--space-8);">YOUR LEVEL</div>
      <div style="font-size: 24px; font-weight: 700; margin-bottom: var(--space-8);">${CEFR_LABELS[level]}</div>
      <p style="font-size: 14px; color: var(--ink-secondary); margin-bottom: var(--space-16);">
        This is a quick vocabulary-based estimate. Pick another level if it feels too easy or too hard.
      </p>
      <div style="width: 100%; display: flex; flex-direction: column; gap: var(--space-8);">
        <button class="hud-btn placement-accept" style="width: 100%; justify-content: center; padding: 12px 0; font-weight: 700;">Start at ${level}</button>
        <div style="display: flex; flex-wrap: wrap; gap: var(--space-8); justify-content: center;">
          ${CEFR_ORDER.filter(l => l !== level).map(l => `<button class="hud-btn placement-pick" data-level="${l}" style="padding: 6px 12px;">${l}</button>`).join('')}
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
    this.opener?.focus();
    this.onDone();
  }

  private escape(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}
