/**
 * RPG PROGRESSION MODAL
 * Glassmorphic HUD modal displaying player Level badge, XP bar to next rank,
 * streak flame counter, and 3 daily quest directives checklist.
 * Subscribes dynamically to ProgressionEngine for live reactive updates.
 */

import { icon } from '../utils/icons';
import { ProgressionEngine, ProgressionState, LevelInfo } from '../core/progression-engine';
import { AudioSynthesizer } from '../core/audio-synthesizer';

export class ProgressionModal {
  private static activeInstance: ProgressionModal | null = null;
  private overlay: HTMLElement | null = null;
  private unsubscribe: (() => void) | null = null;
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  public static open(): ProgressionModal {
    if (this.activeInstance) {
      this.activeInstance.close();
    }
    const modal = new ProgressionModal();
    modal.render();
    this.activeInstance = modal;
    return modal;
  }

  public static close(): void {
    if (this.activeInstance) {
      this.activeInstance.close();
      this.activeInstance = null;
    }
  }

  public static isOpen(): boolean {
    return this.activeInstance !== null;
  }

  public render(): void {
    // Remove any existing modal element
    const existing = document.getElementById('progression-modal');
    if (existing) {
      existing.remove();
    }

    const state = ProgressionEngine.getState();
    const info = ProgressionEngine.getLevelInfo();

    this.overlay = document.createElement('div');
    this.overlay.id = 'progression-modal';
    this.overlay.className = 'progression-modal-overlay completion-modal-overlay interactive';
    this.overlay.setAttribute('role', 'dialog');
    this.overlay.setAttribute('aria-modal', 'true');
    this.overlay.setAttribute('aria-label', 'RPG Progression & Daily Quests');

    this.updateCardContent(state, info);

    document.body.appendChild(this.overlay);

    // Bind Close & Overlay Events
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        AudioSynthesizer.play('click');
        this.close();
      }
    });

    this.keydownHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        AudioSynthesizer.play('click');
        this.close();
      }
    };
    window.addEventListener('keydown', this.keydownHandler);

    // Live reactive subscription to ProgressionEngine updates
    this.unsubscribe = ProgressionEngine.onProgressUpdate((newState) => {
      const newInfo = ProgressionEngine.getLevelInfo();
      this.updateCardContent(newState, newInfo);
    });
  }

  private updateCardContent(state: ProgressionState, info: LevelInfo): void {
    if (!this.overlay) return;

    const completedQuests = state.quests.filter(q => q.completed).length;
    const allCompleted = completedQuests === state.quests.length;

    this.overlay.innerHTML = `
      <div class="progression-modal-card">
        <!-- Top Control Bar -->
        <div class="progression-card-header">
          <div class="telemetry-label" style="color: var(--accent-gold); display: flex; align-items: center; gap: 6px;">
            <span>✦</span> RPG MASTERY TELEMETRY
          </div>
          <button class="progression-btn-close btn-modal-close" title="Close Progression Modal (Esc)" aria-label="Close">
            ✕
          </button>
        </div>

        <!-- Level & Rank Badge Hero -->
        <div class="progression-hero">
          <div class="progression-badge-container">
            <div class="progression-level-badge">
              <span class="progression-level-prefix">LVL</span>
              <span class="progression-level-num">${info.level}</span>
            </div>
          </div>
          <div class="progression-hero-details">
            <div class="progression-rank-title">${info.rankTitle}</div>
            <div class="progression-hero-sub">
              <span class="progression-streak-pill">
                ${icon('flame', 12)} ${state.streak} DAY STREAK
              </span>
              <span class="progression-total-xp">
                ${icon('zap', 12)} ${state.xp.toLocaleString()} TOTAL XP
              </span>
            </div>
          </div>
        </div>

        <!-- XP Progress Bar to Next Level -->
        <div class="progression-xp-section">
          <div class="progression-xp-meta">
            <span class="telemetry-label">NEXT RANK PROGRESS</span>
            <span class="progression-xp-numbers font-mono">
              <strong>${info.progressInLevel}</strong> / ${info.spanInLevel} XP
              <span class="progression-xp-pct">(${info.percentage}%)</span>
            </span>
          </div>
          <div class="progression-xp-track" role="progressbar" aria-valuenow="${info.percentage}" aria-valuemin="0" aria-valuemax="100">
            <div class="progression-xp-fill" style="width: ${info.percentage}%;"></div>
          </div>
        </div>

        <!-- Daily Quests Checklist -->
        <div class="progression-quests-section">
          <div class="progression-quests-header">
            <div class="telemetry-label">
              DAILY QUEST DIRECTIVES
            </div>
            <div class="progression-quests-status-badge ${allCompleted ? 'all-done' : ''}">
              ${completedQuests} / ${state.quests.length} COMPLETED
            </div>
          </div>

          <div class="progression-quest-list">
            ${state.quests.map((quest) => {
              const pct = Math.min(100, Math.round((quest.current / quest.target) * 100));
              return `
                <div class="progression-quest-card ${quest.completed ? 'quest-completed' : ''}" data-quest-id="${quest.id}">
                  <div class="quest-status-icon" aria-hidden="true">
                    ${quest.completed ? '✓' : '○'}
                  </div>
                  <div class="quest-info">
                    <div class="quest-title-row">
                      <span class="quest-title">${quest.title}</span>
                      <span class="quest-reward-pill">+${quest.xpReward} XP</span>
                    </div>
                    <div class="quest-desc">${quest.description}</div>
                    <div class="quest-progress-bar-row">
                      <div class="quest-progress-track">
                        <div class="quest-progress-fill" style="width: ${pct}%;"></div>
                      </div>
                      <span class="quest-progress-text font-mono">${quest.current}/${quest.target}</span>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Action Footer -->
        <div class="progression-footer">
          <button class="hud-btn btn-modal-done" style="width: 100%; justify-content: center; padding: 12px; font-weight: 700; border-color: var(--accent-gold); color: var(--accent-gold);">
            RETURN TO COMMAND CORE
          </button>
        </div>
      </div>
    `;

    // Re-bind click event to the close button
    const closeBtn = this.overlay.querySelector('.progression-btn-close');
    closeBtn?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      this.close();
    });

    const doneBtn = this.overlay.querySelector('.btn-modal-done');
    doneBtn?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      this.close();
    });
  }

  public close(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    ProgressionModal.activeInstance = null;
  }
}
