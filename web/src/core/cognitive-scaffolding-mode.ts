/**
 * CognitiveScaffoldingEngine: Adaptive Cognitive Load Scaffolding Controller.
 * Manages the global interface mode toggle between:
 * - 'gentle' (Student Scaffolding Mode):
 *   Clean, low-stress, step-by-step guidance. Suppresses anxiety-inducing telemetry
 *   (dense raw decimal metrics, Myers character diff matrices, WPM formulas, raw theta).
 *   Features warm typography, spacious comfortable targets, and supportive pacing.
 * - 'cockpit' (Examiner / Tactical Mode):
 *   High-density tactical cockpit with full telemetry HUD, real-time WPM counters,
 *   nPVI prosody meters, F1/F2 frequency Hertz readouts, and CAT theta estimates.
 *
 * 100% offline, zero external dependencies.
 */

import { AcousticHaptics } from './acoustic-haptics';

export type CognitiveMode = 'gentle' | 'cockpit';

const STORAGE_KEY = 'eng_cognitive_scaffolding_mode';

export class CognitiveScaffoldingEngine {
  private static currentMode: CognitiveMode = 'gentle';
  private static initialized: boolean = false;

  public static init(): void {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    try {
      const saved = localStorage.getItem(STORAGE_KEY) as CognitiveMode | null;
      if (saved === 'cockpit' || saved === 'gentle') {
        this.currentMode = saved;
      } else {
        this.currentMode = 'gentle'; // Default to stress-free gentle mode
      }
    } catch {
      this.currentMode = 'gentle';
    }

    this.applyToDOM();
  }

  public static getMode(): CognitiveMode {
    if (!this.initialized) this.init();
    return this.currentMode;
  }

  public static isGentle(): boolean {
    return this.getMode() === 'gentle';
  }

  public static isCockpit(): boolean {
    return !this.isGentle();
  }

  public static setMode(mode: CognitiveMode): void {
    if (this.currentMode === mode && this.initialized) return;
    this.currentMode = mode;

    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {}

    this.applyToDOM();

    try {
      AcousticHaptics.flip();
    } catch {}

    this.notifyListeners();
  }

  public static toggle(): CognitiveMode {
    const next: CognitiveMode = this.isGentle() ? 'cockpit' : 'gentle';
    this.setMode(next);
    return next;
  }

  public static subscribe(callback: (mode: CognitiveMode) => void): () => void {
    if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return () => {};
    const handler = (e: Event) => callback((e as CustomEvent).detail.mode);
    window.addEventListener('eng:cognitive-mode-changed', handler);
    return () => {
      if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
        window.removeEventListener('eng:cognitive-mode-changed', handler);
      }
    };
  }

  private static notifyListeners(): void {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(
        new CustomEvent('eng:cognitive-mode-changed', {
          detail: { mode: this.currentMode }
        })
      );
    }
  }

  private static applyToDOM(): void {
    if (typeof document === 'undefined') return;
    document.documentElement.dataset.cognitiveMode = this.currentMode;
    document.body?.classList.toggle('mode-gentle', this.currentMode === 'gentle');
    document.body?.classList.toggle('mode-cockpit', this.currentMode === 'cockpit');
  }

  public static getModeMeta(): {
    mode: CognitiveMode;
    label: string;
    icon: string;
    description: string;
    badgeStyle: string;
  } {
    if (this.isGentle()) {
      return {
        mode: 'gentle',
        label: '🌱 Gentle Student Mode',
        icon: '🌱',
        description: 'Low-stress, step-by-step scaffolding with clean typography and hidden raw telemetry.',
        badgeStyle: 'background: rgba(52, 211, 153, 0.15); color: var(--good); border: 1px solid rgba(52, 211, 153, 0.3);'
      };
    } else {
      return {
        mode: 'cockpit',
        label: '⚡ Tactical Cockpit Mode',
        icon: '⚡',
        description: 'High-density tactical examiner cockpit with full telemetry HUD, live WPM, and acoustic meters.',
        badgeStyle: 'background: rgba(165, 180, 252, 0.15); color: var(--accent-gold); border: 1px solid rgba(165, 180, 252, 0.3);'
      };
    }
  }
}
