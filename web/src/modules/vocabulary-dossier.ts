import { AtomicCard } from '../core/atomic-card';
import { icon } from '../utils/icons';
import { SRSEngine } from '../core/srs-engine';
import { StorageManager } from '../utils/storage';
import { AudioSynthesizer } from '../core/audio-synthesizer';
import { HeaderHUD } from './header-hud';
import vocabularyData from '../assets/data/vocabulary.json';
import { Cefr, srsTier } from '../core/cefr';
import { levelsWithContent, defaultLevel, levelChipsHtml } from '../core/level-filter';
import { UndoManager } from '../core/undo-manager';
import { AcousticHaptics } from '../core/acoustic-haptics';
import { t } from '../core/i18n';

export type VocabMode = string;

const MODE_TABS: Record<string, string> = {
  ROOT_FORGE: 'Mode A: Root Forge',
  CEFR_ASCENT: 'Mode B: CEFR Ascent',
  PARTICLE_LAB: 'Mode C: Particle Lab'
};

const prettyMode = (m: string) => m.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');

const getModeLabel = (m: string): string => {
  if (m === 'ROOT_FORGE') return t('vocab.root_forge');
  if (m === 'CEFR_ASCENT') return t('vocab.cefr_ascent');
  if (m === 'PARTICLE_LAB') return t('vocab.particle_lab');
  return (MODE_TABS[m] || prettyMode(m)).replace(/^Mode [A-C]: /, '');
};

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
    window.addEventListener('eng:locale-changed', () => {
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
    const totalCount = Math.max(1, this.currentList.length);
    const progressPct = Math.min(100, Math.round(((this.currentIndex + 1) / totalCount) * 100));

    this.container.innerHTML = `
      <div class="vocab-apple-header">
        <!-- Segmented Mode Control -->
        <div class="vocab-segmented-control" role="tablist" aria-label="${t('vocab.title')}">
          ${modes.map(m => `
            <button class="vocab-seg-btn mode-tab ${this.activeMode === m ? 'is-active' : ''}" data-mode="${m}" role="tab" aria-selected="${this.activeMode === m}">
              ${getModeLabel(m)}
            </button>
          `).join('')}
        </div>

        <!-- CEFR Level Chips & Progress Strip -->
        <div class="vocab-meta-bar">
          <div class="vocab-level-chips" role="radiogroup" aria-label="${t('action.filter_level')}">
            ${levelChipsHtml(levelsWithContent(this.allDeck), this.activeLevel)}
          </div>
          <div class="vocab-progress-badge">
            <span class="vocab-count-indicator"><strong class="card-counter">${t('vocab.card_counter', { current: this.currentIndex + 1, total: totalCount })}</strong></span><span class="vocab-counter-divider" style="opacity: 0.4; margin: 0 6px;">·</span><span class="streak-counter">${t('vocab.reviewed_count', { count: this.reviewCountInRun })}</span>
          </div>
        </div>

        <!-- Hairline Progress Bar -->
        <div class="vocab-progress-track" role="progressbar" aria-valuenow="${progressPct}" aria-valuemin="0" aria-valuemax="100">
          <div class="vocab-progress-fill" style="width: ${progressPct}%;"></div>
        </div>
      </div>

      <!-- Flashcard Slot -->
      <div class="dossier-card-slot"></div>

      <!-- Minimal Apple Navigation Bar -->
      <div class="vocab-apple-nav">
        <button type="button" class="vocab-nav-btn nav-btn-prev" aria-label="${t('vocab.prev')} (←)">
          ${icon('arrowLeft', 14)} <span>${t('vocab.prev')}</span>
        </button>
        <div class="vocab-hints-pill">
          <span>${t('vocab.shortcut_hint')}</span>
        </div>
        <button type="button" class="vocab-nav-btn nav-btn-next" aria-label="${t('vocab.next')} (→)">
          <span>${t('vocab.next')}</span> ${icon('arrowRight', 14)}
        </button>
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
    AcousticHaptics.tap();
    this.activeRemindCard = null; // Clear surprise status on manual step
    this.currentIndex = (this.currentIndex + delta + this.currentList.length) % this.currentList.length;
    this.renderCurrentCard();
    this.updateProgressCounters();
  }

  private updateProgressCounters(): void {
    const totalCount = Math.max(1, this.currentList.length);
    const counter = this.container.querySelector('.card-counter');
    if (counter) {
      counter.textContent = t('vocab.card_counter', { current: this.currentIndex + 1, total: totalCount });
    }
    const streakEl = this.container.querySelector('.streak-counter');
    if (streakEl) {
      streakEl.textContent = t('vocab.reviewed_count', { count: this.reviewCountInRun });
    }
    const fill = this.container.querySelector('.vocab-progress-fill') as HTMLElement | null;
    if (fill) {
      const pct = Math.min(100, Math.round(((this.currentIndex + 1) / totalCount) * 100));
      fill.style.width = `${pct}%`;
    }
  }

  private escapeHtml(raw: any): string {
    if (raw === undefined || raw === null) return '';
    return String(raw)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private renderCurrentCard(): void {
    const slot = this.container.querySelector('.dossier-card-slot');
    if (!slot) return;
    slot.innerHTML = '';

    if (this.currentList.length === 0) {
      slot.innerHTML = `
        <div class="empty-state-notice">
          <div class="telemetry-label">[TIER DEPLETED]</div>
          <p>${t('vocab.empty_tier')}</p>
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

    let categoryLabel = `${item.mode.replace('_', ' ')} · ${item.cefrLevel}`;
    if (isRemind) {
      categoryLabel = t('vocab.surprise_remind');
    }

    let backSubText = '';
    if (item.mode === 'ROOT_FORGE') {
      const b = item.breakdown || {};
      const familyChips = Array.isArray(b.derivationalFamily)
        ? b.derivationalFamily.map((fam: string) => `<span class="morph-chip">${this.escapeHtml(fam)}</span>`).join(' ')
        : this.escapeHtml(b.derivationalFamily || '—');

      backSubText = `
        <div class="morph-breakdown-box">
          <div class="morph-item morph-prefix">
            <span class="morph-label">Prefix</span>
            <span class="morph-val">${this.escapeHtml(b.prefix || 'None')}</span>
          </div>
          <div class="morph-item morph-root">
            <span class="morph-label">Root</span>
            <span class="morph-val highlight-root">${this.escapeHtml(b.root || '—')}</span>
          </div>
          <div class="morph-item morph-suffix">
            <span class="morph-label">Suffix</span>
            <span class="morph-val">${this.escapeHtml(b.suffix || 'None')}</span>
          </div>
          <div class="morph-item morph-family">
            <span class="morph-label">Family</span>
            <span class="morph-val morph-chips">${familyChips}</span>
          </div>
          <div class="morph-item morph-analysis">
            <span class="morph-label">Core Analysis</span>
            <span class="morph-val">${this.escapeHtml(b.morphologyAnalysis || '—')}</span>
          </div>
        </div>
      `;
    } else if (item.mode === 'CEFR_ASCENT') {
      const b = item.breakdown || {};
      const synonymsChips = Array.isArray(b.synonyms)
        ? b.synonyms.map((syn: string) => `<span class="morph-chip">${this.escapeHtml(syn)}</span>`).join(' ')
        : this.escapeHtml(b.synonyms || '—');

      backSubText = `
        <div class="morph-breakdown-box">
          <div class="morph-item">
            <span class="morph-label">CEFR</span>
            <span class="morph-val">${this.escapeHtml(b.cefrRank || '')} · ${this.escapeHtml(b.register || '')}</span>
          </div>
          <div class="morph-item">
            <span class="morph-label">Collocates</span>
            <span class="morph-val">${this.escapeHtml(Array.isArray(b.collocates) ? b.collocates.join(', ') : (b.collocates || '—'))}</span>
          </div>
          <div class="morph-item morph-family">
            <span class="morph-label">Synonyms</span>
            <span class="morph-val morph-chips">${synonymsChips}</span>
          </div>
        </div>
      `;
    } else if (item.mode === 'PARTICLE_LAB') {
      const b = item.breakdown || {};
      backSubText = `
        <div class="morph-breakdown-box">
          <div class="morph-item">
            <span class="morph-label">Verb</span>
            <span class="morph-val">${this.escapeHtml(b.verb || '—')}</span>
          </div>
          <div class="morph-item morph-root">
            <span class="morph-label">Particle</span>
            <span class="morph-val highlight-root">[ ${this.escapeHtml(b.particle || '—')} ]</span>
          </div>
          <div class="morph-item">
            <span class="morph-label">Archetype</span>
            <span class="morph-val">${this.escapeHtml(b.semanticArchetype || '—')}</span>
          </div>
          <div class="morph-item morph-analysis">
            <span class="morph-label">Logic</span>
            <span class="morph-val">${this.escapeHtml(b.particleLogic || '—')}</span>
          </div>
        </div>
      `;
    }

    this.currentCardHandle = AtomicCard.create({
      id: item.id,
      pillar: 'VOCAB',
      category: categoryLabel,
      indexStr: `[ ${this.currentIndex + 1} / ${this.currentList.length} ]`,
      statusBadge,
      hideFrontRating: true,
      front: {
        promptLabel: isRemind ? t('vocab.engram_check', undefined, 'RETRIEVAL ENGRAM CHECK') : t('vocab.prompt_label', undefined, 'CHALLENGE · RECALL & DECONSTRUCT'),
        mainText: item.wordOrChunk,
        subText: item.contextSentence
      },
      back: {
        promptLabel: t('vocab.semantic_matrix', undefined, 'SEMANTIC MATRIX & MORPHOLOGY'),
        mainText: `${item.definition}\n\n${t('feedback.vietnamese_translation')}: "${item.vietnamese}"`,
        subText: backSubText,
        ipa: item.ipa
      },
      audioText: item.wordOrChunk,
      onRate: (rating: 'again' | 'good') => {
        this.handleRate(item.id, rating, srsTier(item.cefrLevel));
      }
    });

    slot.appendChild(this.currentCardHandle.element);

    // Keep global mobile bottom dock cleanly visible instead of overriding with duplicate actions
    HeaderHUD.setContextualDock(null);
  }

  private handleRate(cardId: string, rating: 'again' | 'good', cardLevel: number): void {
    const srsState = StorageManager.getCardState(cardId);
    const nextCardState = SRSEngine.rateCard(srsState, cardId, rating, cardLevel);
    StorageManager.setCardState(cardId, nextCardState);

    const prevIndex = this.currentIndex;
    UndoManager.register(t('vocab.rated_undo'), () => {
      const state = StorageManager.loadState();
      if (srsState) {
        state.cardStates[cardId] = srsState;
      } else {
        delete state.cardStates[cardId];
      }
      StorageManager.saveState(state);
      this.reviewCountInRun = Math.max(0, this.reviewCountInRun - 1);
      this.currentIndex = prevIndex;
      this.renderCurrentCard();
      this.updateProgressCounters();
    });

    this.reviewCountInRun += 1;

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
    this.updateProgressCounters();
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

  public teardown(): void {
    HeaderHUD.setContextualDock(null);
  }
}
