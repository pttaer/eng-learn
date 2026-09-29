/**
 * STARK // English Singularity HUD - Kinetic Spring-Damper Physics Engine
 * Second-order Newtonian harmonic oscillator physics with critical damping guarantees.
 * Frame-rate independent simulation with temporal clamping and sleep states.
 */

export interface SpringConfig {
  stiffness: number; // k: spring stiffness (typically 180.0 to 320.0)
  damping?: number;   // c: damping coefficient (auto-calculated for critical damping: 2 * sqrt(m * k))
  mass?: number;      // m: inertial mass (default: 1.0)
  precision?: number; // threshold for resting sleep state (default: 0.001)
}

export class Spring1D {
  public current: number;
  public target: number;
  public velocity: number = 0;

  private k: number;
  private c: number;
  private m: number;
  private eps: number;

  constructor(initial: number, config: SpringConfig | number) {
    this.current = initial;
    this.target = initial;

    if (typeof config === 'number') {
      this.k = config;
      this.m = 1.0;
      this.c = 2 * Math.sqrt(this.m * this.k);
      this.eps = 0.001;
    } else {
      this.k = config.stiffness;
      this.m = config.mass || 1.0;
      this.c = config.damping ?? (2 * Math.sqrt(this.m * this.k));
      this.eps = config.precision || 0.001;
    }
  }

  public update(dtSeconds: number): boolean {
    // Defense: If frame delta indicates tab backgrounding (>100ms), snap to target
    if (dtSeconds > 0.1) {
      this.snapTo(this.target);
      return false;
    }

    const clampedDt = Math.min(dtSeconds, 0.033);
    const force = -this.k * (this.current - this.target) - this.c * this.velocity;
    const a = force / this.m;

    this.velocity += a * clampedDt;
    this.current += this.velocity * clampedDt;

    const isResting =
      Math.abs(this.target - this.current) < this.eps &&
      Math.abs(this.velocity) < this.eps;

    if (isResting) {
      this.current = this.target;
      this.velocity = 0;
      return false; // Sleeping
    }
    return true; // Active
  }

  public snapTo(target: number): void {
    this.current = target;
    this.target = target;
    this.velocity = 0;
  }
}

export class SpringVector2D {
  public currentX: number;
  public currentY: number;
  public targetX: number;
  public targetY: number;
  public velocityX: number = 0;
  public velocityY: number = 0;

  private k: number;
  private c: number;
  private m: number;
  private eps: number;

  constructor(initialX: number, initialY: number, config: SpringConfig) {
    this.currentX = initialX;
    this.currentY = initialY;
    this.targetX = initialX;
    this.targetY = initialY;
    this.m = config.mass || 1.0;
    this.k = config.stiffness;
    this.c = config.damping ?? (2 * Math.sqrt(this.m * this.k));
    this.eps = config.precision || 0.001;
  }

  public update(dtSeconds: number): boolean {
    // Defense: If frame delta indicates tab backgrounding (>100ms), snap to target
    if (dtSeconds > 0.1) {
      this.snapTo(this.targetX, this.targetY);
      return false;
    }

    const clampedDt = Math.min(dtSeconds, 0.033);

    const forceX = -this.k * (this.currentX - this.targetX) - this.c * this.velocityX;
    const forceY = -this.k * (this.currentY - this.targetY) - this.c * this.velocityY;

    const ax = forceX / this.m;
    const ay = forceY / this.m;

    this.velocityX += ax * clampedDt;
    this.velocityY += ay * clampedDt;

    this.currentX += this.velocityX * clampedDt;
    this.currentY += this.velocityY * clampedDt;

    const isResting =
      Math.abs(this.targetX - this.currentX) < this.eps &&
      Math.abs(this.targetY - this.currentY) < this.eps &&
      Math.abs(this.velocityX) < this.eps &&
      Math.abs(this.velocityY) < this.eps;

    if (isResting) {
      this.currentX = this.targetX;
      this.currentY = this.targetY;
      this.velocityX = 0;
      this.velocityY = 0;
      return false; // Sleeping
    }
    return true; // Active
  }

  public snapTo(x: number, y: number): void {
    this.currentX = x;
    this.currentY = y;
    this.targetX = x;
    this.targetY = y;
    this.velocityX = 0;
    this.velocityY = 0;
  }
}
