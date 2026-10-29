/**
 * CORE NOTIFICATION ENGINE
 * Cross-platform native notification engine for Phone PWA and Desktop.
 * - Native Notification.requestPermission() lifecycle
 * - Background checkAndNotify() alerting for SRS due reviews & streak preservation
 * - Service Worker & Window Notification dispatch with tag 'srs-review-due' and icon '/icon-192.png'
 * - Graceful in-app HUD toast fallback when permission denied, default, or unsupported
 * - Zero external dependencies.
 */

import { SRSEngine, SRSCardState } from './srs-engine';
import { StorageManager } from '../utils/storage';
import { ProgressionEngine, getTodayString } from './progression-engine';
import { UsageTracker, localDayKey } from './usage-tracker';
import { recentBand, Skill } from '../ielts/progress';
import collocationsData from '../assets/data/collocations.json';
import { I18n, t, type Locale } from './i18n';
import { NotificationCatalog, type NotificationPayload } from './notification-catalog';
import { SerlGauntletEngine } from './serl-gauntlet-engine';

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export interface CheckNotifyResult {
  notified: boolean;
  reason?: 'due_cards' | 'streak_reminder' | 'daily_reminder';
  dueCount: number;
  streak: number;
  mode: 'native' | 'toast' | 'none';
}

const NOTIFICATIONS_ENABLED_KEY = 'eng_notifications_enabled';
const LAST_NOTIFIED_KEY = 'eng_last_notification_timestamp';
const DEFAULT_ICON = '/icon-192.png';
const DEFAULT_TAG = 'srs-review-due';
// Daily reminder: after this local hour, at most once per local day, and only if the learner has not studied yet
const REMINDER_HOUR = 18;
const REMINDER_DAY_KEY = 'eng_reminder_day';
const STREAK_ALERT_DAY_KEY = 'eng_streak_alert_day';

// Card ids are 'colloc-N' (collocations) or 'lex-<word>' (saved from the lexicon drawer).
const COLLOC_LABELS: Record<string, string> = {};
for (const c of collocationsData as Array<{ id?: string; phrase?: string }>) {
  if (c && c.id && c.phrase) COLLOC_LABELS[c.id] = c.phrase;
}

/** Readable word or phrase for a card id, or null when the id has no readable label. */
function labelForCard(cardId: string): string | null {
  if (COLLOC_LABELS[cardId]) return COLLOC_LABELS[cardId];
  if (cardId.startsWith('lex-')) return cardId.slice(4).replace(/-/g, ' ');
  return null;
}

/** Up to `limit` words from the most overdue cards, plus the total due count. */
function dueWords(states: Record<string, SRSCardState>, limit = 3): { words: string[]; total: number } {
  const now = Date.now();
  const due = Object.entries(states)
    .filter(([, s]) => s.dueDate <= now)
    .sort((a, b) => a[1].dueDate - b[1].dueDate);
  const words: string[] = [];
  for (const [id] of due) {
    const label = labelForCard(id);
    if (label) words.push(label);
    if (words.length === limit) break;
  }
  return { words, total: due.length };
}

const IELTS_SKILLS: Skill[] = ['listening', 'reading', 'writing', 'speaking'];

/** Weakest IELTS skill by recent band, or null when there are no IELTS attempts yet. */
function weakestIeltsSkill(): { skill: Skill; band: number } | null {
  let weakest: { skill: Skill; band: number } | null = null;
  for (const skill of IELTS_SKILLS) {
    const band = recentBand(skill, 3);
    if (band !== null && (!weakest || band < weakest.band)) weakest = { skill, band };
  }
  return weakest;
}

/** Opens an in-app hash route, or a separate page such as ielts.html#writing. */
export function navigateTo(route: string): void {
  if (typeof window === 'undefined') return;
  if (route.includes('.html')) window.location.href = `/${route}`;
  else window.location.hash = route;
}

export class NotificationEngine {
  private static periodicTimerId: any = null;
  private static exitTimerId: any = null;
  private static exitListenerAttached: boolean = false;

  /**
   * Checks whether the current runtime environment supports the Web Notification API.
   */
  public static isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * Retrieves the current notification permission status.
   */
  public static getPermission(): NotificationPermissionState {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  }

  /**
   * Requests native notification permissions from the user.
   */
  public static async requestPermission(): Promise<NotificationPermissionState> {
    if (!this.isSupported()) return 'unsupported';
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (err) {
      console.warn('[NOTIFICATIONS] Permission request failed:', err);
      return 'denied';
    }
  }

  /**
   * Checks whether notifications are opted-in via settings.
   */
  public static isEnabled(): boolean {
    if (typeof localStorage === 'undefined') return true;
    const val = localStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
    return val !== 'false';
  }

  /**
   * Sets user notification preference.
   */
  public static setEnabled(enabled: boolean): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(NOTIFICATIONS_ENABLED_KEY, enabled ? 'true' : 'false');
  }

  /**
   * Dispatches a notification across Android Native Bridge, Service Worker, or Window Notification,
   * falling back to in-app toast if permission is not granted or unsupported.
   */
  public static async dispatch(title: string, options?: NotificationOptions): Promise<boolean> {
    const opts: NotificationOptions = {
      icon: DEFAULT_ICON,
      badge: DEFAULT_ICON,
      tag: DEFAULT_TAG,
      ...options
    };

    const targetRoute = (opts.data && opts.data.route) ? opts.data.route : '#collocations';

    // 1. Try Native Android Bridge if running inside Android WebView
    if (typeof window !== 'undefined') {
      const bridge = (window as any).AndroidWidgetBridge || (window as any).AndroidNotificationBridge;
      if (bridge && typeof bridge.postNotification === 'function') {
        bridge.postNotification(title, opts.body || '', targetRoute);
        this.recordNotificationTimestamp();
        return true;
      }
    }

    // 2. Try Native Web Notification if granted
    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        // Try Service Worker registration first (standard for mobile PWA)
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg && 'showNotification' in reg) {
            await reg.showNotification(title, opts);
            this.recordNotificationTimestamp();
            return true;
          }
        }

        // Fallback to Window Notification instance
        const notif = new Notification(title, opts);
        notif.onclick = () => {
          if (typeof window !== 'undefined') {
            window.focus();
            navigateTo(targetRoute);
          }
          notif.close();
        };
        this.recordNotificationTimestamp();
        return true;
      } catch (err) {
        console.warn('[NOTIFICATIONS] Native dispatch failed, displaying toast fallback:', err);
      }
    }

    // 3. In-App HUD Toast fallback
    this.showToast(title, opts.body || '', targetRoute);
    this.recordNotificationTimestamp();
    return false;
  }

  /**
   * Checks SRS due counts and daily streak status, dispatching an alert if appropriate.
   */
  public static async checkAndNotify(cardStatesOverride?: Record<string, SRSCardState>): Promise<CheckNotifyResult> {
    if (!this.isEnabled()) {
      return { notified: false, dueCount: 0, streak: 0, mode: 'none' };
    }

    // 1. Calculate due items
    let dueCount = 0;
    let dueSample: { words: string[]; total: number } = { words: [], total: 0 };
    try {
      const states = cardStatesOverride ?? StorageManager.loadState().cardStates;
      dueCount = SRSEngine.getDueCount(states);
      dueSample = dueWords(states);
    } catch {
      dueCount = 0;
    }

    // 2. Streak status from the progression engine (same counter as the achievements view)
    let streak = 0;
    let needsStreakReminder = false;
    try {
      const prog = ProgressionEngine.getState();
      streak = prog.streak || 0;
      needsStreakReminder = streak > 0 && prog.lastActiveDate !== getTodayString();
    } catch {
      streak = 0;
    }

    // 3. Evaluate notification trigger
    const currentLocale: Locale = (typeof localStorage !== 'undefined' && (localStorage.getItem('eng_locale') as Locale)) || I18n.getLocale() || 'en';

    // SRS Review Due notification
    if (dueCount > 0) {
      const payload = NotificationCatalog.getDueCardsNotification(dueCount, dueSample.words, currentLocale);
      const isNative = await this.dispatch(payload.title, {
        body: payload.body,
        icon: DEFAULT_ICON,
        badge: DEFAULT_ICON,
        tag: DEFAULT_TAG,
        data: { route: '#collocations', type: 'due_cards', dueCount }
      });

      return {
        notified: true,
        reason: 'due_cards',
        dueCount,
        streak,
        mode: isNative ? 'native' : 'toast'
      };
    }

    // Streak Protection Alert notification
    if (needsStreakReminder) {
      // Show at most once per calendar day
      try {
        if (localStorage.getItem(STREAK_ALERT_DAY_KEY) === localDayKey()) {
          // Already shown today
          return { notified: false, dueCount: 0, streak, mode: 'none' };
        }
        localStorage.setItem(STREAK_ALERT_DAY_KEY, localDayKey());
      } catch {
        // Storage blocked: proceed anyway
      }

      const left = this.questsLeft();
      const payload = NotificationCatalog.getStreakReminderNotification(streak, left, currentLocale);
      const isNative = await this.dispatch(payload.title, {
        body: payload.body,
        icon: DEFAULT_ICON,
        badge: DEFAULT_ICON,
        tag: DEFAULT_TAG,
        data: { route: '#collocations', type: 'streak_reminder', streak }
      });

      return {
        notified: true,
        reason: 'streak_reminder',
        dueCount: 0,
        streak,
        mode: isNative ? 'native' : 'toast'
      };
    }

    const reminder = this.buildDailyReminder();
    if (reminder) {
      try {
        localStorage.setItem(REMINDER_DAY_KEY, localDayKey());
      } catch {
        // Storage blocked: the reminder may repeat within the day
      }
      const isNative = await this.dispatch(reminder.title, {
        body: reminder.body,
        icon: DEFAULT_ICON,
        badge: DEFAULT_ICON,
        tag: DEFAULT_TAG,
        data: { route: reminder.route, type: 'daily_reminder' }
      });
      return {
        notified: true,
        reason: 'daily_reminder',
        dueCount: 0,
        streak,
        mode: isNative ? 'native' : 'toast'
      };
    }

    return { notified: false, dueCount: 0, streak, mode: 'none' };
  }

  /** Quests not yet completed today, from the progression engine. */
  private static questsLeft(): number {
    try {
      return ProgressionEngine.getState().quests.filter(q => !q.completed).length;
    } catch {
      return 0;
    }
  }

  /**
   * Reminder built from the learner's progress. Null when not due: before REMINDER_HOUR,
   * already sent today, or already studied today.
   */
  private static buildDailyReminder(): { title: string; body: string; route: string } | null {
    try {
      if (new Date().getHours() < REMINDER_HOUR) return null;
      if (localStorage.getItem(REMINDER_DAY_KEY) === localDayKey()) return null;
      if (UsageTracker.summary().todayMinutes > 0) return null;
      const currentLocale: Locale = (typeof localStorage !== 'undefined' && (localStorage.getItem('eng_locale') as Locale)) || I18n.getLocale() || 'en';
      const info = ProgressionEngine.getLevelInfo();
      const xpToNext = info.spanInLevel - info.progressInLevel;
      let mistakesCount = 0;
      try {
        mistakesCount = SerlGauntletEngine.getActiveRecords().length;
      } catch {}
      const left = this.questsLeft();
      const focus = weakestIeltsSkill();

      const notif = NotificationCatalog.getDailyReminderNotification({
        level: info.level,
        xpToNext,
        questsLeft: left,
        weakSkill: focus?.skill,
        weakBand: focus?.band,
        mistakesCount
      }, currentLocale);

      return {
        title: notif.title,
        body: notif.body,
        route: notif.route
      };
    } catch {
      return null;
    }
  }

  /**
   * Called when user prepares to exit or switch away from the app (e.g. visibilitychange hidden).
   * Passes upcoming notifications and state to the native Android notification system
   * matching the user's latest locale setting.
   */
  public static scheduleExitReminder(): void {
    if (!this.isEnabled()) return;
    try {
      const currentLocale: Locale = (typeof localStorage !== 'undefined' && (localStorage.getItem('eng_locale') as Locale)) || I18n.getLocale() || 'en';
      const states = StorageManager.loadState().cardStates;
      const dueCount = SRSEngine.getDueCount(states);
      const prog = ProgressionEngine.getState();
      const streak = prog.streak || 0;
      const questsLeft = this.questsLeft();
      const focus = weakestIeltsSkill();
      const info = ProgressionEngine.getLevelInfo();
      const xpToNext = info.spanInLevel - info.progressInLevel;
      let mistakesCount = 0;
      try {
        mistakesCount = SerlGauntletEngine.getActiveRecords().length;
      } catch {}

      let payload: NotificationPayload;
      if (dueCount > 0) {
        payload = NotificationCatalog.getDueCardsNotification(dueCount, dueWords(states).words, currentLocale);
      } else if (streak > 0 && prog.lastActiveDate !== getTodayString()) {
        payload = NotificationCatalog.getStreakReminderNotification(streak, questsLeft, currentLocale);
      } else {
        payload = NotificationCatalog.getDailyReminderNotification({
          level: prog.level || info.level,
          xpToNext,
          questsLeft,
          streak,
          weakSkill: focus?.skill,
          weakBand: focus?.band,
          mistakesCount
        }, currentLocale);
      }

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('eng_last_exit_time', String(Date.now()));
        } catch {}

        const bridge = (window as any).AndroidWidgetBridge || (window as any).AndroidNotificationBridge;
        if (bridge && typeof bridge.scheduleNotification === 'function') {
          // Schedule native Android notification 4 hours after exit (14,400,000 ms)
          bridge.scheduleNotification(payload.title, payload.body, payload.route, 4 * 60 * 60 * 1000);
        }

        // Web PWA / Browser background timer fallback when tab is hidden
        if (this.exitTimerId) {
          clearTimeout(this.exitTimerId);
          this.exitTimerId = null;
        }
        if (this.isSupported() && Notification.permission === 'granted') {
          this.exitTimerId = setTimeout(() => {
            if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
              this.dispatch(payload.title, {
                body: payload.body,
                icon: DEFAULT_ICON,
                badge: DEFAULT_ICON,
                tag: DEFAULT_TAG,
                data: { route: payload.route, type: payload.type }
              });
            }
          }, 3 * 60 * 60 * 1000);
        }
      }
    } catch (err) {
      console.warn('[NOTIFICATIONS] Failed to schedule exit reminder:', err);
    }
  }

  /**
   * Renders an accessible in-app HUD notification toast.
   */
  public static showToast(title: string, body: string, actionRoute: string = '#collocations'): HTMLElement | null {
    if (typeof document === 'undefined') return null;

    let container = document.getElementById('notification-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'notification-toast-container';
      const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
      const posStyles = isMobile ? [
        'position: fixed',
        'top: max(64px, calc(env(safe-area-inset-top, 0px) + 56px))',
        'left: 16px',
        'right: 16px',
        'z-index: var(--z-toast, 1000)',
        'display: flex',
        'flex-direction: column',
        'gap: 10px',
        'pointer-events: none',
        'max-width: 480px',
        'margin: 0 auto'
      ] : [
        'position: fixed',
        'bottom: max(24px, calc(env(safe-area-inset-bottom, 0px) + 20px))',
        'right: max(var(--pad-screen-right, 12px), calc(env(safe-area-inset-right, 0px) + 20px))',
        'z-index: var(--z-toast, 1000)',
        'display: flex',
        'flex-direction: column',
        'gap: 10px',
        'pointer-events: none',
        'max-width: 380px'
      ];
      container.style.cssText = posStyles.join(';');
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'hud-toast notification-toast';
    toast.setAttribute('role', 'alert'); // role="alert"
    toast.setAttribute('aria-live', 'polite'); // aria-live="polite"
    toast.style.cssText = [
      'pointer-events: auto',
      'background: var(--bg-card, #121622)',
      'color: var(--text-primary, #f8fafc)',
      'border: 1px solid var(--accent-gold, #ca8a04)',
      'border-radius: 8px',
      'padding: 12px 16px',
      'box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(202, 138, 4, 0.15)',
      'cursor: pointer',
      'display: flex',
      'align-items: flex-start',
      'gap: 12px',
      'font-family: Inter, -apple-system, sans-serif',
      'transition: opacity 0.3s ease, transform 0.3s ease'
    ].join(';');

    toast.innerHTML = `
      <img src="${DEFAULT_ICON}" alt="Notification Icon" style="width: 28px; height: 28px; border-radius: 4px; flex-shrink: 0;" />
      <div style="flex: 1; min-width: 0;">
        <div class="toast-title" style="font-weight: 700; font-size: var(--font-body-compact); line-height: 1.3; color: var(--accent-gold, #ca8a04); margin-bottom: 2px;">${title}</div>
        <div class="toast-body" style="font-size: var(--font-body-compact); line-height: 1.4; color: var(--text-secondary, #94a3b8);">${body}</div>
        <div style="font-size: var(--font-kicker); font-weight: 700; color: var(--accent-cyan, #38bdf8); margin-top: 6px; letter-spacing: 0.05em;">TAP TO DRILL →</div>
      </div>
      <button class="btn-toast-close" aria-label="${t('common.dismiss', undefined, 'Dismiss')}" style="background: none; border: none; color: var(--text-muted, #64748b); font-size: var(--font-body); cursor: pointer; min-width: var(--touch-target-min, 44px); min-height: var(--touch-target-min, 44px); display: inline-flex; align-items: center; justify-content: center; margin: -8px -8px -8px 0; touch-action: manipulation;">&times;</button>
    `;

    const dismiss = () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    };

    toast.querySelector('.btn-toast-close')?.addEventListener('click', (e) => {
      e.stopPropagation();
      dismiss();
    });

    toast.addEventListener('click', () => {
      dismiss();
      if (actionRoute && typeof window !== 'undefined') {
        navigateTo(actionRoute);
      }
    });

    container.appendChild(toast);

    // Auto-dismiss after 6 seconds
    setTimeout(dismiss, 6000);

    return toast;
  }


  /**
   * Sets up periodic background checks (e.g. every hour or configurable interval).
   */
  public static schedulePeriodicCheck(intervalMs = 60 * 60 * 1000): void {
    if (this.periodicTimerId) {
      clearInterval(this.periodicTimerId);
    }
    // Check initially on startup
    this.checkAndNotify().catch(() => {});

    // Set recurring timer
    this.periodicTimerId = setInterval(() => {
      this.checkAndNotify().catch(() => {});
    }, intervalMs);

    // Register visibilitychange listener once to handle user exit
    if (!this.exitListenerAttached && typeof document !== 'undefined') {
      this.exitListenerAttached = true;
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          NotificationEngine.scheduleExitReminder();
        } else if (document.visibilityState === 'visible') {
          try {
            const lastExit = parseInt(localStorage.getItem('eng_last_exit_time') || '0', 10);
            if (lastExit && Date.now() - lastExit > 2 * 60 * 60 * 1000) {
              NotificationEngine.checkAndNotify().catch(() => {});
            }
          } catch {}
          if (NotificationEngine.exitTimerId) {
            clearTimeout(NotificationEngine.exitTimerId);
            NotificationEngine.exitTimerId = null;
          }
        }
      });
      if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', () => {
          NotificationEngine.scheduleExitReminder();
        });
      }
    }
  }

  public static async dispatchNative(title: string, options?: NotificationOptions): Promise<boolean> {
    return this.dispatch(title, options);
  }

  public static scheduleCheck(intervalMs = 60 * 60 * 1000): void {
    return this.schedulePeriodicCheck(intervalMs);
  }

  public static stopPeriodicCheck(): void {
    if (this.periodicTimerId) {
      clearInterval(this.periodicTimerId);
      this.periodicTimerId = null;
    }
  }

  public static stopScheduledCheck(): void {
    this.stopPeriodicCheck();
  }

  public static showToastFallback(title: string, body: string, actionRoute: string = '#collocations'): HTMLElement | null {
    return this.showToast(title, body, actionRoute);
  }

  private static recordNotificationTimestamp(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LAST_NOTIFIED_KEY, String(Date.now()));
    }
  }

  public static readonly DEFAULT_ICON = DEFAULT_ICON;
  public static readonly DEFAULT_TAG = DEFAULT_TAG;
  public static readonly REVIEW_TAG = DEFAULT_TAG;
}

if (typeof window !== 'undefined') {
  (window as any).NotificationEngine = NotificationEngine;
}
