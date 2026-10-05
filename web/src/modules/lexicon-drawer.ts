/**
 * Universal Sliding Lexicon Drawer
 * High-performance O(1) offline dictionary lookup, Greco-Latin etymology breakdown,
 * and 1-click SuperMemo-2 (SM-2) spaced repetition card bookmarking.
 */

import { icon } from '../utils/icons';
import { SRSEngine } from '../core/srs-engine';
import { StorageManager } from '../utils/storage';
import { AudioSynthesizer } from '../core/audio-synthesizer';
import lexiconDictionaryData from '../assets/data/lexicon-dictionary.json';
import vocabularyData from '../assets/data/vocabulary.json';
import collocationsData from '../assets/data/collocations.json';

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
  level?: number;
  contextSentence?: string;
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
  private audioBtn!: HTMLButtonElement;
  private closeBtn!: HTMLButtonElement;

  private rootSection!: HTMLElement;
  private rootValueEl!: HTMLElement;
  private defValueEl!: HTMLElement;
  private vnValueEl!: HTMLElement;
  private collocSection!: HTMLElement;
  private collocContainer!: HTMLElement;
  private contextSection!: HTMLElement;
  private contextValueEl!: HTMLElement;

  private srsBtn!: HTMLButtonElement;
  private srsStatusEl!: HTMLElement;

  private isOpenState: boolean = false;
  private currentEntry: LexiconEntry | null = null;
  private previousActiveElement: HTMLElement | null = null;

  // High-performance O(1) Dictionary Lookup Map
  private dictionaryIndex: Map<string, LexiconEntry> = new Map();

  constructor() {
    this.buildDictionaryIndex();
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
   * Pre-indexes all lexicon, vocabulary, and collocation data for strict O(1) lookup.
   */
  private buildDictionaryIndex(): void {
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
      for (const item of vocabularyData) {
        if (!item || !item.wordOrChunk) continue;
        const entry: LexiconEntry = {
          id: item.id,
          word: item.wordOrChunk,
          ipa: item.ipa || '',
          pos: item.mode === 'PARTICLE_LAB' ? 'phrasal verb' : (item.breakdown?.suffix?.includes('adjective') ? 'adj' : (item.breakdown?.suffix?.includes('noun') ? 'noun' : 'word')),
          root: item.breakdown?.root || item.breakdown?.morphologyAnalysis || '',
          definition: item.definition || '',
          vietnamese: item.vietnamese || '',
          collocations: item.breakdown?.collocates
            ? (Array.isArray(item.breakdown.collocates) ? item.breakdown.collocates : String(item.breakdown.collocates).split(',').map((s: string) => s.trim()))
            : (item.breakdown?.derivationalFamily || []),
          level: item.level || 2,
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
    if (overwrite || !this.dictionaryIndex.has(key)) {
      this.dictionaryIndex.set(key, entry);
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

    this.container.innerHTML = `
      <div class="lexicon-drawer-header">
        <div class="lexicon-drawer-word-cluster">
          <div class="lexicon-drawer-badge" id="lexicon-drawer-badge">LEXICON // C2 AWL</div>
          <h2 class="lexicon-drawer-word" id="lexicon-drawer-title">Word</h2>
          <div class="lexicon-drawer-subhead">
            <span class="lexicon-drawer-ipa" id="lexicon-drawer-ipa">/ipa/</span>
            <span class="lexicon-drawer-pos" id="lexicon-drawer-pos">POS</span>
            <button type="button" class="hud-btn lexicon-audio-btn" id="lexicon-audio-btn" aria-label="Listen to pronunciation" title="Pronounce">
              <span aria-hidden="true">${icon('volume')}</span>
            </button>
          </div>
        </div>
        <button type="button" class="hud-btn lexicon-drawer-close" id="lexicon-drawer-close" aria-label="Close Lexicon Drawer" title="Close (Esc)">
          ✕
        </button>
      </div>

      <div class="lexicon-drawer-body">
        <div class="lexicon-section lexicon-root-section" id="lexicon-root-section">
          <div class="lexicon-section-label">GRECO-LATIN ROOT & MORPHOLOGY</div>
          <div class="lexicon-section-content lexicon-root-value" id="lexicon-root-val"></div>
        </div>

        <div class="lexicon-section lexicon-def-section">
          <div class="lexicon-section-label">MEANING / DEFINITION</div>
          <div class="lexicon-section-content lexicon-def-value" id="lexicon-def-val"></div>
        </div>

        <div class="lexicon-section lexicon-vn-section">
          <div class="lexicon-section-label">VIETNAMESE EQUIVALENT</div>
          <div class="lexicon-section-content lexicon-vn-value" id="lexicon-vn-val"></div>
        </div>

        <div class="lexicon-section lexicon-colloc-section" id="lexicon-colloc-section">
          <div class="lexicon-section-label">ACADEMIC COLLOCATIONS</div>
          <div class="lexicon-colloc-tags" id="lexicon-colloc-tags"></div>
        </div>

        <div class="lexicon-section lexicon-context-section" id="lexicon-context-section">
          <div class="lexicon-section-label">CONTEXT & EXEMPLAR</div>
          <div class="lexicon-section-content lexicon-context-value" id="lexicon-context-val"></div>
        </div>
      </div>

      <div class="lexicon-drawer-footer">
        <button type="button" class="hud-btn lexicon-srs-btn" id="lexicon-srs-btn" aria-label="Add word to SRS Spaced Repetition Deck">
          + Add to SRS Deck
        </button>
        <div class="lexicon-srs-status" id="lexicon-srs-status" aria-live="polite"></div>
      </div>
    `;

    // Cache element references
    this.titleEl = this.container.querySelector('#lexicon-drawer-title') as HTMLElement;
    this.badgeEl = this.container.querySelector('#lexicon-drawer-badge') as HTMLElement;
    this.ipaEl = this.container.querySelector('#lexicon-drawer-ipa') as HTMLElement;
    this.posEl = this.container.querySelector('#lexicon-drawer-pos') as HTMLElement;
    this.audioBtn = this.container.querySelector('#lexicon-audio-btn') as HTMLButtonElement;
    this.closeBtn = this.container.querySelector('#lexicon-drawer-close') as HTMLButtonElement;

    this.rootSection = this.container.querySelector('#lexicon-root-section') as HTMLElement;
    this.rootValueEl = this.container.querySelector('#lexicon-root-val') as HTMLElement;
    this.defValueEl = this.container.querySelector('#lexicon-def-val') as HTMLElement;
    this.vnValueEl = this.container.querySelector('#lexicon-vn-val') as HTMLElement;
    this.collocSection = this.container.querySelector('#lexicon-colloc-section') as HTMLElement;
    this.collocContainer = this.container.querySelector('#lexicon-colloc-tags') as HTMLElement;
    this.contextSection = this.container.querySelector('#lexicon-context-section') as HTMLElement;
    this.contextValueEl = this.container.querySelector('#lexicon-context-val') as HTMLElement;

    this.srsBtn = this.container.querySelector('#lexicon-srs-btn') as HTMLButtonElement;
    this.srsStatusEl = this.container.querySelector('#lexicon-srs-status') as HTMLElement;

    // 3. Floating Quick Selection Pill
    this.floatingPill = document.createElement('div');
    this.floatingPill.className = 'lexicon-floating-pill';
    this.floatingPill.setAttribute('role', 'button');
    this.floatingPill.setAttribute('tabindex', '0');
    this.floatingPill.setAttribute('aria-label', 'Open Lexicon Drawer for selected text');
    this.floatingPill.innerHTML = `${icon('book')} <span class="pill-word">Lookup</span>`;

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
    const cleanWord = this.normalizeKey(term);
    let entry = this.lookup(cleanWord);

    if (!entry) {
      // Graceful fallback for arbitrary highlighted words
      entry = {
        id: `custom-${cleanWord.replace(/[^a-z0-9]+/g, '-')}`,
        word: term.trim(),
        ipa: '',
        pos: 'academic token',
        root: 'Greco-Latin / Academic Lexical Item',
        definition: `Highlighted term from current study dossier: "${term.trim()}".`,
        vietnamese: 'Thuật ngữ học thuật đang nghiên cứu. Bấm để lưu vào bộ thẻ SRS.',
        collocations: [term.trim()],
        level: 2,
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

    // Accessibility: shift focus into close button
    setTimeout(() => {
      this.closeBtn.focus();
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
    this.badgeEl.textContent = `LEXICON // ${entry.level ? `TIER ${entry.level}` : 'C2 AWL'}`;

    if (entry.ipa) {
      this.ipaEl.textContent = entry.ipa;
      this.ipaEl.style.display = 'inline-block';
    } else {
      this.ipaEl.style.display = 'none';
    }

    this.posEl.textContent = (entry.pos || entry.partOfSpeech || 'term').toUpperCase();

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

    // Collocations
    this.collocContainer.innerHTML = '';
    const collocList: string[] = Array.isArray(entry.collocations)
      ? entry.collocations
      : (entry.collocations ? String(entry.collocations).split(',').map(s => s.trim()) : []);

    if (collocList.length > 0) {
      this.collocSection.style.display = 'flex';
      collocList.forEach((colloc) => {
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'lexicon-colloc-pill';
        pill.textContent = colloc;
        pill.setAttribute('aria-label', `Look up collocation: ${colloc}`);
        pill.addEventListener('click', (e) => {
          e.stopPropagation();
          this.open(colloc);
        });
        this.collocContainer.appendChild(pill);
      });
    } else {
      this.collocSection.style.display = 'none';
    }

    // Context / Exemplar
    if (entry.contextSentence) {
      this.contextValueEl.textContent = `"${entry.contextSentence}"`;
      this.contextSection.style.display = 'flex';
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
      this.srsBtn.textContent = '✓ In SRS Deck';
      this.srsBtn.classList.add('is-added');
      this.srsBtn.disabled = true;

      const dueDate = new Date(existing.dueDate);
      const isDue = existing.dueDate <= Date.now();
      const statusText = isDue
        ? `Status: Due for review today (Reps: ${existing.repetitions})`
        : `Status: Next review in ${existing.interval}d (${dueDate.toLocaleDateString()})`;
      this.srsStatusEl.textContent = statusText;
    } else {
      this.srsBtn.textContent = '+ Add to SRS Deck';
      this.srsBtn.classList.remove('is-added');
      this.srsBtn.disabled = false;
      this.srsStatusEl.textContent = 'Not yet in your spaced repetition review queue';
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

    // Audio cue
    AudioSynthesizer.play('absorb');

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
    this.srsBtn.textContent = '✓ Added to SRS Deck';
    this.srsBtn.classList.add('is-added');
    this.srsBtn.disabled = true;
    this.srsStatusEl.textContent = 'Card scheduled! Initial review due in 1 day (EF: 2.50)';

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
