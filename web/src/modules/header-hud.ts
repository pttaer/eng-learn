import { StorageManager } from '../utils/storage';
import { AudioSynthesizer } from '../core/audio-synthesizer';
import { SRSEngine } from '../core/srs-engine';
export class HeaderHUD {
  private element: HTMLElement;

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

    this.element.innerHTML = `
      <div class="hud-brand">
        <span class="hud-brand-title">STARK // ENG SINGULARITY</span>
        <span class="hud-status-badge active-route-badge">[SINGULARITY CORE]</span>
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
        <button class="hud-btn btn-backup-export" title="Export study data backup JSON">[ EXPORT JSON ]</button>
        <button class="hud-btn btn-sound-toggle" title="Toggle audio effects">[ ${isMuted ? '🔇 MUTED' : '🔊 SOUND'} ]</button>
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
