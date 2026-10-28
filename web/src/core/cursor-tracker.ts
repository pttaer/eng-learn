/**
 * STARK // English Singularity HUD - Cursor Tracker
 * Sub-frame pointer coalescing and a critically damped spring that follows the pointer.
 * PerspectiveCanvas reads CursorTracker.x and .y. Reduced motion snaps to the pointer.
 */

export class CursorTracker {
  public static rawX: number = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
  public static rawY: number = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;
  public static x: number = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
  public static y: number = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;

  private static lastFrameTime: number = typeof performance !== 'undefined' ? performance.now() : 0;

  // Spring velocity for follow
  private static springVx: number = 0;
  private static springVy: number = 0;

  private static isInitialized: boolean = false;
  private static reducedMotion: boolean = false;
  private static rafId: number | null = null;
  private static isRunning: boolean = false;

  public static init(): void {
    // Native cursor enabled - DOM reticle insertion disabled
    if (this.isInitialized) return;
    this.isInitialized = true;
    this.checkReducedMotion();
    this.bindEvents();
  }

  /** Runs the spring only while a consumer is visible (PerspectiveCanvas). Idempotent. */
  public static start(): void {
    this.isRunning = true;
    // Snap to the pointer so a canvas that reappears does not slide in from a stale position
    this.x = this.rawX;
    this.y = this.rawY;
    this.springVx = 0;
    this.springVy = 0;
    this.wake();
  }

  public static stop(): void {
    this.isRunning = false;
    if (this.rafId === null) return;
    cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  public static wake(): void {
    if (!this.isRunning || this.rafId !== null) return;
    this.lastFrameTime = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  private static checkReducedMotion(): void {
    // In-app setting (Settings → Motion), not the OS flag
    this.reducedMotion = typeof document !== 'undefined' && document.documentElement.dataset.motion === 'reduce';
  }

  private static bindEvents(): void {
    window.addEventListener('pointermove', (e: PointerEvent) => {
      // Process coalesced pointer events for sub-frame trajectory precision
      const events = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : [e];
      for (const ev of events) {
        this.rawX = ev.clientX;
        this.rawY = ev.clientY;
      }
      if (this.isRunning) {
        this.wake();
      }
    }, { passive: true });

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
          }
        } else if (this.isRunning) {
          this.wake();
        }
      });
    }
  }

  private static tick = (): void => {
    if (!this.isRunning) {
      this.rafId = null;
      return;
    }

    const now = performance.now();
    const rawDt = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;

    // If tab was backgrounded or excessive delay, snap immediately
    if (rawDt > 0.1 || this.reducedMotion) {
      this.x = this.rawX;
      this.y = this.rawY;
      this.springVx = 0;
      this.springVy = 0;
      this.rafId = null;
      return;
    }

    const dt = Math.min(rawDt, 0.033);
    // Critically damped spring simulation
    const k = 280.0;
    const c = 2 * Math.sqrt(k); // Critical damping

    const fx = -k * (this.x - this.rawX) - c * this.springVx;
    const fy = -k * (this.y - this.rawY) - c * this.springVy;

    this.springVx += fx * dt;
    this.springVy += fy * dt;

    this.x += this.springVx * dt;
    this.y += this.springVy * dt;

    // Zero-CPU idle: when critically damped spring reaches equilibrium, rest at exact raw coords and sleep
    const dx = Math.abs(this.x - this.rawX);
    const dy = Math.abs(this.y - this.rawY);
    const vx = Math.abs(this.springVx);
    const vy = Math.abs(this.springVy);
    if (dx < 0.1 && dy < 0.1 && vx < 0.1 && vy < 0.1) {
      this.x = this.rawX;
      this.y = this.rawY;
      this.springVx = 0;
      this.springVy = 0;
      this.rafId = null;
      return;
    }

    this.rafId = requestAnimationFrame(this.tick);
  };
}
