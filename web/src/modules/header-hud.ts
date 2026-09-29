import { StorageManager } from '../utils/storage';
import { AudioSynthesizer } from '../core/audio-synthesizer';
import { SRSEngine } from '../core/srs-engine';
export class HeaderHUD {
  private element: HTMLElement;
  private currentRoute: string = 'singularity';

  constructor() {
    this.element = document.createElement('header');
    this.element.className = 'hud-header interactive';
    this.render();
    this.startClock();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public render(): void {
    const state = StorageManager.loadState();
    const stats = SRSEngine.calculateStats(1000, state.cardStates);
    const isMuted = StorageManager.isSoundMuted();
    const badgeLabel = this.currentRoute === 'singularity' ? '[SINGULARITY CORE]' : `[NODE: ${this.currentRoute.toUpperCase()}]`;

    this.element.innerHTML = `
      <div class="hud-brand">
        <span class="hud-brand-title">STARK // ENG SINGULARITY</span>
        <span class="hud-status-badge active-route-badge">${badgeLabel}</span>
      </div>

      <div class="hud-telemetry-cluster" style="display: flex; gap: 20px; align-items: center;">
        <div class="telemetry-item">
          <span class="telemetry-label">RETENTION:</span>
          <span class="telemetry-value telemetry-retention">${stats.retentionRate}%</span>
        </div>
        <div class="telemetry-item">
          <span class="telemetry-label">STREAK:</span>
          <span class="telemetry-value telemetry-streak">${state.streak.currentStreak} DAYS</span>
        </div>
        <div class="telemetry-item">
          <span class="telemetry-label">TIME:</span>
          <span class="telemetry-value telemetry-clock">--:--:--</span>
        </div>
      </div>

      <div class="hud-actions">
        <button class="hud-btn btn-backup-import" title="Import study data backup JSON" aria-label="Import study data backup JSON">[ IMPORT JSON ]</button>
        <button class="hud-btn btn-backup-export" title="Export study data backup JSON" aria-label="Export study data backup JSON">[ EXPORT JSON ]</button>
        <button class="hud-btn btn-sound-toggle" title="Toggle audio effects" aria-label="Toggle audio effects">[ ${isMuted ? '🔇 MUTED' : '🔊 SOUND'} ]</button>
        <input type="file" class="backup-file-input" accept=".json,application/json" style="display: none;" aria-hidden="true" tabindex="-1" />
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents(): void {
    const soundBtn = this.element.querySelector('.btn-sound-toggle');
    soundBtn?.addEventListener('click', () => {
      const muted = AudioSynthesizer.toggleMute();
      soundBtn.textContent = `[ ${muted ? '🔇 MUTED' : '🔊 SOUND'} ]`;
      if (!muted) {
        AudioSynthesizer.play('click');
      }
    });

    const exportBtn = this.element.querySelector('.btn-backup-export');
    exportBtn?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      const backupJson = StorageManager.exportBackup();
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stark-english-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    const importBtn = this.element.querySelector('.btn-backup-import');
    const fileInput = this.element.querySelector('.backup-file-input') as HTMLInputElement | null;

    importBtn?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      if (fileInput) {
        fileInput.value = '';
        fileInput.click();
      }
    });

    fileInput?.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (!file) return;

      // Active student progress guard check
      const currentState = StorageManager.loadState();
      const hasActiveData = (
        (currentState.cardStates && Object.keys(currentState.cardStates).length > 0) ||
        currentState.totalCardsReviewed > 0 ||
        (currentState.streak && currentState.streak.currentStreak > 0) ||
        (currentState.habitProgress && Object.keys(currentState.habitProgress).length > 0)
      );

      if (hasActiveData) {
        const confirmed = window.confirm(
          'Active student progress detected in local storage.\n\nImporting this backup will overwrite your existing SRS intervals, review history, and streaks.\n\nDo you wish to proceed with state restoration?'
        );
        if (!confirmed) {
          fileInput.value = '';
          return;
        }
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const rawContent = e.target?.result;
          if (typeof rawContent !== 'string' || !rawContent.trim()) {
            throw new Error('Backup file is empty');
          }

          const success = StorageManager.importBackup(rawContent);
          if (success) {
            AudioSynthesizer.play('absorb');
            this.render();
            this.updateTelemetry(this.currentRoute);
            if (typeof window !== 'undefined' && window.location) {
              setTimeout(() => {
                window.location.reload();
              }, 300);
            }
          } else {
            AudioSynthesizer.play('alarm');
            alert('Failed to restore backup: File does not match valid STARK English backup schema.');
          }
        } catch (err) {
          AudioSynthesizer.play('alarm');
          console.error('[IMPORT] JSON parsing error:', err);
          alert('Corrupted JSON detected: Unable to parse backup file.');
        } finally {
          fileInput.value = '';
        }
      };

      reader.onerror = () => {
        AudioSynthesizer.play('alarm');
        alert('File read error: Failed to read local backup file.');
        fileInput.value = '';
      };

      reader.readAsText(file);
    });
  }

  private startClock(): void {
    const updateTime = () => {
      const clockEl = this.element.querySelector('.telemetry-clock');
      if (clockEl) {
        const d = new Date();
        const timeStr = d.toTimeString().split(' ')[0];
        clockEl.textContent = `${timeStr} LOC`;
      }
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  public updateTelemetry(routeName: string): void {
    this.currentRoute = routeName;
    const badge = this.element.querySelector('.active-route-badge');
    if (badge) {
      badge.textContent = `[NODE: ${routeName.toUpperCase()}]`;
    }

    const state = StorageManager.loadState();
    const stats = SRSEngine.calculateStats(1000, state.cardStates);

    const retentionEl = this.element.querySelector('.telemetry-retention');
    if (retentionEl) {
      retentionEl.textContent = `${stats.retentionRate}%`;
    }

    const streakEl = this.element.querySelector('.telemetry-streak');
    if (streakEl) {
      streakEl.textContent = `${state.streak.currentStreak} DAYS`;
    }
  }
}
