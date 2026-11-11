import { AudioSynthesizer } from '../core/audio-synthesizer';
import { AcousticHaptics } from '../core/acoustic-haptics';
import { t } from '../core/i18n';

const COMPASS_ROUTES: [string, string, string, string][] = [
  ['singularity', '00', 'nav.singularity', 'CORE'],
  ['read', '01', 'dossier.reading', 'READ'],
  ['write', '02', 'dossier.writing', 'WRITE'],
  ['listen', '03', 'dossier.listening', 'LISTEN'],
  ['speak', '04', 'dossier.speaking', 'SPEAK'],
  ['vocab', '05', 'dossier.vocab', 'VOCAB'],
  ['colloc', '06', 'dossier.collocations', 'COLLOC'],
  ['grammar', '07', 'dossier.grammar', 'GRAMMAR'],
  ['tenses', '08', 'dossier.twelve_tenses', 'TENSES'],
  ['habits', '09', 'nav.habits', 'HABITS'],
  ['drills', '10', 'nav.drills', 'DRILLS']
];

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
      <div class="compass-backdrop"></div>
      <div class="compass-radial-menu" inert>
        <div class="compass-mobile-header">
          <div class="telemetry-label" style="color: var(--accent-gold); display: flex; align-items: center; gap: 6px; font-weight: 700;">
            🧭 ${t('compass.quick_nav_title', undefined, '7-PILLAR QUICK NAVIGATION')}
          </div>
          <button type="button" class="compass-btn-close btn-modal-close" aria-label="${t('common.close', undefined, 'Close')}">✕</button>
        </div>
        <div class="compass-menu-items-grid">
          ${COMPASS_ROUTES.map(([route, code, key, def], idx) => `
            <button class="compass-menu-item${idx === 0 ? ' item-hero' : ''}" data-route="${route}" title="${t(`compass.${route}_title`, undefined, def)}">
              <span class="compass-item-code">${code}</span>
              <span class="compass-item-label">${t(key, undefined, def)}</span>
            </button>
          `).join('')}
        </div>
      </div>
      <div class="compass-trigger" title="${t('compass.toggle_nav', undefined, 'Toggle HUD Quick-Nav')}">
        <canvas class="compass-canvas" width="60" height="60"></canvas>
      </div>
    `;

    this.canvas = this.element.querySelector('.compass-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;

    this.applySafePositioning();
    this.bindEvents();
    this.bindTouchInteractions();
    this.bindActivityListeners();
    this.startMiniUrchinLoop();
  }

  private applySafePositioning(): void {
    // Elevate above iOS Home Indicator and dynamic gesture areas with safe-area fallback
    this.element.style.position = 'fixed';
    this.element.style.bottom = 'max(24px, calc(env(safe-area-inset-bottom, 0px) + 16px))';
    this.element.style.right = 'max(var(--pad-screen-right, 12px), calc(env(safe-area-inset-right, 0px) + 16px))';
    this.element.style.zIndex = 'var(--z-modal-lens, 90)';
    this.element.style.userSelect = 'none';
    (this.element.style as any).webkitUserSelect = 'none';
    this.element.style.touchAction = 'manipulation';
  }

  private bindTouchInteractions(): void {
    const trigger = this.element.querySelector('.compass-trigger') as HTMLElement | null;
    if (trigger) {
      trigger.setAttribute('role', 'button');
      trigger.setAttribute('aria-label', 'Toggle 7-Pillar Radial Quick Navigation');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-haspopup', 'true');
      trigger.setAttribute('tabindex', '0');

      // 44x44px+ touch hitbox acquisition with tactile touch feedback
      trigger.addEventListener('touchstart', (e: TouchEvent) => {
        e.stopPropagation();
        this.element.classList.add('compass-active-touch');
        trigger.classList.add('trigger-touched');
      }, { passive: true });

      trigger.addEventListener('touchend', (e: TouchEvent) => {
        e.stopPropagation();
        this.element.classList.remove('compass-active-touch');
        trigger.classList.remove('trigger-touched');
      }, { passive: true });
    }

    const items = this.element.querySelectorAll('.compass-menu-item');
    items.forEach(item => {
      item.addEventListener('touchstart', () => {
        item.classList.add('compass-item-touched');
      }, { passive: true });

      item.addEventListener('touchend', () => {
        item.classList.remove('compass-item-touched');
      }, { passive: true });
    });
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public openMenu(): void {
    const trigger = this.element.querySelector('.compass-trigger') as HTMLElement | null;
    const menu = this.element.querySelector('.compass-radial-menu') as HTMLElement;
    this.isMenuOpen = true;
    this.element.classList.add('compass-active');
    trigger?.setAttribute('aria-expanded', 'true');
    menu?.classList.add('menu-open');
    if (menu) (menu as any).inert = false;
  }

  public closeMenu(): void {
    const trigger = this.element.querySelector('.compass-trigger') as HTMLElement | null;
    const menu = this.element.querySelector('.compass-radial-menu') as HTMLElement;
    this.isMenuOpen = false;
    this.element.classList.remove('compass-active');
    trigger?.setAttribute('aria-expanded', 'false');
    menu?.classList.remove('menu-open');
    if (menu) (menu as any).inert = true;
  }

  private bindEvents(): void {
    const trigger = this.element.querySelector('.compass-trigger') as HTMLElement | null;
    const menu = this.element.querySelector('.compass-radial-menu') as HTMLElement;

    const toggleMenu = (e: Event) => {
      e.stopPropagation();
      this.isMenuOpen = !this.isMenuOpen;
      trigger?.setAttribute('aria-expanded', String(this.isMenuOpen));
      AcousticHaptics.tap();
      AudioSynthesizer.play('click');
      if (this.isMenuOpen) {
        this.element.classList.add('compass-active');
        menu.classList.add('menu-open'); (menu as HTMLElement).inert = false;
      } else {
        this.element.classList.remove('compass-active');
        menu.classList.remove('menu-open'); (menu as HTMLElement).inert = true;
      }
    };

    trigger?.addEventListener('click', toggleMenu);
    trigger?.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMenu(e);
      }
    });

    const items = this.element.querySelectorAll('.compass-menu-item');
    items.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const route = (item as HTMLElement).dataset.route || 'singularity';
        AcousticHaptics.tap();
        AudioSynthesizer.play('void-open');
        this.isMenuOpen = false;
        trigger?.setAttribute('aria-expanded', 'false');
        menu.classList.remove('menu-open'); (menu as HTMLElement).inert = true;

        if (this.onNavigate) {
          this.onNavigate(route);
        }
      });
    });

    // Close menu when clicking backdrop or close button
    this.element.querySelector('.compass-backdrop')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeMenu();
    });
    this.element.querySelector('.compass-btn-close')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeMenu();
    });

    // Close menu when clicking outside
    window.addEventListener('click', () => {
      if (this.isMenuOpen) {
        this.isMenuOpen = false;
        trigger?.setAttribute('aria-expanded', 'false');
        menu.classList.remove('menu-open'); (menu as HTMLElement).inert = true;
      }
    });
  }

  private animId: number | null = null;
  private motionObserver: MutationObserver | null = null;
  private isVisibleState: boolean = true;
  private lastActiveTime: number = typeof Date !== 'undefined' ? Date.now() : 0;
  private userActiveBound: boolean = false;

  private bindActivityListeners(): void {
    if (this.userActiveBound || typeof window === 'undefined') return;
    this.userActiveBound = true;
    const onActive = () => {
      this.lastActiveTime = Date.now();
      if (this.isVisibleState && this.animId === null && !this.isReducedMotion()) {
        this.startMiniUrchinLoop();
      }
    };
    ['pointermove', 'touchstart', 'keydown', 'wheel'].forEach(evt => {
      window.addEventListener(evt, onActive, { passive: true });
    });
    this.element.addEventListener('pointerenter', onActive, { passive: true });
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          if (this.animId !== null) {
            cancelAnimationFrame(this.animId);
            this.animId = null;
          }
        } else if (this.isVisibleState && !this.isReducedMotion()) {
          onActive();
        }
      });
    }
  }

  public isReducedMotion(): boolean {
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
      if (this.animId !== null) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }
      this.drawMiniUrchin();
    } else {
      if (this.animId === null) {
        this.startMiniUrchinLoop();
      }
    }
  }

  private startMiniUrchinLoop(): void {
    this.setupMotionObserver();
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.isReducedMotion()) {
      // Zero-cycle suspension: draw single static frame and do not schedule requestAnimationFrame
      this.drawMiniUrchin();
      return;
    }

    const loop = () => {
      if (this.isReducedMotion()) {
        this.animId = null;
        this.drawMiniUrchin();
        return;
      }
      if (typeof document !== 'undefined' && document.hidden) {
        this.animId = null;
        return;
      }
      if (!this.isMenuOpen && Date.now() - this.lastActiveTime > 3500) {
        // Zero-CPU idle suspension: pause spinning when user is idle
        this.animId = null;
        return;
      }
      this.angleOffset += 0.02;
      this.drawMiniUrchin();
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  private drawMiniUrchin(): void {
    const ctx = this.ctx;
    const cx = 30;
    const cy = 30;
    const rCore = 8;
    const spineCount = 24;

    ctx.clearRect(0, 0, 60, 60);

    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const goldColor = isDark ? '#a5b4fc' : '#5b5bd6';
    const coreColor = isDark ? '#c4b5fd' : '#111111';
    const centerColor = isDark ? '#080a0f' : '#ffffff';

    // Needle Spines
    ctx.strokeStyle = goldColor;
    ctx.lineWidth = 1.2;

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

    // Outer subtle halo
    ctx.beginPath();
    ctx.arc(cx, cy, rCore + 3, 0, Math.PI * 2);
    ctx.strokeStyle = isDark ? 'rgba(165, 180, 252, 0.35)' : 'rgba(91, 91, 214, 0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Core
    ctx.beginPath();
    ctx.arc(cx, cy, rCore, 0, Math.PI * 2);
    ctx.fillStyle = coreColor;
    ctx.fill();

    // Center micro dot
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fillStyle = centerColor;
    ctx.fill();
  }

  public setVisible(visible: boolean): void {
    this.isVisibleState = visible;
    this.element.style.display = visible ? 'block' : 'none';
    if (!visible) {
      if (this.animId !== null) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }
    } else {
      this.lastActiveTime = Date.now();
      this.bindActivityListeners();
      if (!this.isReducedMotion() && this.animId === null) {
        this.startMiniUrchinLoop();
      } else if (this.isReducedMotion()) {
        this.drawMiniUrchin();
      }
    }
  }

  public destroy(): void {
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    this.motionObserver?.disconnect();
    this.motionObserver = null;
  }
}
