import { AtomicCard } from '../core/atomic-card';
import { icon } from '../utils/icons';
import { SRSEngine } from '../core/srs-engine';
import { StorageManager } from '../utils/storage';
import { AudioSynthesizer } from '../core/audio-synthesizer';
import vocabularyData from '../assets/data/vocabulary.json';
import { Cefr, srsTier } from '../core/cefr';
import { levelsWithContent, defaultLevel, levelChipsHtml } from '../core/level-filter';

export type VocabMode = string;

const MODE_TABS: Record<string, string> = {
  ROOT_FORGE: 'Mode A: Root Forge',
  CEFR_ASCENT: 'Mode B: CEFR Ascent',
  PARTICLE_LAB: 'Mode C: Particle Lab'
};

const prettyMode = (m: string) => m.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');

export interface VocabItem {
  id: string;
  mode: VocabMode;
  level: number; // legacy tier 1-3, superseded by cefrLevel
  cefrLevel: Cefr;
  wordOrChunk: string;
  definition: string;
  ipa: string;
  vietnamese: string;
  contextSentence: string;
  breakdown: any;
  isRemindCandidate?: boolean;
}

export class VocabularyDossier {
  private container: HTMLElement;
  private allDeck: VocabItem[];
  private activeMode: VocabMode = 'ROOT_FORGE';
  private activeLevel: Cefr;
  private currentList: VocabItem[] = [];
  private currentIndex: number = 0;
  private reviewCountInRun: number = 0;
  private activeRemindCard: VocabItem | null = null;
  private currentCardHandle: any = null;
  public onBatchComplete?: () => void;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'dossier-workspace dossier-vocabulary interactive';
    this.allDeck = vocabularyData as VocabItem[];
    this.activeLevel = defaultLevel(this.allDeck, StorageManager.getSkillLevel('vocab'));
    this.filterDeck();
    window.addEventListener('learner-level-change', () => {
      this.activeLevel = defaultLevel(this.allDeck, StorageManager.getSkillLevel('vocab'));
      this.filterDeck();
      if (this.container.isConnected) this.render();
    });
  }

  private modesAtLevel(): VocabMode[] {
    return [...new Set(this.allDeck.filter(i => i.cefrLevel === this.activeLevel).map(i => i.mode))];
  }

  private filterDeck(): void {
    const modes = this.modesAtLevel();
    if (modes.length > 0 && !modes.includes(this.activeMode)) this.activeMode = modes[0];
    this.currentList = this.allDeck.filter(
      item => item.mode === this.activeMode && item.cefrLevel === this.activeLevel
    );
    this.currentIndex = 0;
    this.activeRemindCard = null;
  }

  public render(): HTMLElement {
    const modes = this.modesAtLevel();
    this.container.innerHTML = `
      <div class="dossier-control-bar">
        <div class="dossier-tabs vocab-mode-tabs">
          ${modes.map(m => `<button class="hud-btn mode-tab ${this.activeMode === m ? 'active' : ''}" data-mode="${m}">${MODE_TABS[m] || prettyMode(m)}</button>`).join('')}
        </div>

        <div class="vocab-level-selector">
          <span class="telemetry-label" style="margin-right: 8px;">LEVEL:</span>
          ${levelChipsHtml(levelsWithContent(this.allDeck), this.activeLevel)}
        </div>
      </div>

      <div class="vocab-telemetry-banner">
        <div class="telemetry-item">
          <span class="telemetry-label">ROGUELIKE RUN ENCOUNTERS</span>
          <span class="telemetry-value streak-counter">${this.reviewCountInRun} CARDS</span>
        </div>
        <div class="telemetry-item">
          <span class="telemetry-label">TIER LOAD MODIFIER</span>
          <span class="telemetry-value">${this.activeLevel === 'C1' || this.activeLevel === 'C2' ? 'EF 2.30 (HIGH COGNITIVE)' : 'EF 2.50 (CANONICAL)'}</span>
        </div>
        <div class="telemetry-item">
          <span class="telemetry-label">REMIND DROP STATUS</span>
          <span class="telemetry-value remind-status-indicator">ACTIVE (10% PROBABILITY)</span>
        </div>
      </div>

      <div class="dossier-card-slot"></div>

      <div class="dossier-nav-bar">
        <button class="hud-btn nav-btn-prev">${icon('arrowLeft')} Prev</button>
        <span class="telemetry-value card-counter">NODE ${this.currentIndex + 1} / ${Math.max(1, this.currentList.length)}</span>
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
        this.activeMode = (tab as HTMLElement).dataset.mode as VocabMode;
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
    this.activeRemindCard = null; // Clear surprise status on manual step
    this.currentIndex = (this.currentIndex + delta + this.currentList.length) % this.currentList.length;
    this.renderCurrentCard();
    const counter = this.container.querySelector('.card-counter');
    if (counter) {
      counter.textContent = `NODE [ ${this.currentIndex + 1} / ${Math.max(1, this.currentList.length)} ]`;
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
          <p>No cards available for this mode and difficulty level.</p>
        </div>
      `;
      return;
    }

    const item = this.activeRemindCard || this.currentList[this.currentIndex];
    const isRemind = !!this.activeRemindCard;

    const srsState = StorageManager.getCardState(item.id);
    let statusBadge: 'NEW' | 'REVIEW' | 'MASTERED' = 'NEW';
    if (srsState) {
      statusBadge = srsState.repetitions >= 3 ? 'MASTERED' : 'REVIEW';
    }

    let categoryLabel = `${item.mode.replace('_', ' ')} [${item.cefrLevel}]`;
    if (isRemind) {
      categoryLabel = `SURPRISE FLASH REMIND`;
    }

    let backSubText = '';
    if (item.mode === 'ROOT_FORGE') {
      const b = item.breakdown;
      backSubText = `Prefix: ${b.prefix} • Root: ${b.root} • Suffix: ${b.suffix}\nFamily: ${b.derivationalFamily.join(', ')}\n${b.morphologyAnalysis}`;
    } else if (item.mode === 'CEFR_ASCENT') {
      const b = item.breakdown;
      backSubText = `CEFR: ${b.cefrRank} • Register: ${b.register}\nCollocates: ${b.collocates}\nSynonyms: ${b.synonyms.join(', ')}`;
    } else if (item.mode === 'PARTICLE_LAB') {
      const b = item.breakdown;
      backSubText = `Verb: ${b.verb} • Particle: [ ${b.particle} ]\nArchetype: ${b.semanticArchetype}\nLogic: ${b.particleLogic}`;
    }

    this.currentCardHandle = AtomicCard.create({
      id: item.id,
      pillar: 'VOCAB',
      category: categoryLabel,
      indexStr: `[ ${this.currentIndex + 1} / ${this.currentList.length} ]`,
      statusBadge,
      front: {
        promptLabel: isRemind ? 'RETRIEVAL ENGRAM CHECK' : 'CHALLENGE // RECALL & DECONSTRUCT',
        mainText: item.wordOrChunk,
        subText: item.contextSentence
      },
      back: {
        promptLabel: 'SEMANTIC MATRIX & MORPHOLOGY',
        mainText: `${item.definition}\n\nVietnamese: "${item.vietnamese}"`,
        subText: backSubText,
        ipa: item.ipa
      },
      audioText: item.wordOrChunk,
      onRate: (rating: 'again' | 'good') => {
        this.handleRate(item.id, rating, srsTier(item.cefrLevel));
      }
    });

    slot.appendChild(this.currentCardHandle.element);
  }

  private handleRate(cardId: string, rating: 'again' | 'good', cardLevel: number): void {
    const srsState = StorageManager.getCardState(cardId);
    const nextCardState = SRSEngine.rateCard(srsState, cardId, rating, cardLevel);
    StorageManager.setCardState(cardId, nextCardState);

    this.reviewCountInRun += 1;
    const streakEl = this.container.querySelector('.streak-counter');
    if (streakEl) {
      streakEl.textContent = `${this.reviewCountInRun} CARDS`;
    }

    // Roguelike surprise encounter logic:
    // Approximately every 7-10 reviews, roll chance to drop a Remind Card if not currently in one
    const rollForRemind = !this.activeRemindCard && (this.reviewCountInRun % 7 === 0 || Math.random() < 0.12);
    if (rollForRemind) {
      const state = StorageManager.loadState();
      const remindCandidate = SRSEngine.getRemindCard<VocabItem>(
        this.allDeck,
        state.cardStates,
        srsTier(this.activeLevel)
      );

      if (remindCandidate) {
        this.activeRemindCard = remindCandidate;
        AudioSynthesizer.play('remind-drop');
        this.renderCurrentCard();
        return;
      }
    }

    // Standard progression
    this.activeRemindCard = null;
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
      counter.textContent = `NODE [ ${this.currentIndex + 1} / ${Math.max(1, this.currentList.length)} ]`;
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
