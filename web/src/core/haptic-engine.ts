export type HapticPattern =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'
  | 'selection';

/**
 * Cross-platform haptic feedback orchestrator utilizing the Vibration API.
 * Provides micro-tactile pulses on mobile devices during card flips, button clicks,
 * collocation absorption, and SRS interval state changes.
 */
export class HapticEngine {
  private static isAvailable: boolean =
    typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
  private static enabled: boolean = true;

  /**
   * Triggers a designated haptic cadence.
   * Degrades silently with zero exceptions if unsupported or blocked by browser permissions.
   */
  public static trigger(pattern: HapticPattern): void {
    if (!this.isAvailable || !this.enabled || typeof navigator === 'undefined') return;
    if (typeof navigator.userActivation !== 'undefined' && !navigator.userActivation.hasBeenActive) return;

    try {
      if (typeof navigator.vibrate !== 'function') return;

      switch (pattern) {
        case 'light':
        case 'selection':
          navigator.vibrate(10); // 10ms crisp tactile micro-pulse
          break;
        case 'medium':
          navigator.vibrate(25); // 25ms medium pulse
          break;
        case 'heavy':
          navigator.vibrate(45); // 45ms heavy pulse
          break;
        case 'success':
          navigator.vibrate([15, 30, 25]); // Dual-pulse rhythmic cadence
          break;
        case 'warning':
          navigator.vibrate([30, 40, 30]); // Staccato warning
          break;
        case 'error':
          navigator.vibrate([50, 60, 50, 60, 50]); // Multi-pulse alert
          break;
      }
    } catch {
      // Degrade silently without throwing if permission blocked
    }
  }

  public static setEnabled(state: boolean): void {
    this.enabled = state;
  }

  public static isEnabled(): boolean {
    return this.enabled;
  }

  public static checkAvailability(): boolean {
    this.isAvailable =
      typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
    return this.isAvailable;
  }
}
