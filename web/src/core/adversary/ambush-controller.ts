// web/src/core/adversary/ambush-controller.ts
import { AdversaryRegistry } from './adversary-registry';
import { CognitiveBottleneck } from './types';

const COOLDOWN_MS = 25 * 60 * 1000; // 25 minutes between unannounced flash audits
const LAST_INTERCEPT_KEY = 'eng_last_cognitive_interception_time';

export class AmbushController {
  public static canIntercept(): boolean {
    const lastTime = Number(localStorage.getItem(LAST_INTERCEPT_KEY) || 0);
    const now = Date.now();
    if (now - lastTime < COOLDOWN_MS) return false;

    const highest = AdversaryRegistry.getHighestThreat();
    // Only intercept if there is a threat level >= 2 active bottleneck
    return !!highest && highest.threatLevel >= 2;
  }

  public static recordInterception(): void {
    try {
      localStorage.setItem(LAST_INTERCEPT_KEY, String(Date.now()));
    } catch {}
  }

  public static getCandidate(): CognitiveBottleneck | null {
    if (!this.canIntercept()) return null;
    return AdversaryRegistry.getHighestThreat();
  }
}
