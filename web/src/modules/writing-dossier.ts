import { AtomicCard } from '../core/atomic-card';
import { SRSEngine } from '../core/srs-engine';
import { StorageManager } from '../utils/storage';
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

export class WritingDossier {
  private container: HTMLElement;
  private items: WritingItem[] = [];
  private currentIndex: number = 0;
  private currentCardHandle: any = null;
  public onBatchComplete?: () => void;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'dossier-workspace dossier-writing interactive';
    this.items = (drillsData as any).writing || [];
  }

  public render(): HTMLElement {
    this.container.innerHTML = `
      <div class="dossier-control-bar">
        <div class="dossier-tabs">
          <span class="telemetry-label">[PILLAR 02 // WRITING & FRANKLIN COPYWORK]</span>
        </div>
        <div class="dossier-status-pill">
          <span class="telemetry-value">30 ADVANCED MEAL BLUEPRINTS</span>
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
        this.currentIndex -= 1;
        this.renderCurrentCard();
      }
    });

    this.container.querySelector('.nav-btn-next')?.addEventListener('click', () => {
      if (this.currentIndex < this.items.length - 1) {
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

    // Front: Master sentence for memorization
    const frontEl = document.createElement('div');
    frontEl.className = 'copywork-front';
    frontEl.innerHTML = `
      <div class="card-prompt-label">FRANKLIN COPYWORK // MEMORIZE SYNTACTIC GEOMETRY</div>
      <div class="card-main-text" style="font-size: 16px; line-height: 1.5; font-weight: 500;">
        "${item.masterSentence}"
      </div>
      <div class="card-sub-text" style="margin-top: 12px; font-family: var(--font-mono); font-size: 11px;">
        Topic: ${item.title} | Register: ${item.register}
      </div>
      <div class="copywork-instruction" style="margin-top: 16px; font-family: var(--font-mono); font-size: 11px; border: 1px dashed var(--border-hairline); padding: 8px;">
        [INSTRUCTION]: Read carefully, deconstruct punctuation & clauses, then press [SPACE] to reconstruct from memory.
      </div>
    `;

    // Back: Reconstruction textarea and split diff console
    const backEl = document.createElement('div');
    backEl.className = 'copywork-back';
    backEl.innerHTML = `
      <div class="card-prompt-label">RECONSTRUCT SENTENCE FROM MEMORY</div>
      <textarea class="copywork-textarea" placeholder="Type sentence here without peeking..." rows="3" style="width: 100%; font-family: var(--font-mono); font-size: 13px; padding: 8px; border: 1px solid var(--ink-primary); background: #ffffff; color: #000000; outline: none; resize: none;"></textarea>
      <div style="margin-top: 8px; display: flex; justify-content: flex-end;">
        <button class="hud-btn btn-run-diff" style="padding: 4px 12px; font-size: 11px;">[ VERIFY DIFF ]</button>
      </div>
      <div class="diff-output-console" style="margin-top: 8px; min-height: 48px; max-height: 80px; overflow-y: auto; font-family: var(--font-mono); font-size: 11px; border: 1px solid var(--border-hairline); padding: 6px; background: #fafafa;">
        <span style="color: var(--ink-muted);">[DIFF CONSOLE]: Click Verify to compare against original text.</span>
      </div>
    `;

    const diffBtn = backEl.querySelector('.btn-run-diff') as HTMLButtonElement;
    const diffConsole = backEl.querySelector('.diff-output-console') as HTMLElement;
    const textarea = backEl.querySelector('.copywork-textarea') as HTMLTextAreaElement;

    diffBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const userText = textarea.value.trim();
      const original = item.masterSentence.trim();
      diffConsole.innerHTML = this.computeWordDiff(userText, original);
    });

    const cardHandle = AtomicCard.create({
      id: item.id,
      pillar: 'WRITE',
      category: 'FRANKLIN',
      indexStr: `[ ${String(item.index).padStart(2, '0')} / 30 ]`,
      statusBadge,
      front: {
        customContent: frontEl,
        mainText: item.masterSentence
      },
      back: {
        customContent: backEl,
        mainText: item.masterSentence
      },
      audioText: item.masterSentence,
      onRate: (rating) => {
        const nextState = SRSEngine.rateCard(srsState, item.id, rating);
        StorageManager.setCardState(item.id, nextState);

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

  private computeWordDiff(userText: string, originalText: string): string {
    if (!userText) {
      return '<span style="color: #000000; font-weight: 700;">[ERROR]: Empty input. Type your reconstruction first.</span>';
    }

    const uWords = userText.split(/\s+/);
    const oWords = originalText.split(/\s+/);

    let html = '<div>';
    let matchCount = 0;

    for (let i = 0; i < Math.max(uWords.length, oWords.length); i++) {
      const u = uWords[i] || '';
      const o = oWords[i] || '';

      const cleanU = u.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanO = o.toLowerCase().replace(/[^a-z0-9]/g, '');

      if (cleanU === cleanO) {
        html += `<span style="color: #000000; font-weight: 600;">${u} </span>`;
        matchCount++;
      } else {
        if (u) {
          html += `<span style="text-decoration: line-through; border: 1px solid #000000; padding: 0 2px;">${u}</span> `;
        }
        if (o) {
          html += `<span style="background: #000000; color: #ffffff; padding: 0 4px; font-weight: 700;">[TARGET: ${o}]</span> `;
        }
      }
    }

    const accuracy = Math.round((matchCount / oWords.length) * 100);
    html += `</div><div style="margin-top: 6px; border-top: 1px solid #000000; padding-top: 4px; font-weight: 700;">ACCURACY: ${accuracy}% (${matchCount}/${oWords.length} words correct)</div>`;
    return html;
  }

  public handleGlobalKey(key: string): boolean {
    if (!this.currentCardHandle) return false;

    // Do not capture space or numbers if user is typing in textarea
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
