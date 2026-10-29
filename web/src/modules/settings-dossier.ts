/**
 * Settings & System Environment Dossier
 * 
 * 6-Card Canonical Architecture conforming to docs/TYPOGRAPHY_SPACING_RULES.md:
 * 1. Learning & CEFR Profile (CEFR levels, placement test, daily XP goal)
 * 2. Appearance & Accessibility (theme, motion, zen mode, contrast)
 * 3. Dual Audio Bus & Acoustics (SFX, ambient soundscape, music vol, TTS rate, haptics)
 * 4. Notifications & Drill Alerts (daily review Web Push, schedule, streak protection)
 * 5. Data Telemetry & Storage (localStorage stats, JSON backup export/import, danger zone reset)
 * 6. System & About (version, offline PWA status, onboarding tour replay, quests)
 */

import { StorageManager } from '../utils/storage';
import { AudioSynthesizer } from '../core/audio-synthesizer';
import { ambientMusicEngine, AmbientMusicMode } from '../core/ambient-music-engine';
import { HapticEngine } from '../core/haptic-engine';
import { ZenMode } from '../core/zen-mode';
import { SpotlightTour } from '../core/spotlight-tour';
import { PlacementQuiz } from './placement-quiz';
import { MultiSkillQuizModal } from './multi-skill-quiz-modal';
import { ProgressionModal } from './progression-modal';
import { ProgressionEngine } from '../core/progression-engine';
import { HeaderHUD } from './header-hud';
import { icon } from '../utils/icons';
import { Cefr, CEFR_ORDER, CEFR_LABELS } from '../core/cefr';
import { I18n, t } from '../core/i18n';
import { AccentThemeManager, ACCENT_THEMES, AccentThemeId } from '../core/accent-theme';

export class SettingsDossier {
  private root: HTMLElement;
  private confirmingReset: boolean = false;
  private resetTimeout: any = null;

  constructor() {
    this.root = document.createElement('div');
    this.root.className = 'dossier-workspace settings-dossier';
    this.root.setAttribute('role', 'region');
    this.root.setAttribute('aria-label', 'System Settings & Preferences');

    // Delegated event listener on root
    this.root.addEventListener('click', (e) => this.handleClick(e));
    this.root.addEventListener('input', (e) => this.handleInput(e));
    this.root.addEventListener('change', (e) => this.handleChange(e));

    I18n.onLocaleChange(() => {
      if (document.body.contains(this.root)) {
        this.draw();
      }
    });
  }

  public render(): HTMLElement {
    this.draw();
    return this.root;
  }

  public teardown(): void {
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
      this.resetTimeout = null;
    }
    this.confirmingReset = false;
  }

  private calculateStorageUsage(): { kb: number; srsCount: number; streak: number; mistakes: number } {
    let totalBytes = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const val = localStorage.getItem(key) || '';
          totalBytes += (key.length + val.length) * 2; // UTF-16
        }
      }
    } catch {
      totalBytes = 1024 * 50;
    }

    const state = StorageManager.loadState();
    const srsCount = state.cardStates ? Object.keys(state.cardStates).length : 0;
    const streak = state.streak?.currentStreak || 0;

    let mistakes = 0;
    try {
      const rawMistakes = localStorage.getItem('eng_mistakes_v1');
      if (rawMistakes) {
        const parsed = JSON.parse(rawMistakes);
        mistakes = Array.isArray(parsed) ? parsed.length : 0;
      }
    } catch {
      mistakes = 0;
    }

    return {
      kb: Math.round(totalBytes / 1024),
      srsCount,
      streak,
      mistakes
    };
  }

  private draw(): void {
    const currentLevel = StorageManager.getLearnerLevel();
    const currentTheme = document.documentElement.getAttribute('data-theme') || localStorage.getItem('eng_theme') || 'dark';
    const isReducedMotion = document.documentElement.dataset.motion === 'reduce' || localStorage.getItem('eng_motion') === 'reduce';
    const isZen = ZenMode.isZen();
    const isHighContrast = localStorage.getItem('eng_high_contrast') === 'true';

    const isMuted = AudioSynthesizer.isMute();
    const sfxVol = Math.round(AudioSynthesizer.getVolume() * 100);
    const musicVol = Math.round(ambientMusicEngine.getMusicVolume() * 100);
    const musicMode = ambientMusicEngine.getMode();
    const ttsRate = localStorage.getItem('eng_tts_rate') || '1.0';
    const hapticsEnabled = localStorage.getItem('eng_haptics_enabled') !== 'false';

    const notifEnabled = StorageManager.isNotificationsEnabled();
    const reminderTime = localStorage.getItem('eng_reminder_time') || '20:00';
    const dailyGoalXp = localStorage.getItem('eng_daily_goal_xp') || '100';

    const targetBand = StorageManager.getTargetBand();
    const targetExamDate = StorageManager.getTargetExamDate();
    const examDaysRemaining = StorageManager.getExamDaysRemaining();
    const dailyTimeBudget = StorageManager.getDailyTimeBudget();
    const weaknessFirst = StorageManager.isWeaknessFirstEnabled();
    const currentAccent = AccentThemeManager.getTheme();
    const ieltsAccent = localStorage.getItem('eng_ielts_accent') || 'uk-rp';

    const telemetry = this.calculateStorageUsage();
    const progression = ProgressionEngine.getState();

    this.root.innerHTML = `
      <div class="settings-container" style="width: 100%; max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--gap-block, 16px); padding-bottom: var(--safe-bottom-dock, 84px); box-sizing: border-box;">

        <!-- Header Block -->
        <header class="settings-header" style="display: flex; flex-direction: column; gap: 8px; text-align: left; width: 100%;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="telemetry-label" style="color: var(--accent-gold); font-size: var(--font-kicker); letter-spacing: var(--font-kicker-spacing, 0.08em); font-weight: 700; font-family: var(--font-mono); text-transform: uppercase;">
              ${t('settings.telemetry_kicker', undefined, 'SYSTEM PREFERENCES & TELEMETRY')}
            </span>
          </div>
          <h1 style="margin: 0; font-size: var(--font-h1, 24px); font-family: var(--font-mono); font-weight: 700; color: var(--ink-primary); line-height: 1.2;">
            ${t('settings.environment_title', undefined, 'Settings & Environment')}
          </h1>
          <p style="margin: 0; font-size: var(--font-body-compact, 14px); color: var(--ink-secondary); line-height: 1.5;">
            ${t('settings.header_desc', undefined, 'Manage CEFR levels, dual audio bus configuration, SRS notifications, focused UI modes, and comprehensive profile backups.')}
          </p>
        </header>

        <!-- CARD 1: LỘ TRÌNH & HỒ SƠ HỌC TẬP -->
        <section class="settings-card hud-outline-card" style="padding: 16px; border-radius: var(--radius-squircle-md, 12px); border: 1px solid var(--border-hairline); background: var(--bg-card); display: flex; flex-direction: column; gap: 12px; position: relative;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: var(--accent-gold); display: flex; align-items: center;">${icon('target', 18)}</span>
              <span style="font-size: var(--font-kicker); font-family: var(--font-mono); font-weight: 700; color: var(--accent-gold); letter-spacing: 0.08em; text-transform: uppercase;">
                ${t('settings.card1_kicker', undefined, '01 • ROADMAP & CEFR PROFILE')}
              </span>
            </div>
            <span class="hud-status-badge" style="font-size: var(--font-kicker); font-family: var(--font-mono); color: var(--accent-cyan, #38bdf8);">
              LEVEL ${progression.level} (${progression.xp} XP)
            </span>
          </div>

          <h2 style="margin: 0; font-size: var(--font-h3, 16px); font-weight: 700; color: var(--ink-primary);">
            ${t('settings.card1_title', undefined, 'CEFR Proficiency & Learning Targets')}
          </h2>
          <p style="margin: 0; font-size: var(--font-body-compact, 13px); color: var(--ink-secondary); line-height: 1.5;">
            ${t('settings.card1_desc', undefined, 'Your active proficiency level dynamically tunes the complexity of exercises, collocation vaults, and drills across the entire system.')}
          </p>

          <!-- Level Buttons Track -->
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <span style="font-size: var(--font-kicker); color: var(--ink-muted); font-weight: 600; text-transform: uppercase;">${t('settings.select_cefr_label', undefined, 'Select Active CEFR Level:')}</span>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 8px;">
              ${CEFR_ORDER.map(lvl => `
                <button type="button" class="hud-btn btn-cefr-pill ${lvl === currentLevel ? 'active' : ''}" data-cefr="${lvl}" aria-pressed="${lvl === currentLevel}" style="min-height: var(--touch-target-min, 44px); padding: 8px 12px; justify-content: center; font-weight: 700; font-family: var(--font-mono);">
                  ${lvl} <span style="font-size: 11px; font-weight: normal; margin-left: 4px; opacity: 0.85;">(${CEFR_LABELS[lvl].split(' ').slice(1).join(' ')})</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Daily Goal Selector -->
          <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 4px;">
            <span style="font-size: var(--font-kicker); color: var(--ink-muted); font-weight: 600; text-transform: uppercase;">${t('settings.daily_xp_goal_label', undefined, 'Daily XP Goal:')}</span>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              <button type="button" class="hud-btn btn-xp-goal ${dailyGoalXp === '50' ? 'active' : ''}" data-goal="50" style="flex: 1; min-height: var(--touch-target-min, 44px); justify-content: center; font-weight: 600;">${t('settings.xp_maintain', undefined, '50 XP (Maintain)')}</button>
              <button type="button" class="hud-btn btn-xp-goal ${dailyGoalXp === '100' ? 'active' : ''}" data-goal="100" style="flex: 1; min-height: var(--touch-target-min, 44px); justify-content: center; font-weight: 600;">${t('settings.xp_standard', undefined, '100 XP (Standard)')}</button>
              <button type="button" class="hud-btn btn-xp-goal ${dailyGoalXp === '200' ? 'active' : ''}" data-goal="200" style="flex: 1; min-height: var(--touch-target-min, 44px); justify-content: center; font-weight: 600;">${t('settings.xp_intensive', undefined, '200 XP (Intensive)')}</button>
            </div>
          </div>

          <!-- Target IELTS Band Selector -->
          <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: var(--font-kicker); color: var(--ink-muted); font-weight: 600; text-transform: uppercase;">${t('settings.target_ielts_band_label', undefined, 'Target IELTS Band:')}</span>
              <span style="font-family: var(--font-mono); font-size: 13px; font-weight: 700; color: var(--accent-gold);">Band ${targetBand.toFixed(1)}</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(64px, 1fr)); gap: 6px;">
              ${[5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5].map(b => `
                <button type="button" class="hud-btn btn-target-band-pill ${b === targetBand ? 'active' : ''}" data-target-band="${b}" aria-pressed="${b === targetBand}" style="min-height: var(--touch-target-min, 44px); justify-content: center; font-weight: 700; font-family: var(--font-mono);">
                  ${b.toFixed(1)}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Target Exam Date & Live Countdown -->
          <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 4px; padding: 12px; background: rgba(255, 255, 255, 0.03); border-radius: var(--radius-squircle-sm, 8px);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
              <label for="settings-target-exam-date" style="font-size: var(--font-body-compact); font-weight: 600; color: var(--ink-primary); display: flex; align-items: center; gap: 8px;">
                ${icon('clock', 14)} ${t('settings.target_exam_date_label', undefined, 'Target IELTS Exam Date:')}
              </label>
              <input type="date" id="settings-target-exam-date" value="${targetExamDate || ''}" class="hud-input" style="min-height: 38px; padding: 4px 10px; background: var(--bg-card); color: var(--ink-primary); border: 1px solid var(--border-hairline); border-radius: 8px; font-family: var(--font-mono); font-size: 14px; cursor: pointer;" />
            </div>
            <div style="font-size: 13px; font-family: var(--font-mono); color: var(--accent-cyan); display: flex; align-items: center; gap: 6px;">
              ${targetExamDate ? (
                examDaysRemaining != null && examDaysRemaining >= 0
                  ? t('settings.days_remaining_countdown', { days: examDaysRemaining, date: targetExamDate }, `⏳ ${examDaysRemaining} days remaining until exam (${targetExamDate})`)
                  : t('settings.exam_date_passed', { date: targetExamDate }, `⚠️ Exam date has passed (${targetExamDate})`)
              ) : t('settings.exam_date_unset', undefined, 'ℹ️ No exam date set (select a date to activate countdown)')}
            </div>
          </div>

          <!-- Daily Time Budget (15m / 30m / 60m) -->
          <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: var(--font-kicker); color: var(--ink-muted); font-weight: 600; text-transform: uppercase;">${t('settings.time_budget_label', undefined, 'Daily Study Time Budget:')}</span>
              <span style="font-family: var(--font-mono); font-size: 13px; font-weight: 700; color: var(--good);">${t('settings.mins_per_day', { mins: dailyTimeBudget }, `${dailyTimeBudget} mins/day`)}</span>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              <button type="button" class="hud-btn btn-time-budget-pill ${dailyTimeBudget === 15 ? 'active' : ''}" data-budget="15" style="flex: 1; min-height: var(--touch-target-min, 44px); justify-content: center; font-weight: 600;">${t('settings.time_15m', undefined, '15m (Brisk)')}</button>
              <button type="button" class="hud-btn btn-time-budget-pill ${dailyTimeBudget === 30 ? 'active' : ''}" data-budget="30" style="flex: 1; min-height: var(--touch-target-min, 44px); justify-content: center; font-weight: 600;">${t('settings.time_30m', undefined, '30m (Standard)')}</button>
              <button type="button" class="hud-btn btn-time-budget-pill ${dailyTimeBudget === 60 ? 'active' : ''}" data-budget="60" style="flex: 1; min-height: var(--touch-target-min, 44px); justify-content: center; font-weight: 600;">${t('settings.time_60m', undefined, '60m (Intensive)')}</button>
            </div>
          </div>

          <!-- Weakness-First Focus Toggle -->
          <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 4px;">
            <button type="button" class="hud-btn btn-toggle-weakness-first ${weaknessFirst ? 'active' : ''}" style="width: 100%; min-height: var(--touch-target-min, 44px); padding: 10px 14px; justify-content: space-between; font-weight: 600;">
              <span style="display: flex; align-items: center; gap: 8px;">
                ${icon('target', 16)}
                <span>${t('settings.weakness_first_label', undefined, 'Prioritize Weaknesses (Weakness-First Focus)')}</span>
              </span>
              <strong style="color: ${weaknessFirst ? 'var(--good)' : 'var(--ink-muted)'};">${weaknessFirst ? t('settings.status_on', undefined, 'ON ●') : t('settings.status_off', undefined, 'OFF')}</strong>
            </button>
            <span style="font-size: 12px; color: var(--ink-secondary); line-height: 1.4;">
              ${t('settings.weakness_first_desc', undefined, 'Automatically surfaces question types, vocabulary items, and L1 transfer traps you previously missed in the Mistake Vault to the start of practice sessions.')}
            </span>
          </div>

          <!-- Quick Action Buttons -->
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px;">
            <button type="button" class="hud-btn btn-action-placement" style="flex: 1; min-width: 220px; min-height: var(--touch-target-min, 44px); justify-content: center; font-weight: 700; color: var(--accent-cyan, #38bdf8); border-color: var(--accent-cyan, #38bdf8);">
              ${icon('target', 16)}<span>${t('settings.btn_retake_placement', undefined, 'Retake 2-Min Placement Assessment')}</span>
            </button>
            <button type="button" class="hud-btn btn-action-radar" style="flex: 1; min-width: 220px; min-height: var(--touch-target-min, 44px); justify-content: center; font-weight: 700; color: var(--accent-gold); border-color: var(--accent-gold);">
              ${icon('compass', 16)}<span>${t('settings.celestial_radar_diagnostic', undefined, 'Celestial Radar & Chẩn đoán')}</span>
            </button>
          </div>
        </section>

        <!-- CARD 2: GIAO DIỆN & TRỢ NĂNG -->
        <section class="settings-card hud-outline-card" style="padding: 16px; border-radius: var(--radius-squircle-md, 12px); border: 1px solid var(--border-hairline); background: var(--bg-card); display: flex; flex-direction: column; gap: 12px; position: relative;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: var(--accent-gold); display: flex; align-items: center;">${icon('sparkles', 18)}</span>
            <span style="font-size: var(--font-kicker); font-family: var(--font-mono); font-weight: 700; color: var(--accent-gold); letter-spacing: 0.08em; text-transform: uppercase;">
              ${t('settings.card2_kicker', undefined, '02 • INTERFACE & ACCESSIBILITY')}
            </span>
          </div>

          <h2 style="margin: 0; font-size: var(--font-h3, 16px); font-weight: 700; color: var(--ink-primary);">
            ${t('settings.card2_title', undefined, 'Display Modes, Motion & Focus')}
          </h2>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px;">
            <!-- Language Selector -->
            <div style="display: flex; flex-direction: column; gap: 6px; grid-column: 1 / -1;">
              <span style="font-size: var(--font-kicker); color: var(--ink-muted); font-weight: 600; text-transform: uppercase;">
                ${t('settings.language', undefined, 'Ngôn ngữ giao diện (Interface Language)')}:
              </span>
              <div style="display: flex; gap: 8px;">
                <button type="button" class="hud-btn btn-locale-choice ${I18n.getLocale() === 'en' ? 'active' : ''}" data-locale="en" style="flex: 1; min-height: var(--touch-target-min, 44px); justify-content: center; font-weight: 600;">
                  English (US/UK)
                </button>
                <button type="button" class="hud-btn btn-locale-choice ${I18n.getLocale() === 'vi' ? 'active' : ''}" data-locale="vi" style="flex: 1; min-height: var(--touch-target-min, 44px); justify-content: center; font-weight: 600;">
                  Tiếng Việt (Bản địa)
                </button>
              </div>
            </div>

            <!-- Theme Toggle -->
            <button type="button" class="hud-btn btn-toggle-theme" style="min-height: var(--touch-target-min, 44px); padding: 10px 14px; justify-content: flex-start; font-weight: 600; gap: 10px;">
              ${currentTheme === 'dark' ? icon('sun', 16) : icon('moon', 16)}
              <span>${t('settings.theme_label', { mode: currentTheme === 'dark' ? t('settings.theme_dark_mode', undefined, 'Dark Mode') : t('settings.theme_light_mode', undefined, 'Light Mode') }, `Theme: ${currentTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}`)}</span>
            </button>

            <!-- Motion Toggle -->
            <button type="button" class="hud-btn btn-toggle-motion ${isReducedMotion ? 'active' : ''}" style="min-height: var(--touch-target-min, 44px); padding: 10px 14px; justify-content: flex-start; font-weight: 600; gap: 10px;">
              ${icon('zap', 16)}
              <span>${t('settings.motion_label', { mode: isReducedMotion ? t('settings.motion_reduced', undefined, 'Reduced Motion') : t('settings.motion_full', undefined, 'Smooth Animation') }, `Motion: ${isReducedMotion ? 'Reduced Motion' : 'Smooth Animation'}`)}</span>
            </button>

            <!-- Zen Mode Toggle -->
            <button type="button" class="hud-btn btn-toggle-zen ${isZen ? 'active' : ''}" style="min-height: var(--touch-target-min, 44px); padding: 10px 14px; justify-content: flex-start; font-weight: 600; gap: 10px;">
              ${icon('eye', 16)}
              <span>${t('settings.zen_label', { status: isZen ? t('settings.status_on', undefined, 'ON ●') : t('settings.status_off', undefined, 'OFF') }, `Zen Immersion: ${isZen ? 'ON ●' : 'OFF'}`)}</span>
            </button>

            <!-- High Contrast Toggle -->
            <button type="button" class="hud-btn btn-toggle-contrast ${isHighContrast ? 'active' : ''}" style="min-height: var(--touch-target-min, 44px); padding: 10px 14px; justify-content: flex-start; font-weight: 600; gap: 10px;">
              ${icon('layers', 16)}
              <span>${t('settings.contrast_label', { status: isHighContrast ? t('settings.contrast_high', undefined, 'High Contrast') : t('settings.contrast_standard', undefined, 'Standard') }, `High Contrast: ${isHighContrast ? 'High Contrast' : 'Standard'}`)}</span>
            </button>

            <!-- Primary Accent Color Swatches -->
            <div style="display: flex; flex-direction: column; gap: 8px; grid-column: 1 / -1; margin-top: 6px;">
              <span style="font-size: var(--font-kicker); color: var(--ink-muted); font-weight: 600; text-transform: uppercase;">
                ${t('settings.accent_theme_label', undefined, 'Primary Accent Theme:')}
              </span>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px;">
                ${(Object.keys(ACCENT_THEMES) as AccentThemeId[]).map(themeKey => {
                  const item = ACCENT_THEMES[themeKey];
                  const isCurrent = currentAccent === themeKey;
                  return `
                    <button type="button" class="hud-btn btn-accent-swatch ${isCurrent ? 'active' : ''}" data-accent="${themeKey}" aria-pressed="${isCurrent}" style="min-height: var(--touch-target-min, 44px); padding: 8px 10px; justify-content: flex-start; gap: 8px; font-weight: 600; font-size: 13px;">
                      <span style="display: inline-block; width: 14px; height: 14px; border-radius: 50%; background: ${item.swatch}; box-shadow: 0 0 8px ${item.swatch}; flex-shrink: 0;"></span>
                      <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.label.split(' ')[0]}</span>
                    </button>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        </section>

        <!-- CARD 3: HỆ THỐNG ÂM THANH KÉP & GIỌNG ĐỌC -->
        <section class="settings-card hud-outline-card" style="padding: 16px; border-radius: var(--radius-squircle-md, 12px); border: 1px solid var(--border-hairline); background: var(--bg-card); display: flex; flex-direction: column; gap: 14px; position: relative;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: var(--accent-gold); display: flex; align-items: center;">${icon('volume', 18)}</span>
              <span style="font-size: var(--font-kicker); font-family: var(--font-mono); font-weight: 700; color: var(--accent-gold); letter-spacing: 0.08em; text-transform: uppercase;">
                ${t('settings.card3_kicker', undefined, '03 • DUAL AUDIO BUS & VOICES')}
              </span>
            </div>
            <button type="button" class="hud-btn btn-toggle-mute ${isMuted ? 'active' : ''}" style="min-height: 38px; padding: 6px 12px; font-weight: 700;">
              ${isMuted ? icon('mute', 14) : icon('volume', 14)}<span>${isMuted ? t('settings.sound_status_muted', undefined, 'Muted') : t('settings.sound_status_on', undefined, 'Audio Enabled')}</span>
            </button>
          </div>

          <h2 style="margin: 0; font-size: var(--font-h3, 16px); font-weight: 700; color: var(--ink-primary);">
            ${t('settings.card3_title', undefined, 'Tactile Feedback, Ambient Soundscapes & TTS')}
          </h2>

          <!-- Sub-panel without double outlines (surface tint) -->
          <div style="display: flex; flex-direction: column; gap: 12px; padding: 12px; background: rgba(255, 255, 255, 0.03); border-radius: var(--radius-squircle-sm, 8px);">
            <!-- SFX Volume Slider -->
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
              <label for="settings-sfx-slider" style="display: flex; align-items: center; gap: 8px; font-size: var(--font-body-compact); font-weight: 600;">
                ${icon('volume', 14)} ${t('settings.sfx_volume_label', undefined, 'SFX Volume (Tactile Audio):')}
                <span id="settings-sfx-val" style="font-family: var(--font-mono); color: var(--accent-gold);">${sfxVol}%</span>
              </label>
              <input type="range" id="settings-sfx-slider" min="0" max="100" value="${sfxVol}" style="width: 140px; cursor: pointer;" />
            </div>

            <!-- Music Volume Slider -->
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
              <label for="settings-music-slider" style="display: flex; align-items: center; gap: 8px; font-size: var(--font-body-compact); font-weight: 600;">
                ${icon('music', 14)} ${t('settings.music_volume_label', undefined, 'Music Volume (Ambient Soundscape):')}
                <span id="settings-music-val" style="font-family: var(--font-mono); color: var(--accent-cyan, #38bdf8);">${musicVol}%</span>
              </label>
              <input type="range" id="settings-music-slider" min="0" max="100" value="${musicVol}" style="width: 140px; cursor: pointer;" />
            </div>

            <!-- Ambient Soundscape Mode -->
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
              <label for="settings-soundscape-select" style="font-size: var(--font-body-compact); font-weight: 600;">
                ${t('settings.ambient_soundscape_label', undefined, 'Ambient Soundscape Mode:')}
              </label>
              <select id="settings-soundscape-select" class="hud-select" style="min-height: var(--touch-target-min, 44px); padding: 6px 12px; background: var(--bg-card); color: var(--ink-primary); border: 1px solid var(--border-hairline); border-radius: 8px; font-size: max(16px, var(--font-body)); cursor: pointer;">
                <option value="off" ${musicMode === 'off' ? 'selected' : ''}>${t('settings.ambient_off', undefined, 'Off')}</option>
                <option value="calm-chords" ${musicMode === 'calm-chords' ? 'selected' : ''}>${t('settings.ambient_chords_label', undefined, 'Calm Chords (Gentle)')}</option>
                <option value="celestial-void" ${musicMode === 'celestial-void' ? 'selected' : ''}>${t('settings.ambient_void_label', undefined, 'Celestial Void (Deep Space)')}</option>
                <option value="zen-drone" ${musicMode === 'zen-drone' ? 'selected' : ''}>${t('settings.ambient_zen_label', undefined, 'Zen Drone (Meditative)')}</option>
                <option value="alpha-baroque" ${musicMode === 'alpha-baroque' ? 'selected' : ''}>${t('settings.ambient_alpha_label', undefined, 'Alpha Baroque (60 BPM Brainwave Optimization)')}</option>
                <option value="lofi-study" ${musicMode === 'lofi-study' ? 'selected' : ''}>${t('settings.ambient_lofi_label', undefined, 'Lo-Fi Study Beats (Deep Focus)')}</option>
                <option value="gamma-focus" ${musicMode === 'gamma-focus' ? 'selected' : ''}>${t('settings.ambient_gamma_label', undefined, 'Gamma Focus (40Hz MIT Neuro Resonance)')}</option>
                <option value="rain-piano" ${musicMode === 'rain-piano' ? 'selected' : ''}>${t('settings.ambient_rain_label', undefined, 'Raindrop & Gymnopedie Piano Flow')}</option>
                <option value="binaural-theta" ${musicMode === 'binaural-theta' ? 'selected' : ''}>${t('settings.ambient_theta_label', undefined, 'Binaural Theta (6Hz Zen Bowl Immersion)')}</option>
                <option value="synthwave-drive" ${musicMode === 'synthwave-drive' ? 'selected' : ''}>${t('settings.ambient_synthwave_label', undefined, 'Synthwave Drive (80 BPM Gamified Sprint)')}</option>
              </select>
            </div>

            <!-- IELTS Exam Accent Cadence Selector -->
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
              <label for="settings-ielts-accent-select" style="font-size: var(--font-body-compact); font-weight: 600;">
                ${t('settings.ielts_audio_accent_label', undefined, 'Exam Audio Accent:')}
              </label>
              <select id="settings-ielts-accent-select" class="hud-select" style="min-height: var(--touch-target-min, 44px); padding: 6px 12px; background: var(--bg-card); color: var(--ink-primary); border: 1px solid var(--border-hairline); border-radius: 8px; font-size: max(16px, var(--font-body)); cursor: pointer;">
                <option value="uk-rp" ${ieltsAccent === 'uk-rp' ? 'selected' : ''}>${t('settings.accent_uk_rp', undefined, 'UK RP (British Academic - Cambridge Standard)')}</option>
                <option value="general-american" ${ieltsAccent === 'general-american' ? 'selected' : ''}>${t('settings.accent_general_american', undefined, 'General American (North American)')}</option>
                <option value="australian" ${ieltsAccent === 'australian' ? 'selected' : ''}>${t('settings.accent_australian', undefined, 'Australian (en-AU)')}</option>
                <option value="scottish" ${ieltsAccent === 'scottish' ? 'selected' : ''}>${t('settings.accent_scottish', undefined, 'Scottish (en-GB-scotland)')}</option>
                <option value="random" ${ieltsAccent === 'random' ? 'selected' : ''}>${t('settings.accent_random', undefined, 'Random Exam Mode (International Rotation)')}</option>
              </select>
            </div>
          </div>

          <!-- Voice / TTS & Haptics row -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px;">
            <!-- TTS Speed -->
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <span style="font-size: var(--font-kicker); color: var(--ink-muted); font-weight: 600; text-transform: uppercase;">${t('settings.tts_speed_label', undefined, 'TTS Model Voice Speed:')}</span>
              <div style="display: flex; gap: 6px;">
                <button type="button" class="hud-btn btn-tts-rate ${ttsRate === '0.85' ? 'active' : ''}" data-rate="0.85" style="flex: 1; min-height: 40px; justify-content: center; font-weight: 600;">0.85x</button>
                <button type="button" class="hud-btn btn-tts-rate ${ttsRate === '1.0' ? 'active' : ''}" data-rate="1.0" style="flex: 1; min-height: 40px; justify-content: center; font-weight: 600;">${t('settings.tts_rate_normal', undefined, '1.0x (Standard)')}</button>
                <button type="button" class="hud-btn btn-tts-rate ${ttsRate === '1.2' ? 'active' : ''}" data-rate="1.2" style="flex: 1; min-height: 40px; justify-content: center; font-weight: 600;">1.2x</button>
              </div>
            </div>

            <!-- Acoustic Haptics Toggle -->
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <span style="font-size: var(--font-kicker); color: var(--ink-muted); font-weight: 600; text-transform: uppercase;">${t('settings.haptics_label', undefined, 'Acoustic Haptics & Feedback:')}</span>
              <button type="button" class="hud-btn btn-toggle-haptics ${hapticsEnabled ? 'active' : ''}" style="min-height: 40px; justify-content: center; font-weight: 600;">
                ${hapticsEnabled ? t('settings.haptics_status_on', undefined, 'Haptic Feedback: Enabled') : t('settings.haptics_status_off', undefined, 'Haptic Feedback: Off')}
              </button>
            </div>
          </div>
        </section>

        <!-- CARD 4: THÔNG BÁO & NHẮC NHỞ HỌC TẬP -->
        <section class="settings-card hud-outline-card" style="padding: 16px; border-radius: var(--radius-squircle-md, 12px); border: 1px solid var(--border-hairline); background: var(--bg-card); display: flex; flex-direction: column; gap: 12px; position: relative;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: var(--accent-gold); display: flex; align-items: center;">${icon('bell', 18)}</span>
            <span style="font-size: var(--font-kicker); font-family: var(--font-mono); font-weight: 700; color: var(--accent-gold); letter-spacing: 0.08em; text-transform: uppercase;">
              ${t('settings.card4_kicker', undefined, '04 • NOTIFICATIONS & SRS REMINDERS')}
            </span>
          </div>

          <h2 style="margin: 0; font-size: var(--font-h3, 16px); font-weight: 700; color: var(--ink-primary);">
            ${t('settings.card4_title', undefined, 'SRS Spaced Repetition Cycles & Streak Defense')}
          </h2>
          <p style="margin: 0; font-size: var(--font-body-compact, 13px); color: var(--ink-secondary); line-height: 1.5;">
            ${t('settings.card4_desc', undefined, 'The system uses Web Push Notifications to alert you to review vocabulary cards right at the golden interval on the Ebbinghaus forgetting curve.')}
          </p>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            <button type="button" class="hud-btn btn-toggle-notifications ${notifEnabled ? 'active' : ''}" style="width: 100%; min-height: var(--touch-target-min, 44px); padding: 12px 16px; justify-content: center; font-weight: 700; white-space: normal; line-height: 1.35; text-align: center;">
              ${icon('bell', 16)} <span style="margin-left: 8px;">${t('settings.notif_toggle_label', { status: notifEnabled ? t('settings.notif_status_on', undefined, 'ENABLED (ON)') : t('settings.notif_status_off', undefined, 'DISABLED (OFF)') }, `Daily Push Notifications: ${notifEnabled ? 'ENABLED (ON)' : 'DISABLED (OFF)'}`)}</span>
            </button>

            <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
              <label for="settings-reminder-select" style="font-size: var(--font-body-compact); font-weight: 600;">
                ${t('settings.reminder_time_label', undefined, 'Preferred Daily Reminder Window:')}
              </label>
              <select id="settings-reminder-select" class="hud-select" style="min-height: var(--touch-target-min, 44px); padding: 6px 12px; background: var(--bg-card); color: var(--ink-primary); border: 1px solid var(--border-hairline); border-radius: 8px; font-size: max(16px, var(--font-body)); cursor: pointer;">
                <option value="08:00" ${reminderTime === '08:00' ? 'selected' : ''}>${t('settings.remind_morning', undefined, '08:00 (Morning Kickstarter)')}</option>
                <option value="12:30" ${reminderTime === '12:30' ? 'selected' : ''}>${t('settings.remind_noon', undefined, '12:30 (Quick 5-Minute Midday)')}</option>
                <option value="20:00" ${reminderTime === '20:00' ? 'selected' : ''}>${t('settings.remind_evening', undefined, '20:00 (Focused Evening)')}</option>
                <option value="22:00" ${reminderTime === '22:00' ? 'selected' : ''}>${t('settings.remind_night', undefined, '22:00 (Before Sleep Winddown)')}</option>
              </select>
            </div>
          </div>
        </section>

        <!-- CARD 5: DỮ LIỆU, SAO LƯU & DUNG LƯỢNG -->
        <section class="settings-card hud-outline-card" style="padding: 16px; border-radius: var(--radius-squircle-md, 12px); border: 1px solid var(--border-hairline); background: var(--bg-card); display: flex; flex-direction: column; gap: 14px; position: relative;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: var(--accent-gold); display: flex; align-items: center;">${icon('download', 18)}</span>
            <span style="font-size: var(--font-kicker); font-family: var(--font-mono); font-weight: 700; color: var(--accent-gold); letter-spacing: 0.08em; text-transform: uppercase;">
              ${t('settings.card5_kicker', undefined, '05 • DATA MANAGEMENT & PROFILE BACKUP')}
            </span>
          </div>

          <h2 style="margin: 0; font-size: var(--font-h3, 16px); font-weight: 700; color: var(--ink-primary);">
            ${t('settings.card5_title', undefined, 'Storage Telemetry & Offline JSON Synchronization')}
          </h2>

          <!-- Storage Telemetry stats grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px;">
            <div style="padding: 10px; background: rgba(255, 255, 255, 0.03); border-radius: 8px; text-align: center;">
              <div style="font-size: var(--font-kicker); color: var(--ink-muted); text-transform: uppercase;">${t('settings.stat_storage_size', undefined, 'STORAGE SIZE')}</div>
              <div style="font-family: var(--font-mono); font-size: 16px; font-weight: 700; color: var(--accent-gold); margin-top: 4px;">~${telemetry.kb} KB</div>
            </div>
            <div style="padding: 10px; background: rgba(255, 255, 255, 0.03); border-radius: 8px; text-align: center;">
              <div style="font-size: var(--font-kicker); color: var(--ink-muted); text-transform: uppercase;">${t('settings.stat_srs_cards', undefined, 'SRS CARDS')}</div>
              <div style="font-family: var(--font-mono); font-size: 16px; font-weight: 700; color: var(--accent-cyan, #38bdf8); margin-top: 4px;">${t('settings.stat_srs_unit', { count: telemetry.srsCount }, `${telemetry.srsCount} items`)}</div>
            </div>
            <div style="padding: 10px; background: rgba(255, 255, 255, 0.03); border-radius: 8px; text-align: center;">
              <div style="font-size: var(--font-kicker); color: var(--ink-muted); text-transform: uppercase;">${t('settings.stat_streak', undefined, 'STREAK')}</div>
              <div style="font-family: var(--font-mono); font-size: 16px; font-weight: 700; color: var(--good, #10b981); margin-top: 4px;">${t('settings.stat_streak_unit', { days: telemetry.streak }, `${telemetry.streak} days`)}</div>
            </div>
            <div style="padding: 10px; background: rgba(255, 255, 255, 0.03); border-radius: 8px; text-align: center;">
              <div style="font-size: var(--font-kicker); color: var(--ink-muted); text-transform: uppercase;">${t('settings.stat_mistakes', undefined, 'MISTAKE VAULT')}</div>
              <div style="font-family: var(--font-mono); font-size: 16px; font-weight: 700; color: var(--accent-purple, #a855f7); margin-top: 4px;">${t('settings.stat_mistakes_unit', { count: telemetry.mistakes }, `${telemetry.mistakes} errors`)}</div>
            </div>
          </div>

          <!-- Import / Export Actions -->
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            <button type="button" class="hud-btn btn-export-profile" style="flex: 1; min-width: 200px; min-height: var(--touch-target-min, 44px); justify-content: center; font-weight: 700; color: var(--accent-gold); border-color: var(--accent-gold);">
              ${icon('download', 16)}<span>${t('settings.btn_export_profile_json', undefined, '[ 💾 EXPORT PROFILE (JSON) ]')}</span>
            </button>
            <button type="button" class="hud-btn btn-import-profile" style="flex: 1; min-width: 200px; min-height: var(--touch-target-min, 44px); justify-content: center; font-weight: 700; color: var(--accent-cyan, #38bdf8); border-color: var(--accent-cyan, #38bdf8);">
              ${icon('upload', 16)}<span>${t('settings.btn_import_profile_json', undefined, '[ 📥 IMPORT PROFILE (JSON) ]')}</span>
            </button>
            <input type="file" class="settings-file-input" accept=".json,application/json" style="display: none;" />
          </div>

          <!-- Danger Zone Reset -->
          <div style="margin-top: 8px; padding: 12px; background: rgba(239, 68, 68, 0.06); border-radius: 8px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div style="display: flex; flex-direction: column; gap: 2px;">
              <span style="font-size: var(--font-kicker); color: var(--critical, #ef4444); font-weight: 700; text-transform: uppercase;">${t('settings.danger_zone_title', undefined, 'DANGER ZONE')}</span>
              <span style="font-size: 12px; color: var(--ink-secondary);">${t('settings.danger_zone_desc', undefined, 'Permanently erase all progress, flashcards, and telemetry to reset the application.')}</span>
            </div>
            <button type="button" class="hud-btn btn-reset-data ${this.confirmingReset ? 'active' : ''}" style="min-height: var(--touch-target-min, 44px); padding: 8px 16px; font-weight: 700; color: var(--critical, #ef4444); border-color: var(--critical, #ef4444);">
              ${this.confirmingReset ? t('settings.btn_confirm_erase', undefined, '⚠ CONFIRM ERASE (Click again to proceed)') : t('settings.btn_erase_data', undefined, 'Erase All Application Data')}
            </button>
          </div>
        </section>

        <!-- CARD 6: THÔNG TIN HỆ THỐNG & TRỢ GIÚP -->
        <section class="settings-card hud-outline-card" style="padding: 16px; border-radius: var(--radius-squircle-md, 12px); border: 1px solid var(--border-hairline); background: var(--bg-card); display: flex; flex-direction: column; gap: 12px; position: relative;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: var(--accent-gold); display: flex; align-items: center;">${icon('compass', 18)}</span>
            <span style="font-size: var(--font-kicker); font-family: var(--font-mono); font-weight: 700; color: var(--accent-gold); letter-spacing: 0.08em; text-transform: uppercase;">
              ${t('settings.card6_kicker', undefined, '06 • APPLICATION & SYSTEM INFO')}
            </span>
          </div>

          <h2 style="margin: 0; font-size: var(--font-h3, 16px); font-weight: 700; color: var(--ink-primary);">
            ${t('settings.card6_title', undefined, 'English Singularity & Academic IELTS Suite')}
          </h2>

          <div style="display: flex; flex-direction: column; gap: 6px; font-size: var(--font-body-compact, 13px); color: var(--ink-secondary); line-height: 1.6;">
            <div>${t('settings.info_version', undefined, '• <strong>Version:</strong> Singularity 1.0.0 (Gold Standard 760px Architecture)')}</div>
            <div>${t('settings.info_architecture', undefined, '• <strong>Architecture:</strong> 100% Client-Side Pure TypeScript • Zero Server Dependency • Zero Trackers')}</div>
            <div>${t('settings.info_offline', undefined, '• <strong>Offline:</strong> PWA Service Worker ready for full offline operation')}</div>
            <div>${t('settings.info_acoustics', undefined, '• <strong>Acoustics:</strong> Apple-Calm Acoustic Haptics & Dual Audio Bus Synthesizer')}</div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; margin-top: 4px;">
            <button type="button" class="hud-btn btn-rerun-tour" style="width: 100%; min-height: var(--touch-target-min, 44px); justify-content: center; font-weight: 600; white-space: normal; line-height: 1.35; text-align: center;">
              ${icon('compass', 16)}<span>${t('settings.btn_rerun_tour', undefined, 'Re-run Onboarding Spotlight Tour')}</span>
            </button>
            <button type="button" class="hud-btn btn-open-quests" style="width: 100%; min-height: var(--touch-target-min, 44px); justify-content: center; font-weight: 600; white-space: normal; line-height: 1.35; text-align: center;">
              ${icon('zap', 16)}<span>${t('settings.btn_open_quests', undefined, 'View Quests & XP Badges')}</span>
            </button>
          </div>
        </section>

      </div>
    `;
  }

  private handleClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;

    // CEFR Level Pill
    const cefrBtn = target.closest('.btn-cefr-pill') as HTMLElement | null;
    if (cefrBtn && cefrBtn.dataset.cefr) {
      AudioSynthesizer.play('click');
      HapticEngine.trigger('selection');
      StorageManager.setLearnerLevel(cefrBtn.dataset.cefr as Cefr);
      window.dispatchEvent(new CustomEvent('learner-level-change'));
      this.draw();
      return;
    }

    // Daily Goal XP
    const goalBtn = target.closest('.btn-xp-goal') as HTMLElement | null;
    if (goalBtn && goalBtn.dataset.goal) {
      AudioSynthesizer.play('click');
      HapticEngine.trigger('selection');
      localStorage.setItem('eng_daily_goal_xp', goalBtn.dataset.goal);
      this.draw();
      return;
    }

    // Target Band Pill
    const bandBtn = target.closest('.btn-target-band-pill') as HTMLElement | null;
    if (bandBtn && bandBtn.dataset.targetBand) {
      AudioSynthesizer.play('click');
      HapticEngine.trigger('selection');
      StorageManager.setTargetBand(parseFloat(bandBtn.dataset.targetBand));
      this.draw();
      return;
    }

    // Daily Time Budget Pill
    const budgetBtn = target.closest('.btn-time-budget-pill') as HTMLElement | null;
    if (budgetBtn && budgetBtn.dataset.budget) {
      AudioSynthesizer.play('click');
      HapticEngine.trigger('selection');
      StorageManager.setDailyTimeBudget(parseInt(budgetBtn.dataset.budget, 10));
      this.draw();
      return;
    }

    // Weakness-First Toggle
    if (target.closest('.btn-toggle-weakness-first')) {
      const cur = StorageManager.isWeaknessFirstEnabled();
      StorageManager.setWeaknessFirstEnabled(!cur);
      AudioSynthesizer.play('click');
      HapticEngine.trigger('selection');
      this.draw();
      return;
    }

    // Accent Theme Swatch
    const swatchBtn = target.closest('.btn-accent-swatch') as HTMLElement | null;
    if (swatchBtn && swatchBtn.dataset.accent) {
      AudioSynthesizer.play('click');
      HapticEngine.trigger('selection');
      AccentThemeManager.setTheme(swatchBtn.dataset.accent as AccentThemeId);
      this.draw();
      return;
    }

    // Retake Placement
    if (target.closest('.btn-action-placement')) {
      AudioSynthesizer.play('click');
      PlacementQuiz.open();
      return;
    }

    // Open Skill Radar
    if (target.closest('.btn-action-radar')) {
      AudioSynthesizer.play('click');
      MultiSkillQuizModal.open('radar');
      return;
    }

    // Language Selection
    const localeBtn = target.closest('.btn-locale-choice') as HTMLElement | null;
    if (localeBtn) {
      const loc = localeBtn.dataset.locale as 'en' | 'vi';
      if (loc && loc !== I18n.getLocale()) {
        AudioSynthesizer.play('click');
        HapticEngine.trigger('selection');
        I18n.setLocale(loc);
        this.draw();
      }
      return;
    }

    // Theme Toggle
    if (target.closest('.btn-toggle-theme')) {
      const cur = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('eng_theme', next);
      AudioSynthesizer.play('click');
      HapticEngine.trigger('selection');
      this.draw();
      return;
    }

    // Motion Toggle
    if (target.closest('.btn-toggle-motion')) {
      const root = document.documentElement;
      const reduce = root.dataset.motion !== 'reduce';
      if (reduce) root.dataset.motion = 'reduce'; else delete root.dataset.motion;
      localStorage.setItem('eng_motion', reduce ? 'reduce' : 'full');
      AudioSynthesizer.play('click');
      HapticEngine.trigger('selection');
      this.draw();
      return;
    }

    // Zen Mode Toggle
    if (target.closest('.btn-toggle-zen')) {
      AudioSynthesizer.play('click');
      HapticEngine.trigger('selection');
      ZenMode.toggle();
      this.draw();
      return;
    }

    // High Contrast Toggle
    if (target.closest('.btn-toggle-contrast')) {
      const cur = localStorage.getItem('eng_high_contrast') === 'true';
      localStorage.setItem('eng_high_contrast', (!cur).toString());
      AudioSynthesizer.play('click');
      HapticEngine.trigger('selection');
      this.draw();
      return;
    }

    // Audio Mute Toggle
    if (target.closest('.btn-toggle-mute')) {
      AudioSynthesizer.toggleMute();
      AudioSynthesizer.play('click');
      HapticEngine.trigger('selection');
      this.draw();
      return;
    }

    // TTS Rate Pills
    const rateBtn = target.closest('.btn-tts-rate') as HTMLElement | null;
    if (rateBtn && rateBtn.dataset.rate) {
      AudioSynthesizer.play('click');
      HapticEngine.trigger('selection');
      localStorage.setItem('eng_tts_rate', rateBtn.dataset.rate);
      this.draw();
      return;
    }

    // Haptics Toggle
    if (target.closest('.btn-toggle-haptics')) {
      const cur = localStorage.getItem('eng_haptics_enabled') !== 'false';
      localStorage.setItem('eng_haptics_enabled', (!cur).toString());
      AudioSynthesizer.play('click');
      if (!cur) HapticEngine.trigger('heavy');
      this.draw();
      return;
    }

    // Notifications Toggle
    if (target.closest('.btn-toggle-notifications')) {
      AudioSynthesizer.play('click');
      this.toggleNotifications();
      return;
    }

    // Export Profile
    if (target.closest('.btn-export-profile')) {
      AudioSynthesizer.play('click');
      HeaderHUD.exportUnifiedProfile();
      return;
    }

    // Import Profile Trigger
    if (target.closest('.btn-import-profile')) {
      AudioSynthesizer.play('click');
      const fileInput = this.root.querySelector('.settings-file-input') as HTMLInputElement | null;
      fileInput?.click();
      return;
    }

    // Reset Data (Danger Zone)
    if (target.closest('.btn-reset-data')) {
      if (!this.confirmingReset) {
        AudioSynthesizer.play('alarm');
        this.confirmingReset = true;
        this.draw();
        this.resetTimeout = setTimeout(() => {
          this.confirmingReset = false;
          this.draw();
        }, 5000);
      } else {
        if (this.resetTimeout) clearTimeout(this.resetTimeout);
        this.confirmingReset = false;
        AudioSynthesizer.play('alarm');
        localStorage.clear();
        alert('Toàn bộ dữ liệu học tập đã được làm mới. Ứng dụng sẽ tải lại.');
        window.location.hash = '#tree';
        window.location.reload();
      }
      return;
    }

    // Rerun Tour
    if (target.closest('.btn-rerun-tour')) {
      AudioSynthesizer.play('click');
      SpotlightTour.start(true);
      return;
    }

    // Progression Quests Modal
    if (target.closest('.btn-open-quests')) {
      AudioSynthesizer.play('click');
      ProgressionModal.open();
      return;
    }
  }

  private handleInput(e: Event): void {
    const target = e.target as HTMLElement;

    // SFX Volume Slider
    if (target.id === 'settings-sfx-slider') {
      const val = parseInt((target as HTMLInputElement).value, 10) / 100;
      AudioSynthesizer.setMasterVolume(val);
      const label = this.root.querySelector('#settings-sfx-val');
      if (label) label.textContent = `${Math.round(val * 100)}%`;
      return;
    }

    // Music Volume Slider
    if (target.id === 'settings-music-slider') {
      const val = parseInt((target as HTMLInputElement).value, 10) / 100;
      ambientMusicEngine.setMusicVolume(val);
      const label = this.root.querySelector('#settings-music-val');
      if (label) label.textContent = `${Math.round(val * 100)}%`;
      return;
    }
  }

  private handleChange(e: Event): void {
    const target = e.target as HTMLElement;

    // Ambient Soundscape Selector
    if (target.id === 'settings-soundscape-select') {
      const mode = (target as HTMLSelectElement).value as AmbientMusicMode;
      ambientMusicEngine.setMode(mode);
      AudioSynthesizer.play('click');
      return;
    }

    // Reminder Time Slot Selector
    if (target.id === 'settings-reminder-select') {
      const time = (target as HTMLSelectElement).value;
      localStorage.setItem('eng_reminder_time', time);
      AudioSynthesizer.play('click');
      return;
    }

    // Target Exam Date Input
    if (target.id === 'settings-target-exam-date') {
      const dateVal = (target as HTMLInputElement).value;
      StorageManager.setTargetExamDate(dateVal || null);
      AudioSynthesizer.play('click');
      this.draw();
      return;
    }

    // IELTS Voice Accent Selector
    if (target.id === 'settings-ielts-accent-select') {
      const accent = (target as HTMLSelectElement).value;
      StorageManager.setIeltsAccent(accent);
      AudioSynthesizer.play('click');
      this.draw();
      return;
    }

    // Profile File Import Input
    if (target.classList.contains('settings-file-input')) {
      const fileInput = target as HTMLInputElement;
      const file = fileInput.files?.[0];
      if (file) {
        HeaderHUD.importUnifiedProfile(file).then((success) => {
          if (success) {
            this.draw();
          }
        });
        fileInput.value = '';
      }
      return;
    }
  }

  private async toggleNotifications(): Promise<void> {
    const currentlyEnabled = StorageManager.isNotificationsEnabled();

    if (!currentlyEnabled) {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          StorageManager.setNotificationsEnabled(true);
          AudioSynthesizer.play('absorb');
        } else if (Notification.permission === 'denied') {
          alert('Quyền thông báo hiện bị chặn trong trình duyệt của bạn.\nVui lòng mở cài đặt trang web trên thanh địa chỉ để cấp quyền.');
          StorageManager.setNotificationsEnabled(false);
        } else {
          try {
            const res = await Notification.requestPermission();
            if (res === 'granted') {
              StorageManager.setNotificationsEnabled(true);
              AudioSynthesizer.play('absorb');
            } else {
              StorageManager.setNotificationsEnabled(false);
            }
          } catch {
            StorageManager.setNotificationsEnabled(true);
          }
        }
      } else {
        StorageManager.setNotificationsEnabled(true);
        AudioSynthesizer.play('absorb');
      }
    } else {
      StorageManager.setNotificationsEnabled(false);
    }

    this.draw();
  }
}
