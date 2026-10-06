import { Cefr } from '../core/cefr';
import { levelsWithContent, defaultLevel, levelChipsHtml } from '../core/level-filter';
import { icon } from '../utils/icons';
import { AtomicCard } from '../core/atomic-card';
import { SRSEngine } from '../core/srs-engine';
import { StorageManager } from '../utils/storage';
import { AudioSynthesizer } from '../core/audio-synthesizer';
import { MotionEngine } from '../core/motion-engine';
import { SkillTreeEngine } from '../core/skill-tree-engine';
import collocationsData from '../assets/data/collocations.json';

export interface CollocationItem {
  id: string;
  index: number;
  phrase: string;
  vietnamese: string;
  category: 'EVERYDAY' | 'BUSINESS' | 'ACADEMIC' | 'IDIOMS';
  example?: string;
  cefrLevel: Cefr;
}

export type CollocationViewMode = 'drill' | 'dictionary';

export class CollocationsDossier {
  private container: HTMLElement;
  private currentList: CollocationItem[] = [];
  private currentIndex: number = 0;
  private activeCategory: string = 'DUE';
  private activeLevel: Cefr | 'ALL';
  private searchQuery: string = '';
  private currentCardHandle: any = null;
  private viewMode: CollocationViewMode = 'drill';
  private currentPage: number = 1;
  private pageSize: number = 50;
  public onBatchComplete?: () => void;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'dossier-workspace dossier-collocations interactive';
    this.activeLevel = defaultLevel(collocationsData as CollocationItem[], StorageManager.getSkillLevel('vocab'));
    this.filterCards();
    window.addEventListener('learner-level-change', () => {
      this.activeLevel = defaultLevel(collocationsData as CollocationItem[], StorageManager.getSkillLevel('vocab'));
      this.filterCards();
      if (this.container.isConnected) this.render();
    });
  }

  public playAudio(text: string): void {
    AudioSynthesizer.speak(text);
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private filterCards(): void {
    const rawDeck = collocationsData as CollocationItem[];
    let list: CollocationItem[] = [];

    if (this.viewMode === 'drill' && this.activeCategory === 'DUE') {
      // Due reviews span every level: raising or lowering the level never hides a scheduled card
      const states = StorageManager.loadState().cardStates;
      list = SRSEngine.getDueCards(rawDeck, states, 20);
    } else {
      list = rawDeck.filter(item =>
        (this.activeLevel === 'ALL' || item.cefrLevel === this.activeLevel) &&
        (this.activeCategory === 'ALL' || this.activeCategory === 'DUE' || item.category === this.activeCategory)
      );
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
    this.currentPage = 1;
  }

  public render(): HTMLElement {
    const total = (collocationsData as CollocationItem[]).length;
    const levelChips = `<button class="hud-btn level-tab ${this.activeLevel === 'ALL' ? 'active' : ''}" data-cefr="ALL" aria-pressed="${this.activeLevel === 'ALL'}">All</button>`
      + levelChipsHtml(levelsWithContent(collocationsData as CollocationItem[]), this.activeLevel === 'ALL' ? ('' as Cefr) : this.activeLevel);
    this.container.innerHTML = `
      <div class="collocations-mode-header">
        <div class="view-mode-toggle">
          <button class="hud-btn view-toggle-btn ${this.viewMode === 'drill' ? 'active' : ''}" data-view="drill">${icon('zap')} Active SRS Drill</button>
          <button class="hud-btn view-toggle-btn ${this.viewMode === 'dictionary' ? 'active' : ''}" data-view="dictionary">${icon('book')} Full Lexicon (${total.toLocaleString()})</button>
        </div>
        <div class="lexicon-badge-summary">
          <span class="telemetry-value">TOTAL: ${total.toLocaleString()} COLLOCATIONS</span>
        </div>
      </div>

      <div class="dossier-control-bar">
        <div class="dossier-tabs">
          ${this.viewMode === 'drill' ? `<button class="hud-btn filter-tab ${this.activeCategory === 'DUE' ? 'active' : ''}" data-cat="DUE">${icon('zap')} SRS Due</button>` : ''}
          <button class="hud-btn filter-tab ${this.activeCategory === 'ALL' ? 'active' : ''}" data-cat="ALL">All Categories</button>
          <button class="hud-btn filter-tab ${this.activeCategory === 'EVERYDAY' ? 'active' : ''}" data-cat="EVERYDAY">Everyday</button>
          <button class="hud-btn filter-tab ${this.activeCategory === 'BUSINESS' ? 'active' : ''}" data-cat="BUSINESS">Business</button>
          <button class="hud-btn filter-tab ${this.activeCategory === 'ACADEMIC' ? 'active' : ''}" data-cat="ACADEMIC">Academic</button>
          <button class="hud-btn filter-tab ${this.activeCategory === 'IDIOMS' ? 'active' : ''}" data-cat="IDIOMS">Idioms</button>
        </div>
        <div class="control-row">
        ${this.activeCategory === 'DUE' && this.viewMode === 'drill' ? '' : `<div class="vocab-level-selector">
          <span class="telemetry-label" style="margin-right: 8px;">LEVEL:</span>
          ${levelChips}
        </div>`}
        <div class="dossier-search-wrapper">
          <input type="search" aria-label="Search collocations" class="dossier-search-input" placeholder="SEARCH COLLOCATIONS... (CTRL+K)" value="${this.escapeHtml(this.searchQuery)}" />
        </div>
        </div>
      </div>

      ${this.viewMode === 'drill' ? this.getDrillHtml() : this.getDictionaryHtml()}
    `;

    this.bindEvents();
    if (this.viewMode === 'drill') {
      this.renderCurrentCard();
    } else {
      this.bindDictionaryTableEvents();
    }
    return this.container;
  }

  private getDrillHtml(): string {
    return `
      <div class="dossier-card-slot"></div>
      <div class="dossier-nav-bar">
        <button class="hud-btn nav-btn-prev">${icon('arrowLeft')} Prev</button>
        <span class="telemetry-value card-counter">VAULT ${this.currentIndex + 1} / ${Math.max(1, this.currentList.length)}</span>
        <button class="hud-btn nav-btn-next">Next ${icon('arrowRight')}</button>
      </div>
    `;
  }

  private getDictionaryHtml(): string {
    const totalItems = this.currentList.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / this.pageSize));
    if (this.currentPage > totalPages) this.currentPage = totalPages;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const pageItems = this.currentList.slice(startIndex, startIndex + this.pageSize);
    const endIndex = Math.min(startIndex + pageItems.length, totalItems);

    return `
      <div class="lexicon-table-container">
        <div class="lexicon-table-header-info">
          <span class="telemetry-label">LEXICON ARCHIVE // ${totalItems} ENTRIES</span>
          <span class="telemetry-label">DISPLAYING ${totalItems > 0 ? startIndex + 1 : 0}–${endIndex} OF ${totalItems}</span>
        </div>
        <div class="lexicon-table-scroll-wrapper">
          <table class="lexicon-table">
            <thead>
              <tr>
                <th style="width: 60px; text-align: center;">#</th>
                <th>COLLOCATION PHRASE</th>
                <th style="width: 110px;">CATEGORY</th>
                <th>VIETNAMESE TRANSLATION</th>
                <th style="width: 80px; text-align: center;">AUDIO</th>
                <th style="width: 110px; text-align: center;">SRS STATUS</th>
                <th style="width: 80px; text-align: center;">PRACTICE</th>
              </tr>
            </thead>
            <tbody>
              ${pageItems.length === 0 ? `
                <tr>
                  <td colspan="7" class="lexicon-empty-cell">
                    <div class="telemetry-label">Zero records match query</div>
                    <p>No collocation entries found matching the filter criteria.</p>
                  </td>
                </tr>
              ` : pageItems.map(item => {
                const srsState = StorageManager.getCardState(item.id);
                let statusBadge: 'NEW' | 'REVIEW' | 'MASTERED' = 'NEW';
                if (srsState) {
                  statusBadge = srsState.repetitions >= 3 ? 'MASTERED' : 'REVIEW';
                }
                return `
                  <tr class="lexicon-row" data-id="${item.id}">
                    <td class="lexicon-col-index">${String(item.index).padStart(4, '0')}</td>
                    <td class="lexicon-col-phrase"><strong>${this.escapeHtml(item.phrase)}</strong></td>
                    <td class="lexicon-col-cat"><span class="colloc-cat-badge cat-${item.category.toLowerCase()}">${item.category}</span></td>
                    <td class="lexicon-col-vn">${this.escapeHtml(item.vietnamese)}${item.example ? `<div class="colloc-example">${this.escapeHtml(item.example)}</div>` : ''}</td>
                    <td class="lexicon-col-audio">
                      <button class="hud-btn btn-speak-colloc" data-phrase="${this.escapeHtml(item.phrase)}" title="Listen to pronunciation [${this.escapeHtml(item.phrase)}]" aria-label="Listen to pronunciation">${icon('volume')}</button>
                    </td>
                    <td class="lexicon-col-status">
                      <span class="colloc-status-badge status-${statusBadge.toLowerCase()}">${statusBadge}</span>
                    </td>
                    <td class="lexicon-col-drill">
                      <button class="hud-btn btn-drill-row" data-id="${item.id}" title="Practice in SRS Drill">DRILL</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
        <div class="lexicon-pagination-bar">
          <button class="hud-btn page-btn-prev" ${this.currentPage <= 1 ? 'disabled' : ''}>${icon('arrowLeft')} Prev 50</button>
          <span class="telemetry-value page-indicator">PAGE ${this.currentPage} / ${totalPages} (${totalItems > 0 ? startIndex + 1 : 0}–${endIndex} of ${totalItems})</span>
          <button class="hud-btn page-btn-next" ${this.currentPage >= totalPages ? 'disabled' : ''}>Next 50 ${icon('arrowRight')}</button>
        </div>
      </div>
    `;
  }

  private bindEvents(): void {
    // View mode toggle buttons
    const viewButtons = this.container.querySelectorAll('.view-toggle-btn');
    viewButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = (btn as HTMLElement).dataset.view as CollocationViewMode;
        if (mode && mode !== this.viewMode) {
          this.viewMode = mode;
          if (this.viewMode === 'dictionary' && this.activeCategory === 'DUE') {
            this.activeCategory = 'ALL';
          }
          this.filterCards();
          this.render();
        }
      });
    });

    // Level chips
    this.container.querySelectorAll('.level-tab').forEach(chip => {
      chip.addEventListener('click', () => {
        this.activeLevel = ((chip as HTMLElement).dataset.cefr as Cefr | 'ALL') || 'ALL';
        this.filterCards();
        this.render();
      });
    });

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
      if (this.viewMode === 'drill') {
        this.renderCurrentCard();
        const counter = this.container.querySelector('.card-counter');
        if (counter) {
          counter.textContent = `VAULT [ ${this.currentIndex + 1} / ${Math.max(1, this.currentList.length)} ]`;
        }
      } else {
        this.updateDictionaryView();
      }
    });

    // Drill navigation buttons
    if (this.viewMode === 'drill') {
      const prevBtn = this.container.querySelector('.nav-btn-prev');
      const nextBtn = this.container.querySelector('.nav-btn-next');
      prevBtn?.addEventListener('click', () => this.navigateCard(-1));
      nextBtn?.addEventListener('click', () => this.navigateCard(1));
    }
  }

  private updateDictionaryView(): void {
    const tableContainer = this.container.querySelector('.lexicon-table-container');
    if (!tableContainer) return;

    const temp = document.createElement('div');
    temp.innerHTML = this.getDictionaryHtml();
    const newContainer = temp.firstElementChild as HTMLElement;
    if (newContainer) {
      tableContainer.replaceWith(newContainer);
      this.bindDictionaryTableEvents();
    }
  }

  private bindDictionaryTableEvents(): void {
    MotionEngine.riseIn(this.container.querySelectorAll('.lexicon-row'), 12);
    const prevBtn = this.container.querySelector('.page-btn-prev');
    const nextBtn = this.container.querySelector('.page-btn-next');

    prevBtn?.addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.updateDictionaryView();
      }
    });

    nextBtn?.addEventListener('click', () => {
      const totalPages = Math.max(1, Math.ceil(this.currentList.length / this.pageSize));
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.updateDictionaryView();
      }
    });

    // Audio speak buttons
    const speakBtns = this.container.querySelectorAll('.btn-speak-colloc');
    speakBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const phrase = (btn as HTMLElement).dataset.phrase;
        if (phrase) {
          this.playAudio(phrase);
        }
      });
    });

    // Drill row buttons
    const drillBtns = this.container.querySelectorAll('.btn-drill-row');
    drillBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cardId = (btn as HTMLElement).dataset.id;
        if (cardId) {
          this.jumpToDrill(cardId);
        }
      });
    });
  }

  private jumpToDrill(cardId: string): void {
    this.viewMode = 'drill';
    const foundIndex = this.currentList.findIndex(item => item.id === cardId);
    if (foundIndex >= 0) {
      this.currentIndex = foundIndex;
    } else {
      this.activeCategory = 'ALL';
      this.searchQuery = '';
      this.filterCards();
      const idx = this.currentList.findIndex(item => item.id === cardId);
      this.currentIndex = idx >= 0 ? idx : 0;
    }
    this.render();
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
          <div class="telemetry-label">Zero records match query</div>
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
      indexStr: `[ ${this.currentIndex + 1} / ${this.currentList.length} ]`,
      statusBadge,
      front: {
        promptLabel: 'COLLOCATION // RECALL MEANING',
        mainText: item.phrase,
        subText: 'Activate lexical retrieval before flipping'
      },
      back: {
        promptLabel: 'TARGET MEANING & USAGE',
        mainText: item.vietnamese,
        subText: item.example ? `“${this.escapeHtml(item.example)}”` : `Core Category: ${item.category}`
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

    const item = this.currentList.find(i => i.id === cardId);
    const levelToAdvance = (item?.cefrLevel as Cefr) || (this.activeLevel !== 'ALL' ? this.activeLevel : StorageManager.getSkillLevel('vocab'));

    if (rating === 'good') {
      SkillTreeEngine.advanceBranchMastery('collocations', levelToAdvance, 5);
    }

    // If reviewing in DUE queue and completed all
    if (this.activeCategory === 'DUE') {
      this.filterCards();
      if (this.currentList.length === 0 && this.onBatchComplete) {
        SkillTreeEngine.advanceBranchMastery('collocations', levelToAdvance, 5);
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
    if (this.viewMode === 'dictionary') {
      if (key === 'ArrowRight' || key === 'PageDown') {
        const totalPages = Math.max(1, Math.ceil(this.currentList.length / this.pageSize));
        if (this.currentPage < totalPages) {
          this.currentPage++;
          this.updateDictionaryView();
          return true;
        }
      }
      if (key === 'ArrowLeft' || key === 'PageUp') {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.updateDictionaryView();
          return true;
        }
      }
      return false;
    }

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
