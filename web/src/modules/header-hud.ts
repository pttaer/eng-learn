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
import { MultiSkillQuizModal } from './multi-skill-quiz-modal';
import { PlacementQuiz } from './placement-quiz';
import { ambientMusicEngine, AmbientMusicMode } from '../core/ambient-music-engine';
import { HapticEngine } from '../core/haptic-engine';
import { MistakeVault } from '../core/mistake-vault';
import { CommuteAudioPlayer } from '../core/commute-audio-player';

export interface ContextualDockAction {
  id: string;
  label: string;
  iconHtml?: string;
  onClick: () => void;
  accent?: boolean;
}

const ROUTE_NAMES: Record<string, string> = {
  read: 'READING • Đọc hiểu',
  write: 'WRITING • Viết câu',
  listen: 'LISTENING • Nghe thấm',
  speak: 'SPEAKING • Nói tự nhiên',
  vocab: 'VOCABULARY • Từ vựng',
  colloc: 'COLLOCATIONS • Cặp từ',
  grammar: 'GRAMMAR • Ngữ pháp',
  tenses: '12 TENSES • 12 Thì cốt lõi',
  habits: 'HABITS • Thói quen',
  singularity: 'SINGULARITY • Bản đồ',
  mediate: 'MEDIATION • Diễn đạt',
  cockpit: 'IELTS COCKPIT'
};

export class HeaderHUD {
  private element: HTMLElement;
  private currentRoute: string = 'tree';
  private currentTheme: 'dark' | 'light' = 'dark';
  private paintedIndex: number | null = null;
  private settleTimer: number | undefined;
  public onNavigateToTree?: () => void;
  public onNavigateToBlitz?: () => void;
  public onNavigateToMediation?: () => void;
  public onNavigateToAnalytics?: () => void;
  public onNavigateToCockpit?: () => void;
  private static instance: HeaderHUD | null = null;
  private contextualActions: ContextualDockAction[] | null = null;

  constructor() {
    HeaderHUD.instance = this;
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
    window.addEventListener('learner-level-change', () => this.render());

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
      const streakPill = this.element.querySelector('.btn-streak-pill');
      if (streakPill) {
        streakPill.innerHTML = `${icon('flame', 13)} ${progState.streak}d`;
        streakPill.setAttribute('title', `Daily Streak: ${progState.streak} days. Click to view Daily Workout on Constellation Tree`);
        streakPill.setAttribute('aria-label', `Daily Streak: ${progState.streak} days`);
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
    const currentStreak = progression.streak || state.streak.currentStreak || 0;

    this.element.innerHTML = `
      <div class="hud-brand" style="display: flex; align-items: center; gap: 8px;">
        ${!isTree ? `
          <button class="hud-btn btn-back-tree" title="Return to Constellation Tree" aria-label="Return to Constellation Tree">
            <span class="back-arrow">←</span><span class="btn-label"> CONSTELLATION</span> TREE
          </button>
          <span class="hud-status-badge active-route-badge" style="font-size: var(--font-kicker);">${ROUTE_NAMES[this.currentRoute] ?? this.currentRoute.toUpperCase()}</span>
        ` : `
          <span class="hud-brand-title" style="font-size: var(--font-body); font-weight: 700; letter-spacing: 0.1em; display: inline-flex; align-items: center; gap: 8px;">
            <span style="color: var(--accent-gold); font-size: var(--font-body-compact);">✦</span> ENGLISH MASTERY
          </span>
        `}
        <button class="hud-btn btn-level" aria-haspopup="dialog" title="Your CEFR level (click to change)" aria-label="Your level: ${CEFR_LABELS[StorageManager.getLearnerLevel()]}. Change level">${StorageManager.getLearnerLevel()}</button>
      </div>

      <div class="hud-telemetry-cluster" style="display: flex; gap: 20px; align-items: center;">
        <div class="telemetry-item telemetry-streak-item" title="Consecutive days you finished the daily workout. Click to view Daily Workout on Constellation Tree" style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
          <span class="telemetry-label" style="font-size: var(--font-kicker);">STREAK:</span>
          <span class="telemetry-value telemetry-streak" style="color: var(--accent-gold); font-weight: 700;">${icon('flame')} ${currentStreak} DAYS</span>
        </div>        <div class="telemetry-item" title="Share of flashcard reviews you recalled correctly" style="display: flex; align-items: center; gap: 6px;">
          <span class="telemetry-label" style="font-size: var(--font-kicker);">RETENTION:</span>
          <span class="telemetry-value telemetry-retention" style="color: var(--good); font-weight: 700;">${stats.retentionRate}%</span>
        </div>
      </div>

      <div class="hud-actions header-actions" style="display: flex; gap: 8px; align-items: center;">
        <button class="hud-btn btn-streak-pill" title="Daily Streak: ${currentStreak} days. Click to view Daily Workout on Constellation Tree" aria-label="Daily Streak: ${currentStreak} days">
          ${icon('flame', 13)} ${currentStreak}d
        </button>
        <button class="hud-btn btn-mobile-menu-drawer" title="Open Mobile Navigation Menu" aria-label="Open Mobile Navigation Menu" aria-haspopup="dialog">
          ${icon('menu', 16)}
        </button>
        <button class="hud-btn btn-skill-radar" title="Launch CEFR Multi-Skill Diagnostic & Celestial Radar" aria-label="Skill Radar" style="border-color: var(--accent-gold, #a5b4fc); color: var(--accent-gold, #a5b4fc); font-weight: 700;">
          ${icon('target', 12)}<span class="btn-label"> RADAR</span>
        </button>
        <button class="hud-btn btn-blitz" title="Launch 60-Second Roguelike Speed Blitz Mode" aria-label="Speed Blitz Mode" style="border-color: var(--accent-gold); color: var(--accent-gold); font-weight: 700;">
          ${icon('zap', 12)}<span class="btn-label"> BLITZ</span>
        </button>
        <button class="hud-btn btn-mediation" title="Launch CEFR Mediation Workbench (Hotkey: M)" aria-label="CEFR Mediation Workbench" style="border-color: var(--accent-gold, #a5b4fc); color: var(--accent-gold, #a5b4fc); font-weight: 700;">
          ${icon('scale', 12)}<span class="btn-label"> MEDIATION</span>
        </button>
        <button class="hud-btn btn-analytics" title="Launch CEFR Analytics & SERL 2.0 Gauntlet Dashboard" aria-label="Analytics & SERL Dashboard" style="border-color: var(--accent-purple, #a855f7); color: var(--accent-purple, #a855f7); font-weight: 700;">
          ${icon('layers', 12)}<span class="btn-label"> ANALYTICS</span>
        </button>
        <button class="hud-btn btn-ielts-cockpit" title="Launch CD-IELTS Exam Cockpit (Hotkey: C)" aria-label="CD-IELTS Exam Cockpit" style="border-color: var(--accent-gold, #f59e0b); color: var(--accent-gold, #f59e0b); font-weight: 700;">
          ${icon('graduationCap', 12)}<span class="btn-label"> COCKPIT</span>
        </button>
        <button class="hud-btn btn-export-profile" title="Export Unified Student Profile (JSON)" aria-label="Export Profile" style="border-color: var(--accent-gold, #f59e0b); color: var(--accent-gold, #f59e0b); font-weight: 600;">
          ${icon('download', 12)}<span class="btn-label"> EXPORT</span>
        </button>
        <button class="hud-btn btn-import-profile" title="Import Unified Student Profile (JSON)" aria-label="Import Profile" style="border-color: var(--accent-cyan, #38bdf8); color: var(--accent-cyan, #38bdf8); font-weight: 600;">
          ${icon('upload', 12)}<span class="btn-label"> IMPORT</span>
        </button>
        <input type="file" class="hud-profile-file-input" accept=".json,application/json" style="display: none;" />
        <button class="hud-btn btn-progression-pill" title="RPG Progression & Daily Quests" aria-label="RPG Progression">
          ${icon('zap', 12)} LVL ${progression.level}<span class="btn-label"> • ${progression.xp} XP</span>
        </button>
        <button class="hud-btn btn-zen-toggle ${ZenMode.isZen() ? 'active' : ''}" title="Toggle Zen Immersion Mode (Hotkey: Z)" aria-label="Toggle Zen Immersion Mode" aria-pressed="${ZenMode.isZen()}">${HeaderHUD.zenLabel(ZenMode.isZen())}</button>
        <button class="hud-btn btn-theme-toggle" title="Toggle Theme (Dark / Light)" aria-label="Toggle Theme">${this.themeLabel()}</button>
        <button class="hud-btn btn-launch-tour" title="Launch Interactive Game Tour" aria-label="Launch Game Tour">${icon('compass')}<span class="btn-label"> Tour</span></button>
        <button class="hud-btn btn-ambient-music ${ambientMusicEngine.isPlaying() ? 'active' : ''}" title="Ambient Music: ${ambientMusicEngine.getMode()}" aria-label="Ambient Music: ${ambientMusicEngine.getMode()}">${icon('music', 12)}<span class="btn-label"> ${HeaderHUD.ambientLabel(ambientMusicEngine.getMode())}</span></button>
        <button class="hud-btn btn-sound-toggle" title="Toggle audio mute" aria-label="Toggle audio mute" aria-pressed="${isMuted}">${HeaderHUD.soundLabel(isMuted)}</button>
        <button class="hud-btn btn-settings" title="Settings & Data Management" aria-label="Settings">${icon('settings')}<span class="btn-label"> Settings</span></button>
      </div>

      <nav class="hud-bottom-nav" aria-label="Mobile Bottom Navigation">
        <button class="bnav-btn bnav-tree ${isTree ? 'is-active' : ''}" aria-label="Constellation Tree" title="Constellation Tree">
          <span class="bnav-icon">${icon('sparkles', 18)}</span>
          <span class="bnav-label">Tree</span>
        </button>
        <button class="bnav-btn bnav-blitz ${this.currentRoute === 'blitz' ? 'is-active' : ''}" aria-label="Speed Blitz" title="Speed Blitz">
          <span class="bnav-icon">${icon('zap', 18)}</span>
          <span class="bnav-label">Blitz</span>
        </button>
        <button class="bnav-btn bnav-radar" aria-label="Skill Radar" title="Skill Radar">
          <span class="bnav-icon">${icon('target', 18)}</span>
          <span class="bnav-label">Radar</span>
        </button>
        <button class="bnav-btn bnav-cockpit ${this.currentRoute === 'cockpit' ? 'is-active' : ''}" aria-label="Exam Cockpit" title="Exam Cockpit">
          <span class="bnav-icon">${icon('graduationCap', 18)}</span>
          <span class="bnav-label">Cockpit</span>
        </button>
        <button class="bnav-btn bnav-more" aria-label="More Actions" title="More Actions" aria-haspopup="dialog">
          <span class="bnav-icon">${icon('menu', 18)}</span>
          <span class="bnav-label">More</span>
        </button>
      </nav>
    `;

    this.bindEvents();
    if (this.contextualActions && this.contextualActions.length > 0) {
      this.renderContextualDockElements();
    } else {
      this.syncBnavPaint();
    }
  }

  public static setContextualDock(actions: ContextualDockAction[] | null): void {
    if (this.instance) {
      this.instance.setContextualDock(actions);
    }
  }

  public setContextualDock(actions: ContextualDockAction[] | null): void {
    this.contextualActions = actions;
    const nav = this.element.querySelector<HTMLElement>('.hud-bottom-nav');
    if (!nav) return;

    if (!actions || actions.length === 0) {
      nav.classList.remove('is-contextual');
      this.render();
    } else {
      this.renderContextualDockElements();
    }
  }

  private renderContextualDockElements(): void {
    const nav = this.element.querySelector<HTMLElement>('.hud-bottom-nav');
    if (!nav || !this.contextualActions || this.contextualActions.length === 0) return;

    nav.classList.add('is-contextual');
    nav.innerHTML = `
      <button class="bnav-btn bnav-done" aria-label="Exit drill and return" title="Done / Back">
        <span class="bnav-icon">✕</span>
        <span class="bnav-label">Done</span>
      </button>
      ${this.contextualActions.map(act => `
        <button class="bnav-btn bnav-context-act ${act.accent ? 'is-accent' : ''}" data-act-id="${act.id}" aria-label="${act.label}">
          <span class="bnav-icon">${act.iconHtml || '✦'}</span>
          <span class="bnav-label">${act.label}</span>
        </button>
      `).join('')}
    `;

    nav.querySelector('.bnav-done')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      HapticEngine.trigger('light');
      this.setContextualDock(null);
      if (this.onNavigateToTree) {
        this.onNavigateToTree();
      } else {
        window.location.hash = '#tree';
      }
    });

    this.contextualActions.forEach(act => {
      nav.querySelector(`[data-act-id="${act.id}"]`)?.addEventListener('click', () => {
        AudioSynthesizer.play('click');
        HapticEngine.trigger('light');
        act.onClick();
      });
    });
  }

  // Tab label sweep: the tapped label fills from grey to app color in the direction of travel,
  // and the previous label drains the same way. A re-render replays from the last stop.
  private paintBnav(btn: HTMLElement): void {
    const nav = btn.closest<HTMLElement>('.hud-bottom-nav');
    if (!nav) return;
    const btns = Array.from(nav.querySelectorAll<HTMLElement>('.bnav-btn'));
    const next = btns.indexOf(btn);
    const prevIdx = this.paintedIndex;
    if (prevIdx !== null && prevIdx !== next && btns[prevIdx]) {
      const prev = btns[prevIdx];
      nav.dataset.sweep = next > prevIdx ? 'ltr' : 'rtl';
      prev.classList.add('is-painted');
      void nav.offsetWidth;
      prev.classList.remove('is-painted');
      prev.classList.add('is-leaving');
      window.setTimeout(() => prev.classList.remove('is-leaving'), 460);
    }
    btn.classList.add('is-painted');
    // Settle only after the sweep: a route re-render inside that window still sweeps from the old tab
    window.clearTimeout(this.settleTimer);
    this.settleTimer = window.setTimeout(() => { this.paintedIndex = next; }, 460);
  }

  private syncBnavPaint(): void {
    this.element.querySelectorAll<HTMLElement>('.bnav-label').forEach((label) => {
      label.dataset.text = label.textContent ?? '';
    });
    const active = this.element.querySelector<HTMLElement>('.bnav-btn.is-active');
    if (active) {
      this.paintBnav(active);
      return;
    }
    const nav = this.element.querySelector<HTMLElement>('.hud-bottom-nav');
    const stop = nav?.querySelectorAll<HTMLElement>('.bnav-btn')[this.paintedIndex ?? -1];
    if (stop) this.paintBnav(stop);
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

  private static ambientLabel(mode: AmbientMusicMode): string {
    switch (mode) {
      case 'calm-chords': return 'Chords';
      case 'celestial-void': return 'Void';
      case 'zen-drone': return 'Zen';
      default: return 'Music';
    }
  }

  private updateAmbientButtonState(mode: AmbientMusicMode): void {
    const musicBtn = this.element.querySelector('.btn-ambient-music') as HTMLButtonElement | null;
    if (musicBtn) {
      const playing = ambientMusicEngine.isPlaying();
      musicBtn.classList.toggle('active', playing);
      musicBtn.title = `Ambient Music: ${mode}`;
      musicBtn.setAttribute('aria-label', `Ambient Music: ${mode}`);
      musicBtn.innerHTML = `${icon('music', 12)}<span class="btn-label"> ${HeaderHUD.ambientLabel(mode)}</span>`;
    }
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

    const mediationBtn = this.element.querySelector('.btn-mediation') as HTMLButtonElement | null;
    mediationBtn?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      if (this.onNavigateToMediation) {
        this.onNavigateToMediation();
      } else {
        window.location.hash = '#mediate';
      }
    });

    const analyticsBtn = this.element.querySelector('.btn-analytics') as HTMLButtonElement | null;
    analyticsBtn?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      if (this.onNavigateToAnalytics) {
        this.onNavigateToAnalytics();
      } else {
        window.location.hash = '#analytics';
      }
    });

    const cockpitBtn = this.element.querySelector('.btn-ielts-cockpit') as HTMLButtonElement | null;
    cockpitBtn?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      if (this.onNavigateToCockpit) {
        this.onNavigateToCockpit();
      } else {
        window.location.hash = '#cockpit';
      }
    });

    const exportProfileBtn = this.element.querySelector('.btn-export-profile') as HTMLButtonElement | null;
    exportProfileBtn?.addEventListener('click', () => {
      HeaderHUD.exportUnifiedProfile();
    });

    const importProfileBtn = this.element.querySelector('.btn-import-profile') as HTMLButtonElement | null;
    const profileFileInput = this.element.querySelector('.hud-profile-file-input') as HTMLInputElement | null;
    importProfileBtn?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      profileFileInput?.click();
    });

    profileFileInput?.addEventListener('change', async () => {
      const file = profileFileInput.files?.[0];
      if (file) {
        await HeaderHUD.importUnifiedProfile(file);
        profileFileInput.value = '';
      }
    });

    const radarBtn = this.element.querySelector('.btn-skill-radar');
    radarBtn?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      MultiSkillQuizModal.open('radar');
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

    const ambientBtn = this.element.querySelector('.btn-ambient-music') as HTMLButtonElement | null;
    ambientBtn?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      const nextMode = ambientMusicEngine.cycleMode();
      this.updateAmbientButtonState(nextMode);
    });

    window.addEventListener('ambient-music-mode-change', (e: any) => {
      this.updateAmbientButtonState(e.detail?.mode || ambientMusicEngine.getMode());
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

    const navigateToTreeOrWorkout = () => {
      AudioSynthesizer.play('click');
      if (this.currentRoute !== 'tree') {
        if (this.onNavigateToTree) {
          this.onNavigateToTree();
        } else {
          window.location.hash = '#tree';
        }
      }
      setTimeout(() => {
        const workoutBanner = document.querySelector('.workout-banner, .workout-panel, .daily-workout-card');
        if (workoutBanner) {
          workoutBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          (workoutBanner as HTMLElement).focus?.();
        }
      }, 50);
    };

    const streakPill = this.element.querySelector('.btn-streak-pill');
    streakPill?.addEventListener('click', navigateToTreeOrWorkout);

    const streakTelemetry = this.element.querySelector('.telemetry-streak-item');
    streakTelemetry?.addEventListener('click', navigateToTreeOrWorkout);

    const settingsBtn = this.element.querySelector('.btn-settings');
    settingsBtn?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      this.openSettingsModal();
    });

    const mobileDrawerBtn = this.element.querySelector('.btn-mobile-menu-drawer');
    mobileDrawerBtn?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      this.openMobileActionSheet();
    });

    const bnavTree = this.element.querySelector('.bnav-tree');
    bnavTree?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      if (this.onNavigateToTree) {
        this.onNavigateToTree();
      } else {
        window.location.hash = '#tree';
      }
    });

    const bnavBlitz = this.element.querySelector('.bnav-blitz');
    bnavBlitz?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      if (this.onNavigateToBlitz) {
        this.onNavigateToBlitz();
      } else {
        window.location.hash = '#blitz';
      }
    });

    const bnavRadar = this.element.querySelector('.bnav-radar');
    bnavRadar?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      MultiSkillQuizModal.open('radar');
    });

    const bnavCockpit = this.element.querySelector('.bnav-cockpit');
    bnavCockpit?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      if (this.onNavigateToCockpit) {
        this.onNavigateToCockpit();
      } else {
        window.location.hash = '#cockpit';
      }
    });

    const bnavMore = this.element.querySelector('.bnav-more');
    bnavMore?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      this.openMobileActionSheet();
    });

    this.element.querySelectorAll<HTMLElement>('.bnav-btn').forEach((btn) => {
      btn.addEventListener('click', () => this.paintBnav(btn));
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
      <div class="completion-receipt-card" style="max-width: 420px; width: 100%;">
        <div class="telemetry-label" style="margin-bottom: 8px;">YOUR LEVEL</div>
        <div style="display: flex; flex-direction: column; gap: var(--space-8); margin-bottom: var(--space-12); width: 100%;">
          <button class="hud-btn btn-open-placement-test" style="width: 100%; box-sizing: border-box; justify-content: center; padding: 10px 14px; font-weight: 700; color: var(--accent-cyan, #38bdf8); border-color: var(--accent-cyan, #38bdf8);">
            ${icon('compass', 14)} <span style="margin-left: 6px;">[ TAKE 2-MIN QUICK PLACEMENT TEST ]</span>
          </button>
          <button class="hud-btn btn-open-skill-radar" style="width: 100%; box-sizing: border-box; justify-content: center; padding: 10px 14px; font-weight: 700; color: var(--accent-gold); border-color: var(--accent-gold);">
            ${icon('target', 14)} <span style="margin-left: 6px;">[ CELESTIAL RADAR &amp; DIAGNOSTIC ]</span>
          </button>
        </div>
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

    modal.querySelector('.btn-open-placement-test')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      close();
      PlacementQuiz.open();
    });

    modal.querySelector('.btn-open-skill-radar')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      close();
      MultiSkillQuizModal.open('radar');
    });

    modal.querySelectorAll('.level-option').forEach(btn => {
      btn.addEventListener('click', () => {
        AudioSynthesizer.play('click');
        StorageManager.setLearnerLevel((btn as HTMLElement).dataset.level as Cefr);
        close();
        window.dispatchEvent(new CustomEvent('learner-level-change'));
      });
    });
    modal.querySelector('.btn-modal-close')?.addEventListener('click', close);
    (modal.querySelector('.level-option.active') as HTMLElement | null)?.focus();
  }

  public openMobileActionSheet(): void {
    const existing = document.getElementById('mobile-action-sheet');
    if (existing) existing.remove();

    const isMuted = AudioSynthesizer.isMute();
    const isZen = ZenMode.isZen();
    const currentTheme = this.currentTheme;
    const ambientMode = ambientMusicEngine.getMode();
    const progression = ProgressionEngine.getState();
    const opener = document.activeElement as HTMLElement | null;

    const sheet = document.createElement('div');
    sheet.id = 'mobile-action-sheet';
    sheet.className = 'completion-modal-overlay interactive mobile-action-sheet-overlay';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-label', 'Mobile Navigation Menu');

    sheet.innerHTML = `
      <div class="completion-receipt-card mobile-action-sheet" style="max-width: 500px; width: 92%; max-height: 85vh; overflow-y: auto; padding: 20px; align-items: stretch; text-align: left; box-sizing: border-box;">
        <div class="mobile-action-sheet-header" style="display: flex; justify-content: space-between; align-items: center; width: 100%; box-sizing: border-box; margin-bottom: 16px; border-bottom: 1px solid var(--border-hairline); padding-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1;">
            <span style="color: var(--accent-gold); display: flex; align-items: center;">${icon('sparkles', 16)}</span>
            <span class="telemetry-label" style="font-size: var(--font-body-compact); font-weight: 700; letter-spacing: 0.1em; color: var(--ink-primary); white-space: normal;">MOBILE CONTROLS</span>
          </div>
          <button class="sheet-btn-close btn-modal-close" aria-label="Close Mobile Menu" style="min-width: 44px; min-height: 44px; width: 44px; height: 44px; padding: 0; background: transparent; border: none; font-size: 16px; color: var(--ink-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: color 0.15s ease; margin-left: auto; flex-shrink: 0;">✕</button>
        </div>

        <div class="mobile-sheet-grid" style="display: flex; flex-direction: column; gap: 10px;">
          <!-- Study Workbenches & RPG Progression -->
          <button class="hud-btn sheet-btn-progression" style="min-height: 48px; padding: 12px; justify-content: flex-start; font-weight: 700; gap: 12px;">
            ${icon('zap', 16)} <span>Level ${progression.level} • ${progression.xp} XP Quests</span>
          </button>
          <button class="hud-btn sheet-btn-mediation" style="min-height: 48px; padding: 12px; justify-content: flex-start; font-weight: 600; color: var(--accent-cyan, #38bdf8); border-color: var(--accent-cyan, #38bdf8); gap: 12px;">
            ${icon('scale', 16)} <span>CEFR Mediation Workbench</span>
          </button>
          <button class="hud-btn sheet-btn-analytics" style="min-height: 48px; padding: 12px; justify-content: flex-start; font-weight: 600; color: var(--accent-purple, #a855f7); border-color: var(--accent-purple, #a855f7); gap: 12px;">
            ${icon('layers', 16)} <span>CEFR Analytics &amp; SERL Dashboard</span>
          </button>
          <button class="hud-btn sheet-btn-tenses" style="min-height: 48px; padding: 12px; justify-content: flex-start; font-weight: 700; color: var(--accent-gold); border-color: var(--accent-gold); gap: 12px;">
            ${icon('clock', 16)} <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">12 Tenses Master Vault</span>
          </button>
          <button class="hud-btn sheet-btn-mistake-vault" style="min-height: 48px; padding: 12px; justify-content: flex-start; font-weight: 700; color: var(--critical, #ef4444); border-color: var(--critical, #ef4444); gap: 12px;">
            ${icon('target', 16)} <span>Smart Mistake Vault &amp; Blitz</span>
          </button>
          <button class="hud-btn sheet-btn-commute-audio" style="min-height: 48px; padding: 12px; justify-content: flex-start; font-weight: 700; color: var(--accent-gold); border-color: var(--accent-gold); gap: 12px;">
            ${icon('headphones', 16)} <span>Hands-Free Commute Audio Loop</span>
          </button>

          <div style="height: 1px; background: var(--border-hairline); margin: 4px 0;"></div>

          <!-- Secondary Audio & Immersion Controls -->
          <button class="hud-btn sheet-btn-theme" style="min-height: 48px; padding: 12px; justify-content: flex-start; font-weight: 600; gap: 12px;">
            ${currentTheme === 'dark' ? icon('sun', 16) : icon('moon', 16)} <span>Toggle Theme: ${currentTheme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          <button class="hud-btn sheet-btn-sound" style="min-height: 48px; padding: 12px; justify-content: flex-start; font-weight: 600; gap: 12px;">
            ${isMuted ? icon('mute', 16) : icon('volume', 16)} <span>Audio Sound Effects: ${isMuted ? 'Muted' : 'Enabled'}</span>
          </button>
          <button class="hud-btn sheet-btn-music" style="min-height: 48px; padding: 12px; justify-content: flex-start; font-weight: 600; gap: 12px;">
            ${icon('music', 16)} <span>Ambient Soundscape: ${HeaderHUD.ambientLabel(ambientMode)}</span>
          </button>
          <button class="hud-btn sheet-btn-zen ${isZen ? 'active' : ''}" style="min-height: 48px; padding: 12px; justify-content: flex-start; font-weight: 600; gap: 12px;">
            ${icon('eye', 16)} <span>Zen Immersion Mode: ${isZen ? 'Active' : 'Off'}</span>
          </button>
          <button class="hud-btn sheet-btn-tour" style="min-height: 48px; padding: 12px; justify-content: flex-start; font-weight: 600; gap: 12px;">
            ${icon('compass', 16)} <span>Re-run Onboarding Tour</span>
          </button>

          <div style="height: 1px; background: var(--border-hairline); margin: 4px 0;"></div>

          <!-- Profile Portability & Settings -->
          <button class="hud-btn sheet-btn-export" style="min-height: 48px; padding: 12px; justify-content: flex-start; font-weight: 600; color: var(--accent-gold); border-color: var(--accent-gold); gap: 12px;">
            ${icon('download', 16)} <span>[ EXPORT PROFILE (JSON) ]</span>
          </button>
          <button class="hud-btn sheet-btn-import" style="min-height: 48px; padding: 12px; justify-content: flex-start; font-weight: 600; color: var(--accent-cyan); border-color: var(--accent-cyan); gap: 12px;">
            ${icon('upload', 16)} <span>[ IMPORT PROFILE (JSON) ]</span>
          </button>
          <input type="file" class="sheet-profile-file-input" accept=".json,application/json" style="display: none;" />

          <button class="hud-btn sheet-btn-settings" style="min-height: 48px; padding: 12px; justify-content: flex-start; font-weight: 700; gap: 12px;">
            ${icon('settings', 16)} <span>Settings &amp; Data Management</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(sheet);

    const close = () => {
      sheet.remove();
      document.removeEventListener('keydown', onKey, true);
      opener?.focus();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        close();
      }
    };
    document.addEventListener('keydown', onKey, true);

    sheet.querySelector('.sheet-btn-close')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      close();
    });

    sheet.addEventListener('click', (e) => {
      if (e.target === sheet) {
        AudioSynthesizer.play('click');
        close();
      }
    });

    sheet.querySelector('.sheet-btn-progression')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      close();
      ProgressionModal.open();
    });

    sheet.querySelector('.sheet-btn-mediation')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      close();
      if (this.onNavigateToMediation) this.onNavigateToMediation();
      else window.location.hash = '#mediate';
    });

    sheet.querySelector('.sheet-btn-analytics')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      close();
      if (this.onNavigateToAnalytics) this.onNavigateToAnalytics();
      else window.location.hash = '#analytics';
    });

    sheet.querySelector('.sheet-btn-tenses')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      close();
      window.location.hash = '#tenses';
    });

    sheet.querySelector('.sheet-btn-mistake-vault')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      HapticEngine.trigger('selection');
      close();
      MistakeVault.open();
    });

    sheet.querySelector('.sheet-btn-commute-audio')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      HapticEngine.trigger('selection');
      close();
      CommuteAudioPlayer.open();
    });

    sheet.querySelector('.sheet-btn-theme')?.addEventListener('click', () => {
      this.toggleTheme();
      close();
    });

    sheet.querySelector('.sheet-btn-sound')?.addEventListener('click', () => {
      AudioSynthesizer.toggleMute();
      AudioSynthesizer.play('click');
      close();
      this.render();
    });

    sheet.querySelector('.sheet-btn-music')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      const nextMode = ambientMusicEngine.cycleMode();
      this.updateAmbientButtonState(nextMode);
      close();
    });

    sheet.querySelector('.sheet-btn-zen')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      ZenMode.toggle();
      close();
    });

    sheet.querySelector('.sheet-btn-tour')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      close();
      SpotlightTour.start(true);
    });

    sheet.querySelector('.sheet-btn-export')?.addEventListener('click', () => {
      close();
      HeaderHUD.exportUnifiedProfile();
    });

    const sheetFileInput = sheet.querySelector('.sheet-profile-file-input') as HTMLInputElement | null;
    sheet.querySelector('.sheet-btn-import')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      sheetFileInput?.click();
    });

    sheetFileInput?.addEventListener('change', async () => {
      const file = sheetFileInput.files?.[0];
      if (file) {
        close();
        await HeaderHUD.importUnifiedProfile(file);
      }
    });

    sheet.querySelector('.sheet-btn-settings')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      close();
      this.openSettingsModal();
    });

    (sheet.querySelector('.sheet-btn-close') as HTMLElement | null)?.focus();
  }

  private openSettingsModal(): void {
    const existing = document.getElementById('settings-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'settings-modal';
    modal.className = 'completion-modal-overlay interactive';
    modal.innerHTML = `
      <div class="completion-receipt-card" style="max-width: 520px; width: 100%; padding: 16px 12px; gap: 12px; box-sizing: border-box;">
        <div class="telemetry-label" style="margin-bottom: 0;">SYSTEM SETTINGS & DATA BACKUP</div>
        <h2 style="font-family: var(--font-mono); font-size: var(--font-h2); font-weight: 700; margin: 0;">
          Settings & Local Storage
        </h2>
        <p style="font-size: var(--font-body-compact); line-height: 1.5; margin: 0; color: var(--ink-secondary);">
          Your progress, SRS intervals, and streaks are safely stored in your browser's local memory. You can export or import a backup JSON file anytime.
        </p>

        <div style="display: flex; flex-direction: column; gap: 12px; width: 100%;">
          <button class="hud-btn btn-restart-placement" style="padding: 12px; justify-content: center; font-weight: 700; color: var(--accent-cyan, #38bdf8); border-color: var(--accent-cyan, #38bdf8);">
            ${icon('target')} Retake 2-Min Placement Assessment
          </button>
          <button class="hud-btn btn-restart-tour" style="padding: 12px; justify-content: center; font-weight: 700; color: var(--accent-gold); border-color: var(--accent-gold);">
            ${icon('compass')} Re-run Onboarding Tour
          </button>
          <button class="hud-btn btn-notifications-toggle ${StorageManager.isNotificationsEnabled() ? 'active' : ''}" style="padding: 12px; justify-content: center; font-weight: 600;" aria-pressed="${StorageManager.isNotificationsEnabled()}">
            🔔 Daily Review Alerts: ${StorageManager.isNotificationsEnabled() ? 'ON' : 'OFF'}
          </button>
          <button class="hud-btn btn-backup-export btn-profile-export" style="padding: 12px; justify-content: center; font-weight: 600;">
            ${icon('download')} [ 💾 EXPORT PROFILE ]
          </button>
          <button class="hud-btn btn-backup-import btn-profile-import" style="padding: 12px; justify-content: center; font-weight: 600;">
            ${icon('upload')} [ 📥 IMPORT PROFILE ]
          </button>
          <!-- Dual Audio Bus Controls -->
          <div class="settings-audio-section" style="display: flex; flex-direction: column; gap: 12px; padding: 12px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-line); border-radius: 6px;">
            <div style="font-size: var(--font-kicker); font-weight: 700; color: var(--accent-gold); letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
              ${icon('volume', 12)} DUAL AUDIO BUS CONTROLS
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; font-size: var(--font-body-compact); gap: 12px;">
              <label for="sfx-volume-slider" style="display: flex; align-items: center; gap: 6px; white-space: nowrap; flex-shrink: 0;">
                SFX Volume: <span id="sfx-vol-label" style="font-family: var(--font-mono); font-weight: 600;">${Math.round(AudioSynthesizer.getVolume() * 100)}%</span>
              </label>
              <input type="range" id="sfx-volume-slider" min="0" max="100" value="${Math.round(AudioSynthesizer.getVolume() * 100)}" style="width: 130px; cursor: pointer; flex-shrink: 0;" />
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; font-size: var(--font-body-compact); gap: 12px;">
              <label for="music-volume-slider" style="display: flex; align-items: center; gap: 6px; white-space: nowrap; flex-shrink: 0;">
                Music Volume: <span id="music-vol-label" style="font-family: var(--font-mono); font-weight: 600;">${Math.round(ambientMusicEngine.getMusicVolume() * 100)}%</span>
              </label>
              <input type="range" id="music-volume-slider" min="0" max="100" value="${Math.round(ambientMusicEngine.getMusicVolume() * 100)}" style="width: 130px; cursor: pointer; flex-shrink: 0;" />
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; font-size: var(--font-body-compact); gap: 12px;">
              <label for="music-mode-select" style="white-space: nowrap; flex-shrink: 0;">Ambient Soundscape:</label>
              <select id="music-mode-select" class="hud-select" style="width: 130px; background: var(--bg-card); color: var(--ink-primary); border: 1px solid var(--border-line); padding: 4px 8px; border-radius: 4px; font-size: var(--font-body-compact); cursor: pointer; flex-shrink: 0;">
                <option value="off" ${ambientMusicEngine.getMode() === 'off' ? 'selected' : ''}>Off</option>
                <option value="calm-chords" ${ambientMusicEngine.getMode() === 'calm-chords' ? 'selected' : ''}>Calm Chords</option>
                <option value="celestial-void" ${ambientMusicEngine.getMode() === 'celestial-void' ? 'selected' : ''}>Celestial Void</option>
                <option value="zen-drone" ${ambientMusicEngine.getMode() === 'zen-drone' ? 'selected' : ''}>Zen Drone</option>
              </select>
            </div>
          </div>

          <button class="hud-btn btn-motion-toggle" style="padding: 12px; justify-content: center; font-weight: 600;" aria-pressed="${document.documentElement.dataset.motion === 'reduce'}">
            ${icon('zap')} <span class="motion-label">${document.documentElement.dataset.motion === 'reduce' ? 'Motion: Reduced' : 'Motion: Full'}</span>
          </button>

          <button class="hud-btn btn-modal-close" style="width: 100%; justify-content: center; padding: 12px; font-weight: 600;">
            Close Settings
          </button>
          <input type="file" class="backup-file-input" accept=".json,application/json" style="display: none;" />
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.btn-restart-placement')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      closeModal();
      PlacementQuiz.open();
    });

    modal.querySelector('.btn-restart-tour')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      closeModal();
      SpotlightTour.start(true);
    });

    const notifBtn = modal.querySelector('.btn-notifications-toggle') as HTMLElement | null;
    notifBtn?.addEventListener('click', async () => {
      AudioSynthesizer.play('click');
      const currentlyEnabled = StorageManager.isNotificationsEnabled();

      if (!currentlyEnabled) {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            StorageManager.setNotificationsEnabled(true);
            updateNotifButton(true);
            AudioSynthesizer.play('absorb');
          } else if (Notification.permission === 'denied') {
            alert('Notification permission was blocked in your browser settings.\nPlease grant notification permissions in your browser address bar to enable daily review alerts.');
            StorageManager.setNotificationsEnabled(false);
            updateNotifButton(false);
          } else {
            try {
              const res = await Notification.requestPermission();
              if (res === 'granted') {
                StorageManager.setNotificationsEnabled(true);
                updateNotifButton(true);
                AudioSynthesizer.play('absorb');
              } else {
                StorageManager.setNotificationsEnabled(false);
                updateNotifButton(false);
              }
            } catch {
              StorageManager.setNotificationsEnabled(true);
              updateNotifButton(true);
            }
          }
        } else {
          StorageManager.setNotificationsEnabled(true);
          updateNotifButton(true);
          AudioSynthesizer.play('absorb');
        }
      } else {
        StorageManager.setNotificationsEnabled(false);
        updateNotifButton(false);
      }
    });

    const updateNotifButton = (enabled: boolean) => {
      if (!notifBtn) return;
      notifBtn.classList.toggle('active', enabled);
      notifBtn.setAttribute('aria-pressed', String(enabled));
      notifBtn.innerHTML = `${icon('bell')} <span class="notifications-label">Daily Review Alerts: ${enabled ? 'ON' : 'OFF'}</span>`;
    };

    const sfxSlider = modal.querySelector('#sfx-volume-slider') as HTMLInputElement | null;
    sfxSlider?.addEventListener('input', (e) => {
      const val = parseInt((e.target as HTMLInputElement).value, 10) / 100;
      AudioSynthesizer.setMasterVolume(val);
      const label = modal.querySelector('#sfx-vol-label');
      if (label) label.textContent = `${Math.round(val * 100)}%`;
    });

    const musicSlider = modal.querySelector('#music-volume-slider') as HTMLInputElement | null;
    musicSlider?.addEventListener('input', (e) => {
      const val = parseInt((e.target as HTMLInputElement).value, 10) / 100;
      ambientMusicEngine.setMusicVolume(val);
      const label = modal.querySelector('#music-vol-label');
      if (label) label.textContent = `${Math.round(val * 100)}%`;
    });

    const musicSelect = modal.querySelector('#music-mode-select') as HTMLSelectElement | null;
    musicSelect?.addEventListener('change', (e) => {
      const mode = (e.target as HTMLSelectElement).value as AmbientMusicMode;
      ambientMusicEngine.setMode(mode);
      AudioSynthesizer.play('click');
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

    const closeModal = () => {
      document.removeEventListener('keydown', onKeyDown);
      modal.remove();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    modal.querySelector('.btn-modal-close')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      closeModal();
    });

    const exportBtn = modal.querySelector('.btn-profile-export') || modal.querySelector('.btn-backup-export');
    exportBtn?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      HeaderHUD.exportUnifiedProfile();
    });

    const fileInput = modal.querySelector('.backup-file-input') as HTMLInputElement | null;
    const importBtn = modal.querySelector('.btn-profile-import') || modal.querySelector('.btn-backup-import');
    importBtn?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      fileInput?.click();
    });

    fileInput?.addEventListener('change', async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      const success = await HeaderHUD.importUnifiedProfile(file);
      if (success) {
        modal.remove();
      }
      fileInput.value = '';
    });
  }

  public static exportUnifiedProfile(): string {
    AudioSynthesizer.play('click');
    const jsonStr = StorageManager.exportUnifiedProfile(true);
    HeaderHUD.showStatusDialog({
      title: 'PROFILE EXPORTED',
      message: 'Unified Student Profile (v5) successfully exported to your downloads folder.',
      type: 'success'
    });
    return jsonStr;
  }

  public static async importUnifiedProfile(file: File): Promise<boolean> {
    const currentState = StorageManager.loadState();
    const hasActiveData = (
      (currentState.cardStates && Object.keys(currentState.cardStates).length > 0) ||
      currentState.totalCardsReviewed > 0 ||
      (currentState.streak && currentState.streak.currentStreak > 0)
    );

    if (hasActiveData) {
      const confirmed = window.confirm(
        'Active student progress detected in local storage.\n\nImporting this profile will merge or overwrite your current progress.\n\nProceed?'
      );
      if (!confirmed) return false;
    }

    return new Promise<boolean>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const raw = e.target?.result as string;
          const result = StorageManager.importUnifiedProfile(raw, 'overwrite');
          if (result && result.success) {
            AudioSynthesizer.play('level-up');
            const restored = result.itemsRestored;
            const details = restored
              ? `Restored: ${restored.singularityCards} SRS cards, ${restored.ieltsKeys} IELTS entries, ${restored.errorRecords} error patterns.`
              : 'All profile and progress records restored.';
            HeaderHUD.showStatusDialog({
              title: 'PROFILE IMPORT SUCCESS',
              message: `Unified Student Profile successfully restored (Schema v${result.detectedVersion || 5}).\n${details}`,
              type: 'success',
              onConfirm: () => {
                window.location.reload();
              }
            });
            resolve(true);
          } else {
            AudioSynthesizer.play('alarm');
            HeaderHUD.showStatusDialog({
              title: 'IMPORT FAILED',
              message: 'Invalid profile data or unsupported schema version.',
              type: 'error'
            });
            resolve(false);
          }
        } catch (err) {
          console.error('[HEADER_HUD] Profile import parse failed:', err);
          AudioSynthesizer.play('alarm');
          HeaderHUD.showStatusDialog({
            title: 'IMPORT PARSE ERROR',
            message: 'Failed to read or parse the selected JSON profile file.',
            type: 'error'
          });
          resolve(false);
        }
      };
      reader.onerror = () => {
        AudioSynthesizer.play('alarm');
        HeaderHUD.showStatusDialog({
          title: 'FILE READ ERROR',
          message: 'An error occurred while reading the file from disk.',
          type: 'error'
        });
        resolve(false);
      };
      reader.readAsText(file);
    });
  }

  public static showStatusDialog(options: {
    title: string;
    message: string;
    type?: 'success' | 'error' | 'info';
    onConfirm?: () => void;
  }): HTMLElement {
    document.getElementById('hud-status-dialog')?.remove();
    const type = options.type || 'info';
    const typeColor = type === 'success' ? 'var(--good, #22c55e)' : type === 'error' ? 'var(--urgent, #ef4444)' : 'var(--accent-gold, #f59e0b)';
    const typeIcon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';

    const dialog = document.createElement('div');
    dialog.id = 'hud-status-dialog';
    dialog.className = 'completion-modal-overlay interactive hud-status-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-label', options.title);

    dialog.innerHTML = `
      <div class="completion-receipt-card" style="max-width: 440px; width: 100%; border-top: 3px solid ${typeColor};">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <span style="font-size: var(--font-h3); color: ${typeColor}; font-weight: 700;">${typeIcon}</span>
          <div class="telemetry-label" style="color: ${typeColor}; font-weight: 700; letter-spacing: 0.08em;">${options.title}</div>
        </div>
        <div style="font-size: var(--font-h4); line-height: 1.6; color: var(--ink-primary); margin-bottom: 20px; white-space: pre-line;">${options.message}</div>
        <button class="hud-btn btn-status-confirm" style="width: 100%; justify-content: center; padding: 10px 0; font-weight: 700; color: ${typeColor}; border-color: ${typeColor};">
          OK
        </button>
      </div>
    `;

    document.body.appendChild(dialog);

    const close = () => {
      dialog.remove();
      document.removeEventListener('keydown', onKey, true);
      if (options.onConfirm) options.onConfirm();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        close();
      }
    };
    document.addEventListener('keydown', onKey, true);

    dialog.querySelector('.btn-status-confirm')?.addEventListener('click', close);
    (dialog.querySelector('.btn-status-confirm') as HTMLElement | null)?.focus();

    return dialog;
  }

  public updateTelemetry(routeName: string): void {
    this.currentRoute = routeName;
    if (routeName === 'tree' || routeName === 'singularity') {
      this.contextualActions = null;
    }
    this.render();
  }
}
