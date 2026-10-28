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
            Quản lý trình độ CEFR, cấu hình hệ thống âm thanh kép, thông báo chu kỳ SRS, giao diện tập trung và sao lưu dữ liệu toàn diện.
          </p>
        </header>

        <!-- CARD 1: LỘ TRÌNH & HỒ SƠ HỌC TẬP -->
        <section class="settings-card hud-outline-card" style="padding: 16px; border-radius: var(--radius-squircle-md, 12px); border: 1px solid var(--border-hairline); background: var(--bg-card); display: flex; flex-direction: column; gap: 12px; position: relative;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: var(--accent-gold); display: flex; align-items: center;">${icon('target', 18)}</span>
              <span style="font-size: var(--font-kicker); font-family: var(--font-mono); font-weight: 700; color: var(--accent-gold); letter-spacing: 0.08em; text-transform: uppercase;">
                01 • LỘ TRÌNH &amp; HỒ SƠ CEFR
              </span>
            </div>
            <span class="hud-status-badge" style="font-size: var(--font-kicker); font-family: var(--font-mono); color: var(--accent-cyan, #38bdf8);">
              LEVEL ${progression.level} (${progression.xp} XP)
            </span>
          </div>

          <h2 style="margin: 0; font-size: var(--font-h3, 16px); font-weight: 700; color: var(--ink-primary);">
            Trình độ CEFR &amp; Mục tiêu học tập
          </h2>
          <p style="margin: 0; font-size: var(--font-body-compact, 13px); color: var(--ink-secondary); line-height: 1.5;">
            Trình độ hiện tại ảnh hưởng trực tiếp đến độ phức tạp của bài tập, kho collocations và đề luyện trong toàn bộ hệ thống.
          </p>

          <!-- Level Buttons Track -->
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <span style="font-size: var(--font-kicker); color: var(--ink-muted); font-weight: 600; text-transform: uppercase;">Chọn cấp độ CEFR hiện tại:</span>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 8px;">
              ${CEFR_ORDER.map(lvl => `
                <button type="button" class="hud-btn btn-cefr-pill ${lvl === currentLevel ? 'active' : ''}" data-cefr="${lvl}" aria-pressed="${lvl === currentLevel}" style="min-height: var(--touch-target-min, 44px); padding: 8px 12px; justify-content: center; font-weight: 700; font-family: var(--font-mono);">
                  ${lvl} <span style="font-size: 11px; font-weight: normal; margin-left: 4px; opacity: 0.85;">(${CEFR_LABELS[lvl].split(' ')[0]})</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Daily Goal Selector -->
          <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 4px;">
            <span style="font-size: var(--font-kicker); color: var(--ink-muted); font-weight: 600; text-transform: uppercase;">Mục tiêu XP mỗi ngày:</span>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              <button type="button" class="hud-btn btn-xp-goal ${dailyGoalXp === '50' ? 'active' : ''}" data-goal="50" style="flex: 1; min-height: var(--touch-target-min, 44px); justify-content: center; font-weight: 600;">50 XP (Duy trì)</button>
              <button type="button" class="hud-btn btn-xp-goal ${dailyGoalXp === '100' ? 'active' : ''}" data-goal="100" style="flex: 1; min-height: var(--touch-target-min, 44px); justify-content: center; font-weight: 600;">100 XP (Chuẩn)</button>
              <button type="button" class="hud-btn btn-xp-goal ${dailyGoalXp === '200' ? 'active' : ''}" data-goal="200" style="flex: 1; min-height: var(--touch-target-min, 44px); justify-content: center; font-weight: 600;">200 XP (Cấp tốc)</button>
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px;">
            <button type="button" class="hud-btn btn-action-placement" style="flex: 1; min-width: 220px; min-height: var(--touch-target-min, 44px); justify-content: center; font-weight: 700; color: var(--accent-cyan, #38bdf8); border-color: var(--accent-cyan, #38bdf8);">
              ${icon('target', 16)}<span>Làm lại Test xếp lớp 2 phút</span>
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
              02 • GIAO DIỆN &amp; TRỢ NĂNG
            </span>
          </div>

          <h2 style="margin: 0; font-size: var(--font-h3, 16px); font-weight: 700; color: var(--ink-primary);">
            Chế độ hiển thị, Chuyển động &amp; Tập trung
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
              <span>Chủ đề: <strong>${currentTheme === 'dark' ? 'Dark Mode (Tối)' : 'Light Mode (Sáng)'}</strong></span>
            </button>

            <!-- Motion Toggle -->
            <button type="button" class="hud-btn btn-toggle-motion ${isReducedMotion ? 'active' : ''}" style="min-height: var(--touch-target-min, 44px); padding: 10px 14px; justify-content: flex-start; font-weight: 600; gap: 10px;">
              ${icon('zap', 16)}
              <span>Chuyển động: <strong>${isReducedMotion ? 'Reduced (Giảm chuyển cảnh)' : 'Full (Mượt mà)'}</strong></span>
            </button>

            <!-- Zen Mode Toggle -->
            <button type="button" class="hud-btn btn-toggle-zen ${isZen ? 'active' : ''}" style="min-height: var(--touch-target-min, 44px); padding: 10px 14px; justify-content: flex-start; font-weight: 600; gap: 10px;">
              ${icon('eye', 16)}
              <span>Zen Immersion: <strong>${isZen ? 'Đang bật ●' : 'Tắt'}</strong></span>
            </button>

            <!-- High Contrast Toggle -->
            <button type="button" class="hud-btn btn-toggle-contrast ${isHighContrast ? 'active' : ''}" style="min-height: var(--touch-target-min, 44px); padding: 10px 14px; justify-content: flex-start; font-weight: 600; gap: 10px;">
              ${icon('layers', 16)}
              <span>Tương phản cao: <strong>${isHighContrast ? 'Bật (High Contrast)' : 'Chuẩn'}</strong></span>
            </button>
          </div>
        </section>

        <!-- CARD 3: HỆ THỐNG ÂM THANH KÉP & GIỌNG ĐỌC -->
        <section class="settings-card hud-outline-card" style="padding: 16px; border-radius: var(--radius-squircle-md, 12px); border: 1px solid var(--border-hairline); background: var(--bg-card); display: flex; flex-direction: column; gap: 14px; position: relative;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: var(--accent-gold); display: flex; align-items: center;">${icon('volume', 18)}</span>
              <span style="font-size: var(--font-kicker); font-family: var(--font-mono); font-weight: 700; color: var(--accent-gold); letter-spacing: 0.08em; text-transform: uppercase;">
                03 • HỆ THỐNG ÂM THANH KÉP &amp; GIỌNG ĐỌC
              </span>
            </div>
            <button type="button" class="hud-btn btn-toggle-mute ${isMuted ? 'active' : ''}" style="min-height: 38px; padding: 6px 12px; font-weight: 700;">
              ${isMuted ? icon('mute', 14) : icon('volume', 14)}<span>${isMuted ? 'Đang tắt tiếng' : 'Âm thanh bật'}</span>
            </button>
          </div>

          <h2 style="margin: 0; font-size: var(--font-h3, 16px); font-weight: 700; color: var(--ink-primary);">
            Hiệu ứng tương tác, Không gian âm thanh &amp; TTS
          </h2>

          <!-- Sub-panel without double outlines (surface tint) -->
          <div style="display: flex; flex-direction: column; gap: 12px; padding: 12px; background: rgba(255, 255, 255, 0.03); border-radius: var(--radius-squircle-sm, 8px);">
            <!-- SFX Volume Slider -->
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
              <label for="settings-sfx-slider" style="display: flex; align-items: center; gap: 8px; font-size: var(--font-body-compact); font-weight: 600;">
                ${icon('volume', 14)} SFX Volume (Âm tương tác):
                <span id="settings-sfx-val" style="font-family: var(--font-mono); color: var(--accent-gold);">${sfxVol}%</span>
              </label>
              <input type="range" id="settings-sfx-slider" min="0" max="100" value="${sfxVol}" style="width: 140px; cursor: pointer;" />
            </div>

            <!-- Music Volume Slider -->
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
              <label for="settings-music-slider" style="display: flex; align-items: center; gap: 8px; font-size: var(--font-body-compact); font-weight: 600;">
                ${icon('music', 14)} Music Volume (Nhạc nền):
                <span id="settings-music-val" style="font-family: var(--font-mono); color: var(--accent-cyan, #38bdf8);">${musicVol}%</span>
              </label>
              <input type="range" id="settings-music-slider" min="0" max="100" value="${musicVol}" style="width: 140px; cursor: pointer;" />
            </div>

            <!-- Ambient Soundscape Mode -->
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
              <label for="settings-soundscape-select" style="font-size: var(--font-body-compact); font-weight: 600;">
                Không gian âm thanh Ambient:
              </label>
              <select id="settings-soundscape-select" class="hud-select" style="min-height: var(--touch-target-min, 44px); padding: 6px 12px; background: var(--bg-card); color: var(--ink-primary); border: 1px solid var(--border-hairline); border-radius: 8px; font-size: max(16px, var(--font-body)); cursor: pointer;">
                <option value="off" ${musicMode === 'off' ? 'selected' : ''}>Tắt nhạc nền (Off)</option>
                <option value="calm-chords" ${musicMode === 'calm-chords' ? 'selected' : ''}>Calm Chords (Dịu êm)</option>
                <option value="celestial-void" ${musicMode === 'celestial-void' ? 'selected' : ''}>Celestial Void (Không gian sâu)</option>
                <option value="zen-drone" ${musicMode === 'zen-drone' ? 'selected' : ''}>Zen Drone (Thiền định)</option>
              </select>
            </div>
          </div>

          <!-- Voice / TTS & Haptics row -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px;">
            <!-- TTS Speed -->
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <span style="font-size: var(--font-kicker); color: var(--ink-muted); font-weight: 600; text-transform: uppercase;">Tốc độ đọc giọng mẫu TTS:</span>
              <div style="display: flex; gap: 6px;">
                <button type="button" class="hud-btn btn-tts-rate ${ttsRate === '0.85' ? 'active' : ''}" data-rate="0.85" style="flex: 1; min-height: 40px; justify-content: center; font-weight: 600;">0.85x</button>
                <button type="button" class="hud-btn btn-tts-rate ${ttsRate === '1.0' ? 'active' : ''}" data-rate="1.0" style="flex: 1; min-height: 40px; justify-content: center; font-weight: 600;">1.0x (Chuẩn)</button>
                <button type="button" class="hud-btn btn-tts-rate ${ttsRate === '1.2' ? 'active' : ''}" data-rate="1.2" style="flex: 1; min-height: 40px; justify-content: center; font-weight: 600;">1.2x</button>
              </div>
            </div>

            <!-- Acoustic Haptics Toggle -->
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <span style="font-size: var(--font-kicker); color: var(--ink-muted); font-weight: 600; text-transform: uppercase;">Phản hồi xúc giác &amp; Haptics:</span>
              <button type="button" class="hud-btn btn-toggle-haptics ${hapticsEnabled ? 'active' : ''}" style="min-height: 40px; justify-content: center; font-weight: 600;">
                ${hapticsEnabled ? 'Haptic Feedback: Đang Bật' : 'Haptic Feedback: Tắt'}
              </button>
            </div>
          </div>
        </section>

        <!-- CARD 4: THÔNG BÁO & NHẮC NHỞ HỌC TẬP -->
        <section class="settings-card hud-outline-card" style="padding: 16px; border-radius: var(--radius-squircle-md, 12px); border: 1px solid var(--border-hairline); background: var(--bg-card); display: flex; flex-direction: column; gap: 12px; position: relative;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: var(--accent-gold); display: flex; align-items: center;">${icon('bell', 18)}</span>
            <span style="font-size: var(--font-kicker); font-family: var(--font-mono); font-weight: 700; color: var(--accent-gold); letter-spacing: 0.08em; text-transform: uppercase;">
              04 • THÔNG BÁO &amp; NHẮC NHỞ ÔN TẬP
            </span>
          </div>

          <h2 style="margin: 0; font-size: var(--font-h3, 16px); font-weight: 700; color: var(--ink-primary);">
            Nhắc nhở chu kỳ SRS &amp; Bảo vệ chuỗi Streak
          </h2>
          <p style="margin: 0; font-size: var(--font-body-compact, 13px); color: var(--ink-secondary); line-height: 1.5;">
            Hệ thống sử dụng Web Push Notification để nhắc bạn ôn tập thẻ từ vựng đúng thời điểm vàng theo đường cong quên lãng Spaced Repetition.
          </p>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            <button type="button" class="hud-btn btn-toggle-notifications ${notifEnabled ? 'active' : ''}" style="width: 100%; min-height: var(--touch-target-min, 44px); padding: 12px 16px; justify-content: center; font-weight: 700; white-space: normal; line-height: 1.35; text-align: center;">
              ${icon('bell', 16)} <span style="margin-left: 8px;">Thông báo đẩy hàng ngày: ${notifEnabled ? 'ĐANG BẬT (ON)' : 'ĐANG TẮT (OFF)'}</span>
            </button>

            <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
              <label for="settings-reminder-select" style="font-size: var(--font-body-compact); font-weight: 600;">
                Khung giờ nhắc ôn tập ưu tiên:
              </label>
              <select id="settings-reminder-select" class="hud-select" style="min-height: var(--touch-target-min, 44px); padding: 6px 12px; background: var(--bg-card); color: var(--ink-primary); border: 1px solid var(--border-hairline); border-radius: 8px; font-size: max(16px, var(--font-body)); cursor: pointer;">
                <option value="08:00" ${reminderTime === '08:00' ? 'selected' : ''}>08:00 (Buổi sáng bắt đầu ngày)</option>
                <option value="12:30" ${reminderTime === '12:30' ? 'selected' : ''}>12:30 (Nghỉ trưa ngắn 5 phút)</option>
                <option value="20:00" ${reminderTime === '20:00' ? 'selected' : ''}>20:00 (Buổi tối tập trung)</option>
                <option value="22:00" ${reminderTime === '22:00' ? 'selected' : ''}>22:00 (Trước khi đi ngủ)</option>
              </select>
            </div>
          </div>
        </section>

        <!-- CARD 5: DỮ LIỆU, SAO LƯU & DUNG LƯỢNG -->
        <section class="settings-card hud-outline-card" style="padding: 16px; border-radius: var(--radius-squircle-md, 12px); border: 1px solid var(--border-hairline); background: var(--bg-card); display: flex; flex-direction: column; gap: 14px; position: relative;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: var(--accent-gold); display: flex; align-items: center;">${icon('download', 18)}</span>
            <span style="font-size: var(--font-kicker); font-family: var(--font-mono); font-weight: 700; color: var(--accent-gold); letter-spacing: 0.08em; text-transform: uppercase;">
              05 • QUẢN LÝ DỮ LIỆU &amp; SAO LƯU HỒ SƠ
            </span>
          </div>

          <h2 style="margin: 0; font-size: var(--font-h3, 16px); font-weight: 700; color: var(--ink-primary);">
            Telemetry lưu trữ &amp; Đồng bộ JSON ngoại tuyến
          </h2>

          <!-- Storage Telemetry stats grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px;">
            <div style="padding: 10px; background: rgba(255, 255, 255, 0.03); border-radius: 8px; text-align: center;">
              <div style="font-size: var(--font-kicker); color: var(--ink-muted); text-transform: uppercase;">DUNG LƯỢNG</div>
              <div style="font-family: var(--font-mono); font-size: 16px; font-weight: 700; color: var(--accent-gold); margin-top: 4px;">~${telemetry.kb} KB</div>
            </div>
            <div style="padding: 10px; background: rgba(255, 255, 255, 0.03); border-radius: 8px; text-align: center;">
              <div style="font-size: var(--font-kicker); color: var(--ink-muted); text-transform: uppercase;">SRS CARDS</div>
              <div style="font-family: var(--font-mono); font-size: 16px; font-weight: 700; color: var(--accent-cyan, #38bdf8); margin-top: 4px;">${telemetry.srsCount} từ</div>
            </div>
            <div style="padding: 10px; background: rgba(255, 255, 255, 0.03); border-radius: 8px; text-align: center;">
              <div style="font-size: var(--font-kicker); color: var(--ink-muted); text-transform: uppercase;">CHUỖI NGÀY</div>
              <div style="font-family: var(--font-mono); font-size: 16px; font-weight: 700; color: var(--good, #10b981); margin-top: 4px;">${telemetry.streak} ngày</div>
            </div>
            <div style="padding: 10px; background: rgba(255, 255, 255, 0.03); border-radius: 8px; text-align: center;">
              <div style="font-size: var(--font-kicker); color: var(--ink-muted); text-transform: uppercase;">MISTAKE VAULT</div>
              <div style="font-family: var(--font-mono); font-size: 16px; font-weight: 700; color: var(--accent-purple, #a855f7); margin-top: 4px;">${telemetry.mistakes} lỗi</div>
            </div>
          </div>

          <!-- Import / Export Actions -->
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            <button type="button" class="hud-btn btn-export-profile" style="flex: 1; min-width: 200px; min-height: var(--touch-target-min, 44px); justify-content: center; font-weight: 700; color: var(--accent-gold); border-color: var(--accent-gold);">
              ${icon('download', 16)}<span>[ 💾 XUẤT PROFILE (JSON) ]</span>
            </button>
            <button type="button" class="hud-btn btn-import-profile" style="flex: 1; min-width: 200px; min-height: var(--touch-target-min, 44px); justify-content: center; font-weight: 700; color: var(--accent-cyan, #38bdf8); border-color: var(--accent-cyan, #38bdf8);">
              ${icon('upload', 16)}<span>[ 📥 NHẬP PROFILE (JSON) ]</span>
            </button>
            <input type="file" class="settings-file-input" accept=".json,application/json" style="display: none;" />
          </div>

          <!-- Danger Zone Reset -->
          <div style="margin-top: 8px; padding: 12px; background: rgba(239, 68, 68, 0.06); border-radius: 8px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div style="display: flex; flex-direction: column; gap: 2px;">
              <span style="font-size: var(--font-kicker); color: var(--critical, #ef4444); font-weight: 700; text-transform: uppercase;">VÙNG NGUY HIỂM (DANGER ZONE)</span>
              <span style="font-size: 12px; color: var(--ink-secondary);">Xóa toàn bộ tiến độ và đưa app về trạng thái ban đầu.</span>
            </div>
            <button type="button" class="hud-btn btn-reset-data ${this.confirmingReset ? 'active' : ''}" style="min-height: var(--touch-target-min, 44px); padding: 8px 16px; font-weight: 700; color: var(--critical, #ef4444); border-color: var(--critical, #ef4444);">
              ${this.confirmingReset ? '⚠ XÁC NHẬN XÓA (Click lần nữa)' : 'Xóa toàn bộ dữ liệu'}
            </button>
          </div>
        </section>

        <!-- CARD 6: THÔNG TIN HỆ THỐNG & TRỢ GIÚP -->
        <section class="settings-card hud-outline-card" style="padding: 16px; border-radius: var(--radius-squircle-md, 12px); border: 1px solid var(--border-hairline); background: var(--bg-card); display: flex; flex-direction: column; gap: 12px; position: relative;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: var(--accent-gold); display: flex; align-items: center;">${icon('compass', 18)}</span>
            <span style="font-size: var(--font-kicker); font-family: var(--font-mono); font-weight: 700; color: var(--accent-gold); letter-spacing: 0.08em; text-transform: uppercase;">
              06 • THÔNG TIN ỨNG DỤNG &amp; HỆ THỐNG
            </span>
          </div>

          <h2 style="margin: 0; font-size: var(--font-h3, 16px); font-weight: 700; color: var(--ink-primary);">
            English Singularity &amp; Academic IELTS Suite
          </h2>

          <div style="display: flex; flex-direction: column; gap: 6px; font-size: var(--font-body-compact, 13px); color: var(--ink-secondary); line-height: 1.6;">
            <div>• <strong>Phiên bản:</strong> Singularity 1.0.0 (Gold Standard 760px Architecture)</div>
            <div>• <strong>Kiến trúc:</strong> 100% Client-Side Pure TypeScript • Zero Server Dependency • Zero Trackers</div>
            <div>• <strong>Ngoại tuyến:</strong> PWA Service Worker sẵn sàng hoạt động không cần mạng</div>
            <div>• <strong>Chuẩn âm học:</strong> Apple-Calm Acoustic Haptics &amp; Dual Audio Bus Synthesizer</div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; margin-top: 4px;">
            <button type="button" class="hud-btn btn-rerun-tour" style="width: 100%; min-height: var(--touch-target-min, 44px); justify-content: center; font-weight: 600; white-space: normal; line-height: 1.35; text-align: center;">
              ${icon('compass', 16)}<span>Xem lại Spotlight Tour</span>
            </button>
            <button type="button" class="hud-btn btn-open-quests" style="width: 100%; min-height: var(--touch-target-min, 44px); justify-content: center; font-weight: 600; white-space: normal; line-height: 1.35; text-align: center;">
              ${icon('zap', 16)}<span>Xem Quests &amp; Huy hiệu XP</span>
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
