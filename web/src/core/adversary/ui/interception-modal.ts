// web/src/core/adversary/ui/interception-modal.ts
import { CognitiveBottleneck } from '../types';
import { MutationEngine, AdversaryChallenge } from '../mutation-engine';
import { AmbushController } from '../ambush-controller';
import { AdversaryRegistry } from '../adversary-registry';
import { AcousticHaptics } from '../../acoustic-haptics';
import { normaliseAnswer } from '../../exercise-engine';

export class InterceptionModal {
  private static overlay: HTMLElement | null = null;
  private static timerId: number | null = null;

  public static launch(bottleneck: CognitiveBottleneck, onComplete?: (passed: boolean) => void): void {
    if (this.overlay) this.close();

    const challenge = MutationEngine.generateChallenge(bottleneck);
    AmbushController.recordInterception();

    try {
      AcousticHaptics.nudge();
    } catch {}

    const overlay = document.createElement('div');
    overlay.className = 'completion-modal-overlay interactive cognitive-interception-overlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: var(--z-modal, 1000);
      background: var(--modal-backdrop, rgba(5, 7, 13, 0.78)) !important;
      backdrop-filter: blur(12px) !important;
      -webkit-backdrop-filter: blur(12px) !important;
      display: flex; align-items: center; justify-content: center; padding: 16px;
    `;

    const card = document.createElement('div');
    card.className = 'completion-receipt-card';
    card.style.cssText = `
      max-width: 520px; width: 100%; border: 1px solid var(--border-hairline, rgba(255,255,255,0.1));
      border-radius: var(--radius-squircle-md, 16px); padding: 24px;
      background: var(--surface-card, #131722); color: var(--ink-base, #f1f5f9);
      box-shadow: var(--shadow-tactile, 0 8px 32px rgba(0,0,0,0.4));
    `;

    card.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <span class="telemetry-label" style="color: var(--accent-gold, #f59e0b); font-weight: 700; letter-spacing: 0.08em; font-size: 11px;">
          ⚡ COGNITIVE INTERCEPTION · REFLEX AUDIT
        </span>
        <span id="interception-timer" style="font-family: monospace; font-weight: 800; color: var(--danger, #ef4444); font-size: 16px;">
          ${challenge.timeLimitSec}s
        </span>
      </div>

      <h3 style="font-size: 16px; margin: 0 0 8px 0; font-weight: 700; color: var(--ink-bright, #fff);">
        ${bottleneck.academicTitle}
      </h3>
      
      <p style="font-size: 13px; color: var(--ink-muted, #94a3b8); margin: 0 0 16px 0; line-height: 1.4;">
        ${challenge.socraticContext}
      </p>

      <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 14px; margin-bottom: 16px; font-size: 15px; border-left: 3px solid var(--accent, #6366f1);">
        ${challenge.prompt}
      </div>

      <form id="interception-form" style="display: flex; flex-direction: column; gap: 12px;">
        <input type="text" id="interception-input" autocomplete="off" autocorrect="off" spellcheck="false"
          placeholder="Type the precise correction..."
          style="width: 100%; height: 44px; padding: 0 14px; border-radius: var(--radius-btn, 10px);
                 border: 1px solid var(--border-hairline, rgba(255,255,255,0.1)); background: var(--surface-recessed, #0b0f19);
                 color: #fff; font-size: 15px; outline: none;" />
        <div style="display: flex; gap: 8px;">
          <button type="submit" style="flex: 1; height: 44px; border-radius: var(--radius-btn, 10px);
                  background: var(--accent, #6366f1); color: #fff; font-weight: 700; border: none; cursor: pointer;">
            Verify Engram
          </button>
          <button type="button" id="interception-defer-btn" style="height: 44px; padding: 0 16px; border-radius: var(--radius-btn, 10px);
                  background: transparent; border: 1px solid var(--border-hairline, rgba(255,255,255,0.1)); color: var(--ink-muted, #94a3b8); cursor: pointer;">
            Yield (Lapse)
          </button>
        </div>
      </form>
    `;

    overlay.appendChild(card);
    document.body.appendChild(overlay);
    this.overlay = overlay;

    const input = card.querySelector('#interception-input') as HTMLInputElement | null;
    input?.focus();

    let timeLeft = challenge.timeLimitSec;
    const timerEl = card.querySelector('#interception-timer') as HTMLElement | null;

    this.timerId = window.setInterval(() => {
      timeLeft--;
      if (timerEl) timerEl.textContent = `${timeLeft}s`;
      if (timeLeft <= 0) {
        this.finish(false, bottleneck, challenge, onComplete);
      }
    }, 1000);

    card.querySelector('#interception-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const answer = input?.value || '';
      const isCorrect = normaliseAnswer(answer) === normaliseAnswer(challenge.expectedAnswer);
      this.finish(isCorrect, bottleneck, challenge, onComplete);
    });

    card.querySelector('#interception-defer-btn')?.addEventListener('click', () => {
      this.finish(false, bottleneck, challenge, onComplete);
    });
  }

  private static finish(passed: boolean, bottleneck: CognitiveBottleneck, challenge: AdversaryChallenge, callback?: (passed: boolean) => void): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    try {
      if (passed) {
        AcousticHaptics.chime();
      } else {
        AcousticHaptics.nudge();
      }
    } catch {}

    AdversaryRegistry.recordEncounter({
      sourceModule: 'cognitive_interception',
      category: bottleneck.category,
      academicTitle: bottleneck.academicTitle,
      cefrLevel: bottleneck.cefrLevel,
      prompt: challenge.prompt,
      userResponse: passed ? challenge.expectedAnswer : 'TIMEOUT/LAPSE',
      expectedAnswer: challenge.expectedAnswer,
      passed,
      linguisticExplanation: bottleneck.linguisticExplanation,
      l1VietnameseTip: bottleneck.l1VietnameseTip
    });

    this.close();
    callback?.(passed);
  }

  public static close(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }
}

