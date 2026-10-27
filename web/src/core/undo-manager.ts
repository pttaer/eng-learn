import { AcousticHaptics } from './acoustic-haptics';

export interface UndoAction {
  id: string;
  message: string;
  undo: () => void;
  timestamp: number;
}

class UndoManagerSingleton {
  private currentAction: UndoAction | null = null;
  private timer: number | null = null;
  private containerEl: HTMLElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', (e) => {
        if (this.isEditingInput(e)) return;
        if (e.key === 'z' || e.key === 'Z') {
          if (this.currentAction) {
            e.preventDefault();
            this.triggerUndo();
          }
        }
      });
    }
  }

  private isEditingInput(e: KeyboardEvent): boolean {
    const target = e.target as HTMLElement | null;
    if (!target) return false;
    const tag = target.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable;
  }

  register(message: string, undo: () => void, timeoutMs = 4000): void {
    if (this.timer) clearTimeout(this.timer);
    this.currentAction = { id: Math.random().toString(36).substring(2, 9), message, undo, timestamp: Date.now() };
    this.renderToast(message, timeoutMs);
    this.timer = window.setTimeout(() => this.dismiss(), timeoutMs);
  }

  triggerUndo(): void {
    if (!this.currentAction) return;
    const action = this.currentAction;
    this.dismiss();
    AcousticHaptics.tap();
    action.undo();
  }

  dismiss(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.currentAction = null;
    if (this.containerEl) {
      this.containerEl.classList.remove('apple-toast-visible');
      setTimeout(() => {
        if (this.containerEl && !this.currentAction) {
          this.containerEl.remove();
          this.containerEl = null;
        }
      }, 250);
    }
  }

  private renderToast(message: string, timeoutMs: number): void {
    if (!this.containerEl) {
      this.containerEl = document.createElement('div');
      this.containerEl.className = 'apple-toast-undo';
      document.body.appendChild(this.containerEl);
    }

    this.containerEl.innerHTML = `
      <div class="apple-toast-content">
        <span class="apple-toast-text">${message}</span>
        <button type="button" class="apple-toast-btn" aria-label="Hoàn tác thao tác">
          <span>Hoàn tác</span>
          <kbd>Z</kbd>
        </button>
      </div>
      <div class="apple-toast-progress" style="animation-duration: ${timeoutMs}ms"></div>
    `;

    const btn = this.containerEl.querySelector('.apple-toast-btn');
    btn?.addEventListener('click', () => this.triggerUndo());

    // Force reflow and show
    void this.containerEl.offsetWidth;
    this.containerEl.classList.add('apple-toast-visible');
  }
}

export const UndoManager = new UndoManagerSingleton();
