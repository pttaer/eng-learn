/**
 * Universal Sliding Lexicon Drawer
 * High-performance O(1) offline dictionary lookup, Greco-Latin etymology breakdown,
 * and 1-click SuperMemo-2 (SM-2) spaced repetition card bookmarking.
 */

import { icon } from '../utils/icons';
import { SRSEngine } from '../core/srs-engine';
import { StorageManager } from '../utils/storage';
import { AudioSynthesizer } from '../core/audio-synthesizer';
import { UndoManager } from '../core/undo-manager';
import { AcousticHaptics } from '../core/acoustic-haptics';
import vocabularyData from '../assets/data/vocabulary.json';
import collocationsData from '../assets/data/collocations.json';
import { t } from '../core/i18n';

export interface LexiconEntry {
  id?: string;
  word: string;
  ipa?: string;
  pos?: string;
  partOfSpeech?: string;
  root?: string;
  definition: string;
  vietnamese: string;
  collocations?: string[] | string;
  synonyms?: string[];
  level?: number;
  cefrLevel?: string;
  contextSentence?: string;
  contextTranslation?: string;
}

export class LexiconDrawer {
  private static instance: LexiconDrawer | null = null;

  private backdrop!: HTMLElement;
  private container!: HTMLElement;
  private floatingPill!: HTMLElement;

  private titleEl!: HTMLElement;
  private badgeEl!: HTMLElement;
  private ipaEl!: HTMLElement;
  private posEl!: HTMLElement;
  private cefrEl!: HTMLElement;
  private audioBtn!: HTMLButtonElement;
  private closeBtn!: HTMLButtonElement;

  private rootSection!: HTMLElement;
  private rootValueEl!: HTMLElement;
  private defValueEl!: HTMLElement;
  private vnValueEl!: HTMLElement;
  private synSection!: HTMLElement;
  private synContainer!: HTMLElement;
  private collocSection!: HTMLElement;
  private collocContainer!: HTMLElement;
  private contextSection!: HTMLElement;
  private contextValueEl!: HTMLElement;
  private contextVnEl!: HTMLElement;
  private exampleAudioBtn!: HTMLButtonElement;
  private exampleVnBtn!: HTMLButtonElement;

  private srsBtn!: HTMLButtonElement;
  private srsStatusEl!: HTMLElement;

  private isOpenState: boolean = false;
  private currentEntry: LexiconEntry | null = null;
  private previousActiveElement: HTMLElement | null = null;

  // High-performance O(1) Dictionary Lookup Map
  private dictionaryIndex: Map<string, LexiconEntry> = new Map();
  private indexReady: Promise<void> | null = null;

  constructor() {
    this.createDOM();
    this.bindEvents();
  }

  public static getInstance(): LexiconDrawer {
    if (!this.instance) {
      this.instance = new LexiconDrawer();
    }
    return this.instance;
  }

  public static init(): LexiconDrawer {
    return this.getInstance();
  }

  public static open(term: string): void {
    this.getInstance().open(term);
  }

  public static close(): void {
    this.getInstance().close();
  }

  public static isOpen(): boolean {
    return this.getInstance().isOpen();
  }

  /**
   * Loads the base dictionary on first use, then builds the index once.
   * A failed load is cleared so the next open retries.
   */
  private ensureIndex(): Promise<void> {
    if (!this.indexReady) {
      this.indexReady = import('../assets/data/lexicon-dictionary.json')
        .then((lexicon) => this.buildDictionaryIndex(lexicon.default))
        .catch(err => {
          this.indexReady = null;
          throw err;
        });
    }
    return this.indexReady;
  }

  /**
   * Pre-indexes all lexicon, vocabulary, and collocation data for strict O(1) lookup.
   */
  private buildDictionaryIndex(lexiconDictionaryData: any): void {
    // 1. Ingest base lexicon dictionary
    if (lexiconDictionaryData && typeof lexiconDictionaryData === 'object') {
      if (Array.isArray(lexiconDictionaryData)) {
        for (const item of lexiconDictionaryData as LexiconEntry[]) {
          if (item && item.word) {
            this.indexEntry(item.word, item);
          }
        }
      } else {
        for (const [key, val] of Object.entries(lexiconDictionaryData)) {
          if (val && typeof val === 'object') {
            this.indexEntry(key, val as LexiconEntry);
            if ((val as LexiconEntry).word) {
              this.indexEntry((val as LexiconEntry).word, val as LexiconEntry);
            }
          }
        }
      }
    }

    // 2. Ingest vocabulary items (Root Forge, CEFR Ascent, Particle Lab)
    if (Array.isArray(vocabularyData)) {
      for (const item of vocabularyData as any[]) {
        if (!item || !item.wordOrChunk) continue;
        const synonyms = item.breakdown?.synonyms
          ? (Array.isArray(item.breakdown.synonyms) ? item.breakdown.synonyms : [item.breakdown.synonyms])
          : [];
        const entry: LexiconEntry = {
          id: item.id,
          word: item.wordOrChunk,
          ipa: item.ipa || '',
          pos: item.mode === 'PARTICLE_LAB' ? 'phrasal verb' : (item.breakdown?.suffix?.includes('adjective') ? 'adj.' : (item.breakdown?.suffix?.includes('noun') ? 'noun' : (item.partOfSpeech || 'adj.'))),
          root: item.breakdown?.root || item.breakdown?.morphologyAnalysis || '',
          definition: item.definition || '',
          vietnamese: item.vietnamese || '',
          collocations: item.breakdown?.collocates
            ? (Array.isArray(item.breakdown.collocates) ? item.breakdown.collocates : String(item.breakdown.collocates).split(',').map((s: string) => s.trim()))
            : (item.breakdown?.derivationalFamily || []),
          synonyms: synonyms,
          level: item.level || 2,
          cefrLevel: item.cefrLevel || 'C2',
          contextSentence: item.contextSentence || ''
        };
        this.indexEntry(item.wordOrChunk, entry, false);
      }
    }

    // 3. Ingest collocations as fallback dictionary items
    if (Array.isArray(collocationsData)) {
      for (const item of collocationsData) {
        if (!item || !item.phrase) continue;
        const entry: LexiconEntry = {
          id: item.id,
          word: item.phrase,
          ipa: '',
          pos: 'collocation',
          root: `Category: ${item.category || 'Idiomatic / Academic'}`,
          definition: `Academic and professional collocation (${item.category || 'General'}).`,
          vietnamese: item.vietnamese || '',
          collocations: [item.phrase],
          level: 2,
          cefrLevel: 'B2',
          contextSentence: ''
        };
        this.indexEntry(item.phrase, entry, false);
      }
    }
  }

  private normalizeKey(raw: string): string {
    return raw
      .toLowerCase()
      .trim()
      .replace(/^['"“‘(]+|['"”’).,;:!?]+$/g, '');
  }

  private indexEntry(rawKey: string, entry: LexiconEntry, overwrite: boolean = true): void {
    const key = this.normalizeKey(rawKey);
    if (!key) return;
    const existing = this.dictionaryIndex.get(key);
    if (!existing || overwrite) {
      this.dictionaryIndex.set(key, entry);
    } else {
      // Merge missing metadata into existing record
      if (!existing.synonyms && entry.synonyms) existing.synonyms = entry.synonyms;
      if (!existing.cefrLevel && entry.cefrLevel) existing.cefrLevel = entry.cefrLevel;
      if (!existing.contextTranslation && entry.contextTranslation) existing.contextTranslation = entry.contextTranslation;
      if (existing.pos === 'word' && entry.pos && entry.pos !== 'word') existing.pos = entry.pos;
    }
  }

  /**
   * O(1) query with stemming and fallback normalization.
   */
  public lookup(rawTerm: string): LexiconEntry | null {
    if (!rawTerm) return null;
    const term = this.normalizeKey(rawTerm);
    if (!term) return null;

    // Direct O(1) match
    if (this.dictionaryIndex.has(term)) {
      return this.dictionaryIndex.get(term)!;
    }

    // Stemming checks (strip common morphological suffixes)
    const stemCandidates: string[] = [];
    if (term.endsWith("'s")) stemCandidates.push(term.slice(0, -2));
    if (term.endsWith("’s")) stemCandidates.push(term.slice(0, -2));
    if (term.endsWith("s") && !term.endsWith("ss")) stemCandidates.push(term.slice(0, -1));
    if (term.endsWith("es")) stemCandidates.push(term.slice(0, -2));
    if (term.endsWith("ed")) {
      stemCandidates.push(term.slice(0, -2));
      stemCandidates.push(term.slice(0, -1)); // e.g. shared -> share
    }
    if (term.endsWith("ing")) {
      stemCandidates.push(term.slice(0, -3));
      stemCandidates.push(term.slice(0, -3) + 'e'); // e.g. making -> make
    }
    if (term.endsWith("ly")) stemCandidates.push(term.slice(0, -2));

    for (const cand of stemCandidates) {
      const normalizedCand = this.normalizeKey(cand);
      if (normalizedCand && this.dictionaryIndex.has(normalizedCand)) {
        return this.dictionaryIndex.get(normalizedCand)!;
      }
    }

    return null;
  }

  /**
   * Constructs DOM hierarchy inside #hud-overlay.
   */
  private createDOM(): void {
    // 1. Semi-transparent backdrop
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'lexicon-drawer-backdrop';
    this.backdrop.setAttribute('aria-hidden', 'true');

    // 2. Sliding Drawer Container
    this.container = document.createElement('aside');
    this.container.className = 'lexicon-drawer';
    this.container.id = 'lexicon-drawer';
    this.container.setAttribute('role', 'dialog');
    this.container.setAttribute('aria-modal', 'true');
    this.container.setAttribute('aria-label', 'Lexicon Word Details');
    this.container.setAttribute('aria-hidden', 'true');
    this.container.setAttribute('tabindex', '-1');
    this.container.inert = true;

    this.container.innerHTML = `
      <div class="lexicon-drawer-handle" aria-hidden="true"></div>
      <div class="lexicon-drawer-header">
        <div class="lexicon-drawer-word-cluster">
          <div class="lexicon-drawer-badge" id="lexicon-drawer-badge" role="status">LEXICON // C2 MASTERY · TIER 3</div>
          <h2 class="lexicon-drawer-word" id="lexicon-drawer-title">Word</h2>
          <div class="lexicon-drawer-subhead">
            <button type="button" class="hud-btn lexicon-audio-btn" id="lexicon-audio-btn" aria-label="${t('tenses.listen_sentence_aria', undefined, 'Listen to pronunciation')}" title="${t('action.pronounce', undefined, 'Pronounce')}">
              <span aria-hidden="true">${icon('volume')}</span>
            </button>
            <span class="lexicon-drawer-ipa" id="lexicon-drawer-ipa">/ipa/</span>
            <span class="lexicon-drawer-pos" id="lexicon-drawer-pos">adj.</span>
            <span class="lexicon-drawer-cefr" id="lexicon-drawer-cefr">C2</span>
          </div>
        </div>
        <button type="button" class="lexicon-drawer-close" id="lexicon-drawer-close" aria-label="${t('lexicon.close', undefined, 'Close')}" title="${t('common.close', undefined, 'Close')} (Esc)">
          ✕
        </button>
      </div>

      <div class="lexicon-drawer-body">
        <div class="lexicon-section lexicon-root-section" id="lexicon-root-section">
          <div class="lexicon-section-label">${t('lexicon.etymology')}</div>
          <div class="lexicon-section-content lexicon-root-value" id="lexicon-root-val"></div>
        </div>

        <div class="lexicon-section lexicon-def-section">
          <div class="lexicon-section-label">${t('lexicon.definition')}</div>
          <div class="lexicon-section-content lexicon-def-value" id="lexicon-def-val"></div>
        </div>

        <div class="lexicon-section lexicon-vn-section">
          <div class="lexicon-section-label">${t('lexicon.vietnamese')}</div>
          <div class="lexicon-section-content lexicon-vn-value" id="lexicon-vn-val"></div>
        </div>

        <div class="lexicon-section lexicon-syn-section" id="lexicon-syn-section">
          <div class="lexicon-section-label">${t('lexicon.synonyms', undefined, 'Synonyms & Relatives')}</div>
          <div class="lexicon-colloc-tags" id="lexicon-syn-tags"></div>
        </div>

        <div class="lexicon-section lexicon-colloc-section" id="lexicon-colloc-section">
          <div class="lexicon-section-label">${t('lexicon.collocations')}</div>
          <div class="lexicon-colloc-tags" id="lexicon-colloc-tags"></div>
        </div>

        <div class="lexicon-section lexicon-context-section" id="lexicon-context-section">
          <div class="lexicon-section-label">${t('lexicon.context')}</div>
          <div class="lexicon-section-content lexicon-context-value" id="lexicon-context-val"></div>
          <div class="lexicon-context-vn" id="lexicon-context-vn" style="display: none;"></div>
          <div class="lexicon-example-actions">
            <button type="button" class="lexicon-example-btn" id="lexicon-example-audio" aria-label="${t('lexicon.example_listen', undefined, 'Listen to example sentence')}">
              <span aria-hidden="true">${icon('volume')}</span>
              <span>Listen</span>
            </button>
            <button type="button" class="lexicon-example-btn" id="lexicon-example-vn-toggle" aria-label="${t('lexicon.translate_sentence', undefined, 'Translate sentence')}">
              <span>🇻🇳 Dịch câu</span>
            </button>
          </div>
        </div>
      </div>

      <div class="lexicon-drawer-footer apple-modal-footer">
        <button type="button" class="hud-btn lexicon-srs-btn" id="lexicon-srs-btn" aria-label="${t('lexicon.add_to_srs_aria', undefined, 'Add word to SRS Spaced Repetition Deck')}">
          + ${t('lexicon.add_to_srs_deck', undefined, '+ Add to SRS Deck')}
        </button>
        <div class="lexicon-srs-status" id="lexicon-srs-status" aria-live="polite"></div>
      </div>
    `;

    // Cache element references
    this.titleEl = this.container.querySelector('#lexicon-drawer-title') as HTMLElement;
    this.badgeEl = this.container.querySelector('#lexicon-drawer-badge') as HTMLElement;
    this.ipaEl = this.container.querySelector('#lexicon-drawer-ipa') as HTMLElement;
    this.posEl = this.container.querySelector('#lexicon-drawer-pos') as HTMLElement;
    this.cefrEl = this.container.querySelector('#lexicon-drawer-cefr') as HTMLElement;
    this.audioBtn = this.container.querySelector('#lexicon-audio-btn') as HTMLButtonElement;
    this.closeBtn = this.container.querySelector('#lexicon-drawer-close') as HTMLButtonElement;

    this.rootSection = this.container.querySelector('#lexicon-root-section') as HTMLElement;
    this.rootValueEl = this.container.querySelector('#lexicon-root-val') as HTMLElement;
    this.defValueEl = this.container.querySelector('#lexicon-def-val') as HTMLElement;
    this.vnValueEl = this.container.querySelector('#lexicon-vn-val') as HTMLElement;
    this.synSection = this.container.querySelector('#lexicon-syn-section') as HTMLElement;
    this.synContainer = this.container.querySelector('#lexicon-syn-tags') as HTMLElement;
    this.collocSection = this.container.querySelector('#lexicon-colloc-section') as HTMLElement;
    this.collocContainer = this.container.querySelector('#lexicon-colloc-tags') as HTMLElement;
    this.contextSection = this.container.querySelector('#lexicon-context-section') as HTMLElement;
    this.contextValueEl = this.container.querySelector('#lexicon-context-val') as HTMLElement;
    this.contextVnEl = this.container.querySelector('#lexicon-context-vn') as HTMLElement;
    this.exampleAudioBtn = this.container.querySelector('#lexicon-example-audio') as HTMLButtonElement;
    this.exampleVnBtn = this.container.querySelector('#lexicon-example-vn-toggle') as HTMLButtonElement;

    this.srsBtn = this.container.querySelector('#lexicon-srs-btn') as HTMLButtonElement;
    this.srsStatusEl = this.container.querySelector('#lexicon-srs-status') as HTMLElement;

    // 3. Floating Quick Selection Pill
    this.floatingPill = document.createElement('div');
    this.floatingPill.className = 'lexicon-floating-pill';
    this.floatingPill.setAttribute('role', 'button');
    this.floatingPill.setAttribute('tabindex', '0');
    this.floatingPill.setAttribute('aria-label', t('lexicon.lookup_aria', undefined, 'Open Lexicon Drawer for selected text'));
    this.floatingPill.innerHTML = `${icon('book')} <span class="pill-word">${t('lexicon.lookup_selection', undefined, 'Lookup')}</span>`;

    // Clean DOM mount inside #hud-overlay (fallback to body)
    const hudOverlay = document.getElementById('hud-overlay') || document.body;
    hudOverlay.appendChild(this.backdrop);
    hudOverlay.appendChild(this.container);
    hudOverlay.appendChild(this.floatingPill);
  }

  /**
   * Binds interaction listeners for clicks, selections, and accessibility keys.
   */
  private bindEvents(): void {
    // Close button & backdrop click
    this.closeBtn.addEventListener('click', () => this.close());
    this.backdrop.addEventListener('click', () => this.close());

    // Swipe down to dismiss on mobile
    let touchStartY = 0;
    this.container.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) {
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    this.container.addEventListener('touchend', (e) => {
      if (e.changedTouches && e.changedTouches[0]) {
        const deltaY = e.changedTouches[0].clientY - touchStartY;
        if (deltaY > 80 && this.container.scrollTop <= 0) {
          this.close();
        }
      }
    }, { passive: true });

    // Escape hotkey listener
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpenState) {
        e.preventDefault();
        e.stopPropagation();
        this.close();
      }
    });

    // Pronunciation audio button
    this.audioBtn.addEventListener('click', () => {
      if (!this.currentEntry) return;
      this.playPronunciation(this.currentEntry.word);
    });

    // Context example audio button
    this.exampleAudioBtn.addEventListener('click', () => {
      if (!this.currentEntry?.contextSentence) return;
      this.playPronunciation(this.currentEntry.contextSentence);
    });

    // Context example Vietnamese translation toggle
    this.exampleVnBtn.addEventListener('click', () => {
      if (this.contextVnEl.style.display === 'none') {
        this.contextVnEl.style.display = 'block';
        AcousticHaptics.tap();
      } else {
        this.contextVnEl.style.display = 'none';
      }
    });

    // SRS Add Button
    this.srsBtn.addEventListener('click', () => {
      this.handleAddToSRS();
    });

    // 1. In-Text Click Listener: Intercepts clicks on .lexicon-word, [data-lexicon-word], or .vocab-target
    document.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement)?.closest(
        '.lexicon-word, [data-lexicon-word], .vocab-target, mark.reading-target-word'
      ) as HTMLElement | null;

      if (target) {
        const word = target.getAttribute('data-lexicon-word') ||
                     target.getAttribute('data-word') ||
                     target.textContent || '';
        if (word.trim()) {
          e.preventDefault();
          e.stopPropagation();
          this.open(word.trim());
        }
      }
    });

    // 2. Double-Click Listener inside #workspace-mount: instant word lookup
    document.addEventListener('dblclick', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#workspace-mount')) return;
      if (target.closest('.lexicon-drawer, button, input, textarea, .hud-btn')) return;

      const selection = window.getSelection();
      const selectedText = selection ? selection.toString().trim() : '';
      if (selectedText && selectedText.length >= 2 && selectedText.length <= 40 && !selectedText.includes('\n')) {
        this.open(selectedText);
      }
    });

    // 3. Selection Listener: Show floating lookup pill on text highlight
    document.addEventListener('mouseup', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('.lexicon-floating-pill, .lexicon-drawer')) return;

      setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
          this.hideFloatingPill();
          return;
        }

        const selectedText = selection.toString().trim();
        if (
          selectedText.length >= 2 &&
          selectedText.length <= 40 &&
          !selectedText.includes('\n') &&
          target.closest('#workspace-mount')
        ) {
          try {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              this.showFloatingPill(selectedText, rect);
              return;
            }
          } catch {
            // Range detached
          }
        }
        this.hideFloatingPill();
      }, 20);
    });

    // Floating pill click
    this.floatingPill.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const word = this.floatingPill.getAttribute('data-target-word');
      if (word) {
        this.open(word);
        this.hideFloatingPill();
      }
    });

    this.floatingPill.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const word = this.floatingPill.getAttribute('data-target-word');
        if (word) {
          this.open(word);
          this.hideFloatingPill();
        }
      }
    });
  }

  private showFloatingPill(word: string, rect: DOMRect): void {
    const pillWord = this.floatingPill.querySelector('.pill-word');
    if (pillWord) {
      pillWord.textContent = `"${word}"`;
    }
    this.floatingPill.setAttribute('data-target-word', word);

    const top = Math.max(10, rect.top - 46);
    const left = Math.min(window.innerWidth - 180, Math.max(10, rect.left + (rect.width / 2) - 60));

    this.floatingPill.style.top = `${top}px`;
    this.floatingPill.style.left = `${left}px`;
    this.floatingPill.style.display = 'flex';
  }

  private hideFloatingPill(): void {
    this.floatingPill.style.display = 'none';
  }

  /**
   * Opens the Lexicon Drawer for the specified word or term.
   */
  public open(term: string): void {
    this.hideFloatingPill();
    // A failed dictionary load still opens the drawer, with the fallback entry
    this.ensureIndex().catch(() => undefined).then(() => this.openEntry(term));
  }

  private openEntry(term: string): void {
    const cleanWord = this.normalizeKey(term);
    let entry = this.lookup(cleanWord);

    if (!entry) {
      // Graceful fallback for arbitrary highlighted words
      entry = {
        id: `custom-${cleanWord.replace(/[^a-z0-9]+/g, '-')}`,
        word: term.trim(),
        ipa: '',
        pos: 'adj.',
        partOfSpeech: 'adj.',
        root: 'Greco-Latin / Academic Lexical Item',
        definition: `Highlighted term from current study dossier: "${term.trim()}".`,
        vietnamese: 'Thuật ngữ học thuật đang nghiên cứu. Bấm để lưu vào bộ thẻ SRS.',
        collocations: [term.trim()],
        synonyms: [],
        level: 3,
        cefrLevel: 'C2',
        contextSentence: ''
      };
    }

    this.currentEntry = entry;
    this.renderEntry(entry);

    this.previousActiveElement = document.activeElement as HTMLElement | null;
    this.isOpenState = true;

    this.backdrop.classList.add('open');
    this.backdrop.setAttribute('aria-hidden', 'false');
    this.container.classList.add('open');
    this.container.setAttribute('aria-hidden', 'false');
    this.container.inert = false;

    // Accessibility: shift focus into sheet container (avoids stuck focus ring on X close button)
    setTimeout(() => {
      this.container.focus({ preventScroll: true });
    }, 50);

    AudioSynthesizer.play('click');
  }

  /**
   * Closes the drawer and restores focus.
   */
  public close(): void {
    if (!this.isOpenState) return;
    this.isOpenState = false;

    this.backdrop.classList.remove('open');
    this.backdrop.setAttribute('aria-hidden', 'true');
    this.container.classList.remove('open');
    this.container.setAttribute('aria-hidden', 'true');
    this.container.inert = true;

    if (this.previousActiveElement && typeof this.previousActiveElement.focus === 'function') {
      try {
        this.previousActiveElement.focus();
      } catch {
        // Element unmounted
      }
    }

    AudioSynthesizer.play('click');
  }

  public isOpen(): boolean {
    return this.isOpenState;
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  /**
   * Renders the entry details into the drawer.
   */
  private renderEntry(entry: LexiconEntry): void {
    this.titleEl.textContent = entry.word;

    const level = entry.level || 3;
    const tierLabel = level === 3 ? t('lexicon.tier_c2', undefined, 'C2 Mastery') : (level === 2 ? t('lexicon.tier_c1', undefined, 'C1 Advanced') : t('lexicon.tier_b2', undefined, 'B2 Intermediate'));
    this.badgeEl.textContent = `LEXICON // ${tierLabel.toUpperCase()} · TIER ${level}`;
    this.badgeEl.title = t('lexicon.tier_tooltip', undefined, `Tier ${level}: Advanced Lexical Item`);

    if (entry.ipa) {
      this.ipaEl.textContent = entry.ipa;
      this.ipaEl.style.display = 'inline-flex';
    } else {
      this.ipaEl.style.display = 'none';
    }

    // Part of speech formatting (clean, lowercase, e.g. "adj.")
    let posStr = (entry.pos && entry.pos !== 'word') ? entry.pos : (entry.partOfSpeech && entry.partOfSpeech !== 'word' ? entry.partOfSpeech : '');
    if (!posStr || posStr === 'word') {
      posStr = entry.word.endsWith('al') || entry.word.endsWith('ic') || entry.word.endsWith('ous') ? 'adj.' : 'adj.';
    }
    this.posEl.textContent = posStr.toLowerCase();

    // CEFR Level Chip
    const cefrStr = entry.cefrLevel || (level === 3 ? 'C2' : (level === 2 ? 'C1' : 'B2'));
    this.cefrEl.textContent = cefrStr;

    // Root section
    if (entry.root) {
      this.rootValueEl.textContent = entry.root;
      this.rootSection.style.display = 'flex';
    } else {
      this.rootSection.style.display = 'none';
    }

    // Meaning & Vietnamese
    this.defValueEl.textContent = entry.definition;
    this.vnValueEl.textContent = entry.vietnamese;

    // Synonyms & Relatives
    const synList: string[] = entry.synonyms || [];
    if (synList.length > 0) {
      this.synSection.style.display = 'flex';
      this.synContainer.innerHTML = '';
      synList.forEach((syn) => {
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'lexicon-colloc-pill syn-pill';
        pill.setAttribute('aria-label', `Synonym: ${syn}`);
        pill.innerHTML = `<b class="colloc-partner">${syn}</b>`;
        pill.addEventListener('click', (e) => {
          e.stopPropagation();
          AcousticHaptics.tap();
          this.open(syn);
        });
        this.synContainer.appendChild(pill);
      });
    } else {
      this.synSection.style.display = 'none';
    }

    // Collocations: Dim headword, bold & accent partner, audio cue
    this.collocContainer.innerHTML = '';
    const collocList: string[] = Array.isArray(entry.collocations)
      ? entry.collocations
      : (entry.collocations ? String(entry.collocations).split(',').map(s => s.trim()) : []);

    if (collocList.length > 0) {
      this.collocSection.style.display = 'flex';
      const cleanHead = this.normalizeKey(entry.word);
      collocList.forEach((colloc) => {
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'lexicon-colloc-pill';
        pill.setAttribute('aria-label', `Collocation: ${colloc}`);

        const lowerColloc = colloc.toLowerCase();
        let formattedHtml = colloc;
        if (lowerColloc.includes(cleanHead)) {
          const idx = lowerColloc.indexOf(cleanHead);
          const before = colloc.slice(0, idx);
          const headPart = colloc.slice(idx, idx + cleanHead.length);
          const after = colloc.slice(idx + cleanHead.length);

          const parts: string[] = [];
          if (before) parts.push(`<b class="colloc-partner">${before.trim()}</b>`);
          parts.push(`<span class="colloc-headword">${headPart}</span>`);
          if (after) parts.push(`<b class="colloc-partner">${after.trim()}</b>`);
          formattedHtml = parts.join(' ');
        }

        pill.innerHTML = `<span>${formattedHtml}</span><span class="colloc-cue" aria-hidden="true">${icon('volume')}</span>`;
        pill.addEventListener('click', (e) => {
          e.stopPropagation();
          AcousticHaptics.tap();
          this.playPronunciation(colloc);
        });
        this.collocContainer.appendChild(pill);
      });
    } else {
      this.collocSection.style.display = 'none';
    }

    // Context / Exemplar with highlighted headword and curly quotes
    if (entry.contextSentence) {
      const cleanHead = this.normalizeKey(entry.word);
      const regex = new RegExp(`\\b(${cleanHead})\\b`, 'gi');
      const highlighted = entry.contextSentence.replace(regex, '<strong class="lexicon-highlight">$1</strong>');
      this.contextValueEl.innerHTML = `“${highlighted}”`;
      this.contextSection.style.display = 'flex';

      const vnTrans = entry.contextTranslation || (entry.word.toLowerCase() === 'ephemeral'
        ? 'Sự nổi tiếng lan truyền trên mạng xã hội nổi tiếng là phù du, tan biến ngay khi các thuật toán phân bổ lại sự chú ý của người dùng.'
        : '');
      if (vnTrans) {
        this.contextVnEl.textContent = vnTrans;
        this.exampleVnBtn.style.display = 'inline-flex';
      } else {
        this.exampleVnBtn.style.display = 'none';
      }
      this.contextVnEl.style.display = 'none';
    } else {
      this.contextSection.style.display = 'none';
    }

    // SRS Button state
    this.updateSRSButtonState(entry);
  }

  private getCardId(entry: LexiconEntry): string {
    if (entry.id) return entry.id;
    const clean = this.normalizeKey(entry.word).replace(/\s+/g, '-');
    return `lex-${clean}`;
  }

  private updateSRSButtonState(entry: LexiconEntry): void {
    const cardId = this.getCardId(entry);
    const existing = StorageManager.getCardState(cardId);

    if (existing) {
      this.srsBtn.textContent = t('lexicon.in_srs_due_today', undefined, '✓ In SRS deck · due today');
      this.srsBtn.classList.add('is-added');
      this.srsBtn.disabled = true;

      const dueDate = new Date(existing.dueDate);
      const isDue = existing.dueDate <= Date.now();
      const statusText = isDue
        ? t('lexicon.status_due_today', { reps: existing.repetitions }, `Status: Due for review today (Reps: ${existing.repetitions})`)
        : t('lexicon.status_next_review', { days: existing.interval, date: dueDate.toLocaleDateString() }, `Status: Next review in ${existing.interval}d (${dueDate.toLocaleDateString()})`);
      this.srsStatusEl.textContent = statusText;
    } else {
      this.srsBtn.textContent = t('lexicon.add_to_srs_deck', undefined, '+ Add to SRS Deck');
      this.srsBtn.classList.remove('is-added');
      this.srsBtn.disabled = false;
      this.srsStatusEl.textContent = t('lexicon.status_not_in_srs', undefined, 'Not yet in your spaced repetition review queue');
    }
  }

  /**
   * 1-Click SRS Card Bookmarking handler.
   */
  private handleAddToSRS(): void {
    if (!this.currentEntry) return;
    const entry = this.currentEntry;
    const cardId = this.getCardId(entry);
    const level = entry.level || 2;

    // Invoke SRSEngine.addCard
    SRSEngine.addCard(cardId, level);

    // Audio cue & haptic
    AudioSynthesizer.play('absorb');
    AcousticHaptics.chime();

    // Notify RPG progression engine if available
    const progEngine = (window as any).ProgressionEngine;
    if (progEngine && typeof progEngine.recordActivity === 'function') {
      try {
        progEngine.recordActivity('srs', 1);
        progEngine.addXP(15);
      } catch {
        // progression engine error guard
      }
    }

    // Visual feedback
    this.srsBtn.textContent = t('lexicon.in_srs_due_today', undefined, '✓ In SRS deck · due today');
    this.srsBtn.classList.add('is-added');
    this.srsBtn.disabled = true;
    this.srsStatusEl.textContent = t('lexicon.status_due_today', { reps: 0 }, 'Status: Due for review today (Reps: 0)');

    // 4-Second Universal Undo Toast
    UndoManager.register(
      t('lexicon.added_toast', { word: entry.word }, `Added "${entry.word}" to SRS deck`),
      () => {
        StorageManager.deleteCardState(cardId);
        this.updateSRSButtonState(entry);
      },
      4000
    );

    // Haptic pulse if supported
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(30); } catch { /* noop */ }
    }
  }

  /**
   * Pronunciation synthesizer using native Web Speech API.
   */
  private playPronunciation(word: string): void {
    AudioSynthesizer.play('click');
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      } catch {
        // Speech synthesis unavailable
      }
    }
  }

  public teardown(): void {
    this.close();
    this.backdrop.remove();
    this.container.remove();
    this.floatingPill.remove();
  }
}

(window as any).LexiconDrawer = LexiconDrawer;
