/**
 * Custom 1px Reticle Cursor Tracker
 * RAF-gated smoothing, target lock detection, coordinate broadcast.
 */

export class CursorTracker {
  private static cursorEl: HTMLElement | null = null;
  public static rawX: number = window.innerWidth / 2;
  public static rawY: number = window.innerHeight / 2;
  public static x: number = window.innerWidth / 2;
  public static y: number = window.innerHeight / 2;
  public static isTargetLocked: boolean = false;
  private static isInitialized: boolean = false;

  public static init(): void {
    if (this.isInitialized) return;

    this.createCursorDOM();
    this.bindEvents();
    this.startRAF();
    this.isInitialized = true;
  }

  private static createCursorDOM(): void {
    let existing = document.getElementById('custom-cursor');
    if (!existing) {
      existing = document.createElement('div');
      existing.id = 'custom-cursor';
      existing.innerHTML = `
        <div class="cursor-dot"></div>
        <div class="cursor-ring"></div>
        <div class="cursor-bracket-left"></div>
        <div class="cursor-bracket-right"></div>
      `;
      document.body.appendChild(existing);
    }
    this.cursorEl = existing;
  }

  private static bindEvents(): void {
    window.addEventListener('pointermove', (e: PointerEvent) => {
      this.rawX = e.clientX;
      this.rawY = e.clientY;

      // Detect target lock on interactive elements
      const target = e.target as HTMLElement | null;
      if (target) {
        const isClickable = !!(
          target.closest('button') ||
          target.closest('a') ||
          target.closest('.interactive') ||
          target.closest('.atomic-card-container') ||
          target.closest('.hud-btn') ||
          target.dataset.interactive
        );
        this.setTargetLock(isClickable);
      }
    }, { passive: true });

    document.addEventListener('pointerleave', () => {
      if (this.cursorEl) {
        this.cursorEl.style.opacity = '0';
      }
    });

    document.addEventListener('pointerenter', () => {
      if (this.cursorEl) {
        this.cursorEl.style.opacity = '1';
      }
    });
  }

  public static setTargetLock(locked: boolean): void {
    if (this.isTargetLocked === locked) return;
    this.isTargetLocked = locked;
    if (this.cursorEl) {
      if (locked) {
        this.cursorEl.classList.add('cursor-locked');
      } else {
        this.cursorEl.classList.remove('cursor-locked');
      }
    }
  }

  private static startRAF(): void {
    const loop = () => {
      // 0.22 linear interpolation for fluid physical reticle lag
      this.x += (this.rawX - this.x) * 0.24;
      this.y += (this.rawY - this.y) * 0.24;

      if (this.cursorEl) {
        this.cursorEl.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
      }

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}
