import collocationsData from '../assets/data/collocations.json';
import { Cefr, CEFR_ORDER, CEFR_LABELS } from '../core/cefr';
import { icon } from '../utils/icons';
import { StorageManager } from '../utils/storage';
import { AudioSynthesizer } from '../core/audio-synthesizer';
import { SRSEngine } from '../core/srs-engine';
import { SpotlightTour } from '../core/spotlight-tour';
import { ProgressionEngine } from '../core/progression-engine';
import { ProgressionModal } from './progression-modal';
import { ZenMode } from '../core/zen-mode';

const ROUTE_NAMES: Record<string, string> = { read: 'READING', write: 'WRITING', listen: 'LISTENING', speak: 'SPEAKING', vocab: 'VOCABULARY', colloc: 'COLLOCATIONS', grammar: 'GRAMMAR', habits: 'DAILY HABITS', singularity: 'SINGULARITY' };

export class HeaderHUD {
  private element: HTMLElement;
  private currentRoute: string = 'tree';
  private currentTheme: 'dark' | 'light' = 'dark';
  public onNavigateToTree?: () => void;
  public onNavigateToBlitz?: () => void;

  constructor() {
    this.element = document.createElement('header');
    this.element.className = 'hud-header interactive';

    // Initialize theme from storage or default to dark (game HUD aesthetic)
    const savedTheme = localStorage.getItem('eng_theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      this.currentTheme = savedTheme;
    } else {
      this.currentTheme = 'dark';
    }
    document.documentElement.setAttribute('data-theme', this.currentTheme);

    this.render();

    // Live update trigger pill when XP or Level changes
    ProgressionEngine.onProgressUpdate((progState) => {
      const pill = this.element.querySelector('.btn-progression-pill');
      if (pill) {
        pill.innerHTML = `${icon('zap', 12)} LVL ${progState.level}<span class="btn-label"> • ${progState.xp} XP</span>`;
      }
      const streakEl = this.element.querySelector('.telemetry-streak');
      if (streakEl) {
        streakEl.innerHTML = `${icon('flame')} ${progState.streak} DAYS`;
      }
    });

    // Live update Zen button state when toggled via hotkey Z or elsewhere
    ZenMode.onChange((active) => {
      this.updateZenButtonState(active);
    });
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public render(): void {
    const state = StorageManager.loadState();
    const stats = SRSEngine.calculateStats(collocationsData.length, state.cardStates);
    const isMuted = AudioSynthesizer.isMute();
    const isTree = this.currentRoute === 'tree' || this.currentRoute === 'singularity';
    const progression = ProgressionEngine.getState();

    this.element.innerHTML = `
      <div class="hud-brand" style="display: flex; align-items: center; gap: 12px;">
        ${!isTree ? `
          <button class="hud-btn btn-back-tree" title="Return to Constellation Tree" aria-label="Return to Constellation Tree">
            ${icon('arrowLeft')}<span class="btn-label"> Back to Constellation</span> Tree
          </button>
          <span class="hud-status-badge active-route-badge" style="font-size: 11px;">${ROUTE_NAMES[this.currentRoute] ?? this.currentRoute.toUpperCase()}</span>
        ` : `
          <span class="hud-brand-title" style="font-size: 15px; font-weight: 700; letter-spacing: 0.1em; display: inline-flex; align-items: center; gap: 8px;">
            <span style="color: var(--accent-gold); font-size: 13px;">✦</span> ENGLISH MASTERY
          </span>
        `}
          <button class="hud-status-badge btn-level" style="background: var(--accent-gold); color: var(--bg-canvas); border-radius: 4px; padding: 2px 8px; font-weight: 700; border-color: var(--accent-gold); cursor: pointer;" aria-haspopup="dialog" title="Your CEFR level (click to change)" aria-label="Your level: ${CEFR_LABELS[StorageManager.getLearnerLevel()]}. Change level">${StorageManager.getLearnerLevel()}</button>
      </div>

      <div class="hud-telemetry-cluster" style="display: flex; gap: 20px; align-items: center;">
        <div class="telemetry-item" title="Consecutive days you finished the daily workout" style="display: flex; align-items: center; gap: 6px;">
          <span class="telemetry-label" style="font-size: 11px;">STREAK:</span>
          <span class="telemetry-value telemetry-streak" style="color: var(--accent-gold); font-weight: 700;">${icon('flame')} ${progression.streak || state.streak.currentStreak} DAYS</span>
        </div>        <div class="telemetry-item" title="Share of flashcard reviews you recalled correctly" style="display: flex; align-items: center; gap: 6px;">
          <span class="telemetry-label" style="font-size: 11px;">RETENTION:</span>
          <span class="telemetry-value telemetry-retention" style="color: var(--good); font-weight: 700;">${stats.retentionRate}%</span>
        </div>
      </div>

      <div class="hud-actions header-actions" style="display: flex; gap: 8px; align-items: center;">
        <button class="hud-btn btn-blitz" title="Launch 60-Second Roguelike Speed Blitz Mode" aria-label="Speed Blitz Mode" style="border-color: var(--accent-gold); color: var(--accent-gold); font-weight: 700;">
          ${icon('zap', 12)}<span class="btn-label"> BLITZ</span>
        </button>
        <button class="hud-btn btn-progression-pill" title="RPG Progression & Daily Quests" aria-label="RPG Progression">
          ${icon('zap', 12)} LVL ${progression.level}<span class="btn-label"> • ${progression.xp} XP</span>
        </button>
        <button class="hud-btn btn-zen-toggle ${ZenMode.isZen() ? 'active' : ''}" title="Toggle Zen Immersion Mode (Hotkey: Z)" aria-label="Toggle Zen Immersion Mode" aria-pressed="${ZenMode.isZen()}">${HeaderHUD.zenLabel(ZenMode.isZen())}</button>
        <button class="hud-btn btn-theme-toggle" title="Toggle Theme (Dark / Light)" aria-label="Toggle Theme">${this.themeLabel()}</button>
        <button class="hud-btn btn-launch-tour" title="Launch Interactive Game Tour" aria-label="Launch Game Tour">${icon('compass')}<span class="btn-label"> Tour</span></button>
        <button class="hud-btn btn-sound-toggle" title="Toggle audio mute" aria-label="Toggle audio mute" aria-pressed="${isMuted}">${HeaderHUD.soundLabel(isMuted)}</button>
        <button class="hud-btn btn-settings" title="Settings & Data Management" aria-label="Settings">${icon('settings')}<span class="btn-label"> Settings</span></button>
      </div>
    `;

    this.bindEvents();
  }

  private themeLabel(): string {
    return this.currentTheme === 'dark' ? `${icon('sun')}<span class="btn-label"> Light</span>` : `${icon('moon')}<span class="btn-label"> Dark</span>`;
  }

  private static soundLabel(muted: boolean): string {
    return muted ? `${icon('mute')}<span class="btn-label"> Muted</span>` : `${icon('volume')}<span class="btn-label"> Sound</span>`;
  }

  private static zenLabel(active: boolean): string {
    return `${icon('eye', 12)}<span class="btn-label"> ZEN</span>${active ? '<span class="zen-dot" style="color: var(--accent-gold); margin-left: 2px;">●</span>' : ''}`;
  }

  private updateZenButtonState(active: boolean): void {
    const zenBtn = this.element.querySelector('.btn-zen-toggle') as HTMLButtonElement | null;
    if (zenBtn) {
      zenBtn.classList.toggle('active', active);
      zenBtn.setAttribute('aria-pressed', String(active));
      zenBtn.innerHTML = HeaderHUD.zenLabel(active);
    }
  }

  private toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    localStorage.setItem('eng_theme', this.currentTheme);
    AudioSynthesizer.play('click');
    const themeBtn = this.element.querySelector('.btn-theme-toggle');
    if (themeBtn) {
      themeBtn.innerHTML = this.themeLabel();
    }
  }

  private bindEvents(): void {
    const blitzBtn = this.element.querySelector('.btn-blitz') as HTMLButtonElement | null;
    blitzBtn?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      if (this.onNavigateToBlitz) {
        this.onNavigateToBlitz();
      } else {
        window.location.hash = '#blitz';
      }
    });

    this.element.querySelector('.btn-level')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      this.openLevelPicker();
    });

    const progBtn = this.element.querySelector('.btn-progression-pill');
    progBtn?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      ProgressionModal.open();
    });

    const zenBtn = this.element.querySelector('.btn-zen-toggle') as HTMLButtonElement | null;
    zenBtn?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      ZenMode.toggle();
    });

    const themeBtn = this.element.querySelector('.btn-theme-toggle') as HTMLButtonElement | null;
    themeBtn?.addEventListener('click', () => {
      this.toggleTheme();
    });

    const tourBtn = this.element.querySelector('.btn-launch-tour') as HTMLButtonElement | null;
    tourBtn?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      SpotlightTour.start(true);
    });

    const soundBtn = this.element.querySelector('.btn-sound-toggle') as HTMLButtonElement | null;
    soundBtn?.addEventListener('click', () => {
      const muted = AudioSynthesizer.toggleMute();
      AudioSynthesizer.play('click');
      if (soundBtn) {
        soundBtn.innerHTML = HeaderHUD.soundLabel(muted);
        soundBtn.setAttribute('aria-pressed', String(muted));
      }
    });

    const backBtn = this.element.querySelector('.btn-back-tree');
    backBtn?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      if (this.onNavigateToTree) {
        this.onNavigateToTree();
      }
    });

    const settingsBtn = this.element.querySelector('.btn-settings');
    settingsBtn?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      this.openSettingsModal();
    });
  }

  private openLevelPicker(): void {
    document.getElementById('level-modal')?.remove();
    const current = StorageManager.getLearnerLevel();
    const opener = document.activeElement as HTMLElement | null;

    const modal = document.createElement('div');
    modal.id = 'level-modal';
    modal.className = 'completion-modal-overlay interactive';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Choose your level');
    modal.innerHTML = `
      <div class="completion-receipt-card" style="max-width: 420px; width: 90%;">
        <div class="telemetry-label" style="margin-bottom: 8px;">YOUR LEVEL</div>
        <div style="width: 100%; display: flex; flex-direction: column; gap: var(--space-8); margin-bottom: var(--space-16);">
          ${CEFR_ORDER.map(l => `
            <button class="hud-btn level-option ${l === current ? 'active' : ''}" data-level="${l}" aria-pressed="${l === current}" style="width: 100%; box-sizing: border-box; justify-content: flex-start; padding: 10px 14px; font-weight: 600;">${CEFR_LABELS[l]}</button>
          `).join('')}
        </div>
        <button class="hud-btn btn-modal-close" style="width: 100%; justify-content: center; padding: 10px 0;">Cancel</button>
      </div>
    `;
    document.body.appendChild(modal);

    const close = () => {
      modal.remove();
      document.removeEventListener('keydown', onKey, true);
      opener?.focus();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
    };
    document.addEventListener('keydown', onKey, true);

    modal.querySelectorAll('.level-option').forEach(btn => {
      btn.addEventListener('click', () => {
        AudioSynthesizer.play('click');
        StorageManager.setLearnerLevel((btn as HTMLElement).dataset.level as Cefr);
        window.dispatchEvent(new CustomEvent('learner-level-change'));
        close();
        this.render();
      });
    });
    modal.querySelector('.btn-modal-close')?.addEventListener('click', close);
    (modal.querySelector('.level-option.active') as HTMLElement | null)?.focus();
  }

  private openSettingsModal(): void {
    const existing = document.getElementById('settings-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'settings-modal';
    modal.className = 'completion-modal-overlay interactive';
    modal.innerHTML = `
      <div class="completion-receipt-card" style="max-width: 520px; width: 90%;">
        <div class="telemetry-label" style="margin-bottom: 8px;">SYSTEM SETTINGS & DATA BACKUP</div>
        <h2 style="font-family: var(--font-mono); font-size: 20px; font-weight: 700; margin-bottom: 16px;">
          Settings & Local Storage
        </h2>
        <p style="font-size: 14px; line-height: 1.5; margin-bottom: 20px; color: var(--ink-secondary);">
          Your progress, SRS intervals, and streaks are safely stored in your browser's local memory. You can export or import a backup JSON file anytime.
        </p>

        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px;">
          <button class="hud-btn btn-restart-tour" style="padding: 12px; justify-content: center; font-weight: 700; color: var(--accent-gold); border-color: var(--accent-gold);">
            ${icon('compass')} Re-run Onboarding Tour
          </button>
          <button class="hud-btn btn-backup-export" style="padding: 12px; justify-content: center; font-weight: 600;">
            ${icon('download')} Export Progress Backup (JSON)
          </button>
          <button class="hud-btn btn-backup-import" style="padding: 12px; justify-content: center; font-weight: 600;">
            ${icon('upload')} Restore from Backup (JSON)
          </button>
          <button class="hud-btn btn-motion-toggle" style="padding: 12px; justify-content: center; font-weight: 600;" aria-pressed="${document.documentElement.dataset.motion === 'reduce'}">
            ${icon('zap')} <span class="motion-label">${document.documentElement.dataset.motion === 'reduce' ? 'Motion: Reduced' : 'Motion: Full'}</span>
          </button>
          <input type="file" class="backup-file-input" accept=".json,application/json" style="display: none;" />
        </div>

        <button class="hud-btn btn-modal-close" style="width: 100%; justify-content: center; padding: 10px 0;">
          Close Settings
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.btn-restart-tour')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      modal.remove();
      SpotlightTour.start(true);
    });

    modal.querySelector('.btn-motion-toggle')?.addEventListener('click', (e) => {
      const root = document.documentElement;
      const reduce = root.dataset.motion !== 'reduce';
      if (reduce) root.dataset.motion = 'reduce'; else delete root.dataset.motion;
      localStorage.setItem('eng_motion', reduce ? 'reduce' : 'full');
      const btn = e.currentTarget as HTMLElement;
      btn.setAttribute('aria-pressed', String(reduce));
      btn.querySelector('.motion-label')!.textContent = reduce ? 'Motion: Reduced' : 'Motion: Full';
      AudioSynthesizer.play('click');
    });

    modal.querySelector('.btn-modal-close')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      modal.remove();
    });

    modal.querySelector('.btn-backup-export')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
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
      AudioSynthesizer.play('click');
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
            AudioSynthesizer.play('level-up');
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
