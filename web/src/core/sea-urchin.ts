/**
 * STARK // English Singularity HUD - Living Sea Urchin Kinetics
 * Upgraded with Second-Order Spring-Damper Physics, Gaussian Angular Parting,
 * Multi-Touch Gestural State Machine, and Gateway Wavefront Ripples.
 * 100% Binary Monochrome & Frame-Rate Independent.
 */

import { AudioSynthesizer } from './audio-synthesizer';
import { Spring1D, SpringVector2D } from './spring-physics';

export type PillarId = 'singularity' | 'read' | 'write' | 'listen' | 'speak' | 'vocab' | 'colloc' | 'grammar';

export interface PillarGateway {
  id: PillarId;
  label: string;
  code: string;
  angle: number; // in radians
  distance: number;
  x: number;
  y: number;
  springPos: SpringVector2D;
  radius: number;
  hitRadius: number;
  hovered: boolean;
}

export type TouchState = 'COLLAPSED' | 'AIMING' | 'COMMITTED' | 'RESET';

interface WavefrontRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  durationMs: number;
  elapsedMs: number;
}

export class SeaUrchin {
  private spineCount: number = 96;
  private baseRadius: number = 46; // Base resting radius
  private spineLengths: number[] = [];
  private spineAngles: number[] = [];

  // Second-Order Harmonic Oscillator for Parting State
  private partingSpring: Spring1D;
  public partingProgress: number = 0; // 0 (closed) to 1 (fully parted)

  private pulsePhase: number = 0;
  private gateways: PillarGateway[] = [];
  private hoveredPillar: PillarId | null = null;
  private closeGraceCounter: number = 0; // Hysteresis grace counter in frames
  private ripples: WavefrontRipple[] = [];

  // Multi-Touch Gestural State Machine
  private touchState: TouchState = 'COLLAPSED';
  private isTouchActive: boolean = false;
  private touchX: number = 0;
  private touchY: number = 0;

  private reducedMotion: boolean = false;
  public onPillarClick?: (pillar: PillarId) => void;

  constructor() {
    this.checkReducedMotion();
    this.partingSpring = new Spring1D(0, {
      stiffness: 190.0,
      damping: 2 * Math.sqrt(190.0), // Critically damped
      precision: 0.001
    });

    this.initSpines();
    this.initGateways();
    this.initTouchHandling();
  }

  private checkReducedMotion(): void {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.reducedMotion = mq.matches;
      mq.addEventListener('change', (e) => {
        this.reducedMotion = e.matches;
      });
    }
  }

  private initSpines(): void {
    for (let i = 0; i < this.spineCount; i++) {
      const angle = (i / this.spineCount) * Math.PI * 2;
      this.spineAngles.push(angle);

      // Crystalline biological variation
      const variance = Math.sin(angle * 4) * 18 + Math.cos(angle * 7) * 14;
      this.spineLengths.push(95 + variance);
    }
  }

  private initGateways(): void {
    // 7 Radial Pillars spaced at exact 2*PI/7 (~51.43 deg)
    const step = (Math.PI * 2) / 7;
    const baseAngle = -Math.PI / 2; // Pillar 01 (READ) anchored at 12 o'clock (-90 deg)
    const dist = 115; // Scaled outward distance from core
    const visualRadius = 28; // Scaled node radius
    const hitRadius = 38; // Generous hit radius eliminating inter-node gaps

    const specs: Array<{ id: PillarId; label: string; code: string }> = [
      { id: 'read', label: 'READ', code: '01' },
      { id: 'write', label: 'WRITE', code: '02' },
      { id: 'listen', label: 'LISTEN', code: '03' },
      { id: 'speak', label: 'SPEAK', code: '04' },
      { id: 'vocab', label: 'VOCAB', code: '05' },
      { id: 'colloc', label: 'COLLOC', code: '06' },
      { id: 'grammar', label: 'GRAMMAR', code: '07' }
    ];

    this.gateways = specs.map((spec, i) => {
      const angle = baseAngle + (i * step);
      return {
        id: spec.id,
        label: spec.label,
        code: spec.code,
        angle,
        distance: dist,
        x: 0,
        y: 0,
        springPos: new SpringVector2D(0, 0, {
          stiffness: 220.0,
          damping: 2 * Math.sqrt(220.0),
          precision: 0.01
        }),
        radius: visualRadius,
        hitRadius,
        hovered: false
      };
    });
  }

  private initTouchHandling(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('touchstart', (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        this.isTouchActive = true;
        this.touchX = touch.clientX;
        this.touchY = touch.clientY;
        this.touchState = 'AIMING';
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e: TouchEvent) => {
      if (this.isTouchActive && e.touches.length === 1) {
        const touch = e.touches[0];
        this.touchX = touch.clientX;
        this.touchY = touch.clientY;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      if (this.isTouchActive) {
        this.isTouchActive = false;
        if (this.hoveredPillar) {
          this.touchState = 'COMMITTED';
          AudioSynthesizer.play('void-open');
          if (this.onPillarClick) {
            this.onPillarClick(this.hoveredPillar);
          }
        } else {
          this.touchState = 'RESET';
        }
      }
    }, { passive: true });

    window.addEventListener('touchcancel', () => {
      this.isTouchActive = false;
      this.touchState = 'COLLAPSED';
    }, { passive: true });
  }

  public update(
    cx: number,
    cy: number,
    mouseX: number,
    mouseY: number,
    dtSeconds: number = 0.016
  ): void {
    const dt = Math.min(dtSeconds, 0.033);

    // If touch active, override pointer coordinates with touch location
    const px = this.isTouchActive ? this.touchX : mouseX;
    const py = this.isTouchActive ? this.touchY : mouseY;

    if (!this.reducedMotion) {
      this.pulsePhase += 0.035 * (dt / 0.016);
    }

    const dx = px - cx;
    const dy = py - cy;
    const distToCenter = Math.hypot(dx, dy);

    // Check if pointer is near any gateway node
    let isNearAnyGateway = false;
    if (this.partingProgress > 0.2) {
      for (const gw of this.gateways) {
        const d = Math.hypot(px - gw.x, py - gw.y);
        if (d <= gw.hitRadius + 16) {
          isNearAnyGateway = true;
          break;
        }
      }
    }

    // Concentric Hysteresis & Keep-Alive Envelope:
    // 1. OPEN_TRIGGER_RADIUS = 120: pointer hovering near center initiates parting.
    // 2. KEEP_ALIVE_ENVELOPE = 220: once open, stays open anywhere within 220px radius.
    // 3. isNearAnyGateway: stays open if cursor is hovering or traversing near any pillar node.
    const OPEN_TRIGGER_RADIUS = 120;
    const KEEP_ALIVE_ENVELOPE = 220;

    const shouldStayOpen = (this.partingProgress > 0.15 && distToCenter < KEEP_ALIVE_ENVELOPE)
      || (distToCenter < OPEN_TRIGGER_RADIUS)
      || isNearAnyGateway
      || (this.isTouchActive && this.touchState === 'AIMING');

    if (shouldStayOpen) {
      this.closeGraceCounter = 16; // ~260ms grace period
      this.partingSpring.target = 1.0;
    } else {
      if (this.closeGraceCounter > 0) {
        this.closeGraceCounter--;
        this.partingSpring.target = 1.0;
      } else {
        this.partingSpring.target = 0.0;
      }
    }

    // Advance spring-damper simulation for parting progress
    if (this.reducedMotion) {
      this.partingSpring.snapTo(this.partingSpring.target);
    } else {
      this.partingSpring.update(dt);
    }
    this.partingProgress = Math.max(0, Math.min(1.0, this.partingSpring.current));

    // Update coordinates of all gateways via individual SpringVector2D
    for (const gw of this.gateways) {
      const targetX = cx + Math.cos(gw.angle) * (gw.distance * this.partingProgress);
      const targetY = cy + Math.sin(gw.angle) * (gw.distance * this.partingProgress);

      gw.springPos.targetX = targetX;
      gw.springPos.targetY = targetY;

      if (this.reducedMotion) {
        gw.springPos.snapTo(targetX, targetY);
      } else {
        gw.springPos.update(dt);
      }

      gw.x = gw.springPos.currentX;
      gw.y = gw.springPos.currentY;
    }

    // Evaluate individual pillar hover states & spawn ripples
    this.hoveredPillar = null;
    for (const gw of this.gateways) {
      if (this.partingProgress > 0.35) {
        const gwDist = Math.hypot(px - gw.x, py - gw.y);
        const wasHovered = gw.hovered;
        gw.hovered = gwDist <= gw.hitRadius;

        if (gw.hovered) {
          this.hoveredPillar = gw.id;
          if (!wasHovered) {
            AudioSynthesizer.play('click');
            // Spawn concentric wavefront ripple
            this.ripples.push({
              x: gw.x,
              y: gw.y,
              radius: gw.radius,
              maxRadius: 64,
              durationMs: 400,
              elapsedMs: 0
            });
          }
        }
      } else {
        gw.hovered = false;
      }
    }

    // Update active ripples
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.elapsedMs += dt * 1000;
      r.radius = gwRadiusEased(r.elapsedMs / r.durationMs, r.maxRadius);
      if (r.elapsedMs >= r.durationMs) {
        this.ripples.splice(i, 1);
      }
    }
  }

  public draw(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    mouseX: number,
    mouseY: number
  ): void {
    const px = this.isTouchActive ? this.touchX : mouseX;
    const py = this.isTouchActive ? this.touchY : mouseY;

    const dx = px - cx;
    const dy = py - cy;
    const distToCenter = Math.hypot(dx, dy);
    const mouseAngle = Math.atan2(dy, dx);

    ctx.save();

    // 1. Draw Wavefront Ripples
    for (const r of this.ripples) {
      const progress = r.elapsedMs / r.durationMs;
      const alpha = Math.max(0, 0.75 * (1 - progress));
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 0, 0, ${alpha.toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 2. Draw Magnetic Radial Needle Spines with Gaussian Parting Cleft
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#000000';

    const omegaMax = 0.42; // Max parting deflection in radians (~24 deg)
    const sigmaTheta = 0.55; // Spread of Gaussian envelope (~31.5 deg)

    for (let i = 0; i < this.spineCount; i++) {
      const baseAngle = this.spineAngles[i];
      let angle = baseAngle;
      let len = this.spineLengths[i];

      // Angular difference to cursor [-PI, PI]
      let angleDiff = angle - mouseAngle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      // Magnetic attraction calculations
      const influenceRadius = 420;
      if (distToCenter < influenceRadius) {
        const proximity = 1 - (distToCenter / influenceRadius);
        const angularWeight = Math.exp(-(angleDiff * angleDiff) / 0.85);

        // Gaussian parting deflection envelope
        const gaussianDeflection =
          Math.sign(angleDiff) * omegaMax * Math.exp(-(angleDiff * angleDiff) / (2 * sigmaTheta * sigmaTheta));

        const deflection = -angleDiff * proximity * angularWeight * 0.42 + (gaussianDeflection * this.partingProgress * 0.5);

        angle += deflection;
        // Stretch spine towards cursor
        len += proximity * angularWeight * 38;
      }

      // Dynamic parting effect when hovering center
      if (this.partingProgress > 0.01) {
        const partedOffset = this.reducedMotion ? 0 : Math.sin(this.pulsePhase + i * 0.2) * 5;
        len += this.partingProgress * (24 + partedOffset);
      }

      // Root point on singularity core perimeter (sub-pixel crispness)
      const currentRadius = this.baseRadius + (this.partingProgress * 36);
      const rootX = cx + Math.cos(angle) * currentRadius;
      const rootY = cy + Math.sin(angle) * currentRadius;

      // Tip point
      const tipX = cx + Math.cos(angle) * (currentRadius + len);
      const tipY = cy + Math.sin(angle) * (currentRadius + len);

      // Spine tapered line
      ctx.beginPath();
      ctx.moveTo(Math.round(rootX) + 0.5, Math.round(rootY) + 0.5);
      ctx.lineTo(Math.round(tipX) + 0.5, Math.round(tipY) + 0.5);
      ctx.stroke();

      // Subtle needle tip micro-bead
      ctx.fillStyle = '#000000';
      ctx.fillRect(Math.round(tipX) - 0.5, Math.round(tipY) - 0.5, 1.5, 1.5);
    }

    // 3. Draw Pitch-Black Singularity Core
    const pulseOffset = this.reducedMotion ? 0 : Math.sin(this.pulsePhase) * 1.5;
    const coreR = this.baseRadius + pulseOffset;

    // Hairline outer event horizon
    ctx.beginPath();
    ctx.arc(cx, cy, coreR + 10 + (this.partingProgress * 18), 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Solid core body
    ctx.beginPath();
    ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
    ctx.fillStyle = '#000000';
    ctx.fill();

    // 4. Central Telemetry / Core Void Center
    if (this.partingProgress > 0.1) {
      ctx.beginPath();
      ctx.arc(cx, cy, 18 * this.partingProgress, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Core glyph
      ctx.fillStyle = '#000000';
      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ENG', cx, cy);
    }

    // 5. Render 7 Pillar Gateways
    if (this.partingProgress > 0.25) {
      const alpha = Math.min(1, (this.partingProgress - 0.25) / 0.75);
      ctx.globalAlpha = alpha;

      for (const gw of this.gateways) {
        this.drawGatewayNode(ctx, gw, cx, cy);
      }
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  private drawGatewayNode(
    ctx: CanvasRenderingContext2D,
    gw: PillarGateway,
    _cx: number,
    _cy: number
  ): void {
    ctx.save();

    // Connecting filament to center
    ctx.beginPath();
    ctx.moveTo(_cx, _cy);
    ctx.lineTo(gw.x, gw.y);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Node body
    ctx.beginPath();
    ctx.arc(gw.x, gw.y, gw.radius, 0, Math.PI * 2);

    if (gw.hovered) {
      // Inverted highlight
      ctx.fillStyle = '#000000';
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Outer focus ring
      ctx.beginPath();
      ctx.arc(gw.x, gw.y, gw.radius + 6, 0, Math.PI * 2);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Text inverted to white
      ctx.fillStyle = '#ffffff';
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Text is black
      ctx.fillStyle = '#000000';
    }

    // Text: Pillar Label
    ctx.font = '700 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(gw.label, gw.x, gw.y - 3);

    // Subtext: Code
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillText(gw.code, gw.x, gw.y + 9);

    ctx.restore();
  }

  public handleClick(x: number, y: number): boolean {
    if (this.partingProgress < 0.25) return false;

    for (const gw of this.gateways) {
      const dist = Math.hypot(x - gw.x, y - gw.y);
      if (dist <= gw.hitRadius) {
        AudioSynthesizer.play('void-open');
        if (this.onPillarClick) {
          this.onPillarClick(gw.id);
        }
        return true;
      }
    }
    return false;
  }

  public getHoveredPillar(): PillarId | null {
    return this.hoveredPillar;
  }
}

function gwRadiusEased(progress: number, maxRadius: number): number {
  const p = Math.max(0, Math.min(1, progress));
  // Ease-out cubic
  const ease = 1 - Math.pow(1 - p, 3);
  return 28 + ease * (maxRadius - 28);
}
