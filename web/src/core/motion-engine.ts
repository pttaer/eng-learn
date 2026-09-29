import anime from 'animejs';

export class MotionEngine {
  private static activeAnimations: anime.AnimeInstance[] = [];

  public static isReducedMotion(): boolean {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

    const yOffset = direction === 'up' ? [16, 0] : [-16, 0];
    const anim = anime({
      targets: targetEl,
      translateY: yOffset,
      opacity: [0, 1],
      easing: 'easeOutQuad',
      duration: 300
    });

    this.trackAnimation(anim);
    return anim;
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
}
