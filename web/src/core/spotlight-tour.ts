import { AudioSynthesizer } from './audio-synthesizer';
import { ParticleCanvas } from './particle-canvas';

export interface TourStep {
  target: string;
  fallbackTarget?: string;
  title: string;
  desc: string;
  badge?: string;
  route?: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    target: '.hud-telemetry-cluster',
    fallbackTarget: '.app-header',
    title: 'Neural Engram Telemetry',
    desc: 'Track your daily study streak, overall C2 Summit completion percentage, and active SM-2 retention rate across all 1,000 collocations and grammar rules.',
    badge: 'STEP 1 OF 6 // DIRECTIVE HUD',
    route: 'tree'
  },
  {
    target: '.workout-banner',
    fallbackTarget: '#workout-banner',
    title: "★ Today's 15-Minute Workout",
    desc: 'Your mandatory daily tripartite cognitive workout: 10 Spaced Collocations, 1 Benjamin Franklin MEAL Copywork, and 1 Nation 4-3-2 Speaking take.',
    badge: 'STEP 2 OF 6 // ROUTINE',
    route: 'tree'
  },
  {
    target: '.constellation-container',
    fallbackTarget: '#constellation-svg',
    title: '🌌 Prerequisite Constellation Matrix',
    desc: 'Navigate 25 engram nodes spanning 5 levels of linguistic sophistication. Master foundational tier 1 perks to illuminate pathways toward the C2 Summit.',
    badge: 'STEP 3 OF 6 // SKILL TREE',
    route: 'tree'
  },
  {
    target: '.constellation-node[data-node-id="voc-1"]',
    fallbackTarget: '.constellation-node',
    title: '★ Perk Engram & Gated Criteria',
    desc: 'Click any star node to inspect syllabus objectives, required prerequisite skills, and retention metrics before launching targeted drills.',
    badge: 'STEP 4 OF 6 // ENGRAM PERK',
    route: 'tree'
  },
  {
    target: '.branches-summary-grid',
    fallbackTarget: '.constellation-footer-grid',
    title: '🏛 The 5 Mastery Disciplines',
    desc: 'Syntactic Architecture, Lexical Precision, Rhetoric & Copywork, Prosody Fluency, and Epistemic Deconstruction. Click any pillar to jump directly into its dedicated studio.',
    badge: 'STEP 5 OF 6 // DISCIPLINES',
    route: 'tree'
  },
  {
    target: '.hud-actions',
    fallbackTarget: '.header-actions',
    title: 'Sensory Settings & Backup Sync',
    desc: 'Toggle Pythagorean Just-Intonation procedural soundscapes, export your JSON progress backup, or restore across multiple desktop and mobile devices.',
    badge: 'STEP 6 OF 6 // SYSTEM',
    route: 'tree'
  }
];

export const ONBOARDING_TOUR_STEPS = TOUR_STEPS;

export class SpotlightTour {
  private static overlay: HTMLElement | null = null;
  private static spotlight: HTMLElement | null = null;
  private static arrow: HTMLElement | null = null;
  private static card: HTMLElement | null = null;
  private static currentStepIndex = 0;
  private static active = false;
  private static steps: TourStep[] = ONBOARDING_TOUR_STEPS;
  private static boundKeyHandler: ((e: KeyboardEvent) => void) | null = null;
  private static boundResizeHandler: (() => void) | null = null;
  private static boundScrollHandler: (() => void) | null = null;
  private static scrollDebounceTimer: any = null;

  public static readonly STORAGE_KEY = 'eng_onboarding_completed';

  public static isCompleted(): boolean {
    if (typeof localStorage === 'undefined') return false;
    try {
      return localStorage.getItem(this.STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  }

  public static setCompleted(completed = true): void {
    if (typeof localStorage === 'undefined') return;
    try {
      if (completed) {
        localStorage.setItem(this.STORAGE_KEY, 'true');
      } else {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    } catch {}
  }

  public static isOpen(): boolean {
    return this.active;
  }

  public static getCurrentStepIndex(): number {
    return this.currentStepIndex;
  }

  public static getSteps(): TourStep[] {
    return this.steps;
  }

  public static initDOM(): void {
    if (typeof document === 'undefined') return;
    if (this.overlay) return;

    let overlay = document.getElementById('tourOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'tourOverlay';
      overlay.className = 'tour-overlay';
      overlay.innerHTML = `
        <div class="tour-spotlight" id="tourSpotlight"></div>
        <div class="tour-arrow" id="tourArrow">←</div>
        <div class="tour-card" id="tourCard">
          <div class="tour-card-header">
            <span class="tour-step-badge" id="tourStepBadge">Step 1 of 6</span>
            <button class="tour-card-close" id="tourCloseBtn" aria-label="Close Spotlight Tour (Esc)" title="Close (Esc)">✕</button>
          </div>
          <div class="tour-card-title" id="tourTitle">Tour Title</div>
          <p class="tour-card-desc" id="tourDesc">Tour description text</p>
          <div class="tour-card-footer">
            <div class="tour-progress-hud">
              <div class="tour-mini-track">
                <div class="tour-mini-bar" id="tourMiniBar" style="width: 16.6%;"></div>
              </div>
              <span class="tour-step-count" id="tourStepCount">1 / 6</span>
            </div>
            <div style="display:flex;gap:6px;">
              <button class="ctrl" id="tourPrevBtn">← Previous</button>
              <button class="ctrl" id="tourSkipBtn">Skip</button>
              <button class="ctrl ctrl-primary" id="tourNextBtn">Next →</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
    }

    this.overlay = overlay;
    this.spotlight = overlay.querySelector('#tourSpotlight');
    this.arrow = overlay.querySelector('#tourArrow');
    this.card = overlay.querySelector('#tourCard');

    // Event listeners on UI buttons
    const closeBtn = overlay.querySelector('#tourCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());

    const skipBtn = overlay.querySelector('#tourSkipBtn');
    if (skipBtn) skipBtn.addEventListener('click', () => this.close());

    const prevBtn = overlay.querySelector('#tourPrevBtn');
    if (prevBtn) prevBtn.addEventListener('click', () => this.prev());

    const nextBtn = overlay.querySelector('#tourNextBtn');
    if (nextBtn) nextBtn.addEventListener('click', () => this.next());

    // Advance on spotlight or arrow click
    if (this.spotlight) this.spotlight.addEventListener('click', () => this.next());
    if (this.arrow) this.arrow.addEventListener('click', () => this.next());
  }

  public static start(force = false): void {
    if (typeof window === 'undefined') return;
    if (this.active) return;
    if (!force && this.isCompleted()) return;

    this.initDOM();
    if (!this.overlay) return;

    // Navigate to constellation tree route if needed
    if (window.location.hash !== '#tree' && window.location.hash !== '') {
      window.location.hash = '#tree';
    }

    this.currentStepIndex = 0;
    this.active = true;
    this.overlay.classList.add('open');

    // Attach keyboard listener
    this.boundKeyHandler = (e: KeyboardEvent) => this.handleKeyDown(e);
    window.addEventListener('keydown', this.boundKeyHandler);

    // Attach resize & scroll listeners
    this.boundResizeHandler = () => this.updateLayout();
    this.boundScrollHandler = () => {
      if (!this.active) return;
      document.body.classList.add('tour-scrolling');
      this.updateLayout();
      if (this.scrollDebounceTimer) clearTimeout(this.scrollDebounceTimer);
      this.scrollDebounceTimer = setTimeout(() => {
        document.body.classList.remove('tour-scrolling');
      }, 150);
    };
    window.addEventListener('resize', this.boundResizeHandler, { passive: true });
    window.addEventListener('scroll', this.boundScrollHandler, { passive: true, capture: true });

    AudioSynthesizer.play('tour-step');
    this.renderCurrentStep();
  }

  public static next(): void {
    if (!this.active) return;
    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
      AudioSynthesizer.play('tour-step');
      this.renderCurrentStep();
    } else {
      this.finish();
    }
  }

  public static prev(): void {
    if (!this.active) return;
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      AudioSynthesizer.play('click');
      this.renderCurrentStep();
    }
  }

  public static finish(): void {
    this.setCompleted(true);
    AudioSynthesizer.play('tour-fanfare');

    // Trigger celebratory particle burst
    const cardRect = this.card?.getBoundingClientRect();
    const burstX = cardRect ? cardRect.left + cardRect.width / 2 : window.innerWidth / 2;
    const burstY = cardRect ? cardRect.top + cardRect.height / 2 : window.innerHeight / 2;
    ParticleCanvas.burst(burstX, burstY, 80);

    // Also burst from screen center for extra grandeur
    setTimeout(() => {
      ParticleCanvas.burst(window.innerWidth / 2, window.innerHeight / 2, 60);
    }, 180);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('eng:tour-complete'));
    }

    this.close();
  }

  public static close(): void {
    if (!this.active) return;
    this.active = false;

    if (this.overlay) {
      this.overlay.classList.remove('open');
    }
    document.body.classList.remove('tour-scrolling');

    if (this.boundKeyHandler) {
      window.removeEventListener('keydown', this.boundKeyHandler);
      this.boundKeyHandler = null;
    }
    if (this.boundResizeHandler) {
      window.removeEventListener('resize', this.boundResizeHandler);
      this.boundResizeHandler = null;
    }
    if (this.boundScrollHandler) {
      window.removeEventListener('scroll', this.boundScrollHandler, true);
      this.boundScrollHandler = null;
    }
  }

  private static handleKeyDown(e: KeyboardEvent): void {
    if (!this.active) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      this.close();
    } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
      e.preventDefault();
      this.next();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.prev();
    }
  }

  private static getTargetElement(step: TourStep): HTMLElement | null {
    try {
      let el = document.querySelector(step.target) as HTMLElement | null;
      if (!el && step.fallbackTarget) {
        el = document.querySelector(step.fallbackTarget) as HTMLElement | null;
      }
      return el;
    } catch {
      return null;
    }
  }

  private static renderCurrentStep(): void {
    const step = this.steps[this.currentStepIndex];
    if (!step || !this.overlay) return;

    const totalSteps = this.steps.length;
    const stepNumber = this.currentStepIndex + 1;

    // Update Step Badge
    const badgeEl = this.overlay.querySelector('#tourStepBadge');
    if (badgeEl) {
      badgeEl.textContent = step.badge ? `${step.badge} • Step ${stepNumber}/${totalSteps}` : `Step ${stepNumber} of ${totalSteps}`;
    }

    // Update Title & Desc
    const titleEl = this.overlay.querySelector('#tourTitle');
    if (titleEl) titleEl.textContent = step.title;

    const descEl = this.overlay.querySelector('#tourDesc');
    if (descEl) descEl.textContent = step.desc;

    // Update Mini Progress Bar HUD
    const miniBar = this.overlay.querySelector('#tourMiniBar') as HTMLElement | null;
    if (miniBar) {
      const pct = (stepNumber / totalSteps) * 100;
      miniBar.style.width = `${pct}%`;
    }

    const stepCountEl = this.overlay.querySelector('#tourStepCount');
    if (stepCountEl) {
      stepCountEl.textContent = `${stepNumber} / ${totalSteps}`;
    }

    // Navigation buttons state
    const prevBtn = this.overlay.querySelector('#tourPrevBtn') as HTMLElement | null;
    if (prevBtn) {
      prevBtn.style.visibility = this.currentStepIndex === 0 ? 'hidden' : 'visible';
    }

    const nextBtn = this.overlay.querySelector('#tourNextBtn') as HTMLElement | null;
    if (nextBtn) {
      const isLast = this.currentStepIndex === totalSteps - 1;
      nextBtn.textContent = isLast ? 'Finish' : 'Next →';
    }

    // Position spotlight and arrow with animation frame
    requestAnimationFrame(() => {
      this.updateLayout();
    });
  }

  public static updateLayout(): void {
    if (!this.active || !this.overlay) return;
    const step = this.steps[this.currentStepIndex];
    if (!step) return;

    const targetEl = this.getTargetElement(step);
    this.updateSpotlightPosition(targetEl);
  }

  private static updateSpotlightPosition(targetEl: HTMLElement | null): void {
    const spotlight = this.spotlight;
    const arrow = this.arrow;
    const card = this.card;
    if (!spotlight || !arrow || !card) return;

    const pad = 6;
    const cardWidth = Math.min(390, window.innerWidth - 28);
    const cardRect = card.getBoundingClientRect();
    const cardHeight = cardRect.height > 60 ? cardRect.height : (card.offsetHeight || 220);
    const minTop = 14;
    const maxTop = Math.max(14, window.innerHeight - cardHeight - 16);

    let rect = targetEl ? targetEl.getBoundingClientRect() : null;

    // If target element is hidden, detached, or zero-sized: center card and hide spotlight
    if (!rect || rect.width === 0 || rect.height === 0) {
      spotlight.style.display = 'none';
      arrow.style.display = 'none';
      card.style.top = `${Math.min(maxTop, Math.max(minTop, (window.innerHeight - cardHeight) / 2))}px`;
      card.style.left = `${Math.max(14, Math.min(window.innerWidth - cardWidth - 14, (window.innerWidth - cardWidth) / 2))}px`;
      return;
    }

    spotlight.style.display = 'block';
    arrow.style.display = 'block';

    // Clamp spotlight dimensions so massive containers don't cover whole viewport
    const maxSpotlightH = Math.min(rect.height + pad * 2, Math.max(120, window.innerHeight - 80));
    const sTop = Math.max(2, Math.min(window.innerHeight - 60, rect.top - pad));
    const sLeft = Math.max(2, rect.left - pad);
    const sWidth = Math.min(window.innerWidth - sLeft - 4, rect.width + pad * 2);
    const sHeight = Math.min(window.innerHeight - sTop - 4, maxSpotlightH);

    spotlight.style.top = `${sTop}px`;
    spotlight.style.left = `${sLeft}px`;
    spotlight.style.width = `${sWidth}px`;
    spotlight.style.height = `${sHeight}px`;

    const placement = SpotlightTour.calculatePlacement(rect, cardWidth, cardHeight, window.innerWidth, window.innerHeight);

    arrow.className = `tour-arrow ${placement.arrowClass}`;
    arrow.innerHTML = placement.arrowGlyph;
    arrow.style.left = `${placement.arrowLeft}px`;
    arrow.style.top = `${placement.arrowTop}px`;

    card.style.left = `${placement.cardLeft}px`;
    card.style.top = `${placement.cardTop}px`;
  }

  public static calculatePlacement(
    rect: DOMRect | { left: number; top: number; right: number; bottom: number; width: number; height: number },
    cardWidth: number,
    cardHeight: number,
    viewportWidth: number,
    viewportHeight: number
  ): {
    cardLeft: number;
    cardTop: number;
    arrowLeft: number;
    arrowTop: number;
    arrowClass: 'arrow-left' | 'arrow-right' | 'arrow-top' | 'arrow-bottom';
    arrowGlyph: '←' | '→' | '↑' | '↓';
  } {
    const minTop = 14;
    const maxTop = Math.max(minTop, viewportHeight - cardHeight - 16);

    const spaceRight = viewportWidth - (rect.right + 24);
    const spaceLeft = rect.left - 24;
    const spaceBottom = viewportHeight - (rect.bottom + 24);
    const spaceTop = rect.top - 24;
    const targetMidY = rect.top + rect.height / 2;
    const targetMidX = Math.min(viewportWidth - 60, Math.max(60, rect.left + rect.width / 2));

    let cardLeft: number;
    let cardTop: number;
    let arrowLeft: number;
    let arrowTop: number;
    let arrowClass: 'arrow-left' | 'arrow-right' | 'arrow-top' | 'arrow-bottom';
    let arrowGlyph: '←' | '→' | '↑' | '↓';

    if (spaceRight >= cardWidth + 48) {
      cardLeft = rect.right + 48;
      cardTop = Math.min(maxTop, Math.max(minTop, targetMidY - cardHeight / 2));
      arrowClass = 'arrow-left';
      arrowGlyph = '←';
      arrowLeft = Math.max(rect.right + 4, cardLeft - 32);
      arrowTop = Math.min(cardTop + cardHeight - 32, Math.max(cardTop + 14, targetMidY - 13));
    } else if (spaceLeft >= cardWidth + 48) {
      cardLeft = rect.left - cardWidth - 48;
      cardTop = Math.min(maxTop, Math.max(minTop, targetMidY - cardHeight / 2));
      arrowClass = 'arrow-right';
      arrowGlyph = '→';
      arrowLeft = Math.min(rect.left - 28, cardLeft + cardWidth + 4);
      arrowTop = Math.min(cardTop + cardHeight - 32, Math.max(cardTop + 14, targetMidY - 13));
    } else if (spaceBottom >= cardHeight + 48) {
      cardLeft = Math.min(viewportWidth - cardWidth - 14, Math.max(14, targetMidX - cardWidth / 2));
      cardTop = Math.min(maxTop, rect.bottom + 48);
      arrowClass = 'arrow-top';
      arrowGlyph = '↑';
      arrowLeft = Math.min(cardLeft + cardWidth - 28, Math.max(cardLeft + 16, targetMidX - 13));
      arrowTop = Math.max(rect.bottom + 4, cardTop - 28);
    } else if (spaceTop >= cardHeight + 48) {
      cardLeft = Math.min(viewportWidth - cardWidth - 14, Math.max(14, targetMidX - cardWidth / 2));
      cardTop = Math.max(minTop, rect.top - cardHeight - 48);
      arrowClass = 'arrow-bottom';
      arrowGlyph = '↓';
      arrowLeft = Math.min(cardLeft + cardWidth - 28, Math.max(cardLeft + 16, targetMidX - 13));
      arrowTop = Math.min(rect.top - 28, cardTop + cardHeight + 4);
    } else {
      cardLeft = Math.min(viewportWidth - cardWidth - 20, Math.max(20, viewportWidth - cardWidth - 30));
      cardTop = Math.min(maxTop, viewportHeight - cardHeight - 20);
      arrowClass = 'arrow-top';
      arrowGlyph = '↑';
      arrowLeft = Math.min(cardLeft + cardWidth - 30, Math.max(cardLeft + 20, targetMidX - 13));
      arrowTop = Math.max(minTop, cardTop - 28);
    }

    cardLeft = Math.max(14, Math.min(viewportWidth - cardWidth - 14, cardLeft));
    cardTop = Math.max(minTop, Math.min(maxTop, cardTop));

    return { cardLeft, cardTop, arrowLeft, arrowTop, arrowClass, arrowGlyph };
  }
}

if (typeof window !== 'undefined') {
  (window as any).SpotlightTour = SpotlightTour;
}
