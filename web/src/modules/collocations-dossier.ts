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

export class CollocationsDossier {
  private container: HTMLElement;
  private currentList: CollocationItem[] = [];
  private currentIndex: number = 0;
  private activeCategory: string = 'ALL';
  private searchQuery: string = '';
  private currentCardHandle: any = null;
  public onBatchComplete?: () => void;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'dossier-workspace dossier-collocations interactive';
    this.filterCards();
  }

  private filterCards(): void {
    const rawDeck = collocationsData as CollocationItem[];
    let list: CollocationItem[] = [];

    if (this.activeCategory === 'DUE') {
      const states = StorageManager.loadState().cardStates;
      list = SRSEngine.getDueCards(rawDeck, states, 20);
    } else if (this.activeCategory !== 'ALL') {
      list = rawDeck.filter(item => item.category === this.activeCategory);
    } else {
      list = [...rawDeck];
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
          <button class="hud-btn filter-tab ${this.activeCategory === 'DUE' ? 'active' : ''}" data-cat="DUE">[⚡ SRS DUE BATCH (20)]</button>
          <button class="hud-btn filter-tab ${this.activeCategory === 'ALL' ? 'active' : ''}" data-cat="ALL">[ALL 1,000]</button>
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
        <span class="telemetry-value card-counter">VAULT [ ${this.currentIndex + 1} / ${Math.max(1, this.currentList.length)} ]</span>
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
        counter.textContent = `VAULT [ ${this.currentIndex + 1} / ${Math.max(1, this.currentList.length)} ]`;
      }
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
      counter.textContent = `VAULT [ ${this.currentIndex + 1} / ${Math.max(1, this.currentList.length)} ]`;
    }
  }

  private renderCurrentCard(): void {
    const slot = this.container.querySelector('.dossier-card-slot');
    if (!slot) return;
    slot.innerHTML = '';

    if (this.currentList.length === 0) {
      slot.innerHTML = `
        <div class="empty-state-notice">
          <div class="telemetry-label">[ZERO RECORDS MATCH QUERY]</div>
          <p>No collocation entries found matching the filter criteria.</p>
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

    this.currentCardHandle = AtomicCard.create({
      id: item.id,
      pillar: 'COLLOC',
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
        subText: `Core Category: ${item.category}`
      },
      audioText: item.phrase,
      onRate: (rating: 'again' | 'good') => {
        this.handleRate(item.id, rating);
      }
    });

    slot.appendChild(this.currentCardHandle.element);
  }

  private handleRate(cardId: string, rating: 'again' | 'good'): void {
    const srsState = StorageManager.getCardState(cardId);
    const nextCardState = SRSEngine.rateCard(srsState, cardId, rating);
    StorageManager.setCardState(cardId, nextCardState);

    // If reviewing in DUE queue and completed all
    if (this.activeCategory === 'DUE') {
      this.filterCards();
      if (this.currentList.length === 0 && this.onBatchComplete) {
        this.onBatchComplete();
        return;
      }
    }

    // Auto advance to next card
    this.navigateCard(1);
  }

  public focusSearch(): void {
    const input = this.container.querySelector('.dossier-search-input') as HTMLInputElement;
    input?.focus();
    input?.select();
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
