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

  private lastFrameTime: number = performance.now();

  private startLoop(): void {
    if (!this.running) return;
    const render = (now: number) => {
      if (!this.running) return;
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
}
