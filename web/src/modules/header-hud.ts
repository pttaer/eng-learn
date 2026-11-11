import { I18n, t } from '../core/i18n';
import { AcousticHaptics } from '../core/acoustic-haptics';
import collocationsData from '../assets/data/collocations.json';
import { Cefr, CEFR_ORDER, CEFR_LABELS } from '../core/cefr';
import { icon, IconName } from '../utils/icons';
import type { RouteId } from '../core/router';
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
import { CognitiveScaffoldingEngine } from '../core/cognitive-scaffolding-mode';
import { FloatingNote } from './floating-note';
import { UndoManager } from '../core/undo-manager';

export interface ContextualDockAction {
  id: string;
  label: string;
  iconHtml?: string;
  onClick: () => void;
  accent?: boolean;
}

export function getRouteName(route: string): string {
  return t(`nav.route_${route}`, undefined, ROUTE_NAMES[route] ?? route.toUpperCase());
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
  drills: 'DRILLS • Luyện tập',
  cockpit: 'IELTS COCKPIT',
  settings: 'SETTINGS • Cài đặt'
};

const LEARN_SHEET: Array<[RouteId, IconName]> = [
  ['read', 'book'],
  ['write', 'edit'],
  ['listen', 'headphones'],
  ['speak', 'mic'],
  ['mediate', 'scale'],
  ['drills', 'note'],
];

const WORDS_SHEET: Array<[RouteId, IconName]> = [
  ['vocab', 'layers'],
  ['colloc', 'grid'],
  ['grammar', 'landmark'],
  ['tenses', 'clock'],
  ['blitz', 'zap'],
];

type BnavTab = 'today' | 'learn' | 'words' | 'ielts' | 'me';

const ROUTE_TAB: Record<RouteId, BnavTab> = {
  tree: 'today', singularity: 'today',
  read: 'learn', write: 'learn', listen: 'learn', speak: 'learn', mediate: 'learn', drills: 'learn',
  vocab: 'words', colloc: 'words', grammar: 'words', tenses: 'words', blitz: 'words',
  cockpit: 'ielts',
  habits: 'me', analytics: 'me', settings: 'me',
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
  public onNavigateToSettings?: () => void;
  public onOpenIelts?: () => void | Promise<void>;
  public onLaunchExternalApp?: (appId: string) => void;
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
    CognitiveScaffoldingEngine.init();

    this.render();
    window.addEventListener('learner-level-change', () => this.render());
    window.addEventListener('time-budget-change', () => this.render());
    window.addEventListener('target-exam-date-change', () => this.render());
    window.addEventListener('target-band-change', () => this.render());
    I18n.onLocaleChange(() => this.render());

    // Live update trigger pill when XP or Level changes
    ProgressionEngine.onProgressUpdate((progState) => {
      const pill = this.element.querySelector('.btn-progression-pill');
      if (pill) {
        pill.innerHTML = `${icon('zap', 12)} ${t('nav.level', undefined, 'LVL')} ${progState.level}<span class="btn-label"> • ${progState.xp} XP</span>`;
      }
      const streakEl = this.element.querySelector('.telemetry-streak');
      if (streakEl) {
        streakEl.innerHTML = `${icon('flame')} ${progState.streak} ${t('nav.days', undefined, 'DAYS')}`;
      }
      const streakPill = this.element.querySelector('.btn-streak-pill');
      if (streakPill) {
        streakPill.innerHTML = `${icon('flame', 13)} ${progState.streak}d`;
        streakPill.setAttribute('title', `${t('nav.daily_streak', undefined, 'Daily Streak')}: ${progState.streak} days. ${t('nav.view_workout', undefined, 'Click to view Daily Workout on Constellation Tree')}`);
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
    const tab = ROUTE_TAB[this.currentRoute as RouteId] ?? 'today';
    const progression = ProgressionEngine.getState();
    const currentStreak = progression.streak || state.streak.currentStreak || 0;
    const timeBudget = StorageManager.getDailyTimeBudget();
    const examDaysRemaining = StorageManager.getExamDaysRemaining();

    this.element.innerHTML = `
      <div class="hud-brand" style="display: flex; align-items: center; gap: 8px;">
        ${!isTree ? `
          <button class="hud-btn btn-back-tree" title="${t('nav.back_to_constellation', undefined, 'Return to Constellation Tree')}" aria-label="${t('nav.back_to_constellation', undefined, 'Return to Constellation Tree')}">
            <span class="back-arrow">←</span> <span class="btn-text">${t('common.back', undefined, 'Back')}</span>
          </button>
          <span class="hud-status-badge active-route-badge" style="font-size: var(--font-kicker);">${getRouteName(this.currentRoute)}</span>
        ` : `
          <span class="hud-brand-title" style="font-size: var(--font-body); font-weight: 700; letter-spacing: 0.1em; display: inline-flex; align-items: center; gap: 8px;">
            ${t('nav.brand_mastery', undefined, 'ENGLISH MASTERY')}
          </span>
        `}
        <button class="hud-btn btn-level" aria-haspopup="dialog" title="${t('nav.change_level', undefined, 'Your CEFR level (click to change)')}" aria-label="${t('nav.change_level', undefined, 'Change Level')}: ${CEFR_LABELS[StorageManager.getLearnerLevel()]}"><span>${StorageManager.getLearnerLevel()}</span><span class="btn-level-arrow" style="font-size: 8px; opacity: 0.65; margin-left: 2px;">▾</span></button>
      </div>

      <div class="hud-telemetry-cluster" style="display: flex; gap: 20px; align-items: center;">
        <div class="telemetry-item telemetry-streak-item" title="${t('nav.daily_streak', undefined, 'Consecutive days you finished the daily workout. Click to view Daily Workout on Constellation Tree')}" style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
          <span class="telemetry-label" style="font-size: var(--font-kicker);">${t('nav.daily_streak', undefined, 'STREAK')}:</span>
          <span class="telemetry-value telemetry-streak" style="color: var(--accent-gold); font-weight: 700;">${icon('flame')} ${currentStreak} ${t('nav.days', undefined, 'DAYS')}</span>
        </div>
        <div class="telemetry-item" title="${t('nav.retention', undefined, 'Share of flashcard reviews you recalled correctly')}" style="display: flex; align-items: center; gap: 6px;">
          <span class="telemetry-label" style="font-size: var(--font-kicker);">${t('nav.retention', undefined, 'RETENTION')}:</span>
          <span class="telemetry-value telemetry-retention" style="color: var(--good); font-weight: 700;">${stats.retentionRate}%</span>
        </div>
        <div class="telemetry-item telemetry-budget-item" title="${t('nav.time_budget_tooltip', undefined, 'Daily Time Budget: Click to toggle (15m / 30m / 60m)')}" style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
          <span class="telemetry-label" style="font-size: var(--font-kicker);">${t('nav.budget', undefined, 'BUDGET')}:</span>
          <span class="telemetry-value telemetry-budget" style="color: var(--accent-cyan); font-weight: 700;">⏱️ ${timeBudget}m</span>
        </div>
        ${examDaysRemaining != null ? `
          <div class="telemetry-item telemetry-exam-item" title="${t('nav.exam_countdown_title', undefined, 'IELTS Exam Countdown')}" style="display: flex; align-items: center; gap: 6px;">
            <span class="telemetry-label" style="font-size: var(--font-kicker);">${t('nav.exam', undefined, 'EXAM')}:</span>
            <span class="telemetry-value" style="color: var(--accent-gold); font-weight: 700;">⏳ ${examDaysRemaining >= 0 ? `${examDaysRemaining}d` : t('nav.ended', undefined, 'Ended')}</span>
          </div>
        ` : ''}
      </div>

      <div class="hud-actions header-actions">
        <button class="hud-btn btn-budget-pill" title="${t('drawer.time_budget', { budget: timeBudget }, `Daily Time Budget: ${timeBudget}m / day`)}" aria-label="${t('drawer.time_budget', { budget: timeBudget }, `Daily Time Budget: ${timeBudget}m / day`)}">
          ⏱️ ${timeBudget}m
        </button>
        ${examDaysRemaining != null ? `
          <button class="hud-btn btn-exam-pill" title="${t('nav.exam_countdown_aria', undefined, 'Target Exam Countdown')}" aria-label="${t('nav.exam_countdown_aria', undefined, 'Target Exam Countdown')}">
            ⏳ ${examDaysRemaining >= 0 ? `${examDaysRemaining}d` : t('nav.ended', undefined, 'Ended')}
          </button>
        ` : ''}
        <button class="hud-btn btn-streak-pill" title="${t('nav.daily_streak', undefined, 'Daily Streak')}: ${currentStreak} days. ${t('nav.view_workout', undefined, 'Click to view Daily Workout on Constellation Tree')}" aria-label="Daily Streak: ${currentStreak} days">
          ${icon('flame', 13)} ${currentStreak}d
        </button>
        <button class="hud-btn btn-mobile-menu-drawer" title="${t('nav.mobile_menu', undefined, 'Open Mobile Navigation Menu')}" aria-label="${t('nav.mobile_menu', undefined, 'Open Mobile Navigation Menu')}" aria-haspopup="dialog">
          ${icon('menu', 16)}
        </button>
        <button class="hud-btn btn-skill-radar" title="${t('dossier.celestial_radar', undefined, 'Launch CEFR Multi-Skill Diagnostic & Celestial Radar')}" aria-label="${t('nav.radar', undefined, 'Skill Radar')}" style="border-color: var(--accent-gold, #a5b4fc); color: var(--accent-gold, #a5b4fc); font-weight: 700;">
          ${icon('target', 12)}<span class="btn-label"> ${t('nav.radar', undefined, 'RADAR')}</span>
        </button>
        <button class="hud-btn btn-blitz" title="${t('nav.speed_blitz', undefined, 'Launch 60-Second Roguelike Speed Blitz Mode')}" aria-label="${t('nav.speed_blitz', undefined, 'Speed Blitz Mode')}" style="border-color: var(--accent-gold); color: var(--accent-gold); font-weight: 700;">
          ${icon('zap', 12)}<span class="btn-label"> ${t('nav.blitz', undefined, 'BLITZ')}</span>
        </button>
        <button class="hud-btn btn-mediation" title="${t('nav.cefr_mediation', undefined, 'Launch CEFR Mediation Workbench (Hotkey: M)')}" aria-label="${t('nav.cefr_mediation', undefined, 'CEFR Mediation Workbench')}" style="border-color: var(--accent-gold, #a5b4fc); color: var(--accent-gold, #a5b4fc); font-weight: 700;">
          ${icon('scale', 12)}<span class="btn-label"> ${t('nav.cefr_mediation', undefined, 'MEDIATION')}</span>
        </button>
        <button class="hud-btn btn-analytics" title="${t('nav.analytics_serl', undefined, 'Launch CEFR Analytics & SERL 2.0 Gauntlet Dashboard')}" aria-label="${t('nav.analytics_serl', undefined, 'Analytics & SERL Dashboard')}" style="border-color: var(--accent-purple, #a855f7); color: var(--accent-purple, #a855f7); font-weight: 700;">
          ${icon('layers', 12)}<span class="btn-label"> ${t('nav.analytics', undefined, 'ANALYTICS')}</span>
        </button>
        <button class="hud-btn btn-ielts-cockpit" title="${t('nav.cd_ielts_cockpit', undefined, 'Launch CD-IELTS Exam Cockpit (Hotkey: C)')}" aria-label="${t('nav.cd_ielts_cockpit', undefined, 'CD-IELTS Exam Cockpit')}" style="border-color: var(--accent-gold, #f59e0b); color: var(--accent-gold, #f59e0b); font-weight: 700;">
          ${icon('graduationCap', 12)}<span class="btn-label"> ${t('nav.cockpit', undefined, 'COCKPIT')}</span>
        </button>
        <button class="hud-btn btn-export-profile" title="${t('settings.export_profile', undefined, 'Export Unified Student Profile (JSON)')}" aria-label="${t('settings.export_profile', undefined, 'Export Profile')}" style="border-color: var(--accent-gold, #f59e0b); color: var(--accent-gold, #f59e0b); font-weight: 600;">
          ${icon('download', 12)}<span class="btn-label"> ${t('common.export', undefined, 'EXPORT')}</span>
        </button>
        <button class="hud-btn btn-import-profile" title="${t('settings.import_profile', undefined, 'Import Unified Student Profile (JSON)')}" aria-label="${t('settings.import_profile', undefined, 'Import Profile')}" style="border-color: var(--accent-cyan, #38bdf8); color: var(--accent-cyan, #38bdf8); font-weight: 600;">
          ${icon('upload', 12)}<span class="btn-label"> ${t('common.import', undefined, 'IMPORT')}</span>
        </button>
        <input type="file" class="hud-profile-file-input" accept=".json,application/json" style="display: none;" />
        <button class="hud-btn btn-progression-pill" title="${t('nav.rpg_progression', undefined, 'RPG Progression & Daily Quests')}" aria-label="${t('nav.rpg_progression', undefined, 'RPG Progression')}">
          ${icon('zap', 12)} ${t('nav.level', undefined, 'LVL')} ${progression.level}<span class="btn-label"> • ${progression.xp} XP</span>
        </button>
        <button class="hud-btn btn-cognitive-mode-toggle" title="${t('nav.cognitive_mode_toggle_title', undefined, 'Toggle Cognitive Scaffolding Mode (Gentle vs Cockpit)')}" aria-label="${t('nav.cognitive_mode_toggle_aria', undefined, 'Toggle Cognitive Scaffolding Mode')}">
          ${CognitiveScaffoldingEngine.isGentle() ? '🌱' : '⚡'}<span class="btn-label"> ${CognitiveScaffoldingEngine.isGentle() ? t('nav.scaffolding_gentle', undefined, 'Gentle') : t('nav.scaffolding_cockpit', undefined, 'Cockpit')}</span>
        </button>
        <button class="hud-btn btn-zen-toggle ${ZenMode.isZen() ? 'active' : ''}" title="${t('nav.zen_immersion_mode', undefined, 'Toggle Zen Immersion Mode (Hotkey: Z)')}" aria-label="${t('nav.zen_immersion_mode', undefined, 'Toggle Zen Immersion Mode')}" aria-pressed="${ZenMode.isZen()}">${HeaderHUD.zenLabel(ZenMode.isZen())}</button>
        <button class="hud-btn btn-theme-toggle" title="${t('nav.theme_toggle', undefined, 'Toggle Theme (Dark / Light)')}" aria-label="${t('nav.theme_toggle', undefined, 'Toggle Theme')}">${this.themeLabel()}</button>
        <button class="hud-btn btn-locale-toggle" title="${t('settings.language', undefined, 'Language')} [${I18n.getLocale() === 'en' ? 'EN' : 'VI'}]" aria-label="${t('settings.language', undefined, 'Toggle Language')}: ${I18n.getLocale() === 'en' ? 'Tiếng Việt' : 'English'}">
          ${icon('globe', 12)}<span class="btn-label"> ${I18n.getLocale() === 'en' ? 'VI' : 'EN'}</span>
        </button>
        <button class="hud-btn btn-launch-tour" title="${t('nav.interactive_tour', undefined, 'Launch Interactive Game Tour')}" aria-label="${t('nav.interactive_tour', undefined, 'Launch Game Tour')}">${icon('compass')}<span class="btn-label"> ${t('settings.reset_tour', undefined, 'Tour')}</span></button>
        <button class="hud-btn btn-ambient-music ${ambientMusicEngine.isPlaying() ? 'active' : ''}" title="${t('nav.ambient_music', undefined, 'Ambient Music')}: ${ambientMusicEngine.getMode()}" aria-label="${t('nav.ambient_music', undefined, 'Ambient Music')}: ${ambientMusicEngine.getMode()}">${icon('music', 12)}<span class="btn-label"> ${HeaderHUD.ambientLabel(ambientMusicEngine.getMode())}</span></button>
        <button class="hud-btn btn-sound-toggle" title="${t('nav.audio_mute', undefined, 'Toggle audio mute')}" aria-label="${t('nav.audio_mute', undefined, 'Toggle audio mute')}" aria-pressed="${isMuted}">${HeaderHUD.soundLabel(isMuted)}</button>
        <button class="hud-btn btn-settings" title="${t('nav.settings_data_management', undefined, 'Settings & Data Management')}" aria-label="${t('nav.settings_data_management', undefined, 'Settings')}">${icon('settings')}<span class="btn-label"> ${t('settings.title', undefined, 'Settings')}</span></button>
      </div>

      <nav class="hud-bottom-nav" aria-label="${t('nav.mobile_menu', undefined, 'Mobile Bottom Navigation')}">
        <button class="bnav-btn bnav-tree ${tab === 'today' ? 'is-active btn-route-active' : ''}" aria-label="${t('nav.today', undefined, 'Today')}" title="${t('nav.today', undefined, 'Today')}">
          <span class="bnav-icon">${icon('sparkles', 18)}</span>
          <span class="bnav-label">${t('nav.today', undefined, 'Today')}</span>
        </button>
        <button class="bnav-btn bnav-learn ${tab === 'learn' ? 'is-active btn-route-active' : ''}" aria-label="${t('nav.learn', undefined, 'Learn')}" title="${t('nav.learn', undefined, 'Learn')}" aria-haspopup="dialog">
          <span class="bnav-icon">${icon('book', 18)}</span>
          <span class="bnav-label">${t('nav.learn', undefined, 'Learn')}</span>
        </button>
        <button class="bnav-btn bnav-words ${tab === 'words' ? 'is-active btn-route-active' : ''}" aria-label="${t('nav.words', undefined, 'Words')}" title="${t('nav.words', undefined, 'Words')}" aria-haspopup="dialog">
          <span class="bnav-icon">${icon('layers', 18)}</span>
          <span class="bnav-label">${t('nav.words', undefined, 'Words')}</span>
        </button>
        <button class="bnav-btn bnav-ielts ${tab === 'ielts' ? 'is-active btn-route-active' : ''}" aria-label="${t('nav.ielts', undefined, 'IELTS')}" title="${t('nav.ielts', undefined, 'IELTS')}">
          <span class="bnav-icon">${icon('graduationCap', 18)}</span>
          <span class="bnav-label">${t('nav.ielts', undefined, 'IELTS')}</span>
        </button>
        <button class="bnav-btn bnav-me ${tab === 'me' ? 'is-active btn-route-active' : ''}" aria-label="${t('nav.me', undefined, 'Me')}" title="${t('nav.me', undefined, 'Me')}" aria-haspopup="dialog">
          <span class="bnav-icon">${icon('trophy', 18)}</span>
          <span class="bnav-label">${t('nav.me', undefined, 'Me')}</span>
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

  public static closeActiveOverlay(): void {
    document.getElementById('mobile-nav-sheet')?.remove();
    document.getElementById('profile-status-dialog')?.remove();
    document.getElementById('profile-transfer-modal')?.remove();
    document.getElementById('settings-dialog')?.remove();
    document.getElementById('hud-confirm-dialog')?.remove();
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
      <button class="bnav-btn bnav-done" aria-label="${t('common.done', undefined, 'Exit drill and return')}" title="${t('common.done', undefined, 'Done / Back')}">
        <span class="bnav-icon">✕</span>
        <span class="bnav-label">${t('common.done', undefined, 'Done')}</span>
      </button>
      ${this.contextualActions.map(act => `
        <button class="bnav-btn bnav-context-act ${act.accent ? 'is-accent' : ''}" data-act-id="${act.id}" aria-label="${act.label}">
          <span class="bnav-icon">${act.iconHtml || '☆'}</span>
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
    return this.currentTheme === 'dark' ? `${icon('sun')}<span class="btn-label"> ${t('settings.light', undefined, 'Light')}</span>` : `${icon('moon')}<span class="btn-label"> ${t('settings.dark', undefined, 'Dark')}</span>`;
  }

  private static soundLabel(muted: boolean): string {
    return muted ? `${icon('mute')}<span class="btn-label"> ${t('nav.muted', undefined, 'Muted')}</span>` : `${icon('volume')}<span class="btn-label"> ${t('settings.sound_music', undefined, 'Sound')}</span>`;
  }

  private static zenLabel(active: boolean): string {
    return `${icon('eye', 12)}<span class="btn-label"> ZEN</span>${active ? '<span class="zen-dot" style="color: var(--accent-gold); margin-left: 2px;">●</span>' : ''}`;
  }

  private static ambientLabel(mode: AmbientMusicMode): string {
    switch (mode) {
      case 'calm-chords': return t('ambient.chords', undefined, 'Chords');
      case 'celestial-void': return t('ambient.void', undefined, 'Void');
      case 'zen-drone': return t('ambient.zen', undefined, 'Zen');
      case 'alpha-baroque': return t('ambient.baroque', undefined, 'Baroque Flow');
      case 'lofi-study': return t('ambient.lofi', undefined, 'Lo-Fi Study');
      case 'gamma-focus': return t('ambient.gamma', undefined, 'Gamma 40Hz');
      case 'rain-piano': return t('ambient.rain', undefined, 'Rain & Piano');
      case 'binaural-theta': return t('ambient.theta', undefined, 'Theta 6Hz');
      case 'synthwave-drive': return t('ambient.synthwave', undefined, 'Synth Sprint');
      default: return t('ambient.music', undefined, 'Music');
    }
  }

  private updateAmbientButtonState(mode: AmbientMusicMode): void {
    const musicBtn = this.element.querySelector('.btn-ambient-music') as HTMLButtonElement | null;
    if (musicBtn) {
      const playing = ambientMusicEngine.isPlaying();
      musicBtn.classList.toggle('active', playing);
      musicBtn.title = `${t('nav.ambient_music', undefined, 'Ambient Music')}: ${mode}`;
      musicBtn.setAttribute('aria-label', `${t('nav.ambient_music', undefined, 'Ambient Music')}: ${mode}`);
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
    const toggleBudget = () => {
      StorageManager.cycleDailyTimeBudget();
      AudioSynthesizer.play('click');
      HapticEngine.trigger('selection');
      this.render();
    };
    this.element.querySelector('.telemetry-budget-item')?.addEventListener('click', toggleBudget);
    this.element.querySelector('.btn-budget-pill')?.addEventListener('click', toggleBudget);

    const onExamClick = () => {
      AudioSynthesizer.play('click');
      if (this.onNavigateToSettings) this.onNavigateToSettings();
      else window.location.hash = '#settings';
    };
    this.element.querySelector('.telemetry-exam-item')?.addEventListener('click', onExamClick);
    this.element.querySelector('.btn-exam-pill')?.addEventListener('click', onExamClick);

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

    const cogBtn = this.element.querySelector('.btn-cognitive-mode-toggle') as HTMLButtonElement | null;
    cogBtn?.addEventListener('click', () => {
      CognitiveScaffoldingEngine.toggle();
      if (cogBtn) {
        const isGentle = CognitiveScaffoldingEngine.isGentle();
        cogBtn.innerHTML = `${isGentle ? '🌱' : '⚡'}<span class="btn-label"> ${isGentle ? 'Gentle' : 'Cockpit'}</span>`;
      }
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

    const localeBtn = this.element.querySelector('.btn-locale-toggle') as HTMLButtonElement | null;
    localeBtn?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      AcousticHaptics.tap();
      HapticEngine.trigger('selection');
      I18n.toggleLocale();
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
      if (this.onNavigateToSettings) {
        this.onNavigateToSettings();
      } else {
        window.location.hash = '#settings';
      }
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

    const bnavLearn = this.element.querySelector('.bnav-learn');
    bnavLearn?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      this.openRouteSheet(t('nav.learn_sheet', undefined, 'Learn'), LEARN_SHEET);
    });

    const bnavWords = this.element.querySelector('.bnav-words');
    bnavWords?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      this.openRouteSheet(t('nav.words_sheet', undefined, 'Words & Grammar'), WORDS_SHEET);
    });

    const bnavIelts = this.element.querySelector('.bnav-ielts');
    bnavIelts?.addEventListener('click', async () => {
      AudioSynthesizer.play('click');
      if (this.onOpenIelts) await this.onOpenIelts();
      else this.onLaunchExternalApp?.('ielts');
    });

    const bnavMe = this.element.querySelector('.bnav-me');
    bnavMe?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      this.openMobileActionSheet();
    });

    this.element.querySelectorAll<HTMLElement>('.bnav-tree').forEach((btn) => {
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
    modal.setAttribute('aria-label', t('nav.change_level', undefined, 'Choose your level'));
    modal.innerHTML = `
      <div class="completion-receipt-card" style="max-width: 420px; width: 100%; max-height: calc(100dvh - 32px); overflow-y: auto; box-sizing: border-box;">
        <div class="telemetry-label" style="margin-bottom: 8px;">${t('nav.change_level', undefined, 'YOUR LEVEL')}</div>
        <div class="action-stack" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; width: 100%;">
          <button class="hud-btn btn-open-placement-test" style="width: 100%; box-sizing: border-box; justify-content: center; padding: 10px 14px; font-weight: 700; color: var(--accent-cyan, #38bdf8); border-color: var(--accent-cyan, #38bdf8); white-space: normal; line-height: 1.3; text-align: center;">
            ${icon('compass', 16)}<span>${t('settings.reset_placement', undefined, 'Take 2-Min Placement Test')}</span>
          </button>
          <button class="hud-btn btn-open-skill-radar" style="width: 100%; box-sizing: border-box; justify-content: center; padding: 10px 14px; font-weight: 700; color: var(--accent-gold); border-color: var(--accent-gold); white-space: normal; line-height: 1.3; text-align: center;">
            ${icon('target', 16)}<span>${t('dossier.celestial_radar', undefined, 'Skill Radar Diagnostic')}</span>
          </button>
        </div>
        <div class="level-picker-grid" style="width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 18px;">
          ${CEFR_ORDER.map(l => `
            <button class="hud-btn level-option ${l === current ? 'active' : ''}" data-level="${l}" aria-pressed="${l === current}" style="width: 100%; box-sizing: border-box; justify-content: flex-start; padding: 10px 12px; font-weight: 600; min-height: 48px; ${l === current ? 'background: var(--accent-gold) !important; color: #080a0f !important; font-weight: 700;' : ''}">
              <span style="font-family: var(--font-mono); font-weight: 800; font-size: 13px; margin-right: 6px;">${l}</span>
              <span style="font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${t('cefr.desc.' + l, undefined, CEFR_LABELS[l])}</span>
            </button>
          `).join('')}
        </div>
        <div class="apple-modal-footer">
          <button type="button" class="apple-bottom-close-btn btn-modal-close">${t('common.cancel', undefined, 'Cancel')}</button>
        </div>
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

  private openSheetShell(id: string, title: string, bodyHtml: string): { sheet: HTMLElement; close: () => void } {
    document.getElementById(id)?.remove();
    const opener = document.activeElement as HTMLElement | null;

    // Dismiss any active floating toast notifications so they don't occlude modal header
    document.querySelectorAll('.apple-toast, .streak-freeze-card, .toast-container').forEach(t => t.remove());

    const sheet = document.createElement('div');
    sheet.id = id;
    sheet.className = 'completion-modal-overlay interactive mobile-action-sheet-overlay';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-label', title);

    sheet.innerHTML = `
      <div class="completion-receipt-card mobile-action-sheet" style="max-width: 500px; width: 92%; max-height: 88dvh; display: flex; flex-direction: column; overflow: hidden; padding: 12px 18px 24px; align-items: stretch; text-align: left; box-sizing: border-box;">
        <div class="sheet-grabber-handle" aria-hidden="true"></div>
        <div class="mobile-action-sheet-header" style="display: flex; justify-content: space-between; align-items: center; width: 100%; box-sizing: border-box; margin-bottom: 12px; border-bottom: 1px solid var(--border-hairline); padding-bottom: 12px; flex-shrink: 0;">
          <div style="display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1;">
            <span style="color: var(--accent-gold); display: flex; align-items: center; flex-shrink: 0;">${icon('user', 18)}</span>
            <span class="mobile-sheet-title">${title}</span>
          </div>
          <button type="button" class="sheet-btn-close btn-modal-close" aria-label="${t('common.close', undefined, 'Close')}">✕</button>
        </div>
        ${bodyHtml}
      </div>
    `;

    document.body.appendChild(sheet);

    // A route change (Android back, a hash link) removes the sheet, so its listeners must go with it
    const close = () => {
      sheet.remove();
      document.removeEventListener('keydown', onKey, true);
      window.removeEventListener('hashchange', close);
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
    window.addEventListener('hashchange', close);

    sheet.querySelectorAll('.btn-modal-close, .sheet-btn-close').forEach(btn => {
      btn.addEventListener('click', () => {
        AudioSynthesizer.play('click');
        close();
      });
    });

    sheet.addEventListener('click', (e) => {
      if (e.target === sheet) {
        AudioSynthesizer.play('click');
        close();
      }
    });

    (sheet.querySelector('.sheet-btn-close') as HTMLElement | null)?.focus();
    return { sheet, close };
  }

  private openRouteSheet(title: string, items: Array<[RouteId, IconName]>): void {
    const body = `
      <div class="sheet-nav-list">
        ${items.map(([route, ic]) => `
          <button type="button" class="hud-btn sheet-nav-item" data-route="${route}">
            ${icon(ic, 16)}<span>${getRouteName(route)}</span>
          </button>`).join('')}
      </div>`;
    const { sheet, close } = this.openSheetShell('mobile-route-sheet', title, body);
    sheet.querySelectorAll<HTMLElement>('.sheet-nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        AudioSynthesizer.play('click');
        HapticEngine.trigger('selection');
        close();
        window.location.hash = `#${btn.dataset.route}`;
      });
    });
  }

  public openMobileActionSheet(): void {
    const isMuted = AudioSynthesizer.isMute();
    const isZen = ZenMode.isZen();
    const currentTheme = this.currentTheme;
    const ambientMode = ambientMusicEngine.getMode();
    const progression = ProgressionEngine.getState();
    const levelInfo = ProgressionEngine.getLevelInfo();
    const rankTitleKey = 'rank.' + levelInfo.rankTitle.toLowerCase().replace(/\s+/g, '_');
    const localizedRank = t(rankTitleKey, undefined, levelInfo.rankTitle);
    const timeBudget = StorageManager.getDailyTimeBudget();
    const targetExamDate = StorageManager.getTargetExamDate();
    const examDaysRemaining = StorageManager.getExamDaysRemaining();

    const { sheet, close } = this.openSheetShell('mobile-action-sheet', t('nav.me_sheet', undefined, 'Me: Progress & Settings'), `
        <div class="mobile-sheet-grid" style="display: flex; flex-direction: column; gap: 8px; overflow-y: auto; flex: 1; min-height: 0; padding-right: 2px;">
          <!-- SECTION 1: TIẾN ĐỘ & MỤC TIÊU -->
          <div class="mobile-sheet-kicker">${t('sheet.kicker_progress', undefined, 'PROGRESS & MILESTONES')}</div>

          <!-- Level/XP Stat Card Hero -->
          <div class="sheet-stat-card sheet-btn-progression" role="button" tabindex="0" aria-label="${t('nav.level', undefined, 'Level')} ${levelInfo.level} • ${progression.xp} XP">
            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="hud-badge" style="background: var(--soft-gold, rgba(245, 158, 11, 0.15)); color: var(--accent-gold, #f59e0b); font-weight: 700; font-size: 12px; padding: 2px 8px; border-radius: 9999px; white-space: nowrap;">
                  ${t('nav.level', undefined, 'Level')} ${levelInfo.level}
                </span>
                <span style="font-weight: 600; font-size: 13px; color: var(--ink-primary);">${localizedRank}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; color: var(--ink-secondary);">
                <span class="font-mono">${levelInfo.progressInLevel} / ${levelInfo.spanInLevel} XP</span>
                <span style="opacity: 0.6; display: flex; align-items: center;">${icon('chevronRight', 14)}</span>
              </div>
            </div>
            <!-- XP Progress Track -->
            <div style="width: 100%; height: 5px; background: rgba(255, 255, 255, 0.08); border-radius: 9999px; overflow: hidden; position: relative;">
              <div style="width: ${Math.min(100, Math.max(4, levelInfo.percentage))}%; height: 100%; background: linear-gradient(90deg, var(--accent-gold, #f59e0b), var(--accent-cyan, #38bdf8)); border-radius: 9999px;"></div>
            </div>
          </div>

          <!-- Habits & 30-Day Mission Log -->
          <button type="button" class="hud-btn mobile-sheet-row sheet-btn-habits">
            <span class="row-ico">${icon('flame', 16)}</span>
            <span class="row-label">${t('nav.habits_mission_log', undefined, 'Habits & 30-Day Mission Log')}</span>
            <span class="row-chev">${icon('chevronRight', 16)}</span>
          </button>

          <!-- CEFR Analytics & SERL -->
          <button type="button" class="hud-btn mobile-sheet-row sheet-btn-analytics">
            <span class="row-ico">${icon('layers', 16)}</span>
            <span class="row-label">${t('nav.analytics_serl', undefined, 'CEFR Analytics & SERL')}</span>
            <span class="row-chev">${icon('chevronRight', 16)}</span>
          </button>

          <!-- SECTION 2: CÔNG CỤ HỌC TẬP -->
          <div class="mobile-sheet-kicker">${t('sheet.kicker_tools', undefined, 'STUDY TOOLS & EXAM')}</div>

          <!-- Skill Radar Check -->
          <button type="button" class="hud-btn mobile-sheet-row sheet-btn-radar">
            <span class="row-ico">${icon('compass', 16)}</span>
            <span class="row-label">${t('nav.radar_full', undefined, 'Skill Radar Diagnostic')}</span>
            <span class="row-chev">${icon('chevronRight', 16)}</span>
          </button>

          <!-- CD-IELTS Exam Station -->
          <button type="button" class="hud-btn mobile-sheet-row sheet-btn-cockpit">
            <span class="row-ico">${icon('graduationCap', 16)}</span>
            <span class="row-label">${t('nav.cd_ielts_cockpit', undefined, 'CD-IELTS Exam Station')}</span>
            <span class="row-chev">${icon('chevronRight', 16)}</span>
          </button>

          <!-- Smart Mistake Vault & Blitz (60s Blitz) -->
          <button type="button" class="hud-btn mobile-sheet-row sheet-btn-mistake-vault">
            <span class="row-ico">${icon('zap', 16)}</span>
            <span class="row-label">${t('nav.mistake_vault', undefined, 'Smart Mistake Vault & Blitz')}</span>
            <span class="row-chev">${icon('chevronRight', 16)}</span>
          </button>

          <!-- Hands-Free Commute Audio -->
          <button type="button" class="hud-btn mobile-sheet-row sheet-btn-commute-audio">
            <span class="row-ico">${icon('headphones', 16)}</span>
            <span class="row-label">${t('nav.commute_audio', undefined, 'Hands-Free Commute Audio Loop')}</span>
            <span class="row-chev">${icon('chevronRight', 16)}</span>
          </button>

          <!-- Quick Notes -->
          <button type="button" class="hud-btn mobile-sheet-row sheet-btn-notes">
            <span class="row-ico">${icon('note', 16)}</span>
            <span class="row-label">${t('nav.quick_notes', undefined, 'Quick Notes')}</span>
            <span class="row-chev">${icon('chevronRight', 16)}</span>
          </button>

          <!-- SECTION 3: CÀI ĐẶT & HỆ THỐNG -->
          <div class="mobile-sheet-kicker">${t('sheet.kicker_settings', undefined, 'SETTINGS & SYSTEM')}</div>

          <!-- Time Budget -->
          <button type="button" class="hud-btn mobile-sheet-row sheet-btn-budget">
            <span class="row-ico">${icon('clock', 16)}</span>
            <span class="row-label">${t('drawer.time_budget_label', undefined, 'Daily Study Budget')}</span>
            <span class="row-val font-mono">${t('drawer.time_budget_val', { budget: timeBudget }, `${timeBudget}m / ngày`)}</span>
            <span class="row-chev">${icon('chevronRight', 16)}</span>
          </button>

          ${targetExamDate ? `
            <button type="button" class="hud-btn mobile-sheet-row sheet-btn-exam">
              <span class="row-ico">${icon('alarm', 16)}</span>
              <span class="row-label">${t('settings.target_exam_date_label', undefined, 'Target IELTS Exam Date:')}</span>
              <span class="row-val font-mono">${(examDaysRemaining ?? 0) >= 0 ? t('drawer.exam_days_left', { days: examDaysRemaining ?? 0 }, `Thi IELTS: còn ${examDaysRemaining} ngày`) : t('drawer.exam_passed', undefined, 'Thi IELTS: Đã qua')}</span>
              <span class="row-chev">${icon('chevronRight', 16)}</span>
            </button>
          ` : ''}

          <!-- Language Switcher Row -->
          <button type="button" class="hud-btn mobile-sheet-row sheet-btn-locale">
            <span class="row-ico">${icon('globe', 16)}</span>
            <span class="row-label">${t('settings.language_label', undefined, 'Interface Language')}</span>
            <span class="row-val">${I18n.getLocale() === 'en' ? 'English (EN)' : 'Tiếng Việt (VI)'}</span>
            <span class="row-chev">${icon('chevronRight', 16)}</span>
          </button>

          <!-- Theme Toggle -->
          <button type="button" class="hud-btn mobile-sheet-row sheet-btn-theme">
            <span class="row-ico">${currentTheme === 'dark' ? icon('sun', 16) : icon('moon', 16)}</span>
            <span class="row-label">${t('nav.theme_toggle', undefined, 'Toggle Theme')}</span>
            <span class="row-val">${currentTheme === 'dark' ? t('settings.light', undefined, 'Light') : t('settings.dark', undefined, 'Dark')}</span>
            <span class="row-chev">${icon('chevronRight', 16)}</span>
          </button>

          <!-- Audio Sound Effects -->
          <button type="button" class="hud-btn mobile-sheet-row sheet-btn-sound">
            <span class="row-ico">${isMuted ? icon('mute', 16) : icon('volume', 16)}</span>
            <span class="row-label">${t('settings.sound_music', undefined, 'Audio Sound Effects')}</span>
            <span class="row-val">${isMuted ? t('nav.muted', undefined, 'Muted') : t('nav.enabled', undefined, 'Enabled')}</span>
            <span class="row-chev">${icon('chevronRight', 16)}</span>
          </button>

          <!-- Ambient Soundscape -->
          <button type="button" class="hud-btn mobile-sheet-row sheet-btn-music">
            <span class="row-ico">${icon('music', 16)}</span>
            <span class="row-label">${t('settings.ambient_music', undefined, 'Ambient Soundscape')}</span>
            <span class="row-val">${HeaderHUD.ambientLabel(ambientMode)}</span>
            <span class="row-chev">${icon('chevronRight', 16)}</span>
          </button>

          <!-- Zen Immersion Mode -->
          <button type="button" class="hud-btn mobile-sheet-row sheet-btn-zen ${isZen ? 'active' : ''}">
            <span class="row-ico">${icon('eye', 16)}</span>
            <span class="row-label">${t('nav.zen_immersion_mode', undefined, 'Zen Immersion Mode')}</span>
            <span class="row-val">${isZen ? t('nav.active', undefined, 'Active') : t('nav.off', undefined, 'Off')}</span>
            <span class="row-chev">${icon('chevronRight', 16)}</span>
          </button>

          <!-- Onboarding Tour -->
          <button type="button" class="hud-btn mobile-sheet-row sheet-btn-tour">
            <span class="row-ico">${icon('rotateCcw', 16)}</span>
            <span class="row-label">${t('settings.reset_tour', undefined, 'Re-run Onboarding Tour')}</span>
            <span class="row-chev">${icon('chevronRight', 16)}</span>
          </button>

          <!-- Profile Portability & Settings -->
          <button type="button" class="hud-btn mobile-sheet-row sheet-btn-export">
            <span class="row-ico">${icon('download', 16)}</span>
            <span class="row-label">${t('settings.export_profile', undefined, 'Export Profile (JSON)')}</span>
            <span class="row-chev">${icon('chevronRight', 16)}</span>
          </button>
          <button type="button" class="hud-btn mobile-sheet-row sheet-btn-import">
            <span class="row-ico">${icon('upload', 16)}</span>
            <span class="row-label">${t('settings.import_profile', undefined, 'Import Profile (JSON)')}</span>
            <span class="row-chev">${icon('chevronRight', 16)}</span>
          </button>
          <input type="file" class="sheet-profile-file-input" accept=".json,application/json" style="display: none;" />

          <button type="button" class="hud-btn mobile-sheet-row sheet-btn-settings" style="font-weight: 700;">
            <span class="row-ico">${icon('settings', 16)}</span>
            <span class="row-label">${t('nav.settings_data_management', undefined, 'Settings & Data Management')}</span>
            <span class="row-chev">${icon('chevronRight', 16)}</span>
          </button>
        </div>
    `);

    sheet.querySelector('.sheet-btn-budget')?.addEventListener('click', () => {
      StorageManager.cycleDailyTimeBudget();
      AudioSynthesizer.play('click');
      HapticEngine.trigger('selection');
      close();
      this.openMobileActionSheet();
    });

    sheet.querySelector('.sheet-btn-exam')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      close();
      if (this.onNavigateToSettings) this.onNavigateToSettings();
      else window.location.hash = '#settings';
    });

    sheet.querySelector('.sheet-btn-locale')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      AcousticHaptics.tap();
      HapticEngine.trigger('selection');
      I18n.toggleLocale();
      close();
      this.openMobileActionSheet();
    });

    const progCard = sheet.querySelector('.sheet-btn-progression');
    progCard?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      close();
      ProgressionModal.open();
    });
    progCard?.addEventListener('keydown', (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.key === 'Enter' || ke.key === ' ') {
        ke.preventDefault();
        AudioSynthesizer.play('click');
        close();
        ProgressionModal.open();
      }
    });

    sheet.querySelector('.sheet-btn-habits')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      close();
      window.location.hash = '#habits';
    });

    sheet.querySelector('.sheet-btn-analytics')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      close();
      if (this.onNavigateToAnalytics) this.onNavigateToAnalytics();
      else window.location.hash = '#analytics';
    });

    sheet.querySelector('.sheet-btn-radar')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      close();
      MultiSkillQuizModal.open('radar');
    });

    sheet.querySelector('.sheet-btn-cockpit')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      close();
      if (this.onNavigateToCockpit) this.onNavigateToCockpit();
      else window.location.hash = '#cockpit';
    });

    sheet.querySelector('.sheet-btn-mistake-vault')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      HapticEngine.trigger('selection');
      close();
      MistakeVault.open();
    });

    sheet.querySelector('.sheet-btn-notes')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      close();
      FloatingNote.open();
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
      if (this.onNavigateToSettings) {
        this.onNavigateToSettings();
      } else {
        window.location.hash = '#settings';
      }
    });
  }

  public openSettingsModal(): void {
    const existing = document.getElementById('settings-modal');
    if (existing) existing.remove();

    const isGentle = CognitiveScaffoldingEngine.isGentle();
    const notifEnabled = StorageManager.isNotificationsEnabled();
    const motionReduced = document.documentElement.dataset.motion === 'reduce';
    const noteEnabled = FloatingNote.isEnabled();
    const sfxVol = Math.round(AudioSynthesizer.getVolume() * 100);
    const musicVol = Math.round(ambientMusicEngine.getMusicVolume() * 100);
    const currentMode = ambientMusicEngine.getMode();

    const modal = document.createElement('div');
    modal.id = 'settings-modal';
    modal.className = 'completion-modal-overlay interactive';
    modal.innerHTML = `
      <div class="completion-receipt-card settings-modal-card">
        <!-- Sticky Header (Never scrolls away) -->
        <div class="settings-modal-head">
          <div style="display: flex; flex-direction: column; gap: 4px; min-width: 0;">
            <div class="settings-group-kicker" style="margin: 0;">
              ${t('settings.kicker', undefined, 'SYSTEM SETTINGS')}
            </div>
            <h2 style="font-family: var(--font-sans); font-size: 20px; font-weight: 700; margin: 0; color: var(--ink-primary); line-height: 1.3;">
              ${t('settings.modal_title', undefined, 'Settings')}
            </h2>
          </div>
          <button type="button" class="btn-modal-close-icon btn-modal-close" aria-label="${t('settings.close_settings', undefined, 'Close Settings')}">
            ${icon('x', 20)}
          </button>
        </div>

        <!-- Scrollable Modal Body with Fade Mask -->
        <div class="settings-modal-body modal-body">
          <!-- Group 1: Language / Ngôn ngữ -->
          <div class="settings-group">
            <div class="settings-group-kicker">
              ${icon('globe', 12)} ${t('settings.group_language', undefined, 'LANGUAGE')}
            </div>
            <div class="settings-card-surface">
              <div class="locale-segmented-control" style="display: flex; gap: 8px; width: 100%;">
                <button type="button" class="hud-btn btn-locale-select ${I18n.getLocale() === 'en' ? 'active' : ''}" data-locale="en" style="flex: 1; justify-content: center; padding: 10px 14px; font-weight: 600; min-height: var(--touch-target-min, 44px); border-radius: var(--radius-btn, 10px); ${I18n.getLocale() === 'en' ? 'background: var(--accent-gold) !important; color: #080a0f !important; font-weight: 700;' : ''}">
                  English
                </button>
                <button type="button" class="hud-btn btn-locale-select ${I18n.getLocale() === 'vi' ? 'active' : ''}" data-locale="vi" style="flex: 1; justify-content: center; padding: 10px 14px; font-weight: 600; min-height: var(--touch-target-min, 44px); border-radius: var(--radius-btn, 10px); ${I18n.getLocale() === 'vi' ? 'background: var(--accent-gold) !important; color: #080a0f !important; font-weight: 700;' : ''}">
                  Tiếng Việt
                </button>
              </div>
            </div>
          </div>

          <!-- Group 2: Learning / Học tập -->
          <div class="settings-group">
            <div class="settings-group-kicker">
              ${icon('book', 12)} ${t('settings.group_learning', undefined, 'LEARNING')}
            </div>
            <div class="settings-card-surface">
              <!-- Cognitive Mode Value Row -->
              <div class="switch-row btn-cognitive-modal-toggle" role="button" tabindex="0" style="cursor: pointer;" title="${t('settings.cognitive_mode', undefined, 'Cognitive Mode')}">
                <span class="switch-label">${t('settings.cognitive_mode', undefined, 'Cognitive Mode')}</span>
                <div class="setting-value-pill" style="display: inline-flex; align-items: center; gap: 6px; font-size: 13.5px; font-weight: 600; color: var(--accent-gold); background: rgba(165, 180, 252, 0.1); padding: 6px 12px; border-radius: var(--radius-btn, 10px); border: 1px solid rgba(165, 180, 252, 0.2); min-height: 36px; box-sizing: border-box;">
                  <span class="cognitive-mode-label">${isGentle ? t('settings.scaffolding_gentle_short', undefined, 'Gentle Scaffolding') : t('settings.scaffolding_tactical_short', undefined, 'Tactical Cockpit')}</span>
                  ${icon('chevron-right', 14)}
                </div>
              </div>

              <!-- Daily Reminders Switch Row -->
              <div class="switch-row btn-notifications-row" role="button" tabindex="0" style="cursor: pointer;">
                <span class="switch-label">${t('settings.daily_alerts', undefined, 'Daily Review Alerts')}</span>
                <button type="button" class="hud-switch btn-notifications-toggle ${notifEnabled ? 'active' : ''}" role="switch" aria-checked="${notifEnabled}" aria-label="${t('settings.daily_alerts', undefined, 'Daily Review Alerts')}">
                  <span class="hud-switch-track"><span class="switch-thumb"></span></span>
                </button>
              </div>

              <!-- Motion Switch Row -->
              <div class="switch-row btn-motion-row" role="button" tabindex="0" style="cursor: pointer;">
                <span class="switch-label">${t('settings.motion_title', undefined, 'Reduced Motion')}</span>
                <button type="button" class="hud-switch btn-motion-toggle ${motionReduced ? 'active' : ''}" role="switch" aria-checked="${motionReduced}" aria-label="${t('settings.motion_title', undefined, 'Reduced Motion')}">
                  <span class="hud-switch-track"><span class="switch-thumb"></span></span>
                </button>
              </div>

              <!-- Floating Quick Note Switch Row -->
              <div class="switch-row btn-floating-note-row" role="button" tabindex="0" style="cursor: pointer;">
                <span class="switch-label">${t('settings.floating_note', undefined, 'Floating Quick Note')}</span>
                <button type="button" class="hud-switch btn-floating-note-toggle ${noteEnabled ? 'active' : ''}" role="switch" aria-checked="${noteEnabled}" aria-label="${t('settings.floating_note', undefined, 'Floating Quick Note')}">
                  <span class="hud-switch-track"><span class="switch-thumb"></span></span>
                </button>
              </div>

              <div style="height: 1px; background: var(--border-hairline); margin: 2px 0;"></div>

              <!-- Ghost Actions -->
              <button type="button" class="btn--ghost btn-restart-placement" style="width: 100%;">
                ${icon('refresh-cw', 16)} <span>${t('settings.reset_placement', undefined, 'Retake 2-Min Placement Assessment')}</span>
              </button>
              <button type="button" class="btn--ghost btn-restart-tour" style="width: 100%;">
                ${icon('compass', 16)} <span>${t('settings.reset_tour', undefined, 'Re-run Onboarding Tour')}</span>
              </button>
            </div>
          </div>

          <!-- Group 3: Audio / Âm thanh -->
          <div class="settings-group">
            <div class="settings-group-kicker">
              ${icon('volume', 12)} ${t('settings.group_audio', undefined, 'AUDIO')}
            </div>
            <div class="settings-card-surface">
              <!-- SFX Volume Row -->
              <div class="setting-row">
                <div class="setting-head">
                  <label for="sfx-volume-slider">${t('settings.sfx_volume', undefined, 'SFX Volume')}</label>
                  <output id="sfx-vol-label" for="sfx-volume-slider">${sfxVol}%</output>
                </div>
                <input type="range" id="sfx-volume-slider" min="0" max="100" value="${sfxVol}" aria-label="${t('settings.sfx_volume', undefined, 'SFX Volume')}" />
              </div>

              <!-- Music Volume Row -->
              <div class="setting-row">
                <div class="setting-head">
                  <label for="music-volume-slider">${t('settings.music_volume', undefined, 'Music Volume')}</label>
                  <output id="music-vol-label" for="music-volume-slider">${musicVol}%</output>
                </div>
                <input type="range" id="music-volume-slider" min="0" max="100" value="${musicVol}" aria-label="${t('settings.music_volume', undefined, 'Music Volume')}" />
              </div>

              <!-- Ambient Soundscape Row -->
              <div class="setting-row">
                <div class="setting-head">
                  <label for="music-mode-select">${t('settings.ambient_music', undefined, 'Ambient Soundscape')}</label>
                </div>
                <select id="music-mode-select" class="hud-select" aria-label="${t('settings.ambient_music', undefined, 'Ambient Soundscape')}">
                  <option value="off" ${currentMode === 'off' ? 'selected' : ''}>${t('settings.ambient_off', undefined, 'Off')}</option>
                  <option value="calm-chords" ${currentMode === 'calm-chords' ? 'selected' : ''}>${t('settings.ambient_chords_label', undefined, 'Calm Chords')}</option>
                  <option value="celestial-void" ${currentMode === 'celestial-void' ? 'selected' : ''}>${t('settings.ambient_void_label', undefined, 'Celestial Void')}</option>
                  <option value="zen-drone" ${currentMode === 'zen-drone' ? 'selected' : ''}>${t('settings.ambient_zen_label', undefined, 'Zen Drone')}</option>
                  <option value="alpha-baroque" ${currentMode === 'alpha-baroque' ? 'selected' : ''}>${t('settings.ambient_alpha_label', undefined, 'Alpha Baroque (60 BPM)')}</option>
                  <option value="lofi-study" ${currentMode === 'lofi-study' ? 'selected' : ''}>${t('settings.ambient_lofi_label', undefined, 'Lo-Fi Study Beats')}</option>
                  <option value="gamma-focus" ${currentMode === 'gamma-focus' ? 'selected' : ''}>${t('settings.ambient_gamma_label', undefined, 'Gamma Focus (40Hz)')}</option>
                  <option value="rain-piano" ${currentMode === 'rain-piano' ? 'selected' : ''}>${t('settings.ambient_rain_label', undefined, 'Rain & Piano')}</option>
                  <option value="binaural-theta" ${currentMode === 'binaural-theta' ? 'selected' : ''}>${t('settings.ambient_theta_label', undefined, 'Binaural Theta (6Hz)')}</option>
                  <option value="synthwave-drive" ${currentMode === 'synthwave-drive' ? 'selected' : ''}>${t('settings.ambient_synthwave_label', undefined, 'Synthwave Sprint (80 BPM)')}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Group 4: Data & Storage / Dữ liệu & Lưu trữ -->
          <div class="settings-group">
            <div class="settings-group-kicker">
              ${icon('database', 12)} ${t('settings.group_data', undefined, 'DATA & STORAGE')}
            </div>
            <div class="settings-card-surface">
              <p style="font-size: var(--font-body-compact, 13px); line-height: 1.5; margin: 0; color: var(--ink-secondary); text-align: left;">
                ${t('settings.storage_desc', undefined, "Your progress, SRS intervals, and streaks are safely stored in your browser's local memory. You can export or import a backup JSON file anytime.")}
              </p>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%; min-width: 0;">
                <button type="button" class="hud-btn btn-backup-export btn-profile-export" style="justify-content: center; min-height: 44px; padding: 10px 14px; font-weight: 600; gap: 8px; border-radius: var(--radius-btn, 10px);">
                  ${icon('download', 16)} <span>${t('settings.export_profile', undefined, 'Export Profile')}</span>
                </button>
                <button type="button" class="hud-btn btn-backup-import btn-profile-import" style="justify-content: center; min-height: 44px; padding: 10px 14px; font-weight: 600; gap: 8px; border-radius: var(--radius-btn, 10px);">
                  ${icon('upload', 16)} <span>${t('settings.import_profile', undefined, 'Import Profile')}</span>
                </button>
              </div>

              <div id="settings-data-status" style="display: none; font-size: 12.5px; font-family: var(--font-mono); color: var(--accent-gold); padding: 8px 12px; border-radius: var(--radius-btn, 10px); background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.25); text-align: left;"></div>
              <input type="file" class="backup-file-input" accept=".json,application/json" style="display: none;" />
            </div>
          </div>
        </div>

        <!-- Sticky Footer (Always in view) -->
        <div class="settings-modal-footer">
          <button type="button" class="apple-bottom-close-btn btn-modal-close" style="width: 100%; min-height: 44px; border-radius: var(--radius-btn, 10px); justify-content: center; font-weight: 600; display: inline-flex; align-items: center;">
            ${t('settings.close_settings', undefined, 'Close Settings')}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelectorAll('.btn-locale-select').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetLocale = (btn as HTMLElement).dataset.locale as 'en' | 'vi';
        if (targetLocale && targetLocale !== I18n.getLocale()) {
          AudioSynthesizer.play('click');
          AcousticHaptics.tap();
          HapticEngine.trigger('selection');
          I18n.setLocale(targetLocale);
          closeModal();
          this.openSettingsModal();
        }
      });
    });

    const cogRow = modal.querySelector('.btn-cognitive-modal-toggle') as HTMLElement | null;
    cogRow?.addEventListener('click', () => {
      CognitiveScaffoldingEngine.toggle();
      AudioSynthesizer.play('click');
      AcousticHaptics.tap();
      const isGentleNow = CognitiveScaffoldingEngine.isGentle();
      const labelEl = modal.querySelector('.cognitive-mode-label');
      if (labelEl) {
        labelEl.textContent = isGentleNow
          ? t('settings.scaffolding_gentle_short', undefined, 'Gentle Scaffolding')
          : t('settings.scaffolding_tactical_short', undefined, 'Tactical Cockpit');
      }
      const headerCogBtn = this.element.querySelector('.btn-cognitive-mode-toggle');
      if (headerCogBtn) {
        headerCogBtn.innerHTML = `${isGentleNow ? '🌱' : '⚡'}<span class="btn-label"> ${isGentleNow ? 'Gentle' : 'Cockpit'}</span>`;
      }
    });

    const notifRow = modal.querySelector('.btn-notifications-row') as HTMLElement | null;
    const notifSwitch = modal.querySelector('.btn-notifications-toggle') as HTMLElement | null;
    notifRow?.addEventListener('click', async () => {
      AudioSynthesizer.play('click');
      const currentlyEnabled = StorageManager.isNotificationsEnabled();

      if (!currentlyEnabled) {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            StorageManager.setNotificationsEnabled(true);
            updateNotifSwitch(true);
            AudioSynthesizer.play('absorb');
          } else if (Notification.permission === 'denied') {
            alert('Notification permission was blocked in your browser settings.\nPlease grant notification permissions in your browser address bar to enable daily review alerts.');
            StorageManager.setNotificationsEnabled(false);
            updateNotifSwitch(false);
          } else {
            try {
              const res = await Notification.requestPermission();
              if (res === 'granted') {
                StorageManager.setNotificationsEnabled(true);
                updateNotifSwitch(true);
                AudioSynthesizer.play('absorb');
              } else {
                StorageManager.setNotificationsEnabled(false);
                updateNotifSwitch(false);
              }
            } catch {
              StorageManager.setNotificationsEnabled(true);
              updateNotifSwitch(true);
            }
          }
        } else {
          StorageManager.setNotificationsEnabled(true);
          updateNotifSwitch(true);
          AudioSynthesizer.play('absorb');
        }
      } else {
        StorageManager.setNotificationsEnabled(false);
        updateNotifSwitch(false);
      }
    });

    const updateNotifSwitch = (enabled: boolean) => {
      if (!notifSwitch) return;
      notifSwitch.classList.toggle('active', enabled);
      notifSwitch.setAttribute('aria-checked', String(enabled));
    };

    const motionRow = modal.querySelector('.btn-motion-row') as HTMLElement | null;
    const motionSwitch = modal.querySelector('.btn-motion-toggle') as HTMLElement | null;
    motionRow?.addEventListener('click', () => {
      const root = document.documentElement;
      const reduce = root.dataset.motion !== 'reduce';
      if (reduce) root.dataset.motion = 'reduce'; else delete root.dataset.motion;
      localStorage.setItem('eng_motion', reduce ? 'reduce' : 'full');
      AudioSynthesizer.play('click');
      AcousticHaptics.tap();
      if (motionSwitch) {
        motionSwitch.classList.toggle('active', reduce);
        motionSwitch.setAttribute('aria-checked', String(reduce));
      }
    });

    const noteRow = modal.querySelector('.btn-floating-note-row') as HTMLElement | null;
    const noteSwitch = modal.querySelector('.btn-floating-note-toggle') as HTMLElement | null;
    noteRow?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      AcousticHaptics.tap();
      HapticEngine.trigger('selection');
      const next = FloatingNote.toggleEnabled();
      if (noteSwitch) {
        noteSwitch.classList.toggle('active', next);
        noteSwitch.setAttribute('aria-checked', String(next));
      }
    });

    modal.querySelector('.btn-restart-placement')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      const confirmed = window.confirm(
        t('settings.reset_placement_confirm', undefined, 'Current CEFR proficiency level will be overwritten. Proceed to retake assessment?')
      );
      if (!confirmed) return;
      const prevLevel = StorageManager.getLearnerLevel();
      closeModal();
      PlacementQuiz.open();
      UndoManager.register(
        t('settings.reset_placement_undo', undefined, 'Placement assessment reset'),
        () => {
          StorageManager.setLearnerLevel(prevLevel);
          this.render();
        },
        4000
      );
    });

    modal.querySelector('.btn-restart-tour')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      closeModal();
      SpotlightTour.start(true);
    });

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

    modal.querySelectorAll('.btn-modal-close').forEach((btn) => {
      btn.addEventListener('click', () => {
        AudioSynthesizer.play('click');
        closeModal();
      });
    });

    const exportBtn = modal.querySelector('.btn-profile-export') || modal.querySelector('.btn-backup-export');
    exportBtn?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      const jsonStr = HeaderHUD.exportUnifiedProfile(true);
      const sizeKB = (new Blob([jsonStr]).size / 1024).toFixed(1);
      const statusEl = modal.querySelector('#settings-data-status') as HTMLElement | null;
      if (statusEl) {
        statusEl.style.display = 'block';
        statusEl.style.color = 'var(--accent-gold)';
        statusEl.textContent = `${t('settings.data_exported', undefined, 'Exported profile backup')} · ${sizeKB} KB`;
        setTimeout(() => {
          if (statusEl) statusEl.style.display = 'none';
        }, 4000);
      }
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
      const statusEl = modal.querySelector('#settings-data-status') as HTMLElement | null;
      try {
        const success = await HeaderHUD.importUnifiedProfile(file);
        if (success) {
          if (statusEl) {
            statusEl.style.display = 'block';
            statusEl.style.color = 'var(--ink-good, #4ade80)';
            statusEl.textContent = t('settings.data_imported', undefined, 'Profile imported successfully');
          }
          setTimeout(() => closeModal(), 1500);
        }
      } catch (err: any) {
        if (statusEl) {
          statusEl.style.display = 'block';
          statusEl.style.color = 'var(--critical, #ef4444)';
          statusEl.textContent = `${t('settings.data_import_error', undefined, 'Import failed')}: ${err?.message || ''}`;
        }
      }
      fileInput.value = '';
    });
  }

  public static exportUnifiedProfile(silent = false): string {
    AudioSynthesizer.play('click');
    const jsonStr = StorageManager.exportUnifiedProfile(true);
    if (!silent) {
      HeaderHUD.showStatusDialog({
        title: 'PROFILE EXPORTED',
        message: 'Unified Student Profile (v5) successfully exported to your downloads folder.',
        type: 'success'
      });
    }
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
      <div class="completion-receipt-card" style="max-width: 440px; width: 100%; max-height: calc(100dvh - 32px); overflow-y: auto; box-sizing: border-box; border-top: 3px solid ${typeColor};">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <span style="font-size: var(--font-h3); color: ${typeColor}; font-weight: 700;">${typeIcon}</span>
          <div class="telemetry-label" style="color: ${typeColor}; font-weight: 700;">${options.title}</div>
        </div>
        <div style="font-size: var(--font-h4); line-height: 1.6; color: var(--ink-primary); margin-bottom: 20px; white-space: pre-line;">${options.message}</div>
        <button class="hud-btn btn-status-confirm" style="width: 100%; justify-content: center; padding: 10px 0; font-weight: 700; color: ${typeColor}; border-color: ${typeColor}; border-radius: var(--radius-btn, 10px);">
          ${t('common.ok', undefined, 'OK')}
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

  public static showConfirmDialog(options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'warning' | 'danger' | 'info';
  }): Promise<boolean> {
    document.getElementById('hud-confirm-dialog')?.remove();
    return new Promise<boolean>((resolve) => {
      const type = options.type || 'warning';
      const typeColor = type === 'danger'
        ? 'var(--urgent, #ef4444)'
        : type === 'warning'
          ? 'var(--accent-gold, #f59e0b)'
          : 'var(--accent-cyan, #38bdf8)';
      const typeIcon = type === 'danger' ? '⚠️' : type === 'warning' ? '⚠️' : 'ℹ️';

      const isVi = I18n.getLocale() === 'vi';
      const confirmLabel = options.confirmText || (isVi ? 'Xác nhận' : 'Confirm');
      const cancelLabel = options.cancelText || (isVi ? 'Huỷ' : 'Cancel');

      const dialog = document.createElement('div');
      dialog.id = 'hud-confirm-dialog';
      dialog.className = 'completion-modal-overlay interactive hud-confirm-dialog';
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');
      dialog.setAttribute('aria-label', options.title);

      dialog.innerHTML = `
        <div class="completion-receipt-card" style="max-width: 440px; width: 100%; max-height: calc(100dvh - 32px); overflow-y: auto; box-sizing: border-box; border-top: 3px solid ${typeColor};">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            <span style="font-size: var(--font-h3); color: ${typeColor}; font-weight: 700;">${typeIcon}</span>
            <div class="telemetry-label" style="color: ${typeColor}; font-weight: 700;">${options.title}</div>
          </div>
          <div style="font-size: var(--font-h4); line-height: 1.6; color: var(--ink-primary); margin-bottom: 20px; white-space: pre-line;">${options.message}</div>
          <div class="action-stack" style="display: flex; flex-direction: column; gap: 12px; width: 100%;">
            <button type="button" class="hud-btn btn-confirm-cancel apple-press" style="width: 100%; justify-content: center; padding: 12px; font-weight: 700; background: var(--accent-gold, #f59e0b); color: #080a0f; border: 1px solid var(--accent-gold, #f59e0b); border-radius: var(--radius-btn, 10px);">
              ${cancelLabel}
            </button>
            <button type="button" class="hud-btn btn-confirm-proceed apple-press" style="width: 100%; justify-content: center; padding: 10px; font-weight: 600; color: var(--urgent, #ef4444); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: var(--radius-btn, 10px); background: rgba(239, 68, 68, 0.08);">
              ${confirmLabel}
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(dialog);

      let finished = false;
      const finish = (result: boolean) => {
        if (finished) return;
        finished = true;
        document.removeEventListener('keydown', onKey, true);
        dialog.remove();
        resolve(result);
      };

      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          finish(false);
        }
      };
      document.addEventListener('keydown', onKey, true);

      dialog.querySelector('.btn-confirm-cancel')?.addEventListener('click', () => finish(false));
      dialog.querySelector('.btn-confirm-proceed')?.addEventListener('click', () => finish(true));
      (dialog.querySelector('.btn-confirm-cancel') as HTMLElement | null)?.focus();
    });
  }

  public updateTelemetry(routeName: string): void {
    this.currentRoute = routeName;
    if (routeName === 'tree' || routeName === 'singularity') {
      this.contextualActions = null;
    }
    this.render();
  }
}
