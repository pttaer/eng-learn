import { AudioSynthesizer } from './audio-synthesizer';

export type PillarId = 'singularity' | 'read' | 'write' | 'listen' | 'speak' | 'vocab' | 'colloc' | 'grammar';

export interface PillarGateway {
  id: PillarId;
  label: string;
  code: string;
  angle: number; // in radians
  distance: number;
  x: number;
  y: number;
  radius: number;
  hitRadius: number;
  hovered: boolean;
}

export class SeaUrchin {
  private spineCount: number = 96;
  private baseRadius: number = 46; // Scaled up from 38px
  private spineLengths: number[] = [];
  private spineAngles: number[] = [];
  private partingProgress: number = 0; // 0 (closed) to 1 (fully parted)
  private pulsePhase: number = 0;
  private gateways: PillarGateway[] = [];
  private hoveredPillar: PillarId | null = null;
  private closeGraceCounter: number = 0; // Hysteresis grace counter in frames
  public onPillarClick?: (pillar: PillarId) => void;

  constructor() {
    this.initSpines();
    this.initGateways();
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
    const visualRadius = 28; // Scaled node radius (from 22px)
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

    this.gateways = specs.map((spec, i) => ({
      id: spec.id,
      label: spec.label,
      code: spec.code,
      angle: baseAngle + (i * step),
      distance: dist,
      x: 0,
      y: 0,
      radius: visualRadius,
      hitRadius,
      hovered: false
    }));
  }

  public update(
    cx: number,
    cy: number,
    mouseX: number,
    mouseY: number
  ): void {
    this.pulsePhase += 0.035;

    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const distToCenter = Math.hypot(dx, dy);

    // Update coordinates of all gateways based on current partingProgress
    for (const gw of this.gateways) {
      gw.x = cx + Math.cos(gw.angle) * (gw.distance * this.partingProgress);
      gw.y = cy + Math.sin(gw.angle) * (gw.distance * this.partingProgress);
    }

    // Check if mouse is near any gateway node
    let isNearAnyGateway = false;
    if (this.partingProgress > 0.2) {
      for (const gw of this.gateways) {
        const d = Math.hypot(mouseX - gw.x, mouseY - gw.y);
        if (d <= gw.hitRadius + 16) {
          isNearAnyGateway = true;
          break;
        }
      }
    }

    // Concentric Hysteresis & Keep-Alive Envelope:
    // 1. OPEN_TRIGGER_RADIUS = 120: mouse hovering near center initiates parting.
    // 2. KEEP_ALIVE_ENVELOPE = 220: once open, stays open anywhere within 220px radius.
    // 3. isNearAnyGateway: stays open if cursor is hovering or traversing near any pillar node.
    const OPEN_TRIGGER_RADIUS = 120;
    const KEEP_ALIVE_ENVELOPE = 220;

    const shouldStayOpen = (this.partingProgress > 0.15 && distToCenter < KEEP_ALIVE_ENVELOPE)
      || (distToCenter < OPEN_TRIGGER_RADIUS)
      || isNearAnyGateway;

    if (shouldStayOpen) {
      this.closeGraceCounter = 16; // ~260ms grace period at 60fps
      this.partingProgress += (1.0 - this.partingProgress) * 0.14;
    } else {
      if (this.closeGraceCounter > 0) {
        this.closeGraceCounter--;
      } else {
        // Gentle, damped closing decay to prevent abrupt snap
        this.partingProgress += (0.0 - this.partingProgress) * 0.05;
      }
    }

    // Evaluate individual pillar hover states
    this.hoveredPillar = null;
    for (const gw of this.gateways) {
      if (this.partingProgress > 0.35) {
        const gwDist = Math.hypot(mouseX - gw.x, mouseY - gw.y);
        const wasHovered = gw.hovered;
        gw.hovered = gwDist <= gw.hitRadius;
        if (gw.hovered) {
          this.hoveredPillar = gw.id;
          if (!wasHovered) {
            AudioSynthesizer.play('click');
          }
        }
      } else {
        gw.hovered = false;
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
    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const distToCenter = Math.hypot(dx, dy);
    const mouseAngle = Math.atan2(dy, dx);

    ctx.save();

    // 1. Draw Magnetic Radial Needle Spines
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#000000';

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
        const deflection = -angleDiff * proximity * angularWeight * 0.42;

        angle += deflection;
        // Stretch spine towards cursor
        len += proximity * angularWeight * 38;
      }

      // Dynamic parting effect when hovering center
      if (this.partingProgress > 0.01) {
        const partedOffset = Math.sin(this.pulsePhase + i * 0.2) * 5;
        len += this.partingProgress * (24 + partedOffset);
      }

      // Root point on singularity core perimeter
      const currentRadius = this.baseRadius + (this.partingProgress * 36);
      const rootX = cx + Math.cos(angle) * currentRadius;
      const rootY = cy + Math.sin(angle) * currentRadius;

      // Tip point
      const tipX = cx + Math.cos(angle) * (currentRadius + len);
      const tipY = cy + Math.sin(angle) * (currentRadius + len);

      // Spine tapered line
      ctx.beginPath();
      ctx.moveTo(rootX, rootY);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();

      // Subtle needle tip micro-bead
      ctx.fillStyle = '#000000';
      ctx.fillRect(tipX - 0.75, tipY - 0.75, 1.5, 1.5);
    }

    // 2. Draw Pitch-Black Singularity Core
    const pulseOffset = Math.sin(this.pulsePhase) * 1.5;
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

    // 3. Central Telemetry / Core Void Center
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

    // 4. Render 7 Pillar Gateways
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
