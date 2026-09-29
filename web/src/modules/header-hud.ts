import { StorageManager } from '../utils/storage';
import { AudioSynthesizer } from '../core/audio-synthesizer';
import { SRSEngine } from '../core/srs-engine';

export class HeaderHUD {
  private element: HTMLElement;
  private currentRoute: string = 'tree';
  public onNavigateToTree?: () => void;

  constructor() {
    this.element = document.createElement('header');
    this.element.className = 'hud-header interactive';
    this.render();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public render(): void {
    const state = StorageManager.loadState();
    const stats = SRSEngine.calculateStats(1000, state.cardStates);
    const isMuted = AudioSynthesizer.isMute();
    const isTree = this.currentRoute === 'tree' || this.currentRoute === 'singularity';

    this.element.innerHTML = `
      <div class="hud-brand" style="display: flex; align-items: center; gap: 12px;">
        ${!isTree ? `
          <button class="hud-btn btn-back-tree" style="font-weight: 600; padding: 6px 14px; background: var(--bg-surface); border: 1px solid var(--border-solid); cursor: pointer;" title="Return to Constellation Tree">
            ← Back to Constellation Tree
          </button>
          <span class="hud-status-badge active-route-badge" style="font-size: 11px;">[STUDIO: ${this.currentRoute.toUpperCase()}]</span>
        ` : `
          <span class="hud-brand-title" style="font-size: 16px; font-weight: 700; letter-spacing: 0.08em;">ENGLISH MASTERY</span>
          <span class="hud-status-badge hud-rank-badge" style="background: var(--ink-primary); color: var(--ink-inverted); border-radius: 2px; padding: 2px 8px; font-weight: 600;">C1 SCHOLAR</span>
        `}
      </div>

      <div class="hud-telemetry-cluster" style="display: flex; gap: 24px; align-items: center;">
        <div class="telemetry-item">
          <span class="telemetry-label">STREAK:</span>
          <span class="telemetry-value telemetry-streak" style="color: var(--accent-gold); font-weight: 700;">🔥 ${state.streak.currentStreak} DAYS</span>
        </div>
        <div class="telemetry-item">
          <span class="telemetry-label">SUMMIT:</span>
          <span class="telemetry-value">C2 MASTERY</span>
        </div>
        <div class="telemetry-item">
          <span class="telemetry-label">RETENTION:</span>
          <span class="telemetry-value telemetry-retention">${stats.retentionRate}%</span>
        </div>
      </div>

      <div class="hud-actions" style="display: flex; gap: 12px; align-items: center;">
        <button class="hud-btn btn-sound-toggle" title="Toggle audio mute" aria-label="Toggle audio mute">[ ${isMuted ? '🔇 MUTED' : '🔊 SOUND'} ]</button>
        <button class="hud-btn btn-settings" title="Settings & Data Management" aria-label="Settings">[ ⚙ SETTINGS ]</button>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents(): void {
    const soundBtn = this.element.querySelector('.btn-sound-toggle') as HTMLButtonElement | null;
    soundBtn?.addEventListener('click', () => {
      const muted = AudioSynthesizer.toggleMute();
      if (soundBtn) {
        soundBtn.textContent = `[ ${muted ? '🔇 MUTED' : '🔊 SOUND'} ]`;
      }
    });

    const backBtn = this.element.querySelector('.btn-back-tree');
    backBtn?.addEventListener('click', () => {
      if (this.onNavigateToTree) {
        this.onNavigateToTree();
      }
    });

    const settingsBtn = this.element.querySelector('.btn-settings');
    settingsBtn?.addEventListener('click', () => {
      this.openSettingsModal();
    });
  }

  private openSettingsModal(): void {
    const existing = document.getElementById('settings-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'settings-modal';
    modal.className = 'completion-modal-overlay interactive';
    modal.innerHTML = `
      <div class="completion-receipt-card" style="max-width: 520px; width: 90%;">
        <div class="telemetry-label" style="margin-bottom: 8px;">[SYSTEM SETTINGS & DATA BACKUP]</div>
        <h2 style="font-family: var(--font-mono); font-size: 20px; font-weight: 700; margin-bottom: 16px;">
          Settings & Local Storage
        </h2>
        <p style="font-size: 14px; line-height: 1.5; margin-bottom: 20px; color: var(--ink-secondary);">
          Your progress, SRS intervals, and streaks are safely stored in your browser's local memory. You can export or import a backup JSON file anytime.
        </p>

        <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
          <button class="hud-btn btn-backup-export" style="padding: 12px; justify-content: center; font-weight: 600;">
            [ 📥 EXPORT PROGRESS BACKUP (JSON) ]
          </button>
          <button class="hud-btn btn-backup-import" style="padding: 12px; justify-content: center; font-weight: 600;">
            [ 📤 RESTORE FROM BACKUP (JSON) ]
          </button>
          <input type="file" class="backup-file-input" accept=".json,application/json" style="display: none;" />
        </div>

        <button class="hud-btn btn-modal-close" style="width: 100%; justify-content: center; padding: 10px 0;">
          [ CLOSE SETTINGS ]
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.btn-modal-close')?.addEventListener('click', () => {
      modal.remove();
    });

    modal.querySelector('.btn-backup-export')?.addEventListener('click', () => {
      const backupJson = StorageManager.exportBackup();
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `english-mastery-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    const fileInput = modal.querySelector('.backup-file-input') as HTMLInputElement | null;
    modal.querySelector('.btn-backup-import')?.addEventListener('click', () => {
      fileInput?.click();
    });

    fileInput?.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (!file) return;

      const currentState = StorageManager.loadState();
      const hasActiveData = (
        (currentState.cardStates && Object.keys(currentState.cardStates).length > 0) ||
        currentState.totalCardsReviewed > 0 ||
        (currentState.streak && currentState.streak.currentStreak > 0)
      );

      if (hasActiveData) {
        const confirmed = window.confirm(
          'Active student progress detected in local storage.\n\nImporting this backup will overwrite your current progress.\n\nProceed?'
        );
        if (!confirmed) return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const raw = e.target?.result as string;
          const success = StorageManager.importBackup(raw);
          if (success) {
            alert('Progress successfully restored.');
            modal.remove();
            window.location.reload();
          } else {
            alert('Invalid backup file.');
          }
        } catch {
          alert('Failed to parse backup JSON.');
        }
      };
      reader.readAsText(file);
    });
  }

  public updateTelemetry(routeName: string): void {
    this.currentRoute = routeName;
    this.render();
  }
}
