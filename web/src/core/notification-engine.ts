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

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export interface CheckNotifyResult {
  notified: boolean;
  reason?: 'due_cards' | 'streak_reminder';
  dueCount: number;
  streak: number;
  mode: 'native' | 'toast' | 'none';
}

const NOTIFICATIONS_ENABLED_KEY = 'eng_notifications_enabled';
const LAST_NOTIFIED_KEY = 'eng_last_notification_timestamp';
const DEFAULT_ICON = '/icon-192.png';
const DEFAULT_TAG = 'srs-review-due';

export class NotificationEngine {
  private static periodicTimerId: any = null;

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
   * Dispatches a notification across Service Worker or Window Notification,
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

    // 1. Try Native Notification if granted
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
            window.location.hash = targetRoute;
          }
          notif.close();
        };
        this.recordNotificationTimestamp();
        return true;
      } catch (err) {
        console.warn('[NOTIFICATIONS] Native dispatch failed, displaying toast fallback:', err);
      }
    }

    // 2. In-App HUD Toast fallback
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
    try {
      const states = cardStatesOverride ?? StorageManager.loadState().cardStates;
      dueCount = SRSEngine.getDueCount(states);
    } catch {
      dueCount = 0;
    }

    // 2. Calculate streak status
    let streak = 0;
    let needsStreakReminder = false;
    try {
      const storageState = StorageManager.loadState();
      streak = storageState.streak?.currentStreak || 0;
      const lastActive = storageState.streak?.lastActiveDate || '';
      const today = new Date().toISOString().slice(0, 10);
      needsStreakReminder = streak > 0 && lastActive !== today;
    } catch {
      streak = 0;
    }

    // 3. Evaluate notification trigger
    if (dueCount > 0) {
      const title = `SRS Review Due (${dueCount} item${dueCount > 1 ? 's' : ''})`;
      const body = `You have ${dueCount} flashcard${dueCount > 1 ? 's' : ''} ready for spaced repetition recall. Retain your mastery!`;
      const isNative = await this.dispatch(title, {
        body,
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

    if (needsStreakReminder) {
      const title = `Streak Protection Alert (${streak} Days)`;
      const body = `Don't break your ${streak}-day study streak! Complete your daily workout today.`;
      const isNative = await this.dispatch(title, {
        body,
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

    return { notified: false, dueCount: 0, streak, mode: 'none' };
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
      container.style.cssText = [
        'position: fixed',
        'bottom: max(24px, calc(env(safe-area-inset-bottom, 0px) + 20px))',
        'right: max(24px, calc(env(safe-area-inset-right, 0px) + 20px))',
        'z-index: 100008',
        'display: flex',
        'flex-direction: column',
        'gap: 10px',
        'pointer-events: none',
        'max-width: 380px'
      ].join(';');
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
        <div class="toast-title" style="font-weight: 700; font-size: 13px; line-height: 1.3; color: var(--accent-gold, #ca8a04); margin-bottom: 2px;">${title}</div>
        <div class="toast-body" style="font-size: 12px; line-height: 1.4; color: var(--text-secondary, #94a3b8);">${body}</div>
        <div style="font-size: 10px; font-weight: 700; color: var(--accent-cyan, #38bdf8); margin-top: 6px; letter-spacing: 0.05em;">TAP TO DRILL →</div>
      </div>
      <button class="btn-toast-close" aria-label="Dismiss" style="background: none; border: none; color: var(--text-muted, #64748b); font-size: 16px; cursor: pointer; padding: 0 4px; line-height: 1;">&times;</button>
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
        window.location.hash = actionRoute;
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
