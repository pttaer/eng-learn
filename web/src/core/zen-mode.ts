import { AudioSynthesizer } from './audio-synthesizer';
import { t } from './i18n';

export type ZenChangeListener = (active: boolean) => void;

/**
 * ZenMode: Distraction-free study immersion singleton (Cursor / VS Code inspired).
 * - Pure zero-chrome focus: Header HUD and bottom docks vanish into the void.
 * - Viewport dimming to #030303 & 65ch reading measure focus.
 * - Auto-hiding floating rescue pill revealing on hover near top edge.
 * - Global hotkey 'Z' / 'z' toggle + instant 'Escape' exit (Cursor panic-relief).
 * - Strict input element exclusion guard for editing.
 * - AudioSynthesizer 40Hz gamma binaural focus drone integration.
 */
export class ZenMode {
  private static instance: ZenMode | null = null;
  private static active: boolean = false;
  private static initialized: boolean = false;
  private static listeners: Set<ZenChangeListener> = new Set();
  private static boundKeyHandler: ((e: KeyboardEvent) => void) | null = null;
  private static boundMouseMoveHandler: ((e: MouseEvent) => void) | null = null;
  private static boundTouchStartHandler: ((e: TouchEvent) => void) | null = null;
  private static boundFullscreenHandler: (() => void) | null = null;
  private static wasFullscreen: boolean = false;
  private static pillElement: HTMLElement | null = null;
  private static hotzoneElement: HTMLElement | null = null;
  private static hideTimer: any = null;
  private static chordPending: boolean = false;
  private static chordTimer: any = null;

  private constructor() {
    // Singleton
  }

  public static getInstance(): ZenMode {
    if (!this.instance) {
      this.instance = new ZenMode();
    }
    return this.instance;
  }

  /**
   * Initializes ZenMode global keyboard listener and restores any session preference.
   */
  public static init(): void {
    if (this.initialized || typeof window === 'undefined') return;

    this.boundKeyHandler = (e: KeyboardEvent) => this.handleKeyDown(e);
    window.addEventListener('keydown', this.boundKeyHandler);

    if (!this.boundFullscreenHandler && typeof document !== 'undefined') {
      this.boundFullscreenHandler = () => {
        if (document.fullscreenElement) {
          this.wasFullscreen = true;
        } else if (this.wasFullscreen && this.active) {
          this.wasFullscreen = false;
          this.setZenMode(false);
        }
      };
      document.addEventListener('fullscreenchange', this.boundFullscreenHandler);
    }

    this.initialized = true;

    // Expose for headless browser testing and console telemetry
    (window as any).ZenMode = ZenMode;
  }

  /**
   * Checks whether Zen Immersion Mode is currently active.
   */
  public static isActive(): boolean {
    return this.active;
  }

  /**
   * Alias for isActive()
   */
  public static isZen(): boolean {
    return this.active;
  }

  /**
   * Toggles Zen Immersion Mode state.
   * @returns {boolean} The new active state
   */
  public static toggle(): boolean {
    return this.setZenMode(!this.active);
  }

  /**
   * Explicitly sets Zen Immersion Mode state.
   */
  public static setZenMode(active: boolean): boolean {
    if (this.active === active) return this.active;

    this.active = active;
    this.applyDOMClasses(this.active);

    if (this.active) {
      AudioSynthesizer.startFocusHum();
      try {
        AudioSynthesizer.play('absorb');
      } catch {}
      this.mountFloatingRescuePill();
      this.requestFullscreenSafe();
    } else {
      AudioSynthesizer.stopFocusHum();
      try {
        AudioSynthesizer.play('click');
      } catch {}
      this.unmountFloatingRescuePill();
      this.exitFullscreenSafe();
    }

    // Notify registered subscribers
    this.listeners.forEach((cb) => {
      try {
        cb(this.active);
      } catch (err) {
        console.error('[ZEN] Listener notification error:', err);
      }
    });

    // Dispatch DOM CustomEvent for decoupled components
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(
          new CustomEvent('eng:zen-toggle', {
            detail: { active: this.active }
          })
        );
      } catch {}
    }

    return this.active;
  }

  /**
   * Subscribes a listener callback to Zen mode changes.
   * Returns an unsubscribe function.
   */
  public static onChange(cb: ZenChangeListener): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  /**
   * Applies or removes `.zen-active` CSS classes from #app and document.body.
   */
  private static applyDOMClasses(active: boolean): void {
    if (typeof document === 'undefined') return;

    const appEl = document.getElementById('app');

    if (active) {
      document.body.classList.add('zen-active');
      if (appEl) appEl.classList.add('zen-active');
    } else {
      document.body.classList.remove('zen-active');
      if (appEl) appEl.classList.remove('zen-active');
    }
  }

  /**
   * Mounts the floating Cursor-style rescue pill and top hover trigger.
   */
  private static mountFloatingRescuePill(): void {
    if (typeof document === 'undefined' || !document.body || typeof document.createElement !== 'function') return;

    this.unmountFloatingRescuePill();

    const pill = document.createElement('div');
    pill.id = 'zen-floating-pill';
    pill.className = 'zen-floating-pill';
    pill.setAttribute('role', 'status');
    pill.setAttribute('aria-label', 'Zen Mode Active');
    pill.innerHTML = `
      <span class="zen-pill-icon" aria-hidden="true">☯</span>
      <span class="zen-pill-label">Zen Mode</span>
      <kbd class="zen-pill-kbd">Esc</kbd>
      <button type="button" class="zen-pill-exit" aria-label="${t('reading.exit_zen_tooltip', undefined, 'Exit Zen Mode (Esc)')}" title="Exit Zen Mode (Esc)">✕</button>
    `;

    const hotzone = document.createElement('div');
    hotzone.id = 'zen-top-hotzone';
    hotzone.className = 'zen-top-hotzone';

    // Click on exit button or pill exits Zen mode
    pill.querySelector('.zen-pill-exit')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.setZenMode(false);
    });
    pill.addEventListener('click', () => {
      this.setZenMode(false);
    });

    // Cursor-style hover retention: hovering over the pill preserves visibility
    pill.addEventListener('mouseenter', () => {
      if (this.hideTimer) {
        clearTimeout(this.hideTimer);
        this.hideTimer = null;
      }
      pill.classList.add('is-visible');
    });
    pill.addEventListener('mouseleave', () => {
      if (this.hideTimer) clearTimeout(this.hideTimer);
      this.hideTimer = setTimeout(() => {
        if (this.pillElement && this.active) {
          this.pillElement.classList.remove('is-visible');
        }
      }, 600);
    });

    try {
      document.body.appendChild(hotzone);
      document.body.appendChild(pill);
    } catch {}

    this.pillElement = pill;
    this.hotzoneElement = hotzone;

    // Cursor-style mouse detection: hover near top edge (<= 24px) reveals rescue pill
    if (typeof window !== 'undefined') {
      this.boundMouseMoveHandler = (e: MouseEvent) => {
        if (!this.active || !this.pillElement) return;
        if (e.clientY <= 24) {
          if (this.hideTimer) clearTimeout(this.hideTimer);
          this.pillElement.classList.add('is-visible');
        } else if (e.clientY > 56 && this.pillElement.classList.contains('is-visible')) {
          if (this.hideTimer) clearTimeout(this.hideTimer);
          this.hideTimer = setTimeout(() => {
            if (this.pillElement && this.active) {
              this.pillElement.classList.remove('is-visible');
            }
          }, 600);
        }
      };
      window.addEventListener('mousemove', this.boundMouseMoveHandler, { passive: true });

      // Touch detection: tap near top edge on mobile reveals rescue pill
      this.boundTouchStartHandler = (e: TouchEvent) => {
        if (!this.active || !this.pillElement) return;
        const touch = e.touches && e.touches[0];
        if (touch && touch.clientY <= 44) {
          if (this.hideTimer) clearTimeout(this.hideTimer);
          this.pillElement.classList.add('is-visible');
          this.hideTimer = setTimeout(() => {
            if (this.pillElement && this.active) {
              this.pillElement.classList.remove('is-visible');
            }
          }, 2400);
        }
      };
      window.addEventListener('touchstart', this.boundTouchStartHandler, { passive: true });
    }
  }

  /**
   * Cleanly unmounts floating rescue pill and clears listeners.
   */
  private static unmountFloatingRescuePill(): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }

    if (this.boundMouseMoveHandler && typeof window !== 'undefined') {
      window.removeEventListener('mousemove', this.boundMouseMoveHandler);
      this.boundMouseMoveHandler = null;
    }

    if (this.boundTouchStartHandler && typeof window !== 'undefined') {
      window.removeEventListener('touchstart', this.boundTouchStartHandler);
      this.boundTouchStartHandler = null;
    }

    if (this.pillElement) {
      try { this.pillElement.remove(); } catch {}
      this.pillElement = null;
    }

    if (this.hotzoneElement) {
      try { this.hotzoneElement.remove(); } catch {}
      this.hotzoneElement = null;
    }
  }

  /**
   * Defensively request fullscreen mode (like Cursor / VS Code Zen Mode).
   */
  private static requestFullscreenSafe(): void {
    try {
      if (
        typeof document !== 'undefined' &&
        document.documentElement &&
        typeof document.documentElement.requestFullscreen === 'function' &&
        !document.fullscreenElement
      ) {
        document.documentElement.requestFullscreen()
          .then(() => {
            this.wasFullscreen = true;
          })
          .catch(() => {});
      }
    } catch {}
  }

  /**
   * Defensively exit fullscreen mode when Zen Mode ends.
   */
  private static exitFullscreenSafe(): void {
    this.wasFullscreen = false;
    try {
      if (
        typeof document !== 'undefined' &&
        document.fullscreenElement &&
        typeof document.exitFullscreen === 'function'
      ) {
        document.exitFullscreen().catch(() => {});
      }
    } catch {}
  }

  /**
   * Global keydown handler with strict input exclusion guard.
   * - Instant 'Escape' exit from Zen mode (Cursor-like panic relief).
   * - Preserves Escape handling when modal dialog is open.
   * - Hotkey 'Z' / 'z' toggle.
   * - Ignores modifier combinations (Ctrl+Z, Meta+Z, Alt+Z) to protect Undo.
   */
  private static handleKeyDown(e: KeyboardEvent): void {
    // 0. Escape key exit (Cursor / VS Code iconic Zen mode exit)
    if (this.active && (e.key === 'Escape' || e.key === 'Esc')) {
      const modal = typeof document !== 'undefined'
        ? document.querySelector('.hud-modal-overlay, #hud-confirm-dialog, #ielts-confirm-dialog, .completion-modal-overlay, .mobile-drawer-sheet.is-open')
        : null;
      if (modal) {
        // Let the modal dismiss handler process Escape
        return;
      }
      e.preventDefault();
      this.setZenMode(false);
      return;
    }

    // 0.1 Cursor chord support: Ctrl+K / Cmd+K followed by Z
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      this.chordPending = true;
      if (this.chordTimer) clearTimeout(this.chordTimer);
      this.chordTimer = setTimeout(() => {
        this.chordPending = false;
      }, 1500);
      return;
    }

    if (this.chordPending && (e.key === 'z' || e.key === 'Z')) {
      e.preventDefault();
      this.chordPending = false;
      this.toggle();
      return;
    }

    // 1. Guard against modifier keys (Ctrl+Z / Cmd+Z is browser undo)
    if (e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }

    // 2. Input exclusion guard: ignore if typing in input, textarea, or contenteditable
    const target = e.target as HTMLElement | null;
    if (target) {
      const tagName = target.tagName ? target.tagName.toUpperCase() : '';
      if (
        tagName === 'INPUT' ||
        tagName === 'TEXTAREA' ||
        tagName === 'SELECT' ||
        target.isContentEditable ||
        (target as any).dataset?.noZen
      ) {
        return;
      }
    }

    // 3. Hotkey 'z' or 'Z' toggle
    if (e.key === 'z' || e.key === 'Z') {
      e.preventDefault();
      this.toggle();
    }
  }

  /**
   * Cleans up all event listeners, stops audio drone, and clears DOM state.
   */
  public static teardown(): void {
    if (this.boundKeyHandler && typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.boundKeyHandler);
      this.boundKeyHandler = null;
    }

    if (this.boundFullscreenHandler && typeof document !== 'undefined') {
      document.removeEventListener('fullscreenchange', this.boundFullscreenHandler);
      this.boundFullscreenHandler = null;
    }

    if (this.chordTimer) {
      clearTimeout(this.chordTimer);
      this.chordTimer = null;
    }
    this.chordPending = false;

    this.unmountFloatingRescuePill();

    if (this.active) {
      this.setZenMode(false);
    }

    this.listeners.clear();
    this.initialized = false;
  }

  // Instance bridge methods
  public init(): void { ZenMode.init(); }
  public isActive(): boolean { return ZenMode.isActive(); }
  public isZen(): boolean { return ZenMode.isZen(); }
  public toggle(): boolean { return ZenMode.toggle(); }
  public setZenMode(active: boolean): boolean { return ZenMode.setZenMode(active); }
  public onChange(cb: ZenChangeListener): () => void { return ZenMode.onChange(cb); }
  public teardown(): void { ZenMode.teardown(); }
}

// Auto-initialize in browser context
if (typeof window !== 'undefined') {
  ZenMode.init();
}
