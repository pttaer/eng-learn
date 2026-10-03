import anime from 'animejs';

export class MotionEngine {
  private static activeAnimations: anime.AnimeInstance[] = [];

  public static isReducedMotion(): boolean {
    // Motion is on by default; users opt out via Settings (html[data-motion="reduce"]), not the OS flag
    if (typeof document === 'undefined') return false;
    return document.documentElement.dataset.motion === 'reduce';
  }

  /**
   * Procedurally draws SVG line filaments using strokeDashoffset
   */
  public static drawSvgLines(targets: string | NodeList | SVGElement[]): anime.AnimeInstance | null {
    if (this.isReducedMotion()) return null;

    const anim = anime({
      targets,
      strokeDashoffset: [anime.setDashoffset, 0],
      easing: 'easeInOutSine',
      duration: 1200,
      delay: (_el: any, i: number) => i * 45
    });

    this.trackAnimation(anim);
    return anim;
  }

  /**
   * Cascading elastic node entrances
   */
  public static staggerEntrance(
    targets: string | NodeList | HTMLElement[] | SVGElement[],
    options: { from?: 'bottom' | 'center' | 'first' | 'last'; delayStep?: number } = {}
  ): anime.AnimeInstance | null {
    if (this.isReducedMotion()) return null;

    const fromVal = options.from || 'bottom';
    const delayStep = options.delayStep || 35;

    const anim = anime({
      targets,
      scale: [0.3, 1],
      opacity: [0, 1],
      easing: 'easeOutElastic(1, 0.75)',
      duration: 850,
      delay: anime.stagger(delayStep, { from: fromVal as any })
    });

    this.trackAnimation(anim);
    return anim;
  }

  /**
   * Interpolates numerical counters (e.g. Accuracy 0% -> 94%)
   */
  public static tweenNumber(
    targetEl: HTMLElement,
    startVal: number,
    endVal: number,
    suffix: string = '',
    duration: number = 800
  ): anime.AnimeInstance | null {
    if (this.isReducedMotion()) {
      targetEl.textContent = `${Math.round(endVal)}${suffix}`;
      return null;
    }

    const obj = { val: startVal };
    const anim = anime({
      targets: obj,
      val: endVal,
      round: 1,
      easing: 'easeOutExpo',
      duration,
      update: () => {
        targetEl.textContent = `${obj.val}${suffix}`;
      }
    });

    this.trackAnimation(anim);
    return anim;
  }

  /**
   * Fluid spring modal reveal (Backdrop fade + card scale-up)
   */
  public static springModal(modalEl: HTMLElement, cardEl: HTMLElement): anime.AnimeTimelineInstance {
    if (this.isReducedMotion()) {
      modalEl.style.opacity = '1';
      cardEl.style.transform = 'none';
      return anime.timeline();
    }

    const tl = anime.timeline({
      easing: 'easeOutCubic'
    });

    tl.add({
      targets: modalEl,
      opacity: [0, 1],
      duration: 180
    }).add(
      {
        targets: cardEl,
        translateY: [24, 0],
        scale: [0.94, 1],
        opacity: [0, 1],
        duration: 360,
        easing: 'easeOutBack'
      },
      '-=100'
    );

    return tl;
  }

  /**
   * Spatial page/card entrance transition
   */
  public static fadeSlideIn(targetEl: HTMLElement, direction: 'up' | 'down' = 'up'): anime.AnimeInstance | null {
    if (this.isReducedMotion()) {
      targetEl.style.opacity = '1';
      targetEl.style.transform = 'none';
      return null;
    }

    const yOffset = direction === 'up' ? [20, 0] : [-20, 0];
    const anim = anime({
      targets: targetEl,
      translateY: yOffset,
      opacity: [0, 1],
      easing: 'easeOutQuart',
      duration: 460
    });

    this.trackAnimation(anim);
    return anim;
  }

  /**
   * Soft staggered rise for cards and list items
   */
  public static riseIn(targets: string | NodeList | HTMLElement[], delayStep = 45): anime.AnimeInstance | null {
    if (this.isReducedMotion()) return null;
    const anim = anime({
      targets,
      translateY: [14, 0],
      opacity: [0, 1],
      easing: 'easeOutQuart',
      duration: 560,
      delay: anime.stagger(delayStep, { start: 80 })
    });
    this.trackAnimation(anim);
    return anim;
  }

  /**
   * Progress bars grow from zero to their data-pct width
   */
  public static fillBars(targets: string | NodeList | HTMLElement[]): anime.AnimeInstance | null {
    if (this.isReducedMotion()) return null;
    const anim = anime({
      targets,
      width: (el: HTMLElement) => ['0%', `${el.dataset.pct ?? 0}%`],
      easing: 'easeOutCubic',
      duration: 1000,
      delay: anime.stagger(70, { start: 300 })
    });
    this.trackAnimation(anim);
    return anim;
  }

  /**
   * Slow endless breathing glow; paused by cancelAll() on route change
   */
  public static breathe(targets: string | NodeList | SVGElement[] | HTMLElement[]): anime.AnimeInstance | null {
    if (this.isReducedMotion()) return null;
    const anim = anime({
      targets,
      opacity: [0.25, 0.75],
      scale: [0.94, 1.1],
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine',
      duration: 2400,
      delay: anime.stagger(220)
    });
    this.trackAnimation(anim);
    return anim;
  }

  /**
   * Hover lift with a gentle spring settle
   */
  public static lift(el: HTMLElement | SVGElement, on: boolean, amount = 3): void {
    if (this.isReducedMotion()) return;
    anime.remove(el);
    anime({ targets: el, translateY: on ? -amount : 0, easing: 'spring(1, 90, 14, 0)' });
  }

  /**
   * Quick confirmation pop (checkbox ticked, answer graded)
   */
  public static pop(el: HTMLElement | SVGElement): void {
    if (this.isReducedMotion()) return;
    anime.remove(el);
    anime({ targets: el, scale: [1, 1.12, 1], easing: 'easeOutQuad', duration: 420 });
  }

  private static trackAnimation(anim: anime.AnimeInstance): void {
    this.activeAnimations.push(anim);
    anim.complete = () => {
      this.activeAnimations = this.activeAnimations.filter(a => a !== anim);
    };
  }

  public static cancelAll(): void {
    for (const anim of this.activeAnimations) {
      anim.pause();
    }
    this.activeAnimations = [];
  }

  public static getActiveAnimationCount(): number {
    return this.activeAnimations.length;
  }
}
