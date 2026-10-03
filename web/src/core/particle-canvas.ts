export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  opacity: number;
  shape: 'star' | 'rect' | 'circle';
}

/**
 * Fullscreen 2D Confetti & Particle Celebration Canvas.
 * GPU-friendly canvas particle engine for celebrating tour completion and milestones.
 */
export class ParticleCanvas {
  private static canvas: HTMLCanvasElement | null = null;
  private static ctx: CanvasRenderingContext2D | null = null;
  private static particles: Particle[] = [];
  private static animFrameId: number | null = null;

  public static readonly COLORS = ['#5b5bd6', '#a5b4fc', '#ddd6fe', '#111111', '#ffffff'];
  public static readonly SHAPES: ('star' | 'rect' | 'circle')[] = ['star', 'rect', 'circle'];

  public static init(canvas?: HTMLCanvasElement | null): void {
    if (typeof window === 'undefined') return;

    if (canvas) {
      this.canvas = canvas;
    } else {
      let existing = document.getElementById('confettiCanvas') as HTMLCanvasElement | null;
      if (!existing) {
        existing = document.createElement('canvas');
        existing.id = 'confettiCanvas';
        existing.style.position = 'fixed';
        existing.style.inset = '0';
        existing.style.pointerEvents = 'none';
        existing.style.zIndex = '100005';
        document.body.appendChild(existing);
      }
      this.canvas = existing;
    }

    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      window.addEventListener('resize', () => this.resize(), { passive: true });
    }
  }

  public static resize(): void {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  public static isAnimating(): boolean {
    return this.particles.length > 0 && this.animFrameId !== null;
  }

  public static getParticleCount(): number {
    return this.particles.length;
  }

  public static burst(originX?: number, originY?: number, count = 75): void {
    if (typeof window === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    if (!this.canvas || !this.ctx) {
      this.init();
    }
    if (!this.canvas || !this.ctx) return;

    const cx = originX ?? window.innerWidth / 2;
    const cy = originY ?? window.innerHeight / 2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 9;
      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: 3 + Math.random() * 5,
        color: this.COLORS[Math.floor(Math.random() * this.COLORS.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12,
        opacity: 1,
        shape: this.SHAPES[Math.floor(Math.random() * this.SHAPES.length)]
      });
    }

    if (!this.animFrameId) {
      this.loop();
    }
  }

  public static step(): boolean {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.18; // gravity
      p.vx *= 0.985; // drag/friction
      p.rotation += p.vRot;
      p.opacity -= 0.014; // opacity decay

      if (p.opacity <= 0) {
        this.particles.splice(i, 1);
      }
    }
    return this.particles.length > 0;
  }

  public static render(): void {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      this.ctx.save();
      this.ctx.globalAlpha = p.opacity;
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.6);
      } else if (p.shape === 'circle') {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        // 4-point star
        this.ctx.beginPath();
        this.ctx.moveTo(0, -p.size);
        this.ctx.lineTo(p.size * 0.3, -p.size * 0.3);
        this.ctx.lineTo(p.size, 0);
        this.ctx.lineTo(p.size * 0.3, p.size * 0.3);
        this.ctx.lineTo(0, p.size);
        this.ctx.lineTo(-p.size * 0.3, p.size * 0.3);
        this.ctx.lineTo(-p.size, 0);
        this.ctx.lineTo(-p.size * 0.3, -p.size * 0.3);
        this.ctx.closePath();
        this.ctx.fill();
      }
      this.ctx.restore();
    }
  }

  public static clear(): void {
    this.particles = [];
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  private static loop = (): void => {
    const hasMore = this.step();
    this.render();

    if (hasMore) {
      this.animFrameId = requestAnimationFrame(this.loop);
    } else {
      if (this.animFrameId !== null) {
        cancelAnimationFrame(this.animFrameId);
      }
      this.animFrameId = null;
    }
  };
}

if (typeof window !== 'undefined') {
  (window as any).ParticleCanvas = ParticleCanvas;
}
