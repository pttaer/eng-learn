import { AudioSynthesizer } from './audio-synthesizer';

export type PillarId = 'singularity' | 'read' | 'write' | 'listen' | 'speak' | 'vocab' | 'colloc';

export interface PillarGateway {
  id: PillarId;
  label: string;
  code: string;
  angle: number; // in radians
  distance: number;
  x: number;
  y: number;
  radius: number;
  hovered: boolean;
}

export class SeaUrchin {
  private spineCount: number = 96;
  private baseRadius: number = 38;
  private spineLengths: number[] = [];
  private spineAngles: number[] = [];
  private partingProgress: number = 0; // 0 (closed) to 1 (fully parted)
  private pulsePhase: number = 0;
  private gateways: PillarGateway[] = [];
  private hoveredPillar: PillarId | null = null;
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
      const variance = Math.sin(angle * 4) * 16 + Math.cos(angle * 7) * 12;
      this.spineLengths.push(85 + variance);
    }
  }

  private initGateways(): void {
    this.gateways = [
      { id: 'read', label: 'READ', code: '01', angle: -Math.PI / 2, distance: 88, x: 0, y: 0, radius: 22, hovered: false },
      { id: 'write', label: 'WRITE', code: '02', angle: -Math.PI / 6, distance: 88, x: 0, y: 0, radius: 22, hovered: false },
      { id: 'listen', label: 'LISTEN', code: '03', angle: Math.PI / 6, distance: 88, x: 0, y: 0, radius: 22, hovered: false },
      { id: 'speak', label: 'SPEAK', code: '04', angle: Math.PI / 2, distance: 88, x: 0, y: 0, radius: 22, hovered: false },
      { id: 'vocab', label: 'VOCAB', code: '05', angle: (5 * Math.PI) / 6, distance: 88, x: 0, y: 0, radius: 22, hovered: false },
      { id: 'colloc', label: 'COLLOC', code: '06', angle: -(5 * Math.PI) / 6, distance: 88, x: 0, y: 0, radius: 22, hovered: false },
    ];
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

    // Direct hover triggers spines parting
    const isDirectHover = distToCenter < 100;
    const targetParting = isDirectHover ? 1.0 : 0.0;
    this.partingProgress += (targetParting - this.partingProgress) * 0.12;

    // Update pillar positions and hover states
    this.hoveredPillar = null;
    for (const gw of this.gateways) {
      gw.x = cx + Math.cos(gw.angle) * (gw.distance * this.partingProgress);
      gw.y = cy + Math.sin(gw.angle) * (gw.distance * this.partingProgress);

      if (this.partingProgress > 0.4) {
        const gwDist = Math.hypot(mouseX - gw.x, mouseY - gw.y);
        const wasHovered = gw.hovered;
        gw.hovered = gwDist <= gw.radius;
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
      const influenceRadius = 380;
      if (distToCenter < influenceRadius) {
        const proximity = 1 - (distToCenter / influenceRadius);
        const angularWeight = Math.exp(-(angleDiff * angleDiff) / 0.85);
        const deflection = -angleDiff * proximity * angularWeight * 0.42;

        angle += deflection;
        // Stretch spine towards cursor
        len += proximity * angularWeight * 36;
      }

      // Dynamic parting effect when hovering center
      if (this.partingProgress > 0.01) {
        const partedOffset = Math.sin(this.pulsePhase + i * 0.2) * 4;
        len += this.partingProgress * (20 + partedOffset);
      }

      // Root point on singularity core perimeter
      const currentRadius = this.baseRadius + (this.partingProgress * 30);
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
    ctx.arc(cx, cy, coreR + 8 + (this.partingProgress * 15), 0, Math.PI * 2);
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
      ctx.arc(cx, cy, 14 * this.partingProgress, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Core glyph
      ctx.fillStyle = '#000000';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ENG', cx, cy);
    }

    // 4. Render 4 Pillar Gateways
    if (this.partingProgress > 0.3) {
      const alpha = Math.min(1, (this.partingProgress - 0.3) / 0.7);
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
      ctx.lineWidth = 1;
      ctx.stroke();

      // Text inverted to white
      ctx.fillStyle = '#ffffff';
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Text is black
      ctx.fillStyle = '#000000';
    }

    // Text: Pillar Label
    ctx.font = '700 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(gw.label, gw.x, gw.y - 3);

    // Subtext: Code
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.fillText(gw.code, gw.x, gw.y + 8);

    ctx.restore();
  }

  public handleClick(x: number, y: number): boolean {
    if (this.partingProgress < 0.3) return false;

    for (const gw of this.gateways) {
      const dist = Math.hypot(x - gw.x, y - gw.y);
      if (dist <= gw.radius) {
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
