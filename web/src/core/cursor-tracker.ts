/**
 * STARK // English Singularity HUD - High-Precision Cursor Tracker
 * Sub-frame pointer coalescing, instantaneous velocity vector calculations,
 * and critically damped spring-lag cursor reticle with reduced-motion bypass.
 */

export interface PointerVelocity {
  vx: number;     // horizontal velocity in px/s
  vy: number;     // vertical velocity in px/s
  speed: number;  // magnitude in px/s
}

export class CursorTracker {
  private static cursorEl: HTMLElement | null = null;
  public static rawX: number = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
  public static rawY: number = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;
  public static x: number = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
  public static y: number = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;
  public static isTargetLocked: boolean = false;
  public static velocity: PointerVelocity = { vx: 0, vy: 0, speed: 0 };

  private static lastEventTime: number = typeof performance !== 'undefined' ? performance.now() : 0;
  private static prevRawX: number = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
  private static prevRawY: number = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;
  private static lastFrameTime: number = typeof performance !== 'undefined' ? performance.now() : 0;

  // Spring velocity for reticle follow
  private static springVx: number = 0;
  private static springVy: number = 0;

  private static isInitialized: boolean = false;
  private static reducedMotion: boolean = false;

  public static init(): void {
    // Native cursor enabled - DOM reticle insertion disabled
    if (this.isInitialized) return;
    this.isInitialized = true;
    this.checkReducedMotion();
    this.bindEvents();
    this.startRAF();
  }

  private static checkReducedMotion(): void {
    // In-app setting (Settings → Motion), not the OS flag
    this.reducedMotion = typeof document !== 'undefined' && document.documentElement.dataset.motion === 'reduce';
  }

  private static bindEvents(): void {
    window.addEventListener('pointermove', (e: PointerEvent) => {
      // 1. Process coalesced pointer events for sub-frame trajectory precision
      const events = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : [e];
      for (const ev of events) {
        this.rawX = ev.clientX;
        this.rawY = ev.clientY;
      }

      // 2. High-precision velocity vector computation (px/sec)
      const now = performance.now();
      const dt = Math.max(0.001, (now - this.lastEventTime) / 1000);
      this.velocity.vx = (this.rawX - this.prevRawX) / dt;
      this.velocity.vy = (this.rawY - this.prevRawY) / dt;
      this.velocity.speed = Math.hypot(this.velocity.vx, this.velocity.vy);

      this.prevRawX = this.rawX;
      this.prevRawY = this.rawY;
      this.lastEventTime = now;

      // 3. Detect target lock on interactive elements
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
    this.lastFrameTime = performance.now();

    const loop = () => {
      const now = performance.now();
      const rawDt = (now - this.lastFrameTime) / 1000;
      this.lastFrameTime = now;

      // If tab was backgrounded or excessive delay, snap immediately
      if (rawDt > 0.1 || this.reducedMotion) {
        this.x = this.rawX;
        this.y = this.rawY;
        this.springVx = 0;
        this.springVy = 0;
      } else {
        const dt = Math.min(rawDt, 0.033);
        // Critically damped spring simulation for the custom reticle
        const k = 280.0;
        const c = 2 * Math.sqrt(k); // Critical damping

        const fx = -k * (this.x - this.rawX) - c * this.springVx;
        const fy = -k * (this.y - this.rawY) - c * this.springVy;

        this.springVx += fx * dt;
        this.springVy += fy * dt;

        this.x += this.springVx * dt;
        this.y += this.springVy * dt;
      }

      if (this.cursorEl) {
        this.cursorEl.style.transform = `translate3d(${this.x.toFixed(2)}px, ${this.y.toFixed(2)}px, 0)`;
      }

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}
