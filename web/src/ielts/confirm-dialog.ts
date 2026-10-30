import { AudioSynthesizer } from '../core/audio-synthesizer';
import { HapticEngine } from '../core/haptic-engine';
import { I18n } from '../core/i18n';

export interface ConfirmDialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

let activeTestSession: string | null = null;

/**
 * Sets the active IELTS test in progress ('reading', 'listening', 'writing', 'mock' or null).
 */
export function setIeltsTestInProgress(session: string | null): void {
  activeTestSession = session;
}

if (typeof window !== 'undefined') {
  (window as any).setIeltsTestInProgress = setIeltsTestInProgress;
  (window as any).isIeltsTestInProgress = isIeltsTestInProgress;
}

/**
 * Returns true if user is actively in a timed exam, test session, or quiz in IELTS.
 */
export function isIeltsTestInProgress(): boolean {
  if (activeTestSession) return true;
  // CD-IELTS Mock Cockpit in main app
  if (document.querySelector('#btn-pause-toggle')) return true;
  return false;
}

/**
 * Universal Apple-calm confirmation modal for IELTS navigation and view exits.
 */
export function showIeltsConfirmDialog(options: ConfirmDialogOptions): Promise<boolean> {
  const existing = document.getElementById('ielts-confirm-dialog');
  if (existing) existing.remove();

  return new Promise<boolean>((resolve) => {
    const isVi = I18n.getLocale() === 'vi';
    const type = options.type || 'warning';
    const typeColor = type === 'danger'
      ? 'var(--urgent, #ef4444)'
      : type === 'warning'
        ? 'var(--accent-gold, #f59e0b)'
        : 'var(--accent-cyan, #38bdf8)';
    const typeIcon = type === 'danger' ? '⚠️' : type === 'warning' ? '⚠️' : 'ℹ️';

    const defaultTitle = isVi ? 'Xác nhận rời khỏi bài thi' : 'Confirm Navigation';
    const title = options.title || defaultTitle;
    const confirmLabel = options.confirmText || (isVi ? 'Rời khỏi bài thi' : 'Leave Exam');
    const cancelLabel = options.cancelText || (isVi ? 'Tiếp tục làm bài' : 'Keep Working');

    const dialog = document.createElement('div');
    dialog.id = 'ielts-confirm-dialog';
    dialog.className = 'completion-modal-overlay interactive hud-confirm-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-label', title);
    dialog.style.cssText = 'position: fixed; inset: 0; background: rgba(0, 0, 0, 0.72); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 10000; padding: 16px;';

    dialog.innerHTML = `
      <div class="completion-receipt-card" style="max-width: 440px; width: 100%; max-height: calc(100dvh - 32px); overflow-y: auto; box-sizing: border-box; background: var(--bg-card, #141c2e); border: 1px solid var(--border-hairline, rgba(255,255,255,0.12)); border-top: 3px solid ${typeColor}; padding: 22px 18px; border-radius: var(--radius-squircle-md, 14px); box-shadow: var(--shadow-modal, 0 20px 45px rgba(0,0,0,0.6));">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
          <span style="font-size: 20px; color: ${typeColor}; display: inline-flex;">${typeIcon}</span>
          <div style="font-size: var(--text-sm, 14px); font-weight: 700; color: ${typeColor}; letter-spacing: 0.05em; text-transform: uppercase;">${title}</div>
        </div>
        <div style="font-size: var(--text-sm, 14px); line-height: 1.6; color: var(--ink-primary, #f1f5f9); margin-bottom: 18px; white-space: pre-line;">${options.message}</div>
        <div class="action-stack" style="display: flex; flex-direction: column; gap: 10px; width: 100%;">
          <button type="button" class="ie-btn btn-confirm-cancel apple-press" style="width: 100%; justify-content: center; padding: 12px 18px; font-weight: 700; background: var(--accent-gold, #f59e0b); color: #080a0f; border: 1px solid var(--accent-gold, #f59e0b); border-radius: var(--radius-btn, 10px); min-height: 46px; cursor: pointer;">
            ${cancelLabel}
          </button>
          <button type="button" class="ie-btn btn-confirm-proceed apple-press" style="width: 100%; justify-content: center; padding: 10px 18px; font-weight: 600; color: var(--urgent, #ef4444); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: var(--radius-btn, 10px); min-height: 44px; background: rgba(239, 68, 68, 0.08); cursor: pointer;">
            ${confirmLabel}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    let finished = false;
    const finish = (confirmed: boolean) => {
      if (finished) return;
      finished = true;
      AudioSynthesizer.play('click');
      HapticEngine.trigger(confirmed ? 'warning' : 'light');
      dialog.remove();
      document.removeEventListener('keydown', onKey, true);
      resolve(confirmed);
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
