import { AudioSynthesizer } from './audio-synthesizer';
import { SeaUrchin, PillarId } from './sea-urchin';
import { CursorTracker } from './cursor-tracker';
import { StorageManager } from '../utils/storage';
import { SRSEngine } from './srs-engine';

export interface FloatingEntity {
  id: string;
  isDecoy: boolean;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  rotation: number;
  vRot: number;
  // State
  imploding: boolean;
  implosionProgress: number; // 0 to 1
  vanished: boolean;
  // Learning data if not decoy
  collocation?: {
    id: string;
    phrase: string;
    vietnamese: string;
  };
}

export interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  lineWidth: number;
}

export class PerspectiveCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number = window.innerWidth;
  private height: number = window.innerHeight;
  private dpr: number = window.devicePixelRatio || 1;
  private focalLength: number = 400;

  private urchin: SeaUrchin;
  private entities: FloatingEntity[] = [];
  private shockwaves: Shockwave[] = [];
  private collocationsPool: Array<{ id: string; phrase: string; vietnamese: string }> = [];

  // Active Void Lens (Black Light Learning Eruption)
  private activeVoidLens: {
    x: number;
    y: number;
    targetRadius: number;
    currentRadius: number;
    entity: FloatingEntity;
    absorbed: boolean;
  } | null = null;

  public onNavigate?: (pillar: PillarId) => void;
  public onAbsorptionStreak?: () => void;
  private running: boolean = true;
  private animFrameId: number | null = null;
  private motionObserver: MutationObserver | null = null;

  constructor(canvas: HTMLCanvasElement, collocations: any[]) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.urchin = new SeaUrchin();
    this.collocationsPool = collocations;

    this.urchin.onPillarClick = (pillar) => {
      if (this.onNavigate) {
        this.onNavigate(pillar);
      }
    };

    this.resize();
    this.initEntities();
    this.bindEvents();
    this.setupMotionObserver();
    this.startLoop();
  }

  private resize(): void {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);
  }

  private initEntities(): void {
    const totalEntities = 18;
    this.entities = [];

    for (let i = 0; i < totalEntities; i++) {
      this.spawnEntity(i % 4 !== 0); // 3 decoys for every 1 learning item
    }
  }

  private spawnEntity(isDecoy: boolean): FloatingEntity {
    const rangeX = this.width * 0.8;
    const rangeY = this.height * 0.8;

    let collocItem;
    if (!isDecoy && this.collocationsPool.length > 0) {
      const randIdx = Math.floor(Math.random() * this.collocationsPool.length);
      collocItem = this.collocationsPool[randIdx];
    }

    const entity: FloatingEntity = {
      id: Math.random().toString(36).substring(2, 9),
      isDecoy,
      x: (Math.random() - 0.5) * rangeX,
      y: (Math.random() - 0.5) * rangeY,
      z: 50 + Math.random() * 300,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      vz: (Math.random() - 0.5) * 0.2,
      size: isDecoy ? 12 + Math.random() * 8 : 22,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.02,
      imploding: false,
      implosionProgress: 0,
      vanished: false,
      collocation: collocItem
    };

    this.entities.push(entity);
    return entity;
  }

  private bindEvents(): void {
    window.addEventListener('resize', () => this.resize());
    if (typeof window !== 'undefined' && window.matchMedia) {
      const dprMedia = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
      dprMedia.addEventListener?.('change', () => this.resize());
    }

    this.canvas.addEventListener('click', (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // 1. Check if clicked inside active void lens [ABSORB] button
      if (this.activeVoidLens) {
        const lens = this.activeVoidLens;
        const distToLens = Math.hypot(mouseX - lens.x, mouseY - lens.y);
        
        // Absorb button area inside the lens
        const btnY = lens.y + 40;
        const isOverBtn = Math.abs(mouseX - lens.x) < 55 && Math.abs(mouseY - btnY) < 16;

        if (isOverBtn || distToLens < lens.currentRadius) {
          this.absorbVoidLens();
          return;
        }
      }

      // 2. Check Urchin Pillar clicks
      if (this.urchin.handleClick(mouseX, mouseY)) {
        return;
      }

      // 3. Check entity clicks
      const cx = this.width / 2;
      const cy = this.height / 2;

      for (const ent of this.entities) {
        if (ent.vanished || ent.imploding) continue;

        const scale = this.focalLength / (this.focalLength + ent.z);
        const projX = cx + ent.x * scale;
        const projY = cy + ent.y * scale;
        const projSize = ent.size * scale;

        const d = Math.hypot(mouseX - projX, mouseY - projY);
        if (d < Math.max(20, projSize)) {
          if (ent.isDecoy) {
            this.triggerImplosion(ent, projX, projY);
          } else {
            this.triggerBlackLight(ent, projX, projY);
          }
          break;
        }
      }
    });
  }

  private triggerImplosion(ent: FloatingEntity, x: number, y: number): void {
    ent.imploding = true;
    AudioSynthesizer.play('implosion');

    // Create hairline shockwave
    this.shockwaves.push({
      x,
      y,
      radius: 4,
      maxRadius: 36,
      alpha: 1,
      lineWidth: 1
    });
  }

  private triggerBlackLight(ent: FloatingEntity, x: number, y: number): void {
    AudioSynthesizer.play('void-open');

    // Emit 3 concentric black shockwaves
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.shockwaves.push({
          x,
          y,
          radius: 10,
          maxRadius: 80 + i * 40,
          alpha: 0.8,
          lineWidth: 1.5
        });
      }, i * 60);
    }

    // Open Inverted Void Lens
    this.activeVoidLens = {
      x,
      y,
      targetRadius: 130,
      currentRadius: 10,
      entity: ent,
      absorbed: false
    };
  }

  private absorbVoidLens(): void {
    if (!this.activeVoidLens || this.activeVoidLens.absorbed) return;

    this.activeVoidLens.absorbed = true;
    AudioSynthesizer.play('absorb');

    const lens = this.activeVoidLens;
    const cx = this.width / 2;
    const cy = this.height / 2;

    // Save learning progress into SM-2 storage
    if (lens.entity.collocation) {
      const cardId = lens.entity.collocation.id;
      const current = StorageManager.getCardState(cardId);
      const updated = SRSEngine.rateCard(current, cardId, 'good');
      StorageManager.setCardState(cardId, updated);
    }

    // Energy pulse to urchin core
    this.shockwaves.push({
      x: cx,
      y: cy,
      radius: 15,
      maxRadius: 180,
      alpha: 0.9,
      lineWidth: 2
    });

    if (this.onAbsorptionStreak) {
      this.onAbsorptionStreak();
    }

    // Rapid shrink lens back to void
    setTimeout(() => {
      lens.entity.vanished = true;
      this.activeVoidLens = null;
    }, 180);
  }

  private isReducedMotion(): boolean {
    if (typeof document === 'undefined') return false;
    return (
      document.documentElement.getAttribute('data-motion') === 'reduce' ||
      document.documentElement.dataset.motion === 'reduce' ||
      (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true)
    );
  }

  private setupMotionObserver(): void {
    if (typeof MutationObserver === 'undefined' || typeof document === 'undefined') return;
    if (this.motionObserver) return;
    this.motionObserver = new MutationObserver(() => {
      this.handleMotionChange();
    });
    this.motionObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-motion']
    });

    if (typeof window !== 'undefined' && window.matchMedia) {
      window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change', () => {
        this.handleMotionChange();
      });
    }
  }

  private handleMotionChange(): void {
    if (this.isReducedMotion()) {
      if (this.animFrameId !== null) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
      if (this.running) {
        this.update(0);
        this.draw();
      }
    } else {
      if (this.running && this.animFrameId === null) {
        this.lastFrameTime = performance.now();
        this.startLoop();
      }
    }
  }

  private lastFrameTime: number = performance.now();

  private startLoop(): void {
    if (!this.running) return;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.isReducedMotion()) {
      // Zero-cycle suspension: draw single static frame and do not schedule requestAnimationFrame
      this.update(0);
      this.draw();
      return;
    }

    const render = (now: number) => {
      if (!this.running) return;
      if (this.isReducedMotion()) {
        this.animFrameId = null;
        this.update(0);
        this.draw();
        return;
      }
      const rawDt = (now - this.lastFrameTime) / 1000;
      this.lastFrameTime = now;
      const dt = Math.min(rawDt > 0 ? rawDt : 0.016, 0.033);

      this.update(dt);
      this.draw();
      this.animFrameId = requestAnimationFrame(render);
    };
    this.animFrameId = requestAnimationFrame(render);
  }

  public setVisible(visible: boolean): void {
    const container = document.getElementById('canvas-container');
    if (visible) {
      if (container) {
        container.style.display = 'block';
        container.style.opacity = '1';
        container.style.pointerEvents = 'auto';
      }
      this.canvas.style.display = 'block';
      if (!this.running) {
        this.running = true;
        this.lastFrameTime = performance.now();
        this.startLoop();
      }
    } else {
      if (container) {
        container.style.display = 'none';
        container.style.opacity = '0';
        container.style.pointerEvents = 'none';
      }
      this.canvas.style.display = 'none';
      this.running = false;
      if (this.animFrameId !== null) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
    }
  }

  public destroy(): void {
    this.running = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.motionObserver?.disconnect();
    this.motionObserver = null;
  }

  public isVisible(): boolean {
    return this.running;
  }

  private update(dt: number = 0.016): void {
    const mouseX = CursorTracker.x;
    const mouseY = CursorTracker.y;
    const cx = this.width / 2;
    const cy = this.height / 2;

    // Update Urchin with exact dt
    this.urchin.update(cx, cy, mouseX, mouseY, dt);

    // Update Floating Entities
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const ent = this.entities[i];

      if (ent.vanished) {
        this.entities.splice(i, 1);
        this.spawnEntity(Math.random() > 0.3);
        continue;
      }

      if (ent.imploding) {
        ent.implosionProgress += 0.12;
        if (ent.implosionProgress >= 1) {
          ent.vanished = true;
        }
        continue;
      }

      ent.x += ent.vx;
      ent.y += ent.vy;
      ent.z += ent.vz;
      ent.rotation += ent.vRot;

      // Boundary wraps
      const boundX = this.width * 0.55;
      const boundY = this.height * 0.55;
      if (Math.abs(ent.x) > boundX) ent.vx *= -1;
      if (Math.abs(ent.y) > boundY) ent.vy *= -1;
      if (ent.z < 30 || ent.z > 450) ent.vz *= -1;

      // Proximity hover trigger for decoys
      const scale = this.focalLength / (this.focalLength + ent.z);
      const projX = cx + ent.x * scale;
      const projY = cy + ent.y * scale;
      const projDist = Math.hypot(mouseX - projX, mouseY - projY);

      if (projDist < ent.size * scale + 10 && ent.isDecoy && !ent.imploding) {
        this.triggerImplosion(ent, projX, projY);
      }
    }

    // Update Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += (sw.maxRadius - sw.radius) * 0.18 + 1.2;
      sw.alpha -= 0.035;

      if (sw.alpha <= 0.01 || sw.radius >= sw.maxRadius) {
        this.shockwaves.splice(i, 1);
      }
    }

    // Update Void Lens expansion
    if (this.activeVoidLens) {
      const target = this.activeVoidLens.absorbed ? 0 : this.activeVoidLens.targetRadius;
      this.activeVoidLens.currentRadius += (target - this.activeVoidLens.currentRadius) * 0.2;
    }
  }

  private draw(): void {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const cx = w / 2;
    const cy = h / 2;

    // Pure white canvas background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    // 1. Draw 2.5D Architectural Perspective Grid Lines
    this.drawPerspectiveGrid(ctx, cx, cy);

    // 2. Draw Floating 2.5D Entities
    this.drawEntities(ctx, cx, cy);

    // 3. Draw Living Geometric Sea Urchin
    this.urchin.draw(ctx, cx, cy, CursorTracker.x, CursorTracker.y);

    // 4. Draw Shockwaves
    this.drawShockwaves(ctx);

    // 5. Draw Inverted Void Lens (Black Light)
    if (this.activeVoidLens && this.activeVoidLens.currentRadius > 3) {
      this.drawVoidLens(ctx);
    }
  }

  private drawPerspectiveGrid(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.lineWidth = 1;

    // Horizon centerline
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(this.width, cy);
    ctx.stroke();

    // Radial perspective guide lines
    const rays = 12;
    for (let i = 0; i < rays; i++) {
      const angle = (i / rays) * Math.PI * 2;
      const rx = cx + Math.cos(angle) * Math.max(this.width, this.height);
      const ry = cy + Math.sin(angle) * Math.max(this.width, this.height);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(rx, ry);
      ctx.stroke();
    }

    // Concentric perspective distance rings
    const rings = [100, 220, 360, 520, 700];
    ctx.setLineDash([2, 4]);
    for (const r of rings) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.45, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();
  }

  private drawEntities(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    ctx.save();

    for (const ent of this.entities) {
      if (ent.vanished) continue;

      const scale = this.focalLength / (this.focalLength + ent.z);
      const projX = cx + ent.x * scale;
      const projY = cy + ent.y * scale;

      let drawSize = ent.size * scale;
      let alpha = Math.min(1, Math.max(0.2, (scale - 0.4) / 0.6));

      if (ent.imploding) {
        // Micro-implosion contracts into zero-point dot
        const factor = Math.max(0, 1 - ent.implosionProgress);
        drawSize *= factor;
        alpha *= factor;
      }

      ctx.save();
      ctx.translate(projX, projY);
      ctx.rotate(ent.rotation);
      ctx.globalAlpha = alpha;

      if (ent.isDecoy) {
        // Wireframe geometric decoy glyphs
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(-drawSize / 2, -drawSize / 2, drawSize, drawSize);

        // Center micro cross
        ctx.beginPath();
        ctx.moveTo(-2, 0); ctx.lineTo(2, 0);
        ctx.moveTo(0, -2); ctx.lineTo(0, 2);
        ctx.stroke();
      } else {
        // Valid Learning Artifact (Marked by dual square + glyph)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-drawSize / 2, -drawSize / 2, drawSize, drawSize);

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.strokeRect(-drawSize / 2 - 3, -drawSize / 2 - 3, drawSize + 6, drawSize + 6);

        // Monospace index label
        ctx.fillStyle = '#000000';
        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ITEM', 0, 0);
      }

      ctx.restore();
    }

    ctx.restore();
  }

  private drawShockwaves(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (const sw of this.shockwaves) {
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 0, 0, ${sw.alpha})`;
      ctx.lineWidth = sw.lineWidth;
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawVoidLens(ctx: CanvasRenderingContext2D): void {
    if (!this.activeVoidLens) return;
    const lens = this.activeVoidLens;
    const r = lens.currentRadius;

    ctx.save();

    // Concentric black aura
    ctx.beginPath();
    ctx.arc(lens.x, lens.y, r + 6, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Solid Inverted Pitch-Black Void
    ctx.beginPath();
    ctx.arc(lens.x, lens.y, r, 0, Math.PI * 2);
    ctx.fillStyle = '#000000';
    ctx.fill();

    // Crisp White Content inside Void Lens
    if (r > 60 && lens.entity.collocation) {
      const colloc = lens.entity.collocation;

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';

      // Header Tag
      ctx.font = '700 9px "JetBrains Mono", monospace';
      ctx.fillText('[DISCOVERED COLLOCATION]', lens.x, lens.y - 45);

      // Collocation Phrase
      ctx.font = '700 14px "Inter", sans-serif';
      ctx.fillText(colloc.phrase, lens.x, lens.y - 18);

      // Vietnamese Translation
      ctx.font = '11px "Inter", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText(colloc.vietnamese, lens.x, lens.y + 6);

      // [ABSORB] Button
      const btnY = lens.y + 40;
      const isHovered = Math.abs(CursorTracker.x - lens.x) < 55 && Math.abs(CursorTracker.y - btnY) < 16;

      ctx.beginPath();
      ctx.rect(lens.x - 50, btnY - 14, 100, 26);
      if (isHovered) {
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.fillStyle = '#000000';
      } else {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
      }

      ctx.font = '700 10px "JetBrains Mono", monospace';
      ctx.textBaseline = 'middle';
      ctx.fillText('[ABSORB]', lens.x, btnY);
    }

    ctx.restore();
  }

  /**
   * Static convenience hook to initialize specular 3D card tilt and glare across the application.
   */
  public static initCardTilt(): void {
    CardTiltController.init();
  }

  /**
   * Static convenience hook to initialize drifting deep-space nebula starfield canvas.
   */
  public static initNebula(canvas: HTMLCanvasElement): NebulaCanvas {
    return new NebulaCanvas(canvas);
  }
}

/**
 * SPECULAR 3D CARD TILT & HOLOGRAPHIC GLARE CONTROLLER
 * Tracks pointer movement over cards (.atomic-card, .atomic-card-container, .dossier-card),
 * calculating 3D perspective tilt (rotateX, rotateY) and holographic specular sheen
 * coordinates (--glare-x, --glare-y, --glare-opacity) with smooth spring return.
 */
export class CardTiltController {
  private static initialized: boolean = false;
  private static activeCard: HTMLElement | null = null;
  private static isReducedMotion: boolean = false;

  public static init(): void {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    this.checkReducedMotion();
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.addEventListener?.('change', (e) => {
      this.isReducedMotion = e.matches;
      if (this.isReducedMotion && this.activeCard) {
        this.resetTilt(this.activeCard);
        this.activeCard = null;
      }
    });

    if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
      const observer = new MutationObserver(() => {
        this.checkReducedMotion();
        if (this.isReducedMotion && this.activeCard) {
          this.resetTilt(this.activeCard);
          this.activeCard = null;
        }
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-motion']
      });
    }

    document.addEventListener('pointermove', (e: PointerEvent) => {
      if (this.isReducedMotion) return;

      const target = e.target as HTMLElement | null;
      const card = target?.closest?.('.atomic-card, .atomic-card-container, .dossier-card') as HTMLElement | null;

      if (card) {
        if (this.activeCard && this.activeCard !== card) {
          this.resetTilt(this.activeCard);
        }
        this.activeCard = card;
        this.handleMove(e, card);
      } else if (this.activeCard) {
        this.resetTilt(this.activeCard);
        this.activeCard = null;
      }
    }, { passive: true });

    document.addEventListener('pointerleave', () => {
      if (this.activeCard) {
        this.resetTilt(this.activeCard);
        this.activeCard = null;
      }
    }, { passive: true });
  }

  private static checkReducedMotion(): void {
    if (typeof document !== 'undefined') {
      const isAttr = document.documentElement.getAttribute('data-motion') === 'reduce' ||
                     document.documentElement.dataset.motion === 'reduce';
      const isMedia = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;
      this.isReducedMotion = isAttr || isMedia;
    } else {
      this.isReducedMotion = false;
    }
  }

  public static calculateTilt(clientX: number, clientY: number, card: HTMLElement): {
    rotateX: number;
    rotateY: number;
    glareX: number;
    glareY: number;
    glareOpacity: number;
  } {
    const rect = card.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return { rotateX: 0, rotateY: 0, glareX: 50, glareY: 50, glareOpacity: 0 };
    }

    const relX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const relY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

    const normX = (relX - 0.5) * 2; // -1 to 1
    const normY = (relY - 0.5) * 2; // -1 to 1

    const MAX_TILT = 7.5; // degrees
    let rotateX = -normY * MAX_TILT;
    let rotateY = normX * MAX_TILT;
    if (Math.abs(rotateX) < 1e-5) rotateX = 0;
    if (Math.abs(rotateY) < 1e-5) rotateY = 0;

    const glareX = relX * 100;
    const glareY = relY * 100;
    const dist = Math.min(1, Math.hypot(normX, normY) / Math.SQRT2);
    const glareOpacity = 0.15 + dist * 0.45;

    return { rotateX, rotateY, glareX, glareY, glareOpacity };
  }

  public static handleMove(e: PointerEvent, card: HTMLElement): void {
    if (this.isReducedMotion) return;

    card.classList.remove('is-mouse-out');
    const { rotateX, rotateY, glareX, glareY, glareOpacity } = this.calculateTilt(e.clientX, e.clientY, card);

    card.style.setProperty('--card-rotate-x', `${rotateX.toFixed(2)}deg`);
    card.style.setProperty('--card-rotate-y', `${rotateY.toFixed(2)}deg`);
    card.style.setProperty('--glare-x', `${glareX.toFixed(1)}%`);
    card.style.setProperty('--glare-y', `${glareY.toFixed(1)}%`);
    card.style.setProperty('--glare-opacity', glareOpacity.toFixed(2));
    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(6px)`;
  }

  public static resetTilt(card: HTMLElement): void {
    card.classList.add('is-mouse-out');
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    card.style.setProperty('--glare-opacity', '0');
    card.style.setProperty('--card-rotate-x', '0deg');
    card.style.setProperty('--card-rotate-y', '0deg');
  }
}

export interface NebulaStar {
  x: number; // Normalized 0 to 1
  y: number; // Normalized 0 to 1
  size: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
  isGold: boolean;
}

export interface NebulaPuff {
  x: number; // Normalized 0 to 1
  y: number; // Normalized 0 to 1
  vx: number;
  vy: number;
  radius: number;
  r: number;
  g: number;
  b: number;
  alpha: number;
  phase: number;
  pulseSpeed: number;
}

/**
 * DRIFTING DEEP-SPACE NEBULA STARFIELD CANVAS
 * Renders an ambient celestial nebula with drifting gas clouds and twinkling star clusters
 * behind the Skyrim Constellation Tree at 60fps.
 */
export class NebulaCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private stars: NebulaStar[] = [];
  private puffs: NebulaPuff[] = [];
  private animId: number | null = null;
  private running: boolean = false;
  private width: number = 0;
  private height: number = 0;
  private dpr: number = 1;
  private lastTime: number = performance.now();
  private resizeObserver: ResizeObserver | null = null;
  private motionObserver: MutationObserver | null = null;
  private isReducedMotion: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true })!;
    this.checkReducedMotion();
    this.initStars();
    this.initPuffs();
    this.resize();

    if (typeof ResizeObserver !== 'undefined' && canvas.parentElement) {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(canvas.parentElement);
    }
    window.addEventListener('resize', () => this.resize());
    this.setupMotionObserver();

    this.start();
  }

  private checkReducedMotion(): void {
    if (typeof document !== 'undefined') {
      const isAttr = document.documentElement.getAttribute('data-motion') === 'reduce' ||
                     document.documentElement.dataset.motion === 'reduce';
      const isMedia = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;
      this.isReducedMotion = isAttr || isMedia;
    } else {
      this.isReducedMotion = false;
    }
  }

  private setupMotionObserver(): void {
    if (typeof MutationObserver === 'undefined' || typeof document === 'undefined') return;
    if (this.motionObserver) return;
    this.motionObserver = new MutationObserver(() => {
      this.handleMotionChange();
    });
    this.motionObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-motion']
    });

    if (typeof window !== 'undefined' && window.matchMedia) {
      window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change', () => {
        this.handleMotionChange();
      });
    }
  }

  private handleMotionChange(): void {
    this.checkReducedMotion();
    if (this.isReducedMotion) {
      if (this.animId !== null) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }
      this.draw(performance.now(), 0);
    } else {
      if (this.running && this.animId === null) {
        this.start();
      }
    }
  }

  private initStars(): void {
    const starCount = 80;
    this.stars = [];
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() < 0.2 ? 1.8 + Math.random() * 1.2 : 0.8 + Math.random() * 0.8,
        baseAlpha: 0.2 + Math.random() * 0.5,
        twinkleSpeed: 1 + Math.random() * 2.5,
        phase: Math.random() * Math.PI * 2,
        isGold: Math.random() < 0.25
      });
    }
  }

  private initPuffs(): void {
    // Ethereal nebula gas clouds in gold, cyan, and cosmic indigo
    this.puffs = [
      { x: 0.25, y: 0.30, vx: 0.0015, vy: -0.001, radius: 240, r: 251, g: 146, b: 60, alpha: 0.055, phase: 0.2, pulseSpeed: 0.8 },
      { x: 0.70, y: 0.25, vx: -0.0012, vy: 0.0015, radius: 260, r: 56, g: 189, b: 248, alpha: 0.045, phase: 1.5, pulseSpeed: 0.7 },
      { x: 0.50, y: 0.65, vx: 0.001, vy: 0.0012, radius: 280, r: 139, g: 92, b: 246, alpha: 0.040, phase: 3.1, pulseSpeed: 0.9 },
      { x: 0.85, y: 0.70, vx: -0.0015, vy: -0.001, radius: 220, r: 251, g: 191, b: 36, alpha: 0.045, phase: 4.2, pulseSpeed: 0.75 },
      { x: 0.15, y: 0.80, vx: 0.0018, vy: -0.0012, radius: 200, r: 56, g: 189, b: 248, alpha: 0.035, phase: 5.0, pulseSpeed: 0.85 }
    ];
  }

  public resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width || window.innerWidth;
    this.height = rect.height || window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);

    if (this.isReducedMotion) {
      this.draw(performance.now(), 0);
    }
  }

  public start(): void {
    if (this.running && this.animId !== null) return;
    this.running = true;
    this.lastTime = performance.now();
    this.checkReducedMotion();

    if (this.isReducedMotion) {
      if (this.animId !== null) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }
      this.draw(this.lastTime, 0);
      return;
    }

    const loop = (now: number) => {
      if (!this.running) return;
      this.checkReducedMotion();
      if (this.isReducedMotion) {
        this.animId = null;
        this.draw(now, 0);
        return;
      }
      const dt = Math.min((now - this.lastTime) / 1000, 0.05);
      this.lastTime = now;

      this.draw(now, dt);
      this.animId = requestAnimationFrame(loop);
    };

    this.animId = requestAnimationFrame(loop);
  }

  public stop(): void {
    this.running = false;
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  public destroy(): void {
    this.stop();
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.motionObserver?.disconnect();
    this.motionObserver = null;
  }

  private draw(now: number, dt: number): void {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Draw Ethereal Nebula Gas Clouds
    for (const puff of this.puffs) {
      if (dt > 0) {
        puff.x += puff.vx * dt;
        puff.y += puff.vy * dt;

        // Soft wrap within view bounds + margin
        if (puff.x < -0.15) puff.x = 1.15;
        if (puff.x > 1.15) puff.x = -0.15;
        if (puff.y < -0.15) puff.y = 1.15;
        if (puff.y > 1.15) puff.y = -0.15;
      }

      const cx = puff.x * w;
      const cy = puff.y * h;
      const pulse = 1 + 0.08 * Math.sin(now * 0.001 * puff.pulseSpeed + puff.phase);
      const rad = puff.radius * pulse;

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      grad.addColorStop(0, `rgba(${puff.r}, ${puff.g}, ${puff.b}, ${puff.alpha})`);
      grad.addColorStop(0.5, `rgba(${puff.r}, ${puff.g}, ${puff.b}, ${puff.alpha * 0.45})`);
      grad.addColorStop(1, `rgba(${puff.r}, ${puff.g}, ${puff.b}, 0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Draw Twinkling Cosmic Starfield
    for (const star of this.stars) {
      const sx = star.x * w;
      const sy = star.y * h;

      const twinkle = Math.sin(now * 0.0018 * star.twinkleSpeed + star.phase);
      const alpha = Math.max(0.12, Math.min(0.95, star.baseAlpha + twinkle * 0.35));

      ctx.save();
      ctx.globalAlpha = alpha;

      if (star.isGold) {
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = 'rgba(251, 191, 36, 0.6)';
        ctx.shadowBlur = 4;
      } else {
        ctx.fillStyle = '#e0f2fe';
        ctx.shadowColor = 'rgba(56, 189, 248, 0.4)';
        ctx.shadowBlur = 2;
      }

      ctx.beginPath();
      ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }
}
