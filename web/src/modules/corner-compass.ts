import { AudioSynthesizer } from '../core/audio-synthesizer';

export class CornerCompass {
  private element: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isMenuOpen: boolean = false;
  private angleOffset: number = 0;
  public onNavigate?: (route: string) => void;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'corner-compass-container interactive';

    this.element.innerHTML = `
      <div class="compass-radial-menu">
        <button class="compass-menu-item" data-route="singularity" title="Return to Urchin Singularity">
          <span class="compass-item-code">00</span>
          <span class="compass-item-label">CORE</span>
        </button>
        <button class="compass-menu-item" data-route="read" title="Intensive Reading & Sentence Mining">
          <span class="compass-item-code">01</span>
          <span class="compass-item-label">READ</span>
        </button>
        <button class="compass-menu-item" data-route="write" title="Franklin Copywork">
          <span class="compass-item-code">02</span>
          <span class="compass-item-label">WRITE</span>
        </button>
        <button class="compass-menu-item" data-route="listen" title="Active Transcription">
          <span class="compass-item-code">03</span>
          <span class="compass-item-label">LISTEN</span>
        </button>
        <button class="compass-menu-item" data-route="speak" title="4-3-2 Fluency Drill">
          <span class="compass-item-code">04</span>
          <span class="compass-item-label">SPEAK</span>
        </button>
        <button class="compass-menu-item" data-route="vocab" title="Roguelike Vocabulary Engine">
          <span class="compass-item-code">05</span>
          <span class="compass-item-label">VOCAB</span>
        </button>
        <button class="compass-menu-item" data-route="colloc" title="1,000 Collocations Vault">
          <span class="compass-item-code">06</span>
          <span class="compass-item-label">COLLOC</span>
        </button>
        <button class="compass-menu-item" data-route="habits" title="30-Day Mission Log">
          <span class="compass-item-code">07</span>
          <span class="compass-item-label">HABITS</span>
        </button>
      </div>
      <div class="compass-trigger" title="Toggle HUD Quick-Nav">
        <canvas class="compass-canvas" width="60" height="60"></canvas>
      </div>
    `;

    this.canvas = this.element.querySelector('.compass-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;

    this.bindEvents();
    this.startMiniUrchinLoop();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  private bindEvents(): void {
    const trigger = this.element.querySelector('.compass-trigger');
    const menu = this.element.querySelector('.compass-radial-menu') as HTMLElement;

    trigger?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.isMenuOpen = !this.isMenuOpen;
      AudioSynthesizer.play('click');
      if (this.isMenuOpen) {
        menu.classList.add('menu-open');
      } else {
        menu.classList.remove('menu-open');
      }
    });

    const items = this.element.querySelectorAll('.compass-menu-item');
    items.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const route = (item as HTMLElement).dataset.route || 'singularity';
        AudioSynthesizer.play('void-open');
        this.isMenuOpen = false;
        menu.classList.remove('menu-open');

        if (this.onNavigate) {
          this.onNavigate(route);
        }
      });
    });

    // Close menu when clicking outside
    window.addEventListener('click', () => {
      if (this.isMenuOpen) {
        this.isMenuOpen = false;
        menu.classList.remove('menu-open');
      }
    });
  }

  private startMiniUrchinLoop(): void {
    const loop = () => {
      this.angleOffset += 0.02;
      this.drawMiniUrchin();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  private drawMiniUrchin(): void {
    const ctx = this.ctx;
    const cx = 30;
    const cy = 30;
    const rCore = 8;
    const spineCount = 24;

    ctx.clearRect(0, 0, 60, 60);

    // Needle Spines
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;

    for (let i = 0; i < spineCount; i++) {
      const angle = (i / spineCount) * Math.PI * 2 + this.angleOffset;
      const len = 12 + Math.sin(angle * 3 + this.angleOffset * 2) * 4;

      const x1 = cx + Math.cos(angle) * rCore;
      const y1 = cy + Math.sin(angle) * rCore;
      const x2 = cx + Math.cos(angle) * (rCore + len);
      const y2 = cy + Math.sin(angle) * (rCore + len);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Core
    ctx.beginPath();
    ctx.arc(cx, cy, rCore, 0, Math.PI * 2);
    ctx.fillStyle = '#000000';
    ctx.fill();

    // Center micro dot
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }

  public setVisible(visible: boolean): void {
    this.element.style.display = visible ? 'block' : 'none';
  }
}
