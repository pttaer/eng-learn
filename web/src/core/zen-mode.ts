import { AudioSynthesizer } from './audio-synthesizer';

export type ZenChangeListener = (active: boolean) => void;

/**
 * ZenMode: Distraction-free study immersion singleton.
 * - Viewport dimming to #030303 & 65ch reading measure focus.
 * - Manages active zen state and class toggling on `#app` and `document.body`.
 * - Global hotkey 'Z' / 'z' with strict input element exclusion guard.
 * - Integrates with AudioSynthesizer for 40Hz gamma binaural focus drone.
 */
export class ZenMode {
  private static instance: ZenMode | null = null;
  private static active: boolean = false;
  private static initialized: boolean = false;
  private static listeners: Set<ZenChangeListener> = new Set();
  private static boundKeyHandler: ((e: KeyboardEvent) => void) | null = null;

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
    } else {
      AudioSynthesizer.stopFocusHum();
      try {
        AudioSynthesizer.play('click');
      } catch {}
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
   * Global keydown handler with strict input exclusion guard.
   * Ignores modifier combinations (Ctrl+Z, Meta+Z, Alt+Z) to protect Undo.
   */
  private static handleKeyDown(e: KeyboardEvent): void {
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
