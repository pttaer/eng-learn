import { AtomicCard } from '../core/atomic-card';
import { SRSEngine } from '../core/srs-engine';
import { StorageManager } from '../utils/storage';
import collocationsData from '../assets/data/collocations.json';

export interface CollocationItem {
  id: string;
  index: number;
  phrase: string;
  vietnamese: string;
  category: 'EVERYDAY' | 'BUSINESS' | 'ACADEMIC' | 'IDIOMS';
}

export class LexiconDossier {
  private container: HTMLElement;
  private currentList: CollocationItem[] = [];
  private currentIndex: number = 0;
  private activeCategory: string = 'ALL';
  private searchQuery: string = '';
  private currentCardHandle: any = null;
  public onBatchComplete?: () => void;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'dossier-workspace dossier-lexicon interactive';
    this.filterCards();
  }

  private filterCards(): void {
    let list = collocationsData as CollocationItem[];

    if (this.activeCategory !== 'ALL') {
      list = list.filter(item => item.category === this.activeCategory);
    }

    if (this.searchQuery.trim().length > 0) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(item =>
        item.phrase.toLowerCase().includes(q) ||
        item.vietnamese.toLowerCase().includes(q)
      );
    }

    this.currentList = list;
    this.currentIndex = 0;
  }

  public render(): HTMLElement {
    this.container.innerHTML = `
      <div class="dossier-control-bar">
        <div class="dossier-tabs">
          <button class="hud-btn filter-tab ${this.activeCategory === 'ALL' ? 'active' : ''}" data-cat="ALL">[ALL 1000]</button>
          <button class="hud-btn filter-tab ${this.activeCategory === 'EVERYDAY' ? 'active' : ''}" data-cat="EVERYDAY">[EVERYDAY]</button>
          <button class="hud-btn filter-tab ${this.activeCategory === 'BUSINESS' ? 'active' : ''}" data-cat="BUSINESS">[BUSINESS]</button>
          <button class="hud-btn filter-tab ${this.activeCategory === 'ACADEMIC' ? 'active' : ''}" data-cat="ACADEMIC">[ACADEMIC]</button>
          <button class="hud-btn filter-tab ${this.activeCategory === 'IDIOMS' ? 'active' : ''}" data-cat="IDIOMS">[IDIOMS]</button>
        </div>
        <div class="dossier-search-wrapper">
          <input type="text" class="dossier-search-input" placeholder="SEARCH 1,000 COLLOCATIONS... (CTRL+K)" value="${this.searchQuery}" />
        </div>
      </div>
      <div class="dossier-card-slot"></div>
      <div class="dossier-nav-bar">
        <button class="hud-btn nav-btn-prev">[ ← PREV ]</button>
        <span class="telemetry-value card-counter">INDEX [ ${this.currentIndex + 1} / ${Math.max(1, this.currentList.length)} ]</span>
        <button class="hud-btn nav-btn-next">[ NEXT → ]</button>
      </div>
    `;

    this.bindEvents();
    this.renderCurrentCard();
    return this.container;
  }

  private bindEvents(): void {
    // Category tabs
    const tabs = this.container.querySelectorAll('.filter-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const cat = (tab as HTMLElement).dataset.cat || 'ALL';
        this.activeCategory = cat;
        this.filterCards();
        this.render();
      });
    });

    // Search input
    const searchInput = this.container.querySelector('.dossier-search-input') as HTMLInputElement;
    searchInput?.addEventListener('input', (e) => {
      this.searchQuery = (e.target as HTMLInputElement).value;
      this.filterCards();
      this.renderCurrentCard();
      const counter = this.container.querySelector('.card-counter');
      if (counter) {
        counter.textContent = `INDEX [ ${this.currentIndex + 1} / ${Math.max(1, this.currentList.length)} ]`;
      }
    });

    // Prev / Next
    this.container.querySelector('.nav-btn-prev')?.addEventListener('click', () => {
      if (this.currentIndex > 0) {
        this.currentIndex -= 1;
        this.renderCurrentCard();
      }
    });

    this.container.querySelector('.nav-btn-next')?.addEventListener('click', () => {
      if (this.currentIndex < this.currentList.length - 1) {
        this.currentIndex += 1;
        this.renderCurrentCard();
      }
    });
  }

  public renderCurrentCard(): void {
    const slot = this.container.querySelector('.dossier-card-slot');
    if (!slot) return;
    slot.innerHTML = '';

    if (this.currentList.length === 0) {
      slot.innerHTML = `
        <div style="font-family: var(--font-mono); font-size: var(--text-sm); text-align: center; padding: 48px; border: 1px dashed var(--ink-primary);">
          [NO COLLOCATIONS MATCH SEARCH CRITERIA]
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

    const cardHandle = AtomicCard.create({
      id: item.id,
      pillar: 'READ',
      category: item.category,
      indexStr: `[ ${String(item.index).padStart(4, '0')} / 1000 ]`,
      statusBadge,
      front: {
        promptLabel: 'COLLOCATION // RECALL MEANING',
        mainText: item.phrase,
        subText: 'Activate lexical retrieval before flipping'
      },
      back: {
        promptLabel: 'TARGET MEANING & USAGE',
        mainText: item.vietnamese,
        subText: `Core category: ${item.category}`
      },
      audioText: item.phrase,
      onRate: (rating) => {
        const nextState = SRSEngine.rateCard(srsState, item.id, rating);
        StorageManager.setCardState(item.id, nextState);

        // Advance to next card
        if (this.currentIndex < this.currentList.length - 1) {
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
      counter.textContent = `INDEX [ ${this.currentIndex + 1} / ${this.currentList.length} ]`;
    }
  }

  public handleGlobalKey(key: string): boolean {
    if (!this.currentCardHandle) return false;

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

  public focusSearch(): void {
    const input = this.container.querySelector('.dossier-search-input') as HTMLInputElement;
    input?.focus();
    input?.select();
  }
}
