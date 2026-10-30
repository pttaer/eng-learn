/**
 * Floating Quick Scratchpad & Draggable Object Engine
 * Ultra-smooth floating draggable note object and expandable scratchpad.
 * Zero lag, hardware-accelerated transforms, PointerCapture, persistent storage,
 * and /brainstorming, /boost, /ponytail ultra productivity tooling.
 */

import { icon } from '../utils/icons';
import { t } from '../core/i18n';
import { AcousticHaptics } from '../core/acoustic-haptics';
import { HapticEngine } from '../core/haptic-engine';

export type NoteCategory = 'brainstorm' | 'boost' | 'ponytail' | 'vocab' | 'grammar' | 'ielts' | 'ideas' | 'general';

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_NOTES_KEY = 'eng_floating_notes_v1';
const STORAGE_BUBBLE_POS_KEY = 'eng_floating_bubble_pos';
const STORAGE_WINDOW_POS_KEY = 'eng_floating_window_pos';
const STORAGE_MAXIMIZED_KEY = 'eng_floating_note_maximized';

const DEFAULT_NOTE: NoteItem = {
  id: 'default-welcome-note',
  title: 'Scratchpad & Productivity Hub',
  content: `# 💡 Scratchpad & Productivity Hub

- **Draggable & Expandable:** Drag this floating object anywhere across your study session.
- **1-Click Workflows:** One-click templates for **/brainstorming**, **/boost**, **/ponytail ultra**, and **IELTS**.
- **Real-Time Auto-Save:** Automatically saved offline in your browser.
- **Shortcuts:** \`Alt+N\` to toggle, \`Esc\` to minimize, \`Tab\` for clean indentation.

### Quick Actions
- [ ] Review B2/C2 Inversion & Clefting patterns
- [ ] Generate 1 /brainstorming blueprint for IELTS Task 2
- [ ] Apply /ponytail ultra audit to simplify study notes`,
  category: 'brainstorm',
  createdAt: Date.now(),
  updatedAt: Date.now()
};

export class FloatingNote {
  private static instance: FloatingNote | null = null;

  // DOM Elements
  private bubbleEl!: HTMLElement;
  private windowEl!: HTMLElement;
  private bubbleBadgeEl!: HTMLElement;
  private tabsStripEl!: HTMLElement;
  private categoriesEl!: HTMLElement;
  private titleInputEl!: HTMLInputElement;
  private textareaEl!: HTMLTextAreaElement;
  private wordCountEl!: HTMLElement;
  private charCountEl!: HTMLElement;
  private saveStatusEl!: HTMLElement;
  private maximizeBtnEl!: HTMLButtonElement;

  // State
  private notes: NoteItem[] = [];
  private activeNoteId: string = '';
  private selectedCategory: string = 'all';
  private isOpenState: boolean = false;
  private isMaximizedState: boolean = false;
  private saveTimeout: number | null = null;
  private justDraggedBubble: boolean = false;

  // Bubble Drag State
  private bubblePos = { x: 0, y: 0 };
  private bubbleDrag = {
    isDragging: false,
    startX: 0,
    startY: 0,
    initPosX: 0,
    initPosY: 0,
    moved: false,
    rafId: 0
  };

  // Window Drag State
  private windowPos = { x: 0, y: 0 };
  private windowDrag = {
    isDragging: false,
    startX: 0,
    startY: 0,
    initPosX: 0,
    initPosY: 0,
    moved: false,
    rafId: 0
  };

  constructor() {
    this.loadNotes();
    this.createDOM();
    this.restorePositions();
    this.bindEvents();
    this.renderTabs();
    this.renderActiveNote();
    this.updateBadge();
  }

  public static getInstance(): FloatingNote {
    if (!this.instance) {
      this.instance = new FloatingNote();
    }
    return this.instance;
  }

  public static init(): FloatingNote {
    return this.getInstance();
  }

  public static open(category?: NoteCategory): void {
    const inst = this.getInstance();
    if (category) {
      inst.setCategory(category);
    }
    inst.open();
  }

  public static minimize(): void {
    this.getInstance().minimize();
  }

  public static toggle(): void {
    const inst = this.getInstance();
    if (inst.isOpen()) {
      inst.minimize();
    } else {
      inst.open();
    }
  }

  public static isOpen(): boolean {
    return this.getInstance().isOpen();
  }

  public isOpen(): boolean {
    return this.isOpenState;
  }

  // ---------------------------------------------------------------------------
  // Storage & Persistence
  // ---------------------------------------------------------------------------

  private loadNotes(): void {
    try {
      const raw = localStorage.getItem(STORAGE_NOTES_KEY);
      if (raw) {
        this.notes = JSON.parse(raw);
      }
    } catch (e) {
      console.warn('[FloatingNote] Failed to load notes from storage:', e);
    }

    if (!Array.isArray(this.notes) || this.notes.length === 0) {
      this.notes = [{ ...DEFAULT_NOTE }];
    }

    this.activeNoteId = this.notes[0].id;
  }

  private saveNotes(): void {
    try {
      localStorage.setItem(STORAGE_NOTES_KEY, JSON.stringify(this.notes));
    } catch (e) {
      console.warn('[FloatingNote] Failed to save notes to storage:', e);
    }
    this.updateBadge();
  }

  private restorePositions(): void {
    // 1. Bubble position
    try {
      const rawBubble = localStorage.getItem(STORAGE_BUBBLE_POS_KEY);
      if (rawBubble) {
        this.bubblePos = JSON.parse(rawBubble);
      } else {
        const defaultX = Math.max(16, window.innerWidth - 170);
        const defaultY = Math.max(16, window.innerHeight - 140);
        this.bubblePos = { x: defaultX, y: defaultY };
      }
    } catch {
      this.bubblePos = { x: window.innerWidth - 170, y: window.innerHeight - 140 };
    }
    this.clampBubblePosition();
    this.applyBubbleTransform();

    // 2. Window position
    try {
      const rawWin = localStorage.getItem(STORAGE_WINDOW_POS_KEY);
      if (rawWin) {
        this.windowPos = JSON.parse(rawWin);
      } else {
        const defaultX = Math.max(16, window.innerWidth - 440);
        const defaultY = Math.max(40, window.innerHeight - 560);
        this.windowPos = { x: defaultX, y: defaultY };
      }
    } catch {
      this.windowPos = { x: Math.max(16, window.innerWidth - 440), y: 40 };
    }
    this.clampWindowPosition();
    this.applyWindowTransform();

    // 3. Maximized preference
    this.isMaximizedState = localStorage.getItem(STORAGE_MAXIMIZED_KEY) === 'true';
    if (this.isMaximizedState) {
      this.windowEl.classList.add('is-maximized');
    }
  }

  // ---------------------------------------------------------------------------
  // DOM Construction
  // ---------------------------------------------------------------------------

  private createDOM(): void {
    // 1. Draggable Floating Bubble (The Collapsed Object)
    this.bubbleEl = document.createElement('div');
    this.bubbleEl.className = 'floating-note-bubble interactive';
    this.bubbleEl.id = 'floating-note-bubble';
    this.bubbleEl.setAttribute('role', 'button');
    this.bubbleEl.setAttribute('tabindex', '0');
    this.bubbleEl.setAttribute('aria-label', 'Open Floating Scratchpad');
    this.bubbleEl.setAttribute('title', 'Quick Notes (Drag anywhere, click to expand, Alt+N)');

    this.bubbleEl.innerHTML = `
      <span class="bubble-grip" aria-hidden="true">${icon('grip', 13)}</span>
      <span class="bubble-icon" aria-hidden="true">${icon('note', 15)}</span>
      <span class="bubble-label">Notes</span>
      <span class="bubble-badge" id="floating-note-bubble-badge">1</span>
    `;
    this.bubbleBadgeEl = this.bubbleEl.querySelector('#floating-note-bubble-badge') as HTMLElement;

    // 2. Expandable Note Window
    this.windowEl = document.createElement('section');
    this.windowEl.className = 'floating-note-window interactive';
    this.windowEl.id = 'floating-note-window';
    this.windowEl.setAttribute('role', 'dialog');
    this.windowEl.setAttribute('aria-label', t('note.kicker', undefined, 'Floating Scratchpad'));
    this.windowEl.setAttribute('aria-hidden', 'true');
    this.windowEl.style.display = 'none';

    this.windowEl.innerHTML = `
      <header class="floating-note-header" id="floating-note-drag-handle">
        <div class="floating-note-title-cluster">
          <span class="floating-note-grip-icon" aria-hidden="true">${icon('grip', 14)}</span>
          <span class="floating-note-kicker">${t('note.kicker', undefined, 'SCRATCHPAD // QUICK NOTE')}</span>
        </div>
        <div class="floating-note-header-controls">
          <button type="button" class="floating-note-btn btn-accent" id="fn-btn-new" title="${t('note.btn_new_title', undefined, 'New Note')}" aria-label="${t('note.btn_new_title', undefined, 'New Note')}">
            ${icon('plus', 12)} <span class="btn-text">${t('note.btn_new', undefined, 'New')}</span>
          </button>
          <button type="button" class="floating-note-btn btn-icon-only" id="fn-btn-maximize" title="${t('note.toggle_size', undefined, 'Toggle Size')}" aria-label="${t('note.toggle_size', undefined, 'Toggle Size')}">
            ${icon('maximize', 13)}
          </button>
          <button type="button" class="floating-note-btn btn-icon-only" id="fn-btn-minimize" title="${t('note.minimize', undefined, 'Minimize (Esc)')}" aria-label="${t('note.minimize', undefined, 'Minimize (Esc)')}">
            ${icon('minimize', 13)}
          </button>
        </div>
      </header>

      <div class="floating-note-categories" id="floating-note-categories">
        <button type="button" class="floating-cat-chip active" data-cat="all">${t('note.cat_all', undefined, 'All')}</button>
        <button type="button" class="floating-cat-chip" data-cat="brainstorm">${t('note.cat_brainstorm', undefined, '💡 Brainstorm')}</button>
        <button type="button" class="floating-cat-chip" data-cat="boost">${t('note.cat_boost', undefined, '⚡ Boost')}</button>
        <button type="button" class="floating-cat-chip" data-cat="ponytail">${t('note.cat_ponytail', undefined, '✂️ Ponytail Ultra')}</button>
        <button type="button" class="floating-cat-chip" data-cat="ielts">${t('note.cat_ielts', undefined, '🎯 IELTS')}</button>
        <button type="button" class="floating-cat-chip" data-cat="vocab">${t('note.cat_vocab', undefined, '📚 Vocab')}</button>
        <button type="button" class="floating-cat-chip" data-cat="grammar">${t('note.cat_grammar', undefined, '⚡ Grammar')}</button>
        <button type="button" class="floating-cat-chip" data-cat="ideas">${t('note.cat_ideas', undefined, '✨ Ideas')}</button>
      </div>

      <div class="floating-note-tabs-strip" id="floating-note-tabs-strip"></div>

      <div class="floating-note-body">
        <input type="text" class="floating-note-title-input" id="floating-note-title-input" placeholder="${t('note.title_placeholder', undefined, 'Note Title...')}" aria-label="${t('note.title_aria', undefined, 'Note Title')}" />

        <div class="floating-note-toolbar">
          <button type="button" class="floating-note-tool-btn btn-template" id="fn-tool-brainstorm" title="${t('note.tool_brainstorm_title', undefined, 'Insert /brainstorming Strategy Template')}">${t('note.tool_brainstorm', undefined, '💡 /brainstorming')}</button>
          <button type="button" class="floating-note-tool-btn btn-template" id="fn-tool-boost" title="${t('note.tool_boost_title', undefined, 'Insert /boost High-Velocity Template')}">${t('note.tool_boost', undefined, '⚡ /boost')}</button>
          <button type="button" class="floating-note-tool-btn btn-template" id="fn-tool-ponytail" title="${t('note.tool_ponytail_title', undefined, 'Insert /ponytail ultra Minimalist Template')}">${t('note.tool_ponytail', undefined, '✂️ /ponytail ultra')}</button>
          <button type="button" class="floating-note-tool-btn btn-template" id="fn-tool-ielts" title="${t('note.tool_ielts_title', undefined, 'Insert IELTS Academic Blueprint')}">${t('note.tool_ielts', undefined, '🎯 IELTS Plan')}</button>
          <button type="button" class="floating-note-tool-btn" id="fn-tool-context" title="${t('note.tool_context_title', undefined, 'Attach Current View & Date')}">${t('note.tool_context', undefined, '📍 Context')}</button>
          <button type="button" class="floating-note-tool-btn" id="fn-tool-bullet" title="${t('note.tool_bullet_title', undefined, 'Add Bullet')}">${t('note.tool_bullet', undefined, '• Bullet')}</button>
          <button type="button" class="floating-note-tool-btn" id="fn-tool-check" title="${t('note.tool_check_title', undefined, 'Add Checklist Box')}">${t('note.tool_check', undefined, '☑ Check')}</button>
          <button type="button" class="floating-note-tool-btn" id="fn-tool-bold" title="${t('note.tool_bold_title', undefined, 'Make Bold')}">${t('note.tool_bold', undefined, '**B**')}</button>
          <button type="button" class="floating-note-tool-btn" id="fn-tool-copy" title="${t('note.tool_copy_title', undefined, 'Copy to Clipboard')}">${t('note.tool_copy', undefined, '📋 Copy')}</button>
          <button type="button" class="floating-note-tool-btn" id="fn-tool-export" title="${t('note.tool_export_title', undefined, 'Export as Markdown')}">${t('note.tool_export', undefined, '⬇ Export')}</button>
          <button type="button" class="floating-note-tool-btn" id="fn-tool-delete" title="${t('note.tool_delete_title', undefined, 'Delete Note')}">${t('note.tool_delete', undefined, '🗑 Delete')}</button>
        </div>

        <div class="floating-note-editor-wrapper">
          <textarea class="floating-note-textarea" id="floating-note-textarea" placeholder="${t('note.textarea_placeholder', undefined, 'Type anything... /brainstorming ideas, /boost drills, /ponytail ultra simplifications, IELTS arguments...')}" aria-label="${t('note.textarea_aria', undefined, 'Note Content')}" spellcheck="false"></textarea>
        </div>
      </div>

      <footer class="floating-note-footer">
        <div class="floating-note-telemetry-left">
          <span id="fn-word-count">0 words</span>
          <span>•</span>
          <span id="fn-char-count">0 chars</span>
        </div>
        <div class="floating-note-telemetry-right">
          <span id="fn-save-status"><span class="save-status-dot"></span>${t('note.saved', undefined, 'Saved')}</span>
        </div>
      </footer>
    `;

    this.tabsStripEl = this.windowEl.querySelector('#floating-note-tabs-strip') as HTMLElement;
    this.categoriesEl = this.windowEl.querySelector('#floating-note-categories') as HTMLElement;
    this.titleInputEl = this.windowEl.querySelector('#floating-note-title-input') as HTMLInputElement;
    this.textareaEl = this.windowEl.querySelector('#floating-note-textarea') as HTMLTextAreaElement;
    this.wordCountEl = this.windowEl.querySelector('#fn-word-count') as HTMLElement;
    this.charCountEl = this.windowEl.querySelector('#fn-char-count') as HTMLElement;
    this.saveStatusEl = this.windowEl.querySelector('#fn-save-status') as HTMLElement;
    this.maximizeBtnEl = this.windowEl.querySelector('#fn-btn-maximize') as HTMLButtonElement;

    // Clean DOM mount: attach to document.body
    document.body.appendChild(this.bubbleEl);
    document.body.appendChild(this.windowEl);
  }

  // ---------------------------------------------------------------------------
  // Interactions & Pointer Events (Dragging & Snapping)
  // ---------------------------------------------------------------------------

  private bindEvents(): void {
    // 1. Bubble Dragging & Click Handling
    this.bubbleEl.addEventListener('pointerdown', (e: PointerEvent) => this.onBubblePointerDown(e));
    window.addEventListener('pointermove', (e: PointerEvent) => this.onBubblePointerMove(e));
    window.addEventListener('pointerup', (e: PointerEvent) => this.onBubblePointerUp(e));
    window.addEventListener('pointercancel', (e: PointerEvent) => this.onBubblePointerUp(e));

    // Keyboard support on bubble
    this.bubbleEl.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.open();
      }
    });

    // Bubble click suppression after drag
    this.bubbleEl.addEventListener('click', (e: MouseEvent) => {
      if (this.justDraggedBubble) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      this.open();
    });

    // 2. Window Dragging via Header Handle
    const dragHandle = this.windowEl.querySelector('#floating-note-drag-handle') as HTMLElement;
    dragHandle.addEventListener('pointerdown', (e: PointerEvent) => this.onWindowPointerDown(e));
    window.addEventListener('pointermove', (e: PointerEvent) => this.onWindowPointerMove(e));
    window.addEventListener('pointerup', (e: PointerEvent) => this.onWindowPointerUp(e));
    window.addEventListener('pointercancel', (e: PointerEvent) => this.onWindowPointerUp(e));

    // 3. Window Controls
    this.windowEl.querySelector('#fn-btn-new')?.addEventListener('click', () => this.createNewNote());
    this.maximizeBtnEl.addEventListener('click', () => this.toggleMaximize());
    this.windowEl.querySelector('#fn-btn-minimize')?.addEventListener('click', () => this.minimize());

    // 4. Categories filter click
    this.categoriesEl.addEventListener('click', (e) => {
      const chip = (e.target as HTMLElement).closest('.floating-cat-chip') as HTMLElement;
      if (chip && chip.dataset.cat) {
        this.setCategory(chip.dataset.cat);
      }
    });

    // 5. Note Editing
    this.titleInputEl.addEventListener('input', () => this.onNoteInput());
    this.textareaEl.addEventListener('input', () => this.onNoteInput());

    // Keyboard tab handling in textarea
    this.textareaEl.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.textareaEl.selectionStart;
        const end = this.textareaEl.selectionEnd;
        const val = this.textareaEl.value;
        this.textareaEl.value = val.substring(0, start) + '  ' + val.substring(end);
        this.textareaEl.selectionStart = this.textareaEl.selectionEnd = start + 2;
        this.onNoteInput();
      }
    });

    // 6. Quick Tool Buttons: /brainstorming, /boost, /ponytail ultra, IELTS, etc.
    this.windowEl.querySelector('#fn-tool-brainstorm')?.addEventListener('click', () => {
      this.insertTemplate(
        `### 💡 /brainstorming // Strategy & Hypotheses\n- **Core Objective:** \n- **Key Hypotheses & Insights:** \n- **Architecture & Design Trade-offs:** \n- **Action Items & Drills:** \n  - [ ] `
      );
    });

    this.windowEl.querySelector('#fn-tool-boost')?.addEventListener('click', () => {
      this.insertTemplate(
        `### ⚡ /boost // High-Velocity Mastery\n- **Target Bottleneck / Skill Gap:** \n- **Power Lexicon & Phrasal Verbs:** \n- **High-Impact Sentence Pattern:** \n- **Rapid 60-Second Drill Goal:** \n  - [ ] `
      );
    });

    this.windowEl.querySelector('#fn-tool-ponytail')?.addEventListener('click', () => {
      this.insertTemplate(
        `### ✂️ /ponytail ultra // Ruthless Simplicity\n- **YAGNI Audit:** What can we completely eliminate?\n- **Native / Stdlib Solution (0 deps):** \n- **Shortest Path (1 line before 50):** \n- **Complexity Eliminated:** `
      );
    });

    this.windowEl.querySelector('#fn-tool-ielts')?.addEventListener('click', () => {
      this.insertTemplate(
        `### 🎯 IELTS Academic Blueprint\n- **Band Target:** 7.5+\n- **Task Type / Prompt:** \n- **Lexical Resource (AWL / Idiomatic):** \n- **Syntactic Structures (Complex / Passive):** \n- **Main Arguments:** \n  1. \n  2. `
      );
    });

    this.windowEl.querySelector('#fn-tool-context')?.addEventListener('click', () => {
      const hash = window.location.hash || '#tree';
      const now = new Date().toLocaleString();
      this.insertTemplate(`> [Context: ${hash.replace('#', '').toUpperCase()}] - ${now}\n`);
    });

    this.windowEl.querySelector('#fn-tool-bullet')?.addEventListener('click', () => this.insertPrefix('- '));
    this.windowEl.querySelector('#fn-tool-check')?.addEventListener('click', () => this.insertPrefix('- [ ] '));
    this.windowEl.querySelector('#fn-tool-bold')?.addEventListener('click', () => this.wrapSelection('**', '**'));

    this.windowEl.querySelector('#fn-tool-copy')?.addEventListener('click', () => this.copyCurrentNote());
    this.windowEl.querySelector('#fn-tool-export')?.addEventListener('click', () => this.exportCurrentNote());
    this.windowEl.querySelector('#fn-tool-delete')?.addEventListener('click', () => this.deleteCurrentNote());

    // 7. Global Keyboard Shortcuts: Alt+N toggles, Escape closes
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if ((e.altKey && (e.key === 'n' || e.key === 'N')) || (e.ctrlKey && e.altKey && (e.key === 'n' || e.key === 'N'))) {
        e.preventDefault();
        FloatingNote.toggle();
      } else if (e.key === 'Escape' && this.isOpenState) {
        this.minimize();
      }
    });

    // 8. Viewport Resize recalibration
    window.addEventListener('resize', () => {
      this.clampBubblePosition();
      this.applyBubbleTransform();
      this.clampWindowPosition();
      this.applyWindowTransform();
    });
  }

  // ---------------------------------------------------------------------------
  // Bubble Drag Logic (Zero-Lag PointerCapture)
  // ---------------------------------------------------------------------------

  private onBubblePointerDown(e: PointerEvent): void {
    if (e.button !== 0) return; // Only primary mouse button
    this.bubbleDrag.isDragging = true;
    this.bubbleDrag.moved = false;
    this.bubbleDrag.startX = e.clientX;
    this.bubbleDrag.startY = e.clientY;
    this.bubbleDrag.initPosX = this.bubblePos.x;
    this.bubbleDrag.initPosY = this.bubblePos.y;

    try {
      this.bubbleEl.setPointerCapture(e.pointerId);
    } catch { }
    this.bubbleEl.classList.add('is-dragging');
    HapticEngine.trigger('light');
  }

  private onBubblePointerMove(e: PointerEvent): void {
    if (!this.bubbleDrag.isDragging) return;

    const dx = e.clientX - this.bubbleDrag.startX;
    const dy = e.clientY - this.bubbleDrag.startY;

    if (!this.bubbleDrag.moved && Math.hypot(dx, dy) > 4) {
      this.bubbleDrag.moved = true;
    }

    if (this.bubbleDrag.moved) {
      this.bubblePos.x = this.bubbleDrag.initPosX + dx;
      this.bubblePos.y = this.bubbleDrag.initPosY + dy;

      if (!this.bubbleDrag.rafId) {
        this.bubbleDrag.rafId = requestAnimationFrame(() => {
          this.clampBubblePosition();
          this.applyBubbleTransform();
          this.bubbleDrag.rafId = 0;
        });
      }
    }
  }

  private onBubblePointerUp(e: PointerEvent): void {
    if (!this.bubbleDrag.isDragging) return;
    this.bubbleDrag.isDragging = false;
    this.bubbleEl.classList.remove('is-dragging');

    try {
      this.bubbleEl.releasePointerCapture(e.pointerId);
    } catch { }

    if (!this.bubbleDrag.moved) {
      // Tap / Click action -> Open note window
      AcousticHaptics.tap();
      this.open();
    } else {
      // Finished drag -> Snap to viewport edge if close & suppress next click
      this.justDraggedBubble = true;
      setTimeout(() => { this.justDraggedBubble = false; }, 120);

      this.snapBubbleToEdge();
      this.saveBubblePosition();
      AcousticHaptics.tap();
      HapticEngine.trigger('light');
    }
  }

  private clampBubblePosition(): void {
    const width = this.bubbleEl.offsetWidth || 110;
    const height = this.bubbleEl.offsetHeight || 44;
    const pad = 12;

    const isMobile = window.innerWidth <= 768;
    const bottomDockClearance = isMobile ? 96 : 24;
    const minX = pad;
    const maxX = Math.max(pad, window.innerWidth - width - pad);
    const minY = pad;
    const maxY = Math.max(pad, window.innerHeight - height - bottomDockClearance);

    this.bubblePos.x = Math.max(minX, Math.min(maxX, this.bubblePos.x));
    this.bubblePos.y = Math.max(minY, Math.min(maxY, this.bubblePos.y));
  }

  private snapBubbleToEdge(): void {
    const width = this.bubbleEl.offsetWidth || 110;
    const pad = 16;

    // Subtle edge magnet snap if within 60px of screen border
    if (this.bubblePos.x < 60) {
      this.bubblePos.x = pad;
    } else if (this.bubblePos.x > window.innerWidth - width - 60) {
      this.bubblePos.x = window.innerWidth - width - pad;
    }
    this.clampBubblePosition();
    this.applyBubbleTransform();
  }

  private applyBubbleTransform(): void {
    this.bubbleEl.style.transform = `translate3d(${this.bubblePos.x}px, ${this.bubblePos.y}px, 0)`;
  }

  private saveBubblePosition(): void {
    try {
      localStorage.setItem(STORAGE_BUBBLE_POS_KEY, JSON.stringify(this.bubblePos));
    } catch { }
  }

  // ---------------------------------------------------------------------------
  // Window Drag Logic
  // ---------------------------------------------------------------------------

  private onWindowPointerDown(e: PointerEvent): void {
    // Only drag from header handle, not from buttons/inputs
    if ((e.target as HTMLElement).closest('button, input')) return;
    if (e.button !== 0) return;
    if (window.innerWidth <= 768) return; // On mobile, window is docked cleanly

    this.windowDrag.isDragging = true;
    this.windowDrag.moved = false;
    this.windowDrag.startX = e.clientX;
    this.windowDrag.startY = e.clientY;
    this.windowDrag.initPosX = this.windowPos.x;
    this.windowDrag.initPosY = this.windowPos.y;

    const dragHandle = this.windowEl.querySelector('#floating-note-drag-handle') as HTMLElement;
    if (dragHandle && dragHandle.setPointerCapture) {
      try {
        dragHandle.setPointerCapture(e.pointerId);
      } catch { }
    }
    this.windowEl.classList.add('is-dragging');
  }

  private onWindowPointerMove(e: PointerEvent): void {
    if (!this.windowDrag.isDragging) return;

    const dx = e.clientX - this.windowDrag.startX;
    const dy = e.clientY - this.windowDrag.startY;

    if (!this.windowDrag.moved && Math.hypot(dx, dy) > 4) {
      this.windowDrag.moved = true;
    }

    if (this.windowDrag.moved) {
      this.windowPos.x = this.windowDrag.initPosX + dx;
      this.windowPos.y = this.windowDrag.initPosY + dy;

      if (!this.windowDrag.rafId) {
        this.windowDrag.rafId = requestAnimationFrame(() => {
          this.clampWindowPosition();
          this.applyWindowTransform();
          this.windowDrag.rafId = 0;
        });
      }
    }
  }

  private onWindowPointerUp(e: PointerEvent): void {
    if (!this.windowDrag.isDragging) return;
    this.windowDrag.isDragging = false;
    this.windowEl.classList.remove('is-dragging');

    const dragHandle = this.windowEl.querySelector('#floating-note-drag-handle') as HTMLElement;
    if (dragHandle && dragHandle.releasePointerCapture) {
      try {
        dragHandle.releasePointerCapture(e.pointerId);
      } catch { }
    }

    if (this.windowDrag.moved) {
      this.clampWindowPosition();
      this.applyWindowTransform();
      this.saveWindowPosition();
    }
  }

  private clampWindowPosition(): void {
    if (window.innerWidth <= 768) return;

    const width = this.windowEl.offsetWidth || 420;
    const height = this.windowEl.offsetHeight || 520;
    const pad = 12;

    const minX = pad;
    const maxX = Math.max(pad, window.innerWidth - width - pad);
    const minY = pad;
    const maxY = Math.max(pad, window.innerHeight - height - pad);

    this.windowPos.x = Math.max(minX, Math.min(maxX, this.windowPos.x));
    this.windowPos.y = Math.max(minY, Math.min(maxY, this.windowPos.y));
  }

  private applyWindowTransform(): void {
    if (window.innerWidth <= 768) {
      this.windowEl.style.transform = '';
    } else {
      this.windowEl.style.transform = `translate3d(${this.windowPos.x}px, ${this.windowPos.y}px, 0)`;
    }
  }

  private saveWindowPosition(): void {
    if (window.innerWidth <= 768) return;
    try {
      localStorage.setItem(STORAGE_WINDOW_POS_KEY, JSON.stringify(this.windowPos));
    } catch { }
  }

  // ---------------------------------------------------------------------------
  // Window Visibility & State Actions
  // ---------------------------------------------------------------------------

  public open(): void {
    this.isOpenState = true;
    this.windowEl.style.display = 'flex';
    this.windowEl.setAttribute('aria-hidden', 'false');
    this.bubbleEl.style.opacity = '0.35';

    // Position window reasonably close to the bubble if not set
    this.clampWindowPosition();
    this.applyWindowTransform();

    this.renderTabs();
    this.renderActiveNote();

    setTimeout(() => {
      this.textareaEl.focus();
    }, 50);

    AcousticHaptics.tap();
    HapticEngine.trigger('light');
  }

  public minimize(): void {
    this.isOpenState = false;
    this.windowEl.style.display = 'none';
    this.windowEl.setAttribute('aria-hidden', 'true');
    this.bubbleEl.style.opacity = '1';
    AcousticHaptics.tap();
    HapticEngine.trigger('light');
  }

  public toggleMaximize(): void {
    this.isMaximizedState = !this.isMaximizedState;
    if (this.isMaximizedState) {
      this.windowEl.classList.add('is-maximized');
      this.maximizeBtnEl.innerHTML = icon('minimize', 13);
      this.maximizeBtnEl.setAttribute('title', 'Restore Compact Size');
    } else {
      this.windowEl.classList.remove('is-maximized');
      this.maximizeBtnEl.innerHTML = icon('maximize', 13);
      this.maximizeBtnEl.setAttribute('title', 'Maximize Window');
    }
    localStorage.setItem(STORAGE_MAXIMIZED_KEY, String(this.isMaximizedState));
    this.clampWindowPosition();
    this.applyWindowTransform();
    AcousticHaptics.tap();
  }

  // ---------------------------------------------------------------------------
  // Notes Operations (Create, Update, Delete, Filter)
  // ---------------------------------------------------------------------------

  private setCategory(cat: string): void {
    this.selectedCategory = cat;
    this.categoriesEl.querySelectorAll('.floating-cat-chip').forEach(btn => {
      const match = (btn as HTMLElement).dataset.cat === cat;
      btn.classList.toggle('active', match);
    });

    // Check if current active note matches; if not, switch to first matching note
    const activeNote = this.getActiveNote();
    if (activeNote && cat !== 'all' && activeNote.category !== cat) {
      const firstInCat = this.notes.find(n => n.category === cat);
      if (firstInCat) {
        this.activeNoteId = firstInCat.id;
        this.renderActiveNote();
      }
    }
    this.renderTabs();
  }

  private getActiveNote(): NoteItem | undefined {
    return this.notes.find(n => n.id === this.activeNoteId) || this.notes[0];
  }

  private renderTabs(): void {
    const filteredNotes = this.selectedCategory === 'all'
      ? this.notes
      : this.notes.filter(n => n.category === this.selectedCategory);

    this.tabsStripEl.innerHTML = '';

    filteredNotes.forEach(note => {
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = `floating-note-tab-item ${note.id === this.activeNoteId ? 'active' : ''}`;
      tab.dataset.id = note.id;
      tab.innerHTML = `
        <span class="tab-icon" aria-hidden="true">${this.getCategoryIcon(note.category)}</span>
        <span class="tab-title-text">${note.title || 'Untitled Note'}</span>
      `;
      tab.addEventListener('click', () => {
        this.activeNoteId = note.id;
        this.renderTabs();
        this.renderActiveNote();
        AcousticHaptics.tap();
      });
      this.tabsStripEl.appendChild(tab);
    });
  }

  private getCategoryIcon(cat: NoteCategory): string {
    switch (cat) {
      case 'brainstorm': return '💡';
      case 'boost': return '⚡';
      case 'ponytail': return '✂️';
      case 'vocab': return '📚';
      case 'grammar': return '⚡';
      case 'ielts': return '🎯';
      case 'ideas': return '✨';
      default: return '📝';
    }
  }

  private renderActiveNote(): void {
    const note = this.getActiveNote();
    if (!note) return;

    this.titleInputEl.value = note.title;
    this.textareaEl.value = note.content;
    this.updateTelemetry();
  }

  private createNewNote(): void {
    const newCategory: NoteCategory = (this.selectedCategory !== 'all' ? this.selectedCategory : 'brainstorm') as NoteCategory;
    const newCatLabel = newCategory.charAt(0).toUpperCase() + newCategory.slice(1);
    const newNote: NoteItem = {
      id: 'note-' + Date.now(),
      title: t('note.new_note_default', { cat: newCatLabel }, `New ${newCatLabel} Note`),
      content: '',
      category: newCategory,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.notes.unshift(newNote);
    this.activeNoteId = newNote.id;
    this.saveNotes();
    this.renderTabs();
    this.renderActiveNote();
    this.titleInputEl.focus();
    this.titleInputEl.select();

    AcousticHaptics.flip();
    HapticEngine.trigger('success');
  }

  private deleteCurrentNote(): void {
    if (this.notes.length <= 1) {
      // If only one note exists, simply clear content
      const note = this.getActiveNote();
      if (note) {
        note.title = 'Quick Scratchpad';
        note.content = '';
        note.updatedAt = Date.now();
        this.saveNotes();
        this.renderTabs();
        this.renderActiveNote();
      }
      return;
    }

    const noteIdx = this.notes.findIndex(n => n.id === this.activeNoteId);
    if (noteIdx !== -1) {
      this.notes.splice(noteIdx, 1);
      this.activeNoteId = this.notes[0].id;
      this.saveNotes();
      this.renderTabs();
      this.renderActiveNote();
      AcousticHaptics.nudge();
      HapticEngine.trigger('medium');
    }
  }

  private onNoteInput(): void {
    const note = this.getActiveNote();
    if (!note) return;

    note.title = this.titleInputEl.value;
    note.content = this.textareaEl.value;
    note.updatedAt = Date.now();

    this.updateTelemetry();
    this.showSavingIndicator();

    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = window.setTimeout(() => {
      this.saveNotes();
      this.renderTabs();
      this.showSavedIndicator();
    }, 200);
  }

  private updateTelemetry(): void {
    const text = this.textareaEl.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const chars = text.length;

    this.wordCountEl.textContent = t('note.word_count', { count: words }, `${words} words`);
    this.charCountEl.textContent = t('note.char_count', { count: chars }, `${chars} chars`);
  }

  private showSavingIndicator(): void {
    this.saveStatusEl.innerHTML = `<span class="save-status-dot saving"></span>${t('note.saving', undefined, 'Saving...')}`;
  }

  private showSavedIndicator(): void {
    this.saveStatusEl.innerHTML = `<span class="save-status-dot"></span>${t('note.saved', undefined, 'Saved')}`;
  }

  private updateBadge(): void {
    if (this.bubbleBadgeEl) {
      this.bubbleBadgeEl.textContent = String(this.notes.length);
    }
  }

  // ---------------------------------------------------------------------------
  // Toolbar Editor Utilities
  // ---------------------------------------------------------------------------

  private insertTemplate(template: string): void {
    const start = this.textareaEl.selectionStart;
    const end = this.textareaEl.selectionEnd;
    const val = this.textareaEl.value;
    const prefix = val.length > 0 && !val.endsWith('\n\n') ? '\n\n' : '';
    this.textareaEl.value = val.substring(0, start) + prefix + template + '\n' + val.substring(end);
    this.textareaEl.selectionStart = this.textareaEl.selectionEnd = start + prefix.length + template.length;
    this.textareaEl.focus();
    this.onNoteInput();
    AcousticHaptics.flip();
  }

  private insertPrefix(prefix: string): void {
    const start = this.textareaEl.selectionStart;
    const end = this.textareaEl.selectionEnd;
    const val = this.textareaEl.value;
    this.textareaEl.value = val.substring(0, start) + prefix + val.substring(end);
    this.textareaEl.selectionStart = this.textareaEl.selectionEnd = start + prefix.length;
    this.textareaEl.focus();
    this.onNoteInput();
    AcousticHaptics.tap();
  }

  private wrapSelection(before: string, after: string): void {
    const start = this.textareaEl.selectionStart;
    const end = this.textareaEl.selectionEnd;
    const val = this.textareaEl.value;
    const selected = val.substring(start, end) || 'text';
    this.textareaEl.value = val.substring(0, start) + before + selected + after + val.substring(end);
    this.textareaEl.selectionStart = start + before.length;
    this.textareaEl.selectionEnd = start + before.length + selected.length;
    this.textareaEl.focus();
    this.onNoteInput();
    AcousticHaptics.tap();
  }

  private copyCurrentNote(): void {
    const note = this.getActiveNote();
    if (!note) return;

    const fullText = `# ${note.title}\n\n${note.content}`;
    navigator.clipboard.writeText(fullText).then(() => {
      this.saveStatusEl.textContent = t('note.copied', undefined, '✓ Copied to clipboard!');
      AcousticHaptics.chime();
      HapticEngine.trigger('success');
      setTimeout(() => this.showSavedIndicator(), 2000);
    }).catch(() => {
      this.saveStatusEl.textContent = t('common.error', undefined, 'Error copying');
    });
  }

  private exportCurrentNote(): void {
    const note = this.getActiveNote();
    if (!note) return;

    const filename = `${(note.title || 'scratchpad-note').toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    const fullText = `# ${note.title}\nCategory: ${note.category}\nDate: ${new Date(note.updatedAt).toISOString()}\n\n${note.content}`;

    const blob = new Blob([fullText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    AcousticHaptics.tap();
    HapticEngine.trigger('light');
  }
}

// Global expose for automated testing and browser inspections
(window as any).FloatingNote = FloatingNote;
